<template>
  <div class="activity-checkin-page">
    <div class="page-header">
      <h1>活动签到管理</h1>
      <p>管理活动参与者签到</p>
    </div>

    <!-- 活动选择 -->
    <el-card class="activity-select-card">
      <el-form :inline="true">
        <el-form-item label="选择活动">
          <el-select 
            v-model="selectedActivityId" 
            placeholder="请选择活动" 
            style="width: 100%; max-width: 300px"
            @change="handleActivityChange"
          >
            <el-option
              v-for="activity in activities"
              :key="activity.id"
              :label="activity.title"
              :value="activity.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadParticipants">
            <UnifiedIcon name="Refresh" />
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 签到统计 -->
    <el-row :gutter="16" v-if="selectedActivityId">
      <el-col :span="6">
        <el-card>
          <el-statistic title="总人数" :value="stats.total" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="已签到" :value="stats.checkedIn">
            <template #suffix>
              <span style="font-size: var(--text-base); color: var(--success-color)">
                ({{ stats.checkinRate }}%)
              </span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="未签到" :value="stats.notCheckedIn" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <el-statistic title="迟到" :value="stats.late" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 参与者列表 -->
    <el-card class="participants-card" v-if="selectedActivityId">
      <template #header>
        <div class="card-header">
          <span>参与者列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索姓名或手机号"
              style="max-width: 200px; width: 100%"
              clearable
            >
              <template #prefix>
                <UnifiedIcon name="Search" />
              </template>
            </el-input>
            <el-button type="success" @click="showScanDialog">
              <UnifiedIcon name="default" />
              扫码签到
            </el-button>
          </div>
        </div>
      </template>

      <div class="table-wrapper">
<el-table class="responsive-table"
        v-loading="loading"
        :data="filteredParticipants"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="registrationTime" label="报名时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.registrationTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="checkinStatus" label="签到状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getCheckinStatusType(row.checkinStatus)">
              {{ getCheckinStatusLabel(row.checkinStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkinTime" label="签到时间" width="180">
          <template #default="{ row }">
            {{ row.checkinTime ? formatDate(row.checkinTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="!row.checkinStatus || row.checkinStatus === 'not_checked_in'"
              type="primary"
              size="small"
              @click="handleCheckin(row)"
            >
              签到
            </el-button>
            <el-button
              v-else
              type="danger"
              size="small"
              @click="handleCancelCheckin(row)"
            >
              取消签到
            </el-button>
          </template>
        </el-table-column>
      </el-table>
</div>
    </el-card>

    <!-- 扫码签到对话框 -->
    <el-dialog
      v-model="scanDialogVisible"
      title="扫码签到"
      width="500px"
    >
      <div class="scan-container">
        <div class="scan-area">
          <UnifiedIcon name="default" />
          <p>请使用扫码枪扫描参与者二维码</p>
        </div>
        <el-input
          v-model="scanCode"
          placeholder="或手动输入签到码"
          @keyup.enter="handleScanCheckin"
        >
          <template #append>
            <el-button @click="handleScanCheckin">确认</el-button>
          </template>
        </el-input>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, DocumentCopy } from '@element-plus/icons-vue'
import { get, post, put } from '@/utils/request'

// 数据
const loading = ref(false)
const activities = ref([])
const selectedActivityId = ref<number | null>(null)
const participants = ref([])
const searchKeyword = ref('')
const scanDialogVisible = ref(false)
const scanCode = ref('')

const stats = ref({
  total: 0,
  checkedIn: 0,
  notCheckedIn: 0,
  late: 0,
  checkinRate: 0
})

// 计算属性
const filteredParticipants = computed(() => {
  if (!searchKeyword.value) return participants.value
  
  return participants.value.filter((p: any) => 
    p.userName?.includes(searchKeyword.value) || 
    p.phone?.includes(searchKeyword.value)
  )
})

// 方法
const loadActivities = async () => {
  try {
    const response = await get('/activities', { status: 'active' })
    if (response.success) {
      activities.value = response.data.items || []
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
  }
}

const handleActivityChange = () => {
  loadParticipants()
}

const loadParticipants = async () => {
  if (!selectedActivityId.value) return
  
  try {
    loading.value = true
    const response = await get(`/activities/${selectedActivityId.value}/participants`)
    
    if (response.success) {
      participants.value = response.data.items || []
      calculateStats()
    }
  } catch (error) {
    console.error('加载参与者列表失败:', error)
    ElMessage.error('加载参与者列表失败')
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  const total = participants.value.length
  const checkedIn = participants.value.filter((p: any) => p.checkinStatus === 'checked_in').length
  const late = participants.value.filter((p: any) => p.checkinStatus === 'late').length
  
  stats.value = {
    total,
    checkedIn,
    notCheckedIn: total - checkedIn,
    late,
    checkinRate: total > 0 ? Math.round((checkedIn / total) * 100) : 0
  }
}

const handleCheckin = async (participant: any) => {
  try {
    const response = await post(`/activities/${selectedActivityId.value}/checkin`, {
      participantId: participant.id
    })
    
    if (response.success) {
      ElMessage.success('签到成功')
      loadParticipants()
    }
  } catch (error) {
    console.error('签到失败:', error)
    ElMessage.error('签到失败')
  }
}

const handleCancelCheckin = async (participant: any) => {
  try {
    await ElMessageBox.confirm('确定取消签到吗？', '确认', { type: 'warning' })
    
    const response = await put(`/activities/${selectedActivityId.value}/cancel-checkin`, {
      participantId: participant.id
    })
    
    if (response.success) {
      ElMessage.success('已取消签到')
      loadParticipants()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const showScanDialog = () => {
  scanCode.value = ''
  scanDialogVisible.value = true
}

const handleScanCheckin = async () => {
  if (!scanCode.value) {
    ElMessage.warning('请输入签到码')
    return
  }
  
  try {
    const response = await post(`/activities/${selectedActivityId.value}/scan-checkin`, {
      code: scanCode.value
    })
    
    if (response.success) {
      ElMessage.success('签到成功')
      scanDialogVisible.value = false
      loadParticipants()
    }
  } catch (error) {
    console.error('扫码签到失败:', error)
    ElMessage.error('签到失败，请检查签到码')
  }
}

const getCheckinStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    'not_checked_in': '未签到',
    'checked_in': '已签到',
    'late': '迟到'
  }
  return statusMap[status] || '未签到'
}

const getCheckinStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'not_checked_in': 'info',
    'checked_in': 'success',
    'late': 'warning'
  }
  return typeMap[status] || 'info'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped lang="scss">
.activity-checkin-page {
  padding: var(--text-3xl);

  .page-header {
    margin-bottom: var(--text-3xl);

    h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--text-3xl);
      font-weight: 600;
      color: var(--text-primary);
    }

    p {
      margin: 0;
      font-size: var(--text-base);
      color: var(--info-color);
    }
  }

  .activity-select-card {
    margin-bottom: var(--text-lg);
  }

  .el-row {
    margin-bottom: var(--text-lg);
  }

  .participants-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: var(--spacing-sm);
      }
    }
  }

  .scan-container {
    .scan-area {
      text-align: center;
      padding: var(--spacing-10xl);
      background: var(--bg-hover);
      border-radius: var(--spacing-sm);
      margin-bottom: var(--text-2xl);

      .scan-icon {
        font-size: var(--text-6xl);
        color: var(--primary-color);
        margin-bottom: var(--text-lg);
      }

      p {
        margin: 0;
        color: var(--text-regular);
      }
    }
  }
}
</style>

