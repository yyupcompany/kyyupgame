<template>
  <div class="multi-style-icon" :class="[iconSystemClass, { 'is-active': active }]">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      :class="svgClass"
      :style="svgStyles"
    >
      <!-- 现代简约风格 -->
      <template v-if="iconSystem === 'modern'">
        <path v-if="iconData.modern?.path" :d="iconData.modern.path" :stroke="currentColor" fill="none" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
        <g v-if="iconData.modern?.elements" v-html="iconData.modern.elements" :stroke="currentColor" fill="none" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
      </template>

      <!-- 彩色扁平风格 -->
      <template v-if="iconSystem === 'colorful'">
        <path v-if="iconData.colorful?.path" :d="iconData.colorful.path" :fill="iconData.colorful.fillColor || currentColor" stroke="none"/>
        <g v-if="iconData.colorful?.elements" v-html="iconData.colorful.elements" :fill="iconData.colorful.fillColor || currentColor"/>
      </template>

      <!-- 手绘可爱风格 -->
      <template v-if="iconSystem === 'handdrawn'">
        <path v-if="iconData.handdrawn?.path" :d="iconData.handdrawn.path" :stroke="currentColor" fill="none" :stroke-width="strokeWidth + 0.5" stroke-linecap="round" stroke-linejoin="round" :style="{ filter: `url(#roughPaper-${filterId})` }"/>
        <g v-if="iconData.handdrawn?.elements" v-html="iconData.handdrawn.elements" :stroke="currentColor" fill="none" :stroke-width="strokeWidth + 0.5" stroke-linecap="round" stroke-linejoin="round" :style="{ filter: `url(#roughPaper-${filterId})` }"/>
      </template>
    </svg>

    <!-- 手绘效果的SVG滤镜 -->
    <svg v-if="iconSystem === 'handdrawn'" style="position: absolute; width: 0; height: 0;">
      <defs>
        <filter :id="`roughPaper-${filterId}`">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'

interface IconData {
  modern?: { path?: string; elements?: string }
  colorful?: { path?: string; elements?: string; fillColor?: string }
  handdrawn?: { path?: string; elements?: string }
}

interface Props {
  name: string
  size?: number | string
  color?: string
  strokeWidth?: number | string
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  strokeWidth: 1.5,
  active: false
})

// 注入图标系统状态
const iconSystem = inject('iconSystem', 'modern')
const currentColor = computed(() => props.color || 'currentColor')

// 生成唯一滤镜ID，避免多图标时ID冲突
const filterId = computed(() => `${props.name}-${Math.random().toString(36).substr(2, 9)}`)

// 图标系统映射
const iconSystemClass = computed(() => `icon-system-${iconSystem.value}`)

const svgClass = computed(() => [
  'icon-svg',
  `icon-${props.name}`,
  { 'icon-active': props.active }
])

const svgStyles = computed(() => ({
  width: typeof props.size === 'string' ? props.size : `${props.size}px`,
  height: typeof props.size === 'string' ? props.size : `${props.size}px`,
  color: currentColor.value
}))

