<template>
  <el-dialog
    :model-value="visible"
    title="活动签到"
    width="800px"
    @close="$emit('close')"
  >
    <div class="activity-signin">
      <!-- 活动信息 -->
      <div class="activity-info">
        <h3>{{ activity?.title }}</h3>
        <p>{{ activity?.description }}</p>
        <div class="activity-meta">
          <span><el-icon><Calendar /></el-icon> {{ formatDate(activity?.date) }}</span>
          <span><el-icon><Clock /></el-icon> {{ activity?.startTime }} - {{ activity?.endTime }}</span>
          <span><el-icon><Location /></el-icon> {{ activity?.location }}</span>
        </div>
      </div>

      <!-- 签到统计 -->
      <div class="signin-stats">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number">{{ signinStats.total }}</div>
              <div class="stat-label">总人数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number">{{ signinStats.signed }}</div>
              <div class="stat-label">已签到</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number">{{ signinStats.unsigned }}</div>
              <div class="stat-label">未签到</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number">{{ signinRate }}%</div>
              <div class="stat-label">签到率</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 签到列表 -->
      <div class="signin-list">
        <div class="list-header">
          <span>参与人员签到情况</span>
          <el-button type="primary" size="small" @click="handleBatchSignin">
            批量签到
          </el-button>
        </div>

        <el-table :data="participants" style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="class" label="班级" width="100" />
          <el-table-column label="签到状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.signed ? 'success' : 'info'">
                {{ row.signed ? '已签到' : '未签到' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="signinTime" label="签到时间" width="150" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button 
                v-if="!row.signed"
                size="small" 
                type="success"
                @click="handleSignin(row)"
              >
                签到
              </el-button>
              <el-button 
                v-else
                size="small" 
                type="warning"
                @click="handleCancelSignin(row)"
              >
                取消签到
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button type="primary" @click="handleExport">导出签到表</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Calendar, Clock, Location } from '@element-plus/icons-vue'

// Props
interface Activity {
  id: number
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
}

interface Participant {
  id: number
  name: string
  class: string
  signed: boolean
  signinTime?: string
}

interface Props {
  visible: boolean
  activity: Activity | null
  participants: Participant[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  activity: null,
  participants: () => []
})

// Emits
const emit = defineEmits<{
  'close': []
  'signin': [participant: Participant]
  'cancel-signin': [participant: Participant]
  'batch-signin': [participants: Participant[]]
  'export': [activity: Activity]
}>()

// 响应式数据
const selectedParticipants = ref<Participant[]>([])

// 计算属性
const signinStats = computed(() => {
  const total = props.participants.length
  const signed = props.participants.filter(p => p.signed).length
  const unsigned = total - signed
  
  return { total, signed, unsigned }
})

const signinRate = computed(() => {
  if (signinStats.value.total === 0) return 0
  return Math.round((signinStats.value.signed / signinStats.value.total) * 100)
})

// 方法
const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const handleSignin = (participant: Participant) => {
  emit('signin', participant)
  ElMessage.success(`${participant.name} 签到成功`)
}

const handleCancelSignin = (participant: Participant) => {
  emit('cancel-signin', participant)
  ElMessage.info(`已取消 ${participant.name} 的签到`)
}

const handleBatchSignin = () => {
  if (selectedParticipants.value.length === 0) {
    ElMessage.warning('请选择要签到的人员')
    return
  }
  
  emit('batch-signin', selectedParticipants.value)
  ElMessage.success(`批量签到 ${selectedParticipants.value.length} 人成功`)
}

const handleExport = () => {
  if (!props.activity) return
  emit('export', props.activity)
  ElMessage.success('签到表导出成功')
}
</script>

<style lang="scss" scoped>
.activity-signin {
  .activity-info {
    margin-bottom: var(--text-2xl);
    padding: var(--text-lg);
    background: var(--el-fill-color-light);
    border-radius: var(--spacing-sm);

    h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0 0 var(--text-sm) 0;
      color: var(--el-text-color-regular);
    }

    .activity-meta {
      display: flex;
      gap: var(--text-lg);
      font-size: var(--text-base);
      color: var(--el-text-color-secondary);

      span {
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: var(--spacing-xs);
        }
      }
    }
  }

  .signin-stats {
    margin-bottom: var(--text-2xl);

    .stat-item {
      text-align: center;
      padding: var(--text-lg);
      background: var(--el-bg-color);
      border: var(--border-width-base) solid var(--el-border-color-light);
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

  .signin-list {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-lg);

      span {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style>
