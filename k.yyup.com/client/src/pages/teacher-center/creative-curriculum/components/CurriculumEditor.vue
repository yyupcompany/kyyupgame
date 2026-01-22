<template>
  <div class="curriculum-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="editableName"
          placeholder="课程名称"
          class="name-input"
        />
        <el-tag type="info">{{ slideCount }} 页</el-tag>
      </div>
      <div class="toolbar-center">
        <el-button-group>
          <el-button 
            :type="currentMode === 'edit' ? 'primary' : 'default'"
            @click="currentMode = 'edit'"
          >
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button 
            :type="currentMode === 'preview' ? 'primary' : 'default'"
            @click="currentMode = 'preview'"
          >
            <el-icon><View /></el-icon>
            预览
          </el-button>
        </el-button-group>
      </div>
      <div class="toolbar-right">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveCurriculum">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </div>
    </div>

    <!-- 编辑区域 -->
    <div class="editor-main" v-if="currentMode === 'edit'">
      <!-- 左侧：页面列表 -->
      <div class="slides-panel">
        <div class="panel-header">
          <span>📄 页面列表</span>
          <el-button size="small" type="primary" text @click="addSlide">
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
        </div>
        <div class="slides-list">
          <div
            v-for="(slide, index) in editableSlides"
            :key="slide.id"
            class="slide-thumb"
            :class="{ active: currentSlideIndex === index }"
            @click="selectSlide(index)"
          >
            <div class="thumb-number">{{ index + 1 }}</div>
            <div class="thumb-content">
              <div class="thumb-type">{{ getSlideTypeLabel(slide.type) }}</div>
              <div class="thumb-title">{{ getSlideTitle(slide) }}</div>
            </div>
            <el-dropdown trigger="click" @command="(cmd: string) => handleSlideAction(cmd, index)">
              <el-button text size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="moveUp" :disabled="index === 0">
                    <el-icon><Top /></el-icon>
                    上移
                  </el-dropdown-item>
                  <el-dropdown-item command="moveDown" :disabled="index === editableSlides.length - 1">
                    <el-icon><Bottom /></el-icon>
                    下移
                  </el-dropdown-item>
                  <el-dropdown-item command="duplicate">
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- 中间：幻灯片预览 -->
      <div class="slide-preview-panel">
        <div class="preview-container">
          <div class="preview-slide" v-if="currentSlide">
            <A2UISlide
              :slide="currentSlide"
              :index="currentSlideIndex"
              :is-active="true"
              theme="colorful"
            />
          </div>
        </div>
      </div>

      <!-- 右侧：属性面板 -->
      <div class="properties-panel">
        <div class="panel-header">
          <span>📝 属性设置</span>
        </div>
        <div class="properties-content" v-if="currentSlide">
          <!-- 页面类型 -->
          <el-form label-position="top" size="small">
            <el-form-item label="页面类型">
              <el-select v-model="currentSlide.type" @change="handleTypeChange">
                <el-option label="标题页" value="title" />
                <el-option label="内容页" value="content" />
                <el-option label="互动页" value="activity" />
                <el-option label="媒体页" value="media" />
                <el-option label="总结页" value="summary" />
              </el-select>
            </el-form-item>

            <!-- 背景设置 -->
            <el-form-item label="背景类型">
              <el-select v-model="backgroundType">
                <el-option label="纯色" value="color" />
                <el-option label="渐变" value="gradient" />
                <el-option label="图片" value="image" />
              </el-select>
            </el-form-item>

            <el-divider content-position="left">组件设置</el-divider>

            <!-- 根据页面类型显示不同的组件编辑器 -->
            <template v-if="currentSlide.type === 'title'">
              <el-form-item label="课程标题">
                <el-input v-model="titleText" placeholder="输入课程标题" />
              </el-form-item>
              <el-form-item label="副标题">
                <el-input v-model="subtitleText" placeholder="输入副标题" />
              </el-form-item>
            </template>

            <template v-else-if="currentSlide.type === 'activity'">
              <el-form-item label="活动类型">
                <el-select v-model="activityType">
                  <el-option label="选择题" value="choice-question" />
                  <el-option label="拖拽排序" value="drag-sort" />
                </el-select>
              </el-form-item>
              <el-form-item label="活动标题">
                <el-input v-model="activityTitle" placeholder="输入活动标题" />
              </el-form-item>
              <el-form-item label="分值">
                <el-input-number v-model="activityPoints" :min="5" :max="50" :step="5" />
              </el-form-item>
            </template>
          </el-form>
        </div>

        <!-- AI对话编辑区 -->
        <div class="ai-chat-panel">
          <div class="chat-header">
            <el-icon><ChatDotRound /></el-icon>
            <span>AI助手编辑</span>
          </div>
          <div class="chat-messages" ref="chatMessagesRef">
            <div 
              v-for="msg in chatMessages" 
              :key="msg.id"
              class="chat-message"
              :class="msg.role"
            >
              <div class="message-content">{{ msg.content }}</div>
            </div>
          </div>
          <div class="chat-input">
            <el-input
              v-model="chatInput"
              type="textarea"
              :rows="2"
              placeholder="输入修改需求，如：把第3页的问题改成..."
              @keyup.enter.ctrl="sendChatMessage"
            />
            <el-button type="primary" :loading="chatLoading" @click="sendChatMessage">
              发送
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览模式 -->
    <div class="preview-main" v-else>
      <A2UISlideshow
        ref="slideshowRef"
        :slides="editableSlides"
        theme="colorful"
        @change="handleSlideChange"
      />
    </div>

    <!-- 原始提示词查看 -->
    <el-drawer
      v-model="showPromptDrawer"
      title="原始生成提示词"
      direction="rtl"
      size="40%"
    >
      <pre class="prompt-content">{{ curriculum?.originalPrompt || '暂无提示词记录' }}</pre>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Edit, View, Check, Plus, Delete, MoreFilled, 
  Top, Bottom, CopyDocument, ChatDotRound
} from '@element-plus/icons-vue';
import A2UISlide from '@/components/a2ui/components/slideshow/A2UISlide.vue';
import A2UISlideshow from '@/components/a2ui/components/slideshow/A2UISlideshow.vue';
import { request } from '@/utils/request';

