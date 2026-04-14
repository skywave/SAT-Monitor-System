#!/bin/bash
echo "Starting SAT Monitor..."
docker-compose up -d
echo "SAT Monitor running!"
echo "Frontend: http://localhost:8081"
echo "Main Collector API: http://localhost:3000"
echo "Notification System: http://localhost:4000"
