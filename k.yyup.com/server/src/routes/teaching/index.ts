/**
 * 教学模块路由聚合文件
 * 统一管理所有教学、课程相关的路由功能
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有教学相关路由
import teachingCenterRoutes from '../teaching-center.routes';
import teacherDashboardRoutes from '../teacher-dashboard.routes';
import teacherCustomersRoutes from '../teacher-customers.routes';
import teacherCheckinRoutes from '../teacher-checkin.routes';
import teacherAttendanceRoutes from '../teacher-attendance.routes';
import teacherCenterCreativeCurriculumRoutes from '../teacher-center-creative-curriculum.routes';
import teacherSopRoutes from '../teacher-sop.routes';
// interactive-curriculum routes 已移至 routes/index.ts 并添加了认证中间件
import teacherCoursesRoutes from '../teacher-courses.routes';

/**
 * 教学模块路由配置
 */
const teachingModuleRoutes = (router: Router) => {
  // 🔹 教学中心
  router.use('/teaching-center', teachingCenterRoutes);

  // 🔹 教师工作台
  router.use('/teacher-dashboard', teacherDashboardRoutes);

  // 🔹 教师客户管理
  router.use('/teacher-customers', teacherCustomersRoutes);
  router.use('/teacher/customers', teacherCustomersRoutes); // 别名

  // 🔹 教师签到和考勤
  router.use('/teacher-checkin', teacherCheckinRoutes);
  router.use('/teacher-attendance', teacherAttendanceRoutes);

  // 🔹 创意课程
  router.use('/teacher-center-creative-curriculum', teacherCenterCreativeCurriculumRoutes);
  // 🔹 互动课程路由已移至 routes/index.ts，需要认证

  // 🔹 标准操作流程
  router.use('/teacher-sop', teacherSopRoutes);

  // 🔹 教师课程管理 (新增)
  router.use('/teacher/courses', teacherCoursesRoutes);

  console.log('✅ 教学模块路由已注册 (9+ 个路由)');
};

export default teachingModuleRoutes;

