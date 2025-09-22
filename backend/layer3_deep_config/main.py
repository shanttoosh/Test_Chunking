from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import io
import json

# Import Layer 3 components
from preprocessing.preprocessor import DeepConfigPreprocessor
from chunking.chunker import ConfigModeChunker  # Reuse from Layer 2
from embedding.embedder import FastModeEmbedder  # Reuse from Layer 1
from storing.storage import FastModeStorage      # Reuse from Layer 1
from retrieving.retriever import FastModeRetriever  # Reuse from Layer 1

app = FastAPI(title="CSV Chunking Optimizer - Layer 3 (Deep Config)", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
preprocessor = DeepConfigPreprocessor()
chunker = ConfigModeChunker()
embedder = FastModeEmbedder()
storage = FastModeStorage()
retriever = FastModeRetriever()

# Pydantic models for Layer 3
class ProfilingConfig(BaseModel):
    enable: Optional[bool] = True
    detailed_analysis: Optional[bool] = True
    correlation_analysis: Optional[bool] = True
    distribution_analysis: Optional[bool] = True

class AdvancedNullHandlingConfig(BaseModel):
    strategy: Optional[str] = "advanced"  # "advanced", "ml_based", "domain_specific"
    ml_imputation: Optional[bool] = True
    knn_neighbors: Optional[int] = 5
    domain_rules: Optional[Dict[str, str]] = {}
    custom_handlers: Optional[Dict[str, Any]] = {}

class AdvancedTypeConversionConfig(BaseModel):
    advanced_detection: Optional[bool] = True
    custom_converters: Optional[Dict[str, Any]] = {}
    validation_rules: Optional[Dict[str, Any]] = {}
    error_handling: Optional[str] = "strict"

class FeatureEngineeringConfig(BaseModel):
    enable: Optional[bool] = True
    create_derived_features: Optional[bool] = True
    interaction_features: Optional[bool] = True
    polynomial_features: Optional[bool] = False
    custom_features: Optional[List[Any]] = []

class AdvancedTextProcessingConfig(BaseModel):
    advanced_cleaning: Optional[bool] = True
    lemmatization: Optional[bool] = True
    stemming: Optional[bool] = False
    stopword_removal: Optional[bool] = True
    custom_stopwords: Optional[List[str]] = []
    language_detection: Optional[bool] = True
    sentiment_analysis: Optional[bool] = False

class DataScalingConfig(BaseModel):
    enable: Optional[bool] = True
    method: Optional[str] = "standard"  # "standard", "minmax", "robust", "custom"
    columns: Optional[Union[str, List[str]]] = "auto"
    custom_scalers: Optional[Dict[str, Any]] = {}

class OutlierHandlingConfig(BaseModel):
    enable: Optional[bool] = True
    method: Optional[str] = "iqr"  # "iqr", "zscore", "isolation_forest", "custom"
    threshold: Optional[float] = 1.5
    action: Optional[str] = "cap"  # "cap", "remove", "transform"

class AdvancedColumnOperationsConfig(BaseModel):
    advanced_selection: Optional[bool] = True
    feature_importance: Optional[bool] = True
    dimensionality_reduction: Optional[bool] = False
    custom_operations: Optional[List[Any]] = []

class AdvancedPreprocessingConfig(BaseModel):
    profiling: Optional[ProfilingConfig] = None
    null_handling: Optional[AdvancedNullHandlingConfig] = None
    type_conversion: Optional[AdvancedTypeConversionConfig] = None
    feature_engineering: Optional[FeatureEngineeringConfig] = None
    text_processing: Optional[AdvancedTextProcessingConfig] = None
    scaling: Optional[DataScalingConfig] = None
    outlier_handling: Optional[OutlierHandlingConfig] = None
    column_operations: Optional[AdvancedColumnOperationsConfig] = None

class AdvancedChunkingConfig(BaseModel):
    method: Optional[str] = "fixed"  # "fixed", "recursive", "document", "semantic"
    fixed_size: Optional[Dict[str, Any]] = None
    recursive: Optional[Dict[str, Any]] = None
    document: Optional[Dict[str, Any]] = None
    semantic: Optional[Dict[str, Any]] = None
    text_processing: Optional[Dict[str, Any]] = None

class AdvancedEmbeddingConfig(BaseModel):
    model_name: Optional[str] = "all-MiniLM-L6-v2"
    batch_size: Optional[int] = 32
    custom_models: Optional[Dict[str, Any]] = {}
    embedding_optimization: Optional[Dict[str, Any]] = {}

class AdvancedStorageConfig(BaseModel):
    collection_name: Optional[str] = "deep_config_chunks"
    reset_collection: Optional[bool] = True
    storage_optimization: Optional[Dict[str, Any]] = {}
    custom_metadata: Optional[Dict[str, Any]] = {}

class AdvancedProcessingRequest(BaseModel):
    preprocessing: Optional[AdvancedPreprocessingConfig] = None
    chunking: Optional[AdvancedChunkingConfig] = None
    embedding: Optional[AdvancedEmbeddingConfig] = None
    storage: Optional[AdvancedStorageConfig] = None

class SearchRequest(BaseModel):
    query: str
    n_results: Optional[int] = 5
    collection_name: Optional[str] = "deep_config_chunks"
    advanced_filters: Optional[Dict[str, Any]] = None

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
        "message": "CSV Chunking Optimizer - Layer 3 (Deep Config)",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "layer": "deep_config"}

