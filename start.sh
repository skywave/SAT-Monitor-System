#!/bin/bash
echo "Starting SAT Monitor..."
docker-compose up -d
echo "Done! Services running:"
docker-compose ps
