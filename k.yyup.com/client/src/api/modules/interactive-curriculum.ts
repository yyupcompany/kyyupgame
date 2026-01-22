/**
 * 互动多媒体课程 API 模块
 * 用于调用后端的互动课程生成接口
 */

import { request } from '@/utils/request';
import type { A2UIComponentNode } from '@/types/a2ui-protocol';

export interface GenerateCurriculumRequest {
  prompt: string;
  domain: string;
  ageGroup?: string;
  // 🎨 媒体生成选项
  enableImage?: boolean;    // 是否生成图片
  enableVoice?: boolean;    // 是否启用语音
  enableSoundEffect?: boolean;  // 是否启用音效
}

export interface GenerateCurriculumResponse {
  success: boolean;
  data: {
    taskId: string;
    message: string;
  };
}

export interface ProgressResponse {
  success: boolean;
  data: {
    progress: number;
    stage: string;
  };
}

export interface CurriculumDetail {
  id: number;
  name: string;
  description: string;
  domain: string;
  ageGroup: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  media?: {
    images: Array<{
      id: string;
      description: string;
      url: string;
      order: number;
    }>;
    video: {
      url: string;
      duration: number;
      script: string;
    };
  };
  metadata?: {
    generatedAt: string;
    models: {
      text: string;
      image: string;
      video: string;
    };
    status: string;
    progress: number;
  };
  courseAnalysis?: any;
  curriculumType: string;
  status: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

class InteractiveCurriculumAPI {
  /**
   * 生成互动多媒体课程（非流式，兼容旧版本）
   * @param params 生成参数
   * @returns 任务ID
   */
  async generateCurriculum(params: GenerateCurriculumRequest): Promise<GenerateCurriculumResponse> {
    try {
      const response = await request.post<GenerateCurriculumResponse>(
        '/interactive-curriculum/generate',
        params
      );
      if (!response.data) {
        throw new Error('生成课程响应数据为空');
      }
      return response.data;
    } catch (error) {
      console.error('❌ 生成课程失败:', error);
      throw error;
    }
  }

  /**
   * 生成互动多媒体课程（流式版本）
   * 实时推送思考过程和进度
   * @param params 生成参数
   * @param callbacks 回调函数
   */
  generateCurriculumStream(
    params: GenerateCurriculumRequest,
    callbacks: {
      onConnected?: (taskId: string) => void;
      onThinking?: (content: string) => void;
      onProgress?: (message: string) => void;
      onComplete?: () => void;
      onFinished?: (curriculumId: number) => void;
      onError?: (error: string) => void;
    }
  ): void {
    const token = localStorage.getItem('token');
    // 不需要添加 /api 前缀，因为 Vite 代理会自动处理
    const url = `/api/interactive-curriculum/generate-stream`;

    console.log('🚀 [流式生成] 开始请求:', url);

    // 使用 fetch 实现流式请求
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params)
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();

      function readStream(): Promise<void> {
        return reader!.read().then(({ done, value }) => {
          if (done) {
            console.log('🌊 [流式生成] 流结束');
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            try {
              const data = JSON.parse(line.substring(6));

              switch (data.type) {
                case 'connected':
                  console.log('🌊 [流式生成] 已连接，taskId:', data.taskId);
                  callbacks.onConnected?.(data.taskId);
                  break;
                case 'thinking':
                  console.log('🧠 [流式生成] 收到思考内容，长度:', data.content?.length);
                  callbacks.onThinking?.(data.content);
                  break;
                case 'progress':
                  console.log('📊 [流式生成] 进度更新:', data.message);
                  callbacks.onProgress?.(data.message);
                  break;
                case 'complete':
                  console.log('✅ [流式生成] 思考过程完成');
                  callbacks.onComplete?.();
                  break;
                case 'finished':
                  console.log('🎉 [流式生成] 课程生成完成，ID:', data.curriculumId);
                  callbacks.onFinished?.(data.curriculumId);
                  break;
                case 'error':
                  console.error('❌ [流式生成] 错误:', data.message);
                  callbacks.onError?.(data.message);
                  break;
              }
            } catch (e) {
              console.error('❌ [流式生成] 解析数据失败:', e);
            }
          }

          return readStream();
        });
      }

