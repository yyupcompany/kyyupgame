#!/bin/bash

# Claude Code Doctor - 检查设置文件问题
# 用法: ./doctor.sh 或 bash doctor.sh

echo "🩺 Claude Code 项目诊断开始..."
echo "=================================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "🔍 1. 检查项目结构..."
echo "-----------------------------------"

# 检查主要目录
if [ -d "client" ]; then
    check_pass "前端目录 (client/) 存在"
else
    check_fail "前端目录 (client/) 不存在"
fi

if [ -d "server" ]; then
    check_pass "后端目录 (server/) 存在"
else
    check_fail "后端目录 (server/) 不存在"
fi

echo ""
echo "📁 2. 检查配置文件..."
echo "-----------------------------------"

# 检查根目录配置
if [ -f "package.json" ]; then
    check_pass "根目录 package.json 存在"
    if grep -q '"start".*start-all.sh' package.json; then
        check_warn "package.json 引用了不存在的 start-all.sh"
        check_info "建议: 创建 start-all.sh 脚本或修改 package.json 中的启动命令"
    fi
else
    check_fail "根目录 package.json 不存在"
fi

if [ -f "CLAUDE.md" ]; then
    check_pass "CLAUDE.md 配置文件存在"
else
    check_warn "CLAUDE.md 配置文件不存在"
fi

# 检查前端配置
if [ -f "client/package.json" ]; then
    check_pass "前端 package.json 存在"
else
    check_fail "前端 package.json 不存在"
fi

if [ -f "client/.env" ]; then
    check_pass "前端 .env 配置存在"
    # 检查关键配置
    if grep -q "VITE_API_BASE_URL" client/.env; then
        check_info "API Base URL 配置已找到"
    else
        check_warn "未找到 VITE_API_BASE_URL 配置"
    fi
else
    check_warn "前端 .env 配置不存在"
fi

if [ -f "client/vite.config.ts" ]; then
    check_pass "Vite 配置文件存在"
else
    check_fail "Vite 配置文件不存在"
fi

# 检查后端配置
if [ -f "server/package.json" ]; then
    check_pass "后端 package.json 存在"
else
    check_fail "后端 package.json 不存在"
fi

if [ -f "server/.env" ]; then
    check_pass "后端 .env 配置存在"
    # 检查数据库配置
    if grep -q "DB_HOST" server/.env && grep -q "DB_USER" server/.env; then
        check_info "数据库配置已找到"
    else
        check_warn "数据库配置不完整"
    fi
else
    check_fail "后端 .env 配置不存在"
fi

if [ -f "server/tsconfig.json" ]; then
    check_pass "后端 TypeScript 配置存在"
else
    check_fail "后端 TypeScript 配置不存在"
fi

echo ""
echo "🚀 3. 检查启动脚本..."
echo "-----------------------------------"

# 检查启动脚本
if [ -f "start-all.sh" ]; then
    check_pass "start-all.sh 启动脚本存在"
else
    check_fail "start-all.sh 启动脚本不存在"
    check_info "这是导致 npm run start 失败的主要原因"
fi

if [ -f "quick-start.sh" ]; then
    check_pass "quick-start.sh 备用脚本存在"
else
    check_warn "quick-start.sh 备用脚本不存在"
fi

# 检查子目录启动脚本
if [ -f "client/scripts/kill-ports.sh" ]; then
    check_pass "前端端口清理脚本存在"
else
    check_warn "前端端口清理脚本不存在"
fi

if [ -f "server/scripts/kill-ports.sh" ]; then
    check_pass "后端端口清理脚本存在"
else
    check_warn "后端端口清理脚本不存在"
fi

echo ""
echo "🔌 4. 检查服务状态..."
echo "-----------------------------------"

# 检查端口使用情况
if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
    check_info "端口 3000 (后端) 被占用"
else
    check_warn "端口 3000 (后端) 未被使用"
fi

if netstat -tlnp 2>/dev/null | grep -q ":5173"; then
    check_info "端口 5173 (前端) 被占用"
else
    check_warn "端口 5173 (前端) 未被使用"
fi

# 检查 Node.js 版本
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js 版本: $NODE_VERSION"
    # 检查版本是否符合要求 (>= 18)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        check_info "Node.js 版本符合要求 (>= 18)"
    else
        check_warn "Node.js 版本可能过低，建议升级到 18+ 版本"
    fi
else
    check_fail "Node.js 未安装"
fi

# 检查 npm 版本
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    check_pass "npm 版本: $NPM_VERSION"
else
    check_fail "npm 未安装"
fi

echo ""
echo "🔧 5. 建议修复方案..."
echo "-----------------------------------"

ISSUES_FOUND=false

# 生成修复建议
if [ ! -f "start-all.sh" ]; then
    echo -e "${YELLOW}问题${NC}: start-all.sh 脚本缺失"
    echo -e "${BLUE}解决方案${NC}: 创建启动脚本"
    echo "  1. 使用现有的 quick-start.sh"
    echo "  2. 或创建新的 start-all.sh 脚本"
    echo "  3. 或修改 package.json 中的启动命令"
    ISSUES_FOUND=true
    echo ""
fi

if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}问题${NC}: 前端环境配置缺失"
    echo -e "${BLUE}解决方案${NC}: 创建 client/.env 文件"
    echo "  参考 client/.env.example 或现有配置模板"
    ISSUES_FOUND=true
    echo ""
fi

if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}问题${NC}: 后端环境配置缺失"
    echo -e "${BLUE}解决方案${NC}: 创建 server/.env 文件"
    echo "  包含数据库连接和JWT密钥配置"
    ISSUES_FOUND=true
    echo ""
fi

# 检查依赖安装
if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}问题${NC}: 前端依赖未安装"
    echo -e "${BLUE}解决方案${NC}: cd client && npm install"
    ISSUES_FOUND=true
    echo ""
fi

if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}问题${NC}: 后端依赖未安装"
    echo -e "${BLUE}解决方案${NC}: cd server && npm install"
    ISSUES_FOUND=true
    echo ""
fi

if [ "$ISSUES_FOUND" = false ]; then
    echo -e "${GREEN}🎉 未发现重大配置问题！项目看起来配置正常。${NC}"
else
    echo -e "${YELLOW}⚠️  发现了一些需要修复的问题，请按照上述建议进行修复。${NC}"
fi

echo ""
echo "🚀 6. 快速修复命令..."
echo "-----------------------------------"
echo "# 安装所有依赖:"
echo "cd client && npm install && cd ../server && npm install"
echo ""
echo "# 手动启动服务:"
echo "cd server && npm run dev  # 启动后端 (端口 3000)"
echo "cd client && npm run dev  # 启动前端 (端口 5173)"
echo ""
echo "# 或使用现有脚本:"
echo "bash quick-start.sh"

echo ""
echo "=================================================="
echo "🩺 Claude Code 项目诊断完成"
echo "如有问题，请根据上述建议进行修复。"
echo "=================================================="