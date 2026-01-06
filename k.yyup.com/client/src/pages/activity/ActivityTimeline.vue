<template>
  <UnifiedCenterLayout
    title="活动流程Timeline"
    :show-header="true"
  >
    <template #header-actions>
      <el-button @click="goBack" size="small">
        <UnifiedIcon name="arrow-left" :size="14" />
        返回列表
      </el-button>
    </template>

    <template #content>
      <div class="activity-timeline-page">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="8" animated />
        </div>

        <!-- 活动信息 -->
        <div v-else-if="activity" class="timeline-content">
          <!-- 活动基本信息卡片 -->
          <div class="activity-info-card">
            <div class="info-header">
              <h2>{{ activity.title }}</h2>
              <el-tag :type="getStatusTagType(activity.status)" size="large">
                {{ getStatusText(activity.status) }}
              </el-tag>
            </div>
            <div class="info-details">
              <div class="info-item">
                <UnifiedIcon name="calendar" :size="16" />
                <span>{{ formatDate(activity.startTime) }} - {{ formatDate(activity.endTime) }}</span>
              </div>
              <div class="info-item">
                <UnifiedIcon name="location" :size="16" />
                <span>{{ activity.location || '未设置地点' }}</span>
              </div>
              <div class="info-item">
                <UnifiedIcon name="users" :size="16" />
                <span>{{ activity.registeredCount || 0 }} / {{ activity.capacity || 0 }} 人</span>
              </div>
            </div>
          </div>

          <!-- Timeline流程 -->
          <div class="timeline-wrapper">
            <el-timeline>
              <el-timeline-item
                v-for="(stage, index) in timelineStages"
                :key="stage.key"
                :timestamp="stage.timestamp"
                :type="getTimelineType(stage.status)"
                :icon="getTimelineIcon(stage.status)"
                :hollow="stage.status === 'pending'"
                placement="top"
                :class="['timeline-item', `timeline-item--${stage.status}`]"
              >
                <el-card class="stage-card" @click="handleStageClick(stage)">
                  <div class="stage-header">
                    <div class="stage-title">
                      <span class="stage-number">{{ index + 1 }}</span>
                      <h3>{{ stage.title }}</h3>
                    </div>
                    <el-tag :type="getStageTagType(stage.status)" size="small">
                      {{ getStageStatusText(stage.status) }}
                    </el-tag>
                  </div>

                  <div class="stage-body">
                    <p class="stage-description">{{ stage.description }}</p>

                    <!-- 进度条 -->
                    <div v-if="stage.progress !== undefined" class="stage-progress">
                      <el-progress
                        :percentage="stage.progress"
                        :status="stage.progress === 100 ? 'success' : undefined"
                        :stroke-width="12"
                      />
                    </div>

                    <!-- 详细数据 -->
                    <div v-if="stage.details" class="stage-details">
                      <!-- 活动策划 -->
                      <template v-if="stage.key === 'activity-planning'">
                        <el-descriptions :column="2" size="small">
                          <el-descriptions-item label="活动类型">{{ stage.details.type }}</el-descriptions-item>
                          <el-descriptions-item label="参与人数">{{ stage.details.maxParticipants }}</el-descriptions-item>
                          <el-descriptions-item label="活动费用">{{ stage.details.fee }}元</el-descriptions-item>
                          <el-descriptions-item label="需要审批">{{ stage.details.needApproval ? '是' : '否' }}</el-descriptions-item>
                        </el-descriptions>
                      </template>

                      <!-- 海报设计 -->
                      <template v-else-if="stage.key === 'poster-design'">
                        <div v-if="stage.details.posterUrl" class="poster-thumbnail">
                          <el-image
                            :src="stage.details.posterUrl"
                            :preview-src-list="[stage.details.posterUrl]"
                            fit="cover"
                            style="width: 150px; height: 200px; border-radius: 8px;"
                          />
                        </div>
                        <p v-else class="empty-text">暂无海报</p>
                      </template>

                      <!-- 营销配置 -->
                      <template v-else-if="stage.key === 'marketing-config'">
                        <div class="marketing-tags">
                          <el-tag v-if="stage.details.hasGroupBuy" type="success">团购</el-tag>
                          <el-tag v-if="stage.details.hasCoupon" type="warning">优惠券</el-tag>
                          <el-tag v-if="stage.details.hasReward" type="danger">推荐奖励</el-tag>
                          <span v-if="!stage.details.hasGroupBuy && !stage.details.hasCoupon && !stage.details.hasReward" class="empty-text">
                            暂无营销配置
                          </span>
                        </div>
                      </template>

                      <!-- 报名页面 -->
                      <template v-else-if="stage.key === 'registration-page'">
                        <div class="registration-link">
                          <el-link :href="stage.details.registrationUrl" target="_blank" type="primary">
                            查看报名页面
                          </el-link>
                        </div>
                      </template>

                      <!-- 活动发布 -->
                      <template v-else-if="stage.key === 'activity-publish'">
                        <div class="publish-channels">
                          <el-tag
                            v-for="channel in stage.details.channels"
                            :key="channel"
                            class="channel-tag"
                          >
                            {{ channel }}
                          </el-tag>
                        </div>
                      </template>

                      <!-- 报名审核 -->
                      <template v-else-if="stage.key === 'registration-approval'">
                        <div class="approval-stats">
                          <el-statistic title="待审核" :value="stage.details.pendingCount" />
                          <el-statistic title="已通过" :value="stage.details.approvedCount" />
                          <el-statistic title="已拒绝" :value="stage.details.rejectedCount" />
                        </div>
                      </template>

                      <!-- 活动签到 -->
                      <template v-else-if="stage.key === 'activity-checkin'">
                        <div class="checkin-info">
                          <el-progress
                            :percentage="stage.details.checkinRate"
                            type="circle"
                            :width="80"
                          >
                            <template #default="{ percentage }">
                              <span class="percentage-value">{{ percentage }}%</span>
                            </template>
                          </el-progress>
                          <div class="checkin-text">
                            <p>{{ stage.details.checkinCount }} / {{ stage.details.totalCount }} 人已签到</p>
                          </div>
                        </div>
                      </template>

                      <!-- 效果评估 -->
                      <template v-else-if="stage.key === 'activity-evaluation'">
                        <div class="evaluation-info">
                          <el-rate
                            v-model="stage.details.averageRating"
                            disabled
                            show-score
                            text-color="#ff9900"
                          />
                          <p class="evaluation-count">共 {{ stage.details.evaluationCount }} 条评价</p>
                        </div>
                      </template>
                    </div>

                    <!-- 操作按钮 -->
                    <div v-if="stage.actions && stage.actions.length" class="stage-actions">
                      <el-button
                        v-for="action in stage.actions"
                        :key="action.key"
                        :type="action.type"
                        size="small"
                        @click.stop="handleActionClick(stage, action)"
                      >
                        {{ action.label }}
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>

        <!-- 错误状态 -->
        <el-empty v-else description="未找到活动信息" />
      </div>
    </template>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Loading as LoadingIcon, Clock } from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'
