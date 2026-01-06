<template>
  <div class="theme-test-page">
    <h1>主题测试页面</h1>
    <div class="theme-info">
      <p>当前主题: {{ currentTheme }}</p>
      <button @click="toggleTheme">切换主题</button>
    </div>
    
    <div class="color-demo">
      <h2>色彩演示</h2>
      <div class="color-grid">
        <div class="color-item" style="background-color: var(--el-color-primary);">
          <span>Primary</span>
        </div>
        <div class="color-item" style="background-color: var(--el-color-success);">
          <span>Success</span>
        </div>
        <div class="color-item" style="background-color: var(--el-color-warning);">
          <span>Warning</span>
        </div>
        <div class="color-item" style="background-color: var(--el-color-danger);">
          <span>Danger</span>
        </div>
        <div class="color-item" style="background-color: var(--el-color-info);">
          <span>Info</span>
        </div>
      </div>
    </div>
    
    <div class="text-demo">
      <h2>文本演示</h2>
      <p class="primary-text">主要文本 - var(--el-text-color-primary)</p>
      <p class="regular-text">常规文本 - var(--el-text-color-regular)</p>
      <p class="secondary-text">次要文本 - var(--el-text-color-secondary)</p>
      <p class="placeholder-text">占位文本 - var(--el-text-color-placeholder)</p>
      <p class="disabled-text">禁用文本 - var(--el-text-color-disabled)</p>
    </div>
    
    <div class="background-demo">
      <h2>背景演示</h2>
      <div class="bg-item bg-primary">
        <p>主背景 - var(--el-bg-color)</p>
      </div>
      <div class="bg-item bg-page">
        <p>页面背景 - var(--el-bg-color-page)</p>
      </div>
      <div class="bg-item bg-card">
        <p>卡片背景 - var(--el-bg-color-overlay)</p>
      </div>
    </div>
    
    <ThemeSwitcher />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'

const currentTheme = ref<'light' | 'dark'>('light')

const applyTheme = (theme: 'light' | 'dark') => {
  currentTheme.value = theme
  document.documentElement.setAttribute('data-theme', theme)
  document.body.classList.toggle('theme-dark', theme === 'dark')
  document.body.classList.toggle('theme-light', theme === 'light')
  localStorage.setItem('app_theme', theme)
}

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
  applyTheme(newTheme)
}

// 监听主题变化的函数
const handleThemeChange = () => {
  const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light'
  currentTheme.value = theme
}

onMounted(() => {
  // 获取当前主题
  const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light'
  currentTheme.value = theme
  
  // 监听主题变化
  window.addEventListener('theme-change', handleThemeChange)
})

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('theme-change', handleThemeChange)
})
</script>

<style scoped lang="scss">
.theme-test-page {
  padding: var(--text-3xl);
  min-height: 100vh;
}

.theme-info {
  margin-bottom: var(--spacing-3xl);
  
  p {
    font-size: var(--text-xl);
    margin-bottom: var(--text-lg);
  }
  
  button {
    padding: var(--spacing-sm) var(--text-lg);
    background-color: var(--el-color-primary);
    color: white;
    border: none;
    border-radius: var(--el-border-radius-base);
    cursor: pointer;
    
    &:hover {
      background-color: var(--el-color-primary-light-3);
    }
  }
}

.color-demo {
  margin-bottom: var(--spacing-3xl);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--text-lg);
  margin-top: var(--text-lg);
}

.color-item {
  height: 80px;
  border-radius: var(--el-border-radius-base);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: var(--el-box-shadow-light);
}

.text-demo {
  margin-bottom: var(--spacing-3xl);
  
  p {
    padding: var(--spacing-sm) 0;
    margin: 0;
  }
  
  .primary-text {
    color: var(--el-text-color-primary);
  }
  
  .regular-text {
    color: var(--el-text-color-regular);
  }
  
  .secondary-text {
    color: var(--el-text-color-secondary);
  }
  
  .placeholder-text {
    color: var(--el-text-color-placeholder);
  }
  
  .disabled-text {
    color: var(--el-text-color-disabled);
  }
}

.background-demo {
  margin-bottom: var(--spacing-3xl);
}

.bg-item {
  padding: var(--text-lg);
  margin-bottom: var(--text-lg);
  border-radius: var(--el-border-radius-base);
  box-shadow: var(--el-box-shadow-light);
  
  p {
    margin: 0;
    color: var(--el-text-color-primary);
  }
}

.bg-primary {
  background-color: var(--el-bg-color);
}

.bg-page {
  background-color: var(--el-bg-color-page);
}

.bg-card {
  background-color: var(--el-bg-color-overlay);
}
</style>