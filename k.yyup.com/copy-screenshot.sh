#!/bin/bash
# 将最新截图复制到剪贴板

# 获取最新的截图文件
LATEST_SCREENSHOT=$(ls -t /home/zhgue/kyyupgame/k.yyup.com/*.png 2>/dev/null | head -1)

if [ -z "$LATEST_SCREENSHOT" ]; then
    echo "❌ 未找到截图文件"
    exit 1
fi

echo "📸 正在复制截图到剪贴板..."
echo "   文件: $LATEST_SCREENSHOT"

# 将图片复制到剪贴板
xclip -selection clipboard -t image/png -i "$LATEST_SCREENSHOT"

if [ $? -eq 0 ]; then
    echo "✅ 截图已复制到剪贴板！"
    echo "💡 现在可以使用 Ctrl+V 粘贴图片了"
else
    echo "⚠️  复制到剪贴板失败，但文件已生成"
    echo "   文件路径: $LATEST_SCREENSHOT"
fi

