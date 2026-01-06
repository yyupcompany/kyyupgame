<template>
  <div class="group-buy-list">
    <!-- 头部操作 -->
    <div class="list-header">
      <div class="header-left">
        <h3>团购列表</h3>
        <span class="subtitle">共 {{ total }} 个团购</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreateGroup">
          <el-icon><Plus /></el-icon>
          我要开团
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
        <el-form-item label="状态">
          <el-select
            v-model="filters.status"
            placeholder="全部状态"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="进行中" value="in_progress" />
            <el-option label="已成团" value="completed" />
            <el-option label="已过期" value="expired" />
            <el-option label="已失败" value="failed" />
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

    <!-- 团购列表 -->
    <div class="group-cards" v-loading="loading">
      <div
        v-for="group in groupBuys"
        :key="group.id"
        class="group-card"
        :class="{ 'completed': group.status === 'completed' }"
      >
        <div class="card-header">
          <div class="group-info">
            <span class="group-code">{{ group.groupCode }}</span>
            <el-tag :type="getStatusType(group.status)" size="small">
              {{ getStatusText(group.status) }}
            </el-tag>
          </div>
          <div class="card-actions">
            <el-dropdown @command="handleCommand">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ action: 'detail', group }">
                    查看详情
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'share', group }">
                    分享团购
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="group.status === 'in_progress'"
                    :command="{ action: 'invite', group }"
                  >
                    邀请好友
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="card-body">
          <div class="activity-info">
            <h4>{{ group.activity?.title }}</h4>
            <p class="activity-desc">{{ group.activity?.description }}</p>
          </div>

          <div class="progress-section">
            <div class="people-progress">
              <div class="progress-header">
                <span class="current">{{ group.currentPeople }}</span>
                <span class="separator">/</span>
                <span class="target">{{ group.targetPeople }}</span>
                <span class="unit">人</span>
              </div>
              <el-progress
                :percentage="getProgressPercentage(group)"
                :color="getProgressColor(group)"
                :show-text="false"
                :stroke-width="8"
              />
            </div>

            <div class="time-info" v-if="group.status === 'in_progress'">
              <el-icon><Timer /></el-icon>
              <span>剩余：{{ formatRemainingTime(group.deadline) }}</span>
            </div>
          </div>

          <div class="price-info">
            <div class="price-row">
              <span class="label">团购价</span>
              <span class="group-price">¥{{ group.groupPrice }}</span>
            </div>
            <div class="price-row">
              <span class="label">原价</span>
              <span class="original-price">¥{{ group.originalPrice }}</span>
              <span class="discount">省¥{{ (group.originalPrice - group.groupPrice).toFixed(2) }}</span>
            </div>
          </div>

          <div class="leader-info">
            <el-avatar :size="32" :src="group.groupLeader?.avatar">
              {{ group.groupLeader?.name?.charAt(0) }}
            </el-avatar>
            <div class="leader-details">
              <span class="name">{{ group.groupLeader?.name }}</span>
              <span class="role">团长</span>
            </div>
          </div>

          <div class="stats-info">
            <div class="stat-item">
              <span class="label">浏览</span>
              <span class="value">{{ group.viewCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">分享</span>
              <span class="value">{{ group.shareCount }}</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <el-button
            v-if="group.status === 'in_progress' && group.canJoin"
            type="primary"
            size="small"
            @click="handleJoinGroup(group)"
          >
            立即参团
          </el-button>
          <el-button
            v-else-if="group.status === 'completed'"
            type="success"
            size="small"
            disabled
          >
            已成团
          </el-button>
          <el-button
            v-else
            size="small"
            disabled
          >
            {{ getStatusText(group.status) }}
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
    <el-empty v-if="!loading && groupBuys.length === 0" description="暂无团购数据">
      <el-button type="primary" @click="handleCreateGroup">立即开团</el-button>
    </el-empty>

    <!-- 团购对话框 -->
    <GroupBuyDialog
      v-model:visible="dialogVisible"
      :activity="selectedActivity"
      :isCreating="isCreating"
      :current-group-buy="selectedGroupBuy"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, MoreFilled, Timer } from '@element-plus/icons-vue'
import { request } from '@/utils/request'
import GroupBuyDialog from './GroupBuyDialog.vue'

interface GroupBuy {
  id: number
  groupCode: string
  activityId: number
  activity?: any
  targetPeople: number
  currentPeople: number
  maxPeople: number
  groupPrice: number
  originalPrice: number
  deadline: string
  status: string
  shareCount: number
  viewCount: number
  groupLeader?: any
  canJoin?: boolean
}

// 响应式数据
const loading = ref(false)
const groupBuys = ref<GroupBuy[]>([])
const total = ref(0)
const dateRange = ref<any[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 20,
})

const filters = reactive({
  status: '',
})

const dialogVisible = ref(false)
const selectedActivity = ref<any>(null)
const selectedGroupBuy = ref<any>(null)
const isCreating = ref(true)

// 方法
const loadGroupBuys = async () => {
  try {
    loading.value = true

    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }

    if (filters.status) {
      params.status = filters.status
    }

    const response = await request.get('/api/marketing/group-buy', { params })

    if (response.success) {
      groupBuys.value = response.data.items
      total.value = response.data.total
    } else {
      throw new Error(response.message || '获取团购列表失败')
    }
  } catch (error: any) {
    console.error('加载团购列表失败:', error)
    ElMessage.error(error.message || '加载团购列表失败')
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  loadGroupBuys()
}

