<template>
  <div class="progress-summary">
    <!-- 总览卡片 -->
    <div class="summary-overview">
      <van-card
        :thumb="childAvatar"
        :title="childName"
        :desc="childInfo"
      >
        <template #tags>
          <van-tag
            v-for="tag in summaryTags"
            :key="tag.text"
            :type="tag.type"
            size="medium"
          >
            {{ tag.text }}
          </van-tag>
        </template>

        <template #footer>
          <div class="overview-stats">
            <div class="stat-item">
              <div class="stat-number">{{ overallProgress }}%</div>
              <div class="stat-label">总体进度</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">{{ achievementsCount }}</div>
              <div class="stat-label">获得成就</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">{{ lastUpdateDays }}</div>
              <div class="stat-label">更新天数</div>
            </div>
          </div>
        </template>
      </van-card>
    </div>

    <!-- 能力维度 -->
    <div class="ability-dimensions">
      <h3 class="section-title">能力维度</h3>
      <div class="dimensions-grid">
        <div
          v-for="dimension in dimensions"
          :key="dimension.name"
          class="dimension-item"
          @click="$emit('dimension-click', dimension)"
        >
          <div class="dimension-header">
            <van-icon
              :name="dimension.icon"
              :color="dimension.color"
              size="20"
            />
            <span class="dimension-name">{{ dimension.name }}</span>
            <van-tag
              :type="getLevelType(dimension.level)"
              size="small"
            >
              {{ dimension.level }}
            </van-tag>
          </div>
          <div class="dimension-progress">
            <van-progress
              :percentage="dimension.progress"
              :color="dimension.color"
              :show-pivot="true"
              pivot-text=""
            />
            <span class="progress-text">{{ dimension.progress }}%</span>
          </div>
          <div class="dimension-desc">{{ dimension.description }}</div>
        </div>
      </div>
    </div>

    <!-- 成就展示 -->
    <div class="achievements-section">
      <div class="section-header">
        <h3 class="section-title">最近成就</h3>
        <van-button
          type="primary"
          size="small"
          plain
          @click="$emit('view-all-achievements')"
        >
          查看全部
        </van-button>
      </div>
      <div class="achievements-grid">
        <div
          v-for="achievement in recentAchievements"
          :key="achievement.id"
          class="achievement-item"
          @click="$emit('achievement-click', achievement)"
        >
          <div class="achievement-icon">
            <van-image
              :src="achievement.icon"
              width="48"
              height="48"
              fit="cover"
              round
            />
            <van-badge
              v-if="achievement.isNew"
              dot
              color="#ff6b6b"
            />
          </div>
          <div class="achievement-info">
            <h4 class="achievement-name">{{ achievement.name }}</h4>
            <p class="achievement-desc">{{ achievement.description }}</p>
            <div class="achievement-time">{{ formatTime(achievement.earnedAt) }}</div>
          </div>
          <van-icon name="arrow" size="14" color="#c8c9cc" />
        </div>
      </div>
    </div>

    <!-- 成长轨迹 -->
    <div class="growth-timeline">
      <div class="section-header">
        <h3 class="section-title">成长轨迹</h3>
        <van-button
          type="primary"
          size="small"
          plain
          @click="$emit('view-timeline')"
        >
          查看详情
        </van-button>
      </div>
      <div class="timeline-list">
        <van-steps direction="vertical" :active="timelineItems.length">
          <van-step
            v-for="(item, index) in timelineItems"
            :key="item.id"
            :title="item.title"
            :description="item.description"
          >
            <template #icon>
              <div class="timeline-icon" :style="{ backgroundColor: item.color }">
                <van-icon :name="item.icon" size="14" color="white" />
              </div>
            </template>
            <div class="timeline-content">
              <div class="timeline-time">{{ formatTime(item.timestamp) }}</div>
              <div class="timeline-score" v-if="item.score">
                得分: <span class="score-value">{{ item.score }}</span>
              </div>
            </div>
          </van-step>
        </van-steps>
      </div>
    </div>

    <!-- 改进建议 -->
    <div class="suggestions-section" v-if="suggestions.length > 0">
      <div class="section-header">
        <h3 class="section-title">改进建议</h3>
        <van-button
          type="primary"
          size="small"
          plain
          @click="$emit('view-suggestions')"
        >
          更多建议
        </van-button>
      </div>
      <div class="suggestions-list">
        <van-notice-bar
          v-for="(suggestion, index) in suggestions"
          :key="index"
          :text="suggestion.content"
          mode="closeable"
          color="#1989fa"
          background="#ecf9ff"
          @close="$emit('dismiss-suggestion', index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Dimension {
  name: string
  icon: string
  color: string
  level: string
  progress: number
  description: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string | Date
  isNew?: boolean
}

