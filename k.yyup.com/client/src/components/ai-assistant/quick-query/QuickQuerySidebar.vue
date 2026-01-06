<!--
  快捷查询侧边栏组件
  替换原来的专家选择面板
-->

<template>
  <div 
    class="quick-query-sidebar" 
    :class="{ 'collapsed': collapsed }"
  >
    <!-- 折叠/展开按钮 -->
    <div class="toggle-btn" @click="$emit('toggle')">
      <el-icon>
        <DArrowLeft v-if="!collapsed" />
        <DArrowRight v-else />
      </el-icon>
    </div>

    <!-- 侧边栏内容 -->
    <div class="sidebar-content" v-show="!collapsed">
      <!-- 标题区域 -->
      <div class="sidebar-header">
        <div class="header-icon">
          <UnifiedIcon name="search" :size="16" />
        </div>
        <div class="header-text">
          <h3>🔍 快捷查询</h3>
          <p>点击快速发送查询</p>
        </div>
      </div>

      <!-- 快捷查询列表 -->
      <div class="query-section">
        <div class="query-list">
          <div
            v-for="query in quickQueries"
            :key="query.keyword"
            class="query-card"
            @click="handleQueryClick(query)"
          >
            <div class="query-icon">{{ query.icon || '🔍' }}</div>
            <div class="query-info">
              <div class="query-keyword">{{ query.keyword }}</div>
              <div class="query-desc">{{ query.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="sidebar-footer">
        <div class="footer-tip">
          共 {{ quickQueries.length }} 个快捷查询
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Search,
  DArrowLeft,
  DArrowRight
} from '@element-plus/icons-vue'
import { quickQueryGroupsApi } from '@/api/quick-query-groups'

// ==================== Props ====================
interface Props {
  collapsed: boolean
}

const props = defineProps<Props>()

// ==================== Emits ====================
const emit = defineEmits<{
  toggle: []
  'select-query': [query: QuickQueryItem]
}>()

// ==================== Types ====================
interface QuickQueryItem {
  keyword: string
  description: string
  tokens?: number
  category?: string
  icon?: string
}

interface QuickQueryGroup {
  id: string
  name: string
  icon: string
  description: string
  queries?: QuickQueryItem[]
  queryCount?: number
}

// ==================== State ====================
const quickQueries = ref<QuickQueryItem[]>([])
const loading = ref(false)

// ==================== Methods ====================
const loadQuickQueries = async () => {
  try {
    loading.value = true
    // 先获取分组概览
    const overviewResponse = await quickQueryGroupsApi.getGroupsOverview()
    // API 返回格式可能是 { success: true, data: [...] } 或直接是数组
    const groups = (overviewResponse?.data || overviewResponse || []) as any[]
    
    if (!Array.isArray(groups) || groups.length === 0) {
      console.warn('⚠️ [快捷查询] 未获取到分组数据，使用默认查询')
      quickQueries.value = getDefaultQueries()
      return
    }
    
    // 将所有分组的查询合并到一个列表中
    const allQueries: QuickQueryItem[] = []
    
    // 并行加载所有分组的详细数据
    const groupPromises = groups.map(async (group) => {
      try {
        const groupResponse = await quickQueryGroupsApi.getGroupById(group.id)
        // API 返回格式可能是 { success: true, data: {...} } 或直接是对象
        const groupData = groupResponse?.data || groupResponse
        if (groupData?.queries && Array.isArray(groupData.queries) && groupData.queries.length > 0) {
          // 为每个查询添加分组图标
          return groupData.queries.map((query: any) => ({
            keyword: query.keyword || '',
            description: query.description || '',
            tokens: query.tokens || 0,
            category: query.category || '',
            icon: getGroupIcon(group.icon || '')
          }))
        }
        return []
      } catch (err) {
        console.warn(`⚠️ [快捷查询] 无法加载分组 ${group.id} 的查询:`, err)
        return []
      }
    })
    
    const allGroupQueries = await Promise.all(groupPromises)
    allQueries.push(...allGroupQueries.flat())
    
    // 如果加载到的查询为空，使用默认查询
    if (allQueries.length === 0) {
      console.warn('⚠️ [快捷查询] 所有分组查询为空，使用默认查询')
      quickQueries.value = getDefaultQueries()
    } else {
      // 按使用频率或类别排序（可以后续优化）
      quickQueries.value = allQueries.slice(0, 50) // 限制显示前50个最常用的
    }
  } catch (error) {
    console.error('❌ [快捷查询] 加载失败:', error)
    // 使用默认快捷查询作为降级方案
    quickQueries.value = getDefaultQueries()
  } finally {
    loading.value = false
  }
}

// 获取分组图标
const getGroupIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    user: '👤',
    calendar: '📅',
    document: '📄',
    money: '💰',
    setting: '⚙️',
    chart: '📊'
  }
  return iconMap[iconName] || '🔍'
}

// 默认快捷查询（降级方案）
const getDefaultQueries = (): QuickQueryItem[] => {
  return [
    { keyword: '查询所有学生', description: '查看所有学生列表', icon: '👥' },
    { keyword: '查询所有教师', description: '查看所有教师列表', icon: '👨‍🏫' },
    { keyword: '查询所有班级', description: '查看所有班级列表', icon: '🏫' },
    { keyword: '查询今日课程', description: '查看今日课程安排', icon: '📅' },
    { keyword: '查询学生出勤', description: '查看学生出勤情况', icon: '✅' },
    { keyword: '查询活动列表', description: '查看所有活动', icon: '🎉' },
    { keyword: '查询费用统计', description: '查看费用统计信息', icon: '💰' },
    { keyword: '查询数据概览', description: '查看数据概览', icon: '📊' }
  ]
}

// 处理查询点击
const handleQueryClick = (query: QuickQueryItem) => {
  console.log('🎯 [快捷查询] 点击查询:', query)
  emit('select-query', query)
}

// ==================== Lifecycle ====================
onMounted(() => {
  loadQuickQueries()
})
</script>

<style lang="scss" scoped>
// design-tokens 已通过 vite.config 全局注入

.quick-query-sidebar {
  /* 使用独立样式而不是继承 */
  
  .query-section {
    flex: 1;
    overflow-y: auto;
    margin-top: var(--text-lg);
  }
  
  .query-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .query-card {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
    padding: var(--text-sm);
    background: var(--el-fill-color-extra-light);
    border: var(--border-width) solid var(--el-border-color-lighter);
    border-radius: var(--spacing-sm);
    cursor: pointer;
    transition: all var(--transition-fast) ease;
    
    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-color-primary);
      transform: translateX(var(--spacing-xs));
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
    }
    
    .query-icon {
      font-size: var(--spacing-xl);
      flex-shrink: 0;
    }
    
    .query-info {
      flex: 1;
      min-width: 0;
    }
    
    .query-keyword {
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: var(--spacing-xs);
      font-size: var(--text-base);
    }
    
    .query-desc {
      font-size: var(--text-sm);
      color: var(--el-text-color-secondary);
      white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  
  .sidebar-footer {
    margin-top: var(--text-lg);
    padding-top: var(--text-lg);
    border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
  }
  
  .footer-tip {
    font-size: var(--text-sm);
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}
</style>

