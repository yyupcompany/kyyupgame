/**
 * 用户模块路由聚合文件
 * 统一管理所有用户相关的路由功能
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有用户相关路由
import userRoutes from '../user.routes';
import userProfileRoutes from '../user-profile.routes';
import userRoleRoutes from '../user-role.routes';
// import userRolesRoutes from '../user-roles.routes'; // 文件不存在，已注释
import studentRoutes from '../student.routes';
import teacherRoutes from '../teacher.routes';
import parentRoutes from '../parent.routes';
import adminRoutes from '../admin.routes';
import parentStudentRelationRoutes from '../parent-student-relation.routes';
import parentStudentRelationsRoutes from '../parent-student-relations.routes';
import parentAssistantRoutes from '../parent-assistant.routes';
import teacherCustomersRoutes from '../teacher-customers.routes';

/**
 * 用户模块路由配置
 */
const usersModuleRoutes = (router: Router) => {
  // 🔹 基础用户路由
  router.use('/user', userRoutes);
  router.use('/users', userRoutes); // 别名
  router.use('/user-profile', userProfileRoutes);

  // 🔹 用户角色
  router.use('/user-role', userRoleRoutes);
  router.use('/user-roles', userRoleRoutes); // 别名

  // 🔹 特定用户类型
  router.use('/students', studentRoutes);
  router.use('/student', studentRoutes); // 别名

  // 🔹 教师客户管理 - 必须在 /teacher 路由之前注册，避免被 /:id/stats 路由拦截
  router.use('/teacher/customers', teacherCustomersRoutes);

  router.use('/teachers', teacherRoutes);
  router.use('/teacher', teacherRoutes); // 别名
  router.use('/parents', (req, res, next) => {
    console.log('[Users模块] /parents 路由被调用, path:', req.path);
    next();
  }, parentRoutes);
  router.use('/parent', (req, res, next) => {
    console.log('[Users模块] /parent 路由被调用, path:', req.path);
    next();
  }, parentRoutes); // 别名

  // 🔹 管理员
  router.use('/admin', adminRoutes);

  // 🔹 关系管理
  router.use('/parent-student-relations', parentStudentRelationsRoutes);
  router.use('/parent-student-relation', parentStudentRelationRoutes); // 别名
  router.use('/parent-assistant', parentAssistantRoutes);

  console.log('✅ 用户模块路由已注册 (12+ 个路由)');
};

export default usersModuleRoutes;

