#!/bin/bash
# 相册功能完整测试流程脚本

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📸 相册功能完整测试流程"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 照片路径
PHOTO_DIR="/home/zhgue/kyyupgame/k.yyup.com/uploads/test-photos"
AVATAR_PHOTO="$PHOTO_DIR/student-avatar-suruoxi.jpg"
OUTDOOR_PHOTO="$PHOTO_DIR/outdoor-play-1.jpg"
INDOOR_PHOTO="$PHOTO_DIR/indoor-craft-1.jpg"
SPORTS_PHOTO="$PHOTO_DIR/parent-child-sports-1.jpg"
LUNCH_PHOTO="$PHOTO_DIR/lunch-time-1.jpg"

# 检查照片是否存在
echo "📋 检查测试照片..."
for photo in "$AVATAR_PHOTO" "$OUTDOOR_PHOTO" "$INDOOR_PHOTO" "$SPORTS_PHOTO" "$LUNCH_PHOTO"; do
  if [ -f "$photo" ]; then
    size=$(du -h "$photo" | cut -f1)
    echo "  ✅ $(basename $photo) - $size"
  else
    echo "  ❌ 照片不存在: $photo"
    exit 1
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ 所有测试照片准备就绪！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 测试流程说明："
echo ""
echo "阶段1：建立人脸库（家长端操作）"
echo "  1. 浏览器访问：http://localhost:5173/parent-center/children"
echo "  2. 点击\"更换头像\"按钮"
echo "  3. 选择文件：$AVATAR_PHOTO"
echo "  4. 等待上传完成"
echo "  5. 确认提示：\"头像上传成功！人脸已建档\""
echo ""
echo "阶段2：上传班级照片（教师端或API测试）"
echo "  由于教师账号问题，暂时使用API测试："
echo "  （需要先获取token，然后调用API）"
echo ""
echo "阶段3：查看家长相册（家长端操作）"
echo "  1. 浏览器访问：http://localhost:5173/parent-center/photo-album"
echo "  2. 确认看到自动分发的照片"
echo "  3. 只显示苏若曦的照片"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 监控后端日志："
echo "  tail -f /tmp/backend-start.log | grep -E \"人脸|OSS|照片|✅|❌\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 测试准备完成！可以开始手动测试！"
echo ""





