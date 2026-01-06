#!/bin/bash

################################################################################
#                                                                              #
#                    香港服务器部署脚本 - 完整版                              #
#                                                                              #
#  功能:                                                                       #
#    1. 编译前端 (Vue 3 + Vite) - 端口 6000                                   #
#    2. 编译后端 (Express.js) - 端口 4000                                     #
#    3. 上传到香港服务器                                                      #
#    4. 启动服务                                                              #
#    5. 性能监控                                                              #
#                                                                              #
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
DEPLOY_CONFIG="deploy-config.json"
SSH_HOST="103.210.237.249"
SSH_USER="szblade"
SSH_ALIAS="yisu"
SSH_PASSWORD="Szblade3944"  # SSH密码
REMOTE_BASE="/home/szblade/yyup-deploy"
FRONTEND_PORT=6000
BACKEND_PORT=4000
DB_HOST="dbconn.sealoshzh.site"
DB_PORT=43906
DB_USER="root"
DB_PASSWORD="Yyup@2024"
DB_NAME="kyyup"

# 日志文件
LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/deploy-$(date +%Y%m%d-%H%M%S).log"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 日志函数
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}ℹ️  $@${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $@${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $@${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $@${NC}" | tee -a "$LOG_FILE"
}

# 帮助信息
show_help() {
    cat << EOF
使用方法: $0 [选项]

选项:
  --help              显示此帮助信息
  --upload-only       仅上传文件，不编译
  --build-only        仅编译，不上传
  --start-only        仅启动服务
  --full              完整部署（编译+上传+启动）
  --frontend-only     仅部署前端
  --backend-only      仅部署后端
  --check-status      检查服务状态
  --view-logs         查看部署日志

示例:
  $0 --full                    # 完整部署
  $0 --build-only              # 仅编译
  $0 --upload-only             # 仅上传
  $0 --frontend-only           # 仅部署前端
  $0 --backend-only            # 仅部署后端

EOF
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    local missing_deps=()
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    # 检查ssh
    if ! command -v ssh &> /dev/null; then
        missing_deps+=("ssh")
    fi
    
    # 检查scp
    if ! command -v scp &> /dev/null; then
        missing_deps+=("scp")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "缺少以下依赖: ${missing_deps[*]}"
        exit 1
    fi
    
    log_success "所有依赖已安装"
}

# 编译前端
build_frontend() {
    log_info "开始编译前端..."

    cd ../client

    # 修复Element Plus图标问题
    log_info "修复Element Plus图标问题..."
    cd ../deployment-scripts
    ./fix-icons.sh
    cd ../client

    # 设置环境变量
    export VITE_DEV_PORT=6000
    export VITE_API_PROXY_TARGET="http://localhost:4000"

    # 清理旧的构建
    rm -rf dist

    # 安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装前端依赖..."
        npm install
    fi

    # 构建
    log_info "构建前端..."
    npm run build
    
    if [ -d "dist" ]; then
        log_success "前端编译成功"
        log_info "前端输出目录: $(pwd)/dist"
    else
        log_error "前端编译失败"
        exit 1
    fi
    
    cd ..
}

# 编译后端
build_backend() {
    log_info "开始编译后端..."

    cd ../server
    
    # 设置环境变量
    export PORT=4000
    export NODE_ENV=production
    export DB_HOST="$DB_HOST"
    export DB_PORT="$DB_PORT"
    export DB_USER="$DB_USER"
    export DB_PASSWORD="$DB_PASSWORD"
    export DB_NAME="$DB_NAME"
    
    # 清理旧的构建
    rm -rf dist
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        log_info "安装后端依赖..."
        npm install
    fi
    
    # 构建
    log_info "构建后端..."
    npm run build
    
    if [ -d "dist" ]; then
        log_success "后端编译成功"
        log_info "后端输出目录: $(pwd)/dist"
    else
        log_error "后端编译失败"
        exit 1
    fi
    
    cd ..
}

# 上传前端
upload_frontend() {
    log_info "上传前端到香港服务器..."

    if [ ! -d "client/dist" ]; then
        log_error "前端构建目录不存在，请先编译"
        exit 1
    fi

    # 创建远程目录
    sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no $SSH_ALIAS "mkdir -p $REMOTE_BASE/kyyup-client"

    # 上传文件
    sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no -r client/dist/* $SSH_ALIAS:$REMOTE_BASE/kyyup-client/

    # 上传package.json
    sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no client/package.json $SSH_ALIAS:$REMOTE_BASE/kyyup-client/

    log_success "前端上传成功"
}

# 上传后端
upload_backend() {
    log_info "上传后端到香港服务器..."

    if [ ! -d "server/dist" ]; then
        log_error "后端构建目录不存在，请先编译"
        exit 1
    fi

    # 创建远程目录
    sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no $SSH_ALIAS "mkdir -p $REMOTE_BASE/kyyup-server"

    # 上传文件
    sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no -r server/dist/* $SSH_ALIAS:$REMOTE_BASE/kyyup-server/

    # 上传package.json
    sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no server/package.json $SSH_ALIAS:$REMOTE_BASE/kyyup-server/

    # 上传.env文件
    if [ -f "server/.env" ]; then
        sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no server/.env $SSH_ALIAS:$REMOTE_BASE/kyyup-server/
    fi

    log_success "后端上传成功"
}

# 启动前端
start_frontend() {
    log_info "启动前端服务..."

    sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no $SSH_ALIAS << EOF
        cd $REMOTE_BASE/kyyup-client

        # 安装依赖
        npm install --production

        # 启动服务（后台运行）
        nohup npm run preview -- --port $FRONTEND_PORT > frontend.log 2>&1 &

        echo "前端服务已启动，端口: $FRONTEND_PORT"
        sleep 2
        ps aux | grep "npm run preview" | grep -v grep
EOF

    log_success "前端服务启动成功"
}

# 启动后端
start_backend() {
    log_info "启动后端服务..."

    sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no $SSH_ALIAS << EOF
        cd $REMOTE_BASE/kyyup-server

        # 安装依赖
        npm install --production

        # 设置环境变量
        export PORT=$BACKEND_PORT
        export NODE_ENV=production
        export DB_HOST=$DB_HOST
        export DB_PORT=$DB_PORT
        export DB_USER=$DB_USER
        export DB_PASSWORD=$DB_PASSWORD
        export DB_NAME=$DB_NAME

        # 启动服务（后台运行）
        nohup node dist/server.js > backend.log 2>&1 &

        echo "后端服务已启动，端口: $BACKEND_PORT"
        sleep 2
        ps aux | grep "node dist/server.js" | grep -v grep
EOF

    log_success "后端服务启动成功"
}

# 检查服务状态
check_status() {
    log_info "检查服务状态..."

    sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no $SSH_ALIAS << EOF
        echo "=== 前端服务状态 ==="
        ps aux | grep "npm run preview" | grep -v grep || echo "前端服务未运行"

        echo ""
        echo "=== 后端服务状态 ==="
        ps aux | grep "node dist/server.js" | grep -v grep || echo "后端服务未运行"

        echo ""
        echo "=== 端口监听状态 ==="
        netstat -tlnp 2>/dev/null | grep -E ":$FRONTEND_PORT|:$BACKEND_PORT" || echo "端口未监听"

        echo ""
        echo "=== 磁盘使用情况 ==="
        df -h | head -2

        echo ""
        echo "=== 内存使用情况 ==="
        free -h | head -2
EOF
}

# 查看日志
view_logs() {
    log_info "查看远程日志..."

    sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no $SSH_ALIAS << EOF
        echo "=== 前端日志 (最后50行) ==="
        tail -50 $REMOTE_BASE/kyyup-client/frontend.log 2>/dev/null || echo "日志不存在"

        echo ""
        echo "=== 后端日志 (最后50行) ==="
        tail -50 $REMOTE_BASE/kyyup-server/backend.log 2>/dev/null || echo "日志不存在"
EOF
}

# 完整部署
full_deployment() {
    log_info "开始完整部署流程..."
    
    # 检查依赖
    check_dependencies
    
    # 编译
    build_frontend
    build_backend
    
    # 上传
    upload_frontend
    upload_backend
    
    # 启动
    start_frontend
    start_backend
    
    # 检查状态
    check_status
    
    log_success "完整部署完成！"
    log_info "前端访问地址: http://$SSH_HOST:$FRONTEND_PORT"
    log_info "后端API地址: http://$SSH_HOST:$BACKEND_PORT"
    log_info "数据库: $DB_HOST:$DB_PORT"
}

# 主函数
main() {
    log_info "=========================================="
    log_info "香港服务器部署脚本"
    log_info "=========================================="
    log_info "服务器: $SSH_HOST"
    log_info "用户: $SSH_USER"
    log_info "前端端口: $FRONTEND_PORT"
    log_info "后端端口: $BACKEND_PORT"
    log_info "数据库: $DB_HOST:$DB_PORT"
    log_info "=========================================="
    
    case "${1:-}" in
        --help)
            show_help
            ;;
        --upload-only)
            check_dependencies
            upload_frontend
            upload_backend
            ;;
        --build-only)
            check_dependencies
            build_frontend
            build_backend
            ;;
        --start-only)
            start_frontend
            start_backend
            check_status
            ;;
        --full)
            full_deployment
            ;;
        --frontend-only)
            check_dependencies
            build_frontend
            upload_frontend
            start_frontend
            ;;
        --backend-only)
            check_dependencies
            build_backend
            upload_backend
            start_backend
            ;;
        --check-status)
            check_status
            ;;
        --view-logs)
            view_logs
            ;;
        *)
            full_deployment
            ;;
    esac
    
    log_info "部署日志已保存到: $LOG_FILE"
}

# 运行主函数
main "$@"

