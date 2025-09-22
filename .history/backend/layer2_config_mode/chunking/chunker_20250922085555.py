import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
import sys
import os

# Add the existing backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../../CHUNKING_PROJECT/src'))

from chunking.fixed_size_chunker import FixedSizeChunker
from chunking.recursive_chunker import RecursiveChunker
from chunking.document_based_chunker import DocumentBasedChunker
from chunking.base_chunker import ChunkingResult, ChunkMetadata

class ConfigModeChunker:
    """Config Mode Chunker - Configurable chunking with multiple strategies"""
    
    def __init__(self):
        self.chunkers = {
            'fixed': FixedSizeChunker(),
            'recursive': RecursiveChunker(),
            'document': DocumentBasedChunker()
        }
        self.default_config = self._get_default_config()
    
    def chunk(self, df: pd.DataFrame, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Configurable chunking with multiple strategies
        
        Args:
            df: Input DataFrame
            config: Configuration dictionary with chunking options
            
        Returns:
            Dictionary with chunking results
        """
        try:
            # Use default config if not provided
            config = config or self.default_config
            
            # Validate inputs
            self._validate_inputs(df, config)
            
            # Select chunking method
            method = config.get('method', 'fixed')
            chunker = self.chunkers.get(method)
            
            if not chunker:
                raise ValueError(f"Unknown chunking method: {method}")
            
            # Perform chunking based on method
            if method == 'fixed':
                result = self._fixed_chunking(df, config, chunker)
            elif method == 'recursive':
                result = self._recursive_chunking(df, config, chunker)
            elif method == 'document':
                result = self._document_chunking(df, config, chunker)
            else:
                raise ValueError(f"Chunking method {method} not implemented")
            
            # Convert to text chunks for embedding
            text_chunks = self._convert_to_text_chunks(result.chunks, result.metadata, config)
            
            # Generate statistics
            stats = self._generate_chunking_stats(result, df, config)
            
            return {
                'chunks': result.chunks,
                'text_chunks': text_chunks,
                'metadata': result.metadata,
                'stats': stats,
                'config_used': config,
                'success': True,
                'message': f'Config mode chunking completed: {result.total_chunks} chunks created using {method} method'
            }
            
        except Exception as e:
            return {
                'chunks': [],
                'text_chunks': [],
                'metadata': [],
                'stats': {},
                'config_used': config or {},
                'success': False,
                'error': str(e)
            }
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration for config mode"""
        return {
            'method': 'fixed',  # 'fixed', 'recursive', 'document'
            'fixed_size': {
                'chunk_size': 100,
                'overlap': 10
            },
            'recursive': {
                'chunk_size': 1000,
                'chunk_overlap': 100,
                'length_function': 'len',
                'separators': ['\n\n', '\n', ' ', '']
            },
            'document': {
                'key_column': None,
                'token_limit': 2000,
                'preserve_headers': True
            },
            'text_processing': {
                'include_metadata': True,
                'metadata_format': 'structured',
                'column_mapping': {}
            }
        }
    
    def _validate_inputs(self, df: pd.DataFrame, config: Dict[str, Any]):
        """Validate chunking inputs"""
        if df is None or df.empty:
            raise ValueError("DataFrame cannot be None or empty")
        
        method = config.get('method', 'fixed')
        
        if method == 'fixed':
            chunk_size = config.get('fixed_size', {}).get('chunk_size', 100)
            overlap = config.get('fixed_size', {}).get('overlap', 10)
            
            if chunk_size <= 0:
                raise ValueError("Chunk size must be positive")
            if overlap < 0:
                raise ValueError("Overlap cannot be negative")
            if overlap >= chunk_size:
                raise ValueError("Overlap must be less than chunk size")
        
        elif method == 'document':
            key_column = config.get('document', {}).get('key_column')
            if key_column and key_column not in df.columns:
                raise ValueError(f"Key column '{key_column}' not found in DataFrame")
    
    def _fixed_chunking(self, df: pd.DataFrame, config: Dict[str, Any], chunker) -> ChunkingResult:
        """Perform fixed-size chunking"""
        fixed_config = config.get('fixed_size', {})
        
        return chunker.chunk(
            dataframe=df,
            chunk_size=fixed_config.get('chunk_size', 100),
            overlap=fixed_config.get('overlap', 10)
        )
    
    def _recursive_chunking(self, df: pd.DataFrame, config: Dict[str, Any], chunker) -> ChunkingResult:
        """Perform recursive chunking"""
        recursive_config = config.get('recursive', {})
        
        return chunker.chunk(
            dataframe=df,
            chunk_size=recursive_config.get('chunk_size', 1000),
            chunk_overlap=recursive_config.get('chunk_overlap', 100),
            length_function=recursive_config.get('length_function', 'len'),
            separators=recursive_config.get('separators', ['\n\n', '\n', ' ', ''])
        )
    
    def _document_chunking(self, df: pd.DataFrame, config: Dict[str, Any], chunker) -> ChunkingResult:
        """Perform document-based chunking"""
        document_config = config.get('document', {})
        
        return chunker.chunk(
            dataframe=df,
            key_column=document_config.get('key_column'),
            token_limit=document_config.get('token_limit', 2000),
            preserve_headers=document_config.get('preserve_headers', True)
        )
    
    def _convert_to_text_chunks(self, chunks: List[pd.DataFrame], 
                               metadata: List[ChunkMetadata], 
                               config: Dict[str, Any]) -> List[str]:
        """Convert DataFrame chunks to text for embedding"""
        text_chunks = []
        text_config = config.get('text_processing', {})
        include_metadata = text_config.get('include_metadata', True)
        metadata_format = text_config.get('metadata_format', 'structured')
        column_mapping = text_config.get('column_mapping', {})
        
        for i, chunk in enumerate(chunks):
            if chunk.empty:
                text_chunks.append("")
                continue
            
            # Convert chunk to text representation
            text_parts = []
            
            # Add chunk metadata if configured
            if include_metadata and i < len(metadata):
                meta = metadata[i]
                if metadata_format == 'structured':
                    text_parts.append(f"Chunk ID: {meta.chunk_id}")
                    text_parts.append(f"Method: {meta.method}")
                    text_parts.append(f"Size: {meta.chunk_size} rows")
                elif metadata_format == 'minimal':
                    text_parts.append(f"Chunk {i+1}")
            
            # Convert each row to text
            for _, row in chunk.iterrows():
                row_text = self._row_to_text(row, chunk.columns, column_mapping)
                if row_text:
                    text_parts.append(row_text)
            
            # Join all parts
            chunk_text = ". ".join(text_parts) + "."
            text_chunks.append(chunk_text)
        
        return text_chunks
    
    def _row_to_text(self, row: pd.Series, columns: List[str], column_mapping: Dict[str, str]) -> str:
        """Convert a single row to natural language text"""
        text_parts = []
        
        for col in columns:
            value = row[col]
            if pd.notna(value) and str(value).strip():
                # Use column mapping if provided
                display_col = column_mapping.get(col, col)
                readable_col = self._make_column_readable(display_col)
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
    
    def _generate_chunking_stats(self, result: ChunkingResult, original_df: pd.DataFrame, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate chunking statistics"""
        chunk_sizes = [len(chunk) for chunk in result.chunks]
        
        return {
            'total_chunks': result.total_chunks,
            'method': result.method,
            'config_used': config,
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
            },
            'method_specific_stats': self._get_method_specific_stats(result, config)
        }
    
    def _get_method_specific_stats(self, result: ChunkingResult, config: Dict[str, Any]) -> Dict[str, Any]:
        """Get method-specific statistics"""
        method = config.get('method', 'fixed')
        
        if method == 'fixed':
            return {
                'chunk_size': config.get('fixed_size', {}).get('chunk_size', 100),
                'overlap': config.get('fixed_size', {}).get('overlap', 10),
                'overlap_percentage': (config.get('fixed_size', {}).get('overlap', 10) / config.get('fixed_size', {}).get('chunk_size', 100)) * 100
            }
        elif method == 'recursive':
            return {
                'chunk_size': config.get('recursive', {}).get('chunk_size', 1000),
                'chunk_overlap': config.get('recursive', {}).get('chunk_overlap', 100),
                'separators': config.get('recursive', {}).get('separators', ['\n\n', '\n', ' ', ''])
            }
        elif method == 'document':
            return {
                'key_column': config.get('document', {}).get('key_column'),
                'token_limit': config.get('document', {}).get('token_limit', 2000),
                'preserve_headers': config.get('document', {}).get('preserve_headers', True)
            }
        
        return {}
