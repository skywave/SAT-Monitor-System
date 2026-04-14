#!/bin/bash

# Colors for different services
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}       SAT MONITOR LAUNCHER              ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Start all services
echo -e "${YELLOW}Starting SAT Monitor services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}        SERVICES STARTED                 ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${CYAN}🌐 Frontend URL:${NC} ${GREEN}http://localhost:8081${NC}"
echo ""
echo -e "${YELLOW}Service Ports:${NC}"
echo -e "   Main Collector API:   ${BLUE}http://localhost:3000${NC}"
echo -e "   Notification Collector: ${BLUE}http://localhost:3001${NC}"
echo -e "   Notification System:  ${BLUE}http://localhost:4000${NC}"
echo -e "   PostgreSQL:           ${BLUE}localhost:5434${NC}"
echo ""
echo -e "${YELLOW}Showing live logs (color-coded by service)${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop viewing logs (containers keep running)${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Show logs with color-coded prefixes
docker-compose logs -f --tail=50 2>&1 | while read line; do
    if echo "$line" | grep -q "main-collector"; then
        echo -e "${MAGENTA}[MAIN-COLLECTOR]${NC} ${line#*|}"
    elif echo "$line" | grep -q "notification-collector"; then
        echo -e "${CYAN}[NOTIF-COLLECTOR]${NC} ${line#*|}"
    elif echo "$line" | grep -q "notifications"; then
        echo -e "${YELLOW}[NOTIFICATIONS]${NC} ${line#*|}"
    elif echo "$line" | grep -q "postgres"; then
        echo -e "${BLUE}[POSTGRES]${NC} ${line#*|}"
    elif echo "$line" | grep -q "nginx"; then
        echo -e "${GREEN}[FRONTEND]${NC} ${line#*|}"
    else
        echo "$line"
    fi
done
