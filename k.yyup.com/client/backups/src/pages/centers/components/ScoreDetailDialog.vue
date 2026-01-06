<template>
  <el-dialog
    v-model="visible"
    :title="`📊 ${document?.title || document?.name} - AI评分详情`"
    width="800px"
    :close-on-click-modal="false"
  >
    <div v-if="document?.result" class="score-detail">
      <!-- 总分和等级 -->
      <div class="score-header">
        <div class="score-display">
          <div class="score-number" :class="getScoreClass(document.score)">
            {{ document.score }}
          </div>
          <div class="score-label">综合评分</div>
        </div>
        <div class="grade-display">
          <el-tag :type="getGradeType(document.grade)" size="large">
            {{ getGradeLabel(document.grade) }}
          </el-tag>
        </div>
      </div>

      <!-- 分类评分 -->
      <div v-if="document.result.categoryScores" class="category-scores">
        <div class="section-title">📈 分类评分</div>
        <div class="category-list">
          <div
            v-for="(score, category) in document.result.categoryScores"
            :key="category"
            class="category-item"
          >
            <div class="category-name">{{ category }}</div>
            <el-progress
              :percentage="score"
              :color="getProgressColor(score)"
              :stroke-width="20"
            />
          </div>
        </div>
      </div>

      <!-- 总体评价 -->
      <div v-if="document.result.summary" class="summary-section">
        <div class="section-title">💡 总体评价</div>
        <div class="summary-content">{{ document.result.summary }}</div>
      </div>

      <!-- 风险点 -->
      <div v-if="document.result.risks && document.result.risks.length > 0" class="risks-section">
        <div class="section-title">⚠️ 风险点</div>
        <div class="risk-list">
          <div
            v-for="(risk, index) in document.result.risks"
            :key="index"
            class="risk-item"
            :class="`level-${risk.level}`"
          >
            <div class="risk-header">
              <el-tag :type="getRiskTagType(risk.level)" size="small">
                {{ getRiskLevelLabel(risk.level) }}
              </el-tag>
            </div>
            <div class="risk-description">{{ risk.description }}</div>
            <div v-if="risk.suggestion" class="risk-suggestion">
              <strong>整改建议：</strong>{{ risk.suggestion }}
            </div>
          </div>
        </div>
      </div>

      <!-- 改进建议 -->
      <div v-if="document.result.suggestions && document.result.suggestions.length > 0" class="suggestions-section">
        <div class="section-title">📝 改进建议</div>
        <ul class="suggestion-list">
          <li v-for="(suggestion, index) in document.result.suggestions" :key="index">
            {{ suggestion }}
          </li>
        </ul>
      </div>

      <!-- 亮点 -->
      <div v-if="document.result.highlights && document.result.highlights.length > 0" class="highlights-section">
        <div class="section-title">✨ 亮点</div>
        <ul class="highlight-list">
          <li v-for="(highlight, index) in document.result.highlights" :key="index">
            {{ highlight }}
          </li>
        </ul>
      </div>

      <!-- 分析信息 -->
      <div class="meta-info">
        <div class="meta-item">
          <span class="label">AI模型：</span>
          <span class="value">豆包 1.6 Flash</span>
        </div>
        <div class="meta-item">
          <span class="label">分析时间：</span>
          <span class="value">{{ formatDateTime(document.createdAt) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="exportDetail">
        <el-icon><Download /></el-icon>
        导出详情
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';

interface Props {
  document: any;
}

const props = defineProps<Props>();
const visible = defineModel<boolean>('visible');

// 评分等级样式
const getScoreClass = (score: number) => {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'average';
  if (score >= 60) return 'poor';
  return 'unqualified';
};

// 等级标签
const getGradeLabel = (grade: string) => {
  const labels: Record<string, string> = {
    excellent: '优秀',
    good: '良好',
    average: '合格',
    poor: '基本合格',
    unqualified: '不合格'
  };
  return labels[grade] || grade;
};

// 等级标签类型
const getGradeType = (grade: string) => {
  const types: Record<string, any> = {
    excellent: 'success',
    good: 'primary',
    average: 'warning',
    poor: 'danger',
    unqualified: 'info'
  };
  return types[grade] || 'info';
};

// 进度条颜色
const getProgressColor = (score: number) => {
  if (score >= 90) return 'var(--success-color)';
  if (score >= 80) return 'var(--primary-color)';
  if (score >= 70) return 'var(--warning-color)';
  if (score >= 60) return 'var(--danger-color)';
  return 'var(--info-color)';
};

// 风险等级标签
const getRiskLevelLabel = (level: string) => {
  const labels: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  };
  return labels[level] || level;
};

// 风险标签类型
const getRiskTagType = (level: string) => {
  const types: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  };
  return types[level] || 'info';
};

