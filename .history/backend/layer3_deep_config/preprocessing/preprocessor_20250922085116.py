import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union, Callable
import re
import nltk
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import KNNImputer
import warnings
warnings.filterwarnings('ignore')

class DeepConfigPreprocessor:
    """Deep Config Preprocessor - Advanced data cleaning with expert-level control"""
    
    def __init__(self):
        self.processed_data = None
        self.stats = {}
        self.scalers = {}
        self.encoders = {}
        self.imputers = {}
    
    def preprocess(self, df: pd.DataFrame, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Advanced preprocessing with expert-level configuration
        
        Args:
            df: Input DataFrame
            config: Advanced configuration dictionary
            
        Returns:
            Dictionary with processed data and statistics
        """
        try:
            # Use default config if not provided
            config = config or self._get_default_config()
            
            # Step 1: Advanced validation
            self._validate_input(df)
            
            # Step 2: Data profiling and analysis
            profile_result = self._profile_data(df, config.get('profiling', {}))
            
            # Step 3: Advanced null handling
            df_processed = self._advanced_null_handling(df, config.get('null_handling', {}))
            
            # Step 4: Advanced type conversion
            df_processed = self._advanced_type_conversion(df_processed, config.get('type_conversion', {}))
            
            # Step 5: Feature engineering
            df_processed = self._feature_engineering(df_processed, config.get('feature_engineering', {}))
            
            # Step 6: Advanced text processing
            df_processed = self._advanced_text_processing(df_processed, config.get('text_processing', {}))
            
            # Step 7: Data scaling and normalization
            df_processed = self._data_scaling(df_processed, config.get('scaling', {}))
            
            # Step 8: Outlier detection and handling
            df_processed = self._outlier_handling(df_processed, config.get('outlier_handling', {}))
            
            # Step 9: Advanced column operations
            df_processed = self._advanced_column_operations(df_processed, config.get('column_operations', {}))
            
            # Generate comprehensive statistics
            self.stats = self._generate_advanced_stats(df, df_processed, config, profile_result)
            
            return {
                'processed_data': df_processed,
                'stats': self.stats,
                'profile_result': profile_result,
                'config_used': config,
                'success': True,
                'message': 'Deep config preprocessing completed successfully'
            }
            
        except Exception as e:
            return {
                'processed_data': df,
                'stats': {},
                'profile_result': {},
                'config_used': config or {},
                'success': False,
                'error': str(e)
            }
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default configuration for deep config mode"""
        return {
            'profiling': {
                'enable': True,
                'detailed_analysis': True,
                'correlation_analysis': True,
                'distribution_analysis': True
            },
            'null_handling': {
                'strategy': 'advanced',  # 'advanced', 'ml_based', 'domain_specific'
                'ml_imputation': True,
                'knn_neighbors': 5,
                'domain_rules': {},
                'custom_handlers': {}
            },
            'type_conversion': {
                'advanced_detection': True,
                'custom_converters': {},
                'validation_rules': {},
                'error_handling': 'strict'
            },
            'feature_engineering': {
                'enable': True,
                'create_derived_features': True,
                'interaction_features': True,
                'polynomial_features': False,
                'custom_features': []
            },
            'text_processing': {
                'advanced_cleaning': True,
                'lemmatization': True,
                'stemming': False,
                'stopword_removal': True,
                'custom_stopwords': [],
                'language_detection': True,
                'sentiment_analysis': False
            },
            'scaling': {
                'enable': True,
                'method': 'standard',  # 'standard', 'minmax', 'robust', 'custom'
                'columns': 'auto',
                'custom_scalers': {}
            },
            'outlier_handling': {
                'enable': True,
                'method': 'iqr',  # 'iqr', 'zscore', 'isolation_forest', 'custom'
                'threshold': 1.5,
                'action': 'cap'  # 'cap', 'remove', 'transform'
            },
            'column_operations': {
                'advanced_selection': True,
                'feature_importance': True,
                'dimensionality_reduction': False,
                'custom_operations': []
            }
        }
    
    def _validate_input(self, df: pd.DataFrame):
        """Advanced input validation"""
        if df is None or df.empty:
            raise ValueError("DataFrame cannot be None or empty")
        
        if len(df.columns) == 0:
            raise ValueError("DataFrame must have at least one column")
        
        # Check for potential issues
        if len(df) < 10:
            warnings.warn("Dataset is very small (< 10 rows), some operations may not be reliable")
        
        if len(df.columns) > 1000:
            warnings.warn("Dataset has many columns (> 1000), processing may be slow")
    
    def _profile_data(self, df: pd.DataFrame, profiling_config: Dict[str, Any]) -> Dict[str, Any]:
        """Advanced data profiling and analysis"""
        if not profiling_config.get('enable', True):
            return {}
        
        profile = {
            'basic_stats': {
                'rows': len(df),
                'columns': len(df.columns),
                'memory_usage': df.memory_usage(deep=True).sum(),
                'dtypes': df.dtypes.to_dict()
            },
            'null_analysis': {
                'null_counts': df.isnull().sum().to_dict(),
                'null_percentages': (df.isnull().sum() / len(df) * 100).to_dict(),
                'null_patterns': self._analyze_null_patterns(df)
            },
            'data_quality': {
                'duplicate_rows': df.duplicated().sum(),
                'duplicate_percentage': (df.duplicated().sum() / len(df)) * 100,
                'unique_values': {col: df[col].nunique() for col in df.columns}
            }
        }
        
        if profiling_config.get('detailed_analysis', True):
            profile['detailed_analysis'] = self._detailed_analysis(df)
        
        if profiling_config.get('correlation_analysis', True):
            profile['correlation_analysis'] = self._correlation_analysis(df)
        
        if profiling_config.get('distribution_analysis', True):
            profile['distribution_analysis'] = self._distribution_analysis(df)
        
        return profile
    
    def _analyze_null_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze patterns in null values"""
        null_patterns = {}
        
        # Find columns that are null together
        null_matrix = df.isnull()
        if null_matrix.any().any():
            # Simple pattern analysis
            null_patterns['columns_with_nulls'] = null_matrix.any().sum()
            null_patterns['rows_with_nulls'] = null_matrix.any(axis=1).sum()
            null_patterns['complete_null_rows'] = null_matrix.all(axis=1).sum()
        
        return null_patterns
    
    def _detailed_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detailed statistical analysis"""
        analysis = {}
        
        for col in df.columns:
            if df[col].dtype in ['int64', 'float64']:
                analysis[col] = {
                    'type': 'numeric',
                    'mean': df[col].mean(),
                    'median': df[col].median(),
                    'std': df[col].std(),
                    'min': df[col].min(),
                    'max': df[col].max(),
                    'skewness': df[col].skew(),
                    'kurtosis': df[col].kurtosis()
                }
            else:
                analysis[col] = {
                    'type': 'categorical',
                    'unique_count': df[col].nunique(),
                    'most_frequent': df[col].mode().iloc[0] if not df[col].mode().empty else None,
                    'frequency': df[col].value_counts().head(5).to_dict()
                }
        
        return analysis
    
    def _correlation_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze correlations between numeric columns"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) < 2:
            return {'message': 'Not enough numeric columns for correlation analysis'}
        
        correlation_matrix = df[numeric_cols].corr()
        
        # Find high correlations
        high_correlations = []
        for i in range(len(correlation_matrix.columns)):
            for j in range(i+1, len(correlation_matrix.columns)):
                corr_value = correlation_matrix.iloc[i, j]
                if abs(corr_value) > 0.7:  # High correlation threshold
                    high_correlations.append({
                        'col1': correlation_matrix.columns[i],
                        'col2': correlation_matrix.columns[j],
                        'correlation': corr_value
                    })
        
        return {
            'correlation_matrix': correlation_matrix.to_dict(),
            'high_correlations': high_correlations
        }
    
    def _distribution_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze data distributions"""
        distributions = {}
        
        for col in df.select_dtypes(include=[np.number]).columns:
            distributions[col] = {
                'is_normal': self._test_normality(df[col].dropna()),
                'outliers_iqr': self._detect_outliers_iqr(df[col].dropna()),
                'outliers_zscore': self._detect_outliers_zscore(df[col].dropna())
            }
        
        return distributions
    
    def _test_normality(self, series: pd.Series) -> bool:
        """Simple normality test"""
        try:
            from scipy import stats
            _, p_value = stats.normaltest(series)
            return p_value > 0.05
        except:
            return False
    
    def _detect_outliers_iqr(self, series: pd.Series) -> List[int]:
        """Detect outliers using IQR method"""
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        return series[(series < lower_bound) | (series > upper_bound)].index.tolist()
    
    def _detect_outliers_zscore(self, series: pd.Series) -> List[int]:
        """Detect outliers using Z-score method"""
        z_scores = np.abs((series - series.mean()) / series.std())
        return series[z_scores > 3].index.tolist()
    
    def _advanced_null_handling(self, df: pd.DataFrame, null_config: Dict[str, Any]) -> pd.DataFrame:
        """Advanced null value handling"""
        df_processed = df.copy()
        strategy = null_config.get('strategy', 'advanced')
        
        for col in df_processed.columns:
            if df_processed[col].isnull().any():
                if strategy == 'ml_based' and null_config.get('ml_imputation', True):
                    df_processed[col] = self._ml_imputation(df_processed, col, null_config)
                elif strategy == 'domain_specific':
                    df_processed[col] = self._domain_specific_imputation(df_processed, col, null_config)
                else:
                    df_processed[col] = self._advanced_imputation(df_processed, col, null_config)
        
        return df_processed
    
    def _ml_imputation(self, df: pd.DataFrame, col: str, config: Dict[str, Any]) -> pd.Series:
        """Machine learning-based imputation"""
        try:
            # Use KNN imputation for numeric columns
            if df[col].dtype in ['int64', 'float64']:
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                if len(numeric_cols) > 1:
                    imputer = KNNImputer(n_neighbors=config.get('knn_neighbors', 5))
                    df_numeric = df[numeric_cols].copy()
                    df_imputed = pd.DataFrame(
                        imputer.fit_transform(df_numeric),
                        columns=numeric_cols,
                        index=df.index
                    )
                    return df_imputed[col]
            
            # Fallback to advanced imputation
            return self._advanced_imputation(df, col, config)
        except:
            return self._advanced_imputation(df, col, config)
    
    def _domain_specific_imputation(self, df: pd.DataFrame, col: str, config: Dict[str, Any]) -> pd.Series:
        """Domain-specific imputation rules"""
        domain_rules = config.get('domain_rules', {})
        custom_handlers = config.get('custom_handlers', {})
        
        if col in custom_handlers:
            # Apply custom handler
            handler = custom_handlers[col]
            if callable(handler):
                return handler(df[col])
        
        # Apply domain rules
        if col in domain_rules:
            rule = domain_rules[col]
            if rule == 'forward_fill':
                return df[col].fillna(method='ffill')
            elif rule == 'backward_fill':
                return df[col].fillna(method='bfill')
            elif rule == 'interpolate':
                return df[col].interpolate()
        
        # Fallback to advanced imputation
        return self._advanced_imputation(df, col, config)
    
    def _advanced_imputation(self, df: pd.DataFrame, col: str, config: Dict[str, Any]) -> pd.Series:
        """Advanced imputation strategies"""
        series = df[col].copy()
        
        if series.dtype in ['int64', 'float64']:
            # For numeric columns, use median (robust to outliers)
            return series.fillna(series.median())
        else:
            # For categorical columns, use mode
            mode_value = series.mode()
            return series.fillna(mode_value[0] if len(mode_value) > 0 else 'Unknown')
    
    def _advanced_type_conversion(self, df: pd.DataFrame, type_config: Dict[str, Any]) -> pd.DataFrame:
        """Advanced type conversion with validation"""
        df_processed = df.copy()
        
        if type_config.get('advanced_detection', True):
            df_processed = self._advanced_type_detection(df_processed)
        
        # Apply custom converters
        custom_converters = type_config.get('custom_converters', {})
        for col, converter in custom_converters.items():
            if col in df_processed.columns:
                try:
                    df_processed[col] = converter(df_processed[col])
                except Exception as e:
                    if type_config.get('error_handling', 'strict') == 'strict':
                        raise e
                    else:
                        warnings.warn(f"Failed to convert column {col}: {e}")
        
        return df_processed
    
    def _advanced_type_detection(self, df: pd.DataFrame) -> pd.DataFrame:
        """Advanced automatic type detection"""
        df_processed = df.copy()
        
        for col in df_processed.columns:
            if df_processed[col].dtype == 'object':
                # Try to convert to numeric
                numeric_series = pd.to_numeric(df_processed[col], errors='coerce')
                if not numeric_series.isna().all():
                    if numeric_series.notna().sum() / len(df_processed) > 0.8:
                        df_processed[col] = numeric_series
                        continue
                
                # Try to convert to datetime
                if self._is_advanced_date_column(df_processed[col]):
                    try:
                        df_processed[col] = pd.to_datetime(df_processed[col], errors='coerce')
                    except:
                        pass
                
                # Try to convert to boolean
                if self._is_boolean_column(df_processed[col]):
                    df_processed[col] = df_processed[col].astype('boolean')
        
        return df_processed
    
    def _is_advanced_date_column(self, series: pd.Series) -> bool:
        """Advanced date column detection"""
        if series.dtype != 'object':
            return False
        
        sample_size = min(20, len(series))
        sample_values = series.dropna().head(sample_size)
        
        date_patterns = [
            r'\d{4}-\d{2}-\d{2}',  # YYYY-MM-DD
            r'\d{2}/\d{2}/\d{4}',  # MM/DD/YYYY
            r'\d{2}-\d{2}-\d{4}',  # MM-DD-YYYY
            r'\d{4}/\d{2}/\d{2}',  # YYYY/MM/DD
            r'\d{2}\.\d{2}\.\d{4}',  # DD.MM.YYYY
        ]
        
        date_count = 0
        for value in sample_values:
            value_str = str(value)
            if any(re.search(pattern, value_str) for pattern in date_patterns):
                date_count += 1
        
        return date_count / len(sample_values) > 0.7
    
    def _is_boolean_column(self, series: pd.Series) -> bool:
        """Detect boolean columns"""
        if series.dtype != 'object':
            return False
        
        unique_values = set(series.dropna().astype(str).str.lower())
        boolean_sets = [
            {'true', 'false'},
            {'yes', 'no'},
            {'y', 'n'},
            {'1', '0'},
            {'t', 'f'}
        ]
        
        return any(unique_values.issubset(bs) for bs in boolean_sets)
    
    def _feature_engineering(self, df: pd.DataFrame, feature_config: Dict[str, Any]) -> pd.DataFrame:
        """Advanced feature engineering"""
        if not feature_config.get('enable', True):
            return df
        
        df_processed = df.copy()
        
        if feature_config.get('create_derived_features', True):
            df_processed = self._create_derived_features(df_processed)
        
        if feature_config.get('interaction_features', True):
            df_processed = self._create_interaction_features(df_processed)
        
        # Apply custom features
        custom_features = feature_config.get('custom_features', [])
        for feature_func in custom_features:
            if callable(feature_func):
                df_processed = feature_func(df_processed)
        
        return df_processed
    
    def _create_derived_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create derived features"""
        df_processed = df.copy()
        
        # Create date features if datetime columns exist
        for col in df_processed.columns:
            if df_processed[col].dtype == 'datetime64[ns]':
                df_processed[f'{col}_year'] = df_processed[col].dt.year
                df_processed[f'{col}_month'] = df_processed[col].dt.month
                df_processed[f'{col}_day'] = df_processed[col].dt.day
                df_processed[f'{col}_weekday'] = df_processed[col].dt.weekday
        
        return df_processed
    
    def _create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create interaction features between numeric columns"""
        df_processed = df.copy()
        numeric_cols = df_processed.select_dtypes(include=[np.number]).columns
        
        if len(numeric_cols) >= 2:
            # Create pairwise interactions for first few numeric columns
            for i, col1 in enumerate(numeric_cols[:3]):
                for col2 in numeric_cols[i+1:4]:
                    df_processed[f'{col1}_x_{col2}'] = df_processed[col1] * df_processed[col2]
        
        return df_processed
    
    def _advanced_text_processing(self, df: pd.DataFrame, text_config: Dict[str, Any]) -> pd.DataFrame:
        """Advanced text processing"""
        if not text_config.get('advanced_cleaning', True):
            return df
        
        df_processed = df.copy()
        
        for col in df_processed.columns:
            if df_processed[col].dtype == 'object':
                # Advanced text cleaning
                df_processed[col] = self._advanced_text_cleaning(
                    df_processed[col], text_config
                )
        
        return df_processed
    
    def _advanced_text_cleaning(self, series: pd.Series, config: Dict[str, Any]) -> pd.Series:
        """Advanced text cleaning operations"""
        cleaned_series = series.astype(str)
        
        # Basic cleaning
        cleaned_series = cleaned_series.str.strip()
        cleaned_series = cleaned_series.str.replace(r'\s+', ' ', regex=True)
        
        # Advanced cleaning
        if config.get('lemmatization', True):
            try:
                cleaned_series = self._apply_lemmatization(cleaned_series)
            except:
                pass
        
        if config.get('stopword_removal', True):
            try:
                cleaned_series = self._remove_stopwords(cleaned_series, config)
            except:
                pass
        
        return cleaned_series
    
    def _apply_lemmatization(self, series: pd.Series) -> pd.Series:
        """Apply lemmatization to text"""
        try:
            from nltk.stem import WordNetLemmatizer
            lemmatizer = WordNetLemmatizer()
            
            def lemmatize_text(text):
                return ' '.join([lemmatizer.lemmatize(word) for word in text.split()])
            
            return series.apply(lemmatize_text)
        except:
            return series
    
    def _remove_stopwords(self, series: pd.Series, config: Dict[str, Any]) -> pd.Series:
        """Remove stopwords from text"""
        try:
            from nltk.corpus import stopwords
            stop_words = set(stopwords.words('english'))
            
            # Add custom stopwords
            custom_stopwords = config.get('custom_stopwords', [])
            stop_words.update(custom_stopwords)
            
            def remove_stopwords_text(text):
                return ' '.join([word for word in text.split() if word.lower() not in stop_words])
            
            return series.apply(remove_stopwords_text)
        except:
            return series
    
    def _data_scaling(self, df: pd.DataFrame, scaling_config: Dict[str, Any]) -> pd.DataFrame:
        """Apply data scaling and normalization"""
        if not scaling_config.get('enable', True):
            return df
        
        df_processed = df.copy()
        method = scaling_config.get('method', 'standard')
        columns = scaling_config.get('columns', 'auto')
        
        if columns == 'auto':
            columns = df_processed.select_dtypes(include=[np.number]).columns.tolist()
        
        for col in columns:
            if col in df_processed.columns and df_processed[col].dtype in ['int64', 'float64']:
                if method == 'standard':
                    scaler = StandardScaler()
                    df_processed[col] = scaler.fit_transform(df_processed[[col]]).flatten()
                    self.scalers[col] = scaler
        
        return df_processed
    
    def _outlier_handling(self, df: pd.DataFrame, outlier_config: Dict[str, Any]) -> pd.DataFrame:
        """Handle outliers in the data"""
        if not outlier_config.get('enable', True):
            return df
        
        df_processed = df.copy()
        method = outlier_config.get('method', 'iqr')
        action = outlier_config.get('action', 'cap')
        threshold = outlier_config.get('threshold', 1.5)
        
        numeric_cols = df_processed.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            outliers = self._detect_outliers(df_processed[col], method, threshold)
            
            if action == 'cap':
                df_processed[col] = self._cap_outliers(df_processed[col], outliers)
            elif action == 'remove':
                df_processed = df_processed.drop(outliers)
            elif action == 'transform':
                df_processed[col] = self._transform_outliers(df_processed[col], outliers)
        
        return df_processed
    
    def _detect_outliers(self, series: pd.Series, method: str, threshold: float) -> List[int]:
        """Detect outliers using specified method"""
        if method == 'iqr':
            return self._detect_outliers_iqr(series)
        elif method == 'zscore':
            return self._detect_outliers_zscore(series)
        else:
            return []
    
    def _cap_outliers(self, series: pd.Series, outliers: List[int]) -> pd.Series:
        """Cap outliers to the nearest non-outlier value"""
        if not outliers:
            return series
        
        Q1 = series.quantile(0.25)
        Q3 = series.quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        series_capped = series.copy()
        series_capped[series_capped < lower_bound] = lower_bound
        series_capped[series_capped > upper_bound] = upper_bound
        
        return series_capped
    
    def _transform_outliers(self, series: pd.Series, outliers: List[int]) -> pd.Series:
        """Transform outliers using log transformation"""
        if not outliers:
            return series
        
        series_transformed = series.copy()
        # Apply log transformation to positive values
        positive_mask = series_transformed > 0
        series_transformed[positive_mask] = np.log1p(series_transformed[positive_mask])
        
        return series_transformed
    
    def _advanced_column_operations(self, df: pd.DataFrame, column_config: Dict[str, Any]) -> pd.DataFrame:
        """Advanced column operations"""
        df_processed = df.copy()
        
        if column_config.get('advanced_selection', True):
            # Remove low-variance columns
            numeric_cols = df_processed.select_dtypes(include=[np.number]).columns
            low_variance_cols = []
            
            for col in numeric_cols:
                if df_processed[col].var() < 0.01:  # Low variance threshold
                    low_variance_cols.append(col)
            
            if low_variance_cols:
                df_processed = df_processed.drop(columns=low_variance_cols)
        
        return df_processed
    
    def _generate_advanced_stats(self, original_df: pd.DataFrame, processed_df: pd.DataFrame, 
                                config: Dict[str, Any], profile_result: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive preprocessing statistics"""
        return {
            'original_stats': {
                'rows': len(original_df),
                'columns': len(original_df.columns),
                'memory_usage': original_df.memory_usage(deep=True).sum()
            },
            'processed_stats': {
                'rows': len(processed_df),
                'columns': len(processed_df.columns),
                'memory_usage': processed_df.memory_usage(deep=True).sum()
            },
            'transformation_summary': {
                'rows_removed': len(original_df) - len(processed_df),
                'columns_removed': len(original_df.columns) - len(processed_df.columns),
                'null_values_handled': original_df.isna().sum().sum() - processed_df.isna().sum().sum(),
                'outliers_handled': len(profile_result.get('distribution_analysis', {})),
                'features_created': len(processed_df.columns) - len(original_df.columns)
            },
            'config_applied': config,
            'profile_result': profile_result,
            'processing_components': {
                'profiling': config.get('profiling', {}).get('enable', True),
                'advanced_null_handling': config.get('null_handling', {}).get('strategy') == 'advanced',
                'feature_engineering': config.get('feature_engineering', {}).get('enable', True),
                'advanced_text_processing': config.get('text_processing', {}).get('advanced_cleaning', True),
                'data_scaling': config.get('scaling', {}).get('enable', True),
                'outlier_handling': config.get('outlier_handling', {}).get('enable', True)
            }
        }
