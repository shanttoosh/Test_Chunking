# 🚀 How to Run the Backend Layers

## Prerequisites
- Python 3.8+ installed
- All packages installed from `requirements.txt`
- Your existing `CHUNKING_PROJECT` folder accessible

## Quick Start

### 1. Start Layer 1 (Fast Mode) - Port 8001
```bash
cd backend/layer1_fast_mode
python main.py
```
**Access at:** http://localhost:8001

### 2. Start Layer 2 (Config Mode) - Port 8002
```bash
cd backend/layer2_config_mode
python main.py
```
**Access at:** http://localhost:8002

### 3. Start Layer 3 (Deep Config) - Port 8003
```bash
cd backend/layer3_deep_config
python main.py
```
**Access at:** http://localhost:8003

## Running All Layers Simultaneously

### Option 1: Separate Terminal Windows
Open 3 separate terminal windows and run each layer in its own terminal.

### Option 2: Background Processes
```bash
# Start Layer 1 in background
cd backend/layer1_fast_mode && python main.py &

# Start Layer 2 in background
cd backend/layer2_config_mode && python main.py &

# Start Layer 3 in background
cd backend/layer3_deep_config && python main.py &
```

## Testing the APIs

### Health Check
```bash
# Test each layer
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

### Upload and Process CSV
```bash
# Upload a CSV file
curl -X POST "http://localhost:8001/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_file.csv"

# Process the uploaded file
curl -X POST "http://localhost:8001/process" \
  -H "Content-Type: application/json" \
  -d '{"collection_name": "test_collection"}'
```

### Search
```bash
# Search in Layer 1
curl -X POST "http://localhost:8001/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "your search query", "collection_name": "test_collection"}'
```

## Frontend Integration

Update your React app to use these endpoints:

```javascript
// Layer 1 (Fast Mode)
const FAST_MODE_API = 'http://localhost:8001';

// Layer 2 (Config Mode)  
const CONFIG_MODE_API = 'http://localhost:8002';

// Layer 3 (Deep Config)
const DEEP_CONFIG_API = 'http://localhost:8003';
```

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
```bash
# Find and kill processes using the ports
netstat -ano | findstr :8001
netstat -ano | findstr :8002
netstat -ano | findstr :8003

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Import Errors
Make sure you're in the correct directory and all packages are installed:
```bash
pip install -r requirements.txt
```

### ChromaDB Issues
If you get ChromaDB errors, the database will be created automatically in the `chroma_db` folder.

## API Documentation

Once running, visit:
- Layer 1: http://localhost:8001/docs
- Layer 2: http://localhost:8002/docs  
- Layer 3: http://localhost:8003/docs

## Next Steps

1. **Test each layer** with sample CSV files
2. **Update your React frontend** to use the new APIs
3. **Configure Layer 2** with custom settings
4. **Use Layer 3** for advanced preprocessing and analysis
