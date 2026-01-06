#!/bin/bash
echo "📸 最新截图文件列表："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lah /home/zhgue/kyyupgame/k.yyup.com/*.png | grep -E "(login-result|frontend-screenshot|login-initial)" | tail -3
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💡 使用方法："
echo "1. 文件路径：复制上方文件路径"
echo "2. 文件大小：查看文件是否生成成功"
echo "3. 文件时间：确认是最新截图"
