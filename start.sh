#!/bin/bash
# Start both backend and frontend servers

echo "🚀 Starting ChatBox React Application"
echo "=================================="

# Start Backend
echo ""
echo "1️⃣  Starting Backend Server (port 5000)..."
cd backend
npm install > /dev/null 2>&1
npm start &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 2

# Start Frontend
echo ""
echo "2️⃣  Starting Frontend Server (port 3000)..."
cd ../frontend
npm install > /dev/null 2>&1
npm start &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Both servers started!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://127.0.0.1:3000"
echo "Backend:  http://127.0.0.1:5000"
echo ""
echo "Press Ctrl+C to stop"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
