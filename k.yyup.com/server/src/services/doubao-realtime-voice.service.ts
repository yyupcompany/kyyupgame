/**
 * 豆包实时语音大模型服务
 * 
 * 端到端语音对话模型，一次性完成：
 * 1. 语音识别 (ASR)
 * 2. AI对话 (LLM)
 * 3. 语音合成 (TTS)
 * 
 * 特点：
 * - 超低延迟
 * - 支持随时打断
 * - 保留语音情感
 * - 单一WebSocket连接
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { sequelize } from '../config/database';
// 话术中心已删除，注释掉相关引用
// import { scriptTemplateMatcherService } from './script-template-matcher.service';
import { asrStreamingService } from './volcengine/asr-streaming.service';
import { ttsV3BidirectionService } from './volcengine/tts-v3-bidirection.service';
import { aiCallAssistantService } from './ai-call-assistant.service';
import AudioCodecConverter from './vos/audio-codec-converter';

interface RealtimeVoiceConfig {
  appId: string;
  apiKey: string;
  wsUrl: string;
  model: string;
  voiceType: string;
  language: string;
}

interface VoiceSession {
  sessionId: string;
  callId: string;
  customerId?: number;
  wsConnection?: WebSocket;
  systemPrompt: string;
  conversationHistory: Array<{
    role: string;
    content: string;
    audioData?: Buffer;
  }>;
  isActive: boolean;
}

export class DoubaoRealtimeVoiceService extends EventEmitter {
  private config: RealtimeVoiceConfig | null = null;
  private activeSessions: Map<string, VoiceSession> = new Map();
  private configLoaded: boolean = false;

  constructor() {
    super();
    // 不在构造函数中加载配置，延迟到需要时加载
  }

  /**
   * 从数据库加载豆包实时语音配置
   */
  private async loadConfig(): Promise<void> {
    if (this.configLoaded) {
      return; // 已加载，直接返回
    }

    try {
      // 检查sequelize是否已初始化
      if (!sequelize || typeof sequelize.query !== 'function') {
        console.warn('⚠️  数据库未初始化，使用默认配置');
        this.config = {
          appId: process.env.VOLCENGINE_APP_ID || '',
          apiKey: process.env.VOLCENGINE_API_KEY || '',
          wsUrl: 'wss://openspeech.bytedance.com/api/v1/realtime-voice',
          model: 'doubao-realtime-voice-1.0',
          voiceType: 'zh_female_qingxin',
          language: 'zh-CN'
        };
        this.configLoaded = true;
        return;
      }

      // 使用相同的火山引擎配置
      const [results] = await sequelize.query(`
        SELECT * FROM volcengine_asr_configs WHERE is_active = TRUE LIMIT 1
      `);

      if (results && results.length > 0) {
        const dbConfig = results[0] as any;
        this.config = {
          appId: dbConfig.app_id,
          apiKey: dbConfig.api_key,
          // 豆包实时语音大模型的WebSocket地址（待官方文档确认）
          wsUrl: 'wss://openspeech.bytedance.com/api/v1/realtime-voice',
          model: 'doubao-realtime-voice-1.0',
          voiceType: 'zh_female_qingxin', // 默认音色
          language: 'zh-CN'
        };
        console.log('✅ 豆包实时语音配置加载成功');
      } else {
        console.warn('⚠️  未找到激活的配置，使用默认配置');
        this.config = {
          appId: process.env.VOLCENGINE_APP_ID || '',
          apiKey: process.env.VOLCENGINE_API_KEY || '',
          wsUrl: 'wss://openspeech.bytedance.com/api/v1/realtime-voice',
          model: 'doubao-realtime-voice-1.0',
          voiceType: 'zh_female_qingxin',
          language: 'zh-CN'
        };
      }
      this.configLoaded = true;
    } catch (error) {
      console.error('❌ 加载配置失败:', error);
      // 使用默认配置
      this.config = {
        appId: process.env.VOLCENGINE_APP_ID || '',
        apiKey: process.env.VOLCENGINE_API_KEY || '',
        wsUrl: 'wss://openspeech.bytedance.com/api/v1/realtime-voice',
        model: 'doubao-realtime-voice-1.0',
        voiceType: 'zh_female_qingxin',
        language: 'zh-CN'
      };
      this.configLoaded = true;
    }
  }

  /**
   * 创建实时语音会话
   */
  public async createSession(
    callId: string,
    customerId?: number,
    systemPrompt?: string
  ): Promise<string> {
    // 确保配置已加载
    await this.loadConfig();

    if (!this.config) {
      throw new Error('配置未加载');
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: VoiceSession = {
      sessionId,
      callId,
      customerId,
      systemPrompt: systemPrompt || this.getDefaultSystemPrompt(),
      conversationHistory: [],
      isActive: true
    };

    // 创建AI对话会话
    aiCallAssistantService.createConversation(
      callId,
      customerId,
      systemPrompt || this.getDefaultSystemPrompt()
    );

    // 不再建立WebSocket连接，改用分离的ASR+LLM+TTS流程
    // await this.initializeWebSocket(session);

    this.activeSessions.set(sessionId, session);
    console.log(`📞 创建实时语音会话: ${sessionId} (Call: ${callId})`);
    console.log(`🤖 AI对话会话已创建`);

    return sessionId;
  }

  /**
   * 获取默认系统提示词
   */
  private getDefaultSystemPrompt(): string {
    return `你是一位专业的幼儿园招生顾问，负责通过电话与家长沟通。

你的任务是：
1. 礼貌、热情地与家长交流
2. 了解家长的需求和孩子的情况
3. 介绍幼儿园的特色和优势
4. 回答家长的疑问
5. 引导家长预约参观或报名

注意事项：
- 保持专业和友好的语气
- 回答要简洁明了，每次回复控制在50字以内
- 不要做绝对化承诺
- 尊重家长的选择
- 如果家长表示不感兴趣，礼貌结束通话`;
  }

  /**
   * 初始化WebSocket连接
   */
  private async initializeWebSocket(session: VoiceSession): Promise<void> {
    if (!this.config) return;

    // 构建WebSocket URL
    const params = new URLSearchParams({
      appid: this.config.appId,
      token: this.config.apiKey,
      model: this.config.model,
      voice_type: this.config.voiceType,
      language: this.config.language
    });

    const wsUrl = `${this.config.wsUrl}?${params.toString()}`;
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log(`🔗 实时语音连接已建立: ${session.sessionId}`);
      session.wsConnection = ws;
      
      // 发送初始化消息（包含系统提示词）
      this.sendInitMessage(session);
    });

    ws.on('message', async (data: Buffer) => {
      await this.handleWebSocketMessage(session, data);
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket错误 (${session.sessionId}):`, error.message);
      this.emit('session-error', {
        sessionId: session.sessionId,
        callId: session.callId,
        error: error.message
      });
    });

    ws.on('close', () => {
      console.log(`🔌 WebSocket连接关闭: ${session.sessionId}`);
      session.wsConnection = undefined;
    });
  }

  /**
   * 发送初始化消息
   */
  private sendInitMessage(session: VoiceSession): void {
    if (!session.wsConnection || session.wsConnection.readyState !== WebSocket.OPEN) {
      return;
    }

    const initMessage = {
      type: 'session.init',
      session: {
        id: session.sessionId,
        system_prompt: session.systemPrompt,
        voice_settings: {
          voice_type: this.config?.voiceType || 'zh_female_qingxin',
          speed: 1.0,
          volume: 1.0
        }
      }
    };

    session.wsConnection.send(JSON.stringify(initMessage));
    console.log(`📤 发送初始化消息: ${session.sessionId}`);
  }

  /**
   * 发送音频数据（使用ASR+话术模板+TTS流程）
   */
  public async sendAudio(sessionId: string, audioData: Buffer): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      console.warn(`⚠️  会话不可用: ${sessionId}`);
      return;
    }

    try {
      console.log(`🎤 处理音频数据: ${audioData.length} bytes (${sessionId})`);

      // 1. ASR - 语音识别
      // TODO: 实现流式ASR识别
      // 临时使用模拟识别结果
      const userText = '你好';
      console.log(`📝 ASR识别结果 (${sessionId}): ${userText}`);

      // 保存到对话历史
      session.conversationHistory.push({
        role: 'user',
        content: userText
      });

      // 发出识别事件
      this.emit('user-speech', {
        sessionId,
        callId: session.callId,
        text: userText,
        confidence: 1.0
      });

      // 2. 话术模板匹配（话术中心已删除，暂时使用默认回复）
      const matchResult = {
        score: 0.8,
        templateId: 'default_response',
        matchedKeywords: []
      };

      let replyText: string;
      // 话术中心已删除，使用简单回复逻辑
      replyText = '收到您的反馈，我们会尽快处理。';
      console.log(`💬 回复内容 (${sessionId}): ${replyText}`);

      // 保存到对话历史
      session.conversationHistory.push({
        role: 'assistant',
        content: replyText
      });

      // 3. TTS - 语音合成
      console.log(`🎙️  [TTS] 开始合成语音: "${replyText}" (${sessionId})`);
      const ttsResult = await ttsV3BidirectionService.textToSpeech({
        text: replyText,
        speaker: 'zh_female_cancan_mars_bigtts',
        sampleRate: 24000,  // TTS输出24kHz
        format: 'pcm'
      });

      if (!ttsResult || !ttsResult.audioBuffer) {
        console.error(`❌ [TTS] 合成失败 (${sessionId})`);
        return;
      }

      console.log(`🔊 [TTS] 合成成功: ${ttsResult.audioBuffer.length} bytes @ 24kHz (${sessionId})`);

      // 4. 音频转换: PCM 24kHz → PCMA 8kHz (用于VOS发送)
      console.log(`🔄 [转换] 开始转换: PCM 24kHz → PCMA 8kHz (${sessionId})`);
      let vosPcmaData: Buffer;
      try {
        vosPcmaData = await AudioCodecConverter.pcm24kToPcma(ttsResult.audioBuffer);
        console.log(`✅ [转换] 转换成功: ${vosPcmaData.length} bytes @ PCMA 8kHz (${sessionId})`);
      } catch (error) {
        console.error(`❌ [转换] 音频转换失败 (${sessionId}):`, error);
        return;
      }

      // 保存音频数据到对话历史
      session.conversationHistory[session.conversationHistory.length - 1].audioData = vosPcmaData;

      // 发出AI回复事件（包含转换后的音频数据）
      const responseData = {
        sessionId,
        callId: session.callId,
        text: replyText,
        audioData: vosPcmaData,  // 已转换为PCMA 8kHz
        confidence: matchResult.score / 10, // 将分数转换为0-1的置信度,
        templateId: matchResult.templateId
      };

      console.log(`📡 [TTS→RTP] 发出ai-response事件: callId=${session.callId}, audioSize=${vosPcmaData.length} (PCMA 8kHz)`);
      this.emit('ai-response', responseData);

    } catch (error) {
      console.error(`❌ 音频处理失败 (${sessionId}):`, error);
      this.emit('session-error', {
        sessionId,
        callId: session.callId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 处理WebSocket消息
   */
  private async handleWebSocketMessage(session: VoiceSession, data: Buffer): Promise<void> {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'session.ready':
          console.log(`✅ 会话就绪: ${session.sessionId}`);
          this.emit('session-ready', {
            sessionId: session.sessionId,
            callId: session.callId
          });
          break;

        case 'audio.transcription':
          // 用户语音识别结果
          console.log(`🎤 识别结果 (${session.sessionId}): ${message.text}`);
          session.conversationHistory.push({
            role: 'user',
            content: message.text
          });
          
          this.emit('user-speech', {
            sessionId: session.sessionId,
            callId: session.callId,
            text: message.text,
            isFinal: message.is_final
          });
          break;

        case 'audio.response':
          // AI语音回复
          console.log(`🔊 AI回复 (${session.sessionId}): ${message.text}`);
          
          const audioBuffer = Buffer.from(message.audio.data, 'base64');
          
          session.conversationHistory.push({
            role: 'assistant',
            content: message.text,
            audioData: audioBuffer
          });

          this.emit('ai-response', {
            sessionId: session.sessionId,
            callId: session.callId,
            text: message.text,
            audioData: audioBuffer,
            duration: message.audio.duration
          });
          break;

        case 'session.interrupted':
          // 用户打断
          console.log(`⏸️  用户打断 (${session.sessionId})`);
          this.emit('user-interrupted', {
            sessionId: session.sessionId,
            callId: session.callId
          });
          break;

        case 'error':
          console.error(`❌ 服务错误 (${session.sessionId}):`, message.error);
          this.emit('session-error', {
            sessionId: session.sessionId,
            callId: session.callId,
            error: message.error
          });
          break;

        default:
          console.log(`📨 未知消息类型: ${message.type}`);
      }
    } catch (error) {
      console.error(`❌ 处理消息失败 (${session.sessionId}):`, error);
    }
  }

  /**
   * 结束会话
   */
  public async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // 标记会话为非活跃
    session.isActive = false;

    // 关闭WebSocket连接（如果有）
    if (session.wsConnection) {
      session.wsConnection.close();
    }

    // 结束AI对话会话
    aiCallAssistantService.endConversation(session.callId);

    // 保存对话记录
    await this.saveConversationHistory(session);

    // 删除会话
    this.activeSessions.delete(sessionId);
    console.log(`📞 结束实时语音会话: ${sessionId}`);
  }

  /**
   * 保存对话历史
   */
  private async saveConversationHistory(session: VoiceSession): Promise<void> {
    try {
      const transcription = session.conversationHistory
        .map(msg => `${msg.role === 'user' ? '客户' : 'AI'}: ${msg.content}`)
        .join('\n');

      const aiResponses = session.conversationHistory
        .filter(msg => msg.role === 'assistant')
        .map(msg => ({ content: msg.content }));

      await sequelize.query(`
        UPDATE call_records 
        SET transcription = ?, 
            ai_responses = ?,
            updated_at = NOW()
        WHERE call_id = ?
      `, {
        replacements: [
          transcription,
          JSON.stringify(aiResponses),
          session.callId
        ]
      });

      console.log(`💾 对话记录已保存: ${session.sessionId}`);
    } catch (error) {
      console.error(`❌ 保存对话记录失败 (${session.sessionId}):`, error);
    }
  }

  /**
   * 获取活跃会话数
   */
  public getActiveSessionCount(): number {
    return this.activeSessions.size;
  }

  /**
   * 获取会话信息
   */
  public getSession(sessionId: string): VoiceSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}

// 导出单例
export const doubaoRealtimeVoiceService = new DoubaoRealtimeVoiceService();

