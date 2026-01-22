<template>
  <div class="ai-curriculum-assistant">
    <!-- AI 对话头部 -->
    <div class="assistant-header">
      <div class="header-title">
        <UnifiedIcon name="default" />
        <span>AI 课程助手</span>
      </div>
      <el-button
        type="primary"
        text
        @click="$emit('close')"
      >
        <UnifiedIcon name="Close" />
      </el-button>
    </div>

    <!-- 对话内容区域 -->
    <div class="chat-messages">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        :class="['message', msg.role]"
      >
        <div class="message-avatar">
          <UnifiedIcon name="default" />
          <UnifiedIcon name="default" />
        </div>
        <div class="message-content">
          <div v-if="msg.role === 'assistant' && msg.isStreaming" class="typing-effect">
            {{ msg.content }}
            <span class="cursor">|</span>
          </div>
          <div v-else>{{ msg.content }}</div>
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="loading-animation">
          <div class="code-lines">
            <div class="code-line" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.1}s` }">
              <span class="line-number">{{ i }}</span>
              <span class="line-content"></span>
            </div>
          </div>
        </div>
        <div class="loading-info">
          <div class="loading-text">
            <UnifiedIcon name="default" />
            <span>{{ generationStage || 'AI 正在生成课程代码...' }}</span>
          </div>
          <!-- 显示thinking内容 -->
          <div v-if="thinkingContent" class="thinking-content">
            <div class="thinking-label">
              <UnifiedIcon name="default" />
              <span>AI 思考过程:</span>
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
        :rows="3"
        placeholder="输入课程要求，例如：创建一个关于数字认知的互动游戏..."
        :disabled="isLoading"
        @keydown.ctrl.enter="handleGenerate"
      />
      <div class="input-controls">
        <el-select
          v-model="selectedDomain"
          placeholder="选择课程领域"
          :disabled="isLoading"
          style="max-width: 150px; width: 100%"
        >
          <el-option label="健康领域" value="health" />
          <el-option label="语言领域" value="language" />
          <el-option label="社会领域" value="social" />
          <el-option label="科学领域" value="science" />
          <el-option label="艺术领域" value="art" />
        </el-select>

        <el-button
          type="primary"
          :loading="isLoading"
          @click="handleGenerate"
        >
          <UnifiedIcon name="default" />
          生成课程
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Star, Close, User, Loading } from '@element-plus/icons-vue';
import { aiCurriculumService } from '../services/ai-curriculum.service';
import { useUserStore } from '../../../../stores/user';

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
const thinkingContent = ref(''); // 新增:存储thinking内容
const messages = ref<Message[]>([
  {
    role: 'assistant',
    content: '👋 你好！我是 AI 课程助手。我可以帮你快速生成幼儿园课程。请告诉我你想要什么样的课程吧！'
  }
]);

/**
 * 模拟进度更新
 */
function simulateProgress() {
  const stages = [
    { progress: 20, stage: '🤔 分析课程需求...' },
    { progress: 40, stage: '📝 生成 HTML 结构...' },
    { progress: 60, stage: '🎨 设计 CSS 样式...' },
    { progress: 80, stage: '⚙️ 编写 JavaScript 交互...' },
    { progress: 100, stage: '✅ 课程代码生成完成！' }
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
 * 处理生成课程 - 使用流式接口
 */
async function handleGenerate() {
  if (!inputPrompt.value.trim()) {
    ElMessage.warning('请输入课程要求');
    return;
  }

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: inputPrompt.value
  });

  isLoading.value = true;
  generationProgress.value = 0;
  generationStage.value = '🚀 开始生成课程...';
  thinkingContent.value = ''; // 清空thinking内容

  try {
    // 使用流式接口生成
    await generateWithStream();

    // 清空输入
    inputPrompt.value = '';

    // 滚动到底部
    await nextTick();
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
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
 * 辅助函数：将Buffer的JSON表示转换为字符串
 */
function decodeBufferData(data: string): string {
  try {
    const parsed = JSON.parse(data);
    // 检查是否是Buffer的JSON表示
    if (parsed && parsed.type === 'Buffer' && Array.isArray(parsed.data)) {
      // 将字节数组转换为字符串
      return String.fromCharCode(...parsed.data);
    }
    return data;
  } catch (e) {
    return data;
  }
}

/**
 * 使用流式接口生成课程
 */
async function generateWithStream() {
  const userStore = useUserStore();
  const token = userStore.token;

  console.log('🔑 Token状态:', token ? `存在 (长度: ${token.length})` : '不存在');

  if (!token) {
    ElMessage.error('未找到认证令牌，请重新登录');
    throw new Error('未找到认证令牌');
  }

  // 进度跟踪变量
  let lastProgress = 0;

  // 构建系统提示词
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

  // 构建请求体
  const requestBody = {
    model: 'doubao-seed-1-6-thinking-250615', // 使用 think 模型
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    temperature: 0.7,
    max_tokens: 16384, // think 模型最大支持 16384
    top_p: 0.9,
    stream: true
  };

  // 使用 fetch 发起流式请求
  console.log('🚀 发送流式请求:', '/api/ai/curriculum/generate-stream');
  console.log('📦 请求体:', requestBody);

  const response = await fetch('/api/ai/curriculum/generate-stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  console.log('✅ 响应状态:', response.status, response.statusText);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');

  if (!reader) {
    console.error('❌ 无法获取响应流');
    throw new Error('无法获取响应流');
  }

  console.log('📖 开始读取流式数据...');

  let buffer = '';
  let fullContent = '';
  let charCount = 0;
  let isDone = false; // 添加标志变量来跟踪是否收到 [DONE]

  // 进度阶段
  const stages = [
    { chars: 100, progress: 20, stage: '🤔 分析课程需求...' },
    { chars: 500, progress: 40, stage: '📝 生成 HTML 结构...' },
    { chars: 1000, progress: 60, stage: '🎨 设计 CSS 样式...' },
    { chars: 1500, progress: 80, stage: '⚙️ 编写 JavaScript 交互...' },
    { chars: Infinity, progress: 95, stage: '✨ 完善课程细节...' }
  ];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      console.log('✅ 流式读取完成');
      break;
    }

    // 解码数据（持续流式解码，避免切割多字节字符）
    const chunk = decoder.decode(value, { stream: true });
    console.log('📦 收到数据块 (长度:', chunk.length, ')');

    // 累积到缓冲区
    buffer += chunk;

    // 基于标准SSE协议按事件块解析：事件以"\n\n"分隔，每个事件可包含多行 data:
    while (true) {
      let sepIndex = buffer.indexOf('\n\n');
      if (sepIndex === -1) sepIndex = buffer.indexOf('\r\n\r\n');
      if (sepIndex === -1) break; // 事件块尚未完整

      const eventBlock = buffer.slice(0, sepIndex);
      const sepSlice = buffer.slice(sepIndex, sepIndex + 4);
      const consumed = sepSlice.startsWith('\r\n') ? 4 : 2;
      buffer = buffer.slice(sepIndex + consumed);

      // 提取所有 data 行并拼接（保留行内换行）
      const lines = eventBlock.split(/\r?\n/);
      console.log('🔍 事件块行数:', lines.length, '第一行:', lines[0]?.substring(0, 50));

      const dataLines = lines
        .filter(l => /^\s*data:\s*/.test(l))
        .map(l => {
          const cleaned = l.replace(/^\s*data:\s*/, '');
          console.log('🔧 清理前:', l.substring(0, 50), '清理后:', cleaned.substring(0, 50));
          return cleaned;
        });

      if (dataLines.length === 0) {
        console.log('⚠️ 没有找到 data 行');
        continue;
      }

      // 🔧 修复: 正确处理多行 data 字段
      // 拼接所有 data 行，然后再次清理任何残留的 data: 前缀
      let normalizedPayload = dataLines.join('').trim();
      console.log('📨 拼接后:', normalizedPayload.substring(0, 100) + '...');

      // 确保完全移除所有 data: 前缀（包括可能残留的）
      while (normalizedPayload.startsWith('data:')) {
        normalizedPayload = normalizedPayload.substring(5).trim();
      }

      console.log('📨 最终数据:', normalizedPayload.substring(0, 100) + '...');

      if (normalizedPayload === '[DONE]') {
        // 流结束
        console.log('✅ 收到 [DONE] 标记');
        generationProgress.value = 100;
        generationStage.value = '✅ 课程代码生成完成！';
        isDone = true; // 设置标志
        break;
      }

      {
        // 构建候选 payload 列表：优先直接 JSON，其次按 data: 分割
        const payloads = normalizedPayload.trim().startsWith('{')
          ? [normalizedPayload]
          : normalizedPayload.split(/\n\s*data:\s*/).filter(s => s.trim().length > 0);

        for (const p of payloads) {
          try {
            const evt = JSON.parse(p.trim());

            // 🔧 调试: 打印解析后的事件类型
            console.log('🔍 解析的事件类型:', evt.type, '完整事件:', JSON.stringify(evt).substring(0, 150));

            // 处理thinking事件（实时、累积展示）
            if (evt.type === 'thinking' && typeof evt.thinking === 'string') {
              const seg = evt.thinking;
              thinkingContent.value += seg;
              // 在thinking阶段更新进度
              if (generationProgress.value < 20) {
                generationProgress.value = 10;
                generationStage.value = '🤔 AI 正在思考...';
                console.log(`📊 进度: ${generationProgress.value}% - ${generationStage.value}`);
              }
              console.log('🧠 收到thinking内容:', seg.substring(0, 100));
              continue;
            }

            // 处理内容事件
            // 后端格式: {"type":"content","content":"...","fullContent":"..."}
            // OpenAI格式: {"choices":[{"delta":{"content":"..."}}]}
            // 🔧 修复: 只处理content类型的事件,使用fullContent字段
            if (evt.type === 'content') {
              console.log('📝 收到content事件, fullContent长度:', evt.fullContent?.length || 0);
              console.log('📝 fullContent前100字符:', evt.fullContent?.substring(0, 100) || '');

              // 🔧 重要修复: 优先使用fullContent,但要处理可能被截断的情况
              if (evt.fullContent && evt.fullContent.trim().length > 0) {
                // 总是更新fullContent为最新的值(后端保证fullContent是完整的累积内容)
                // 即使新的fullContent比当前的短,也要更新(因为可能是最后一个完整的事件)
                fullContent = evt.fullContent;
                charCount = fullContent.length;
                console.log('✅ 更新fullContent, 新长度:', fullContent.length);
              } else if (evt.content) {
                // 如果没有fullContent,则累积content字段
                const content = evt.content || '';
                if (content) {
                  fullContent += content;
                  charCount += content.length;
                  console.log('✅ 累积content, 新长度:', fullContent.length);
                }
              }
            } else if (evt.choices?.[0]?.delta?.content) {
              // OpenAI格式
              const content = evt.choices[0].delta.content;
              fullContent += content;
              charCount += content.length;
            }

            // 根据字符数更新进度 - 在阶段描述中显示代码长度
            if (charCount > 0) {
              let progressUpdated = false;
              for (const stage of stages) {
                if (charCount < stage.chars) {
                  // 只有当进度需要更新时才更新
                  if (generationProgress.value < stage.progress) {
                    generationProgress.value = stage.progress;
                    generationStage.value = `${stage.stage} (已生成 ${charCount} 字符)`;
                    progressUpdated = true;
                  }
                  break;
                }
              }
              if (progressUpdated || generationProgress.value !== lastProgress) {
                console.log(`📊 进度: ${generationProgress.value}% - ${generationStage.value}`);
                lastProgress = generationProgress.value;
              }
            }
          } catch (e) {
            console.warn('⚠️ 解析单个 payload 失败:', e, '片段:', p.substring(0, 80));
            // 回退提取：即便 JSON.parse 失败，也尝试正则抽取 thinking 字段，避免界面缺失
            try {
              if (/"type"\s*:\s*"thinking"/.test(p)) {
                const m = p.match(/"thinking"\s*:\s*"(.*?)"/);
                if (m && typeof m[1] === 'string') {
                  const seg = m[1].replace(/\\"/g, '"');
                  thinkingContent.value += seg;
                  generationStage.value = '🤔 AI 正在思考...';
                  console.log('🧠(fallback) 收到thinking内容:', seg.substring(0, 100));
                  continue; // 继续处理下一个 payload
                }
              }
            } catch (ee) {
              console.warn('⚠️ 回退提取thinking失败:', ee);
            }
          }
        }
      }
    }

    // 检查是否收到 [DONE] 标记
    if (isDone) {
      console.log('🎯 检测到 [DONE] 标记，退出循环');
      break;
    }
  }

  // 解析完整内容
  console.log('🔍 完整内容长度:', fullContent.length);
  console.log('🔍 完整内容前500字符:', fullContent.substring(0, 500));
  console.log('🔍 完整内容后500字符:', fullContent.substring(fullContent.length - 500));

  // 检查是否包含关键字段
  console.log('🔍 包含 "htmlCode":', fullContent.includes('"htmlCode"'));
  console.log('🔍 包含 "cssCode":', fullContent.includes('"cssCode"'));
  console.log('🔍 包含 "jsCode":', fullContent.includes('"jsCode"'));
  console.log('🔍 包含反引号:', fullContent.includes('`'));

  let result;

  // 首先尝试标准 JSON 解析
  try {
    console.log('🔄 尝试标准 JSON 解析...');
    const jsonResult = JSON.parse(fullContent);
    if (jsonResult.htmlCode || jsonResult.cssCode || jsonResult.jsCode) {
      console.log('✅ 标准 JSON 解析成功！');
      result = {
        htmlCode: jsonResult.htmlCode || '',
        cssCode: jsonResult.cssCode || '',
        jsCode: jsonResult.jsCode || '',
        description: jsonResult.description || '课程已生成'
      };
      console.log('📊 htmlCode 长度:', result.htmlCode.length);
      console.log('📊 cssCode 长度:', result.cssCode.length);
      console.log('📊 jsCode 长度:', result.jsCode.length);
    } else {
      throw new Error('JSON 中没有找到代码字段');
    }
  } catch (jsonError) {
    console.log('⚠️ 标准 JSON 解析失败，尝试手动提取模板字符串...', jsonError);

    try {
      // 手动提取模板字符串中的内容
      // 因为AI返回的是JavaScript对象字面量格式，使用反引号包裹代码

      // 提取 htmlCode
      let htmlCode = '';
      const htmlStart = fullContent.indexOf('"htmlCode":');
      if (htmlStart !== -1) {
        const htmlValueStart = fullContent.indexOf('`', htmlStart);
        if (htmlValueStart !== -1) {
          const htmlValueEnd = fullContent.indexOf('`,', htmlValueStart + 1);
          if (htmlValueEnd !== -1) {
            htmlCode = fullContent.substring(htmlValueStart + 1, htmlValueEnd);
          }
        }
      }

      // 提取 cssCode
      let cssCode = '';
      const cssStart = fullContent.indexOf('"cssCode":');
      if (cssStart !== -1) {
        const cssValueStart = fullContent.indexOf('`', cssStart);
        if (cssValueStart !== -1) {
          const cssValueEnd = fullContent.indexOf('`,', cssValueStart + 1);
          if (cssValueEnd !== -1) {
            cssCode = fullContent.substring(cssValueStart + 1, cssValueEnd);
          }
        }
      }

      // 提取 jsCode
      let jsCode = '';
      const jsStart = fullContent.indexOf('"jsCode":');
      if (jsStart !== -1) {
        const jsValueStart = fullContent.indexOf('`', jsStart);
        if (jsValueStart !== -1) {
          const jsValueEnd = fullContent.indexOf('`,', jsValueStart + 1);
          if (jsValueEnd !== -1) {
            jsCode = fullContent.substring(jsValueStart + 1, jsValueEnd);
          } else {
            // 可能是最后一个字段，使用 `} 结尾
            const jsValueEnd2 = fullContent.indexOf('`\n}', jsValueStart + 1);
            if (jsValueEnd2 !== -1) {
              jsCode = fullContent.substring(jsValueStart + 1, jsValueEnd2);
            }
          }
        }
      }

      // 提取 description
      let description = '课程已生成';
      const descStart = fullContent.indexOf('"description":');
      if (descStart !== -1) {
        const descValueStart = fullContent.indexOf('"', descStart + 14);
        if (descValueStart !== -1) {
          const descValueEnd = fullContent.indexOf('"', descValueStart + 1);
          if (descValueEnd !== -1) {
            description = fullContent.substring(descValueStart + 1, descValueEnd);
          }
        }
      }

      result = {
        htmlCode,
        cssCode,
        jsCode,
        description
      };

      console.log('✅ 手动解析成功');
      console.log('📊 htmlCode 长度:', htmlCode.length);
      console.log('📊 cssCode 长度:', cssCode.length);
      console.log('📊 jsCode 长度:', jsCode.length);
      console.log('📊 description:', description);

    } catch (manualParseError) {
      console.error('❌ 手动解析也失败:', manualParseError);
      console.error('❌ 将使用 fullContent 作为 htmlCode');
      result = {
        htmlCode: fullContent,
        cssCode: '',
        jsCode: '',
        description: '课程已生成'
      };
    }
  }

  // 确保进度达到100%
  generationProgress.value = 100;
  generationStage.value = '✅ 课程代码生成完成！';

  // 添加 AI 响应消息
  messages.value.push({
    role: 'assistant',
    content: '✅ 课程生成成功！正在加载预览...'
  });

  // 等待一下让用户看到100%
  await new Promise(resolve => setTimeout(resolve, 500));

  // 发送生成的代码
  console.log('🚀 准备发送 generate 事件:');
  console.log('  - htmlCode 长度:', result.htmlCode?.length || 0);
  console.log('  - cssCode 长度:', result.cssCode?.length || 0);
  console.log('  - jsCode 长度:', result.jsCode?.length || 0);
  console.log('  - description:', result.description);
  console.log('  - htmlCode 前100字符:', result.htmlCode?.substring(0, 100));

  emit('generate', {
    htmlCode: result.htmlCode,
    cssCode: result.cssCode,
    jsCode: result.jsCode,
    description: result.description
  });

  console.log('✅ generate 事件已发送');
}
</script>

