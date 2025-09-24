from typing import List, Dict, Any, Optional, Union, Tuple
import pandas as pd
import numpy as np
import warnings
from dataclasses import dataclass
import json
import os

@dataclass
class EmbeddingMetadata:
    """Metadata for embedded chunks"""
    chunk_id: str
    source_file: str
    chunk_number: int
    embedding_model: str
    vector_dimension: int
    text_length: int
    quality_score: Optional[float] = None
    additional_metadata: Optional[Dict[str, Any]] = None

@dataclass
class EmbeddedChunk:
    """Complete embedded chunk ready for vector database"""
    id: str
    embedding: np.ndarray
    metadata: EmbeddingMetadata
    document: str  # The prepared text

@dataclass
class EmbeddingResult:
    """Result of embedding generation process"""
    embedded_chunks: List[EmbeddedChunk]
    model_used: str
    total_chunks: int
    vector_dimension: int
    processing_time: float
    quality_report: Dict[str, Any]

class TextPreparer:
    """Handles conversion of CSV chunks to semantically meaningful text"""
    
    @staticmethod
    def prepare_chunk_text(chunk: pd.DataFrame, chunk_metadata: Dict[str, Any] = None) -> str:
        """
        Convert a CSV chunk to semantically meaningful text
        
        Args:
            chunk: DataFrame chunk
            chunk_metadata: Additional metadata about the chunk
            
        Returns:
            Prepared text string
        """
        if chunk.empty:
            return ""
        
        # Special handling for semantic chunks
        if chunk_metadata and chunk_metadata.get('method') == 'semantic':
            # For semantic chunks, the text is already prepared
            # Just return the content from the 'text' column
            if 'text' in chunk.columns and len(chunk) == 1:
                return chunk['text'].iloc[0]
        
        text_parts = []
        
        # Add chunk context if available
        if chunk_metadata:
            if 'chunk_id' in chunk_metadata:
                text_parts.append(f"Chunk ID: {chunk_metadata['chunk_id']}")
            if 'method' in chunk_metadata:
                text_parts.append(f"Chunking Method: {chunk_metadata['method']}")
        
        # Process each row
        for idx, row in chunk.iterrows():
            row_text = TextPreparer._prepare_row_text(row, chunk.columns)
            if row_text:
                text_parts.append(row_text)
        
        return ". ".join(text_parts) + "."
    
    @staticmethod
    def _prepare_row_text(row: pd.Series, columns: List[str]) -> str:
        """Convert a single row to natural language text"""
        text_parts = []
        
        for col in columns:
            value = row[col]
            if pd.notna(value) and str(value).strip():
                # Convert column name to readable format
                readable_col = TextPreparer._make_column_readable(col)
                text_parts.append(f"{readable_col}: {value}")
        
        return ". ".join(text_parts) if text_parts else ""
    
    @staticmethod
    def _make_column_readable(column_name: str) -> str:
        """Convert column name to human-readable format"""
        # Handle common patterns
        replacements = {
            '_': ' ',
            'id': 'ID',
            'name': 'Name',
            'email': 'Email',
            'phone': 'Phone',
            'address': 'Address',
            'date': 'Date',
            'time': 'Time',
            'price': 'Price',
            'amount': 'Amount',
            'quantity': 'Quantity',
            'status': 'Status',
            'type': 'Type',
            'category': 'Category',
            'description': 'Description'
        }
        
        readable = column_name.lower()
        for old, new in replacements.items():
            readable = readable.replace(old, new)
        
        # Capitalize first letter
        return readable.capitalize()

class EmbeddingModelManager:
    """Manages embedding models and their configurations"""
    
    AVAILABLE_MODELS = {
        "all-MiniLM-L6-v2": {
            "name": "all-MiniLM-L6-v2",
            "description": "Default - Fast & Efficient",
            "dimension": 384,
            "fallback": True
        },
        "BAAI/bge-small-en-v1.5": {
            "name": "BAAI/bge-small-en-v1.5", 
            "description": "High Accuracy",
            "dimension": 384,
            "fallback": False
        }
    }
    
    @classmethod
    def get_model_info(cls, model_name: str) -> Dict[str, Any]:
        """Get information about a specific model"""
        return cls.AVAILABLE_MODELS.get(model_name, cls.AVAILABLE_MODELS["all-MiniLM-L6-v2"])
    
    @classmethod
    def get_fallback_model(cls) -> str:
        """Get the fallback model name"""
        for name, info in cls.AVAILABLE_MODELS.items():
            if info.get("fallback", False):
                return name
        return "all-MiniLM-L6-v2"

