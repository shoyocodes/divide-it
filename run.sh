#!/bin/bash

# Kill background processes on exit
trap "kill 0" EXIT

echo "------------------------------------------"
echo "Starting Divide-It Application..."
echo "------------------------------------------"

# check if venv exists
if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment 'venv' not found."
    echo "Please run the setup steps first."
    exit 1
fi

# check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "WARNING: frontend/node_modules not found. Running npm install..."
    cd frontend && npm install && cd ..
fi

# Start Backend
echo "Starting Django Backend on http://localhost:8000 ..."
./venv/bin/python backend/manage.py runserver 8000 &

# Start Frontend
echo "Starting Vite Frontend on http://localhost:5173 ..."
cd frontend
npm run dev -- --port 5173 &

echo "------------------------------------------"
echo "Application is starting..."
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000/api"
echo "------------------------------------------"

# Keep script running
wait
