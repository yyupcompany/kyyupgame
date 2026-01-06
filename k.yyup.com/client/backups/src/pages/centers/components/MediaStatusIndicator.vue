<template>
  <div class="media-status-indicator" :class="indicatorClass">
    <!-- 有媒体文件时显示 -->
    <div v-if="hasMedia" class="media-status-with-files" @click="handleClick">
      <el-tooltip :content="tooltipContent" placement="top">
        <div class="media-icon-container">
          <el-icon class="media-icon" :class="iconClass">
            <component :is="iconComponent" />
          </el-icon>
          <span v-if="showCount && mediaCount > 0" class="media-count">{{ mediaCount }}</span>
        </div>
      </el-tooltip>
    </div>

    <!-- 无媒体文件时显示 -->
    <div v-else class="media-status-no-files" @click="handleClick">
      <el-tooltip content="暂无媒体文件" placement="top">
        <div class="media-icon-container">
          <el-icon class="media-icon no-media">
            <component :is="iconComponent" />
          </el-icon>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Camera, 
  VideoCamera, 
  Picture, 
  Film,
  FolderOpened,
  Document
} from '@element-plus/icons-vue'

interface Props {
  hasMedia: boolean
  mediaCount?: number
  type: 'class' | 'student' | 'outdoor' | 'external' | 'championship'
  showCount?: boolean
  clickable?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  mediaCount: 0,
  showCount: true,
  clickable: true,
  size: 'medium'
})

const emit = defineEmits<{
  click: [type: string]
}>()

// 计算属性
const indicatorClass = computed(() => [
  `media-status--${props.type}`,
  `media-status--${props.size}`,
  {
    'media-status--has-media': props.hasMedia,
    'media-status--no-media': !props.hasMedia,
    'media-status--clickable': props.clickable
  }
])

const iconClass = computed(() => ({
  'has-media': props.hasMedia,
  'no-media': !props.hasMedia
}))

const iconComponent = computed(() => {
  // 根据类型选择不同的图标
  switch (props.type) {
    case 'class':
      return props.hasMedia ? Camera : Camera
    case 'student':
      return props.hasMedia ? Picture : Picture
    case 'outdoor':
      return props.hasMedia ? VideoCamera : VideoCamera
    case 'external':
      return props.hasMedia ? Film : Film
    case 'championship':
      return props.hasMedia ? FolderOpened : Document
    default:
      return Camera
  }
})

const tooltipContent = computed(() => {
  if (!props.hasMedia) {
    return '暂无媒体文件'
  }

  const typeNames = {
    class: '班级',
    student: '学员',
    outdoor: '户外训练',
    external: '校外展示',
    championship: '锦标赛'
  }

  const typeName = typeNames[props.type] || '媒体'
  return `${typeName}媒体文件 ${props.mediaCount} 个`
})

// 方法
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.type)
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.media-status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &.media-status--clickable {
    cursor: pointer;
  }

  .media-icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  .media-icon {
    transition: all 0.2s ease;

    &.has-media {
      color: var(--el-color-success);
    }

    &.no-media {
      color: var(--el-color-info-light-5);
    }
  }

  .media-count {
    position: absolute;
    top: -6px;
    right: -6px;
    background: var(--el-color-danger);
    color: white;
    font-size: var(--text-2xs);
    font-weight: 600;
    padding: var(--spacing-xs) var(--spacing-xs);
    border-radius: var(--spacing-sm);
    min-width: var(--text-lg);
    height: var(--text-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  // 尺寸变体
  &.media-status--small {
    .media-icon {
      font-size: var(--text-base);
    }

    .media-count {
      font-size: 9px;
      min-width: var(--text-base);
      height: var(--text-base);
      top: -5px;
      right: -5px;
    }
  }

  &.media-status--medium {
    .media-icon {
      font-size: var(--text-lg);
    }

    .media-count {
      font-size: var(--text-2xs);
      min-width: var(--text-lg);
      height: var(--text-lg);
      top: -6px;
      right: -6px;
    }
  }

  &.media-status--large {
    .media-icon {
      font-size: var(--text-2xl);
    }

    .media-count {
      font-size: var(--text-xs);
      min-width: var(--text-xl);
      height: var(--text-xl);
      top: -7px;
      right: -7px;
    }
  }

  // 类型变体
  &.media-status--class {
    .media-icon.has-media {
      color: var(--el-color-primary);
    }
  }

  &.media-status--student {
    .media-icon.has-media {
      color: var(--el-color-success);
    }
  }

  &.media-status--outdoor {
    .media-icon.has-media {
      color: var(--el-color-warning);
    }
  }

  &.media-status--external {
    .media-icon.has-media {
      color: var(--el-color-info);
    }
  }

  &.media-status--championship {
    .media-icon.has-media {
      color: var(--el-color-danger);
    }
  }

  // 悬停效果
  &.media-status--clickable:hover {
    .media-icon.has-media {
      filter: brightness(1.2);
    }

    .media-icon.no-media {
      color: var(--el-color-info);
    }
  }
}

// 动画效果
@keyframes media-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.media-status-indicator.media-status--has-media .media-icon-container:hover {
  animation: media-pulse 0.6s ease-in-out;
}
</style>
