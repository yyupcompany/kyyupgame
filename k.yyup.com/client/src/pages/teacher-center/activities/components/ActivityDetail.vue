<template>
  <el-dialog
    :model-value="visible"
    :title="activity?.title || '活动详情'"
    width="900px"
    @close="$emit('close')"
  >
    <div class="activity-detail" v-if="activity">
      <!-- 活动基本信息 -->
      <div class="basic-info">
        <div class="info-header">
          <h3>基本信息</h3>
          <el-tag :type="getStatusTagType(activity.status)">
            {{ getStatusText(activity.status) }}
          </el-tag>
        </div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="活动标题">
            {{ activity.title }}
          </el-descriptions-item>
          <el-descriptions-item label="活动类型">
            {{ getTypeText(activity.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动日期">
            {{ formatDate(activity.date) }}
          </el-descriptions-item>
          <el-descriptions-item label="活动时间">
            {{ activity.startTime }} - {{ activity.endTime }}
          </el-descriptions-item>
          <el-descriptions-item label="活动地点">
            {{ activity.location }}
          </el-descriptions-item>
          <el-descriptions-item label="负责教师">
            {{ activity.teacherName || '未指定' }}
          </el-descriptions-item>
          <el-descriptions-item label="参与人数">
            {{ activity.participantCount || 0 }} 人
          </el-descriptions-item>
          <el-descriptions-item label="报名人数">
            {{ activity.registrationCount || 0 }} 人
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="description-section">
          <h4>活动描述</h4>
          <p>{{ activity.description }}</p>
        </div>
      </div>

      <!-- 活动统计 -->
      <div class="statistics-section" v-if="statistics">
        <h3>活动统计</h3>
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ statistics.registrations }}</div>
              <div class="stat-label">报名人数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ statistics.checkins }}</div>
              <div class="stat-label">签到人数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ statistics.completions }}</div>
              <div class="stat-label">完成人数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-number">{{ checkinRate }}%</div>
              <div class="stat-label">签到率</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 参与人员列表 -->
      <div class="participants-section" v-if="participants.length > 0">
        <h3>参与人员</h3>
        <div class="table-wrapper">