interface TimelineItem {
  id: string
  title: string
  description: string
  icon: string
  color: string
  timestamp: string | Date
  score?: number
}

interface Suggestion {
  content: string
  type: string
  priority: number
}

interface Props {
  childName?: string
  childAvatar?: string
  childInfo?: string
  overallProgress?: number
  achievementsCount?: number
  lastUpdateDays?: number
  dimensions?: Dimension[]
  recentAchievements?: Achievement[]
  timelineItems?: TimelineItem[]
  suggestions?: Suggestion[]
}

const props = withDefaults(defineProps<Props>(), {
  childName: '宝宝',
  childAvatar: '/images/default-child-avatar.png',
  childInfo: '3岁 | 中班',
  overallProgress: 75,
  achievementsCount: 12,
  lastUpdateDays: 7,
  dimensions: () => [
    {
      name: '语言表达',
      icon: 'chat-o',
      color: '#409EFF',
      level: '良好',
      progress: 80,
      description: '词汇丰富，表达清晰'
    },
    {
      name: '逻辑思维',
      icon: 'chart-trending-o',
      color: '#67C23A',
      level: '优秀',
      progress: 90,
      description: '逻辑推理能力强'
    },
    {
      name: '动手能力',
      icon: 'hand-point',
      color: '#E6A23C',
      level: '发展中',
      progress: 60,
      description: '精细动作继续提升'
    },
    {
      name: '社交情感',
      icon: 'smile-o',
      color: '#F56C6C',
      level: '良好',
      progress: 75,
      description: '善于合作，情感丰富'
    }
  ],
  recentAchievements: () => [],
  timelineItems: () => [],
  suggestions: () => []
})

const emit = defineEmits<{
  'dimension-click': [dimension: Dimension]
  'achievement-click': [achievement: Achievement]
  'view-all-achievements': []
  'view-timeline': []
  'view-suggestions': []
  'dismiss-suggestion': [index: number]
}>()

// 计算属性
const summaryTags = computed(() => {
  const tags = []
  if (props.overallProgress >= 80) {
    tags.push({ text: '表现优秀', type: 'success' })
  } else if (props.overallProgress >= 60) {
    tags.push({ text: '进步明显', type: 'primary' })
  } else {
    tags.push({ text: '继续努力', type: 'warning' })
  }
  return tags
})

// 方法
const getLevelType = (level: string): string => {
  const typeMap: Record<string, string> = {
    '优秀': 'success',
    '良好': 'primary',
    '发展中': 'warning',
    '需加强': 'danger'
  }
  return typeMap[level] || 'default'
}

const formatTime = (time: string | Date): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 24 * 60 * 60 * 1000) {
    return '今天'
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
  }
}
</script>

