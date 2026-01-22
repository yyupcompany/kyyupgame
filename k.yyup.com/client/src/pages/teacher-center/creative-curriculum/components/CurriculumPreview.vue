<template>
  <div class="curriculum-preview" ref="previewContainer">
    <div class="preview-header" v-show="!isFullscreen">
      <h3>AI互动课堂预览</h3>
      <div class="header-actions">
        <!-- 模式切换 -->
        <el-radio-group v-model="previewMode" size="small" v-if="hasSlidesContent">
          <el-radio-button value="slideshow">
            <el-icon><Monitor /></el-icon>
            幻灯片
          </el-radio-button>
          <el-radio-button value="scroll">
            <el-icon><Document /></el-icon>
            滚动
          </el-radio-button>
        </el-radio-group>
        
        <el-button
          type="primary"
          size="small"
          @click="refreshPreview"
          :loading="isLoading"
        >
          <el-icon><Refresh /></el-icon>
          刷新预览
        </el-button>
        <el-button
          v-if="hasSlidesContent || hasA2UIContent"
          type="warning"
          size="small"
          @click="openEditor"
        >
          <el-icon><Edit /></el-icon>
          编辑课件
        </el-button>
        <el-button
          type="success"
          size="small"
          @click="enterFullscreen"
          :disabled="!hasContent"
        >
          <el-icon><FullScreen /></el-icon>
          全屏上课
        </el-button>
      </div>
    </div>

    <div class="preview-container" :class="{ 'fullscreen-mode': isFullscreen }">
      
      <!-- 幻灯片模式（有slides数据时） -->
      <A2UISlideshow
        v-if="previewMode === 'slideshow' && hasSlidesContent"
        ref="slideshowRef"
        :key="renderKey"
        :slides="slidesData"
        :session-id="sessionId"
        theme="colorful"
        :show-navigation="true"
        :show-score="true"
        @change="handleSlideChange"
        @event="handleEvent"
        @complete="handleComplete"
        @score-change="handleScoreChange"
      />
      
      <!-- HTML/CSS/JS 渲染模式 -->
      <iframe
        v-else-if="hasHtmlContent"
        ref="previewIframe"
        :srcdoc="iframeSrcdoc"
        class="preview-iframe"
        sandbox="allow-scripts allow-same-origin"
        @load="handleIframeLoad"
      />

      <!-- A2UI 渲染模式（有courseAnalysis数据时） -->
      <A2UIRenderer
        v-else-if="hasA2UIContent && a2uiRootNode"
        :key="renderKey"
        :node="a2uiRootNode"
        :session-id="sessionId"
        :theme="theme"
        :is-fullscreen="isFullscreen"
        :debug-mode="debugMode"
        @ready="handleReady"
        @error="handleError"
        @event="handleEvent"
      />

      <!-- 空状态 -->
      <div v-else-if="!isLoading" class="empty-state">
        <el-empty description="暂无课程内容" />
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading && !renderError" class="loading-overlay">
        <el-icon class="is-loading" :size="48">
          <Loading />
        </el-icon>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-if="renderError" class="error-overlay">
        <el-result
          icon="error"
          title="加载失败"
          :sub-title="renderError"
        >
          <template #extra>
            <el-button type="primary" @click="refreshPreview">重试</el-button>
          </template>
        </el-result>
      </div>

      <!-- 全屏模式退出按钮 -->
      <div v-if="isFullscreen && previewMode !== 'slideshow'" class="fullscreen-controls">
        <el-button
          type="danger"
          size="large"
          @click="exitFullscreen"
          class="exit-fullscreen-btn"
        >
          <el-icon><Close /></el-icon>
          退出全屏 (ESC)
        </el-button>
      </div>
    </div>
    
    <!-- 编辑器对话框 -->
    <el-dialog
      v-model="editorVisible"
      title="课件编辑器"
      fullscreen
      :close-on-click-modal="false"
    >
      <CurriculumEditor
        v-if="editorVisible"
        :curriculum="editorCurriculum"
        @save="handleEditorSave"
        @cancel="editorVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, FullScreen, Close, Loading, Edit, Monitor, Document } from '@element-plus/icons-vue';
import A2UIRenderer from '@/components/a2ui/A2UIRenderer.vue';
import A2UISlideshow from '@/components/a2ui/components/slideshow/A2UISlideshow.vue';
import CurriculumEditor from './CurriculumEditor.vue';
import type { A2UIEvent, A2UIComponentNode } from '@/types/a2ui-protocol';
import type { SlideData } from '@/components/a2ui/components/slideshow';
import { useA2UIStore } from '@/stores/a2ui';

