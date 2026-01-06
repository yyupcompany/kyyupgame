<template>
  <div class="referral-list">
    <!-- 头部统计 -->
    <div class="stats-section">
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalReferrers }}</div>
            <div class="stat-label">推荐人数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalConversions }}</div>
            <div class="stat-label">成功转化</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Coin /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ stats.totalRewards.toLocaleString() }}</div>
            <div class="stat-label">奖励总额</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.conversionRate }}%</div>
            <div class="stat-label">转化率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="action-section">
      <div class="header-left">
        <h3>推荐奖励记录</h3>
        <span class="subtitle">共 {{ total }} 条记录</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreateReferral">
          <el-icon><Plus /></el-icon>
          创建推荐活动
        </el-button>
        <el-button @click="refreshList">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="推荐状态">
          <el-select
            v-model="filters.status"
            placeholder="全部状态"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已完成" value="completed" />
            <el-option label="已失效" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖励状态">
          <el-select
            v-model="filters.rewardStatus"
            placeholder="全部状态"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="待发放" value="pending" />
            <el-option label="已发放" value="paid" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 推荐记录表格 -->
    <el-table
      :data="referrals"
      v-loading="loading"
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />

      <el-table-column prop="referralCode" label="推荐码" width="120">
        <template #default="{ row }">
          <el-tag type="primary" size="small">{{ row.referralCode }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="推荐人" width="150">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="32" :src="row.referrer?.avatar">
              {{ row.referrer?.name?.charAt(0) }}
            </el-avatar>
            <div class="user-details">
              <div class="name">{{ row.referrer?.name }}</div>
              <div class="phone">{{ row.referrer?.phone }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="被推荐人" width="150">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="32" :src="row.referee?.avatar">
              {{ row.referee?.name?.charAt(0) }}
            </el-avatar>
            <div class="user-details">
              <div class="name">{{ row.referee?.name }}</div>
              <div class="phone">{{ row.referee?.phone }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="rewardAmount" label="奖励金额" width="120">
        <template #default="{ row }">
          <span class="reward-amount">¥{{ row.rewardAmount }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="推荐状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="rewardStatus" label="奖励状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getRewardStatusType(row.rewardStatus)" size="small">
            {{ getRewardStatusText(row.rewardStatus) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="推荐时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column prop="completedAt" label="完成时间" width="180">
        <template #default="{ row }">
          {{ row.completedAt ? formatTime(row.completedAt) : '-' }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            @click="handleViewDetail(row)"
          >
            详情
          </el-button>
          <el-button
            v-if="row.status === 'confirmed' && row.rewardStatus === 'pending'"
            size="small"
            type="success"
            @click="handlePayReward(row)"
          >
            发放奖励
          </el-button>
          <el-dropdown @command="(command) => handleCommand(command, row)">
            <el-button size="small">
              更多<el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="share">分享推荐码</el-dropdown-item>
                <el-dropdown-item command="edit" v-if="row.status === 'pending'">
                  编辑推荐
                </el-dropdown-item>
                <el-dropdown-item command="cancel" v-if="row.status === 'pending'">
                  取消推荐
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="selectedReferrals.length > 0">
      <div class="batch-info">
        已选择 {{ selectedReferrals.length }} 条记录
      </div>
      <div class="batch-buttons">
        <el-button @click="handleBatchPayReward" :loading="batchPaying">
          批量发放奖励
        </el-button>
        <el-button @click="handleBatchCancel">
          批量取消
        </el-button>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-section" v-if="total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 推荐对话框 -->
    <ReferralDialog
      v-model:visible="dialogVisible"
      :referral="selectedReferral"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User, TrendCharts, Coin, DataLine, Plus, Refresh, ArrowDown
} from '@element-plus/icons-vue'
import { request } from '@/utils/request'
import ReferralDialog from './ReferralDialog.vue'

interface Referral {
  id: number
  referralCode: string
  referrerId: number
  referrer?: any
  refereeId: number
  referee?: any
  rewardAmount: number
  status: string
  rewardStatus: string
  createdAt: string
  completedAt?: string
  notes?: string
}

// 响应式数据
const loading = ref(false)
const referrals = ref<Referral[]>([])
const total = ref(0)
const selectedReferrals = ref<Referral[]>([])
const dateRange = ref<any[]>([])
const batchPaying = ref(false)

const pagination = reactive({
  page: 1,
  pageSize: 20,
})

const filters = reactive({
  status: '',
  rewardStatus: '',
})

const dialogVisible = ref(false)
const selectedReferral = ref<any>(null)

// 统计数据
const stats = reactive({
  totalReferrers: 0,
  totalConversions: 0,
  totalRewards: 0,
  conversionRate: 0,
})

// 暴露方法给父组件
defineExpose({
  refreshList,
})

// 方法
const loadReferrals = async () => {
  try {
    loading.value = true

    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }

    if (filters.status) {
      params.status = filters.status
    }
    if (filters.rewardStatus) {
      params.rewardStatus = filters.rewardStatus
    }

    const response = await request.get('/api/marketing/referrals', { params })

    if (response.success) {
      referrals.value = response.data.items
      total.value = response.data.total
      stats.totalReferrers = response.data.stats.totalReferrers
      stats.totalConversions = response.data.stats.totalConversions
      stats.totalRewards = response.data.stats.totalRewards
      stats.conversionRate = response.data.stats.conversionRate
    } else {
      throw new Error(response.message || '获取推荐记录失败')
    }
  } catch (error: any) {
    console.error('加载推荐记录失败:', error)
    ElMessage.error(error.message || '加载推荐记录失败')
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  loadReferrals()
}

const handleFilterChange = () => {
  pagination.page = 1
  loadReferrals()
}

const handleDateChange = () => {
  // TODO: 实现日期范围筛选
  handleFilterChange()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadReferrals()
}

const handleSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadReferrals()
}

const handleCreateReferral = () => {
  selectedReferral.value = null
  dialogVisible.value = true
}

const handleSelectionChange = (selection: Referral[]) => {
  selectedReferrals.value = selection
}

const handleViewDetail = (referral: Referral) => {
  selectedReferral.value = referral
  dialogVisible.value = true
}

const handlePayReward = async (referral: Referral) => {
  try {
    await ElMessageBox.confirm(
      `确定要发放 ¥${referral.rewardAmount} 的奖励给 ${referral.referrer?.name} 吗？`,
      '确认发放奖励',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await request.post(`/api/marketing/referrals/${referral.id}/pay-reward`)

    if (response.success) {
      ElMessage.success('奖励发放成功')
      loadReferrals()
    } else {
      throw new Error(response.message || '奖励发放失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('发放奖励失败:', error)
      ElMessage.error(error.message || '发放奖励失败')
    }
  }
}

const handleBatchPayReward = async () => {
  try {
    const pendingReferrals = selectedReferrals.value.filter(
      r => r.status === 'confirmed' && r.rewardStatus === 'pending'
    )

    if (pendingReferrals.length === 0) {
      ElMessage.warning('没有可发放奖励的推荐记录')
      return
    }

    const totalAmount = pendingReferrals.reduce((sum, r) => sum + r.rewardAmount, 0)

    await ElMessageBox.confirm(
      `确定要给选中的 ${pendingReferrals.length} 条记录发放总计 ¥${totalAmount} 的奖励吗？`,
      '批量发放奖励',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    batchPaying.value = true
    const ids = pendingReferrals.map(r => r.id)

    const response = await request.post('/api/marketing/referrals/batch-pay-reward', { ids })

    if (response.success) {
      ElMessage.success(`成功发放 ${response.data.count} 条奖励`)
      loadReferrals()
    } else {
      throw new Error(response.message || '批量发放奖励失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量发放奖励失败:', error)
      ElMessage.error(error.message || '批量发放奖励失败')
    }
  } finally {
    batchPaying.value = false
  }
}

const handleBatchCancel = async () => {
  try {
    const pendingReferrals = selectedReferrals.value.filter(r => r.status === 'pending')

    if (pendingReferrals.length === 0) {
      ElMessage.warning('没有可取消的推荐记录')
      return
    }

    await ElMessageBox.confirm(
      `确定要取消选中的 ${pendingReferrals.length} 条推荐记录吗？`,
      '批量取消推荐',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const ids = pendingReferrals.map(r => r.id)

    const response = await request.post('/api/marketing/referrals/batch-cancel', { ids })

    if (response.success) {
      ElMessage.success(`成功取消 ${response.data.count} 条推荐记录`)
      loadReferrals()
    } else {
      throw new Error(response.message || '批量取消推荐失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量取消推荐失败:', error)
      ElMessage.error(error.message || '批量取消推荐失败')
    }
  }
}

const handleCommand = async (command: string, referral: Referral) => {
  switch (command) {
    case 'share':
      await handleShareReferral(referral)
      break
    case 'edit':
      handleEditReferral(referral)
      break
    case 'cancel':
      await handleCancelReferral(referral)
      break
  }
}

const handleShareReferral = async (referral: Referral) => {
  try {
    const shareUrl = `${window.location.origin}/referral/${referral.referralCode}`
    await navigator.clipboard.writeText(shareUrl)
    ElMessage.success('推荐链接已复制到剪贴板')
  } catch (error: any) {
    ElMessage.error('复制推荐链接失败')
  }
}

const handleEditReferral = (referral: Referral) => {
  selectedReferral.value = referral
  dialogVisible.value = true
}

const handleCancelReferral = async (referral: Referral) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这条推荐记录吗？',
      '取消推荐',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await request.delete(`/api/marketing/referrals/${referral.id}`)

    if (response.success) {
      ElMessage.success('推荐记录已取消')
      loadReferrals()
    } else {
      throw new Error(response.message || '取消推荐失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('取消推荐失败:', error)
      ElMessage.error(error.message || '取消推荐失败')
    }
  }
}

const handleDialogSuccess = () => {
  ElMessage.success('操作成功！')
  loadReferrals()
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'info',
    'confirmed': 'success',
    'completed': 'primary',
    'expired': 'warning',
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待确认',
    'confirmed': '已确认',
    'completed': '已完成',
    'expired': '已失效',
  }
  return statusMap[status] || status
}

const getRewardStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'paid': 'success',
    'cancelled': 'danger',
  }
  return statusMap[status] || 'info'
}

const getRewardStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '待发放',
    'paid': '已发放',
    'cancelled': '已取消',
  }
  return statusMap[status] || status
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 定义emit
const emit = defineEmits<{
  'refresh': []
}>()

// 生命周期
onMounted(() => {
  loadReferrals()
})
</script>

<style scoped lang="scss">
.referral-list {
  .stats-section {
    margin-bottom: 24px;

    .stat-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);

      .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: var(--spacing-lg);
        color: white;
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: var(--text-2xl);
          }
        }

        .stat-content {
          .stat-value {
            font-size: var(--text-2xl);
            font-weight: 700;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: var(--text-sm);
            opacity: 0.9;
          }
        }
      }
    }
  }

  .action-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      h3 {
        margin: 0 8px 0 0;
        font-size: var(--text-lg);
        font-weight: 600;
      }

      .subtitle {
        color: #909399;
        font-size: var(--text-sm);
      }
    }

    .header-right {
      display: flex;
      gap: var(--spacing-md);
    }
  }

  .filter-section {
    margin-bottom: 20px;
    padding: var(--spacing-md);
    background: #f8f9fa;
    border-radius: 8px;

    .filter-form {
      margin: 0;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .user-details {
      .name {
        font-weight: 600;
        color: #303133;
        font-size: var(--text-sm);
      }

      .phone {
        color: #909399;
        font-size: var(--text-xs);
      }
    }
  }

  .reward-amount {
    font-weight: 600;
    color: #67c23a;
  }

  .batch-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: var(--spacing-md);
    background: #f8f9fa;
    border-radius: 8px;

    .batch-info {
      font-weight: 600;
      color: #409eff;
    }

    .batch-buttons {
      display: flex;
      gap: var(--spacing-md);
    }
  }

  .pagination-section {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>