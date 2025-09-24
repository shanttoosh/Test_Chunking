from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import pandas as pd
import numpy as np

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

class BaseChunker:
    """Base class for all chunkers"""
    
    def __init__(self):
        self.chunk_counter = 0
    
    def chunk(self, dataframe: pd.DataFrame, **kwargs) -> ChunkingResult:
        """Base chunking method - to be overridden by subclasses"""
        raise NotImplementedError("Subclasses must implement chunk method")
    
    def _generate_chunk_id(self, method: str) -> str:
        """Generate unique chunk ID"""
        chunk_id = f"{method}_chunk_{self.chunk_counter:04d}"
        self.chunk_counter += 1
        return chunk_id
    
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
            "note": f"Chunking completed with {len(chunks)} chunks"
        }
