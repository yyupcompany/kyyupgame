<template>
  <div class="mobile-ai-curriculum-assistant">
    <!-- AI 对话头部 -->
    <div class="assistant-header">
      <div class="header-title">
        <el-icon class="ai-icon"><Star /></el-icon>
        <span>AI课程助手</span>
      </div>
      <el-button
        type="primary"
        text
        size="small"
        @click="$emit('close')"
      >
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <!-- 对话内容区域 -->
    <div class="chat-messages" ref="chatMessagesRef">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        :class="['message', msg.role]"
      >
        <div class="message-avatar">
          <el-icon v-if="msg.role === 'assistant'"><Star /></el-icon>
          <el-icon v-else><User /></el-icon>
        </div>
        <div class="message-content">
          <div v-if="msg.role === 'assistant' && msg.isStreaming" class="typing-effect">
            {{ msg.content }}
            <span class="cursor">|</span>
          </div>
          <div v-else class="content-text">{{ msg.content }}</div>
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="loading-animation">
          <div class="code-lines">
            <div class="code-line" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.15}s` }">
              <span class="line-number">{{ i }}</span>
              <span class="line-content"></span>
            </div>
          </div>
        </div>
        <div class="loading-info">
          <div class="loading-text">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>{{ generationStage || 'AI正在生成课程...' }}</span>
          </div>
          <!-- 显示thinking内容 -->
          <div v-if="thinkingContent" class="thinking-content">
            <div class="thinking-label">
              <el-icon><Star /></el-icon>
              <span>AI思考过程:</span>
            </div>
            <div class="thinking-text">{{ thinkingContent }}</div>
          </div>
          <div class="progress-info">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: generationProgress + '%' }"></div>
            </div>
            <span class="progress-text">{{ generationProgress }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <el-input
        v-model="inputPrompt"
        type="textarea"
        :rows="2"
        placeholder="输入课程要求，如：创建数字认知游戏..."
        :disabled="isLoading"
        @keydown.ctrl.enter="handleGenerate"
        resize="none"
      />
      <div class="input-controls">
        <el-select
          v-model="selectedDomain"
          placeholder="选择领域"
          :disabled="isLoading"
          size="small"
          class="domain-select"
        >
          <el-option label="健康" value="health" />
          <el-option label="语言" value="language" />
          <el-option label="社会" value="social" />
          <el-option label="科学" value="science" />
          <el-option label="艺术" value="art" />
        </el-select>

        <el-button
          type="primary"
          :loading="isLoading"
          @click="handleGenerate"
          size="small"
          class="generate-btn"
        >
          <el-icon v-if="!isLoading"><Star /></el-icon>
          生成
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Star, Close, User, Loading } from '@element-plus/icons-vue';
import { aiCurriculumService } from './services/ai-curriculum.service';
import { useUserStore } from '../../../../../../stores/user';
import { AI_ENDPOINTS } from '../../../../../../api/endpoints';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const emit = defineEmits<{
  close: [];
  generate: [data: { htmlCode: string; cssCode: string; jsCode: string; description: string }];
}>();

const inputPrompt = ref('');
const selectedDomain = ref('health');
const isLoading = ref(false);
const generationProgress = ref(0);
const generationStage = ref('');
const thinkingContent = ref('');
const messages = ref<Message[]>([
  {
    role: 'assistant',
    content: '👋 我是AI课程助手！告诉我你想要什么课程吧~'
  }
]);
const chatMessagesRef = ref<HTMLElement>();

onMounted(() => {
  scrollToBottom();
});

/**
 * 滚动到底部
 */
function scrollToBottom() {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  });
}

/**
 * 模拟进度更新
 */
function simulateProgress() {
  const stages = [
    { progress: 20, stage: '🤔 分析需求...' },
    { progress: 40, stage: '📝 生成HTML...' },
    { progress: 60, stage: '🎨 设计CSS...' },
    { progress: 80, stage: '⚙️ 编写JS...' },
    { progress: 100, stage: '✅ 生成完成！' }
  ];

  let currentStage = 0;
  const interval = setInterval(() => {
    if (currentStage < stages.length && isLoading.value) {
      generationProgress.value = stages[currentStage].progress;
      generationStage.value = stages[currentStage].stage;
      currentStage++;
    } else {
      clearInterval(interval);
    }
  }, 800);

  return interval;
}

/**
 * 处理生成课程
 */
async function handleGenerate() {
  if (!inputPrompt.value.trim()) {
    ElMessage.warning('请输入课程要求');
    return;
  }

  messages.value.push({
    role: 'user',
    content: inputPrompt.value
  });

  isLoading.value = true;
  generationProgress.value = 0;
  generationStage.value = '🚀 开始生成...';
  thinkingContent.value = '';

  scrollToBottom();

  try {
    await generateWithStream();
    inputPrompt.value = '';
    scrollToBottom();
  } catch (error) {
    console.error('❌ 生成失败:', error);
    generationProgress.value = 0;
    generationStage.value = '';
    messages.value.push({
      role: 'assistant',
      content: '❌ 生成失败，请重试或修改要求'
    });
    ElMessage.error('课程生成失败，请重试');
  } finally {
    isLoading.value = false;
  }
}

/**
 * 使用流式接口生成课程
 */
async function generateWithStream() {
  const userStore = useUserStore();
  const token = userStore.token;

  if (!token) {
    ElMessage.error('未找到认证令牌，请重新登录');
    throw new Error('未找到认证令牌');
  }

  const domainDescriptions: Record<string, string> = {
    health: '健康领域 - 关注幼儿身体健康、运动能力和卫生习惯',
    language: '语言领域 - 关注幼儿语言表达、理解和沟通能力',
    social: '社会领域 - 关注幼儿社交能力、情感发展和人际关系',
    science: '科学领域 - 关注幼儿科学探索、观察和实验能力',
    art: '艺术领域 - 关注幼儿创意表达、审美和艺术欣赏能力'
  };

  const systemPrompt = `你是一位专业的幼儿园课程设计师，擅长创建互动式、趣味性强的幼儿教育课程。

