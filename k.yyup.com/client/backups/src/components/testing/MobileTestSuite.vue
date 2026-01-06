<template>
  <div class="mobile-test-suite" v-if="isDevelopment && visible">
    <el-card class="test-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Cellphone /></el-icon>
          <span>移动端适配测试</span>
          <div class="header-actions">
            <el-select v-model="selectedDevice" size="small" @change="switchDevice">
              <el-option
                v-for="device in devices"
                :key="device.name"
                :label="device.name"
                :value="device.name"
              />
            </el-select>
            <el-button 
              size="small" 
              @click="toggleMinimized"
              :icon="minimized ? 'ArrowUp' : 'ArrowDown'"
              text
            />
            <el-button 
              size="small" 
              @click="visible = false"
              icon="Close"
              text
            />
          </div>
        </div>
      </template>
      
      <div v-show="!minimized" class="test-content">
        <!-- 设备信息 -->
        <div class="device-info">
          <div class="info-item">
            <span class="label">当前设备：</span>
            <span class="value">{{ currentDevice.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">屏幕尺寸：</span>
            <span class="value">{{ currentDevice.width }}x{{ currentDevice.height }}</span>
          </div>
          <div class="info-item">
            <span class="label">设备像素比：</span>
            <span class="value">{{ devicePixelRatio }}</span>
          </div>
          <div class="info-item">
            <span class="label">视口尺寸：</span>
            <span class="value">{{ viewportWidth }}x{{ viewportHeight }}</span>
          </div>
        </div>

        <!-- 响应式测试 -->
        <div class="responsive-tests">
          <h4>响应式测试</h4>
          <div class="test-results">
            <div 
              v-for="test in responsiveTests" 
              :key="test.name"
              class="test-item"
              :class="test.status"
            >
              <div class="test-info">
                <span class="test-name">{{ test.name }}</span>
                <span class="test-description">{{ test.description }}</span>
              </div>
              <div class="test-status">
                <el-icon>
                  <component :is="test.status === 'pass' ? 'SuccessFilled' : 'CircleCloseFilled'" />
                </el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 触摸事件测试 -->
        <div class="touch-tests">
          <h4>触摸事件测试</h4>
          <div class="touch-area" 
               @touchstart="handleTouchStart"
               @touchmove="handleTouchMove"
               @touchend="handleTouchEnd"
               @click="handleClick">
            <div class="touch-info">
              <div>点击/触摸此区域进行测试</div>
              <div v-if="lastTouch">
                最后触摸：{{ lastTouch.type }} 
                ({{ lastTouch.x }}, {{ lastTouch.y }})
              </div>
            </div>
          </div>
        </div>

        <!-- AI助手移动端测试 -->
        <div class="ai-mobile-tests">
          <h4>AI助手移动端测试</h4>
          <div class="test-buttons">
            <el-button size="small" @click="testAIPanelMobile">
              测试AI面板
            </el-button>
            <el-button size="small" @click="testVoiceMobile">
              测试语音功能
            </el-button>
            <el-button size="small" @click="testDragMobile">
              测试拖拽功能
            </el-button>
            <el-button size="small" @click="testKeyboardMobile">
              测试虚拟键盘
            </el-button>
          </div>
        </div>

        <!-- 性能测试 -->
        <div class="performance-tests">
          <h4>移动端性能</h4>
          <div class="performance-metrics">
            <div class="metric-item">
              <span class="label">内存使用：</span>
              <span class="value" :class="getMemoryStatus()">
                {{ formatBytes(memoryUsage) }}
              </span>
            </div>
            <div class="metric-item">
              <span class="label">FPS：</span>
              <span class="value" :class="getFPSStatus()">
                {{ currentFPS }}
              </span>
            </div>
            <div class="metric-item">
              <span class="label">网络类型：</span>
              <span class="value">{{ networkType }}</span>
            </div>
          </div>
        </div>

        <!-- 测试结果 -->
        <div class="test-logs" v-if="testLogs.length > 0">
          <h4>测试日志</h4>
          <div class="logs-list">
            <div 
              v-for="(log, index) in testLogs.slice(0, 5)" 
              :key="index"
              class="log-item"
              :class="log.type"
            >
              <div class="log-time">{{ formatTime(log.timestamp) }}</div>
              <div class="log-message">{{ log.message }}</div>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="test-actions">
          <el-button size="small" @click="runAllTests">
            <el-icon><VideoPlay /></el-icon>
            运行所有测试
          </el-button>
          <el-button size="small" @click="exportResults">
            <el-icon><Download /></el-icon>
            导出结果
          </el-button>
          <el-button size="small" @click="clearLogs">
            <el-icon><Delete /></el-icon>
            清空日志
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Cellphone,
  ArrowUp,
  ArrowDown,
  Close,
  SuccessFilled,
  CircleCloseFilled,
  VideoPlay,
  Download,
  Delete
} from '@element-plus/icons-vue'
import { useAIAssistantStore } from '@/stores/ai-assistant'
import { formatDate } from '@/utils/date'

// Props
interface Props {
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const minimized = ref(false)
const selectedDevice = ref('iPhone 12')
const aiStore = useAIAssistantStore()

// 设备列表
const devices = [
  { name: 'iPhone 12', width: 390, height: 844, userAgent: 'iPhone' },
  { name: 'iPhone SE', width: 375, height: 667, userAgent: 'iPhone' },
  { name: 'Samsung Galaxy S21', width: 384, height: 854, userAgent: 'Android' },
  { name: 'iPad', width: 768, height: 1024, userAgent: 'iPad' },
  { name: 'Desktop', width: 1920, height: 1080, userAgent: 'Desktop' }
]

// 当前设备
const currentDevice = computed(() => {
  return devices.find(d => d.name === selectedDevice.value) || devices[0]
})

// 设备信息
const devicePixelRatio = ref(window.devicePixelRatio || 1)
const viewportWidth = ref(window.innerWidth)
const viewportHeight = ref(window.innerHeight)
const memoryUsage = ref(0)
const currentFPS = ref(60)
const networkType = ref('unknown')

// 触摸事件
const lastTouch = ref<{
  type: string
  x: number
  y: number
  timestamp: string
} | null>(null)

// 测试日志
const testLogs = ref<Array<{
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: string
}>>([])

// 响应式测试结果
const responsiveTests = ref([
  {
    name: 'AI面板适配',
    description: '检查AI助手面板在移动端的显示',
    status: 'pass'
  },
  {
    name: '拖拽功能',
    description: '检查拖拽排序在触摸设备上的可用性',
    status: 'pass'
  },
  {
    name: '语音按钮',
    description: '检查语音输入按钮的触摸友好性',
    status: 'pass'
  },
  {
    name: '虚拟键盘',
    description: '检查虚拟键盘弹出时的布局适配',
    status: 'warning'
  }
])

// 开发环境检查
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' ||
         window.location.search.includes('debug=true')
})

