<template>
  <div class="mobile-attention-game">
    <!-- 游戏说明 -->
    <div class="game-instructions">
      <div class="instruction-card">
        <van-icon name="eye-o" size="24" color="#409EFF" />
        <h3 class="instruction-title">找不同游戏</h3>
        <p class="instruction-desc">请仔细观察两幅图片，找出 {{ differencesCount }} 处不同</p>
        <van-tag type="primary" size="small">点击图片上的不同之处</van-tag>
      </div>
    </div>

    <!-- 游戏进度 -->
    <div class="game-progress">
      <van-progress
        :percentage="progressPercentage"
        stroke-width="6"
        color="#409EFF"
        track-color="#F0F2F5"
      />
      <div class="progress-text">
        已找到 {{ foundCount }} / {{ differencesCount }} 处不同
      </div>
    </div>

    <!-- 游戏区域 -->
    <div class="game-area">
      <div class="images-container">
        <div class="image-wrapper">
          <canvas
            ref="canvasLeftRef"
            class="game-canvas"
            :width="gameCanvasSize"
            :height="gameCanvasSize"
            @click="handleCanvasClick($event, 'left')"
          ></canvas>
          <div class="image-label">图片A</div>
        </div>
        <div class="image-wrapper">
          <canvas
            ref="canvasRightRef"
            class="game-canvas"
            :width="gameCanvasSize"
            :height="gameCanvasSize"
            @click="handleCanvasClick($event, 'right')"
          ></canvas>
          <div class="image-label">图片B</div>
        </div>
      </div>
    </div>

    <!-- 游戏统计 -->
    <div class="game-stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ foundCount }}</div>
          <div class="stat-label">已找到</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ differencesCount - foundCount }}</div>
          <div class="stat-label">未找到</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ accuracyPercent }}%</div>
          <div class="stat-label">准确率</div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="game-controls">
      <van-button
        plain
        type="default"
        size="large"
        block
        @click="resetGame"
      >
        重新开始
      </van-button>
      <van-button
        type="primary"
        size="large"
        block
        :disabled="foundCount < differencesCount"
        @click="submitAnswer"
      >
        提交答案 ({{ foundCount }}/{{ differencesCount }})
      </van-button>
    </div>

    <!-- 成功提示 -->
    <van-popup
      v-model:show="showSuccess"
      position="center"
      round
      :closeable="false"
    >
      <div class="success-popup">
        <van-icon name="success" size="48" color="#67C23A" />
        <h3>恭喜完成！</h3>
        <p>您成功找到了所有不同之处</p>
        <van-button type="primary" block @click="showSuccess = false">
          继续游戏
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { showToast, showSuccessToast } from 'vant'

const props = defineProps<{
  config?: any
}>()

const emit = defineEmits<{
  answer: [value: any]
}>()

const canvasLeftRef = ref<HTMLCanvasElement | null>(null)
const canvasRightRef = ref<HTMLCanvasElement | null>(null)
const differencesCount = ref(props.config?.differencesCount || 3)
const foundCount = ref(0)
const foundDifferences = ref<number[]>([])
const differences = ref<Array<{ id: number; leftX: number; leftY: number; rightX: number; rightY: number }>>([])
const clickAttempts = ref(0)
const showSuccess = ref(false)

// 移动端画布尺寸
const gameCanvasSize = ref(300)

// 计算进度百分比
const progressPercentage = computed(() => {
  return Math.round((foundCount.value / differencesCount.value) * 100)
})

// 计算准确率
const accuracyPercent = computed(() => {
  if (clickAttempts.value === 0) return 0
  return Math.round((foundCount.value / clickAttempts.value) * 100)
})

