from langchain_text_splitters import RecursiveCharacterTextSplitter
import pandas as pd
from typing import List, Dict, Any
from .base_chunker import BaseChunker, ChunkingResult, ChunkMetadata


def fixed_size_chunking_from_df(df, chunk_size=400, overlap=50):
    text = "\n".join(df.astype(str).apply(lambda row: " | ".join(row.values), axis=1))
    splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=overlap)
    return splitter.split_text(text)


def fixed_size_chunking_with_spans(df: pd.DataFrame, chunk_size: int = 400, overlap: int = 50) -> List[Dict[str, Any]]:
    """
    Create fixed-size text chunks and map each chunk back to the original row indices it covers.

    Returns a list of dicts: { 'text': str, 'row_indices': List[int] }
    """
    if df is None or df.empty:
        return []

    # Build per-row strings and the big concatenated text with newlines
    row_lines: List[str] = df.astype(str).apply(lambda row: " | ".join(row.values), axis=1).tolist()
    big_text = "\n".join(row_lines)

    # Character spans for each row within big_text
    spans: List[tuple] = []  # (start_char, end_char, row_index)
    pos = 0
    for idx, line in enumerate(row_lines):
        start = pos
        end = start + len(line)
        spans.append((start, end, idx))
        pos = end + 1  # account for the newline between rows

    splitter = RecursiveCharacterTextSplitter(chunk_size=int(chunk_size), chunk_overlap=int(overlap))
    text_chunks: List[str] = splitter.split_text(big_text)

    # Map each chunk text back to row indices by approximate substring search
    results: List[Dict[str, Any]] = []
    search_from = 0
    for chunk_text in text_chunks:
        try:
            start_idx = big_text.find(chunk_text, search_from)
            if start_idx == -1:
                # fallback: search from beginning
                start_idx = big_text.find(chunk_text)
            end_idx = start_idx + len(chunk_text) if start_idx >= 0 else 0
            covered_rows: List[int] = []
            if start_idx >= 0:
                for (s, e, ri) in spans:
                    if not (e <= start_idx or s >= end_idx):
                        covered_rows.append(ri)
            results.append({
                'text': chunk_text,
                'row_indices': covered_rows
            })
            # advance search position allowing small overlap tolerance
            search_from = max(end_idx - int(overlap), 0)
        except Exception:
            results.append({'text': chunk_text, 'row_indices': []})

    return results


class FixedSizeChunker(BaseChunker):
    """Fixed-size chunking for CSV data"""
    
    def __init__(self):
        super().__init__("fixed_size")
    
    def chunk(self, dataframe: pd.DataFrame, chunk_size: int = 100, overlap: int = 0, 
              preserve_headers: bool = True, **kwargs) -> ChunkingResult:
        """
        Chunk dataframe using fixed-size approach
        
        Args:
            dataframe: Input DataFrame
            chunk_size: Number of rows per chunk
            overlap: Number of overlapping rows between chunks
            preserve_headers: Whether to include headers in each chunk
        """
        self.validate_input(dataframe)
        
        chunks = []
        metadata_list = []
        
        # Create chunks with overlap
        start_idx = 0
        chunk_index = 0
        
        while start_idx < len(dataframe):
            # Calculate end index with overlap consideration
            end_idx = min(start_idx + chunk_size, len(dataframe))
            
            # Create chunk
            chunk_df = dataframe.iloc[start_idx:end_idx].copy()
            
            # Add headers if requested
            if preserve_headers and not chunk_df.empty:
                # Add a header row at the beginning
                header_row = pd.DataFrame([chunk_df.columns], columns=chunk_df.columns)
                chunk_df = pd.concat([header_row, chunk_df], ignore_index=True)
            
            chunks.append(chunk_df)
            
            # Create metadata
            metadata = self.create_chunk_metadata(
                chunk=chunk_df,
                chunk_index=chunk_index,
                start_idx=start_idx,
                end_idx=end_idx - 1,
                original_df=dataframe,
                extra_metadata={
                    'chunking_method': 'fixed_size',
                    'chunk_size': chunk_size,
                    'overlap': overlap,
                    'preserve_headers': preserve_headers,
                    'actual_chunk_size': len(chunk_df)
                }
            )
            metadata_list.append(metadata)
            
            chunk_index += 1
            
            # Move to next chunk with overlap
            if end_idx >= len(dataframe):
                break
            start_idx = end_idx - overlap
        
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


def chunk_fixed(dataframe: pd.DataFrame, chunk_size: int = 100, overlap: int = 0, 
                preserve_headers: bool = True) -> ChunkingResult:
    """
    Convenience function for fixed-size chunking
    
    Args:
        dataframe: Input DataFrame
        chunk_size: Number of rows per chunk
        overlap: Number of overlapping rows between chunks
        preserve_headers: Whether to include headers in each chunk
        
    Returns:
        ChunkingResult with chunks and metadata
    """
    chunker = FixedSizeChunker()
    return chunker.chunk(dataframe, chunk_size, overlap, preserve_headers)