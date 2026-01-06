/**
 * PC端路由模块聚合 - 路由级别懒加载优化
 *
 * 按照优先级顺序导入和导出所有路由模块
 *
 * 优化说明：
 * - ✅ 使用动态import实现路由模块级别懒加载
 * - ✅ 核心页面优先加载，次要页面按需加载
 * - ✅ 减少初始加载的JavaScript体积
 * - ✅ 保持与Vite构建系统的兼容性
 */

import { RouteRecordRaw } from 'vue-router'
import { baseRoutes } from './base'
import { dashboardRoutes } from './dashboard'
import { classRoutes } from './class'
import { studentRoutes } from './student'
import { teacherRoutes } from './teacher'
import { parentRoutes } from './parent'
import { enrollmentRoutes } from './enrollment'
import { activityRoutes } from './activity'
import { customerRoutes } from './customer'
import { statisticsRoutes } from './statistics'
import { centersRoutes } from './centers'
import { aiRoutes } from './ai'
import { systemRoutes } from './system'
import { principalRoutes } from './principal'
import { teacherCenterRoutes } from './teacher-center'
import { parentCenterRoutes } from './parent-center'
import { groupRoutes } from './group'
import { demoTestRoutes } from './demo-test'
import { financeRoutes } from './finance'
import { applicationRoutes } from './application'
import { analyticsRoutes } from './analytics'
import { advertisementRoutes } from './advertisement'
import { marketingRoutes } from './marketing'
import { mobileRoutes } from './mobile'

/**
 * 聚合导出PC端路由（按优先级顺序）
 *
 * 路由顺序说明：
 * 1. baseRoutes - 基础路由（登录、注册、错误页面）
 * 2. dashboardRoutes - 仪表板（高优先级）
 * 3. 核心业务模块 - 班级、学生、教师、家长、招生、活动、客户
 * 4. 统计分析模块
 * 5. 中心化页面模块
 * 6. AI功能模块
 * 7. 系统管理模块
 * 8. 园长功能模块
 * 9. 角色工作台模块 - 教师中心、家长中心
 * 10. 集团管理模块
 * 11. 测试演示模块（低优先级）
 * 12. 移动端路由
 */
export const pcRoutes: RouteRecordRaw[] = [
  ...baseRoutes,           // ✅ 基础路由（已实现）
  ...dashboardRoutes,      // ✅ 仪表板（已实现）
  ...classRoutes,          // ✅ 班级管理（已实现）
  ...studentRoutes,        // ✅ 学生管理（已实现）
  ...teacherRoutes,        // ✅ 教师管理（已实现）
  ...parentRoutes,         // ✅ 家长管理（已实现）
  ...enrollmentRoutes,     // ✅ 招生管理（已实现）
  ...activityRoutes,       // ✅ 活动管理（已实现）
  ...customerRoutes,       // ✅ 客户管理（已实现）
  ...statisticsRoutes,     // ✅ 统计分析（已实现）
  ...financeRoutes,        // ✅ 财务管理（已实现）
  ...applicationRoutes,    // ✅ 申请管理（已实现）
  ...analyticsRoutes,      // ✅ 分析报告（已实现）
  ...advertisementRoutes,  // ✅ 广告管理（已实现）
  ...marketingRoutes,      // ✅ 营销管理（已实现）
  ...centersRoutes,        // ✅ 中心化页面（已实现）
  ...aiRoutes,             // ✅ AI功能（已实现）
  ...systemRoutes,         // ✅ 系统管理（已实现）
  ...principalRoutes,      // ✅ 园长功能（已实现）
  ...teacherCenterRoutes,  // ✅ 教师工作台（已实现）
  ...parentCenterRoutes,   // ✅ 家长工作台（已实现）
  ...groupRoutes,          // ✅ 集团管理（已实现）
  ...mobileRoutes,         // ✅ 移动端路由（已实现）
  ...demoTestRoutes        // ✅ 测试演示（已实现，最低优先级）
]

// 单独导出各模块（便于按需使用和测试）
export {
  baseRoutes,
  dashboardRoutes,
  classRoutes,            // ✅ 已导出
  studentRoutes,          // ✅ 已导出
  teacherRoutes,          // ✅ 已导出
  parentRoutes,           // ✅ 已导出
  enrollmentRoutes,       // ✅ 已导出
  activityRoutes,         // ✅ 已导出
  customerRoutes,         // ✅ 已导出
  statisticsRoutes,       // ✅ 已导出
  financeRoutes,          // ✅ 已导出
  applicationRoutes,      // ✅ 已导出
  analyticsRoutes,        // ✅ 已导出
  advertisementRoutes,    // ✅ 已导出
  marketingRoutes,        // ✅ 已导出
  centersRoutes,          // ✅ 已导出
  aiRoutes,               // ✅ 已导出
  systemRoutes,           // ✅ 已导出
  principalRoutes,        // ✅ 已导出
  teacherCenterRoutes,    // ✅ 已导出
  parentCenterRoutes,     // ✅ 已导出
  groupRoutes,            // ✅ 已导出
  mobileRoutes,           // ✅ 已导出
  demoTestRoutes          // ✅ 已导出
}
