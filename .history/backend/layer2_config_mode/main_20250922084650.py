from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import json

# Import Layer 2 components
from preprocessing.preprocessor import ConfigModePreprocessor
from chunking.chunker import ConfigModeChunker
from embedding.embedder import FastModeEmbedder  # Reuse from Layer 1
from storing.storage import FastModeStorage      # Reuse from Layer 1
from retrieving.retriever import FastModeRetriever  # Reuse from Layer 1

app = FastAPI(title="CSV Chunking Optimizer - Layer 2 (Config Mode)", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
preprocessor = ConfigModePreprocessor()
chunker = ConfigModeChunker()
embedder = FastModeEmbedder()
storage = FastModeStorage()
retriever = FastModeRetriever()

# Pydantic models
class PreprocessingConfig(BaseModel):
    null_handling: Optional[Dict[str, Any]] = None
    type_conversion: Optional[Dict[str, Any]] = None
    remove_duplicates: Optional[bool] = True
    text_processing: Optional[Dict[str, Any]] = None
    column_selection: Optional[Dict[str, Any]] = None

class ChunkingConfig(BaseModel):
    method: Optional[str] = "fixed"  # "fixed", "recursive", "document"
    fixed_size: Optional[Dict[str, Any]] = None
    recursive: Optional[Dict[str, Any]] = None
    document: Optional[Dict[str, Any]] = None
    text_processing: Optional[Dict[str, Any]] = None

class EmbeddingConfig(BaseModel):
    model_name: Optional[str] = "all-MiniLM-L6-v2"
    batch_size: Optional[int] = 32

class StorageConfig(BaseModel):
    collection_name: Optional[str] = "config_mode_chunks"
    reset_collection: Optional[bool] = True

class ProcessingRequest(BaseModel):
    preprocessing: Optional[PreprocessingConfig] = None
    chunking: Optional[ChunkingConfig] = None
    embedding: Optional[EmbeddingConfig] = None
    storage: Optional[StorageConfig] = None

class SearchRequest(BaseModel):
    query: str
    n_results: Optional[int] = 5
    collection_name: Optional[str] = "config_mode_chunks"

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
        "message": "CSV Chunking Optimizer - Layer 2 (Config Mode)",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "layer": "config_mode"}

