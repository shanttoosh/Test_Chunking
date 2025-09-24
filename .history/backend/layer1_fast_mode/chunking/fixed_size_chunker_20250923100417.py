import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ChunkMetadata:
    """Metadata for a single chunk"""
    chunk_id: str
    method: str
    chunk_size: int
    start_index: int
    end_index: int
    overlap: Optional[int] = None
    quality_score: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class ChunkingResult:
    """Result of chunking operation"""
    chunks: List[pd.DataFrame]
    metadata: List[ChunkMetadata]
    method: str
    total_chunks: int
    quality_report: Dict[str, Any]

class FixedSizeChunker:
    """Fixed-size chunking implementation"""
    
    def __init__(self):
        self.chunk_counter = 0
    
    def chunk(self, dataframe: pd.DataFrame, chunk_size: int = 100, 
              overlap: int = 0) -> ChunkingResult:
        """
        Chunk DataFrame into fixed-size chunks
        
        Args:
            dataframe: Input DataFrame
            chunk_size: Number of rows per chunk
            overlap: Number of overlapping rows between chunks
            
        Returns:
            ChunkingResult with chunks and metadata
        """
        try:
            if dataframe.empty:
                return ChunkingResult(
                    chunks=[],
                    metadata=[],
                    method="fixed_size",
                    total_chunks=0,
                    quality_report={"overall_quality": "EMPTY", "note": "Empty DataFrame"}
                )
            
            chunks = []
            metadata = []
            
            total_rows = len(dataframe)
            step_size = chunk_size - overlap
            
            for start_idx in range(0, total_rows, step_size):
                end_idx = min(start_idx + chunk_size, total_rows)
                
                # Create chunk
                chunk_df = dataframe.iloc[start_idx:end_idx].copy()
                chunks.append(chunk_df)
                
                # Create metadata
                chunk_id = f"chunk_{self.chunk_counter:04d}"
                chunk_meta = ChunkMetadata(
                    chunk_id=chunk_id,
                    method="fixed_size",
                    chunk_size=len(chunk_df),
                    start_index=start_idx,
                    end_index=end_idx,
                    overlap=overlap,
                    quality_score=self._calculate_quality_score(chunk_df),
                    metadata={
                        "created_at": datetime.now().isoformat(),
                        "source_rows": f"{start_idx}-{end_idx}",
                        "has_data": not chunk_df.empty
                    }
                )
                metadata.append(chunk_meta)
                self.chunk_counter += 1
            
            # Generate quality report
            quality_report = self._generate_quality_report(chunks, metadata)
            
            return ChunkingResult(
                chunks=chunks,
                metadata=metadata,
                method="fixed_size",
                total_chunks=len(chunks),
                quality_report=quality_report
            )
            
        except Exception as e:
            return ChunkingResult(
                chunks=[],
                metadata=[],
                method="fixed_size",
                total_chunks=0,
                quality_report={"overall_quality": "ERROR", "error": str(e)}
            )
    
    def _calculate_quality_score(self, chunk_df: pd.DataFrame) -> float:
        """Calculate quality score for a chunk"""
        if chunk_df.empty:
            return 0.0
        
        # Base score
        score = 1.0
        
        # Penalize for high null ratio
        null_ratio = chunk_df.isnull().sum().sum() / (len(chunk_df) * len(chunk_df.columns))
        score -= null_ratio * 0.3
        
        # Penalize for very small chunks
        if len(chunk_df) < 5:
            score -= 0.2
        
        # Bonus for good data distribution
        if len(chunk_df) >= 10:
            score += 0.1
        
        return max(0.0, min(1.0, score))
    
    def _generate_quality_report(self, chunks: List[pd.DataFrame], 
                                metadata: List[ChunkMetadata]) -> Dict[str, Any]:
        """Generate overall quality report"""
        if not chunks:
            return {"overall_quality": "EMPTY", "note": "No chunks created"}
        
        chunk_sizes = [len(chunk) for chunk in chunks]
        quality_scores = [meta.quality_score for meta in metadata if meta.quality_score is not None]
        
        avg_quality = np.mean(quality_scores) if quality_scores else 0.0
        size_variance = np.var(chunk_sizes) if len(chunk_sizes) > 1 else 0.0
        
        # Determine overall quality
        if avg_quality >= 0.8 and size_variance < 100:
            overall_quality = "EXCELLENT"
        elif avg_quality >= 0.6 and size_variance < 500:
            overall_quality = "GOOD"
        elif avg_quality >= 0.4:
            overall_quality = "FAIR"
        else:
            overall_quality = "POOR"
        
        return {
            "overall_quality": overall_quality,
            "average_quality_score": round(avg_quality, 3),
            "size_variance": round(size_variance, 2),
            "total_chunks": len(chunks),
            "avg_chunk_size": round(np.mean(chunk_sizes), 2),
            "min_chunk_size": min(chunk_sizes),
            "max_chunk_size": max(chunk_sizes),
            "empty_chunks": sum(1 for chunk in chunks if chunk.empty),
            "note": f"Fixed-size chunking with {len(chunks)} chunks"
        }