interface SlideData {
  id: string;
  type: string;
  layout?: any;
  components?: any[];
  background?: any;
}

interface CurriculumData {
  id?: number;
  name: string;
  slides: SlideData[];
  originalPrompt?: string;
  themeConfig?: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  curriculum: CurriculumData | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'save', data: CurriculumData): void;
  (e: 'cancel'): void;
}>();

// 状态
const currentMode = ref<'edit' | 'preview'>('edit');
const currentSlideIndex = ref(0);
const editableName = ref('');
const editableSlides = ref<SlideData[]>([]);
const saving = ref(false);
const showPromptDrawer = ref(false);

// AI对话状态
const chatMessages = ref<ChatMessage[]>([]);
const chatInput = ref('');
const chatLoading = ref(false);
const chatMessagesRef = ref<HTMLElement | null>(null);

// 初始化
watch(() => props.curriculum, (newVal) => {
  if (newVal) {
    editableName.value = newVal.name || '';
    editableSlides.value = JSON.parse(JSON.stringify(newVal.slides || []));
    
    // 添加欢迎消息
    if (chatMessages.value.length === 0) {
      chatMessages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '您好！我可以帮助您修改课件内容。请告诉我您想要修改什么，例如：\n• 修改某一页的标题\n• 更改选择题的选项\n• 调整页面顺序\n• 添加新的活动页面'
      });
    }
  }
}, { immediate: true });

// 计算属性
const slideCount = computed(() => editableSlides.value.length);
const currentSlide = computed(() => editableSlides.value[currentSlideIndex.value]);

// 背景类型
const backgroundType = computed({
  get: () => currentSlide.value?.background?.type || 'gradient',
  set: (val) => {
    if (currentSlide.value) {
      currentSlide.value.background = { type: val, value: getDefaultBackground(val) };
    }
  }
});

// 标题页属性
const titleText = computed({
  get: () => {
    const titleComp = currentSlide.value?.components?.find(c => c.type === 'title');
    return titleComp?.props?.text || '';
  },
  set: (val) => {
    const titleComp = currentSlide.value?.components?.find(c => c.type === 'title');
    if (titleComp) {
      titleComp.props = { ...titleComp.props, text: val };
    }
  }
});

const subtitleText = computed({
  get: () => {
    const titleComp = currentSlide.value?.components?.find(c => c.type === 'title');
    return titleComp?.props?.subtitle || '';
  },
  set: (val) => {
    const titleComp = currentSlide.value?.components?.find(c => c.type === 'title');
    if (titleComp) {
      titleComp.props = { ...titleComp.props, subtitle: val };
    }
  }
});

