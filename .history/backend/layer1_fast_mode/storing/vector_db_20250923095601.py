import chromadb
from typing import List, Dict, Any, Optional
import os
import json
from datetime import datetime

class VectorDB:
    """Simple vector database using ChromaDB"""
    
    def __init__(self, persist_dir: str = ".chroma"):
        self.persist_dir = persist_dir
        self.client = None
        self.collections = {}
    
    def connect(self):
        """Connect to ChromaDB"""
        try:
            self.client = chromadb.PersistentClient(path=self.persist_dir)
            return True
        except Exception as e:
            print(f"Failed to connect to ChromaDB: {e}")
            return False
    
    def get_or_create_collection(self, collection_name: str):
        """Get or create a collection"""
        if not self.client:
            self.connect()
        
        try:
            collection = self.client.get_or_create_collection(name=collection_name)
            self.collections[collection_name] = collection
            return collection
        except Exception as e:
            print(f"Failed to get/create collection {collection_name}: {e}")
            return None
    
    def add_documents(self, collection_name: str, documents: List[str], 
                     embeddings: List[List[float]], metadatas: List[Dict[str, Any]], 
                     ids: List[str]):
        """Add documents to collection"""
        collection = self.get_or_create_collection(collection_name)
        if not collection:
            return False
        
        try:
            collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            return True
        except Exception as e:
            print(f"Failed to add documents: {e}")
            return False
    
    def search(self, collection_name: str, query_embeddings: List[List[float]], 
               n_results: int = 5, where: Optional[Dict[str, Any]] = None):
        """Search in collection"""
        collection = self.get_or_create_collection(collection_name)
        if not collection:
            return None
        
        try:
            results = collection.query(
                query_embeddings=query_embeddings,
                n_results=n_results,
                where=where
            )
            return results
        except Exception as e:
            print(f"Failed to search: {e}")
            return None
    
    def get_collection_info(self, collection_name: str):
        """Get collection information"""
        collection = self.get_or_create_collection(collection_name)
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
    
    def list_collections(self):
        """List all collections"""
        if not self.client:
            self.connect()
        
        try:
            collections = self.client.list_collections()
            return [{"name": col.name, "id": col.id} for col in collections]
        except Exception as e:
            print(f"Failed to list collections: {e}")
            return []
    
    def delete_collection(self, collection_name: str):
        """Delete a collection"""
        if not self.client:
            self.connect()
        
        try:
            self.client.delete_collection(name=collection_name)
            if collection_name in self.collections:
                del self.collections[collection_name]
            return True
        except Exception as e:
            print(f"Failed to delete collection: {e}")
            return False

class MetadataBuilder:
    """Build metadata for chunks"""
    
    def __init__(self):
        pass
    
    def build_chunk_metadata(self, chunk_data: Any, chunk_id: str, 
                           source_file: str, chunk_number: int) -> Dict[str, Any]:
        """Build metadata for a chunk"""
        metadata = {
            "chunk_id": chunk_id,
            "source_file": source_file,
            "chunk_number": chunk_number,
            "created_at": datetime.now().isoformat(),
            "chunk_type": "text_chunk"
        }
        
        # Add additional metadata based on chunk type
        if hasattr(chunk_data, 'shape'):
            metadata["rows"] = chunk_data.shape[0]
            metadata["columns"] = chunk_data.shape[1] if len(chunk_data.shape) > 1 else 1
        
        return metadata
