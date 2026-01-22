<template>
  <div class="a2ui-slide-navigation" :class="`theme-${theme}`">
    <!-- 左侧：得分显示 -->
    <div class="nav-left">
      <div class="score-display" v-if="showScore">
        <el-icon><Trophy /></el-icon>
        <span class="score-value">{{ score }}</span>
        <span class="score-max">/ {{ maxScore }}</span>
      </div>
    </div>
    
    <!-- 中间：页码指示器 -->
    <div class="nav-center">
      <div class="page-indicator">
        <span class="page-current">{{ currentPage }}</span>
        <span class="page-separator">/</span>
        <span class="page-total">{{ totalPages }}</span>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>
    
    <!-- 右侧：导航按钮 -->
    <div class="nav-right">
      <button 
        class="nav-btn prev-btn"
        :disabled="!canGoPrev"
        @click="handlePrev"
      >
        <el-icon><ArrowLeft /></el-icon>
        <span>上一页</span>
      </button>
      
      <button 
        class="nav-btn next-btn"
        :disabled="!canGoNext"
        :class="{ 'is-last': isLastPage }"
        @click="handleNext"
      >
        <span>{{ isLastPage ? '完成' : '下一页' }}</span>
        <el-icon>
          <component :is="isLastPage ? 'Check' : 'ArrowRight'" />
        </el-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft, ArrowRight, Trophy, Check } from '@element-plus/icons-vue';
import { playSound } from '@/utils/curriculum-audio';

interface Props {
  currentPage: number;
  totalPages: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  showScore?: boolean;
  score?: number;
  maxScore?: number;
  theme?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showScore: true,
  score: 0,
  maxScore: 100,
  theme: 'colorful'
});

const emit = defineEmits<{
  (e: 'prev'): void;
  (e: 'next'): void;
  (e: 'goto', index: number): void;
}>();

// 带音效的导航
function handlePrev() {
  playSound('page');
  emit('prev');
}

function handleNext() {
  if (props.currentPage === props.totalPages) {
    playSound('complete');
  } else {
    playSound('page');
  }
  emit('next');
}

const progressPercentage = computed(() => {
  return (props.currentPage / props.totalPages) * 100;
});

const isLastPage = computed(() => {
  return props.currentPage === props.totalPages;
});
</script>

<style scoped lang="scss">
.a2ui-slide-navigation {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 10;
  
  &.theme-colorful {
    background: rgba(255, 255, 255, 0.95);
  }
  
  &.theme-dark {
    background: rgba(26, 26, 46, 0.95);
    border-top-color: rgba(255, 255, 255, 0.1);
    
    .score-display,
    .page-indicator {
      color: #ffffff;
    }
    
    .progress-bar {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

// 左侧得分
.nav-left {
  flex: 1;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  
  .el-icon {
    font-size: 28px;
    color: #faad14;
  }
  
  .score-value {
    color: #52c41a;
    font-size: 32px;
  }
  
  .score-max {
    color: #999;
    font-size: 20px;
  }
}

// 中间页码
.nav-center {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.page-indicator {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  
  .page-current {
    color: #667eea;
    font-size: 28px;
  }
  
  .page-separator {
    margin: 0 4px;
    color: #999;
  }
  
  .page-total {
    color: #666;
  }
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }
}

// 右侧按钮
.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 20px;
  font-weight: 600;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.prev-btn {
    color: #667eea;
    background: #f5f7ff;
    border: 2px solid #667eea;
    
    &:hover:not(:disabled) {
      background: #ede9fe;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &.next-btn {
    color: #ffffff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &.is-last {
      background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4);
      
      &:hover:not(:disabled) {
        box-shadow: 0 6px 16px rgba(82, 196, 26, 0.5);
      }
    }
  }
  
  .el-icon {
    font-size: 22px;
  }
}
</style>