<style lang="scss" scoped>
.progress-summary {
  padding: var(--van-padding-sm);

  .summary-overview {
    margin-bottom: var(--van-padding-md);

    .van-card {
      border-radius: var(--van-border-radius-lg);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .overview-stats {
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: var(--van-padding-sm) 0;

        .stat-item {
          text-align: center;

          .stat-number {
            font-size: var(--van-font-size-lg);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-primary-color);
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: var(--van-font-size-xs);
            color: var(--van-text-color-2);
          }
        }

        .stat-divider {
          width: 1px;
          height: 30px;
          background: var(--van-border-color);
        }
      }
    }
  }

  .ability-dimensions {
    margin-bottom: var(--van-padding-md);

    .dimensions-grid {
      display: grid;
      gap: var(--van-padding-sm);

      .dimension-item {
        background: var(--van-background-color-light);
        border-radius: var(--van-border-radius-lg);
        padding: var(--van-padding-md);
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .dimension-header {
          display: flex;
          align-items: center;
          margin-bottom: var(--van-padding-sm);

          .dimension-name {
            flex: 1;
            font-size: var(--van-font-size-md);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-text-color);
            margin-left: var(--van-padding-xs);
          }
        }

        .dimension-progress {
          display: flex;
          align-items: center;
          margin-bottom: var(--van-padding-xs);

          .van-progress {
            flex: 1;
            margin-right: var(--van-padding-xs);
          }

          .progress-text {
            font-size: var(--van-font-size-sm);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-text-color);
            min-width: 40px;
            text-align: right;
          }
        }

        .dimension-desc {
          font-size: var(--van-font-size-xs);
          color: var(--van-text-color-2);
          line-height: 1.3;
        }
      }
    }
  }

  .achievements-section {
    margin-bottom: var(--van-padding-md);

    .achievements-grid {
      display: grid;
      gap: var(--van-padding-sm);

      .achievement-item {
        display: flex;
        align-items: center;
        background: var(--van-background-color-light);
        border-radius: var(--van-border-radius-lg);
        padding: var(--van-padding-md);
        transition: all 0.3s ease;

        &:active {
          transform: scale(0.98);
          background: var(--van-cell-active-color);
        }

        .achievement-icon {
          position: relative;
          margin-right: var(--van-padding-sm);
        }

        .achievement-info {
          flex: 1;

          .achievement-name {
            font-size: var(--van-font-size-md);
            font-weight: var(--van-font-weight-bold);
            color: var(--van-text-color);
            margin: 0 0 4px 0;
          }

          .achievement-desc {
            font-size: var(--van-font-size-xs);
            color: var(--van-text-color-2);
            margin: 0 0 4px 0;
            line-height: 1.3;
          }

          .achievement-time {
            font-size: 10px;
            color: var(--van-text-color-3);
          }
        }
      }
    }
  }

  .growth-timeline {
    margin-bottom: var(--van-padding-md);

    .timeline-list {
      .van-steps {
        .van-step {
          :deep(.van-step__title) {
            font-weight: var(--van-font-weight-bold);
            color: var(--van-text-color);
          }

          :deep(.van-step__description) {
            color: var(--van-text-color-2);
            line-height: 1.4;
          }

          .timeline-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .timeline-content {
            margin-top: var(--van-padding-xs);

            .timeline-time {
              font-size: var(--van-font-size-xs);
              color: var(--van-text-color-3);
              margin-bottom: 2px;
            }

            .timeline-score {
              font-size: var(--van-font-size-xs);
              color: var(--van-text-color-2);

              .score-value {
                font-weight: var(--van-font-weight-bold);
                color: var(--van-warning-color);
              }
            }
          }
        }
      }
    }
  }

  .suggestions-section {
    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: var(--van-padding-xs);

      .van-notice-bar {
        border-radius: var(--van-border-radius-md);
      }
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--van-padding-sm);

    .section-title {
      margin: 0;
      font-size: var(--van-font-size-lg);
      font-weight: var(--van-font-weight-bold);
      color: var(--van-text-color);
    }
  }
}

// 暗色主题适配
@media (prefers-color-scheme: dark) {
  .progress-summary {
    .ability-dimensions,
    .achievements-section,
    .growth-timeline {
      .dimension-item,
      .achievement-item {
        background: var(--van-background-color-dark);
      }
    }
  }
}
</style>