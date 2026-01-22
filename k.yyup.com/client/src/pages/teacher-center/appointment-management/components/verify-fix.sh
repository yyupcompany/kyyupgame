#!/bin/bash

# 验证组件修复脚本
# 用于确认 CustomerDetail.vue 和 FollowUpRecord.vue 已正确修复

echo "======================================"
echo "   组件修复验证脚本"
echo "======================================"
echo ""

# 检查文件是否存在
echo "📁 检查文件..."
if [ -f "CustomerDetail.vue" ]; then
    echo "✅ CustomerDetail.vue 存在"
else
    echo "❌ CustomerDetail.vue 不存在"
    exit 1
fi

if [ -f "FollowUpRecord.vue" ]; then
    echo "✅ FollowUpRecord.vue 存在"
else
    echo "❌ FollowUpRecord.vue 不存在"
    exit 1
fi

echo ""
echo "🔍 检查关键代码片段..."

# 检查 CustomerDetail.vue 中的类型定义
if grep -q "interface CommunicationRecord" CustomerDetail.vue; then
    echo "✅ CommunicationRecord 接口已定义"
else
    echo "❌ CommunicationRecord 接口未找到"
fi

if grep -q "ref<CommunicationRecord\[\]>" CustomerDetail.vue; then
    echo "✅ communicationHistory 类型注解正确"
else
    echo "❌ communicationHistory 类型注解未找到"
fi

if grep -q "import FollowUpRecord from './FollowUpRecord.vue'" CustomerDetail.vue; then
    echo "✅ FollowUpRecord 导入语句正确"
else
    echo "❌ FollowUpRecord 导入语句未找到"
fi

# 检查 FollowUpRecord.vue 中的修复
if grep -q "style=\"width: 100%;\"" FollowUpRecord.vue; then
    echo "✅ FollowUpRecord 样式修复正确"
else
    echo "⚠️  FollowUpRecord 样式可能需要检查"
fi

echo ""
echo "📊 文件统计..."
echo "CustomerDetail.vue: $(wc -l < CustomerDetail.vue) 行"
echo "FollowUpRecord.vue: $(wc -l < FollowUpRecord.vue) 行"

echo ""
echo "======================================"
echo "   验证完成"
echo "======================================"
echo ""
echo "💡 提示："
echo "   如果 VSCode 仍显示错误，请："
echo "   1. 按 Ctrl+Shift+P"
echo "   2. 输入 'TypeScript: Restart TS Server'"
echo "   3. 等待 5-10 秒"
echo ""
echo "   或者直接重启 VSCode 窗口："
echo "   Ctrl+Shift+P → 'Developer: Reload Window'"
echo ""
















