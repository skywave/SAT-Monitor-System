#!/bin/bash

echo "========================================="
echo "SAT MONITOR - VM BUNDLE CREATOR"
echo "========================================="

# Create bundle directory
BUNDLE_DIR="sat-monitor-bundle-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BUNDLE_DIR"

echo "📁 Creating bundle in: $BUNDLE_DIR"

# 1. Save Docker images
echo "📦 Saving Docker images..."
docker save sat-monitor-system_main-collector -o "$BUNDLE_DIR/main-collector.tar"
docker save sat-monitor-system_notifications -o "$BUNDLE_DIR/notifications.tar"
docker save sat-monitor-system_nginx -o "$BUNDLE_DIR/nginx.tar"
docker save postgres:15-alpine -o "$BUNDLE_DIR/postgres.tar"

# 2. Copy docker-compose.yml
echo "📋 Copying docker-compose.yml..."
cp docker-compose.yml "$BUNDLE_DIR/"

# 3. Copy .env files
echo "🔧 Copying .env files..."
cp collectorService/collector/.env "$BUNDLE_DIR/.env.main-collector"
cp NotificationSystem/.env "$BUNDLE_DIR/.env.notifications"

# 4. Copy database schema
echo "🗄️ Copying database schema..."
cp collectorService/collector/latest_schema.sql "$BUNDLE_DIR/schema.sql" 2>/dev/null || echo "No schema.sql found"

# 5. Create deployment script for VM
cat > "$BUNDLE_DIR/deploy.sh" << 'DEPLOYEOF'
#!/bin/bash
echo "========================================="
echo "SAT MONITOR - VM DEPLOYMENT"
echo "========================================="

# Create directories
mkdir -p collectorService/collector NotificationSystem

# Restore .env files
cp .env.main-collector collectorService/collector/.env
cp .env.notifications NotificationSystem/.env

# Load Docker images
echo "Loading Docker images..."
docker load < main-collector.tar
docker load < notifications.tar
docker load < nginx.tar
docker load < postgres.tar

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for database
sleep 10

# Load schema if exists
if [ -f schema.sql ]; then
    echo "Loading database schema..."
    docker exec -i sat-postgres psql -U satmonitor -d satmonitor < schema.sql
fi

echo "========================================="
echo "✅ SAT MONITOR DEPLOYED!"
echo "🌐 Frontend: http://localhost:8081"
echo "📡 API: http://localhost:3000"
echo "========================================="
DEPLOYEOF

chmod +x "$BUNDLE_DIR/deploy.sh"

# 6. Create stop script
cat > "$BUNDLE_DIR/stop.sh" << 'STOPEOF'
#!/bin/bash
docker-compose down
echo "SAT Monitor stopped"
STOPEOF

chmod +x "$BUNDLE_DIR/stop.sh"

# 7. Bundle everything into a tar.gz
echo "📦 Creating final archive..."
tar -czvf "$BUNDLE_DIR.tar.gz" "$BUNDLE_DIR"

echo "========================================="
echo "✅ BUNDLE CREATED!"
echo "📁 Bundle: $BUNDLE_DIR.tar.gz"
echo "📏 Size: $(du -h $BUNDLE_DIR.tar.gz | cut -f1)"
echo "========================================="
