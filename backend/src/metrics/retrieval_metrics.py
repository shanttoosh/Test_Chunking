import time
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json
from datetime import datetime


@dataclass
class RetrievalMetrics:
    """Data class to store retrieval metrics for a single query"""
    query: str
    top_k: int
    response_time: float
    precision_at_k: float
    recall_at_k: float
    f1_score: float
    cosine_similarities: List[float]
    retrieved_chunk_ids: List[str]
    timestamp: str
    model_used: str
    chunking_method: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert metrics to dictionary for JSON serialization"""
        return {
            'query': self.query,
            'top_k': self.top_k,
            'response_time': self.response_time,
            'precision_at_k': self.precision_at_k,
            'recall_at_k': self.recall_at_k,
            'f1_score': self.f1_score,
            'cosine_similarities': self.cosine_similarities,
            'retrieved_chunk_ids': self.retrieved_chunk_ids,
            'timestamp': self.timestamp,
            'model_used': self.model_used,
            'chunking_method': self.chunking_method
        }


class RetrievalMetricsTracker:
    """Class to track and calculate retrieval metrics"""
    
    def __init__(self):
        self.metrics_history: List[RetrievalMetrics] = []
        self.start_time: Optional[float] = None
    
    def start_query_timer(self):
        """Start timing a query"""
        self.start_time = time.time()
    
    def end_query_timer(self) -> float:
        """End timing and return elapsed time"""
        if self.start_time is None:
            return 0.0
        elapsed = time.time() - self.start_time
        self.start_time = None
        return elapsed
    
    def calculate_precision_at_k(self, retrieved_chunks: List[str], relevant_chunks: List[str], k: int) -> float:
        """
        Calculate Precision@K
        
        Args:
            retrieved_chunks: List of retrieved chunk IDs
            relevant_chunks: List of relevant chunk IDs (ground truth)
            k: Number of top results to consider
            
        Returns:
            Precision@K score (0.0 to 1.0)
        """
        if k <= 0 or len(retrieved_chunks) == 0:
            return 0.0
        
        # Take top k retrieved chunks
        top_k_retrieved = retrieved_chunks[:k]
        
        # Count how many of the top k are relevant
        relevant_in_top_k = sum(1 for chunk_id in top_k_retrieved if chunk_id in relevant_chunks)
        
        return relevant_in_top_k / len(top_k_retrieved)
    
    def calculate_recall_at_k(self, retrieved_chunks: List[str], relevant_chunks: List[str], k: int) -> float:
        """
        Calculate Recall@K
        
        Args:
            retrieved_chunks: List of retrieved chunk IDs
            relevant_chunks: List of relevant chunk IDs (ground truth)
            k: Number of top results to consider
            
        Returns:
            Recall@K score (0.0 to 1.0)
        """
        if len(relevant_chunks) == 0:
            return 1.0 if len(retrieved_chunks) == 0 else 0.0
        
        if k <= 0 or len(retrieved_chunks) == 0:
            return 0.0
        
        # Take top k retrieved chunks
        top_k_retrieved = retrieved_chunks[:k]
        
        # Count how many relevant chunks were retrieved in top k
        relevant_retrieved = sum(1 for chunk_id in top_k_retrieved if chunk_id in relevant_chunks)
        
        return relevant_retrieved / len(relevant_chunks)
    
    def calculate_f1_score(self, precision: float, recall: float) -> float:
        """
        Calculate F1-Score (harmonic mean of precision and recall)
        
        Args:
            precision: Precision score
            recall: Recall score
            
        Returns:
            F1-Score (0.0 to 1.0)
        """
        if precision + recall == 0:
            return 0.0
        return 2 * (precision * recall) / (precision + recall)
    
    def calculate_cosine_similarities(self, distances: List[float]) -> List[float]:
        """
        Convert distances to cosine similarities
        
        Args:
            distances: List of distance scores from ChromaDB
            
        Returns:
            List of cosine similarity scores
        """
        # ChromaDB returns distances (lower is better)
        # Convert to similarities (higher is better)
        # For cosine distance: similarity = 1 - distance
        similarities = []
        for distance in distances:
            if distance is not None:
                # Clamp similarity to [0, 1] range
                similarity = max(0.0, min(1.0, 1.0 - distance))
                similarities.append(similarity)
            else:
                similarities.append(0.0)
        return similarities
    
    def extract_relevant_chunks(self, query: str, all_chunks: List[Dict], threshold: float = 0.7) -> List[str]:
        """
        Extract relevant chunks based on query similarity (simplified approach)
        This is a basic implementation - in practice, you'd have ground truth labels
        
        Args:
            query: User query
            all_chunks: List of all available chunks with metadata
            threshold: Similarity threshold for considering a chunk relevant
            
        Returns:
            List of relevant chunk IDs
        """
        relevant_chunks = []
        query_lower = query.lower()
        
        for chunk in all_chunks:
            chunk_id = chunk.get('chunk_id', '')
            chunk_content = chunk.get('content', '')
            chunk_metadata = chunk.get('metadata', {})
            
            # Simple keyword-based relevance check
            content_lower = chunk_content.lower()
            metadata_str = str(chunk_metadata).lower()
            
            # Check if query terms appear in content or metadata
            query_terms = query_lower.split()
            matches = sum(1 for term in query_terms if term in content_lower or term in metadata_str)
            
            # Consider relevant if at least 50% of query terms match
            if len(query_terms) > 0 and matches / len(query_terms) >= 0.5:
                relevant_chunks.append(chunk_id)
        
        return relevant_chunks
    
    def record_metrics(self, 
                      query: str,
                      top_k: int,
                      retrieved_chunks: List[str],
                      distances: List[float],
                      model_used: str,
                      chunking_method: str,
                      all_chunks: Optional[List[Dict]] = None,
                      retrieved_content: Optional[List[str]] = None) -> RetrievalMetrics:
        """
        Record metrics for a single retrieval query
        
        Args:
            query: User query
            top_k: Number of results requested
            retrieved_chunks: List of retrieved chunk IDs
            distances: Distance scores from ChromaDB
            model_used: Embedding model used
            chunking_method: Chunking method used
            all_chunks: All available chunks (for relevance calculation)
            retrieved_content: List of retrieved content strings
            
        Returns:
            RetrievalMetrics object
        """
        response_time = self.end_query_timer()
        cosine_similarities = self.calculate_cosine_similarities(distances)
        
        # Calculate relevance metrics
        if all_chunks:
            relevant_chunks = self.extract_relevant_chunks(query, all_chunks)
            precision_at_k = self.calculate_precision_at_k(retrieved_chunks, relevant_chunks, top_k)
            recall_at_k = self.calculate_recall_at_k(retrieved_chunks, relevant_chunks, top_k)
            f1_score = self.calculate_f1_score(precision_at_k, recall_at_k)
        elif retrieved_content:
            # Use retrieved content to determine relevance
            relevant_retrieved = []
            query_lower = query.lower()
            
            for i, content in enumerate(retrieved_content):
                if content and query_lower in content.lower():
                    relevant_retrieved.append(retrieved_chunks[i] if i < len(retrieved_chunks) else f"chunk_{i}")
            
            precision_at_k = len(relevant_retrieved) / min(top_k, len(retrieved_chunks)) if retrieved_chunks else 0.0
            recall_at_k = precision_at_k  # Simplified assumption when we don't have all chunks
            f1_score = self.calculate_f1_score(precision_at_k, recall_at_k)
        else:
            # Fallback: use similarity-based approximation
            high_similarity_count = sum(1 for sim in cosine_similarities[:top_k] if sim > 0.7)
            precision_at_k = high_similarity_count / min(top_k, len(cosine_similarities)) if cosine_similarities else 0.0
            recall_at_k = precision_at_k  # Simplified assumption
            f1_score = self.calculate_f1_score(precision_at_k, recall_at_k)
        
        metrics = RetrievalMetrics(
            query=query,
            top_k=top_k,
            response_time=response_time,
            precision_at_k=precision_at_k,
            recall_at_k=recall_at_k,
            f1_score=f1_score,
            cosine_similarities=cosine_similarities,
            retrieved_chunk_ids=retrieved_chunks,
            timestamp=datetime.now().isoformat(),
            model_used=model_used,
            chunking_method=chunking_method
        )
        
        self.metrics_history.append(metrics)
        return metrics
    
    def get_average_metrics(self) -> Dict[str, float]:
        """Calculate average metrics across all recorded queries"""
        if not self.metrics_history:
            return {}
        
        total_queries = len(self.metrics_history)
        
        avg_precision = sum(m.precision_at_k for m in self.metrics_history) / total_queries
        avg_recall = sum(m.recall_at_k for m in self.metrics_history) / total_queries
        avg_f1 = sum(m.f1_score for m in self.metrics_history) / total_queries
        avg_response_time = sum(m.response_time for m in self.metrics_history) / total_queries
        
        return {
            'average_precision_at_k': avg_precision,
            'average_recall_at_k': avg_recall,
            'average_f1_score': avg_f1,
            'average_response_time': avg_response_time,
            'total_queries': total_queries
        }
    
    def get_metrics_by_model(self) -> Dict[str, Dict[str, float]]:
        """Get average metrics grouped by embedding model"""
        model_metrics = {}
        
        for metrics in self.metrics_history:
            model = metrics.model_used
            if model not in model_metrics:
                model_metrics[model] = {
                    'precision_at_k': [],
                    'recall_at_k': [],
                    'f1_score': [],
                    'response_time': []
                }
            
            model_metrics[model]['precision_at_k'].append(metrics.precision_at_k)
            model_metrics[model]['recall_at_k'].append(metrics.recall_at_k)
            model_metrics[model]['f1_score'].append(metrics.f1_score)
            model_metrics[model]['response_time'].append(metrics.response_time)
        
        # Calculate averages
        for model in model_metrics:
            data = model_metrics[model]
            model_metrics[model] = {
                'average_precision_at_k': sum(data['precision_at_k']) / len(data['precision_at_k']),
                'average_recall_at_k': sum(data['recall_at_k']) / len(data['recall_at_k']),
                'average_f1_score': sum(data['f1_score']) / len(data['f1_score']),
                'average_response_time': sum(data['response_time']) / len(data['response_time']),
                'query_count': len(data['precision_at_k'])
            }
        
        return model_metrics
    
    def export_metrics(self, filepath: str):
        """Export all metrics to JSON file"""
        export_data = {
            'summary': self.get_average_metrics(),
            'by_model': self.get_metrics_by_model(),
            'detailed_history': [m.to_dict() for m in self.metrics_history]
        }
        
        with open(filepath, 'w') as f:
            json.dump(export_data, f, indent=2)
    
    def clear_history(self):
        """Clear all recorded metrics"""
        self.metrics_history = []
