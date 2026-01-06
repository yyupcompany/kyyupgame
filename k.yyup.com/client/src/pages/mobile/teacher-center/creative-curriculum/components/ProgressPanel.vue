<template>
  <div class="mobile-progress-panel">
    <!-- 总进度卡片 -->
    <van-cell-group inset class="progress-overview">
      <van-cell :border="false">
        <template #title>
          <div class="progress-header">
            <span class="progress-label">总体进度</span>
            <van-tag :type="progressTagType" size="large">{{ progress }}%</van-tag>
          </div>
        </template>
      </van-cell>
      <van-cell :border="false" class="progress-cell">
        <van-progress
          :percentage="progress"
          :color="progressColor"
          :stroke-width="8"
          track-color="#f5f5f5"
          :show-pivot="false"
        />
      </van-cell>
    </van-cell-group>

    <!-- 当前阶段状态 -->
    <van-cell-group inset class="current-stage">
      <van-cell :border="false">
        <template #title>
          <div class="stage-header">
            <van-icon name="play-circle-o" size="20" :color="progressColor" />
            <span class="stage-text">{{ stage }}</span>
          </div>
        </template>
        <template #right-icon>
          <van-loading v-if="isLoading" size="20px" />
          <van-icon v-else name="success" size="20" :color="progressColor" />
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 阶段步骤列表 -->
    <van-cell-group inset class="stages-list">
      <van-cell title="📋 任务步骤" :border="false" class="list-title" />
      <van-step
        v-for="(stageItem, index) in stages"
        :key="index"
        :class="[
          'stage-step',
          { active: stageItem.active, completed: stageItem.completed }
        ]"
        @click="handleStageClick(stageItem, index)"
      >
        <template #icon>
          <div class="stage-icon">
            <van-icon
              v-if="stageItem.completed"
              name="success"
              size="16"
              color="#52c41a"
            />
            <van-loading
              v-else-if="stageItem.active"
              size="16"
              :color="progressColor"
            />
            <van-icon
              v-else
              name="circle"
              size="16"
              color="#c8c9cc"
            />
          </div>
        </template>
        <template #title>
          <div class="stage-content">
            <div class="stage-name">{{ stageItem.name }}</div>
            <div class="stage-description">{{ stageItem.description }}</div>

            <!-- 当前阶段进度条 -->
            <div v-if="stageItem.active && stageItem.progress > 0" class="stage-progress">
              <van-progress
                :percentage="stageItem.progress"
                :color="progressColor"
                :stroke-width="4"
                track-color="#f0f0f0"
                :show-pivot="false"
              />
              <span class="stage-progress-text">{{ stageItem.progress }}%</span>
            </div>
          </div>
        </template>
      </van-step>
    </van-cell-group>

    <!-- 实时日志 -->
    <van-cell-group v-if="logs.length > 0" inset class="logs-section">
      <van-cell title="📋 实时日志" :border="false" class="list-title">
        <template #right-icon>
          <van-button
            size="mini"
            type="primary"
            plain
            @click="toggleLogsExpand"
            :icon="logsExpanded ? 'arrow-up' : 'arrow-down'"
          >
            {{ logsExpanded ? '收起' : '展开' }}
          </van-button>
        </template>
      </van-cell>

      <van-collapse v-model="logsExpanded" v-if="logsExpanded">
        <van-collapse-item name="logs">
          <div class="logs-list">
            <div
              v-for="log in displayedLogs"
              :key="log.id"
              class="log-item"
              @click="copyLog(log)"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-message">{{ log.message }}</span>
              <van-icon name="copy" size="12" />
            </div>
          </div>

          <!-- 查看更多按钮 -->
          <div v-if="logs.length > logsDisplayLimit" class="logs-more">
            <van-button
              size="small"
              type="default"
              plain
              @click="showAllLogs = !showAllLogs"
            >
              {{ showAllLogs ? '收起日志' : `查看全部 ${logs.length} 条日志` }}
            </van-button>
          </div>
        </van-collapse-item>
      </van-collapse>
    </van-cell-group>

    <!-- 操作按钮 -->
    <van-cell-group inset class="action-buttons">
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item>
          <van-button
            type="primary"
            :loading="isLoading"
            :disabled="isCompleted"
            @click="handleStart"
            block
            icon="play"
          >
            {{ isCompleted ? '已完成' : isLoading ? '处理中...' : '开始' }}
          </van-button>
        </van-grid-item>
        <van-grid-item>
          <van-button
            type="default"
            :disabled="!canPause"
            @click="handlePause"
            block
            icon="pause"
          >
            暂停
          </van-button>
        </van-grid-item>
        <van-grid-item>
          <van-button
            type="warning"
            @click="handleReset"
            block
            icon="replay"
          >
            重置
          </van-button>
        </van-grid-item>
        <van-grid-item>
          <van-button
            type="success"
            :disabled="!isCompleted"
            @click="handleComplete"
            block
            icon="success"
          >
            完成
          </van-button>
        </van-grid-item>
      </van-grid>
    </van-cell-group>

    <!-- 提示信息 -->
    <van-notice-bar
      left-icon="info-o"
      background="#f0f9ff"
      color="#1989fa"
      text="课程生成可能需要2-5分钟，请耐心等待。生成过程中请勿关闭页面。"
      wrapable
    />

    <!-- 性能统计 -->
    <van-cell-group v-if="showStats" inset class="stats-section">
      <van-cell title="📊 性能统计" :border="false" class="list-title" />
      <van-cell title="预计剩余时间" :value="estimatedTime" />
      <van-cell title="处理速度" :value="processingSpeed" />
      <van-cell title="错误次数" :value="errorCount.toString()" />
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showSuccessToast, showFailToast } from 'vant'

