# VOS音频处理对比分析

## 📊 架构对比

### 测试文档方案（豆包实时语音）
```
用户语音 → PCMA 8kHz (VOS)
    ↓
转换 → PCM 16kHz
    ↓
豆包ASR识别 → 对话生成 → TTS合成
    ↓
PCM 24kHz (豆包输出)
    ↓
转换 → PCMA 8kHz
    ↓
用户听到
```

**特点**:
- ✅ 单个WebSocket连接（豆包实时语音）
- ✅ 端到端处理（ASR+LLM+TTS一体）
- ✅ 采样率转换：8kHz ↔ 16kHz ↔ 24kHz
- ✅ 编码转换：PCMA ↔ PCM
- ✅ 纯JavaScript库处理（alawmulaw + wave-resampler）
- ✅ 精确RTP时序控制（±1-5ms）

### 当前实现方案（ASR+TTS分离）
```
用户语音 → PCM 16kHz (假设)
    ↓
火山引擎ASR识别
    ↓
话术模板匹配 (替代LLM)
    ↓
豆包TTS合成 → PCM 24kHz
    ↓
用户听到 (采样率未转换)
```

**问题**:
- ❌ ASR和TTS分开调用
- ❌ 采样率转换未实现
- ❌ 编码转换未实现
- ❌ 音频缓冲延迟
- ⚠️ 时序控制不精确

---

## 🔧 关键技术对比

### 1. 采样率转换

#### 测试文档方案 ✅
```typescript
// 8kHz → 16kHz (VOS → ASR)
const pcm8k = alawmulaw.alaw.decode(pcmaData)
const pcm16k = resample(pcm8k, 8000, 16000)

// 24kHz → 8kHz (TTS → VOS)
const pcm8k = resample(pcm24k, 24000, 8000)
const pcma = alawmulaw.alaw.encode(pcm8k)
```

**性能**: 7-10ms/包

#### 当前实现 ❌
- 未实现采样率转换
- 可能导致音频失真或无声

### 2. 编码转换

#### 测试文档方案 ✅
```typescript
// PCMA (A-law) ↔ PCM 转换
import alawmulaw from 'alawmulaw'

// 解码：PCMA → PCM
const pcm = alawmulaw.alaw.decode(pcmaBuffer)

// 编码：PCM → PCMA
const pcma = alawmulaw.alaw.encode(pcmBuffer)
```

**库**: `alawmulaw` (5.0.0+)

#### 当前实现 ❌
- 未实现编码转换
- VOS使用PCMA 8kHz，但系统可能期望PCM

### 3. RTP时序控制

#### 测试文档方案 ✅
```typescript
// 精确时间控制 - 每20ms发送一个RTP包
const packetInterval = 20 // ms
const startTime = Date.now()

for (let i = 0; i < pcmaData.length; i += packetSize) {
  // 绝对时间计算，自动补偿误差
  const expectedTime = startTime + packetCount * packetInterval
  const waitTime = expectedTime - Date.now()
  
  if (waitTime > 0) {
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
}
```

**精度**: ±1-5ms

#### 当前实现 ⚠️
- 可能使用累积setTimeout
- 精度：±100ms（时间漂移）

### 4. 音频缓冲策略

#### 测试文档方案 ✅
```typescript
// 无缓冲立即发送
doubaoService.on('audio_output', async (data) => {
  const pcma = await audioConverter.pcm24kToPcma(data.audioData)
  audioQueue.push(pcma)  // 串行队列
  processAudioQueue()    // 立即处理
})
```

**延迟**: 0ms（立即转换立即发送）

#### 当前实现 ⚠️
```typescript
// 缓冲1秒音频
private readonly BUFFER_DURATION_MS = 1000
private readonly BUFFER_SIZE = 32000 // bytes
```

**延迟**: 1000ms（用户感知明显延迟）

---

## 🎯 改进建议

### 优先级1：采样率转换（必须）

**文件**: `server/src/services/vos/audio-codec-converter.ts`

