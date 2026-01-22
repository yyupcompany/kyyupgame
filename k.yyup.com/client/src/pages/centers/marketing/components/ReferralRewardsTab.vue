<template>
  <div class="referral-rewards-tab">
    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-row">
        <el-select
          v-model="filters.role"
          placeholder="角色筛选"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部角色" value="" />
          <el-option label="教师" value="teacher" />
          <el-option label="家长" value="parent" />
          <el-option label="园长" value="principal" />
        </el-select>

        <el-select
          v-model="filters.status"
          placeholder="状态筛选"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部状态" value="" />
          <el-option label="待发放" value="pending" />
          <el-option label="已发放" value="paid" />
          <el-option label="已取消" value="cancelled" />
        </el-select>

        <el-input
          v-model="filters.search"
          placeholder="搜索推荐人或被推荐人"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 奖励记录表格 -->
    <el-table
      v-loading="loading"
      :data="rewardList"
      stripe
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <el-table-column prop="referrerName" label="推荐人" width="120">
        <template #default="{ row }">
          <div class="referrer-info">
            <el-tag :type="getRoleTagType(row.referrerRole)" size="small">
              {{ getRoleLabel(row.referrerRole) }}
            </el-tag>
            <span class="name">{{ row.referrerName }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="refereeName" label="被推荐人" width="120" />

      <el-table-column prop="referralDate" label="推荐日期" width="110" sortable="custom">
        <template #default="{ row }">
          {{ formatDate(row.referralDate) }}
        </template>
      </el-table-column>

      <el-table-column prop="rewardAmount" label="奖励金额" width="100" sortable="custom">
        <template #default="{ row }">
          <span class="reward-amount">¥{{ row.rewardAmount }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="rewardType" label="奖励类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getRewardTypeTagType(row.rewardType)" size="small">
            {{ getRewardTypeLabel(row.rewardType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="paidDate" label="发放日期" width="110">
        <template #default="{ row }">
          {{ row.paidDate ? formatDate(row.paidDate) : '-' }}
        </template>
      </el-table-column>

      <el-table-column prop="conversionStage" label="转化阶段" width="120">
        <template #default="{ row }">
          <el-progress
            :percentage="getConversionProgress(row.conversionStage)"
            :stroke-width="6"
            :show-text="false"
          />
          <span class="stage-text">{{ getConversionStageLabel(row.conversionStage) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            @click="handleViewDetail(row)"
          >
            详情
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            type="success"
            size="small"
            @click="handleApproveReward(row)"
          >
            发放
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 奖励详情对话框 -->
    <RewardDetailDialog
      v-model="showDetailDialog"
      :reward="selectedReward"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import RewardDetailDialog from './RewardDetailDialog.vue'
import MarketingPerformanceService from '@/services/marketing-performance.service'

// Props
interface Props {
  dateRange: [string, string]
  loading: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  refresh: []
}>()

// 响应式数据
const rewardList = ref([])
const showDetailDialog = ref(false)
const selectedReward = ref(null)

// 筛选条件
const filters = reactive({
  role: '',
  status: '',
  search: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 排序
const sortConfig = reactive({
  prop: '',
  order: ''
})

// 加载奖励记录
const loadRewardList = async () => {
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      startDate: props.dateRange[0],
      endDate: props.dateRange[1],
      referrerRole: filters.role || undefined,
      status: filters.status || undefined,
      search: filters.search || undefined,
      sortBy: sortConfig.prop,
      sortOrder: sortConfig.order === 'ascending' ? 'asc' : 'desc'
    }

    const response = await MarketingPerformanceService.getReferralRewards(params)
    rewardList.value = response.data
    pagination.total = response.total
  } catch (error) {
    console.error('加载奖励记录失败:', error)
    ElMessage.error('加载奖励记录失败')
  }
}

// 处理筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadRewardList()
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  loadRewardList()
}

// 处理排序变化
const handleSortChange = ({ prop, order }) => {
  sortConfig.prop = prop
  sortConfig.order = order
  loadRewardList()
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadRewardList()
}

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadRewardList()
}

// 查看详情
const handleViewDetail = (reward: any) => {
  selectedReward.value = reward
  showDetailDialog.value = true
}

// 审批发放奖励
const handleApproveReward = async (reward: any) => {
  try {
    await ElMessageBox.confirm(
      `确认发放 ¥${reward.rewardAmount} 的奖励给 ${reward.referrerName}？`,
      '发放奖励',
      {
        confirmButtonText: '确认发放',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await MarketingPerformanceService.approveReward(reward.id)
    ElMessage.success('奖励发放成功')
    loadRewardList()
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发放奖励失败:', error)
      ElMessage.error('发放奖励失败')
    }
  }
}

// 工具函数
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getRoleTagType = (role: string) => {
  const typeMap = {
    teacher: 'primary',
    parent: 'success',
    principal: 'warning'
  }
  return typeMap[role] || 'info'
}

const getRoleLabel = (role: string) => {
  const labelMap = {
    teacher: '教师',
    parent: '家长',
    principal: '园长'
  }
  return labelMap[role] || role
}

const getRewardTypeTagType = (type: string) => {
  const typeMap = {
    visit: 'info',
    enrollment: 'success',
    trial: 'warning'
  }
  return typeMap[type] || 'info'
}

const getRewardTypeLabel = (type: string) => {
  const labelMap = {
    visit: '到访奖励',
    enrollment: '报名奖励',
    trial: '体验课奖励'
  }
  return labelMap[type] || type
}

const getStatusTagType = (status: string) => {
  const typeMap = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    pending: '待发放',
    paid: '已发放',
    cancelled: '已取消'
  }
  return labelMap[status] || status
}

const getConversionProgress = (stage: string) => {
  const stageMap = {
    'link_clicked': 20,
    'visited': 40,
    'trial_attended': 60,
    'enrolled': 100
  }
  return stageMap[stage] || 0
}

const getConversionStageLabel = (stage: string) => {
  const labelMap = {
    'link_clicked': '已点击链接',
    'visited': '已到访',
    'trial_attended': '已体验',
    'enrolled': '已报名'
  }
  return labelMap[stage] || stage
}

// 监听日期范围变化
watch(() => props.dateRange, () => {
  loadRewardList()
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  loadRewardList()
})
</script>

<style scoped lang="scss">
.referral-rewards-tab {
  .filter-section {
    margin-bottom: var(--text-2xl);
    padding: var(--text-xl);
    background: var(--bg-card);
    border-radius: var(--text-sm);
    border: 1px solid var(--border-light);

    .filter-row {
      display: flex;
      gap: var(--spacing-lg);
      align-items: center;
      flex-wrap: wrap;

      .el-select,
      .el-input {
        width: 200px;
      }
    }
  }

  :deep(.el-table) {
    .referrer-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);

      .name {
        font-size: var(--text-sm);
        color: var(--text-primary);
      }
    }

    .reward-amount {
      font-weight: 600;
      color: var(--success-color);
    }

    .stage-text {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-top: var(--spacing-xs);
    }
  }

  .pagination-wrapper {
    margin-top: var(--text-2xl);
    display: flex;
    justify-content: center;
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .referral-rewards-tab {
    .filter-section {
      .filter-row {
        flex-direction: column;
        align-items: stretch;

        .el-select,
        .el-input {
          width: 100%;
        }
      }
    }

    :deep(.el-table) {
      font-size: var(--text-sm);
    }
  }
}
</style>