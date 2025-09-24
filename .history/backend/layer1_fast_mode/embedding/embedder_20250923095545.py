import numpy as np
from typing import List, Dict, Any, Optional
import sys
import os

# Import local embedding modules
from .fast_mode_embedder import FastModeEmbedder

@dataclass
class EmbeddingMetadata:
    """Metadata for an embedded chunk"""
    chunk_id: str
    source_file: str
    chunk_number: int
    embedding_model: str
    vector_dimension: int
    text_length: int
    additional_metadata: Optional[Dict[str, Any]] = None

@dataclass
class EmbeddedChunk:
    """A chunk with its embedding"""
    id: str
    embedding: np.ndarray
    document: str
    metadata: EmbeddingMetadata

@dataclass
class EmbeddingResult:
    """Result of embedding generation"""
    embedded_chunks: List[EmbeddedChunk]
    model_used: str
    vector_dimension: int
    total_chunks: int
    processing_time: float
    quality_report: Dict[str, Any]

class EmbeddingGenerator:
    """Simple embedding generator using dummy embeddings for now"""
    
    def __init__(self):
        self.model_cache = {}
    
    def generate_embeddings(self, chunks: List, chunk_metadata_list: List[Dict[str, Any]], 
                           model_name: str = "all-MiniLM-L6-v2", batch_size: int = 32,
                           source_file: str = "unknown") -> EmbeddingResult:
        """
        Generate embeddings for chunks
        
        Args:
            chunks: List of DataFrame chunks
            chunk_metadata_list: List of chunk metadata dictionaries
            model_name: Name of the embedding model
            batch_size: Batch size for processing
            source_file: Source file name
            
        Returns:
            EmbeddingResult with embedded chunks
        """
        start_time = time.time()
        
        try:
            embedded_chunks = []
            vector_dimension = 384  # Standard dimension for all-MiniLM-L6-v2
            
            for i, (chunk, metadata) in enumerate(zip(chunks, chunk_metadata_list)):
                # Convert chunk to text
                document = self._chunk_to_text(chunk)
                
                # Generate dummy embedding (replace with real model later)
                embedding = self._generate_dummy_embedding(document, vector_dimension)
                
                # Create metadata
                embedding_metadata = EmbeddingMetadata(
                    chunk_id=metadata.get('chunk_id', f'chunk_{i:04d}'),
                    source_file=source_file,
                    chunk_number=i,
                    embedding_model=model_name,
                    vector_dimension=vector_dimension,
                    text_length=len(document),
                    additional_metadata=metadata.get('metadata', {})
                )
                
                # Create embedded chunk
                embedded_chunk = EmbeddedChunk(
                    id=f"embed_{i:04d}",
                    embedding=embedding,
                    document=document,
                    metadata=embedding_metadata
                )
                
                embedded_chunks.append(embedded_chunk)
            
            processing_time = time.time() - start_time
            
            # Generate quality report
            quality_report = self._generate_quality_report(embedded_chunks, processing_time)
            
            return EmbeddingResult(
                embedded_chunks=embedded_chunks,
                model_used=model_name,
                vector_dimension=vector_dimension,
                total_chunks=len(embedded_chunks),
                processing_time=processing_time,
                quality_report=quality_report
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            return EmbeddingResult(
                embedded_chunks=[],
                model_used=model_name,
                vector_dimension=0,
                total_chunks=0,
                processing_time=processing_time,
                quality_report={"overall_quality": "ERROR", "error": str(e)}
            )
    
    def _chunk_to_text(self, chunk) -> str:
        """Convert DataFrame chunk to text"""
        if hasattr(chunk, 'to_string'):
            # It's a DataFrame
            return chunk.to_string(index=False)
        elif isinstance(chunk, str):
            # It's already text
            return chunk
        else:
            # Convert to string
            return str(chunk)
    
    def _generate_dummy_embedding(self, text: str, dimension: int) -> np.ndarray:
        """Generate a dummy embedding based on text content"""
        # Create a deterministic embedding based on text hash
        text_hash = hash(text) % (2**32)
        np.random.seed(text_hash)
        
        # Generate random embedding
        embedding = np.random.normal(0, 1, dimension)
        
        # Normalize to unit vector
        embedding = embedding / np.linalg.norm(embedding)
        
        return embedding
    
    def _generate_quality_report(self, embedded_chunks: List[EmbeddedChunk], 
                                processing_time: float) -> Dict[str, Any]:
        """Generate quality report for embeddings"""
        if not embedded_chunks:
            return {"overall_quality": "EMPTY", "note": "No embeddings generated"}
        
        # Calculate statistics
        embedding_norms = [np.linalg.norm(chunk.embedding) for chunk in embedded_chunks]
        text_lengths = [chunk.metadata.text_length for chunk in embedded_chunks]
        
        avg_norm = np.mean(embedding_norms)
        norm_variance = np.var(embedding_norms)
        avg_text_length = np.mean(text_lengths)
        
        # Determine quality
        if avg_norm > 0.9 and norm_variance < 0.1 and processing_time < 10:
            overall_quality = "EXCELLENT"
        elif avg_norm > 0.8 and norm_variance < 0.2 and processing_time < 30:
            overall_quality = "GOOD"
        elif avg_norm > 0.7 and processing_time < 60:
            overall_quality = "FAIR"
        else:
            overall_quality = "POOR"
        
        return {
            "overall_quality": overall_quality,
            "average_embedding_norm": round(avg_norm, 4),
            "norm_variance": round(norm_variance, 4),
            "average_text_length": round(avg_text_length, 2),
            "processing_time": round(processing_time, 2),
            "total_chunks": len(embedded_chunks),
            "note": f"Generated {len(embedded_chunks)} embeddings in {processing_time:.2f}s"
        }