interface CurriculumActivity {
  id: string;
  type: string;
  title: string;
  instruction?: string;
  question?: string;
  options?: Array<{ id: string; text: string; isCorrect: boolean }>;
  items?: Array<{ id: string; text: string }>;
  correctOrder?: string[];
  points?: number;
}

interface CurriculumData {
  id?: number;
  name?: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  courseAnalysis?: {
    title?: string;
    objectives?: string[];
    activities?: CurriculumActivity[];
    style?: string;
    colorScheme?: string;
  };
  media?: { 
    images?: Array<{ id: string; url: string; description?: string }>;
    video?: any;
  };
  curriculumType?: string;
  // 新增幻灯片字段
  slides?: SlideData[];
  originalPrompt?: string;
  themeConfig?: any;
}

interface Props {
  curriculumId?: string;
  curriculumData?: CurriculumData;
  theme?: 'light' | 'dark';
}

const props = withDefaults(defineProps<Props>(), {
  curriculumId: '',
  theme: 'light'
});

const emit = defineEmits<{
  (e: 'update', data: CurriculumData): void;
}>();

const a2uiStore = useA2UIStore();

const previewContainer = ref<HTMLDivElement>();
const previewIframe = ref<HTMLIFrameElement>();
const slideshowRef = ref<InstanceType<typeof A2UISlideshow>>();
const isLoading = ref(false);
const isFullscreen = ref(false);
const renderError = ref('');
const sessionId = ref('');
const renderKey = ref(0);
const debugMode = ref(import.meta.env.DEV);
const a2uiRootNode = ref<A2UIComponentNode | null>(null);

// 预览模式：slideshow（幻灯片）或 scroll（滚动）
const previewMode = ref<'slideshow' | 'scroll'>('slideshow');

// 编辑器状态
const editorVisible = ref(false);
const editorCurriculum = ref<any>(null);

// 当前得分
const currentScore = ref(0);

// 检查是否有幻灯片内容
const hasSlidesContent = computed(() => {
  return !!(props.curriculumData?.slides?.length || 
            props.curriculumData?.curriculumType === 'slideshow');
});

// 获取幻灯片数据
const slidesData = computed<SlideData[]>(() => {
  // 优先使用slides字段
  if (props.curriculumData?.slides?.length) {
    return props.curriculumData.slides;
  }
  
  // 如果没有slides，但有courseAnalysis，转换为幻灯片格式
  if (props.curriculumData?.courseAnalysis) {
    return convertCourseAnalysisToSlides();
  }
  
  return [];
});

// 检查是否有HTML内容
const hasHtmlContent = computed(() => {
  return !!(props.curriculumData?.htmlCode);
});

// 检查是否有A2UI内容（courseAnalysis数据）
const hasA2UIContent = computed(() => {
  return !!(props.curriculumData?.courseAnalysis?.activities?.length || 
            props.curriculumData?.curriculumType === 'a2ui');
});

// 检查是否有任何内容
const hasContent = computed(() => {
  return hasSlidesContent.value || hasHtmlContent.value || hasA2UIContent.value || !!(props.curriculumId || sessionId.value);
});

