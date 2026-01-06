<!--
  天气组件
  显示当前天气信息，支持自动更新
-->

<template>
  <div class="weather-widget" :title="weatherTooltip">
    <div class="weather-content">
      <!-- 天气图标 -->
      <div class="weather-icon">
        <UnifiedIcon :name="weatherIcon" :size="16" />
      </div>

      <!-- 天气信息 -->
      <div class="weather-info" v-if="weatherData">
        <span class="temperature">{{ weatherData.temperature }}°C</span>
        <span class="location">{{ weatherData.city }}</span>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="weather-loading">
        <UnifiedIcon name="refresh" :size="14" />
      </div>

      <!-- 错误状态 -->
      <div v-else class="weather-error">
        <UnifiedIcon name="cloud" :size="14" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'

interface WeatherData {
  city: string
  temperature: number
  condition: string
  humidity?: number
  windSpeed?: number
}

const weatherData = ref<WeatherData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// 更新间隔（30分钟）
const UPDATE_INTERVAL = 30 * 60 * 1000
let updateTimer: number | null = null

// 🔧 全局定时器管理器，防止重复创建
let globalWeatherTimer: number | null = null
let globalTimerCount = 0

// 天气图标映射 - 使用全局统一图标
const weatherIcon = computed(() => {
  if (!weatherData.value) return 'cloud'

  const condition = weatherData.value.condition.toLowerCase()

  if (condition.includes('晴') || condition.includes('sunny')) return 'sun'
  if (condition.includes('多云') || condition.includes('cloud')) return 'cloud'
  if (condition.includes('雨') || condition.includes('rain')) return 'cloud-rain'
  if (condition.includes('雪') || condition.includes('snow')) return 'cloud'
  if (condition.includes('雷') || condition.includes('thunder')) return 'cloud'

  return 'sun'
})

// 天气提示文本
const weatherTooltip = computed(() => {
  if (!weatherData.value) return '天气信息加载中...'

  const { city, temperature, condition, humidity, windSpeed } = weatherData.value
  let tooltip = `${city} ${temperature}°C ${condition}`

  if (humidity && windSpeed) {
    tooltip += ` | 湿度${humidity}% | 风速${windSpeed}km/h`
  }

  return tooltip
})

// 获取天气数据
const fetchWeatherData = async () => {
  if (loading.value) return

  loading.value = true
  error.value = null

  try {
    // 使用免费天气API（这里使用模拟数据，实际项目中可以替换为真实API）
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟网络延迟

    // 模拟天气数据（实际项目中调用真实天气API）
    const mockWeatherData: WeatherData = {
      city: '北京',
      temperature: Math.floor(Math.random() * 15) + 15, // 15-30度
      condition: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 20) + 5 // 5-25km/h
    }

    weatherData.value = mockWeatherData

    // 缓存到localStorage
    localStorage.setItem('weather_data', JSON.stringify({
      data: mockWeatherData,
      timestamp: Date.now()
    }))

  } catch (err) {
    console.error('获取天气数据失败:', err)
    error.value = '获取天气数据失败'

    // 尝试从缓存读取
    const cached = localStorage.getItem('weather_data')
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        // 如果缓存时间在2小时内，使用缓存数据
        if (Date.now() - timestamp < 2 * 60 * 60 * 1000) {
          weatherData.value = data
          error.value = null
        }
      } catch (cacheErr) {
        console.error('读取天气缓存失败:', cacheErr)
      }
    }
  } finally {
    loading.value = false
  }
}

// 初始化天气数据
const initWeatherData = () => {
  const cached = localStorage.getItem('weather_data')
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached)
      // 如果缓存时间在30分钟内，直接使用缓存数据
      if (Date.now() - timestamp < UPDATE_INTERVAL) {
        weatherData.value = data
        return
      }
    } catch (err) {
      console.error('读取天气缓存失败:', err)
    }
  }

  // 没有缓存或缓存过期，获取新数据
  fetchWeatherData()
}

// 🔧 优化定时器管理，防止重复创建
onMounted(() => {
  initWeatherData()

  // 🔧 使用全局定时器管理器，防止多个组件实例创建多个定时器
  if (!globalWeatherTimer) {
    console.log('🌤️ [WeatherWidget] 创建全局天气更新定时器')
    globalWeatherTimer = window.setInterval(() => {
      console.log('🌤️ [WeatherWidget] 执行全局天气更新')
      fetchWeatherData()
    }, UPDATE_INTERVAL)
  }

  globalTimerCount++
  updateTimer = globalWeatherTimer
  console.log(`🌤️ [WeatherWidget] 组件挂载，当前定时器引用数: ${globalTimerCount}`)
})

// 组件卸载时清理
onUnmounted(() => {
  globalTimerCount--
  console.log(`🌤️ [WeatherWidget] 组件卸载，剩余定时器引用数: ${globalTimerCount}`)

  // 🔧 只有当所有组件实例都卸载时才清理定时器
  if (globalTimerCount <= 0 && globalWeatherTimer) {
    console.log('🌤️ [WeatherWidget] 清理全局天气更新定时器')
    clearInterval(globalWeatherTimer)
    globalWeatherTimer = null
    globalTimerCount = 0
  }

  updateTimer = null
})
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.weather-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px; // 🔧 与右侧按钮高度保持一致
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color-light);
  cursor: pointer;
  transition: all var(--transition-base);
  min-width: 100px; // 🔧 增加最小宽度
  max-width: 140px; // 🔧 增加最大宽度
  flex-shrink: 0;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--border-color);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.weather-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  width: 100%;
}

.weather-icon {
  flex-shrink: 0;
  color: var(--primary-color);
}

.weather-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
  flex: 1;
}

.temperature {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  white-space: nowrap;
}

.location {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.weather-loading,
.weather-error {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.weather-loading {
  animation: spin 1s linear infinite;
}

.weather-error {
  color: var(--text-disabled);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .weather-widget {
    min-width: 60px;
    max-width: 80px;
    padding: var(--spacing-xs);
  }

  .location {
    display: none; // 移动端隐藏城市名称
  }
}
</style>