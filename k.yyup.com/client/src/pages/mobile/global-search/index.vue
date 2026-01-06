<template>
  <MobileMainLayout
    title="全局搜索"
    :show-back="true"
    :show-footer="false"
    @back="handleGoBack"
  >
    <div class="mobile-global-search">
      <!-- 搜索框 -->
      <div class="search-section">
        <van-search
          v-model="searchQuery"
          placeholder="搜索功能、设置或帮助"
          autofocus
          show-action
          shape="round"
          background="transparent"
          @search="handleSearch"
          @input="handleInputChange"
          @cancel="handleGoBack"
        >
          <template #action>
            <van-button
              size="small"
              type="primary"
              @click="handleSearch"
              :disabled="!searchQuery.trim()"
            >
              搜索
            </van-button>
          </template>
        </van-search>
      </div>

      <!-- 搜索历史 -->
      <div v-if="!searchQuery && searchHistory.length > 0" class="search-history">
        <div class="section-header">
          <span class="section-title">最近搜索</span>
          <van-button
            type="primary"
            size="mini"
            plain
            @click="clearHistory"
          >
            清空
          </van-button>
        </div>
        <div class="history-tags">
          <van-tag
            v-for="item in searchHistory"
            :key="item"
            class="history-tag"
            @click="searchWithHistory(item)"
          >
            {{ item }}
          </van-tag>
        </div>
      </div>

      <!-- 热门功能 -->
      <div v-if="!searchQuery" class="popular-functions">
        <div class="section-header">
          <span class="section-title">热门功能</span>
        </div>
        <div class="popular-grid">
          <div
            v-for="item in popularFunctions"
            :key="item.id"
            class="popular-item"
            @click="navigateToFunction(item)"
          >
            <van-icon :name="item.icon" size="24" />
            <span class="popular-text">{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-if="searchQuery && searchResults.length > 0" class="search-results">
        <div class="section-header">
          <span class="section-title">搜索结果</span>
          <span class="result-count">{{ searchResults.length }} 个结果</span>
        </div>
        <div class="results-list">
          <div
            v-for="item in searchResults"
            :key="item.id"
            class="result-item"
            @click="navigateToFunction(item)"
          >
            <div class="result-icon">
              <van-icon :name="item.icon" size="20" />
            </div>
            <div class="result-content">
              <div class="result-title" v-html="highlightText(item.name)"></div>
              <div class="result-description" v-html="highlightText(item.description)"></div>
              <div class="result-category">{{ item.category }}</div>
            </div>
            <van-icon name="arrow" class="result-arrow" />
          </div>
        </div>
      </div>

      <!-- 无搜索结果 -->
      <div v-if="searchQuery && searchResults.length === 0 && !isSearching" class="no-results">
        <van-empty
          image="search"
          description="未找到相关功能"
        >
          <template #description>
            <p>未找到与"{{ searchQuery }}"相关的功能</p>
            <p>尝试使用其他关键词或查看热门功能</p>
          </template>
        </van-empty>
      </div>

      <!-- 搜索中 -->
      <div v-if="isSearching" class="searching">
        <van-loading size="24px">搜索中...</van-loading>
      </div>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'

// 路由
const router = useRouter()
const route = useRoute()

// 状态
const searchQuery = ref('')
const isSearching = ref(false)
const searchHistory = ref<string[]>([])
const searchResults = ref<any[]>([])

// 热门功能列表（根据角色动态变化）
const popularFunctions = ref([
  { id: '1', name: 'AI助手', icon: 'bulb-o', route: '/mobile/ai-chat', category: '智能服务' },
  { id: '2', name: '任务中心', icon: 'todo-list-o', route: '/mobile/centers/task-center', category: '工作管理' },
  { id: '3', name: '数据分析', icon: 'chart-trending-o', route: '/mobile/centers/analytics-center', category: '数据统计' },
  { id: '4', name: '活动管理', icon: 'friends-o', route: '/mobile/centers/activity-center', category: '活动管理' },
  { id: '5', name: '客户管理', icon: 'manager-o', route: '/mobile/centers/customer-pool-center', category: '客户管理' },
  { id: '6', name: '财务中心', icon: 'balance-o', route: '/mobile/centers/finance-center', category: '财务管理' },
  { id: '7', name: '系统设置', icon: 'setting-o', route: '/mobile/centers/system-center', category: '系统管理' },
  { id: '8', name: '帮助中心', icon: 'question-o', route: '/mobile/help-center', category: '帮助支持' }
])

// 全部功能数据库
const allFunctions = [
  // 核心管理功能
  { id: 'task-1', name: '任务管理', icon: 'todo-list-o', route: '/mobile/centers/task-center', category: '工作管理', description: '查看和管理待办任务' },
  { id: 'analytics-1', name: '数据分析', icon: 'chart-trending-o', route: '/mobile/centers/analytics-center', category: '数据统计', description: '查看业务数据分析' },
  { id: 'activity-1', name: '活动管理', icon: 'friends-o', route: '/mobile/centers/activity-center', category: '活动管理', description: '管理幼儿园活动' },
  { id: 'customer-1', name: '客户池', icon: 'manager-o', route: '/mobile/centers/customer-pool-center', category: '客户管理', description: '管理潜在客户' },
  { id: 'finance-1', name: '财务管理', icon: 'balance-o', route: '/mobile/centers/finance-center', category: '财务管理', description: '查看财务报表' },
  { id: 'system-1', name: '系统设置', icon: 'setting-o', route: '/mobile/centers/system-center', category: '系统管理', description: '系统配置和设置' },

  // AI功能
  { id: 'ai-1', name: 'AI助手', icon: 'bulb-o', route: '/mobile/ai-chat', category: '智能服务', description: '智能问答和助手' },
  { id: 'ai-2', name: '智能中心', icon: 'diamond-o', route: '/mobile/centers/ai-center', category: '智能服务', description: 'AI功能管理中心' },

  // 人员管理
  { id: 'personnel-1', name: '人员中心', icon: 'friends-o', route: '/mobile/centers/personnel-center', category: '人员管理', description: '员工和教师管理' },
  { id: 'teacher-1', name: '教师管理', icon: 'user-circle-o', route: '/mobile/centers/teacher-center', category: '人员管理', description: '教师信息管理' },

  // 教学管理
  { id: 'education-1', name: '教学中心', icon: 'records', route: '/mobile/centers/education-center', category: '教学管理', description: '课程和教学管理' },
  { id: 'class-1', name: '班级管理', icon: 'home-o', route: '/mobile/centers/class-center', category: '教学管理', description: '班级信息管理' },
  { id: 'student-1', name: '学生管理', icon: 'contact', route: '/mobile/centers/student-center', category: '教学管理', description: '学生信息管理' },

  // 招生营销
  { id: 'enrollment-1', name: '招生中心', icon: 'phone-o', route: '/mobile/centers/enrollment-center', category: '招生营销', description: '招生咨询和管理' },
  { id: 'marketing-1', name: '营销中心', icon: 'hot-o', route: '/mobile/centers/marketing-center', category: '招生营销', description: '营销活动管理' },

  // 其他功能
  { id: 'help-1', name: '帮助中心', icon: 'question-o', route: '/mobile/help-center', category: '帮助支持', description: '使用帮助和FAQ' },
  { id: 'profile-1', name: '个人中心', icon: 'user-o', route: '/mobile/profile-center', category: '个人设置', description: '个人信息和设置' }
]

// 初始化
onMounted(() => {
  loadSearchHistory()
})

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('mobile-search-history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
const saveSearchHistory = () => {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim()
    const index = searchHistory.value.indexOf(query)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
    }
    searchHistory.value.unshift(query)
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10)
    }
    localStorage.setItem('mobile-search-history', JSON.stringify(searchHistory.value))
  }
}

