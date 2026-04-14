#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}       SAT MONITOR LOGS VIEWER           ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to exit logs${NC}"
echo ""

docker-compose logs -f --tail=100