```typescript
import alawmulaw from 'alawmulaw'
import { resample } from 'wave-resampler'

export class AudioCodecConverter {
  /**
   * VOS → ASR: PCMA 8kHz → PCM 16kHz
   */
  async pcmaToPcm16k(pcmaData: Buffer): Promise<Buffer> {
    try {
      // 1. PCMA解码 → PCM
      const pcm8k = alawmulaw.alaw.decode(pcmaData)
      
      // 2. 采样率转换 8kHz → 16kHz
      const pcm16k = resample(pcm8k, 8000, 16000)
      
      return Buffer.from(pcm16k)
    } catch (error) {
      console.error('❌ PCMA转PCM16k失败:', error)
      throw error
    }
  }

  /**
   * TTS → VOS: PCM 24kHz → PCMA 8kHz
   */
  async pcm24kToPcma(pcm24kData: Buffer): Promise<Buffer> {
    try {
      // 1. 采样率转换 24kHz → 8kHz
      const pcm8k = resample(pcm24kData, 24000, 8000)
      
      // 2. PCM编码 → PCMA
      const pcma = alawmulaw.alaw.encode(pcm8k)
      
      return Buffer.from(pcma)
    } catch (error) {
      console.error('❌ PCM24k转PCMA失败:', error)
      throw error
    }
  }

  /**
   * Buffer内存对齐处理（处理不同音色的兼容性）
   */
  private ensureBufferAlignment(data: Buffer): Buffer {
    if (data.byteOffset % 2 !== 0) {
      return Buffer.from(data)
    }
    return data
  }
}
```

**依赖安装**:
```bash
npm install alawmulaw wave-resampler
```

### 优先级2：移除音频缓冲（推荐）

**修改**: `server/src/services/call-audio-stream.service.ts`

```typescript
// 改为立即处理，而不是缓冲1秒
async processAudio(callId: string, audioData: Buffer): Promise<void> {
  const session = this.activeSessions.get(callId)
  if (!session) return

  try {
    // 1. 立即转换采样率
    const pcm16k = await audioConverter.pcmaToPcm16k(audioData)
    
    // 2. 立即发送给ASR
    session.asrConnection?.send(pcm16k)
    
    // 3. 立即发出事件（不缓冲）
    this.emit('audio-processed', { callId, audioData: pcm16k })
  } catch (error) {
    console.error('❌ 音频处理失败:', error)
  }
}
```

### 优先级3：精确RTP时序控制

**修改**: `server/src/services/vos/vos-dialer.service.ts`

```typescript
/**
 * RTP包间隔计算说明:
 * - 包大小: 160 bytes (PCMA @ 8kHz)
 * - 采样率: 8000 Hz
 * - 每个样本: 1/8000 = 0.125ms
 * - 160个样本: 160 * 0.125ms = 20ms
 * - 所以每个RTP包间隔是20ms
 */
async sendAudioWithPreciseTiming(
  callId: string,
  pcmaData: Buffer,
  packetSize: number = 160
): Promise<void> {
  const packetInterval = 20 // ms (160 bytes @ 8kHz = 20ms)
  const startTime = Date.now()
  let packetCount = 0

  for (let i = 0; i < pcmaData.length; i += packetSize) {
    const packet = pcmaData.slice(i, i + packetSize)

    // 绝对时间计算
    const expectedTime = startTime + packetCount * packetInterval
    const waitTime = expectedTime - Date.now()

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    // 发送RTP包
    await this.sendRTPPacket(callId, packet)
    packetCount++
  }
}
```

---

## 📈 性能对比

| 指标 | 当前实现 | 改进后 | 提升 |
|------|---------|--------|------|
| **采样率转换** | ❌ 未实现 | ✅ 7-10ms | 必须 |
| **编码转换** | ❌ 未实现 | ✅ 2-3ms | 必须 |
| **音频缓冲延迟** | 1000ms | 0ms | **消除** |
| **RTP时序精度** | ±100ms | ±1-5ms | **20倍** |
| **整体延迟** | >1.5s | <0.5s | **3倍** |

---

## 🔄 实施步骤

1. **安装依赖**
   ```bash
   npm install alawmulaw wave-resampler
   ```

2. **创建音频转换器**
   - 新建 `server/src/services/vos/audio-codec-converter.ts`
   - 实现采样率和编码转换

3. **集成到ASR流程**
   - 修改 `call-audio-stream.service.ts`
   - 在发送给ASR前进行转换

4. **集成到TTS流程**
   - 修改 `doubao-realtime-voice.service.ts`
   - 在接收TTS音频后进行转换

5. **优化RTP发送**
   - 修改 `vos-dialer.service.ts`
   - 实现精确时序控制

6. **测试验证**
   - 运行集成测试
   - 验证音频质量
   - 检查延迟指标

---

## 📚 参考文档

- [VOS豆包AI智能语音对话系统](./VOS豆包AI智能语音对话系统.md)
- [VOS + 豆包实时语音集成测试文档](./VOS+豆包实时语音集成测试文档.md)
- [SIP到VOS迁移总结](./SIP到VOS迁移总结.md)

---

**版本**: v1.0  
**最后更新**: 2025-10-25  
**状态**: 待实施