@app.get("/config/defaults")
async def get_default_configs():
    """Get default configurations for all components"""
    return {
        "preprocessing": preprocessor._get_default_config(),
        "chunking": chunker._get_default_config(),
        "embedding": {
            "model_name": "all-MiniLM-L6-v2",
            "batch_size": 32
        },
        "storage": {
            "collection_name": "config_mode_chunks",
            "reset_collection": True
        }
    }

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
                "sample_data": df.head(3).to_dict('records'),
                "null_counts": df.isnull().sum().to_dict(),
                "suggested_configs": {
                    "preprocessing": _suggest_preprocessing_config(df),
                    "chunking": _suggest_chunking_config(df)
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process", response_model=ProcessingResponse)
async def process_csv(file: UploadFile = File(...), request: ProcessingRequest = ProcessingRequest()):
    """Complete processing pipeline with configurable options"""
    try:
        # Step 1: Upload and read CSV
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        # Step 2: Preprocessing with config
        preprocessing_config = request.preprocessing.dict() if request.preprocessing else None
        preprocessing_result = preprocessor.preprocess(df, preprocessing_config)
        if not preprocessing_result['success']:
            raise HTTPException(status_code=500, detail=f"Preprocessing failed: {preprocessing_result['error']}")
        
        processed_df = preprocessing_result['processed_data']
        
        # Step 3: Chunking with config
        chunking_config = request.chunking.dict() if request.chunking else None
        chunking_result = chunker.chunk(df=processed_df, config=chunking_config)
        if not chunking_result['success']:
            raise HTTPException(status_code=500, detail=f"Chunking failed: {chunking_result['error']}")
        
        # Step 4: Embedding with config
        embedding_config = request.embedding.dict() if request.embedding else {}
        embedding_result = embedder.generate_embeddings(
            chunks=chunking_result['chunks'],
            text_chunks=chunking_result['text_chunks'],
            metadata=chunking_result['metadata'],
            model_name=embedding_config.get('model_name', 'all-MiniLM-L6-v2'),
            batch_size=embedding_config.get('batch_size', 32),
            source_file=file.filename
        )
        if not embedding_result['success']:
            raise HTTPException(status_code=500, detail=f"Embedding failed: {embedding_result['error']}")
        
        # Step 5: Storage with config
        storage_config = request.storage.dict() if request.storage else {}
        storage_result = storage.store_embeddings(
            embedded_chunks=embedding_result['embedded_chunks'],
            collection_name=storage_config.get('collection_name', 'config_mode_chunks'),
            reset_collection=storage_config.get('reset_collection', True)
        )
        if not storage_result['success']:
            raise HTTPException(status_code=500, detail=f"Storage failed: {storage_result['error']}")
        
        # Return comprehensive results
        return ProcessingResponse(
            success=True,
            message="Config mode processing pipeline completed successfully",
            data={
                "preprocessing": preprocessing_result,
                "chunking": chunking_result,
                "embedding": embedding_result,
                "storage": storage_result,
                "summary": {
                    "original_rows": len(df),
                    "processed_rows": len(processed_df),
                    "total_chunks": chunking_result['stats']['total_chunks'],
                    "embeddings_generated": embedding_result['stats']['total_chunks'],
                    "chunks_stored": storage_result['stored_count'],
                    "collection_name": storage_config.get('collection_name', 'config_mode_chunks'),
                    "configs_used": {
                        "preprocessing": preprocessing_config,
                        "chunking": chunking_config,
                        "embedding": embedding_config,
                        "storage": storage_config
                    }
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
            "layer": "config_mode",
            "components": {
                "preprocessor": "ConfigModePreprocessor",
                "chunker": "ConfigModeChunker", 
                "embedder": "FastModeEmbedder",
                "storage": "FastModeStorage",
                "retriever": "FastModeRetriever"
            },
            "available_methods": {
                "chunking": ["fixed", "recursive", "document"],
                "preprocessing": ["smart", "drop", "fill", "skip"],
                "embedding_models": ["all-MiniLM-L6-v2", "BAAI/bge-small-en-v1.5"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _suggest_preprocessing_config(df: pd.DataFrame) -> Dict[str, Any]:
    """Suggest preprocessing configuration based on data analysis"""
    null_counts = df.isnull().sum()
    null_ratio = null_counts / len(df)
    
    suggestions = {
        "null_handling": {
            "strategy": "smart",
            "drop_threshold": 0.5
        },
        "type_conversion": {
            "auto_detect": True
        },
        "remove_duplicates": True,
        "text_processing": {
            "clean_whitespace": True,
            "remove_special_chars": False,
            "lowercase": False
        }
    }
    
    # Suggest specific null handling for columns with high null ratios
    high_null_cols = null_ratio[null_ratio > 0.3].index.tolist()
    if high_null_cols:
        suggestions["null_handling"]["high_null_columns"] = high_null_cols
    
    return suggestions

def _suggest_chunking_config(df: pd.DataFrame) -> Dict[str, Any]:
    """Suggest chunking configuration based on data analysis"""
    suggestions = {
        "method": "fixed",
        "fixed_size": {
            "chunk_size": min(100, max(10, len(df) // 10)),
            "overlap": 10
        }
    }
    
    # Suggest document-based chunking if there's a clear key column
    if len(df.columns) > 0:
        first_col = df.columns[0]
        if 'id' in first_col.lower() or 'key' in first_col.lower():
            suggestions["method"] = "document"
            suggestions["document"] = {
                "key_column": first_col,
                "token_limit": 2000,
                "preserve_headers": True
            }
    
    return suggestions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
