<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="800px"
    :before-close="handleClose"
  >
    <div v-if="activity" class="activity-detail">
      <!-- 基本信息标签页 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <div class="basic-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="活动名称">
                {{ activity.title }}
              </el-descriptions-item>
              <el-descriptions-item label="活动类型">
                <el-tag :type="getTypeTag(type)">{{ getTypeText(type) }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="活动状态">
                <el-tag :type="getStatusTag(activity.status)">
                  {{ getStatusText(activity.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatTime(activity.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="活动描述" :span="2">
                {{ activity.description }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- 活动统计数据 -->
            <div class="stats-section" v-if="statistics">
              <h4>活动统计</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ statistics.totalParticipants }}</div>
                  <div class="stat-label">总参与人数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ statistics.conversions }}</div>
                  <div class="stat-label">转化数</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ statistics.conversionRate }}%</div>
                  <div class="stat-label">转化率</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">¥{{ statistics.revenue.toLocaleString() }}</div>
                  <div class="stat-label">活动收入</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 团购详情 -->
        <el-tab-pane label="团购详情" name="groupBuy" v-if="type === 'groupBuy' && groupBuyDetail">
          <div class="group-buy-detail">
            <div class="progress-section">
              <div class="progress-info">
                <div class="progress-stats">
                  <span class="current">{{ groupBuyDetail.currentPeople }}</span>
                  <span class="separator">/</span>
                  <span class="target">{{ groupBuyDetail.targetPeople }}</span>
                  <span class="unit">人</span>
                </div>
                <el-progress
                  :percentage="getProgressPercentage(groupBuyDetail)"
                  :color="getProgressColor(groupBuyDetail)"
                  :show-text="false"
                  :stroke-width="12"
                />
                <div class="progress-text">{{ getProgressPercentage(groupBuyDetail).toFixed(1) }}%</div>
              </div>
            </div>

            <el-descriptions :column="2" border>
              <el-descriptions-item label="团购码">
                <el-tag type="primary">{{ groupBuyDetail.groupCode }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="团购价格">
                <span class="price">¥{{ groupBuyDetail.groupPrice }}</span>
                <span class="original-price">¥{{ groupBuyDetail.originalPrice }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="截止时间">
                {{ formatTime(groupBuyDetail.deadline) }}
              </el-descriptions-item>
              <el-descriptions-item label="团长">
                <div class="user-info">
                  <el-avatar :size="24" :src="groupBuyDetail.groupLeader?.avatar">
                    {{ groupBuyDetail.groupLeader?.name?.charAt(0) }}
                  </el-avatar>
                  <span>{{ groupBuyDetail.groupLeader?.name }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="浏览次数" :span="2">
                {{ groupBuyDetail.viewCount }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- 参团成员列表 -->
            <div class="members-section">
              <h4>参团成员</h4>
              <el-table :data="groupBuyDetail.members" max-height="300">
                <el-table-column label="成员" width="200">
                  <template #default="{ row }">
                    <div class="user-info">
                      <el-avatar :size="32" :src="row.avatar">
                        {{ row.name?.charAt(0) }}
                      </el-avatar>
                      <div class="user-details">
                        <div class="name">{{ row.name }}</div>
                        <div class="phone">{{ row.phone }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="joinTime" label="参团时间" width="180">
                  <template #default="{ row }">
                    {{ formatTime(row.joinTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'confirmed' ? 'success' : 'warning'" size="small">
                      {{ row.status === 'confirmed' ? '已确认' : '待确认' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="paymentStatus" label="支付状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.paymentStatus === 'paid' ? 'success' : 'danger'" size="small">
                      {{ row.paymentStatus === 'paid' ? '已支付' : '未支付' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 积攒详情 -->
        <el-tab-pane label="积攒详情" name="collect" v-if="type === 'collect' && collectDetail">
          <div class="collect-detail">
            <div class="progress-section">
              <div class="progress-info">
                <div class="progress-stats">
                  <span class="current">{{ collectDetail.currentCount }}</span>
                  <span class="separator">/</span>
                  <span class="target">{{ collectDetail.targetCount }}</span>
                  <span class="unit">人</span>
                </div>
                <el-progress
                  :percentage="getCollectProgress(collectDetail)"
                  :color="getProgressColor(collectDetail)"
                  :show-text="false"
                  :stroke-width="12"
                />
                <div class="progress-text">{{ getCollectProgress(collectDetail).toFixed(1) }}%</div>
              </div>
            </div>

            <el-descriptions :column="2" border>
              <el-descriptions-item label="积攒码">
                <el-tag type="primary">{{ collectDetail.collectCode }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="奖励类型">
                <el-tag :type="getRewardTypeTag(collectDetail.rewardType)">
                  {{ getRewardTypeText(collectDetail.rewardType) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="奖励内容">
                {{ collectDetail.rewardValue }}
              </el-descriptions-item>
              <el-descriptions-item label="截止时间">
                {{ collectDetail.deadline ? formatTime(collectDetail.deadline) : '无限制' }}
              </el-descriptions-item>
            </el-descriptions>

            <!-- 助力记录 -->
            <div class="helpers-section">
              <h4>助力记录</h4>
              <el-table :data="collectDetail.helpers" max-height="300">
                <el-table-column label="助力者" width="200">
                  <template #default="{ row }">
                    <div class="user-info">
                      <el-avatar :size="32" :src="row.avatar">
                        {{ row.name?.charAt(0) }}
                      </el-avatar>
                      <div class="user-details">
                        <div class="name">{{ row.name }}</div>
                        <div class="phone">{{ row.phone }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="helpTime" label="助力时间" width="180">
                  <template #default="{ row }">
                    {{ formatTime(row.helpTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="ip" label="IP地址" width="120" />
                <el-table-column label="操作" width="100">
                  <template #default="{ row }">
                    <el-button size="small" @click="viewHelperDetail(row)">
                      详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 操作日志 -->
        <el-tab-pane label="操作日志" name="logs">
          <div class="logs-section">
            <el-timeline>
              <el-timeline-item
                v-for="log in operationLogs"
                :key="log.id"
                :timestamp="formatTime(log.createdAt)"
                :type="getLogType(log.type)"
              >
                <div class="log-content">
                  <div class="log-user">{{ log.user?.name }}</div>
                  <div class="log-action">{{ log.action }}</div>
                  <div class="log-detail" v-if="log.detail">{{ log.detail }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleExport" v-if="type !== 'logs'">
          导出数据
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { request } from '@/utils/request'
import { GROUP_BUY_ENDPOINTS, COLLECT_ACTIVITY_ENDPOINTS } from '@/api/endpoints/marketing'
import { ACTIVITY_STATISTICS_ENDPOINTS } from '@/api/endpoints/activity'

interface Props {
  modelValue: boolean
  activity?: any
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'basic'
})

const emit = defineEmits(['update:modelValue'])

// 响应式数据
const visible = ref(false)
const activeTab = ref('basic')
const statistics = ref<any>(null)
const groupBuyDetail = ref<any>(null)
const collectDetail = ref<any>(null)
const operationLogs = ref<any[]>([])

// 计算属性
const dialogTitle = computed(() => {
  if (!props.activity) return '活动详情'
  const typeMap: Record<string, string> = {
    'groupBuy': '团购活动详情',
    'collect': '积攒活动详情',
    'referral': '推荐奖励详情',
    'tiered': '阶梯奖励详情',
    'coupon': '优惠券详情'
  }
  return typeMap[props.type] || '活动详情'
})

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.activity) {
    loadActivityData()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const loadActivityData = async () => {
  if (!props.activity) return

  try {
    // 加载统计数据
    await loadStatistics()

    // 根据类型加载详细信息
    switch (props.type) {
      case 'groupBuy':
        await loadGroupBuyDetail()
        break
      case 'collect':
        await loadCollectDetail()
        break
    }

    // 加载操作日志
    await loadOperationLogs()
  } catch (error) {
    console.error('加载活动数据失败:', error)
  }
}

const loadStatistics = async () => {
  try {
    const response = await request.get(ACTIVITY_STATISTICS_ENDPOINTS.BY_ID(props.activity.id))
    if (response.success) {
      statistics.value = response.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const loadGroupBuyDetail = async () => {
  try {
    const response = await request.get(GROUP_BUY_ENDPOINTS.DETAIL(props.activity.id))
    if (response.success) {
      groupBuyDetail.value = response.data
    }
  } catch (error) {
    console.error('加载团购详情失败:', error)
  }
}

const loadCollectDetail = async () => {
  try {
    const response = await request.get(COLLECT_ACTIVITY_ENDPOINTS.DETAIL(props.activity.id))
    if (response.success) {
      collectDetail.value = response.data
    }
  } catch (error) {
    console.error('加载积攒详情失败:', error)
  }
}

const loadOperationLogs = async () => {
  try {
    const response = await request.get(ACTIVITY_STATISTICS_ENDPOINTS.LOGS(props.activity.id))
    if (response.success) {
      operationLogs.value = response.data
    }
  } catch (error) {
    console.error('加载操作日志失败:', error)
  }
}

const handleClose = () => {
  visible.value = false
  // 重置数据
  activeTab.value = 'basic'
  statistics.value = null
  groupBuyDetail.value = null
  collectDetail.value = null
  operationLogs.value = []
}

const handleExport = () => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中...')
}

const viewHelperDetail = (helper: any) => {
  // TODO: 查看助力者详情
  ElMessage.info('助力者详情功能开发中...')
}

const getTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    'groupBuy': 'primary',
    'collect': 'success',
    'referral': 'warning',
    'tiered': 'info',
    'coupon': 'danger'
  }
  return tagMap[type] || 'info'
}

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'groupBuy': '团购活动',
    'collect': '积攒活动',
    'referral': '推荐奖励',
    'tiered': '阶梯奖励',
    'coupon': '优惠券'
  }
  return textMap[type] || type
}

const getStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    'active': 'success',
    'completed': 'primary',
    'expired': 'warning',
    'cancelled': 'danger'
  }
  return tagMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'active': '进行中',
    'completed': '已完成',
    'expired': '已过期',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

const getRewardTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    'discount': 'warning',
    'gift': 'success',
    'free': 'primary',
    'points': 'info'
  }
  return tagMap[type] || 'info'
}

const getRewardTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'discount': '折扣优惠',
    'gift': '赠送礼品',
    'free': '免费参与',
    'points': '积分奖励'
  }
  return textMap[type] || type
}

const getProgressPercentage = (item: any) => {
  return Math.min((item.currentPeople / item.targetPeople) * 100, 100)
}

const getCollectProgress = (item: any) => {
  return Math.min((item.currentCount / item.targetCount) * 100, 100)
}

const getProgressColor = (item: any) => {
  const percentage = props.type === 'groupBuy' ? getProgressPercentage(item) : getCollectProgress(item)
  if (percentage >= 100) return '#67c23a'
  if (percentage >= 50) return '#e6a23c'
  return '#f56c6c'
}

const getLogType = (type: string) => {
  const typeMap: Record<string, string> = {
    'create': 'primary',
    'update': 'warning',
    'delete': 'danger',
    'join': 'success',
    'complete': 'success'
  }
  return typeMap[type] || 'info'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.activity-detail {
  .basic-info {
    .stats-section {
      margin-top: 24px;

      h4 {
        margin-bottom: 16px;
        color: #303133;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-md);

        .stat-item {
          text-align: center;
          padding: var(--spacing-md);
          background: #f8f9fa;
          border-radius: 8px;

          .stat-value {
            font-size: var(--text-2xl);
            font-weight: 700;
            color: #409eff;
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: var(--text-sm);
            color: #909399;
          }
        }
      }
    }
  }

  .group-buy-detail,
  .collect-detail {
    .progress-section {
      margin-bottom: 24px;

      .progress-info {
        .progress-stats {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-bottom: 12px;
          font-size: var(--text-2xl);
          font-weight: 700;

          .current {
            color: #409eff;
          }

          .separator,
          .unit {
            color: #909399;
            font-size: var(--text-base);
          }
        }

        .progress-text {
          text-align: center;
          margin-top: 8px;
          font-weight: 600;
          color: #409eff;
        }
      }
    }

    .members-section,
    .helpers-section {
      margin-top: 24px;

      h4 {
        margin-bottom: 16px;
        color: #303133;
      }
    }
  }

  .logs-section {
    max-height: 400px;
    overflow-y: auto;

    .log-content {
      .log-user {
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .log-action {
        color: #606266;
        margin-bottom: 4px;
      }

      .log-detail {
        color: #909399;
        font-size: var(--text-sm);
      }
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
      }

      .phone {
        font-size: var(--text-xs);
        color: #909399;
      }
    }
  }

  .price {
    font-weight: 700;
    color: #67c23a;
    margin-right: 8px;
  }

  .original-price {
    color: #909399;
    text-decoration: line-through;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
</style>