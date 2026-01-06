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
              <el-icon class="theme-icon">
                <component :is="theme.icon" />
              </el-icon>
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
        label: '默认主题',
        icon: 'Sunny',
        description: '清新明亮的默认样式'
      },
      {
        value: 'dark' as ThemeType,
        label: '暗黑主题',
        icon: 'Moon',
        description: '护眼的深色主题'
      },
      {
        value: 'custom' as ThemeType,
        label: '自定义主题',
        icon: 'Setting',
        description: '个性化自定义样式'
      },
      {
        value: 'glassmorphism' as ThemeType,
        label: '玻璃态主题',
        icon: 'Picture',
        description: '现代玻璃态效果'
      }
    ])
    
    // 获取主题图标
    const getThemeIcon = (theme: ThemeType) => {
      const themeMap = {
        default: 'Sunny',
        dark: 'Moon',
        custom: 'Setting',
        glassmorphism: 'Picture'
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
    border: var(--border-width-base) solid var(--border-primary);
    color: var(--text-secondary);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
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
      transform: translateY(-2px);
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
  min-width: 200px;
  padding: var(--spacing-sm);
  background: var(--bg-elevated);
  border: var(--border-width-base) solid var(--border-primary);
  border-radius: var(--text-sm);
  box-shadow: 0 var(--spacing-sm) var(--text-3xl) var(--shadow-medium);
}

:deep(.theme-option) {
  padding: 0;
  margin: var(--spacing-xs) 0;
  border-radius: var(--spacing-sm);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--bg-tertiary);
    transform: translateX(var(--spacing-xs));
  }
  
  &.is-active {
    background-color: var(--primary-color);
    color: white;
    
    .theme-option-content {
      .theme-icon,
      .theme-label {
        color: white;
      }
    }
  }
}

.theme-option-content {
  display: flex;
  align-items: center;
  gap: var(--text-sm);
  padding: var(--text-sm) var(--text-lg);
  width: 100%;
  
  .theme-icon {
    font-size: var(--text-xl);
    color: var(--text-secondary);
    transition: color 0.3s ease;
  }
  
  .theme-label {
    flex: 1;
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--text-primary);
    transition: color 0.3s ease;
  }
  
  .theme-preview {
    width: var(--text-2xl);
    height: var(--text-2xl);
    border-radius: var(--radius-full);
    border: 2px solid var(--border-secondary);
    transition: all 0.3s ease;
    
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
    backdrop-filter: blur(var(--text-2xl));
    border-color: var(--white-alpha-20);
    box-shadow: 0 var(--text-sm) 40px var(--shadow-medium);
  }
  
  :deep(.theme-option) {
    &:hover {
      background: var(--white-alpha-10);
    }
    
    &.is-active {
      background: rgba(102, 126, 234, 0.3);
      border: var(--border-width-base) solid rgba(102, 126, 234, 0.4);
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
[data-theme="dark"] {
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
  
  :deep(.theme-dropdown) {
    background: var(--gray-800);
    border-color: var(--gray-600);
    box-shadow: 0 var(--spacing-sm) var(--text-3xl) var(--shadow-heavy);
  }
  
  :deep(.theme-option) {
    &:hover {
      background-color: var(--gray-700);
    }
  }
  
  .theme-option-content {
    .theme-icon {
      color: var(--gray-400);
    }
    
    .theme-label {
      color: var(--gray-200);
    }
  }
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
    min-width: 160px;
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