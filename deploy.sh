#!/bin/bash

set -e

echo "🚀 Starting Warframe Trade Companion deployment..."

# Function to display help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev       Start development environment"
    echo "  prod      Start production environment"
    echo "  stop      Stop all containers"
    echo "  rebuild   Rebuild and restart containers"
    echo "  logs      Show container logs"
    echo "  clean     Remove containers, images, and volumes"
    echo "  help      Show this help message"
    echo ""
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Development deployment
dev_deployment() {
    echo "🔧 Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build -d
    echo "✅ Development environment started!"
    echo "📱 Application available at: http://localhost:3000"
}

# Production deployment
prod_deployment() {
    echo "🏭 Starting production environment..."
    docker-compose up --build -d
    echo "✅ Production environment started!"
    echo "📱 Application available at: http://localhost:3000"
}

# Stop containers
stop_containers() {
    echo "⏹️ Stopping containers..."
    docker-compose down || true
    docker-compose -f docker-compose.dev.yml down || true
    echo "✅ Containers stopped"
}

# Rebuild containers
rebuild_containers() {
    echo "🔄 Rebuilding containers..."
    stop_containers
    if [ "$1" = "dev" ]; then
        dev_deployment
    else
        prod_deployment
    fi
}

# Show logs
show_logs() {
    echo "📋 Showing container logs..."
    if docker-compose ps | grep -q "warframe-trade-companion-dev"; then
        docker-compose -f docker-compose.dev.yml logs -f
    elif docker-compose ps | grep -q "warframe-trade-companion"; then
        docker-compose logs -f
    else
        echo "❌ No containers are running"
    fi
}

# Clean up Docker resources
cleanup() {
    echo "🧹 Cleaning up Docker resources..."
    stop_containers
    
    # Remove containers
    docker-compose rm -f || true
    docker-compose -f docker-compose.dev.yml rm -f || true
    
    # Remove images
    docker rmi warframe-trade-companion-warframe-trade-companion 2>/dev/null || true
    docker rmi warframe-trade-companion-warframe-trade-companion-dev 2>/dev/null || true
    
    # Remove volumes
    docker volume rm warframe-trade-companion_db-data 2>/dev/null || true
    docker volume rm warframe-trade-companion_db-data-dev 2>/dev/null || true
    
    echo "✅ Cleanup completed"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        "dev")
            dev_deployment
            ;;
        "prod")
            prod_deployment  
            ;;
        "stop")
            stop_containers
            ;;
        "rebuild")
            rebuild_containers "${2:-prod}"
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            cleanup
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

main "$@"