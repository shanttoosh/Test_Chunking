@echo off
echo Starting CSV Chunking Optimizer Backend...
echo.

cd backend

echo Creating virtual environment (if not exists)...
if not exist venv (
    python -m venv venv
    echo Virtual environment created.
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting FastAPI server...
python main.py

pause
