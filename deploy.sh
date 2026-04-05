#!/bin/bash

# Stack - CS2 Teammate Finder
# Deployment Script for Ubuntu 24.04 VM

set -e

echo "🚀 Starting Stack deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing..."
    sudo apt update
    sudo apt install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    sudo systemctl enable docker
    sudo systemctl start docker
fi

echo "✅ Docker is installed: $(docker --version)"

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose plugin not found"
    exit 1
fi

echo "✅ Docker Compose is available"

# Clone repository (if not already present)
if [ ! -d "se-toolkit-hackathon" ]; then
    echo "📦 Cloning repository..."
    git clone https://github.com/Davidkaaa33/se-toolkit-hackathon.git
    cd se-toolkit-hackathon
else
    echo "📦 Repository found, pulling latest changes..."
    cd se-toolkit-hackathon
    git pull
fi

# Build and start services
echo "🔨 Building and starting services..."
sudo docker compose down
sudo docker compose up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for database to be healthy..."
sleep 10

# Check service status
echo "📊 Service status:"
sudo docker compose ps

echo ""
echo "✅ Stack is deployed!"
echo "🌐 Open http://$(hostname -I | awk '{print $1}') in your browser"
echo ""
echo "Useful commands:"
echo "  sudo docker compose logs -f        # View logs"
echo "  sudo docker compose down           # Stop services"
echo "  sudo docker compose restart        # Restart services"
