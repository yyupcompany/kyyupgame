#!/bin/bash

# Genymotion + VirtualBox 自动安装脚本
# 适用于 Deepin 25 系统

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}\n"
}

# 检查是否以root权限运行
check_root() {
    if [ "$EUID" -eq 0 ]; then 
        print_error "请不要使用root权限运行此脚本"
        print_info "正确用法: ./install-genymotion.sh"
        exit 1
    fi
}

# 检查CPU虚拟化支持
check_virtualization() {
    print_step "步骤1: 检查CPU虚拟化支持"
    
    local virt_count=$(egrep -c '(vmx|svm)' /proc/cpuinfo)
    
    if [ "$virt_count" -gt 0 ]; then
        print_success "CPU支持虚拟化 (检测到 $virt_count 个核心)"
    else
        print_error "CPU不支持虚拟化或未在BIOS中启用"
        print_warning "请在BIOS中启用 Intel VT-x 或 AMD-V"
        exit 1
    fi
}

# 安装VirtualBox
install_virtualbox() {
    print_step "步骤2: 安装VirtualBox"
    
    # 检查是否已安装
    if command -v VBoxManage &> /dev/null; then
        local vbox_version=$(VBoxManage --version)
        print_warning "VirtualBox已安装 (版本: $vbox_version)"
        read -p "是否重新安装? (y/N): " reinstall
        if [[ ! $reinstall =~ ^[Yy]$ ]]; then
            print_info "跳过VirtualBox安装"
            return
        fi
    fi
    
    print_info "更新软件源..."
    sudo apt update
    
    print_info "安装VirtualBox和扩展包..."
    sudo apt install -y virtualbox virtualbox-ext-pack
    
    # 验证安装
    if command -v VBoxManage &> /dev/null; then
        local vbox_version=$(VBoxManage --version)
        print_success "VirtualBox安装成功 (版本: $vbox_version)"
    else
        print_error "VirtualBox安装失败"
        exit 1
    fi
}

# 配置用户权限
configure_permissions() {
    print_step "步骤3: 配置用户权限"
    
    print_info "将用户 $USER 添加到 vboxusers 组..."
    sudo usermod -aG vboxusers $USER
    
    print_success "用户权限配置完成"
    print_warning "需要重新登录或重启系统使权限生效"
}

# 加载VirtualBox内核模块
load_vbox_modules() {
    print_step "步骤4: 加载VirtualBox内核模块"
    
    print_info "加载vboxdrv模块..."
    sudo modprobe vboxdrv || print_warning "vboxdrv模块加载失败（可能已加载）"
    
    print_info "加载vboxnetflt模块..."
    sudo modprobe vboxnetflt || print_warning "vboxnetflt模块加载失败（可能已加载）"
    
    print_info "加载vboxnetadp模块..."
    sudo modprobe vboxnetadp || print_warning "vboxnetadp模块加载失败（可能已加载）"
    
    # 验证模块加载
    if lsmod | grep -q vboxdrv; then
        print_success "VirtualBox内核模块加载成功"
    else
        print_error "VirtualBox内核模块加载失败"
        print_info "尝试重新配置VirtualBox..."
        sudo /sbin/vboxconfig
    fi
}

# 下载Genymotion
download_genymotion() {
    print_step "步骤5: 下载Genymotion"
    
    local download_dir="$HOME/Downloads/genymotion"
    mkdir -p "$download_dir"
    
    print_warning "Genymotion需要从官网手动下载"
    print_info "请访问: https://www.genymotion.com/download/"
    print_info "选择: Genymotion Desktop (Free for personal use)"
    print_info "平台: Linux 64 bits"
    echo ""
    print_info "下载后请将文件保存到: $download_dir"
    echo ""
    
    read -p "是否已下载Genymotion安装文件? (y/N): " downloaded
    
    if [[ ! $downloaded =~ ^[Yy]$ ]]; then
        print_warning "请先下载Genymotion，然后重新运行此脚本"
        exit 0
    fi
    
    # 查找安装文件
    local installer=$(find "$download_dir" -name "genymotion-*.bin" | head -n 1)
    
    if [ -z "$installer" ]; then
        print_error "未找到Genymotion安装文件"
        print_info "请确保文件在: $download_dir"
        exit 1
    fi
    
    print_success "找到安装文件: $installer"
    echo "$installer"
}

# 安装Genymotion
install_genymotion() {
    print_step "步骤6: 安装Genymotion"
    
    local installer=$1
    
    if [ -z "$installer" ]; then
        print_error "未指定安装文件"
        exit 1
    fi
    
    # 添加执行权限
    print_info "添加执行权限..."
    chmod +x "$installer"
    
    # 运行安装程序
    print_info "开始安装Genymotion..."
    print_warning "安装过程中请按照提示操作："
    print_info "1. 接受许可协议: 输入 'y'"
    print_info "2. 安装路径: 默认 $HOME/genymotion (直接回车)"
    print_info "3. 创建桌面快捷方式: 输入 'y'"
    echo ""
    
    "$installer"
    
    # 验证安装
    if [ -d "$HOME/genymotion" ]; then
        print_success "Genymotion安装成功"
    else
        print_error "Genymotion安装失败"
        exit 1
    fi
}

