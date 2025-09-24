@echo off
echo Starting CSV Chunking Optimizer Backend...
echo.

cd backend

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI server...
python main.py

pause