interface LogItem {
  id: string | number
  time: string
  message: string
  level?: 'info' | 'warning' | 'error' | 'success'
}

interface StageItem {
  name: string
  description: string
  active: boolean
  completed: boolean
  progress: number
  startTime?: Date
  endTime?: Date
}

interface Props {
  progress: number
  stage: string
  logs?: LogItem[]
  isLoading?: boolean
  showStats?: boolean
  estimatedTime?: string
  processingSpeed?: string
  errorCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
  stage: '初始化中...',
  logs: () => [],
  isLoading: false,
  showStats: false,
  estimatedTime: '计算中...',
  processingSpeed: '0 项/秒',
  errorCount: 0
})

const emit = defineEmits<{
  'start': []
  'pause': []
  'reset': []
  'complete': []
  'stage-click': [stage: StageItem, index: number]
  'log-click': [log: LogItem]
}>()

// 响应式数据
const logs = ref<LogItem[]>(props.logs || [])
const logsExpanded = ref(false)
const showAllLogs = ref(false)
const logsDisplayLimit = 10

// 阶段配置
const stages = ref<StageItem[]>([
  {
    name: '分析需求',
    description: '深度分析课程需求...',
    active: false,
    completed: false,
    progress: 0
  },
  {
    name: '规划课程',
    description: '规划课程结构...',
    active: false,
    completed: false,
    progress: 0
  },
  {
    name: '生成代码',
    description: '生成HTML/CSS/JS代码...',
    active: false,
    completed: false,
    progress: 0
  },
  {
    name: '生成图片',
    description: '生成配套图片...',
    active: false,
    completed: false,
    progress: 0
  },
  {
    name: '整合资源',
    description: '整合所有资源...',
    active: false,
    completed: false,
    progress: 0
  }
])

// 计算属性
const progressColor = computed(() => {
  if (props.progress < 30) return '#ff4d4f'
  if (props.progress < 70) return '#faad14'
  if (props.progress < 100) return '#1890ff'
  return '#52c41a'
})

const progressTagType = computed(() => {
  if (props.progress < 30) return 'danger'
  if (props.progress < 70) return 'warning'
  if (props.progress < 100) return 'primary'
  return 'success'
})

const isCompleted = computed(() => props.progress >= 100)
const canPause = computed(() => props.isLoading && !isCompleted.value)

