<template>
  <div class="plan-detail">
    <!-- 头部导航 -->
    <div class="page-header">
      <van-nav-bar
        :title="pageTitle"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
        placeholder
      >
        <template #right>
          <van-icon name="edit" @click="editPlan" />
        </template>
      </van-nav-bar>
    </div>

    <!-- 计划详情内容 -->
    <div class="plan-content">
      <!-- 计划基本信息 -->
      <div class="plan-header">
        <div class="plan-status">
          <van-tag :type="getStatusColor(plan.status)" size="large">
            {{ getStatusLabel(plan.status) }}
          </van-tag>
        </div>
        <div class="plan-info">
          <h2 class="plan-name">{{ plan.name }}</h2>
          <p class="plan-description">{{ plan.description || '暂无描述' }}</p>
          <div class="plan-meta">
            <div class="meta-item">
              <span class="label">训练对象:</span>
              <span class="value">{{ plan.childName || '儿童' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDate(plan.createdAt) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">难度等级:</span>
              <span class="value">{{ getDifficultyLabel(plan.difficulty) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 目标能力 -->
      <div class="target-abilities" v-if="plan.targetAbilities?.length">
        <h3>目标能力</h3>
        <div class="abilities-grid">
          <div
            v-for="ability in plan.targetAbilities"
            :key="ability"
            class="ability-item"
          >
            <van-icon :name="getAbilityIcon(ability)" />
            <span>{{ getAbilityLabel(ability) }}</span>
          </div>
        </div>
      </div>

      <!-- 进度统计 -->
      <div class="progress-stats">
        <h3>训练进度</h3>
        <div class="progress-overview">
          <div class="progress-circle">
            <van-circle
              :current="planProgress.percentage"
              :rate="100"
              :speed="100"
              :text="planProgress.percentage + '%'"
              size="120"
              color="#52c41a"
            />
          </div>
          <div class="progress-details">
            <div class="detail-item">
              <span class="label">已完成活动</span>
              <span class="value">{{ planProgress.completed }}/{{ planProgress.total }}</span>
            </div>
            <div class="detail-item">
              <span class="label">总训练时长</span>
              <span class="value">{{ planProgress.totalDuration }}分钟</span>
            </div>
            <div class="detail-item">
              <span class="label">平均准确率</span>
              <span class="value">{{ planProgress.accuracy }}%</span>
            </div>
            <div class="detail-item">
              <span class="label">连续训练</span>
              <span class="value">{{ planProgress.streak }}天</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 今日任务 -->
      <div class="today-tasks">
        <h3>今日任务</h3>
        <div class="tasks-list">
          <div
            v-for="task in todayTasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <div class="task-info">
              <div class="task-name">{{ task.activityName }}</div>
              <div class="task-meta">
                <van-tag type="primary" size="small">{{ task.type }}</van-tag>
                <span class="duration">{{ task.duration }}分钟</span>
              </div>
            </div>
            <div class="task-action">
              <van-button
                v-if="!task.completed"
                type="primary"
                size="small"
                @click="startActivity(task)"
                :loading="task.loading"
              >
                开始
              </van-button>
              <van-icon
                v-else
                name="success"
                color="#52c41a"
                size="20"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 活动列表 -->
      <div class="activities-list">
        <h3>训练活动 ({{ planActivities?.length || 0 }})</h3>
        <div class="activities-grid">
          <div
            v-for="activity in planActivities"
            :key="activity.id"
            class="activity-card"
            @click="viewActivity(activity)"
          >
            <div class="activity-header">
              <span class="activity-type">{{ getTypeLabel(activity.type) }}</span>
              <span class="activity-difficulty">难度{{ activity.difficulty }}</span>
            </div>
            <div class="activity-name">{{ activity.name }}</div>
            <div class="activity-progress">
              <van-progress
                :percentage="activity.progress"
                :show-pivot="false"
                stroke-width="4"
              />
              <span class="progress-text">{{ activity.completedSessions }}/{{ activity.totalSessions }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 训练记录 -->
      <div class="training-records" v-if="recentRecords.length">
        <h3>最近训练记录</h3>
        <div class="records-timeline">
          <van-timeline>
            <van-timeline-item
              v-for="(record, index) in recentRecords"
              :key="index"
              :timestamp="formatDate(record.date)"
              :color="getRecordColor(record.performance)"
            >
              <div class="record-content">
                <div class="record-title">{{ record.activityName }}</div>
                <div class="record-stats">
                  <span>得分: {{ record.score }}</span>
                  <span>准确率: {{ record.accuracy }}%</span>
                  <span>时长: {{ record.duration }}分钟</span>
                </div>
                <div class="record-feedback" v-if="record.feedback">
                  <p>{{ record.feedback }}</p>
                </div>
              </div>
            </van-timeline-item>
          </van-timeline>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <van-popup v-model:show="showEditModal" position="bottom" :style="{ height: '80%' }">
      <div class="edit-modal">
        <div class="modal-header">
          <h3>编辑训练计划</h3>
          <van-icon name="cross" @click="showEditModal = false" />
        </div>
        <div class="modal-content">
          <van-field
            v-model="editForm.name"
            label="计划名称"
            placeholder="请输入计划名称"
          />
          <van-field
            v-model="editForm.description"
            label="计划描述"
            type="textarea"
            placeholder="请输入计划描述"
            rows="3"
          />
          <van-field
            name="status"
            label="计划状态"
            readonly
            @click="showStatusPicker = true"
            :value="getStatusLabel(editForm.status)"
          />
          <van-button
            type="primary"
            block
            @click="saveChanges"
            :loading="saving"
          >
            保存修改
          </van-button>
        </div>
      </div>
    </van-popup>

    <!-- 状态选择器 -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()

// 页面数据
const plan = ref<any>({})
const planProgress = ref<any>({})
const todayTasks = ref<any[]>([])
const planActivities = ref<any[]>([])
const recentRecords = ref<any[]>([])

// 编辑相关
const showEditModal = ref(false)
const showStatusPicker = ref(false)
const saving = ref(false)
const editForm = ref({
  name: '',
  description: '',
  status: ''
})

// 计算属性
const pageTitle = computed(() => {
  return plan.value.name || '计划详情'
})

const statusColumns = [
  { text: '进行中', value: 'active' },
  { text: '已完成', value: 'completed' },
  { text: '已暂停', value: 'paused' }
]

// 方法
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    active: '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return labelMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'primary',
    completed: 'success',
    paused: 'warning'
  }
  return colorMap[status] || 'default'
}

const getDifficultyLabel = (difficulty: string) => {
  const labelMap: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return labelMap[difficulty] || difficulty
}

const getAbilityLabel = (ability: string) => {
  const labelMap: Record<string, string> = {
    attention: '注意力',
    memory: '记忆力',
    logic: '逻辑思维',
    language: '语言能力',
    motor: '运动协调',
    social: '社交能力'
  }
  return labelMap[ability] || ability
}

const getAbilityIcon = (ability: string) => {
  const iconMap: Record<string, string> = {
    attention: 'eye-o',
    memory: 'bookmark-o',
    logic: 'qr',
    language: 'chat-o',
    motor: 'fire',
    social: 'friends-o'
  }
  return iconMap[ability] || 'star-o'
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    cognitive: '认知',
    motor: '运动',
    language: '语言',
    social: '社交'
  }
  return typeMap[type] || type
}

const getRecordColor = (performance: string) => {
  const colorMap: Record<string, string> = {
    excellent: '#52c41a',
    good: '#1890ff',
    average: '#faad14',
    poor: '#ff4d4f'
  }
  return colorMap[performance] || '#666'
}

const loadPlanDetail = async () => {
  try {
    showLoadingToast('加载中...')

    const planId = route.params.id

    // 这里应该调用实际的API
    // const response = await getPlanDetail(planId)

    // 模拟数据
    plan.value = {
      id: planId,
      name: '认知能力提升计划',
      description: '通过系统的认知训练，提升孩子的注意力、记忆力和逻辑思维能力',
      status: 'active',
      childId: 1,
      childName: '小明',
      difficulty: 'medium',
      createdAt: '2025-12-01',
      targetAbilities: ['attention', 'memory', 'logic']
    }

    // 模拟进度数据
    planProgress.value = {
      percentage: 65,
      completed: 13,
      total: 20,
      totalDuration: 325,
      accuracy: 82,
      streak: 5
    }

    // 模拟今日任务
    todayTasks.value = [
      {
        id: 1,
        activityName: '注意力训练 - 找不同',
        type: '认知训练',
        duration: 15,
        completed: false,
        loading: false
      },
      {
        id: 2,
        activityName: '记忆力训练 - 记忆卡片',
        type: '认知训练',
        duration: 20,
        completed: false,
        loading: false
      },
      {
        id: 3,
        activityName: '逻辑思维训练 - 拼图',
        type: '认知训练',
        duration: 25,
        completed: true,
        loading: false
      }
    ]

    // 模拟活动列表
    planActivities.value = [
      {
        id: 1,
        name: '注意力训练 - 找不同',
        type: 'cognitive',
        difficulty: 2,
        progress: 75,
        completedSessions: 3,
        totalSessions: 4
      },
      {
        id: 2,
        name: '记忆力训练 - 记忆卡片',
        type: 'cognitive',
        difficulty: 1,
        progress: 50,
        completedSessions: 2,
        totalSessions: 4
      }
    ]

    // 模拟训练记录
    recentRecords.value = [
      {
        date: '2025-12-11 14:30',
        activityName: '注意力训练 - 找不同',
        score: 85,
        accuracy: 85,
        duration: 15,
        performance: 'good',
        feedback: '表现不错，注意力集中度有提升'
      },
      {
        date: '2025-12-11 10:00',
        activityName: '记忆力训练 - 记忆卡片',
        score: 92,
        accuracy: 92,
        duration: 20,
        performance: 'excellent',
        feedback: '记忆力表现优异，继续保持'
      },
      {
        date: '2025-12-10 15:00',
        activityName: '逻辑思维训练 - 拼图',
        score: 78,
        accuracy: 78,
        duration: 25,
        performance: 'average',
        feedback: '逻辑思维能力有提升空间，需要更多练习'
      }
    ]

  } catch (error) {
    console.error('加载计划详情失败:', error)
  }
}

const editPlan = () => {
  editForm.value = {
    name: plan.value.name,
    description: plan.value.description,
    status: plan.value.status
  }
  showEditModal.value = true
}

const onStatusConfirm = ({ selectedValues }: any) => {
  editForm.value.status = selectedValues[0].value
  showStatusPicker.value = false
}

const saveChanges = async () => {
  try {
    saving.value = true
    showLoadingToast('保存中...')

    // 这里应该调用实际的API
    // await updatePlan(plan.value.id, editForm.value)

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新本地数据
    plan.value.name = editForm.value.name
    plan.value.description = editForm.value.description
    plan.value.status = editForm.value.status

    showEditModal.value = false
    showSuccessToast('修改成功')

  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const startActivity = async (task: any) => {
  try {
    task.loading = true
    showLoadingToast('准备中...')

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 这里应该跳转到活动开始页面
    router.push(`/training-center/activity-start/${task.activityId}`)

  } catch (error) {
    console.error('开始活动失败:', error)
  } finally {
    task.loading = false
  }
}

const viewActivity = (activity: any) => {
  router.push(`/training-center/activity-detail/${activity.id}`)
}

// 生命周期
onMounted(() => {
  loadPlanDetail()
})
</script>

<style scoped lang="scss">
.plan-detail {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  :deep(.van-nav-bar) {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .van-icon {
      font-size: var(--text-xl);
      color: #666;
    }
  }
}

.plan-content {
  padding: var(--spacing-md);

  > div {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-lg);
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    h3 {
      color: #333;
      font-size: var(--text-lg);
      font-weight: 600;
      margin: 0 0 16px 0;
    }
  }
}

.plan-header {
  .plan-status {
    text-align: right;
    margin-bottom: 16px;

    .van-tag {
      border-radius: 20px;
    }
  }

  .plan-info {
    .plan-name {
      color: #333;
      font-size: var(--text-2xl);
      font-weight: bold;
      margin: 0 0 8px 0;
    }

    .plan-description {
      color: #666;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }

    .plan-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);

      .meta-item {
        .label {
          color: #666;
          font-size: var(--text-sm);
        }

        .value {
          color: #333;
          font-weight: 600;
          font-size: var(--text-sm);
        }
      }
    }
  }
}

.target-abilities {
  .abilities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--spacing-md);

    .ability-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--spacing-md) 8px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      background: #f8f9fa;

      .van-icon {
        font-size: var(--text-2xl);
        color: #1989fa;
        margin-bottom: 8px;
      }

      span {
        color: #333;
        font-size: var(--text-xs);
        text-align: center;
      }
    }
  }
}

