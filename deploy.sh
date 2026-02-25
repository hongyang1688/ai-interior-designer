#!/bin/bash

# AI Interior Designer - Local Deployment Script
# This script helps you deploy the application locally

set -e

echo "🏠 AI Interior Designer - Local Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if ! command_exists python3; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_info "All prerequisites met!"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to setup backend
setup_backend() {
    print_info "Setting up backend..."
    cd "$SCRIPT_DIR/backend"
    
    # Create virtual environment if not exists
    if [ ! -d "venv" ]; then
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_info "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env if not exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found, creating from example..."
        cp .env.example .env
        print_warning "Please edit .env file to add your Kimi API key"
    fi
    
    print_info "Backend setup complete!"
}

# Function to setup frontend
setup_frontend() {
    print_info "Setting up frontend..."
    cd "$SCRIPT_DIR/frontend"
    
    # Install dependencies
    print_info "Installing npm packages..."
    npm install
    
    print_info "Frontend setup complete!"
}

# Function to start backend
start_backend() {
    print_info "Starting backend server..."
    cd "$SCRIPT_DIR/backend"
    source venv/bin/activate
    
    # Check if .env has been configured
    if grep -q "your-kimi-api-key" .env 2>/dev/null; then
        print_warning "Kimi API key not configured in .env file"
        print_warning "The application will use mock responses for AI features"
    fi
    
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$SCRIPT_DIR/.backend.pid"
    print_info "Backend started on http://localhost:8000"
    print_info "API documentation: http://localhost:8000/docs"
}

# Function to start frontend
start_frontend() {
    print_info "Starting frontend development server..."
    cd "$SCRIPT_DIR/frontend"
    
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$SCRIPT_DIR/.frontend.pid"
    print_info "Frontend started on http://localhost:3000"
}

# Function to stop services
stop_services() {
    print_info "Stopping services..."
    
    if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
        kill $(cat "$SCRIPT_DIR/.backend.pid") 2>/dev/null || true
        rm "$SCRIPT_DIR/.backend.pid"
    fi
    
    if [ -f "$SCRIPT_DIR/.frontend.pid" ]; then
        kill $(cat "$SCRIPT_DIR/.frontend.pid") 2>/dev/null || true
        rm "$SCRIPT_DIR/.frontend.pid"
    fi
    
    print_info "Services stopped"
}

# Function to show help
show_help() {
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup      - Setup both backend and frontend (install dependencies)"
    echo "  start      - Start both backend and frontend servers"
    echo "  stop       - Stop all running services"
    echo "  restart    - Restart all services"
    echo "  backend    - Start only backend server"
    echo "  frontend   - Start only frontend server"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh setup     # First time setup"
    echo "  ./deploy.sh start     # Start the application"
    echo "  ./deploy.sh stop      # Stop the application"
}

# Main logic
case "${1:-help}" in
    setup)
        setup_backend
        setup_frontend
        print_info "Setup complete! Run './deploy.sh start' to start the application."
        ;;
    start)
        stop_services
        start_backend
        sleep 2
        start_frontend
        echo ""
        print_info "Application started!"
        echo ""
        echo "Backend:  http://localhost:8000"
        echo "Frontend: http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop"
        wait
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 1
        start_backend
        sleep 2
        start_frontend
        wait
        ;;
    backend)
        start_backend
        wait
        ;;
    frontend)
        start_frontend
        wait
        ;;
    help|*)
        show_help
        ;;
esac