import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
import sys
import os

# Add the existing backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../../CHUNKING_PROJECT/src'))

from chunking.fixed_size_chunker import FixedSizeChunker
from chunking.base_chunker import ChunkingResult, ChunkMetadata

class FastModeChunker:
    """Fast Mode Chunker - Optimized chunking with best-practice defaults"""
    
    def __init__(self):
        self.chunker = FixedSizeChunker()
        self.default_chunk_size = 100
        self.default_overlap = 10
    
    def chunk(self, df: pd.DataFrame, chunk_size: Optional[int] = None, 
              overlap: Optional[int] = None) -> Dict[str, Any]:
        """
        Fast chunking with optimized defaults
        
        Args:
            df: Input DataFrame
            chunk_size: Number of rows per chunk (default: 100)
            overlap: Number of overlapping rows (default: 10)
            
        Returns:
            Dictionary with chunking results
        """
        try:
            # Use defaults if not provided
            chunk_size = chunk_size or self.default_chunk_size
            overlap = overlap or self.default_overlap
            
            # Validate inputs
            self._validate_inputs(df, chunk_size, overlap)
            
            # Perform chunking
            result = self.chunker.chunk(
                dataframe=df,
                chunk_size=chunk_size,
                overlap=overlap
            )
            
            # Convert to text chunks for embedding
            text_chunks = self._convert_to_text_chunks(result.chunks, result.metadata)
            
            # Generate statistics
            stats = self._generate_chunking_stats(result, df)
            
            return {
                'chunks': result.chunks,
                'text_chunks': text_chunks,
                'metadata': result.metadata,
                'stats': stats,
                'success': True,
                'message': f'Fast chunking completed: {result.total_chunks} chunks created'
            }
            
        except Exception as e:
            return {
                'chunks': [],
                'text_chunks': [],
                'metadata': [],
                'stats': {},
                'success': False,
                'error': str(e)
            }
    
    def _validate_inputs(self, df: pd.DataFrame, chunk_size: int, overlap: int):
        """Validate chunking inputs"""
        if df is None or df.empty:
            raise ValueError("DataFrame cannot be None or empty")
        
        if chunk_size <= 0:
            raise ValueError("Chunk size must be positive")
        
        if overlap < 0:
            raise ValueError("Overlap cannot be negative")
        
        if overlap >= chunk_size:
            raise ValueError("Overlap must be less than chunk size")
        
        if chunk_size > len(df):
            print(f"Warning: Chunk size ({chunk_size}) is larger than DataFrame size ({len(df)})")
    
    def _convert_to_text_chunks(self, chunks: List[pd.DataFrame], 
                               metadata: List[ChunkMetadata]) -> List[str]:
        """Convert DataFrame chunks to text for embedding"""
        text_chunks = []
        
        for i, chunk in enumerate(chunks):
            if chunk.empty:
                text_chunks.append("")
                continue
            
            # Convert chunk to text representation
            text_parts = []
            
            # Add chunk context
            if i < len(metadata):
                meta = metadata[i]
                text_parts.append(f"Chunk ID: {meta.chunk_id}")
                text_parts.append(f"Method: {meta.method}")
                text_parts.append(f"Size: {meta.chunk_size} rows")
            
            # Convert each row to text
            for _, row in chunk.iterrows():
                row_text = self._row_to_text(row, chunk.columns)
                if row_text:
                    text_parts.append(row_text)
            
            # Join all parts
            chunk_text = ". ".join(text_parts) + "."
            text_chunks.append(chunk_text)
        
        return text_chunks
    
    def _row_to_text(self, row: pd.Series, columns: List[str]) -> str:
        """Convert a single row to natural language text"""
        text_parts = []
        
        for col in columns:
            value = row[col]
            if pd.notna(value) and str(value).strip():
                # Make column name readable
                readable_col = self._make_column_readable(col)
                text_parts.append(f"{readable_col}: {value}")
        
        return ". ".join(text_parts) if text_parts else ""
    
    def _make_column_readable(self, column_name: str) -> str:
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
    
    def _generate_chunking_stats(self, result: ChunkingResult, original_df: pd.DataFrame) -> Dict[str, Any]:
        """Generate chunking statistics"""
        chunk_sizes = [len(chunk) for chunk in result.chunks]
        
        return {
            'total_chunks': result.total_chunks,
            'method': result.method,
            'original_rows': len(original_df),
            'total_chunk_rows': sum(chunk_sizes),
            'avg_chunk_size': np.mean(chunk_sizes) if chunk_sizes else 0,
            'min_chunk_size': min(chunk_sizes) if chunk_sizes else 0,
            'max_chunk_size': max(chunk_sizes) if chunk_sizes else 0,
            'quality_report': result.quality_report,
            'chunk_size_distribution': {
                'small_chunks': sum(1 for size in chunk_sizes if size < 50),
                'medium_chunks': sum(1 for size in chunk_sizes if 50 <= size < 150),
                'large_chunks': sum(1 for size in chunk_sizes if size >= 150)
            }
        }
