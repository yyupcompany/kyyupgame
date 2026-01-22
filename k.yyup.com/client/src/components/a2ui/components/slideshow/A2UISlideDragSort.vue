<template>
  <div class="a2ui-slide-dragsort" :class="{ completed: showResult }">
    <!-- 庆祝动画 -->
    <div v-if="showCelebration" class="celebration-overlay">
      <div class="celebration-stars">
        <span v-for="i in 12" :key="i" class="star" :style="{ '--delay': i * 0.1 + 's' }">⭐</span>
      </div>
      <div class="celebration-text">🎉 太棒了！</div>
    </div>
    
    <!-- 说明文字 -->
    <div class="instruction-section">
      <div class="instruction-icon">🔢</div>
      <p class="instruction-text">{{ instruction || '拖拽下面的项目，按正确顺序排列' }}</p>
      <button class="speak-btn" @click="speakInstruction" :class="{ speaking: isSpeaking }">
        <el-icon><Microphone /></el-icon>
        {{ isSpeaking ? '朗读中...' : '朗读说明' }}
      </button>
    </div>
    
    <!-- 拖拽区域 -->
    <div class="drag-area">
      <div
        v-for="(item, index) in displayItems"
        :key="item.id"
        class="drag-item"
        :class="{
          dragging: draggingIndex === index,
          'correct-position': showResult && isItemCorrect(index),
          'wrong-position': showResult && !isItemCorrect(index)
        }"
        :draggable="!showResult"
        @dragstart="handleDragStart($event, index)"
        @dragend="handleDragEnd"
        @dragover.prevent="handleDragOver($event, index)"
        @drop="handleDrop($event, index)"
        @touchstart="handleTouchStart($event, index)"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- 序号 -->
        <div class="item-number">{{ index + 1 }}</div>
        
        <!-- 拖拽手柄 -->
        <div class="item-handle">
          <el-icon><Rank /></el-icon>
        </div>
        
        <!-- 内容 -->
        <div class="item-content">
          <img v-if="item.image" :src="item.image" :alt="getItemText(item)" class="item-image" />
          <span class="item-text">{{ getItemText(item) }}</span>
        </div>
        
        <!-- 状态图标 -->
        <div class="item-status" v-if="showResult">
          <el-icon v-if="isItemCorrect(index)" class="status-correct">
            <CircleCheck />
          </el-icon>
          <el-icon v-else class="status-wrong">
            <CircleClose />
          </el-icon>
        </div>
      </div>
    </div>
    
    <!-- 结果反馈 -->
    <div v-if="showResult" class="feedback-section" :class="isAllCorrect ? 'success' : 'failed'">
      <div class="feedback-icon">{{ isAllCorrect ? '🎉' : '💪' }}</div>
      <div class="feedback-text">
        <h3>{{ isAllCorrect ? '排序正确！太棒了！' : '顺序不对，再试试吧！' }}</h3>
        <p v-if="!isAllCorrect">正确顺序应该是：{{ correctOrderText }}</p>
      </div>
      <div class="feedback-stars" v-if="isAllCorrect">
        <span v-for="i in 3" :key="i" class="star">⭐</span>
      </div>
    </div>
    
    <!-- 操作按钮 -->
    <div class="action-section">
      <button 
        v-if="!showResult"
        class="check-btn"
        @click="checkAnswer"
      >
        <span>检查答案</span>
        <el-icon><Check /></el-icon>
      </button>
      
      <button 
        v-else
        class="retry-btn"
        @click="resetSort"
      >
        <el-icon><Refresh /></el-icon>
        <span>重新排序</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Check, Refresh, Rank, CircleCheck, CircleClose, Microphone } from '@element-plus/icons-vue';
import { playSound, speak, stopSpeak } from '@/utils/curriculum-audio';

interface DragItem {
  id: string;
  text?: string;
  content?: string;
  image?: string;
}

interface Props {
  id: string;
  items: DragItem[];
  correctOrder: string[];
  instruction?: string;
  points?: number;
  theme?: string;
  autoSpeak?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  points: 15,
  theme: 'colorful',
  autoSpeak: true
});

const emit = defineEmits<{
  (e: 'complete', result: { isCorrect: boolean; score: number }): void;
}>();

