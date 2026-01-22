<template>
  <div class="a2ui-slide-choice" :class="{ answered }">
    <!-- 庆祝动画 -->
    <div v-if="showCelebration" class="celebration-overlay">
      <div class="celebration-stars">
        <span v-for="i in 12" :key="i" class="star" :style="{ '--delay': i * 0.1 + 's' }">⭐</span>
      </div>
      <div class="celebration-text">🎉 太棒了！</div>
    </div>
    
    <!-- 问题 -->
    <div class="question-section" v-if="question">
      <div class="question-icon">❓</div>
      <p class="question-text">{{ question }}</p>
      <button class="speak-btn" @click="speakQuestion" :class="{ speaking: isSpeaking }">
        <el-icon><Microphone /></el-icon>
        {{ isSpeaking ? '朗读中...' : '朗读题目' }}
      </button>
    </div>
    
    <!-- 选项网格 -->
    <div 
      class="options-grid"
      :class="`grid-cols-${gridColumns}`"
    >
      <button
        v-for="option in options"
        :key="option.id"
        class="option-card"
        :class="{
          selected: selectedId === option.id,
          correct: answered && option.isCorrect,
          wrong: answered && selectedId === option.id && !option.isCorrect
        }"
        :disabled="answered"
        @click="selectOption(option.id)"
      >
        <!-- 选项图片 -->
        <div class="option-image" v-if="option.image">
          <img :src="option.image" :alt="getOptionText(option)" />
        </div>
        
        <!-- 选项文字 -->
        <div class="option-content">
          <span class="option-text">{{ getOptionText(option) }}</span>
        </div>
        
        <!-- 选中/正确/错误图标 -->
        <div class="option-status">
          <el-icon v-if="selectedId === option.id && !answered" class="status-selected">
            <CircleCheck />
          </el-icon>
          <el-icon v-if="answered && option.isCorrect" class="status-correct">
            <SuccessFilled />
          </el-icon>
          <el-icon v-if="answered && selectedId === option.id && !option.isCorrect" class="status-wrong">
            <CircleCloseFilled />
          </el-icon>
        </div>
      </button>
    </div>
    
    <!-- 提示文字 -->
    <div class="hint-section" v-if="hint && !answered">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ hint }}</span>
    </div>
    
    <!-- 答题反馈 -->
    <div v-if="answered" class="feedback-section" :class="isCorrect ? 'success' : 'failed'">
      <div class="feedback-icon">{{ isCorrect ? '🎉' : '💪' }}</div>
      <div class="feedback-text">
        <h3>{{ isCorrect ? '回答正确！太棒了！' : '再想想哦，没关系！' }}</h3>
        <p v-if="explanation">{{ explanation }}</p>
      </div>
      <div class="feedback-stars" v-if="isCorrect">
        <span v-for="i in 3" :key="i" class="star">⭐</span>
      </div>
    </div>
    
    <!-- 提交按钮 -->
    <div class="action-section" v-if="!answered">
      <button 
        class="submit-btn"
        :disabled="!selectedId"
        @click="submitAnswer"
      >
        <span>提交答案</span>
        <el-icon><Check /></el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Check, InfoFilled, CircleCheck, SuccessFilled, CircleCloseFilled, Microphone } from '@element-plus/icons-vue';
import { playSound, speak, stopSpeak } from '@/utils/curriculum-audio';

interface Option {
  id: string;
  text?: string;
  content?: string;
  image?: string;
  isCorrect?: boolean;
}

interface Props {
  id: string;
  question?: string;
  options: Option[];
  hint?: string;
  explanation?: string;
  points?: number;
  theme?: string;
  autoSpeak?: boolean;  // 自动朗读题目
}

const props = withDefaults(defineProps<Props>(), {
  points: 10,
  theme: 'colorful',
  autoSpeak: true
});

const emit = defineEmits<{
  (e: 'answer', result: { isCorrect: boolean; score: number }): void;
}>();

// 状态
const selectedId = ref('');
const answered = ref(false);
const isCorrect = ref(false);
const isSpeaking = ref(false);
const showCelebration = ref(false);

