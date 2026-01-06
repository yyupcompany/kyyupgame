# SIP呼叫中心架构说明

## 📋 概述

本文档说明SIP（Session Initiation Protocol）协议在呼叫中心系统中的应用和配置架构。

## 🏗️ SIP协议基础

### SIP协议的作用
SIP是一种应用层控制协议，用于创建、修改和终止多媒体会话（语音、视频、即时消息等）。在呼叫中心中，SIP主要用于：

1. **用户注册** - 分机向SIP服务器注册自己的位置
2. **呼叫建立** - 建立两个分机之间的通话会话
3. **呼叫控制** - 保持、转移、会议等通话操作
4. **媒体协商** - 协商编解码器和媒体参数

### SIP协议组件
```
用户代理(UA) ──┐
              │ SIP消息 (INVITE, ACK, BYE, CANCEL, OPTIONS, REGISTER)
              ▼
        SIP代理服务器/注册服务器
              │
              ▼
        媒体服务器(RTP/RTCP)
```

## 🎯 呼叫中心SIP架构

### 三层架构设计

#### 1. SIP服务器配置层 (SIPConfig)
负责SIP服务器的基本配置：
- **服务器地址**: SIP服务器的IP和端口
- **认证信息**: SIP用户名和密码
- **DID号码**: 外线号码配置
- **编解码器**: 支持的音频/视频编解码器
- **RTP配置**: 媒体传输端口范围

#### 2. SIP分机配置层 (ExtensionConfig)
负责单个分机的配置：
- **分机号**: SIP分机号（如1001, 1002）
- **注册配置**: 向SIP服务器注册的参数
- **功能配置**: 呼叫等待、免打扰、转移等
- **权限控制**: 外呼、呼入权限管理

#### 3. 呼叫控制层 (CallCenter)
负责实际的呼叫控制逻辑：
- **呼叫发起**: 通过INVITE消息建立通话
- **媒体处理**: RTP媒体流的处理
- **状态管理**: 通话状态的实时更新

## 📝 配置字段说明

### SIPConfig主要字段

#### 服务器配置
```typescript
{
  sipServerHost: 'sip.example.com',    // SIP服务器地址
  sipServerPort: 5060,                // SIP服务器端口
  sipProtocol: 'udp',                 // 传输协议
  sipRealm: 'example.com',           // SIP域
  sipTransport: 'udp'                  // 传输层
}
```

#### 认证配置
```typescript
{
  sipUsername: 'trunk001',            // SIP用户名
  sipPassword: 'password123',         // SIP密码
  sipAuthUsername: 'auth001',         // 认证用户名(可选)
  sipAuthPassword: 'authpass123'      // 认证密码(可选)
}
```

#### DID号码配置
```typescript
{
  didNumbers: ['01012345678', '01012345679'],  // 外线号码列表
  defaultDidNumber: '01012345678'                 // 默认外线号码
}
```

#### 编解码器配置
```typescript
{
  audioCodecs: ['PCMA', 'PCMU', 'G729'],        // 音频编解码器
  videoCodecs: ['H264', 'VP8']                   // 视频编解码器(可选)
}
```

### ExtensionConfig主要字段

#### SIP认证信息
```typescript
{
  sipUsername: '1001',                  // 分机SIP用户名
  sipPassword: 'ext1001pass',           // 分机SIP密码
  sipDomain: 'example.com',            // SIP域
  sipServer: 'sip.example.com',        // SIP服务器
  sipPort: 5060,                       // SIP端口
  sipTransport: 'udp',                  // 传输协议
  registerInterval: 3600               // 注册间隔(秒)
}
```

#### 功能配置
```typescript
{
  callWaiting: true,                    // 呼叫等待
  doNotDisturb: false,                  // 免打扰
  forwardEnabled: false,                // 呼叫转移
  forwardNumber: '',                   // 转移号码
  voicemailEnabled: true,               // 语音信箱
  recordCalls: true,                    // 通话录音
  allowOutbound: true,                  // 允许外呼
  allowInbound: true                    // 允许呼入
}
```

## 🔄 SIP呼叫流程

### 1. 分机注册流程
```
1. Extension → SIP Server: REGISTER
2. SIP Server → Extension: 401 Unauthorized (要求认证)
3. Extension → SIP Server: REGISTER (包含认证信息)
4. SIP Server → Extension: 200 OK (注册成功)
```

### 2. 外呼流程
```
1. CallCenter → SIP Server: INVITE (目标号码)
2. SIP Server → PSTN Gateway: INVITE
3. PSTN Gateway → 被叫方: INVITE
4. 被叫方 → PSTN Gateway: 180 Ringing
5. PSTN Gateway → SIP Server: 180 Ringing
6. SIP Server → CallCenter: 180 Ringing
7. 被叫方接听 → PSTN Gateway: 200 OK
8. PSTN Gateway → SIP Server: 200 OK
9. SIP Server → CallCenter: 200 OK
10. CallCenter → SIP Server: ACK
11. 媒体流建立 (RTP)
```

