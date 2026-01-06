#!/bin/bash
#
# 幼儿园管理系统部署脚本
# 部署 k.yyup.cc (幼儿园租户系统) 和 rent.yyup.cc (统一认证系统)
#

set -e

# 配置
REMOTE_HOST="47.94.82.59"
REMOTE_USER="root"
SSH_KEY="/tmp/server_key"
REMOTE_BASE="/var/www/kyyup"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查SSH密钥
check_ssh_key() {
    if [ ! -f "$SSH_KEY" ]; then
        log_error "SSH密钥不存在: $SSH_KEY"
        exit 1
    fi
}

# 远程执行命令
remote_exec() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "$1"
}

# 同步文件到服务器
sync_files() {
    local src=$1
    local dest=$2
    rsync -avz --delete \
        -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'dist' \
        --exclude '.env.local' \
        "$src" "$REMOTE_USER@$REMOTE_HOST:$dest"
}

# 构建和部署幼儿园租户系统 (k.yyup.com)
deploy_k_yyup() {
    log_info "========================================"
    log_info "部署幼儿园租户系统 (k.yyup.cc)"
    log_info "========================================"
    
    cd "$(dirname "$0")"
    
    # 1. 构建前端
    log_info "[1/5] 构建前端..."
    cd client
    npm install
    npm run build
    cd ..
    
    # 2. 构建后端
    log_info "[2/5] 构建后端..."
    cd server
    npm install
    npm run build 2>/dev/null || log_warn "后端无build命令，跳过"
    cd ..
    
    # 3. 同步前端到服务器
    log_info "[3/5] 同步前端文件..."
    sync_files "client/dist/" "$REMOTE_BASE/k.yyup.com/client/"
    
    # 4. 同步后端到服务器
    log_info "[4/5] 同步后端文件..."
    sync_files "server/" "$REMOTE_BASE/k.yyup.com/server/"
    
    # 5. 在服务器上安装依赖并重启
    log_info "[5/5] 安装依赖并重启服务..."
    remote_exec "cd $REMOTE_BASE/k.yyup.com/server && npm install --production && pm2 restart k-yyup-backend 2>/dev/null || pm2 start dist/index.js --name k-yyup-backend"
    
    log_info "✅ 幼儿园租户系统部署完成!"
}

# 部署统一认证系统 (rent.yyup.com)
deploy_rent_yyup() {
    log_info "========================================"
    log_info "部署统一认证系统 (rent.yyup.cc)"
    log_info "========================================"
    
    cd "$(dirname "$0")/../rent.yyup.com"
    
    # 1. 构建前端
    log_info "[1/5] 构建前端..."
    cd client
    npm install
    npm run build
    cd ..
    
    # 2. 构建后端
    log_info "[2/5] 构建后端..."
    cd server
    npm install
    npm run build 2>/dev/null || log_warn "后端无build命令，跳过"
    cd ..
    
    # 3. 同步前端到服务器
    log_info "[3/5] 同步前端文件..."
    sync_files "client/dist/" "$REMOTE_BASE/rent.yyup.com/client/"
    
    # 4. 同步后端到服务器
    log_info "[4/5] 同步后端文件..."
    sync_files "server/" "$REMOTE_BASE/rent.yyup.com/server/"
    
    # 5. 在服务器上安装依赖并重启
    log_info "[5/5] 安装依赖并重启服务..."
    remote_exec "cd $REMOTE_BASE/rent.yyup.com/server && npm install --production && pm2 restart rent-yyup-backend 2>/dev/null || pm2 start dist/index.js --name rent-yyup-backend"
    
    log_info "✅ 统一认证系统部署完成!"
}

# 配置Nginx
setup_nginx() {
    log_info "========================================"
    log_info "配置Nginx"
    log_info "========================================"
    
    # 上传nginx配置
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
        "$(dirname "$0")/nginx-kyyup.conf" \
        "$REMOTE_USER@$REMOTE_HOST:/etc/nginx/sites-available/kyyup.cc"
    
    # 创建软链接并重载nginx
    remote_exec "ln -sf /etc/nginx/sites-available/kyyup.cc /etc/nginx/sites-enabled/kyyup.cc && nginx -t && systemctl reload nginx"
    
    log_info "✅ Nginx配置完成!"
}

# 申请SSL证书
setup_ssl() {
    log_info "========================================"
    log_info "申请SSL证书"
    log_info "========================================"
    
    remote_exec "certbot --nginx -d k.yyup.cc -d rent.yyup.cc --non-interactive --agree-tos -m admin@yyup.cc || true"
    
    log_info "✅ SSL证书配置完成!"
}

# 显示帮助
show_help() {
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  all       部署所有系统"
    echo "  k         只部署幼儿园租户系统 (k.yyup.cc)"
    echo "  rent      只部署统一认证系统 (rent.yyup.cc)"
    echo "  nginx     只配置Nginx"
    echo "  ssl       只申请SSL证书"
    echo "  help      显示帮助"
}

# 主函数
main() {
    check_ssh_key
    
    case "${1:-all}" in
        all)
            deploy_k_yyup
            deploy_rent_yyup
            setup_nginx
            setup_ssl
            ;;
        k)
            deploy_k_yyup
            ;;
        rent)
            deploy_rent_yyup
            ;;
        nginx)
            setup_nginx
            ;;
        ssl)
            setup_ssl
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
    
    log_info "========================================"
    log_info "部署完成!"
    log_info "========================================"
    log_info "幼儿园租户前端: https://k.yyup.cc"
    log_info "幼儿园租户后端: https://k.yyup.cc:3000"
    log_info "统一认证前端: https://rent.yyup.cc"
    log_info "统一认证后端: https://rent.yyup.cc:4001"
}

main "$@"

