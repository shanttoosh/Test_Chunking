from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import io
import json

def convert_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj

# Import Layer 1 components
from preprocessing.preprocessor import FastModePreprocessor
from chunking.chunker import FastModeChunker
from embedding.embedder import FastModeEmbedder
from storing.storage import FastModeStorage
from retrieving.retriever import FastModeRetriever

app = FastAPI(title="CSV Chunking Optimizer - Layer 1 (Fast Mode)", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
preprocessor = FastModePreprocessor()
chunker = FastModeChunker()
embedder = FastModeEmbedder()
storage = FastModeStorage()
retriever = FastModeRetriever()

# Pydantic models
class ProcessingRequest(BaseModel):
    chunk_size: Optional[int] = 100
    overlap: Optional[int] = 10
    model_name: Optional[str] = "all-MiniLM-L6-v2"
    batch_size: Optional[int] = 32
    collection_name: Optional[str] = "fast_mode_chunks"
    reset_collection: Optional[bool] = True

class SearchRequest(BaseModel):
    query: str
    n_results: Optional[int] = 5
    collection_name: Optional[str] = "fast_mode_chunks"

class ProcessingResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class SearchResponse(BaseModel):
    success: bool
    query: str
    results: List[Dict[str, Any]]
    stats: Dict[str, Any]
    error: Optional[str] = None

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CSV Chunking Optimizer - Layer 1 (Fast Mode)",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "layer": "fast_mode"}

@app.post("/upload", response_model=ProcessingResponse)
async def upload_csv(file: UploadFile = File(...)):
    """Upload and validate CSV file"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read CSV content
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Basic validation
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        # Return basic info
        return ProcessingResponse(
            success=True,
            message="CSV uploaded successfully",
            data={
                "filename": file.filename,
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": list(df.columns),
                "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
                "sample_data": df.head(3).to_dict('records')
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process", response_model=ProcessingResponse)
async def process_csv(file: UploadFile = File(...), request: ProcessingRequest = ProcessingRequest()):
    """Complete processing pipeline: upload -> preprocess -> chunk -> embed -> store"""
    try:
        # Step 1: Upload and read CSV
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        # Step 2: Preprocessing
        preprocessing_result = preprocessor.preprocess(df)
        if not preprocessing_result['success']:
            raise HTTPException(status_code=500, detail=f"Preprocessing failed: {preprocessing_result['error']}")
        
        processed_df = preprocessing_result['processed_data']
        
        # Step 3: Chunking
        chunking_result = chunker.chunk(
            df=processed_df,
            chunk_size=request.chunk_size,
            overlap=request.overlap
        )
        if not chunking_result['success']:
            raise HTTPException(status_code=500, detail=f"Chunking failed: {chunking_result['error']}")
        
        # Step 4: Embedding
        embedding_result = embedder.generate_embeddings(
            chunks=chunking_result['chunks'],
            text_chunks=chunking_result['text_chunks'],
            metadata=chunking_result['metadata'],
            model_name=request.model_name,
            batch_size=request.batch_size,
            source_file=file.filename
        )
        if not embedding_result['success']:
            raise HTTPException(status_code=500, detail=f"Embedding failed: {embedding_result['error']}")
        
        # Step 5: Storage
        storage_result = storage.store_embeddings(
            embedded_chunks=embedding_result['embedded_chunks'],
            collection_name=request.collection_name,
            reset_collection=request.reset_collection
        )
        if not storage_result['success']:
            raise HTTPException(status_code=500, detail=f"Storage failed: {storage_result['error']}")
        
        # Return comprehensive results
        return ProcessingResponse(
            success=True,
            message="Complete processing pipeline completed successfully",
            data={
                "preprocessing": {
                    "success": preprocessing_result['success'],
                    "message": preprocessing_result['message'],
                    "stats": preprocessing_result['stats'],
                    "sample_data": preprocessing_result['processed_data'].head(3).to_dict('records') if preprocessing_result['success'] else []
                },
                "chunking": {
                    "success": chunking_result['success'],
                    "message": chunking_result['message'],
                    "stats": chunking_result['stats'],
                    "total_chunks": chunking_result['stats']['total_chunks']
                },
                "embedding": {
                    "success": embedding_result['success'],
                    "message": embedding_result['message'],
                    "stats": embedding_result['stats']
                },
                "storage": {
                    "success": storage_result['success'],
                    "message": storage_result['message'],
                    "stored_count": storage_result['stored_count'],
                    "stats": storage_result['stats']
                },
                "summary": {
                    "original_rows": len(df),
                    "processed_rows": len(processed_df),
                    "total_chunks": chunking_result['stats']['total_chunks'],
                    "embeddings_generated": embedding_result['stats']['total_chunks'],
                    "chunks_stored": storage_result['stored_count'],
                    "collection_name": request.collection_name
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """Search the stored embeddings"""
    try:
        result = retriever.search(
            query=request.query,
            n_results=request.n_results,
            collection_name=request.collection_name
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        return SearchResponse(
            success=True,
            query=request.query,
            results=result['results'],
            stats=result['stats']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/collections")
async def list_collections():
    """List all available collections"""
    try:
        result = storage.list_collections()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/collections/{collection_name}")
async def get_collection_info(collection_name: str):
    """Get information about a specific collection"""
    try:
        result = storage.get_collection_info(collection_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_processing_stats():
    """Get processing statistics"""
    try:
        collections = storage.list_collections()
        return {
            "success": True,
            "collections": collections,
            "layer": "fast_mode",
            "components": {
                "preprocessor": "FastModePreprocessor",
                "chunker": "FastModeChunker", 
                "embedder": "FastModeEmbedder",
                "storage": "FastModeStorage",
                "retriever": "FastModeRetriever"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
