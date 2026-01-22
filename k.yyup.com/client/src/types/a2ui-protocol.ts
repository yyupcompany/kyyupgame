/**
 * A2UI 协议类型定义
 * Agent-to-User Interface Protocol
 *
 * @see https://a2ui.org/specification/
 */

/**
 * A2UI消息基类
 */
export interface A2UIMessage {
  /** 消息ID，用于请求-响应关联 */
  id: string;
  /** 消息类型 */
  type: A2UIMessageType;
  /** 时间戳 */
  timestamp: number;
}

/**
 * A2UI消息类型枚举
 */
export enum A2UIMessageType {
  /** 开始渲染 - 初始化渲染流程 */
  BEGIN_RENDERING = 'begin_rendering',
  /** 表面更新 - 更新UI组件树 */
  SURFACE_UPDATE = 'surface_update',
  /** 数据模型更新 - 更新组件数据 */
  DATA_MODEL_UPDATE = 'data_model_update',
  /** 事件发送 - 客户端向服务端发送事件 */
  EVENT = 'event',
  /** 错误响应 */
  ERROR = 'error',
  /** 心跳保活 */
  PING = 'ping',
  /** 心跳响应 */
  PONG = 'pong'
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
 * 组件树节点定义
 */
export interface A2UIComponentNode {
  /** 组件类型 */
  type: string;
  /** 组件唯一ID */
  id: string;
  /** 子组件列表 */
  children?: A2UIComponentNode[];
  /** 组件属性 */
  props: Record<string, any>;
  /** 样式类名 */
  className?: string;
  /** 样式对象 */
  style?: Record<string, string>;
  /** 🎵 音频配置 */
  audio?: A2UIComponentAudio;
}

/**
 * 表面更新消息
 */
export interface A2UISurfaceUpdate {
  /** 消息ID */
  messageId: string;
  /** 组件树根节点 */
  root: A2UIComponentNode;
  /** 渲染模式 */
  renderMode: 'full' | 'partial';
  /** 目标区域（部分渲染时） */
  targetRegion?: string;
}

/**
 * 数据模型更新消息
 */
export interface A2UIDataModelUpdate {
  /** 消息ID */
  messageId: string;
  /** 更新的数据路径 */
  path: string;
  /** 新值 */
  value: any;
  /** 操作类型 */
  operation: 'set' | 'delete' | 'push' | 'splice';
}

/**
 * 事件消息
 */
export interface A2UIEvent {
  /** 消息ID */
  messageId: string;
  /** 组件ID */
  componentId: string;
  /** 事件类型 */
  eventType: string;
  /** 事件数据 */
  payload: Record<string, any>;
  /** 用户会话ID */
  sessionId: string;
}

/**
 * 开始渲染消息
 */
export interface A2UIBeginRendering {
  /** 消息ID */
  messageId: string;
  /** 初始数据模型 */
  initialData: Record<string, any>;
  /** 渲染配置 */
  config: {
    theme: 'light' | 'dark';
    locale: string;
    responsive: boolean;
  };
}

/**
 * 错误消息
 */
export interface A2UIError {
  /** 消息ID */
  messageId: string;
  /** 错误代码 */
  code: string;
  /** 错误信息 */
  message: string;
  /** 原始消息ID（关联出错的请求） */
  originalMessageId?: string;
}

/**
 * 心跳消息
 */
export interface A2UIPing {
  /** 消息ID */
  messageId: string;
  /** 客户端时间戳 */
  clientTime: number;
}

/**
 * 心跳响应消息
 */
export interface A2UIPong {
  /** 消息ID */
  messageId: string;
  /** 服务器时间戳 */
  serverTime: number;
  /** 连接状态 */
  status: 'connected' | 'reconnecting' | 'expired';
}

/**
 * A2UI响应格式
 */
export interface A2UIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 组件事件处理器类型
 */
export type A2UIEventHandler = (event: A2UIEvent) => void | Promise<void>;

/**
 * 渲染完成回调
 */
export interface A2UIRenderCallback {
  onReady?: () => void;
  onComplete?: (data: any) => void;
  onError?: (error: A2UIError) => void;
  onEvent?: A2UIEventHandler;
}
