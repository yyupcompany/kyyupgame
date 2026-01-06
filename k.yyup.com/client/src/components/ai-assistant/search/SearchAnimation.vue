<!--
  搜索动画组件
  用于显示网络搜索的进度和结果
  支持折叠/展开查看详细结果
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
          <UnifiedIcon name="Check" />
        </div>
        <div class="complete-info">
          <p class="complete-title">搜索完成</p>
          <p class="complete-message">{{ message }}</p>
        </div>
      </div>

      <!-- 搜索结果摘要 - 可点击展开 -->
      <div v-if="resultCount" class="result-summary" @click="toggleExpand">
        <div class="summary-content">
          <UnifiedIcon :name="isExpanded ? 'angle-down' : 'angle-right'" :size="14" class="expand-icon" />
          <span class="summary-text">
            已搜索到 <strong class="result-count">{{ resultCount }}</strong> 条相关信息
          </span>
          <span v-if="query" class="search-query-tag">"{{ query }}"</span>
        </div>
        <span class="expand-hint">{{ isExpanded ? '点击收起' : '点击查看详情' }}</span>
      </div>

      <!-- 搜索结果详情 - 可折叠 -->
      <Transition name="expand">
        <div v-if="isExpanded && results && results.length > 0" class="search-results">
          <div
            v-for="(result, index) in results"
            :key="index"
            class="result-item"
            @click="handleResultClick(result)"
          >
            <div class="result-header">
              <span class="result-index">{{ index + 1 }}</span>
              <div class="result-title">{{ result.title }}</div>
            </div>
            <div class="result-snippet">{{ result.snippet }}</div>
            <div v-if="result.url" class="result-url">
              <UnifiedIcon name="link" :size="12" />
              <span>{{ result.url }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  status?: 'start' | 'progress' | 'complete'
  message?: string
  percentage?: number
  query?: string
  resultCount?: number
  results?: Array<{ title: string; snippet: string; url?: string }>
}

const props = withDefaults(defineProps<Props>(), {
  status: 'start',
  message: '正在分析搜索关键词...',
  percentage: 0,
  query: '',
  resultCount: 0,
  results: () => []
})

// 展开/收起状态
const isExpanded = ref(false)

// 切换展开状态
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 点击结果项
const handleResultClick = (result: { title: string; snippet: string; url?: string }) => {
  if (result.url) {
    window.open(result.url, '_blank')
  }
}
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.search-animation {
  width: 100%;
  padding: var(--text-lg);
  background: linear-gradient(135deg, var(--bg-container) 0%, var(--bg-primary) 100%);
  border-radius: var(--text-sm);
  margin: var(--text-sm) 0;
  border: var(--border-width) solid #e4e7eb;

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
          color: var(--text-on-primary);
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
        background: var(--primary-color-light);
        border-radius: var(--radius-full);

        .searching-icon {
          font-size: var(--spacing-xl);
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
        min-height: 32px; height: auto;
        background: var(--bg-gray-light);
        border-radius: var(--radius-xs);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;

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
        min-width: auto;
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
      border: var(--border-width) solid var(--border-color-lighter);

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
        background: var(--bg-primary);
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm) var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--radius-md);
      border: var(--border-width) solid var(--border-color);
      cursor: pointer;
      transition: all var(--transition-fast) ease;

      &:hover {
        background: var(--bg-hover);
        border-color: var(--primary-color-light-5);
      }

      .summary-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .expand-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .summary-text {
          font-size: var(--text-sm);
          color: var(--text-primary);

          .result-count {
            color: var(--success-color);
            font-weight: 600;
          }
        }

        .search-query-tag {
          padding: 2px var(--spacing-xs);
          background: var(--primary-color-light-9);
          color: var(--primary-color);
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .expand-hint {
        font-size: var(--text-xs);
        color: var(--text-placeholder);
        flex-shrink: 0;
      }
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
      overflow: hidden;

      .result-item {
        padding: var(--spacing-md);
        background: var(--bg-primary);
        border-radius: var(--radius-md);
        border: var(--border-width) solid var(--border-color-lighter);
        transition: all var(--transition-fast) ease;
        cursor: pointer;

        &:hover {
          border-color: var(--primary-color-light-5);
          background: var(--bg-secondary);
        }

        .result-header {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);

          .result-index {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 20px;
            height: 20px;
            padding: 0 6px;
            background: var(--primary-color);
            color: var(--text-on-primary);
            border-radius: var(--radius-sm);
            font-size: 12px;
            font-weight: 600;
            flex-shrink: 0;
          }

          .result-title {
            flex: 1;
            font-size: var(--text-sm);
            font-weight: 600;
            color: var(--primary-color);
            line-height: 1.4;
            word-break: break-word;
          }
        }

        .result-snippet {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
          padding-left: 28px;
          word-break: break-word;
        }

        .result-url {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-top: var(--spacing-sm);
          padding-left: 28px;
          font-size: var(--text-xs);
          color: var(--text-placeholder);

          .el-icon,
          svg {
            color: var(--text-tertiary);
          }
        }
      }
    }
  }
}

// ==================== 展开动画 ====================
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

// ==================== 动画定义 ====================
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(var(--position-negative-2xl));
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

