<template>
  <div 
    class="a2ui-slide"
    :class="[`slide-${slide.type}`, `theme-${theme}`]"
    :style="backgroundStyle"
  >
    <!-- 幻灯片内容区域 -->
    <div class="slide-content">
      <!-- 根据类型渲染不同布局 -->
      
      <!-- 标题页 -->
      <template v-if="slide.type === 'title'">
        <div class="title-layout">
          <div class="title-icon" v-if="getTitleIcon">{{ getTitleIcon }}</div>
          <h1 class="slide-title">{{ getTitle }}</h1>
          <p class="slide-subtitle" v-if="getSubtitle">{{ getSubtitle }}</p>
          <div class="title-objectives" v-if="getObjectives">
            <h3>学习目标</h3>
            <ul>
              <li v-for="(obj, i) in getObjectives" :key="i">{{ obj }}</li>
            </ul>
          </div>
          <button 
            v-if="showStartButton" 
            class="start-button"
            @click="emitStart"
          >
            <span>开始学习</span>
            <el-icon><Right /></el-icon>
          </button>
        </div>
      </template>

      <!-- 内容页 -->
      <template v-else-if="slide.type === 'content'">
        <div class="content-layout" :class="`layout-${getLayoutType}`">
          <!-- 左侧图片 -->
          <div class="content-image" v-if="getImage">
            <img :src="getImage" :alt="getTitle" />
          </div>
          <!-- 右侧文字 -->
          <div class="content-text">
            <h2 class="content-title">{{ getTitle }}</h2>
            <div class="content-body" v-html="getContent"></div>
            <div class="content-hint" v-if="getHint">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ getHint }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 互动页 - 选择题 -->
      <template v-else-if="slide.type === 'activity'">
        <div class="activity-layout">
          <h2 class="activity-title">{{ getTitle }}</h2>
          <p class="activity-instruction" v-if="getInstruction">{{ getInstruction }}</p>
          
          <!-- 选择题组件 -->
          <template v-if="getActivityType === 'choice'">
            <A2UISlideChoice
              :id="slide.id + '-choice'"
              :question="getQuestion"
              :options="getOptions"
              :hint="getHint"
              :points="getPoints"
              :theme="theme"
              @answer="handleAnswer"
            />
          </template>
          
          <!-- 拖拽排序组件 -->
          <template v-else-if="getActivityType === 'drag-sort'">
            <A2UISlideDragSort
              :id="slide.id + '-dragsort'"
              :items="getDragItems"
              :correct-order="getCorrectOrder"
              :instruction="getInstruction"
              :points="getPoints"
              :theme="theme"
              @complete="handleDragComplete"
            />
          </template>
        </div>
      </template>

      <!-- 媒体页 - 图片/视频 -->
      <template v-else-if="slide.type === 'media'">
        <div class="media-layout">
          <h2 class="media-title" v-if="getTitle">{{ getTitle }}</h2>
          <div class="media-container">
            <!-- 图片轮播 -->
            <template v-if="getMediaType === 'carousel'">
              <el-carousel 
                :height="getCarouselHeight" 
                :autoplay="false"
                indicator-position="outside"
              >
                <el-carousel-item v-for="(img, i) in getMediaItems" :key="i">
                  <img :src="img.url" :alt="img.alt || ''" class="media-image" />
                </el-carousel-item>
              </el-carousel>
            </template>
            <!-- 单图 -->
            <template v-else-if="getMediaType === 'image'">
              <img :src="getImage" :alt="getTitle" class="media-image single" />
            </template>
          </div>
          <p class="media-caption" v-if="getCaption">{{ getCaption }}</p>
        </div>
      </template>

      <!-- 总结页 -->
      <template v-else-if="slide.type === 'summary'">
        <div class="summary-layout">
          <div class="summary-icon">🎉</div>
          <h1 class="summary-title">课程完成！</h1>
          <div class="summary-score">
            <div class="score-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= getStars }">⭐</span>
            </div>
            <div class="score-value">
              得分: <strong>{{ currentScore }}</strong> / {{ maxScore }}
            </div>
          </div>
          <div class="summary-review" v-if="getSummaryPoints.length">
            <h3>📝 今天学到了：</h3>
            <ul>
              <li v-for="(point, i) in getSummaryPoints" :key="i">✓ {{ point }}</li>
            </ul>
          </div>
          <div class="summary-actions">
            <button class="action-btn secondary" @click="emitRestart">
              <el-icon><Refresh /></el-icon>
              <span>再来一次</span>
            </button>
            <button class="action-btn primary" @click="emitComplete">
              <el-icon><Check /></el-icon>
              <span>完成课程</span>
            </button>
          </div>
        </div>
      </template>

      <!-- 默认/自定义内容 -->
      <template v-else>
        <slot :slide="slide" :index="index" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Right, InfoFilled, Refresh, Check } from '@element-plus/icons-vue';