const handleFilterChange = () => {
  pagination.page = 1
  loadGroupBuys()
}

const handleDateChange = () => {
  // TODO: 实现日期范围筛选
  handleFilterChange()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadGroupBuys()
}

const handleSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadGroupBuys()
}

const handleCreateGroup = async () => {
  // TODO: 选择活动
  selectedActivity.value = {
    id: 1,
    title: '示例活动',
    price: 99,
    marketingConfig: {
      groupBuy: {
        enabled: true,
        minPeople: 2,
        maxPeople: 50,
        price: 79,
      }
    }
  }
  isCreating.value = true
  dialogVisible.value = true
}

const handleJoinGroup = (group: GroupBuy) => {
  selectedActivity.value = group.activity
  selectedGroupBuy.value = group
  isCreating.value = false
  dialogVisible.value = true
}

const handleDialogSuccess = (data: any) => {
  ElMessage.success('操作成功！')
  loadGroupBuys()
}

const handleCommand = async ({ action, group }: { action: string; group: GroupBuy }) => {
  switch (action) {
    case 'detail':
      // TODO: 跳转到团购详情页
      break
    case 'share':
      await handleShare(group)
      break
    case 'invite':
      await handleInvite(group)
      break
  }
}

const handleShare = async (group: GroupBuy) => {
  try {
    const response = await request.post(`/api/marketing/group-buy/${group.id}/share`, {
      shareChannel: 'link'
    })

    if (response.success) {
      const shareUrl = response.data.shareUrl
      await navigator.clipboard.writeText(shareUrl)
      ElMessage.success('分享链接已复制到剪贴板')
    }
  } catch (error: any) {
    ElMessage.error('分享失败')
  }
}

const handleInvite = async (group: GroupBuy) => {
  try {
    const inviteUrl = `${window.location.origin}/activity/group-buy/${group.id}`
    await navigator.clipboard.writeText(inviteUrl)
    ElMessage.success('邀请链接已复制到剪贴板')
  } catch (error: any) {
    ElMessage.error('生成邀请链接失败')
  }
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'in_progress': 'primary',
    'completed': 'success',
    'expired': 'warning',
    'failed': 'danger',
    'pending': 'info',
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'in_progress': '进行中',
    'completed': '已成团',
    'expired': '已过期',
    'failed': '已失败',
    'pending': '待开始',
  }
  return statusMap[status] || status
}

const getProgressPercentage = (group: GroupBuy) => {
  return Math.min((group.currentPeople / group.targetPeople) * 100, 100)
}

const getProgressColor = (group: GroupBuy) => {
  const percentage = getProgressPercentage(group)
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const formatRemainingTime = (deadline: string) => {
  const remaining = new Date(deadline).getTime() - Date.now()
  if (remaining <= 0) return '已过期'

  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 生命周期
onMounted(() => {
  loadGroupBuys()
})
</script>

<style scoped lang="scss">
.group-buy-list {
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

  .group-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: 20px;

    .group-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #e4e7ed;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      &.completed {
        border-color: #67c23a;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      }

      .card-header {
        padding: var(--spacing-md) 16px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .group-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);

          .group-code {
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

        .progress-section {
          margin-bottom: 16px;

          .people-progress {
            margin-bottom: 8px;

            .progress-header {
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);
              margin-bottom: 8px;

              .current {
                font-size: var(--text-xl);
                font-weight: 700;
                color: #409eff;
              }

              .separator {
                font-size: var(--text-sm);
                color: #909399;
              }

              .target {
                font-size: var(--text-sm);
                color: #909399;
              }

              .unit {
                font-size: var(--text-xs);
                color: #909399;
              }
            }
          }

          .time-info {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: var(--text-sm);
            color: #666;
          }
        }

        .price-info {
          margin-bottom: 16px;
          padding: var(--spacing-md);
          background: #f8f9fa;
          border-radius: 8px;

          .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              font-size: var(--text-sm);
              color: #606266;
            }

            .group-price {
              font-size: var(--text-lg);
              font-weight: 700;
              color: #409eff;
            }

            .original-price {
              font-size: var(--text-sm);
              color: #909399;
              text-decoration: line-through;
            }

            .discount {
              font-size: var(--text-xs);
              color: #67c23a;
              font-weight: 600;
            }
          }
        }

        .leader-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: 16px;
          padding: var(--spacing-md);
          background: white;
          border: 1px solid #e4e7ed;
          border-radius: 8px;

          .leader-details {
            display: flex;
            flex-direction: column;

            .name {
              font-size: var(--text-sm);
              font-weight: 600;
              color: #303133;
            }

            .role {
              font-size: var(--text-xs);
              color: #909399;
            }
          }
        }

        .stats-info {
          display: flex;
          justify-content: space-around;
          padding: var(--spacing-md);
          background: #f8f9fa;
          border-radius: 8px;

          .stat-item {
            text-align: center;

            .label {
              display: block;
              font-size: var(--text-xs);
              color: #909399;
              margin-bottom: 2px;
            }

            .value {
              font-size: var(--text-base);
              font-weight: 600;
              color: #409eff;
            }
          }
        }
      }

      .card-footer {
        padding: 0 16px 16px;
        text-align: center;

        .el-button {
          width: 100%;
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