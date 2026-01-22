/**
 * A2UI 消息服务
 * 负责生成符合A2UI协议的消息
 */

import { v4 as uuidv4 } from 'uuid';

// A2UI消息类型枚举（后端定义）
export enum A2UIMessageType {
  BEGIN_RENDERING = 'begin_rendering',
  SURFACE_UPDATE = 'surface_update',
  DATA_MODEL_UPDATE = 'data_model_update',
  EVENT = 'event',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong'
}

/**
 * A2UI消息基类接口
 */
export interface A2UIMessage {
  id: string;
  type: A2UIMessageType;
  timestamp: number;
}

/**
 * 🎵 组件音频配置
 * 支持TTS语音和交互音效
 */
export interface A2UIComponentAudio {
  /** TTS语音URL */
  ttsUrl?: string;
  /** TTS语音文本（用于显示字幕） */
  ttsText?: string;
  /** 点击音效类型 */
  clickEffect?: 'click' | 'success' | 'error' | 'complete' | 'star' | 'none';
  /** 悬停音效 */
  hoverEffect?: boolean;
  /** 自动播放（进入页面时） */
  autoPlay?: boolean;
  /** 播放延迟（毫秒） */
  playDelay?: number;
  /** 音量（0-1） */
  volume?: number;
  /** 是否循环播放 */
  loop?: boolean;
}

/**
 * 🎵 课程音频配置
 * 整个课程的音频设置
 */
export interface A2UICurriculumAudio {
  /** 是否启用音频 */
  enabled: boolean;
  /** 是否启用TTS语音 */
  voiceEnabled: boolean;
  /** 是否启用音效 */
  effectsEnabled: boolean;
  /** 默认音色 */
  voiceType: 'alloy' | 'nova' | 'shimmer' | 'echo' | 'fable' | 'onyx';
  /** 默认语速 */
  voiceSpeed: number;
  /** 音量设置 */
  volume: {
    voice: number;    // 语音音量 (0-100)
    effects: number;  // 音效音量 (0-100)
  };
  /** 是否自动播放欢迎语 */
  autoPlayWelcome: boolean;
  /** 欢迎语音URL */
  welcomeAudioUrl?: string;
  /** 课程介绍语音URL */
  introAudioUrl?: string;
}

/**
 * 组件树节点接口
 */
export interface A2UIComponentNode {
  type: string;
  id: string;
  children?: A2UIComponentNode[];
  props: Record<string, any>;
  className?: string;
  style?: Record<string, string>;
  /** 🎵 音频配置 */
  audio?: A2UIComponentAudio;
}

/**
 * 表面更新消息
 */
export interface A2UISurfaceUpdate {
  messageId: string;
  root: A2UIComponentNode;
  renderMode: 'full' | 'partial';
  targetRegion?: string;
}

/**
 * 数据模型更新消息
 */
export interface A2UIDataModelUpdate {
  messageId: string;
  path: string;
  value: any;
  operation: 'set' | 'delete' | 'push' | 'splice';
}

/**
 * 开始渲染消息
 */
export interface A2UIBeginRendering {
  messageId: string;
  initialData: Record<string, any>;
  config: {
    theme: 'light' | 'dark';
    locale: string;
    responsive: boolean;
  };
}

/**
 * 事件消息
 */
export interface A2UIEvent {
  messageId: string;
  componentId: string;
  eventType: string;
  payload: Record<string, any>;
  sessionId: string;
}

/**
 * 错误消息
 */
export interface A2UIError {
  messageId: string;
  code: string;
  message: string;
  originalMessageId?: string;
}

/**
 * 心跳消息
 */
export interface A2UIPing {
  messageId: string;
  clientTime: number;
}

/**
 * 心跳响应消息
 */
export interface A2UIPong {
  messageId: string;
  serverTime: number;
  status: 'connected' | 'reconnecting' | 'expired';
}

/**
 * A2UI消息服务类
 */
export class A2UIMessageService {
  /**
   * 生成消息ID
   */
  generateMessageId(): string {
    return uuidv4();
  }

  /**
   * 生成时间戳
   */
  generateTimestamp(): number {
    return Date.now();
  }

  /**
   * 包装消息
   */
  private wrapMessage<T extends object>(type: A2UIMessageType, payload: T): A2UIMessage & T {
    return {
      id: this.generateMessageId(),
      type,
      timestamp: this.generateTimestamp(),
      ...payload
    };
  }