// 计算属性
const gridColumns = computed(() => {
  const count = props.options.length;
  const hasImages = props.options.some(o => o.image);
  if (count <= 2) return 2;
  if (count <= 4) return hasImages ? 2 : 2;
  return 3;
});

// 方法
function getOptionText(option: Option): string {
  return option.text || option.content || '';
}

function selectOption(optionId: string) {
  if (answered.value) return;
  playSound('click');
  selectedId.value = optionId;
}

function submitAnswer() {
  if (!selectedId.value || answered.value) return;
  
  const selectedOption = props.options.find(o => o.id === selectedId.value);
  isCorrect.value = selectedOption?.isCorrect === true;
  answered.value = true;
  
  // 播放反馈音效
  if (isCorrect.value) {
    playSound('correct');
    showCelebration.value = true;
    setTimeout(() => {
      showCelebration.value = false;
    }, 2000);
    // 朗读正确反馈
    speak('太棒了！回答正确！', { rate: 1.0, pitch: 1.2 });
  } else {
    playSound('wrong');
    // 朗读错误反馈
    speak('没关系，再想想哦！', { rate: 0.9, pitch: 1.0 });
  }
  
  emit('answer', {
    isCorrect: isCorrect.value,
    score: isCorrect.value ? props.points : 0
  });
}

// 朗读题目
function speakQuestion() {
  if (isSpeaking.value) {
    stopSpeak();
    isSpeaking.value = false;
    return;
  }
  
  const text = props.question || '请选择正确的答案';
  isSpeaking.value = true;
  speak(text, {
    rate: 0.85,
    pitch: 1.1,
    onEnd: () => {
      isSpeaking.value = false;
    }
  });
}

// 组件挂载时自动朗读
onMounted(() => {
  if (props.autoSpeak && props.question) {
    setTimeout(() => {
      speakQuestion();
    }, 500);
  }
});

// 清理
watch(() => props.question, () => {
  stopSpeak();
  answered.value = false;
  selectedId.value = '';
  isCorrect.value = false;
});
</script>

<style scoped lang="scss">
.a2ui-slide-choice {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 0;
}

// 问题区域
.question-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f5f7ff 0%, #ede9fe 100%);
  border-radius: 16px;
  
  .question-icon {
    font-size: 40px;
    flex-shrink: 0;
  }
  
  .question-text {
    font-size: 28px;
    font-weight: 600;
    color: #333;
    margin: 0;
    line-height: 1.5;
  }
}

// 选项网格
.options-grid {
  display: grid;
  gap: 24px;
  
  &.grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  &.grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

// 选项卡片
.option-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: #ffffff;
  border: 4px solid #e4e7ed;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 120px;
  
  &:hover:not(:disabled) {
    border-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
  }
  
  &.selected {
    border-color: #667eea;
    background: linear-gradient(135deg, #f5f7ff 0%, #ede9fe 100%);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }
  
  &.correct {
    border-color: #52c41a;
    background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
    animation: optionCorrect 0.6s ease;
  }
  
  &.wrong {
    border-color: #ff4d4f;
    background: linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%);
    animation: optionWrong 0.5s ease;
  }
  
  &:disabled {
    cursor: default;
  }
  
  .option-image {
    width: 100%;
    max-height: 200px;
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .option-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .option-text {
      font-size: 28px;
      font-weight: 600;
      color: #333;
      text-align: center;
      line-height: 1.4;
    }
  }
  
  .option-status {
    position: absolute;
    top: 12px;
    right: 12px;
    
    .el-icon {
      font-size: 32px;
    }
    
    .status-selected {
      color: #667eea;
    }
    
    .status-correct {
      color: #52c41a;
    }
    
    .status-wrong {
      color: #ff4d4f;
    }
  }
}

// 提示区域
.hint-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 12px;
  font-size: 24px;
  color: #e65100;
  
  .el-icon {
    font-size: 28px;
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
      font-size: 24px;
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

.submit-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 48px;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .el-icon {
    font-size: 28px;
  }
}

// 语音按钮
.speak-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: auto;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }
  
  &.speaking {
    animation: pulse 1s ease-in-out infinite;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
@keyframes optionCorrect {
  0% { transform: scale(1); }
  25% { transform: scale(1.05); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

@keyframes optionWrong {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
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
