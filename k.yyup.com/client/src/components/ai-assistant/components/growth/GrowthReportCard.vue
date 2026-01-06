<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { GrowthReport, growthRecordsApi } from '@/api/modules/growth-records'
import { useDesignStore } from '@/stores/design'

// Props
interface Props {
  studentId: number
  months?: number
}

const props = withDefaults(defineProps<Props>(), {
  months: 6
})

// Design store for theming
const designStore = useDesignStore()
const isDark = computed(() => designStore.darkMode)

// Refs
const report = ref<GrowthReport | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Format date
const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Calculate age string
const getAgeString = (months: number | undefined) => {
  if (!months) return '-'
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years > 0) {
    return `${years}岁${remainingMonths}个月`
  }
  return `${months}个月`
}

// Get level color
const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    '优秀': '#52c41a',
    '良好': '#667eea',
    '中等': '#faad14',
    '偏下': '#ff7a45',
    '需关注': '#ff4d4f',
    '正常': '#52c41a',
    '偏瘦': '#ff7a45',
    '偏胖': '#ff4d4f'
  }
  return colors[level] || '#667eea'
}

// Get trend icon
const getTrendIcon = (change: number) => {
  if (change > 0) return '↑'
  if (change < 0) return '↓'
  return '→'
}

// Get trend color
const getTrendColor = (change: number) => {
  if (change > 0) return 'positive'
  if (change < 0) return 'negative'
  return 'neutral'
}

// Fetch report data
const fetchReport = async () => {
  if (!props.studentId) return

  loading.value = true
  error.value = null

  try {
    const response = await growthRecordsApi.getGrowthReport(props.studentId, { months: props.months })
    if (response.data?.data) {
      report.value = response.data.data as GrowthReport
    }
  } catch (err: any) {
    error.value = err.message || '获取成长报告失败'
    console.error('Failed to fetch growth report:', err)
  } finally {
    loading.value = false
  }
}

// Refresh
const refresh = () => {
  fetchReport()
}

// Watch for student ID changes
watch(() => props.studentId, () => {
  fetchReport()
}, { immediate: false })

// Lifecycle
onMounted(() => {
  fetchReport()
})

// Expose
defineExpose({
  refresh
})
</script>

