#!/bin/bash

# 教师考勤中心一键部署脚本
# 使用方法: bash scripts/deploy-teacher-attendance.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署教师考勤中心..."
echo "================================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤1: 编译后端代码
echo -e "${YELLOW}📦 步骤1: 编译后端代码...${NC}"
cd server
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 后端编译成功${NC}"
else
    echo -e "${RED}❌ 后端编译失败${NC}"
    exit 1
fi
cd ..

# 步骤2: 创建数据库表
echo -e "${YELLOW}📋 步骤2: 创建数据库表...${NC}"
cd server

# 检查init.js是否存在
if [ -f "dist/init.js" ]; then
    node scripts/init-teacher-attendance.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 数据库表创建成功${NC}"
    else
        echo -e "${RED}❌ 数据库表创建失败${NC}"
        echo -e "${YELLOW}💡 提示: 请检查数据库连接配置${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 找不到编译后的文件，请先运行 npm run build${NC}"
    exit 1
fi
cd ..

# 步骤3: 验证表结构
echo -e "${YELLOW}🔍 步骤3: 验证表结构...${NC}"
echo "SELECT COUNT(*) as count FROM teacher_attendances;" | mysql -u root -p123456 kindergartensales 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 表结构验证成功${NC}"
else
    echo -e "${YELLOW}⚠️  无法验证表结构（可能是MySQL命令不可用）${NC}"
fi

# 步骤4: 显示部署信息
echo ""
echo "================================"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "================================"
echo ""
echo "📝 下一步操作:"
echo "1. 启动服务:"
echo "   npm run start:all"
echo ""
echo "2. 访问系统:"
echo "   前端: http://k.yyup.cc"
echo "   后端: http://localhost:3000"
echo "   API文档: http://localhost:3000/api-docs"
echo ""
echo "3. 测试功能:"
echo "   - 登录系统（使用教师账号）"
echo "   - 访问：教师中心 → 考勤管理"
echo "   - 测试签到/签退功能"
echo ""
echo "📚 详细文档: TEACHER_ATTENDANCE_DEPLOYMENT.md"
echo ""

