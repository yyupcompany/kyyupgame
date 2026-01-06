<template>
  <div class="activity-start">
    <!-- 头部导航 -->
    <div class="page-header">
      <van-nav-bar
        title="开始训练"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
        placeholder
      />
    </div>

    <!-- 准备界面 -->
    <div class="preparation-screen">
      <div class="activity-info">
        <div class="activity-icon">
          <van-icon name="play-circle" size="60" color="#07c160" />
        </div>
        <h2 class="activity-name">{{ activity.activityName }}</h2>
        <p class="activity-subtitle">准备开始训练</p>
      </div>

      <!-- 训练参数 -->
      <div class="training-params">
        <div class="param-item">
          <div class="param-label">训练时长</div>
          <div class="param-value">{{ activity.durationMinutes }} 分钟</div>
        </div>
        <div class="param-item">
          <div class="param-label">难度等级</div>
          <div class="param-value">
            <van-rate
              v-model="difficultyRating"
              readonly
              size="16"
              color="#ffd21e"
            />
          </div>
        </div>
        <div class="param-item">
          <div class="param-label">适合年龄</div>
          <div class="param-value">{{ activity.targetAgeMin }}-{{ activity.targetAgeMax }}岁</div>
        </div>
      </div>

      <!-- 训练提示 -->
      <div class="training-tips">
        <h3>训练提示</h3>
        <ul>
          <li>请在安静的环境中进行训练</li>
          <li>确保孩子状态良好，注意力集中</li>
          <li>按照指导进行，不要急于求成</li>
          <li>多鼓励，少批评，保持积极氛围</li>
        </ul>
      </div>

      <!-- 倒计时 -->
      <div class="countdown-container" v-if="showCountdown">
        <div class="countdown-circle">
          <div class="countdown-number">{{ countdownNumber }}</div>
          <div class="countdown-text">准备开始</div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="action-buttons">
      <van-button
        v-if="!showCountdown"
        type="primary"
        block
        size="large"
        @click="startCountdown"
        :loading="preparing"
      >
        开始训练
      </van-button>
      <van-button
        v-else
        type="danger"
        plain
        block
        size="large"
        @click="cancelCountdown"
      >
        取消
      </van-button>
    </div>

    <!-- 训练界面 (游戏部分) -->
    <div v-if="showGame" class="game-screen">
      <div class="game-header">
        <div class="timer">{{ formatTime(remainingTime) }}</div>
        <div class="score">得分: {{ currentScore }}</div>
      </div>

      <!-- 这里放置实际的游戏内容 -->
      <div class="game-content">
        <div class="game-placeholder">
          <h3>{{ activity.activityName }}</h3>
          <p>游戏内容将在这里显示</p>
          <div class="game-controls">
            <van-button type="primary" @click="completeGame">完成训练</van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showLoadingToast, showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()

// 页面数据
const activity = ref<any>({})
const preparing = ref(false)
const showCountdown = ref(false)
const showGame = ref(false)
const countdownNumber = ref(3)
const remainingTime = ref(0)
const currentScore = ref(0)

// 计算属性
const difficultyRating = computed(() => {
  return activity.value.difficultyLevel || 1
})

// 倒计时定时器
let countdownTimer: NodeJS.Timeout | null = null
let gameTimer: NodeJS.Timeout | null = null

// 方法
const loadActivity = async () => {
  try {
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
      durationMinutes: 15
    }

    remainingTime.value = activity.value.durationMinutes * 60

  } catch (error) {
    console.error('加载活动失败:', error)
  }
}

const startCountdown = async () => {
  try {
    preparing.value = true
    showLoadingToast('准备中...')

    // 这里应该调用实际的API开始训练记录
    // await startActivity(activity.value.id)

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    preparing.value = false
    showCountdown.value = true
    countdownNumber.value = 3

    // 开始倒计时
    countdownTimer = setInterval(() => {
      countdownNumber.value--

      if (countdownNumber.value <= 0) {
        clearInterval(countdownTimer!)
        countdownTimer = null
        startGame()
      }
    }, 1000)

  } catch (error) {
    console.error('准备训练失败:', error)
    preparing.value = false
  }
}

const cancelCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  showCountdown.value = false
  countdownNumber.value = 3
}

const startGame = () => {
  showCountdown.value = false
  showGame.value = true

  // 开始游戏计时
  gameTimer = setInterval(() => {
    remainingTime.value--

    if (remainingTime.value <= 0) {
      completeGame()
    }
  }, 1000)
}

const completeGame = async () => {
  try {
    if (gameTimer) {
      clearInterval(gameTimer)
      gameTimer = null
    }

    showLoadingToast('保存训练记录...')

    // 这里应该调用实际的API完成训练
    // await completeActivity(recordId, {
    //   score: currentScore.value,
    //   duration: activity.value.durationMinutes * 60 - remainingTime.value,
    //   accuracy: calculateAccuracy()
    // })

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    showSuccessToast('训练完成！')

    // 跳转到结果页面
    router.push(`/training-center/record-result/${activity.value.id}`)

  } catch (error) {
    console.error('完成训练失败:', error)
  }
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 生命周期
onMounted(() => {
  loadActivity()
})

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  if (gameTimer) {
    clearInterval(gameTimer)
  }
})
</script>

<style scoped lang="scss">
.activity-start {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.preparation-screen {
  padding: 60px 20px 120px;

  .activity-info {
    text-align: center;
    margin-bottom: 40px;

    .activity-icon {
      margin-bottom: 20px;
    }

    .activity-name {
      color: white;
      font-size: var(--text-3xl);
      font-weight: bold;
      margin: 0 0 8px 0;
    }

    .activity-subtitle {
      color: rgba(255, 255, 255, 0.8);
      font-size: var(--text-base);
      margin: 0;
    }
  }

  .training-params {
    background: white;
    border-radius: 12px;
    padding: var(--spacing-lg);
    margin-bottom: 24px;

    .param-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .param-label {
        color: #666;
        font-size: var(--text-base);
      }

      .param-value {
        color: #333;
        font-weight: 600;
        font-size: var(--text-base);
      }
    }
  }

  .training-tips {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: var(--spacing-lg);
    backdrop-filter: blur(10px);

    h3 {
      color: white;
      font-size: var(--text-lg);
      font-weight: 600;
      margin: 0 0 16px 0;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.8;
        padding-left: 20px;
        position: relative;

        &:before {
          content: '•';
          position: absolute;
          left: 0;
          color: white;
        }
      }
    }
  }

  .countdown-container {
    display: flex;
    justify-content: center;
    margin-top: 40px;

    .countdown-circle {
      width: 120px;
      height: 120px;
      border: 3px solid white;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);

      .countdown-number {
        font-size: var(--text-5xl);
        font-weight: bold;
        color: white;
        line-height: 1;
      }

      .countdown-text {
        color: rgba(255, 255, 255, 0.9);
        font-size: var(--text-sm);
        margin-top: 4px;
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

.game-screen {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;

    .timer, .score {
      font-size: var(--text-lg);
      font-weight: 600;
      color: #333;
    }
  }

  .game-content {
    flex: 1;
    padding: 40px 20px;

    .game-placeholder {
      text-align: center;
      max-width: 400px;
      margin: 0 auto;

      h3 {
        color: #333;
        margin: 0 0 16px 0;
      }

      p {
        color: #666;
        margin: 0 0 32px 0;
        line-height: 1.6;
      }

      .game-controls {
        .van-button {
          min-width: 120px;
        }
      }
    }
  }
}
</style>