<template>
  <div class="growth-report-card" :class="{ 'dark-mode': isDark }">
    <!-- Header -->
    <div class="report-header">
      <div class="student-info" v-if="report?.student">
        <span class="student-avatar">
          {{ report.student.name?.charAt(0) || 'S' }}
        </span>
        <div class="student-details">
          <span class="student-name">{{ report.student.name }}</span>
          <span class="student-meta">
            {{ report.student.gender === 1 ? '男' : '女' }} ·
            {{ getAgeString(report.student.ageInMonths) }}
          </span>
        </div>
      </div>
      <div class="report-period">近{{ months }}个月报告</div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="report-loading">
      <div class="loading-spinner"></div>
      <span>正在生成成长报告...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="report-error">
      <span class="error-icon">!</span>
      <span>{{ error }}</span>
      <button class="retry-btn" @click="fetchReport">重新加载</button>
    </div>

    <!-- Report content -->
    <div v-else-if="report" class="report-content">
      <!-- Latest measurements -->
      <div class="section latest-measurements">
        <h3 class="section-title">最新测量数据</h3>
        <div class="measurement-cards">
          <div class="measurement-card" v-if="report.latestRecord?.height">
            <div class="measurement-icon height">📏</div>
            <div class="measurement-info">
              <span class="measurement-label">身高</span>
              <span class="measurement-value">{{ report.latestRecord.height }} <small>cm</small></span>
              <span class="measurement-percentile">
                超过{{ report.latestRecord.heightPercentile?.toFixed(0) }}%同龄儿童
              </span>
            </div>
          </div>

          <div class="measurement-card" v-if="report.latestRecord?.weight">
            <div class="measurement-icon weight">⚖️</div>
            <div class="measurement-info">
              <span class="measurement-label">体重</span>
              <span class="measurement-value">{{ report.latestRecord.weight }} <small>kg</small></span>
              <span class="measurement-percentile">
                超过{{ report.latestRecord.weightPercentile?.toFixed(0) }}%同龄儿童
              </span>
            </div>
          </div>

          <div class="measurement-card" v-if="report.latestRecord?.bmi">
            <div class="measurement-icon bmi">📊</div>
            <div class="measurement-info">
              <span class="measurement-label">BMI</span>
              <span class="measurement-value">{{ report.latestRecord.bmi }}</span>
              <span class="measurement-level" :style="{ color: getLevelColor(report.advice.bmi?.level || '') }">
                {{ report.advice.bmi?.level || '正常' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trends -->
      <div class="section trends-section" v-if="report.trends">
        <h3 class="section-title">成长趋势</h3>

        <div class="trend-item" v-if="report.trends.height.values.length > 0">
          <div class="trend-header">
            <span class="trend-label">身高变化</span>
            <span class="trend-change" :class="getTrendColor(report.trends.height.change)">
              {{ getTrendIcon(report.trends.height.change) }}
              {{ Math.abs(report.trends.height.change) }}cm
            </span>
          </div>
          <div class="trend-bar">
            <div
              class="trend-progress height"
              :style="{ width: `${Math.min(Math.abs(report.trends.height.change) * 10, 100)}%` }"
            ></div>
          </div>
          <div class="trend-dates">
            {{ report.trends.height.dates[0] || '-' }} → {{ report.trends.height.dates[report.trends.height.dates.length - 1] || '-' }}
          </div>
        </div>

        <div class="trend-item" v-if="report.trends.weight.values.length > 0">
          <div class="trend-header">
            <span class="trend-label">体重变化</span>
            <span class="trend-change" :class="getTrendColor(report.trends.weight.change)">
              {{ getTrendIcon(report.trends.weight.change) }}
              {{ Math.abs(report.trends.weight.change).toFixed(1) }}kg
            </span>
          </div>
          <div class="trend-bar">
            <div
              class="trend-progress weight"
              :style="{ width: `${Math.min(Math.abs(report.trends.weight.change) * 20, 100)}%` }"
            ></div>
          </div>
          <div class="trend-dates">
            {{ report.trends.weight.dates[0] || '-' }} → {{ report.trends.weight.dates[report.trends.weight.dates.length - 1] || '-' }}
          </div>
        </div>
      </div>

      <!-- Development advice -->
      <div class="section advice-section" v-if="report.advice">
        <h3 class="section-title">发育评估建议</h3>

        <div class="advice-item" v-if="report.advice.height">
          <div class="advice-header">
            <span class="advice-icon">📈</span>
            <span class="advice-title">身高发育</span>
            <span class="advice-badge" :style="{ background: getLevelColor(report.advice.height.level) }">
              {{ report.advice.height.level }}
            </span>
          </div>
          <p class="advice-content">{{ report.advice.height.advice }}</p>
        </div>

        <div class="advice-item" v-if="report.advice.weight">
          <div class="advice-header">
            <span class="advice-icon">⚖️</span>
            <span class="advice-title">体重发育</span>
            <span class="advice-badge" :style="{ background: getLevelColor(report.advice.weight.level) }">
              {{ report.advice.weight.level }}
            </span>
          </div>
          <p class="advice-content">{{ report.advice.weight.advice }}</p>
        </div>

        <div class="advice-item" v-if="report.advice.bmi">
          <div class="advice-header">
            <span class="advice-icon">📊</span>
            <span class="advice-title">体型评估</span>
            <span class="advice-badge" :style="{ background: getLevelColor(report.advice.bmi.level) }">
              {{ report.advice.bmi.level }}
            </span>
          </div>
          <p class="advice-content">{{ report.advice.bmi.advice }}</p>
        </div>
      </div>

      <!-- Summary footer -->
      <div class="report-footer">
        <span class="record-count">共 {{ report.recordsCount }} 条测量记录</span>
        <span class="update-time">更新于 {{ formatDate(report.latestRecord?.date) }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="report-empty">
      <span class="empty-icon">📋</span>
      <span>暂无成长报告数据</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.growth-report-card {
  background: var(--ai-card-bg, #ffffff);
  border-radius: 12px;
  overflow: hidden;

  &.dark-mode {
    background: var(--ai-card-bg-dark, #1a1a2e);
  }
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ai-border-color, #e8e8e8);

  .student-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .student-avatar {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--ai-primary, #667eea), var(--ai-secondary, #f093fb));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 16px;
  }

  .student-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .student-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--ai-text-primary, #333);
  }

  .student-meta {
    font-size: 13px;
    color: var(--ai-text-secondary, #666);
  }

  .report-period {
    font-size: 13px;
    color: var(--ai-text-secondary, #666);
    padding: 4px 12px;
    background: var(--ai-bg-light, #f5f5f5);
    border-radius: 12px;
  }
}

.report-loading,
.report-error,
.report-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: var(--ai-text-secondary, #666);
}

.report-loading {
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--ai-border-color, #e8e8e8);
    border-top-color: var(--ai-primary, #667eea);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.report-error {
  .error-icon {
    width: 32px;
    height: 32px;
    background: var(--ai-danger, #ff6b6b);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .retry-btn {
    margin-top: 8px;
    padding: 6px 16px;
    background: var(--ai-primary, #667eea);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;

    &:hover {
      opacity: 0.9;
    }
  }
}

.report-empty {
  .empty-icon {
    font-size: 48px;
    opacity: 0.5;
  }
}

.report-content {
  padding: 16px;
}

.section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ai-text-primary, #333);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ai-border-color, #e8e8e8);
}

.measurement-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.measurement-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--ai-bg-light, #f8f9fa);
  border-radius: 10px;

  .measurement-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;

    &.height {
      background: rgba(102, 126, 234, 0.15);
    }

    &.weight {
      background: rgba(240, 147, 251, 0.15);
    }

    &.bmi {
      background: rgba(82, 196, 26, 0.15);
    }
  }

  .measurement-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .measurement-label {
    font-size: 12px;
    color: var(--ai-text-secondary, #666);
  }

  .measurement-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--ai-text-primary, #333);

    small {
      font-size: 12px;
      font-weight: normal;
      color: var(--ai-text-secondary, #666);
    }
  }

  .measurement-percentile,
  .measurement-level {
    font-size: 11px;
    color: var(--ai-primary, #667eea);
  }
}

.trend-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.trend-label {
  font-size: 13px;
  color: var(--ai-text-primary, #333);
}

.trend-change {
  font-size: 14px;
  font-weight: 600;

  &.positive {
    color: #52c41a;
  }

  &.negative {
    color: #ff4d4f;
  }

  &.neutral {
    color: var(--ai-text-secondary, #666);
  }
}

.trend-bar {
  height: 6px;
  background: var(--ai-border-color, #e8e8e8);
  border-radius: 3px;
  overflow: hidden;
}

.trend-progress {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;

  &.height {
    background: linear-gradient(90deg, var(--ai-primary, #667eea), #8b9ff9);
  }

  &.weight {
    background: linear-gradient(90deg, var(--ai-secondary, #f093fb), #f5b8f5);
  }
}

.trend-dates {
  margin-top: 4px;
  font-size: 11px;
  color: var(--ai-text-secondary, #666);
  text-align: right;
}

.advice-item {
  padding: 12px;
  background: var(--ai-bg-light, #f8f9fa);
  border-radius: 10px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.advice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.advice-icon {
  font-size: 16px;
}

.advice-title {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: var(--ai-text-primary, #333);
}

.advice-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  color: white;
  font-weight: 500;
}

.advice-content {
  margin: 0;
  font-size: 12px;
  color: var(--ai-text-secondary, #666);
  line-height: 1.5;
}

.report-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--ai-bg-light, #f5f5f5);
  border-top: 1px solid var(--ai-border-color, #e8e8e8);

  .record-count,
  .update-time {
    font-size: 12px;
    color: var(--ai-text-secondary, #666);
  }
}
</style>
