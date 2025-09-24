from typing import List, Dict, Any, Optional, Union, Tuple
import pandas as pd
import numpy as np
import os
from .base_chunker import BaseChunker, ChunkingResult, ChunkMetadata

try:
    import tiktoken  # type: ignore
    TIKTOKEN_AVAILABLE = True
except ImportError:
    TIKTOKEN_AVAILABLE = False


class DocumentBasedChunker(BaseChunker):
    """Document-based chunking for CSV data - groups by key column and splits by token count"""
    
    def __init__(self):
        super().__init__("document_based")
    
    def chunk(self, dataframe: pd.DataFrame, key_column: str, 
              token_limit: int = 2000, model_name: str = "gpt-4",
              preserve_headers: bool = True, **kwargs) -> ChunkingResult:
        """
        Chunk dataframe using document-based approach
        
        Args:
            dataframe: Input DataFrame
            key_column: Column name to group rows by
            token_limit: Maximum tokens per chunk (default: 2000)
            model_name: OpenAI model for token counting (default: "gpt-4")
            preserve_headers: Whether to include headers in each chunk
        """
        self.validate_input(dataframe)
        
        if key_column not in dataframe.columns:
            raise ValueError(f"Key column '{key_column}' not found in dataframe")
        
        # Initialize tokenizer if available
        tokenizer = None
        if TIKTOKEN_AVAILABLE:
            try:
                tokenizer = tiktoken.encoding_for_model(model_name)
            except Exception:
                # Fallback to cl100k_base encoding
                tokenizer = tiktoken.get_encoding("cl100k_base")
        else:
            # Simple character-based estimation (rough approximation)
            tokenizer = None
        
        chunks = []
        metadata_list = []
        
        # Group by key column
        grouped = dataframe.groupby(key_column)
        
        chunk_index = 0
        for key_value, group in grouped:
            # Convert group to text for token counting
            group_text = self._dataframe_to_text(group, preserve_headers)
            
            # Estimate token count
            if tokenizer:
                tokens = tokenizer.encode(group_text)
                token_count = len(tokens)
            else:
                # Rough estimation: ~4 characters per token
                token_count = len(group_text) // 4
            
            # Split into chunks if exceeds token limit
            if token_count <= token_limit:
                # Save entire group as one chunk
                chunks.append(group.copy())
                
                metadata = self.create_chunk_metadata(
                    chunk=group,
                    chunk_index=chunk_index,
                    start_idx=group.index[0],
                    end_idx=group.index[-1],
                    original_df=dataframe,
                    extra_metadata={
                        'key_column': key_column,
                        'key_value': str(key_value),
                        'chunking_method': 'document_based',
                        'token_count': token_count,
                        'token_limit': token_limit,
                        'group_size': len(group),
                        'is_subchunk': False
                    }
                )
                metadata_list.append(metadata)
                chunk_index += 1
            else:
                # Split group into sub-chunks
                num_chunks = (token_count // token_limit) + 1
                chunk_size = len(group) // num_chunks
                
                for i in range(num_chunks):
                    start_idx = i * chunk_size
                    end_idx = (i + 1) * chunk_size if i < num_chunks - 1 else len(group)
                    
                    if start_idx >= len(group):
                        break
                    
                    sub_group = group.iloc[start_idx:end_idx].copy()
                    chunks.append(sub_group)
                    
                    # Calculate token count for sub-chunk
                    sub_text = self._dataframe_to_text(sub_group, preserve_headers)
                    if tokenizer:
                        sub_tokens = tokenizer.encode(sub_text)
                        sub_token_count = len(sub_tokens)
                    else:
                        sub_token_count = len(sub_text) // 4
                    
                    metadata = self.create_chunk_metadata(
                        chunk=sub_group,
                        chunk_index=chunk_index,
                        start_idx=group.index[start_idx],
                        end_idx=group.index[end_idx - 1] if end_idx > 0 else group.index[start_idx],
                        original_df=dataframe,
                        extra_metadata={
                            'key_column': key_column,
                            'key_value': str(key_value),
                            'chunking_method': 'document_based',
                            'token_count': sub_token_count,
                            'token_limit': token_limit,
                            'group_size': len(group),
                            'subchunk_index': i + 1,
                            'total_subchunks': num_chunks,
                            'is_subchunk': True
                        }
                    )
                    metadata_list.append(metadata)
                    chunk_index += 1
        
        # Quality assessment
        from .base_chunker import ChunkingQualityAssessment
        quality_report = ChunkingQualityAssessment.comprehensive_assessment(chunks, dataframe)
        
        return ChunkingResult(
            chunks=chunks,
            metadata=metadata_list,
            method=self.name,
            total_chunks=len(chunks),
            quality_report=quality_report
        )
    
    def _dataframe_to_text(self, df: pd.DataFrame, preserve_headers: bool = True) -> str:
        """Convert DataFrame to text representation for token counting"""
        if df.empty:
            return ""
        
        text_parts = []
        
        # Add headers if requested
        if preserve_headers:
            headers = ", ".join(df.columns.astype(str))
            text_parts.append(headers)
        
        # Add rows
        for _, row in df.iterrows():
            row_text = ", ".join([str(val) if pd.notna(val) else "" for val in row])
            text_parts.append(row_text)
        
        return "\n".join(text_parts)
    
    def chunk_by_multiple_keys(self, dataframe: pd.DataFrame, key_columns: List[str],
                              token_limit: int = 2000, model_name: str = "gpt-4",
                              preserve_headers: bool = True, **kwargs) -> ChunkingResult:
        """
        Chunk dataframe using multiple key columns for grouping
        
        Args:
            dataframe: Input DataFrame
            key_columns: List of column names to group rows by
            token_limit: Maximum tokens per chunk
            model_name: OpenAI model for token counting
            preserve_headers: Whether to include headers in each chunk
        """
        self.validate_input(dataframe)
        
        for key_col in key_columns:
            if key_col not in dataframe.columns:
                raise ValueError(f"Key column '{key_col}' not found in dataframe")
        
        # Initialize tokenizer if available
        tokenizer = None
        if TIKTOKEN_AVAILABLE:
            try:
                tokenizer = tiktoken.encoding_for_model(model_name)
            except Exception:
                tokenizer = tiktoken.get_encoding("cl100k_base")
        
        chunks = []
        metadata_list = []
        
        # Group by multiple key columns
        grouped = dataframe.groupby(key_columns)
        
        chunk_index = 0
        for key_tuple, group in grouped:
            # Convert tuple to readable key
            if len(key_tuple) == 1:
                key_value = str(key_tuple[0])
            else:
                key_value = "_".join([str(k) for k in key_tuple])
            
            # Convert group to text for token counting
            group_text = self._dataframe_to_text(group, preserve_headers)
            
            # Estimate token count
            if tokenizer:
                tokens = tokenizer.encode(group_text)
                token_count = len(tokens)
            else:
                token_count = len(group_text) // 4
            
            # Split into chunks if exceeds token limit
            if token_count <= token_limit:
                chunks.append(group.copy())
                
                metadata = self.create_chunk_metadata(
                    chunk=group,
                    chunk_index=chunk_index,
                    start_idx=group.index[0],
                    end_idx=group.index[-1],
                    original_df=dataframe,
                    extra_metadata={
                        'key_columns': key_columns,
                        'key_value': key_value,
                        'chunking_method': 'document_based_multi',
                        'token_count': token_count,
                        'token_limit': token_limit,
                        'group_size': len(group),
                        'is_subchunk': False
                    }
                )
                metadata_list.append(metadata)
                chunk_index += 1
            else:
                # Split group into sub-chunks
                num_chunks = (token_count // token_limit) + 1
                chunk_size = len(group) // num_chunks
                
                for i in range(num_chunks):
                    start_idx = i * chunk_size
                    end_idx = (i + 1) * chunk_size if i < num_chunks - 1 else len(group)
                    
                    if start_idx >= len(group):
                        break
                    
                    sub_group = group.iloc[start_idx:end_idx].copy()
                    chunks.append(sub_group)
                    
                    # Calculate token count for sub-chunk
                    sub_text = self._dataframe_to_text(sub_group, preserve_headers)
                    if tokenizer:
                        sub_tokens = tokenizer.encode(sub_text)
                        sub_token_count = len(sub_tokens)
                    else:
                        sub_token_count = len(sub_text) // 4
                    
                    metadata = self.create_chunk_metadata(
                        chunk=sub_group,
                        chunk_index=chunk_index,
                        start_idx=group.index[start_idx],
                        end_idx=group.index[end_idx - 1] if end_idx > 0 else group.index[start_idx],
                        original_df=dataframe,
                        extra_metadata={
                            'key_columns': key_columns,
                            'key_value': key_value,
                            'chunking_method': 'document_based_multi',
                            'token_count': sub_token_count,
                            'token_limit': token_limit,
                            'group_size': len(group),
                            'subchunk_index': i + 1,
                            'total_subchunks': num_chunks,
                            'is_subchunk': True
                        }
                    )
                    metadata_list.append(metadata)
                    chunk_index += 1
        
        # Quality assessment
        from .base_chunker import ChunkingQualityAssessment
        quality_report = ChunkingQualityAssessment.comprehensive_assessment(chunks, dataframe)
        
        return ChunkingResult(
            chunks=chunks,
            metadata=metadata_list,
            method=self.name,
            total_chunks=len(chunks),
            quality_report=quality_report
        )


def chunk_document_based(dataframe: pd.DataFrame, key_column: str,
                        token_limit: int = 2000, model_name: str = "gpt-4",
                        preserve_headers: bool = True) -> ChunkingResult:
    """
    Convenience function for document-based chunking
    
    Args:
        dataframe: Input DataFrame
        key_column: Column name to group rows by
        token_limit: Maximum tokens per chunk
        model_name: OpenAI model for token counting
        preserve_headers: Whether to include headers in each chunk
    """
    chunker = DocumentBasedChunker()
    return chunker.chunk(dataframe, key_column, token_limit, model_name, preserve_headers)


def chunk_document_based_multi(dataframe: pd.DataFrame, key_columns: List[str],
                              token_limit: int = 2000, model_name: str = "gpt-4",
                              preserve_headers: bool = True) -> ChunkingResult:
    """
    Convenience function for document-based chunking with multiple key columns
    
    Args:
        dataframe: Input DataFrame
        key_columns: List of column names to group rows by
        token_limit: Maximum tokens per chunk
        model_name: OpenAI model for token counting
        preserve_headers: Whether to include headers in each chunk
    """
    chunker = DocumentBasedChunker()
    return chunker.chunk_by_multiple_keys(dataframe, key_columns, token_limit, model_name, preserve_headers)

