<template>
  <div class="smart-navigation">
    <!-- 快速导航输入框 -->
    <div class="navigation-input-wrapper">
      <el-input
        v-model="navigationInput"
        placeholder="输入页面名称快速跳转，如：活动中心、招生管理..."
        @keyup.enter="handleNavigate"
        @input="handleInputChange"
        class="navigation-input"
        :prefix-icon="Search"
        clearable
      >
        <template #append>
          <el-button
            @click="handleNavigate"
            :loading="navigating"
            :disabled="!navigationInput.trim()"
          >
            跳转
          </el-button>
        </template>
      </el-input>
      
      <!-- 实时建议 -->
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="navigation-suggestions"
      >
        <div class="suggestions-header">
          <span>建议的页面：</span>
        </div>
        <div
          v-for="suggestion in suggestions.slice(0, 5)"
          :key="suggestion.id"
          class="suggestion-item"
          @click="navigateToSuggestion(suggestion)"
        >
          <div class="suggestion-title">{{ suggestion.title }}</div>
          <div class="suggestion-route">{{ suggestion.route }}</div>
          <div class="confidence-bar">
            <div
              class="confidence-fill"
              :style="{ width: `${suggestion.confidence * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 常用页面快捷按钮 -->
    <div v-if="showQuickAccess" class="quick-access">
      <div class="quick-access-title">快速访问：</div>
      <div class="quick-buttons">
        <el-button
          v-for="quickPage in quickAccessPages"
          :key="quickPage.id"
          @click="quickNavigate(quickPage)"
          size="small"
          type="primary"
          plain
          :icon="getPageIcon(quickPage.icon)"
        >
          {{ quickPage.title }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { SmartRouterService, RouteMatch } from '@/services/smart-router.service'

// Props
interface Props {
  showQuickAccess?: boolean
  quickAccessCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  showQuickAccess: true,
  quickAccessCount: 6
})

// 响应式数据
const router = useRouter()
const smartRouter = new SmartRouterService(router)

const navigationInput = ref('')
const navigating = ref(false)
const suggestions = ref<RouteMatch[]>([])
const showSuggestions = ref(false)

// 常用页面配置
const quickAccessPages = ref([
  { id: 'dashboard', title: '工作台', route: '/dashboard', icon: 'dashboard' },
  { id: 'activity-center', title: '活动中心', route: '/centers/activity', icon: 'activity' },
  { id: 'enrollment-center', title: '招生中心', route: '/centers/enrollment', icon: 'enrollment' },
  { id: 'personnel-center', title: '人员中心', route: '/centers/personnel', icon: 'personnel' },
  { id: 'ai-center', title: 'AI中心', route: '/centers/ai', icon: 'ai-center' },
  { id: 'media-center', title: '新媒体中心', route: '/principal/media-center', icon: 'media' }
])

// 计算属性
const canNavigate = computed(() => {
  return navigationInput.value.trim() && !navigating.value
})

// 方法
const handleInputChange = () => {
  if (navigationInput.value.trim()) {
    suggestions.value = smartRouter.getSuggestions(navigationInput.value, 8)
    showSuggestions.value = suggestions.value.length > 0
  } else {
    showSuggestions.value = false
    suggestions.value = []
  }
}

const handleNavigate = async () => {
  if (!canNavigate.value) return
  
  navigating.value = true
  try {
    const success = await smartRouter.smartNavigate(navigationInput.value)
    if (success) {
      navigationInput.value = ''
      showSuggestions.value = false
      suggestions.value = []
    }
  } catch (error) {
    console.error('导航失败:', error)
    ElMessage.error('页面跳转失败')
  } finally {
    navigating.value = false
  }
}

const navigateToSuggestion = async (suggestion: RouteMatch) => {
  navigating.value = true
  try {
    await router.push(suggestion.route)
    ElMessage.success(`已跳转到：${suggestion.title}`)
    navigationInput.value = ''
    showSuggestions.value = false
    suggestions.value = []
  } catch (error) {
    console.error('导航失败:', error)
    ElMessage.error('页面跳转失败')
  } finally {
    navigating.value = false
  }
}

const quickNavigate = async (page: any) => {
  navigating.value = true
  try {
    await router.push(page.route)
    ElMessage.success(`已跳转到：${page.title}`)
  } catch (error) {
    console.error('快速导航失败:', error)
    ElMessage.error('页面跳转失败')
  } finally {
    navigating.value = false
  }
}

const getPageIcon = (iconName: string) => {
  // 简单的图标映射，可以根据需要扩展
  const iconMap: Record<string, any> = {
    dashboard: Search,
    activity: Search,
    enrollment: Search,
    personnel: Search,
    'ai-center': Search,
    media: Search
  }
  return iconMap[iconName] || Search
}

// 点击外部隐藏建议
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.smart-navigation')) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.smart-navigation {
  width: 100%;
  max-width: 100%; max-width: 600px;
  margin: 0 auto;
}

.navigation-input-wrapper {
  position: relative;
  margin-bottom: var(--text-lg);
}

.navigation-input {
  width: 100%;
}

.navigation-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--spacing-xs);
  box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);
  z-index: var(--z-index-dropdown)px;
  max-min-height: 60px; height: auto;
  overflow-y: auto;
}

.suggestions-header {
  padding: var(--spacing-sm) var(--text-sm);
  background: var(--bg-hover);
  border-bottom: var(--z-index-dropdown) solid #ebeef5;
  font-size: var(--text-sm);
  color: var(--info-color);
  font-weight: 500;
}

.suggestion-item {
  padding: var(--text-sm);
  cursor: pointer;
  border-bottom: var(--z-index-dropdown) solid var(--bg-container);
  transition: background-color 0.2s;
}

.suggestion-item:hover {
  background: var(--bg-hover);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.suggestion-route {
  font-size: var(--text-sm);
  color: var(--info-color);
  margin-bottom: var(--spacing-lg);
}

.confidence-bar {
  min-height: 32px; height: auto;
  background: var(--bg-hover);
  border-radius: var(--border-width-base);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success-color), var(--primary-color));
  transition: width 0.3s;
}

.quick-access {
  margin-top: var(--text-lg);
}

.quick-access-title {
  font-size: var(--text-base);
  color: var(--text-regular);
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.quick-buttons .el-button {
  flex: 0 0 auto;
}

@media (max-width: var(--breakpoint-md)) {
  .smart-navigation {
    max-width: 100%;
    padding: 0 var(--text-lg);
  }
  
  .quick-buttons {
    justify-content: flex-start;
  }
  
  .quick-buttons .el-button {
    flex: 1 1 calc(50% - var(--spacing-xs));
    min-max-width: 120px; width: 100%;
  }
}
</style>