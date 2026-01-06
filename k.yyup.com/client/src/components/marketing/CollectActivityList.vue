<template>
  <div class="collect-activity-list">
    <!-- 头部操作 -->
    <div class="list-header">
      <div class="header-left">
        <h3>积攒活动列表</h3>
        <span class="subtitle">共 {{ total }} 个积攒活动</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreateCollect">
          <el-icon><Plus /></el-icon>
          创建积攒
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
        <el-form-item label="活动状态">
          <el-select
            v-model="filters.status"
            placeholder="全部状态"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="进行中" value="active" />
            <el-option label="已完成" value="completed" />
            <el-option label="已过期" value="expired" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖励类型">
          <el-select
            v-model="filters.rewardType"
            placeholder="全部类型"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="折扣优惠" value="discount" />
            <el-option label="赠送礼品" value="gift" />
            <el-option label="免费参与" value="free" />
            <el-option label="积分奖励" value="points" />
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

    <!-- 积攒活动列表 -->
    <div class="collect-cards" v-loading="loading">
      <div
        v-for="collect in collects"
        :key="collect.id"
        class="collect-card"
        :class="{ 'completed': collect.status === 'completed' }"
      >
        <div class="card-header">
          <div class="collect-info">
            <span class="collect-code">{{ collect.collectCode }}</span>
            <el-tag :type="getStatusType(collect.status)" size="small">
              {{ getStatusText(collect.status) }}
            </el-tag>
            <el-tag :type="getRewardTypeTag(collect.rewardType)" size="small">
              {{ getRewardTypeText(collect.rewardType) }}
            </el-tag>
          </div>
          <div class="card-actions">
            <el-dropdown @command="handleCommand">
              <el-button text>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ action: 'detail', collect }">
                    查看详情
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'manage', collect }">
                    管理积攒
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'share', collect }">
                    分享活动
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="collect.status === 'active'"
                    :command="{ action: 'help', collect }"
                  >
                    我要助力
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="card-body">
          <div class="activity-info">
            <h4>{{ collect.activity?.title }}</h4>
            <p class="activity-desc">{{ collect.activity?.description }}</p>
          </div>

          <div class="progress-section">
            <div class="progress-container">
              <div class="progress-info">
                <span class="current">{{ collect.currentCount }}</span>
                <span class="separator">/</span>
                <span class="target">{{ collect.targetCount }}</span>
                <span class="unit">人</span>
              </div>
              <el-progress
                :percentage="getProgressPercentage(collect)"
                :color="getProgressColor(collect)"
                :show-text="false"
                :stroke-width="8"
              />
              <div class="progress-text">{{ getProgressPercentage(collect).toFixed(1) }}%</div>
            </div>

            <div class="deadline-info" v-if="collect.status === 'active' && collect.deadline">
              <el-icon><Timer /></el-icon>
              <span>截止：{{ formatDeadline(collect.deadline) }}</span>
            </div>
          </div>

          <div class="reward-info">
            <div class="reward-header">
              <el-icon><Gift /></el-icon>
              <span class="reward-title">积攒奖励</span>
            </div>
            <div class="reward-content">
              <span class="reward-value">{{ collect.rewardValue }}</span>
              <span class="reward-desc">{{ collect.rewardDescription }}</span>
            </div>
          </div>

          <div class="helper-info">
            <div class="helper-stats">
              <div class="stat-item">
                <span class="label">助力人数</span>
                <span class="value">{{ collect.helperCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">浏览次数</span>
                <span class="value">{{ collect.viewCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">分享次数</span>
                <span class="value">{{ collect.shareCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <el-button
            v-if="collect.status === 'active' && !collect.hasHelped"
            type="primary"
            size="small"
            @click="handleHelp(collect)"
          >
            立即助力
          </el-button>
          <el-button
            v-else-if="collect.status === 'completed'"
            type="success"
            size="small"
            disabled
          >
            已完成
          </el-button>
          <el-button
            v-else-if="collect.hasHelped"
            type="info"
            size="small"
            disabled
          >
            已助力
          </el-button>
          <el-button
            v-else
            size="small"
            disabled
          >
            {{ getStatusText(collect.status) }}
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
    <el-empty v-if="!loading && collects.length === 0" description="暂无积攒活动数据">
      <el-button type="primary" @click="handleCreateCollect">创建积攒活动</el-button>
    </el-empty>

    <!-- 积攒活动对话框 -->
    <CollectActivityDialog
      v-model:visible="dialogVisible"
      :activity="selectedActivity"
      :collect-activity="selectedCollect"
      :is-owner="isOwner"
      :has-helped="hasHelped"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, MoreFilled, Timer, Gift } from '@element-plus/icons-vue'
import { request } from '@/utils/request'
import CollectActivityDialog from './CollectActivityDialog.vue'

interface CollectActivity {
  id: number
  activityId: number
  collectCode: string
  activity?: any
  targetCount: number
  currentCount: number
  rewardType: string
  rewardValue: string
  rewardDescription: string
  deadline?: string
  status: string
  helperCount: number
  viewCount: number
  shareCount: number
  hasHelped?: boolean
}

// 响应式数据
const loading = ref(false)
const collects = ref<CollectActivity[]>([])
const total = ref(0)
const dateRange = ref<any[]>([])

const pagination = reactive({
  page: 1,
  pageSize: 20,
})

const filters = reactive({
  status: '',
  rewardType: '',
})

const dialogVisible = ref(false)
const selectedActivity = ref<any>(null)
const selectedCollect = ref<any>(null)
const isOwner = ref(false)
const hasHelped = ref(false)

// 暴露方法给父组件
defineExpose({
  refreshList,
})

// 方法
const loadCollects = async () => {
  try {
    loading.value = true

    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }

    if (filters.status) {
      params.status = filters.status
    }
    if (filters.rewardType) {
      params.rewardType = filters.rewardType
    }

    const response = await request.get('/api/marketing/collect-activities', { params })

    if (response.success) {
      collects.value = response.data.items
      total.value = response.data.total
    } else {
      throw new Error(response.message || '获取积攒活动列表失败')
    }
  } catch (error: any) {
    console.error('加载积攒活动列表失败:', error)
    ElMessage.error(error.message || '加载积攒活动列表失败')
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  loadCollects()
}

const handleFilterChange = () => {
  pagination.page = 1
  loadCollects()
}

const handleDateChange = () => {
  // TODO: 实现日期范围筛选
  handleFilterChange()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadCollects()
}

const handleSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadCollects()
}

const handleCreateCollect = async () => {
  // TODO: 选择活动创建积攒
  selectedActivity.value = {
    id: 1,
    title: '示例活动',
    price: 99,
    marketingConfig: {
      collect: {
        enabled: true,
        target: 50,
        rewardType: 'discount',
        discountPercent: 80,
      }
    }
  }
  selectedCollect.value = null
  isOwner.value = true
  hasHelped.value = false
  dialogVisible.value = true
}

const handleHelp = (collect: CollectActivity) => {
  selectedActivity.value = collect.activity
  selectedCollect.value = collect
  isOwner.value = false
  hasHelped.value = false
  dialogVisible.value = true
}

const handleDialogSuccess = (data: any) => {
  ElMessage.success('操作成功！')
  loadCollects()
}

const handleCommand = async ({ action, collect }: { action: string; collect: CollectActivity }) => {
  switch (action) {
    case 'detail':
      await handleViewDetail(collect)
      break
    case 'manage':
      await handleManage(collect)
      break
    case 'share':
      await handleShare(collect)
      break
    case 'help':
      handleHelp(collect)
      break
  }
}

const handleViewDetail = async (collect: CollectActivity) => {
  // 发射事件给父组件
  emit('activity-select', collect, 'collect')
}

const handleManage = (collect: CollectActivity) => {
  selectedActivity.value = collect.activity
  selectedCollect.value = collect
  isOwner.value = true
  hasHelped.value = collect.hasHelped || false
  dialogVisible.value = true
}

const handleShare = async (collect: CollectActivity) => {
  try {
    const response = await request.post(`/api/marketing/collect-activities/${collect.id}/share`, {
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

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': 'success',
    'completed': 'primary',
    'expired': 'warning',
    'cancelled': 'danger',
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'active': '进行中',
    'completed': '已完成',
    'expired': '已过期',
    'cancelled': '已取消',
  }
  return statusMap[status] || status
}

const getRewardTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    'discount': 'warning',
    'gift': 'success',
    'free': 'primary',
    'points': 'info',
  }
  return typeMap[type] || 'info'
}

const getRewardTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    'discount': '折扣优惠',
    'gift': '赠送礼品',
    'free': '免费参与',
    'points': '积分奖励',
  }
  return typeMap[type] || type
}

const getProgressPercentage = (collect: CollectActivity) => {
  return Math.min((collect.currentCount / collect.targetCount) * 100, 100)
}

const getProgressColor = (collect: CollectActivity) => {
  const percentage = getProgressPercentage(collect)
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const formatDeadline = (deadline: string) => {
  return new Date(deadline).toLocaleString('zh-CN')
}

// 定义emit
const emit = defineEmits<{
  'activity-select': [activity: any, type: string]
  'refresh': []
}>()

// 生命周期
onMounted(() => {
  loadCollects()
})
</script>

<style scoped lang="scss">
.collect-activity-list {
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

  .collect-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: 20px;

    .collect-card {
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

        .collect-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          flex-wrap: wrap;

          .collect-code {
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

          .progress-container {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            margin-bottom: 8px;

            .progress-info {
              display: flex;
              align-items: center;
              gap: var(--spacing-xs);
              min-width: 80px;

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

            .progress-bar {
              flex: 1;
              max-width: 120px;
            }

            .progress-text {
              font-size: var(--text-sm);
              font-weight: 600;
              color: #409eff;
              min-width: 40px;
            }
          }

          .deadline-info {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: var(--text-sm);
            color: #666;
          }
        }

        .reward-info {
          margin-bottom: 16px;
          padding: var(--spacing-md);
          background: linear-gradient(135deg, #fff7e6 0%, #fff1d6 100%);
          border-radius: 8px;

          .reward-header {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 8px;

            .reward-title {
              font-weight: 600;
              color: #e6a23c;
            }
          }

          .reward-content {
            .reward-value {
              font-weight: 700;
              color: #e6a23c;
              margin-right: 8px;
            }

            .reward-desc {
              font-size: var(--text-sm);
              color: #666;
            }
          }
        }

        .helper-info {
          .helper-stats {
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