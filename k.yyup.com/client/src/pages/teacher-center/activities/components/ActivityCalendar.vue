<template>
  <div class="activity-calendar">
    <el-calendar v-model="selectedDate" @panel-change="handlePanelChange">
      <template #date-cell="{ data }">
        <div class="calendar-cell">
          <div class="date-number">{{ data.day.split('-').pop() }}</div>
          <div class="activity-indicators" v-if="getActivitiesForDate(data.day).length > 0">
            <div 
              v-for="activity in getActivitiesForDate(data.day).slice(0, 3)" 
              :key="activity.id"
              class="activity-dot"
              :class="getActivityStatusClass(activity.status)"
              :title="activity.title"
            ></div>
            <div 
              v-if="getActivitiesForDate(data.day).length > 3"
              class="more-indicator"
            >
              +{{ getActivitiesForDate(data.day).length - 3 }}
            </div>
          </div>
        </div>
      </template>
    </el-calendar>

    <!-- 选中日期的活动列表 -->
    <div class="selected-date-activities" v-if="selectedDateActivities.length > 0">
      <h3>{{ formatDate(selectedDate) }} 的活动</h3>
      <div class="activity-list">
        <div 
          v-for="activity in selectedDateActivities" 
          :key="activity.id"
          class="activity-item"
          @click="$emit('view-activity', activity)"
        >
          <div class="activity-info">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ activity.startTime }} - {{ activity.endTime }}</div>
            <div class="activity-location">📍 {{ activity.location }}</div>
          </div>
          <div class="activity-status">
            <el-tag :type="getStatusTagType(activity.status)">
              {{ getStatusText(activity.status) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Props
interface Activity {
  id: number
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
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
  'date-change': [date: Date]
}>()

// 响应式数据
const selectedDate = ref(new Date())

// 计算属性
const selectedDateActivities = computed(() => {
  const dateStr = selectedDate.value.toISOString().split('T')[0]
  return props.activities.filter(activity => activity.date === dateStr)
})

// 方法
const getActivitiesForDate = (dateStr: string) => {
  return props.activities.filter(activity => activity.date === dateStr)
}

const getActivityStatusClass = (status: string) => {
  const classMap = {
    'upcoming': 'status-upcoming',
    'ongoing': 'status-ongoing', 
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return classMap[status] || 'status-upcoming'
}

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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
}

const handlePanelChange = (date: Date) => {
  emit('date-change', date)
}

// 监听选中日期变化
watch(selectedDate, (newDate) => {
  emit('date-change', newDate)
})
</script>

<style lang="scss" scoped>
.activity-calendar {
  .calendar-cell {
    position: relative;
    min-height: 60px; height: auto;
    padding: var(--spacing-2xs);

    .date-number {
      font-size: var(--text-sm);
      font-weight: 500;
    }

    .activity-indicators {
      position: absolute;
      bottom: var(--spacing-2xs);
      left: var(--spacing-2xs);
      right: var(--spacing-2xs);
      display: flex;
      gap: var(--spacing-2xs);
      flex-wrap: wrap;
      
      .activity-dot {
        width: auto;
        min-height: 32px; height: auto;
        border-radius: var(--radius-full);

        &.status-upcoming {
          background-color: var(--info-color);
        }

        &.status-ongoing {
          background-color: var(--warning-color);
        }

        &.status-completed {
          background-color: var(--success-color);
        }

        &.status-cancelled {
          background-color: var(--danger-color);
        }
      }

      .more-indicator {
        font-size: var(--text-2xs);
        color: var(--text-muted);
      }
    }
  }
  
  .selected-date-activities {
    margin-top: var(--text-2xl);
    
    h3 {
      margin-bottom: var(--text-lg);
      color: var(--el-text-color-primary);
    }
    
    .activity-list {
      .activity-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--text-sm);
        margin-bottom: var(--spacing-sm);
        background: var(--el-fill-color-light);
        border-radius: var(--spacing-sm);
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
          background: var(--el-fill-color);
          transform: translateY(var(--z-index-below));
        }
        
        .activity-info {
          flex: 1;
          
          .activity-title {
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: var(--spacing-xs);
          }
          
          .activity-time {
            font-size: var(--text-sm);
            color: var(--el-text-color-regular);
            margin-bottom: var(--spacing-sm);
          }
          
          .activity-location {
            font-size: var(--text-sm);
            color: var(--el-text-color-secondary);
          }
        }
        
        .activity-status {
          margin-left: var(--text-sm);
        }
      }
    }
  }
}
</style>
