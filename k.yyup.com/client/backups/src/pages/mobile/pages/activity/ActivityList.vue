<template>
  <MobileLayout
    title="活动列表"
    :show-back="true"
    :show-share="false"
    @back="handleBack"
  >
    <!-- 搜索和筛选 -->
    <div class="search-section">
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索活动..."
          class="search-input"
          @input="handleSearch"
        />
        <button 
          v-if="searchQuery"
          class="clear-btn"
          @click="clearSearch"
        >
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div class="filter-tabs">
        <button 
          v-for="filter in filters"
          :key="filter.key"
          class="filter-tab"
          :class="{ 'active': currentFilter === filter.key }"
          @click="setFilter(filter.key)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>
    
    <!-- 活动列表 -->
    <div class="activity-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">加载中...</p>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="filteredActivities.length === 0" class="empty-state">
        <div class="empty-icon">📅</div>
        <h3 class="empty-title">暂无活动</h3>
        <p class="empty-description">
          {{ searchQuery ? '没有找到相关活动' : '当前没有可参加的活动' }}
        </p>
        <button v-if="searchQuery" class="retry-btn" @click="clearSearch">
          清除搜索
        </button>
      </div>
      
      <!-- 活动卡片列表 -->
      <div v-else class="activity-cards">
        <ActivityCard
          v-for="activity in filteredActivities"
          :key="activity.id"
          :activity="activity"
          @click="handleActivityClick"
        />
      </div>
      
      <!-- 加载更多 -->
      <div v-if="hasMore && !loading" class="load-more">
        <button class="load-more-btn" @click="loadMore">
          加载更多
        </button>
      </div>
    </div>
    
    <!-- 浮动操作按钮 -->
    <div class="fab-container">
      <button class="fab" @click="refreshList">
        <svg viewBox="0 0 24 24">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
      </button>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMobileStore } from '../../stores/mobile'
import { get } from '@/utils/request'
import { ACTIVITY_PLAN_ENDPOINTS } from '@/api/endpoints'
import MobileLayout from '../../layouts/MobileLayout.vue'
import ActivityCard from '../../components/activity/ActivityCard.vue'

const router = useRouter()
const mobileStore = useMobileStore()

// 响应式数据
const activities = ref([])
const loading = ref(false)
const searchQuery = ref('')
const currentFilter = ref('all')
const hasMore = ref(true)
const page = ref(1)

// 筛选选项
const filters = [
  { key: 'all', label: '全部' },
  { key: 'published', label: '报名中' },
  { key: 'upcoming', label: '即将开始' },
  { key: 'ended', label: '已结束' }
]

// 计算属性
const filteredActivities = computed(() => {
  let result = activities.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(activity => 
      activity.title.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query) ||
      activity.location.toLowerCase().includes(query)
    )
  }

  // 状态过滤
  if (currentFilter.value !== 'all') {
    result = result.filter(activity => {
      switch (currentFilter.value) {
        case 'published':
          return activity.status === 'published'
        case 'upcoming':
          return new Date(activity.startTime) > new Date()
        case 'ended':
          return activity.status === 'ended' || new Date(activity.endTime) < new Date()
        default:
          return true
      }
    })
  }

  return result
})

// 方法
const loadActivities = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true
  
  try {
    const response = await get(ACTIVITY_PLAN_ENDPOINTS.LIST, {
      page: isLoadMore ? page.value : 1,
      limit: 10,
      status: currentFilter.value === 'all' ? undefined : currentFilter.value
    })
    
    if (response.success && response.data) {
      if (isLoadMore) {
        activities.value.push(...response.data.items)
      } else {
        activities.value = response.data.items
        page.value = 1
      }
      
      hasMore.value = response.data.hasMore || false
    } else {
      // 使用模拟数据
      const mockActivities = generateMockActivities()
      if (isLoadMore) {
        activities.value.push(...mockActivities)
      } else {
        activities.value = mockActivities
      }
    }
  } catch (error) {
    console.error('加载活动列表失败:', error)
    mobileStore.showToast('加载失败，请重试', 'error')
    
    // 使用模拟数据
    if (!isLoadMore) {
      activities.value = generateMockActivities()
    }
  } finally {
    loading.value = false
  }
}

