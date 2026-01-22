/**
 * 全站健康检测系统 - 代理索引
 *
 * 导出所有检测代理，方便统一调用
 */

export { default as runSiteHealthMaster } from './site-health-master'
export { default as runAdminAgent } from './admin-agent'
export { default as runPrincipalAgent } from './principal-agent'
export { default as runTeacherAgent } from './teacher-agent'
export { default as runParentAgent } from './parent-agent'
export { default as runCommonAgent } from './common-agent'

/**
 * 角色类型
 */
export type Role = 'admin' | 'principal' | 'teacher' | 'parent' | 'common'

/**
 * 检测结果类型
 */
export interface TestResult {
  page: string
  role: Role
  status: 'pass' | 'fail' | 'warning'
  errors: ConsoleError[]
  warnings: ConsoleWarning[]
  elements: {
    buttons: number
    inputs: number
    cards: number
    tables: number
    dialogs: number
  }
  timestamp: string
}

/**
 * 控制台错误类型
 */
export interface ConsoleError {
  type: string
  message: string
  location?: string
  timestamp: string
}

/**
 * 控制台警告类型
 */
export interface ConsoleWarning {
  type: string
  message: string
  timestamp: string
}

/**
 * 页面状态类型
 */
export interface PageStatus {
  route: string
  name: string
  status: 'pending' | 'testing' | 'completed' | 'failed'
  errors: number
  warnings: number
  timestamp?: string
  errorDetails?: string[]
}

/**
 * 角色统计类型
 */
export interface RoleStatistics {
  total: number
  completed: number
  failed: number
  successRate: string
}

/**
 * 运行所有检测代理
 */
export async function runAllAgents(
  baseUrl: string = 'http://localhost:5173'
): Promise<{
  admin: ReturnType<typeof runAdminAgent>
  principal: ReturnType<typeof runPrincipalAgent>
  teacher: ReturnType<typeof runTeacherAgent>
  parent: ReturnType<typeof runParentAgent>
  common: ReturnType<typeof runCommonAgent>
}> {
  const [admin, principal, teacher, parent, common] = await Promise.all([
    runAdminAgent(baseUrl),
    runPrincipalAgent(baseUrl),
    runTeacherAgent(baseUrl),
    runParentAgent(baseUrl),
    runCommonAgent(baseUrl),
  ])

  return { admin, principal, teacher, parent, common }
}

/**
 * 生成综合报告
 */
export function generateSummaryReport(
  results: {
    admin: ReturnType<typeof runAdminAgent>
    principal: ReturnType<typeof runPrincipalAgent>
    teacher: ReturnType<typeof runTeacherAgent>
    parent: ReturnType<typeof runParentAgent>
    common: ReturnType<typeof runCommonAgent>
  }
): string {
  const total =
    results.admin.total +
    results.principal.total +
    results.teacher.total +
    results.parent.total +
    results.common.total

  const completed =
    results.admin.completed +
    results.principal.completed +
    results.teacher.completed +
    results.parent.completed +
    results.common.completed

  const failed =
    results.admin.failed +
    results.principal.failed +
    results.teacher.failed +
    results.parent.failed +
    results.common.failed

  const successRate = ((completed / total) * 100).toFixed(2)

  return `
全站健康检测报告
================

总页面数: ${total}
成功: ${completed}
失败: ${failed}
成功率: ${successRate}%

按角色统计:
- 管理员: ${results.admin.completed}/${results.admin.total} (${((results.admin.completed / results.admin.total) * 100).toFixed(2)}%)
- 园长: ${results.principal.completed}/${results.principal.total} (${((results.principal.completed / results.principal.total) * 100).toFixed(2)}%)
- 教师: ${results.teacher.completed}/${results.teacher.total} (${((results.teacher.completed / results.teacher.total) * 100).toFixed(2)}%)
- 家长: ${results.parent.completed}/${results.parent.total} (${((results.parent.completed / results.parent.total) * 100).toFixed(2)}%)
- 公共: ${results.common.completed}/${results.common.total} (${((results.common.completed / results.common.total) * 100).toFixed(2)}%)
`
}
