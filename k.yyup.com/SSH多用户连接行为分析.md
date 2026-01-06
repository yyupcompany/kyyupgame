# SSH多用户连接行为分析

## 当前系统状态

### 系统配置
- **操作系统**: Linux
- **SSH服务**: OpenSSH
- **当前用户**: zhgue
- **最大用户数**: 60000

### SSH默认配置
```bash
MaxSessions: 10 (默认值)
ClientAliveInterval: 未设置 (0)
```

## 多账号登录行为

### ✅ **支持的情况**
1. **同一账号多次连接**: ✅ 支持
   - 同一用户可以开启多个SSH会话
   - 每个会话独立运行
   - 互不干扰，可同时操作

2. **不同账号同时登录**: ✅ 支持
   - 系统允许多个用户同时登录
   - 每个用户独立的会话空间
   - 资源隔离

### 🔍 **连接限制**
1. **单用户最大会话数**: 10个 (MaxSessions)
2. **系统最大用户数**: 60000
3. **网络连接**: 受系统文件描述符限制

## 连接行为说明

### 📊 **并存模式** (默认)
- **新连接不会踢掉旧连接**
- **所有会话同时活跃**
- **资源共享，但操作独立**

### 🔄 **连接管理**
```bash
# 查看当前所有登录用户
who -u

# 查看SSH会话
ps aux | grep sshd

# 强制断开特定会话 (需要权限)
sudo pkill -9 "sshd: user@pts/N"
```

## 测试验证方法

### 方法1: 多终端测试
1. 在终端1中SSH登录
2. 在终端2中用同一账号再次SSH登录
3. 观察两个会话是否都活跃

### 方法2: 后台任务测试
```bash
# 在第一个会话中运行
while true; do echo "Session1 $(date)"; sleep 5; done

# 在第二个会话中运行
while true; do echo "Session2 $(date)"; sleep 5; done
```

## 特殊情况

### 🚫 **可能被踢的情况**
1. **达到MaxSessions限制** (10个)
2. **系统资源耗尽** (内存、进程数等)
3. **管理员主动断开**
4. **网络连接问题**

### ⚙️ **强制单会话配置**
如果需要"后者踢掉前者"的行为，需要修改SSH配置：
```bash
# 编辑 /etc/ssh/sshd_config
MaxSessions 1
ClientAliveInterval 60
ClientAliveCountMax 1

# 重启SSH服务
sudo systemctl restart sshd
```

## 最佳实践建议

### ✅ **推荐配置**
- 保持默认的多会话支持
- 使用tmux/screen进行会话管理
- 定期清理闲置连接

### 📋 **监控脚本**
```bash
#!/bin/bash
# 监控SSH连接
echo "SSH连接监控:"
who
echo "活跃SSH进程:"
ps aux | grep sshd | grep -v grep
```

## 结论

**当前系统支持多用户、多会话并存，不会互相踢掉连接。**