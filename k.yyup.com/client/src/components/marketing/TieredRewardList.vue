<template>
  <div class="tiered-reward-list">
    <!-- 头部操作 -->
    <div class="list-header">
      <div class="header-left">
        <h3>阶梯奖励管理</h3>
        <span class="subtitle">共 {{ total }} 个阶梯奖励</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreateReward">
          <el-icon><Plus /></el-icon>
          创建奖励
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
        <el-form-item label="奖励类型">
          <el-select
            v-model="filters.type"
            placeholder="全部类型"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="报名奖励" value="registration" />
            <el-option label="团购奖励" value="group_buy" />
            <el-option label="积攒奖励" value="collect_reward" />
            <el-option label="推荐奖励" value="referral" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filters.isActive"
            placeholder="全部状态"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动">
          <el-select
            v-model="filters.activityId"
            placeholder="选择活动"
            clearable
            filterable
            @change="handleFilterChange"
          >
            <el-option
              v-for="activity in activities"
              :key="activity.id"
              :label="activity.title"
              :value="activity.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 阶梯奖励卡片列表 -->
    <div class="reward-cards" v-loading="loading">
      <div
        v-for="reward in tieredRewards"
        :key="reward.id"
        class="reward-card"
        :class="{ 'inactive': !reward.isActive }"
      >
        <div class="card-header">
          <div class="reward-info">
            <span class="reward-type">{{ getTypeText(reward.type) }}</span>
            <el-tag :type="reward.isActive ? 'success' : 'danger'" size="small">
              {{ reward.isActive ? '启用' : '禁用' }}
            </el-tag>
            <el-tag type="primary" size="small">第{{ reward.tier }}级</el-tag>
          </div>
          <div class="card-actions">
            <el-dropdown @command="handleCommand">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ action: 'edit', reward }">
                    编辑奖励
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'duplicate', reward }">
                    复制奖励
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="{ action: 'toggle', reward }"
                  >
                    {{ reward.isActive ? '禁用' : '启用' }}奖励
                  </el-dropdown-item>
                  <el-dropdown-item
                    :command="{ action: 'delete', reward }"
                    divided
                  >
                    删除奖励
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="card-body">
          <div class="activity-info">
            <h4>{{ reward.activity?.title }}</h4>
            <p class="activity-desc">{{ reward.activity?.description }}</p>
          </div>

          <div class="reward-conditions">
            <div class="condition-item">
              <div class="condition-header">
                <el-icon><Target /></el-icon>
                <span>触发条件</span>
              </div>
              <div class="condition-value">
                <span class="value">{{ reward.targetValue }}</span>
                <span class="unit">{{ getConditionUnit(reward.type) }}</span>
              </div>
            </div>

            <div class="condition-item">
              <div class="condition-header">
                <el-icon><Trophy /></el-icon>
                <span>奖励内容</span>
              </div>
              <div class="reward-content">
                <div class="reward-badge" :class="reward.rewardType">
                  {{ getRewardTypeText(reward.rewardType) }}
                </div>
                <div class="reward-details">
                  {{ getRewardDetails(reward) }}
                </div>
              </div>
            </div>
          </div>

          <div class="reward-description">
            <div class="desc-header">
              <el-icon><Document /></el-icon>
              <span>奖励描述</span>
            </div>
            <p>{{ reward.rewardDescription }}</p>
          </div>

          <div class="reward-stats">
            <div class="progress-section">
              <div class="progress-header">
                <span>完成进度</span>
                <span class="progress-text">{{ getProgressPercentage(reward).toFixed(1) }}%</span>
              </div>
              <el-progress
                :percentage="getProgressPercentage(reward)"
                :color="getProgressColor(reward)"
                :show-text="false"
              />
              <div class="progress-info">
                <span>当前: {{ reward.currentWinners }}</span>
                <span v-if="reward.maxWinners">/ {{ reward.maxWinners }}</span>
                <span v-else>/ 无限制</span>
              </div>
            </div>

            <div class="time-info">
              <div class="time-item" v-if="reward.createdAt">
                <span class="label">创建时间:</span>
                <span>{{ formatTime(reward.createdAt) }}</span>
              </div>
              <div class="time-item" v-if="reward.expiryDate">
                <span class="label">过期时间:</span>
                <span>{{ formatTime(reward.expiryDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="footer-stats">
            <div class="stat-item">
              <span class="label">已发放</span>
              <span class="value">{{ reward.currentWinners }}</span>
            </div>
            <div class="stat-item" v-if="reward.maxWinners">
              <span class="label">剩余名额</span>
              <span class="value">{{ Math.max(0, reward.maxWinners - reward.currentWinners) }}</span>
            </div>
          </div>
          <el-button
            v-if="reward.isActive && canAwardReward(reward)"
            type="primary"
            size="small"
            @click="handleManualAward(reward)"
          >
            手动发放
          </el-button>
          <el-button
            v-else-if="!reward.isActive"
            type="info"
            size="small"
            disabled
          >
            已禁用
          </el-button>
          <el-button
            v-else
            type="warning"
            size="small"
            disabled
          >
            已达上限
          </el-button>
        </div>
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

    <!-- 空状态 -->
    <el-empty v-if="!loading && tieredRewards.length === 0" description="暂无阶梯奖励数据">
      <el-button type="primary" @click="handleCreateReward">创建阶梯奖励</el-button>
    </el-empty>

    <!-- 阶梯奖励对话框 -->
    <TieredRewardDialog
      v-model:visible="dialogVisible"
      :reward="selectedReward"
      :activities="activities"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, MoreFilled, Target, Trophy, Document } from '@element-plus/icons-vue'
import { request } from '@/utils/request'
import TieredRewardDialog from './TieredRewardDialog.vue'

interface TieredReward {
  id: number
  activityId: number
  activity?: any
  type: string
  tier: number
  targetValue: number
  rewardType: string
  rewardValue: string
  rewardDescription: string
  isActive: boolean
  maxWinners?: number
  currentWinners: number
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

// 响应式数据
const loading = ref(false)
const tieredRewards = ref<TieredReward[]>([])
const activities = ref<any[]>([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  pageSize: 20,
})

const filters = reactive({
  type: '',
  isActive: undefined as boolean | undefined,
  activityId: '',
})

const dialogVisible = ref(false)
const selectedReward = ref<any>(null)

// 暴露方法给父组件
defineExpose({
  refreshList,
})

// 方法
const loadTieredRewards = async () => {
  try {
    loading.value = true

    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }

    if (filters.type) {
      params.type = filters.type
    }
    if (filters.isActive !== undefined) {
      params.isActive = filters.isActive
    }
    if (filters.activityId) {
      params.activityId = filters.activityId
    }

    const response = await request.get('/api/marketing/tiered-rewards', { params })

    if (response.success) {
      tieredRewards.value = response.data.items
      total.value = response.data.total
    } else {
      throw new Error(response.message || '获取阶梯奖励列表失败')
    }
  } catch (error: any) {
    console.error('加载阶梯奖励列表失败:', error)
    ElMessage.error(error.message || '加载阶梯奖励列表失败')
  } finally {
    loading.value = false
  }
}

const loadActivities = async () => {
  try {
    const response = await request.get('/api/activities', {
      params: { pageSize: 100 }
    })

    if (response.success) {
      activities.value = response.data.items
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
  }
}

const refreshList = () => {
  loadTieredRewards()
}

const handleFilterChange = () => {
  pagination.page = 1
  loadTieredRewards()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadTieredRewards()
}

const handleSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadTieredRewards()
}

const handleCreateReward = () => {
  selectedReward.value = null
  dialogVisible.value = true
}

const handleCommand = async ({ action, reward }: { action: string; reward: TieredReward }) => {
  switch (action) {
    case 'edit':
      handleEditReward(reward)
      break
    case 'duplicate':
      handleDuplicateReward(reward)
      break
    case 'toggle':
      await handleToggleReward(reward)
      break
    case 'delete':
      await handleDeleteReward(reward)
      break
  }
}

const handleEditReward = (reward: TieredReward) => {
  selectedReward.value = reward
  dialogVisible.value = true
}

const handleDuplicateReward = (reward: TieredReward) => {
  const duplicatedReward = {
    ...reward,
    id: undefined,
    tier: reward.tier + 1,
    currentWinners: 0,
    isActive: false,
  }
  selectedReward.value = duplicatedReward
  dialogVisible.value = true
}

const handleToggleReward = async (reward: TieredReward) => {
  try {
    const response = await request.patch(`/api/marketing/tiered-rewards/${reward.id}/toggle`)

    if (response.success) {
      reward.isActive = !reward.isActive
      ElMessage.success(`奖励已${reward.isActive ? '启用' : '禁用'}`)
    } else {
      throw new Error(response.message || '操作失败')
    }
  } catch (error: any) {
    console.error('切换奖励状态失败:', error)
    ElMessage.error(error.message || '操作失败')
  }
}

const handleDeleteReward = async (reward: TieredReward) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个阶梯奖励吗？此操作不可恢复。',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await request.delete(`/api/marketing/tiered-rewards/${reward.id}`)

    if (response.success) {
      ElMessage.success('奖励删除成功')
      loadTieredRewards()
    } else {
      throw new Error(response.message || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除奖励失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleManualAward = async (reward: TieredReward) => {
  try {
    await ElMessageBox.confirm(
      '确定要手动发放这个奖励吗？',
      '确认发放',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await request.post(`/api/marketing/tiered-rewards/${reward.id}/manual-award`)

    if (response.success) {
      reward.currentWinners += 1
      ElMessage.success('奖励发放成功')
    } else {
      throw new Error(response.message || '发放失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('手动发放奖励失败:', error)
      ElMessage.error(error.message || '发放失败')
    }
  }
}

const handleDialogSuccess = () => {
  ElMessage.success('操作成功！')
  loadTieredRewards()
}

const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'registration': '报名奖励',
    'group_buy': '团购奖励',
    'collect_reward': '积攒奖励',
    'referral': '推荐奖励',
  }
  return typeMap[type] || type
}

const getRewardTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'discount': '折扣优惠',
    'gift': '赠送礼品',
    'cashback': '现金返还',
    'points': '积分奖励',
    'free': '免费名额',
  }
  return typeMap[type] || type
}

const getConditionUnit = (type: string) => {
  const unitMap: Record<string, string> = {
    'registration': '人报名',
    'group_buy': '人成团',
    'collect_reward': '人积攒',
    'referral': '人推荐',
  }
  return unitMap[type] || '个'
}

const getRewardDetails = (reward: TieredReward) => {
  try {
    const details = JSON.parse(reward.rewardValue)
    if (typeof details === 'object') {
      return Object.values(details).join(', ')
    }
    return details
  } catch {
    return reward.rewardValue
  }
}

const getProgressPercentage = (reward: TieredReward) => {
  if (!reward.maxWinners) return 0
  return Math.min((reward.currentWinners / reward.maxWinners) * 100, 100)
}

const getProgressColor = (reward: TieredReward) => {
  const percentage = getProgressPercentage(reward)
  if (percentage >= 100) return '#f56c6c'
  if (percentage >= 80) return '#e6a23c'
  return '#67c23a'
}

const canAwardReward = (reward: TieredReward) => {
  return reward.isActive && (!reward.maxWinners || reward.currentWinners < reward.maxWinners)
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
  loadTieredRewards()
  loadActivities()
})
</script>

<style scoped lang="scss">
.tiered-reward-list {
  .list-header {
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

  .reward-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: 20px;

    .reward-card {
      background: white;
      border-radius: 12px;
      border: 2px solid #e4e7ed;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      &.inactive {
        opacity: 0.7;
        border-color: #dcdfe6;
        background: #fafafa;
      }

      .card-header {
        padding: var(--spacing-md) 16px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .reward-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-wrap: wrap;

          .reward-type {
            font-weight: 600;
            color: #409eff;
          }
        }
      }

      .card-body {
        padding: var(--spacing-md);

        .activity-info {
          margin-bottom: 16px;

          h4 {
            margin: 0 0 4px 0;
            font-size: var(--text-base);
            font-weight: 600;
            color: #303133;
          }

          .activity-desc {
            margin: 0;
            font-size: var(--text-sm);
            color: #606266;
            line-height: 1.4;
          }
        }

        .reward-conditions {
          margin-bottom: 16px;

          .condition-item {
            margin-bottom: 12px;

            .condition-header {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 8px;
              font-weight: 600;
              color: #303133;
            }

            .condition-value {
              display: flex;
              align-items: baseline;
              gap: var(--spacing-xs);

              .value {
                font-size: var(--text-xl);
                font-weight: 700;
                color: #409eff;
              }

              .unit {
                color: #909399;
                font-size: var(--text-sm);
              }
            }

            .reward-content {
              display: flex;
              align-items: center;
              gap: var(--spacing-md);

              .reward-badge {
                padding: var(--spacing-xs) 8px;
                border-radius: 4px;
                font-size: var(--text-xs);
                font-weight: 600;

                &.discount {
                  background: #fff7e6;
                  color: #e6a23c;
                }

                &.gift {
                  background: #f0f9ff;
                  color: #409eff;
                }

                &.cashback {
                  background: #f0f9ff;
                  color: #67c23a;
                }

                &.points {
                  background: #fff7e6;
                  color: #e6a23c;
                }

                &.free {
                  background: #f0f9ff;
                  color: #409eff;
                }
              }

              .reward-details {
                color: #606266;
                font-size: var(--text-sm);
              }
            }
          }
        }

        .reward-description {
          margin-bottom: 16px;
          padding: var(--spacing-md);
          background: #f8f9fa;
          border-radius: 8px;

          .desc-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;
            font-weight: 600;
            color: #303133;
          }

          p {
            margin: 0;
            color: #606266;
            font-size: var(--text-sm);
            line-height: 1.4;
          }
        }

        .reward-stats {
          .progress-section {
            margin-bottom: 12px;

            .progress-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;

              .progress-text {
                font-weight: 600;
                color: #409eff;
              }
            }

            .progress-info {
              font-size: var(--text-xs);
              color: #909399;
              margin-top: 4px;
            }
          }

          .time-info {
            .time-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              font-size: var(--text-xs);

              .label {
                color: #909399;
              }
            }
          }
        }
      }

      .card-footer {
        padding: 0 16px 16px;
        border-top: 1px solid #f0f0f0;
        margin-top: 16px;
        padding-top: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .footer-stats {
          display: flex;
          gap: var(--spacing-md);

          .stat-item {
            text-align: center;

            .label {
              display: block;
              font-size: var(--text-xs);
              color: #909399;
              margin-bottom: 2px;
            }

            .value {
              font-size: var(--text-sm);
              font-weight: 600;
              color: #409eff;
            }
          }
        }
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>