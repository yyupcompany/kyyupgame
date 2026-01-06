<template>
  <div class="side-layout">
    <!-- Logo区域 -->
    <div class="logo-section">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <transition name="fade">
          <span v-if="!collapsed" class="logo-text">Demo App</span>
        </transition>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="nav-menu">
      <div class="menu-section">
        <transition name="fade">
          <h3 v-if="!collapsed" class="menu-title">主要功能</h3>
        </transition>
        
        <ul class="menu-list">
          <li v-for="item in mainMenuItems" :key="item.path">
            <router-link 
              :to="item.path" 
              class="menu-item"
              :class="{ 'menu-item-active': isActive(item.path) }"
              :title="collapsed ? item.title : ''"
            >
              <div class="menu-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path :d="item.iconPath" />
                </svg>
              </div>
              <transition name="fade">
                <span v-if="!collapsed" class="menu-text">{{ item.title }}</span>
              </transition>
              <div v-if="item.badge && !collapsed" class="menu-badge">
                {{ item.badge }}
              </div>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="menu-section">
        <transition name="fade">
          <h3 v-if="!collapsed" class="menu-title">系统管理</h3>
        </transition>
        
        <ul class="menu-list">
          <li v-for="item in systemMenuItems" :key="item.path">
            <router-link 
              :to="item.path" 
              class="menu-item"
              :class="{ 'menu-item-active': isActive(item.path) }"
              :title="collapsed ? item.title : ''"
            >
              <div class="menu-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path :d="item.iconPath" />
                </svg>
              </div>
              <transition name="fade">
                <span v-if="!collapsed" class="menu-text">{{ item.title }}</span>
              </transition>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 底部操作区 -->
    <div class="bottom-section">
      <button 
        class="collapse-btn"
        @click="$emit('toggle')"
        :title="collapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <div class="collapse-icon" :class="{ 'collapsed': collapsed }">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// Props
interface Props {
  collapsed: boolean
}

defineProps<Props>()

// Emits
defineEmits<{
  toggle: []
}>()

// 路由
const route = useRoute()

// 菜单项
const mainMenuItems = [
  {
    path: '/demo/dashboard',
    title: '仪表板',
    iconPath: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    badge: null
  },
  {
    path: '/demo/users',
    title: '用户管理',
    iconPath: 'M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 6c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z',
    badge: '12'
  },
  {
    path: '/demo/analytics',
    title: '数据分析',
    iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
    badge: null
  }
]

const systemMenuItems = [
  {
    path: '/demo/settings',
    title: '系统设置',
    iconPath: 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z'
  },
  {
    path: '/demo/logs',
    title: '系统日志',
    iconPath: 'M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z'
  }
]

// 判断菜单项是否激活
const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style lang="scss" scoped>
.side-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

.logo-section {
  padding: var(--spacing-lg);
  border-bottom: var(--border-width-base) solid var(--border-color);
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .logo-icon {
    width: var(--spacing-xl);
    height: var(--spacing-xl);
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
  
  .logo-text {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
  }
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md) 0;
}

.menu-section {
  margin-bottom: var(--spacing-xl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.menu-title {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  
  &.menu-item-active {
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary-light);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--primary-color);
    }
  }
  
  .menu-icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  .menu-text {
    flex: 1;
    font-size: var(--text-sm);
    font-weight: 500;
    white-space: nowrap;
  }
  
  .menu-badge {
    background: var(--primary-color);
    color: white;
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 10px;
    min-width: 1var(--spacing-sm);
    text-align: center;
  }
}

.bottom-section {
  padding: var(--spacing-md);
  border-top: var(--border-width-base) solid var(--border-color);
  flex-shrink: 0;
}

.collapse-btn {
  width: 100%;
  padding: var(--spacing-sm);
  background: transparent;
  border: var(--border-width-base) solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--bg-hover);
    border-color: var(--border-light);
    color: var(--text-primary);
  }
  
  .collapse-icon {
    width: 20px;
    height: 20px;
    transition: transform var(--transition-fast);
    
    &.collapsed {
      transform: rotate(180deg);
    }
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 