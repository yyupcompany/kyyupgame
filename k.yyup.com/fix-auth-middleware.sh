#!/bin/bash

# 认证中间件统一修复脚本
# 目的：删除旧的auth.ts，统一使用auth.middleware.ts

echo "🔧 开始修复认证中间件..."
echo ""

# 1. 备份旧文件
echo "📦 步骤1: 备份旧的auth.ts"
if [ -f "server/src/middlewares/auth.ts" ]; then
    cp server/src/middlewares/auth.ts server/src/middlewares/auth.ts.backup
    echo "✅ 备份完成: auth.ts.backup"
else
    echo "⚠️  auth.ts 不存在，跳过备份"
fi
echo ""

# 2. 查找所有使用auth.ts的文件
echo "🔍 步骤2: 查找使用旧auth.ts的文件"
echo "----------------------------------------"
grep -r "from.*middlewares/auth'" server/src --include="*.ts" || echo "未找到引用"
echo "----------------------------------------"
echo ""

# 3. 更新引用
echo "📝 步骤3: 更新引用到auth.middleware.ts"

# 更新所有使用旧auth.ts的文件
files_to_update=(
    "server/src/routes/customer-pool/index.ts"
    "server/src/routes/activity-template.routes.ts"
    "server/src/routes/script.routes.ts"
    "server/src/routes/inspection.routes.ts"
    "server/src/routes/script-category.routes.ts"
)

for file in "${files_to_update[@]}"; do
    if [ -f "$file" ]; then
        # 更新相对路径引用
        sed -i "s|from '../../middlewares/auth'|from '../../middlewares/auth.middleware'|g" "$file"
        sed -i "s|from '../middlewares/auth'|from '../middlewares/auth.middleware'|g" "$file"
        echo "✅ 更新: $file"
    else
        echo "⚠️  文件不存在: $file"
    fi
done
echo ""

# 4. 验证更新
echo "🔍 步骤4: 验证更新结果"
echo "----------------------------------------"
grep -r "from.*middlewares/auth'" server/src --include="*.ts" || echo "✅ 所有引用已更新"
echo "----------------------------------------"
echo ""

# 5. 删除旧文件
echo "🗑️  步骤5: 删除旧的auth.ts"
if [ -f "server/src/middlewares/auth.ts" ]; then
    rm server/src/middlewares/auth.ts
    echo "✅ 已删除: auth.ts"
else
    echo "⚠️  auth.ts 已不存在"
fi
echo ""

# 6. 验证文件
echo "📋 步骤6: 验证中间件文件"
echo "----------------------------------------"
ls -lh server/src/middlewares/auth* 2>/dev/null || echo "⚠️  未找到auth相关文件"
echo "----------------------------------------"
echo ""

echo "🎉 认证中间件修复完成！"
echo ""
echo "📝 后续步骤:"
echo "1. 检查 server/src/middlewares/auth.middleware.ts"
echo "2. 运行测试: npm run test:backend"
echo "3. 重启后端服务: cd server && npm run dev"
echo ""

