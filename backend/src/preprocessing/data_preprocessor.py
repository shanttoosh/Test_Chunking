import pandas as pd
import numpy as np
import re
from bs4 import BeautifulSoup
from datetime import datetime
import spacy
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
import nltk
nltk.download('punkt')
nltk.download('popular')

try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')
    nltk.download('wordnet')
    nltk.download('omw-1.4')

try:
    import chardet
    CHORDET_AVAILABLE = True
except Exception:
    CHORDET_AVAILABLE = False

def _load_csv(input_obj):
    if isinstance(input_obj, pd.DataFrame):
        return input_obj.copy()
    if hasattr(input_obj, "read"):
        try:
            return pd.read_csv(input_obj, engine="python")
        except Exception:
            input_obj.seek(0)
            return pd.read_csv(input_obj)
    if isinstance(input_obj, str):
        try:
            return pd.read_csv(input_obj, engine="python")
        except Exception:
            if CHORDET_AVAILABLE:
                with open(input_obj, "rb") as fh:
                    raw = fh.read()
                enc = chardet.detect(raw).get("encoding", "utf-8")
                return pd.read_csv(input_obj, encoding=enc, engine="python")
            else:
                with open(input_obj, "rb") as fh:
                    raw = fh.read(100)
                text = raw.decode("utf-8", errors="replace")
                from io import StringIO
                return pd.read_csv(StringIO(text))
    raise ValueError("Unsupported input type for _load_csv")

def remove_html(text):
    if not isinstance(text, str):
        return text
    try:
        return BeautifulSoup(text, "lxml").get_text(separator=' ')
    except:
        return re.sub('<[^<]+?>', ' ', text)

def validate_and_normalize_headers(df: pd.DataFrame) -> pd.DataFrame:
    new_columns = []
    for i, col in enumerate(df.columns):
        if pd.isna(col) or str(col).strip() == "":
            new_col = f"column_{i+1}"
        else:
            new_col = str(col).strip().lower()
        new_columns.append(new_col)
    df.columns = new_columns
    return df

def normalize_text_column(s: pd.Series, lowercase=True, strip=True, remove_html_flag=True):
    s = s.fillna('')
    if remove_html_flag:
        s = s.map(remove_html)
    if lowercase:
        s = s.map(lambda x: x.lower() if isinstance(x, str) else x)
    if strip:
        s = s.map(lambda x: x.strip() if isinstance(x, str) else x)
    s = s.map(lambda x: re.sub(r'\s+', ' ', x) if isinstance(x, str) else x)
    return s

def apply_type_conversion(df: pd.DataFrame, conversion: dict):
    df = df.copy()
    for col, t in conversion.items():
        if col not in df.columns:
            continue
        try:
            if t == 'numeric':
                df[col] = pd.to_numeric(df[col], errors='coerce')
            elif t == 'datetime':
                df[col] = pd.to_datetime(df[col], errors='coerce')
            elif t == 'text':
                df[col] = df[col].astype(str)
        except Exception:
            pass
    return df

# Load spaCy once
nlp = spacy.load("en_core_web_sm")

def remove_stopwords_from_text_column(df, remove_stopwords=True):
    if not remove_stopwords:
        return df, "Stop words removal skipped."
    # Detect text/object columns with non-empty values
    text_cols = [col for col in df.select_dtypes(include=["object"]).columns if df[col].dropna().astype(str).str.match('.[a-zA-Z]+.').any()]
    if not text_cols:
        return df  # no text columns found

    # For each text column detected, remove stopwords
    def process_text(text):
        doc = nlp(str(text))
        filtered_tokens = [token.text for token in doc if not token.is_stop]
        return " ".join(filtered_tokens)

    for col in text_cols:
        df[col] = df[col].apply(process_text)

    return df

nlp = spacy.load("en_core_web_sm", disable=["parser", "ner"])
stemmer = PorterStemmer()

def lemmatize_text(text):
    doc = nlp(str(text))
    return " ".join([token.text if token.lemma_ == '-PRON-' else token.lemma_ for token in doc])

def stem_text(text):
    words = word_tokenize(str(text))
    return " ".join([stemmer.stem(word) for word in words])

def process_text(df, method):
    text_cols = df.select_dtypes(include=["object"]).columns
    for col in text_cols:
        if method == 'lemmatize':
            df[col] = df[col].apply(lemmatize_text)
        elif method == 'stem':
            df[col] = df[col].apply(stem_text)
    return df


def preprocess_csv(input_obj, fill_null_strategy=None, type_conversions=None, drop_duplicates_cols=None, remove_stopwords_flag=False):
    df = _load_csv(input_obj)
    df = validate_and_normalize_headers(df)

    # Normalize text columns (object dtype)
    text_cols = df.select_dtypes(include=['object']).columns.tolist()
    for col in text_cols:
        df[col] = normalize_text_column(df[col])

    # Apply type conversions (numeric, datetime, text)
    if type_conversions:
        df = apply_type_conversion(df, type_conversions)

    # Drop duplicates as per input
    if drop_duplicates_cols:
        df = df.drop_duplicates(subset=drop_duplicates_cols, keep='first')

    # Remove stopwords if flagged
    if remove_stopwords_flag:
        df = remove_stopwords_from_text_column(df, remove_stopwords=True)

    # Prepare file and numeric metadata
    file_meta = {
        'file_source': input_obj if isinstance(input_obj, str) else 'dataframe_input',
        'num_rows': df.shape[0],
        'num_columns': df.shape[1],
        'shape': df.shape,
        'upload_time': datetime.utcnow().isoformat() + 'Z'
    }

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    numeric_metadata = []
    for col in numeric_cols:
        numeric_metadata.append({
            'column_name': col,
            'count': int(df[col].count()),
            'mean': float(df[col].mean()),
            'std': float(df[col].std()),
            'min': float(df[col].min()),
            'max': float(df[col].max()),
            'values': df[col].dropna().tolist() 
        })


    return df, file_meta, numeric_metadata
