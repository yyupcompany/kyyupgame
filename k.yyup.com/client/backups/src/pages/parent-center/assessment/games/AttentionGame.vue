<template>
  <div class="attention-game">
    <div class="game-instructions">
      <h3>找不同游戏</h3>
      <p>请仔细观察两幅图片，找出 {{ differencesCount }} 处不同</p>
      <p class="hint">点击图片上的不同之处</p>
    </div>

    <div class="game-area">
      <div class="images-container">
        <div class="image-wrapper">
          <canvas ref="canvasLeftRef" width="400" height="400"></canvas>
          <div class="image-label">图片A</div>
        </div>
        <div class="image-wrapper">
          <canvas ref="canvasRightRef" width="400" height="400"></canvas>
          <div class="image-label">图片B</div>
        </div>
      </div>
      <div class="progress-info">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${(foundCount / differencesCount) * 100}%` }"></div>
        </div>
        <div class="progress-text">已找到 {{ foundCount }} / {{ differencesCount }} 处不同</div>
      </div>
    </div>

    <div class="game-controls">
      <el-button @click="resetGame">重新开始</el-button>
      <el-button type="primary" @click="submitAnswer" :disabled="foundCount < differencesCount">
        提交答案 (已找到 {{ foundCount }}/{{ differencesCount }})
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

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

// 初始化差异点位置
const initDifferences = () => {
  const count = differencesCount.value
  differences.value = []
  
  for (let i = 0; i < count; i++) {
    // 随机生成差异点位置，确保不重叠
    let leftX = Math.random() * 350 + 50
    let leftY = Math.random() * 350 + 50
    let rightX = leftX + (Math.random() * 20 - 10) // 稍微偏移
    let rightY = leftY + (Math.random() * 20 - 10)
    
    // 确保位置在画布内
    rightX = Math.max(50, Math.min(350, rightX))
    rightY = Math.max(50, Math.min(350, rightY))
    
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
  gradient.addColorStop(0, 'var(--border-color-light)')
  gradient.addColorStop(1, '#f0f2f5')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 绘制一些装饰元素（模拟图片内容）
  ctx.fillStyle = 'var(--text-placeholder)'
  ctx.fillRect(50, 50, 100, 80)
  ctx.fillRect(200, 150, 120, 90)
  ctx.fillRect(100, 250, 80, 100)

  // 绘制差异点
  const sideDifferences = side === 'left' 
    ? differences.value.map(d => ({ x: d.leftX, y: d.leftY, id: d.id }))
    : differences.value.map(d => ({ x: d.rightX, y: d.rightY, id: d.id }))

  sideDifferences.forEach(diff => {
    if (foundIds.includes(diff.id)) {
      // 已找到的差异点 - 绿色圆圈
      ctx.fillStyle = 'var(--success-color)'
      ctx.beginPath()
      ctx.arc(diff.x, diff.y, 25, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'var(--bg-color)'
      ctx.lineWidth = 3
      ctx.stroke()
      // 添加对勾
      ctx.strokeStyle = 'var(--bg-color)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(diff.x - 10, diff.y)
      ctx.lineTo(diff.x - 3, diff.y + 7)
      ctx.lineTo(diff.x + 10, diff.y - 7)
      ctx.stroke()
    } else {
      // 未找到的差异点 - 半透明提示
      ctx.fillStyle = 'rgba(255, 193, 7, 0.3)'
      ctx.beginPath()
      ctx.arc(diff.x, diff.y, 20, 0, Math.PI * 2)
      ctx.fill()
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

  // 检查是否点击到差异点
  const sideDifferences = side === 'left'
    ? differences.value.map(d => ({ x: d.leftX, y: d.leftY, id: d.id }))
    : differences.value.map(d => ({ x: d.rightX, y: d.rightY, id: d.id }))

  for (const diff of sideDifferences) {
    const distance = Math.sqrt(Math.pow(x - diff.x, 2) + Math.pow(y - diff.y, 2))
    if (distance < 30 && !foundDifferences.value.includes(diff.id)) {
      foundDifferences.value.push(diff.id)
      foundCount.value++
      drawGame()
      ElMessage.success(`找到了第 ${foundCount.value} 处不同！`)
      
      // 如果全部找到，显示完成提示
      if (foundCount.value === differencesCount.value) {
        setTimeout(() => {
          ElMessage.success('恭喜！您找到了所有不同之处！')
        }, 500)
      }
      return
    }
  }
  
  // 点击错误位置的提示
  ElMessage.warning('这里没有不同，请再仔细找找')
}

// 重置游戏
const resetGame = () => {
  foundCount.value = 0
  foundDifferences.value = []
  initDifferences()
  drawGame()
  ElMessage.info('游戏已重置，请重新开始')
}

// 提交答案
const submitAnswer = () => {
  const accuracy = foundCount.value / differencesCount.value
  emit('answer', {
    foundCount: foundCount.value,
    totalCount: differencesCount.value,
    accuracy: accuracy,
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
  
  // 添加点击事件监听
  if (canvasLeftRef.value) {
    canvasLeftRef.value.addEventListener('click', (e) => handleCanvasClick(e, 'left'))
  }
  if (canvasRightRef.value) {
    canvasRightRef.value.addEventListener('click', (e) => handleCanvasClick(e, 'right'))
  }
})
</script>

<style scoped lang="scss">
.attention-game {
  width: 100%;
  padding: var(--text-2xl);

  .game-instructions {
    text-align: center;
    margin-bottom: var(--spacing-8xl);

    h3 {
      margin-bottom: var(--spacing-2xl);
      font-size: var(--text-3xl);
      color: var(--text-primary);
    }

    p {
      margin: var(--spacing-base) 0;
      color: var(--text-regular);
      font-size: var(--text-lg);

      &.hint {
        color: var(--info-color);
        font-size: var(--text-base);
      }
    }
  }

  .game-area {
    margin-bottom: var(--spacing-8xl);

    .images-container {
      display: flex;
      justify-content: center;
      gap: var(--text-2xl);
      margin-bottom: var(--text-2xl);
      flex-wrap: wrap;

      .image-wrapper {
        position: relative;

        canvas {
          border: 3px solid var(--border-color);
          border-radius: var(--spacing-sm);
          cursor: crosshair;
          transition: border-color 0.3s;

          &:hover {
            border-color: var(--primary-color);
          }
        }

        .image-label {
          text-align: center;
          margin-top: var(--spacing-2xl);
          font-weight: bold;
          color: var(--text-regular);
        }
      }
    }

    .progress-info {
      max-width: 800px;
      margin: 0 auto;

      .progress-bar {
        width: 100%;
        height: var(--text-2xl);
        background: var(--border-color-light);
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: var(--spacing-2xl);

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color) 0%, var(--success-color) 100%);
          transition: width 0.3s;
        }
      }

      .progress-text {
        text-align: center;
        font-size: var(--text-lg);
        color: var(--text-regular);
        font-weight: 500;
      }
    }
  }

  .game-controls {
    display: flex;
    justify-content: center;
    gap: var(--spacing-4xl);
  }
}
</style>