const generateMockActivities = () => {
  return [
    {
      id: '498',
      title: '测试发布功能活动',
      description: '这是一个测试发布功能的活动，欢迎大家参加！',
      startTime: '2025-08-10T00:00:00',
      endTime: '2025-08-11T00:00:00',
      location: '测试地点',
      posterUrl: null,
      isFree: false,
      price: 0,
      status: 'published',
      groupBuyEnabled: true,
      groupBuyMinCount: 3,
      groupBuyPrice: 30
    },
    {
      id: '499',
      title: '亲子户外活动',
      description: '带着孩子一起享受大自然的美好时光',
      startTime: '2025-08-15T09:00:00',
      endTime: '2025-08-15T17:00:00',
      location: '森林公园',
      posterUrl: null,
      isFree: true,
      price: 0,
      status: 'published',
      groupBuyEnabled: false,
      groupBuyMinCount: 0,
      groupBuyPrice: 0
    },
    {
      id: '500',
      title: '儿童艺术创作工坊',
      description: '培养孩子的创造力和艺术天赋',
      startTime: '2025-08-20T14:00:00',
      endTime: '2025-08-20T16:00:00',
      location: '艺术中心',
      posterUrl: null,
      isFree: false,
      price: 50,
      status: 'published',
      groupBuyEnabled: true,
      groupBuyMinCount: 5,
      groupBuyPrice: 40
    }
  ]
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const clearSearch = () => {
  searchQuery.value = ''
}

const setFilter = (filterKey: string) => {
  currentFilter.value = filterKey
  loadActivities()
}

const handleActivityClick = (activity: any) => {
  router.push(`/mobile/activity-plan/${activity.id}`)
}

const loadMore = () => {
  page.value++
  loadActivities(true)
}

const refreshList = () => {
  page.value = 1
  hasMore.value = true
  loadActivities()
  mobileStore.showToast('刷新成功', 'success')
}

const handleBack = () => {
  router.back()
}

// 生命周期
onMounted(() => {
  loadActivities()
})
</script>

<style lang="scss" scoped>
.search-section {
  padding: var(--text-lg);
  background: white;
  border-bottom: var(--border-width-base) solid var(--bg-gray-light);
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border-radius: var(--text-3xl);
  padding: var(--spacing-sm) var(--text-lg);
  margin-bottom: var(--text-lg);
}

.search-icon {
  width: var(--text-2xl);
  height: var(--text-2xl);
  fill: var(--text-tertiary);
  margin-right: var(--spacing-sm);
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  font-size: var(--text-lg);
  outline: none;
  
  &::placeholder {
    color: var(--text-tertiary);
  }
}

.clear-btn {
  width: var(--text-2xl);
  height: var(--text-2xl);
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: var(--text-lg);
    height: var(--text-lg);
    fill: var(--text-tertiary);
  }
}

.filter-tabs {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.filter-tab {
  padding: var(--spacing-sm) var(--text-lg);
  border: var(--border-width-base) solid #e0e0e0;
  background: white;
  border-radius: var(--text-2xl);
  font-size: var(--text-base);
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  &.active {
    background: #1976d2;
    border-color: #1976d2;
    color: white;
  }
  
  &:not(.active):hover {
    background: var(--bg-secondary);
  }
}

.activity-list {
  flex: 1;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-10xl) var(--text-2xl);
}

.loading-spinner {
  width: var(--spacing-3xl);
  height: var(--spacing-3xl);
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1976d2;
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
  margin-bottom: var(--text-lg);
}

.loading-text {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-15xl) var(--text-2xl);
  text-align: center;
}

.empty-icon {
  font-size: var(--text-5xl);
  margin-bottom: var(--text-lg);
}

.empty-title {
  font-size: var(--text-xl);
  font-weight: 500;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
}

.empty-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0 0 var(--text-2xl) 0;
  line-height: 1.4;
}

.retry-btn {
  padding: var(--spacing-sm) var(--text-lg);
  background: #1976d2;
  color: white;
  border: none;
  border-radius: var(--text-2xl);
  font-size: var(--text-base);
  cursor: pointer;
}

.activity-cards {
  padding: var(--text-lg);
  display: flex;
  flex-direction: column;
  gap: var(--text-lg);
}

.load-more {
  padding: var(--text-2xl);
  text-align: center;
}

.load-more-btn {
  padding: var(--text-sm) var(--text-3xl);
  background: white;
  color: #1976d2;
  border: var(--border-width-base) solid #1976d2;
  border-radius: var(--text-3xl);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1976d2;
    color: white;
  }
}

.fab-container {
  position: fixed;
  bottom: var(--text-3xl);
  right: var(--text-3xl);
  z-index: 100;
}

.fab {
  width: var(--icon-size); height: var(--icon-size);
  background: #1976d2;
  color: white;
  border: none;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(25, 118, 210, 0.3);
  transition: all 0.2s ease;
  
  svg {
    width: var(--text-3xl);
    height: var(--text-3xl);
    fill: currentColor;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 375px) {
  .search-section {
    padding: var(--text-sm);
  }
  
  .activity-cards {
    padding: var(--text-sm);
    gap: var(--text-sm);
  }
  
  .fab-container {
    bottom: var(--text-2xl);
    right: var(--text-2xl);
  }
  
  .fab {
    width: var(--icon-size); height: var(--icon-size);
    
    svg {
      width: var(--text-2xl);
      height: var(--text-2xl);
    }
  }
}
</style>
