from typing import Dict, List, Any
import pandas as pd


def _compute_numeric_stats(df_slice: pd.DataFrame, columns: List[str]) -> Dict[str, float]:
    stats: Dict[str, float] = {}
    for col in columns:
        if col in df_slice.columns:
            try:
                series = pd.to_numeric(df_slice[col], errors='coerce').dropna()
                if len(series) > 0:
                    stats[f"num_{col}_min"] = float(series.min())
                    stats[f"num_{col}_mean"] = float(series.mean())
                    stats[f"num_{col}_max"] = float(series.max())
            except Exception:
                continue
    return stats


def _compute_categorical_stats(df_slice: pd.DataFrame, columns: List[str]) -> Dict[str, Any]:
    stats: Dict[str, Any] = {}
    for col in columns:
        if col in df_slice.columns:
            try:
                vc = df_slice[col].dropna().astype(str).value_counts()
                if not vc.empty:
                    stats[f"cat_{col}_mode"] = str(vc.idxmax())
                    stats[f"cat_{col}_unique_count"] = int(df_slice[col].nunique(dropna=True))
            except Exception:
                continue
    return stats


def build_per_chunk_metadata(
    original_df: pd.DataFrame,
    chunking_result,
    selected_numeric_cols: List[str],
    selected_categorical_cols: List[str],
) -> Dict[str, Dict[str, Any]]:
    """
    Build per-chunk numeric and categorical metadata using row indices attached to chunk metadata.

    Returns a mapping: { chunk_id: { meta_key: value, ... } }
    """
    per_chunk: Dict[str, Dict[str, Any]] = {}
    if chunking_result is None or original_df is None or original_df.empty:
        return per_chunk

    try:
        for md in getattr(chunking_result, 'metadata', []) or []:
            chunk_id = getattr(md, 'chunk_id', None)
            if not chunk_id:
                continue
            meta = getattr(md, 'metadata', {}) or {}
            row_indices = meta.get('row_indices')
            if isinstance(row_indices, list) and len(row_indices) > 0:
                try:
                    df_slice = original_df.iloc[row_indices]
                    stats_num = _compute_numeric_stats(df_slice, selected_numeric_cols or [])
                    stats_cat = _compute_categorical_stats(df_slice, selected_categorical_cols or [])
                    per_chunk[chunk_id] = {**stats_num, **stats_cat}
                except Exception:
                    per_chunk[chunk_id] = {}
            else:
                per_chunk[chunk_id] = {}
    except Exception:
        # On any failure, return what we have
        return per_chunk

    return per_chunk






