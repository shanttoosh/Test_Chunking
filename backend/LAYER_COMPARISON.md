# CSV Chunking Optimizer - Layer Comparison

## Overview

The CSV Chunking Optimizer provides three distinct layers, each designed for different use cases and user expertise levels.

## Layer Comparison

| Feature | Layer 1 (Fast Mode) | Layer 2 (Config Mode) | Layer 3 (Deep Config) |
|---------|---------------------|----------------------|----------------------|
| **Port** | 8001 | 8002 | 8003 |
| **Target Users** | Beginners, Quick Start | Intermediate Users | Advanced Users, Experts |
| **Configuration** | Automatic, Best Practices | User Configurable | Expert-Level Control |
| **Processing Speed** | Fastest | Moderate | Slower (More Analysis) |
| **Complexity** | Low | Medium | High |

## Layer 1: Fast Mode (Port 8001)

### Purpose
Quick processing with automatic optimization and best-practice defaults.

### Features
- **Automatic Preprocessing**: Smart data cleaning with minimal configuration
- **Fixed-Size Chunking**: Optimized chunking with 100-row chunks and 10-row overlap
- **Default Embedding**: Uses all-MiniLM-L6-v2 model
- **Simple Storage**: Basic ChromaDB storage
- **Fast Retrieval**: Basic semantic search

### Use Cases
- Rapid prototyping
- Simple CSV processing
- Learning and experimentation
- Quick demos

### Configuration
```json
{
  "chunk_size": 100,
  "overlap": 10,
  "model_name": "all-MiniLM-L6-v2",
  "batch_size": 32,
  "collection_name": "fast_mode_chunks"
}
```

## Layer 2: Config Mode (Port 8002)

### Purpose
Configurable processing with user control over key parameters.

### Features
- **Configurable Preprocessing**: User-defined null handling, type conversion, text processing
- **Multiple Chunking Methods**: Fixed, recursive, and document-based chunking
- **Model Selection**: Choose from available embedding models
- **Advanced Storage**: Configurable collection management
- **Enhanced Retrieval**: Improved search with metadata

### Use Cases
- Production systems
- Custom data processing
- Balanced control and ease-of-use
- Specific requirements

### Configuration
```json
{
  "preprocessing": {
    "null_handling": {
      "strategy": "smart",
      "fill_method": "auto"
    },
    "type_conversion": {
      "auto_detect": true
    }
  },
  "chunking": {
    "method": "fixed",
    "fixed_size": {
      "chunk_size": 100,
      "overlap": 10
    }
  },
  "embedding": {
    "model_name": "all-MiniLM-L6-v2",
    "batch_size": 32
  }
}
```

## Layer 3: Deep Config (Port 8003)

### Purpose
Advanced processing with expert-level control and comprehensive analysis.

### Features
- **Advanced Preprocessing**: ML-based imputation, feature engineering, outlier detection
- **Comprehensive Profiling**: Detailed data analysis, correlation analysis, distribution analysis
- **Advanced Text Processing**: Lemmatization, stemming, stopword removal, sentiment analysis
- **Data Scaling**: Multiple scaling methods (standard, minmax, robust)
- **Outlier Handling**: Multiple detection methods (IQR, Z-score, isolation forest)
- **Feature Engineering**: Derived features, interaction features, custom features
- **Advanced Search**: Filtering capabilities, similarity thresholds

### Use Cases
- Research and analysis
- Complex data processing
- Production systems with specific requirements
- Expert-level customization

### Configuration
```json
{
  "preprocessing": {
    "profiling": {
      "enable": true,
      "detailed_analysis": true,
      "correlation_analysis": true,
      "distribution_analysis": true
    },
    "null_handling": {
      "strategy": "ml_based",
      "ml_imputation": true,
      "knn_neighbors": 5
    },
    "feature_engineering": {
      "enable": true,
      "create_derived_features": true,
      "interaction_features": true
    },
    "text_processing": {
      "advanced_cleaning": true,
      "lemmatization": true,
      "stopword_removal": true
    },
    "scaling": {
      "enable": true,
      "method": "standard"
    },
    "outlier_handling": {
      "enable": true,
      "method": "iqr",
      "action": "cap"
    }
  }
}
```

## API Endpoints Comparison

### Common Endpoints (All Layers)
- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /upload` - Upload CSV file
- `POST /process` - Process CSV file
- `POST /search` - Search stored data
- `GET /collections` - List collections
- `GET /collections/{name}` - Get collection info
- `GET /stats` - Get processing statistics

### Layer-Specific Endpoints

#### Layer 2 (Config Mode)
- `GET /config/defaults` - Get default configurations

#### Layer 3 (Deep Config)
- `GET /config/defaults` - Get default configurations
- `GET /config/advanced-options` - Get advanced options descriptions

## Performance Characteristics

| Metric | Layer 1 | Layer 2 | Layer 3 |
|--------|---------|---------|---------|
| **Processing Speed** | Fastest | Moderate | Slowest |
| **Memory Usage** | Low | Medium | High |
| **CPU Usage** | Low | Medium | High |
| **Analysis Depth** | Basic | Intermediate | Comprehensive |
| **Configuration Time** | Minimal | Moderate | Extensive |

## Choosing the Right Layer

### Choose Layer 1 (Fast Mode) if:
- You need quick results
- You're new to CSV chunking
- You want minimal configuration
- You're prototyping or experimenting
- You have simple CSV files

### Choose Layer 2 (Config Mode) if:
- You need some control over processing
- You have specific requirements
- You want to balance speed and control
- You're building production systems
- You need different chunking strategies

### Choose Layer 3 (Deep Config) if:
- You need expert-level control
- You have complex data processing requirements
- You want comprehensive data analysis
- You're doing research or advanced analysis
- You need advanced features like ML-based imputation

## Migration Path

### From Layer 1 to Layer 2
- Add configuration parameters
- Specify chunking method
- Configure preprocessing options
- Set embedding model preferences

### From Layer 2 to Layer 3
- Enable advanced preprocessing features
- Add data profiling and analysis
- Configure feature engineering
- Set up advanced text processing
- Enable outlier detection and handling

## Best Practices

### Layer 1
- Use for quick testing and prototyping
- Keep default settings for best performance
- Monitor processing time and memory usage

### Layer 2
- Start with default configurations
- Gradually customize based on your data
- Test different chunking methods
- Monitor quality metrics

### Layer 3
- Use data profiling to understand your data
- Configure features based on data characteristics
- Monitor advanced metrics and quality
- Optimize based on performance requirements

## Troubleshooting

### Common Issues
1. **Import Errors**: Ensure existing backend is in Python path
2. **Port Conflicts**: Change ports in main.py files
3. **Memory Issues**: Reduce batch sizes or chunk sizes
4. **Processing Time**: Use Layer 1 for faster processing

### Performance Optimization
1. **Layer 1**: Use default settings for best performance
2. **Layer 2**: Optimize chunking parameters
3. **Layer 3**: Disable unnecessary features for better performance

## Support and Documentation

- **Layer 1**: Basic documentation and examples
- **Layer 2**: Configuration guides and best practices
- **Layer 3**: Comprehensive documentation and advanced examples

Each layer is designed to be self-contained while building upon the previous layer's capabilities.
