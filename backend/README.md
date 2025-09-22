# CSV Chunking Optimizer Backend

A layered backend architecture for CSV document chunking with three distinct processing modes.

## Architecture

### Layer 1: Fast Mode (Port 8001)
- **Purpose**: Quick processing with best-practice defaults
- **Features**: Automatic optimization, minimal configuration
- **Use Case**: Rapid prototyping and simple CSV processing

### Layer 2: Config Mode (Port 8002)
- **Purpose**: Configurable processing with user control
- **Features**: Customizable parameters, multiple options
- **Use Case**: Balanced control and ease-of-use

### Layer 3: Deep Config (Port 8003)
- **Purpose**: Advanced processing with full control
- **Features**: Expert-level configuration, advanced algorithms
- **Use Case**: Production systems and complex requirements

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start Layer 1 (Fast Mode)
```bash
cd backend/layer1_fast_mode
python main.py
```

### 3. Test the API
```bash
curl http://localhost:8001/health
```

## API Endpoints

### Layer 1 (Fast Mode) - Port 8001

#### Upload CSV
```bash
POST /upload
Content-Type: multipart/form-data
```

#### Process CSV (Complete Pipeline)
```bash
POST /process
Content-Type: multipart/form-data
```

#### Search
```bash
POST /search
Content-Type: application/json
{
  "query": "your search query",
  "n_results": 5
}
```

#### List Collections
```bash
GET /collections
```

#### Get Collection Info
```bash
GET /collections/{collection_name}
```

## Frontend Integration

### React Integration Example

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:8001';

// Upload and Process CSV
const processCSV = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/process`, {
    method: 'POST',
    body: formData,
  });
  
  return await response.json();
};

// Search
const search = async (query, nResults = 5) => {
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      n_results: nResults
    }),
  });
  
  return await response.json();
};
```

## Processing Pipeline

1. **Upload**: CSV file validation and basic info
2. **Preprocessing**: Data cleaning and type conversion
3. **Chunking**: Split data into manageable chunks
4. **Embedding**: Generate vector representations
5. **Storage**: Store in ChromaDB vector database
6. **Retrieval**: Semantic search capabilities

## Configuration

### Layer 1 Defaults
- Chunk Size: 100 rows
- Overlap: 10 rows
- Model: all-MiniLM-L6-v2
- Batch Size: 32
- Collection: fast_mode_chunks

### Layer 2 Options
- Multiple chunking strategies
- Configurable preprocessing
- Model selection
- Storage backends

### Layer 3 Advanced
- Semantic chunking
- Advanced preprocessing
- Multiple embedding models
- Custom storage configurations

## Development

### Running Tests
```bash
# Test Layer 1
cd backend/layer1_fast_mode
python -m pytest tests/

# Test all layers
cd backend
python -m pytest
```

### Adding New Features
1. Create component in appropriate layer
2. Add to main.py endpoints
3. Update requirements.txt if needed
4. Test with frontend integration

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure existing backend is in Python path
2. **Port Conflicts**: Change ports in main.py files
3. **CORS Issues**: Update allowed origins in CORS middleware
4. **Memory Issues**: Reduce batch sizes in embedding

### Logs
Check console output for detailed error messages and processing statistics.

## Contributing

1. Follow the layered architecture
2. Add comprehensive error handling
3. Include type hints
4. Write tests for new features
5. Update documentation

---

# PowerShell Commands for Running the Backend Layers

## 1. Start Backend Layers

### Terminal 1 - Layer 1 (Fast Mode):
```powershell
cd backend\layer1_fast_mode
python main.py
```

### Terminal 2 - Layer 2 (Config Mode):
```powershell
cd backend\layer2_config_mode
python main.py
```

### Terminal 3 - Layer 3 (Deep Config):
```powershell
cd backend\layer3_deep_config
python main.py
```

## 2. Start Frontend

### Terminal 4 - Frontend:
```powershell
cd ..
npm start
```

## 3. Test Backend Health

### Test each backend separately:
```powershell
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

### Or use PowerShell's Invoke-WebRequest:
```powershell
Invoke-WebRequest -Uri http://localhost:8001/health
Invoke-WebRequest -Uri http://localhost:8002/health
Invoke-WebRequest -Uri http://localhost:8003/health
```

## 4. Quick Test Script (PowerShell)

### Create a test script:
```powershell
Write-Host "Testing Layer 1..."
try { Invoke-WebRequest -Uri http://localhost:8001/health | Select-Object StatusCode } catch { Write-Host "Layer 1 not running" }

Write-Host "Testing Layer 2..."
try { Invoke-WebRequest -Uri http://localhost:8002/health | Select-Object StatusCode } catch { Write-Host "Layer 2 not running" }

Write-Host "Testing Layer 3..."
try { Invoke-WebRequest -Uri http://localhost:8003/health | Select-Object StatusCode } catch { Write-Host "Layer 3 not running" }
```

## 5. Alternative: Use Command Prompt

### If you prefer, open Command Prompt (cmd) instead of PowerShell:
```cmd
cd backend\layer1_fast_mode && python main.py
```

## 6. Ports

- Frontend: 3000
- Backend Layer 1: 8001
- Backend Layer 2: 8002
- Backend Layer 3: 8003

## 7. API Documentation

- Layer 1: http://localhost:8001/docs
- Layer 2: http://localhost:8002/docs
- Layer 3: http://localhost:8003/docs

## 8. Complete Flow Test

1. Open http://localhost:3000
2. Upload a CSV file
3. Select a layer (Fast/Config/Deep)
4. Process the file
5. Search the data

## 9. Troubleshooting

### Port Already in Use:
```powershell
netstat -ano | findstr :8001
netstat -ano | findstr :8002
netstat -ano | findstr :8003
taskkill /PID <PID> /F
```

### Import Errors:
```powershell
pip install -r requirements.txt
```

### ChromaDB Issues:
The database will be created automatically in the chroma_db folder.