<el-table class="responsive-table" :data="participants" style="width: 100%" max-height="300">
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="class" label="班级" width="100" />
          <el-table-column label="报名状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.registered ? 'success' : 'info'" size="small">
                {{ row.registered ? '已报名' : '未报名' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="签到状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.checkedIn ? 'success' : 'warning'" size="small">
                {{ row.checkedIn ? '已签到' : '未签到' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="checkinTime" label="签到时间" width="150" />
          <el-table-column prop="notes" label="备注" />
        </el-table>
</div>
      </div>

      <!-- 活动评估 -->
      <div class="evaluation-section" v-if="evaluations.length > 0">
        <h3>活动评估</h3>
        <div class="evaluation-summary">
          <div class="average-rating">
            <span>平均评分：</span>
            <el-rate 
              v-model="averageRating" 
              disabled 
              show-score 
              text-color="#ff9900"
            />
          </div>
          <div class="evaluation-count">
            共 {{ evaluations.length }} 条评价
          </div>
        </div>
        
        <div class="evaluation-list">
          <div 
            v-for="evaluation in evaluations.slice(0, 3)" 
            :key="evaluation.id"
            class="evaluation-item"
          >
            <div class="evaluator-info">
              <span class="evaluator-name">{{ evaluation.evaluatorName }}</span>
              <el-rate 
                v-model="evaluation.rating" 
                disabled 
                size="small"
              />
            </div>
            <div class="evaluation-comment">{{ evaluation.comment }}</div>
            <div class="evaluation-time">{{ formatDate(evaluation.createdAt) }}</div>
          </div>
        </div>
        
        <el-button 
          v-if="evaluations.length > 3"
          type="text" 
          @click="$emit('view-all-evaluations', activity)"
        >
          查看全部评价 ({{ evaluations.length }})
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button type="primary" @click="$emit('edit', activity)">编辑活动</el-button>
      <el-button type="success" @click="$emit('manage-signin', activity)">签到管理</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Activity {
  id: number
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  type: 'teaching' | 'outdoor' | 'festival' | 'parent'
  teacherName?: string
  participantCount?: number
  registrationCount?: number
}

interface Participant {
  id: number
  name: string
  class: string
  registered: boolean
  checkedIn: boolean
  checkinTime?: string
  notes?: string
}

interface Evaluation {
  id: number
  evaluatorName: string
  rating: number
  comment: string
  createdAt: string
}

interface Statistics {
  registrations: number
  checkins: number
  completions: number
}

interface Props {
  visible: boolean
  activity: Activity | null
  participants: Participant[]
  evaluations: Evaluation[]
  statistics?: Statistics
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activity: null,
  participants: () => [],
  evaluations: () => [],
  statistics: () => ({ registrations: 0, checkins: 0, completions: 0 })
})

// Emits
const emit = defineEmits<{
  'close': []
  'edit': [activity: Activity]
  'manage-signin': [activity: Activity]
  'view-all-evaluations': [activity: Activity]
}>()

// 计算属性
const checkinRate = computed(() => {
  if (!props.statistics || props.statistics.registrations === 0) return 0
  return Math.round((props.statistics.checkins / props.statistics.registrations) * 100)
})

const averageRating = computed(() => {
  if (props.evaluations.length === 0) return 0
  const total = props.evaluations.reduce((sum, evaluation) => sum + evaluation.rating, 0)
  return Math.round((total / props.evaluations.length) * 10) / 10
})

// 方法
const getStatusTagType = (status: string) => {
  const typeMap = {
    'upcoming': 'info',
    'ongoing': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap = {
    'upcoming': '即将开始',
    'ongoing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || '未知'
}

const getTypeText = (type: string) => {
  const textMap = {
    'teaching': '教学活动',
    'outdoor': '户外活动',
    'festival': '节日庆典',
    'parent': '家长活动'
  }
  return textMap[type] || '其他'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
// 引入列表组件优化样式
@import "@/styles/list-components-optimization.scss";
.activity-detail {
  .basic-info,
  .statistics-section,
  .participants-section,
  .evaluation-section {
    margin-bottom: var(--text-3xl);

    h3 {
      margin-bottom: var(--text-lg);
      color: var(--el-text-color-primary);
    }

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-lg);

      h3 {
        margin: 0;
      }
    }

    .description-section {
      margin-top: var(--text-lg);

      h4 {
        margin-bottom: var(--spacing-sm);
        color: var(--el-text-color-primary);
      }

      p {
        color: var(--el-text-color-regular);
        line-height: 1.6;
      }
    }
  }

  .statistics-section {
    .stat-card {
      text-align: center;
      padding: var(--text-lg);
      background: var(--el-fill-color-light);
      border-radius: var(--spacing-sm);

      .stat-number {
        font-size: var(--text-3xl);
        font-weight: bold;
        color: var(--el-color-primary);
        margin-bottom: var(--spacing-xs);
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }
  }

  .evaluation-section {
    .evaluation-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-lg);
      padding: var(--text-sm);
      background: var(--el-fill-color-light);
      border-radius: var(--spacing-sm);

      .average-rating {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .evaluation-count {
        color: var(--el-text-color-secondary);
      }
    }

    .evaluation-list {
      .evaluation-item {
        padding: var(--text-sm);
        border: var(--border-width-base) solid var(--el-border-color-lighter);
        border-radius: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);

        .evaluator-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);

          .evaluator-name {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }

        .evaluation-comment {
          color: var(--el-text-color-regular);
          margin-bottom: var(--spacing-xs);
        }

        .evaluation-time {
          font-size: var(--text-sm);
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>