import A2UISlideChoice from './A2UISlideChoice.vue';
import A2UISlideDragSort from './A2UISlideDragSort.vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface SlideData {
  id: string;
  type: string;
  layout?: any;
  components?: any[];
  background?: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
}

interface Props {
  slide: SlideData;
  index: number;
  isActive: boolean;
  theme?: string;
  currentScore?: number;
  maxScore?: number;
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'colorful',
  currentScore: 0,
  maxScore: 100
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
}>();

// 获取组件数据的辅助函数
function getComponentByType(type: string) {
  return props.slide.components?.find(c => c.type === type);
}

function getComponentProp(type: string, prop: string, defaultValue: any = '') {
  const comp = getComponentByType(type);
  return comp?.props?.[prop] ?? defaultValue;
}

// 计算属性 - 通用
const getTitleIcon = computed(() => {
  const icons: Record<string, string> = {
    title: '🎓',
    content: '📚',
    activity: '🎮',
    media: '🖼️',
    summary: '🎉'
  };
  return icons[props.slide.type] || '📖';
});

const getTitle = computed(() => {
  // 优先从 title 组件获取
  const titleComp = getComponentByType('title');
  if (titleComp?.props?.text) return titleComp.props.text;
  
  // 其次从 card 组件获取
  const cardComp = getComponentByType('card');
  if (cardComp?.props?.title) return cardComp.props.title;
  
  // 再从 choice-question 获取
  const choiceComp = getComponentByType('choice-question');
  if (choiceComp?.props?.title) return choiceComp.props.title;
  
  return '';
});

const getSubtitle = computed(() => {
  return getComponentProp('title', 'subtitle') || 
         getComponentProp('card', 'subtitle');
});

const getContent = computed(() => {
  const textComp = getComponentByType('text');
  return textComp?.props?.content || '';
});

// 计算属性 - 标题页
const getObjectives = computed(() => {
  const objectivesComp = getComponentByType('objectives');
  return objectivesComp?.props?.items || [];
});

const showStartButton = computed(() => {
  return props.slide.type === 'title';
});

// 计算属性 - 内容页
const getLayoutType = computed(() => {
  return props.slide.layout?.template || 'left-image';
});

const getImage = computed(() => {
  const imageComp = getComponentByType('image');
  return imageComp?.props?.src || imageComp?.props?.url || '';
});

const getHint = computed(() => {
  return getComponentProp('hint', 'text') ||
         getComponentProp('choice-question', 'hint');
});

// 计算属性 - 互动页
const getActivityType = computed(() => {
  if (getComponentByType('choice-question')) return 'choice';
  if (getComponentByType('drag-sort')) return 'drag-sort';
  return 'unknown';
});

const getInstruction = computed(() => {
  return getComponentProp('choice-question', 'instruction') ||
         getComponentProp('drag-sort', 'instructions') ||
         getComponentProp('instruction', 'text');
});

const getQuestion = computed(() => {
  return getComponentProp('choice-question', 'question');
});

const getOptions = computed(() => {
  return getComponentProp('choice-question', 'options', []);
});

const getPoints = computed(() => {
  return getComponentProp('choice-question', 'points') ||
         getComponentProp('drag-sort', 'points') || 10;
});

