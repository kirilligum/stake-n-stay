#!/bin/bash

echo "🏠 Airbnb Clone - Project Startup Script"
echo "========================================"

# Check if MongoDB is running
echo "📦 Checking if MongoDB is running..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running. Please start MongoDB first:"
    echo "   brew services start mongodb/brew/mongodb-community (macOS)"
    echo "   sudo systemctl start mongod (Linux)"
    echo "   or start MongoDB manually"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting Airbnb Clone Application"
echo "====================================="
echo ""
echo "Starting backend server on port 5000..."
echo "Starting frontend on port 3000..."
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📖 To stop the servers, press Ctrl+C in both terminals"
echo ""

# Start both servers in parallel
npm run server:dev & npm run dev

wait