// 互动页属性
const activityType = computed({
  get: () => {
    const activityComp = currentSlide.value?.components?.find(
      c => c.type === 'choice-question' || c.type === 'drag-sort'
    );
    return activityComp?.type || 'choice-question';
  },
  set: () => {
    // 更改活动类型需要重新创建组件
  }
});

const activityTitle = computed({
  get: () => {
    const activityComp = currentSlide.value?.components?.find(
      c => c.type === 'choice-question' || c.type === 'drag-sort'
    );
    return activityComp?.props?.title || '';
  },
  set: (val) => {
    const activityComp = currentSlide.value?.components?.find(
      c => c.type === 'choice-question' || c.type === 'drag-sort'
    );
    if (activityComp) {
      activityComp.props = { ...activityComp.props, title: val };
    }
  }
});

const activityPoints = computed({
  get: () => {
    const activityComp = currentSlide.value?.components?.find(
      c => c.type === 'choice-question' || c.type === 'drag-sort'
    );
    return activityComp?.props?.points || 10;
  },
  set: (val) => {
    const activityComp = currentSlide.value?.components?.find(
      c => c.type === 'choice-question' || c.type === 'drag-sort'
    );
    if (activityComp) {
      activityComp.props = { ...activityComp.props, points: val };
    }
  }
});

// 方法
function getDefaultBackground(type: string): string {
  switch (type) {
    case 'color':
      return '#f5f7fa';
    case 'gradient':
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    case 'image':
      return '';
    default:
      return '#f5f7fa';
  }
}

function getSlideTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    title: '📄 标题页',
    content: '📚 内容页',
    activity: '🎮 互动页',
    media: '🖼️ 媒体页',
    summary: '🎉 总结页'
  };
  return labels[type] || type;
}

function getSlideTitle(slide: SlideData): string {
  const titleComp = slide.components?.find(c => c.type === 'title');
  if (titleComp?.props?.text) return titleComp.props.text;
  
  const choiceComp = slide.components?.find(c => c.type === 'choice-question');
  if (choiceComp?.props?.title) return choiceComp.props.title;
  
  const dragComp = slide.components?.find(c => c.type === 'drag-sort');
  if (dragComp?.props?.title) return dragComp.props.title;
  
  return '未命名页面';
}

function selectSlide(index: number) {
  currentSlideIndex.value = index;
}

function addSlide() {
  const newSlide: SlideData = {
    id: `slide-${Date.now()}`,
    type: 'content',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%)'
    },
    components: [
      {
        type: 'text',
        id: `text-${Date.now()}`,
        props: {
          title: '新页面标题',
          content: '在这里添加内容...'
        }
      }
    ]
  };
  
  editableSlides.value.push(newSlide);
  currentSlideIndex.value = editableSlides.value.length - 1;
  ElMessage.success('已添加新页面');
}

function handleSlideAction(command: string, index: number) {
  switch (command) {
    case 'moveUp':
      if (index > 0) {
        const temp = editableSlides.value[index];
        editableSlides.value[index] = editableSlides.value[index - 1];
        editableSlides.value[index - 1] = temp;
        currentSlideIndex.value = index - 1;
      }
      break;
    case 'moveDown':
      if (index < editableSlides.value.length - 1) {
        const temp = editableSlides.value[index];
        editableSlides.value[index] = editableSlides.value[index + 1];
        editableSlides.value[index + 1] = temp;
        currentSlideIndex.value = index + 1;
      }
      break;
    case 'duplicate':
      const copy = JSON.parse(JSON.stringify(editableSlides.value[index]));
      copy.id = `slide-${Date.now()}`;
      editableSlides.value.splice(index + 1, 0, copy);
      currentSlideIndex.value = index + 1;
      ElMessage.success('页面已复制');
      break;
    case 'delete':
      if (editableSlides.value.length <= 1) {
        ElMessage.warning('至少保留一个页面');
        return;
      }
      ElMessageBox.confirm('确定删除此页面吗？', '确认删除', {
        type: 'warning'
      }).then(() => {
        editableSlides.value.splice(index, 1);
        if (currentSlideIndex.value >= editableSlides.value.length) {
          currentSlideIndex.value = editableSlides.value.length - 1;
        }
        ElMessage.success('页面已删除');
      }).catch(() => {});
      break;
  }
}