// 初始化差异点位置
const initDifferences = () => {
  const count = differencesCount.value
  differences.value = []

  for (let i = 0; i < count; i++) {
    // 随机生成差异点位置，确保不重叠
    const canvasSize = gameCanvasSize.value
    const margin = canvasSize * 0.15
    const maxOffset = canvasSize * 0.08

    let leftX = Math.random() * (canvasSize - 2 * margin) + margin
    let leftY = Math.random() * (canvasSize - 2 * margin) + margin
    let rightX = leftX + (Math.random() * maxOffset * 2 - maxOffset)
    let rightY = leftY + (Math.random() * maxOffset * 2 - maxOffset)

    // 确保位置在画布内
    rightX = Math.max(margin, Math.min(canvasSize - margin, rightX))
    rightY = Math.max(margin, Math.min(canvasSize - margin, rightY))

    differences.value.push({
      id: i + 1,
      leftX,
      leftY,
      rightX,
      rightY
    })
  }
}

// 绘制图片（模拟）
const drawImage = (canvas: HTMLCanvasElement, side: 'left' | 'right', foundIds: number[]) => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制背景（模拟图片）
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#E8F4FD')
  gradient.addColorStop(1, '#F0F9FF')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制一些装饰元素（模拟图片内容）
  ctx.fillStyle = '#D1D5DB'
  const canvasSize = canvas.width
  const decorationScale = canvasSize / 300

  ctx.fillRect(40 * decorationScale, 40 * decorationScale, 80 * decorationScale, 60 * decorationScale)
  ctx.fillRect(160 * decorationScale, 120 * decorationScale, 90 * decorationScale, 70 * decorationScale)
  ctx.fillRect(80 * decorationScale, 200 * decorationScale, 60 * decorationScale, 80 * decorationScale)

  // 绘制差异点
  const sideDifferences = side === 'left'
    ? differences.value.map(d => ({ x: d.leftX, y: d.leftY, id: d.id }))
    : differences.value.map(d => ({ x: d.rightX, y: d.rightY, id: d.id }))

  sideDifferences.forEach(diff => {
    if (foundIds.includes(diff.id)) {
      // 已找到的差异点 - 绿色圆圈
      ctx.fillStyle = '#67C23A'
      ctx.beginPath()
      ctx.arc(diff.x, diff.y, 20, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.stroke()

      // 添加对勾
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(diff.x - 8, diff.y)
      ctx.lineTo(diff.x - 2, diff.y + 6)
      ctx.lineTo(diff.x + 8, diff.y - 6)
      ctx.stroke()
    } else {
      // 未找到的差异点 - 不显示提示
    }
  })
}

// 绘制游戏
const drawGame = () => {
  if (!canvasLeftRef.value || !canvasRightRef.value) return

  const foundIds = foundDifferences.value
  drawImage(canvasLeftRef.value, 'left', foundIds)
  drawImage(canvasRightRef.value, 'right', foundIds)
}

// 处理点击事件
const handleCanvasClick = (event: MouseEvent, side: 'left' | 'right') => {
  const canvas = side === 'left' ? canvasLeftRef.value : canvasRightRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  clickAttempts.value++

  // 检查是否点击到差异点
  const sideDifferences = side === 'left'
    ? differences.value.map(d => ({ x: d.leftX, y: d.leftY, id: d.id }))
    : differences.value.map(d => ({ x: d.rightX, y: d.rightY, id: d.id }))

  for (const diff of sideDifferences) {
    const distance = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2))
    const clickRadius = 25 // 移动端点击检测半径
    if (distance < clickRadius && !foundDifferences.value.includes(diff.id)) {
      foundDifferences.value.push(diff.id)
      foundCount.value++
      drawGame()
      showToast({
        type: 'success',
        message: `找到了第 ${foundCount.value } 处不同！`,
        position: 'top'
      })

      // 如果全部找到，显示完成提示
      if (foundCount.value === differencesCount.value) {
        setTimeout(() => {
          showSuccess.value = true
          showSuccessToast('恭喜！您找到了所有不同之处！')
        }, 500)
      }
      return
    }
  }

  // 点击错误位置的提示
  showToast({
    type: 'fail',
    message: '这里没有不同，请再仔细找找',
    position: 'top'
  })
}

