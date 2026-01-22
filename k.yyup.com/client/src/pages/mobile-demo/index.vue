<!--
  移动端 Demo 页面
  Mobile Demo Page

  用于验证：
  1. Vant 组件集成
  2. 明亮/暗黑主题切换
  3. 设计令牌应用
  4. 四个角色布局预览
-->
<template>
  <div class="mobile-demo-page" :class="themeClass">
    <!-- 头部导航 -->
    <van-nav-bar
      title="移动端 Demo"
      :border="false"
      class="demo-header"
      :style="{
        background: isDark ? '#1e293b' : '#ffffff',
        borderBottomColor: isDark ? '#334155' : '#e4e7ed'
      }"
      fixed
      placeholder
    >
      <template #left>
        <van-icon 
          name="arrow-left" 
          size="20" 
          @click="goBack"
          :style="{ color: isDark ? '#94a3b8' : 'inherit' }"
        />
      </template>
      <template #right>
        <div class="header-actions">
          <van-icon
            :name="isDark ? 'sun-o' : 'star-o'"
            size="22"
            @click="handleToggleTheme"
            class="theme-toggle"
            :style="{ color: isDark ? '#94a3b8' : 'inherit' }"
          />
        </div>
      </template>
    </van-nav-bar>

    <!-- 主内容区 -->
    <div class="demo-content">
      <!-- 主题状态卡片（可点击切换） -->
      <van-cell-group inset class="demo-section theme-card" @click="handleToggleTheme">
        <van-cell
          title="当前主题"
          :value="isDark ? '暗黑模式' : '明亮模式'"
          :label="isDark ? '深色背景，浅色文字（点击切换）' : '浅色背景，深色文字（点击切换）'"
          is-link
        >
          <template #icon>
            <van-icon :name="isDark ? 'star' : 'sun-o'" class="cell-icon" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 角色选择 -->
      <div class="demo-section">
        <div class="section-title">角色预览</div>
        <div class="role-cards">
          <div
            v-for="role in roles"
            :key="role.id"
            class="role-card"
            :class="{ active: activeRole === role.id }"
            :style="{ '--role-color': role.color }"
            @click="selectRole(role.id)"
          >
            <van-icon :name="role.icon" size="28" />
            <span class="role-name">{{ role.name }}</span>
            <span class="role-desc">{{ role.desc }}</span>
          </div>
        </div>
      </div>

      <!-- 功能模块预览 -->
      <div class="demo-section">
        <div class="section-title">功能模块</div>
        <van-grid :column-num="4" :border="false" class="feature-grid">
          <van-grid-item
            v-for="(item, index) in features"
            :key="index"
            :icon="item.icon"
            :text="item.text"
            :badge="item.badge"
          />
        </van-grid>
      </div>

      <!-- 统计卡片 -->
      <div class="demo-section">
        <div class="section-title">数据概览</div>
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <div class="stat-value" :style="{ color: stat.color }">
              {{ stat.value }}
            </div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" :class="stat.trend">
              <van-icon :name="stat.trend === 'up' ? 'arrow-up' : 'arrow-down'" size="12" />
              {{ stat.change }}
            </div>
          </div>
        </div>
      </div>

      <!-- 表单演示 -->
      <div class="demo-section">
        <div class="section-title">表单控件</div>
        <van-cell-group inset>
          <van-field
            v-model="formData.name"
            label="姓名"
            placeholder="请输入姓名"
            :border="false"
          />
          <van-field
            v-model="formData.phone"
            label="电话"
            placeholder="请输入电话"
            type="tel"
            :border="false"
          />
          <van-field
            v-model="formData.remark"
            label="备注"
            placeholder="请输入备注"
            type="textarea"
            rows="2"
            autosize
            :border="false"
          />
        </van-cell-group>
      </div>

      <!-- 操作按钮 -->
      <div class="demo-section">
        <div class="section-title">操作按钮</div>
        <div class="button-group">
          <van-button type="primary" block round>主要按钮</van-button>
          <van-button type="success" block round plain>成功按钮</van-button>
          <van-button type="warning" block round plain>警告按钮</van-button>
        </div>
      </div>

      <!-- 底部安全区 -->
      <div class="safe-area-bottom"></div>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" fixed :class="['demo-tabbar', isDark ? 'dark-tabbar' : '']">
      <van-tabbar-item icon="wap-home-o" name="home">首页</van-tabbar-item>
      <van-tabbar-item icon="apps-o" name="centers" badge="12">中心</van-tabbar-item>
      <van-tabbar-item icon="chat-o" name="message">消息</van-tabbar-item>
      <van-tabbar-item icon="user-o" name="profile">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { toggleTheme, getCurrentTheme, type ThemeType } from '@/utils/theme'

