#!/bin/bash

# 教师课程跟踪系统 - 数据库迁移脚本
# 用途: 执行教师课程管理相关的数据库表创建和扩展

echo "🚀 开始执行教师课程跟踪系统数据库迁移..."
echo "============================================"

# 数据库配置 (请根据实际情况修改)
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="kargerdensales"
DB_USER="root"
DB_PASS=""

# SQL文件路径
SQL_FILE="../server/database/migrations/add-teacher-course-tracking.sql"

# 检查SQL文件是否存在
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 错误: SQL文件不存在: $SQL_FILE"
    exit 1
fi

echo "📄 SQL文件: $SQL_FILE"
echo "🗄️  数据库: $DB_NAME"
echo "🖥️  主机: $DB_HOST:$DB_PORT"
echo ""

# 提示用户确认
read -p "⚠️  是否继续执行迁移? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "❌ 已取消迁移"
    exit 0
fi

echo ""
echo "⏳ 正在执行SQL迁移..."
echo "============================================"

# 执行SQL文件
if [ -z "$DB_PASS" ]; then
    # 无密码
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" < "$SQL_FILE"
else
    # 有密码
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"
fi

# 检查执行结果
if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✅ 数据库迁移成功!"
    echo ""
    echo "📋 已创建的表:"
    echo "   - teacher_class_courses"
    echo "   - teacher_course_records"
    echo "   - student_course_progress"
    echo ""
    echo "🔧 已扩展的表:"
    echo "   - course_progress (添加teacher_id等字段)"
    echo "   - course_plans (添加is_published等字段)"
    echo ""
    echo "👁️  已创建的视图:"
    echo "   - v_teacher_courses_overview"
    echo ""
    echo "🎉 系统已就绪,可以开始使用教师课程管理功能!"
    echo "============================================"
else
    echo ""
    echo "============================================"
    echo "❌ 数据库迁移失败!"
    echo "请检查:"
    echo "  1. 数据库连接信息是否正确"
    echo "  2. 用户权限是否足够"
    echo "  3. 表是否已存在"
    echo "  4. SQL语法是否有误"
    echo "============================================"
    exit 1
fi

echo ""
echo "📖 下一步操作:"
echo "  1. 重启后端服务: cd server && npm run dev"
echo "  2. 访问API文档: http://localhost:3000/api-docs"
echo "  3. 测试API: curl -H 'Authorization: Bearer <token>' http://localhost:3000/api/teacher/courses"
echo ""
