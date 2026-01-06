/**
 * 呼叫中心配置服务
 * 用于管理呼叫中心的动态配置
 */

import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { vosConfigAPI, type VOSConfig } from '@/api/modules/vos-config'

// 临时类型定义（后续可移到单独的types文件）
export interface CallerAccount {
  id: number
  name: string
  numbers: CallerNumber[]
}

export interface CallerNumber {
  id: string
  phoneNumber: string
  isPrimary?: boolean
}

export interface ExtensionConfig {
  id: string
  extensionNumber: string
  extensionName: string
  isOnline?: boolean
  currentStatus?: 'online' | 'offline' | 'busy'
}

// 全局配置状态
export const callCenterConfig = {
  // VOS配置
  vosConfig: ref<VOSConfig | null>(null),
  vosConnected: ref(false),

  // 主叫账号和号码
  callerAccounts: ref<CallerAccount[]>([]),
  availableCallerNumbers: ref<CallerNumber[]>([]),
  selectedCallerNumber: ref<CallerNumber | null>(null),

  // 分机配置
  extensions: ref<ExtensionConfig[]>([]),
  availableExtensions: ref<ExtensionConfig[]>([]),
  selectedExtension: ref<ExtensionConfig | null>(null),

  // 系统配置
  maxConcurrentCalls: ref(10),
  activeCallCount: ref(0),

  // 话术模板配置（这些将来也可以做成动态的）
  scriptTemplates: ref([
    {
      category: '问候话术',
      scripts: [
        { id: '1', title: '标准问候', content: '您好，我是XX机构的老师，请问您现在方便吗？' },
        { id: '2', title: '亲切问候', content: '您好呀，我是XX机构的学习顾问，想和您聊聊孩子的学习情况' }
      ]
    },
    {
      category: '产品介绍',
      scripts: [
        { id: '3', title: '课程介绍', content: '我们的课程采用最新的教学方法...' },
        { id: '4', title: '优势介绍', content: '相比其他机构，我们有以下优势...' }
      ]
    }
  ])
}

/**
 * 初始化呼叫中心配置
 */
export const initCallCenterConfig = async () => {
  try {
    console.log('🔄 初始化呼叫中心配置...')

    // 加载VOS配置
    await loadVosConfig()

    // 加载主叫账号和号码
    await loadCallerAccounts()

    // 加载分机配置
    await loadExtensions()

    console.log('✅ 呼叫中心配置初始化完成')
    return true
  } catch (error) {
    console.error('❌ 呼叫中心配置初始化失败:', error)
    ElMessage.error('呼叫中心配置初始化失败')
    return false
  }
}

/**
 * 加载VOS配置
 */
export const loadVosConfig = async () => {
  try {
    const response = await vosConfigAPI.getActiveConfig()
    if (response.success && response.data && !Array.isArray(response.data)) {
      callCenterConfig.vosConfig.value = response.data
      callCenterConfig.vosConnected.value = response.data.status === 'active'

      // 设置最大并发通话数
      if (response.data.maxConcurrentCalls) {
        callCenterConfig.maxConcurrentCalls.value = response.data.maxConcurrentCalls
      }

      console.log('✅ VOS配置加载成功:', response.data.name)
    } else {
      console.warn('⚠️ 未找到激活的VOS配置')
      callCenterConfig.vosConfig.value = null
      callCenterConfig.vosConnected.value = false
    }
  } catch (error) {
    console.error('❌ 加载VOS配置失败:', error)
    callCenterConfig.vosConfig.value = null
    callCenterConfig.vosConnected.value = false
  }
}

/**
 * 加载主叫账号和可用号码
 */
export const loadCallerAccounts = async () => {
  try {
    // TODO: 加载可用主叫号码（需要实现callerAccountApi）
    console.log('⚠️ 主叫账号API暂未实现')
    callCenterConfig.availableCallerNumbers.value = []
    callCenterConfig.callerAccounts.value = []
  } catch (error) {
    console.error('❌ 加载主叫账号失败:', error)
    callCenterConfig.availableCallerNumbers.value = []
    callCenterConfig.callerAccounts.value = []
  }
}

/**
 * 加载分机配置
 */
export const loadExtensions = async () => {
  try {
    // TODO: 加载可用分机（需要实现extensionConfigApi）
    console.log('⚠️ 分机配置API暂未实现')
    callCenterConfig.availableExtensions.value = []
    callCenterConfig.extensions.value = []
  } catch (error) {
    console.error('❌ 加载分机配置失败:', error)
    callCenterConfig.availableExtensions.value = []
    callCenterConfig.extensions.value = []
  }
}

