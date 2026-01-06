<template>
  <div class="draggable-resizable-qr" ref="containerRef">
    <!-- 海报主体 -->
    <div class="poster-main">
      <PosterPreview
        :content="posterContent"
        :theme="currentTheme"
        :schoolName="kindergartenInfo.name"
        :logoUrl="kindergartenInfo.logoUrl"
        :phone="kindergartenInfo.phone"
        :address="kindergartenInfo.address"
        :showQR="false"
        :marketingConfig="marketingConfig"
      />
    </div>
    
    <!-- 可拖拽缩放的二维码 -->
    <div
      v-if="qrcodeUrl"
      class="draggable-qr-container"
      :class="{ 'dragging': isDragging, 'resizing': isResizing }"
      :style="{
        position: 'absolute',
        left: qrPosition.x + 'px',
        top: qrPosition.y + 'px',
        width: qrSize.width + 'px',
        height: qrSize.height + 'px',
        transform: `scale(${qrScale})`,
        zIndex: 10
      }"
      @mousedown="startDrag"
    >
      <!-- 二维码主体 -->
      <div class="qr-content">
        <img :src="qrcodeUrl" alt="活动二维码" class="qr-image" />
        <div class="qr-label">{{ qrLabel }}</div>
      </div>
      
      <!-- 拖拽手柄 -->
      <div class="drag-handle" title="拖拽移动二维码">
        <span>⋮⋮</span>
      </div>
      
      <!-- 缩放控制点 -->
      <div class="resize-handles">
        <div class="resize-handle nw" @mousedown.stop="startResize('nw')"></div>
        <div class="resize-handle ne" @mousedown.stop="startResize('ne')"></div>
        <div class="resize-handle sw" @mousedown.stop="startResize('sw')"></div>
        <div class="resize-handle se" @mousedown.stop="startResize('se')"></div>
      </div>
      
      <!-- 缩放滑块 -->
      <div class="scale-control" v-if="showScaleControl">
        <el-slider
          v-model="qrScale"
          :min="0.5"
          :max="2"
          :step="0.1"
          size="small"
          @change="onScaleChange"
        />
        <span class="scale-text">{{ Math.round(qrScale * 100) }}%</span>
      </div>
    </div>
    
    <!-- 控制面板 -->
    <div class="qr-controls" v-if="showControls">
      <div class="control-header">
        <h4>二维码设置</h4>
        <el-button @click="toggleControls" size="small" text>
          {{ showControls ? '隐藏' : '显示' }}
        </el-button>
      </div>
      
      <div class="control-group">
        <label>标签文字：</label>
        <el-input v-model="qrLabel" size="small" style="width: 120px;" />
      </div>
      
      <div class="control-group">
        <label>快捷位置：</label>
        <el-button-group size="small">
          <el-button @click="setPosition('top-left')" plain>左上</el-button>
          <el-button @click="setPosition('top-right')" plain>右上</el-button>
          <el-button @click="setPosition('bottom-left')" plain>左下</el-button>
          <el-button @click="setPosition('bottom-right')" plain>右下</el-button>
        </el-button-group>
      </div>
      
      <div class="control-group">
        <label>快捷大小：</label>
        <el-button-group size="small">
          <el-button @click="setSize('small')" plain>小</el-button>
          <el-button @click="setSize('medium')" plain>中</el-button>
          <el-button @click="setSize('large')" plain>大</el-button>
        </el-button-group>
      </div>
      
      <div class="control-group">
        <el-button @click="resetQRPosition" size="small" type="primary" plain>
          🔄 重置位置
        </el-button>
        <el-button @click="toggleScaleControl" size="small" plain>
          {{ showScaleControl ? '隐藏' : '显示' }}缩放
        </el-button>
      </div>
    </div>
    
    <!-- 操作提示 -->
    <div class="operation-tips" v-if="showTips">
      <div class="tip-item">💡 拖拽二维码可移动位置</div>
      <div class="tip-item">💡 拖拽四角可调整大小</div>
      <div class="tip-item">💡 使用右侧控制面板快速设置</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import PosterPreview from './PosterPreview.vue'

// Props
interface Props {
  posterContent: string
  currentTheme: string
  kindergartenInfo: any
  marketingConfig: any
  qrcodeUrl: string
  showControls?: boolean
  showTips?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showControls: true,
  showTips: true
})

// Emits
const emit = defineEmits<{
  'qr-position-change': [position: { x: number, y: number }]
  'qr-size-change': [size: { width: number, height: number }]
  'qr-scale-change': [scale: number]
}>()

// 容器引用
const containerRef = ref<HTMLElement>()

// 二维码状态
const qrPosition = reactive({ x: 300, y: 50 })
const qrSize = reactive({ width: 150, height: 150 })
const qrScale = ref(1)
const qrLabel = ref('扫码报名')
const showControls = ref(props.showControls)
const showScaleControl = ref(false)