// 生成iframe的srcdoc
const iframeSrcdoc = computed(() => {
  if (!props.curriculumData) return '';
  
  const { htmlCode = '', cssCode = '', jsCode = '' } = props.curriculumData;
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>课程预览</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch (e) {
      console.error('课程脚本执行错误:', e);
    }
  <\/script>
</body>
</html>
  `.trim();
});

// 生成会话ID
function generateSessionId(): string {
  return `a2ui-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 将courseAnalysis数据转换为幻灯片格式
 */
function convertCourseAnalysisToSlides(): SlideData[] {
  const data = props.curriculumData;
  if (!data?.courseAnalysis) return [];

  const { title, objectives, activities } = data.courseAnalysis;
  const images = data.media?.images || [];
  const slides: SlideData[] = [];

  // 1. 标题页
  slides.push({
    id: 'slide-title',
    type: 'title',
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    components: [
      {
        type: 'title',
        id: 'title-comp',
        props: {
          text: title || data.name || '互动课程',
          subtitle: `${data.courseAnalysis?.colorScheme || '幼儿园'} · 互动学习`
        }
      },
      ...(objectives?.length ? [{
        type: 'objectives',
        id: 'objectives-comp',
        props: {
          items: objectives
        }
      }] : [])
    ]
  });

  // 2. 内容页（如果有图片）
  if (images.length > 0) {
    slides.push({
      id: 'slide-content',
      type: 'media',
      components: [
        {
          type: 'image-carousel',
          id: 'carousel-comp',
          props: {
            images: images.map((img: any) => ({
              id: img.id,
              url: img.url,
              alt: img.description || '课程图片'
            }))
          }
        }
      ]
    });
  }

  // 3. 活动页
  if (activities?.length) {
    activities.forEach((activity: CurriculumActivity, index: number) => {
      const slideType = activity.type === 'choice' || activity.type === 'drag-sort' ? 'activity' : 'content';
      
      slides.push({
        id: `slide-activity-${index}`,
        type: slideType,
        components: [
          convertActivityToSlideComponent(activity, index)
        ]
      });
    });
  }

  // 4. 总结页
  slides.push({
    id: 'slide-summary',
    type: 'summary',
    components: [
      {
        type: 'summary',
        id: 'summary-comp',
        props: {
          title: '课程完成',
          points: objectives || ['完成了所有学习内容', '掌握了新知识', '表现很棒']
        }
      }
    ]
  });

  return slides;
}

/**
 * 将活动转换为幻灯片组件
 */
function convertActivityToSlideComponent(activity: CurriculumActivity, index: number): any {
  switch (activity.type) {
    case 'choice':
      return {
        type: 'choice-question',
        id: activity.id || `choice-${index}`,
        props: {
          title: activity.title,
          question: activity.question || activity.instruction,
          options: activity.options || [],
          points: activity.points || 10,
          hint: activity.instruction
        }
      };

    case 'drag-sort':
      return {
        type: 'drag-sort',
        id: activity.id || `drag-${index}`,
        props: {
          title: activity.title,
          instructions: activity.instruction || '拖拽项目到正确位置',
          items: activity.items || [],
          correctOrder: activity.correctOrder || [],
          points: activity.points || 15
        }
      };

    default:
      return {
        type: 'text',
        id: activity.id || `text-${index}`,
        props: {
          title: activity.title,
          content: activity.instruction || '活动内容'
        }
      };
  }
}

/**
 * 将courseAnalysis数据转换为A2UI组件树
 */
function convertCourseAnalysisToA2UI(): A2UIComponentNode | null {
  const data = props.curriculumData;
  if (!data?.courseAnalysis) return null;

  const { title, objectives, activities, style } = data.courseAnalysis;
  const images = data.media?.images || [];

  // 构建子组件列表
  const children: A2UIComponentNode[] = [];

  // 添加标题卡片
  if (title) {
    children.push({
      type: 'card',
      id: 'title-card',
      props: {
        title: title,
        shadow: 'hover'
      },
      children: objectives?.length ? [{
        type: 'text',
        id: 'objectives-text',
        props: {
          content: `学习目标：\n${objectives.map((o: string, i: number) => `${i + 1}. ${o}`).join('\n')}`,
          variant: 'body'
        }
      }] : []
    });
  }

  // 添加图片轮播（如果有图片）
  if (images.length > 0) {
    children.push({
      type: 'image-carousel',
      id: 'media-carousel',
      props: {
        images: images.map((img: any) => ({
          id: img.id,
          src: img.url,
          alt: img.description || '课程图片'
        })),
        autoplay: false,
        height: '400px'
      }
    });
  }

  // 添加活动组件
  if (activities?.length) {
    activities.forEach((activity: CurriculumActivity, index: number) => {
      const activityNode = convertActivityToComponent(activity, index);
      if (activityNode) {
        children.push(activityNode);
      }
    });
  }

  // 添加计分板
  children.push({
    type: 'score-board',
    id: 'score-board',
    props: {
      score: 0,
      maxScore: activities?.reduce((sum: number, a: CurriculumActivity) => sum + (a.points || 0), 0) || 100,
      showProgress: true
    }
  });

  // 返回根页面容器
  return {
    type: 'page-container',
    id: 'curriculum-page',
    props: {
      title: title || '互动课程',
      theme: props.theme,
      background: style ? 'gradient' : 'default'
    },
    children
  };
}

/**
 * 将单个活动转换为A2UI组件
 */
function convertActivityToComponent(activity: CurriculumActivity, index: number): A2UIComponentNode | null {
  switch (activity.type) {
    case 'choice':
      // 构建题目标题：包含instruction和question
      const questionTitle = activity.instruction 
        ? `${activity.title}\n${activity.instruction}`
        : activity.title;
      
      return {
        type: 'choice-question',
        id: activity.id || `activity-${index}`,
        props: {
          title: questionTitle,
          question: activity.question,
          options: activity.options || [],
          points: activity.points || 10,
          showFeedback: true,
          hint: activity.question // 显示问题作为提示
        }
      };

    case 'drag-sort':
      return {
        type: 'drag-sort',
        id: activity.id || `activity-${index}`,
        props: {
          title: activity.title,
          instructions: activity.instruction || '拖拽项目到正确位置',
          items: activity.items || [],
          correctOrder: activity.correctOrder || [],
          points: activity.points || 15
        }
      };

    case 'puzzle':
      return {
        type: 'puzzle-game',
        id: activity.id || `activity-${index}`,
        props: {
          title: activity.title,
          instruction: activity.instruction,
          gridSize: 3,
          points: activity.points || 20
        }
      };

    case 'fill-blank':
      return {
        type: 'fill-blank-question',
        id: activity.id || `activity-${index}`,
        props: {
          title: activity.title,
          instruction: activity.instruction,
          question: activity.question,
          points: activity.points || 10
        }
      };

    default:
      // 未知类型，显示为卡片
      return {
        type: 'card',
        id: activity.id || `activity-${index}`,
        props: {
          title: activity.title
        },
        children: [{
          type: 'text',
          id: `activity-${index}-text`,
          props: {
            content: activity.instruction || '活动内容',
            variant: 'body'
          }
        }]
      };
  }
}

// 处理iframe加载完成
function handleIframeLoad() {
  isLoading.value = false;
  console.log('[CurriculumPreview] iframe加载完成');
}

// 刷新预览
async function refreshPreview() {
  try {
    isLoading.value = true;
    renderError.value = '';

    // 生成新的会话ID
    sessionId.value = generateSessionId();
    
    // 根据内容类型自动选择预览模式
    if (hasSlidesContent.value) {
      previewMode.value = 'slideshow';
      console.log('[CurriculumPreview] 使用幻灯片模式，页数:', slidesData.value.length);
      renderKey.value++;
      isLoading.value = false;
    } else if (hasHtmlContent.value) {
      // HTML模式：强制重新加载iframe
      previewMode.value = 'scroll';
      renderKey.value++;
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    } else if (hasA2UIContent.value) {
      // A2UI模式：从courseAnalysis生成组件树
      // 如果有courseAnalysis，也可以转为幻灯片模式
      previewMode.value = 'slideshow';
      
      a2uiStore.createSession(sessionId.value);
      a2uiStore.setSessionId(sessionId.value);
      
      // 转换courseAnalysis为A2UI组件树（用于滚动模式）
      const rootNode = convertCourseAnalysisToA2UI();
      if (rootNode) {
        a2uiRootNode.value = rootNode;
        a2uiStore.updateRootNode(sessionId.value, rootNode);
        console.log('[CurriculumPreview] A2UI组件树已生成:', rootNode);
      }
      
      renderKey.value++;
      isLoading.value = false;
    } else {
      // 无内容
      isLoading.value = false;
    }

    if (!renderError.value && (hasSlidesContent.value || hasHtmlContent.value || hasA2UIContent.value)) {
      ElMessage.success('预览已刷新');
    }
  } catch (err) {
    renderError.value = `预览错误: ${err instanceof Error ? err.message : '未知错误'}`;
    console.error('A2UI Preview error:', err);
    isLoading.value = false;
  }
}

// 进入全屏模式
function enterFullscreen() {
  // 如果是幻灯片模式，使用幻灯片组件的全屏功能
  if (previewMode.value === 'slideshow' && slideshowRef.value) {
    slideshowRef.value.enterFullscreen();
    isFullscreen.value = true;
    ElMessage.success('已进入全屏上课模式，按 ESC 键退出');
    return;
  }
  
  // 其他模式使用容器全屏
  const element = previewContainer.value;
  if (!element) {
    ElMessage.error('无法进入全屏模式');
    return;
  }

  try {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
    isFullscreen.value = true;
    ElMessage.success('已进入全屏上课模式，按 ESC 键退出');
  } catch (err) {
    ElMessage.error('进入全屏失败');
    console.error('Fullscreen error:', err);
  }
}

// 退出全屏模式
function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    isFullscreen.value = false;
    ElMessage.success('已退出全屏模式');
  } catch (err) {
    console.error('Exit fullscreen error:', err);
  }
}

