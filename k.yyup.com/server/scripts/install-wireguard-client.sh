#!/bin/bash

################################################################################
# WireGuard 客户端自动安装脚本
# 服务器: 47.94.82.59:51820
# 用途: 在新服务器上快速部署 WireGuard VPN 客户端
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# VPN 服务器配置
VPN_SERVER_IP="47.94.82.59"
VPN_SERVER_PORT="51820"
VPN_SERVER_PUBLIC_KEY="NV4l1U9N48kIn+Pyd12FB4F/Ffu55uuqWfJh/nwoYn0="

# 客户端配置（可修改）
CLIENT_VPN_IP="10.0.0.10"  # 修改为你要的静态 IP（避免与其他客户端冲突）
CLIENT_CONFIG_NAME="szblade-vpn"
CLIENT_INTERFACE="wg0"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   WireGuard 客户端安装脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    echo "使用: sudo $0"
    exit 1
fi

# 检测系统类型
if [ -f /etc/debian_version ]; then
    OS="debian"
    echo -e "${GREEN}检测到 Debian/Ubuntu 系统${NC}"
elif [ -f /etc/redhat-release ]; then
    OS="redhat"
    echo -e "${GREEN}检测到 RedHat/CentOS 系统${NC}"
else
    echo -e "${RED}不支持的操作系统${NC}"
    exit 1
fi

# 安装 WireGuard
echo ""
echo -e "${YELLOW}步骤 1/6: 安装 WireGuard...${NC}"

if [ "$OS" = "debian" ]; then
    apt-get update
    apt-get install -y wireguard wireguard-tools
elif [ "$OS" = "redhat" ]; then
    yum install -y wireguard-tools
fi

echo -e "${GREEN}✓ WireGuard 安装完成${NC}"

# 启用 IP 转发
echo ""
echo -e "${YELLOW}步骤 2/6: 配置 IP 转发...${NC}"

if ! grep -q "net.ipv4.ip_forward=1" /etc/sysctl.conf; then
    echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
fi
sysctl -p > /dev/null 2>&1

echo -e "${GREEN}✓ IP 转发已启用${NC}"

# 生成客户端密钥对
echo ""
echo -e "${YELLOW}步骤 3/6: 生成客户端密钥...${NC}"

# 创建配置目录
mkdir -p /etc/wireguard

# 生成私钥
PRIVATE_KEY=$(wg genkey)
# 从私钥生成公钥
PUBLIC_KEY=$(echo "$PRIVATE_KEY" | wg pubkey)

echo "客户端私钥: $PRIVATE_KEY"
echo "客户端公钥: $PUBLIC_KEY"

echo -e "${GREEN}✓ 密钥生成完成${NC}"

# 显示客户端信息（需要发送给服务器管理员添加到服务器配置）
echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}重要！请将以下信息发送给服务器管理员：${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "客户端公钥: $PUBLIC_KEY"
echo "客户端 VPN IP: $CLIENT_VPN_IP"
echo ""
echo -e "${YELLOW}========================================${NC}"
echo ""
read -p "按 Enter 继续安装（确保已将上述信息发送给管理员）..."

# 创建 WireGuard 配置文件
echo ""
echo -e "${YELLOW}步骤 4/6: 创建配置文件...${NC}"

cat > /etc/wireguard/${CLIENT_INTERFACE}.conf << EOF
[Interface]
# 客户端私钥
PrivateKey = ${PRIVATE_KEY}

# 客户端 VPN 静态 IP
Address = ${CLIENT_VPN_IP}/24

# DNS 服务器
DNS = 8.8.8.8, 8.8.4.4

# MTU (可选)
MTU = 1420

# 客户端启动后执行的脚本（可选）
# PostUp = echo "WireGuard 已启动" > /var/log/wireguard.log
# PostDown = echo "WireGuard 已停止" >> /var/log/wireguard.log

[Peer]
# VPN 服务器公钥
PublicKey = ${VPN_SERVER_PUBLIC_KEY}

# VPN 服务器地址（公网 IP:端口）
Endpoint = ${VPN_SERVER_IP}:${VPN_SERVER_PORT}

# 允许通过 VPN 的流量（0.0.0.0/0 表示所有流量）
AllowedIPs = 0.0.0.0/0

# 保持连接（每 25 秒发送一次心跳）
PersistentKeepalive = 25
EOF

# 设置权限
chmod 600 /etc/wireguard/${CLIENT_INTERFACE}.conf

echo -e "${GREEN}✓ 配置文件已创建: /etc/wireguard/${CLIENT_INTERFACE}.conf${NC}"

# 启动 WireGuard
echo ""
echo -e "${YELLOW}步骤 5/6: 启动 WireGuard...${NC}"

# 停止可能存在的旧接口
wg-quick down ${CLIENT_INTERFACE} 2>/dev/null || true

# 启动 WireGuard
wg-quick up ${CLIENT_INTERFACE}

echo -e "${GREEN}✓ WireGuard 已启动${NC}"

# 设置开机自启
echo ""
echo -e "${YELLOW}步骤 6/6: 设置开机自启...${NC}"

# 启用 systemd 服务
systemctl enable wg-quick@${CLIENT_INTERFACE}.service

echo -e "${GREEN}✓ 开机自启已设置${NC}"

# 显示状态
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}         安装完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 显示当前状态
echo "当前状态:"
wg show ${CLIENT_INTERFACE}

echo ""
echo "网络接口:"
ip addr show ${CLIENT_INTERFACE}

echo ""
echo -e "${GREEN}配置信息:${NC}"
echo "  配置文件: /etc/wireguard/${CLIENT_INTERFACE}.conf"
echo "  服务名称: wg-quick@${CLIENT_INTERFACE}.service"
echo "  VPN IP: ${CLIENT_VPN_IP}"
echo "  服务器: ${VPN_SERVER_IP}:${VPN_SERVER_PORT}"

echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo "  启动 VPN:   wg-quick up ${CLIENT_INTERFACE}"
echo "  停止 VPN:   wg-quick down ${CLIENT_INTERFACE}"
echo "  重启 VPN:   wg-quick down ${CLIENT_INTERFACE} && wg-quick up ${CLIENT_INTERFACE}"
echo "  查看状态:   wg show ${CLIENT_INTERFACE}"
echo "  查看日志:   journalctl -u wg-quick@${CLIENT_INTERFACE} -f"

echo ""
echo -e "${YELLOW}测试连接:${NC}"
echo "  ping 10.0.0.1"
echo "  ping ${VPN_SERVER_IP}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}      安装脚本执行完成！${NC}"
echo -e "${GREEN}========================================${NC}"
