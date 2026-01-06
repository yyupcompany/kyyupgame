<template>
  <div class="simulation-data">
    <h3>📊 实时监测数据</h3>

    <div class="data-grid">
      <!-- 电流 -->
      <div class="data-card current">
        <div class="data-icon">⚡</div>
        <div class="data-content">
          <div class="data-label">电流</div>
          <div class="data-value">{{ simulationData.current.toFixed(2) }}</div>
          <div class="data-unit">mA</div>
        </div>
        <div class="data-trend">
          <div class="trend-indicator" :class="{ positive: currentTrend > 0, negative: currentTrend < 0 }">
            {{ getTrendIcon(currentTrend) }}
          </div>
        </div>
      </div>

      <!-- 电压 -->
      <div class="data-card voltage">
        <div class="data-icon">📈</div>
        <div class="data-content">
          <div class="data-label">电压</div>
          <div class="data-value">{{ simulationData.voltage.toFixed(1) }}</div>
          <div class="data-unit">V</div>
        </div>
        <div class="data-trend">
          <div class="trend-indicator" :class="{ positive: voltageTrend > 0, negative: voltageTrend < 0 }">
            {{ getTrendIcon(voltageTrend) }}
          </div>
        </div>
      </div>

      <!-- 电阻 -->
      <div class="data-card resistance">
        <div class="data-icon">🔧</div>
        <div class="data-content">
          <div class="data-label">电阻</div>
          <div class="data-value">{{ simulationData.resistance.toFixed(0) }}</div>
          <div class="data-unit">Ω</div>
        </div>
      </div>

      <!-- 功率 -->
      <div class="data-card power">
        <div class="data-icon">💡</div>
        <div class="data-content">
          <div class="data-label">功率</div>
          <div class="data-value">{{ simulationData.power.toFixed(2) }}</div>
          <div class="data-unit">W</div>
        </div>
        <div class="data-trend">
          <div class="trend-indicator" :class="{ positive: powerTrend > 0, negative: powerTrend < 0 }">
            {{ getTrendIcon(powerTrend) }}
          </div>
        </div>
      </div>

      <!-- 温度 -->
      <div class="data-card temperature">
        <div class="data-icon">🌡️</div>
        <div class="data-content">
          <div class="data-label">温度</div>
          <div class="data-value">{{ simulationData.temperature.toFixed(1) }}</div>
          <div class="data-unit">°C</div>
        </div>
        <div class="data-trend">
          <div class="trend-indicator" :class="{ positive: temperatureTrend > 0, negative: temperatureTrend < 0 }">
            {{ getTrendIcon(temperatureTrend) }}
          </div>
        </div>
        <div class="temperature-warning" v-if="simulationData.temperature > 60">
          ⚠️ 高温警告
        </div>
      </div>
    </div>

    <!-- 图表 -->
    <div class="chart-section">
      <h4>📈 数据趋势</h4>
      <div class="chart-container">
        <canvas ref="chartCanvas" width="300" height="200"></canvas>
      </div>
    </div>

    <!-- 分析结果 -->
    <div class="analysis-section">
      <h4>🔍 电路分析</h4>
      <div class="analysis-content">
        <div class="analysis-item">
          <div class="analysis-label">电路状态：</div>
          <div class="analysis-value" :class="circuitStatus.class">
            {{ circuitStatus.text }}
          </div>
        </div>

        <div class="analysis-item">
          <div class="analysis-label">效率评估：</div>
          <div class="analysis-value">
            <el-progress
              :percentage="efficiencyPercentage"
              :color="efficiencyColor"
              :show-text="false"
              :stroke-width="8"
            />
            <span class="efficiency-text">{{ efficiencyPercentage }}%</span>
          </div>
        </div>

        <div class="analysis-item">
          <div class="analysis-label">安全状态：</div>
          <div class="analysis-value" :class="safetyStatus.class">
            {{ safetyStatus.text }}
          </div>
        </div>

        <div class="recommendations" v-if="recommendations.length > 0">
          <div class="analysis-label">优化建议：</div>
          <ul class="recommendations-list">
            <li v-for="rec in recommendations" :key="rec" class="recommendation-item">
              {{ rec }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface SimulationData {
  current: number
  voltage: number
  resistance: number
  power: number
  temperature: number
}

const props = defineProps<{
  simulationData: SimulationData
}>()

// 历史数据用于趋势计算
const dataHistory = ref<SimulationData[]>([])
const previousData = ref<SimulationData>({
  current: 0,
  voltage: 0,
  resistance: 0,
  power: 0,
  temperature: 25
})

const chartCanvas = ref<HTMLCanvasElement>()
let chartAnimationFrame: number | null = null
const chartData = ref<number[]>([])

// 趋势计算
const currentTrend = computed(() => props.simulationData.current - previousData.value.current)
const voltageTrend = computed(() => props.simulationData.voltage - previousData.value.voltage)
const powerTrend = computed(() => props.simulationData.power - previousData.value.power)
const temperatureTrend = computed(() => props.simulationData.temperature - previousData.value.temperature)

// 电路状态分析
const circuitStatus = computed(() => {
  const current = props.simulationData.current
  const voltage = props.simulationData.voltage

  if (current === 0) {
    return { text: '⚫ 断路', class: 'status-open' }
  } else if (current > 1000) {
    return { text: '🔴 短路', class: 'status-short' }
  } else if (current > 500) {
    return { text: '🟡 过载', class: 'status-overload' }
  } else {
    return { text: '🟢 正常', class: 'status-normal' }
  }
})

// 效率评估
const efficiencyPercentage = computed(() => {
  const idealPower = props.simulationData.voltage * (props.simulationData.voltage / props.simulationData.resistance)
  const actualPower = props.simulationData.power
  return Math.min(Math.round((actualPower / idealPower) * 100), 100)
})

const efficiencyColor = computed(() => {
  const percentage = efficiencyPercentage.value
  if (percentage >= 90) return '#67C23A'
  if (percentage >= 70) return '#E6A23C'
  return '#F56C6C'
})

// 安全状态
const safetyStatus = computed(() => {
  const temperature = props.simulationData.temperature
  const current = props.simulationData.current
  const power = props.simulationData.power

  if (temperature > 80 || current > 2000 || power > 25) {
    return { text: '⚠️ 危险', class: 'safety-danger' }
  } else if (temperature > 60 || current > 1000 || power > 15) {
    return { text: '⚡ 警告', class: 'safety-warning' }
  } else {
    return { text: '✅ 安全', class: 'safety-safe' }
  }
})

// 优化建议
const recommendations = computed(() => {
  const recommendations: string[] = []
  const current = props.simulationData.current
  const temperature = props.simulationData.temperature
  const power = props.simulationData.power

  if (current > 1000) {
    recommendations.push('电流过大，建议增加电阻或降低电压')
  }

  if (temperature > 60) {
    recommendations.push('温度过高，建议增加散热措施')
  }

  if (power > 15) {
    recommendations.push('功率较高，检查电路设计是否合理')
  }

  if (efficiencyPercentage.value < 70) {
    recommendations.push('效率偏低，优化电路连接减少损耗')
  }

  if (recommendations.length === 0) {
    recommendations.push('电路运行正常，继续保持')
  }

  return recommendations
})

// 获取趋势图标
const getTrendIcon = (trend: number): string => {
  if (trend > 0) return '📈'
  if (trend < 0) return '📉'
  return '➡️'
}

// 更新历史数据
const updateHistory = () => {
  dataHistory.value.push({ ...props.simulationData })
  if (dataHistory.value.length > 50) {
    dataHistory.value.shift()
  }

  // 更新图表数据
  chartData.value.push(props.simulationData.current)
  if (chartData.value.length > 30) {
    chartData.value.shift()
  }

  // 保存当前数据作为下次比较的基准
  previousData.value = { ...props.simulationData }
}

// 绘制图表
const drawChart = () => {
  const canvas = chartCanvas.value
  const ctx = canvas?.getContext('2d')
  if (!ctx || !canvas) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制网格
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1

  for (let i = 0; i <= 10; i++) {
    const y = (canvas.height / 10) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }

  for (let i = 0; i <= 6; i++) {
    const x = (canvas.width / 6) * i
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }

  // 绘制数据线
  if (chartData.value.length > 1) {
    const maxValue = Math.max(...chartData.value, 1)
    const xStep = canvas.width / (chartData.value.length - 1)

    ctx.strokeStyle = '#007bff'
    ctx.lineWidth = 2
    ctx.beginPath()

    chartData.value.forEach((value, index) => {
      const x = index * xStep
      const y = canvas.height - (value / maxValue) * canvas.height * 0.9 - 10

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // 绘制数据点
    ctx.fillStyle = '#007bff'
    chartData.value.forEach((value, index) => {
      const x = index * xStep
      const y = canvas.height - (value / maxValue) * canvas.height * 0.9 - 10

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
  }
}

// 动画循环
const animate = () => {
  drawChart()
  chartAnimationFrame = requestAnimationFrame(animate)
}

// 监听数据变化
watch(() => props.simulationData, () => {
  updateHistory()
  nextTick(() => {
    drawChart()
  })
}, { deep: true })

onMounted(() => {
  animate()
})

onUnmounted(() => {
  if (chartAnimationFrame) {
    cancelAnimationFrame(chartAnimationFrame)
  }
})
</script>

<style scoped lang="scss">
.simulation-data {
  width: 100%;
  height: 100%;
}

h3 {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  color: #333;
  font-size: 1.2rem;
}

.data-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.data-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: var(--spacing-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.current {
    border-left: 4px solid #2196F3;
  }

  &.voltage {
    border-left: 4px solid #4CAF50;
  }

  &.resistance {
    border-left: 4px solid #FF9800;
  }

  &.power {
    border-left: 4px solid #F44336;
  }

  &.temperature {
    border-left: 4px solid #9C27B0;
  }
}

.data-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
}

.data-content {
  flex: 1;

  .data-label {
    font-size: var(--text-xs);
    color: #666;
    margin-bottom: 2px;
  }

  .data-value {
    font-size: var(--text-xl);
    font-weight: bold;
    color: #333;
    line-height: 1;
  }

  .data-unit {
    font-size: var(--text-sm);
    color: #999;
    margin-top: 2px;
  }
}

.data-trend {
  .trend-indicator {
    font-size: var(--text-lg);

    &.positive {
      color: #4CAF50;
    }

    &.negative {
      color: #F44336;
    }
  }
}

.temperature-warning {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #FFF3E0;
  color: #E65100;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.chart-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: var(--spacing-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);

  h4 {
    margin: 0 0 var(--spacing-md) 0;
    color: #333;
    font-size: 1rem;
  }

  .chart-container {
    position: relative;
    width: 100%;
    height: 200px;

    canvas {
      width: 100%;
      height: 100%;
    }
  }
}

.analysis-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: var(--spacing-md);
  padding: var(--spacing-lg);

  h4 {
    margin: 0 0 var(--spacing-lg) 0;
    color: #333;
    font-size: 1rem;
  }
}

.analysis-content {
  .analysis-item {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .analysis-label {
      min-width: 100px;
      font-size: var(--text-sm);
      color: #666;
    }

    .analysis-value {
      flex: 1;

      &.status-normal {
        color: #4CAF50;
        font-weight: 600;
      }

      &.status-open {
        color: #9E9E9E;
        font-weight: 600;
      }

      &.status-short {
        color: #F44336;
        font-weight: 600;
      }

      &.status-overload {
        color: #FF9800;
        font-weight: 600;
      }

      &.safety-safe {
        color: #4CAF50;
        font-weight: 600;
      }

      &.safety-warning {
        color: #FF9800;
        font-weight: 600;
      }

      &.safety-danger {
        color: #F44336;
        font-weight: 600;
      }
    }
  }
}

.efficiency-text {
  margin-left: var(--spacing-sm);
  font-weight: 600;
  color: #333;
}

.recommendations {
  margin-top: var(--spacing-lg);

  .recommendations-list {
    list-style: none;
    padding: 0;
    margin: 0;

    .recommendation-item {
      padding: var(--spacing-xs) 0;
      color: #666;
      font-size: var(--text-sm);
      position: relative;
      padding-left: var(--spacing-lg);

      &:before {
        content: "💡";
        position: absolute;
        left: 0;
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .data-card {
    padding: var(--spacing-md);
  }

  .data-icon {
    font-size: 1.5rem;
    width: 40px;
  }

  .data-content .data-value {
    font-size: var(--text-lg);
  }

  .chart-section, .analysis-section {
    padding: var(--spacing-md);
  }
}
</style>