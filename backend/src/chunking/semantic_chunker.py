# Optimized Semantic Chunking with robust fallbacks
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import time
import os

# Try to import LangChain components with fallbacks
try:
    from langchain_experimental.text_splitter import SemanticChunker
    from langchain.embeddings import HuggingFaceEmbeddings
    from langchain_core.documents import Document
    LANGCHAIN_AVAILABLE = True
except ImportError:
    try:
        from langchain.text_splitter import SemanticChunker
        from langchain.embeddings import HuggingFaceEmbeddings
        from langchain.schema import Document
        LANGCHAIN_AVAILABLE = True
    except ImportError:
        LANGCHAIN_AVAILABLE = False
        # Create fallback Document class
        class Document:
            def __init__(self, page_content: str, metadata: Dict[str, Any] = None):
                self.page_content = page_content
                self.metadata = metadata or {}

# Try to import sentence transformers for fallback
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

class OptimizedSemanticChunker:
    """Optimized semantic chunker with multiple fallback strategies"""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", batch_size: int = 100):
        self.model_name = model_name
        self.batch_size = batch_size
        self.embedder = None
        self._initialize_embedder()
    
    def _initialize_embedder(self):
        """Initialize the best available embedding model"""
        if LANGCHAIN_AVAILABLE:
            try:
                self.embedder = HuggingFaceEmbeddings(
                    model_name=self.model_name,
                    model_kwargs={'device': 'cpu'},  # Force CPU for stability
                    encode_kwargs={'normalize_embeddings': True}
                )
                print(f"✓ Using LangChain HuggingFaceEmbeddings: {self.model_name}")
                return
            except Exception as e:
                print(f"⚠ LangChain HuggingFaceEmbeddings failed: {e}")
        
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                self.embedder = SentenceTransformer(self.model_name)
                print(f"✓ Using SentenceTransformer: {self.model_name}")
                return
            except Exception as e:
                print(f"⚠ SentenceTransformer failed: {e}")
        
        print("⚠ No embedding model available, using text-based fallback")
        self.embedder = None
    
    def _compute_similarities(self, texts: List[str]) -> np.ndarray:
        """Compute similarity matrix between consecutive texts"""
        if self.embedder is None:
            # Text-based similarity fallback
            return self._text_based_similarity(texts)
        
        try:
            if hasattr(self.embedder, 'embed_documents'):
                # LangChain HuggingFaceEmbeddings
                embeddings = self.embedder.embed_documents(texts)
            else:
                # SentenceTransformer
                embeddings = self.embedder.encode(texts)
            
            # Compute cosine similarities
            similarities = []
            for i in range(len(embeddings) - 1):
                emb1 = np.array(embeddings[i])
                emb2 = np.array(embeddings[i + 1])
                
                # Cosine similarity
                dot_product = np.dot(emb1, emb2)
                norm1 = np.linalg.norm(emb1)
                norm2 = np.linalg.norm(emb2)
                
                if norm1 > 0 and norm2 > 0:
                    similarity = dot_product / (norm1 * norm2)
                else:
                    similarity = 0.0
                
                similarities.append(similarity)
            
            return np.array(similarities)
        
        except Exception as e:
            print(f"⚠ Embedding computation failed: {e}, using text-based fallback")
            return self._text_based_similarity(texts)
    
    def _text_based_similarity(self, texts: List[str]) -> np.ndarray:
        """Fallback text-based similarity using word overlap"""
        similarities = []
        for i in range(len(texts) - 1):
            text1 = texts[i].lower().split()
            text2 = texts[i + 1].lower().split()
            
            if not text1 or not text2:
                similarities.append(0.0)
                continue
            
            # Jaccard similarity
            set1 = set(text1)
            set2 = set(text2)
            intersection = len(set1.intersection(set2))
            union = len(set1.union(set2))
            
            similarity = intersection / union if union > 0 else 0.0
            similarities.append(similarity)
        
        return np.array(similarities)
    
    def chunk_texts(self, texts: List[str], threshold: float = 0.7) -> List[Document]:
        """Chunk texts based on semantic similarity"""
        if len(texts) <= 1:
            return [Document(page_content=texts[0])] if texts else []
        
        print(f"Computing similarities for {len(texts)} texts...")
        similarities = self._compute_similarities(texts)
        
        # Find breakpoints where similarity drops below threshold
        breakpoints = np.where(similarities < threshold)[0]
        
        # Create chunks
        chunks = []
        start_idx = 0
        
        for breakpoint in breakpoints:
            end_idx = breakpoint + 1
            chunk_text = "\n".join(texts[start_idx:end_idx])
            chunks.append(Document(page_content=chunk_text))
            start_idx = end_idx
        
        # Add final chunk
        if start_idx < len(texts):
            chunk_text = "\n".join(texts[start_idx:])
            chunks.append(Document(page_content=chunk_text))
        
        return chunks