<style scoped lang="scss">
.ai-curriculum-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border-radius: var(--text-sm);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-overflow: ellipsis; white-space: nowrap;
  box-shadow: var(--shadow-xl);

  .assistant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--text-lg);
    background: var(--bg-overlay);
    border-bottom: 1px solid var(--border-color-light);
    color: var(--text-on-primary);

    .header-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 600;
      font-size: var(--text-lg);

      .icon {
        font-size: var(--text-2xl);
      }
    }
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--text-lg);
    display: flex;
    flex-direction: column;
    gap: var(--text-sm);

    .message {
      display: flex;
      gap: var(--spacing-sm);
      animation: slideIn 0.3s ease-out;

      &.user {
        justify-content: flex-end;

        .message-avatar {
          order: 2;
        }

        .message-content {
          order: 1;
          background: var(--bg-card);
          color: var(--text-primary);
          border-radius: var(--text-sm) var(--spacing-xs) var(--text-sm) var(--text-sm);
        }
      }

      &.assistant {
        justify-content: flex-start;

        .message-avatar {
          order: 1;
        }

        .message-content {
          order: 2;
          background: var(--bg-overlay);
          color: var(--text-on-primary);
          border-radius: var(--spacing-xs) var(--text-sm) var(--text-sm) var(--text-sm);
        }
      }

      .message-avatar {
        width: var(--spacing-3xl);
        height: var(--spacing-3xl);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-overlay);
        flex-shrink: 0;

        .el-icon {
          font-size: var(--text-xl);
          color: var(--text-on-primary);
        }
      }

      .message-content {
        max-width: 70%;
        padding: var(--spacing-2xl) var(--text-base);
        word-break: break-word;
        line-height: 1.5;

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
      gap: var(--text-lg);
      padding: var(--text-2xl);
      background: var(--bg-overlay);
      border-radius: var(--text-sm);
      animation: slideIn 0.3s ease-out;

      .loading-animation {
        width: 100%;
        max-width: 100%; max-width: 400px;
        background: var(--bg-overlay);
        border-radius: var(--spacing-sm);
        padding: var(--text-lg);

        .code-lines {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);

          .code-line {
            display: flex;
            align-items: center;
            gap: var(--text-sm);
            opacity: 0;
            animation: fadeInLine 0.5s ease-out forwards;

            .line-number {
              color: var(--white-alpha-40);
              font-family: 'Courier New', monospace;
              font-size: var(--text-sm);
              min-width: var(--text-2xl);
            }

            .line-content {
              flex: 1;
              height: var(--spacing-sm);
              background: linear-gradient(90deg,
                rgba(102, 126, 234, 0.6) 0%,
                rgba(118, 75, 162, 0.6) 100%);
              border-radius: var(--spacing-xs);
              animation: pulse 1.5s ease-in-out infinite;
            }
          }
        }
      }

      .loading-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--text-sm);

        .loading-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          color: white;
          font-size: var(--text-base);
          font-weight: 500;

          .el-icon {
            font-size: var(--text-xl);
          }
        }

        .thinking-content {
          width: 100%;
          background: rgba(138, 43, 226, 0.15);
          border: var(--border-width-base) solid rgba(138, 43, 226, 0.3);
          border-radius: var(--spacing-sm);
          padding: var(--text-sm);
          margin: var(--spacing-sm) 0;
          animation: fadeIn 0.3s ease-out;

          .thinking-label {
            display: flex;
            align-items: center;
            gap: var(--spacing-lg);
            color: var(--accent-color);
            font-size: var(--text-sm);
            font-weight: 600;
            margin-bottom: var(--spacing-sm);

            .el-icon {
              font-size: var(--text-lg);
              animation: pulse 2s ease-in-out infinite;
            }
          }

          .thinking-text {
            color: var(--white-alpha-90);
            font-size: var(--text-sm);
            line-height: 1.6;
            max-min-height: 60px; height: auto;
            overflow-y: auto;
            padding: var(--spacing-xs);

            /* 自定义滚动条 */
            &::-webkit-scrollbar {
              width: var(--spacing-xs);
            }

            &::-webkit-scrollbar-track {
              background: var(--white-alpha-10);
              border-radius: var(--radius-xs);
            }

            &::-webkit-scrollbar-thumb {
              background: rgba(192, 132, 252, 0.5);
              border-radius: var(--radius-xs);

              &:hover {
                background: rgba(192, 132, 252, 0.7);
              }
            }
          }
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: var(--text-sm);

          .progress-bar {
            flex: 1;
            min-height: 32px; height: auto;
            background: var(--white-alpha-20);
            border-radius: var(--radius-xs);
            overflow: hidden;

            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, var(--success-color), var(--success-color));
              border-radius: var(--radius-xs);
              transition: width 0.3s ease;
              box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
            }
          }

          .progress-text {
            color: white;
            font-size: var(--text-sm);
            font-weight: 600;
            min-width: auto;
            text-align: right;
          }
        }
      }
    }
  }

  .input-area {
    padding: var(--text-lg);
    background: var(--white-alpha-10);
    border-top: 1px solid var(--white-alpha-20);

    :deep(.el-textarea__inner) {
      background: var(--white-alpha-90);
      color: var(--text-primary);
      border: none;
      border-radius: var(--spacing-sm);
      resize: none;

      &::placeholder {
        color: var(--text-placeholder);
      }
    }

    .input-controls {
      display: flex;
      gap: var(--spacing-sm);
      margin-top: var(--text-sm);

      :deep(.el-select) {
        .el-input__wrapper {
          background: var(--white-alpha-90);
          border: none;
          border-radius: var(--radius-md);
        }
      }

      .el-button {
        flex: 1;
        background: var(--white-alpha-90);
        color: var(--primary-color);
        border: none;
        border-radius: var(--radius-md);
        font-weight: 600;

        &:hover {
          background: white;
        }
      }
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(var(--z-index-sticky));
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
    transform: translateX(var(--position-negative-2xl));
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
</style>

