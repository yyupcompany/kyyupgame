<template>
  <MobileSubPageLayout title="任务详情" back-path="/mobile/teacher-center">
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" color="#409eff" />
      <span>加载中...</span>
    </div>

    <div v-else-if="error" class="error-container">
      <van-empty description="加载失败">
        <van-button type="primary" @click="loadTaskDetail">重试</van-button>
      </van-empty>
    </div>

    <div v-else-if="!taskDetail" class="empty-container">
      <van-empty description="任务不存在" />
    </div>

    <div v-else class="task-detail-container">
      <!-- 任务基本信息 -->
      <van-cell-group inset>
        <van-cell>
          <template #title>
            <div class="task-header">
              <h2 class="task-title">{{ taskDetail.title }}</h2>
              <van-tag
                :type="getPriorityType(taskDetail.priority)"
                size="medium"
              >
                {{ getPriorityText(taskDetail.priority) }}
              </van-tag>
            </div>
          </template>
        </van-cell>

        <van-cell title="任务类型" :value="getTypeText(taskDetail.type)" />
        <van-cell title="截止时间" :value="taskDetail.time" />
        <van-cell title="任务状态">
          <template #value>
            <van-tag
              :type="taskDetail.completed ? 'success' : 'warning'"
              size="medium"
            >
              {{ taskDetail.completed ? '已完成' : '进行中' }}
            </van-tag>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 任务描述 -->
      <van-cell-group inset>
        <van-cell title="任务描述" />
        <van-cell>
          <div class="task-description">
            {{ taskDetail.description || '暂无描述' }}
          </div>
        </van-cell>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button
          v-if="!taskDetail.completed"
          type="primary"
          size="large"
          @click="markAsCompleted"
          :loading="updating"
        >
          标记为完成
        </van-button>

        <van-button
          v-else
          type="warning"
          size="large"
          @click="markAsIncomplete"
          :loading="updating"
        >
          标记为进行中
        </van-button>

        <van-button
          type="default"
          size="large"
          @click="editTask"
        >
          编辑任务
        </van-button>
      </div>

      <!-- 任务历史记录 -->
      <van-cell-group inset>
        <van-cell title="操作历史" />
        <van-cell
          v-for="(record, index) in taskHistory"
          :key="index"
          :title="record.action"
          :label="formatTime(record.timestamp)"
        >
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { updateTaskStatus } from '@/api/modules/teacher-dashboard'

interface TaskDetail {
  id: number
  title: string
  description: string
  type: 'meeting' | 'teaching' | 'parent' | 'default'
  time: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

interface TaskHistory {
  action: string
  timestamp: number
}

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const updating = ref(false)
const error = ref('')
const taskDetail = ref<TaskDetail | null>(null)
const taskHistory = ref<TaskHistory[]>([])

const taskId = ref<number>(parseInt(route.query.id as string) || 0)

const getPriorityType = (priority: string) => {
  const types: Record<string, string> = {
    'high': 'danger',
    'medium': 'warning',
    'low': 'primary'
  }
  return types[priority] || 'default'
}

const getPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '普通优先级'
  }
  return texts[priority] || '普通'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    'meeting': '会议',
    'teaching': '教学',
    'parent': '家长沟通',
    'default': '其他'
  }
  return texts[type] || '其他'
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadTaskDetail = async () => {
  if (!taskId.value) {
    error.value = '无效的任务ID'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 模拟从API获取任务详情
    // 实际项目中应该调用具体的API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟数据 - 实际项目中从API获取
    taskDetail.value = {
      id: taskId.value,
      title: '准备明天数学课教案',
      description: '需要为大班A组准备关于数字认知的数学教案，包括教学目标、教学过程、教具准备等内容。',
      type: 'teaching',
      time: '2025-01-23 09:00',
      priority: 'high',
      completed: false
    }

    // 模拟历史记录
    taskHistory.value = [
      {
        action: '任务创建',
        timestamp: Date.now() - 86400000 // 24小时前
      },
      {
        action: '任务分配',
        timestamp: Date.now() - 43200000 // 12小时前
      }
    ]

  } catch (err: any) {
    console.error('加载任务详情失败:', err)
    error.value = err.message || '加载失败'
    showToast('加载任务详情失败')
  } finally {
    loading.value = false
  }
}

const markAsCompleted = async () => {
  if (!taskDetail.value) return

  updating.value = true
  try {
    const response = await updateTaskStatus(taskDetail.value.id, true)
    if (response.success) {
      taskDetail.value.completed = true
      showToast('任务已标记为完成')

      // 添加历史记录
      taskHistory.value.unshift({
        action: '任务完成',
        timestamp: Date.now()
      })
    } else {
      throw new Error(response.message || '更新失败')
    }
  } catch (err: any) {
    console.error('更新任务状态失败:', err)
    showToast('更新失败，请稍后重试')
  } finally {
    updating.value = false
  }
}

const markAsIncomplete = async () => {
  if (!taskDetail.value) return

  updating.value = true
  try {
    const response = await updateTaskStatus(taskDetail.value.id, false)
    if (response.success) {
      taskDetail.value.completed = false
      showToast('任务已标记为进行中')

      // 添加历史记录
      taskHistory.value.unshift({
        action: '任务重新开始',
        timestamp: Date.now()
      })
    } else {
      throw new Error(response.message || '更新失败')
    }
  } catch (err: any) {
    console.error('更新任务状态失败:', err)
    showToast('更新失败，请稍后重试')
  } finally {
    updating.value = false
  }
}

const editTask = () => {
  if (taskDetail.value) {
    router.push(`/mobile/teacher-center/task-edit?id=${taskDetail.value.id}`)
  }
}

onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadTaskDetail()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/responsive-mobile.scss';


.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: var(--spacing-md);
}

.task-detail-container {
  .task-header {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);

    .task-title {
      flex: 1;
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      color: #323233;
      line-height: 1.4;
    }
  }

  .task-description {
    line-height: 1.6;
    color: #646566;
    font-size: var(--text-sm);
    padding: var(--spacing-sm) 0;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin: var(--spacing-lg) 0;
    padding: 0 16px;
  }
}
</style>