@app.get("/config/defaults")
async def get_default_configs():
    """Get default configurations for all components"""
    return {
        "preprocessing": preprocessor._get_default_config(),
        "chunking": chunker._get_default_config(),
        "embedding": {
            "model_name": "all-MiniLM-L6-v2",
            "batch_size": 32,
            "custom_models": {},
            "embedding_optimization": {}
        },
        "storage": {
            "collection_name": "deep_config_chunks",
            "reset_collection": True,
            "storage_optimization": {},
            "custom_metadata": {}
        }
    }

@app.get("/config/advanced-options")
async def get_advanced_options():
    """Get available advanced options and their descriptions"""
    return {
        "preprocessing_options": {
            "profiling": {
                "enable": "Enable comprehensive data profiling",
                "detailed_analysis": "Perform detailed statistical analysis",
                "correlation_analysis": "Analyze correlations between columns",
                "distribution_analysis": "Analyze data distributions and outliers"
            },
            "null_handling": {
                "strategy": "Strategy: 'advanced', 'ml_based', 'domain_specific'",
                "ml_imputation": "Use machine learning for imputation",
                "knn_neighbors": "Number of neighbors for KNN imputation",
                "domain_rules": "Domain-specific imputation rules",
                "custom_handlers": "Custom imputation handlers"
            },
            "feature_engineering": {
                "enable": "Enable feature engineering",
                "create_derived_features": "Create derived features from existing ones",
                "interaction_features": "Create interaction features",
                "polynomial_features": "Create polynomial features",
                "custom_features": "Custom feature creation functions"
            },
            "text_processing": {
                "advanced_cleaning": "Enable advanced text cleaning",
                "lemmatization": "Apply lemmatization",
                "stemming": "Apply stemming",
                "stopword_removal": "Remove stopwords",
                "custom_stopwords": "Custom stopwords list",
                "language_detection": "Detect language automatically",
                "sentiment_analysis": "Perform sentiment analysis"
            },
            "scaling": {
                "enable": "Enable data scaling",
                "method": "Method: 'standard', 'minmax', 'robust', 'custom'",
                "columns": "Columns to scale: 'auto' or list of column names",
                "custom_scalers": "Custom scaler configurations"
            },
            "outlier_handling": {
                "enable": "Enable outlier detection and handling",
                "method": "Method: 'iqr', 'zscore', 'isolation_forest', 'custom'",
                "threshold": "Threshold for outlier detection",
                "action": "Action: 'cap', 'remove', 'transform'"
            }
        },
        "chunking_options": {
            "method": "Chunking method: 'fixed', 'recursive', 'document', 'semantic'",
            "fixed_size": "Fixed-size chunking parameters",
            "recursive": "Recursive chunking parameters",
            "document": "Document-based chunking parameters",
            "semantic": "Semantic chunking parameters"
        },
        "embedding_options": {
            "model_name": "Embedding model name",
            "batch_size": "Batch size for processing",
            "custom_models": "Custom model configurations",
            "embedding_optimization": "Embedding optimization settings"
        },
        "storage_options": {
            "collection_name": "Collection name for storage",
            "reset_collection": "Whether to reset collection before storing",
            "storage_optimization": "Storage optimization settings",
            "custom_metadata": "Custom metadata configurations"
        }
    }

