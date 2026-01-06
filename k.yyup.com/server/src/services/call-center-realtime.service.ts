/**
 * 呼叫中心实时语音服务
 * 
 * 使用豆包实时语音大模型，简化音频流处理：
 * SIP音频流 → 豆包实时语音大模型 → SIP音频流
 * 
 * 优势：
 * - 无需手动缓冲音频
 * - 无需分别调用ASR、LLM、TTS
 * - 超低延迟
 * - 支持随时打断
 */

import { EventEmitter } from 'events';
import { doubaoRealtimeVoiceService } from './doubao-realtime-voice.service';

interface CallSession {
  callId: string;
  sessionId: string;
  customerId?: number;
  startTime: number;
  systemPrompt?: string;
}

export class CallCenterRealtimeService extends EventEmitter {
  private activeCalls: Map<string, CallSession> = new Map();

  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 监听会话就绪
    doubaoRealtimeVoiceService.on('session-ready', (data) => {
      console.log(`✅ 会话就绪: ${data.sessionId}`);
      this.emit('call-ready', data);
    });

    // 监听用户语音
    doubaoRealtimeVoiceService.on('user-speech', (data) => {
      console.log(`🎤 用户: ${data.text}`);
      this.emit('user-speech', data);
    });

    // 监听AI回复
    doubaoRealtimeVoiceService.on('ai-response', (data) => {
      console.log(`🤖 AI: ${data.text}`);
      
      // 将AI语音发送回SIP服务器
      this.emit('audio-response', {
        callId: data.callId,
        audioData: data.audioData,
        text: data.text,
        duration: data.duration
      });
    });

    // 监听用户打断
    doubaoRealtimeVoiceService.on('user-interrupted', (data) => {
      console.log(`⏸️  用户打断: ${data.callId}`);
      this.emit('user-interrupted', data);
    });

    // 监听错误
    doubaoRealtimeVoiceService.on('session-error', (data) => {
      console.error(`❌ 会话错误: ${data.error}`);
      this.emit('call-error', data);
    });
  }

  /**
   * 开始通话
   */
  public async startCall(
    callId: string,
    customerId?: number,
    systemPrompt?: string
  ): Promise<void> {
    try {
      console.log(`📞 开始通话: ${callId}`);

      // 创建豆包实时语音会话
      const sessionId = await doubaoRealtimeVoiceService.createSession(
        callId,
        customerId,
        systemPrompt
      );

      // 记录通话会话
      const callSession: CallSession = {
        callId,
        sessionId,
        customerId,
        startTime: Date.now(),
        systemPrompt
      };

      this.activeCalls.set(callId, callSession);

      console.log(`✅ 通话会话创建成功: ${callId} -> ${sessionId}`);
    } catch (error) {
      console.error(`❌ 开始通话失败 (${callId}):`, error);
      throw error;
    }
  }

  /**
   * 处理来自SIP的音频数据
   */
  public async processAudio(callId: string, audioData: Buffer): Promise<void> {
    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      console.warn(`⚠️  通话会话不存在: ${callId}`);
      return;
    }

    try {
      // 直接发送音频到豆包实时语音大模型
      // 模型会自动处理：识别 → 对话 → 合成
      await doubaoRealtimeVoiceService.sendAudio(callSession.sessionId, audioData);
    } catch (error) {
      console.error(`❌ 处理音频失败 (${callId}):`, error);
      this.emit('call-error', {
        callId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 结束通话
   */
  public async endCall(callId: string): Promise<void> {
    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      console.warn(`⚠️  通话会话不存在: ${callId}`);
      return;
    }

    try {
      console.log(`📞 结束通话: ${callId}`);

      // 结束豆包实时语音会话
      await doubaoRealtimeVoiceService.endSession(callSession.sessionId);

      // 删除通话记录
      this.activeCalls.delete(callId);

      // 计算通话时长
      const duration = Math.floor((Date.now() - callSession.startTime) / 1000);
      console.log(`✅ 通话结束，时长: ${duration}秒`);

      this.emit('call-ended', {
        callId,
        duration
      });
    } catch (error) {
      console.error(`❌ 结束通话失败 (${callId}):`, error);
      throw error;
    }
  }

  /**
   * 获取活跃通话数
   */
  public getActiveCallCount(): number {
    return this.activeCalls.size;
  }

  /**
   * 获取通话信息
   */
  public getCallInfo(callId: string): CallSession | undefined {
    return this.activeCalls.get(callId);
  }

  /**
   * 获取所有活跃通话
   */
  public getActiveCalls(): CallSession[] {
    return Array.from(this.activeCalls.values());
  }
}

// 导出单例
export const callCenterRealtimeService = new CallCenterRealtimeService();

