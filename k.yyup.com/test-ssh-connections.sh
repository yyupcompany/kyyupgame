#!/bin/bash

echo "=== SSH多用户连接测试工具 ==="
echo "检查时间: $(date)"
echo

# 1. 当前登录用户
echo "1. 当前登录用户:"
who -u
echo

# 2. SSH连接进程
echo "2. SSH连接进程:"
ps aux | grep -E "sshd.*@" | grep -v grep | awk '{print $1, $2, $12, $13, $14}'
echo

# 3. 网络连接状态
echo "3. SSH网络连接 (22端口):"
ss -tnp | grep ":22" | head -10
echo

# 4. 用户登录限制
echo "4. 系统用户登录限制:"
echo "最大用户数: $(cat /etc/login.defs | grep "^UID_MAX" | awk '{print $2}' || echo "未设置")"
echo

# 5. SSH默认配置检查
echo "5. SSH配置检查 (需要sudo权限):"
echo "MaxSessions: $(grep "^MaxSessions" /etc/ssh/sshd_config 2>/dev/null || echo "默认值10")"
echo "ClientAliveInterval: $(grep "^ClientAliveInterval" /etc/ssh/sshd_config 2>/dev/null || echo "未设置")"
echo

# 6. 系统资源
echo "6. 系统资源状态:"
echo "当前进程数: $(ps aux | wc -l)"
echo "最大文件描述符: $(cat /proc/sys/fs/file-max)"
echo

echo "=== 测试完成 ==="
echo "提示: 开启另一个终端，用同一账号再次SSH登录来测试并存情况"