// 三套图标系统的图标数据
const iconMap: Record<string, IconData> = {
  // 管理中心相关
  'settings': {
    modern: {
      path: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.15.1a2 2 0 0 1-2.12-.1l-.12-.08a2 2 0 0 0-2.83 0l-.31.31a2 2 0 0 0 0 2.83l.08.12a2 2 0 0 1 .1 2.12l-.1.15a2 2 0 0 1-1.73 1H4a2 2 0 0 0-2 2v.44a2 2 0 0 0 2 2h.18a2 2 0 0 1 1.73 1l.1.15a2 2 0 0 1-.1 2.12l-.08.12a2 2 0 0 0 0 2.83l.31.31a2 2 0 0 0 2.83 0l.12-.08a2 2 0 0 1 2.12.1l.15.1a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.15-.1a2 2 0 0 1 2.12.1l.12.08a2 2 0 0 0 2.83 0l.31-.31a2 2 0 0 0 0-2.83l-.08-.12a2 2 0 0 1-.1-2.12l.1-.15a2 2 0 0 1 1.73-1H20a2 2 0 0 0 2-2v-.44a2 2 0 0 0-2-2h-.18a2 2 0 0 1-1.73-1l-.1-.15a2 2 0 0 1 .1-2.12l.08-.12a2 2 0 0 0 0-2.83l-.31-.31a2 2 0 0 0-2.83 0l-.12.08a2 2 0 0 1-2.12-.1l-.15-.1a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'
    },
    colorful: {
      path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11h-4v4h-2v-4H6v-2h4V7h2v4h4v2z',
      fillColor: '#4CAF50'
    },
    handdrawn: {
      path: 'M10.5 3.5C8.5 3.5 6.5 5.5 6.5 7.5V9.5C6.5 10.5 7.5 11.5 8.5 11.5H10.5V13.5H8.5C7.5 13.5 6.5 14.5 6.5 15.5V18.5C6.5 19.5 7.5 20.5 8.5 20.5H15.5C16.5 20.5 17.5 19.5 17.5 18.5V15.5C17.5 14.5 16.5 13.5 15.5 13.5H13.5V11.5H15.5C16.5 11.5 17.5 10.5 17.5 9.5V7.5C17.5 5.5 15.5 3.5 13.5 3.5H10.5Z'
    }
  },

  // 业务中心
  'service': {
    modern: {
      path: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'
    },
    colorful: {
      path: 'M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z',
      fillColor: '#2196F3'
    },
    handdrawn: {
      path: 'M8 4.5H16C17.5 4.5 18.5 5.5 18.5 7V17C18.5 18.5 17.5 19.5 16 19.5H8C6.5 19.5 5.5 18.5 5.5 17V7C5.5 5.5 6.5 4.5 8 4.5Z'
    }
  },

  // 招生中心
  'enrollment': {
    modern: {
      path: 'M12 2L2 7v10c0 5.55 3.84 10 9 11 1.16-.21 2.31-.54 3.42-1.01C19.94 24.67 22 20.67 22 16V7l-10-5z'
    },
    colorful: {
      path: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
      fillColor: '#FF9800'
    },
    handdrawn: {
      path: 'M12 2.5L3 7.5V16.5C3 20.5 7 23.5 12 24.5C17 23.5 21 20.5 21 16.5V7.5L12 2.5Z'
    }
  },

  // 活动中心
  'activities': {
    modern: {
      path: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
      elements: '<path d="m9 16 2 2 4-4"/>'
    },
    colorful: {
      path: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H6V8h11v1z',
      fillColor: '#E91E63'
    },
    handdrawn: {
      path: 'M6 5H18C19 5 20 6 20 7V18C20 19 19 20 18 20H6C5 20 4 19 4 18V7C4 6 5 5 6 5Z',
      elements: '<circle cx="12" cy="14" r="2"/>'
    }
  },

  // 营销中心
  'marketing': {
    modern: {
      path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM7.5 16L12 13.5 16.5 16 12 18.5 7.5 16z'
    },
    colorful: {
      path: 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z',
      fillColor: '#9C27B0'
    },
    handdrawn: {
      path: 'M12 3C7 3 3 7 3 12C3 17 7 21 12 21C17 21 21 17 21 12C21 7 17 3 12 3Z',
      elements: '<path d="M9 11L11 13L15 9"/>'
    }
  },

  // 客户池中心
  'customers': {
    modern: {
      path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
      elements: '<circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
    },
    colorful: {
      path: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      fillColor: '#00BCD4'
    },
    handdrawn: {
      path: 'M9 7C9 5.5 7.5 4.5 6 4.5S3 5.5 3 7S4.5 9.5 6 9.5 9 8.5 9 7Z',
      elements: '<path d="M16 8.5C16 7 14.5 6 13 6S10 7 10 8.5 11.5 11 13 11 16 10 16 8.5Z"/><path d="M3 18.5C3 16.5 5 14.5 7 14.5H11C13 14.5 15 16.5 15 18.5"/>'
    }
  },

  // 财务中心
  'finance': {
    modern: {
      path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.81.45 1.61 1.67 1.61 1.16 0 1.6-.64 1.6-1.46 0-.84-.68-1.22-2.05-1.63-1.87-.56-3.27-1.36-3.27-3.35 0-1.64 1.16-2.73 2.79-3.08V5.12h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.63-1.63-1.63-1.01 0-1.46.54-1.46 1.34 0 .84.65 1.18 2.06 1.64 1.91.57 3.26 1.43 3.26 3.43 0 1.83-1.17 2.95-3.08 3.35z'
    },
    colorful: {
      path: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
      fillColor: '#4CAF50'
    },
    handdrawn: {
      path: 'M12 3C7 3 3 7 3 12C3 17 7 21 12 21C17 21 21 17 21 12C21 7 17 3 12 3Z',
      elements: '<text x="12" y="16" text-anchor="middle" font-size="8" fill="currentColor">¥</text>'
    }
  },

  // 绩效中心
  'performance': {
    modern: {
      path: 'M18 20V10M12 20V4M6 20v-6'
    },
    colorful: {
      path: 'M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z',
      fillColor: '#FF5722'
    },
    handdrawn: {
      path: 'M5 8V18M12 3V18M19 10V18',
      elements: '<path d="M3 18H21"/>'
    }
  },

  // 分析中心
  'analytics': {
    modern: {
      path: 'M3 3v18h18',
      elements: '<path d="m19 9-5 5-4-4-3 3"/>'
    },
    colorful: {
      path: 'M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z',
      fillColor: '#3F51B5'
    },
    handdrawn: {
      path: 'M4 19H20M4 14L9 9L13 13L20 6',
      elements: '<circle cx="9" cy="9" r="1"/><circle cx="13" cy="13" r="1"/><circle cx="20" cy="6" r="1"/>'
    }
  },

  // 人员中心
  'personnel': {
    modern: {
      path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
      elements: '<circle cx="12" cy="7" r="4"/>'
    },
    colorful: {
      path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
      fillColor: '#795548'
    },
    handdrawn: {
      path: 'M12 7C12 5 10.5 3.5 8.5 3.5S5 5 5 7S6.5 10.5 8.5 10.5 12 9 12 7Z',
      elements: '<path d="M3 20C3 17 6 14.5 8.5 14.5H15.5C18 14.5 21 17 21 20"/>'
    }
  },

  // 任务中心
  'task': {
    modern: {
      path: 'M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z'
    },
    colorful: {
      path: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
      fillColor: '#607D8B'
    },
    handdrawn: {
      path: 'M13 3H7C6 3 5 4 5 5V19C5 20 6 21 7 21H17C18 21 19 20 19 19V9L13 3Z',
      elements: '<path d="M13 3V9H19"/>'
    }
  },

  // 系统中心
  'system': {
    modern: {
      path: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35c-.59.24-1.13.56-1.62.94L5.24 5.33c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'
    },
    colorful: {
      path: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41L9.25 5.35c-.59.24-1.13.56-1.62.94L5.24 5.33c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
      fillColor: '#FFC107'
    },
    handdrawn: {
      path: 'M12 5C8 5 5 8 5 12C5 16 8 19 12 19C16 19 19 16 19 12C19 8 16 5 12 5Z',
      elements: '<circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="12" cy="9" r="1"/><circle cx="12" cy="15" r="1"/>'
    }
  },

  // 设计中心
  'design': {
    modern: {
      path: 'M12 19l7-7 3 3-7 7-3-3z',
      elements: '<path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>'
    },
    colorful: {
      path: 'M12 2l-5.5 9h11z',
      elements: '<circle cx="12" cy="17.5" r="4.5"/><path d="M12 14v7"/>'
    },
    handdrawn: {
      path: 'M12 2L6 11L9 18L12 14L15 18L18 11L12 2Z',
      elements: '<circle cx="12" cy="11" r="1.5"/>'
    }
  },

  // 搜索图标
  'search': {
    modern: {
      path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    },
    colorful: {
      path: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
      fillColor: '#9E9E9E'
    },
    handdrawn: {
      path: 'M15 15L19 19M10 13C7 13 5 11 5 8C5 5 7 3 10 3C13 3 15 5 15 8C15 11 13 13 10 13Z'
    }
  },

  // 日历图标
  'calendar': {
    modern: {
      path: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
      elements: '<path d="m9 16 2 2 4-4"/>'
    },
    colorful: {
      path: 'M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z',
      fillColor: '#F44336'
    },
    handdrawn: {
      path: 'M6 4H18C19 4 20 5 20 6V18C20 19 19 20 18 20H6C5 20 4 19 4 18V6C4 5 5 4 6 4Z',
      elements: '<path d="M4 8H20M8 2V6M16 2V6"/>'
    }
  },

  // 媒体图标
  'media': {
    modern: {
      path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
    },
    colorful: {
      path: 'M21 3H3c-1.11 0-2 .89-2 2v14c0 1.1.89 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 16H3V5h18v14z',
      elements: '<rect x="6" y="7" width="4" height="8" fill="#E91E63"/><rect x="14" y="7" width="4" height="8" fill="#E91E63"/>'
    },
    handdrawn: {
      path: 'M12 3L15 9L21 10L17 15L18 21L12 18L6 21L7 15L3 10L9 9L12 3Z'
    }
  },

  // 消息图标
  'messages': {
    modern: {
      path: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z'
    },
    colorful: {
      path: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z',
      fillColor: '#2196F3'
    },
    handdrawn: {
      path: 'M3 3H19C20 3 21 4 21 5V15C21 16 20 17 19 17H7L3 21V5C3 4 4 3 5 3H3Z',
      elements: '<circle cx="7" cy="10" r="1"/><circle cx="12" cy="10" r="1"/><circle cx="17" cy="10" r="1"/>'
    }
  },

  // 话术图标
  'script': {
    modern: {
      path: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
    },
    colorful: {
      path: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
      fillColor: '#FFC107'
    },
    handdrawn: {
      path: 'M13 3H7C6 3 5 4 5 5V19C5 20 6 21 7 21H17C18 21 19 20 19 19V9L13 3Z',
      elements: '<path d="M13 3V9H19M8 13H16M8 17H16"/>'
    }
  },

  // 监控图标
  'monitor': {
    modern: {
      path: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'
    },
    colorful: {
      path: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      elements: '<polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'
    },
    handdrawn: {
      path: 'M12 4L4 8V16L12 20L20 16V8L12 4Z',
      elements: '<path d="M12 20V12M4 8L12 12L20 8"/>'
    }
  },

  // 默认图标
  'menu': {
    modern: {
      path: 'M3 12h18M3 6h18M3 18h18'
    },
    colorful: {
      path: 'M3 12h18M3 6h18M3 18h18',
      fillColor: '#757575'
    },
    handdrawn: {
      path: 'M4 7H20M4 12H20M4 17H20'
    }
  }
}

const iconData = computed(() => iconMap[props.name] || iconMap['menu'])
</script>

<style lang="scss" scoped>
.multi-style-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);

  .icon-svg {
    transition: all var(--transition-fast);
  }

  // 现代简约风格
  &.icon-system-modern {
    .icon-svg {
      stroke-linecap: round;
      stroke-linejoin: round;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  // 彩色扁平风格
  &.icon-system-colorful {
    .icon-svg {
      filter: drop-shadow(0 var(--border-width-base) 2px var(--black-alpha-10));

      &:hover {
        transform: translateY(-var(--border-width-base));
        filter: drop-shadow(0 2px var(--spacing-xs) var(--black-alpha-15));
      }
    }
  }

  // 手绘可爱风格
  &.icon-system-handdrawn {
    .icon-svg {
      stroke-dasharray: 1000;
      stroke-dashoffset: 0;
      animation: draw 2s ease-in-out infinite alternate;

      &:hover {
        transform: rotate(-2deg) scale(1.05);
      }
    }
  }

  // 激活状态
  &.is-active {
    .icon-svg {
      transform: scale(1.1);
      filter: drop-shadow(0 0 var(--spacing-sm) rgba(var(--primary-color-rgb), 0.3));
    }
  }
}

@keyframes draw {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>