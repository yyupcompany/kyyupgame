<template>
  <div class="fixed-header" :class="headerClasses" :style="headerStyle">
    <!-- 状态栏占位（iOS刘海屏） -->
    <div class="status-bar-spacer"></div>

    <!-- 导航栏内容 -->
    <div class="header-content">
      <!-- 左侧：返回按钮或Logo -->
      <div class="header-left">
        <van-icon
          v-if="showBack"
          name="arrow-left"
          size="20"
          class="back-icon"
          :style="{ color: isDarkTheme ? '#f1f5f9' : 'inherit' }"
          @click="handleBack"
        />
        <div v-else class="logo-text" :style="{ color: isDarkTheme ? '#f1f5f9' : 'var(--primary-color)' }">{{ title }}</div>
      </div>

      <!-- 中间：标题（仅在有返回按钮时显示） -->
      <div v-if="showBack" class="header-center">
        <div class="header-title" :style="{ color: isDarkTheme ? '#f1f5f9' : 'var(--text-primary)' }">{{ title }}</div>
        <div v-if="subtitle" class="header-subtitle" :style="{ color: isDarkTheme ? '#94a3b8' : 'var(--text-secondary)' }">{{ subtitle }}</div>
      </div>

      <!-- 右侧：操作按钮 -->
      <div class="header-right">
        <!-- 主题切换按钮 -->
        <div 
          class="theme-toggle-btn" 
          @click="handleThemeToggle" 
          title="切换主题"
          :style="{ 
            background: isDarkTheme ? '#334155' : 'var(--bg-secondary)',
            borderColor: isDarkTheme ? '#475569' : 'var(--border-color-light)'
          }"
        >
          <van-icon 
            v-if="isDarkTheme" 
            name="sun-o" 
            size="18"
            :style="{ color: '#fbbf24' }"
          />
          <van-icon 
            v-else 
            name="star-o" 
            size="18"
            :style="{ color: 'var(--text-primary)' }"
          />
        </div>

        <!-- 搜索按钮（可选） -->
        <van-icon
          v-if="showSearch"
          name="search"
          size="20"
          class="action-icon"
          :style="{ color: isDarkTheme ? '#94a3b8' : 'var(--text-primary)' }"
          @click="handleSearch"
        />

        <!-- AI按钮 -->
        <div class="ai-button" @click="handleAIClick">
          <van-icon name="chat-o" size="18" />
        </div>

        <!-- 通知按钮 -->
        <div class="notification-wrapper" @click="handleNotificationClick">
          <van-icon 
            name="bell-o" 
            size="20" 
            class="action-icon"
            :style="{ color: isDarkTheme ? '#94a3b8' : 'var(--text-primary)' }"
          />
          <van-badge
            v-if="notificationCount > 0"
            :content="notificationCount"
            class="notification-count"
          />
        </div>

        <!-- 用户头像 -->
        <div class="user-avatar" @click="handleAvatarClick">
          <img v-if="avatarUrl" :src="avatarUrl" alt="头像" />
          <div v-else class="avatar-placeholder">
            {{ userName ? userName.charAt(0).toUpperCase() : 'U' }}
          </div>
        </div>

        <!-- 自定义插槽 -->
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { toggleTheme, getCurrentTheme, type ThemeType } from '@/utils/theme'

interface Props {
  title?: string
  subtitle?: string
  showBack?: boolean
  showMenu?: boolean
  showSearch?: boolean
  backgroundColor?: string
  textColor?: string
  fixed?: boolean
  gradient?: boolean
  transparent?: boolean
  notificationCount?: number
  avatarUrl?: string
  userName?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  showBack: true,
  showMenu: false,
  showSearch: false,
  backgroundColor: '',
  textColor: '',
  fixed: true,
  gradient: false,
  transparent: false,
  notificationCount: 0,
  avatarUrl: '',
  userName: ''
})

const emit = defineEmits<{
  'back': []
  'menu-click': []
  'search': []
  'ai-click': []
  'notification-click': []
  'avatar-click': []
}>()

const router = useRouter()
const userStore = useUserStore()

// 主题状态
const isDarkTheme = ref(false)

// 检测当前主题
const detectTheme = () => {
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  isDarkTheme.value = htmlTheme === 'dark'
}

