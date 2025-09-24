from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import json
import sys
import os
from typing import Optional, Dict, Any, List
import tempfile
import zipfile
import io

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Import backend modules
from src.preprocessing.data_preprocessor import preprocess_csv, process_text, remove_stopwords_from_text_column
from src.chunking import chunk_fixed, chunk_document_based, chunk_document_based_multi, semantic_chunking_csv, chunk_recursive
from src.chunking.base_chunker import ChunkingResult, ChunkMetadata
from src.embedding import generate_chunk_embeddings, EmbeddingModelManager
from src.metrics.retrieval_metrics import RetrievalMetricsTracker
from src.storage.vector_db import ChromaVectorStore, VectorRecord
from src.retrieval.retriever import Retriever

app = FastAPI(title="CSV Chunking Optimizer API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for session state
session_data = {}

def validate_and_normalize_headers(columns):
    """Validate and normalize CSV headers"""
    new_columns = []
    for i, col in enumerate(columns):
        if col is None or str(col).strip() == "":
            new_col = f"column_{i+1}"
        else:
            new_col = str(col).strip().lower()
        new_columns.append(new_col)
    return new_columns

def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization"""
    import math
    
    if isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif hasattr(obj, 'item'):  # numpy scalar
        val = obj.item()
        if isinstance(val, float):
            if math.isnan(val) or math.isinf(val):
                return None
        return val
    elif hasattr(obj, 'tolist'):  # numpy array
        return obj.tolist()
    elif isinstance(obj, pd.DataFrame):
        return obj.to_dict('records')
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    else:
        return obj

@app.get("/")
async def root():
    return {"message": "CSV Chunking Optimizer API"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload and validate CSV file"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
        # Read CSV
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Validate and normalize headers
        df.columns = validate_and_normalize_headers(df.columns)
        
        # Store in session
        session_id = f"session_{len(session_data)}"
        session_data[session_id] = {
            "df": df,
            "filename": file.filename,
            "step": 0,
            "file_meta": {},
            "numeric_meta": [],
            "chunking_result": None,
            "embedding_result": None,
            "meta_numeric_cols": [],
            "meta_categorical_cols": [],
            "store_metadata_enabled": True,
            "metrics_tracker": RetrievalMetricsTracker()
        }
        
        return {
            "session_id": session_id,
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns),
            "preview": df.head().to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/preprocess")
async def preprocess_data(
    session_id: str = Form(...),
    fill_null_strategy: Optional[str] = Form(None),
    type_conversions: Optional[str] = Form(None),
    drop_duplicates_cols: Optional[str] = Form(None)
):
    """Run default preprocessing"""
    try:
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = session_data[session_id]
        df = session["df"]
        
        # Parse type conversions if provided
        type_conv_dict = None
        if type_conversions:
            type_conv_dict = json.loads(type_conversions)
        
        # Run preprocessing
        df_processed, file_meta, numeric_meta = preprocess_csv(
            df,
            fill_null_strategy=fill_null_strategy,
            type_conversions=type_conv_dict,
            drop_duplicates_cols=drop_duplicates_cols
        )
        
        # Update session
        session["df"] = df_processed
        session["file_meta"] = file_meta
        session["numeric_meta"] = numeric_meta
        session["step"] = 1
        
        return {
            "success": True,
            "rows": len(df_processed),
            "columns": len(df_processed.columns),
            "file_meta": convert_numpy_types(file_meta),
            "numeric_meta": convert_numpy_types(numeric_meta),
            "preview": df_processed.head().to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chunk")
async def chunk_data(
    session_id: str = Form(...),
    chunking_method: str = Form(...),
    chunk_size: Optional[int] = Form(None),
    overlap: Optional[int] = Form(None),
    key_column: Optional[str] = Form(None),
    key_columns: Optional[str] = Form(None),
    token_limit: Optional[int] = Form(None),
    model_name: Optional[str] = Form(None),
    preserve_headers: Optional[bool] = Form(True),
    batch_size: Optional[int] = Form(None),
    similarity_threshold: Optional[float] = Form(None),
    use_fast_model: Optional[bool] = Form(True),
    text_chunk_chars: Optional[int] = Form(None),
    overlap_chars: Optional[int] = Form(None)
):
    """Apply chunking method to data"""
    try:
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = session_data[session_id]
        df = session["df"]
        
        if chunking_method == "Fixed Size Chunking":
            result = chunk_fixed(df, chunk_size, overlap, preserve_headers)
        elif chunking_method == "Document Based Chunking":
            if key_columns:
                key_cols_list = json.loads(key_columns)
                result = chunk_document_based_multi(df, key_cols_list, token_limit, model_name, preserve_headers)
            else:
                result = chunk_document_based(df, key_column, token_limit, model_name, preserve_headers)
        elif chunking_method == "Semantic Chunking":
            # For semantic chunking, we need the original file
            # This is a simplified version - in production you'd want to handle file storage better
            with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as tmp:
                df.to_csv(tmp.name, index=False)
                docs = semantic_chunking_csv(tmp.name, batch_size=batch_size, use_fast_model=use_fast_model, similarity_threshold=similarity_threshold)
                os.unlink(tmp.name)
            
            df_chunks = []
            metadata_list = []
            for idx, doc in enumerate(docs):
                chunk_text = doc.page_content
                chunk_df = pd.DataFrame({"text": [chunk_text]})
                df_chunks.append(chunk_df)
                
                md = ChunkMetadata(
                    chunk_id=f"semantic_chunk_{idx:04d}",
                    method="semantic",
                    chunk_size=1,
                    start_index=0,
                    end_index=0,
                    overlap=None,
                    quality_score=None,
                    metadata={"source_file": session["filename"]}
                )
                metadata_list.append(md)

            result = ChunkingResult(
                chunks=df_chunks,
                metadata=metadata_list,
                method="semantic",
                total_chunks=len(df_chunks),
                quality_report={"note": "Semantic chunking output; quality metrics not computed."}
            )
        elif chunking_method == "Recursive":
            result = chunk_recursive(
                dataframe=df,
                mode="semantic_text_recursive",
                text_chunk_chars=int(text_chunk_chars),
                overlap_chars=int(overlap_chars),
                use_semantic_compression=True
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid chunking method")
        
        # Update session
        session["chunking_result"] = result
        session["chunks"] = result.chunks
        
        return {
            "success": True,
            "total_chunks": result.total_chunks,
            "method": result.method,
            "quality_report": result.quality_report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/embed")
async def generate_embeddings(
    session_id: str = Form(...),
    model_name: str = Form(...),
    batch_size: int = Form(32)
):
    """Generate embeddings for chunks"""
    try:
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = session_data[session_id]
        chunks = session["chunks"]
        chunking_result = session["chunking_result"]
        
        if not chunks or not chunking_result:
            raise HTTPException(status_code=400, detail="No chunks found. Please run chunking first.")
        
        # Prepare chunk metadata
        chunk_metadata_list = []
        for metadata in chunking_result.metadata:
            chunk_metadata_list.append({
                'chunk_id': metadata.chunk_id,
                'method': metadata.method,
                'chunk_size': metadata.chunk_size,
                'quality_score': metadata.quality_score,
                'metadata': metadata.metadata
            })
        
        # Generate embeddings
        embedding_result = generate_chunk_embeddings(
            chunks=chunks,
            chunk_metadata_list=chunk_metadata_list,
            model_name=model_name,
            batch_size=batch_size,
            source_file=session["filename"]
        )
        
        # Update session
        session["embedding_result"] = embedding_result
        
        return {
            "success": True,
            "total_chunks": embedding_result.total_chunks,
            "model_used": embedding_result.model_used,
            "vector_dimension": embedding_result.vector_dimension,
            "processing_time": embedding_result.processing_time,
            "quality_report": embedding_result.quality_report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/store")
async def store_embeddings(
    session_id: str = Form(...),
    persist_dir: str = Form(".chroma"),
    collection_name: str = Form("csv_chunks"),
    reset_before_store: bool = Form(True)
):
    """Store embeddings in ChromaDB"""
    try:
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = session_data[session_id]
        embedding_result = session["embedding_result"]
        
        if not embedding_result:
            raise HTTPException(status_code=400, detail="No embeddings found. Please generate embeddings first.")
        
        # Initialize ChromaDB store
        store = ChromaVectorStore(persist_directory=persist_dir, collection_name=collection_name)
        store.connect()
        
        if reset_before_store:
            store.reset_collection()
        else:
            store.get_or_create_collection()
        
        # Prepare records
        records = []
        for ec in embedding_result.embedded_chunks:
            base_md = {
                'chunk_id': str(ec.id),
                'source_file': str(ec.metadata.source_file or 'unknown'),
                'chunk_number': int(ec.metadata.chunk_number),
                'embedding_model': str(ec.metadata.embedding_model),
                'vector_dimension': int(ec.metadata.vector_dimension),
                'text_length': int(ec.metadata.text_length),
            }
            
            extra_md = ec.metadata.additional_metadata or {}
            safe_extra = {}
            for k, v in extra_md.items():
                try:
                    if v is None:
                        continue
                    if isinstance(v, (str, int, float, bool)):
                        safe_extra[str(k)] = v
                    else:
                        safe_extra[str(k)] = str(v)
                except Exception:
                    continue
            
            md = {**base_md, **safe_extra}
            if not md:
                md = {'chunk_id': str(ec.id)}

            records.append(
                VectorRecord(
                    id=ec.id,
                    embedding=ec.embedding.tolist() if hasattr(ec.embedding, 'tolist') else list(ec.embedding),
                    metadata=md,
                    document=ec.document or ''
                )
            )
        
        # Store records
        store.add(records)
        
        return {
            "success": True,
            "records_stored": len(records),
            "collection_name": collection_name,
            "persist_dir": persist_dir
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search")
async def search_embeddings(
    session_id: str = Form(...),
    query: str = Form(...),
    top_k: int = Form(5),
    persist_dir: str = Form(".chroma"),
    collection_name: str = Form("csv_chunks")
):
    """Search embeddings in ChromaDB"""
    try:
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = session_data[session_id]
        embedding_result = session["embedding_result"]
        
        if not embedding_result:
            raise HTTPException(status_code=400, detail="No embeddings found. Please generate embeddings first.")
        
        # Initialize retriever
        model_used = embedding_result.model_used if embedding_result.model_used != 'dummy_model' else 'all-MiniLM-L6-v2'
        retriever = Retriever(collection_name=collection_name, persist_directory=persist_dir)
        
        # Search
        results = retriever.search(query=query, model_name=model_used, top_k=int(top_k), where=None)
        
        # Process results
        docs = results.get('documents', [[]])[0] if results else []
        metas = results.get('metadatas', [[]])[0] if results else []
        dists = results.get('distances', [[]])[0] if results else []
        
        # Format results for frontend
        search_results = []
        for i, doc in enumerate(docs):
            meta = metas[i] if i < len(metas) else {}
            score = dists[i] if i < len(dists) else None
            
            search_results.append({
                "id": str(i + 1),
                "content": doc,
                "score": float(score) if score is not None else 0.0,
                "metadata": meta
            })
        
        return {
            "success": True,
            "query": query,
            "results": search_results,
            "total_results": len(search_results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def get_available_models():
    """Get available embedding models"""
    try:
        available_models = {k: v for k, v in EmbeddingModelManager.AVAILABLE_MODELS.items()}
        return {
            "success": True,
            "models": available_models
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/session/{session_id}")
async def get_session_data(session_id: str):
    """Get session data"""
    if session_id not in session_data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = session_data[session_id]
    return {
        "session_id": session_id,
        "filename": session["filename"],
        "step": session["step"],
        "rows": len(session["df"]),
        "columns": len(session["df"].columns)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