const displayedLogs = computed(() => {
  const sortedLogs = [...logs.value].reverse()
  if (showAllLogs.value) return sortedLogs
  return sortedLogs.slice(0, logsDisplayLimit)
})

// 监听进度变化，更新阶段状态
watch(() => props.progress, (newProgress) => {
  const stageIndex = Math.min(
    Math.floor((newProgress / 100) * stages.value.length),
    stages.value.length - 1
  )

  stages.value.forEach((stage, index) => {
    if (index < stageIndex) {
      stage.completed = true
      stage.active = false
      stage.progress = 100
      if (!stage.endTime) {
        stage.endTime = new Date()
      }
    } else if (index === stageIndex) {
      stage.active = true
      stage.completed = false
      const stageProgress = ((newProgress % (100 / stages.value.length)) * stages.value.length) / 100
      stage.progress = Math.round(stageProgress * 100)
      if (!stage.startTime) {
        stage.startTime = new Date()
      }
    } else {
      stage.active = false
      stage.completed = false
      stage.progress = 0
    }
  })
})

// 监听日志变化
watch(() => props.logs, (newLogs) => {
  logs.value = newLogs || []
  if (newLogs && newLogs.length > 0 && !logsExpanded.value) {
    logsExpanded.value = true
  }
}, { deep: true })

// 添加日志
function addLog(message: string, level: LogItem['level'] = 'info') {
  const now = new Date()
  const timeString = now.toLocaleTimeString('zh-CN')

  logs.value.push({
    id: Date.now(),
    time: timeString,
    message,
    level
  })

  // 限制日志数量，避免内存泄漏
  if (logs.value.length > 1000) {
    logs.value = logs.value.slice(-500)
  }
}

// 处理阶段点击
function handleStageClick(stage: StageItem, index: number) {
  emit('stage-click', stage, index)
  showToast(`查看阶段: ${stage.name}`)
}

// 复制日志
function copyLog(log: LogItem) {
  const logText = `[${log.time}] ${log.message}`
  navigator.clipboard.writeText(logText).then(() => {
    showToast('日志已复制')
    emit('log-click', log)
  }).catch(() => {
    showFailToast('复制失败')
  })
}

// 切换日志展开状态
function toggleLogsExpand() {
  logsExpanded.value = !logsExpanded.value
}

// 处理开始
function handleStart() {
  if (isCompleted.value) {
    showToast('任务已完成')
    return
  }

  emit('start')
  addLog('开始执行任务...', 'info')
  showToast('任务已开始')
}

// 处理暂停
function handlePause() {
  if (!canPause.value) {
    showToast('当前无法暂停')
    return
  }

  emit('pause')
  addLog('任务已暂停', 'warning')
  showToast('任务已暂停')
}

// 处理重置
function handleReset() {
  emit('reset')
  stages.value.forEach(stage => {
    stage.completed = false
    stage.active = false
    stage.progress = 0
    stage.startTime = undefined
    stage.endTime = undefined
  })
  logs.value = []
  showAllLogs.value = false
  showToast('进度已重置')
}

// 处理完成
function handleComplete() {
  if (!isCompleted.value) {
    showToast('任务尚未完成')
    return
  }

  emit('complete')
  addLog('任务已完成！', 'success')
  showSuccessToast('任务已完成')
}

// 暴露方法给父组件
defineExpose({
  addLog,
  stages,
  logs,
  reset: handleReset,
  complete: handleComplete
})
</script>

