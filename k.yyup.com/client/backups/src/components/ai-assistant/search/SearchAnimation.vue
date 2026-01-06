<!--
  搜索动画组件
  用于显示网络搜索的进度和结果
-->

<template>
  <div class="search-animation">
    <!-- 搜索开始阶段 -->
    <div v-if="status === 'start'" class="search-start">
      <div class="search-header">
        <div class="search-icon-wrapper">
          <UnifiedIcon name="search" :size="16" />
        </div>
        <div class="search-text">
          <p class="title">🔍 正在搜索网络信息</p>
          <p class="subtitle">{{ message }}</p>
        </div>
      </div>
      <div class="search-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>

    <!-- 搜索进度阶段 -->
    <div v-else-if="status === 'progress'" class="search-progress">
      <div class="progress-header">
        <div class="progress-icon">
          <UnifiedIcon name="search" :size="16" />
        </div>
        <div class="progress-info">
          <p class="progress-title">搜索进行中</p>
          <p class="progress-message">{{ message }}</p>
        </div>
      </div>
      
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: percentage + '%' }"></div>
        </div>
        <span class="progress-percentage">{{ percentage }}%</span>
      </div>

      <div class="search-keywords">
        <span class="keyword-label">搜索关键词：</span>
        <span class="keyword-text">{{ query }}</span>
      </div>
    </div>

    <!-- 搜索完成阶段 -->
    <div v-else-if="status === 'complete'" class="search-complete">
      <div class="complete-header">
        <div class="complete-icon">
          <el-icon class="success-icon"><CircleCheck /></el-icon>
        </div>
        <div class="complete-info">
          <p class="complete-title">✅ 搜索完成</p>
          <p class="complete-message">{{ message }}</p>
        </div>
      </div>

      <div v-if="resultCount" class="result-summary">
        <span class="result-count">找到 <strong>{{ resultCount }}</strong> 个相关结果</span>
      </div>

      <div v-if="results && results.length > 0" class="search-results">
        <div v-for="(result, index) in results" :key="index" class="result-item">
          <div class="result-title">{{ result.title }}</div>
          <div class="result-snippet">{{ result.snippet }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  status?: 'start' | 'progress' | 'complete'
  message?: string
  percentage?: number
  query?: string
  resultCount?: number
  results?: Array<{ title: string; snippet: string }>
}

const props = withDefaults(defineProps<Props>(), {
  status: 'start',
  message: '正在分析搜索关键词...',
  percentage: 0,
  query: '',
  resultCount: 0,
  results: () => []
})
</script>

<style scoped lang="scss">
.search-animation {
  width: 100%;
  padding: var(--text-lg);
  background: linear-gradient(135deg, var(--bg-container) 0%, #f9fafb 100%);
  border-radius: var(--text-sm);
  margin: var(--text-sm) 0;
  border: var(--border-width-base) solid #e4e7eb;

  // ==================== 搜索开始阶段 ====================
  .search-start {
    animation: slideIn 0.3s ease-out;

    .search-header {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--text-lg);

      .search-icon-wrapper {
        width: var(--icon-size); height: var(--icon-size);
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
        border-radius: var(--radius-full);
        animation: pulse 2s ease-in-out infinite;

        .search-icon {
          font-size: var(--text-3xl);
          color: white;
        }
      }

      .search-text {
        flex: 1;

        .title {
          margin: 0;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
        }

        .subtitle {
          margin: var(--spacing-xs) 0 0 0;
          font-size: var(--text-base);
          color: var(--info-color);
        }
      }
    }

    .search-dots {
      display: flex;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--text-sm) 0;

      .dot {
        width: var(--spacing-sm);
        height: var(--spacing-sm);
        background: var(--primary-color);
        border-radius: var(--radius-full);
        animation: bounce 1.4s infinite;

        &:nth-child(1) {
          animation-delay: 0s;
        }

        &:nth-child(2) {
          animation-delay: 0.2s;
        }

        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }

  // ==================== 搜索进度阶段 ====================
  .search-progress {
    animation: slideIn 0.3s ease-out;

    .progress-header {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--text-lg);

      .progress-icon {
        width: var(--icon-size); height: var(--icon-size);
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e6f7ff;
        border-radius: var(--radius-full);

        .searching-icon {
          font-size: var(--text-2xl);
          color: var(--primary-color);
          animation: spin 2s linear infinite;
        }
      }

      .progress-info {
        flex: 1;

        .progress-title {
          margin: 0;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-message {
          margin: var(--spacing-xs) 0 0 0;
          font-size: var(--text-sm);
          color: var(--info-color);
        }
      }
    }

    .progress-bar-container {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--text-sm);

      .progress-bar {
        flex: 1;
        height: 6px;
        background: var(--bg-gray-light);
        border-radius: var(--radius-xs);
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%);
          border-radius: var(--radius-xs);
          transition: width 0.3s ease;
          box-shadow: 0 0 var(--spacing-sm) rgba(64, 158, 255, 0.4);
        }
      }

      .progress-percentage {
        font-size: var(--text-sm);
        font-weight: 600;
        color: var(--primary-color);
        min-width: 35px;
        text-align: right;
      }
    }

    .search-keywords {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) var(--text-sm);
      background: white;
      border-radius: var(--radius-md);
      border: var(--border-width-base) solid var(--border-color-lighter);

      .keyword-label {
        font-size: var(--text-sm);
        color: var(--info-color);
        font-weight: 500;
      }

      .keyword-text {
        font-size: var(--text-sm);
        color: var(--text-primary);
        font-weight: 600;
        word-break: break-all;
      }
    }
  }

  // ==================== 搜索完成阶段 ====================
  .search-complete {
    animation: slideIn 0.3s ease-out;

    .complete-header {
      display: flex;
      align-items: center;
      gap: var(--text-sm);
      margin-bottom: var(--text-lg);

      .complete-icon {
        width: var(--icon-size); height: var(--icon-size);
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f9ff;
        border-radius: var(--radius-full);
        animation: scaleIn 0.4s ease-out;

        .success-icon {
          font-size: var(--text-3xl);
          color: var(--success-color);
        }
      }

      .complete-info {
        flex: 1;

        .complete-title {
          margin: 0;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }

        .complete-message {
          margin: var(--spacing-xs) 0 0 0;
          font-size: var(--text-sm);
          color: var(--info-color);
        }
      }
    }

    .result-summary {
      padding: var(--text-sm);
      background: white;
      border-radius: var(--radius-md);
      border-left: 3px solid var(--success-color);
      margin-bottom: var(--text-sm);

      .result-count {
        font-size: var(--text-sm);
        color: var(--text-regular);

        strong {
          color: var(--success-color);
          font-weight: 600;
        }
      }
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);

      .result-item {
        padding: var(--spacing-2xl) var(--text-sm);
        background: white;
        border-radius: var(--radius-md);
        border: var(--border-width-base) solid var(--border-color-lighter);
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: 0 2px var(--spacing-sm) rgba(64, 158, 255, 0.1);
        }

        .result-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--spacing-xs);
          word-break: break-word;
        }

        .result-snippet {
          font-size: var(--text-sm);
          color: var(--info-color);
          line-height: 1.5;
          word-break: break-word;
        }
      }
    }
  }
}

// ==================== 动画定义 ====================
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    opacity: 0.5;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-var(--spacing-sm));
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

