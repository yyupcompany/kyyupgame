<template>
  <div class="team-ranking-tab">
    <!-- 排名类型选择 -->
    <div class="ranking-controls">
      <el-radio-group v-model="rankingType" @change="handleRankingTypeChange">
        <el-radio-button label="referrals">转介绍数量</el-radio-button>
        <el-radio-button label="rewards">奖励金额</el-radio-button>
        <el-radio-button label="conversion">转化率</el-radio-button>
        <el-radio-button label="comprehensive">综合得分</el-radio-button>
      </el-radio-group>

      <el-select
        v-model="timeFilter"
        placeholder="时间范围"
        @change="handleTimeFilterChange"
      >
        <el-option label="本月" value="current_month" />
        <el-option label="上月" value="last_month" />
        <el-option label="本季度" value="current_quarter" />
        <el-option label="本年" value="current_year" />
        <el-option label="全部时间" value="all_time" />
      </el-select>
    </div>

    <!-- 排名列表 -->
    <div class="ranking-content">
      <div class="ranking-list" v-loading="loading">
        <div
          v-for="(member, index) in rankingList"
          :key="member.id"
          class="ranking-item"
          :class="{ 'top-three': index < 3 }"
        >
          <div class="ranking-medal" v-if="index < 3">
            <img :src="getMedalIcon(index)" :alt="`${index + 1}等奖牌`" />
          </div>
          <div class="ranking-number" v-else>{{ index + 1 }}</div>

          <div class="member-avatar">
            <el-avatar :size="48" :src="member.avatar">
              {{ member.name.charAt(0) }}
            </el-avatar>
            <el-tag :type="getRoleTagType(member.role)" size="small">
              {{ getRoleLabel(member.role) }}
            </el-tag>
          </div>

          <div class="member-info">
            <div class="member-name">{{ member.name }}</div>
            <div class="member-stats">
              <span class="stat-item">
                成功转介绍: <strong>{{ member.successfulReferrals }}</strong> 人
              </span>
              <span class="stat-item">
                总奖励: <strong class="reward-amount">¥{{ member.totalRewards }}</strong>
              </span>
              <span class="stat-item">
                转化率: <strong>{{ member.conversionRate }}%</strong>
              </span>
            </div>
          </div>

          <div class="ranking-score">
            <div class="score-value">{{ getRankingValue(member) }}</div>
            <div class="score-label">{{ getRankingLabel() }}</div>
            <div class="trend-indicator" :class="member.trend">
              <el-icon>
                <component :is="getTrendIcon(member.trend)" />
              </el-icon>
              {{ member.trendValue || '0%' }}
            </div>
          </div>

          <div class="ranking-progress">
            <el-progress
              :percentage="calculateProgress(member, index)"
              :color="getProgressColor(index)"
              :show-text="false"
              :stroke-width="8"
            />
          </div>
        </div>

        <!-- 空状态 -->
        <EmptyState
          v-if="!loading && rankingList.length === 0"
          type="no-data"
          title="暂无排名数据"
          description="当前时间范围内没有排名数据，请尝试选择其他时间范围"
          size="medium"
          :primary-action="{
            text: '刷新数据',
            handler: loadRankingData
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { TrendCharts, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

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
const rankingType = ref('referrals')
const timeFilter = ref('current_month')
const rankingList = ref([])

// 加载排名数据
const loadRankingData = async () => {
  try {
    const params = {
      rankingType: rankingType.value,
      timeFilter: timeFilter.value,
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    }

    const response = await MarketingPerformanceService.getTeamRanking(params)
    rankingList.value = response.data
  } catch (error) {
    console.error('加载团队排名失败:', error)
    ElMessage.error('加载团队排名失败')
  }
}

// 处理排名类型变化
const handleRankingTypeChange = () => {
  loadRankingData()
}

// 处理时间筛选变化
const handleTimeFilterChange = () => {
  loadRankingData()
}

// 工具函数
const getRankingValue = (member: any) => {
  switch (rankingType.value) {
    case 'referrals':
      return `${member.successfulReferrals}人`
    case 'rewards':
      return `¥${member.totalRewards}`
    case 'conversion':
      return `${member.conversionRate}%`
    case 'comprehensive':
      return member.comprehensiveScore?.toFixed(1) || '0.0'
    default:
      return '0'
  }
}

const getRankingLabel = () => {
  const labelMap = {
    referrals: '转介绍数',
    rewards: '奖励金额',
    conversion: '转化率',
    comprehensive: '综合得分'
  }
  return labelMap[rankingType.value] || ''
}

const getMedalIcon = (index: number) => {
  const medals = [
    '/icons/medal-gold.png',
    '/icons/medal-silver.png',
    '/icons/medal-bronze.png'
  ]
  return medals[index] || ''
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

const getTrendIcon = (trend: string) => {
  const iconMap = {
    up: ArrowUp,
    down: ArrowDown,
    stable: TrendCharts
  }
  return iconMap[trend] || TrendCharts
}

const calculateProgress = (member: any, index: number) => {
  if (rankingList.value.length === 0) return 0

  let maxValue = 0
  let currentValue = 0

  switch (rankingType.value) {
    case 'referrals':
      maxValue = Math.max(...rankingList.value.map(m => m.successfulReferrals))
      currentValue = member.successfulReferrals
      break
    case 'rewards':
      maxValue = Math.max(...rankingList.value.map(m => m.totalRewards))
      currentValue = member.totalRewards
      break
    case 'conversion':
      maxValue = 100 // 转化率最大值为100%
      currentValue = member.conversionRate
      break
    case 'comprehensive':
      maxValue = 10 // 综合得分最大值为10
      currentValue = member.comprehensiveScore || 0
      break
  }

  return maxValue > 0 ? (currentValue / maxValue) * 100 : 0
}

const getProgressColor = (index: number) => {
  const colors = [
    '#FFD700', // 金色
    '#C0C0C0', // 银色
    '#CD7F32', // 铜色
    '#409EFF', // 蓝色
    '#67C23A', // 绿色
    '#E6A23C', // 橙色
    '#F56C6C'  // 红色
  ]
  return colors[index] || '#909399'
}

// 监听日期范围变化
watch(() => props.dateRange, () => {
  loadRankingData()
}, { deep: true })

// 组件挂载时加载数据
onMounted(() => {
  loadRankingData()
})
</script>

<style scoped lang="scss">
.team-ranking-tab {
  .ranking-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--text-2xl);
    padding: var(--text-xl);
    background: var(--bg-color);
    border-radius: var(--text-sm);
    border: 1px solid var(--border-light);

    .el-select {
      width: 150px;
    }
  }

  .ranking-content {
    .ranking-list {
      .ranking-item {
        display: flex;
        align-items: center;
        padding: var(--text-xl);
        margin-bottom: var(--spacing-lg);
        background: var(--bg-color);
        border-radius: var(--text-sm);
        border: 1px solid var(--border-light);
        transition: all var(--transition-base) ease;

        &:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        &.top-three {
          border-color: var(--primary-color);
          background: linear-gradient(135deg, var(--bg-color), rgba(var(--primary-rgb), 0.05));
        }

        .ranking-medal {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--spacing-lg);

          img {
            width: 32px;
            height: 32px;
          }
        }

        .ranking-number {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-gray);
          border-radius: 50%;
          margin-right: var(--spacing-lg);
        }

        .member-avatar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          margin-right: var(--text-xl);

          .el-tag {
            font-size: var(--text-xs);
          }
        }

        .member-info {
          flex: 1;

          .member-name {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: var(--spacing-sm);
          }

          .member-stats {
            display: flex;
            gap: var(--spacing-xl);
            font-size: var(--text-sm);
            color: var(--text-secondary);

            .stat-item {
              strong {
                color: var(--text-primary);

                &.reward-amount {
                  color: var(--success-color);
                }
              }
            }
          }
        }

        .ranking-score {
          text-align: center;
          margin-right: var(--text-xl);

          .score-value {
            font-size: var(--text-xl);
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: var(--spacing-xs);
          }

          .score-label {
            font-size: var(--text-xs);
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
          }

          .trend-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs);
            font-size: var(--text-xs);
            font-weight: 500;

            &.up {
              color: var(--success-color);
            }

            &.down {
              color: var(--danger-color);
            }

            &.stable {
              color: var(--text-secondary);
            }
          }
        }

        .ranking-progress {
          flex: 1;
          max-width: 200px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .team-ranking-tab {
    .ranking-controls {
      flex-direction: column;
      gap: var(--spacing-lg);

      .el-select {
        width: 100%;
      }
    }

    .ranking-content {
      .ranking-list {
        .ranking-item {
          flex-direction: column;
          align-items: stretch;
          gap: var(--spacing-lg);

          .member-avatar,
          .ranking-score {
            margin-right: 0;
          }

          .member-info {
            .member-stats {
              flex-direction: column;
              gap: var(--spacing-sm);
            }
          }

          .ranking-progress {
            max-width: 100%;
          }
        }
      }
    }
  }
}
</style>