// 状态
const displayItems = ref<DragItem[]>([...props.items]);
const draggingIndex = ref<number | null>(null);
const showResult = ref(false);
const touchStartIndex = ref<number | null>(null);
const touchCurrentY = ref(0);
const isSpeaking = ref(false);
const showCelebration = ref(false);

// 计算属性
const isAllCorrect = computed(() => {
  const currentOrder = displayItems.value.map(item => item.id);
  return JSON.stringify(currentOrder) === JSON.stringify(props.correctOrder);
});

const correctOrderText = computed(() => {
  return props.correctOrder
    .map((id, i) => {
      const item = props.items.find(it => it.id === id);
      return `${i + 1}. ${getItemText(item)}`;
    })
    .join(' → ');
});

// 方法
function getItemText(item?: DragItem): string {
  if (!item) return '';
  return item.text || item.content || '';
}

function isItemCorrect(index: number): boolean {
  return displayItems.value[index].id === props.correctOrder[index];
}

// 朗读说明
function speakInstruction() {
  if (isSpeaking.value) {
    stopSpeak();
    isSpeaking.value = false;
    return;
  }
  
  const text = props.instruction || '请按正确顺序排列';
  isSpeaking.value = true;
  speak(text, {
    rate: 0.85,
    pitch: 1.1,
    onEnd: () => {
      isSpeaking.value = false;
    }
  });
}

// 拖拽处理 - 桌面端
function handleDragStart(e: DragEvent, index: number) {
  playSound('drag');
  draggingIndex.value = index;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }
}

function handleDragEnd() {
  draggingIndex.value = null;
}

function handleDragOver(e: DragEvent, index: number) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
}

function handleDrop(e: DragEvent, targetIndex: number) {
  e.preventDefault();
  if (draggingIndex.value === null || draggingIndex.value === targetIndex) return;
  
  playSound('drop');
  const items = [...displayItems.value];
  const draggedItem = items[draggingIndex.value];
  items.splice(draggingIndex.value, 1);
  items.splice(targetIndex, 0, draggedItem);
  displayItems.value = items;
  draggingIndex.value = null;
}

// 触屏处理
function handleTouchStart(e: TouchEvent, index: number) {
  touchStartIndex.value = index;
  touchCurrentY.value = e.touches[0].clientY;
}

function handleTouchMove(e: TouchEvent) {
  if (touchStartIndex.value === null) return;
  touchCurrentY.value = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent) {
  if (touchStartIndex.value === null) return;
  
  const endY = e.changedTouches[0].clientY;
  const startY = touchCurrentY.value;
  const diffY = endY - startY;
  
  // 计算目标位置
  const itemHeight = 100; // 大约高度
  const moveSlots = Math.round(diffY / itemHeight);
  const targetIndex = Math.max(0, Math.min(
    displayItems.value.length - 1,
    touchStartIndex.value + moveSlots
  ));
  
  if (targetIndex !== touchStartIndex.value) {
    const items = [...displayItems.value];
    const draggedItem = items[touchStartIndex.value];
    items.splice(touchStartIndex.value, 1);
    items.splice(targetIndex, 0, draggedItem);
    displayItems.value = items;
  }
  
  touchStartIndex.value = null;
}

// 检查答案
function checkAnswer() {
  showResult.value = true;
  
  if (isAllCorrect.value) {
    playSound('correct');
    showCelebration.value = true;
    setTimeout(() => {
      showCelebration.value = false;
    }, 2000);
    speak('太棒了！排序完全正确！', { rate: 1.0, pitch: 1.2 });
  } else {
    playSound('wrong');
    speak('顺序不太对，再试试吧！', { rate: 0.9, pitch: 1.0 });
  }
  
  emit('complete', {
    isCorrect: isAllCorrect.value,
    score: isAllCorrect.value ? props.points : 0
  });
}

// 重置
function resetSort() {
  playSound('click');
  displayItems.value = [...props.items];
  showResult.value = false;
}

// 组件挂载时自动朗读
onMounted(() => {
  if (props.autoSpeak && props.instruction) {
    setTimeout(() => {
      speakInstruction();
    }, 500);
  }
});

// 清理
watch(() => props.items, () => {
  stopSpeak();
  displayItems.value = [...props.items];
  showResult.value = false;
});
</script>

<style scoped lang="scss">
.a2ui-slide-dragsort {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 0;
}

// 说明区域
.instruction-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #ffffff;
  
  .instruction-icon {
    font-size: 40px;
  }
  
  .instruction-text {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
  }
}