// 清空搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('mobile-search-history')
  showToast('搜索历史已清空')
}

// 使用历史搜索
const searchWithHistory = (query: string) => {
  searchQuery.value = query
  handleSearch()
}

// 搜索功能
const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  isSearching.value = true
  searchResults.value = []

  // 模拟搜索延迟
  setTimeout(() => {
    const results = allFunctions.filter(func =>
      func.name.toLowerCase().includes(query.toLowerCase()) ||
      func.description.toLowerCase().includes(query.toLowerCase()) ||
      func.category.toLowerCase().includes(query.toLowerCase())
    )
    searchResults.value = results
    isSearching.value = false
    saveSearchHistory()
  }, 300)
}

// 输入变化处理
const handleInputChange = (value: string) => {
  searchQuery.value = value
  if (value.trim()) {
    handleSearch()
  } else {
    searchResults.value = []
  }
}

// 高亮搜索文本
const highlightText = (text: string) => {
  if (!searchQuery.value.trim()) return text

  const query = searchQuery.value.trim()
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

// 导航到功能页面
const navigateToFunction = (item: any) => {
  if (item.route) {
    router.push(item.route)
  }
}

// 返回
const handleGoBack = () => {
  const from = route.query.from as string
  if (from && from !== '/') {
    router.push(from)
  } else {
    router.back()
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mobile-base.scss';
@import '@/styles/design-tokens.scss';

.mobile-global-search {
  min-height: 100vh;
  background: var(--mobile-bg-primary);
  padding: var(--spacing-lg);

  // 使用统一滚动容器
  .mobile-scroll-container {
    padding-bottom: var(--spacing-xl);
  }

  // 搜索区域
  .search-section {
    margin-bottom: var(--spacing-xl);
  }

  // 通用区域头部
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .section-title {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--mobile-text-primary);
    }

    .result-count {
      font-size: var(--text-sm);
      color: var(--mobile-text-tertiary);
    }
  }

  // 搜索历史
  .search-history {
    margin-bottom: var(--spacing-xl);

    .history-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);

      .history-tag {
        cursor: pointer;
        transition: var(--transition-fast);

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }

  // 热门功能
  .popular-functions {
    margin-bottom: var(--spacing-xl);

    .popular-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-lg);

      .popular-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        border-radius: var(--radius-lg);
        background: var(--card-bg);
        cursor: pointer;
        transition: var(--transition-base);

        &:active {
          transform: scale(0.95);
        }

        .popular-text {
          font-size: var(--text-xs);
          color: var(--mobile-text-primary);
          text-align: center;
        }
      }
    }
  }

  // 搜索结果
  .search-results {
    .results-list {
      .result-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        margin-bottom: var(--spacing-sm);
        background: var(--card-bg);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: var(--transition-base);

        &:active {
          transform: scale(0.98);
        }

        .result-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--primary-light-bg);
          border-radius: var(--radius-md);
          color: var(--primary-color);
        }

        .result-content {
          flex: 1;

          .result-title {
            font-size: var(--text-base);
            font-weight: var(--font-medium);
            color: var(--mobile-text-primary);
            margin-bottom: var(--spacing-xs);

            :deep(.highlight) {
              color: var(--primary-color);
              background: var(--primary-light-bg);
              padding: 0 2px;
              border-radius: 2px;
            }
          }

          .result-description {
            font-size: var(--text-sm);
            color: var(--mobile-text-secondary);
            margin-bottom: var(--spacing-xs);

            :deep(.highlight) {
              color: var(--primary-color);
              background: var(--primary-light-bg);
              padding: 0 2px;
              border-radius: 2px;
            }
          }

          .result-category {
            font-size: var(--text-xs);
            color: var(--mobile-text-tertiary);
          }
        }

        .result-arrow {
          color: var(--mobile-text-tertiary);
        }
      }
    }
  }

  // 无结果
  .no-results {
    text-align: center;
    padding: var(--spacing-5xl) var(--spacing-lg);
  }

  // 搜索中
  .searching {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-5xl) var(--spacing-lg);
    color: var(--mobile-text-secondary);
  }
}

// 响应式适配
@media (min-width: 768px) {
  .mobile-global-search {
    max-width: var(--container-md);
    margin: 0 auto;
    padding: var(--spacing-xl);

    .popular-functions .popular-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }
}
</style>