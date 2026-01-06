# ASR二进制协议实现总结

## 🔍 **重大发现**

通过MCP浏览器读取火山引擎ASR文档后，发现了一个**关键问题**：

### ❌ **之前的错误**

ASR API使用的是**二进制协议**，而不是JSON协议！

之前的实现发送的是JSON格式的消息：
```javascript
const startMessage = {
  type: 'start',
  data: { ... }
};
ws.send(JSON.stringify(startMessage));
```

这导致了 `Invalid WebSocket frame: invalid UTF-8 sequence` 错误。

---

## ✅ **正确的协议**

### 协议格式

```
[Header 4字节] + [Payload Size 4字节] + [Payload N字节]
```

### Header结构（4字节）

```
Byte 0: [Protocol version 4bits][Header size 4bits]
Byte 1: [Message type 4bits][Message type flags 4bits]
Byte 2: [Serialization 4bits][Compression 4bits]
Byte 3: [Reserved 8bits]
```

### 字段说明

| 字段 | 位数 | 说明 | 值 |
|------|------|------|-----|
| Protocol version | 4 | 协议版本 | `0b0001` (version 1) |
| Header size | 4 | Header大小 | `0b0001` (4字节) |
| Message type | 4 | 消息类型 | `0b0001` (Full client request)<br>`0b0010` (Audio only request)<br>`0b1001` (Full server response)<br>`0b1111` (Error) |
| Message flags | 4 | 消息标志 | `0b0000` (无sequence)<br>`0b0001` (正sequence)<br>`0b0010` (最后一包)<br>`0b0011` (负sequence) |
| Serialization | 4 | 序列化方式 | `0b0000` (无序列化)<br>`0b0001` (JSON) |
| Compression | 4 | 压缩方式 | `0b0000` (无压缩)<br>`0b0001` (Gzip) |
| Reserved | 8 | 保留字段 | `0x00` |

---

## 📋 **消息类型**

### 1. Full Client Request

**用途**: 建立连接后发送的第一个请求，包含音频参数

**Header**:
- Message type: `0b0001`
- Message flags: `0b0000`
- Serialization: `0b0001` (JSON)
- Compression: `0b0001` (Gzip)

**Payload**: JSON格式的请求参数（Gzip压缩）

```json
{
  "user": {
    "uid": "session-id"
  },
  "audio": {
    "format": "pcm",
    "rate": 16000,
    "bits": 16,
    "channel": 1,
    "language": "zh-CN"
  },
  "request": {
    "model_name": "bigmodel",
    "enable_itn": true,
    "enable_punc": true,
    "enable_ddc": true
  }
}
```

### 2. Audio Only Request

**用途**: 发送音频数据

**Header**:
- Message type: `0b0010`
- Message flags: `0b0001` (正常包) 或 `0b0010` (最后一包)
- Serialization: `0b0000` (无序列化)
- Compression: `0b0001` (Gzip)

**Payload**: 音频数据（Gzip压缩）

### 3. Full Server Response

**用途**: 服务器返回识别结果

**Header**:
- Message type: `0b1001`
- Serialization: `0b0001` (JSON)
- Compression: `0b0001` (Gzip)

**Payload**: JSON格式的识别结果（Gzip压缩）

```json
{
  "result": {
    "text": "识别文本",
    "is_final": true,
    "start_time": 0,
    "end_time": 1000,
    "confidence": 0.95
  }
}
```

### 4. Error Message

**用途**: 服务器返回错误信息

**Header**:
- Message type: `0b1111`

**Payload**:
```
[Error code 4字节] + [Error message size 4字节] + [Error message N字节]
```

---

## 🔧 **实现细节**

### Header构造示例

```typescript
private buildHeader(
  messageType: number,
  messageFlags: number,
  serialization: number,
  compression: number
): Buffer {
  const header = Buffer.alloc(4);
  
  // Byte 0: [Protocol version 4bits][Header size 4bits]
  header[0] = (PROTOCOL_VERSION << 4) | HEADER_SIZE;
  
  // Byte 1: [Message type 4bits][Message flags 4bits]
  header[1] = (messageType << 4) | messageFlags;
  
  // Byte 2: [Serialization 4bits][Compression 4bits]
  header[2] = (serialization << 4) | compression;
  
  // Byte 3: Reserved
  header[3] = 0x00;
  
  return header;
}
```

### Full Client Request发送示例

```typescript
private sendFullClientRequest(request: ASRRequest): void {
  // 1. 构造JSON payload
  const payload = {
    user: { uid: this.sessionId },
    audio: {
      format: 'pcm',
      rate: 16000,
      bits: 16,
      channel: 1,
      language: 'zh-CN'
    },
    request: {
      model_name: 'bigmodel',
      enable_itn: true,
      enable_punc: true,
      enable_ddc: true
    }
  };
  
  // 2. JSON序列化
  const payloadJson = JSON.stringify(payload);
  
  // 3. Gzip压缩
  const payloadCompressed = zlib.gzipSync(Buffer.from(payloadJson, 'utf-8'));
  
  // 4. 构造Header
  const header = this.buildHeader(
    MESSAGE_TYPE_FULL_CLIENT_REQUEST,
    MESSAGE_FLAG_NO_SEQUENCE,
    SERIALIZATION_JSON,
    COMPRESSION_GZIP
  );
  
  // 5. 构造Payload Size (4字节，大端)
  const payloadSize = Buffer.alloc(4);
  payloadSize.writeUInt32BE(payloadCompressed.length, 0);
  
  // 6. 组合完整消息
  const message = Buffer.concat([header, payloadSize, payloadCompressed]);
  
  // 7. 发送
  this.ws.send(message);
}
```

