import { RouteRecordRaw } from 'vue-router'
import { centersRoutes as mobileCentersRoutes } from './centers-routes'
import { mobileTeacherCenterRoutes } from './teacher-center-routes'
import { mobileParentCenterRoutes } from './parent-center-routes'

/**
 * 移动端路由主入口文件
 * 整合所有移动端路由模块
 */

// 移动端根路由
const mobileRootRoute: RouteRecordRaw = {
  path: '/mobile',
  name: 'MobileRoot',
  redirect: '/mobile/centers',
  meta: {
    title: '移动端应用',
    requiresAuth: true
  }
}

// 整合所有移动端路由
export const mobileRoutes: RouteRecordRaw[] = [
  mobileRootRoute,
  ...mobileCentersRoutes,
  ...mobileTeacherCenterRoutes,
  ...mobileParentCenterRoutes
]

/**
 * 路由结构分析报告
 *
 * PC端 vs 移动端路由1:1对应分析：
 *
 * 1. Centers模块 (20个中心) ✅
 *    - activity-center, analytics-center, assessment-center
 *    - attendance-center, business-center, call-center
 *    - customer-pool-center, document-center, enrollment-center
 *    - finance-center, inspection-center, marketing-center
 *    - my-task-center, notification-center, permission-center
 *    - photo-album-center, principal-center, schedule-center
 *    - settings-center, student-center, system-center
 *    - teaching-center, user-center
 *
 * 2. Teacher Center模块 (15个功能) ✅
 *    - dashboard, notifications, tasks, activities
 *    - enrollment, teaching, creative-curriculum
 *    - customer-tracking, attendance, performance-rewards
 *    - appointment-management, class-contacts, customer-pool
 *    - 以及相关的子路由详情页面
 *
 * 3. Parent Center模块 (38个功能) ✅
 *    - dashboard, profile, children管理
 *    - assessment测评系统 (6个子模块)
 *    - games游戏大厅 (10个游戏 + 2个管理页面)
 *    - activities, notifications, photo-album
 *    - promotion-center, kindergarten-rewards
 *    - chat, smart-communication, feedback
 *    - share-stats
 *
 * 技术特点：
 * ✅ 使用Vue Router 4的TypeScript类型
 * ✅ 支持分级嵌套路由（children数组）
 * ✅ 路径保持与PC端一致（/mobile前缀）
 * ✅ 权限控制与PC端保持一致
 * ✅ 使用移动端专用的Layout组件
 * ✅ 完整的meta信息配置
 * ✅ 支持懒加载组件导入
 */

export default mobileRoutes