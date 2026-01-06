<template>
  <div class="followup-analysis-panel">
    <div class="panel-header">
      <h2 class="panel-title">
        <UnifiedIcon name="default" />
        跟进质量分析报告
      </h2>
      <div class="panel-actions">
        <el-button :icon="Refresh" :loading="loading" @click="handleRefresh">
          刷新
        </el-button>
        <el-button :icon="Close" @click="handleClose">
          关闭
        </el-button>
      </div>
    </div>

    <div v-if="loading" class="panel-loading">
      <UnifiedIcon name="default" />
      <p>正在分析跟进质量...</p>
    </div>

    <div v-else-if="analysisData" class="panel-content">
      <!-- 整体统计卡片 -->
      <div class="stats-section">
        <h3 class="section-title">整体统计</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon primary">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-content">
              <p class="stat-label">总教师数</p>
              <p class="stat-value">{{ statistics.totalTeachers || 0 }}</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon success">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-content">
              <p class="stat-label">平均跟进频率</p>
              <p class="stat-value">{{ statistics.avgFollowupFrequency || 0 }} 次/月</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon warning">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-content">
              <p class="stat-label">平均响应时间</p>
              <p class="stat-value">{{ statistics.avgResponseTime || 0 }} 小时</p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon danger">
              <UnifiedIcon name="default" />
            </div>
            <div class="stat-content">
              <p class="stat-label">逾期客户数</p>
              <p class="stat-value">{{ statistics.overdueCount || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 教师排名表格 -->
      <div class="ranking-section">
        <h3 class="section-title">教师跟进质量排名</h3>
        <div class="table-wrapper">
<el-table
          :data="statistics.teacherRankings || []"
          stripe
          class="responsive-table full-width"
        >
          <el-table-column type="index" label="排名" width="80" align="center">
            <template #default="{ $index }">
              <el-tag
                v-if="$index < 3"
                :type="getRankTagType($index)"
                effect="dark"
                size="small"
              >
                {{ $index + 1 }}
              </el-tag>
              <span v-else>{{ $index + 1 }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="teacherName" label="教师姓名" width="120" />

          <el-table-column prop="followupCount" label="跟进次数" width="100" align="center" />

          <el-table-column prop="avgInterval" label="平均间隔" width="120" align="center">
            <template #default="{ row }">
              {{ row.avgInterval }} 天
            </template>
          </el-table-column>

          <el-table-column prop="conversionRate" label="转化率" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getConversionRateType(row.conversionRate)" size="small">
                {{ row.conversionRate }}%
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="score" label="综合评分" width="120" align="center">
            <template #default="{ row }">
              <el-rate
                v-model="row.score"
                disabled
                show-score
                text-color="#ff9900"
                :max="5"
              />
            </template>
          </el-table-column>

          <el-table-column label="备注" min-width="200">
            <template #default="{ row }">
              <span class="remark-text">{{ row.remark || '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
</div>
      </div>

      <!-- AI分析结果 -->
      <div class="ai-analysis-section">
        <h3 class="section-title">
          <UnifiedIcon name="default" />
          AI深度分析
        </h3>
        <div class="ai-analysis-content">
          <el-alert
            type="info"
            :closable="false"
            show-icon
          >
            <template #title>
              <span class="ai-alert-title">AI分析结果</span>
            </template>
          </el-alert>

          <div class="analysis-text">
            <div v-html="formattedAIAnalysis"></div>
          </div>

          <div v-if="aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0" class="recommendations">
            <h4 class="recommendations-title">改进建议</h4>
            <ul class="recommendations-list">
              <li
                v-for="(rec, index) in aiAnalysis.recommendations"
                :key="index"
                class="recommendation-item"
              >
                <UnifiedIcon name="Check" />
                {{ rec }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="panel-empty">
      <el-empty description="暂无分析数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  TrendCharts,
  Refresh,
  Close,
  Loading,
  User,
  ChatDotRound,
  Timer,
  Warning,
  MagicStick,
  Check
} from '@element-plus/icons-vue'

interface Props {
  analysisData: any
  loading?: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const statistics = computed(() => props.analysisData?.statistics || {})
const aiAnalysis = computed(() => props.analysisData?.aiAnalysis || {})

const formattedAIAnalysis = computed(() => {
  const text = aiAnalysis.value.analysis || aiAnalysis.value.summary || ''
  // 将换行符转换为<br>标签
  return text.replace(/\n/g, '<br>')
})

const handleRefresh = () => {
  emit('refresh')
}

const handleClose = () => {
  emit('close')
}

const getRankTagType = (index: number) => {
  if (index === 0) return 'danger'
  if (index === 1) return 'warning'
  if (index === 2) return 'success'
  return 'info'
}

const getConversionRateType = (rate: number) => {
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'danger'
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '优秀': 'success',
    '良好': 'success',
    '一般': 'warning',
    '需改进': 'danger'
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped>
.followup-analysis-panel {
  background: var(--el-bg-color);
  border-radius: var(--text-sm);
  padding: var(--text-3xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 2px var(--text-sm) var(--shadow-light);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  padding-bottom: var(--text-lg);
  border-bottom: var(--transform-drop) solid var(--el-border-color);
}

.panel-title {
  margin: 0;
  font-size: var(--spacing-xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.panel-actions {
  display: flex;
  gap: var(--text-sm);
}

.panel-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-15xl) var(--spacing-xl);
}

.panel-loading p {
  margin-top: var(--text-lg);
  font-size: var(--text-lg);
  color: var(--el-text-color-secondary);
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
}

/* 统计卡片 */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.section-title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-lg);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--text-lg);
  padding: var(--spacing-xl);
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  transition: all var(--transition-normal) ease;
}

.stat-card:hover {
  transform: translateY(var(--transform-hover-lift));
  box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
}

.stat-icon {
  width: var(--icon-size); height: var(--icon-size);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--spacing-sm);
  font-size: var(--text-3xl);
  color: var(--text-on-primary);
}

.stat-icon.primary {
  background: var(--el-color-primary);
}

.stat-icon.success {
  background: var(--el-color-success);
}

.stat-icon.warning {
  background: var(--el-color-warning);
}

.stat-icon.danger {
  background: var(--el-color-danger);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  margin: 0;
  font-size: var(--text-base);
  color: var(--el-text-color-secondary);
}

.stat-value {
  margin: 0;
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

/* 排名表格 */
.ranking-section {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.remark-text {
  font-size: var(--text-base);
  color: var(--el-text-color-regular);
}

/* AI分析 */
.ai-analysis-section {
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.ai-analysis-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.ai-alert-title {
  font-size: var(--text-base);
  font-weight: 500;
}

.analysis-text {
  padding: var(--spacing-xl);
  background: var(--el-fill-color-light);
  border-radius: var(--spacing-sm);
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--el-text-color-regular);
}

.recommendations {
  padding: var(--spacing-xl);
  background: var(--el-color-success-light-9);
  border-left: var(--spacing-xs) solid var(--el-color-success);
  border-radius: var(--spacing-sm);
}

.recommendations-title {
  margin: 0 0 var(--text-lg) 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--el-color-success);
}

.recommendations-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--text-sm);
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

.rec-icon {
  margin-top: var(--spacing-sm);
  color: var(--el-color-success);
  flex-shrink: 0;
}

.panel-empty {
  padding: var(--spacing-15xl) var(--spacing-xl);
}
.full-width {
  width: 100%;
}
</style>

