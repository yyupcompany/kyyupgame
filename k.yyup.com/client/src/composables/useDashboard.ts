// Mock Vue functions for TypeScript compilation
const ref = (value: any) => ({ value })
const computed = (fn: any) => ({ value: fn() })
const onMounted = (_fn: any) => {}
const onUnmounted = (_fn: any) => {}

import { ElMessage } from 'element-plus'
// Mock types
// type DashboardStats = {
//   totalStudents: string
//   totalTeachers: string
//   totalClasses: string
//   activeEnrollments: string
// }
// type RecentActivity = { id: string; [key: string]: any }
// type UpcomingEvent = { id: string; [key: string]: any }

/**
 * Dashboard composable with data management and auto-refresh functionality
 */
export function useDashboard() {
  const stats = ref(null)
  const recentActivities = ref([])
  const upcomingEvents = ref([])
  const loading = ref({
    stats: false,
    activities: false,
    events: false
  })
  const lastRefresh = ref(null)
  const refreshInterval = ref(null)

  const isLoading = computed(() => 
    loading.value.stats || loading.value.activities || loading.value.events
  )

  /**
   * Fetch dashboard statistics with error handling
   */
  const fetchStats = async (): Promise<void> => {
    loading.value.stats = true
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      stats.value = {
        totalStudents: 150,
        totalTeachers: 20,
        totalClasses: 8,
        activeEnrollments: 25
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error)
      ElMessage.error('数据加载失败')
      throw error
    } finally {
      loading.value.stats = false
    }
  }

  /**
   * Fetch recent activities
   */
  const fetchRecentActivities = async (): Promise<void> => {
    loading.value.activities = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      recentActivities.value = [
        { 
          id: 1, 
          type: 'enrollment', 
          description: '新学生张三报名', 
          time: new Date().toISOString() 
        },
        { 
          id: 2, 
          type: 'class', 
          description: '小班A开始上课', 
          time: new Date().toISOString() 
        }
      ]
    } catch (error: any) {
      console.error('Failed to fetch recent activities:', error)
      ElMessage.error('活动数据加载失败')
    } finally {
      loading.value.activities = false
    }
  }

  /**
   * Fetch upcoming events
   */
  const fetchUpcomingEvents = async (): Promise<void> => {
    loading.value.events = true
    
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      upcomingEvents.value = [
        { 
          id: 1, 
          title: '家长会', 
          date: '2023-01-15', 
          time: '14:00' 
        },
        { 
          id: 2, 
          title: '体检日', 
          date: '2023-01-20', 
          time: '09:00' 
        }
      ]
    } catch (error: any) {
      console.error('Failed to fetch upcoming events:', error)
      ElMessage.error('事件数据加载失败')
    } finally {
      loading.value.events = false
    }
  }

  /**
   * Refresh all dashboard data
   */
  const refreshData = async (): Promise<void> => {
    try {
      await Promise.all([
        fetchStats(),
        fetchRecentActivities(),
        fetchUpcomingEvents()
      ])
      
      lastRefresh.value = new Date()
      ElMessage.success('数据刷新成功')
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error)
    }
  }

  /**
   * Start auto-refresh timer
   */
  const startAutoRefresh = (intervalMs: number = 30000): void => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
    }
    
    refreshInterval.value = setInterval(() => {
      refreshData()
    }, intervalMs)
  }

  /**
   * Stop auto-refresh timer
   */
  const stopAutoRefresh = (): void => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }

  /**
   * Handle empty data state
   */
  const hasData = computed(() => {
    return stats.value && (
      stats.value.totalStudents > 0 ||
      stats.value.totalTeachers > 0 ||
      stats.value.totalClasses > 0 ||
      stats.value.activeEnrollments > 0
    )
  })

  /**
   * Format statistics for display
   */
  const formattedStats = computed(() => {
    if (!stats.value) return null
    
    return {
      students: {
        title: '学生总数',
        value: stats.value.totalStudents.toString(),
        key: 'students'
      },
      teachers: {
        title: '教师总数', 
        value: stats.value.totalTeachers.toString(),
        key: 'teachers'
      },
      classes: {
        title: '班级总数',
        value: stats.value.totalClasses.toString(), 
        key: 'classes'
      },
      enrollments: {
        title: '活跃招生',
        value: stats.value.activeEnrollments.toString(),
        key: 'enrollments'
      }
    }
  })

  // Lifecycle hooks
  onMounted(() => {
    refreshData()
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    // State
    stats: computed(() => stats.value),
    recentActivities: computed(() => recentActivities.value),
    upcomingEvents: computed(() => upcomingEvents.value),
    loading: computed(() => loading.value),
    isLoading,
    lastRefresh: computed(() => lastRefresh.value),
    hasData,
    formattedStats,
    
    // Methods
    refreshData,
    fetchStats,
    fetchRecentActivities,
    fetchUpcomingEvents,
    startAutoRefresh,
    stopAutoRefresh
  }
}