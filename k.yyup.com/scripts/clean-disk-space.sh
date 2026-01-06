#!/bin/bash

# 磁盘空间清理脚本
# 项目: k.yyup.cc 幼儿园管理系统
# 日期: 2025-10-12

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="/home/zhgue/k.yyup.cc"
cd "$PROJECT_ROOT"

echo -e "${BLUE}=== 磁盘空间清理工具 ===${NC}"
echo ""

# 显示当前大小
echo -e "${YELLOW}📊 清理前的大小:${NC}"
du -sh client server 2>/dev/null || true
echo ""

# 询问清理方案
echo -e "${YELLOW}请选择清理方案:${NC}"
echo "1) 快速清理 (推荐) - 节省约 600MB"
echo "   - 清理日志文件"
echo "   - 清理构建产物"
echo "   - 清理测试覆盖率"
echo "   - 清理测试截图"
echo ""
echo "2) 深度清理 - 节省约 800MB"
echo "   - 包含快速清理的所有内容"
echo "   - 清理上传的测试视频"
echo "   - 清理测试音频文件"
echo ""
echo "3) 自定义清理"
echo "4) 仅查看可清理项目"
echo "0) 退出"
echo ""
read -p "请输入选项 (0-4): " choice

case $choice in
    1)
        echo -e "${GREEN}开始快速清理...${NC}"
        
        # 1. 清理日志
        if [ -f "client/logs/access.log" ]; then
            SIZE=$(du -sh client/logs/access.log 2>/dev/null | cut -f1)
            echo -e "${YELLOW}清理日志文件 (${SIZE})...${NC}"
            rm -f client/logs/access.log
            echo -e "${GREEN}✅ 日志文件已清理${NC}"
        fi
        
        # 2. 清理构建产物
        if [ -d "client/dist" ] || [ -d "server/dist" ]; then
            echo -e "${YELLOW}清理构建产物...${NC}"
            rm -rf client/dist server/dist
            echo -e "${GREEN}✅ 构建产物已清理${NC}"
        fi
        
        # 3. 清理测试覆盖率
        if [ -d "server/coverage" ] || [ -d "client/coverage" ]; then
            echo -e "${YELLOW}清理测试覆盖率...${NC}"
            rm -rf server/coverage client/coverage
            echo -e "${GREEN}✅ 测试覆盖率已清理${NC}"
        fi
        
        # 4. 清理测试截图
        echo -e "${YELLOW}清理测试截图...${NC}"
        rm -rf client/测试74 client/*-screenshots client/test-results 2>/dev/null || true
        echo -e "${GREEN}✅ 测试截图已清理${NC}"
        
        # 5. 清理根目录测试文件
        echo -e "${YELLOW}清理根目录测试文件...${NC}"
        rm -rf test-screenshots test-videos videos genymotion 2>/dev/null || true
        echo -e "${GREEN}✅ 根目录测试文件已清理${NC}"
        
        echo -e "${GREEN}快速清理完成!${NC}"
        ;;
        
    2)
        echo -e "${GREEN}开始深度清理...${NC}"
        
        # 执行快速清理的所有步骤
        echo -e "${YELLOW}执行快速清理步骤...${NC}"
        rm -f client/logs/access.log 2>/dev/null || true
        rm -rf client/dist server/dist 2>/dev/null || true
        rm -rf server/coverage client/coverage 2>/dev/null || true
        rm -rf client/测试74 client/*-screenshots client/test-results 2>/dev/null || true
        rm -rf test-screenshots test-videos videos genymotion 2>/dev/null || true
        echo -e "${GREEN}✅ 快速清理步骤完成${NC}"
        
        # 额外的深度清理
        echo -e "${YELLOW}清理上传的测试视频...${NC}"
        if [ -d "server/uploads/videos" ]; then
            ls -lh server/uploads/videos/ 2>/dev/null || true
            read -p "确认删除这些视频文件? (y/N): " confirm
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                rm -rf server/uploads/videos/*.mp4 2>/dev/null || true
                echo -e "${GREEN}✅ 测试视频已清理${NC}"
            else
                echo -e "${YELLOW}⏭️  跳过视频清理${NC}"
            fi
        fi
        
        echo -e "${YELLOW}清理测试音频文件...${NC}"
        rm -f server/test-*.mp3 server/uploads/video-audio/*.mp3 2>/dev/null || true
        echo -e "${GREEN}✅ 测试音频已清理${NC}"
        
        echo -e "${GREEN}深度清理完成!${NC}"
        ;;
        
    3)
        echo -e "${YELLOW}自定义清理${NC}"
        echo ""
        
        # 日志
        if [ -f "client/logs/access.log" ]; then
            SIZE=$(du -sh client/logs/access.log 2>/dev/null | cut -f1)
            read -p "清理日志文件 (${SIZE})? (y/N): " confirm
            [ "$confirm" = "y" ] && rm -f client/logs/access.log && echo -e "${GREEN}✅ 已清理${NC}"
        fi
        
        # 构建产物
        if [ -d "client/dist" ] || [ -d "server/dist" ]; then
            read -p "清理构建产物 (client/dist, server/dist)? (y/N): " confirm
            [ "$confirm" = "y" ] && rm -rf client/dist server/dist && echo -e "${GREEN}✅ 已清理${NC}"
        fi
        
        # 测试覆盖率
        if [ -d "server/coverage" ] || [ -d "client/coverage" ]; then
            read -p "清理测试覆盖率? (y/N): " confirm
            [ "$confirm" = "y" ] && rm -rf server/coverage client/coverage && echo -e "${GREEN}✅ 已清理${NC}"
        fi
        
        # 测试截图
        read -p "清理测试截图? (y/N): " confirm
        [ "$confirm" = "y" ] && rm -rf client/测试74 client/*-screenshots client/test-results && echo -e "${GREEN}✅ 已清理${NC}"
        
        # 根目录测试文件
        read -p "清理根目录测试文件 (videos, test-screenshots等)? (y/N): " confirm
        [ "$confirm" = "y" ] && rm -rf test-screenshots test-videos videos genymotion && echo -e "${GREEN}✅ 已清理${NC}"
        
        echo -e "${GREEN}自定义清理完成!${NC}"
        ;;
        
    4)
        echo -e "${BLUE}=== 可清理项目列表 ===${NC}"
        echo ""
        
        echo -e "${YELLOW}Client 目录:${NC}"
        [ -f "client/logs/access.log" ] && du -sh client/logs/access.log 2>/dev/null
        [ -d "client/dist" ] && du -sh client/dist 2>/dev/null
        [ -d "client/coverage" ] && du -sh client/coverage 2>/dev/null
        [ -d "client/测试74" ] && du -sh client/测试74 2>/dev/null
        du -sh client/*-screenshots 2>/dev/null | head -5
        
        echo ""
        echo -e "${YELLOW}Server 目录:${NC}"
        [ -d "server/dist" ] && du -sh server/dist 2>/dev/null
        [ -d "server/coverage" ] && du -sh server/coverage 2>/dev/null
        [ -d "server/uploads/videos" ] && du -sh server/uploads/videos 2>/dev/null
        
        echo ""
        echo -e "${YELLOW}根目录:${NC}"
        du -sh videos test-screenshots test-videos genymotion 2>/dev/null
        
        echo ""
        echo -e "${BLUE}运行脚本并选择选项1或2来执行清理${NC}"
        ;;
        
    0)
        echo -e "${YELLOW}退出清理工具${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}=== 清理后的大小 ===${NC}"
du -sh client server 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ 清理完成!${NC}"
echo -e "${BLUE}详细报告请查看: DISK_CLEANUP_REPORT.md${NC}"

