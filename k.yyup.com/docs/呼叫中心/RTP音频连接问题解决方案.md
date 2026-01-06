# RTP音频连接问题解决方案

## 问题描述

### 现象
- ✅ SIP拨号成功 - 收到 "100 Trying" 响应
- ❌ RTP无法连接 - 没有音频流

### 根本原因
**SIP服务器在公网** (47.94.82.59)，**我们的服务在内网** (192.168.1.243)

当SDP（会话描述协议）中包含内网IP时，公网的SIP服务器无法将RTP音频流发送到内网地址。

## 技术原理

### SIP呼叫流程
```
1. 客户端 → SIP服务器: INVITE (包含SDP，告诉服务器RTP地址)
2. SIP服务器 → 客户端: 100 Trying (收到请求)
3. SIP服务器 → 客户端: 180 Ringing (正在呼叫)
4. SIP服务器 → 客户端: 200 OK (呼叫接通，包含服务器的RTP地址)
5. 客户端 ↔ SIP服务器: RTP音频流 (双向音频传输)
```

### SDP示例
```
v=0
o=- 1760473432670 1760473432670 IN IP4 192.168.1.243  ← 内网IP
s=Call
c=IN IP4 192.168.1.243  ← 内网IP，公网服务器无法访问！
t=0 0
m=audio 10000 RTP/AVP 0 8 101
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-15
a=sendrecv
a=ptime:20
```

## 解决方案

### 方案1: 配置公网IP（推荐）

#### 1.1 获取公网IP
```bash
curl ifconfig.me
# 或
curl icanhazip.com
```

#### 1.2 配置环境变量
在 `server/.env` 中添加：
```bash
SIP_PUBLIC_HOST=你的公网IP
```

例如：
```bash
SIP_PUBLIC_HOST=123.45.67.89
```

#### 1.3 配置端口映射
在路由器或防火墙上配置端口映射：
- **SIP端口**: 5061 (UDP) → 内网服务器 192.168.1.243:5061
- **RTP端口**: 10000-20000 (UDP) → 内网服务器 192.168.1.243:10000-20000

#### 1.4 重启服务
```bash
cd server
npm run dev
```

### 方案2: 使用STUN/TURN服务器

STUN (Session Traversal Utilities for NAT) 可以帮助发现公网IP。

#### 2.1 安装STUN客户端
```bash
npm install stun
```

#### 2.2 修改代码自动获取公网IP
```typescript
import { request } from 'stun';

async function getPublicIP(): Promise<string> {
  const response = await request('stun.l.google.com:19302');
  return response.getXorAddress().address;
}
```

### 方案3: 部署到公网服务器

将整个服务部署到公网服务器，避免NAT问题。

## 验证方法

### 1. 测试SIP连接
```bash
node test-sip-simple-invite.cjs
```

应该看到：
```
✅ SIP INVITE已发送
📥 收到来自 47.94.82.59:5060 的响应:
SIP/2.0 100 trying -- your call is important to us
```

### 2. 检查SDP内容
查看日志中的SDP，确认使用的是公网IP：
```
📝 生成SDP - 使用IP: 123.45.67.89 (公网)
c=IN IP4 123.45.67.89  ← 应该是公网IP
```

### 3. 测试RTP连接
```bash
# 监听RTP端口
tcpdump -i any -n udp port 10000

# 发起呼叫
curl -X POST http://localhost:3000/api/call-center/call/udp/make \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"18611141133"}'
```

应该看到RTP数据包：
```
📥 收到RTP数据包: 172 字节
```

## 常见问题

### Q1: 我没有公网IP怎么办？
**A**: 使用以下方案之一：
1. 使用云服务器（阿里云、腾讯云等）
2. 使用内网穿透工具（frp、ngrok等）
3. 联系网络管理员申请公网IP

### Q2: 配置了公网IP还是没有音频？
**A**: 检查以下几点：
1. 防火墙是否开放了RTP端口（10000-20000）
2. 路由器是否配置了端口映射
3. 公网IP是否正确（使用 `curl ifconfig.me` 验证）
4. SDP中的IP是否是公网IP（查看日志）

### Q3: 如何调试RTP连接？
**A**: 使用以下工具：
```bash
# 1. 监听RTP端口
tcpdump -i any -n udp port 10000 -X

# 2. 检查端口是否开放
nc -u -l 10000

# 3. 发送测试RTP包
echo "test" | nc -u 公网IP 10000
```

### Q4: 内网穿透如何配置？
**A**: 使用frp示例：

**frps.ini** (服务器端):
```ini
[common]
bind_port = 7000
```

**frpc.ini** (客户端):
```ini
[common]
server_addr = 公网服务器IP
server_port = 7000

[sip]
type = udp
local_ip = 127.0.0.1
local_port = 5061
remote_port = 5061

[rtp]
type = udp
local_ip = 127.0.0.1
local_port = 10000
remote_port = 10000
```

## 最佳实践

### 1. 生产环境
- ✅ 使用云服务器，直接获得公网IP
- ✅ 配置防火墙规则，只开放必要端口
- ✅ 使用HTTPS/WSS加密通信
- ✅ 配置日志监控和告警

### 2. 开发环境
- ✅ 使用内网穿透工具（frp、ngrok）
- ✅ 配置本地防火墙规则
- ✅ 使用测试SIP服务器

### 3. 测试环境
- ✅ 使用Docker容器，模拟公网环境
- ✅ 配置虚拟网络，测试NAT穿透
- ✅ 使用Wireshark抓包分析

## 参考资料

- [RFC 3261 - SIP协议](https://tools.ietf.org/html/rfc3261)
- [RFC 4566 - SDP协议](https://tools.ietf.org/html/rfc4566)
- [RFC 3550 - RTP协议](https://tools.ietf.org/html/rfc3550)
- [RFC 5389 - STUN协议](https://tools.ietf.org/html/rfc5389)
- [NAT穿透技术详解](https://en.wikipedia.org/wiki/NAT_traversal)

## 总结

RTP音频连接问题的核心是**NAT穿透**问题。解决方案的优先级：

1. **最佳**: 部署到公网服务器
2. **推荐**: 配置公网IP + 端口映射
3. **备选**: 使用STUN/TURN服务器
4. **开发**: 使用内网穿透工具

选择合适的方案后，按照上述步骤配置，即可解决RTP音频连接问题。

