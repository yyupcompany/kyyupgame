<template>
  <div class="team-ranking">
    <!-- 排行榜头部 -->
    <div class="ranking-header">
      <h3 class="ranking-title">团队排行榜</h3>
      <div class="period-selector">
        <van-button-group size="small">
          <van-button
            v-for="period in periods"
            :key="period.value"
            :type="selectedPeriod === period.value ? 'primary' : 'default'"
            @click="$emit('period-change', period.value)"
          >
            {{ period.label }}
          </van-button>
        </van-button-group>
      </div>
    </div>

    <!-- 排行榜列表 -->
    <div class="ranking-list">
      <div
        v-for="(member, index) in rankingData"
        :key="member.id"
        class="ranking-item"
        :class="{ 'current-user': member.isCurrentUser, 'top-three': index < 3 }"
        @click="$emit('member-click', member)"
      >
        <div class="rank-badge" :class="`rank-${index + 1}`">
          <span v-if="index < 3" class="rank-icon">{{ getRankIcon(index) }}</span>
          <span v-else class="rank-number">{{ index + 1 }}</span>
        </div>

        <van-image
          :src="member.avatar"
          width="44"
          height="44"
          round
          fit="cover"
          class="member-avatar"
        />

        <div class="member-info">
          <div class="member-name">{{ member.name }}</div>
          <div class="member-stats">
            <span class="referrals">推荐 {{ member.referrals }} 人</span>
            <span class="conversion">转化 {{ member.conversions }} 人</span>
          </div>
        </div>

        <div class="member-performance">
          <div class="rewards">¥{{ member.rewards }}</div>
          <div class="trend">
            <van-icon
              :name="getTrendIcon(member.trend)"
              :color="getTrendColor(member.trend)"
              size="12"
            />
            <span class="trend-value">{{ member.trendValue }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="ranking-actions">
      <van-button
        type="primary"
        size="small"
        plain
        block
        @click="$emit('view-full-ranking')"
      >
        查看完整排行
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface TeamMember {
  id: string | number
  name: string
  avatar: string
  referrals: number
  conversions: number
  rewards: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  isCurrentUser?: boolean
}

interface Props {
  rankingData?: TeamMember[]
  selectedPeriod?: string
}

const props = withDefaults(defineProps<Props>(), {
  rankingData: () => [],
  selectedPeriod: 'month'
})

const emit = defineEmits<{
  'period-change': [period: string]
  'member-click': [member: TeamMember]
  'view-full-ranking': []
}>()

const periods = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' }
]

const getRankIcon = (index: number): string => {
  const icons = ['🥇', '🥈', '🥉']
  return icons[index] || ''
}

const getTrendIcon = (trend: string): string => {
  const iconMap = {
    'up': 'arrow-up',
    'down': 'arrow-down',
    'stable': 'minus'
  }
  return iconMap[trend] || 'minus'
}

const getTrendColor = (trend: string): string => {
  const colorMap = {
    'up': '#67C23A',
    'down': '#F56C6C',
    'stable': '#E6A23C'
  }
  return colorMap[trend] || '#909399'
}
</script>

<style lang="scss" scoped>
.team-ranking {
  padding: var(--van-padding-sm);

  .ranking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--van-padding-md);

    .ranking-title {
      margin: 0;
      font-size: var(--van-font-size-lg);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
    }
  }

  .ranking-list {
    margin-bottom: var(--van-padding-md);

    .ranking-item {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      padding: var(--van-padding-md);
      background: white;
      border-radius: var(--van-border-radius-lg);
      margin-bottom: var(--van-padding-sm);
      transition: all 0.3s ease;

      &:last-child {
        margin-bottom: 0;
      }

      &.top-three {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      }

      &.current-user {
        background: linear-gradient(90deg, #f0f9ff 0%, #ffffff 100%);
        border: 1px solid var(--van-primary-color);
      }

      &:active {
        transform: scale(0.98);
      }

      .rank-badge {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: var(--van-font-weight-bold);
        color: white;

        &.rank-1 {
          background: linear-gradient(135deg, #FFD700, #FFA500);
        }

        &.rank-2 {
          background: linear-gradient(135deg, #C0C0C0, #808080);
        }

        &.rank-3 {
          background: linear-gradient(135deg, #CD7F32, #8B4513);
        }

        &:not(.rank-1):not(.rank-2):not(.rank-3) {
          background: var(--van-gray-6);
          width: 28px;
          height: 28px;
          font-size: var(--van-font-size-xs);
        }

        .rank-icon {
          font-size: var(--text-lg);
        }

        .rank-number {
          font-size: var(--text-xs);
        }
      }

      .member-avatar {
        border: 2px solid var(--van-border-color);
      }

      .member-info {
        flex: 1;

        .member-name {
          font-size: var(--van-font-size-md);
          font-weight: var(--van-font-weight-bold);
          color: var(--van-text-color);
          margin-bottom: 4px;
        }

        .member-stats {
          display: flex;
          gap: var(--van-padding-md);

          .referrals,
          .conversion {
            font-size: var(--van-font-size-xs);
            color: var(--van-text-color-2);
          }
        }
      }

      .member-performance {
        text-align: right;

        .rewards {
          font-size: var(--van-font-size-lg);
          font-weight: var(--van-font-weight-bold);
          color: var(--van-warning-color);
          margin-bottom: 4px;
        }

        .trend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 2px;

          .trend-value {
            font-size: var(--van-font-size-xs);
            font-weight: var(--van-font-weight-bold);
          }
        }
      }
    }
  }

  .ranking-actions {
    padding: var(--van-padding-md) 0;
  }
}
</style>