课程领域：${domainDescriptions[selectedDomain.value] || '通用领域'}
年龄段：3-6岁

你需要生成一个完整的、可交互的 HTML/CSS/JavaScript 课程。

要求：
1. 代码必须是完整的、可直接运行的
2. 界面要色彩鲜艳、吸引幼儿注意力
3. 交互要简单直观、适合幼儿操作
4. 包含教学目标和学习要点
5. 代码要有详细注释

返回格式必须是 JSON，包含以下字段：
{
  "htmlCode": "完整的 HTML 代码",
  "cssCode": "完整的 CSS 代码",
  "jsCode": "完整的 JavaScript 代码",
  "description": "课程描述和教学建议",
  "thinking": "设计思路和考虑因素"
}`;

  const userPrompt = `请根据以下要求生成一个幼儿园课程：

提示词：${inputPrompt.value}

课程领域：${selectedDomain.value}

请确保返回的是有效的 JSON 格式。`;

  const requestBody = {
    model: 'doubao-seed-1-6-thinking-250615',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 16384,
    top_p: 0.9,
    stream: true
  };

  const response = await fetch(AI_ENDPOINTS.CURRICULUM_GENERATE_STREAM, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');

  if (!reader) {
    throw new Error('无法获取响应流');
  }

  let buffer = '';
  let fullContent = '';
  let charCount = 0;
  let isDone = false;

  const stages = [
    { chars: 100, progress: 20, stage: '🤔 分析需求...' },
    { chars: 500, progress: 40, stage: '📝 生成HTML...' },
    { chars: 1000, progress: 60, stage: '🎨 设计CSS...' },
    { chars: 1500, progress: 80, stage: '⚙️ 编写JS...' },
    { chars: Infinity, progress: 95, stage: '✨ 完善细节...' }
  ];

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;

    while (true) {
      let sepIndex = buffer.indexOf('\n\n');
      if (sepIndex === -1) sepIndex = buffer.indexOf('\r\n\r\n');
      if (sepIndex === -1) break;

      const eventBlock = buffer.slice(0, sepIndex);
      const sepSlice = buffer.slice(sepIndex, sepIndex + 4);
      const consumed = sepSlice.startsWith('\r\n') ? 4 : 2;
      buffer = buffer.slice(sepIndex + consumed);

      const lines = eventBlock.split(/\r?\n/);
      const dataLines = lines
        .filter(l => /^\s*data:\s*/.test(l))
        .map(l => l.replace(/^\s*data:\s*/, ''));

      if (dataLines.length === 0) continue;

      let normalizedPayload = dataLines.join('').trim();
      while (normalizedPayload.startsWith('data:')) {
        normalizedPayload = normalizedPayload.substring(5).trim();
      }

      if (normalizedPayload === '[DONE]') {
        generationProgress.value = 100;
        generationStage.value = '✅ 生成完成！';
        isDone = true;
        break;
      }

      try {
        const evt = JSON.parse(normalizedPayload);

        if (evt.type === 'thinking' && typeof evt.thinking === 'string') {
          thinkingContent.value += evt.thinking;
          if (generationProgress.value < 20) {
            generationProgress.value = 10;
            generationStage.value = '🤔 AI正在思考...';
          }
          continue;
        }

        if (evt.type === 'content') {
          if (evt.fullContent && evt.fullContent.trim().length > 0) {
            fullContent = evt.fullContent;
            charCount = fullContent.length;
          } else if (evt.content) {
            fullContent += evt.content;
            charCount += evt.content.length;
          }
        } else if (evt.choices?.[0]?.delta?.content) {
          const content = evt.choices[0].delta.content;
          fullContent += content;
          charCount += content.length;
        }

        if (charCount > 0) {
          for (const stage of stages) {
            if (charCount < stage.chars) {
              if (generationProgress.value < stage.progress) {
                generationProgress.value = stage.progress;
                generationStage.value = `${stage.stage} (${charCount}字符)`;
              }
              break;
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ 解析失败:', e);
      }
    }

    if (isDone) break;
  }

  // 解析完整内容
  let result;
  try {
    const jsonResult = JSON.parse(fullContent);
    if (jsonResult.htmlCode || jsonResult.cssCode || jsonResult.jsCode) {
      result = {
        htmlCode: jsonResult.htmlCode || '',
        cssCode: jsonResult.cssCode || '',
        jsCode: jsonResult.jsCode || '',
        description: jsonResult.description || '课程已生成'
      };
    } else {
      throw new Error('JSON中没有找到代码字段');
    }
  } catch (jsonError) {
    try {
      // 手动提取代码
      const htmlMatch = fullContent.match(/"htmlCode":\s*`([^`]*)`/);
      const cssMatch = fullContent.match(/"cssCode":\s*`([^`]*)`/);
      const jsMatch = fullContent.match(/"jsCode":\s*`([^`]*)`/);
      const descMatch = fullContent.match(/"description":\s*"([^"]*)"/);

      result = {
        htmlCode: htmlMatch ? htmlMatch[1] : fullContent,
        cssCode: cssMatch ? cssMatch[1] : '',
        jsCode: jsMatch ? jsMatch[1] : '',
        description: descMatch ? descMatch[1] : '课程已生成'
      };
    } catch (manualParseError) {
      result = {
        htmlCode: fullContent,
        cssCode: '',
        jsCode: '',
        description: '课程已生成'
      };
    }
  }

  generationProgress.value = 100;
  generationStage.value = '✅ 课程生成完成！';

  messages.value.push({
    role: 'assistant',
    content: '✅ 课程生成成功！正在加载预览...'
  });

  scrollToBottom();

  await new Promise(resolve => setTimeout(resolve, 500));

  emit('generate', {
    htmlCode: result.htmlCode,
    cssCode: result.cssCode,
    jsCode: result.jsCode,
    description: result.description
  });
}
</script>

