<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  GrowthRecord,
  GrowthRecordType,
  growthRecordsApi,
  PeerComparisonResponse
} from '@/api/modules/growth-records'
import GrowthChart from './GrowthChart.vue'
import GrowthReportCard from './GrowthReportCard.vue'
import { useDesignStore } from '@/stores/design'

// Props
interface Props {
  studentId?: number
  initialType?: GrowthRecordType
}

const props = withDefaults(defineProps<Props>(), {
  initialType: GrowthRecordType.HEIGHT_WEIGHT
})

// Design store
const designStore = useDesignStore()
const isDark = computed(() => designStore.darkMode)

// Active tab
const activeTab = ref<'records' | 'chart' | 'report' | 'comparison'>('records')

// State
const records = ref<GrowthRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const selectedType = ref<GrowthRecordType>(props.initialType)

// Student list for selection (mock - in real app, fetch from API)
const studentList = ref<Array<{ id: number; name: string }>>([
  { id: 1, name: '小明' },
  { id: 2, name: '小红' },
  { id: 3, name: '小刚' }
])

// Current student for comparison
const comparisonData = ref<PeerComparisonResponse | null>(null)

// Query params
const queryParams = ref({
  studentId: props.studentId,
  type: selectedType.value,
  limit: 20,
  offset: 0
})

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Get type label
const getTypeLabel = (type: GrowthRecordType) => {
  const labels: Record<string, string> = {
    [GrowthRecordType.HEIGHT_WEIGHT]: '身高体重',
    [GrowthRecordType.PHYSICAL]: '体能测试',
    [GrowthRecordType.COGNITIVE]: '认知发展',
    [GrowthRecordType.SOCIAL]: '社会情感',
    [GrowthRecordType.LANGUAGE]: '语言发展',
    [GrowthRecordType.ART]: '艺术表现',
    [GrowthRecordType.CUSTOM]: '自定义'
  }
  return labels[type] || type
}

// Get type icon
const getTypeIcon = (type: GrowthRecordType) => {
  const icons: Record<string, string> = {
    [GrowthRecordType.HEIGHT_WEIGHT]: '📏',
    [GrowthRecordType.PHYSICAL]: '🏃',
    [GrowthRecordType.COGNITIVE]: '🧠',
    [GrowthRecordType.SOCIAL]: '👥',
    [GrowthRecordType.LANGUAGE]: '💬',
    [GrowthRecordType.ART]: '🎨',
    [GrowthRecordType.CUSTOM]: '📝'
  }
  return icons[type] || '📊'
}

// Fetch records
const fetchRecords = async () => {
  if (!queryParams.value.studentId) return

  loading.value = true
  error.value = null

  try {
    const response = await growthRecordsApi.getGrowthRecords(queryParams.value)
    if (response.data?.data) {
      records.value = response.data.data as GrowthRecord[]
    }
  } catch (err: any) {
    error.value = err.message || '获取成长记录失败'
    console.error('Failed to fetch growth records:', err)
  } finally {
    loading.value = false
  }
}

// Fetch comparison data
const fetchComparison = async () => {
  if (!queryParams.value.studentId) return

  try {
    const response = await growthRecordsApi.getPeerComparison(queryParams.value.studentId)
    if (response.data?.data) {
      comparisonData.value = response.data.data as PeerComparisonResponse
    }
  } catch (err: any) {
    console.error('Failed to fetch peer comparison:', err)
  }
}

// Handle student change
const handleStudentChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  queryParams.value.studentId = Number(target.value) || undefined
  fetchRecords()
  fetchComparison()
}

// Handle type change
const handleTypeChange = (type: GrowthRecordType) => {
  selectedType.value = type
  queryParams.value.type = type
  fetchRecords()
}

// Refresh all data
const refresh = () => {
  fetchRecords()
  fetchComparison()
}

// Tab change handler
const handleTabChange = (tab: typeof activeTab.value) => {
  activeTab.value = tab
  if (tab === 'chart' || tab === 'report') {
    fetchComparison()
  }
}

