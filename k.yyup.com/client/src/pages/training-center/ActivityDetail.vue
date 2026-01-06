<template>
  <div class="activity-detail">
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

    <!-- 活动详情内容 -->
    <div class="activity-content">
      <!-- 活动基本信息 -->
      <div class="activity-header">
        <div class="activity-icon">
          <van-icon name="fire-o" size="48" color="#ff6b6b" />
        </div>
        <div class="activity-info">
          <h2 class="activity-name">{{ activity.activityName }}</h2>
          <div class="activity-meta">
            <van-tag :type="getTypeColor(activity.activityType)" size="medium">
              {{ getTypeLabel(activity.activityType) }}
            </van-tag>
            <van-tag type="primary" size="medium">
              难度: {{ activity.difficultyLevel }}/5
            </van-tag>
            <van-tag type="success" size="medium">
              {{ activity.targetAgeMin }}-{{ activity.targetAgeMax }}岁
            </van-tag>
          </div>
        </div>
      </div>

      <!-- 活动描述 -->
      <div class="activity-description">
        <h3>活动介绍</h3>
        <p>{{ activity.activityDescription || '暂无描述' }}</p>
      </div>

      <!-- 学习目标 -->
      <div class="learning-objectives" v-if="activity.learningObjectives?.length">
        <h3>学习目标</h3>
        <div class="objectives-list">
          <div
            v-for="(objective, index) in activity.learningObjectives"
            :key="index"
            class="objective-item"
          >
            <van-icon name="check" color="#52c41a" />
            <span>{{ objective }}</span>
          </div>
        </div>
      </div>

      <!-- 训练指导 -->
      <div class="training-tips" v-if="activity.trainingTips">
        <h3>训练指导</h3>
        <p>{{ activity.trainingTips }}</p>
      </div>

      <!-- 活动统计 -->
      <div class="activity-stats">
        <h3>训练统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ activityStats.totalSessions }}</div>
            <div class="stat-label">总训练次数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activityStats.averageAccuracy }}%</div>
            <div class="stat-label">平均准确率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activityStats.totalDuration }}分钟</div>
            <div class="stat-label">总训练时长</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activityStats.bestScore }}</div>
            <div class="stat-label">最高得分</div>
          </div>
        </div>
      </div>

      <!-- 最近记录 -->
      <div class="recent-records" v-if="recentRecords.length">
        <h3>最近训练记录</h3>
        <div class="records-list">
          <div
            v-for="(record, index) in recentRecords"
            :key="index"
            class="record-item"
          >
            <div class="record-date">{{ formatDate(record.date) }}</div>
            <div class="record-info">
              <span class="record-score">{{ record.score }}分</span>
              <span class="record-accuracy">准确率{{ record.accuracy }}%</span>
              <span class="record-duration">{{ record.duration }}分钟</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 所需器材 -->
      <div class="equipment" v-if="activity.equipment?.length">
        <h3>所需器材</h3>
        <div class="equipment-list">
          <van-tag
            v-for="(item, index) in activity.equipment"
            :key="index"
            type="primary"
            plain
            size="medium"
            class="equipment-tag"
          >
            {{ item }}
          </van-tag>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="action-buttons">
      <van-button
        type="primary"
        block
        size="large"
        @click="startActivity"
        :loading="starting"
      >
        开始训练
      </van-button>
      <van-button
        plain
        block
        size="large"
        @click="viewHistory"
      >
        查看历史记录
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
const activity = ref<any>({})
const activityStats = ref<any>({})
const recentRecords = ref<any[]>([])
const starting = ref(false)

// 计算属性
const pageTitle = computed(() => {
  return activity.value.activityName || '活动详情'
})