### 3. 内部呼叫流程
```
1. Extension A → SIP Server: INVITE Extension B
2. SIP Server → Extension B: INVITE
3. Extension B → SIP Server: 180 Ringing
4. SIP Server → Extension A: 180 Ringing
5. Extension B 接听 → SIP Server: 200 OK
6. SIP Server → Extension A: 200 OK
7. Extension A → SIP Server: ACK
8. 媒体流建立 (RTP)
```

## 🔧 配置最佳实践

### 1. SIP服务器配置
- **端口设置**: 标准SIP端口为5060/UDP
- **域设置**: 使用公司域名作为SIP域
- **认证**: 使用强密码，定期更换
- **防火墙**: 确保SIP端口和RTP端口开放

### 2. DID号码管理
- **号码分配**: 为不同业务分配不同DID号码
- **主号码**: 设置一个默认主叫号码
- **号码验证**: 确保DID号码的有效性

### 3. 分机配置
- **编号规则**: 使用3-4位数字分机号
- **密码策略**: 每个分机使用独立密码
- **权限控制**: 根据岗位设置不同权限
- **功能配置**: 按需启用各种功能

### 4. 编解码器选择
- **音频编解码器**:
  - PCMU (G.711μ): 适用于局域网
  - PCMA (G.711A): 适用于局域网
  - G.729: 适用于低带宽网络
  - Opus: 适用于高质量音频
- **视频编解码器**:
  - H264: 适用于大多数场景
  - VP8: 开源替代方案

## 🚀 部署建议

### 1. 网络要求
- **带宽**: 每路通话建议64kbps (G.711) 或 8kbps (G.729)
- **延迟**: 建议单向延迟 < 150ms
- **抖动**: 建议抖动 < 30ms
- **丢包**: 建议丢包率 < 1%

### 2. 服务器配置
- **硬件**: 建议专用服务器，双网卡配置
- **操作系统**: Linux (CentOS/Ubuntu)
- **SIP服务器**: Asterisk, FreeSWITCH, Kamailio等
- **媒体服务器**: Asterisk, FreeSWITCH, RTPProxy等

### 3. 安全配置
- **TLS加密**: 启用SIP over TLS
- **SRTP加密**: 启用安全RTP
- **访问控制**: 限制SIP访问的IP地址
- **防火墙**: 配置适当的防火墙规则

## 📞 实际应用场景

### 1. 小型呼叫中心
- **SIP服务器**: 1台 Asterisk服务器
- **分机数量**: 10-50个分机
- **DID号码**: 2-5个外线号码
- **并发通话**: 5-10路同时通话

### 2. 中型呼叫中心
- **SIP服务器**: 2台服务器 (主备)
- **分机数量**: 50-200个分机
- **DID号码**: 10-20个外线号码
- **并发通话**: 20-50路同时通话

### 3. 大型呼叫中心
- **SIP服务器**: 多台服务器集群
- **分机数量**: 200+个分机
- **DID号码**: 50+个外线号码
- **并发通话**: 100+路同时通话

## 🔍 故障排查

### 常见问题和解决方案

#### 1. 分机无法注册
- 检查SIP服务器地址和端口
- 验证用户名和密码
- 检查网络连接和防火墙设置
- 查看SIP服务器日志

#### 2. 通话质量差
- 检查网络带宽和延迟
- 验证编解码器兼容性
- 检查RTP端口是否开放
- 考虑使用QoS优先级

#### 3. 无法外呼
- 检查DID号码配置
- 验证外线权限
- 检查PSTN网关配置
- 联系运营商确认线路状态

#### 4. 音频单通
- 检查NAT配置
- 验证STUN/TURN服务器设置
- 检查防火墙UDP端口
- 考虑使用SIP ALG

## 📚 参考资料

- [RFC 3261 - SIP: Session Initiation Protocol](https://tools.ietf.org/html/rfc3261)
- [RFC 3581 - An Extension to the Session Initiation Protocol (SIP) for Symmetric Response Routing](https://tools.ietf.org/html/rfc3581)
- [RFC 3550 - RTP: A Transport Protocol for Real-Time Applications](https://tools.ietf.org/html/rfc3550)
- [Asterisk文档](https://wiki.asterisk.org/wiki/Main_Page)
- [FreeSWITCH文档](https://freeswitch.org/confluence/display/FREESWITCH/)

---

*此文档随着系统的发展会持续更新，请定期查看最新版本。*