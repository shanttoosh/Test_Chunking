from typing import List, Dict, Any, Optional
import numpy as np
import chromadb
from datetime import datetime

class DocumentBasedRetriever:
    """Simple document-based retriever using ChromaDB"""
    
    def __init__(self, chroma_path: str = ".chroma"):
        self.chroma_path = chroma_path
        self.client = None
        self.collections = {}
    
    def connect(self):
        """Connect to ChromaDB"""
        try:
            self.client = chromadb.PersistentClient(path=self.chroma_path)
            return True
        except Exception as e:
            print(f"Failed to connect to ChromaDB: {e}")
            return False
    
    def get_collection(self, collection_name: str):
        """Get a collection"""
        if not self.client:
            self.connect()
        
        try:
            collection = self.client.get_collection(name=collection_name)
            return collection
        except Exception as e:
            print(f"Failed to get collection {collection_name}: {e}")
            return None
    
    def search(self, query: str, collection_name: str, n_results: int = 5, 
               where: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Search for documents"""
        collection = self.get_collection(collection_name)
        if not collection:
            return {
                "success": False,
                "error": f"Collection {collection_name} not found",
                "results": [],
                "stats": {}
            }
        
        try:
            # For now, use a simple text search
            # In a real implementation, you would generate embeddings for the query
            results = collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where
            )
            
            # Format results
            formatted_results = []
            for i, (doc, meta, dist) in enumerate(zip(
                results['documents'][0] if results['documents'] else [],
                results['metadatas'][0] if results['metadatas'] else [],
                results['distances'][0] if results['distances'] else []
            )):
                formatted_results.append({
                    "rank": i + 1,
                    "id": results['ids'][0][i] if results['ids'] and results['ids'][0] else f"result_{i}",
                    "content": doc,
                    "metadata": meta,
                    "similarity": 1 - dist if dist is not None else 0.0,
                    "distance": dist
                })
            
            return {
                "success": True,
                "results": formatted_results,
                "stats": {
                    "query": query,
                    "collection": collection_name,
                    "n_results": len(formatted_results),
                    "search_time": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "results": [],
                "stats": {}
            }
    
    def is_numerical_query(self, query: str) -> bool:
        """Check if the query is numerical"""
        try:
            # Try to convert to float
            float(query.strip())
            return True
        except ValueError:
            # Check if it contains numerical patterns
            import re
            numerical_patterns = [
                r'\d+',  # Contains digits
                r'\d+\.\d+',  # Decimal numbers
                r'\d+%',  # Percentages
                r'\$\d+',  # Currency
                r'\d+/\d+',  # Fractions
            ]
            for pattern in numerical_patterns:
                if re.search(pattern, query):
                    return True
            return False
    
    def get_collection_info(self, collection_name: str):
        """Get collection information"""
        collection = self.get_collection(collection_name)
        if not collection:
            return None
        
        try:
            count = collection.count()
            return {
                "name": collection_name,
                "count": count,
                "metadata": collection.metadata
            }
        except Exception as e:
            print(f"Failed to get collection info: {e}")
            return None