// 格式化时间
const formatDateTime = (date: string) => {
  if (!date) return '--';
  return new Date(date).toLocaleString('zh-CN');
};

// 导出详情
const exportDetail = () => {
  ElMessage.info('导出功能开发中...');
};
</script>

<style scoped lang="scss">
.score-detail {
  .score-header {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: var(--text-3xl);
    background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    border-radius: var(--text-sm);
    margin-bottom: var(--text-3xl);

    .score-display {
      text-align: center;

      .score-number {
        font-size: 72px;
        font-weight: bold;
        color: white;
        line-height: 1;
        margin-bottom: var(--spacing-sm);
      }

      .score-label {
        color: var(--white-alpha-90);
        font-size: var(--text-lg);
      }
    }

    .grade-display {
      :deep(.el-tag) {
        font-size: var(--text-3xl);
        padding: var(--text-sm) var(--text-3xl);
        border: none;
      }
    }
  }

  .section-title {
    font-size: var(--text-lg);
    font-weight: 500;
    margin-bottom: var(--text-lg);
    color: var(--text-primary);
  }

  .category-scores {
    margin-bottom: var(--text-3xl);

    .category-list {
      display: flex;
      flex-direction: column;
      gap: var(--text-lg);
    }

    .category-item {
      .category-name {
        font-size: var(--text-base);
        color: var(--text-regular);
        margin-bottom: var(--spacing-sm);
      }
    }
  }

  .summary-section {
    margin-bottom: var(--text-3xl);

    .summary-content {
      padding: var(--text-lg);
      background: var(--bg-hover);
      border-radius: var(--spacing-sm);
      line-height: 1.8;
      color: var(--text-regular);
    }
  }

  .risks-section {
    margin-bottom: var(--text-3xl);

    .risk-list {
      display: flex;
      flex-direction: column;
      gap: var(--text-sm);
    }

    .risk-item {
      padding: var(--text-lg);
      border-radius: var(--spacing-sm);
      border-left: var(--spacing-xs) solid;

      &.level-high {
        background: #fef0f0;
        border-left-color: var(--danger-color);
      }

      &.level-medium {
        background: #fdf6ec;
        border-left-color: var(--warning-color);
      }

      &.level-low {
        background: #f4f4f5;
        border-left-color: var(--info-color);
      }

      .risk-header {
        margin-bottom: var(--spacing-sm);
      }

      .risk-description {
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
        line-height: 1.6;
      }

      .risk-suggestion {
        color: var(--text-regular);
        font-size: var(--text-sm);
        line-height: 1.6;

        strong {
          color: var(--text-primary);
        }
      }
    }
  }

  .suggestions-section,
  .highlights-section {
    margin-bottom: var(--text-3xl);

    ul {
      margin: 0;
      padding-left: var(--text-2xl);

      li {
        color: var(--text-regular);
        line-height: 2;
        margin-bottom: var(--spacing-xs);
      }
    }
  }

  .meta-info {
    display: flex;
    gap: var(--text-3xl);
    padding-top: var(--text-lg);
    border-top: var(--border-width-base) solid var(--border-color);
    font-size: var(--text-sm);

    .meta-item {
      .label {
        color: var(--info-color);
      }

      .value {
        color: var(--text-regular);
        margin-left: var(--spacing-xs);
      }
    }
  }
}
</style>

