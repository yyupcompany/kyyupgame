<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDesignStore } from '@/stores/design'
import { GrowthRecordsPanel } from '@/components/ai-assistant/components/growth'
import { growthRecordsApi, GrowthRecordType, GrowthRecord } from '@/api/modules/growth-records'

// Design store for theming
const designStore = useDesignStore()
const isDark = computed(() => designStore.darkMode)

// State
const loading = ref(false)
const selectedStudentId = ref<number | null>(1) // 默认选中学生，实际应用中从store获取
const studentList = ref<Array<{ id: number; name: string; className: string }>>([])
const activeType = ref<GrowthRecordType>(GrowthRecordType.HEIGHT_WEIGHT)

// Tab management
const activeTab = ref<'overview' | 'records' | 'chart' | 'report' | 'comparison'>('overview')

// Statistics
const stats = ref({
  totalRecords: 0,
  latestHeight: 0,
  latestWeight: 0,
  heightPercentile: 0,
  weightPercentile: 0
})

// Fetch student list
const fetchStudentList = async () => {
  try {
    // Mock data - in real app, fetch from API
    studentList.value = [
      { id: 1, name: '小明', className: '大一班' },
      { id: 2, name: '小红', className: '大二班' },
      { id: 3, name: '小刚', className: '中一班' }
    ]
  } catch (error) {
    console.error('获取学生列表失败:', error)
  }
}

