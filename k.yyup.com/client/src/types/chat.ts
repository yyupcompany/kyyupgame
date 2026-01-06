/**
 * 消息角色类型
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 消息状态类型
 */
export type MessageStatus = 'sending' | 'sent' | 'received' | 'error';

/**
 * 附件类型
 */
export interface Attachment {
  type: string;
  url: string;
  name: string;
}

/**
 * AI组件动作
 */
export interface ComponentAction {
  type: string;
  label: string;
  payload?: any;
}

/**
 * AI组件数据
 */
export interface ComponentData {
  type: string;
  title?: string;
  data?: any;
  actions?: ComponentAction[];
  [key: string]: any;
}

/**
 * 消息类型
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status: MessageStatus;
  components?: ComponentData[];
  attachments?: Attachment[];
}

/**
 * 会话类型
 */
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: string;
  // 新增：用于会话列表展示的可选字段（后端已实现字段：summary、messageCount、unreadCount、lastMessageAt）
  summary?: string;
  messageCount?: number;
  unreadCount?: number;
}

/**
 * 模型配置类型
 */
export interface ModelConfig {
  modelId: number;
  modelName: string;
  contextWindow: number;
  maxTokens: number;
}

/**
 * 聊天设置类型
 */
export interface ChatSettings {
  modelConfig: ModelConfig;
  systemPrompt?: string;
  temperature?: number;
  streaming?: boolean;
}

/**
 * 发送消息请求参数
 */
export interface SendMessageRequest {
  conversationId: string;
  message: string;
  modelId?: number;
}

/**
 * 发送消息响应
 */
export interface SendMessageResponse {
  content: string;
  components?: ComponentData[];
}

/**
 * 保存消息请求参数
 */
export interface SaveMessageRequest {
  conversationId: string;
  message: Message;
}

/**
 * 语音转文字响应
 */
export interface TranscribeResponse {
  text: string;
} 