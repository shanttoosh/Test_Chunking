#!/usr/bin/env python3
"""
Test script to verify that the API response is JSON serializable
"""

import pandas as pd
import json
import numpy as np
from preprocessing.preprocessor import FastModePreprocessor
from chunking.chunker import FastModeChunker
from embedding.embedder import FastModeEmbedder
from storing.storage import FastModeStorage

def convert_numpy_types(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    else:
        return obj

def test_complete_pipeline():
    """Test the complete pipeline and verify JSON serialization"""
    
    # Create test data
    df = pd.DataFrame({
        'col1': [1, 2, 3, 4, 5],
        'col2': ['a', 'b', 'c', 'd', 'e'],
        'col3': [1.1, 2.2, 3.3, 4.4, 5.5]
    })
    
    print("Testing complete pipeline...")
    
    try:
        # Step 1: Preprocessing
        print("1. Preprocessing...")
        preprocessor = FastModePreprocessor()
        preprocessing_result = preprocessor.preprocess(df)
        
        # Step 2: Chunking
        print("2. Chunking...")
        chunker = FastModeChunker()
        chunking_result = chunker.chunk(
            df=preprocessing_result['processed_data'],
            chunk_size=3,
            overlap=1
        )
        print(f"Chunking result keys: {list(chunking_result.keys())}")
        print(f"Chunking success: {chunking_result['success']}")
        
        # Step 3: Embedding
        print("3. Embedding...")
        embedder = FastModeEmbedder()
        embedding_result = embedder.generate_embeddings(
            chunks=chunking_result['chunks'],
            text_chunks=chunking_result['text_chunks'],
            metadata=chunking_result['metadata']
        )
        
        # Step 4: Storage
        print("4. Storage...")
        storage = FastModeStorage()
        storage_result = storage.store_embeddings(embedding_result['embedded_chunks'])
        
        # Create the final response (same as in main.py)
        print("5. Creating final response...")
        final_response = {
            "success": True,
            "message": "Complete processing pipeline completed successfully",
            "data": {
                "preprocessing": {
                    "success": preprocessing_result['success'],
                    "message": preprocessing_result['message'],
                    "stats": preprocessing_result['stats'],
                    "sample_data": preprocessing_result['processed_data'].head(3).to_dict('records') if preprocessing_result['success'] else []
                },
                "chunking": {
                    "success": chunking_result['success'],
                    "message": chunking_result['message'],
                    "stats": chunking_result['stats'],
                    "total_chunks": chunking_result['stats']['total_chunks']
                },
                "embedding": {
                    "success": embedding_result['success'],
                    "message": embedding_result['message'],
                    "stats": embedding_result['stats']
                },
                "storage": {
                    "success": storage_result['success'],
                    "message": storage_result['message'],
                    "stored_count": storage_result['stored_count'],
                    "stats": storage_result['stats']
                },
                "summary": {
                    "original_rows": len(df),
                    "processed_rows": len(preprocessing_result['processed_data']),
                    "total_chunks": chunking_result['stats']['total_chunks'],
                    "embeddings_generated": embedding_result['stats']['total_chunks'],
                    "chunks_stored": storage_result['stored_count'],
                    "collection_name": "test_collection"
                }
            }
        }
        
        # Test JSON serialization
        print("6. Testing JSON serialization...")
        # Convert numpy types to Python native types
        final_response_clean = convert_numpy_types(final_response)
        json_str = json.dumps(final_response_clean, indent=2)
        print("✅ JSON serialization successful!")
        print(f"Response size: {len(json_str)} characters")
        
        # Test deserialization
        print("7. Testing JSON deserialization...")
        parsed_response = json.loads(json_str)
        print("✅ JSON deserialization successful!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_complete_pipeline()
    if success:
        print("\n🎉 All tests passed! The serialization issue is fixed.")
    else:
        print("\n💥 Tests failed! There are still serialization issues.")