import { getActivityDetail } from '@/api/modules/activity'
import { request } from '@/utils/request'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const activity = ref<any>(null)
const timelineStages = ref<any[]>([])

// 8个流程步骤定义
const stageDefinitions = [
  { key: 'activity-planning', title: '活动策划', description: '制定活动计划和方案' },
  { key: 'poster-design', title: '海报设计', description: '设计活动宣传海报' },
  { key: 'marketing-config', title: '营销配置', description: '配置营销策略和推广方案' },
  { key: 'registration-page', title: '报名页面', description: '生成活动报名页面' },
  { key: 'activity-publish', title: '活动发布', description: '发布活动到各个渠道' },
  { key: 'registration-approval', title: '报名审核', description: '审核参与者报名信息' },
  { key: 'activity-checkin', title: '活动签到', description: '现场签到管理' },
  { key: 'activity-evaluation', title: '效果评估', description: '收集反馈和评估效果' }
]

// 加载活动数据
const loadActivity = async () => {
  const activityId = route.query.id as string
  if (!activityId) {
    ElMessage.error('缺少活动ID')
    return
  }

  try {
    loading.value = true
    const response = await getActivityDetail(activityId)
    
    if (response.success && response.data) {
      activity.value = response.data
      await loadTimelineData()
    } else {
      ElMessage.error('加载活动信息失败')
    }
  } catch (error) {
    console.error('加载活动失败:', error)
    ElMessage.error('加载活动信息失败')
  } finally {
    loading.value = false
  }
}

