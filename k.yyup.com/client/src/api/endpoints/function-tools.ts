import request, { aiService } from '@/utils/request';
import type { ApiResponse } from '@/utils/request';

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
}

export interface FunctionToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: any;
}

export interface AvailableTool {
  name: string;
  description: string;
  category: string;
  requiredRole?: string[];
}

export interface AvailableToolsResponse {
  database_query: AvailableTool[];
  page_operation: AvailableTool[];
  business_operation: AvailableTool[];
}

export interface SmartChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SmartChatRequest {
  messages: SmartChatMessage[];
  conversation_id?: number;
  user_id?: number;
}

export interface SmartChatResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// ========================================
// 注意：以下API函数已被统一智能系统取代
// 新的统一接口：/api/ai/unified/unified-chat
// 请使用统一智能系统进行所有AI相关操作
// ========================================

// 统一智能对话接口（推荐使用）
export function callUnifiedIntelligence(data: {
  message: string;
  userId?: string;
  conversationId?: string;
  context?: Record<string, any>;
}): Promise<ApiResponse<any>> {
  // 使用AI专用服务，支持60秒超时
  // 🔧 修复：添加 /api 前缀
  return aiService.post('/api/ai/unified/unified-chat', data);
}

// SSE流式智能对话接口（新增，支持实时思考过程显示）
export function callUnifiedIntelligenceStream(
  data: {
    message: string;
    userId?: string;
    conversationId?: string;
    webSearch?: boolean; // 🔍 是否启用网络搜索
    context?: Record<string, any>;
  },
  onProgress?: (event: {
    type: 'start' | 'thinking' | 'thinking_update' | 'thinking_start' | 'thinking_complete' | 'context_optimization_start' | 'context_optimization_progress' | 'context_optimization_complete' | 'tool_intent' | 'tool_call_description' | 'tool_call' | 'tool_call_start' | 'tool_call_error' | 'tool_call_complete' | 'tool_narration' | 'workflow_step_start' | 'workflow_step_complete' | 'workflow_step_failed' | 'workflow_step_instructions' | 'workflow_user_confirmation_required' | 'workflow_mobile_preview' | 'workflow_complete' | 'search_start' | 'search_progress' | 'search_complete' | 'content_update' | 'answer_start' | 'answer_chunk' | 'answer_complete' | 'final_answer' | 'answer' | 'complete' | 'error';
    data?: any;
    message?: string;
  }) => void
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📡 [API调用] 开始调用统一智能流式接口')
      console.log('📝 [API调用] 请求数据:', JSON.stringify(data, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      const token = localStorage.getItem('kindergarten_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');
      // ✅ 修复：使用相对路径 /api，让 Vite 代理处理（处理空字符串情况）
      const apiUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

      console.log('🔑 [API调用] Token:', token ? '已设置' : '未设置')
      console.log('🌐 [API调用] API地址:', `${apiUrl}/ai/unified/stream-chat`)

      const response = await fetch(`${apiUrl}/ai/unified/stream-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(data),
      });

      console.log('📥 [API调用] 响应状态:', response.status, response.statusText)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: any = null;
      if (!reader) {
        throw new Error('无法获取响应流');
      }
      while (true) {
        const result = await reader.read();
        const { done, value } = result || {};
        if (done) break;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }
        let sepIndex;
        while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);
          if (!rawEvent.trim()) continue;
          const lines = rawEvent.split('\n');
          let eventType = '';
          const dataLines: string[] = [];
          for (const l of lines) {
            if (l.startsWith(':')) continue;
            if (l.startsWith('event:')) {
              eventType = l.slice(6).trim();
              continue;
            }
            if (l.startsWith('data:')) {
              dataLines.push(l.slice(5).trim());
              continue;
            }
          }
          const dataStr = dataLines.join('\n');
          let eventData: any = null;
          if (dataStr) {
            try { eventData = JSON.parse(dataStr); } catch { eventData = dataStr; }
          }
          const t = eventType as any;

          // 🔍 [日志] 接收到SSE事件
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📥 [前端接收] SSE事件:', t);
          console.log('📝 [前端接收] 事件数据:', typeof eventData === 'string' ? eventData.substring(0, 100) : JSON.stringify(eventData).substring(0, 100));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          if (t === 'start') onProgress?.({ type: 'start', message: eventData?.message });
          else if (t === 'thinking_start') {
            console.log('🤔 [前端接收] thinking_start事件');
            onProgress?.({ type: 'thinking_start', message: '🤔 AI开始思考...' });
          }
          else if (t === 'thinking') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🤔 [前端接收] thinking事件');
            console.log('📝 [前端接收] eventData:', eventData);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            // 使用后端发送的实际内容，而不是硬编码的固定文本
            const thinkingMessage = typeof eventData === 'string' ? eventData : (eventData?.content ?? eventData?.message ?? '🤔 AI正在思考...');
            console.log('📝 [前端接收] thinkingMessage:', thinkingMessage.substring(0, 100));
            onProgress?.({ type: 'thinking', data: eventData?.content ?? eventData, message: thinkingMessage });
          }
          else if (t === 'thinking_update') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🤔 [前端接收] thinking_update事件');
            console.log('📝 [前端接收] eventData:', eventData);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            onProgress?.({ type: 'thinking_update', data: eventData, message: '🤔 思考中...' });
          }
          else if (t === 'thinking_complete') onProgress?.({ type: 'thinking_complete', message: '🤔 思考完成' });

          // 🧠 上下文优化事件处理
          else if (t === 'context_optimization_start') {
            console.log('🧠 [上下文优化] 开始优化:', eventData);
            onProgress?.({ type: 'context_optimization_start', data: eventData, message: eventData?.message || '开始智能上下文优化...' });
          }
          else if (t === 'context_optimization_progress') {
            console.log('🧠 [上下文优化] 进度更新:', eventData);
            onProgress?.({ type: 'context_optimization_progress', data: eventData, message: eventData?.message || '正在优化上下文...' });
          }
          else if (t === 'context_optimization_complete') {
            console.log('🧠 [上下文优化] 优化完成:', eventData);
            onProgress?.({ type: 'context_optimization_complete', data: eventData, message: eventData?.message || '上下文优化完成' });
          }
          // 🎯 工具意图事件 - 显示用户友好的工具说明
          else if (t === 'tool_intent') {
            console.log('💡 [前端接收] tool_intent事件:', eventData);
            onProgress?.({ type: 'tool_intent', data: eventData, message: eventData?.message });
          }
          else if (t === 'tool_call_description') onProgress?.({ type: 'tool_call_description', data: eventData, message: `📝 工具说明: ${eventData?.description}` });

          // 🎯 使用工具描述（如果有）
          else if (t === 'tool_call_start') onProgress?.({ type: 'tool_call_start', data: eventData, message: eventData?.description || `🔧 开始调用工具: ${eventData?.name}` });
          else if (t === 'tool_call') onProgress?.({ type: 'tool_call', data: eventData, message: `🔧 调用工具: ${eventData?.name}` });
          else if (t === 'tool_call_error') onProgress?.({ type: 'tool_call_error', data: eventData, message: `❌ 工具调用失败: ${eventData?.error}` });
          else if (t === 'tool_call_complete') onProgress?.({ type: 'tool_call_complete', data: eventData, message: `✅ 工具调用完成: ${eventData?.name}` });
          else if (t === 'tool_narration') onProgress?.({ type: 'tool_narration', data: eventData, message: `💬 工具解说: ${eventData?.narration || ''}` });
          else if (t === 'workflow_step_start') onProgress?.({ type: 'workflow_step_start', data: eventData, message: `🔄 工作流步骤开始: ${eventData?.stepTitle}` });
          else if (t === 'workflow_step_complete') onProgress?.({ type: 'workflow_step_complete', data: eventData, message: `✅ 工作流步骤完成: ${eventData?.stepTitle}` });
          else if (t === 'workflow_step_failed') onProgress?.({ type: 'workflow_step_failed', data: eventData, message: `❌ 工作流步骤失败: ${eventData?.stepTitle}` });
          else if (t === 'workflow_step_instructions') onProgress?.({ type: 'workflow_step_instructions', data: eventData, message: `📋 工作流步骤指令更新: ${eventData?.stepTitle || ''}` });
          else if (t === 'workflow_user_confirmation_required') onProgress?.({ type: 'workflow_user_confirmation_required', data: eventData, message: eventData?.message || '📝 需要确认活动方案' });
          else if (t === 'workflow_mobile_preview') onProgress?.({ type: 'workflow_mobile_preview', data: eventData, message: '📱 已生成移动端预览' });
          else if (t === 'workflow_complete') onProgress?.({ type: 'workflow_complete', data: eventData, message: eventData?.message || '🎉 工作流执行完成' });
          else if (t === 'workflow_step_instructions') onProgress?.({ type: 'workflow_step_instructions', data: eventData, message: `📋 工作流步骤指令更新: ${eventData?.stepTitle || ''}` });
          else if (t === 'workflow_user_confirmation_required') onProgress?.({ type: 'workflow_user_confirmation_required', data: eventData, message: eventData?.message || '📝 需要确认活动方案' });
          else if (t === 'workflow_mobile_preview') onProgress?.({ type: 'workflow_mobile_preview', data: eventData, message: '📱 已生成移动端预览' });
          else if (t === 'workflow_complete') onProgress?.({ type: 'workflow_complete', data: eventData, message: eventData?.message || '🎉 工作流执行完成' });
          // 🔍 搜索事件处理
          else if (t === 'search_start') onProgress?.({ type: 'search_start', data: eventData, message: eventData?.message || '🔍 开始搜索...' });
          else if (t === 'search_progress') onProgress?.({ type: 'search_progress', data: eventData, message: eventData?.message || eventData?.statusMessage || '搜索中...' });
          else if (t === 'search_complete') onProgress?.({ type: 'search_complete', data: eventData, message: eventData?.message || '✅ 搜索完成' });
          else if (t === 'content_update') onProgress?.({ type: 'content_update', data: eventData, message: '💬 流式更新答案内容...' });
          else if (t === 'answer_start') { console.log('💬 [answer_start] 开始生成答案'); onProgress?.({ type: 'answer_start', data: eventData, message: '💬 开始生成答案...' }); }
          else if (t === 'answer_chunk') { onProgress?.({ type: 'answer_chunk', data: eventData }); }
          else if (t === 'answer_complete') { console.log('✅ [answer_complete] 答案生成完成'); onProgress?.({ type: 'answer_complete', data: eventData, message: '✅ 答案生成完成' }); }
          else if (t === 'final_answer') { onProgress?.({ type: 'final_answer', data: eventData, message: '🎯 最终答案生成完成' }); finalResult = eventData; }
          else if (t === 'answer') { onProgress?.({ type: 'answer', data: eventData?.content ?? eventData, message: '💬 生成回答中...' }); finalResult = eventData; }
          else if (t === 'complete') { finalResult = eventData; onProgress?.({ type: 'complete', data: finalResult, message: '✅ 处理完成' }); }
          else if (t === 'error') { onProgress?.({ type: 'error', message: eventData?.message || '处理出错' }); throw new Error(eventData?.message || '流式处理失败'); }
        }
      }
      if (finalResult) resolve(finalResult); else resolve({ data: { message: '处理完成' } });
    } catch (error) {
      reject(error);
    }
  });
}

// 🆕 SSE流式智能对话接口 - 单次调用版本（用于前端多轮调用架构）
// 📍 使用 /api/ai/unified/stream-chat 接口（支持自动工具选择和智能路由）
export function callUnifiedIntelligenceStreamSingleRound(
  data: {
    message?: string;
    userId?: string;
    conversationId?: string;
    context?: Record<string, any>;
  },
  onProgress?: (event: {
    type: 'start' | 'thinking' | 'thinking_update' | 'thinking_start' | 'thinking_complete' | 'context_optimization_start' | 'context_optimization_progress' | 'context_optimization_complete' | 'tool_intent' | 'tool_call_description' | 'tool_call' | 'tool_call_start' | 'tool_call_error' | 'tool_call_complete' | 'tool_narration' | 'workflow_step_start' | 'workflow_step_complete' | 'workflow_step_failed' | 'workflow_step_instructions' | 'workflow_user_confirmation_required' | 'workflow_mobile_preview' | 'workflow_complete' | 'search_start' | 'search_progress' | 'search_complete' | 'content_update' | 'answer_start' | 'answer_chunk' | 'answer_complete' | 'final_answer' | 'answer' | 'complete' | 'error';
    data?: any;
    message?: string;
  }) => void,
  abortSignal?: AbortSignal
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🎯 [单次调用] 开始调用统一智能流式接口（使用stream-chat接口）')
      console.log('📝 [单次调用] 请求数据:', JSON.stringify(data, null, 2))
      console.log('🔢 [单次调用] 当前轮次:', data.context?.currentRound || 1)
      console.log('📨 [单次调用] 消息历史长度:', data.context?.messages?.length || 0)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      const token = localStorage.getItem('kindergarten_token') || localStorage.getItem('token') || localStorage.getItem('auth_token');
      // ✅ 修复：使用相对路径 /api，让 Vite 代理处理（处理空字符串情况）
      // 不要使用绝对路径 http://localhost:3000/api，这会导致 CORS 问题
      const apiUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api';

      console.log('🔑 [单次调用] Token:', token ? '已设置' : '未设置')
      console.log('🌐 [单次调用] API地址:', `${apiUrl}/ai/unified/stream-chat`)
      console.log('📤 [单次调用] 开始发送 fetch 请求...')

      const response = await fetch(`${apiUrl}/ai/unified/stream-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(data),
        signal: abortSignal, // 🔧 支持中止信号
      });

      console.log('✅ [单次调用] 收到响应')
      console.log('📥 [单次调用] 响应状态:', response.status, response.statusText)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: any = null;

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      // 🔧 监听中止信号
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          console.log('🛑 [单次调用] 收到中止信号，取消reader')
          reader.cancel()
        })
      }

      while (true) {
        const result = await reader.read();
        const { done, value } = result || {};
        if (done) break;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        let sepIndex;
        while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);
          if (!rawEvent.trim()) continue;

          const lines = rawEvent.split('\n');
          let eventType = '';
          const dataLines: string[] = [];

          for (const l of lines) {
            if (l.startsWith(':')) continue;
            if (l.startsWith('event:')) {
              eventType = l.slice(6).trim();
              continue;
            }
            if (l.startsWith('data:')) {
              dataLines.push(l.slice(5).trim());
              continue;
            }
          }

          const dataStr = dataLines.join('\n');
          let eventData: any = null;
          if (dataStr) {
            try { eventData = JSON.parse(dataStr); } catch { eventData = dataStr; }
          }

          const t = eventType as any;

          // 🔍 [日志] 接收到SSE事件
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📥 [单次调用] SSE事件:', t);
          console.log('📝 [单次调用] 事件数据:', typeof eventData === 'string' ? eventData.substring(0, 100) : JSON.stringify(eventData).substring(0, 100));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          // 处理各种事件类型（与原版相同）
          if (t === 'start') onProgress?.({ type: 'start', message: eventData?.message });
          else if (t === 'thinking_start') onProgress?.({ type: 'thinking_start', message: '🤔 AI开始思考...' });
          else if (t === 'thinking') {
            const thinkingMessage = typeof eventData === 'string' ? eventData : (eventData?.content ?? eventData?.message ?? '🤔 AI正在思考...');
            onProgress?.({ type: 'thinking', data: eventData?.content ?? eventData, message: thinkingMessage });
          }
          else if (t === 'thinking_update') onProgress?.({ type: 'thinking_update', data: eventData, message: '🤔 思考中...' });
          else if (t === 'thinking_complete') onProgress?.({ type: 'thinking_complete', message: '🤔 思考完成' });
          else if (t === 'context_optimization_start') onProgress?.({ type: 'context_optimization_start', data: eventData, message: eventData?.message || '开始智能上下文优化...' });
          else if (t === 'context_optimization_progress') onProgress?.({ type: 'context_optimization_progress', data: eventData, message: eventData?.message || '正在优化上下文...' });
          else if (t === 'context_optimization_complete') onProgress?.({ type: 'context_optimization_complete', data: eventData, message: eventData?.message || '上下文优化完成' });

          // 🎯 工具意图和描述事件
          else if (t === 'tool_intent') onProgress?.({ type: 'tool_intent', data: eventData, message: eventData?.message });
          else if (t === 'tool_call_description') onProgress?.({ type: 'tool_call_description', data: eventData, message: `📝 工具说明: ${eventData?.description}` });

          // 🔧 工具调用事件
          else if (t === 'tool_call_start') onProgress?.({ type: 'tool_call_start', data: eventData, message: eventData?.description || `🔧 开始调用工具: ${eventData?.name}` });
          else if (t === 'tool_call_complete') onProgress?.({ type: 'tool_call_complete', data: eventData, message: `✅ 工具调用完成: ${eventData?.name}` });
          else if (t === 'tool_call_error') onProgress?.({ type: 'tool_call_error', data: eventData, message: `❌ 工具调用失败: ${eventData?.error}` });
          else if (t === 'tool_narration') onProgress?.({ type: 'tool_narration', data: eventData, message: `💬 工具解说: ${eventData?.narration || ''}` });

          // 🔄 工作流事件
          else if (t === 'workflow_step_start') onProgress?.({ type: 'workflow_step_start', data: eventData, message: `🔄 工作流步骤开始: ${eventData?.stepTitle}` });
          else if (t === 'workflow_step_complete') onProgress?.({ type: 'workflow_step_complete', data: eventData, message: `✅ 工作流步骤完成: ${eventData?.stepTitle}` });
          else if (t === 'workflow_step_failed') onProgress?.({ type: 'workflow_step_failed', data: eventData, message: `❌ 工作流步骤失败: ${eventData?.stepTitle}` });
          else if (t === 'workflow_step_instructions') onProgress?.({ type: 'workflow_step_instructions', data: eventData, message: `📋 工作流步骤指令更新: ${eventData?.stepTitle || ''}` });
          else if (t === 'workflow_user_confirmation_required') onProgress?.({ type: 'workflow_user_confirmation_required', data: eventData, message: eventData?.message || '📝 需要确认活动方案' });
          else if (t === 'workflow_mobile_preview') onProgress?.({ type: 'workflow_mobile_preview', data: eventData, message: '📱 已生成移动端预览' });
          else if (t === 'workflow_complete') onProgress?.({ type: 'workflow_complete', data: eventData, message: eventData?.message || '🎉 工作流执行完成' });

          // 🔍 搜索事件
          else if (t === 'search_start') onProgress?.({ type: 'search_start', data: eventData, message: eventData?.message || '🔍 开始搜索...' });
          else if (t === 'search_progress') onProgress?.({ type: 'search_progress', data: eventData, message: eventData?.message || eventData?.statusMessage || '搜索中...' });
          else if (t === 'search_complete') onProgress?.({ type: 'search_complete', data: eventData, message: eventData?.message || '✅ 搜索完成' });

          // 💬 内容更新事件
          else if (t === 'content_update') {
            // 🎯 解析函数调用标签并转换为现有事件类型
            const content = eventData?.content || eventData || '';

            // 检查是否包含函数调用标签
            if (typeof content === 'string' && content.includes('<|FunctionCallBegin|>')) {
              console.log('🔧 [content_update] 检测到函数调用标签，开始解析...');

              // 提取函数调用内容
              const functionCallMatch = content.match(/<\|FunctionCallBegin\|>([\s\S]*?)<\|FunctionCallEnd\|>/);
              if (functionCallMatch) {
                try {
                  const functionCalls = JSON.parse(functionCallMatch[1]);
                  console.log('🔧 [content_update] 解析出函数调用:', functionCalls);

                  // 为每个函数调用转换为tool_call_start事件（复用现有事件类型）
                  if (Array.isArray(functionCalls)) {
                    functionCalls.forEach((call, index) => {
                      // 🔧 修复：立即发送事件，保持实时性
                      onProgress?.({
                        type: 'tool_call_start',
                        data: {
                          name: call.name,
                          arguments: call.parameters,
                          intent: call.parameters?.userInput || `执行${call.name}工具`,
                          index: index // 添加索引以保持顺序
                        },
                        message: `🔧 开始执行工具: ${call.name}`
                      });
                    });
                  }

                } catch (parseError) {
                  console.warn('🔧 [content_update] 函数调用解析失败:', parseError);
                  // 解析失败时仍然转发原始内容
                  onProgress?.({ type: 'content_update', data: eventData, message: '💬 流式更新答案内容...' });
                }
              } else {
                // 没有完整的函数调用标签，仍然转发原始内容
                onProgress?.({ type: 'content_update', data: eventData, message: '💬 流式更新答案内容...' });
              }
            } else {
              // 没有函数调用标签，正常转发内容更新
              onProgress?.({ type: 'content_update', data: eventData, message: '💬 流式更新答案内容...' });
            }
          }
          else if (t === 'final_answer') { onProgress?.({ type: 'final_answer', data: eventData, message: '🎯 最终答案生成完成' }); finalResult = eventData; }
          else if (t === 'complete') {
            finalResult = eventData;
            console.log('✅ [单次调用] 收到complete事件:', finalResult);
            onProgress?.({ type: 'complete', data: finalResult, message: '✅ 单次调用完成' });
          }
          else if (t === 'error') {
            onProgress?.({ type: 'error', message: eventData?.message || '处理出错' });
            throw new Error(eventData?.message || '流式处理失败');
          }
        }
      }

      console.log('🎯 [单次调用] SSE流结束，返回结果:', finalResult);
      if (finalResult) resolve(finalResult);
      else resolve({ data: { message: '处理完成' } });

    } catch (error: any) {
      // 🔧 处理中止错误
      if (error?.name === 'AbortError') {
        console.log('🛑 [单次调用] 请求已被中止');
        // ✅ 修复：中止错误应该 reject，而不是 resolve
        // 这样上层代码可以正确处理中止事件
        reject(error);
      } else {
        console.error('❌ [单次调用] 调用失败:', error);
        reject(error);
      }
    }
  });
}

