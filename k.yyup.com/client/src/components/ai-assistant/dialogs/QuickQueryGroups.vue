<template>
  <div class="quick-query-groups">
    <!-- 分组选择阶段 -->
    <div v-if="currentStage === 'groups'" class="groups-stage">
      <div class="stage-header">
        <h4>🔍 快捷查询分组</h4>
        <p>选择一个分组查看相关查询</p>
        <!-- 调试信息 -->
        <div class="debug-info" style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--spacing-2xl);">
          加载状态: {{ loading ? '加载中...' : '已完成' }} |
          分组数量: {{ groups.length }} |
          当前阶段: {{ currentStage }}
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-content">
          <UnifiedIcon name="ai-center" />
          <p>正在加载分组数据...</p>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="groups.length === 0" class="empty-state">
        <p>暂无分组数据，请检查API连接</p>
        <el-button @click="loadGroups" size="small">重新加载</el-button>
        <el-button @click="testDirectAPI" size="small" type="primary">直接测试API</el-button>
      </div>

      <!-- 分组网格 -->
      <div v-else class="groups-grid">
        <div 
          v-for="group in groups" 
          :key="group.id"
          class="group-card"
          @click="selectGroup(group)"
        >
          <div class="group-icon">
            <UnifiedIcon name="ai-center" />
          </div>
          <div class="group-info">
            <h5>{{ group.name }}</h5>
            <p>{{ group.description }}</p>
            <span class="query-count">{{ group.queryCount || group.queries?.length || 0 }} 个查询</span>
          </div>
        </div>
      </div>
      
      <div class="stage-actions">
        <el-button @click="$emit('close')" size="small">取消</el-button>
      </div>
    </div>

    <!-- 查询选择阶段 -->
    <div v-if="currentStage === 'queries'" class="queries-stage">
      <div class="stage-header">
        <el-button 
          @click="backToGroups" 
          size="small" 
          text
          class="back-button"
        >
          <UnifiedIcon name="ArrowLeft" />
          返回分组
        </el-button>
        <h4>{{ selectedGroup?.name }}</h4>
        <p>{{ selectedGroup?.description }}</p>
      </div>

      <div class="queries-list">
        <div 
          v-for="query in selectedGroup?.queries" 
          :key="query.keyword"
          class="query-item"
          @click="selectQuery(query)"
        >
          <div class="query-main">
            <div class="query-keyword">{{ query.keyword }}</div>
            <div class="query-description">{{ query.description }}</div>
          </div>
          <div class="query-meta">
            <el-tag :type="getCategoryTagType(query.category)" size="small">
              {{ getCategoryLabel(query.category) }}
            </el-tag>
            <span class="token-cost">~{{ query.tokens }}T</span>
          </div>
        </div>
      </div>

      <div class="stage-actions">
        <el-button @click="backToGroups" size="small">返回</el-button>
        <el-button @click="$emit('close')" size="small">取消</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-stage" v-loading="loading">
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User, Calendar, Document, Money, Setting,
  TrendCharts, ArrowLeft, Loading
} from '@element-plus/icons-vue'
import { quickQueryGroupsApi } from '@/api/quick-query-groups'

// 接口定义
interface QuickQueryItem {
  keyword: string
  description: string
  tokens: number
  category: string
}

interface QuickQueryGroup {
  id: string
  name: string
  icon: string
  description: string
  queries?: QuickQueryItem[]
  queryCount?: number
}

// Props & Emits
const emit = defineEmits<{
  close: []
  selectQuery: [query: QuickQueryItem]
}>()

// 响应式数据
const loading = ref(false)
const currentStage = ref<'groups' | 'queries'>('groups')
const groups = ref<QuickQueryGroup[]>([])
const selectedGroup = ref<QuickQueryGroup | null>(null)

// 图标映射
const iconComponents = {
  user: User,
  calendar: Calendar,
  document: Document,
  money: Money,
  setting: Setting,
  chart: TrendCharts
}

// 计算属性
const getIconComponent = (iconName: string) => {
  return iconComponents[iconName as keyof typeof iconComponents] || User
}

// 类别标签类型映射
const getCategoryTagType = (category: string) => {
  const typeMap: Record<string, string> = {
    count: 'primary',
    analysis: 'success',
    list: 'info',
    navigation: 'warning',
    schedule: 'primary',
    ranking: 'success',
    trend: 'success',
    report: 'danger',
    status: 'info',
    overview: 'primary',
    summary: 'success'
  }
  return typeMap[category] || 'info'
}

// 类别标签文本映射
const getCategoryLabel = (category: string) => {
  const labelMap: Record<string, string> = {
    count: '统计',
    analysis: '分析',
    list: '列表',
    navigation: '导航',
    schedule: '日程',
    ranking: '排名',
    trend: '趋势',
    report: '报告',
    status: '状态',
    overview: '概览',
    summary: '汇总',
    info: '信息'
  }
  return labelMap[category] || category
}

// 方法
const loadGroups = async () => {
  try {
    loading.value = true
    console.log('🚀 QuickQueryGroups组件已挂载，开始加载分组...')

    // 直接使用fetch API测试，绕过axios拦截器
    const response = await fetch('/api/quick-query-groups/overview')
    console.log('📡 API响应状态:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('📦 API响应数据:', data)

      if (data.success) {
        groups.value = data.data
        console.log('✅ 快捷查询分组加载成功:', data.data)
        console.log('📊 分组数量:', data.data.length)
      } else {
        console.error('❌ 快捷查询分组加载失败:', data)
        ElMessage.error('加载快捷查询分组失败')
      }
    } else {
      const errorText = await response.text()
      console.error('❌ API请求失败:', response.status, errorText)
      ElMessage.error(`API请求失败: ${response.status}`)
    }
  } catch (error) {
    console.error('❌ 加载快捷查询分组异常:', error)
    ElMessage.error('加载快捷查询分组失败')
  } finally {
    loading.value = false
  }
}