      readStream().catch(error => {
        console.error('❌ [流式生成] 读取流失败:', error);
        callbacks.onError?.(error.message);
      });
    }).catch(error => {
      console.error('❌ [流式生成] 请求失败:', error);
      callbacks.onError?.(error.message);
    });
  }

  /**
   * 查询课程生成进度
   * @param taskId 任务ID
   * @returns 进度信息
   */
  async getProgress(taskId: string): Promise<ProgressResponse> {
    try {
      const response = await request.get<ProgressResponse>(
        `/interactive-curriculum/progress/${taskId}`
      );
      if (!response.data) {
        throw new Error('查询进度响应数据为空');
      }
      return response.data;
    } catch (error) {
      console.error('❌ 查询进度失败:', error);
      throw error;
    }
  }

  /**
   * 获取课程详情
   * @param id 课程ID
   * @returns 课程详情
   */
  async getCurriculumDetail(id: number): Promise<{ success: boolean; data: CurriculumDetail }> {
    try {
      const response = await request.get<{ success: boolean; data: CurriculumDetail }>(
        `/interactive-curriculum/${id}`
      );
      if (!response.data) {
        throw new Error('获取课程详情响应数据为空');
      }
      return response.data;
    } catch (error) {
      console.error('❌ 获取课程详情失败:', error);
      throw error;
    }
  }

  /**
   * 保存课程
   * @param id 课程ID
   * @param data 课程数据
   * @returns 保存结果
   */
  async saveCurriculum(
    id: number,
    data: Partial<CurriculumDetail>
  ): Promise<{ success: boolean; message: string; data: CurriculumDetail }> {
    try {
      const response = await request.post<{ success: boolean; message: string; data: CurriculumDetail }>(
        `/interactive-curriculum/${id}/save`,
        data
      );
      if (!response.data) {
        throw new Error('保存课程响应数据为空');
      }
      return response.data;
    } catch (error) {
      console.error('❌ 保存课程失败:', error);
      throw error;
    }
  }

  /**
   * 获取 AI Think 的思考过程
   * @param taskId 任务ID
   * @returns 思考过程
   */
  async getThinkingProcess(taskId: string): Promise<{ success: boolean; data: { thinkingProcess: string } }> {
    try {
      const response = await request.get<{ success: boolean; data: { thinkingProcess: string } }>(
        `/interactive-curriculum/thinking/${taskId}`
      );
      if (!response.data) {
        throw new Error('获取思考过程响应数据为空');
      }
      return response.data;
    } catch (error) {
      console.error('❌ 获取 Think 思考过程失败:', error);
      throw error;
    }
  }

  /**
   * SSE 流式获取 Think 思考过程
   * 实时推送 Think 模型的思考内容
   */
  async getThinkingProcessStream(taskId: string, onMessage: (data: any) => void, onError?: (error: any) => void): Promise<void> {
    try {
      const eventSource = new EventSource(`/api/interactive-curriculum/thinking-stream/${taskId}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('🌊 [Think SSE] 收到消息:', data);
          onMessage(data);

          // 如果收到完成或超时事件，关闭连接
          if (data.type === 'complete' || data.type === 'timeout') {
            eventSource.close();
          }
        } catch (error) {
          console.error('❌ [Think SSE] 解析消息失败:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ [Think SSE] 连接错误:', error);
        eventSource.close();
        if (onError) {
          onError(error);
        }
      };
    } catch (error) {
      console.error('❌ SSE 流式获取 Think 思考过程失败:', error);
      if (onError) {
        onError(error);
      }
    }
  }

  /**
   * 🧱 A2UI流式生成互动课程（搭积木模式）
   * 实时分段发送A2UI组件，前端可增量渲染
   * @param params 生成参数
   * @param callbacks 回调函数
   * @returns AbortController 用于取消请求
   */
  generateA2UIStream(
    params: GenerateCurriculumRequest,
    callbacks: {
      onConnected?: (taskId: string) => void;
      onComponent?: (msg: {
        action: 'append' | 'update' | 'replace';
        targetId?: string;
        component: A2UIComponentNode;
      }) => void;
      onThinking?: (content: string) => void;
      onProgress?: (message: string) => void;
      onImageReady?: (imageId: string, imageUrl: string) => void;
      onComplete?: (message: string) => void;
      onFinished?: (curriculumId: number, plan: any) => void;
      onError?: (error: string) => void;
    }
  ): AbortController {
    const token = localStorage.getItem('token');
    const url = `/api/interactive-curriculum/generate-a2ui-stream`;
    const abortController = new AbortController();

    console.log('🧱 [A2UI搭积木] 开始请求:', url);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params),
      signal: abortController.signal
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      function readStream(): Promise<void> {
        return reader!.read().then(({ done, value }) => {
          if (done) {
            console.log('🧱 [A2UI搭积木] 流结束');
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;

            try {
              const data = JSON.parse(line.substring(6));

              switch (data.type) {
                case 'connected':
                  console.log('🧱 [A2UI搭积木] 已连接，taskId:', data.taskId);
                  callbacks.onConnected?.(data.taskId);
                  break;

                case 'component':
                  console.log(`🧱 [A2UI搭积木] 收到组件: action=${data.action}, id=${data.component?.id}`);
                  if (data.component) {
                    callbacks.onComponent?.({
                      action: data.action,
                      targetId: data.targetId,
                      component: data.component
                    });
                  }
                  break;

                case 'thinking':
                  callbacks.onThinking?.(data.content);
                  break;

                case 'progress':
                  console.log('📊 [A2UI搭积木] 进度:', data.message);
                  callbacks.onProgress?.(data.message);
                  break;

                case 'image_ready':
                  console.log('🖼️ [A2UI搭积木] 图片就绪:', data.imageId);
                  callbacks.onImageReady?.(data.imageId, data.imageUrl);
                  break;

                case 'complete':
                  console.log('✅ [A2UI搭积木] 生成完成');
                  callbacks.onComplete?.(data.message);
                  break;

                case 'finished':
                  console.log('🎉 [A2UI搭积木] 课程生成完成，ID:', data.curriculumId);
                  try {
                    callbacks.onFinished?.(data.curriculumId, data.plan);
                  } catch (e) {
                    const error = e as Error;
                    console.error('❌ [A2UI搭积木] onFinished回调执行失败:', error);
                    callbacks.onError?.(error.message || 'Unknown error');
                  }
                  break;

                case 'error':
                  console.error('❌ [A2UI搭积木] 错误:', data.message);
                  callbacks.onError?.(data.message);
                  break;
              }
            } catch (e) {
              console.error('❌ [A2UI搭积木] 解析数据失败:', e);
            }
          }

          return readStream();
        });
      }

      readStream().catch(error => {
        if (error.name !== 'AbortError') {
          console.error('❌ [A2UI搭积木] 读取流失败:', error);
          callbacks.onError?.(error.message);
        }
      });
    }).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('❌ [A2UI搭积木] 请求失败:', error);
        callbacks.onError?.(error.message);
      }
    });

    return abortController;
  }

  /**
   * 轮询查询进度（直到完成）
   * @param taskId 任务ID
   * @param maxAttempts 最大尝试次数
   * @param interval 轮询间隔（毫秒）
   * @returns 最终进度
   */
  async pollProgress(
    taskId: string,
    maxAttempts: number = 120,
    interval: number = 5000
  ): Promise<{ progress: number; stage: string; curriculumId?: number }> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        attempts++;

        try {
          const result = await this.getProgress(taskId);
          // 修复：result 是 ProgressResponse 类型，即 { success, data: { progress, stage } }
          // 响应拦截器已经提取了 data 部分，所以 result 应该是 { success, data: { progress, stage } }
          // 但实际上 getProgress 返回的是 response.data，即 { success, data: { progress, stage } }
          // 所以我们需要访问 result.data.progress
          const progressData = result.data || result;
          console.log(`📊 进度: ${progressData.progress}% - ${progressData.stage}`);

          if (progressData.progress >= 100) {
            clearInterval(timer);
            resolve(progressData);
          } else if (attempts >= maxAttempts) {
            clearInterval(timer);
            reject(new Error('轮询超时'));
          }
        } catch (error) {
          console.error('❌ 轮询失败:', error);
          if (attempts >= maxAttempts) {
            clearInterval(timer);
            reject(error);
          }
        }
      }, interval);
    });
  }
}

export const interactiveCurriculumAPI = new InteractiveCurriculumAPI();

