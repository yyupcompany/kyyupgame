<template>
  <div class="a2ui-renderer" :class="{ 'fullscreen': isFullscreen }">
    <!-- 加载状态 -->
    <div v-if="loading" class="a2ui-loading">
      <el-icon class="is-loading" :size="48">
        <Loading />
      </el-icon>
      <p>{{ loadingText || '加载中...' }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="a2ui-error">
      <el-result
        icon="error"
        :title="error.title || '渲染错误'"
        :sub-title="error.message"
      >
        <template #extra>
          <el-button type="primary" @click="retry">重试</el-button>
          <el-button @click="reportError">报告问题</el-button>
        </template>
      </el-result>
    </div>

    <!-- 正常渲染 -->
    <template v-else-if="rootNode">
      <component
        :is="resolveComponent(rootNode.type)"
        v-if="rootNode"
        :key="renderKey"
        :id="rootNode.id"
        v-bind="rootNode.props"
        :class="rootNode.className"
        :style="rootNode.style"
        :audio="rootNode.audio"
        :session-id="sessionId"
        @event="handleEvent"
      >
        <template v-if="rootNode.children && rootNode.children.length">
          <A2UIRenderer
            v-for="child in rootNode.children"
            :key="child.id"
            :node="child"
            :session-id="sessionId"
            @event="handleEvent"
          />
        </template>
      </component>
    </template>

    <!-- 空状态 -->
    <template v-else>
      <el-empty description="暂无内容" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, markRaw } from 'vue';
import { ElMessage, ElNotification } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import type { A2UIMessage, A2UIComponentNode, A2UIEvent } from '@/types/a2ui-protocol';
import type { A2UIComponentType } from '@/types/a2ui-components';
import { request } from '@/utils/request';

// 导入所有A2UI组件
import A2UIPageContainer from './components/A2UIPageContainer.vue';
import A2UICard from './components/A2UICard.vue';
import A2UIButton from './components/A2UIButton.vue';
import A2UIImage from './components/A2UIImage.vue';
import A2UIImageCarousel from './components/A2UIImageCarousel.vue';
import A2UIVideoPlayer from './components/A2UIVideoPlayer.vue';
import A2UIAudioPlayer from './components/A2UIAudioPlayer.vue';
import A2UIText from './components/A2UIText.vue';
import A2UIRichText from './components/A2UIRichText.vue';
import A2UIProgress from './components/A2UIProgress.vue';
import A2UITimer from './components/A2UITimer.vue';
import A2UICountdown from './components/A2UICountdown.vue';
import A2UIQuestion from './components/questions/A2UIQuestion.vue';
import A2UIChoiceQuestion from './components/questions/A2UIChoiceQuestion.vue';
import A2UIFillBlankQuestion from './components/questions/A2UIFillBlankQuestion.vue';
import A2UIDragSort from './components/interactive/A2UIDragSort.vue';
import A2UIPuzzleGame from './components/interactive/A2UIPuzzleGame.vue';
import A2UIWhiteboard from './components/interactive/A2UIWhiteboard.vue';
import A2UIStarRating from './components/A2UIStarRating.vue';
import A2UIStepIndicator from './components/A2UIStepIndicator.vue';
import A2UIScoreBoard from './components/A2UIScoreBoard.vue';
import A2UIAnimation from './components/A2UIAnimation.vue';
import A2UIDialog from './components/A2UIDialog.vue';
import A2UILoading from './components/A2UILoading.vue';
import A2UIEmptyState from './components/A2UIEmptyState.vue';
import A2UIGroupContainer from './components/A2UIGroupContainer.vue';
import A2UIConditional from './components/A2UIConditional.vue';
import A2UIListIterator from './components/A2UIListIterator.vue';
import A2UITag from './components/A2UITag.vue';
import A2UIBadge from './components/A2UIBadge.vue';

interface Props {
  /** 节点数据 */
  node?: A2UIComponentNode;
  /** 会话ID */
  sessionId: string;
  /** 主题 */
  theme?: 'light' | 'dark';
  /** 加载文字 */
  loadingText?: string;
  /** 调试模式 */
  debugMode?: boolean;
  /** 全屏模式 */
  isFullscreen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  debugMode: import.meta.env.DEV,
  isFullscreen: false
});

const emit = defineEmits<{
  (e: 'ready'): void;
  (e: 'complete', data: any): void;
  (e: 'error', error: { code: string; message: string }): void;
  (e: 'event', event: A2UIEvent): void;
}>();

// 响应式状态
const loading = ref(false);
const error = ref<{ title: string; message: string } | null>(null);
const rootNode = ref<A2UIComponentNode | null>(null);
const renderKey = ref(0);

