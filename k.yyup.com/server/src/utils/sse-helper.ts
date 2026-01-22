/**
 * SSE (Server-Sent Events) 辅助工具
 * 提供更细腻的流式响应体验，对标 Qoder
 */

import { Response } from 'express';

export interface SSEEventData {
  type: string;
  content?: string;
  progress?: number;
  stage?: string;
  data?: any;
  message?: string;
  timestamp?: string;
}

/**
 * 发送 SSE 事件
 * @param res Express Response 对象
 * @param eventType 事件类型
 * @param data 事件数据
 */
export function sendSSE(res: Response, eventType: string, data: any): void {
  try {
    const eventData: SSEEventData = {
      type: eventType,
      timestamp: new Date().toISOString(),
      ...data
    };

    // 标准 SSE 格式：event: 事件类型 + data: JSON数据
    res.write(`event: ${eventType}\n`);
    res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  } catch (error) {
    console.error('❌ [SSE] 发送事件失败:', error);
  }
}

/**
 * 流式发送 thinking 过程（带进度）
 */
export class ThinkingStream {
  private res: Response;
  private totalStages: number;
  private currentStage: number = 0;

  constructor(res: Response, totalStages: number = 5) {
    this.res = res;
    this.totalStages = totalStages;
  }

  /**
   * 发送 thinking 开始事件
   */
  start() {
    sendSSE(this.res, 'thinking_start', {
      message: '🤔 AI 开始思考...',
      progress: 0
    });
  }

  /**
   * 发送 thinking 阶段更新
   * @param stage 阶段名称
   * @param message 显示消息
   */
  update(stage: string, message: string) {
    this.currentStage++;
    const progress = Math.min(Math.round((this.currentStage / this.totalStages) * 100), 95);

    sendSSE(this.res, 'thinking', {
      content: message,
      stage,
      progress,
      message
    });
  }

  /**
   * 发送 thinking 完成事件
   */
  complete() {
    sendSSE(this.res, 'thinking_complete', {
      message: '✅ 思考完成',
      progress: 100
    });
  }
}

/**
 * 流式发送答案内容（逐字输出）
 */
export class AnswerStream {
  private res: Response;
  private buffer: string = '';

  constructor(res: Response) {
    this.res = res;
  }

  /**
   * 发送单个字符或词
   * @param chunk 文本片段
   */
  write(chunk: string) {
    this.buffer += chunk;

    // 发送 answer_chunk 事件（逐字流式输出）
    sendSSE(this.res, 'answer_chunk', {
      content: chunk,
      totalLength: this.buffer.length
    });
  }

  /**
   * 批量写入（分段发送，模拟打字效果）
   * @param text 完整文本
   * @param chunkSize 每次发送的字符数
   */
  async writeWithTyping(text: string, chunkSize: number = 1) {
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);
      this.write(chunk);

      // 模拟打字延迟（10-30ms）
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 10));
    }
  }

  /**
   * 完成答案输出
   */
  complete() {
    sendSSE(this.res, 'answer_complete', {
      message: '✅ 回答完成',
      totalLength: this.buffer.length,
      content: this.buffer
    });
  }

  /**
   * 获取当前已输出的内容
   */
  getContent(): string {
    return this.buffer;
  }
}

/**
 * 工具调用进度流
 */
export class ToolCallStream {
  private res: Response;
  private toolName: string;
  private stages: string[] = [];
  private currentStageIndex: number = 0;

  constructor(res: Response, toolName: string, stages?: string[]) {
    this.res = res;
    this.toolName = toolName;
    this.stages = stages || ['准备中', '执行中', '处理结果'];
  }

  /**
   * 发送工具调用开始
   */
  start(description?: string) {
    sendSSE(this.res, 'tool_call_start', {
      name: this.toolName,
      description: description || `🔧 开始调用工具: ${this.toolName}`,
      progress: 0,
      stage: this.stages[0]
    });
  }

  /**
   * 发送工具执行进度
   * @param stage 当前阶段
   * @param message 进度消息
   */
  progress(stage: string, message: string) {
    this.currentStageIndex++;
    const progress = Math.min(Math.round((this.currentStageIndex / this.stages.length) * 100), 95);

    sendSSE(this.res, 'tool_progress', {
      name: this.toolName,
      stage,
      message,
      progress
    });
  }

  /**
   * 发送工具调用完成
   */
  complete(result?: any) {
    sendSSE(this.res, 'tool_call_complete', {
      name: this.toolName,
      message: `✅ 工具调用完成: ${this.toolName}`,
      progress: 100,
      result
    });
  }

  /**
   * 发送工具调用错误
   */
  error(errorMessage: string) {
    sendSSE(this.res, 'tool_call_error', {
      name: this.toolName,
      error: errorMessage,
      message: `❌ 工具调用失败: ${errorMessage}`
    });
  }
}

/**
 * 初始化 SSE 响应头
 */
export function initSSE(res: Response): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // 禁用 Nginx 缓冲
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control, Content-Type, Authorization'
  });

  // 发送初始连接确认
  sendSSE(res, 'connected', {
    message: '🔗 连接已建立',
    timestamp: new Date().toISOString()
  });
}

/**
 * 发送错误事件
 */
export function sendError(res: Response, error: string, details?: any): void {
  sendSSE(res, 'error', {
    error,
    details,
    message: `❌ ${error}`
  });
}

/**
 * 发送完成事件并关闭连接
 * @param res - Express Response 对象
 * @param options - 完成事件的参数
 *   - message: 自定义消息（可选，默认 "✅ 处理完成"）
 *   - isComplete: 是否完全完成（可选，默认 true）
 *   - needsContinue: 是否需要继续执行（可选，默认 false）
 *   - nextUserMessage: 下一轮消息提示（可选）
 *   - data: 其他附加数据（可选）
 */
export function sendComplete(res: Response, options?: {
  message?: string;
  isComplete?: boolean;
  needsContinue?: boolean;
  nextUserMessage?: string;
  data?: any;
  quickResponse?: boolean;
  duration?: number;
}): void {
  const {
    message = '✅ 处理完成',
    isComplete = true,
    needsContinue = false,
    nextUserMessage,
    data,
    quickResponse,
    duration
  } = options || {};
  
  sendSSE(res, 'complete', {
    message,
    isComplete,
    needsContinue,
    nextUserMessage,
    data,
    quickResponse,
    duration
  });
  res.end();
}
