<template>
  <div 
    class="a2ui-slideshow"
    :class="{ 'fullscreen': isFullscreen }"
    ref="slideshowRef"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <!-- 幻灯片容器 -->
    <div class="slides-container">
      <TransitionGroup :name="transitionName" tag="div" class="slides-wrapper">
        <div
          v-for="(slide, index) in slides"
          v-show="index === currentIndex"
          :key="slide.id || index"
          class="slide-item"
        >
          <slot 
            name="slide" 
            :slide="slide" 
            :index="index" 
            :isActive="index === currentIndex"
          >
            <!-- 默认幻灯片渲染 -->
            <A2UISlide
              :slide="slide"
              :index="index"
              :is-active="index === currentIndex"
              :theme="theme"
              @event="handleSlideEvent"
            />
          </slot>
        </div>
      </TransitionGroup>
    </div>

    <!-- 导航控制 -->
    <A2UISlideNavigation
      v-if="showNavigation"
      :current-page="currentIndex + 1"
      :total-pages="slides.length"
      :can-go-prev="canGoPrev"
      :can-go-next="canGoNext"
      :show-score="showScore"
      :score="currentScore"
      :max-score="maxScore"
      :theme="theme"
      @prev="goPrev"
      @next="goNext"
      @goto="gotoSlide"
    />

    <!-- 全屏退出按钮 -->
    <button
      v-if="isFullscreen && showExitButton"
      class="exit-fullscreen-btn"
      @click="exitFullscreen"
    >
      <el-icon><Close /></el-icon>
      <span>退出 (ESC)</span>
    </button>

    <!-- 加载遮罩 -->
    <div v-if="isLoading" class="loading-overlay">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { Close, Loading } from '@element-plus/icons-vue';
import A2UISlide from './A2UISlide.vue';
import A2UISlideNavigation from './A2UISlideNavigation.vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

// 幻灯片数据结构
export interface SlideData {
  id: string;
  type: 'title' | 'content' | 'activity' | 'media' | 'summary';
  layout?: {
    template?: string;
    columns?: number;
  };
  components?: any[];
  background?: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  audio?: {
    ttsText?: string;
    audioUrl?: string;
    autoPlay?: boolean;
  };
}

interface Props {
  slides: SlideData[];
  initialIndex?: number;
  showNavigation?: boolean;
  showScore?: boolean;
  enableSwipe?: boolean;
  enableKeyboard?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  theme?: 'default' | 'colorful' | 'dark';
  sessionId?: string;
  showExitButton?: boolean;  // 是否显示内置退出按钮
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
  showNavigation: true,
  showScore: true,
  enableSwipe: true,
  enableKeyboard: true,
  autoPlay: false,
  autoPlayInterval: 5000,
  theme: 'colorful',
  showExitButton: true
});

const emit = defineEmits<{
  (e: 'change', index: number, slide: SlideData): void;
  (e: 'event', event: A2UIEvent): void;
  (e: 'complete'): void;
  (e: 'score-change', score: number): void;
}>();

// 状态
const slideshowRef = ref<HTMLElement | null>(null);
const currentIndex = ref(props.initialIndex);
const isFullscreen = ref(false);
const isLoading = ref(false);
const transitionName = ref('slide-right');
const touchStartX = ref(0);
const touchStartY = ref(0);
const currentScore = ref(0);
const maxScore = ref(100);

// 计算属性
const canGoPrev = computed(() => currentIndex.value > 0);
const canGoNext = computed(() => currentIndex.value < props.slides.length - 1);
const currentSlide = computed(() => props.slides[currentIndex.value]);

// 导航方法
function goPrev() {
  if (!canGoPrev.value) return;
  transitionName.value = 'slide-left';
  currentIndex.value--;
  emitChange();
}

function goNext() {
  if (!canGoNext.value) {
    emit('complete');
    return;
  }
  transitionName.value = 'slide-right';
  currentIndex.value++;
  emitChange();
}

function gotoSlide(index: number) {
  if (index < 0 || index >= props.slides.length) return;
  transitionName.value = index > currentIndex.value ? 'slide-right' : 'slide-left';
  currentIndex.value = index;
  emitChange();
}

