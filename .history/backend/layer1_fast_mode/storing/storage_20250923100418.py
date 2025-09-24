import chromadb
from typing import List, Dict, Any, Optional
import sys
import os

# Import local storage modules
from .vector_db import VectorDB
from .metadata_builder import MetadataBuilder

class FastModeStorage:
    """Fast Mode Storage - Optimized vector storage with best-practice defaults"""
    
    def __init__(self, persist_dir: str = ".chroma"):
        self.persist_dir = persist_dir
        self.vector_db = VectorDB(persist_dir=persist_dir)
        self.metadata_builder = MetadataBuilder()
        self.default_collection_name = "fast_mode_chunks"
    
    def store_embeddings(self, embedded_chunks: List, collection_name: Optional[str] = None,
                        reset_collection: bool = True) -> Dict[str, Any]:
        """
        Fast storage with optimized defaults
        
        Args:
            embedded_chunks: List of embedded chunks
            collection_name: Collection name (default: fast_mode_chunks)
            reset_collection: Whether to reset collection before storing
            
        Returns:
            Dictionary with storage results
        """
        try:
            # Use default collection name if not provided
            collection_name = collection_name or self.default_collection_name
            
            # Validate inputs
            self._validate_inputs(embedded_chunks)
            
            # Prepare data for storage
            ids, embeddings, documents, metadatas = self._prepare_storage_data(embedded_chunks)
            
            # Store in vector database
            result = self.vector_db.store_embeddings(
                collection_name=collection_name,
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas,
                reset_collection=reset_collection
            )
            
            # Generate statistics
            stats = self._generate_storage_stats(embedded_chunks, result)
            
            return {
                'collection_name': collection_name,
                'stored_count': len(embedded_chunks),
                'result': result,
                'stats': stats,
                'success': True,
                'message': f'Fast storage completed: {len(embedded_chunks)} chunks stored in {collection_name}'
            }
            
        except Exception as e:
            return {
                'collection_name': collection_name or self.default_collection_name,
                'stored_count': 0,
                'result': None,
                'stats': {},
                'success': False,
                'error': str(e)
            }
    
    def _validate_inputs(self, embedded_chunks: List):
        """Validate storage inputs"""
        if not embedded_chunks:
            raise ValueError("Embedded chunks list cannot be empty")
        
        # Check if embedded_chunks have required attributes
        for i, chunk in enumerate(embedded_chunks):
            if not hasattr(chunk, 'id'):
                raise ValueError(f"Chunk {i} missing 'id' attribute")
            if not hasattr(chunk, 'embedding'):
                raise ValueError(f"Chunk {i} missing 'embedding' attribute")
            if not hasattr(chunk, 'document'):
                raise ValueError(f"Chunk {i} missing 'document' attribute")
            if not hasattr(chunk, 'metadata'):
                raise ValueError(f"Chunk {i} missing 'metadata' attribute")
    
    def _prepare_storage_data(self, embedded_chunks: List) -> tuple:
        """Prepare data for vector database storage"""
        ids = []
        embeddings = []
        documents = []
        metadatas = []
        
        for chunk in embedded_chunks:
            # Extract ID
            ids.append(chunk.id)
            
            # Extract embedding
            embeddings.append(chunk.embedding.tolist())
            
            # Extract document
            documents.append(chunk.document)
            
            # Build metadata
            metadata = self.metadata_builder.build_metadata(chunk.metadata)
            metadatas.append(metadata)
        
        return ids, embeddings, documents, metadatas
    
    def _generate_storage_stats(self, embedded_chunks: List, result: Dict[str, Any]) -> Dict[str, Any]:
        """Generate storage statistics"""
        return {
            'total_chunks': len(embedded_chunks),
            'collection_info': result.get('collection_info', {}),
            'storage_stats': {
                'avg_embedding_dimension': len(embedded_chunks[0].embedding) if embedded_chunks else 0,
                'avg_document_length': sum(len(chunk.document) for chunk in embedded_chunks) / len(embedded_chunks) if embedded_chunks else 0,
                'total_embedding_size': sum(len(chunk.embedding) for chunk in embedded_chunks) if embedded_chunks else 0,
                'total_document_size': sum(len(chunk.document) for chunk in embedded_chunks) if embedded_chunks else 0
            }
        }
    
    def get_collection_info(self, collection_name: Optional[str] = None) -> Dict[str, Any]:
        """Get information about the collection"""
        try:
            collection_name = collection_name or self.default_collection_name
            return self.vector_db.get_collection_info(collection_name)
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def list_collections(self) -> Dict[str, Any]:
        """List all available collections"""
        try:
            return self.vector_db.list_collections()
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
