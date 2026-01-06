#!/bin/bash

# 向日葵远程桌面管理脚本

SUNLOGIN_CLIENT="/opt/apps/com.oray.sunlogin.client/files/bin/sunloginclient"
SUNLOGIN_SERVICE="/opt/apps/com.oray.sunlogin.client/files/bin/sunloginclient --mod=service"

show_help() {
    echo "向日葵远程桌面管理工具"
    echo "用法: $0 [选项]"
    echo
    echo "选项:"
    echo "  start     启动向日葵客户端"
    echo "  stop      停止向日葵客户端"
    echo "  restart   重启向日葵客户端"
    echo "  status    查看向日葵状态"
    echo "  info      显示连接信息"
    echo "  help      显示此帮助信息"
    echo
    echo "连接方式:"
    echo "1. 启动后会在系统托盘显示向日葵图标"
    echo "2. 点击图标可以查看连接码和密码"
    echo "3. 在其他设备上安装向日葵客户端"
    echo "4. 输入连接码和密码即可远程控制"
}

show_status() {
    echo "=== 向日葵状态检查 ==="
    echo "检查时间: $(date)"
    echo

    # 检查进程
    if pgrep -f "sunloginclient" > /dev/null; then
        echo "✅ 向日葵客户端正在运行"
        ps aux | grep sunloginclient | grep -v grep | head -3
    else
        echo "❌ 向日葵客户端未运行"
    fi

    echo

    # 检查服务
    if pgrep -f "oray_rundaemon" > /dev/null; then
        echo "✅ 向日葵守护进程正在运行"
    else
        echo "❌ 向日葵守护进程未运行"
    fi

    echo

    # 显示端口
    echo "网络端口:"
    netstat -tlnp 2>/dev/null | grep -E "(5900|3389|40000)" | head -3 || echo "  未检测到远程桌面端口"
}

start_sunlogin() {
    echo "启动向日葵..."

    # 如果已在运行
    if pgrep -f "sunloginclient" > /dev/null; then
        echo "向日葵已经在运行中"
        show_status
        return
    fi

    # 启动向日葵
    if [ -x "$SUNLOGIN_CLIENT" ]; then
        echo "正在启动向日葵客户端..."
        nohup "$SUNLOGIN_CLIENT" > /dev/null 2>&1 &
        sleep 2

        if pgrep -f "sunloginclient" > /dev/null; then
            echo "✅ 向日葵启动成功"
        else
            echo "❌ 向日葵启动失败"
        fi
    else
        echo "❌ 找不到向日葵客户端程序"
        echo "请确认已正确安装向日葵"
    fi
}

stop_sunlogin() {
    echo "停止向日葵..."

    if pgrep -f "sunloginclient" > /dev/null; then
        echo "正在停止向日葵进程..."
        pkill -f "sunloginclient"
        sleep 2

        if ! pgrep -f "sunloginclient" > /dev/null; then
            echo "✅ 向日葵已停止"
        else
            echo "⚠️  部分进程仍在运行，尝试强制停止..."
            pkill -9 -f "sunloginclient"
        fi
    else
        echo "向日葵未在运行"
    fi
}

show_info() {
    echo "=== 向日葵连接信息 ==="
    echo
    echo "如何连接此电脑:"
    echo
    echo "1. 确保向日葵正在运行"
    echo "2. 在桌面环境中找到向日葵图标"
    echo "3. 点击图标显示连接码和密码"
    echo
    echo "远程连接方法:"
    echo "- 手机/平板: 下载向日葵客户端App"
    echo "- 电脑: 访问 https://sunlogin.oray.com/ 或下载客户端"
    echo "- 浏览器: 直接在网页版输入连接码"
    echo
    echo "注意事项:"
    echo "- 确保网络连接正常"
    echo "- 如有防火墙，请允许向日葵访问网络"
    echo "- 首次使用需要注册向日葵账号"
}

# 主程序
case "${1:-help}" in
    "start")
        start_sunlogin
        show_status
        ;;
    "stop")
        stop_sunlogin
        ;;
    "restart")
        stop_sunlogin
        sleep 1
        start_sunlogin
        show_status
        ;;
    "status")
        show_status
        ;;
    "info")
        show_info
        ;;
    "help"|*)
        show_help
        ;;
esac