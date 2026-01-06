#!/bin/bash

# 从 .env 读取数据库配置
source server/.env

echo "=== 数据库连接信息 ==="
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# 检查表是否存在
echo "=== 检查相册库表 ==="
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT TABLE_NAME FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '$DB_NAME' 
AND TABLE_NAME IN ('photos', 'photo_albums', 'photo_album_items', 'photo_students', 'photo_videos', 'student_face_libraries')
ORDER BY TABLE_NAME;
" 2>/dev/null

echo ""
echo "=== 检查其他关键表 ==="
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = '$DB_NAME' 
AND TABLE_NAME IN ('users', 'students', 'classes', 'teachers', 'activity_registrations')
ORDER BY TABLE_NAME;
" 2>/dev/null
