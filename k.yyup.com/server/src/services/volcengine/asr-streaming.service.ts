/**
 * 火山引擎流式ASR服务（二进制协议）
 * 
 * 文档: https://www.volcengine.com/docs/6561/1354869
 * 
 * 重要：ASR使用二进制协议，不是JSON！
 * 协议格式：[Header 4字节] + [Payload Size 4字节] + [Payload N字节]
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import * as zlib from 'zlib';

/**
 * ASR配置接口
 */
export interface ASRConfig {
  appId: string;
  appKey: string;
  accessKey: string;
  resourceId?: string;
  endpoint?: string;
}

/**
 * ASR请求参数
 */
export interface ASRRequest {
  format?: string;
  rate?: number;
  bits?: number;
  channel?: number;
  language?: string;
  enableITN?: boolean;
  enablePunc?: boolean;
  enableDDC?: boolean;
}

/**
 * ASR识别结果
 */
export interface ASRResult {
  text: string;
  isFinal: boolean;
  startTime?: number;
  endTime?: number;
  confidence?: number;
}

/**
 * ASR事件类型
 */
export enum ASREvent {
  CONNECTED = 'connected',
  RESULT = 'result',
  VAD_START = 'vad_start',
  VAD_END = 'vad_end',
  ERROR = 'error',
  DISCONNECTED = 'disconnected'
}

/**
 * 二进制协议常量
 */
const PROTOCOL_VERSION = 0b0001;
const HEADER_SIZE = 0b0001;

// 消息类型
const MESSAGE_TYPE_FULL_CLIENT_REQUEST = 0b0001;
const MESSAGE_TYPE_AUDIO_ONLY_REQUEST = 0b0010;
const MESSAGE_TYPE_FULL_SERVER_RESPONSE = 0b1001;
const MESSAGE_TYPE_ERROR = 0b1111;

// 消息标志
const MESSAGE_FLAG_NO_SEQUENCE = 0b0000;
const MESSAGE_FLAG_POS_SEQUENCE = 0b0001;
const MESSAGE_FLAG_LAST_PACKAGE = 0b0010;

// 序列化方式
const SERIALIZATION_NONE = 0b0000;
const SERIALIZATION_JSON = 0b0001;

// 压缩方式
const COMPRESSION_NONE = 0b0000;
const COMPRESSION_GZIP = 0b0001;

/**
 * 火山引擎流式ASR服务
 */