// 加载Timeline数据
const loadTimelineData = async () => {
  if (!activity.value) return

  // 构建Timeline数据
  timelineStages.value = stageDefinitions.map((def, index) => {
    const isCompleted = activity.value.completedStages?.includes(def.key)
    const isCurrent = activity.value.currentStage === def.key
    const status = isCompleted ? 'completed' : (isCurrent ? 'current' : 'pending')

    return {
      ...def,
      status,
      timestamp: isCompleted ? formatDate(new Date(Date.now() - (7 - index) * 24 * 60 * 60 * 1000)) : '',
      progress: isCompleted ? 100 : (isCurrent ? 50 : 0),
      details: getStageDetails(def.key),
      actions: getStageActions(def.key, status)
    }
  })
}

// 获取步骤详情数据
const getStageDetails = (stageKey: string) => {
  const mockDetails: Record<string, any> = {
    'activity-planning': {
      type: activity.value.type || '户外活动',
      maxParticipants: activity.value.capacity || 50,
      fee: activity.value.fee || 0,
      needApproval: activity.value.needApproval || false
    },
    'poster-design': {
      posterUrl: activity.value.posterUrl
    },
    'marketing-config': {
      hasGroupBuy: Math.random() > 0.5,
      hasCoupon: Math.random() > 0.5,
      hasReward: Math.random() > 0.5
    },
    'registration-page': {
      registrationUrl: `https://k.yyup.cc/activity/register?id=${activity.value.id}`
    },
    'activity-publish': {
      channels: ['微信公众号', '学校官网', '家长群']
    },
    'registration-approval': {
      pendingCount: Math.floor(Math.random() * 20),
      approvedCount: activity.value.registeredCount || 0,
      rejectedCount: Math.floor(Math.random() * 5)
    },
    'activity-checkin': {
      checkinCount: Math.floor(Math.random() * (activity.value.registeredCount || 50)),
      totalCount: activity.value.registeredCount || 50,
      checkinRate: Math.floor(Math.random() * 100)
    },
    'activity-evaluation': {
      averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      evaluationCount: Math.floor(Math.random() * 30)
    }
  }

  return mockDetails[stageKey]
}

// 获取步骤操作按钮
const getStageActions = (stageKey: string, status: string) => {
  if (status === 'pending') return []

  const actionsMap: Record<string, any[]> = {
    'activity-planning': [
      { key: 'edit', label: '编辑计划', type: 'primary' }
    ],
    'poster-design': [
      { key: 'design', label: '设计海报', type: 'primary' },
      { key: 'upload', label: '上传海报', type: 'default' }
    ],
    'marketing-config': [
      { key: 'config', label: '配置营销', type: 'primary' }
    ],
    'registration-page': [
      { key: 'view', label: '查看页面', type: 'primary' },
      { key: 'edit', label: '编辑页面', type: 'default' }
    ],
    'activity-publish': [
      { key: 'publish', label: '发布活动', type: 'primary' }
    ],
    'registration-approval': [
      { key: 'approve', label: '审核报名', type: 'primary' }
    ],
    'activity-checkin': [
      { key: 'checkin', label: '签到管理', type: 'primary' }
    ],
    'activity-evaluation': [
      { key: 'view', label: '查看评价', type: 'primary' }
    ]
  }

  return actionsMap[stageKey] || []
}

// Timeline类型
const getTimelineType = (status: string) => {
  if (status === 'completed') return 'success'
  if (status === 'current') return 'primary'
  return 'info'
}

// Timeline图标
const getTimelineIcon = (status: string) => {
  if (status === 'completed') return Check
  if (status === 'current') return LoadingIcon
  return Clock
}

// 步骤状态标签类型
const getStageTagType = (status: string) => {
  if (status === 'completed') return 'success'
  if (status === 'current') return 'primary'
  return 'info'
}

// 步骤状态文本
const getStageStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    completed: '已完成',
    current: '进行中',
    pending: '未开始'
  }
  return textMap[status] || '未知'
}