// 拖拽区域
.drag-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 拖拽项目
.drag-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: #ffffff;
  border: 4px solid #e4e7ed;
  border-radius: 16px;
  cursor: grab;
  transition: all 0.3s ease;
  user-select: none;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
  }
  
  &.dragging {
    opacity: 0.5;
    cursor: grabbing;
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
  
  &.correct-position {
    border-color: #52c41a;
    background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
    animation: itemCorrect 0.5s ease;
  }
  
  &.wrong-position {
    border-color: #ff4d4f;
    background: linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%);
    animation: itemWrong 0.5s ease;
  }
  
  .item-number {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    flex-shrink: 0;
  }
  
  .item-handle {
    color: #999;
    cursor: grab;
    
    .el-icon {
      font-size: 28px;
    }
  }
  
  .item-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    
    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: cover;
    }
    
    .item-text {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .item-status {
    .el-icon {
      font-size: 36px;
    }
    
    .status-correct {
      color: #52c41a;
    }
    
    .status-wrong {
      color: #ff4d4f;
    }
  }
}

// 反馈区域
.feedback-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 32px;
  border-radius: 16px;
  animation: feedbackEnter 0.5s ease;
  
  &.success {
    background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
    border: 2px solid #52c41a;
  }
  
  &.failed {
    background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
    border: 2px solid #faad14;
  }
  
  .feedback-icon {
    font-size: 60px;
    flex-shrink: 0;
  }
  
  .feedback-text {
    flex: 1;
    
    h3 {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px;
      
      .success & {
        color: #52c41a;
      }
      
      .failed & {
        color: #faad14;
      }
    }
    
    p {
      font-size: 20px;
      color: #666;
      margin: 0;
    }
  }
  
  .feedback-stars {
    font-size: 40px;
    
    .star {
      animation: starPop 0.3s ease;
      animation-fill-mode: both;
      
      &:nth-child(1) { animation-delay: 0.1s; }
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.3s; }
    }
  }
}

// 操作区域
.action-section {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 20px;
}

.check-btn,
.retry-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 48px;
  font-size: 28px;
  font-weight: 700;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  .el-icon {
    font-size: 28px;
  }
}

.check-btn {
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  
  &:hover {
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
  }
}

.retry-btn {
  color: #667eea;
  background: #f5f7ff;
  border: 2px solid #667eea;
  
  &:hover {
    background: #ede9fe;
  }
}

// 语音按钮
.speak-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 25px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: auto;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
  
  &.speaking {
    animation: pulse 1s ease-in-out infinite;
    background: rgba(255, 255, 255, 0.4);
  }
  
  .el-icon {
    font-size: 20px;
  }
}

// 庆祝动画容器
.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;
  pointer-events: none;
  animation: celebrationFadeIn 0.3s ease;
  
  .celebration-stars {
    position: absolute;
    width: 100%;
    height: 100%;
    
    .star {
      position: absolute;
      font-size: 48px;
      animation: starBurst 1.5s ease-out forwards;
      animation-delay: var(--delay);
      opacity: 0;
      
      &:nth-child(1) { top: 20%; left: 10%; }
      &:nth-child(2) { top: 30%; left: 25%; }
      &:nth-child(3) { top: 15%; left: 40%; }
      &:nth-child(4) { top: 25%; left: 55%; }
      &:nth-child(5) { top: 20%; left: 70%; }
      &:nth-child(6) { top: 30%; left: 85%; }
      &:nth-child(7) { top: 60%; left: 15%; }
      &:nth-child(8) { top: 70%; left: 30%; }
      &:nth-child(9) { top: 65%; left: 50%; }
      &:nth-child(10) { top: 75%; left: 65%; }
      &:nth-child(11) { top: 60%; left: 80%; }
      &:nth-child(12) { top: 50%; left: 50%; font-size: 80px; }
    }
  }
  
  .celebration-text {
    font-size: 72px;
    font-weight: 800;
    color: #ffffff;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: celebrationBounce 0.6s ease;
    z-index: 1;
  }
}

// 动画
@keyframes itemCorrect {
  0% { transform: scale(1); }
  25% { transform: scale(1.02); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

@keyframes itemWrong {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

@keyframes feedbackEnter {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes starPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes celebrationFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes starBurst {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.5) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(2) rotate(360deg) translateY(-50px);
  }
}

@keyframes celebrationBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}
</style>
