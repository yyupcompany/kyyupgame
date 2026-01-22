#!/bin/bash
# 清理移动端不必要的占位页面

MOBILE_PAGES_PATH="/home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile"

echo "════════════════════════════════════════════════════════════"
echo "🧹 移动端占位页面清理工具"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "清理原则: PC端没有的功能，移动端也不应该存在"
echo ""

# 1. 需要删除的移动端占位页面（17个）
# 这些页面在PC端没有对应开发，因此移动端也不需要

echo "📋 删除不必要的移动端占位页面..."
echo ""

# Centers目录下的占位页面（14个）
rm -rf "$MOBILE_PAGES_PATH/centers/activity-center"
echo "✅ 删除: centers/activity-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/ai-billing-center"
echo "✅ 删除: centers/ai-billing-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/ai-center"
echo "✅ 删除: centers/ai-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/assessment-center"
echo "✅ 删除: centers/assessment-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/attendance"
echo "✅ 删除: centers/attendance (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/document-center"
echo "✅ 删除: centers/document-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/document-editor"
echo "✅ 删除: centers/document-editor (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/enrollment-center"
echo "✅ 删除: centers/enrollment-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/inspection-center"
echo "✅ 删除: centers/inspection-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/marketing-center"
echo "✅ 删除: centers/marketing-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/media-center"
echo "✅ 删除: centers/media-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/system-center"
echo "✅ 删除: centers/system-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/teaching-center"
echo "✅ 删除: centers/teaching-center (PC端无此功能)"

rm -rf "$MOBILE_PAGES_PATH/centers/user-center"
echo "✅ 删除: centers/user-center (PC端无此功能)"

# Teacher-center子页面（2个）
rm -rf "$MOBILE_PAGES_PATH/teacher-center/enrollment"
echo "✅ 删除: teacher-center/enrollment (PC端无完整功能)"

rm -rf "$MOBILE_PAGES_PATH/teacher-center/teaching"
echo "✅ 删除: teacher-center/teaching (PC端无完整功能)"

# 文档相关（1个）
rm -rf "$MOBILE_PAGES_PATH/document-instance/edit"
echo "✅ 删除: document-instance/edit (PC端无此功能)"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ 完成！已删除 17 个不必要的移动端占位页面"
echo "════════════════════════════════════════════════════════════"
echo ""

# 2. 保留但可能需要完善的页面（5个）
# 这些页面PC端有对应功能，因此移动端需要存在

echo "📋 保留的页面（PC端有对应功能）："
echo ""
echo "1. centers/teacher-center - PC端有完整的teacher-center"
echo "2. parent-center/ai-assistant - PC端有ai-center"
echo "3. parent-center/profile - PC端有用户相关功能"
echo "4. teacher-center/activities - PC端有activities模块"
echo "5. teacher-center/tasks - PC端有完整的tasks模块"
echo ""
echo "💡 建议: 这些页面需要开发为完整功能，而不是占位"
echo ""

# 3. 生成删除验证脚本
cat > /tmp/verify-cleanup.sh << 'VERIFY_EOF'
#!/bin/bash
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🔍 验证移动端页面清理结果"
echo "════════════════════════════════════════════════════════════"
echo ""

# 统计mobile目录下的页面
cd /home/zhgue/kyyupgame/k.yyup.com/client/src/pages/mobile

echo "📊 清理后的移动端页面统计："
echo ""
echo "Centers页面:"
find centers -maxdepth 1 -name "*.vue" -o -name "index.vue" -o -type d | sort
echo ""
echo "Teacher-center子页面:"
find teacher-center -maxdepth 2 -name "*.vue" -o -type d 2>/dev/null | sort
echo ""
echo "Parent-center子页面:"
find parent-center -maxdepth 2 -name "*.vue" -o -type d 2>/dev/null | sort
echo ""
echo "✅ 验证完成！"

VERIFY_EOF

chmod +x /tmp/verify-cleanup.sh

echo "════════════════════════════════════════════════════════════"
echo "下一步操作："
echo ""
echo "1. 运行验证: bash /tmp/verify-cleanup.sh"
echo "2. 提交代码: git status && git add -A && git commit -m '清理移动端占位页面'"
echo "3. 开发保留页面: 将5个保留页面从占位开发为完整功能"
echo ""
echo "════════════════════════════════════════════════════════════"