@app.post("/upload", response_model=ProcessingResponse)
async def upload_csv(file: UploadFile = File(...)):
    """Upload and validate CSV file with advanced analysis"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        # Read CSV content
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        # Basic validation
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        # Advanced analysis
        advanced_analysis = _perform_advanced_analysis(df)
        
        # Return comprehensive info
        return ProcessingResponse(
            success=True,
            message="CSV uploaded successfully with advanced analysis",
            data={
                "filename": file.filename,
                "rows": len(df),
                "columns": len(df.columns),
                "column_names": list(df.columns),
                "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
                "sample_data": df.head(3).to_dict('records'),
                "null_counts": df.isnull().sum().to_dict(),
                "null_percentages": (df.isnull().sum() / len(df) * 100).to_dict(),
                "advanced_analysis": advanced_analysis,
                "suggested_configs": {
                    "preprocessing": _suggest_advanced_preprocessing_config(df),
                    "chunking": _suggest_advanced_chunking_config(df)
                }
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process", response_model=ProcessingResponse)
async def process_csv(file: UploadFile = File(...), request: AdvancedProcessingRequest = AdvancedProcessingRequest()):
    """Complete processing pipeline with advanced configuration"""
    try:
        # Step 1: Upload and read CSV
        content = await file.read()
        df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        
        if df.empty:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        
        # Step 2: Advanced preprocessing
        preprocessing_config = request.preprocessing.dict() if request.preprocessing else None
        preprocessing_result = preprocessor.preprocess(df, preprocessing_config)
        if not preprocessing_result['success']:
            raise HTTPException(status_code=500, detail=f"Preprocessing failed: {preprocessing_result['error']}")
        
        processed_df = preprocessing_result['processed_data']
        
        # Step 3: Advanced chunking
        chunking_config = request.chunking.dict() if request.chunking else None
        chunking_result = chunker.chunk(df=processed_df, config=chunking_config)
        if not chunking_result['success']:
            raise HTTPException(status_code=500, detail=f"Chunking failed: {chunking_result['error']}")
        
        # Step 4: Advanced embedding
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
        
        # Step 5: Advanced storage
        storage_config = request.storage.dict() if request.storage else {}
        storage_result = storage.store_embeddings(
            embedded_chunks=embedding_result['embedded_chunks'],
            collection_name=storage_config.get('collection_name', 'deep_config_chunks'),
            reset_collection=storage_config.get('reset_collection', True)
        )
        if not storage_result['success']:
            raise HTTPException(status_code=500, detail=f"Storage failed: {storage_result['error']}")
        
        # Return comprehensive results
        return ProcessingResponse(
            success=True,
            message="Deep config processing pipeline completed successfully",
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
                    "collection_name": storage_config.get('collection_name', 'deep_config_chunks'),
                    "configs_used": {
                        "preprocessing": preprocessing_config,
                        "chunking": chunking_config,
                        "embedding": embedding_config,
                        "storage": storage_config
                    },
                    "advanced_features_used": {
                        "data_profiling": preprocessing_result.get('profile_result', {}),
                        "feature_engineering": preprocessing_result.get('stats', {}).get('processing_components', {}).get('feature_engineering', False),
                        "outlier_handling": preprocessing_result.get('stats', {}).get('processing_components', {}).get('outlier_handling', False),
                        "advanced_text_processing": preprocessing_result.get('stats', {}).get('processing_components', {}).get('advanced_text_processing', False)
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
    """Advanced search with filtering capabilities"""
    try:
        result = retriever.search(
            query=request.query,
            n_results=request.n_results,
            collection_name=request.collection_name
        )
        
        if not result['success']:
            raise HTTPException(status_code=500, detail=result['error'])
        
        # Apply advanced filters if provided
        if request.advanced_filters:
            result['results'] = _apply_advanced_filters(result['results'], request.advanced_filters)
        
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
    """Get comprehensive processing statistics"""
    try:
        collections = storage.list_collections()
        return {
            "success": True,
            "collections": collections,
            "layer": "deep_config",
            "components": {
                "preprocessor": "DeepConfigPreprocessor",
                "chunker": "ConfigModeChunker", 
                "embedder": "FastModeEmbedder",
                "storage": "FastModeStorage",
                "retriever": "FastModeRetriever"
            },
            "advanced_features": {
                "data_profiling": True,
                "ml_based_imputation": True,
                "feature_engineering": True,
                "advanced_text_processing": True,
                "outlier_detection": True,
                "data_scaling": True,
                "correlation_analysis": True,
                "distribution_analysis": True
            },
            "available_methods": {
                "chunking": ["fixed", "recursive", "document", "semantic"],
                "preprocessing": ["advanced", "ml_based", "domain_specific"],
                "embedding_models": ["all-MiniLM-L6-v2", "BAAI/bge-small-en-v1.5"],
                "scaling_methods": ["standard", "minmax", "robust", "custom"],
                "outlier_methods": ["iqr", "zscore", "isolation_forest", "custom"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _perform_advanced_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """Perform advanced data analysis"""
    analysis = {
        "data_quality": {
            "completeness": (1 - df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100,
            "duplicate_percentage": (df.duplicated().sum() / len(df)) * 100,
            "memory_usage": df.memory_usage(deep=True).sum()
        },
        "column_analysis": {},
        "correlation_analysis": {},
        "outlier_analysis": {}
    }
    
    # Column analysis
    for col in df.columns:
        if df[col].dtype in ['int64', 'float64']:
            analysis["column_analysis"][col] = {
                "type": "numeric",
                "mean": float(df[col].mean()),
                "std": float(df[col].std()),
                "skewness": float(df[col].skew()),
                "outliers_iqr": len(_detect_outliers_iqr(df[col].dropna()))
            }
        else:
            analysis["column_analysis"][col] = {
                "type": "categorical",
                "unique_count": df[col].nunique(),
                "most_frequent": df[col].mode().iloc[0] if not df[col].mode().empty else None
            }
    
    # Correlation analysis
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 1:
        correlation_matrix = df[numeric_cols].corr()
        high_correlations = []
        for i in range(len(correlation_matrix.columns)):
            for j in range(i+1, len(correlation_matrix.columns)):
                corr_value = correlation_matrix.iloc[i, j]
                if abs(corr_value) > 0.7:
                    high_correlations.append({
                        'col1': correlation_matrix.columns[i],
                        'col2': correlation_matrix.columns[j],
                        'correlation': float(corr_value)
                    })
        analysis["correlation_analysis"] = {
            "high_correlations": high_correlations,
            "correlation_matrix": correlation_matrix.to_dict()
        }
    
    return analysis

def _detect_outliers_iqr(series: pd.Series) -> List[int]:
    """Detect outliers using IQR method"""
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    return series[(series < lower_bound) | (series > upper_bound)].index.tolist()

def _suggest_advanced_preprocessing_config(df: pd.DataFrame) -> Dict[str, Any]:
    """Suggest advanced preprocessing configuration"""
    suggestions = {
        "profiling": {
            "enable": True,
            "detailed_analysis": True,
            "correlation_analysis": len(df.select_dtypes(include=['number']).columns) > 1,
            "distribution_analysis": True
        },
        "null_handling": {
            "strategy": "ml_based" if df.isnull().sum().sum() > 0 else "advanced",
            "ml_imputation": True,
            "knn_neighbors": 5
        },
        "feature_engineering": {
            "enable": True,
            "create_derived_features": True,
            "interaction_features": len(df.select_dtypes(include=['number']).columns) >= 2
        },
        "text_processing": {
            "advanced_cleaning": True,
            "lemmatization": True,
            "stopword_removal": True
        },
        "scaling": {
            "enable": True,
            "method": "standard"
        },
        "outlier_handling": {
            "enable": True,
            "method": "iqr",
            "action": "cap"
        }
    }
    
    return suggestions

def _suggest_advanced_chunking_config(df: pd.DataFrame) -> Dict[str, Any]:
    """Suggest advanced chunking configuration"""
    suggestions = {
        "method": "fixed",
        "fixed_size": {
            "chunk_size": min(100, max(10, len(df) // 10)),
            "overlap": 10
        }
    }
    
    # Suggest semantic chunking for text-heavy data
    text_cols = df.select_dtypes(include=['object']).columns
    if len(text_cols) > 0:
        avg_text_length = df[text_cols].astype(str).apply(lambda x: x.str.len().mean()).mean()
        if avg_text_length > 100:
            suggestions["method"] = "semantic"
            suggestions["semantic"] = {
                "chunk_size": 500,
                "overlap": 50
            }
    
    return suggestions

def _apply_advanced_filters(results: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Apply advanced filters to search results"""
    filtered_results = results.copy()
    
    # Apply similarity threshold
    if 'min_similarity' in filters:
        threshold = filters['min_similarity']
        filtered_results = [r for r in filtered_results if r.get('similarity', 0) >= threshold]
    
    # Apply metadata filters
    if 'metadata_filters' in filters:
        metadata_filters = filters['metadata_filters']
        for key, value in metadata_filters.items():
            filtered_results = [r for r in filtered_results if r.get('metadata', {}).get(key) == value]
    
    return filtered_results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