// 处理A2UI渲染就绪
function handleReady() {
  console.log('[CurriculumPreview] A2UI渲染已就绪');
  isLoading.value = false;
}

// 处理A2UI错误
function handleError(errorData: { code: string; message: string }) {
  renderError.value = errorData.message;
  isLoading.value = false;
  console.error('[CurriculumPreview] A2UI错误:', errorData);
}

// 处理A2UI事件
function handleEvent(event: A2UIEvent) {
  console.log('[CurriculumPreview] 收到A2UI事件:', event.eventType);
  a2uiStore.logEvent(event);
}

// 处理幻灯片切换
function handleSlideChange(index: number, slide: SlideData) {
  console.log('[CurriculumPreview] 切换到幻灯片:', index, slide.type);
}

// 处理课程完成
function handleComplete() {
  console.log('[CurriculumPreview] 课程完成');
  ElMessage.success('🎉 恭喜完成课程！');
}

// 处理得分变化
function handleScoreChange(score: number) {
  currentScore.value = score;
  console.log('[CurriculumPreview] 得分更新:', score);
}

// 打开编辑器
function openEditor() {
  editorCurriculum.value = {
    id: props.curriculumData?.id,
    name: props.curriculumData?.name || '未命名课程',
    slides: slidesData.value,
    originalPrompt: props.curriculumData?.originalPrompt,
    themeConfig: props.curriculumData?.themeConfig
  };
  editorVisible.value = true;
}