const router = useRouter()

// 主题状态
const currentTheme = ref<ThemeType>('default')
const isDark = computed(() => currentTheme.value === 'dark')
const themeClass = computed(() => isDark.value ? 'theme-dark' : 'theme-light')

// 检测当前主题
const detectTheme = () => {
  // 检查 HTML 元素的 data-theme 属性
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  if (htmlTheme === 'dark') {
    currentTheme.value = 'dark'
  } else {
    currentTheme.value = 'default'
  }
}

// 切换主题
const handleToggleTheme = () => {
  toggleTheme()
  // 延迟检测以确保主题已应用
  setTimeout(() => {
    detectTheme()
    showToast(`已切换到${isDark.value ? '暗黑' : '明亮'}模式`)
  }, 100)
}

// 返回
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

// 当前激活的标签
const activeTab = ref('home')
const activeRole = ref('principal')

// 角色数据
const roles = [
  { id: 'admin', name: '管理员', desc: '全局管理', icon: 'setting-o', color: '#6366F1' },
  { id: 'principal', name: '园长', desc: '园所管理', icon: 'manager-o', color: '#3B82F6' },
  { id: 'teacher', name: '教师', desc: '教学管理', icon: 'friends-o', color: '#52c41a' },
  { id: 'parent', name: '家长', desc: '家校互动', icon: 'user-o', color: '#F59E0B' }
]

// 功能模块
const features = [
  { icon: 'chart-trending-o', text: '数据', badge: '' },
  { icon: 'todo-list-o', text: '任务', badge: '5' },
  { icon: 'calendar-o', text: '日程', badge: '' },
  { icon: 'records-o', text: '记录', badge: '' },
  { icon: 'user-o', text: '学生', badge: '' },
  { icon: 'service-o', text: '通知', badge: '3' },
  { icon: 'more-o', text: '更多', badge: '' },
  { icon: 'setting-o', text: '设置', badge: '' }
]

// 统计数据
const stats = [
  { label: '学生总数', value: '256', color: '#3B82F6', trend: 'up', change: '+12' },
  { label: '教师人数', value: '32', color: '#52c41a', trend: 'up', change: '+2' },
  { label: '今日考勤', value: '98%', color: '#F59E0B', trend: 'up', change: '+1.5%' },
  { label: '待办事项', value: '8', color: '#f56c6c', trend: 'down', change: '-3' }
]

// 表单数据
const formData = ref({
  name: '',
  phone: '',
  remark: ''
})

// 选择角色
const selectRole = (roleId: string) => {
  activeRole.value = roleId
  const role = roles.find(r => r.id === roleId)
  showToast(`已选择 ${role?.name} 角色`)
}

onMounted(() => {
  detectTheme()
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-tokens.scss';

.mobile-demo-page {
  min-height: 100vh;
  background: var(--bg-color-page);
  padding-bottom: 60px;
  transition: all 0.3s ease;

  &.theme-dark {
    background: #0f172a;
    color: #f1f5f9;
  }
}

// 头部样式
.demo-header {
  background: #ffffff !important;
  border-bottom: 1px solid var(--border-color-light);
  transition: all 0.3s ease;

  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .theme-toggle {
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.9);
    }
  }

  // 暗黑主题头部
  &.dark-header {
    background: #1e293b !important;
    border-bottom-color: #334155;

    :deep(.van-nav-bar__title) {
      color: #f1f5f9 !important;
    }

    :deep(.van-nav-bar__left),
    :deep(.van-nav-bar__right) {
      .van-icon {
        color: #94a3b8 !important;
      }
    }
  }
}

