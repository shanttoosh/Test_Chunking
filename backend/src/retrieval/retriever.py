from typing import List, Dict, Any, Optional

import numpy as np

from storage.vector_db import ChromaVectorStore


class Retriever:
    def __init__(self, collection_name: str = "csv_chunks", persist_directory: str = ".chroma"):
        self.store = ChromaVectorStore(persist_directory=persist_directory, collection_name=collection_name)
        self.store.connect().get_or_create_collection()
        self.model = None
        self.model_name = None

    def _load_model(self, model_name: str):
        if self.model is not None and self.model_name == model_name:
            return
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer(model_name)
        self.model_name = model_name

    def embed_query(self, query: str, model_name: str) -> List[float]:
        self._load_model(model_name)
        vec = self.model.encode([query], convert_to_tensor=False)[0]
        return vec.tolist() if isinstance(vec, np.ndarray) else list(vec)

    def search(self, query: str, model_name: str, top_k: int = 5, where: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        query_vec = self.embed_query(query, model_name)
        results = self.store.query(query_embeddings=[query_vec], n_results=top_k, where=where)
        return results
