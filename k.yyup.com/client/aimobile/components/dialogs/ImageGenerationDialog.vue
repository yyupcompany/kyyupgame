<template>
  <div v-if="visible" class="dialog-overlay" @click="handleOverlayClick">
    <div class="image-generation-dialog" @click.stop>
      <!-- 对话框头部 -->
      <div class="dialog-header">
        <div class="header-icon">🎨</div>
        <div class="header-content">
          <h3 class="dialog-title">AI智能生成海报</h3>
          <p class="dialog-subtitle">自定义提示词，生成专属活动海报</p>
        </div>
        <div class="close-btn" @click="handleClose">×</div>
      </div>

      <!-- 提示词编辑区 -->
      <div class="prompt-section">
        <label class="section-label">生成提示词</label>
        <textarea
          v-model="localPrompt"
          class="prompt-textarea"
          placeholder="描述你想要的海报风格和内容..."
          rows="4"
          maxlength="500"
        ></textarea>
        <div class="char-count">{{ localPrompt.length }}/500</div>
        
        <!-- 智能建议标签 -->
        <div class="smart-suggestions">
          <span class="suggestions-label">智能建议:</span>
          <div class="suggestion-tags">
            <div
              v-for="suggestion in suggestions"
              :key="suggestion"
              class="suggestion-tag"
              @click="addSuggestion(suggestion)"
            >
              {{ suggestion }}
            </div>
          </div>
        </div>
      </div>

      <!-- 样式配置 -->
      <div class="style-config">
        <div class="config-row">
          <label class="config-label">图片风格</label>
          <div class="style-options">
            <div
              v-for="styleOption in styleOptions"
              :key="styleOption.value"
              class="style-option"
              :class="{ active: localStyle === styleOption.value }"
              @click="localStyle = styleOption.value"
            >
              <div class="style-icon">{{ styleOption.icon }}</div>
              <div class="style-name">{{ styleOption.label }}</div>
            </div>
          </div>
        </div>
        
        <div class="config-row">
          <label class="config-label">图片尺寸</label>
          <div class="size-options">
            <div
              v-for="sizeOption in sizeOptions"
              :key="sizeOption.value"
              class="size-option"
              :class="{ active: localSize === sizeOption.value }"
              @click="localSize = sizeOption.value"
            >
              <div class="size-preview" :style="sizeOption.previewStyle"></div>
              <div class="size-name">{{ sizeOption.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 生成结果展示 -->
      <div v-if="generatedImage" class="result-section">
        <label class="section-label">生成结果</label>
        <div class="image-preview">
          <img :src="generatedImage" alt="生成的海报" class="generated-image" />
          <div class="image-overlay">
            <div class="image-actions">
              <button class="action-btn secondary" @click="regenerate">
                <span class="btn-icon">🔄</span>
                重新生成
              </button>
              <button class="action-btn primary" @click="confirmImage">
                <span class="btn-icon">✅</span>
                使用这张
              </button>
            </div>
          </div>
        </div>
        
        <!-- 生成信息 -->
        <div v-if="generationMetadata" class="generation-info">
          <div class="info-item">
            <span class="info-label">生成时间:</span>
            <span class="info-value">{{ formatDuration(generationMetadata.duration) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">使用模型:</span>
            <span class="info-value">{{ generationMetadata.model }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="dialog-actions">
        <button class="action-btn secondary" @click="handleClose" :disabled="generating">
          取消
        </button>
        <button 
          class="action-btn primary" 
          @click="startGeneration"
          :disabled="!localPrompt.trim() || generating"
        >
          <span v-if="generating" class="loading-spinner"></span>
          <span class="btn-text">
            {{ generating ? '生成中...' : '开始生成' }}
          </span>
        </button>
      </div>

      <!-- 生成进度 -->
      <div v-if="generating" class="generation-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <p class="progress-text">{{ progressText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { request } from '@/utils/request';

// Props
interface Props {
  visible: boolean;
  prompt?: string;
  style?: string;
  size?: string;
  activityData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  prompt: '',
  style: 'cartoon',
  size: '1024x768',
  activityData: null
});

// Emits
interface Emits {
  (e: 'close'): void;
  (e: 'confirm', data: { imageUrl: string; metadata: any }): void;
}

const emit = defineEmits<Emits>();

// Reactive data
const localPrompt = ref('');
const localStyle = ref('cartoon');
const localSize = ref('1024x768');
const generating = ref(false);
const generatedImage = ref('');
const generationMetadata = ref<any>(null);
const progressPercentage = ref(0);
const progressText = ref('');

// 样式选项
const styleOptions = [
  { value: 'cartoon', label: '卡通风格', icon: '🎨' },
  { value: 'natural', label: '自然风格', icon: '🌿' },
  { value: 'artistic', label: '艺术风格', icon: '✨' }
];

// 尺寸选项
const sizeOptions = [
  { 
    value: '1024x1024', 
    label: '方形海报', 
    previewStyle: { width: '2var(--spacing-xs)', height: '2var(--spacing-xs)' }
  },
  { 
    value: '1024x768', 
    label: '横版海报', 
    previewStyle: { width: 'var(--spacing-xl)', height: '2var(--spacing-xs)' }
  },
  { 
    value: '768x1024', 
    label: '竖版海报', 
    previewStyle: { width: '2var(--spacing-xs)', height: 'var(--spacing-xl)' }
  }
];

// 智能建议
const suggestions = computed(() => {
  const baseSuggestions = ['温馨卡通', '自然场景', '节日氛围', '亲子互动'];
  
  if (props.activityData?.activityType) {
    const typeSuggestions = {
      1: ['开放日展示', '参观环境'],
      2: ['家长会议', '沟通交流'],
      3: ['亲子游戏', '欢声笑语'],
      4: ['招生宣讲', '教育理念'],
      5: ['校园参观', '设施展示'],
      6: ['特色活动', '创意设计']
    };
    
    const typeSpecific = typeSuggestions[props.activityData.activityType] || [];
    return [...baseSuggestions, ...typeSpecific];
  }
  
  return baseSuggestions;
});

// 监听 props 变化
watch(() => props.visible, (visible) => {
  if (visible) {
    initializeForm();
  } else {
    resetForm();
  }
});

watch(() => props.prompt, (newPrompt) => {
  localPrompt.value = newPrompt || '';
});

// 方法
const initializeForm = () => {
  localPrompt.value = props.prompt || '';
  localStyle.value = props.style || 'cartoon';
  localSize.value = props.size || '1024x768';
  
  // 如果没有提供提示词，根据活动数据生成智能提示词
  if (!localPrompt.value && props.activityData) {
    localPrompt.value = generateSmartPrompt();
  }
};

const generateSmartPrompt = () => {
  const { title = '幼儿园活动', description = '', location = '幼儿园' } = props.activityData;
  
  let prompt = `3-6岁幼儿园${title}活动场景`;
  
  if (description) {
    prompt += `，${description}`;
  }
  
  if (location && location !== '幼儿园') {
    prompt += `，地点在${location}`;
  }
  
  prompt += '，孩子们天真可爱的笑容，温馨安全的幼儿园环境，色彩鲜艳温馨，卡通可爱风格，充满童趣';
  
  return prompt;
};

const addSuggestion = (suggestion: string) => {
  if (!localPrompt.value.includes(suggestion)) {
    localPrompt.value = localPrompt.value.trim() 
      ? `${localPrompt.value}，${suggestion}`
      : suggestion;
  }
};

const startGeneration = async () => {
  if (!localPrompt.value.trim()) return;
  
  generating.value = true;
  progressPercentage.value = 0;
  progressText.value = '正在准备生成...';
  
  // 模拟进度更新
  const progressInterval = setInterval(() => {
    if (progressPercentage.value < 90) {
      progressPercentage.value += Math.random() * 10;
      updateProgressText();
    }
  }, 500);
  
  try {
    const response = await request.post('/api/ai/generate-activity-image', {
      prompt: localPrompt.value,
      style: localStyle.value,
      size: localSize.value,
      category: 'activity',
      activityData: props.activityData
    });
    
    clearInterval(progressInterval);
    progressPercentage.value = 100;
    progressText.value = '生成完成！';
    
    if (response.data.success) {
      generatedImage.value = response.data.data.imageUrl;
      generationMetadata.value = response.data.data.metadata;
      
      setTimeout(() => {
        generating.value = false;
      }, 500);
    } else {
      throw new Error(response.data.message || '图片生成失败');
    }
    
  } catch (error) {
    clearInterval(progressInterval);
    generating.value = false;
    progressPercentage.value = 0;
    
    console.error('图片生成失败:', error);
    
    // 这里应该显示错误提示，暂时用 alert 代替
    alert(`图片生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

const updateProgressText = () => {
  const texts = [
    'AI正在分析提示词...',
    '正在生成创意构思...',
    '绘制画面元素中...',
    '调整色彩和细节...',
    '即将完成...'
  ];
  
  const index = Math.floor((progressPercentage.value / 100) * texts.length);
  progressText.value = texts[Math.min(index, texts.length - 1)];
};

const regenerate = () => {
  generatedImage.value = '';
  generationMetadata.value = null;
  startGeneration();
};

const confirmImage = () => {
  if (generatedImage.value) {
    emit('confirm', {
      imageUrl: generatedImage.value,
      metadata: generationMetadata.value
    });
  }
};

const handleClose = () => {
  if (!generating.value) {
    emit('close');
  }
};

const handleOverlayClick = () => {
  if (!generating.value) {
    emit('close');
  }
};

const resetForm = () => {
  generatedImage.value = '';
  generationMetadata.value = null;
  progressPercentage.value = 0;
  progressText.value = '';
};

const formatDuration = (duration: number) => {
  return `${(duration / 1000).toFixed(1)}秒`;
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.image-generation-dialog {
  background: var(--bg-card);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: var(--border-width-base) solid #f0f0f0;
  position: relative;
}

.header-icon {
  font-size: var(--spacing-xl);
  margin-right: 12px;
}

.header-content {
  flex: 1;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 var(--spacing-xs) 0;
}

.dialog-subtitle {
  font-size: 1var(--spacing-xs);
  color: #666;
  margin: 0;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: var(--spacing-xl);
  height: var(--spacing-xl);
  border-radius: var(--spacing-md);
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.prompt-section {
  padding: 20px;
  border-bottom: var(--border-width-base) solid #f0f0f0;
}

.section-label {
  display: block;
  font-size: var(--spacing-md);
  font-weight: 500;
  color: #333;
  margin-bottom: var(--spacing-sm);
}

.prompt-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1var(--spacing-xs);
  line-height: 1.5;
  color: #333;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.prompt-textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.prompt-textarea::placeholder {
  color: #999;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: var(--spacing-xs);
}

.smart-suggestions {
  margin-top: 12px;
}

.suggestions-label {
  font-size: 1var(--spacing-xs);
  color: #666;
  margin-bottom: var(--spacing-sm);
  display: block;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.suggestion-tag {
  padding: 6px 12px;
  background: #f0f9ff;
  border: var(--border-width-base) solid #b3d9ff;
  border-radius: var(--spacing-md);
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-tag:hover {
  background: #e6f3ff;
  border-color: #66ccff;
}

.style-config {
  padding: 20px;
  border-bottom: var(--border-width-base) solid #f0f0f0;
}

.config-row {
  margin-bottom: 20px;
}

.config-row:last-child {
  margin-bottom: 0;
}

.config-label {
  display: block;
  font-size: var(--spacing-md);
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.style-options {
  display: flex;
  gap: 12px;
}

.style-option {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-sm);
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.style-option.active {
  border-color: #1890ff;
  background: #f0f9ff;
}

.style-icon {
  font-size: 2var(--spacing-xs);
  margin-bottom: 6px;
}

.style-name {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.style-option.active .style-name {
  color: #1890ff;
}

.size-options {
  display: flex;
  gap: 12px;
}

.size-option {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-sm);
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.size-option.active {
  border-color: #1890ff;
  background: #f0f9ff;
}

.size-preview {
  background: #ccc;
  border-radius: 2px;
  margin: 0 auto var(--spacing-sm) auto;
}

.size-name {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.size-option.active .size-name {
  color: #1890ff;
}

.result-section {
  padding: 20px;
  border-bottom: var(--border-width-base) solid #f0f0f0;
}

.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 12px;
}

.generated-image {
  width: 100%;
  height: auto;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: 12px;
}

.generation-info {
  background: #f9f9f9;
  border-radius: var(--spacing-sm);
  padding: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 12px;
  color: #666;
}

.info-value {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
}

.action-btn {
  flex: 1;
  height: 4var(--spacing-sm);
  border-radius: 12px;
  border: none;
  font-size: var(--spacing-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.action-btn.secondary:hover {
  background: #e0e0e0;
  color: #333;
}

.action-btn.primary {
  background: #1890ff;
  color: white;
}

.action-btn.primary:hover {
  background: #40a9ff;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: var(--spacing-md);
  height: var(--spacing-md);
  border: 2px solid var(--glass-bg-heavy);
  border-top: 2px solid white;
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.generation-progress {
  padding: 0 20px 20px 20px;
}

.progress-bar {
  width: 100%;
  height: var(--spacing-xs);
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.progress-text {
  text-align: center;
  font-size: 1var(--spacing-xs);
  color: #666;
  margin: 0;
}

.btn-icon {
  font-size: 1var(--spacing-xs);
}

.btn-text {
  font-size: var(--spacing-md);
}
</style>