def semantic_chunking_csv(file_path: str, batch_size: int = 100, use_fast_model: bool = True, 
                        similarity_threshold: float = 0.7) -> List[Document]:
    """
    Highly optimized semantic chunking for CSV files
    
    Args:
        file_path: Path to CSV file
        batch_size: Number of rows to process in each batch
        use_fast_model: Use faster embedding model
        similarity_threshold: Threshold for semantic similarity (0.0-1.0)
    """
    print(f"🚀 Starting optimized semantic chunking...")
    start_time = time.time()
    
    # Load CSV efficiently
    try:
        df = pd.read_csv(file_path)
        print(f"✓ Loaded CSV with {len(df)} rows and {len(df.columns)} columns")
    except Exception as e:
        raise RuntimeError(f"Failed to load CSV: {e}")
    
    # Prepare texts efficiently
    print("📝 Preparing texts for semantic analysis...")
    texts = []
    
    # Convert each row to a meaningful text representation
    for idx, row in df.iterrows():
        # Create a text representation of the row
        row_text_parts = []
        for col, value in row.items():
            if pd.notna(value):
                row_text_parts.append(f"{col}: {str(value)}")
        
        row_text = " | ".join(row_text_parts)
        
        # Truncate very long rows to improve performance
        if len(row_text) > 500:
            row_text = row_text[:500] + "..."
        
        texts.append(row_text)
    
    print(f"✓ Prepared {len(texts)} text representations")
    
    # Initialize chunker
    model_name = "all-MiniLM-L6-v2" if use_fast_model else "BAAI/bge-base-en-v1.5"
    chunker = OptimizedSemanticChunker(model_name=model_name, batch_size=batch_size)
    
    # Process in batches for large datasets
    all_chunks = []
    total_batches = (len(texts) + batch_size - 1) // batch_size
    
    print(f"🔄 Processing {total_batches} batches...")
    
    for batch_idx in range(0, len(texts), batch_size):
        batch_texts = texts[batch_idx:batch_idx + batch_size]
        batch_num = batch_idx // batch_size + 1
        
        print(f"  Processing batch {batch_num}/{total_batches} ({len(batch_texts)} texts)")
        
        # Chunk this batch
        batch_chunks = chunker.chunk_texts(batch_texts, threshold=similarity_threshold)
        all_chunks.extend(batch_chunks)
        
        # Progress update
        if batch_num % 5 == 0 or batch_num == total_batches:
            print(f"  ✓ Completed {batch_num}/{total_batches} batches")
    
    # Post-process chunks
    print("🔧 Post-processing chunks...")
    final_chunks = []
    
    for i, chunk in enumerate(all_chunks):
        # Clean up chunk content
        content = chunk.page_content.strip()
        if content:  # Only keep non-empty chunks
            final_chunks.append(Document(
                page_content=content,
                metadata={"chunk_id": f"semantic_chunk_{i:04d}", "batch_processed": True}
            ))
    
    # Statistics
    total_time = time.time() - start_time
    chunk_lengths = [len(chunk.page_content) for chunk in final_chunks]
    
    print(f"\n✅ Semantic chunking completed!")
    print(f"📊 Statistics:")
    print(f"   • Total chunks: {len(final_chunks)}")
    print(f"   • Processing time: {total_time:.2f}s")
    print(f"   • Processing rate: {len(df)/total_time:.1f} rows/second")
    print(f"   • Avg chunk length: {np.mean(chunk_lengths):.0f} chars")
    print(f"   • Min chunk length: {min(chunk_lengths) if chunk_lengths else 0} chars")
    print(f"   • Max chunk length: {max(chunk_lengths) if chunk_lengths else 0} chars")
    
    # Preview first few chunks
    print(f"\n📋 Chunk previews:")
    for i, chunk in enumerate(final_chunks[:3]):
        preview = chunk.page_content[:200] + "..." if len(chunk.page_content) > 200 else chunk.page_content
        print(f"   Chunk {i+1}: {preview}")
    
    return final_chunks


def semantic_chunking_with_spans(df: pd.DataFrame, batch_size: int = 100,
                                use_fast_model: bool = True, similarity_threshold: float = 0.7) -> List[Dict[str, Any]]:
    """
    Chunk a DataFrame semantically and return {'text': chunk_text, 'row_indices': [..]} per chunk.
    Uses the same row text representation as semantic_chunking_csv and maps back by substring.
    """
    if df is None or df.empty:
        return []

    # Prepare row-level texts similar to semantic_chunking_csv
    row_lines: List[str] = []
    for _, row in df.iterrows():
        parts = []
        for col, value in row.items():
            if pd.notna(value):
                parts.append(f"{col}: {str(value)}")
        line = " | ".join(parts)
        if len(line) > 500:
            line = line[:500] + "..."
        row_lines.append(line)

    # Build big text and row spans
    big_text = "\n".join(row_lines)
    spans: List[Tuple[int, int, int]] = []
    pos = 0
    for idx, line in enumerate(row_lines):
        start = pos
        end = start + len(line)
        spans.append((start, end, idx))
        pos = end + 1

    # Run semantic chunking on row_lines
    model_name = "all-MiniLM-L6-v2" if use_fast_model else "BAAI/bge-base-en-v1.5"
    chunker = OptimizedSemanticChunker(model_name=model_name, batch_size=batch_size)
    docs = chunker.chunk_texts(row_lines, threshold=similarity_threshold)

    # Map each chunk back to row indices
    results: List[Dict[str, Any]] = []
    search_from = 0
    for doc in docs:
        text = doc.page_content or ""
        start_idx = big_text.find(text, search_from)
        if start_idx == -1:
            start_idx = big_text.find(text)
        end_idx = start_idx + len(text) if start_idx >= 0 else 0
        covered_rows: List[int] = []
        if start_idx >= 0:
            for (s, e, ri) in spans:
                if not (e <= start_idx or s >= end_idx):
                    covered_rows.append(ri)
        results.append({'text': text, 'row_indices': covered_rows})
        search_from = max(end_idx - 100, 0)

    return results