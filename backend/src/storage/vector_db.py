from typing import List, Dict, Any, Optional
from dataclasses import dataclass

try:
    import chromadb
    from chromadb import Client
    from chromadb.config import Settings
except Exception as e:
    chromadb = None


@dataclass
class VectorRecord:
    id: str
    embedding: list
    metadata: Dict[str, Any]
    document: Optional[str] = None


def _sanitize_metadata(md: Optional[Dict[str, Any]], fallback_id: str) -> Dict[str, Any]:
    safe: Dict[str, Any] = {}
    if md:
        for k, v in md.items():
            try:
                key = str(k)
                if v is None:
                    continue
                if isinstance(v, (str, int, float, bool)):
                    safe[key] = v
                else:
                    safe[key] = str(v)
            except Exception:
                continue
    if not safe:
        safe = {"chunk_id": str(fallback_id)}
    return safe


class ChromaVectorStore:
    """Thin wrapper around ChromaDB for storing and querying embeddings."""

    def __init__(self, persist_directory: str = ".chroma", collection_name: str = "csv_chunks"):
        self.persist_directory = persist_directory
        self.collection_name = collection_name
        self.client = None
        self.collection = None

    def connect(self):
        if chromadb is None:
            raise ImportError("chromadb is not installed. Please install it to use ChromaVectorStore.")
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        return self

    def get_or_create_collection(self, metadata: Optional[Dict[str, Any]] = None):
        if self.client is None:
            self.connect()
        default_md = {"created_by": "csv_chunking_optimizer", "purpose": "chunk_storage"}
        md = metadata if (metadata and len(metadata) > 0) else default_md
        self.collection = self.client.get_or_create_collection(name=self.collection_name, metadata=md)
        return self.collection

    def upsert(self, records: List[VectorRecord]):
        if self.collection is None:
            self.get_or_create_collection()
        ids = [r.id for r in records]
        embeddings = [r.embedding for r in records]
        metadatas = [_sanitize_metadata(r.metadata, r.id) for r in records]
        documents = [(r.document if isinstance(r.document, str) else ("" if r.document is None else str(r.document))) for r in records]
        self.collection.upsert(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=documents)

    def add(self, records: List[VectorRecord]):
        if self.collection is None:
            self.get_or_create_collection()
        ids = [r.id for r in records]
        embeddings = [r.embedding for r in records]
        metadatas = [_sanitize_metadata(r.metadata, r.id) for r in records]
        documents = [(r.document if isinstance(r.document, str) else ("" if r.document is None else str(r.document))) for r in records]
        self.collection.add(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=documents)

    def query(self, query_embeddings: List[list], n_results: int = 5, where: Optional[Dict[str, Any]] = None):
        if self.collection is None:
            self.get_or_create_collection()
        return self.collection.query(query_embeddings=query_embeddings, n_results=n_results, where=where)

    def reset_collection(self):
        if self.client is None:
            self.connect()
        try:
            # Ensure previous collection is fully removed to avoid mixing datasets
            self.client.delete_collection(self.collection_name)
        except Exception:
            pass
        # Recreate with default metadata to keep consistency
        default_md = {"created_by": "csv_chunking_optimizer", "purpose": "chunk_storage"}
        self.collection = self.client.get_or_create_collection(self.collection_name, metadata=default_md)
        return self.collection