// 初始化主题状态
onMounted(() => {
  detectTheme()
  // 监听主题变化
  const observer = new MutationObserver(() => {
    detectTheme()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

// 切换主题
const handleThemeToggle = () => {
  toggleTheme()
  // 延迟检测以确保主题已应用
  setTimeout(() => {
    detectTheme()
  }, 100)
}

// 样式类
const headerClasses = computed(() => ({
  'gradient': props.gradient,
  'transparent': props.transparent
}))

// 动态样式
const headerStyle = computed(() => {
  const style: Record<string, string> = {}
  // 如果没有自定义背景色，则根据主题设置
  if (props.backgroundColor) {
    style.backgroundColor = props.backgroundColor
  } else if (!props.transparent && !props.gradient) {
    style.backgroundColor = isDarkTheme.value ? '#1e293b' : '#ffffff'
  }
  // 暗黑主题下的边框颜色
  if (isDarkTheme.value && !props.transparent && !props.gradient) {
    style.borderBottomColor = '#334155'
  }
  if (props.textColor) {
    style.color = props.textColor
  }
  return style
})

// 事件处理函数
const handleBack = () => {
  emit('back')
}

const handleMenuClick = () => {
  emit('menu-click')
}

const handleSearch = () => {
  emit('search')
}

const handleAIClick = () => {
  emit('ai-click')
  router.push('/mobile/centers/ai-center')
}

const handleNotificationClick = () => {
  emit('notification-click')
  router.push('/mobile/centers/notification-center')
}

const handleAvatarClick = () => {
  emit('avatar-click')
  router.push('/mobile/centers/user-center')
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* 确保头部在最上层 */
  background: var(--bg-color, #ffffff);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color-light, #e4e7ed);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  // 状态栏占位
  .status-bar-spacer {
    height: env(safe-area-inset-top);
    background-color: inherit;
  }

  // 导航栏内容
  .header-content {
    height: var(--header-height, 64px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--app-gap);
    gap: var(--app-gap);
  }

  // 左侧
  .header-left {
    display: flex;
    align-items: center;
    min-width: 40px;

    .back-icon {
      color: var(--text-primary);
      padding: var(--app-gap-xs);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: all var(--transition-duration-fast) var(--transition-timing-ease);

      &:active {
        background-color: var(--bg-color-light);
        transform: scale(0.9);
      }
    }

    .logo-text {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--primary-color);
      white-space: nowrap;
    }
  }

  // 中间标题区
  .header-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: hidden;

    .header-title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .header-subtitle {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      font-weight: var(--font-normal);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
  }

  // 右侧操作区
  .header-right {
    display: flex;
    align-items: center;
    gap: var(--app-gap);
    min-width: auto;
    justify-content: flex-end;

    // 主题切换按钮
    .theme-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--bg-secondary);
      cursor: pointer;
      transition: all var(--transition-duration-fast) var(--transition-timing-ease);
      border: 1px solid var(--border-color-light);

      .van-icon {
        color: var(--text-primary);
        transition: all var(--transition-duration-fast) var(--transition-timing-ease);
      }

      &:active {
        transform: scale(0.9);
        background: var(--bg-tertiary);
      }

      &:hover {
        .van-icon {
          color: var(--primary-color);
        }
      }
    }

    .ai-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      cursor: pointer;
      transition: all var(--transition-duration-fast) var(--transition-timing-ease);
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

      .van-icon {
        color: white;
      }

      &:active {
        transform: scale(0.9);
        box-shadow: 0 1px 4px rgba(102, 126, 234, 0.3);
      }
    }

    .action-icon {
      color: var(--text-primary);
      padding: var(--app-gap-xs);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: all var(--transition-duration-fast) var(--transition-timing-ease);

      &:active {
        background-color: var(--bg-color-light);
        transform: scale(0.9);
      }
    }

    .notification-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      .notification-count {
        position: absolute;
        top: -4px;
        right: -4px;
        :deep(.van-badge--fixed) {
          position: static;
        }
      }
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid var(--primary-color);
      transition: all var(--transition-duration-fast) var(--transition-timing-ease);

      &:active {
        transform: scale(0.9);
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
        color: white;
        font-size: var(--text-sm);
        font-weight: var(--font-bold);
      }
    }
  }

  // 渐变背景
  &.gradient {
    background: linear-gradient(135deg, var(--theme-primary, var(--primary-color)) 0%, var(--theme-light, var(--primary-light)) 100%);
    border-bottom: none;
    box-shadow: none;

    .header-title,
    .header-subtitle,
    .back-icon,
    .action-icon {
      color: var(--text-white);
    }
  }

  // 透明背景
  &.transparent {
    background: transparent;
    border-bottom: none;
    backdrop-filter: none;
    box-shadow: none;
  }
}

// 暗黑模式适配
:global([data-theme="dark"]) {
  .fixed-header {
    background: rgba(0, 0, 0, 0.8);
    border-bottom-color: var(--border-color-dark);

    .header-title,
    .header-subtitle,
    .back-icon,
    .action-icon {
      color: var(--text-primary-dark);
    }

    &.gradient {
      background: linear-gradient(135deg, var(--theme-primary, var(--primary-color)) 0%, var(--theme-light, var(--primary-light)) 100%);
      opacity: 0.9;

      .header-title,
      .header-subtitle,
      .back-icon,
      .action-icon {
        color: var(--text-white);
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .fixed-header .header-content {
    padding: 0 var(--app-gap-lg);
  }
}

// 安全区域处理
@supports (padding-top: env(safe-area-inset-top)) {
  .fixed-header .status-bar-spacer {
    height: env(safe-area-inset-top);
  }
}
</style>
