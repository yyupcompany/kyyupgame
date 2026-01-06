<template>
  <div class="achievement-detail">
    <!-- 头部导航 -->
    <div class="page-header">
      <van-nav-bar
        :title="pageTitle"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
        placeholder
      />
    </div>

    <!-- 成就详情内容 -->
    <div class="achievement-content">
      <!-- 成就图标和基本信息 -->
      <div class="achievement-header">
        <div class="achievement-icon" :class="{ earned: achievement.isEarned }">
          {{ achievement.badgeIcon || '🏆' }}
        </div>
        <div class="achievement-info">
          <h2 class="achievement-name">{{ achievement.achievementName }}</h2>
          <p class="achievement-type">{{ getTypeLabel(achievement.achievementType) }}</p>
          <div class="achievement-points">
            <van-tag type="primary" size="medium">{{ achievement.pointsAwarded }} 积分</van-tag>
            <van-tag
              :type="achievement.isEarned ? 'success' : 'warning'"
              size="medium"
            >
              {{ achievement.isEarned ? '已获得' : '未获得' }}
            </van-tag>
          </div>
        </div>
      </div>

      <!-- 成就描述 -->
      <div class="achievement-description">
        <h3>成就描述</h3>
        <p>{{ achievement.achievementDescription || '暂无描述' }}</p>
      </div>

      <!-- 达成条件 -->
      <div class="achievement-criteria">
        <h3>达成条件</h3>
        <div class="criteria-list">
          <div
            v-for="(condition, index) in criteriaList"
            :key="index"
            class="criteria-item"
            :class="{ completed: condition.completed }"
          >
            <van-icon :name="condition.completed ? 'success' : 'circle'" />
            <span>{{ condition.description }}</span>
          </div>
        </div>
      </div>

      <!-- 进度信息 -->
      <div class="achievement-progress" v-if="!achievement.isEarned">
        <h3>当前进度</h3>
        <van-progress
          :percentage="progressPercentage"
          :show-pivot="true"
          pivot-text=""
          stroke-width="8"
        />
        <p class="progress-text">{{ progressText }}</p>
      </div>

      <!-- 获得时间 -->
      <div class="achievement-earned" v-if="achievement.isEarned">
        <h3>获得时间</h3>
        <p>{{ formatDate(achievement.earnedDate) }}</p>
      </div>

      <!-- 历史记录 -->
      <div class="achievement-history" v-if="historyList.length > 0">
        <h3>相关记录</h3>
        <van-timeline>
          <van-timeline-item
            v-for="(record, index) in historyList"
            :key="index"
            :timestamp="formatDate(record.date)"
          >
            {{ record.description }}
          </van-timeline-item>
        </van-timeline>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="action-buttons">
      <van-button
        v-if="!achievement.isEarned"
        type="primary"
        block
        @click="goToTraining"
        size="large"
      >
        继续训练
      </van-button>
      <van-button
        v-else
        plain
        block
        @click="shareAchievement"
        size="large"
      >
        分享成就
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()

// 页面数据
const achievement = ref<any>({})
const historyList = ref<any[]>([])
const loading = ref(false)

// 计算属性
const pageTitle = computed(() => {
  return achievement.value.achievementName || '成就详情'
})

const criteriaList = computed(() => {
  if (!achievement.value.criteria) return []

  const criteria = achievement.value.criteria
  if (Array.isArray(criteria)) {
    return criteria.map((item, index) => ({
      description: item.description || `条件 ${index + 1}`,
      completed: item.completed || false
    }))
  } else if (typeof criteria === 'object') {
    return Object.entries(criteria).map(([key, value]) => ({
      description: `${key}: ${value}`,
      completed: false
    }))
  }

  return []
})

const progressPercentage = computed(() => {
  const completed = criteriaList.value.filter(c => c.completed).length
  const total = criteriaList.value.length
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

const progressText = computed(() => {
  const completed = criteriaList.value.filter(c => c.completed).length
  const total = criteriaList.value.length
  return `${completed}/${total} 条件已完成`
})

// 方法
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    streak: '连续达成',
    completion: '完成度',
    improvement: '进步奖',
    mastery: '精通奖'
  }
  return typeMap[type] || type
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadAchievementDetail = async () => {
  try {
    loading.value = true
    showLoadingToast('加载中...')

    const achievementId = route.params.id
    const childId = route.query.childId || 1

    // 这里应该调用实际的API
    // const response = await getAchievementDetail(achievementId, childId)

    // 模拟数据
    achievement.value = {
      id: achievementId,
      achievementName: '连续训练7天',
      achievementDescription: '连续7天完成训练计划，展现您的坚持和毅力！',
      achievementType: 'streak',
      badgeIcon: '🔥',
      pointsAwarded: 100,
      isEarned: false,
      earnedDate: null,
      criteria: [
        { description: '连续完成3天训练', completed: true },
        { description: '连续完成5天训练', completed: true },
        { description: '连续完成7天训练', completed: false }
      ]
    }

    // 模拟历史记录
    historyList.value = [
      {
        date: '2025-12-11',
        description: '完成注意力训练，连续第5天'
      },
      {
        date: '2025-12-10',
        description: '完成记忆力训练，连续第4天'
      },
      {
        date: '2025-12-09',
        description: '开始连续训练挑战'
      }
    ]

  } catch (error) {
    console.error('加载成就详情失败:', error)
  } finally {
    loading.value = false
  }
}

const goToTraining = () => {
  router.push('/training-center')
}

const shareAchievement = () => {
  showSuccessToast('分享功能开发中')
}

// 生命周期
onMounted(() => {
  loadAchievementDetail()
})
</script>

<style scoped lang="scss">
.achievement-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 80px;
}

.page-header {
  :deep(.van-nav-bar) {
    background: transparent;

    .van-nav-bar__title {
      color: white;
    }

    .van-nav-bar__arrow {
      color: white;
    }
  }
}

.achievement-content {
  padding: var(--spacing-lg);

  .achievement-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;

    .achievement-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      margin-right: 20px;

      &.earned {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
      }
    }

    .achievement-info {
      flex: 1;

      .achievement-name {
        color: white;
        font-size: var(--text-2xl);
        font-weight: bold;
        margin: 0 0 8px 0;
      }

      .achievement-type {
        color: rgba(255, 255, 255, 0.8);
        margin: 0 0 12px 0;
      }

      .achievement-points {
        display: flex;
        gap: var(--spacing-sm);

        :deep(.van-tag) {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
        }
      }
    }
  }

  > div {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-lg);
    margin-bottom: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h3 {
      color: #333;
      font-size: var(--text-lg);
      font-weight: 600;
      margin: 0 0 12px 0;
    }

    p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }
  }

  .achievement-criteria {
    .criteria-list {
      .criteria-item {
        display: flex;
        align-items: center;
        padding: var(--spacing-sm) 0;

        &.completed {
          color: #52c41a;
        }

        .van-icon {
          margin-right: 8px;
        }

        span {
          color: #333;
        }
      }
    }
  }

  .achievement-progress {
    .progress-text {
      text-align: center;
      margin-top: 12px;
      color: #666;
    }
  }

  .achievement-history {
    :deep(.van-timeline) {
      .van-timeline-item__content {
        color: #666;
      }
    }
  }
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}
</style>