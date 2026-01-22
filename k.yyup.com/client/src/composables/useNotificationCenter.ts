/**
 * 通知中心组件
 *
 * 提供告警通知的展示和操作功能
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { alertApi, type Alert, type AlertLevel, type AlertStatus } from '@/api/modules/alert'

// 告警级别颜色映射
const levelColors: Record<AlertLevel, string> = {
  low: '#909399',
  medium: '#E6A23C',
  high: '#F56C6C',
  critical: '#C21F3A'
}

// 告警级别标签映射
const levelLabels: Record<AlertLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '紧急'
}

export function useNotificationCenter() {
  // 状态
  const alerts = ref<Alert[]>([])
  const loading = ref(false)
  const statistics = ref<{
    activeCount: number
    todayCount: number
    criticalCount: number
  }>({
    activeCount: 0,
    todayCount: 0,
    criticalCount: 0
  })

  // 计算属性
  const activeAlerts = computed(() =>
    alerts.value.filter(a => a.status === 'active')
  )

  const criticalAlerts = computed(() =>
    alerts.value.filter(a => a.alertLevel === 'critical' && a.status === 'active')
  )

  const unreadCount = computed(() =>
    alerts.value.filter(a => a.status === 'active').length
  )

  // 获取告警列表
  const fetchAlerts = async (params?: { page?: number; limit?: number; status?: AlertStatus }) => {
    try {
      loading.value = true
      const response = await alertApi.listAlerts({
        page: params?.page || 1,
        limit: params?.limit || 20,
        status: params?.status || 'active'
      })

      if (response.data?.alerts) {
        alerts.value = response.data.alerts
      }
    } catch (error) {
      console.error('获取告警列表失败:', error)
      // 使用模拟数据
      alerts.value = getMockAlerts()
    } finally {
      loading.value = false
    }
  }

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const response = await alertApi.getStatistics()
      if (response.data) {
        const byStatus = response.data.byStatus || []
        const activeItem = byStatus.find((s: any) => s.status === 'active')
        const byLevel = response.data.byLevel || []
        const criticalItem = byLevel.find((l: any) => l.alertLevel === 'critical')

        statistics.value = {
          activeCount: activeItem ? parseInt(activeItem.count) : 0,
          todayCount: response.data.todayCount || 0,
          criticalCount: criticalItem ? parseInt(criticalItem.count) : 0
        }
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }

  // 确认告警
  const acknowledgeAlert = async (alert: Alert) => {
    try {
      await ElMessageBox.confirm(
        `确定要确认告警"${alert.title}"吗？`,
        '确认告警',
        { confirmButtonText: '确认', cancelButtonText: '取消' }
      )

      await alertApi.updateAlert(alert.id, { status: 'acknowledged' })
      ElMessage.success('告警已确认')

      // 更新本地状态
      alert.status = 'acknowledged'
      alert.acknowledgedAt = new Date().toISOString()

      // 刷新统计数据
      await fetchStatistics()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('操作失败')
      }
    }
  }

  // 解决告警
  const resolveAlert = async (alert: Alert) => {
    try {
      const { value: resolution } = await ElMessageBox.prompt(
        '请输入解决方案（可选）：',
        '解决告警',
        {
          confirmButtonText: '解决',
          cancelButtonText: '取消',
          inputType: 'textarea',
          inputPattern: /\S+/,
          inputErrorMessage: '解决方案不能为空'
        }
      )

      await alertApi.updateAlert(alert.id, {
        status: 'resolved',
        resolution: resolution || undefined
      })
      ElMessage.success('告警已解决')

      // 更新本地状态
      alert.status = 'resolved'
      alert.resolvedAt = new Date().toISOString()

      // 刷新统计数据
      await fetchStatistics()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('操作失败')
      }
    }
  }

  // 忽略告警
  const dismissAlert = async (alert: Alert) => {
    try {
      await ElMessageBox.confirm(
        `确定要忽略告警"${alert.title}"吗？忽略后该告警将不再显示。`,
        '忽略告警',
        { confirmButtonText: '忽略', cancelButtonText: '取消', type: 'warning' }
      )

      await alertApi.updateAlert(alert.id, { status: 'dismissed' })
      ElMessage.success('告警已忽略')

      // 更新本地状态
      alert.status = 'dismissed'
      alert.resolvedAt = new Date().toISOString()

      // 刷新统计数据
      await fetchStatistics()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('操作失败')
      }
    }
  }

  // 获取告警类型图标
  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      attendance: 'Clock',
      payment: 'Money',
      health: 'FirstAidKit',
      safety: 'Lock',
      enrollment: 'User',
      custom: 'Bell'
    }
    return icons[type] || 'Bell'
  }

  // 格式化时间
  const formatTime = (timeStr: string): string => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) {
      return '刚刚'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  // 获取相对时间
  const getRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = date.getTime() - now.getTime()

    if (diff > 0) {
      const hours = Math.floor(diff / 3600000)
      if (hours < 24) {
        return `${hours}小时后触发`
      }
      return `${Math.floor(hours / 24)}天后触发`
    }
    return '已触发'
  }

  // 模拟数据
  const getMockAlerts = (): Alert[] => [
    {
      id: 1,
      alertType: 'attendance',
      alertLevel: 'high',
      title: '学生考勤异常提醒',
      description: '大一班学生小明今日未到校，已连续缺勤2天，请及时跟进。',
      sourceType: 'scheduled',
      sourceId: 'attendance-check-001',
      status: 'active',
      priority: 80,
      triggeredAt: new Date(Date.now() - 3600000).toISOString(),
      acknowledgedAt: null,
      acknowledgedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      resolution: null,
      metadata: { studentId: 1, className: '大一班' },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      deletedAt: null
    },
    {
      id: 2,
      alertType: 'payment',
      alertLevel: 'medium',
      title: '缴费到期提醒',
      description: '小红家长尚未缴纳本月托费，已逾期3天，请及时提醒。',
      sourceType: 'scheduled',
      sourceId: 'payment-check-002',
      status: 'active',
      priority: 50,
      triggeredAt: new Date(Date.now() - 86400000).toISOString(),
      acknowledgedAt: null,
      acknowledgedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      resolution: null,
      metadata: { parentId: 2, amount: 2800 },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      deletedAt: null
    },
    {
      id: 3,
      alertType: 'health',
      alertLevel: 'critical',
      title: '健康异常预警',
      description: '中二班出现3例手足口病疑似病例，请启动应急预案。',
      sourceType: 'system',
      sourceId: 'health-monitor-003',
      status: 'active',
      priority: 100,
      triggeredAt: new Date(Date.now() - 1800000).toISOString(),
      acknowledgedAt: null,
      acknowledgedBy: null,
      resolvedAt: null,
      resolvedBy: null,
      resolution: null,
      metadata: { classId: 5, caseCount: 3, disease: '手足口病' },
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      deletedAt: null
    }
  ]

  return {
    // 状态
    alerts,
    loading,
    statistics,

    // 计算属性
    activeAlerts,
    criticalAlerts,
    unreadCount,

    // 方法
    fetchAlerts,
    fetchStatistics,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    getTypeIcon,
    formatTime,
    getRelativeTime,
    levelColors,
    levelLabels
  }
}

export default useNotificationCenter
