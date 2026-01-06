# V2Ray 配置信息文档

## 🚀 服务状态
- **服务状态**: ✅ 正在运行
- **代理连接**: ✅ 正常工作
- **外部IP**: 47.111.78.192（代理生效）
- **配置时间**: 2025-07-10 17:44

## 📍 当前节点信息
- **节点名称**: 日本 TTTT2
- **服务器地址**: 45.95.212.92
- **端口**: 443
- **协议**: VMess over TCP
- **UUID**: c65abf0e-3fef-46d1-8c4f-b84db14c84b9
- **安全类型**: auto
- **传输协议**: TCP
- **TLS**: 无

## 🔧 代理端口配置
- **SOCKS5 代理**: 127.0.0.1:1080
- **HTTP 代理**: 127.0.0.1:8080

## 📂 文件位置
- **配置文件**: `/home/devbox/project/v2ray-install/config.json`
- **日志文件**: `/tmp/v2ray.log`
- **启动脚本**: `/home/devbox/project/start-v2ray.sh`

## 🌐 订阅链接信息
- **原始订阅**: https://cccc.v2ray.ws/api/subscribe?token=fb56b23d7520454380f57d465a43bccd&flag=1
- **格式**: V2Ray VMess 原生格式
- **协议类型**: Base64编码的VMess链接

## ⚙️ 完整配置文件内容

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"
      }
    },
    {
      "port": 8080,
      "protocol": "http",
      "settings": {}
    }
  ],
  "outbounds": [
    {
      "tag": "japan-proxy",
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "45.95.212.92",
            "port": 443,
            "users": [
              {
                "id": "c65abf0e-3fef-46d1-8c4f-b84db14c84b9",
                "alterId": 0,
                "security": "auto"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "none"
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {}
    },
    {
      "tag": "blocked",
      "protocol": "blackhole",
      "settings": {}
    }
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "domain": [
          "claude.ai",
          "anthropic.com",
          "cursor.sh",
          "cursor.com",
          "api.anthropic.com",
          "console.anthropic.com",
          "claude-api.anthropic.com",
          "google.com",
          "googleapis.com",
          "www.google.com",
          "zerossl.com",
          "app.zerossl.com",
          "api.zerossl.com",
          "sslforfree.com",
          "www.sslforfree.com",
          "letsencrypt.org",
          "acme-v02.api.letsencrypt.org",
          "get.acme.sh",
          "raw.githubusercontent.com",
          "objects.githubusercontent.com",
          "github.com",
          "ssl-for-free.com"
        ],
        "outboundTag": "japan-proxy"
      },
      {
        "type": "field",
        "protocol": ["bittorrent"],
        "outboundTag": "blocked"
      },
      {
        "type": "field",
        "network": "udp,tcp",
        "outboundTag": "direct"
      }
    ]
  }
}
```

## 🎯 使用方法

### 浏览器设置
1. **Chrome/Edge/Firefox**:
   - 设置代理服务器：127.0.0.1:1080 (SOCKS5)
   - 或者：127.0.0.1:8080 (HTTP)

2. **系统代理设置**:
   ```bash
   export http_proxy=http://127.0.0.1:8080
   export https_proxy=http://127.0.0.1:8080
   ```

### 命令行测试
```bash
# 测试代理连接
curl --socks5 127.0.0.1:1080 https://httpbin.org/ip

# 测试HTTP代理
curl --proxy 127.0.0.1:8080 https://httpbin.org/ip

# 访问Google（如果可用）
curl --socks5 127.0.0.1:1080 https://www.google.com

# 检查代理IP
curl --socks5 127.0.0.1:1080 https://ipinfo.io
```

## 🔨 V2Ray 管理命令

### 服务控制
```bash
# 重启V2Ray服务
v2ray restart

# 停止V2Ray服务
v2ray stop

# 启动V2Ray服务
v2ray start

# 查看服务状态
v2ray status
```

### 日志查看
```bash
# 实时查看日志
tail -f /tmp/v2ray.log

# 查看最近日志
tail -20 /tmp/v2ray.log

# 查看错误日志
grep -i error /tmp/v2ray.log
```

## 🌟 可用节点列表

从订阅链接解码的其他可用节点（如需切换）：

### 日本节点
- **日本 TTTT2**: 45.95.212.92:443 (当前使用)
- **日本 CCCC x2**: 46.3.45.37:443

### 香港节点
- **香港 m1**: 202.73.4.158:443
- **香港 Plus A x2**: 46.232.105.62:443
- **香港 Plus B x2**: 46.232.105.119:443
- **香港_Plus**: 116.48.79.210:18080

### 美国节点
- **美国 1 CN2 GIA**: 154.26.187.38:443
- **美国 2 CN2 GIA**: 154.17.12.29:443
- **美国 3 CN2 GIA**: 154.17.21.25:443
- 更多美国节点...

### 其他地区
- **新加坡 Plus x2**: 46.3.193.104:443
- **台湾 1**: 85.237.207.125:443
- **马来西亚 1**: 47.250.50.133:443
- **韩国_a1**: 8.220.241.181:443

## 🔧 故障排除

### 常见问题
1. **连接失败 (000状态码)**
   - 检查节点是否可用
   - 尝试切换其他节点
   - 检查网络连接

2. **TLS握手错误**
   - 确认使用TCP协议而非HTTP
   - 检查TLS设置
   - 尝试allowInsecure设置

3. **代理连接被拒绝**
   - 检查防火墙设置
   - 确认V2Ray服务正在运行
   - 检查端口占用情况

### 诊断命令
```bash
# 检查V2Ray进程
ps aux | grep v2ray

# 检查端口占用
netstat -tlnp | grep -E '1080|8080'

# 测试本地连接
curl -x socks5://127.0.0.1:1080 httpbin.org/ip
```

## 📝 更新说明

### 配置历史
1. **2025-07-10**: 初始配置Clash转V2Ray
2. **2025-07-10**: 修复HTTP协议错误，改为TCP
3. **2025-07-10**: 配置成功，代理正常工作

### 下次更新
- 根据需要添加更多节点
- 配置负载均衡
- 添加自动故障转移

## ⚠️ 重要提醒

1. **安全性**: 请勿在公共场所分享配置信息
2. **合规性**: 请遵守当地法律法规使用代理服务
3. **稳定性**: 定期检查节点可用性，及时更新配置
4. **备份**: 建议备份配置文件，以防意外丢失

---

**文档创建时间**: 2025-07-10 17:44  
**最后更新**: 2025-07-10 17:44  
**配置状态**: ✅ 正常运行 