const getDragItems = computed(() => {
  return getComponentProp('drag-sort', 'items', []);
});

const getCorrectOrder = computed(() => {
  return getComponentProp('drag-sort', 'correctOrder', []);
});

// 计算属性 - 媒体页
const getMediaType = computed(() => {
  if (getComponentByType('image-carousel')) return 'carousel';
  if (getComponentByType('image')) return 'image';
  return 'image';
});

const getMediaItems = computed(() => {
  const carouselComp = getComponentByType('image-carousel');
  return carouselComp?.props?.images || [];
});

const getCaption = computed(() => {
  return getComponentProp('image', 'caption') ||
         getComponentProp('image-carousel', 'caption');
});

const getCarouselHeight = computed(() => {
  return '500px';
});

// 计算属性 - 总结页
const getStars = computed(() => {
  const percentage = props.maxScore > 0 ? props.currentScore / props.maxScore : 0;
  if (percentage >= 0.9) return 5;
  if (percentage >= 0.7) return 4;
  if (percentage >= 0.5) return 3;
  if (percentage >= 0.3) return 2;
  return 1;
});

const getSummaryPoints = computed(() => {
  const summaryComp = getComponentByType('summary');
  return summaryComp?.props?.points || [];
});

// 背景样式
const backgroundStyle = computed(() => {
  const bg = props.slide.background;
  if (!bg) return {};
  
  switch (bg.type) {
    case 'color':
      return { backgroundColor: bg.value };
    case 'gradient':
      return { background: bg.value };
    case 'image':
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    default:
      return {};
  }
});

// 事件处理
function emitEvent(eventType: string, payload: Record<string, any> = {}) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: props.slide.id,
    eventType,
    payload
  };
  emit('event', event);
}

function emitStart() {
  emitEvent('slide.start');
}

function emitRestart() {
  emitEvent('curriculum.restart');
}

function emitComplete() {
  emitEvent('curriculum.complete');
}

function handleAnswer(result: { isCorrect: boolean; score: number }) {
  emitEvent('activity.answer', result);
}

function handleDragComplete(result: { isCorrect: boolean; score: number }) {
  emitEvent('activity.complete', result);
}
</script>

<style scoped lang="scss">
.a2ui-slide {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  overflow: hidden;
  padding: 60px 80px 100px;
  box-sizing: border-box;
  
  // 主题样式
  &.theme-colorful {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }
  
  &.theme-dark {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #ffffff;
  }
}

.slide-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-height: 0; // 修复flex子元素溢出
  
  // 防止文字溢出
  * {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
}

// 标题页布局
.title-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 20px;
  overflow: hidden;
  min-height: 0;
  
  .title-icon {
    font-size: 64px;
    animation: bounce 2s ease-in-out infinite;
    flex-shrink: 0;
  }
  
  .slide-title {
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 800;
    color: #333;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    max-width: 100%;
    line-height: 1.2;
  }
  
  .slide-subtitle {
    font-size: clamp(18px, 2.5vw, 28px);
    color: #666;
    margin: 0;
    max-width: 100%;
  }
  
  .title-objectives {
    background: linear-gradient(135deg, #f5f7ff 0%, #ede9fe 100%);
    padding: 20px 32px;
    border-radius: 16px;
    text-align: left;
    max-width: 100%;
    overflow: hidden;
    
    h3 {
      font-size: clamp(20px, 2vw, 26px);
      color: #667eea;
      margin: 0 0 12px;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        font-size: clamp(16px, 1.8vw, 22px);
        color: #333;
        margin-bottom: 6px;
        line-height: 1.5;
      }
    }
  }
  
  .start-button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 36px;
    font-size: clamp(18px, 2vw, 26px);
    font-weight: 700;
    color: #ffffff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    flex-shrink: 0;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
}