// 活动状态标签类型
const getStatusTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    draft: 'info',
    planning: 'warning',
    published: 'primary',
    ongoing: 'success',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

// 活动状态文本
const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    planning: '计划中',
    published: '已发布',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

// 格式化日期
const formatDate = (date: any) => {
  if (!date) return '未设置'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 点击步骤卡片
const handleStageClick = (stage: any) => {
  console.log('点击步骤:', stage)
}

// 点击操作按钮
const handleActionClick = (stage: any, action: any) => {
  console.log('执行操作:', stage.key, action.key)
  ElMessage.info(`执行操作: ${action.label}`)
}

// 返回列表
const goBack = () => {
  router.push('/centers/activity')
}

onMounted(() => {
  loadActivity()
})
</script>

<style scoped lang="scss">
.activity-timeline-page {
  padding: var(--spacing-3xl);
  min-height: 100vh;
}

.loading-container {
  padding: var(--spacing-3xl);
}

.timeline-content {
  max-width: 1200px;
  margin: 0 auto;
}

// 活动信息卡片
.activity-info-card {
  background: var(--bg-white);
  border-radius: var(--text-lg);
  padding: var(--spacing-3xl);
  margin-bottom: var(--spacing-3xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-3xl);

    h2 {
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .info-details {
    display: flex;
    gap: var(--spacing-3xl);
    flex-wrap: wrap;

    .info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      color: var(--text-secondary);
      font-size: var(--text-base);
    }
  }
}

// Timeline包装器
.timeline-wrapper {
  :deep(.el-timeline) {
    padding-left: 0;
  }

  :deep(.el-timeline-item__wrapper) {
    padding-left: var(--spacing-3xl);
  }

  :deep(.el-timeline-item__tail) {
    left: 4px;
  }

  :deep(.el-timeline-item__node) {
    left: 0;
  }
}

// Timeline项样式
.timeline-item {
  &--completed {
    :deep(.el-timeline-item__node) {
      background: #67c23a;
    }
  }

  &--current {
    :deep(.el-timeline-item__node) {
      background: #409eff;
      animation: pulse-dot 1.5s infinite;
    }
  }

  &--pending {
    :deep(.el-timeline-item__node) {
      background: #dcdfe6;
    }
  }
}

@keyframes pulse-dot {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
}

// 步骤卡片
.stage-card {
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
    transform: translateY(-2px);
  }

  :deep(.el-card__body) {
    padding: var(--spacing-3xl);
  }
}

.stage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);

  .stage-title {
    display: flex;
    align-items: center;
    gap: var(--text-lg);

    .stage-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      font-weight: 600;
      font-size: var(--text-base);
    }

    h3 {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: 600;
      color: var(--text-primary);
    }
  }
}

.stage-body {
  .stage-description {
    color: var(--text-secondary);
    margin-bottom: var(--text-lg);
    line-height: 1.6;
  }

  .stage-progress {
    margin: var(--text-lg) 0;
  }

  .stage-details {
    margin: var(--text-lg) 0;
    padding: var(--text-lg);
    background: var(--bg-secondary);
    border-radius: var(--spacing-sm);

    .poster-thumbnail {
      display: flex;
      justify-content: center;
    }

    .marketing-tags,
    .publish-channels {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }

    .approval-stats {
      display: flex;
      gap: var(--spacing-3xl);
      justify-content: space-around;
    }

    .checkin-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-3xl);

      .checkin-text {
        p {
          margin: 0;
          font-size: var(--text-base);
          color: var(--text-secondary);
        }
      }
    }

    .evaluation-info {
      text-align: center;

      .evaluation-count {
        margin-top: var(--text-lg);
        color: var(--text-secondary);
      }
    }

    .registration-link {
      text-align: center;
    }

    .empty-text {
      color: var(--text-placeholder);
      text-align: center;
      padding: var(--text-lg) 0;
    }
  }

  .stage-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--text-lg);
    padding-top: var(--text-lg);
    border-top: 1px solid var(--border-color);
  }
}

.channel-tag {
  margin: var(--spacing-xs);
}

.percentage-value {
  font-size: var(--text-sm);
  font-weight: 600;
}
</style>