// 方法
const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    cognitive: '认知训练',
    motor: '运动训练',
    language: '语言训练',
    social: '社交训练'
  }
  return typeMap[type] || type
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    cognitive: 'primary',
    motor: 'success',
    language: 'warning',
    social: 'danger'
  }
  return colorMap[type] || 'default'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadActivityDetail = async () => {
  try {
    showLoadingToast('加载中...')

    const activityId = route.params.id

    // 这里应该调用实际的API
    // const response = await getActivityDetail(activityId)

    // 模拟数据
    activity.value = {
      id: activityId,
      activityName: '注意力训练 - 找不同',
      activityType: 'cognitive',
      difficultyLevel: 2,
      targetAgeMin: 3,
      targetAgeMax: 6,
      durationMinutes: 15,
      activityDescription: '通过寻找图片中的不同之处，训练儿童的注意力集中、观察力和视觉分辨能力。这个活动能够有效提高儿童的专注力和细节观察技能。',
      learningObjectives: [
        '提高注意力集中时间',
        '增强视觉分辨能力',
        '培养观察细节的习惯',
        '提升专注力稳定性'
      ],
      trainingTips: '请确保在安静的环境中进行训练，鼓励孩子仔细观察，不要急于求成。可以适当给予提示，但要让孩子自己发现不同之处。',
      equipment: ['平板电脑', '安静的环境']
    }

    // 模拟统计数据
    activityStats.value = {
      totalSessions: 12,
      averageAccuracy: 85,
      totalDuration: 180,
      bestScore: 98
    }

    // 模拟最近记录
    recentRecords.value = [
      {
        date: '2025-12-11',
        score: 85,
        accuracy: 85,
        duration: 15
      },
      {
        date: '2025-12-10',
        score: 90,
        accuracy: 90,
        duration: 14
      },
      {
        date: '2025-12-09',
        score: 75,
        accuracy: 75,
        duration: 16
      }
    ]

  } catch (error) {
    console.error('加载活动详情失败:', error)
  }
}

const startActivity = async () => {
  try {
    starting.value = true
    showLoadingToast('准备训练...')

    // 这里应该调用实际的API开始训练
    // const response = await startActivity(activity.value.id)

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    showSuccessToast('训练准备完成')
    router.push(`/training-center/activity-start/${activity.value.id}`)

  } catch (error) {
    console.error('开始训练失败:', error)
  } finally {
    starting.value = false
  }
}

const viewHistory = () => {
  router.push('/training-center/records')
}

// 生命周期
onMounted(() => {
  loadActivityDetail()
})
</script>

<style scoped lang="scss">
.activity-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120px;
}

.page-header {
  :deep(.van-nav-bar) {
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.activity-content {
  padding: var(--spacing-md);

  > div {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-lg);
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  h3 {
    color: #333;
    font-size: var(--text-lg);
    font-weight: 600;
    margin: 0 0 16px 0;
  }

  p {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
}

.activity-header {
  display: flex;
  align-items: center;

  .activity-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
    box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3);
  }

  .activity-info {
    flex: 1;

    .activity-name {
      color: #333;
      font-size: 22px;
      font-weight: bold;
      margin: 0 0 12px 0;
    }

    .activity-meta {
      display: flex;
      gap: var(--spacing-sm);
      flex-wrap: wrap;

      :deep(.van-tag) {
        border-radius: 20px;
      }
    }
  }
}

.learning-objectives {
  .objectives-list {
    .objective-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-sm) 0;

      .van-icon {
        margin-right: 8px;
        font-size: var(--text-base);
      }

      span {
        color: #333;
      }
    }
  }
}

.training-tips {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  h3 {
    color: white;
  }

  p {
    color: rgba(255, 255, 255, 0.9);
  }
}

.activity-stats {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);

    .stat-item {
      text-align: center;
      padding: var(--spacing-md);
      background: #f8f9fa;
      border-radius: 8px;

      .stat-value {
        font-size: var(--text-2xl);
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: var(--text-sm);
        color: #666;
      }
    }
  }
}

.recent-records {
  .records-list {
    .record-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .record-date {
        color: #666;
        font-size: var(--text-sm);
      }

      .record-info {
        display: flex;
        gap: var(--spacing-md);

        > span {
          font-size: var(--text-sm);
        }

        .record-score {
          color: #333;
          font-weight: 600;
        }

        .record-accuracy {
          color: #52c41a;
        }

        .record-duration {
          color: #1890ff;
        }
      }
    }
  }
}

.equipment {
  .equipment-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);

    .equipment-tag {
      border-radius: 20px;
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
  display: flex;
  gap: var(--spacing-md);

  .van-button {
    flex: 1;
  }
}
</style>