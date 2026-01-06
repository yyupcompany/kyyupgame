#!/bin/bash

###############################################################################
# Android Studio Emulator 安装脚本 (Deepin 25)
# 用途: 安装Android命令行工具和模拟器（不需要完整的Android Studio）
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检查系统要求
check_requirements() {
    print_info "检查系统要求..."
    
    # 检查CPU虚拟化支持
    if grep -E '(vmx|svm)' /proc/cpuinfo > /dev/null; then
        print_success "CPU支持虚拟化"
    else
        print_error "CPU不支持虚拟化，无法运行Android模拟器"
        exit 1
    fi
    
    # 检查KVM
    if [ -e /dev/kvm ]; then
        print_success "KVM已启用"
    else
        print_warning "KVM未启用，性能会较差"
        print_info "启用KVM: sudo modprobe kvm-intel (Intel) 或 sudo modprobe kvm-amd (AMD)"
    fi
    
    # 检查磁盘空间
    AVAILABLE_SPACE=$(df -BG / | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$AVAILABLE_SPACE" -lt 10 ]; then
        print_error "磁盘空间不足，至少需要10GB"
        exit 1
    fi
    print_success "磁盘空间充足 (${AVAILABLE_SPACE}GB 可用)"
}

# 安装依赖
install_dependencies() {
    print_info "安装依赖包..."
    
    sudo apt update
    sudo apt install -y \
        openjdk-17-jdk \
        wget \
        unzip \
        qemu-kvm \
        libvirt-daemon-system \
        libvirt-clients \
        bridge-utils \
        cpu-checker
    
    print_success "依赖包安装完成"
}

# 下载Android命令行工具
download_android_tools() {
    print_info "下载Android命令行工具..."
    
    ANDROID_HOME="$HOME/Android/Sdk"
    CMDLINE_TOOLS_DIR="$ANDROID_HOME/cmdline-tools"
    
    mkdir -p "$CMDLINE_TOOLS_DIR"
    cd "$CMDLINE_TOOLS_DIR"
    
    # 下载最新的命令行工具
    TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    
    if [ ! -f "commandlinetools.zip" ]; then
        print_info "下载中... (约150MB)"
        wget -O commandlinetools.zip "$TOOLS_URL"
    else
        print_info "命令行工具已下载"
    fi
    
    # 解压
    if [ ! -d "latest" ]; then
        print_info "解压命令行工具..."
        unzip -q commandlinetools.zip
        mkdir -p latest
        mv cmdline-tools/* latest/ 2>/dev/null || true
        rmdir cmdline-tools 2>/dev/null || true
    fi
    
    print_success "Android命令行工具安装完成"
}

# 配置环境变量
setup_environment() {
    print_info "配置环境变量..."
    
    ANDROID_HOME="$HOME/Android/Sdk"
    
    # 添加到 .bashrc
    if ! grep -q "ANDROID_HOME" ~/.bashrc; then
        cat >> ~/.bashrc << EOF

# Android SDK
export ANDROID_HOME=$ANDROID_HOME
export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=\$PATH:\$ANDROID_HOME/platform-tools
export PATH=\$PATH:\$ANDROID_HOME/emulator
EOF
        print_success "环境变量已添加到 ~/.bashrc"
    else
        print_info "环境变量已存在"
    fi
    
    # 立即生效
    export ANDROID_HOME="$ANDROID_HOME"
    export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"
    export PATH="$PATH:$ANDROID_HOME/platform-tools"
    export PATH="$PATH:$ANDROID_HOME/emulator"
}

# 安装SDK组件
install_sdk_components() {
    print_info "安装SDK组件..."
    
    SDKMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager"
    
    # 接受许可
    yes | $SDKMANAGER --licenses || true
    
    # 安装必要组件
    print_info "安装platform-tools..."
    $SDKMANAGER "platform-tools"
    
    print_info "安装emulator..."
    $SDKMANAGER "emulator"
    
    print_info "安装system-images (Android 13)..."
    $SDKMANAGER "system-images;android-33;google_apis;x86_64"
    
    print_info "安装platforms..."
    $SDKMANAGER "platforms;android-33"
    
    print_success "SDK组件安装完成"
}

# 创建AVD（Android Virtual Device）
create_avd() {
    print_info "创建Android虚拟设备..."
    
    AVDMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager"
    
    # 创建Pixel 5模拟器
    AVD_NAME="Pixel_5_API_33"
    
    if $AVDMANAGER list avd | grep -q "$AVD_NAME"; then
        print_info "虚拟设备 $AVD_NAME 已存在"
    else
        echo "no" | $AVDMANAGER create avd \
            -n "$AVD_NAME" \
            -k "system-images;android-33;google_apis;x86_64" \
            -d "pixel_5"
        
        print_success "虚拟设备 $AVD_NAME 创建成功"
    fi
}

# 配置KVM权限
setup_kvm_permissions() {
    print_info "配置KVM权限..."
    
    if [ -e /dev/kvm ]; then
        sudo usermod -aG kvm $USER
        sudo chmod 666 /dev/kvm
        print_success "KVM权限配置完成"
        print_warning "需要重新登录才能生效"
    fi
}

# 创建启动脚本
create_launch_script() {
    print_info "创建启动脚本..."
    
    cat > ~/start-android-emulator.sh << 'EOF'
#!/bin/bash

# Android模拟器启动脚本

ANDROID_HOME="$HOME/Android/Sdk"
EMULATOR="$ANDROID_HOME/emulator/emulator"
AVD_NAME="Pixel_5_API_33"

echo "启动Android模拟器: $AVD_NAME"
echo "请稍候..."

$EMULATOR -avd "$AVD_NAME" \
    -gpu host \
    -no-snapshot-load \
    -no-boot-anim \
    -wipe-data &

echo "模拟器启动中..."
echo "首次启动可能需要几分钟"
echo ""
echo "启动后可以访问: http://k.yyup.cc 测试Web应用"
EOF

    chmod +x ~/start-android-emulator.sh
    print_success "启动脚本已创建: ~/start-android-emulator.sh"
}

# 主函数
main() {
    print_info "========================================="
    print_info "  Android Emulator 安装向导"
    print_info "========================================="
    print_info ""
    
    print_warning "此安装需要约5GB磁盘空间和30分钟时间"
    print_info "按 Ctrl+C 取消，或按 Enter 继续..."
    read
    
    check_requirements
    install_dependencies
    download_android_tools
    setup_environment
    install_sdk_components
    create_avd
    setup_kvm_permissions
    create_launch_script
    
    print_info ""
    print_success "========================================="
    print_success "  Android Emulator 安装完成！"
    print_success "========================================="
    print_info ""
    print_info "📱 使用方法："
    print_info "1. 重新登录或运行: source ~/.bashrc"
    print_info "2. 启动模拟器: ~/start-android-emulator.sh"
    print_info "3. 等待模拟器启动（首次需要几分钟）"
    print_info "4. 在模拟器中打开浏览器访问: http://k.yyup.cc"
    print_info ""
    print_info "💡 提示："
    print_info "- 模拟器启动后可以用鼠标和键盘操作"
    print_info "- 按 Ctrl+C 停止模拟器"
    print_info "- 如需重置模拟器，删除 ~/.android/avd/$AVD_NAME.avd"
    print_info ""
}

main "$@"