// 处理编辑器保存
function handleEditorSave(data: any) {
  console.log('[CurriculumPreview] 编辑器保存:', data);
  editorVisible.value = false;
  
  // 通知父组件更新数据
  emit('update', {
    ...props.curriculumData,
    name: data.name,
    slides: data.slides,
    curriculumType: 'slideshow'
  });
  
  // 刷新预览
  renderKey.value++;
  ElMessage.success('课件已保存');
}

// 监听全屏状态变化
function handleFullscreenChange() {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );

  if (!isCurrentlyFullscreen && isFullscreen.value) {
    isFullscreen.value = false;
    ElMessage.info('已退出全屏模式');
  }
}

// 监听ESC键退出全屏
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isFullscreen.value) {
    exitFullscreen();
  }
}

// 监听课程ID变化
watch(() => props.curriculumId, (newId) => {
  if (newId) {
    refreshPreview();
  }
});

// 监听课程数据变化
watch(() => props.curriculumData, (newData) => {
  if (newData) {
    console.log('[CurriculumPreview] 课程数据已更新:', {
      hasHtmlCode: !!newData.htmlCode,
      hasA2UIContent: !!newData.courseAnalysis?.activities?.length,
      curriculumType: newData.curriculumType
    });
    refreshPreview();
  }
}, { deep: true });

// 初始化
onMounted(() => {
  // 初始化A2UI预览
  refreshPreview();

  // 添加全屏状态监听
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // 添加键盘监听
  document.addEventListener('keydown', handleKeydown);
});

// 清理监听器
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  document.removeEventListener('keydown', handleKeydown);

  // 清理会话
  if (sessionId.value) {
    a2uiStore.clearSession(sessionId.value);
  }
});

// 暴露方法给父组件
defineExpose({
  enterFullscreen,
  exitFullscreen,
  refreshPreview
});
</script>

<style scoped lang="scss">
.curriculum-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;

  // 全屏模式样式 - 使用渐变背景
  &:fullscreen,
  &:-webkit-full-screen,
  &:-moz-full-screen,
  &:-ms-fullscreen {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    background-size: 400% 400%;
    animation: gradientBg 15s ease infinite;

    .preview-container {
      background: transparent;
      padding: 40px;

      &.fullscreen-mode {
        background: transparent;
      }
    }

    .fullscreen-controls {
      .exit-fullscreen-btn {
        background: rgba(255, 255, 255, 0.95);
        color: #667eea;
        border: none;
        
        &:hover {
          background: #ffffff;
          transform: scale(1.05);
        }
      }
    }
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
    }

    .header-actions {
      display: flex;
      gap: 8px;

      :deep(.el-button) {
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.5);

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }
  }

  .preview-container {
    flex: 1;
    overflow: auto;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
    position: relative;
    padding: 24px;

    // 全屏模式样式
    &.fullscreen-mode {
      background: transparent;
    }

    // iframe预览样式
    .preview-iframe {
      width: 100%;
      height: 100%;
      min-height: 600px;
      border: none;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    // 空状态样式
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 400px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
  }

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
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
    z-index: 10;

    p {
      margin-top: 16px;
      color: #ffffff;
      font-size: 18px;
      font-weight: 500;
    }

    :deep(.el-icon) {
      color: #ffffff;
    }
  }

  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    z-index: 10;
    border-radius: 16px;
  }

  // 全屏控制按钮
  .fullscreen-controls {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;

    .exit-fullscreen-btn {
      padding: 14px 28px;
      border-radius: 30px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// 渐变背景动画
@keyframes gradientBg {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// 全屏模式动画
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
