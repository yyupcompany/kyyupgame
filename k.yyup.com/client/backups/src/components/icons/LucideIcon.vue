<template>
  <div class="lucide-icon" :class="iconClasses">
    <svg
      v-if="hasIcon"
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon-svg"
      :style="svgStyles"
    >
      <path v-if="iconPath" :d="iconPath" />
      <g v-if="iconElements" v-html="iconElements"></g>
    </svg>
    <div v-else class="icon-fallback">
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="icon-svg"
        :style="svgStyles"
      >
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4M12 16h.01"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  size?: number | string
  color?: string
  strokeWidth?: number | string
  variant?: 'default' | 'filled' | 'outlined'
}

const props = withDefaults(defineProps<Props>(), {
  size: 28,
  strokeWidth: 1.5,
  variant: 'default'
})

// 现代化的 Lucide 风格图标路径 (基于 Lucide Icons 设计)
const modernIcons: Record<string, { path?: string; elements?: string }> = {
  // 主要业务中心图标
  'dashboard': {
    path: 'M3 3v5h5V3H3zm7 0v5h5V3h-5zm7 0v5h5V3h-5zM3 10v5h5v-5H3zm7 0v5h5v-5h-5zm7 0v5h5v-5h-5zM3 17v5h5v-5H3zm7 0v5h5v-5h-5zm7 0v5h5v-5h-5z'
  },
  'LayoutDashboard': {
    path: 'M3 3v5h5V3H3zm7 0v5h5V3h-5zm7 0v5h5V3h-5zM3 10v5h5v-5H3zm7 0v5h5v-5h-5zm7 0v5h5v-5h-5zM3 17v5h5v-5H3zm7 0v5h5v-5h-5zm7 0v5h5v-5h-5z'
  },
  'personnel': {
    path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    elements: '<circle cx="9" cy="7" r="4"/><path d="m22 21-3-3m0 0a2 2 0 0 0 0-4 2 2 0 0 0 0 4z"/>'
  },
  'Users': {
    path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    elements: '<circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  'activity': {
    path: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    elements: '<path d="m9 16 2 2 4-4"/>'
  },
  'Calendar': {
    path: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    elements: '<path d="m9 16 2 2 4-4"/>'
  },
  'enrollment': {
    path: 'M22 10v6M2 10l10-5 10 5-10 5z',
    elements: '<path d="M6 12v5c3 3 9 3 12 0v-5"/>'
  },
  'GraduationCap': {
    path: 'M22 10v6M2 10l10-5 10 5-10 5z',
    elements: '<path d="M6 12v5c3 3 9 3 12 0v-5"/>'
  },
  'marketing': {
    path: 'M3 11l18-5v12L3 14v-3z',
    elements: '<path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>'
  },
  'Megaphone': {
    path: 'M3 11l18-5v12L3 14v-3z',
    elements: '<path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>'
  },
  'ai-center': {
    path: 'M12 8V4H8',
    elements: '<rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2m16 0h2M15 13v2m-6-2v2"/>'
  },
  'Brain': {
    path: 'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z',
    elements: '<path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path d="M19.967 17.484A4 4 0 0 1 18 18"/>'
  },
  'system': {
    path: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
    elements: '<circle cx="12" cy="12" r="3"/>'
  },
  'Settings': {
    path: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
    elements: '<circle cx="12" cy="12" r="3"/>'
  },
  'finance': {
    path: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'
  },
  'DollarSign': {
    path: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'
  },
  'task': {
    path: 'M9 11l3 3 8-8',
    elements: '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 1 0-8.953 8.953c.549-.055.998-.398.998-.95"/>'
  },
  'CheckSquare': {
    path: 'M9 11l3 3 8-8',
    elements: '<path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 1 0-8.953 8.953c.549-.055.998-.398.998-.95"/>'
  },
  'script': {
    path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    elements: '<path d="M8 9h8m-8 4h6"/>'
  },
  'MessageSquare': {
    path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    elements: '<path d="M8 9h8m-8 4h6"/>'
  },
  'media': {
    path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    elements: '<path d="M14 2v4a2 2 0 0 0 2 2h4M10 12l5 3-5 3v-6z"/>'
  },
  'Video': {
    path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    elements: '<path d="M14 2v4a2 2 0 0 0 2 2h4M10 12l5 3-5 3v-6z"/>'
  },
  'video': {
    path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    elements: '<path d="M14 2v4a2 2 0 0 0 2 2h4M10 12l5 3-5 3v-6z"/>'
  },
  'customers': {
    path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    elements: '<circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  'UserCheck': {
    path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    elements: '<circle cx="9" cy="7" r="4"/><path d="M16 11l2 2 4-4"/>'
  },

  // 教师角色专用图标
  'BookOpen': {
    path: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
    elements: '<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'
  },
  'Bell': {
    path: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9',
    elements: '<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>'
  },
  'Briefcase': {
    path: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
    elements: '<rect width="20" height="14" x="2" y="6" rx="2"/>'
  },

  // 扩展功能图标
  'home': {
    path: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    elements: '<polyline points="9,22 9,12 15,12 15,22"/>'
  },
  'Home': {
    path: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    elements: '<polyline points="9,22 9,12 15,12 15,22"/>'
  },
  'TrendingUp': {
    path: 'M22 7l-8.5 8.5-4-4L2 18',
    elements: '<path d="M16 7h6v6"/>'
  },
  'FileText': {
    path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    elements: '<path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>'
  },
  'Gamepad2': {
    path: 'M6 11h4m4 0h4',
    elements: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>'
  },
  'Edit3': {
    path: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
    elements: '<path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>'
  },
  'UserCircle': {
    path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
    elements: '<circle cx="12" cy="7" r="4"/><circle cx="12" cy="12" r="10"/>'
  },
  'search': {
    elements: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>'
  },
  'plus': {
    path: 'M5 12h14m-7-7v14'
  },
  'edit': {
    path: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
    elements: '<path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>'
  },
  'delete': {
    path: 'M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
    elements: '<line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>'
  },
  'chevron-down': {
    path: 'M6 9l6 6 6-6'
  },
  'arrow-left': {
    path: 'M19 12H5m7-7-7 7 7 7'
  },
  'check': {
    path: 'M20 6L9 17l-5-5'
  },
  'menu': {
    path: 'M4 6h16M4 12h16M4 18h16'
  },
  'refresh': {
    path: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8',
    elements: '<path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>'
  },
  'user': {
    path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
    elements: '<circle cx="12" cy="7" r="4"/>'
  },
  'user-filled': {
    path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
    elements: '<circle cx="12" cy="7" r="4" fill="currentColor"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="currentColor"/>'
  },
  'calendar': {
    path: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'
  },
  'school': {
    path: 'M22 10v6M2 10l10-5 10 5-10 5z',
    elements: '<path d="M6 12v5c3 3 9 3 12 0v-5"/>'
  },
  'trending-up': {
    path: 'M22 7l-8.5 8.5-4-4L2 18',
    elements: '<path d="M16 7h6v6"/>'
  },
  'cpu': {
    path: 'M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
    elements: '<path d="M15 2v2M9 2v2M9 20v2M15 20v2M22 9h-2M22 15h-2M2 9h2M2 15h2"/>'
  },
  'setting': {
    path: 'M12.22 2h-.44a2 2 0 0 0-1.94 1.59L8.5 7.5a2 2 0 0 1-1.32 1.62l-3.9 1.1a2 2 0 0 0-1.94 1.59v.44a2 2 0 0 0 1.59 1.94l3.9 1.1a2 2 0 0 1 1.32 1.62l1.34 3.91a2 2 0 0 0 1.94 1.59h.44a2 2 0 0 0 1.94-1.59l1.34-3.91a2 2 0 0 1 1.32-1.62l3.9-1.1a2 2 0 0 0 1.59-1.94v-.44a2 2 0 0 0-1.59-1.94l-3.9-1.1a2 2 0 0 1-1.32-1.62L13.16 3.59A2 2 0 0 0 12.22 2z',
    elements: '<circle cx="12" cy="12" r="3"/>'
  },
  'list': {
    path: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'
  },
  'money': {
    path: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'
  },
  'Phone': {
    path: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'
  },
  'call-center': {
    path: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'
  },
  'Building2': {
    path: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z',
    elements: '<path d="M6 12h12M6 15h12M6 18h12M6 9h12M10 6V4M14 6V4M6 22H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2Z"/>'
  },
  'group': {
    path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
    elements: '<circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  },
  'Clock': {
    path: 'M12 2v10l4 2',
    elements: '<circle cx="12" cy="12" r="10"/>'
  },
  'attendance': {
    path: 'M12 2v10l4 2',
    elements: '<circle cx="12" cy="12" r="10"/>'
  },
  'BarChart3': {
    path: 'M3 3v18h18',
    elements: '<path d="M7 16V8m5 8v-4m5 8v-6"/>'
  },
  'data-analysis': {
    path: 'M3 3v18h18',
    elements: '<path d="M18 20V10M12 20V4M6 20v-6"/>'
  },
  'CheckCircle2': {
    path: 'M22 11.08V12a10 10 0 1 1-5.93-9.14',
    elements: '<path d="M9 11l3 3L22 4"/>'
  },
  'inspection': {
    path: 'M22 11.08V12a10 10 0 1 1-5.93-9.14',
    elements: '<path d="M9 11l3 3L22 4"/>'
  }
}

const iconPath = computed(() => {
  const icon = modernIcons[props.name]
  // 如果找不到，尝试查找小写版本
  if (!icon && props.name) {
    const lowerName = props.name.toLowerCase()
    const iconLower = modernIcons[lowerName]
    if (iconLower) {
      return iconLower.path || ''
    }
  }
  return icon?.path || ''
})

const iconElements = computed(() => {
  const icon = modernIcons[props.name]
  // 如果找不到，尝试查找小写版本
  if (!icon && props.name) {
    const lowerName = props.name.toLowerCase()
    const iconLower = modernIcons[lowerName]
    if (iconLower) {
      return iconLower.elements || ''
    }
  }
  return icon?.elements || ''
})

// 检查是否有有效的图标
const hasIcon = computed(() => {
  return !!(iconPath.value || iconElements.value)
})

const iconClasses = computed(() => [
  'lucide-icon',
  `lucide-icon--${props.variant}`,
  `lucide-icon--${props.name}`
])

const svgStyles = computed(() => ({
  color: props.color || 'currentColor'
}))

// 导出hasIcon用于模板
defineExpose({
  hasIcon
})
</script>

<style scoped>
.lucide-icon {
  display: inline-block;
  vertical-align: middle;
  transition: all 0.2s ease;
}

.lucide-icon--filled {
  fill: currentColor;
  stroke: none;
}

.lucide-icon--outlined {
  fill: none;
  stroke: currentColor;
}

.lucide-icon--default {
  fill: none;
  stroke: currentColor;
}

/* 悬停效果 */
.lucide-icon:hover {
  transform: scale(1.05);
}

/* 主题适配 */
.theme-dark .lucide-icon {
  color: inherit;
}
</style>
