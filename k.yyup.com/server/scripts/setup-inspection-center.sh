#!/bin/bash

# 检查中心基础信息扩展 - 安装脚本
# 用于运行数据库迁移和初始化

echo "========================================="
echo "检查中心基础信息扩展 - 安装脚本"
echo "========================================="
echo ""

# 检查是否在server目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在server目录下运行此脚本"
    echo "   cd server && bash scripts/setup-inspection-center.sh"
    exit 1
fi

echo "📋 步骤1: 检查环境..."
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未安装Node.js"
    exit 1
fi
echo "✅ Node.js版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未安装npm"
    exit 1
fi
echo "✅ npm版本: $(npm -v)"

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  警告：未找到mysql命令，请确保MySQL已安装并运行"
fi

echo ""
echo "📋 步骤2: 安装依赖..."
echo ""

npm install

echo ""
echo "📋 步骤3: 编译TypeScript..."
echo ""

npm run build

echo ""
echo "📋 步骤4: 运行数据库迁移..."
echo ""

# 运行迁移
npx sequelize-cli db:migrate

if [ $? -eq 0 ]; then
    echo "✅ 数据库迁移成功"
else
    echo "❌ 数据库迁移失败"
    exit 1
fi

echo ""
echo "📋 步骤5: 验证迁移结果..."
echo ""

# 检查是否成功添加字段
mysql -u root -p -e "
USE kindergarten_management;
DESCRIBE kindergartens;
" | grep -E "license_number|info_completeness"

if [ $? -eq 0 ]; then
    echo "✅ 新字段已成功添加到数据库"
else
    echo "⚠️  警告：无法验证新字段，请手动检查数据库"
fi

echo ""
echo "========================================="
echo "✅ 安装完成！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 启动服务器: npm run dev"
echo "2. 测试API: curl http://localhost:3000/api/kindergarten/completeness"
echo "3. 查看文档: docs/检查中心文档模板库/"
echo ""