### Audio Only Request发送示例

```typescript
sendAudio(audioData: Buffer, isLast: boolean = false): void {
  // 1. Gzip压缩音频数据
  const audioCompressed = zlib.gzipSync(audioData);
  
  // 2. 构造Header
  const messageFlags = isLast ? MESSAGE_FLAG_LAST_PACKAGE : MESSAGE_FLAG_POS_SEQUENCE;
  const header = this.buildHeader(
    MESSAGE_TYPE_AUDIO_ONLY_REQUEST,
    messageFlags,
    SERIALIZATION_NONE,
    COMPRESSION_GZIP
  );
  
  // 3. 构造Payload Size
  const payloadSize = Buffer.alloc(4);
  payloadSize.writeUInt32BE(audioCompressed.length, 0);
  
  // 4. 组合消息
  const message = Buffer.concat([header, payloadSize, audioCompressed]);
  
  // 5. 发送
  this.ws.send(message);
}
```

### 响应解析示例

```typescript
private handleBinaryMessage(data: Buffer): void {
  // 1. 解析Header (4字节)
  const header = data.slice(0, 4);
  const messageType = (header[1] >> 4) & 0x0F;
  const serialization = (header[2] >> 4) & 0x0F;
  const compression = header[2] & 0x0F;
  
  // 2. 解析Sequence (4字节，大端)
  const sequence = data.readUInt32BE(4);
  
  // 3. 解析Payload Size (4字节，大端)
  const payloadSize = data.readUInt32BE(8);
  
  // 4. 解析Payload
  const payload = data.slice(12, 12 + payloadSize);
  
  // 5. 处理不同类型的消息
  if (messageType === MESSAGE_TYPE_FULL_SERVER_RESPONSE) {
    this.handleServerResponse(payload, serialization, compression);
  } else if (messageType === MESSAGE_TYPE_ERROR) {
    this.handleErrorMessage(payload);
  }
}

private handleServerResponse(payload: Buffer, serialization: number, compression: number): void {
  // 1. 解压缩
  let decompressed = payload;
  if (compression === COMPRESSION_GZIP) {
    decompressed = zlib.gunzipSync(payload);
  }
  
  // 2. 反序列化
  if (serialization === SERIALIZATION_JSON) {
    const response = JSON.parse(decompressed.toString('utf-8'));
    
    // 3. 提取识别结果
    if (response.result) {
      const result: ASRResult = {
        text: response.result.text || '',
        isFinal: response.result.is_final || false,
        startTime: response.result.start_time,
        endTime: response.result.end_time,
        confidence: response.result.confidence
      };
      this.emit(ASREvent.RESULT, result);
    }
  }
}
```

---

## 🎯 **关键要点**

1. **大端字节序**: 所有整数字段（Payload Size, Sequence, Error Code等）都使用大端表示
2. **Gzip压缩**: Payload默认使用Gzip压缩
3. **JSON序列化**: Full Client Request和Full Server Response使用JSON格式
4. **二进制音频**: Audio Only Request直接发送二进制音频数据（压缩后）
5. **最后一包标志**: 使用Message flags的`0b0010`标志表示最后一包

---

## 📊 **接口地址**

| 模式 | 接口地址 | 说明 |
|------|----------|------|
| 双向流式 | `wss://openspeech.bytedance.com/api/v3/sauc/bigmodel` | 每输入一包返回一包，速度快 |
| 流式输入 | `wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_nostream` | 输入完成后返回，准确率高 |
| 双向流式优化版 | `wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async` | 只在结果变化时返回，性能最优 |

---

## 🔐 **鉴权方式**

在WebSocket握手的HTTP请求头中添加：

| Header | 说明 | 值 |
|--------|------|-----|
| `X-Api-App-Key` | App ID | `7563592522` |
| `X-Api-Access-Key` | Access Token | `jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3` |
| `X-Api-Resource-Id` | 资源ID | `volc.bigasr.sauc.duration` (小时版)<br>`volc.bigasr.sauc.concurrent` (并发版) |
| `X-Api-Connect-Id` | 连接ID | UUID |

---

## 📝 **下一步**

1. ✅ 实现二进制协议的ASR服务 - **已完成**
2. ⏳ 测试ASR连接和识别
3. ⏳ 集成到完整的语音对话流程
4. ⏳ 测试ASR → LLM → TTS完整链条

---

**最后更新**: 2025-10-14
**状态**: 二进制协议实现完成，待测试