function emitChange() {
  emit('change', currentIndex.value, currentSlide.value);
}

// 触屏手势
function handleTouchStart(e: TouchEvent) {
  if (!props.enableSwipe) return;
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent) {
  if (!props.enableSwipe) return;
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchEndX - touchStartX.value;
  const diffY = touchEndY - touchStartY.value;
  
  // 水平滑动且超过阈值
  if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0) {
      goPrev();
    } else {
      goNext();
    }
  }
}

// 键盘导航
function handleKeydown(e: KeyboardEvent) {
  if (!props.enableKeyboard) return;
  
  switch (e.key) {
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      goPrev();
      break;
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
    case ' ':
      e.preventDefault();
      goNext();
      break;
    case 'Home':
      e.preventDefault();
      gotoSlide(0);
      break;
    case 'End':
      e.preventDefault();
      gotoSlide(props.slides.length - 1);
      break;
    case 'Escape':
      e.preventDefault();
      exitFullscreen();
      break;
  }
}

// 全屏控制
function enterFullscreen() {
  const element = slideshowRef.value;
  if (!element) return;
  
  try {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    }
    isFullscreen.value = true;
  } catch (err) {
    console.error('进入全屏失败:', err);
  }
}

function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    }
    isFullscreen.value = false;
  } catch (err) {
    console.error('退出全屏失败:', err);
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement
  );
}

// 处理幻灯片事件
function handleSlideEvent(event: A2UIEvent) {
  // 处理"开始学习"按钮事件 - 切换到下一页
  if (event.eventType === 'slide.start') {
    goNext();
  }
  
  // 处理"再来一次"按钮事件 - 重置并回到第一页
  if (event.eventType === 'curriculum.restart') {
    currentScore.value = 0;
    emit('score-change', 0);
    gotoSlide(0);
  }
  
  // 处理"完成课程"按钮事件
  if (event.eventType === 'curriculum.complete') {
    emit('complete');
  }
  
  // 处理得分事件
  if (event.eventType.includes('answer') || event.eventType.includes('complete')) {
    if (event.payload?.score) {
      currentScore.value += event.payload.score;
      emit('score-change', currentScore.value);
    }
  }
  
  emit('event', event);
}

// 计算最大得分
function calculateMaxScore() {
  let total = 0;
  props.slides.forEach(slide => {
    if (slide.components) {
      slide.components.forEach((comp: any) => {
        // 只计算数字类型的 points（来自选择题/拖拽等互动组件）
        // 排除 summary 组件的 points（那是字符串数组）
        if (comp.props?.points && typeof comp.props.points === 'number') {
          total += comp.props.points;
        }
      });
    }
  });
  maxScore.value = total || 100;
}

// 生命周期
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  
  calculateMaxScore();
  
  // 自动聚焦以支持键盘操作
  nextTick(() => {
    slideshowRef.value?.focus();
  });
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
});

// 监听幻灯片变化
watch(() => props.slides, () => {
  calculateMaxScore();
}, { deep: true });

// 暴露方法
defineExpose({
  goPrev,
  goNext,
  gotoSlide,
  enterFullscreen,
  exitFullscreen,
  currentIndex,
  currentScore
});
</script>

<style scoped lang="scss">
.a2ui-slideshow {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  outline: none;
  
  // 16:9 比例容器
  aspect-ratio: 16 / 9;
  max-width: 1920px;
  max-height: 1080px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  &.fullscreen {
    max-width: none;
    max-height: none;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    
    .slides-container {
      border-radius: 0;
    }
  }
}

.slides-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
}

.slides-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

// 页面切换动画 - 向右滑动（下一页）
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

// 页面切换动画 - 向左滑动（上一页）
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

// 退出全屏按钮
.exit-fullscreen-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
  }
  
  .el-icon {
    font-size: 18px;
  }
}

// 加载遮罩
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.9);
  z-index: 100;
  color: #ffffff;
  
  .loading-icon {
    font-size: 48px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  span {
    font-size: 20px;
    font-weight: 500;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