// 拖拽状态
const isDragging = ref(false)
const dragStart = reactive({ x: 0, y: 0 })
const dragOffset = reactive({ x: 0, y: 0 })

// 缩放状态
const isResizing = ref(false)
const resizeType = ref('')
const resizeStart = reactive({ x: 0, y: 0, width: 0, height: 0 })

// 拖拽功能
const startDrag = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('qr-content') || 
      target.classList.contains('qr-image') ||
      target.classList.contains('qr-label') ||
      target.classList.contains('drag-handle') ||
      target.closest('.drag-handle')) {
    
    isDragging.value = true
    dragStart.x = event.clientX
    dragStart.y = event.clientY
    dragOffset.x = qrPosition.x
    dragOffset.y = qrPosition.y
    
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    event.preventDefault()
  }
}

const handleDragMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - dragStart.x
  const deltaY = event.clientY - dragStart.y
  
  // 限制在容器范围内
  const container = containerRef.value
  if (container) {
    const containerRect = container.getBoundingClientRect()
    const maxX = containerRect.width - qrSize.width * qrScale.value
    const maxY = containerRect.height - qrSize.height * qrScale.value
    
    qrPosition.x = Math.max(0, Math.min(maxX, dragOffset.x + deltaX))
    qrPosition.y = Math.max(0, Math.min(maxY, dragOffset.y + deltaY))
    
    emit('qr-position-change', { x: qrPosition.x, y: qrPosition.y })
  }
}

const handleDragEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}

// 缩放功能
const startResize = (type: string) => {
  isResizing.value = true
  resizeType.value = type
  resizeStart.width = qrSize.width
  resizeStart.height = qrSize.height
  resizeStart.x = qrPosition.x
  resizeStart.y = qrPosition.y
  
  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
}

const handleResizeMove = (event: MouseEvent) => {
  if (!isResizing.value) return
  
  const deltaX = event.clientX - resizeStart.x
  const deltaY = event.clientY - resizeStart.y
  
  switch (resizeType.value) {
    case 'se': // 右下角
      qrSize.width = Math.max(80, resizeStart.width + deltaX)
      qrSize.height = Math.max(80, resizeStart.height + deltaY)
      break
    case 'sw': // 左下角
      qrSize.width = Math.max(80, resizeStart.width - deltaX)
      qrSize.height = Math.max(80, resizeStart.height - deltaY)
      qrPosition.x = resizeStart.x + deltaX
      break
    case 'ne': // 右上角
      qrSize.width = Math.max(80, resizeStart.width + deltaX)
      qrSize.height = Math.max(80, resizeStart.height - deltaY)
      qrPosition.y = resizeStart.y + deltaY
      break
    case 'nw': // 左上角
      qrSize.width = Math.max(80, resizeStart.width - deltaX)
      qrSize.height = Math.max(80, resizeStart.height - deltaY)
      qrPosition.x = resizeStart.x + deltaX
      qrPosition.y = resizeStart.y + deltaY
      break
  }
  
  emit('qr-size-change', { width: qrSize.width, height: qrSize.height })
}

const handleResizeEnd = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
}

// 快捷位置设置
const setPosition = (position: string) => {
  const container = containerRef.value
  if (!container) return
  
  const containerRect = container.getBoundingClientRect()
  const margin = 20
  
  switch (position) {
    case 'top-left':
      qrPosition.x = margin
      qrPosition.y = margin
      break
    case 'top-right':
      qrPosition.x = containerRect.width - qrSize.width * qrScale.value - margin
      qrPosition.y = margin
      break
    case 'bottom-left':
      qrPosition.x = margin
      qrPosition.y = containerRect.height - qrSize.height * qrScale.value - margin
      break
    case 'bottom-right':
      qrPosition.x = containerRect.width - qrSize.width * qrScale.value - margin
      qrPosition.y = containerRect.height - qrSize.height * qrScale.value - margin
      break
  }
  
  emit('qr-position-change', { x: qrPosition.x, y: qrPosition.y })
}

// 快捷大小设置
const setSize = (size: string) => {
  switch (size) {
    case 'small':
      qrSize.width = 100
      qrSize.height = 100
      break
    case 'medium':
      qrSize.width = 150
      qrSize.height = 150
      break
    case 'large':
      qrSize.width = 200
      qrSize.height = 200
      break
  }
  
  emit('qr-size-change', { width: qrSize.width, height: qrSize.height })
}

// 重置位置
const resetQRPosition = () => {
  qrPosition.x = 300
  qrPosition.y = 50
  qrSize.width = 150
  qrSize.height = 150
  qrScale.value = 1
  
  emit('qr-position-change', { x: qrPosition.x, y: qrPosition.y })
  emit('qr-size-change', { width: qrSize.width, height: qrSize.height })
  emit('qr-scale-change', qrScale.value)
}

// 缩放变化处理
const onScaleChange = (value: number) => {
  qrScale.value = value
  emit('qr-scale-change', value)
}

// 切换控制面板
const toggleControls = () => {
  showControls.value = !showControls.value
}