// 组件映射表（使用markRaw避免响应式开销）
const componentMap: Record<string, any> = markRaw({
  'page-container': A2UIPageContainer,
  'card': A2UICard,
  'button': A2UIButton,
  'image': A2UIImage,
  'image-carousel': A2UIImageCarousel,
  'video-player': A2UIVideoPlayer,
  'audio-player': A2UIAudioPlayer,
  'text': A2UIText,
  'rich-text': A2UIRichText,
  'progress': A2UIProgress,
  'timer': A2UITimer,
  'countdown': A2UICountdown,
  'question': A2UIQuestion,
  'choice-question': A2UIChoiceQuestion,
  'fill-blank-question': A2UIFillBlankQuestion,
  'drag-sort': A2UIDragSort,
  'puzzle-game': A2UIPuzzleGame,
  'interactive-whiteboard': A2UIWhiteboard,
  'star-rating': A2UIStarRating,
  'step-indicator': A2UIStepIndicator,
  'score-board': A2UIScoreBoard,
  'animation': A2UIAnimation,
  'dialog': A2UIDialog,
  'loading': A2UILoading,
  'empty-state': A2UIEmptyState,
  'group-container': A2UIGroupContainer,
  'conditional': A2UIConditional,
  'list-iterator': A2UIListIterator,
  'tag': A2UITag,
  'badge': A2UIBadge
});

// 解析组件类型为实际组件
function resolveComponent(type: string): any {
  return componentMap[type] || { template: `<div class="a2ui-unknown">未知组件: ${type}</div>` };
}

// 处理组件事件
function handleEvent(event: A2UIEvent) {
  // 发送到服务端
  sendEventToServer(event);

  // 触发emit
  emit('event', event);

  // 开发环境显示通知
  if (props.debugMode) {
    ElNotification({
      title: '组件事件',
      message: `类型: ${event.eventType}, 组件: ${event.componentId}`,
      type: 'info'
    });
  }
}

// 发送事件到服务端
async function sendEventToServer(event: A2UIEvent) {
  try {
    await request.post('/a2ui/event', {
      sessionId: props.sessionId,
      messageId: event.messageId,
      componentId: event.componentId,
      eventType: event.eventType,
      payload: event.payload
    });
  } catch (err) {
    console.error('发送事件失败:', err);
  }
}

// 初始化加载
async function initialize() {
  // 如果有传入node，直接使用
  if (props.node) {
    rootNode.value = props.node;
    renderKey.value++;
    emit('ready');
    return;
  }

  // 否则从服务端加载
  loading.value = true;
  error.value = null;

  try {
    const response = await request.post('/a2ui/begin-rendering', {
      sessionId: props.sessionId,
      initialData: {},
      config: {
        theme: props.theme,
        locale: 'zh-CN',
        responsive: true
      }
    });

    // 响应拦截器已经解包了数据，response 就是 { success: true, data: {...} }
    if (response.success) {
      // 支持两种响应格式
      const surfaceData = response.data?.surfaceUpdate || response.data;
      rootNode.value = surfaceData?.root;
      if (rootNode.value) {
        renderKey.value++;
        emit('ready');
      } else {
        throw new Error('渲染数据为空');
      }
    } else {
      throw new Error(response.message || '渲染初始化失败');
    }
  } catch (err: any) {
    error.value = {
      title: '渲染初始化失败',
      message: err.message || '未知错误'
    };
    emit('error', {
      code: 'RENDER_INIT_FAILED',
      message: err.message
    });
  } finally {
    loading.value = false;
  }
}

// 重试
function retry() {
  initialize();
}

// 报告错误
function reportError() {
  request.post('/a2ui/report-error', {
    sessionId: props.sessionId,
    error: error.value
  });
  ElMessage.success('问题已报告，感谢您的反馈');
}

// 监听node变化
watch(() => props.node, (newNode) => {
  if (newNode) {
    rootNode.value = newNode;
    renderKey.value++;
  }
}, { immediate: true });

// 生命周期
onMounted(() => {
  initialize();
});
</script>

<style scoped lang="scss">
.a2ui-renderer {
  width: 100%;
  height: 100%;
  min-height: 400px;
  position: relative;

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background: var(--el-bg-color);
  }
}

.a2ui-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  color: var(--el-text-color-secondary);

  p {
    margin-top: 16px;
  }
}

.a2ui-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.a2ui-unknown {
  padding: 16px;
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning);
  border-radius: 4px;
  color: var(--el-color-warning);
}
</style>
