<template>
  <div class="theme-switcher">
    <el-dropdown
      trigger="click"
      placement="bottom-end"
      @command="handleThemeChange"
    >
      <el-button 
        circle 
        :icon="getThemeIcon(currentTheme)"
        class="theme-toggle-btn"
        :title="`当前主题: ${getThemeName(currentTheme)}`"
        :aria-label="`当前主题: ${getThemeName(currentTheme)}`">
      </el-button>
      
      <template #dropdown>
        <el-dropdown-menu class="theme-dropdown">
          <el-dropdown-item 
            v-for="theme in availableThemes" 
            :key="theme.value"
            :command="theme.value"
            :class="{ 'is-active': currentTheme === theme.value }"
            class="theme-option"
          >
            <div class="theme-option-content">
              <UnifiedIcon name="default" />
              <span class="theme-label">{{ theme.label }}</span>
              <div class="theme-preview" :class="`preview-${theme.value}`"></div>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { Sunny, Moon, Setting, Picture } from '@element-plus/icons-vue'
import { currentTheme, setTheme, getThemeName, type ThemeType } from '@/utils/theme'

export default defineComponent({
  name: 'ThemeSwitcher',
  components: {
    Sunny,
    Moon,
    Setting,
    Picture
  },
  setup() {
    // 可用主题列表
    const availableThemes = computed(() => [
      {
        value: 'default' as ThemeType,
        label: '明亮主题',
        icon: 'sun',
        description: '清新明亮的默认样式'
      },
      {
        value: 'dark' as ThemeType,
        label: '暗黑主题',
        icon: 'moon',
        description: '护眼的深色主题'
      }
    ])
    
    // 获取主题图标
    const getThemeIcon = (theme: ThemeType) => {
      const themeMap = {
        default: 'Sunny',
        dark: 'Moon'
      }
      return themeMap[theme] || 'Sunny'
    }
    
    // 处理主题切换
    const handleThemeChange = (themeValue: ThemeType) => {
      console.log('切换主题到:', themeValue)
      setTheme(themeValue)
    }
    
    return {
      currentTheme,
      availableThemes,
      getThemeIcon,
      getThemeName,
      handleThemeChange
    }
  }
})
</script>

<style lang="scss" scoped>

.theme-switcher {
  .theme-toggle-btn {
    width: var(--icon-size); height: var(--icon-size);
    background-color: var(--bg-tertiary);
    border: var(--border-width) solid var(--border-primary);
    color: var(--text-secondary);
    transition: all var(--transition-normal) ease;
    position: relative;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, var(--white-alpha-10), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover {
      background-color: var(--bg-elevated);
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: translateY(var(--transform-hover-lift));
      box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-medium);
      
      &::before {
        left: 100%;
      }
    }
    
    &:active {
      transform: translateY(0) scale(0.95);
    }
    
    &:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
  }
}

