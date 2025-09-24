#!/bin/bash
echo "Starting CSV Chunking Optimizer Backend..."
echo

cd backend

echo "Creating virtual environment (if not exists)..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "Virtual environment created."
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo
echo "Starting FastAPI server..."
python main.py
