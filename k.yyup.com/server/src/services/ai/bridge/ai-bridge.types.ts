/**
 * AI桥接服务类型定义
 */

// 消息角色类型
export type AiBridgeMessageRole = 'system' | 'user' | 'assistant' | 'function' | 'tool';

// 工具定义接口
export interface AiBridgeTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: any;
  };
}

// 工具调用接口
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AiBridgeMessage {
  role: AiBridgeMessageRole | string;
  content: string;
  name?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface AiBridgeRequest {
  model: string;
  messages: AiBridgeMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// 聊天完成参数接口
export interface AiBridgeChatCompletionParams {
  model: string;
  messages: AiBridgeMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  functions?: any[];
  function_call?: string | { name: string };
  tools?: AiBridgeTool[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  think?: boolean;
}

// 聊天完成响应接口 - 属性放在顶层以匹配实际代码使用
export interface AiBridgeChatCompletionResponse {
  success: boolean;
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index?: number;
    message?: AiBridgeMessage;
    finish_reason?: string;
    delta?: {
      content?: string;
      role?: string;
      tool_calls?: ToolCall[];
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  data?: any;
  error?: string;
}

export interface AiBridgeResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  size?: string;
  style?: string;
  quality?: string;
}

export interface VideoGenerationRequest {
  prompt: string;
  duration?: number;
  style?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

// 图像生成参数
export interface AiBridgeImageGenerationParams {
  model?: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
  response_format?: 'url' | 'b64_json';
  logo_info?: {
    add_logo: boolean;
    [key: string]: any;
  };
}

// 图像生成响应 - 属性放在顶层
export interface AiBridgeImageGenerationResponse {
  success: boolean;
  created?: number;
  url?: string;
  urls?: string[];
  thumbnailUrl?: string;
  model?: string;
  tokens?: number;
  revised_prompt?: string;
  data?: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  error?: string;
}

// 语音转文字参数
export interface AiBridgeSpeechToTextParams {
  model?: string;
  file?: Buffer | string;
  audio?: Buffer | string;  // 兼容旧接口
  filename?: string;
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

// 语音转文字响应 - 属性放在顶层
export interface AiBridgeSpeechToTextResponse {
  success: boolean;
  text?: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    id?: number;
    start?: number;
    end?: number;
    text?: string;
  }>;
  data?: {
    text?: string;
    language?: string;
    duration?: number;
  };
  error?: string;
}

// 文字转语音参数
export interface AiBridgeTextToSpeechParams {
  model?: string;
  input: string;
  text?: string;  // 兼容旧接口
  voice?: string;
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav';
  speed?: number;
}

// 文字转语音响应 - 属性放在顶层
export interface AiBridgeTextToSpeechResponse {
  success?: boolean;
  data?: Buffer | ArrayBuffer;
  audioData?: Buffer | ArrayBuffer;
  audioBuffer?: Buffer;
  audioUrl?: string;
  contentType?: string;
  duration?: number;
  error?: string;
}

// 视频生成参数
export interface AiBridgeVideoGenerationParams {
  model?: string;
  prompt: string;
  duration?: number;
  style?: string;
  resolution?: string;
  size?: string;  // 兼容旧接口
  fps?: number;
}

// 视频生成响应 - 属性放在顶层
export interface AiBridgeVideoGenerationResponse {
  success: boolean;
  taskId?: string;
  videoUrl?: string;
  videoId?: string;
  status?: string;
  progress?: number;
  duration?: number;
  thumbnailUrl?: string;
  data?: {
    taskId?: string;
    videoUrl?: string;
    videoId?: string;
    status?: string;
    progress?: number;
    duration?: number;
    thumbnailUrl?: string;
  };
  error?: string;
}

// 文档处理参数
export interface AiBridgeDocumentParams {
  model?: string;
  file: Buffer | string;
  document?: Buffer | string;  // 兼容旧接口
  filename?: string;
  fileType?: string;
  task?: 'extract' | 'summarize' | 'translate' | 'qa';
  query?: string;
  targetLanguage?: string;
  language?: string;
  format?: string;
}

// 文档处理响应 - 属性放在顶层
export interface AiBridgeDocumentResponse {
  success: boolean;
  content?: string;
  summary?: string;
  translation?: string;
  answer?: string;
  metadata?: any;
  data?: {
    content?: string;
    summary?: string;
    translation?: string;
    answer?: string;
    metadata?: any;
  };
  error?: string;
}

// VOD上传参数
export interface AiBridgeVODUploadParams {
  file: Buffer | string;
  videoBuffer?: Buffer;  // 兼容旧接口
  fileName?: string;
  filename?: string;  // 兼容旧接口
  fileType?: string;
  title?: string;
  description?: string;
  tags?: string[];
}

// VOD上传响应 - 属性放在顶层
export interface AiBridgeVODUploadResponse {
  success?: boolean;
  fileId?: string;
  videoId?: string;
  uploadUrl?: string;
  videoUrl?: string;
  status?: string;
  duration?: number;
  data?: {
    fileId?: string;
    uploadUrl?: string;
    videoUrl?: string;
    status?: string;
  };
  error?: string;
}

// VOD合并参数
export interface AiBridgeVODMergeParams {
  fileIds?: string[];
  videoUrls?: string[];  // 兼容旧接口
  outputFileName?: string;
  outputFilename?: string;  // 兼容旧接口
  title?: string;
}

// VOD合并响应 - 属性放在顶层
export interface AiBridgeVODMergeResponse {
  success?: boolean;
  taskId?: string;
  outputFileId?: string;
  videoId?: string;
  videoUrl?: string;
  status?: string;
  duration?: number;
  data?: {
    taskId?: string;
    outputFileId?: string;
    status?: string;
  };
  error?: string;
}

// VOD添加音频参数
export interface AiBridgeVODAddAudioParams {
  videoFileId?: string;
  videoUrl?: string;  // 兼容旧接口
  audioFileId?: string;
  audioUrl?: string;
  outputFilename?: string;  // 兼容旧接口
  volume?: number;
  startTime?: number;
}

// VOD添加音频响应 - 属性放在顶层
export interface AiBridgeVODAddAudioResponse {
  success?: boolean;
  taskId?: string;
  outputFileId?: string;
  videoId?: string;
  videoUrl?: string;
  status?: string;
  duration?: number;
  data?: {
    taskId?: string;
    outputFileId?: string;
    status?: string;
  };
  error?: string;
}

// VOD转码参数
export interface AiBridgeVODTranscodeParams {
  fileId?: string;
  videoUrl?: string;  // 兼容旧接口
  templateId?: string;
  resolution?: string;
  format?: string;
  bitrate?: number;
  quality?: string;  // 兼容旧接口
}

// VOD转码响应 - 属性放在顶层
export interface AiBridgeVODTranscodeResponse {
  success?: boolean;
  taskId?: string;
  outputFileId?: string;
  videoId?: string;
  videoUrl?: string;
  status?: string;
  progress?: number;
  duration?: number;
  data?: {
    taskId?: string;
    outputFileId?: string;
    status?: string;
    progress?: number;
  };
  error?: string;
}

// VOD任务状态参数
export interface AiBridgeVODTaskStatusParams {
  taskId: string;
  taskType?: string;
}

// VOD任务状态响应 - 属性放在顶层
export interface AiBridgeVODTaskStatusResponse {
  success?: boolean;
  taskId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  data?: {
    taskId?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: any;
    error?: string;
  };
  error?: string;
}

// 搜索参数
export interface AiBridgeSearchParams {
  query: string;
  searchType?: 'web' | 'web_summary' | 'news' | 'image';
  maxResults?: number;
  language?: string;
  enableAISummary?: boolean;
}

// 搜索响应 - 属性放在顶层
export interface AiBridgeSearchResponse {
  success?: boolean;
  query?: string;
  results?: Array<{
    title?: string;
    url?: string;
    snippet?: string;
    source?: string;
  }>;
  summary?: string;
  aiSummary?: string;  // 兼容旧接口
  suggestions?: string[];  // 搜索建议
  relatedQueries?: string[];  // 相关搜索
  totalResults?: number;
  searchTime?: number;
  data?: {
    results?: Array<{
      title?: string;
      url?: string;
      snippet?: string;
      source?: string;
    }>;
    summary?: string;
    totalResults?: number;
  };
  error?: string;
}