/* ===== 主题下拉菜单样式 ===== */
:deep(.theme-dropdown) {
  min-width: 200px; width: 100%;
  padding: var(--spacing-sm);
  background: var(--el-bg-color-overlay, #ffffff) !important;
  border: 1px solid var(--el-border-color-light, var(--border-color)) !important;
  border-radius: var(--radius-lg, 8px);
  box-shadow: var(--el-box-shadow-light, var(--shadow-lg));
  z-index: 3001;
}

:deep(.theme-option) {
  padding: 0;
  margin: var(--spacing-xs) 0;
  border-radius: var(--spacing-sm);
  transition: all var(--transition-normal) ease;
  
  &:hover {
    background-color: var(--el-fill-color-light, #f5f7fa);
    transform: translateX(var(--spacing-xs));
  }
  
  &.is-active {
    background-color: var(--el-color-primary-light-9, var(--primary-color));
    color: var(--el-color-primary, var(--primary-color));
    
    .theme-option-content {
      .theme-label {
        font-weight: 600;
        color: var(--el-color-primary, var(--primary-color));
      }
    }
  }
}

.theme-option-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 8px 16px;
  width: 100%;
  
  .theme-label {
    flex: 1;
    font-size: var(--text-base);
    color: var(--el-text-color-primary, var(--text-primary));
  }
  
  .theme-preview {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid var(--el-border-color-lighter);
    transition: all var(--transition-normal) ease;
    
    &.preview-default {
      background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    }
    
    &.preview-dark {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    }
    
    &.preview-custom {
      background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
    }
    
    &.preview-glassmorphism {
      background: linear-gradient(135deg,
        rgba(102, 126, 234, 0.6) 0%,
        rgba(118, 75, 162, 0.6) 25%,
        rgba(240, 147, 251, 0.6) 50%,
        rgba(245, 87, 108, 0.6) 75%,
        rgba(79, 172, 254, 0.6) 100%);
      backdrop-filter: blur(10px);
      border-color: var(--white-alpha-30);
    }

    &.preview-cyberpunk {
      background: linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%);
      box-shadow: 0 0 10px rgba(255, 0, 110, 0.5);
    }

    &.preview-nature {
      background: linear-gradient(135deg, #2d6a4f 0%, #52b788 50%, #95d5b2 100%);
    }

    &.preview-ocean {
      background: linear-gradient(135deg, #03045e 0%, #0077b6 50%, #90e0ef 100%);
    }

    &.preview-sunset {
      background: linear-gradient(135deg, #ff6b35 0%, #f77f00 50%, #fcbf49 100%);
    }

    &.preview-midnight {
      background: linear-gradient(135deg, #0c0a1a 0%, #1a1625 50%, #2d2438 100%);
      box-shadow: 0 0 10px rgba(147, 51, 234, 0.3);
    }
  }
}

/* ===== 玻璃态主题特殊样式 ===== */
[data-theme="glassmorphism"] {
  .theme-switcher {
    .theme-toggle-btn {
      background: var(--white-alpha-15);
      backdrop-filter: blur(10px);
      border-color: var(--white-alpha-20);
      color: var(--white-alpha-90);
      
      &:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: var(--white-alpha-40);
        color: rgba(255, 255, 255, 1);
        box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) var(--shadow-light);
      }
    }
  }
  
  :deep(.theme-dropdown) {
    background: var(--white-alpha-15);
    backdrop-filter: blur(var(--spacing-xl));
    border-color: var(--white-alpha-20);
    box-shadow: 0 var(--text-sm) 40px var(--shadow-medium);
  }
  
  :deep(.theme-option) {
    &:hover {
      background: var(--white-alpha-10);
    }
    
    &.is-active {
      background: rgba(102, 126, 234, 0.3);
      border: var(--border-width) solid rgba(102, 126, 234, 0.4);
    }
  }
  
  .theme-option-content {
    .theme-icon,
    .theme-label {
      color: var(--white-alpha-90);
    }
  }
}

/* ===== 暗黑主题特殊样式 ===== */
:global(html[data-theme="dark"]) {
  .theme-switcher {
    .theme-toggle-btn {
      background-color: var(--gray-800);
      border-color: var(--gray-600);
      color: var(--gray-300);
      
      &:hover {
        background-color: var(--gray-700);
        border-color: var(--primary-500);
        color: var(--primary-400);
      }
    }
  }
}

/* 下拉菜单样式不需要放在 html[data-theme="dark"] 下，因为它就在 body 下且使用了设计令牌 */
:deep(.theme-dropdown) {
  min-width: 200px; width: 100%;
  padding: var(--spacing-sm);
  background: var(--bg-elevated, var(--bg-card));
  border: var(--border-width) solid var(--border-primary);
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-sm) var(--text-3xl) var(--shadow-heavy);
}

/* ===== 可访问性增强 / Accessibility ===== */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle-btn,
  .theme-option,
  .theme-preview {
    transition: none !important;
  }
  
  .theme-toggle-btn::before {
    display: none;
  }
}

/* ===== 响应式设计 ===== */
@media (max-width: var(--breakpoint-md)) {
  :deep(.theme-dropdown) {
    min-max-width: 160px; width: 100%;
  }
  
  .theme-option-content {
    padding: var(--spacing-2xl) var(--text-sm);
    gap: var(--spacing-sm);
    
    .theme-label {
      font-size: var(--text-sm);
    }
    
    .theme-preview {
      width: var(--text-lg);
      height: var(--text-lg);
    }
  }
}
</style> 