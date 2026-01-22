<template>
  <MobileCenterLayout title="活动详情" :back-path="backPath">
    <template #right>
      <van-icon name="share-o" size="20" @click="handleShare" />
    </template>

    <div class="activity-detail-mobile">
      <!-- 活动基本信息卡片 -->
      <div class="activity-info-card">
        <div class="info-header">
          <h2 class="activity-title">{{ activity.name }}</h2>
          <van-tag :type="getStatusType(activity.status)" size="medium">
            {{ getStatusLabel(activity.status) }}
          </van-tag>
        </div>
        <div class="info-details">
          <div class="info-item">
            <van-icon name="clock-o" size="16" />
            <span>{{ formatDateRange(activity.startDate, activity.endDate) }}</span>
          </div>
          <div class="info-item">
            <van-icon name="location-o" size="16" />
            <span>{{ activity.location || '未设置地点' }}</span>
          </div>
          <div class="info-item">
            <van-icon name="friends-o" size="16" />
            <span>{{ activity.participantCount || 0 }} / {{ activity.maxParticipants || 0 }} 人</span>
          </div>
        </div>
      </div>

      <!-- Tab切换：流程进度 / 活动信息 -->
      <van-tabs v-model:active="activeTab" sticky offset-top="46" line-width="60">
        <van-tab title="流程进度" name="timeline">
          <!-- 8步流程Timeline -->
          <div class="timeline-wrapper">
            <van-steps direction="vertical" :active="currentStageIndex" active-color="#1989fa">
              <van-step
                v-for="(stage, index) in timelineStages"
                :key="stage.key"
              >
                <div class="stage-card" @click="handleStageClick(stage)">
                  <div class="stage-header">
                    <div class="stage-title-row">
                      <span class="stage-number">{{ index + 1 }}</span>
                      <span class="stage-title">{{ stage.title }}</span>
                    </div>
                    <van-tag
                      :type="getStageTagType(stage.status)"
                      size="medium"
                    >
                      {{ getStageStatusText(stage.status) }}
                    </van-tag>
                  </div>

                  <p class="stage-description">{{ stage.description }}</p>

                  <!-- 进度条 -->
                  <div class="stage-progress" v-if="stage.progress !== undefined">
                    <van-progress
                      :percentage="stage.progress"
                      :stroke-width="6"
                      :show-pivot="true"
                      pivot-color="#1989fa"
                    />
                  </div>

                  <!-- 步骤详情 -->
                  <div class="stage-details" v-if="stage.details">
                    <!-- 活动策划 -->
                    <template v-if="stage.key === 'activity-planning'">
                      <div class="detail-grid">
                        <div class="detail-item">
                          <span class="detail-label">活动类型</span>
                          <span class="detail-value">{{ stage.details.type }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">参与人数</span>
                          <span class="detail-value">{{ stage.details.maxParticipants }}人</span>
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">活动费用</span>
                          <span class="detail-value">¥{{ stage.details.fee }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="detail-label">需要审批</span>
                          <span class="detail-value">{{ stage.details.needApproval ? '是' : '否' }}</span>
                        </div>
                      </div>
                    </template>

                    <!-- 海报设计 -->
                    <template v-else-if="stage.key === 'poster-design'">
                      <div v-if="stage.details.posterUrl" class="poster-preview">
                        <van-image
                          :src="stage.details.posterUrl"
                          width="100"
                          height="140"
                          fit="cover"
                          radius="8"
                        />
                      </div>
                      <p v-else class="empty-text">暂无海报</p>
                    </template>

                    <!-- 营销配置 -->
                    <template v-else-if="stage.key === 'marketing-config'">
                      <div class="marketing-tags">
                        <van-tag v-if="stage.details.hasGroupBuy" type="success" plain>团购</van-tag>
                        <van-tag v-if="stage.details.hasCoupon" type="warning" plain>优惠券</van-tag>
                        <van-tag v-if="stage.details.hasReward" type="danger" plain>推荐奖励</van-tag>
                        <span v-if="!stage.details.hasGroupBuy && !stage.details.hasCoupon && !stage.details.hasReward" class="empty-text">
                          暂无营销配置
                        </span>
                      </div>
                    </template>

                    <!-- 报名审核 -->
                    <template v-else-if="stage.key === 'registration-approval'">
                      <div class="approval-stats">
                        <div class="approval-item">
                          <span class="approval-value pending">{{ stage.details.pendingCount }}</span>
                          <span class="approval-label">待审核</span>
                        </div>
                        <div class="approval-item">
                          <span class="approval-value success">{{ stage.details.approvedCount }}</span>
                          <span class="approval-label">已通过</span>
                        </div>
                        <div class="approval-item">
                          <span class="approval-value danger">{{ stage.details.rejectedCount }}</span>
                          <span class="approval-label">已拒绝</span>
                        </div>
                      </div>
                    </template>

                    <!-- 活动签到 -->
                    <template v-else-if="stage.key === 'activity-checkin'">
                      <div class="checkin-info">
                        <van-circle
                          v-model:currentRate="stage.details.checkinRate"
                          :rate="stage.details.checkinRate"
                          :stroke-width="60"
                          size="80px"
                          :text="stage.details.checkinRate + '%'"
                        />
                        <div class="checkin-text">
                          <p>{{ stage.details.checkinCount }} / {{ stage.details.totalCount }} 人已签到</p>
                        </div>
                      </div>
                    </template>

                    <!-- 效果评估 -->
                    <template v-else-if="stage.key === 'activity-evaluation'">
                      <div class="evaluation-info">
                        <van-rate
                          v-model="stage.details.averageRating"
                          allow-half
                          readonly
                          size="20"
                        />
                        <p class="evaluation-count">共 {{ stage.details.evaluationCount }} 条评价</p>
                      </div>
                    </template>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="stage-actions" v-if="stage.actions && stage.actions.length && stage.status !== 'pending'">
                    <van-button
                      v-for="action in stage.actions.slice(0, 2)"
                      :key="action.key"
                      size="small"
                      :type="action.type === 'primary' ? 'primary' : 'default'"
                      :plain="action.type !== 'primary'"
                      @click.stop="handleActionClick(stage, action)"
                    >
                      {{ action.label }}
                    </van-button>
                  </div>
                </div>
              </van-step>
            </van-steps>
          </div>
        </van-tab>

        <van-tab title="活动信息" name="info">
          <!-- 活动封面 -->
          <div class="cover-section">
            <img v-if="activity.coverUrl" :src="activity.coverUrl" :alt="activity.name" class="cover-image" />
            <div v-else class="cover-placeholder">
              <van-icon name="photo-o" size="48" color="#ccc" />
            </div>
          </div>

          <!-- 活动描述 -->
          <div class="description-section">
            <h3 class="section-title">活动介绍</h3>
            <div class="description-content" v-html="activity.description || '暂无介绍'"></div>
          </div>

          <!-- 活动安排 -->
          <div class="schedule-section" v-if="activity.schedule && activity.schedule.length">
            <h3 class="section-title">活动安排</h3>
            <van-steps direction="vertical" :active="0">
              <van-step v-for="(item, index) in activity.schedule" :key="index">
                <h4>{{ item.time }} - {{ item.title }}</h4>
                <p>{{ item.content }}</p>
              </van-step>
            </van-steps>
          </div>

          <!-- 注意事项 -->
          <div class="notes-section" v-if="activity.notes">
            <h3 class="section-title">注意事项</h3>
            <div class="notes-content">{{ activity.notes }}</div>
          </div>

          <!-- 组织者信息 -->
          <div class="organizer-section">
            <h3 class="section-title">组织者</h3>
            <div class="organizer-info">
              <van-image round width="40" height="40" :src="activity.organizerAvatar" />
              <div class="organizer-detail">
                <div class="organizer-name">{{ activity.organizerName }}</div>
                <div class="organizer-contact">{{ activity.organizerContact }}</div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>

      <!-- 底部操作栏 -->
      <div class="action-bar">
        <van-button 
          v-if="activity.status === 'upcoming'" 
          type="primary" 
          block 
          round 
          :disabled="activity.participantCount >= activity.maxParticipants"
          @click="handleRegister"
        >
          {{ activity.participantCount >= activity.maxParticipants ? '报名已满' : '立即报名' }}
        </van-button>
        <van-button 
          v-else-if="activity.status === 'ongoing'" 
          type="success" 
          block 
          round 
          @click="handleCheckin"
        >
          签到
        </van-button>
        <van-button 
          v-else 
          type="default" 
          block 
          round 
          disabled
        >
          活动已结束
        </van-button>
      </div>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showSuccessToast, showFailToast } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import { request } from '@/utils/request'
import { ACTIVITY_ENDPOINTS } from '@/api/endpoints/activity'

const router = useRouter()
const route = useRoute()

const activityId = computed(() => route.params.id as string)
const backPath = computed(() => route.query.from as string || '/mobile/activity/activity-index')
const activeTab = ref('timeline')  // 默认显示流程进度

// 活动详情
const activity = reactive({
  id: '',
  name: '',
  coverUrl: '',
  startDate: '',
  endDate: '',
  location: '',
  status: 'upcoming',
  type: '',
  participantCount: 0,
  maxParticipants: 0,
  fee: 0,
  description: '',
  schedule: [] as any[],
  notes: '',
  organizerName: '',
  organizerAvatar: '',
  organizerContact: '',
  // 流程状态
  completedStages: [] as string[],
  currentStage: ''
})

// 8步流程定义（与PC端ActivityTimeline.vue一致）
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

// Timeline数据
const timelineStages = ref<any[]>([])
const currentStageIndex = computed(() => {
  const index = timelineStages.value.findIndex(s => s.status === 'current')
  return index >= 0 ? index : 0
})

// 格式化日期范围
const formatDateRange = (start: string, end: string) => {
  if (!start) return '待定'
  const startStr = new Date(start).toLocaleDateString('zh-CN')
  if (!end || start === end) return startStr
  const endStr = new Date(end).toLocaleDateString('zh-CN')
  return `${startStr} ~ ${endStr}`
}

// 获取状态类型
const getStatusType = (status: string): TagType => {
  const types: Record<string, TagType> = {
    ongoing: 'success',
    upcoming: 'primary',
    ended: 'default',
    cancelled: 'danger'
  }
  return types[status] || 'default'
}

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ongoing: '进行中',
    upcoming: '即将开始',
    ended: '已结束',
    cancelled: '已取消'
  }
  return labels[status] || status
}