// 内容页布局
.content-layout {
  flex: 1;
  display: grid;
  gap: 30px;
  min-height: 0;
  overflow: hidden;
  
  &.layout-left-image {
    grid-template-columns: 1fr 1fr;
  }
  
  &.layout-right-image {
    grid-template-columns: 1fr 1fr;
    
    .content-image {
      order: 2;
    }
  }
  
  &.layout-top-image {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .content-image {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    overflow: hidden;
    
    img {
      max-width: 100%;
      max-height: 100%;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      object-fit: cover;
    }
  }
  
  .content-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 0;
    overflow: auto;
    
    .content-title {
      font-size: clamp(28px, 3.5vw, 44px);
      font-weight: 700;
      color: #333;
      margin: 0 0 16px;
      flex-shrink: 0;
    }
    
    .content-body {
      font-size: clamp(18px, 2.2vw, 28px);
      line-height: 1.7;
      color: #444;
      white-space: pre-wrap;
    }
    
    .content-hint {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 16px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
      border-radius: 12px;
      font-size: clamp(14px, 1.6vw, 20px);
      color: #e65100;
      flex-shrink: 0;
      
      .el-icon {
        font-size: 22px;
        flex-shrink: 0;
      }
    }
  }
}

// 互动页布局
.activity-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  
  .activity-title {
    font-size: clamp(28px, 3.5vw, 40px);
    font-weight: 700;
    color: #333;
    text-align: center;
    margin: 0 0 12px;
    flex-shrink: 0;
  }
  
  .activity-instruction {
    font-size: clamp(18px, 2vw, 26px);
    color: #666;
    text-align: center;
    margin: 0 0 20px;
    flex-shrink: 0;
  }
}

// 媒体页布局
.media-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .media-title {
    font-size: 44px;
    font-weight: 700;
    color: #333;
    margin: 0 0 24px;
  }
  
  .media-container {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .el-carousel {
      width: 100%;
      max-width: 900px;
    }
    
    .media-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 16px;
      
      &.single {
        max-height: 500px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  .media-caption {
    font-size: 24px;
    color: #666;
    text-align: center;
    margin-top: 16px;
  }
}

// 总结页布局
.summary-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
  min-height: 0;
  overflow: auto;
  
  .summary-icon {
    font-size: clamp(60px, 8vw, 80px);
    animation: celebrateBounce 1s ease-in-out infinite;
    flex-shrink: 0;
  }
  
  .summary-title {
    font-size: clamp(32px, 4.5vw, 48px);
    font-weight: 800;
    color: #333;
    margin: 0;
  }
  
  .summary-score {
    flex-shrink: 0;
    
    .score-stars {
      font-size: clamp(32px, 4vw, 44px);
      margin-bottom: 12px;
      
      .star {
        opacity: 0.3;
        transition: opacity 0.3s;
        
        &.active {
          opacity: 1;
        }
      }
    }
    
    .score-value {
      font-size: clamp(24px, 3vw, 32px);
      color: #666;
      
      strong {
        font-size: clamp(32px, 4vw, 44px);
        color: #52c41a;
      }
    }
  }
  
  .summary-review {
    background: linear-gradient(135deg, #f5f7ff 0%, #ede9fe 100%);
    padding: 16px 28px;
    border-radius: 16px;
    text-align: left;
    max-width: 100%;
    
    h3 {
      font-size: clamp(18px, 2vw, 24px);
      color: #667eea;
      margin: 0 0 12px;
    }
    
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      
      li {
        font-size: clamp(16px, 1.8vw, 20px);
        color: #333;
        margin-bottom: 6px;
      }
    }
  }
  
  .summary-actions {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    flex-wrap: wrap;
    justify-content: center;
    
    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: clamp(16px, 1.8vw, 22px);
      font-weight: 600;
      border: none;
      border-radius: 40px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &.primary {
        color: #ffffff;
        background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
        box-shadow: 0 6px 20px rgba(82, 196, 26, 0.4);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(82, 196, 26, 0.5);
        }
      }
      
      &.secondary {
        color: #667eea;
        background: #f5f7ff;
        border: 2px solid #667eea;
        
        &:hover {
          background: #ede9fe;
        }
      }
    }
  }
}

// 动画
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes celebrateBounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}
</style>