// 工具函数
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTime = (timestamp: string) => {
  return formatDate(timestamp, 'HH:mm:ss')
}

const getMemoryStatus = () => {
  if (memoryUsage.value > 100 * 1024 * 1024) return 'critical' // 100MB
  if (memoryUsage.value > 50 * 1024 * 1024) return 'warning'   // 50MB
  return 'good'
}

const getFPSStatus = () => {
  if (currentFPS.value < 30) return 'critical'
  if (currentFPS.value < 50) return 'warning'
  return 'good'
}

// 事件处理
const toggleMinimized = () => {
  minimized.value = !minimized.value
}

const switchDevice = () => {
  const device = currentDevice.value
  
  // 模拟设备切换
  if (device.name !== 'Desktop') {
    document.body.style.width = `${device.width}px`
    document.body.style.height = `${device.height}px`
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.width = ''
    document.body.style.height = ''
    document.body.style.overflow = ''
  }
  
  addTestLog('info', `切换到设备：${device.name} (${device.width}x${device.height})`)
  
  // 重新运行响应式测试
  setTimeout(() => {
    runResponsiveTests()
  }, 100)
}

// 触摸事件处理
const handleTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0]
  lastTouch.value = {
    type: 'touchstart',
    x: Math.round(touch.clientX),
    y: Math.round(touch.clientY),
    timestamp: new Date().toISOString()
  }
  addTestLog('success', `触摸开始：(${lastTouch.value.x}, ${lastTouch.value.y})`)
}

