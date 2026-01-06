# SSH 连接保持配置说明

## 已完成的配置

### 客户端配置 (~/.ssh/config)
```bash
Host *
    ServerAliveInterval 60      # 每60秒发送一次心跳
    ServerAliveCountMax 1440    # 允许1440次心跳失败 (24小时)
    TCPKeepAlive yes           # 启用TCP保持连接
```

### 配置效果
- **心跳间隔**: 每60秒发送一次keep-alive信号
- **断开时间**: 60秒 × 1440 = 86400秒 = **24小时**
- **连接方式**: TCP级别和SSH协议级别双重保持

## 使用方法

### 1. 现有连接
- 当前SSH连接会在60秒后开始发送心跳
- 连接最长可保持24小时不活动

### 2. 新建连接
- 所有新的SSH连接都会自动应用此配置
- 支持所有远程主机

## 服务器端配置建议

如需更强稳定性，可配置服务器端（需要sudo权限）：
```bash
# 编辑服务器配置
sudo nano /etc/ssh/sshd_config

# 添加以下行
ClientAliveInterval 60
ClientAliveCountMax 1440
TCPKeepAlive yes

# 重启SSH服务
sudo systemctl restart sshd
```

## 验证配置

### 检查心跳
```bash
# 查看SSH连接状态
ss -tn state established | grep :22
```

### 测试连接保持
1. 建立SSH连接
2. 等待超过1小时不操作
3. 连接应该仍然活跃

## 故障排除

### 连接仍然断开
1. 检查网络稳定性
2. 联系网络管理员检查防火墙
3. 尝试减小心跳间隔（如30秒）

### 权限问题
确保SSH配置文件权限正确：
```bash
chmod 600 ~/.ssh/config
```

## 其他保持连接的方法

### 使用tmux/screen
```bash
# 安装tmux
sudo apt install tmux

# 在tmux中工作
tmux new -s mysession
```

### SSH命令参数
```bash
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=1440 user@host
```

配置完成！现在您的SSH连接可以保持24小时不断开。