/**
 * 重新加载所有配置
 */
export const reloadAllConfigs = async () => {
  await Promise.all([
    loadVosConfig(),
    loadCallerAccounts(),
    loadExtensions()
  ])
}

/**
 * 选择主叫号码
 */
export const selectCallerNumber = (number: CallerNumber) => {
  callCenterConfig.selectedCallerNumber.value = number
  console.log('📞 选择主叫号码:', number.phoneNumber)
}

/**
 * 选择分机
 */
export const selectExtension = (extension: ExtensionConfig) => {
  callCenterConfig.selectedExtension.value = extension
  console.log('📱 选择分机:', extension.extensionNumber)
}

/**
 * 测试VOS连接
 */
export const testVosConnection = async () => {
  try {
    const response = await vosConfigAPI.testConnection()
    if (response.success) {
      const isConnected = response.data?.status === 'active'
      callCenterConfig.vosConnected.value = isConnected
      if (isConnected) {
        ElMessage.success('VOS连接测试成功')
      } else {
        ElMessage.warning('VOS连接测试失败')
      }
      return isConnected
    }
    return false
  } catch (error) {
    console.error('❌ VOS连接测试失败:', error)
    callCenterConfig.vosConnected.value = false
    ElMessage.error('VOS连接测试失败')
    return false
  }
}

/**
 * 更新通话状态
 */
export const updateCallStatus = (callCount: number) => {
  callCenterConfig.activeCallCount.value = callCount
}

/**
 * 获取当前配置摘要
 */
export const getConfigSummary = () => {
  return {
    vosConnected: callCenterConfig.vosConnected.value,
    vosConfigName: callCenterConfig.vosConfig.value?.name || '未配置',
    selectedCallerNumber: callCenterConfig.selectedCallerNumber.value?.phoneNumber || '未选择',
    selectedExtension: callCenterConfig.selectedExtension.value?.extensionNumber || '未选择',
    activeCallCount: callCenterConfig.activeCallCount.value,
    maxConcurrentCalls: callCenterConfig.maxConcurrentCalls.value,
    availableExtensions: callCenterConfig.availableExtensions.value.length,
    availableCallerNumbers: callCenterConfig.availableCallerNumbers.value.length
  }
}

/**
 * 检查配置是否完整
 */
export const checkConfigCompleteness = () => {
  const issues = []

  if (!callCenterConfig.vosConfig.value) {
    issues.push('VOS配置未设置或未激活')
  }

  if (!callCenterConfig.vosConnected.value) {
    issues.push('VOS连接断开')
  }

  if (callCenterConfig.availableCallerNumbers.value.length === 0) {
    issues.push('没有可用的主叫号码')
  }

  if (callCenterConfig.availableExtensions.value.length === 0) {
    issues.push('没有可用的分机')
  }

  if (!callCenterConfig.selectedCallerNumber.value) {
    issues.push('未选择主叫号码')
  }

  if (!callCenterConfig.selectedExtension.value) {
    issues.push('未选择分机')
  }

  return {
    isComplete: issues.length === 0,
    issues
  }
}

/**
 * 获取配置建议
 */
export const getConfigSuggestions = () => {
  const suggestions = []

  if (!callCenterConfig.vosConfig.value) {
    suggestions.push({
      type: 'error',
      title: '配置VOS服务器',
      description: '请在系统设置中配置并激活VOS服务器',
      action: '去配置',
      actionUrl: '/system/vos-config'
    })
  }

  if (callCenterConfig.availableCallerNumbers.value.length === 0) {
    suggestions.push({
      type: 'warning',
      title: '添加主叫号码',
      description: '请添加至少一个主叫号码用于拨打电话',
      action: '去添加',
      actionUrl: '/system/caller-account'
    })
  }

  if (callCenterConfig.availableExtensions.value.length === 0) {
    suggestions.push({
      type: 'warning',
      title: '配置分机',
      description: '请配置至少一个分机用于接听电话',
      action: '去配置',
      actionUrl: '/system/extension-config'
    })
  }

  if (callCenterConfig.activeCallCount.value >= callCenterConfig.maxConcurrentCalls.value) {
    suggestions.push({
      type: 'info',
      title: '通话已满',
      description: '当前通话数已达到最大限制，请等待其他通话结束',
      action: null
    })
  }

  return suggestions
}