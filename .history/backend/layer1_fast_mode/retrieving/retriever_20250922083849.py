from typing import List, Dict, Any, Optional
import sys
import os

# Add the existing backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../../CHUNKING_PROJECT'))

from document_based_retrieval import DocumentBasedRetriever

class FastModeRetriever:
    """Fast Mode Retriever - Optimized retrieval with best-practice defaults"""
    
    def __init__(self, chroma_path: str = ".chroma"):
        self.retriever = DocumentBasedRetriever(chroma_path=chroma_path)
        self.default_collection_name = "fast_mode_chunks"
        self.default_n_results = 5
    
    def search(self, query: str, n_results: Optional[int] = None, 
               collection_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Fast search with optimized defaults
        
        Args:
            query: Search query
            n_results: Number of results to return (default: 5)
            collection_name: Collection name (default: fast_mode_chunks)
            
        Returns:
            Dictionary with search results
        """
        try:
            # Use defaults if not provided
            n_results = n_results or self.default_n_results
            collection_name = collection_name or self.default_collection_name
            
            # Validate inputs
            self._validate_inputs(query, n_results)
            
            # Perform search
            results = self.retriever.search(
                query=query,
                n_results=n_results,
                collection_name=collection_name
            )
            
            # Format results for frontend
            formatted_results = self._format_results(results)
            
            # Generate statistics
            stats = self._generate_search_stats(results, query)
            
            return {
                'query': query,
                'results': formatted_results,
                'stats': stats,
                'success': True,
                'message': f'Fast search completed: {len(formatted_results)} results found'
            }
            
        except Exception as e:
            return {
                'query': query,
                'results': [],
                'stats': {},
                'success': False,
                'error': str(e)
            }
    
    def _validate_inputs(self, query: str, n_results: int):
        """Validate search inputs"""
        if not query or not query.strip():
            raise ValueError("Query cannot be empty")
        
        if n_results <= 0:
            raise ValueError("Number of results must be positive")
        
        if n_results > 100:
            raise ValueError("Number of results cannot exceed 100")
    
    def _format_results(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Format search results for frontend"""
        if 'error' in results or not results.get('results'):
            return []
        
        formatted_results = []
        
        for result in results['results']:
            formatted_result = {
                'id': result.get('doc_id', ''),
                'content': result.get('content', ''),
                'similarity': result.get('similarity', 0.0),
                'metadata': {
                    'section': result.get('section', 'N/A'),
                    'author': result.get('author', 'N/A'),
                    'chunk_size': result.get('chunk_size', 'N/A'),
                    'text_length': result.get('text_length', 'N/A'),
                    'key_value': result.get('key_value', 'N/A'),
                    'chunking_method': result.get('chunking_method', 'N/A')
                },
                'rank': result.get('rank', 0)
            }
            
            formatted_results.append(formatted_result)
        
        return formatted_results
    
    def _generate_search_stats(self, results: Dict[str, Any], query: str) -> Dict[str, Any]:
        """Generate search statistics"""
        return {
            'query': query,
            'search_type': results.get('search_type', 'unknown'),
            'total_found': results.get('total_found', 0),
            'filters_used': results.get('filters_used', {}),
            'query_analysis': {
                'query_length': len(query),
                'query_words': len(query.split()),
                'is_numerical': self.retriever.is_numerical_query(query)
            }
        }
    
    def get_collection_info(self, collection_name: Optional[str] = None) -> Dict[str, Any]:
        """Get information about the collection"""
        try:
            collection_name = collection_name or self.default_collection_name
            collection = self.retriever.get_collection(collection_name)
            
            if collection:
                return {
                    'success': True,
                    'collection_name': collection_name,
                    'collection_exists': True,
                    'collection_info': {
                        'name': collection.name,
                        'count': collection.count()
                    }
                }
            else:
                return {
                    'success': False,
                    'collection_name': collection_name,
                    'collection_exists': False,
                    'error': 'Collection not found'
                }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def list_collections(self) -> Dict[str, Any]:
        """List all available collections"""
        try:
            collections = self.retriever.client.list_collections()
            collection_names = [col.name for col in collections]
            
            return {
                'success': True,
                'collections': collection_names,
                'total_collections': len(collection_names)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
