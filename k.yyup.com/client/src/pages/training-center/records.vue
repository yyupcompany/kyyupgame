<template>
  <div class="training-records">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">训练记录</h1>
        <p class="page-description">查看孩子的训练历史和成长轨迹</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="exportRecords">
          <el-icon><Download /></el-icon>
          导出记录
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalSessions }}</div>
              <div class="stat-label">总训练次数</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon time">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.totalHours.toFixed(1) }}h</div>
              <div class="stat-label">总训练时长</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon score">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.averageScore.toFixed(1) }}</div>
              <div class="stat-label">平均分数</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon streak">
              <el-icon><Crown /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.currentStreak }}</div>
              <div class="stat-label">连续天数</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选器 -->
    <div class="filters-section">
      <el-card class="filters-card">
        <el-form :model="filters" label-position="top" @submit.prevent="handleFilter">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="孩子">
                <el-select
                  v-model="filters.childId"
                  placeholder="选择孩子"
                  clearable
                  @change="handleFilter"
                >
                  <el-option
                    v-for="child in children"
                    :key="child.id"
                    :label="child.name"
                    :value="child.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-form-item label="活动类型">
                <el-select
                  v-model="filters.type"
                  placeholder="选择类型"
                  clearable
                  @change="handleFilter"
                >
                  <el-option label="认知" :value="ActivityType.COGNITIVE" />
                  <el-option label="运动" :value="ActivityType.MOTOR" />
                  <el-option label="语言" :value="ActivityType.LANGUAGE" />
                  <el-option label="社交" :value="ActivityType.SOCIAL" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  @change="handleDateRangeChange"
                />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12" :md="4">
              <el-form-item label=" ">
                <el-button type="primary" @click="handleFilter">
                  <el-icon><Search /></el-icon>
                  筛选
                </el-button>
                <el-button @click="clearFilters">重置</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>

    <!-- 记录列表 -->
    <div class="records-content">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else-if="records.length === 0" class="empty-state">
        <el-empty description="暂无训练记录" />
      </div>

      <div v-else class="records-timeline">
        <div
          v-for="record in records"
          :key="record.id"
          class="record-item"
        >
          <div class="record-date">
            <div class="date-day">{{ formatDay(record.completedAt) }}</div>
            <div class="date-month">{{ formatMonth(record.completedAt) }}</div>
          </div>

          <div class="record-content">
            <el-card class="record-card" shadow="hover">
              <div class="record-header">
                <div class="record-info">
                  <h3 class="record-title">{{ getActivityName(record.activityId) }}</h3>
                  <div class="record-meta">
                    <el-tag :type="getActivityTypeColor(getActivityType(record.activityId))" size="small">
                      {{ getActivityTypeLabel(getActivityType(record.activityId)) }}
                    </el-tag>
                    <span class="record-time">{{ formatTime(record.completedAt) }}</span>
                    <span class="record-duration">{{ record.duration }} 分钟</span>
                  </div>
                </div>
                <div class="record-score">
                  <div class="score-value" :class="getScoreClass(record.score)">
                    {{ record.score }}
                  </div>
                  <div class="score-label">分数</div>
                </div>
              </div>

              <div class="record-body">
                <div v-if="record.feedback" class="feedback-section">
                  <h4>AI反馈</h4>
                  <div class="feedback-content">
                    <div v-if="record.feedback.strengths.length > 0" class="feedback-item">
                      <el-icon class="feedback-icon strength"><Star /></el-icon>
                      <div class="feedback-text">
                        <div class="feedback-label">优势表现</div>
                        <ul>
                          <li v-for="strength in record.feedback.strengths" :key="strength">
                            {{ strength }}
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div v-if="record.feedback.improvements.length > 0" class="feedback-item">
                      <el-icon class="feedback-icon improvement"><Warning /></el-icon>
                      <div class="feedback-text">
                        <div class="feedback-label">改进建议</div>
                        <ul>
                          <li v-for="improvement in record.feedback.improvements" :key="improvement">
                            {{ improvement }}
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div v-if="record.feedback.nextSteps.length > 0" class="feedback-item">
                      <el-icon class="feedback-icon next"><ArrowRight /></el-icon>
                      <div class="feedback-text">
                        <div class="feedback-label">下一步</div>
                        <ul>
                          <li v-for="step in record.feedback.nextSteps" :key="step">
                            {{ step }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="record.attachments.length > 0" class="attachments-section">
                  <h4>训练素材</h4>
                  <div class="attachments-grid">
                    <div
                      v-for="attachment in record.attachments"
                      :key="attachment.url"
                      class="attachment-item"
                      @click="previewAttachment(attachment)"
                    >
                      <div v-if="attachment.type === 'image'" class="attachment-image">
                        <img :src="attachment.url" :alt="attachment.description" />
                      </div>
                      <div v-else class="attachment-video">
                        <el-icon size="24"><VideoPlay /></el-icon>
                      </div>
                      <div v-if="attachment.description" class="attachment-desc">
                        {{ attachment.description }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="record.notes" class="notes-section">
                  <h4>备注</h4>
                  <p>{{ record.notes }}</p>
                </div>
              </div>

              <div class="record-footer">
                <el-button type="primary" plain size="small" @click="viewRecordDetail(record.id)">
                  查看详情
                </el-button>
                <el-button type="default" plain size="small" @click="shareRecord(record.id)">
                  <el-icon><Share /></el-icon>
                  分享
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 记录详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="训练记录详情"
      width="80%"
      max-width="900px"
      destroy-on-close
    >
      <div v-if="selectedRecord" class="record-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动名称">{{ getActivityName(selectedRecord.activityId) }}</el-descriptions-item>
          <el-descriptions-item label="活动类型">
            <el-tag :type="getActivityTypeColor(getActivityType(selectedRecord.activityId))">
              {{ getActivityTypeLabel(getActivityType(selectedRecord.activityId)) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ formatDateTime(selectedRecord.completedAt) }}</el-descriptions-item>
          <el-descriptions-item label="训练时长">{{ selectedRecord.duration }} 分钟</el-descriptions-item>
          <el-descriptions-item label="得分">
            <span class="score-large" :class="getScoreClass(selectedRecord.score)">
              {{ selectedRecord.score }} 分
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="训练计划">
            {{ getPlanName(selectedRecord.planId) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-sections">
          <div v-if="selectedRecord.feedback" class="detail-section">
            <h3>AI反馈分析</h3>
            <div class="feedback-detail">
              <el-collapse>
                <el-collapse-item v-if="selectedRecord.feedback.strengths.length > 0" title="优势表现">
                  <ul>
                    <li v-for="strength in selectedRecord.feedback.strengths" :key="strength">
                      {{ strength }}
                    </li>
                  </ul>
                </el-collapse-item>
                <el-collapse-item v-if="selectedRecord.feedback.improvements.length > 0" title="改进建议">
                  <ul>
                    <li v-for="improvement in selectedRecord.feedback.improvements" :key="improvement">
                      {{ improvement }}
                    </li>
                  </ul>
                </el-collapse-item>
                <el-collapse-item v-if="selectedRecord.feedback.nextSteps.length > 0" title="下一步建议">
                  <ul>
                    <li v-for="step in selectedRecord.feedback.nextSteps" :key="step">
                      {{ step }}
                    </li>
                  </ul>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>

          <div v-if="selectedRecord.attachments.length > 0" class="detail-section">
            <h3>训练素材</h3>
            <div class="attachments-detail">
              <div
                v-for="attachment in selectedRecord.attachments"
                :key="attachment.url"
                class="attachment-detail-item"
              >
                <div v-if="attachment.type === 'image'" class="image-preview">
                  <img :src="attachment.url" :alt="attachment.description" @click="previewImage(attachment.url)" />
                  <p v-if="attachment.description">{{ attachment.description }}</p>
                </div>
                <div v-else class="video-preview">
                  <video :src="attachment.url" controls></video>
                  <p v-if="attachment.description">{{ attachment.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="selectedRecord.notes" class="detail-section">
            <h3>备注说明</h3>
            <div class="notes-detail">
              <p>{{ selectedRecord.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download,
  DataLine,
  Clock,
  TrendCharts,
  Crown,
  Search,
  Star,
  Warning,
  ArrowRight,
  Share,
  VideoPlay
} from '@element-plus/icons-vue'
import {
  trainingApi,
  type TrainingRecord,
  ActivityType,
  type RecordQueryParams
} from '@/api/modules/training'

// 响应式数据
const loading = ref(false)
const records = ref<TrainingRecord[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const children = ref<Array<{ id: string; name: string }>>([]) // 应该从用户数据获取
const activities = ref<Map<string, { name: string; type: ActivityType }>>(new Map())
const plans = ref<Map<string, string>>(new Map())

// 统计数据
const stats = ref({
  totalSessions: 0,
  totalHours: 0,
  averageScore: 0,
  currentStreak: 0
})

// 筛选器
const filters = ref<RecordQueryParams>({
  childId: undefined,
  activityId: undefined,
  planId: undefined,
  startDate: undefined,
  endDate: undefined
})

const dateRange = ref<[Date, Date] | null>(null)

// 对话框状态
const showDetailDialog = ref(false)
const selectedRecord = ref<TrainingRecord | null>(null)

// 获取记录列表
const fetchRecords = async () => {
  try {
    loading.value = true
    const params: RecordQueryParams = {
      ...filters.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }

    const response = await trainingApi.getRecords(params)
    records.value = response.data.records
    total.value = response.data.total

    // 更新统计数据
    updateStats()
  } catch (error) {
    console.error('获取记录列表失败:', error)
    ElMessage.error('加载记录列表失败')
  } finally {
    loading.value = false
  }
}

// 更新统计数据
const updateStats = () => {
  stats.value = {
    totalSessions: records.value.length,
    totalHours: records.value.reduce((sum, r) => sum + r.duration, 0) / 60,
    averageScore: records.value.length > 0
      ? records.value.reduce((sum, r) => sum + r.score, 0) / records.value.length
      : 0,
    currentStreak: calculateCurrentStreak()
  }
}

// 计算连续天数
const calculateCurrentStreak = () => {
  if (records.value.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sortedRecords = [...records.value]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

  let streak = 0
  let currentDate = new Date(today)

  for (const record of sortedRecords) {
    const recordDate = new Date(record.completedAt)
    recordDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === streak) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// 处理筛选
const handleFilter = () => {
  currentPage.value = 1
  fetchRecords()
}

// 处理日期范围变化
const handleDateRangeChange = (dates: [Date, Date] | null) => {
  if (dates) {
    filters.value.startDate = dates[0].toISOString().split('T')[0]
    filters.value.endDate = dates[1].toISOString().split('T')[0]
  } else {
    filters.value.startDate = undefined
    filters.value.endDate = undefined
  }
  handleFilter()
}

// 清除筛选条件
const clearFilters = () => {
  filters.value = {
    childId: undefined,
    activityId: undefined,
    planId: undefined,
    startDate: undefined,
    endDate: undefined
  }
  dateRange.value = null
  handleFilter()
}

// 格式化日期
const formatDay = (dateString: string) => {
  return new Date(dateString).getDate()
}

const formatMonth = (dateString: string) => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return months[new Date(dateString).getMonth()]
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取活动信息
const getActivityName = (activityId: string) => {
  return activities.value.get(activityId)?.name || '未知活动'
}

const getActivityType = (activityId: string) => {
  return activities.value.get(activityId)?.type || ActivityType.COGNITIVE
}

const getPlanName = (planId: string) => {
  return plans.value.get(planId) || '未知计划'
}

// 工具函数
const getActivityTypeColor = (type: ActivityType) => {
  const colors = {
    [ActivityType.COGNITIVE]: 'primary',
    [ActivityType.MOTOR]: 'success',
    [ActivityType.LANGUAGE]: 'warning',
    [ActivityType.SOCIAL]: 'danger'
  }
  return colors[type] || 'default'
}

const getActivityTypeLabel = (type: ActivityType) => {
  const labels = {
    [ActivityType.COGNITIVE]: '认知',
    [ActivityType.MOTOR]: '运动',
    [ActivityType.LANGUAGE]: '语言',
    [ActivityType.SOCIAL]: '社交'
  }
  return labels[type] || '未知'
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-average'
  return 'score-poor'
}

// 查看记录详情
const viewRecordDetail = async (recordId: string) => {
  try {
    const response = await trainingApi.getRecordDetail(recordId)
    selectedRecord.value = response.data
    showDetailDialog.value = true
  } catch (error) {
    console.error('获取记录详情失败:', error)
    ElMessage.error('获取记录详情失败')
  }
}

// 预览附件
const previewAttachment = (attachment: any) => {
  if (attachment.type === 'image') {
    // 预览图片
    window.open(attachment.url, '_blank')
  } else {
    // 播放视频
    window.open(attachment.url, '_blank')
  }
}

// 预览图片
const previewImage = (url: string) => {
  window.open(url, '_blank')
}

// 分享记录
const shareRecord = (recordId: string) => {
  const url = `${window.location.origin}/training-center/records/${recordId}`

  if (navigator.share) {
    navigator.share({
      title: '训练记录分享',
      text: '查看孩子的训练记录',
      url: url
    })
  } else {
    navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  }
}

// 导出记录
const exportRecords = () => {
  ElMessage.info('导出功能开发中...')
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchRecords()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchRecords()
}

// 页面挂载时获取数据
onMounted(() => {
  fetchRecords()
})
</script>

<style lang="scss" scoped>
.training-records {
  padding: var(--spacing-lg);
  background-color: var(--bg-color);
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xl);

    .header-left {
      .page-title {
        font-size: var(--font-size-extra-large);
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs) 0;
        font-weight: 600;
      }

      .page-description {
        font-size: var(--font-size-base);
        color: var(--text-regular);
        margin: 0;
      }
    }
  }

  .stats-cards {
    margin-bottom: var(--spacing-xl);

    .stat-card {
      background: var(--card-bg);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-lg);
      box-shadow: var(--box-shadow-light);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--box-shadow-base);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-2xl);
        color: var(--el-color-white);

        &.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.time {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.score {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.streak {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
      }

      .stat-content {
        .stat-value {
          font-size: var(--font-size-extra-large);
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: var(--font-size-small);
          color: var(--text-secondary);
          margin-top: 4px;
        }
      }
    }
  }

  .filters-section {
    margin-bottom: var(--spacing-xl);

    .filters-card {
      :deep(.el-card__body) {
        padding: var(--spacing-lg);
      }
    }
  }

  .records-content {
    .loading-container {
      padding: var(--spacing-xl);
    }

    .empty-state {
      padding: var(--spacing-xl);
      text-align: center;
    }

    .records-timeline {
      .record-item {
        display: flex;
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);

        .record-date {
          flex-shrink: 0;
          width: 80px;
          text-align: center;
          background: var(--el-color-primary);
          color: var(--el-color-white);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-sm) 0;
          box-shadow: var(--box-shadow-light);

          .date-day {
            font-size: var(--font-size-extra-large);
            font-weight: 600;
            line-height: 1;
          }

          .date-month {
            font-size: var(--font-size-small);
            margin-top: 2px;
          }
        }

        .record-content {
          flex: 1;

          .record-card {
            .record-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: var(--spacing-md);

              .record-info {
                flex: 1;

                .record-title {
                  font-size: var(--font-size-large);
                  color: var(--text-primary);
                  margin: 0 0 var(--spacing-sm) 0;
                  font-weight: 600;
                }

                .record-meta {
                  display: flex;
                  align-items: center;
                  gap: var(--spacing-md);
                  font-size: var(--font-size-small);
                  color: var(--text-secondary);
                }
              }

              .record-score {
                text-align: center;
                margin-left: var(--spacing-lg);

                .score-value {
                  font-size: var(--font-size-extra-large);
                  font-weight: 600;
                  line-height: 1;

                  &.score-excellent {
                    color: var(--el-color-success);
                  }

                  &.score-good {
                    color: var(--el-color-primary);
                  }

                  &.score-average {
                    color: var(--el-color-warning);
                  }

                  &.score-poor {
                    color: var(--el-color-danger);
                  }
                }

                .score-label {
                  font-size: var(--font-size-small);
                  color: var(--text-secondary);
                  margin-top: 4px;
                }
              }
            }

            .record-body {
              margin-bottom: var(--spacing-md);

              .feedback-section {
                margin-bottom: var(--spacing-lg);

                h4 {
                  font-size: var(--font-size-base);
                  color: var(--text-primary);
                  margin: 0 0 var(--spacing-md) 0;
                  display: flex;
                  align-items: center;
                  gap: var(--spacing-xs);
                }

                .feedback-content {
                  .feedback-item {
                    display: flex;
                    gap: var(--spacing-md);
                    margin-bottom: var(--spacing-md);

                    .feedback-icon {
                      flex-shrink: 0;
                      width: 32px;
                      height: 32px;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;

                      &.strength {
                        background: var(--el-color-success-light-9);
                        color: var(--el-color-success);
                      }

                      &.improvement {
                        background: var(--el-color-warning-light-9);
                        color: var(--el-color-warning);
                      }

                      &.next {
                        background: var(--el-color-primary-light-9);
                        color: var(--el-color-primary);
                      }
                    }

                    .feedback-text {
                      flex: 1;

                      .feedback-label {
                        font-weight: 500;
                        color: var(--text-primary);
                        margin-bottom: var(--spacing-xs);
                      }

                      ul {
                        margin: 0;
                        padding-left: var(--spacing-lg);

                        li {
                          color: var(--text-regular);
                          margin-bottom: var(--spacing-xs);
                          line-height: 1.5;
                        }
                      }
                    }
                  }
                }
              }

              .attachments-section {
                margin-bottom: var(--spacing-lg);

                h4 {
                  font-size: var(--font-size-base);
                  color: var(--text-primary);
                  margin: 0 0 var(--spacing-md) 0;
                }

                .attachments-grid {
                  display: grid;
                  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                  gap: var(--spacing-md);

                  .attachment-item {
                    cursor: pointer;
                    border-radius: var(--border-radius-base);
                    overflow: hidden;
                    transition: all 0.3s ease;

                    &:hover {
                      transform: scale(1.05);
                    }

                    .attachment-image {
                      width: 100%;
                      height: 80px;
                      overflow: hidden;
                      background: var(--el-fill-color-lighter);

                      img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                      }
                    }

                    .attachment-video {
                      width: 100%;
                      height: 80px;
                      background: var(--el-fill-color-light);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: var(--text-placeholder);
                    }

                    .attachment-desc {
                      font-size: var(--font-size-small);
                      color: var(--text-secondary);
                      margin-top: var(--spacing-xs);
                      text-align: center;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    }
                  }
                }
              }

              .notes-section {
                h4 {
                  font-size: var(--font-size-base);
                  color: var(--text-primary);
                  margin: 0 0 var(--spacing-md) 0;
                }

                p {
                  margin: 0;
                  color: var(--text-regular);
                  line-height: 1.6;
                }
              }
            }

            .record-footer {
              border-top: 1px solid var(--el-border-color-lighter);
              padding-top: var(--spacing-md);
              display: flex;
              gap: var(--spacing-sm);
            }
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      padding: var(--spacing-xl) 0;
    }
  }

  .record-detail {
    .score-large {
      font-size: var(--font-size-extra-large);
      font-weight: 600;

      &.score-excellent {
        color: var(--el-color-success);
      }

      &.score-good {
        color: var(--el-color-primary);
      }

      &.score-average {
        color: var(--el-color-warning);
      }

      &.score-poor {
        color: var(--el-color-danger);
      }
    }

    .detail-sections {
      margin-top: var(--spacing-xl);

      .detail-section {
        margin-bottom: var(--spacing-xl);

        h3 {
          font-size: var(--font-size-large);
          color: var(--text-primary);
          margin: 0 0 var(--spacing-md) 0;
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--el-border-color-lighter);
        }

        .feedback-detail {
          ul {
            margin: 0;
            padding-left: var(--spacing-lg);

            li {
              color: var(--text-regular);
              margin-bottom: var(--spacing-xs);
              line-height: 1.6;
            }
          }
        }

        .attachments-detail {
          .attachment-detail-item {
            margin-bottom: var(--spacing-lg);

            .image-preview {
              img {
                max-width: 200px;
                max-height: 200px;
                border-radius: var(--border-radius-base);
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                  transform: scale(1.05);
                }
              }

              p {
                margin-top: var(--spacing-sm);
                color: var(--text-secondary);
                font-size: var(--font-size-small);
              }
            }

            .video-preview {
              video {
                max-width: 100%;
                max-height: 300px;
                border-radius: var(--border-radius-base);
              }

              p {
                margin-top: var(--spacing-sm);
                color: var(--text-secondary);
                font-size: var(--font-size-small);
              }
            }
          }
        }

        .notes-detail {
          p {
            margin: 0;
            color: var(--text-regular);
            line-height: 1.8;
            padding: var(--spacing-md);
            background: var(--el-fill-color-light);
            border-radius: var(--border-radius-base);
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .training-records {
    padding: var(--spacing-md);

    .page-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: flex-start;
    }

    .stats-cards {
      .stat-card {
        padding: var(--spacing-md);

        .stat-icon {
          width: 50px;
          height: 50px;
          font-size: var(--text-xl);
        }

        .stat-content .stat-value {
          font-size: var(--font-size-large);
        }
      }
    }

    .records-timeline {
      .record-item {
        flex-direction: column;
        align-items: flex-start;

        .record-date {
          width: auto;
          padding: var(--spacing-xs) var(--spacing-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .date-day,
          .date-month {
            font-size: var(--font-size-base);
          }
        }

        .record-content {
          width: 100%;

          .record-card {
            .record-header {
              flex-direction: column;
              gap: var(--spacing-md);

              .record-score {
                margin-left: 0;
                align-self: flex-end;
              }
            }
          }
        }
      }
    }
  }
}
</style>