class EmbeddingGenerator:
    """Main class for generating embeddings from CSV chunks"""
    
    def __init__(self):
        self.model = None
        self.model_name = None
        self.text_preparer = TextPreparer()
    
    def generate_embeddings(self, chunks: List[pd.DataFrame], 
                           chunk_metadata_list: List[Dict[str, Any]],
                           model_name: str = "all-MiniLM-L6-v2",
                           batch_size: int = 32,
                           source_file: str = "unknown") -> EmbeddingResult:
        """
        Generate embeddings for CSV chunks
        
        Args:
            chunks: List of DataFrame chunks
            chunk_metadata_list: List of metadata for each chunk
            model_name: Name of the embedding model to use
            batch_size: Batch size for processing
            source_file: Name of the source file
            
        Returns:
            EmbeddingResult with embedded chunks
        """
        import time
        start_time = time.time()
        
        try:
            # Load the selected model
            self._load_model(model_name)
            
            # Prepare chunk texts
            chunk_texts = self._prepare_chunk_texts(chunks, chunk_metadata_list)
            
            # Generate embeddings
            embeddings = self._generate_embeddings_batch(chunk_texts, batch_size)
            
            # Validate embeddings
            validation_result = self._validate_embeddings(embeddings, chunks)
            
            # Create embedded chunks
            embedded_chunks = self._create_embedded_chunks(
                chunks, chunk_metadata_list, chunk_texts, embeddings, source_file
            )
            
            processing_time = time.time() - start_time
            
            return EmbeddingResult(
                embedded_chunks=embedded_chunks,
                model_used=self.model_name,
                total_chunks=len(embedded_chunks),
                vector_dimension=self._get_model_dimension(),
                quality_report=validation_result,
                processing_time=processing_time
            )
            
        except Exception as e:
            # Error handling with fallback
            return self._handle_embedding_error(e, chunks, chunk_metadata_list, 
                                              model_name, batch_size, source_file)
    
    def _load_model(self, model_name: str):
        """Load the specified embedding model"""
        try:
            # Try to import sentence-transformers
            from sentence_transformers import SentenceTransformer
            
            self.model = SentenceTransformer(model_name)
            self.model_name = model_name
            
        except ImportError:
            raise ImportError("sentence-transformers library not available. Please install it.")
        except Exception as e:
            # Try fallback model
            fallback_model = EmbeddingModelManager.get_fallback_model()
            if model_name != fallback_model:
                warnings.warn(f"Failed to load {model_name}, trying fallback model {fallback_model}")
                self._load_model(fallback_model)
            else:
                raise Exception(f"Failed to load embedding model: {e}")
    
    def _prepare_chunk_texts(self, chunks: List[pd.DataFrame], 
                            chunk_metadata_list: List[Dict[str, Any]]) -> List[str]:
        """Prepare text representations for all chunks"""
        chunk_texts = []
        
        for i, chunk in enumerate(chunks):
            metadata = chunk_metadata_list[i] if i < len(chunk_metadata_list) else {}
            text = self.text_preparer.prepare_chunk_text(chunk, metadata)
            chunk_texts.append(text)
        
        return chunk_texts
    
    def _generate_embeddings_batch(self, chunk_texts: List[str], batch_size: int) -> np.ndarray:
        """Generate embeddings in batches"""
        try:
            embeddings = self.model.encode(
                chunk_texts,
                batch_size=batch_size,
                show_progress_bar=True,
                convert_to_tensor=False
            )
            return embeddings
            
        except Exception as e:
            if "out of memory" in str(e).lower() or "batch_size" in str(e).lower():
                # Reduce batch size and retry
                new_batch_size = max(1, batch_size // 2)
                warnings.warn(f"Batch size {batch_size} too large, reducing to {new_batch_size}")
                return self._generate_embeddings_batch(chunk_texts, new_batch_size)
            else:
                raise e
    
    def _validate_embeddings(self, embeddings: np.ndarray, chunks: List[pd.DataFrame]) -> Dict[str, Any]:
        """Validate the quality of generated embeddings"""
        validation_result = {
            "dimensionality_check": True,
            "zero_vector_check": True,
            "nan_check": True,
            "semantic_sanity_check": True,
            "overall_quality": "PASS"
        }
        
        # Dimensionality check
        expected_dim = self._get_model_dimension()
        if embeddings.shape[1] != expected_dim:
            validation_result["dimensionality_check"] = False
            validation_result["overall_quality"] = "FAIL"
        
        # Zero vector check
        zero_vectors = np.all(embeddings == 0, axis=1).sum()
        if zero_vectors > 0:
            validation_result["zero_vector_check"] = False
            validation_result["zero_vector_count"] = int(zero_vectors)
            validation_result["overall_quality"] = "FAIL"
        
        # NaN check
        nan_count = np.isnan(embeddings).sum()
        if nan_count > 0:
            validation_result["nan_check"] = False
            validation_result["nan_count"] = int(nan_count)
            validation_result["overall_quality"] = "FAIL"
        
        # Semantic sanity check (basic)
        if len(embeddings) > 1:
            # Check if embeddings have reasonable variance
            embedding_std = np.std(embeddings)
            if embedding_std < 0.01:  # Very low variance might indicate issues
                validation_result["semantic_sanity_check"] = False
                validation_result["overall_quality"] = "FAIL"
                validation_result["embedding_std"] = float(embedding_std)
        
        return validation_result
    
    def _create_embedded_chunks(self, chunks: List[pd.DataFrame], 
                              chunk_metadata_list: List[Dict[str, Any]],
                              chunk_texts: List[str], embeddings: np.ndarray,
                              source_file: str) -> List[EmbeddedChunk]:
        """Create EmbeddedChunk objects"""
        embedded_chunks = []
        
        for i, (chunk, text, embedding) in enumerate(zip(chunks, chunk_texts, embeddings)):
            # Get metadata
            metadata_dict = chunk_metadata_list[i] if i < len(chunk_metadata_list) else {}
            
            # Create embedding metadata
            metadata = EmbeddingMetadata(
                chunk_id=metadata_dict.get('chunk_id', f'chunk_{i:04d}'),
                source_file=source_file,
                chunk_number=i + 1,
                embedding_model=self.model_name,
                vector_dimension=self._get_model_dimension(),
                text_length=len(text),
                quality_score=metadata_dict.get('quality_score'),
                additional_metadata=metadata_dict
            )
            
            # Create embedded chunk
            embedded_chunk = EmbeddedChunk(
                id=metadata.chunk_id,
                embedding=embedding,
                metadata=metadata,
                document=text
            )
            
            embedded_chunks.append(embedded_chunk)
        
        return embedded_chunks
    
    def _get_model_dimension(self) -> int:
        """Get the dimension of the current model"""
        model_info = EmbeddingModelManager.get_model_info(self.model_name)
        return model_info["dimension"]
    
    def _handle_embedding_error(self, error: Exception, chunks: List[pd.DataFrame],
                              chunk_metadata_list: List[Dict[str, Any]], 
                              model_name: str, batch_size: int, source_file: str) -> EmbeddingResult:
        """Handle embedding errors with appropriate fallback strategies"""
        
        error_type = type(error).__name__
        error_message = str(error)
        
        if "ImportError" in error_type or "sentence-transformers" in error_message:
            # Model library not available - create dummy embeddings
            warnings.warn("sentence-transformers not available, creating dummy embeddings")
            return self._create_dummy_embeddings(chunks, chunk_metadata_list, source_file)
        
        elif "out of memory" in error_message.lower():
            # Memory issue - try with smaller batch size
            if batch_size > 1:
                return self.generate_embeddings(chunks, chunk_metadata_list, 
                                              model_name, batch_size // 2, source_file)
        
        elif "model" in error_message.lower() and "load" in error_message.lower():
            # Model loading failed - try fallback
            fallback_model = EmbeddingModelManager.get_fallback_model()
            if model_name != fallback_model:
                return self.generate_embeddings(chunks, chunk_metadata_list,
                                              fallback_model, batch_size, source_file)
        
        # For other errors, create dummy embeddings
        warnings.warn(f"Embedding generation failed: {error_message}. Creating dummy embeddings.")
        return self._create_dummy_embeddings(chunks, chunk_metadata_list, source_file)
    
    def _create_dummy_embeddings(self, chunks: List[pd.DataFrame], 
                               chunk_metadata_list: List[Dict[str, Any]],
                               source_file: str) -> EmbeddingResult:
        """Create dummy embeddings when real embedding generation fails"""
        dummy_dimension = 384  # Standard dimension
        
        embedded_chunks = []
        for i, chunk in enumerate(chunks):
            # Create dummy embedding (random vector)
            dummy_embedding = np.random.normal(0, 0.1, dummy_dimension)
            
            # Get metadata
            metadata_dict = chunk_metadata_list[i] if i < len(chunk_metadata_list) else {}
            
            # Create text representation
            text = self.text_preparer.prepare_chunk_text(chunk, metadata_dict)
            
            # Create embedding metadata
            metadata = EmbeddingMetadata(
                chunk_id=metadata_dict.get('chunk_id', f'dummy_chunk_{i:04d}'),
                source_file=source_file,
                chunk_number=i + 1,
                embedding_model="dummy_model",
                vector_dimension=dummy_dimension,
                text_length=len(text),
                additional_metadata=metadata_dict
            )
            
            # Create embedded chunk
            embedded_chunk = EmbeddedChunk(
                id=metadata.chunk_id,
                embedding=dummy_embedding,
                metadata=metadata,
                document=text
            )
            
            embedded_chunks.append(embedded_chunk)
        
        return EmbeddingResult(
            embedded_chunks=embedded_chunks,
            model_used="dummy_model",
            total_chunks=len(embedded_chunks),
            vector_dimension=dummy_dimension,
            quality_report={"overall_quality": "DUMMY", "note": "Dummy embeddings created due to error"},
            processing_time=0.0
        )

def generate_chunk_embeddings(chunks: List[pd.DataFrame], 
                            chunk_metadata_list: List[Dict[str, Any]],
                            model_name: str = "all-MiniLM-L6-v2",
                            batch_size: int = 32,
                            source_file: str = "unknown") -> EmbeddingResult:
    """
    Convenience function for generating embeddings
    
    Args:
        chunks: List of DataFrame chunks
        chunk_metadata_list: List of metadata for each chunk
        model_name: Name of the embedding model to use
        batch_size: Batch size for processing
        source_file: Name of the source file
        
    Returns:
        EmbeddingResult with embedded chunks
    """
    generator = EmbeddingGenerator()
    return generator.generate_embeddings(chunks, chunk_metadata_list, 
                                       model_name, batch_size, source_file)

