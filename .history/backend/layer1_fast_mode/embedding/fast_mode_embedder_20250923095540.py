import numpy as np
from typing import List, Dict, Any, Optional
import sys
import os

# Import local embedding modules
from .embedder import EmbeddingGenerator, EmbeddingResult

class FastModeEmbedder:
    """Fast Mode Embedder - Optimized embedding with best-practice defaults"""
    
    def __init__(self):
        self.generator = EmbeddingGenerator()
        self.default_model = "all-MiniLM-L6-v2"
        self.default_batch_size = 32
    
    def generate_embeddings(self, chunks: List, text_chunks: List[str], 
                           metadata: List, model_name: Optional[str] = None,
                           batch_size: Optional[int] = None,
                           source_file: str = "fast_mode") -> Dict[str, Any]:
        """
        Fast embedding generation with optimized defaults
        
        Args:
            chunks: List of DataFrame chunks
            text_chunks: List of text representations
            metadata: List of chunk metadata
            model_name: Embedding model name (default: all-MiniLM-L6-v2)
            batch_size: Batch size for processing (default: 32)
            source_file: Source file name
            
        Returns:
            Dictionary with embedding results
        """
        try:
            # Use defaults if not provided
            model_name = model_name or self.default_model
            batch_size = batch_size or self.default_batch_size
            
            # Validate inputs
            self._validate_inputs(chunks, text_chunks, metadata)
            
            # Convert metadata to the expected format
            metadata_list = self._convert_metadata(metadata)
            
            # Generate embeddings
            result = self.generator.generate_embeddings(
                chunks=chunks,
                chunk_metadata_list=metadata_list,
                model_name=model_name,
                batch_size=batch_size,
                source_file=source_file
            )
            
            # Generate statistics
            stats = self._generate_embedding_stats(result)
            
            return {
                'embedded_chunks': result.embedded_chunks,
                'embeddings': [chunk.embedding for chunk in result.embedded_chunks],
                'documents': [chunk.document for chunk in result.embedded_chunks],
                'metadata': [chunk.metadata for chunk in result.embedded_chunks],
                'stats': stats,
                'success': True,
                'message': f'Fast embedding completed: {result.total_chunks} embeddings generated'
            }
            
        except Exception as e:
            return {
                'embedded_chunks': [],
                'embeddings': [],
                'documents': [],
                'metadata': [],
                'stats': {},
                'success': False,
                'error': str(e)
            }
    
    def _validate_inputs(self, chunks: List, text_chunks: List[str], metadata: List):
        """Validate embedding inputs"""
        if not chunks:
            raise ValueError("Chunks list cannot be empty")
        
        if not text_chunks:
            raise ValueError("Text chunks list cannot be empty")
        
        if len(chunks) != len(text_chunks):
            raise ValueError("Number of chunks and text chunks must match")
        
        if metadata and len(metadata) != len(chunks):
            raise ValueError("Number of metadata items must match number of chunks")
    
    def _convert_metadata(self, metadata: List) -> List[Dict[str, Any]]:
        """Convert metadata to the expected format"""
        metadata_list = []
        
        for i, meta in enumerate(metadata):
            if hasattr(meta, '__dict__'):
                # Convert object to dictionary
                meta_dict = {
                    'chunk_id': getattr(meta, 'chunk_id', f'chunk_{i:04d}'),
                    'method': getattr(meta, 'method', 'fast_mode'),
                    'chunk_size': getattr(meta, 'chunk_size', 0),
                    'start_index': getattr(meta, 'start_index', 0),
                    'end_index': getattr(meta, 'end_index', 0),
                    'overlap': getattr(meta, 'overlap', 0),
                    'quality_score': getattr(meta, 'quality_score', None),
                    'metadata': getattr(meta, 'metadata', {})
                }
            elif isinstance(meta, dict):
                meta_dict = meta
            else:
                # Create default metadata
                meta_dict = {
                    'chunk_id': f'chunk_{i:04d}',
                    'method': 'fast_mode',
                    'chunk_size': 0,
                    'start_index': 0,
                    'end_index': 0,
                    'overlap': 0,
                    'quality_score': None,
                    'metadata': {}
                }
            
            metadata_list.append(meta_dict)
        
        return metadata_list
    
    def _generate_embedding_stats(self, result: EmbeddingResult) -> Dict[str, Any]:
        """Generate embedding statistics"""
        return {
            'total_chunks': result.total_chunks,
            'model_used': result.model_used,
            'vector_dimension': result.vector_dimension,
            'processing_time': result.processing_time,
            'quality_report': result.quality_report,
            'embedding_stats': {
                'avg_embedding_norm': np.mean([np.linalg.norm(chunk.embedding) for chunk in result.embedded_chunks]) if result.embedded_chunks else 0,
                'min_embedding_norm': np.min([np.linalg.norm(chunk.embedding) for chunk in result.embedded_chunks]) if result.embedded_chunks else 0,
                'max_embedding_norm': np.max([np.linalg.norm(chunk.embedding) for chunk in result.embedded_chunks]) if result.embedded_chunks else 0,
                'avg_text_length': np.mean([len(chunk.document) for chunk in result.embedded_chunks]) if result.embedded_chunks else 0
            }
        }