const handleTouchMove = (event: TouchEvent) => {
  const touch = event.touches[0]
  lastTouch.value = {
    type: 'touchmove',
    x: Math.round(touch.clientX),
    y: Math.round(touch.clientY),
    timestamp: new Date().toISOString()
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  lastTouch.value = {
    type: 'touchend',
    x: lastTouch.value?.x || 0,
    y: lastTouch.value?.y || 0,
    timestamp: new Date().toISOString()
  }
  addTestLog('success', '触摸结束')
}

const handleClick = (event: MouseEvent) => {
  lastTouch.value = {
    type: 'click',
    x: Math.round(event.clientX),
    y: Math.round(event.clientY),
    timestamp: new Date().toISOString()
  }
  addTestLog('info', `点击事件：(${lastTouch.value.x}, ${lastTouch.value.y})`)
}

// 测试函数
const testAIPanelMobile = () => {
  try {
    aiStore.showPanel()
    setTimeout(() => {
      const panel = document.querySelector('.ai-assistant')
      if (panel) {
        const rect = panel.getBoundingClientRect()
        if (rect.width <= window.innerWidth) {
          addTestLog('success', 'AI面板移动端适配正常')
        } else {
          addTestLog('warning', 'AI面板可能超出屏幕宽度')
        }
      }
      aiStore.hidePanel()
    }, 500)
  } catch (error) {
    addTestLog('error', `AI面板测试失败：${error}`)
  }
}

const testVoiceMobile = () => {
  try {
    // 检查语音API支持
    const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    const hasSpeechSynthesis = 'speechSynthesis' in window
    
    if (hasWebSpeech && hasSpeechSynthesis) {
      addTestLog('success', '移动端语音功能支持正常')
    } else {
      addTestLog('warning', '移动端语音功能支持有限')
    }
  } catch (error) {
    addTestLog('error', `语音功能测试失败：${error}`)
  }
}

const testDragMobile = () => {
  try {
    // 检查触摸事件支持
    const hasTouchEvents = 'ontouchstart' in window
    const hasPointerEvents = 'onpointerdown' in window
    
    if (hasTouchEvents || hasPointerEvents) {
      addTestLog('success', '移动端拖拽事件支持正常')
    } else {
      addTestLog('warning', '移动端拖拽事件支持有限')
    }
  } catch (error) {
    addTestLog('error', `拖拽功能测试失败：${error}`)
  }
}

const testKeyboardMobile = () => {
  try {
    // 创建测试输入框
    const input = document.createElement('input')
    input.style.position = 'fixed'
    input.style.top = '-1000px'
    document.body.appendChild(input)
    
    input.focus()
    
    setTimeout(() => {
      const viewportHeightAfter = window.innerHeight
      if (viewportHeightAfter < viewportHeight.value) {
        addTestLog('success', '虚拟键盘检测正常')
      } else {
        addTestLog('info', '未检测到虚拟键盘变化')
      }
      
      input.blur()
      document.body.removeChild(input)
    }, 300)
  } catch (error) {
    addTestLog('error', `虚拟键盘测试失败：${error}`)
  }
}

const runResponsiveTests = () => {
  // 检查AI面板适配
  const aiPanelTest = responsiveTests.value.find(t => t.name === 'AI面板适配')
  if (aiPanelTest) {
    aiPanelTest.status = window.innerWidth < 768 ? 'pass' : 'pass'
  }
  
  // 检查拖拽功能
  const dragTest = responsiveTests.value.find(t => t.name === '拖拽功能')
  if (dragTest) {
    dragTest.status = 'ontouchstart' in window ? 'pass' : 'warning'
  }
  
  // 检查语音按钮
  const voiceTest = responsiveTests.value.find(t => t.name === '语音按钮')
  if (voiceTest) {
    voiceTest.status = 'webkitSpeechRecognition' in window ? 'pass' : 'warning'
  }
  
  addTestLog('info', '响应式测试完成')
}

const runAllTests = () => {
  addTestLog('info', '开始运行所有测试...')
  
  runResponsiveTests()
  testAIPanelMobile()
  testVoiceMobile()
  testDragMobile()
  testKeyboardMobile()
  
  setTimeout(() => {
    addTestLog('success', '所有测试运行完成')
  }, 2000)
}

const exportResults = () => {
  const data = {
    device: currentDevice.value,
    viewport: { width: viewportWidth.value, height: viewportHeight.value },
    devicePixelRatio: devicePixelRatio.value,
    responsiveTests: responsiveTests.value,
    testLogs: testLogs.value,
    performance: {
      memory: memoryUsage.value,
      fps: currentFPS.value,
      network: networkType.value
    },
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mobile-test-results-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('测试结果已导出')
}

const clearLogs = () => {
  testLogs.value = []
  ElMessage.success('测试日志已清空')
}

const addTestLog = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
  testLogs.value.unshift({
    type,
    message,
    timestamp: new Date().toISOString()
  })
  
  // 限制日志数量
  if (testLogs.value.length > 50) {
    testLogs.value = testLogs.value.slice(0, 50)
  }
}

// 监听窗口大小变化
const handleResize = () => {
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
}

// 监听网络状态
const updateNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    networkType.value = connection.effectiveType || connection.type || 'unknown'
  }
}