// 步骤状态标签类型
const getStageTagType = (status: string): TagType => {
  const types: Record<string, TagType> = {
    completed: 'success',
    current: 'primary',
    pending: 'default'
  }
  return types[status] || 'default'
}

// 步骤状态文本
const getStageStatusText = (status: string) => {
  const texts: Record<string, string> = {
    completed: '已完成',
    current: '进行中',
    pending: '未开始'
  }
  return texts[status] || '未知'
}

// 获取步骤详情数据
const getStageDetails = (stageKey: string) => {
  const mockDetails: Record<string, any> = {
    'activity-planning': {
      type: activity.type || '户外活动',
      maxParticipants: activity.maxParticipants || 50,
      fee: activity.fee || 0,
      needApproval: false
    },
    'poster-design': {
      posterUrl: activity.coverUrl || ''
    },
    'marketing-config': {
      hasGroupBuy: Math.random() > 0.5,
      hasCoupon: Math.random() > 0.5,
      hasReward: Math.random() > 0.5
    },
    'registration-page': {
      registrationUrl: `https://k.yyup.cc/activity/register?id=${activity.id}`
    },
    'activity-publish': {
      channels: ['微信公众号', '学校官网', '家长群']
    },
    'registration-approval': {
      pendingCount: Math.floor(Math.random() * 20),
      approvedCount: activity.participantCount || 0,
      rejectedCount: Math.floor(Math.random() * 5)
    },
    'activity-checkin': {
      checkinCount: Math.floor(Math.random() * (activity.participantCount || 50)),
      totalCount: activity.participantCount || 50,
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
      { key: 'view', label: '查看页面', type: 'primary' }
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

// 构建Timeline数据
const buildTimelineData = () => {
  timelineStages.value = stageDefinitions.map((def, index) => {
    const isCompleted = activity.completedStages?.includes(def.key)
    const isCurrent = activity.currentStage === def.key
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 加载活动详情
const loadActivity = async () => {
  try {
    // TODO: 调用API获取活动详情
    // 模拟数据
    Object.assign(activity, {
      id: activityId.value,
      name: '春季亲子运动会',
      coverUrl: '',
      startDate: '2025-03-15',
      endDate: '2025-03-15',
      location: '学校运动场',
      status: 'upcoming',
      participantCount: 28,
      maxParticipants: 50,
      fee: 0,
      description: '<p>一年一度的亲子运动会来啦！让孩子和家长们一起参与，增进亲子感情，锻炼身体。</p><p>本次运动会设有多个趣味项目，适合所有年龄段的家庭参与。</p>',
      schedule: [
        { time: '08:30', title: '签到入场', content: '请准时到达运动场签到' },
        { time: '09:00', title: '开幕式', content: '领导致辞、运动员入场' },
        { time: '09:30', title: '趣味比赛', content: '亲子接力、套圈等项目' },
        { time: '11:30', title: '颁奖典礼', content: '为获奖家庭颁发奖品' }
      ],
      notes: '1. 请穿运动装和运动鞋\n2. 自带饮用水\n3. 注意安全，听从工作人员指挥',
      organizerName: '园长办公室',
      organizerAvatar: '',
      organizerContact: '联系电话: 123-4567-8900',
      // 流程状态
      completedStages: ['activity-planning', 'poster-design'],
      currentStage: 'marketing-config'
    })

    // 构建Timeline数据
    buildTimelineData()
  } catch (error) {
    console.error('加载活动详情失败:', error)
    showToast('加载失败')
  }
}

// 点击步骤卡片
const handleStageClick = (stage: any) => {
  console.log('点击步骤:', stage)
}

// 点击操作按钮
const handleActionClick = (stage: any, action: any) => {
  console.log('执行操作:', stage.key, action.key)
  
  const actionRoutes: Record<string, string> = {
    'edit': `/mobile/activity/activity-edit?id=${activityId.value}`,
    'design': '/mobile/activity/activity-poster',
    'upload': '/mobile/activity/activity-poster?mode=upload',
    'config': '/mobile/centers/marketing-center',
    'view': `/mobile/activity/activity-register?id=${activityId.value}`,
    'publish': '/mobile/activity/activity-publish',
    'approve': '/mobile/activity/activity-approval',
    'checkin': `/mobile/activity/activity-checkin?id=${activityId.value}`
  }

  const route = actionRoutes[action.key]
  if (route) {
    router.push(route)
  } else {
    showToast(`执行操作: ${action.label}`)
  }
}

// 分享
const handleShare = async () => {
  if (!activityId.value) {
    showToast('活动ID不存在')
    return
  }
  
  showLoadingToast({ message: '生成分享链接...', forbidClick: true })
  
  try {
    // 调用分享API
    const response = await request.post<{
      shareUrl: string
      shareContent: string
      qrcodeUrl?: string
      shareId: number
    }>(`${ACTIVITY_ENDPOINTS.BASE}/${activityId.value}/share`, {
      shareChannel: 'wechat',
      shareContent: `快来参加“${activity.name}”活动吧！`
    })
    
    closeToast()
    
    if (response.data) {
      // 尝试使用浏览器原生分享API
      if (navigator.share) {
        try {
          await navigator.share({
            title: activity.name,
            text: response.data.shareContent,
            url: response.data.shareUrl
          })
          showSuccessToast('分享成功')
        } catch (shareError) {
          // 用户取消分享或分享失败，复制链接
          await copyToClipboard(response.data.shareUrl)
        }
      } else {
        // 浏览器不支持原生分享，复制链接
        await copyToClipboard(response.data.shareUrl)
      }
    }
  } catch (error: any) {
    closeToast()
    showFailToast(error?.message || '分享失败')
  }
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showSuccessToast('链接已复制')
  } catch {
    // 备选方法
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showSuccessToast('链接已复制')
  }
}

// 报名
const handleRegister = () => {
  router.push(`/mobile/activity/activity-register?id=${activityId.value}`)
}

// 签到
const handleCheckin = () => {
  router.push(`/mobile/activity/activity-checkin?id=${activityId.value}`)
}

onMounted(() => {
  loadActivity()
})
</script>

<style scoped lang="scss">
.activity-detail-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;

  // 活动信息卡片
  .activity-info-card {
    background: #fff;
    padding: 16px;
    margin: 12px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .activity-title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin: 0;
      flex: 1;
      margin-right: 12px;
    }

    .info-details {
      .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #666;
        margin-bottom: 6px;
      }
    }
  }

  // Timeline样式
  .timeline-wrapper {
    padding: 12px;

    :deep(.van-step__title) {
      padding: 0;
    }

    :deep(.van-step__line) {
      background: #e8e8e8;
    }

    :deep(.van-step--finish .van-step__line) {
      background: #1989fa;
    }
  }

  .stage-card {
    background: #fff;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

    .stage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .stage-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stage-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #1989fa;
      color: #fff;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
    }

    .stage-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }

    .stage-description {
      font-size: 12px;
      color: #999;
      margin: 0 0 8px 0;
    }

    .stage-progress {
      margin-bottom: 8px;
    }

    .stage-details {
      padding: 8px;
      background: #f7f8fa;
      border-radius: 8px;
      margin-bottom: 8px;

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .detail-label {
          font-size: 11px;
          color: #999;
        }

        .detail-value {
          font-size: 13px;
          font-weight: 500;
          color: #333;
        }
      }

      .poster-preview {
        display: flex;
        justify-content: center;
      }

      .marketing-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .approval-stats {
        display: flex;
        justify-content: space-around;

        .approval-item {
          text-align: center;

          .approval-value {
            display: block;
            font-size: 18px;
            font-weight: 600;

            &.pending { color: #ff976a; }
            &.success { color: #07c160; }
            &.danger { color: #ee0a24; }
          }

          .approval-label {
            font-size: 11px;
            color: #999;
          }
        }
      }

      .checkin-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .checkin-text {
          p {
            margin: 0;
            font-size: 13px;
            color: #666;
          }
        }
      }

      .evaluation-info {
        text-align: center;

        .evaluation-count {
          margin-top: 8px;
          font-size: 12px;
          color: #999;
        }
      }

      .empty-text {
        color: #ccc;
        text-align: center;
        font-size: 12px;
        padding: 8px 0;
      }
    }

    .stage-actions {
      display: flex;
      gap: 8px;
      padding-top: 8px;
      border-top: 1px solid #f0f0f0;
    }
  }

  // 活动信息样式
  .cover-section {
    height: 180px;
    background: #f5f5f5;
    margin: 12px;
    border-radius: 8px;
    overflow: hidden;

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 3px solid #1989fa;
  }

  .description-section,
  .schedule-section,
  .notes-section,
  .organizer-section {
    background: #fff;
    padding: 16px;
    margin: 0 12px 12px 12px;
    border-radius: 8px;
  }

  .description-content {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
  }

  .notes-content {
    font-size: 14px;
    color: #666;
    white-space: pre-line;
  }

  .organizer-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .organizer-detail {
      .organizer-name {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }
      .organizer-contact {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }
    }
  }

  .action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