<style scoped lang="scss">
.mobile-progress-panel {
  padding: var(--van-padding-sm);
  background: var(--van-background-color);

  .progress-overview {
    margin-bottom: var(--van-padding-md);

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .progress-label {
        font-size: var(--van-font-size-md);
        color: var(--van-text-color-2);
        font-weight: 500;
      }
    }

    .progress-cell {
      padding-top: var(--van-padding-sm);
    }
  }

  .current-stage {
    margin-bottom: var(--van-padding-md);

    .stage-header {
      display: flex;
      align-items: center;
      gap: var(--van-padding-sm);
      font-size: var(--van-font-size-md);
      color: var(--van-text-color-1);
      font-weight: 500;
    }
  }

  .stages-list {
    margin-bottom: var(--van-padding-md);

    .list-title {
      background: var(--van-background-2);
      font-weight: 600;
      font-size: var(--van-font-size-md);
    }

    .stage-step {
      padding: var(--van-padding-md);
      border-left: 3px solid var(--van-border-color);
      transition: all 0.3s ease;
      cursor: pointer;

      &:active {
        background: var(--van-background-2);
      }

      &.active {
        border-left-color: var(--van-primary-color);
        background: rgba(25, 137, 255, 0.05);
      }

      &.completed {
        border-left-color: var(--van-success-color);
        background: rgba(82, 196, 26, 0.05);
      }

      .stage-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--van-background-1);
      }

      .stage-content {
        flex: 1;

        .stage-name {
          font-size: var(--van-font-size-md);
          color: var(--van-text-color-1);
          font-weight: 500;
          margin-bottom: 2px;
        }

        .stage-description {
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color-3);
          margin-bottom: var(--van-padding-xs);
        }

        .stage-progress {
          display: flex;
          align-items: center;
          gap: var(--van-padding-xs);
          margin-top: var(--van-padding-xs);

          .stage-progress-text {
            font-size: var(--van-font-size-xs);
            color: var(--van-text-color-2);
            min-width: 32px;
          }
        }
      }
    }
  }

  .logs-section {
    margin-bottom: var(--van-padding-md);

    .list-title {
      background: var(--van-background-2);
      font-weight: 600;
      font-size: var(--van-font-size-md);
    }

    .logs-list {
      max-height: 200px;
      overflow-y: auto;

      .log-item {
        display: flex;
        align-items: center;
        gap: var(--van-padding-sm);
        padding: var(--van-padding-xs) var(--van-padding-sm);
        border-bottom: 1px solid var(--van-border-color);
        cursor: pointer;
        font-size: var(--van-font-size-xs);
        transition: background-color 0.2s ease;

        &:hover {
          background: var(--van-background-2);
        }

        &:last-child {
          border-bottom: none;
        }

        .log-time {
          color: var(--van-text-color-3);
          font-family: monospace;
          min-width: 60px;
        }

        .log-message {
          flex: 1;
          color: var(--van-text-color-1);
          word-break: break-all;
        }

        .van-icon {
          color: var(--van-text-color-3);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        &:hover .van-icon {
          opacity: 1;
        }
      }
    }

    .logs-more {
      padding: var(--van-padding-sm);
      text-align: center;
      border-top: 1px solid var(--van-border-color);
    }
  }

  .action-buttons {
    margin-bottom: var(--van-padding-md);

    :deep(.van-grid) {
      .van-grid-item {
        padding: var(--van-padding-xs);

        .van-button {
          height: 40px;
          font-size: var(--van-font-size-sm);
        }
      }
    }
  }

  .stats-section {
    .list-title {
      background: var(--van-background-2);
      font-weight: 600;
      font-size: var(--van-font-size-md);
    }
  }
}

// 响应式适配
@media (max-width: var(--breakpoint-xs)) {
  .mobile-progress-panel {
    padding: var(--van-padding-xs);

    .stages-list {
      .stage-step {
        padding: var(--van-padding-sm);

        .stage-content {
          .stage-name {
            font-size: var(--van-font-size-sm);
          }

          .stage-description {
            font-size: var(--van-font-size-xs);
          }
        }
      }
    }

    .action-buttons {
      :deep(.van-grid) {
        .van-grid-item {
          .van-button {
            height: 36px;
            font-size: var(--van-font-size-xs);
            padding: 0 var(--van-padding-xs);
          }
        }
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .mobile-progress-panel {
    background: var(--van-background-2);

    .stages-list {
      .stage-step {
        &.active {
          background: rgba(25, 137, 255, 0.1);
        }

        &.completed {
          background: rgba(82, 196, 26, 0.1);
        }
      }
    }
  }
}
</style>