  /**
   * 创建表面更新消息
   */
  createSurfaceUpdate(
    root: A2UIComponentNode,
    renderMode: 'full' | 'partial' = 'full',
    targetRegion?: string
  ): A2UIMessage & A2UISurfaceUpdate {
    const payload: A2UISurfaceUpdate = {
      messageId: this.generateMessageId(),
      root,
      renderMode,
      targetRegion
    };
    return this.wrapMessage(A2UIMessageType.SURFACE_UPDATE, payload);
  }

  /**
   * 创建数据模型更新消息
   */
  createDataModelUpdate(
    path: string,
    value: any,
    operation: 'set' | 'delete' | 'push' | 'splice' = 'set'
  ): A2UIMessage & A2UIDataModelUpdate {
    const payload: A2UIDataModelUpdate = {
      messageId: this.generateMessageId(),
      path,
      value,
      operation
    };
    return this.wrapMessage(A2UIMessageType.DATA_MODEL_UPDATE, payload);
  }

  /**
   * 创建批量数据模型更新消息
   */
  createBatchDataModelUpdate(
    updates: Array<{ path: string; value: any; operation?: 'set' | 'delete' | 'push' | 'splice' }>
  ): (A2UIMessage & A2UIDataModelUpdate)[] {
    return updates.map(update =>
      this.createDataModelUpdate(update.path, update.value, update.operation)
    );
  }

  /**
   * 创建开始渲染消息
   */
  createBeginRendering(
    initialData: Record<string, any> = {},
    config?: { theme?: 'light' | 'dark'; locale?: string; responsive?: boolean }
  ): A2UIMessage & A2UIBeginRendering {
    const payload: A2UIBeginRendering = {
      messageId: this.generateMessageId(),
      initialData,
      config: {
        theme: config?.theme || 'light',
        locale: config?.locale || 'zh-CN',
        responsive: config?.responsive ?? true
      }
    };
    return this.wrapMessage(A2UIMessageType.BEGIN_RENDERING, payload);
  }

  /**
   * 创建事件消息
   */
  createEvent(
    componentId: string,
    eventType: string,
    payload: Record<string, any>,
    sessionId: string
  ): A2UIMessage & A2UIEvent {
    const message: A2UIEvent = {
      messageId: this.generateMessageId(),
      componentId,
      eventType,
      payload,
      sessionId
    };
    return this.wrapMessage(A2UIMessageType.EVENT, message);
  }

  /**
   * 创建错误消息
   */
  createError(
    code: string,
    message: string,
    originalMessageId?: string
  ): A2UIMessage & A2UIError {
    const payload: A2UIError = {
      messageId: this.generateMessageId(),
      code,
      message,
      originalMessageId
    };
    return this.wrapMessage(A2UIMessageType.ERROR, payload);
  }

  /**
   * 创建心跳消息
   */
  createPing(): A2UIMessage & A2UIPing {
    const payload: A2UIPing = {
      messageId: this.generateMessageId(),
      clientTime: Date.now()
    };
    return this.wrapMessage(A2UIMessageType.PING, payload);
  }

  /**
   * 创建心跳响应消息
   */
  createPong(messageId: string, status: 'connected' | 'reconnecting' | 'expired' = 'connected'): A2UIMessage & A2UIPong {
    const payload: A2UIPong = {
      messageId,
      serverTime: Date.now(),
      status
    };
    return this.wrapMessage(A2UIMessageType.PONG, payload);
  }

  /**
   * 序列化消息为JSON字符串
   */
  serializeMessage(message: A2UIMessage): string {
    return JSON.stringify(message);
  }

  /**
   * 解析JSON消息
   */
  parseMessage(json: string): A2UIMessage | null {
    try {
      return JSON.parse(json) as A2UIMessage;
    } catch (error) {
      console.error('[A2UI Message Service] 解析消息失败:', error);
      return null;
    }
  }

  /**
   * 验证消息格式
   */
  validateMessage(message: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!message || typeof message !== 'object') {
      errors.push('消息必须是对象');
      return { valid: false, errors };
    }

    if (!message.id) {
      errors.push('缺少id字段');
    }

    if (!message.type) {
      errors.push('缺少type字段');
    } else if (!Object.values(A2UIMessageType).includes(message.type)) {
      errors.push(`无效的消息类型: ${message.type}`);
    }

    if (typeof message.timestamp !== 'number') {
      errors.push('timestamp必须是数字');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// 导出单例
export const a2uiMessageService = new A2UIMessageService();