// Fetch statistics
const fetchStats = async () => {
  if (!selectedStudentId.value) return

  try {
    const response = await growthRecordsApi.getGrowthRecords({
      studentId: selectedStudentId.value,
      type: activeType.value,
      limit: 1
    })

    if (response.data?.data) {
      const records = response.data.data as GrowthRecord[]
      if (records.length > 0) {
        const latest = records[0]
        stats.value = {
          totalRecords: records.length,
          latestHeight: latest.height || 0,
          latestWeight: latest.weight || 0,
          heightPercentile: latest.heightPercentile || 0,
          weightPercentile: latest.weightPercentile || 0
        }
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// Handle student change
const handleStudentChange = (studentId: number) => {
  selectedStudentId.value = studentId
  fetchStats()
}

// Get growth trend
const getGrowthTrend = (current: number, previous: number | null) => {
  if (previous === null || previous === 0) return null
  const change = current - previous
  if (change > 0) return { text: '↑ 上升', color: '#52c41a' }
  if (change < 0) return { text: '↓ 下降', color: '#ff4d4f' }
  return { text: '→ 持平', color: '#666' }
}

// Lifecycle
onMounted(() => {
  fetchStudentList()
  fetchStats()
})

// Watch for type changes
watch(activeType, () => {
  fetchStats()
})
</script>

<template>
  <div class="growth-records-center" :class="{ 'dark-mode': isDark }">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">📈 成长档案中心</h1>
        <p class="page-subtitle">学生身高、体重、体能等成长数据管理</p>
      </div>
      <div class="header-right">
        <el-select
          v-model="selectedStudentId"
          placeholder="请选择学生"
          @change="handleStudentChange"
          class="student-select"
        >
          <el-option
            v-for="student in studentList"
            :key="student.id"
            :label="`${student.name} - ${student.className}`"
            :value="student.id"
          />
        </el-select>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-section" v-if="selectedStudentId">
      <el-row :gutter="16">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon records">📋</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalRecords }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon height">📏</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.latestHeight }} <small>cm</small></div>
              <div class="stat-label">最新身高</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon weight">⚖️</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.latestWeight }} <small>kg</small></div>
              <div class="stat-label">最新体重</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon percentile">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.heightPercentile.toFixed(0) }}%</div>
              <div class="stat-label">身高百分位</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Type Filter -->
    <div class="type-filter" v-if="selectedStudentId">
      <el-radio-group v-model="activeType" size="large">
        <el-radio-button :value="GrowthRecordType.HEIGHT_WEIGHT">
          📏 身高体重
        </el-radio-button>
        <el-radio-button :value="GrowthRecordType.PHYSICAL">
          🏃 体能测试
        </el-radio-button>
        <el-radio-button :value="GrowthRecordType.COGNITIVE">
          🧠 认知发展
        </el-radio-button>
        <el-radio-button :value="GrowthRecordType.SOCIAL">
          👥 社会情感
        </el-radio-button>
        <el-radio-button :value="GrowthRecordType.LANGUAGE">
          💬 语言发展
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- No Student Selected -->
    <el-empty
      v-if="!selectedStudentId"
      description="请选择学生查看成长档案"
      class="empty-state"
    >
      <template #image>
        <span style="font-size: 80px">👶</span>
      </template>
    </el-empty>

    <!-- Main Content -->
    <div v-else class="main-content">
      <!-- Tabs -->
      <el-tabs v-model="activeTab" class="content-tabs">
        <el-tab-pane label="概览" name="overview">
          <div class="overview-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-card class="overview-card">
                  <template #header>
                    <div class="card-header">
                      <span>📏 身高趋势</span>
                      <el-tag type="primary" size="small">近6个月</el-tag>
                    </div>
                  </template>
                  <GrowthRecordsPanel
                    :student-id="selectedStudentId"
                    :initial-type="activeType"
                  />
                </el-card>
              </el-col>
              <el-col :span="12">
                <el-card class="overview-card">
                  <template #header>
                    <div class="card-header">
                      <span>⚖️ 体重趋势</span>
                      <el-tag type="success" size="small">近6个月</el-tag>
                    </div>
                  </template>
                  <GrowthRecordsPanel
                    :student-id="selectedStudentId"
                    :initial-type="activeType"
                  />
                </el-card>
              </el-col>
            </el-row>

            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="8">
                <el-card class="metric-card">
                  <div class="metric-title">发育评估</div>
                  <div class="metric-value">
                    <span class="level excellent">优秀</span>
                  </div>
                  <div class="metric-desc">身高体重发育良好</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="metric-card">
                  <div class="metric-title">BMI指数</div>
                  <div class="metric-value">16.5</div>
                  <div class="metric-desc">正常范围内</div>
                </el-card>
              </el-col>
              <el-col :span="8">
                <el-card class="metric-card">
                  <div class="metric-title">同龄对比</div>
                  <div class="metric-value">Top 30%</div>
                  <div class="metric-desc">身高超过70%同龄儿童</div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane label="记录列表" name="records">
          <GrowthRecordsPanel
            :student-id="selectedStudentId"
            :initial-type="activeType"
          />
        </el-tab-pane>

        <el-tab-pane label="成长曲线" name="chart">
          <GrowthRecordsPanel
            :student-id="selectedStudentId"
            :initial-type="activeType"
          />
        </el-tab-pane>

        <el-tab-pane label="评估报告" name="report">
          <GrowthRecordsPanel
            :student-id="selectedStudentId"
            :initial-type="activeType"
          />
        </el-tab-pane>

        <el-tab-pane label="同龄对比" name="comparison">
          <GrowthRecordsPanel
            :student-id="selectedStudentId"
            :initial-type="activeType"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.growth-records-center {
  padding: var(--spacing-lg);
  min-height: calc(100vh - 120px);
  background: var(--bg-page);

  &.dark-mode {
    background: var(--bg-dark);
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);

  .page-title {
    margin: 0;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
  }

  .page-subtitle {
    margin: var(--spacing-sm) 0 0;
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .student-select {
    width: 240px;
  }
}

.stats-section {
  margin-bottom: var(--spacing-xl);

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-2xl);

    &.records {
      background: rgba(var(--primary-color-rgb), 0.1);
    }

    &.height {
      background: rgba(64, 158, 255, 0.1);
    }

    &.weight {
      background: rgba(var(--success-color-rgb), 0.1);
    }

    &.percentile {
      background: rgba(var(--warning-color-rgb), 0.1);
    }
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;

    small {
      font-size: var(--text-sm);
      font-weight: normal;
      color: var(--text-secondary);
    }
  }

  .stat-label {
    margin-top: 4px;
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
}

.type-filter {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.empty-state {
  padding: 80px 0;
}

.main-content {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.content-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: var(--spacing-lg);
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }
}

.overview-content {
  .overview-card {
    margin-bottom: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.metric-card {
  text-align: center;

  .metric-title {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  .metric-value {
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);

    .level {
      padding: var(--spacing-xs) var(--spacing-lg);
      border-radius: var(--radius-full);
      font-size: var(--text-base);

      &.excellent {
        background: rgba(var(--success-color-rgb), 0.1);
        color: var(--success-color);
      }

      &.good {
        background: rgba(64, 158, 255, 0.1);
        color: var(--primary-color);
      }

      &.average {
        background: rgba(var(--warning-color-rgb), 0.1);
        color: var(--warning-color);
      }
    }
  }

  .metric-desc {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
}

// Dark mode support
.dark-mode {
  .page-header {
    border-bottom-color: var(--border-color-dark);

    .page-title {
      color: var(--text-primary-dark);
    }

    .page-subtitle {
      color: var(--text-secondary-dark);
    }
  }

  .stats-section {
    .stat-card {
      background: var(--bg-dark);
      box-shadow: var(--shadow-md);

      &:hover {
        box-shadow: var(--shadow-lg);
      }
    }

    .stat-value {
      color: var(--text-primary-dark);
    }

    .stat-label {
      color: var(--text-secondary-dark);
    }
  }

  .type-filter {
    background: var(--bg-dark);
  }

  .main-content {
    background: var(--bg-dark);
    box-shadow: var(--shadow-md);
  }

  .metric-card {
    background: var(--bg-card-dark);
    border-color: var(--border-color-dark);

    .metric-value {
      color: var(--text-primary-dark);
    }

    .metric-desc {
      color: var(--text-secondary-dark);
    }
  }
}
</style>