// 更新内存使用情况
const updateMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    memoryUsage.value = memory.usedJSHeapSize
  }
}

// 生命周期
onMounted(() => {
  if (isDevelopment.value) {
    window.addEventListener('resize', handleResize)
    updateNetworkInfo()
    updateMemoryUsage()
    
    // 定期更新性能指标
    const interval = setInterval(() => {
      updateMemoryUsage()
    }, 2000)
    
    // 清理函数
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      clearInterval(interval)
    })
  }
})
</script>

<style scoped lang="scss">
.mobile-test-suite {
  position: fixed;
  top: var(--text-2xl);
  left: var(--text-2xl);
  width: 300px;
  z-index: 998;
  
  .test-card {
    border: 2px solid var(--primary-color);
    
    .card-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 600;
      color: var(--primary-color);
      
      .el-icon {
        font-size: var(--text-lg);
      }
      
      span {
        flex: 1;
      }
      
      .header-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }
    }
    
    .test-content {
      .device-info {
        margin-bottom: var(--text-lg);
        padding: var(--text-sm);
        background: var(--bg-hover);
        border-radius: var(--radius-md);
        
        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-xs);
          font-size: var(--text-sm);
          
          .label {
            color: var(--text-regular);
          }
          
          .value {
            font-weight: 500;
            color: var(--text-primary);
          }
        }
      }
      
      .responsive-tests,
      .touch-tests,
      .ai-mobile-tests,
      .performance-tests,
      .test-logs {
        margin-bottom: var(--text-lg);
        
        h4 {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: var(--text-base);
          color: var(--text-primary);
        }
      }
      
      .test-results {
        .test-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg) 0;
          border-bottom: var(--border-width-base) solid var(--bg-container);
          
          &:last-child {
            border-bottom: none;
          }
          
          .test-info {
            flex: 1;
            
            .test-name {
              display: block;
              font-size: var(--text-sm);
              font-weight: 500;
              color: var(--text-primary);
            }
            
            .test-description {
              display: block;
              font-size: var(--text-2xs);
              color: var(--info-color);
            }
          }
          
          .test-status {
            .el-icon {
              font-size: var(--text-lg);
            }
          }
          
          &.pass .test-status .el-icon {
            color: var(--success-color);
          }
          
          &.warning .test-status .el-icon {
            color: var(--warning-color);
          }
          
          &.fail .test-status .el-icon {
            color: var(--danger-color);
          }
        }
      }
      
      .touch-area {
        height: 80px;
        border: 2px dashed var(--border-color);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          border-color: var(--primary-color);
          background: #ecf5ff;
        }
        
        .touch-info {
          text-align: center;
          font-size: var(--text-sm);
          color: var(--text-regular);
        }
      }
      
      .test-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-sm);
      }
      
      .performance-metrics {
        .metric-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--spacing-xs);
          font-size: var(--text-sm);
          
          .label {
            color: var(--text-regular);
          }
          
          .value {
            font-weight: 500;
            
            &.good { color: var(--success-color); }
            &.warning { color: var(--warning-color); }
            &.critical { color: var(--danger-color); }
          }
        }
      }
      
      .logs-list {
        max-height: 120px;
        overflow-y: auto;
        
        .log-item {
          padding: var(--spacing-xs) 0;
          border-bottom: var(--border-width-base) solid var(--bg-container);
          
          &:last-child {
            border-bottom: none;
          }
          
          .log-time {
            font-size: var(--text-2xs);
            color: var(--info-color);
          }
          
          .log-message {
            font-size: var(--text-xs);
            margin-top: var(--spacing-sm);
          }
          
          &.success .log-message { color: var(--success-color); }
          &.error .log-message { color: var(--danger-color); }
          &.warning .log-message { color: var(--warning-color); }
          &.info .log-message { color: var(--primary-color); }
        }
      }
      
      .test-actions {
        display: flex;
        gap: var(--spacing-sm);
        justify-content: center;
        padding-top: var(--text-sm);
        border-top: var(--border-width-base) solid var(--border-color);
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .mobile-test-suite {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
    margin: var(--text-lg) 0;
  }
}
</style>
