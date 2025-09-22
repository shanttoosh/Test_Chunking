# Enhanced CSV Document Chunking with Long Text Fields and Metadata Preservation
# This is a demo version that creates sample data instead of requiring file upload

import pandas as pd
import numpy as np
import re
import json
from typing import List, Dict, Any, Tuple

# Text splitting utilities
def split_text_by_sentences(text: str, max_chunk_size: int = 500) -> List[str]:
    """Split text by sentences while respecting chunk size limits"""
    sentences = re.split(r'[.!?]+', text)
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        # If adding this sentence would exceed limit, save current chunk
        if len(current_chunk) + len(sentence) > max_chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = sentence
        else:
            current_chunk += " " + sentence if current_chunk else sentence
    
    # Add the last chunk
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

def split_text_by_words(text: str, max_chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text by words with overlap"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), max_chunk_size - overlap):
        chunk_words = words[i:i + max_chunk_size]
        chunk = " ".join(chunk_words)
        chunks.append(chunk)
    
    return chunks

def detect_text_columns(df: pd.DataFrame) -> List[str]:
    """Detect columns that contain long text data"""
    text_columns = []
    for col in df.columns:
        if df[col].dtype == 'object':  # String columns
            # Check if any value is longer than 200 characters
            max_length = df[col].astype(str).str.len().max()
            if max_length > 200:
                text_columns.append(col)
    return text_columns

def create_enhanced_csv_chunks(df: pd.DataFrame, 
                             max_chunk_size: int = 500,
                             overlap: int = 50,
                             chunking_strategy: str = 'semantic') -> List[Dict[str, Any]]:
    """
    Enhanced CSV chunking with proper text splitting and metadata preservation
    
    Args:
        df: Input DataFrame
        max_chunk_size: Maximum characters per chunk
        overlap: Overlap between chunks
        chunking_strategy: 'semantic', 'sentence', or 'word'
    
    Returns:
        List of chunk dictionaries with text and metadata
    """
    chunks = []
    text_columns = detect_text_columns(df)
    
    print(f"Detected {len(text_columns)} text columns: {text_columns}")
    
    for idx, row in df.iterrows():
        # Create base metadata
        base_metadata = {
            'row_id': idx,
            'source_file': 'uploaded_csv',
            'total_columns': len(df.columns),
            'chunk_type': 'csv_row',
            'original_row_data': row.to_dict()
        }
        
        # Check if row has long text fields
        has_long_text = any(
            pd.notna(row[col]) and len(str(row[col])) > max_chunk_size 
            for col in text_columns
        )
        
        if has_long_text:
            # Handle long text fields
            for col in text_columns:
                if pd.notna(row[col]) and len(str(row[col])) > max_chunk_size:
                    long_text = str(row[col])
                    
                    # Split long text based on strategy
                    if chunking_strategy == 'sentence':
                        text_chunks = split_text_by_sentences(long_text, max_chunk_size)
                    elif chunking_strategy == 'word':
                        text_chunks = split_text_by_words(long_text, max_chunk_size, overlap)
                    else:  # semantic
                        text_chunks = split_text_by_sentences(long_text, max_chunk_size)
                    
                    # Create chunks for each text piece
                    for chunk_idx, text_chunk in enumerate(text_chunks):
                        # Create chunk text with context
                        chunk_text = f"column: {col} content: {text_chunk}"
                        
                        # Add other row data as context
                        for other_col, other_val in row.items():
                            if other_col != col and pd.notna(other_val):
                                chunk_text += f" {other_col}: {other_val}"
                        
                        # Enhanced metadata
                        chunk_metadata = {
                            **base_metadata,
                            'chunk_index': chunk_idx,
                            'total_chunks': len(text_chunks),
                            'source_column': col,
                            'chunk_size': len(text_chunk),
                            'is_long_text_chunk': True,
                            'chunking_strategy': chunking_strategy
                        }
                        
                        chunks.append({
                            'text': chunk_text,
                            'metadata': chunk_metadata,
                            'embedding_ready': True
                        })
        else:
            # Handle regular rows (no long text)
            row_text = " ".join([
                f"{col}: {val}" for col, val in row.items() 
                if pd.notna(val)
            ])
            
            # Enhanced metadata for regular chunks
            chunk_metadata = {
                **base_metadata,
                'chunk_index': 0,
                'total_chunks': 1,
                'chunk_size': len(row_text),
                'is_long_text_chunk': False,
                'chunking_strategy': 'row_based'
            }
            
            chunks.append({
                'text': row_text,
                'metadata': chunk_metadata,
                'embedding_ready': True
            })
    
    return chunks

# Create sample CSV data for demonstration
print("Creating sample CSV data for demonstration...")
print("=" * 60)

# Sample data with mixed content types
sample_data = {
    'product_id': [1, 2, 3, 4, 5],
    'product_name': [
        'Kitchen Knife Set',
        'Gaming Mouse Pro',
        'Blender Deluxe',
        'Smartphone Case',
        'Coffee Maker'
    ],
    'price': [29.99, 79.99, 149.99, 19.99, 89.99],
    'category': [
        'Kitchen',
        'Electronics',
        'Kitchen',
        'Electronics',
        'Kitchen'
    ],
    'description': [
        'Sharp stainless steel knife set with wooden handles. Perfect for professional cooking and home use. Includes 6 different knives for various cutting tasks.',
        'High-performance gaming mouse with RGB lighting and 12000 DPI sensor. Features programmable buttons and ergonomic design for extended gaming sessions.',
        'This is a very long product description that will be split into multiple chunks. The blender features a powerful 1000W motor that can handle ice, frozen fruits, and vegetables with ease. It comes with multiple speed settings and a large capacity pitcher. The stainless steel blades are designed to last and provide smooth blending results. Perfect for making smoothies, soups, and other blended beverages. The blender also includes a travel cup for on-the-go convenience. Easy to clean with dishwasher-safe components.',
        'Protective case for smartphones with shock-absorbing technology.',
        'Automatic coffee maker with programmable timer and thermal carafe.'
    ],
    'in_stock': [True, True, False, True, True]
}

# Create DataFrame
df = pd.DataFrame(sample_data)
print(f"Created sample DataFrame with {len(df)} rows and {len(df.columns)} columns")
print("\nSample data:")
print(df.to_string(index=False))

# Create enhanced chunks
print("\n" + "=" * 60)
print("CREATING ENHANCED CHUNKS")
print("=" * 60)

chunks = create_enhanced_csv_chunks(
    df, 
    max_chunk_size=200,  # Smaller size for demo
    overlap=30, 
    chunking_strategy='semantic'
)

print(f"Created {len(chunks)} chunks from {len(df)} rows")

# Display chunk statistics
chunk_stats = {
    'total_chunks': len(chunks),
    'long_text_chunks': sum(1 for chunk in chunks if chunk['metadata']['is_long_text_chunk']),
    'regular_chunks': sum(1 for chunk in chunks if not chunk['metadata']['is_long_text_chunk']),
    'avg_chunk_size': sum(len(chunk['text']) for chunk in chunks) / len(chunks)
}

print(f"\nChunk Statistics:")
for key, value in chunk_stats.items():
    print(f"  {key}: {value}")

# Display sample chunks
print("\n" + "=" * 60)
print("SAMPLE CHUNKS")
print("=" * 60)

for i, chunk in enumerate(chunks[:3]):  # Show first 3 chunks
    print(f"\nChunk {i+1}:")
    print(f"Text: {chunk['text'][:150]}...")
    print(f"Metadata: {json.dumps(chunk['metadata'], indent=2)}")
    print("-" * 40)

# Simulate embedding generation (without actual model)
print("\n" + "=" * 60)
print("SIMULATING EMBEDDING GENERATION")
print("=" * 60)

texts = [chunk['text'] for chunk in chunks]
print(f"Prepared {len(texts)} texts for embedding generation")
print(f"Average text length: {sum(len(text) for text in texts) / len(texts):.1f} characters")

# Simulate FAISS index creation
print("\nSimulating FAISS index creation...")
print(f"Would create index with {len(texts)} vectors of dimension 384")

# Save chunk metadata to file
with open("chunk_metadata_demo.json", "w") as f:
    json.dump([chunk['metadata'] for chunk in chunks], f, indent=2)

print(f"Saved chunk metadata to chunk_metadata_demo.json")

# Enhanced search function simulation
def simulate_enhanced_search(query: str, k: int = 3) -> List[Dict]:
    """Simulate enhanced search with metadata filtering and detailed results"""
    # Simulate search results based on keyword matching
    results = []
    query_lower = query.lower()
    
    for i, chunk in enumerate(chunks):
        text_lower = chunk['text'].lower()
        if any(word in text_lower for word in query_lower.split()):
            # Simulate distance score (lower is better)
            distance = np.random.uniform(0.1, 0.9)
            result = {
                'content': chunk['text'],
                'distance': distance,
                'metadata': chunk['metadata'],
                'relevance_score': 1 - distance,
                'chunk_type': chunk['metadata']['chunk_type'],
                'source_info': {
                    'row_id': chunk['metadata']['row_id'],
                    'column': chunk['metadata'].get('source_column', 'multiple'),
                    'is_long_text': chunk['metadata']['is_long_text_chunk']
                }
            }
            results.append(result)
    
    # Sort by relevance score and return top k
    results.sort(key=lambda x: x['relevance_score'], reverse=True)
    return results[:k]

# Test enhanced search
print("\n" + "=" * 60)
print("TESTING ENHANCED SEARCH")
print("=" * 60)

query = "kitchen products"
results = simulate_enhanced_search(query, k=3)

print(f"Search Results for: '{query}'")
print("=" * 50)

for i, result in enumerate(results):
    print(f"\nResult {i+1}:")
    print(f"Content: {result['content'][:200]}...")
    print(f"Relevance Score: {result['relevance_score']:.4f}")
    print(f"Chunk Type: {result['chunk_type']}")
    print(f"Source: Row {result['source_info']['row_id']}, Column: {result['source_info']['column']}")
    print(f"Is Long Text: {result['source_info']['is_long_text']}")
    print("-" * 30)

# Test search with long text
print("\n" + "=" * 60)
print("TESTING SEARCH WITH LONG TEXT")
print("=" * 60)

query2 = "blender motor"
results2 = simulate_enhanced_search(query2, k=2)

print(f"Search Results for: '{query2}'")
print("=" * 50)

for i, result in enumerate(results2):
    print(f"\nResult {i+1}:")
    print(f"Content: {result['content'][:300]}...")
    print(f"Relevance Score: {result['relevance_score']:.4f}")
    print(f"Is Long Text Chunk: {result['source_info']['is_long_text']}")
    print("-" * 30)

print("\n" + "=" * 60)
print("DEMO COMPLETED SUCCESSFULLY!")
print("=" * 60)
print("Key Features Demonstrated:")
print("✓ Long text detection and splitting")
print("✓ Metadata preservation")
print("✓ Multiple chunking strategies")
print("✓ Enhanced search with filtering")
print("✓ Chunk statistics and monitoring")
print("✓ JSON metadata export")