const selectGroup = async (group: QuickQueryGroup) => {
  try {
    loading.value = true
    console.log('🔍 选择分组:', group.id, group.name)

    // 如果分组已有查询数据，直接使用
    if (group.queries && group.queries.length > 0) {
      console.log('✅ 使用缓存的分组数据')
      selectedGroup.value = group
      currentStage.value = 'queries'
      return
    }

    // 否则从API获取详细数据
    console.log('📡 从API获取分组详细数据:', group.id)

    // 直接使用fetch API，绕过axios拦截器
    const response = await fetch(`/api/quick-query-groups/${group.id}`)
    console.log('📡 API响应状态:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('📦 API响应数据:', data)

      if (data.success) {
        selectedGroup.value = data.data
        currentStage.value = 'queries'
        console.log('✅ 分组查询加载成功:', data.data.queries?.length, '个查询')
      } else {
        console.error('❌ API返回错误:', data.message)
        ElMessage.error(data.message || '获取分组查询失败')
      }
    } else {
      console.error('❌ API请求失败:', response.status, response.statusText)
      ElMessage.error(`请求失败: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('❌ 加载分组查询异常:', error)
    ElMessage.error('加载分组查询失败')
  } finally {
    loading.value = false
  }
}

const selectQuery = (query: QuickQueryItem) => {
  console.log('🎯 [QuickQueryGroups] 选择查询:', query)
  console.log('📤 [QuickQueryGroups] 触发selectQuery事件')
  emit('selectQuery', query)
  console.log('📤 [QuickQueryGroups] 触发close事件')
  emit('close')
}

const backToGroups = () => {
  currentStage.value = 'groups'
  selectedGroup.value = null
}

// 直接测试API
const testDirectAPI = async () => {
  try {
    console.log('🔍 开始直接测试API...')

    // 使用fetch直接调用API
    const response = await fetch('/api/quick-query-groups/overview')
    console.log('📡 Fetch响应状态:', response.status)

    const data = await response.json()
    console.log('📦 Fetch响应数据:', data)

    if (data.success && data.data) {
      groups.value = data.data
      ElMessage.success(`直接API调用成功，加载了${data.data.length}个分组`)
    } else {
      ElMessage.error('直接API调用失败: ' + (data.message || '未知错误'))
    }
  } catch (error) {
    console.error('❌ 直接API调用异常:', error)
    ElMessage.error('直接API调用异常: ' + error.message)
  }
}

// 生命周期
onMounted(() => {
  console.log('🚀 QuickQueryGroups组件已挂载，开始加载分组...')
  loadGroups()
})
</script>

<style scoped lang="scss">
// design-tokens 已通过 vite.config 全局注入
.quick-query-groups {
  width: 100%;
  max-width: 100%; max-width: 600px;
  
  .stage-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    
    h4 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--el-text-color-primary);
      font-size: var(--text-lg);
    }
    
    p {
      margin: 0;
      color: var(--el-text-color-regular);
      font-size: var(--text-base);
    }
    
    .back-button {
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  
  .groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--text-lg);
    margin-bottom: var(--spacing-xl);
    
    .group-card {
      display: flex;
      align-items: center;
      padding: var(--text-lg);
      border: var(--border-width) solid var(--el-border-color-light);
      border-radius: var(--spacing-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
        transform: translateY(var(--transform-hover-lift));
      }
      
      .group-icon {
        margin-right: var(--text-sm);
        color: var(--el-color-primary);
      }
      
      .group-info {
        flex: 1;
        
        h5 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        
        p {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: var(--text-sm);
          color: var(--el-text-color-regular);
          line-height: 1.4;
        }
        
        .query-count {
          font-size: var(--text-sm);
          color: var(--el-color-primary);
          font-weight: 500;
        }
      }
    }
  }
  
  .queries-list {
    max-min-height: 60px; height: auto;
    overflow-y: auto;
    margin-bottom: var(--spacing-xl);
    
    .query-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--text-sm) var(--text-lg);
      border: var(--border-width) solid var(--el-border-color-lighter);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-sm);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: rgba(99, 102, 241, 0.4);
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
        box-shadow: 0 var(--spacing-xs) var(--text-sm) rgba(99, 102, 241, 0.15);
      }
      
      .query-main {
        flex: 1;
        
        .query-keyword {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .query-description {
          font-size: var(--text-sm);
          color: var(--el-text-color-regular);
          line-height: 1.4;
        }
      }
      
      .query-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        
        .token-cost {
          font-size: var(--text-xs);
          color: var(--el-text-color-secondary);
          background: var(--el-fill-color-light);
          padding: var(--spacing-sm) 6px;
          border-radius: var(--spacing-xs);
        }
      }
    }
  }
  
  .stage-actions {
    display: flex;
    justify-content: center;
    gap: var(--text-sm);
    padding-top: var(--text-lg);
    border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
  }
  
  .loading-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-10xl);

    p {
      margin-top: var(--text-lg);
      color: var(--el-text-color-regular);
    }
  }

  .loading-state {
    text-align: center;
    padding: var(--spacing-10xl) var(--spacing-xl);

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--text-sm);

      .el-icon {
        font-size: var(--text-3xl);
        color: var(--el-color-primary);
      }

      p {
        margin: 0;
        color: var(--el-text-color-regular);
        font-size: var(--text-base);
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: var(--spacing-10xl) var(--spacing-xl);
    color: var(--el-text-color-secondary);

    p {
      margin: 0 0 var(--text-lg) 0;
      font-size: var(--text-base);
    }

    .el-button {
      margin: 0 var(--spacing-xs);
    }
  }
}
</style>
