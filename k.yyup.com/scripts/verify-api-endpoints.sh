#!/bin/bash

echo "🔍 验证API端点存在性"
echo "======================================"

ENDPOINTS=(
  "ai-billing/bills"
  "business/overview"
  "call-center/records"
  "documents"
  "inspection-center/tasks"
  "notifications"
  "permissions/roles"
  "photo-albums"
  "principal/dashboard"
  "schedules"
  "system-logs"
  "system/settings"
  "system/status"
  "tasks/my"
  "teaching-center/course-progress"
  "users"
)

ROUTES_DIR="server/src/routes"

for endpoint in "${ENDPOINTS[@]}"; do
  MODULE=$(echo "$endpoint" | cut -d'/' -f1)
  ACTION=$(echo "$endpoint" | cut -d'/' -f2-)
  
  ROUTE_FILE="$ROUTES_DIR/${MODULE}.routes.ts"
  
  # 特殊处理一些端点
  case "$MODULE" in
    "ai-billing") ROUTE_FILE="$ROUTES_DIR/ai-billing.routes.ts" ;;
    "call-center") ROUTE_FILE="$ROUTES_DIR/call-center.routes.ts" ;;
    "inspection-center") ROUTE_FILE="$ROUTES_DIR/inspection-center.routes.ts" ;;
    "photo-albums") ROUTE_FILE="$ROUTES_DIR/photo-album.routes.ts" ;;
    "system") ROUTE_FILE="$ROUTES_DIR/system.routes.ts" ;;
    "permissions") ROUTE_FILE="$ROUTES_DIR/permissions.routes.ts" ;;
  esac
  
  if [ -f "$ROUTE_FILE" ]; then
    if grep -q "'/$ACTION'" "$ROUTE_FILE" || grep -q "\"/$ACTION\"" "$ROUTE_FILE"; then
      echo "✅ /$endpoint (found in ${ROUTE_FILE##*/})"
    else
      echo "❌ /$endpoint (NOT found - route file exists but endpoint missing)"
    fi
  else
    echo "⚠️  /$endpoint (route file not found: $ROUTE_FILE)"
  fi
done