// 重置游戏
const resetGame = () => {
  foundCount.value = 0
  foundDifferences.value = []
  clickAttempts.value = 0
  showSuccess.value = false
  initDifferences()
  drawGame()
  showToast({
    type: 'info',
    message: '游戏已重置，请重新开始',
    position: 'top'
  })
}

// 提交答案
const submitAnswer = () => {
  const accuracy = foundCount.value / differencesCount.value
  emit('answer', {
    foundCount: foundCount.value,
    totalCount: differencesCount.value,
    clickAttempts: clickAttempts.value,
    accuracy: accuracy,
    accuracyPercent: accuracyPercent.value,
    differences: foundDifferences.value
  })
}

// 监听配置变化
watch(() => props.config, (newConfig) => {
  if (newConfig?.differencesCount) {
    differencesCount.value = newConfig.differencesCount
    resetGame()
  }
}, { deep: true })

onMounted(async () => {
  await nextTick()
  initDifferences()
  drawGame()
})
</script>

<style scoped lang="scss">
.mobile-attention-game {
  width: 100%;
  min-height: 100vh;
  background: #F7F8FA;
  padding: var(--spacing-md);
  padding-bottom: 100px;

  .game-instructions {
    margin-bottom: 20px;

    .instruction-card {
      background: white;
      border-radius: 12px;
      padding: var(--spacing-lg);
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

      .instruction-title {
        margin: var(--spacing-md) 0 8px;
        font-size: var(--text-lg);
        font-weight: 600;
        color: #323233;
      }

      .instruction-desc {
        margin: 0 0 12px;
        font-size: var(--text-sm);
        color: #646566;
        line-height: 1.5;
      }
    }
  }

  .game-progress {
    margin-bottom: 20px;

    .progress-text {
      text-align: center;
      font-size: var(--text-sm);
      color: #646566;
      margin-top: 8px;
    }
  }

  .game-area {
    margin-bottom: 20px;

    .images-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);

      .image-wrapper {
        position: relative;

        .game-canvas {
          width: 100%;
          height: auto;
          border: 2px solid #E4E7ED;
          border-radius: 8px;
          cursor: pointer;
          transition: border-color 0.3s;
          background: white;

          &:active {
            transform: scale(0.98);
          }
        }

        .image-label {
          text-align: center;
          margin-top: 8px;
          font-size: var(--text-xs);
          font-weight: 500;
          color: #969799;
        }
      }
    }
  }

  .game-stats {
    margin-bottom: 20px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-md);

      .stat-item {
        background: white;
        border-radius: 8px;
        padding: var(--spacing-md);
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .stat-value {
          font-size: var(--text-xl);
          font-weight: 600;
          color: #409EFF;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }

  .game-controls {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .van-button {
      height: 48px;
      border-radius: 8px;
      font-size: var(--text-base);
      font-weight: 500;
    }
  }

  .success-popup {
    padding: var(--spacing-xl) 24px;
    text-align: center;
    min-width: 280px;

    h3 {
      margin: var(--spacing-md) 0 8px;
      font-size: var(--text-lg);
      color: #323233;
    }

    p {
      margin: 0 0 24px;
      font-size: var(--text-sm);
      color: #646566;
    }

    .van-button {
      height: 44px;
      border-radius: 8px;
    }
  }
}

// 移动端触摸优化
@media (max-width: var(--breakpoint-md)) {
  .mobile-attention-game {
    padding: var(--spacing-md);

    .game-area .images-container {
      gap: var(--spacing-sm);

      .image-wrapper .game-canvas {
        border-radius: 6px;
      }
    }

    .game-stats .stats-grid .stat-item {
      padding: var(--spacing-md);

      .stat-value {
        font-size: var(--text-lg);
      }
    }
  }
}
</style>