// 切换缩放控制
const toggleScaleControl = () => {
  showScaleControl.value = !showScaleControl.value
}

// 生命周期
onMounted(() => {
  // 初始化二维码位置到右上角
  nextTick(() => {
    setPosition('top-right')
  })
})

onUnmounted(() => {
  // 清理事件监听器
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
})
</script>

<style lang="scss" scoped>
.draggable-resizable-qr {
  position: relative;
  width: 100%;
  height: 600px;
  background: linear-gradient(135deg, var(--bg-container) 0%, #c3cfe2 100%);
  border-radius: var(--text-sm);
  overflow: hidden;

  .poster-main {
    width: 100%;
    height: 100%;
  }

  .draggable-qr-container {
    cursor: move;
    user-select: none;
    border: 2px dashed transparent;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(64, 158, 255, 0.2);
    }

    &.dragging {
      border-color: var(--primary-color) !important;
      box-shadow: 0 var(--spacing-xs) var(--text-2xl) rgba(64, 158, 255, 0.4) !important;
      cursor: grabbing !important;
    }

    &.resizing {
      border-color: var(--success-color) !important;
      box-shadow: 0 var(--spacing-xs) var(--text-2xl) rgba(103, 194, 58, 0.4) !important;

      .resize-handle {
        opacity: 1 !important;
        background: var(--success-color) !important;
      }
    }

    .qr-content {
      width: 100%;
      height: 100%;
      background: white;
      border-radius: var(--spacing-sm);
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-2xl);

      .qr-image {
        width: calc(100% - var(--text-2xl));
        height: calc(100% - 30px);
        object-fit: contain;
        border-radius: var(--spacing-xs);
      }

      .qr-label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        text-align: center;
        margin-top: var(--spacing-base);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500;
      }
    }

    .drag-handle {
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: var(--text-2xl);
      background: var(--primary-color);
      border-radius: var(--spacing-xs) var(--spacing-xs) 0 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      color: white;
      font-size: var(--text-2xs);
      opacity: 0;
      transition: opacity 0.2s;

      &:active {
        cursor: grabbing;
      }

      span {
        line-height: 1;
        letter-spacing: -var(--border-width-base);
      }
    }

    &:hover .drag-handle {
      opacity: 1;
    }

    .resize-handles {
      .resize-handle {
        position: absolute;
        width: var(--spacing-sm);
        height: var(--spacing-sm);
        background: var(--primary-color);
        border: var(--border-width-base) solid white;
        border-radius: var(--radius-full);
        opacity: 0;
        transition: opacity 0.2s, background-color 0.2s;

        &:hover {
          background: var(--primary-light);
        }

        &.nw {
          top: -var(--spacing-xs);
          left: -var(--spacing-xs);
          cursor: nw-resize;
        }

        &.ne {
          top: -var(--spacing-xs);
          right: -var(--spacing-xs);
          cursor: ne-resize;
        }

        &.sw {
          bottom: -var(--spacing-xs);
          left: -var(--spacing-xs);
          cursor: sw-resize;
        }

        &.se {
          bottom: -var(--spacing-xs);
          right: -var(--spacing-xs);
          cursor: se-resize;
        }
      }
    }

    &:hover .resize-handle {
      opacity: 1;
    }

    .scale-control {
      position: absolute;
      bottom: -40px;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      background: white;
      padding: var(--spacing-sm);
      border-radius: var(--spacing-xs);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
      opacity: 0;
      transition: opacity 0.2s;

      .scale-text {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        min-width: 35px;
        font-weight: 500;
      }
    }

    &:hover .scale-control {
      opacity: 1;
    }
  }

  .qr-controls {
    position: absolute;
    top: var(--text-2xl);
    right: var(--text-2xl);
    background: white;
    padding: var(--spacing-4xl);
    border-radius: var(--spacing-sm);
    box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
    min-width: 280px;
    max-width: 320px;
    z-index: 20;

    .control-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-4xl);

      h4 {
        margin: 0;
        font-size: var(--text-base);
        color: var(--text-primary);
      }
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-2xl);
      margin-bottom: var(--text-sm);

      &:last-child {
        margin-bottom: 0;
      }

      label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        min-width: 70px;
        font-weight: 500;
      }
    }
  }

  .operation-tips {
    position: absolute;
    bottom: var(--text-2xl);
    left: var(--text-2xl);
    background: var(--white-alpha-95);
    padding: var(--text-sm);
    border-radius: var(--spacing-sm);
    box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
    z-index: 15;

    .tip-item {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .draggable-resizable-qr {
    .qr-controls {
      position: relative;
      top: auto;
      right: auto;
      margin-top: var(--text-2xl);
      width: 100%;
      min-width: auto;
      max-width: none;
    }

    .operation-tips {
      position: relative;
      bottom: auto;
      left: auto;
      margin-top: var(--spacing-2xl);
      width: 100%;
    }
  }
}
</style>
