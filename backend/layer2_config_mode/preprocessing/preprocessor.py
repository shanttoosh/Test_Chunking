import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union
import re

class ConfigModePreprocessor:
    """Config Mode Preprocessor - Configurable data cleaning with user control"""
    
    def __init__(self):
        self.processed_data = None
        self.stats = {}
    
    def preprocess(self, df: pd.DataFrame, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Configurable preprocessing with user-defined options
        
        Args:
            df: Input DataFrame
            config: Configuration dictionary with preprocessing options
            
        Returns:
            Dictionary with processed data and statistics
        """
        try:
            # Use default config if not provided
            config = config or self._get_default_config()
            
            # Step 1: Basic validation
            self._validate_input(df)
            
            # Step 2: Handle null values based on config
            df_processed = self._handle_nulls_configurable(df, config.get('null_handling', {}))
            
            # Step 3: Data type conversion based on config
            df_processed = self._convert_types_configurable(df_processed, config.get('type_conversion', {}))
            
            # Step 4: Remove duplicates if configured
            if config.get('remove_duplicates', True):
                df_processed = self._remove_duplicates(df_processed)
            
            # Step 5: Text processing based on config
            df_processed = self._text_processing_configurable(df_processed, config.get('text_processing', {}))
            
            # Step 6: Column selection if configured
            if config.get('column_selection'):
                df_processed = self._select_columns(df_processed, config['column_selection'])
            
            # Generate statistics
            self.stats = self._generate_stats(df, df_processed, config)
            
            return {
                'processed_data': df_processed,
                'stats': self.stats,
                'config_used': config,
                'success': True,
                'message': 'Config mode preprocessing completed successfully'
            }
            
        except Exception as e:
            return {
                'processed_data': df,
                'stats': {},
                'config_used': config or {},
                'success': False,
                'error': str(e)
            }
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration for config mode"""
        return {
            'null_handling': {
                'strategy': 'smart',  # 'smart', 'drop', 'fill', 'skip'
                'fill_method': 'auto',  # 'auto', 'mean', 'median', 'mode', 'custom'
                'custom_value': None,
                'drop_threshold': 0.5  # Drop columns with >50% nulls
            },
            'type_conversion': {
                'auto_detect': True,
                'numeric_columns': [],
                'datetime_columns': [],
                'categorical_columns': [],
                'text_columns': []
            },
            'remove_duplicates': True,
            'text_processing': {
                'clean_whitespace': True,
                'remove_special_chars': False,
                'lowercase': False,
                'remove_stopwords': False
            },
            'column_selection': {
                'include_columns': [],
                'exclude_columns': [],
                'rename_columns': {}
            }
        }
    
    def _validate_input(self, df: pd.DataFrame):
        """Validate input DataFrame"""
        if df is None or df.empty:
            raise ValueError("DataFrame cannot be None or empty")
        
        if len(df.columns) == 0:
            raise ValueError("DataFrame must have at least one column")
    
    def _handle_nulls_configurable(self, df: pd.DataFrame, null_config: Dict[str, Any]) -> pd.DataFrame:
        """Handle null values based on configuration"""
        df_processed = df.copy()
        
        for col in df_processed.columns:
            null_count = df_processed[col].isna().sum()
            if null_count > 0:
                null_ratio = null_count / len(df_processed)
                
                # Check if column should be dropped
                if null_ratio > null_config.get('drop_threshold', 0.5):
                    df_processed = df_processed.drop(columns=[col])
                    continue
                
                strategy = null_config.get('strategy', 'smart')
                
                if strategy == 'drop':
                    # Drop rows with nulls
                    df_processed = df_processed.dropna(subset=[col])
                elif strategy == 'fill':
                    # Fill nulls based on method
                    fill_method = null_config.get('fill_method', 'auto')
                    df_processed[col] = self._fill_nulls(df_processed[col], fill_method, null_config.get('custom_value'))
                elif strategy == 'smart':
                    # Smart filling based on data type
                    df_processed[col] = self._smart_fill_nulls(df_processed[col])
                # 'skip' strategy does nothing
        
        return df_processed
    
    def _fill_nulls(self, series: pd.Series, method: str, custom_value: Any = None) -> pd.Series:
        """Fill nulls using specified method"""
        if method == 'mean' and series.dtype in ['int64', 'float64']:
            return series.fillna(series.mean())
        elif method == 'median' and series.dtype in ['int64', 'float64']:
            return series.fillna(series.median())
        elif method == 'mode':
            mode_value = series.mode()
            return series.fillna(mode_value[0] if len(mode_value) > 0 else 'Unknown')
        elif method == 'custom' and custom_value is not None:
            return series.fillna(custom_value)
        else:
            # Default to smart filling
            return self._smart_fill_nulls(series)
    
    def _smart_fill_nulls(self, series: pd.Series) -> pd.Series:
        """Smart null filling based on data type"""
        if series.dtype in ['int64', 'float64']:
            return series.fillna(series.median())
        else:
            mode_value = series.mode()
            return series.fillna(mode_value[0] if len(mode_value) > 0 else 'Unknown')
    
    def _convert_types_configurable(self, df: pd.DataFrame, type_config: Dict[str, Any]) -> pd.DataFrame:
        """Convert data types based on configuration"""
        df_processed = df.copy()
        
        # Auto-detect types if enabled
        if type_config.get('auto_detect', True):
            df_processed = self._auto_detect_types(df_processed)
        
        # Convert specific columns
        for col, target_type in type_config.get('numeric_columns', []):
            if col in df_processed.columns:
                df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce')
        
        for col, target_type in type_config.get('datetime_columns', []):
            if col in df_processed.columns:
                df_processed[col] = pd.to_datetime(df_processed[col], errors='coerce')
        
        for col, target_type in type_config.get('categorical_columns', []):
            if col in df_processed.columns:
                df_processed[col] = df_processed[col].astype('category')
        
        return df_processed
    
    def _auto_detect_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """Auto-detect and convert data types"""
        df_processed = df.copy()
        
        for col in df_processed.columns:
            if df_processed[col].dtype == 'object':
                # Try to convert to numeric
                numeric_series = pd.to_numeric(df_processed[col], errors='coerce')
                if not numeric_series.isna().all():
                    if numeric_series.notna().sum() / len(df_processed) > 0.7:
                        df_processed[col] = numeric_series
                        continue
                
                # Try to convert to datetime
                if self._is_date_column(df_processed[col]):
                    try:
                        df_processed[col] = pd.to_datetime(df_processed[col], errors='coerce')
                    except:
                        pass
        
        return df_processed
    
    def _is_date_column(self, series: pd.Series) -> bool:
        """Check if a column contains date-like data"""
        if series.dtype != 'object':
            return False
        
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
    
    def _remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate rows"""
        initial_rows = len(df)
        df_processed = df.drop_duplicates()
        removed_rows = initial_rows - len(df_processed)
        
        if removed_rows > 0:
            print(f"Removed {removed_rows} duplicate rows")
        
        return df_processed
    
    def _text_processing_configurable(self, df: pd.DataFrame, text_config: Dict[str, Any]) -> pd.DataFrame:
        """Apply text processing based on configuration"""
        df_processed = df.copy()
        
        for col in df_processed.columns:
            if df_processed[col].dtype == 'object':
                # Clean whitespace
                if text_config.get('clean_whitespace', True):
                    df_processed[col] = df_processed[col].astype(str).str.strip()
                    df_processed[col] = df_processed[col].str.replace(r'\s+', ' ', regex=True)
                
                # Remove special characters
                if text_config.get('remove_special_chars', False):
                    df_processed[col] = df_processed[col].str.replace(r'[^\w\s]', '', regex=True)
                
                # Convert to lowercase
                if text_config.get('lowercase', False):
                    df_processed[col] = df_processed[col].str.lower()
                
                # Handle 'nan' strings
                df_processed[col] = df_processed[col].replace('nan', np.nan)
        
        return df_processed
    
    def _select_columns(self, df: pd.DataFrame, selection_config: Dict[str, Any]) -> pd.DataFrame:
        """Select columns based on configuration"""
        df_processed = df.copy()
        
        # Include specific columns
        if selection_config.get('include_columns'):
            df_processed = df_processed[selection_config['include_columns']]
        
        # Exclude specific columns
        if selection_config.get('exclude_columns'):
            df_processed = df_processed.drop(columns=selection_config['exclude_columns'])
        
        # Rename columns
        if selection_config.get('rename_columns'):
            df_processed = df_processed.rename(columns=selection_config['rename_columns'])
        
        return df_processed
    
    def _generate_stats(self, original_df: pd.DataFrame, processed_df: pd.DataFrame, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate preprocessing statistics"""
        return {
            'original_rows': len(original_df),
            'processed_rows': len(processed_df),
            'original_columns': len(original_df.columns),
            'processed_columns': len(processed_df.columns),
            'rows_removed': len(original_df) - len(processed_df),
            'columns_removed': len(original_df.columns) - len(processed_df.columns),
            'null_values_handled': original_df.isna().sum().sum() - processed_df.isna().sum().sum(),
            'data_types': {col: str(dtype) for col, dtype in processed_df.dtypes.items()},
            'config_applied': config,
            'processing_summary': {
                'null_handling_strategy': config.get('null_handling', {}).get('strategy', 'smart'),
                'type_conversion_applied': config.get('type_conversion', {}).get('auto_detect', True),
                'duplicates_removed': config.get('remove_duplicates', True),
                'text_processing_applied': any(config.get('text_processing', {}).values())
            }
        }
