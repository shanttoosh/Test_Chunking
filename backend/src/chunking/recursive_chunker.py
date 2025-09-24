from typing import List, Dict, Optional
import pandas as pd
import numpy as np
from .base_chunker import BaseChunker, ChunkingResult, ChunkMetadata

class RecursiveChunker(BaseChunker):
    """Recursive hierarchical and text-driven chunking for CSV data"""
    
    def __init__(self):
        super().__init__("recursive")
    
    def chunk(
        self,
        dataframe: pd.DataFrame,
        group_by_columns: Optional[List[str]] = None,
        rows_per_chunk: int = 100,
        preserve_hierarchy: bool = True,
        mode: str = "semantic_text_recursive",
        text_chunk_chars: int = 5000,
        overlap_chars: int = 500,
        use_semantic_compression: bool = True,
        **kwargs
    ) -> ChunkingResult:
        """
        Chunk dataframe using semantic text-recursive strategy only.

        Note: Hierarchical and plain text-recursive modes have been removed.
        The method will always perform semantic text-recursive chunking.
        """
        self.validate_input(dataframe)

        return self._text_recursive_chunking(
            dataframe=dataframe,
            text_chunk_chars=text_chunk_chars,
            overlap_chars=overlap_chars,
            use_semantic_compression=True,
        )

    # ========= Semantic text-driven recursive-style chunking =========
    def _text_recursive_chunking(
        self,
        dataframe: pd.DataFrame,
        text_chunk_chars: int,
        overlap_chars: int,
        use_semantic_compression: bool
    ) -> ChunkingResult:
        # Build one line of text per row (semantic compression optionally applied)
        lines: List[str] = []
        for _, row in dataframe.iterrows():
            if use_semantic_compression:
                line = self._semantic_compress_row(row)
            else:
                # Column: value, comma-separated
                parts = [f"{col}: {row[col]}" for col in dataframe.columns]
                line = ", ".join(parts)
            lines.append(str(line))
        if not lines:
            return ChunkingResult(chunks=[dataframe.copy()], metadata=[], method=self.name, total_chunks=1, quality_report={})

        avg_len = max(1, int(round(np.mean([len(x) for x in lines]))))
        overlap_lines = max(0, int(round(overlap_chars / avg_len)))

        # Accumulate lines to target character size per chunk
        chunks: List[pd.DataFrame] = []
        metadata_list: List[ChunkMetadata] = []
        start_idx = 0
        chunk_idx = 0
        while start_idx < len(lines):
            current_len = 0
            end_idx = start_idx
            while end_idx < len(lines) and current_len < text_chunk_chars:
                current_len += len(lines[end_idx]) + 1  # +1 for newline
                end_idx += 1
            # Map back to dataframe rows [start_idx:end_idx)
            chunk_df = dataframe.iloc[start_idx:end_idx].copy()
            if not chunk_df.empty:
                chunks.append(chunk_df)
                # Use a semantic-specific split_method label when semantic compression is enabled
                split_method = 'semantic_text_recursive' if use_semantic_compression else 'text_recursive'
                metadata = self.create_chunk_metadata(
                    chunk=chunk_df,
                    chunk_index=chunk_idx,
                    start_idx=chunk_df.index[0],
                    end_idx=chunk_df.index[-1],
                    original_df=dataframe,
                    extra_metadata={
                        'split_method': split_method,
                        'use_semantic_compression': use_semantic_compression,
                        'target_chars': text_chunk_chars,
                        'overlap_chars': overlap_chars,
                        'avg_line_len': avg_len
                    }
                )
                metadata_list.append(metadata)
                chunk_idx += 1
            # Advance with overlap in lines
            if end_idx >= len(lines):
                break
            start_idx = max(start_idx + (end_idx - start_idx) - overlap_lines, start_idx + 1)

        # Quality assessment
        from .base_chunker import ChunkingQualityAssessment
        quality_report = ChunkingQualityAssessment.comprehensive_assessment(chunks, dataframe)
        
        # Use a semantic-specific method label when semantic compression is enabled
        method_label = f"{self.name}_semantic_text_recursive" if use_semantic_compression else f"{self.name}_text_recursive"
        return ChunkingResult(
            chunks=chunks,
            metadata=metadata_list,
            method=method_label,
            total_chunks=len(chunks),
            quality_report=quality_report
        )

    def _semantic_compress_row(self, row: pd.Series) -> str:
        # Try to find common fields, else generic sentence
        description = str(row.get("Description", "item")) if hasattr(row, 'get') else "item"
        country = str(row.get("Country", "Unknown")) if hasattr(row, 'get') else "Unknown"
        date = str(row.get("InvoiceDate", "")) if hasattr(row, 'get') else ""
        qty = str(row.get("Quantity", "")) if hasattr(row, 'get') else ""
        price = str(row.get("UnitPrice", "")) if hasattr(row, 'get') else ""
        if any([description != "item", country != "Unknown", date, qty, price]):
            return f"{description} sold in {country} on {date}, quantity {qty}, priced at ${price}."
        # fallback: combine short version of the row
        return ", ".join([f"{c}: {row[c]}" for c in row.index])

    # Note: hierarchical utilities removed


def chunk_recursive(
    dataframe: pd.DataFrame,
    group_by_columns: Optional[List[str]] = None,
    rows_per_chunk: int = 100,
    preserve_hierarchy: bool = True,
    mode: str = "semantic_text_recursive",
    text_chunk_chars: int = 5000,
    overlap_chars: int = 500,
    use_semantic_compression: bool = True
) -> ChunkingResult:
    """
    Convenience function for recursive chunking (semantic text-recursive only).
    """
    chunker = RecursiveChunker()
    return chunker.chunk(
        dataframe=dataframe,
        group_by_columns=group_by_columns,
        rows_per_chunk=rows_per_chunk,
        preserve_hierarchy=preserve_hierarchy,
        mode=mode,
        text_chunk_chars=text_chunk_chars,
        overlap_chars=overlap_chars,
        use_semantic_compression=True,
    )

