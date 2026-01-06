<template>
  <div class="activity-list">
    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="状态筛选">
          <el-select v-model="filterForm.status" placeholder="选择状态" clearable>
            <el-option label="即将开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型筛选">
          <el-select v-model="filterForm.type" placeholder="选择类型" clearable>
            <el-option label="教学活动" value="teaching" />
            <el-option label="户外活动" value="outdoor" />
            <el-option label="节日庆典" value="festival" />
            <el-option label="家长活动" value="parent" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="搜索活动标题或内容"
            style="max-width: 200px; width: 100%"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <UnifiedIcon name="Search" />
            搜索
          </el-button>
          <el-button @click="handleResetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 活动列表 -->
    <div class="list-container">
      <div class="list-header">
        <span class="list-title">活动列表</span>
        <div class="list-actions">
          <el-button type="primary" @click="$emit('create-activity')">
            <UnifiedIcon name="Plus" />
            新建活动
          </el-button>
        </div>
      </div>

      <div class="activities-grid">
        <div 
          v-for="activity in filteredActivities" 
          :key="activity.id"
          class="activity-card"
          @click="$emit('view-activity', activity)"
        >
          <div class="activity-header">
            <div class="activity-title">{{ activity.title }}</div>
            <el-tag :type="getStatusTagType(activity.status)" size="small">
              {{ getStatusText(activity.status) }}
            </el-tag>
          </div>
          
          <div class="activity-content">
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-meta">
              <div class="meta-item">
                <UnifiedIcon name="default" />
                <span>{{ formatDate(activity.date) }}</span>
              </div>
              <div class="meta-item">
                <UnifiedIcon name="default" />
                <span>{{ activity.startTime }} - {{ activity.endTime }}</span>
              </div>
              <div class="meta-item">
                <UnifiedIcon name="default" />
                <span>{{ activity.location }}</span>
              </div>
              <div class="meta-item">
                <UnifiedIcon name="default" />
                <span>{{ activity.participantCount || 0 }} 人参与</span>
              </div>
            </div>
          </div>
          
          <div class="activity-actions">
            <el-button size="small" @click.stop="$emit('edit-activity', activity)">
              编辑
            </el-button>
            <el-button size="small" @click.stop="$emit('manage-signin', activity)">
              签到管理
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click.stop="$emit('delete-activity', activity)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredActivities.length === 0" class="empty-state">
        <el-empty description="暂无活动数据" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, Calendar, Clock, Location, User } from '@element-plus/icons-vue'

// Props
interface Activity {
  id: number
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  type: 'teaching' | 'outdoor' | 'festival' | 'parent'
  participantCount?: number
}

interface Props {
  activities: Activity[]
}

const props = withDefaults(defineProps<Props>(), {
  activities: () => []
})

// Emits
const emit = defineEmits<{
  'view-activity': [activity: Activity]
  'edit-activity': [activity: Activity]
  'delete-activity': [activity: Activity]
  'create-activity': []
  'manage-signin': [activity: Activity]
}>()

// 响应式数据
const filterForm = ref({
  status: '',
  type: '',
  keyword: ''
})

// 计算属性
const filteredActivities = computed(() => {
  let result = props.activities

  if (filterForm.value.status) {
    result = result.filter(activity => activity.status === filterForm.value.status)
  }

  if (filterForm.value.type) {
    result = result.filter(activity => activity.type === filterForm.value.type)
  }

  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase()
    result = result.filter(activity => 
      activity.title.toLowerCase().includes(keyword) ||
      activity.description.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 方法
const getStatusTagType = (status: string) => {
  const typeMap = {
    'upcoming': 'info',
    'ongoing': 'warning',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap = {
    'upcoming': '即将开始',
    'ongoing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return textMap[status] || '未知'
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const handleResetFilter = () => {
  Object.assign(filterForm.value, {
    status: '',
    type: '',
    keyword: ''
  })
}
</script>

<style lang="scss" scoped>
.activity-list {
  .filter-section {
    margin-bottom: var(--text-2xl);
    padding: var(--text-lg);
    background: var(--el-fill-color-light);
    border-radius: var(--spacing-sm);
  }

  .list-container {
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--text-lg);

      .list-title {
        font-size: var(--text-xl);
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .activities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: var(--text-lg);

      .activity-card {
        background: var(--el-bg-color);
        border: var(--border-width-base) solid var(--el-border-color-light);
        border-radius: var(--spacing-sm);
        padding: var(--text-lg);
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 var(--spacing-xs) var(--text-sm) var(--shadow-light);
          transform: translateY(var(--transform-hover-lift));
        }

        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--text-sm);

          .activity-title {
            font-size: var(--text-lg);
            font-weight: 600;
            color: var(--el-text-color-primary);
            flex: 1;
            margin-right: var(--spacing-sm);
          }
        }

        .activity-content {
          .activity-description {
            color: var(--el-text-color-regular);
            margin-bottom: var(--text-sm);
            line-height: 1.5;
          }

          .activity-meta {
            .meta-item {
              display: flex;
              align-items: center;
              margin-bottom: var(--spacing-xs);
              font-size: var(--text-sm);
              color: var(--el-text-color-secondary);

              .el-icon {
                margin-right: var(--spacing-xs);
                font-size: var(--text-base);
              }
            }
          }
        }

        .activity-actions {
          margin-top: var(--text-sm);
          padding-top: var(--text-sm);
          border-top: var(--z-index-dropdown) solid var(--el-border-color-lighter);
          display: flex;
          gap: var(--spacing-sm);
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-10xl);
    }
  }
}
</style>