// Watch for student ID prop changes
watch(() => props.studentId, (newId) => {
  if (newId) {
    queryParams.value.studentId = newId
    fetchRecords()
    fetchComparison()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (props.studentId) {
    fetchRecords()
    fetchComparison()
  }
})

// Expose methods
defineExpose({
  refresh,
  setStudentId: (id: number) => {
    queryParams.value.studentId = id
    refresh()
  }
})
</script>

<template>
  <div class="growth-records-panel" :class="{ 'dark-mode': isDark }">
    <!-- Panel Header -->
    <div class="panel-header">
      <h2 class="panel-title">📈 成长档案</h2>

      <div class="header-controls">
        <!-- Student selector -->
        <select
          class="student-select"
          :value="queryParams.studentId || ''"
          @change="handleStudentChange"
        >
          <option value="" disabled>请选择学生</option>
          <option v-for="student in studentList" :key="student.id" :value="student.id">
            {{ student.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Type Filter -->
    <div class="type-filter" v-if="queryParams.studentId">
      <button
        v-for="type in Object.values(GrowthRecordType)"
        :key="type"
        class="type-btn"
        :class="{ active: selectedType === type }"
        @click="handleTypeChange(type)"
      >
        <span class="type-icon">{{ getTypeIcon(type as GrowthRecordType) }}</span>
        <span class="type-label">{{ getTypeLabel(type as GrowthRecordType) }}</span>
      </button>
    </div>

    <!-- Tabs -->
    <div class="panel-tabs" v-if="queryParams.studentId">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'records' }"
        @click="handleTabChange('records')"
      >
        记录列表
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'chart' }"
        @click="handleTabChange('chart')"
      >
        成长曲线
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'report' }"
        @click="handleTabChange('report')"
      >
        评估报告
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'comparison' }"
        @click="handleTabChange('comparison')"
      >
        同龄对比
      </button>
    </div>

    <!-- Content -->
    <div class="panel-content">
      <!-- No student selected -->
      <div v-if="!queryParams.studentId" class="empty-state">
        <span class="empty-icon">👶</span>
        <span class="empty-text">请选择学生查看成长档案</span>
      </div>

      <!-- Loading state -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <span class="error-icon">!</span>
        <span>{{ error }}</span>
        <button class="retry-btn" @click="refresh">重试</button>
      </div>

      <!-- Records List Tab -->
      <div v-else-if="activeTab === 'records'" class="records-list">
        <div v-if="records.length === 0" class="empty-list">
          <span class="empty-icon">📋</span>
          <span>暂无成长记录</span>
        </div>

        <div v-else class="record-items">
          <div
            v-for="record in records"
            :key="record.id"
            class="record-item"
          >
            <div class="record-date">
              <span class="date-day">{{ new Date(record.measurementDate).getDate() }}</span>
              <span class="date-month">{{ new Date(record.measurementDate).getMonth() + 1 }}月</span>
            </div>

            <div class="record-content">
              <div class="record-type">
                <span class="type-icon">{{ getTypeIcon(record.type as GrowthRecordType) }}</span>
                <span>{{ getTypeLabel(record.type as GrowthRecordType) }}</span>
              </div>

              <div class="record-metrics" v-if="record.height || record.weight">
                <span v-if="record.height" class="metric">
                  📏 {{ record.height }}cm
                </span>
                <span v-if="record.weight" class="metric">
                  ⚖️ {{ record.weight }}kg
                </span>
                <span v-if="record.bmi" class="metric">
                  📊 BMI {{ record.bmi }}
                </span>
              </div>

              <div class="record-scores" v-if="record.cognitiveScore || record.socialScore">
                <span v-if="record.cognitiveScore" class="score">
                  认知 {{ record.cognitiveScore }}
                </span>
                <span v-if="record.socialScore" class="score">
                  社会 {{ record.socialScore }}
                </span>
                <span v-if="record.motorScore" class="score">
                  动作 {{ record.motorScore }}
                </span>
              </div>

              <div class="record-percentiles" v-if="record.heightPercentile || record.weightPercentile">
                <span v-if="record.heightPercentile" class="percentile">
                  身高{{ record.heightPercentile >= 50 ? '偏上' : '偏下' }}
                </span>
                <span v-if="record.weightPercentile" class="percentile">
                  体重{{ record.weightPercentile >= 50 ? '偏上' : '偏下' }}
                </span>
              </div>

              <div class="record-meta">
                <span class="age">月龄 {{ record.ageInMonths }}个月</span>
                <span v-if="record.remark" class="remark">{{ record.remark }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart Tab -->
      <div v-else-if="activeTab === 'chart'" class="chart-tab">
        <GrowthChart
          v-if="queryParams.studentId"
          :student-id="queryParams.studentId"
          :type="selectedType"
        />
      </div>

      <!-- Report Tab -->
      <div v-else-if="activeTab === 'report'" class="report-tab">
        <GrowthReportCard
          v-if="queryParams.studentId"
          :student-id="queryParams.studentId"
          :months="6"
        />
      </div>

      <!-- Comparison Tab -->
      <div v-else-if="activeTab === 'comparison'" class="comparison-tab">
        <div v-if="comparisonData" class="comparison-content">
          <div class="comparison-header">
            <div class="student-avatar">
              {{ comparisonData.student.name.charAt(0) }}
            </div>
            <div class="student-info">
              <span class="student-name">{{ comparisonData.student.name }}</span>
              <span class="student-meta">
                {{ comparisonData.student.gender }} ·
                {{ comparisonData.student.ageInMonths }}个月
              </span>
            </div>
          </div>

          <div class="comparison-cards">
            <!-- Height comparison -->
            <div class="comparison-card">
              <div class="card-header">
                <span class="card-icon">📏</span>
                <span class="card-title">身高</span>
              </div>
              <div class="card-value">{{ comparisonData.comparison.height.value }}cm</div>
              <div class="card-level">{{ comparisonData.comparison.height.level }}</div>
              <div class="card-description">{{ comparisonData.comparison.height.description }}</div>
              <div class="percentile-bar">
                <div
                  class="percentile-fill"
                  :style="{ width: `${comparisonData.comparison.height.percent}%` }"
                ></div>
              </div>
              <div class="percentile-label">超过{{ comparisonData.comparison.height.percent.toFixed(0) }}%同龄儿童</div>
            </div>

            <!-- Weight comparison -->
            <div class="comparison-card">
              <div class="card-header">
                <span class="card-icon">⚖️</span>
                <span class="card-title">体重</span>
              </div>
              <div class="card-value">{{ comparisonData.comparison.weight.value }}kg</div>
              <div class="card-level">{{ comparisonData.comparison.weight.level }}</div>
              <div class="card-description">{{ comparisonData.comparison.weight.description }}</div>
              <div class="percentile-bar">
                <div
                  class="percentile-fill"
                  :style="{ width: `${comparisonData.comparison.weight.percent}%` }"
                ></div>
              </div>
              <div class="percentile-label">超过{{ comparisonData.comparison.weight.percent.toFixed(0) }}%同龄儿童</div>
            </div>

            <!-- BMI comparison -->
            <div class="comparison-card">
              <div class="card-header">
                <span class="card-icon">📊</span>
                <span class="card-title">BMI指数</span>
              </div>
              <div class="card-value">{{ comparisonData.comparison.bmi.value || '-' }}</div>
              <div class="card-description bmi">{{ comparisonData.comparison.bmi.description }}</div>
            </div>
          </div>

          <div class="comparison-footer">
            测量日期: {{ formatDate(comparisonData.measurementDate) }}
          </div>
        </div>

        <div v-else class="empty-comparison">
          <span class="empty-icon">📊</span>
          <span>暂无对比数据</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.growth-records-panel {
  background: var(--ai-card-bg, #ffffff);
  border-radius: 12px;
  overflow: hidden;

  &.dark-mode {
    background: var(--ai-card-bg-dark, #1a1a2e);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ai-border-color, #e8e8e8);

  .panel-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--ai-text-primary, #333);
  }

  .header-controls {
    display: flex;
    gap: 12px;
  }

  .student-select {
    padding: 8px 12px;
    border: 1px solid var(--ai-border-color, #e8e8e8);
    border-radius: 8px;
    background: var(--ai-bg-light, #f5f5f5);
    color: var(--ai-text-primary, #333);
    font-size: 14px;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--ai-primary, #667eea);
    }
  }
}

.type-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--ai-border-color, #e8e8e8);
  background: var(--ai-bg-light, #f8f9fa);

  .type-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--ai-border-color, #e8e8e8);
    border-radius: 20px;
    background: transparent;
    color: var(--ai-text-secondary, #666);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--ai-primary, #667eea);
      color: var(--ai-primary, #667eea);
    }

    &.active {
      background: var(--ai-primary, #667eea);
      border-color: var(--ai-primary, #667eea);
      color: white;
    }
  }
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--ai-border-color, #e8e8e8);

  .tab-btn {
    flex: 1;
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: var(--ai-text-secondary, #666);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;

    &:hover {
      color: var(--ai-primary, #667eea);
    }

    &.active {
      color: var(--ai-primary, #667eea);
      border-bottom-color: var(--ai-primary, #667eea);
    }
  }
}

.panel-content {
  padding: 16px;
  min-height: 300px;
}

.empty-state,
.loading-state,
.error-state,
.empty-list,
.empty-comparison {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: var(--ai-text-secondary, #666);
}

.loading-state {
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

.error-state {
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
  }
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.records-list {
  .record-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.record-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--ai-bg-light, #f8f9fa);
  border-radius: 10px;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(4px);
  }
}

.record-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 50px;
  padding: 8px;
  background: var(--ai-primary, #667eea);
  border-radius: 8px;
  color: white;

  .date-day {
    font-size: 18px;
    font-weight: 600;
  }

  .date-month {
    font-size: 11px;
    opacity: 0.9;
  }
}

.record-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.record-type {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ai-text-primary, #333);
}

.record-metrics,
.record-scores {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.metric,
.score {
  font-size: 13px;
  color: var(--ai-text-secondary, #666);
}

.record-percentiles {
  display: flex;
  gap: 12px;
}

.percentile {
  font-size: 12px;
  padding: 2px 8px;
  background: rgba(102, 126, 234, 0.1);
  color: var(--ai-primary, #667eea);
  border-radius: 10px;
}

.record-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;

  .age {
    font-size: 12px;
    color: var(--ai-text-tertiary, #999);
  }

  .remark {
    font-size: 12px;
    color: var(--ai-text-secondary, #666);
  }
}

.chart-tab,
.report-tab {
  min-height: 350px;
}

.comparison-content {
  .comparison-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--ai-border-color, #e8e8e8);
  }

  .student-avatar {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--ai-primary, #667eea), var(--ai-secondary, #f093fb));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 20px;
  }

  .student-info {
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
}

.comparison-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.comparison-card {
  padding: 16px;
  background: var(--ai-bg-light, #f8f9fa);
  border-radius: 12px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .card-icon {
    font-size: 18px;
  }

  .card-title {
    font-size: 14px;
    color: var(--ai-text-secondary, #666);
  }

  .card-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--ai-text-primary, #333);
    margin-bottom: 4px;
  }

  .card-level {
    font-size: 13px;
    color: var(--ai-primary, #667eea);
    font-weight: 500;
    margin-bottom: 8px;
  }

  .card-description {
    font-size: 12px;
    color: var(--ai-text-secondary, #666);
    margin-bottom: 12px;

    &.bmi {
      color: var(--ai-text-primary, #333);
    }
  }

  .percentile-bar {
    height: 8px;
    background: var(--ai-border-color, #e8e8e8);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .percentile-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--ai-primary, #667eea), var(--ai-secondary, #f093fb));
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .percentile-label {
    font-size: 11px;
    color: var(--ai-text-tertiary, #999);
  }
}

.comparison-footer {
  text-align: center;
  font-size: 12px;
  color: var(--ai-text-tertiary, #999);
  padding-top: 12px;
  border-top: 1px solid var(--ai-border-color, #e8e8e8);
}
</style>