function handleTypeChange() {
  // 切换页面类型时重置组件
}

function handleSlideChange(index: number) {
  currentSlideIndex.value = index;
}

async function sendChatMessage() {
  if (!chatInput.value.trim() || chatLoading.value) return;
  
  const userMessage = chatInput.value.trim();
  chatMessages.value.push({
    id: crypto.randomUUID(),
    role: 'user',
    content: userMessage
  });
  chatInput.value = '';
  
  // 滚动到底部
  await nextTick();
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
  
  chatLoading.value = true;
  
  try {
    // 调用AI编辑接口
    const response = await request.post('/ai/curriculum-edit', {
      curriculum: {
        name: editableName.value,
        slides: editableSlides.value
      },
      editRequest: userMessage
    });
    
    if (response.data?.success && response.data?.data) {
      // 应用AI返回的修改
      if (response.data.data.slides) {
        editableSlides.value = response.data.data.slides;
      }
      if (response.data.data.name) {
        editableName.value = response.data.data.name;
      }
      
      chatMessages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.data.data.message || '已完成修改，请查看课件变化。'
      });
    } else {
      chatMessages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '抱歉，我没能理解您的需求。请尝试更具体地描述您想要的修改。'
      });
    }
  } catch (error) {
    console.error('AI编辑失败:', error);
    chatMessages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '抱歉，处理您的请求时出现了问题。请稍后重试。'
    });
  } finally {
    chatLoading.value = false;
    
    // 滚动到底部
    await nextTick();
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  }
}

async function saveCurriculum() {
  if (!editableName.value.trim()) {
    ElMessage.warning('请输入课程名称');
    return;
  }
  
  saving.value = true;
  
  try {
    const data: CurriculumData = {
      id: props.curriculum?.id,
      name: editableName.value,
      slides: editableSlides.value,
      originalPrompt: props.curriculum?.originalPrompt,
      themeConfig: props.curriculum?.themeConfig
    };
    
    emit('save', data);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped lang="scss">
.curriculum-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f2f5;
}

// 工具栏
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  
  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .name-input {
      width: 300px;
    }
  }
  
  .toolbar-right {
    display: flex;
    gap: 12px;
  }
}

// 编辑主区域
.editor-main {
  flex: 1;
  display: grid;
  grid-template-columns: 220px 1fr 320px;
  gap: 0;
  overflow: hidden;
}

// 页面列表面板
.slides-panel {
  background: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 600;
  }
  
  .slides-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  
  .slide-thumb {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #f5f7fa;
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      border-color: #667eea;
      background: #f5f7ff;
    }
    
    &.active {
      border-color: #667eea;
      background: linear-gradient(135deg, #f5f7ff 0%, #ede9fe 100%);
    }
    
    .thumb-number {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #667eea;
      color: #ffffff;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
    }
    
    .thumb-content {
      flex: 1;
      min-width: 0;
      
      .thumb-type {
        font-size: 11px;
        color: #999;
      }
      
      .thumb-title {
        font-size: 13px;
        font-weight: 500;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

// 预览面板
.slide-preview-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .preview-container {
    width: 100%;
    max-width: 960px;
    aspect-ratio: 16 / 9;
    
    .preview-slide {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
  }
}

// 属性面板
.properties-panel {
  background: #ffffff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 600;
  }
  
  .properties-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }
}

// AI对话面板
.ai-chat-panel {
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  max-height: 300px;
  
  .chat-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    font-weight: 600;
  }
  
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    background: #f5f7fa;
    
    .chat-message {
      margin-bottom: 12px;
      
      &.user .message-content {
        background: #667eea;
        color: #ffffff;
        margin-left: 40px;
        border-radius: 12px 12px 0 12px;
      }
      
      &.assistant .message-content {
        background: #ffffff;
        color: #333;
        margin-right: 40px;
        border-radius: 12px 12px 12px 0;
        white-space: pre-wrap;
      }
      
      .message-content {
        padding: 10px 14px;
        font-size: 13px;
        line-height: 1.5;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  .chat-input {
    display: flex;
    gap: 8px;
    padding: 12px;
    background: #ffffff;
    border-top: 1px solid #e4e7ed;
    
    :deep(.el-textarea) {
      flex: 1;
    }
  }
}

// 预览模式
.preview-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
}

// 提示词内容
.prompt-content {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.6;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}
</style>
