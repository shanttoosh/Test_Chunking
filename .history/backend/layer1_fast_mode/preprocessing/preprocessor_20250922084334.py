import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import re

class FastModePreprocessor:
    """Fast Mode Preprocessor - Basic data cleaning with best-practice defaults"""
    
    def __init__(self):
        self.processed_data = None
        self.stats = {}
    
    def preprocess(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Fast preprocessing with automatic optimization
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with processed data and statistics
        """
        try:
            # Step 1: Basic validation
            self._validate_input(df)
            
            # Step 2: Auto-detect and convert data types
            df_processed = self._auto_convert_types(df)
            
            # Step 3: Handle null values with smart defaults
            df_processed = self._handle_nulls_smart(df_processed)
            
            # Step 4: Remove duplicates
            df_processed = self._remove_duplicates(df_processed)
            
            # Step 5: Basic text cleaning
            df_processed = self._basic_text_cleaning(df_processed)
            
            # Generate statistics
            self.stats = self._generate_stats(df, df_processed)
            
            return {
                'processed_data': df_processed,
                'stats': self.stats,
                'success': True,
                'message': 'Fast preprocessing completed successfully'
            }
            
        except Exception as e:
            return {
                'processed_data': df,
                'stats': {},
                'success': False,
                'error': str(e)
            }
    
    def _validate_input(self, df: pd.DataFrame):
        """Validate input DataFrame"""
        if df is None or df.empty:
            raise ValueError("DataFrame cannot be None or empty")
        
        if len(df.columns) == 0:
            raise ValueError("DataFrame must have at least one column")
    
    def _auto_convert_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """Auto-detect and convert data types"""
        df_processed = df.copy()
        
        for col in df_processed.columns:
            # Try to convert to numeric
            if df_processed[col].dtype == 'object':
                # Check if it's numeric
                numeric_series = pd.to_numeric(df_processed[col], errors='coerce')
                if not numeric_series.isna().all():
                    # If most values are numeric, convert
                    if numeric_series.notna().sum() / len(df_processed) > 0.7:
                        df_processed[col] = numeric_series
                
                # Try to convert to datetime
                elif self._is_date_column(df_processed[col]):
                    try:
                        df_processed[col] = pd.to_datetime(df_processed[col], errors='coerce')
                    except:
                        pass
        
        return df_processed
    
    def _is_date_column(self, series: pd.Series) -> bool:
        """Check if a column contains date-like data"""
        if series.dtype != 'object':
            return False
        
        # Sample a few values to check
        sample_size = min(10, len(series))
        sample_values = series.dropna().head(sample_size)
        
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'\d{2}/\d{2}/\d{4}',  # MM/DD/YYYY
            r'\d{2}-\d{2}-\d{4}',  # MM-DD-YYYY
        ]
        
        for value in sample_values:
            value_str = str(value)
            if any(re.search(pattern, value_str) for pattern in date_patterns):
                return True
        
        return False
    
    def _handle_nulls_smart(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle null values with smart defaults"""
        df_processed = df.copy()
        
        for col in df_processed.columns:
            null_count = df_processed[col].isna().sum()
            if null_count > 0:
                null_ratio = null_count / len(df_processed)
                
                if null_ratio > 0.5:
                    # If more than 50% nulls, drop the column
                    df_processed = df_processed.drop(columns=[col])
                elif df_processed[col].dtype in ['int64', 'float64']:
                    # For numeric columns, fill with median
                    df_processed[col] = df_processed[col].fillna(df_processed[col].median())
                else:
                    # For text columns, fill with mode or 'Unknown'
                    mode_value = df_processed[col].mode()
                    fill_value = mode_value[0] if len(mode_value) > 0 else 'Unknown'
                    df_processed[col] = df_processed[col].fillna(fill_value)
        
        return df_processed
    
    def _remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate rows"""
        initial_rows = len(df)
        df_processed = df.drop_duplicates()
        removed_rows = initial_rows - len(df_processed)
        
        if removed_rows > 0:
            print(f"Removed {removed_rows} duplicate rows")
        
        return df_processed
    
    def _basic_text_cleaning(self, df: pd.DataFrame) -> pd.DataFrame:
        """Basic text cleaning for object columns"""
        df_processed = df.copy()
        
        for col in df_processed.columns:
            if df_processed[col].dtype == 'object':
                # Remove extra whitespace
                df_processed[col] = df_processed[col].astype(str).str.strip()
                # Replace multiple spaces with single space
                df_processed[col] = df_processed[col].str.replace(r'\s+', ' ', regex=True)
                # Handle 'nan' strings
                df_processed[col] = df_processed[col].replace('nan', np.nan)
        
        return df_processed
    
    def _generate_stats(self, original_df: pd.DataFrame, processed_df: pd.DataFrame) -> Dict[str, Any]:
        """Generate preprocessing statistics"""
        return {
            'original_rows': len(original_df),
            'processed_rows': len(processed_df),
            'original_columns': len(original_df.columns),
            'processed_columns': len(processed_df.columns),
            'rows_removed': len(original_df) - len(processed_df),
            'columns_removed': len(original_df.columns) - len(processed_df.columns),
            'null_values_handled': original_df.isna().sum().sum() - processed_df.isna().sum().sum(),
            'data_types': {col: str(dtype) for col, dtype in processed_df.dtypes.items()}
        }
