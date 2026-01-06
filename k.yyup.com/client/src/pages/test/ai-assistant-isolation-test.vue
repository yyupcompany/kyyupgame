<!--
  AI助手功能隔离性测试页面
  用于测试 sidebar 和 fullpage 两个模式的完全隔离性
-->

<template>
  <div class="ai-assistant-isolation-test">
    <h1>🧪 AI助手功能隔离性测试</h1>

    <div class="test-container">
      <!-- 侧边栏模式测试区域 -->
      <div class="test-section sidebar-section">
        <h2>📱 侧边栏模式测试</h2>
        <div class="controls">
          <el-button @click="toggleSidebar" type="primary">
            {{ sidebarVisible ? '隐藏' : '显示' }}侧边栏
          </el-button>
          <el-button @click="clearSidebarMessages" type="warning">
            清空侧边栏消息
          </el-button>
        </div>

        <div class="status">
          <p>状态: {{ sidebarVisible ? '显示' : '隐藏' }}</p>
          <p>消息数量: {{ sidebarMessageCount }}</p>
          <p>最后消息: {{ sidebarLastMessage }}</p>
        </div>

        <!-- 侧边栏模式组件 -->
        <AIAssistant
          v-model:visible="sidebarVisible"
          mode="sidebar"
        />
      </div>

      <!-- 全屏模式测试区域 -->
      <div class="test-section fullpage-section">
        <h2>🖥️ 全屏模式测试</h2>
        <div class="controls">
          <el-button @click="toggleFullPage" type="success">
            {{ fullpageVisible ? '隐藏' : '显示' }}全屏
          </el-button>
          <el-button @click="clearFullPageMessages" type="warning">
            清空全屏消息
          </el-button>
        </div>

        <div class="status">
          <p>状态: {{ fullpageVisible ? '显示' : '隐藏' }}</p>
          <p>消息数量: {{ fullpageMessageCount }}</p>
          <p>最后消息: {{ fullpageLastMessage }}</p>
        </div>

        <!-- 全屏模式组件 -->
        <AIAssistant
          v-model:visible="fullpageVisible"
          mode="fullpage"
        />
      </div>
    </div>

    <!-- 隔离性验证结果 -->
    <div class="isolation-results">
      <h3>🔍 隔离性验证结果</h3>
      <el-alert
        v-if="isIsolationWorking"
        title="✅ 功能隔离正常"
        type="success"
        description="侧边栏和全屏模式的状态完全独立，互不影响"
        show-icon
        :closable="false"
      />
      <el-alert
        v-else
        title="❌ 功能隔离异常"
        type="error"
        description="两个模式之间存在状态污染或相互影响"
        show-icon
        :closable="false"
      />
    </div>

    <!-- 测试日志 -->
    <div class="test-logs">
      <h3>📝 测试日志</h3>
      <div class="log-container">
        <div
          v-for="(log, index) in testLogs"
          :key="index"
          class="log-item"
          :class="log.type"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-content">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import AIAssistant from '@/components/ai-assistant/AIAssistant.vue'

// 状态管理
const sidebarVisible = ref(false)
const fullpageVisible = ref(false)
const sidebarMessages = ref<string[]>([])
const fullpageMessages = ref<string[]>([])
const testLogs = ref<Array<{
  time: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}>>([])

// 计算属性
const sidebarMessageCount = computed(() => sidebarMessages.value.length)
const fullpageMessageCount = computed(() => fullpageMessages.value.length)
const sidebarLastMessage = computed(() =>
  sidebarMessages.value[sidebarMessages.value.length - 1] || '无'
)
const fullpageLastMessage = computed(() =>
  fullpageMessages.value[fullpageMessages.value.length - 1] || '无'
)

const isIsolationWorking = computed(() => {
  // 简单的隔离性检查：两个模式的消息不应该相同
  return sidebarLastMessage.value !== fullpageLastMessage.value ||
         sidebarMessageCount.value !== fullpageMessageCount.value
})

// 方法
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
  addLog(`侧边栏模式${sidebarVisible.value ? '显示' : '隐藏'}`, 'info')
}

const toggleFullPage = () => {
  fullpageVisible.value = !fullpageVisible.value
  addLog(`全屏模式${fullpageVisible.value ? '显示' : '隐藏'}`, 'info')
}

const clearSidebarMessages = () => {
  sidebarMessages.value = []
  addLog('清空侧边栏消息', 'warning')
}

const clearFullPageMessages = () => {
  fullpageMessages.value = []
  addLog('清空全屏消息', 'warning')
}

const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  testLogs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })

  // 限制日志数量
  if (testLogs.value.length > 20) {
    testLogs.value = testLogs.value.slice(0, 20)
  }
}

// 监听控制台日志，用于验证隔离性
const originalConsoleLog = console.log
onMounted(() => {
  // 拦截控制台日志来监控两个模式的行为
  console.log = (...args) => {
    const message = args.join(' ')

    if (message.includes('sidebar模式')) {
      const match = message.match(/响应内容[:：]\s*(.+)/)
      if (match) {
        sidebarMessages.value.push(match[1].trim())
      }
      addLog(`侧边栏: ${message}`, 'success')
    } else if (message.includes('fullpage模式')) {
      const match = message.match(/响应内容[:：]\s*(.+)/)
      if (match) {
        fullpageMessages.value.push(match[1].trim())
      }
      addLog(`全屏: ${message}`, 'info')
    }

    originalConsoleLog(...args)
  }

  addLog('AI助手隔离性测试开始', 'success')
})
</script>

<style scoped>
.ai-assistant-isolation-test {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.test-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
}

.test-section {
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: var(--spacing-lg);
  background: #f8f9fa;
}

.sidebar-section {
  border-color: #409eff;
}

.fullpage-section {
  border-color: #67c23a;
}

.controls {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.status {
  background: white;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: var(--text-sm);
}

.status p {
  margin: 5px 0;
}

.isolation-results {
  margin: var(--spacing-lg) 0;
}

.test-logs {
  margin-top: 20px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  background: #f5f5f5;
}

.log-item {
  padding: var(--spacing-sm) 12px;
  border-bottom: 1px solid #e1e5e9;
  display: flex;
  align-items: center;
  gap: 10px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  font-family: monospace;
  color: #666;
  font-size: var(--text-xs);
  min-width: 80px;
}

.log-content {
  flex: 1;
}

.log-item.success {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.log-item.info {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

.log-item.warning {
  background: rgba(230, 162, 60, 0.1);
  color: #e6a23c;
}

.log-item.error {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

@media (max-width: var(--breakpoint-md)) {
  .test-container {
    grid-template-columns: 1fr;
  }
}
</style>