<style scoped lang="scss">
.mobile-ai-curriculum-assistant {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  position: relative;
  overflow: hidden;

  .assistant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    flex-shrink: 0;

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 600;
      font-size: var(--font-size-large);

      .ai-icon {
        font-size: var(--font-size-xl);
        color: var(--warning-color);
      }
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }

    .message {
      display: flex;
      gap: var(--spacing-sm);
      animation: slideIn 0.3s ease-out;
      max-width: 100%;

      &.user {
        justify-content: flex-end;

        .message-avatar {
          order: 2;
        }

        .message-content {
          order: 1;
          background: rgba(255, 255, 255, 0.9);
          color: var(--text-primary);
          border-radius: var(--border-radius-lg) var(--border-radius-sm) var(--border-radius-lg) var(--border-radius-lg);
          max-width: 75%;
        }
      }

      &.assistant {
        justify-content: flex-start;

        .message-avatar {
          order: 1;
        }

        .message-content {
          order: 2;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: var(--border-radius-sm) var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg);
          max-width: 85%;
        }
      }

      .message-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        flex-shrink: 0;
        font-size: var(--text-lg);
      }

      .message-content {
        padding: var(--spacing-sm) var(--spacing-md);
        word-break: break-word;
        line-height: 1.5;
        font-size: var(--font-size-base);

        .content-text {
          white-space: pre-wrap;
        }

        .typing-effect {
          .cursor {
            animation: blink 0.7s infinite;
          }
        }
      }
    }

    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius-lg);
      animation: slideIn 0.3s ease-out;

      .loading-animation {
        width: 100%;
        max-width: 300px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: var(--border-radius-md);
        padding: var(--spacing-md);

        .code-lines {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);

          .code-line {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            opacity: 0;
            animation: fadeInLine 0.5s ease-out forwards;

            .line-number {
              color: rgba(255, 255, 255, 0.4);
              font-family: 'Courier New', monospace;
              font-size: var(--font-size-small);
              min-width: 20px;
            }

            .line-content {
              flex: 1;
              height: 4px;
              background: linear-gradient(90deg,
                rgba(102, 126, 234, 0.6) 0%,
                rgba(118, 75, 162, 0.6) 100%);
              border-radius: 2px;
              animation: pulse 1.5s ease-in-out infinite;
            }
          }
        }
      }

      .loading-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);

        .loading-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          color: white;
          font-size: var(--font-size-base);
          font-weight: 500;

          .loading-icon {
            font-size: var(--font-size-lg);
            animation: spin 1s linear infinite;
          }
        }

        .thinking-content {
          width: 100%;
          background: rgba(138, 43, 226, 0.15);
          border: 1px solid rgba(138, 43, 226, 0.3);
          border-radius: var(--border-radius-md);
          padding: var(--spacing-sm);
          margin: var(--spacing-sm) 0;
          animation: fadeIn 0.3s ease-out;

          .thinking-label {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            color: var(--warning-color);
            font-size: var(--font-size-small);
            font-weight: 600;
            margin-bottom: var(--spacing-xs);
          }

          .thinking-text {
            color: rgba(255, 255, 255, 0.9);
            font-size: var(--font-size-small);
            line-height: 1.6;
            max-height: 80px;
            overflow-y: auto;
            padding: var(--spacing-xs);
          }
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .progress-bar {
            flex: 1;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, var(--success-color), var(--success-color));
              border-radius: 3px;
              transition: width 0.3s ease;
              box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
            }
          }

          .progress-text {
            color: white;
            font-size: var(--font-size-small);
            font-weight: 600;
            min-width: 40px;
            text-align: right;
          }
        }
      }
    }
  }

  .input-area {
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    flex-shrink: 0;

    :deep(.el-textarea) {
      margin-bottom: var(--spacing-sm);

      .el-textarea__inner {
        background: rgba(255, 255, 255, 0.9);
        color: var(--text-primary);
        border: none;
        border-radius: var(--border-radius-md);
        resize: none;
        font-size: var(--font-size-base);

        &::placeholder {
          color: var(--text-placeholder);
        }

        &:focus {
          box-shadow: 0 0 0 2px var(--primary-color);
        }
      }
    }

    .input-controls {
      display: flex;
      gap: var(--spacing-sm);

      .domain-select {
        flex: 1;
        max-width: 120px;

        :deep(.el-input__wrapper) {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: var(--border-radius-md);
        }
      }

      .generate-btn {
        flex: 1;
        max-width: 100px;
        background: rgba(255, 255, 255, 0.9);
        color: var(--primary-color);
        border: none;
        border-radius: var(--border-radius-md);
        font-weight: 600;
        height: 40px;

        &:hover {
          background: white;
          transform: translateY(-1px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

// 动画
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInLine {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scaleX(1);
  }
  50% {
    opacity: 1;
    transform: scaleX(0.95);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .mobile-ai-curriculum-assistant {
    .assistant-header {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .chat-messages {
      padding: var(--spacing-sm);

      .message {
        &.user .message-content,
        &.assistant .message-content {
          max-width: 90%;
        }

        .message-content {
          font-size: var(--font-size-sm);
          padding: var(--spacing-xs) var(--spacing-sm);
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          font-size: var(--text-base);
        }
      }
    }

    .input-area {
      padding: var(--spacing-sm);

      .input-controls {
        .generate-btn {
          height: 36px;
          font-size: var(--font-size-sm);
        }
      }
    }
  }
}
</style>