.progress-stats {
  .progress-overview {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);

    .progress-circle {
      flex-shrink: 0;
    }

    .progress-details {
      flex: 1;

      .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm) 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #666;
          font-size: var(--text-sm);
        }

        .value {
          color: #333;
          font-weight: 600;
          font-size: var(--text-sm);
        }
      }
    }
  }
}

.today-tasks {
  .tasks-list {
    .task-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md);
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      margin-bottom: 12px;

      &.completed {
        background: #f6ffed;
        border-color: #b7eb8f;
      }

      .task-info {
        flex: 1;

        .task-name {
          font-size: var(--text-base);
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .task-meta {
          display: flex;
          gap: var(--spacing-sm);
          align-items: center;

          .duration {
            color: #666;
            font-size: var(--text-xs);
          }
        }
      }

      .task-action {
        .van-icon {
          font-size: var(--text-xl);
        }
      }
    }
  }
}

.activities-list {
  .activities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);

    .activity-card {
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: var(--spacing-md);
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #1989fa;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .activity-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .activity-type {
          font-size: var(--text-xs);
          color: #666;
        }

        .activity-difficulty {
          font-size: var(--text-xs);
          color: #666;
        }
      }

      .activity-name {
        font-size: var(--text-sm);
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      .activity-progress {
        position: relative;

        .progress-text {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: var(--text-xs);
          color: #666;
        }
      }
    }
  }
}

.training-records {
  :deep(.van-timeline) {
    .record-content {
      .record-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .record-stats {
        display: flex;
        gap: var(--spacing-md);
        color: #666;
        font-size: var(--text-sm);
        margin-bottom: 8px;
      }

      .record-feedback {
        p {
          color: #666;
          font-size: var(--text-sm);
          background: #f8f9fa;
          padding: var(--spacing-sm);
          border-radius: 4px;
          margin: 0;
        }
      }
    }
  }
}

.edit-modal {
  height: 100%;
  display: flex;
  flex-direction: column;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 20px;
    border-bottom: 1px solid #f0f0f0;

    h3 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .van-icon {
      font-size: var(--text-xl);
      color: #999;
    }
  }

  .modal-content {
    flex: 1;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .van-button {
      margin-top: auto;
    }
  }
}
</style>