# 配置环境变量
configure_environment() {
    print_step "步骤7: 配置环境变量"
    
    local bashrc="$HOME/.bashrc"
    local genymotion_path="export PATH=\$PATH:\$HOME/genymotion"
    
    # 检查是否已配置
    if grep -q "genymotion" "$bashrc"; then
        print_warning "环境变量已配置"
    else
        print_info "添加Genymotion到PATH..."
        echo "" >> "$bashrc"
        echo "# Genymotion" >> "$bashrc"
        echo "$genymotion_path" >> "$bashrc"
        print_success "环境变量配置完成"
    fi
    
    # 立即生效
    export PATH=$PATH:$HOME/genymotion
}

# 安装Java JDK（用于Flutter构建）
install_java() {
    print_step "步骤8: 安装Java JDK (可选，用于Flutter构建)"
    
    read -p "是否安装Java JDK? (Y/n): " install_jdk
    
    if [[ $install_jdk =~ ^[Nn]$ ]]; then
        print_info "跳过Java JDK安装"
        return
    fi
    
    # 检查是否已安装
    if command -v java &> /dev/null; then
        local java_version=$(java -version 2>&1 | head -n 1)
        print_warning "Java已安装: $java_version"
        read -p "是否重新安装? (y/N): " reinstall
        if [[ ! $reinstall =~ ^[Yy]$ ]]; then
            print_info "跳过Java JDK安装"
            return
        fi
    fi
    
    print_info "安装OpenJDK 17..."
    sudo apt install -y openjdk-17-jdk
    
    # 配置JAVA_HOME
    local java_home="/usr/lib/jvm/java-17-openjdk-amd64"
    if [ -d "$java_home" ]; then
        local bashrc="$HOME/.bashrc"
        if ! grep -q "JAVA_HOME" "$bashrc"; then
            echo "" >> "$bashrc"
            echo "# Java" >> "$bashrc"
            echo "export JAVA_HOME=$java_home" >> "$bashrc"
            echo 'export PATH=$JAVA_HOME/bin:$PATH' >> "$bashrc"
        fi
        export JAVA_HOME=$java_home
        export PATH=$JAVA_HOME/bin:$PATH
    fi
    
    # 验证安装
    if command -v java &> /dev/null; then
        local java_version=$(java -version 2>&1 | head -n 1)
        print_success "Java安装成功: $java_version"
    else
        print_error "Java安装失败"
    fi
}

# 显示安装总结
show_summary() {
    print_step "安装完成！"
    
    echo -e "${GREEN}✅ 安装总结${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # VirtualBox
    if command -v VBoxManage &> /dev/null; then
        local vbox_version=$(VBoxManage --version)
        echo -e "${GREEN}✓${NC} VirtualBox: $vbox_version"
    else
        echo -e "${RED}✗${NC} VirtualBox: 未安装"
    fi
    
    # Genymotion
    if [ -d "$HOME/genymotion" ]; then
        echo -e "${GREEN}✓${NC} Genymotion: 已安装"
        echo -e "  安装路径: $HOME/genymotion"
    else
        echo -e "${RED}✗${NC} Genymotion: 未安装"
    fi
    
    # Java
    if command -v java &> /dev/null; then
        local java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        echo -e "${GREEN}✓${NC} Java: $java_version"
    else
        echo -e "${YELLOW}○${NC} Java: 未安装（可选）"
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    print_info "下一步操作："
    echo "1. 重新登录或重启系统使权限生效"
    echo "2. 启动Genymotion: ~/genymotion/genymotion"
    echo "3. 登录Genymotion账号"
    echo "4. 创建虚拟设备（推荐: Google Pixel 5, Android 11）"
    echo "5. 启动虚拟设备并安装APK"
    echo ""
    
    print_info "详细使用指南请查看: Genymotion-安装和使用指南.md"
    echo ""
    
    print_warning "重要提示："
    echo "- 需要重新登录或重启系统使vboxusers组权限生效"
    echo "- 首次启动Genymotion需要登录账号"
    echo "- 创建虚拟设备时会下载Android镜像（约500MB-1GB）"
}

# 主函数
main() {
    clear
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║   Genymotion + VirtualBox 自动安装脚本         ║"
    echo "║   适用于 Deepin 25 系统                        ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # 检查权限
    check_root
    
    # 检查虚拟化支持
    check_virtualization
    
    # 安装VirtualBox
    install_virtualbox
    
    # 配置用户权限
    configure_permissions
    
    # 加载VirtualBox内核模块
    load_vbox_modules
    
    # 下载Genymotion
    local installer=$(download_genymotion)
    
    # 安装Genymotion
    if [ -n "$installer" ]; then
        install_genymotion "$installer"
    fi
    
    # 配置环境变量
    configure_environment
    
    # 安装Java JDK（可选）
    install_java
    
    # 显示安装总结
    show_summary
}

# 执行主函数
main "$@"