// 获取统一智能系统状态
export function getUnifiedSystemStatus(): Promise<ApiResponse<any>> {
  return request.get('/api/ai/unified/status');
}

// 获取统一智能系统能力
export function getUnifiedSystemCapabilities(): Promise<ApiResponse<any>> {
  return request.get('/api/ai/unified/capabilities');
}

// ========================================
// 轻量直连聊天接口
// ========================================
export function callDirectChat(data: {
  message: string;
  userId?: string;
  context?: Record<string, any>;
}): Promise<ApiResponse<{ content: string }>> {
  // 🔧 修复：添加 /api 前缀
  return aiService.post('/api/ai/unified/direct-chat', data);
}

// 轻量直连聊天（SSE版本，统一流式输出）
export function callDirectChatSSE(data: {
  message: string;
  userId?: string;
  context?: Record<string, any>;
}, onMessage: (event: {
  type: string;
  content: string;
  timestamp?: string;
}) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('🔗 [SSE] 开始直连聊天请求:', data.message.substring(0, 50));

    // 使用fetch发送POST请求并处理SSE响应
    fetch('/api/ai/unified/direct-chat-sse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(data)
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      function readStream(): Promise<void> {
        return reader!.read().then((result) => {
          const { done, value } = result || {};
          if (done) {
            console.log('🔗 [SSE] 流式响应完成');
            resolve();
            return;
          }

          if (value) {
            buffer += decoder.decode(value, { stream: true });
          }
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                console.log('📡 [SSE] 收到事件:', eventData.type, eventData.content?.substring(0, 30));
                onMessage(eventData);

                // 如果收到done信号，结束流
                if (eventData.type === 'done' || eventData.type === 'complete') {
                  console.log('🔗 [SSE] 收到完成信号，结束流');
                  resolve();
                  return;
                }
              } catch (error) {
                console.warn('⚠️ [SSE] 解析数据失败:', line, error);
              }
            }
          }

          return readStream();
        }).catch(error => {
          console.error('❌ [SSE] 读取流失败:', error);
          reject(error);
        });
      }

      return readStream();
    }).catch(error => {
      console.error('❌ [SSE] 请求失败:', error);
      reject(error);
    });
  });
}