export class VolcengineASRStreamingService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: ASRConfig;
  private sessionId: string = '';
  private isConnected: boolean = false;
  private sequenceNumber: number = 0;

  constructor(config: ASRConfig) {
    super();
    this.config = {
      ...config,
      resourceId: config.resourceId || 'volc.bigasr.sauc.duration',
      endpoint: config.endpoint || 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel'
    };
  }

  async connect(request?: ASRRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sessionId = uuidv4();
      this.sequenceNumber = 0;
      
      const url = this.config.endpoint!;
      
      console.log('🎤 [ASR] 连接到服务:', { endpoint: url, sessionId: this.sessionId });

      this.ws = new WebSocket(url, {
        headers: {
          'X-Api-App-Key': this.config.appKey,
          'X-Api-Access-Key': this.config.accessKey,
          'X-Api-Resource-Id': this.config.resourceId!,
          'X-Api-Connect-Id': this.sessionId
        }
      });

      this.ws.on('open', () => {
        console.log('✅ [ASR] WebSocket连接成功');
        this.isConnected = true;
        this.sendFullClientRequest(request || {});
        this.emit(ASREvent.CONNECTED);
        resolve();
      });

      this.ws.on('message', (data: Buffer) => {
        this.handleBinaryMessage(data);
      });

      this.ws.on('error', (error: Error) => {
        console.error('❌ [ASR] WebSocket错误:', error.message);
        this.emit(ASREvent.ERROR, error);
        reject(error);
      });

      this.ws.on('close', (code: number, reason: string) => {
        console.log(`🔌 [ASR] WebSocket连接关闭: ${code} - ${reason}`);
        this.isConnected = false;
        this.emit(ASREvent.DISCONNECTED);
      });
    });
  }

  private buildHeader(messageType: number, messageFlags: number, serialization: number, compression: number): Buffer {
    const header = Buffer.alloc(4);
    header[0] = (PROTOCOL_VERSION << 4) | HEADER_SIZE;
    header[1] = (messageType << 4) | messageFlags;
    header[2] = (serialization << 4) | compression;
    header[3] = 0x00;
    return header;
  }

  private sendFullClientRequest(request: ASRRequest): void {
    console.log('�� [ASR] 发送Full client request');
    
    const payload = {
      user: { uid: this.sessionId },
      audio: {
        format: request.format || 'pcm',
        rate: request.rate || 16000,
        bits: request.bits || 16,
        channel: request.channel || 1,
        language: request.language || 'zh-CN'
      },
      request: {
        model_name: 'bigmodel',
        enable_itn: request.enableITN !== false,
        enable_punc: request.enablePunc !== false,
        enable_ddc: request.enableDDC !== false
      }
    };
    
    const payloadJson = JSON.stringify(payload);
    console.log('📝 [ASR] 请求参数:', payloadJson);
    
    const payloadCompressed = zlib.gzipSync(Buffer.from(payloadJson, 'utf-8'));
    const header = this.buildHeader(MESSAGE_TYPE_FULL_CLIENT_REQUEST, MESSAGE_FLAG_NO_SEQUENCE, SERIALIZATION_JSON, COMPRESSION_GZIP);
    const payloadSize = Buffer.alloc(4);
    payloadSize.writeUInt32BE(payloadCompressed.length, 0);
    const message = Buffer.concat([header, payloadSize, payloadCompressed]);

    console.log(`📤 [ASR] 发送消息: ${message.length} bytes`);
    this.ws!.send(message);
    this.sequenceNumber++;
  }

  sendAudio(audioData: Buffer, isLast: boolean = false): void {
    if (!this.isConnected || !this.ws) {
      throw new Error('ASR服务未连接');
    }

    console.log(`📤 [ASR] 发送音频: ${audioData.length} bytes, isLast: ${isLast}`);
    
    const audioCompressed = zlib.gzipSync(audioData);
    const messageFlags = isLast ? MESSAGE_FLAG_LAST_PACKAGE : MESSAGE_FLAG_POS_SEQUENCE;
    const header = this.buildHeader(MESSAGE_TYPE_AUDIO_ONLY_REQUEST, messageFlags, SERIALIZATION_NONE, COMPRESSION_GZIP);
    const payloadSize = Buffer.alloc(4);
    payloadSize.writeUInt32BE(audioCompressed.length, 0);
    const message = Buffer.concat([header, payloadSize, audioCompressed]);
    
    this.ws.send(message);
    this.sequenceNumber++;
  }

  async finish(): Promise<void> {
    if (!this.isConnected || !this.ws) {
      return;
    }
    console.log('🏁 [ASR] 发送结束信号');
    this.sendAudio(Buffer.alloc(0), true);
  }

  disconnect(): void {
    if (this.ws) {
      console.log('🔌 [ASR] 断开连接');
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  private handleBinaryMessage(data: Buffer): void {
    try {
      if (data.length < 12) {
        console.error('❌ [ASR] 消息太短:', data.length);
        return;
      }
      
      const header = data.slice(0, 4);
      const messageType = (header[1] >> 4) & 0x0F;
      const serialization = (header[2] >> 4) & 0x0F;
      const compression = header[2] & 0x0F;
      const sequence = data.readUInt32BE(4);
      const payloadSize = data.readUInt32BE(8);
      const payload = data.slice(12, 12 + payloadSize);
      
      console.log('📨 [ASR] 收到消息:', { messageType, sequence, payloadSize });
      
      if (messageType === MESSAGE_TYPE_FULL_SERVER_RESPONSE) {
        this.handleServerResponse(payload, serialization, compression);
      } else if (messageType === MESSAGE_TYPE_ERROR) {
        this.handleErrorMessage(payload);
      }
    } catch (error) {
      console.error('❌ [ASR] 消息解析失败:', error);
      this.emit(ASREvent.ERROR, error);
    }
  }

  private handleServerResponse(payload: Buffer, serialization: number, compression: number): void {
    try {
      let decompressed = payload;
      if (compression === COMPRESSION_GZIP) {
        decompressed = zlib.gunzipSync(payload);
      }
      
      if (serialization === SERIALIZATION_JSON) {
        const response = JSON.parse(decompressed.toString('utf-8'));
        console.log('📨 [ASR] 识别结果:', response);
        
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
    } catch (error) {
      console.error('❌ [ASR] 响应解析失败:', error);
      this.emit(ASREvent.ERROR, error);
    }
  }

  private handleErrorMessage(payload: Buffer): void {
    try {
      const errorCode = payload.readUInt32BE(0);
      const errorMessageSize = payload.readUInt32BE(4);
      const errorMessage = payload.slice(8, 8 + errorMessageSize).toString('utf-8');
      
      console.error('❌ [ASR] 服务器错误:', { code: errorCode, message: errorMessage });

      const error = new Error(`ASR错误 [${errorCode}]: ${errorMessage}`);
      this.emit(ASREvent.ERROR, error);
    } catch (error) {
      console.error('❌ [ASR] 错误消息解析失败:', error);
      this.emit(ASREvent.ERROR, error);
    }
  }
}

export function createASRService(config: ASRConfig): VolcengineASRStreamingService {
  return new VolcengineASRStreamingService(config);
}

// 创建默认实例
export const asrStreamingService = new VolcengineASRStreamingService({
  appId: '7563592522',
  appKey: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  accessKey: 'jq3vA4Ep5EsN-FU4mKizV6ePioXR3Ol3',
  resourceId: 'volc.service_type.10029'
});