// 内容区
.demo-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// 区块标题
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--primary-color);

  .theme-dark & {
    color: #f1f5f9;
  }
}

// 主题卡片（可点击）
.theme-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

// 区块样式
.demo-section {
  :deep(.van-cell-group--inset) {
    margin: 0;
    border-radius: 12px;
    overflow: hidden;

    .theme-dark & {
      background: #1e293b;
    }
  }

  :deep(.van-cell) {
    .theme-dark & {
      background: #1e293b;
      
      .van-cell__title,
      .van-cell__value {
        color: #f1f5f9;
      }
      
      .van-cell__label {
        color: #94a3b8;
      }
    }
  }

  :deep(.van-field) {
    .theme-dark & {
      background: #1e293b;
      
      .van-field__label {
        color: #94a3b8;
      }
      
      .van-field__control {
        color: #f1f5f9;
        
        &::placeholder {
          color: #64748b;
        }
      }
    }
  }

  .cell-icon {
    margin-right: 8px;
    color: var(--primary-color);
  }
}

// 角色卡片
.role-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 2px solid var(--border-color-light);
  cursor: pointer;
  transition: all 0.3s ease;

  .theme-dark & {
    background: #1e293b;
    border-color: #334155;
  }

  &.active {
    border-color: var(--role-color);
    background: color-mix(in srgb, var(--role-color) 10%, transparent);

    .van-icon {
      color: var(--role-color);
    }
  }

  &:active {
    transform: scale(0.98);
  }

  .van-icon {
    color: var(--text-secondary);
    transition: color 0.3s ease;

    .theme-dark & {
      color: #94a3b8;
    }
  }

  .role-name {
    font-size: 15px;
    font-weight: 600;
    color: #2c3e50 !important;
  }
}

.theme-dark .role-card .role-name {
  color: #f1f5f9 !important;

  .role-desc {
    font-size: 12px;
    color: var(--text-secondary);

    .theme-dark & {
      color: #94a3b8;
    }
  }
}

// 功能网格
.feature-grid {
  background-color: #ffffff !important;
  border-radius: 12px;
  padding: 8px;
  overflow: hidden;

  :deep(.van-grid) {
    background-color: #ffffff !important;
  }

  :deep(.van-grid-item__content) {
    padding: 16px 8px;
    background-color: #ffffff !important;
    border-radius: 8px;
  }

  :deep(.van-grid-item__icon) {
    color: var(--primary-color);
    font-size: 24px;
  }

  :deep(.van-grid-item__text) {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;
  }
}

.theme-dark .feature-grid {
  background-color: #1e293b !important;

  :deep(.van-grid) {
    background-color: #1e293b !important;
  }

  :deep(.van-grid-item__content) {
    background-color: #1e293b !important;
  }

  :deep(.van-grid-item__text) {
    color: #94a3b8;
  }
}

// 统计网格
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  background: #ffffff !important;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .theme-dark & {
    background: #1e293b !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    font-family: 'DIN Alternate', 'Roboto Mono', monospace;
  }

  .stat-label {
    font-size: 13px;
    color: var(--text-secondary);

    .theme-dark & {
      color: #94a3b8;
    }
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 12px;

    &.up {
      color: #52c41a;
    }

    &.down {
      color: #f56c6c;
    }
  }
}

// 按钮组
.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;

  :deep(.van-button) {
    height: 44px;
    font-size: 15px;
    font-weight: 500;
  }

  :deep(.van-button--primary) {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border: none;
  }
}

// 底部导航
// 底部导航
.demo-tabbar {
  transition: all 0.3s ease;

  // 暗黑主题底部导航
  &.dark-tabbar {
    :deep(.van-tabbar) {
      background: #1e293b !important;
      border-top-color: #334155 !important;
    }

    :deep(.van-tabbar-item) {
      color: #94a3b8 !important;

      &.van-tabbar-item--active {
        color: var(--primary-color) !important;
      }
    }
  }
}

// 安全区
.safe-area-bottom {
  height: env(safe-area-inset-bottom, 20px);
}
</style>

