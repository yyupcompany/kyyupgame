import axios, { AxiosRequestConfig } from 'axios';
import fs from 'fs';
import path from 'path';

// API测试结果接口
interface ApiTestResult {
  path: string;
  method: string;
  category: string;
  status: 'success' | 'error' | 'auth_required' | 'not_found';
  httpCode?: number;
  error?: string;
  responseTime?: number;
}

// API定义接口
interface ApiDefinition {
  path: string;
  method: string;
  description: string;
  category: string;
  requiresAuth?: boolean;
  params?: string[];
}

// 认证令牌接口
interface AuthTokens {
  adminToken?: string;
  userToken?: string;
}

export class ComprehensiveApiTester {
  private baseUrl: string;
  private tokens: AuthTokens = {};

  constructor(baseUrl: string = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
  }

  // 从所有路由文件自动提取API列表
  private extractAllApis(): ApiDefinition[] {
    const apiList: ApiDefinition[] = [];

    // 认证相关API
    apiList.push(
      { path: '/api/auth/login', method: 'POST', description: '用户登录', category: 'auth' },
      // 注册API实际不存在，已确认
      { path: '/api/auth/logout', method: 'POST', description: '用户登出', category: 'auth', requiresAuth: true },
      { path: '/api/auth/refresh-token', method: 'POST', description: '刷新令牌', category: 'auth', requiresAuth: true },
      { path: '/api/auth/profile', method: 'GET', description: '获取用户资料', category: 'auth', requiresAuth: true },
    );

    // 用户管理API
    apiList.push(
      { path: '/api/users', method: 'GET', description: '获取用户列表', category: 'user', requiresAuth: true },
      { path: '/api/users', method: 'POST', description: '创建用户', category: 'user', requiresAuth: true },
      { path: '/api/users/:id', method: 'GET', description: '获取用户详情', category: 'user', requiresAuth: true, params: ['id'] },
      { path: '/api/users/:id', method: 'PUT', description: '更新用户', category: 'user', requiresAuth: true, params: ['id'] },
      { path: '/api/users/:id', method: 'DELETE', description: '删除用户', category: 'user', requiresAuth: true, params: ['id'] },
      { path: '/api/users/:id/status', method: 'PATCH', description: '更新用户状态', category: 'user', requiresAuth: true, params: ['id'] },
      { path: '/api/users/:id/change-password', method: 'POST', description: '修改密码', category: 'user', requiresAuth: true, params: ['id'] },
      { path: '/api/users/me', method: 'GET', description: '获取当前用户信息', category: 'user', requiresAuth: true },
      { path: '/api/users/profile', method: 'GET', description: '获取用户资料', category: 'user', requiresAuth: true },
    );

    // 角色管理API
    apiList.push(
      { path: '/api/roles', method: 'GET', description: '获取角色列表', category: 'role', requiresAuth: true },
      { path: '/api/roles', method: 'POST', description: '创建角色', category: 'role', requiresAuth: true },
      { path: '/api/roles/:id', method: 'GET', description: '获取角色详情', category: 'role', requiresAuth: true, params: ['id'] },
      { path: '/api/roles/:id', method: 'PUT', description: '更新角色', category: 'role', requiresAuth: true, params: ['id'] },
      { path: '/api/roles/:id', method: 'DELETE', description: '删除角色', category: 'role', requiresAuth: true, params: ['id'] },
    );

    // 权限管理API
    apiList.push(
      { path: '/api/permissions', method: 'GET', description: '获取权限列表', category: 'permission', requiresAuth: true },
      { path: '/api/permissions', method: 'POST', description: '创建权限', category: 'permission', requiresAuth: true },
      { path: '/api/permissions/:id', method: 'GET', description: '获取权限详情', category: 'permission', requiresAuth: true, params: ['id'] },
      { path: '/api/permissions/:id', method: 'PUT', description: '更新权限', category: 'permission', requiresAuth: true, params: ['id'] },
      { path: '/api/permissions/:id', method: 'DELETE', description: '删除权限', category: 'permission', requiresAuth: true, params: ['id'] },
    );

    // 用户角色关联API
    apiList.push(
      { path: '/api/user-roles', method: 'GET', description: '获取用户角色关联', category: 'user_role', requiresAuth: true },
      { path: '/api/user-roles', method: 'POST', description: '创建用户角色关联', category: 'user_role', requiresAuth: true },
      { path: '/api/user-roles/:id', method: 'DELETE', description: '删除用户角色关联', category: 'user_role', requiresAuth: true, params: ['id'] },
    );

    // 角色权限关联API
    apiList.push(
      { path: '/api/role-permissions', method: 'GET', description: '获取角色权限关联', category: 'role_permission', requiresAuth: true },
      { path: '/api/role-permissions', method: 'POST', description: '创建角色权限关联', category: 'role_permission', requiresAuth: true },
      { path: '/api/role-permissions/:id', method: 'DELETE', description: '删除角色权限关联', category: 'role_permission', requiresAuth: true, params: ['id'] },
    );

    // 幼儿园管理API
    apiList.push(
      { path: '/api/kindergartens', method: 'GET', description: '获取幼儿园列表', category: 'kindergarten', requiresAuth: true },
      { path: '/api/kindergartens', method: 'POST', description: '创建幼儿园', category: 'kindergarten', requiresAuth: true },
      { path: '/api/kindergartens/:id', method: 'GET', description: '获取幼儿园详情', category: 'kindergarten', requiresAuth: true, params: ['id'] },
      { path: '/api/kindergartens/:id', method: 'PUT', description: '更新幼儿园', category: 'kindergarten', requiresAuth: true, params: ['id'] },
      { path: '/api/kindergartens/:id', method: 'DELETE', description: '删除幼儿园', category: 'kindergarten', requiresAuth: true, params: ['id'] },
    );

    // 班级管理API
    apiList.push(
      { path: '/api/classes', method: 'GET', description: '获取班级列表', category: 'class', requiresAuth: true },
      { path: '/api/classes', method: 'POST', description: '创建班级', category: 'class', requiresAuth: true },
      { path: '/api/classes/:id', method: 'GET', description: '获取班级详情', category: 'class', requiresAuth: true, params: ['id'] },
      { path: '/api/classes/:id', method: 'PUT', description: '更新班级', category: 'class', requiresAuth: true, params: ['id'] },
      { path: '/api/classes/:id', method: 'DELETE', description: '删除班级', category: 'class', requiresAuth: true, params: ['id'] },
    );

    // 教师管理API
    apiList.push(
      { path: '/api/teachers', method: 'GET', description: '获取教师列表', category: 'teacher', requiresAuth: true },
      { path: '/api/teachers', method: 'POST', description: '创建教师', category: 'teacher', requiresAuth: true },
      { path: '/api/teachers/:id', method: 'GET', description: '获取教师详情', category: 'teacher', requiresAuth: true, params: ['id'] },
      { path: '/api/teachers/:id', method: 'PUT', description: '更新教师', category: 'teacher', requiresAuth: true, params: ['id'] },
      { path: '/api/teachers/:id', method: 'DELETE', description: '删除教师', category: 'teacher', requiresAuth: true, params: ['id'] },
    );

    // 学生管理API
    apiList.push(
      { path: '/api/students', method: 'GET', description: '获取学生列表', category: 'student', requiresAuth: true },
      { path: '/api/students', method: 'POST', description: '创建学生', category: 'student', requiresAuth: true },
      { path: '/api/students/:id', method: 'GET', description: '获取学生详情', category: 'student', requiresAuth: true, params: ['id'] },
      { path: '/api/students/:id', method: 'PUT', description: '更新学生', category: 'student', requiresAuth: true, params: ['id'] },
      { path: '/api/students/:id', method: 'DELETE', description: '删除学生', category: 'student', requiresAuth: true, params: ['id'] },
    );

    // 家长管理API
    apiList.push(
      { path: '/api/parents', method: 'GET', description: '获取家长列表', category: 'parent', requiresAuth: true },
      { path: '/api/parents', method: 'POST', description: '创建家长', category: 'parent', requiresAuth: true },
      { path: '/api/parents/:id', method: 'GET', description: '获取家长详情', category: 'parent', requiresAuth: true, params: ['id'] },
      { path: '/api/parents/:id', method: 'PUT', description: '更新家长', category: 'parent', requiresAuth: true, params: ['id'] },
      { path: '/api/parents/:id', method: 'DELETE', description: '删除家长', category: 'parent', requiresAuth: true, params: ['id'] },
    );

    // 招生计划API
    apiList.push(
      { path: '/api/enrollment-plans', method: 'GET', description: '获取招生计划列表', category: 'enrollment', requiresAuth: true },
      { path: '/api/enrollment-plans', method: 'POST', description: '创建招生计划', category: 'enrollment', requiresAuth: true },
      { path: '/api/enrollment-plans/:id', method: 'GET', description: '获取招生计划详情', category: 'enrollment', requiresAuth: true, params: ['id'] },
      { path: '/api/enrollment-plans/:id', method: 'PUT', description: '更新招生计划', category: 'enrollment', requiresAuth: true, params: ['id'] },
      { path: '/api/enrollment-plans/:id', method: 'DELETE', description: '删除招生计划', category: 'enrollment', requiresAuth: true, params: ['id'] },
    );

    // 招生申请API
    apiList.push(
      { path: '/api/enrollment-applications', method: 'GET', description: '获取招生申请列表', category: 'enrollment', requiresAuth: true },
      { path: '/api/enrollment-applications', method: 'POST', description: '创建招生申请', category: 'enrollment', requiresAuth: true },
      { path: '/api/enrollment-applications/:id', method: 'GET', description: '获取招生申请详情', category: 'enrollment', requiresAuth: true, params: ['id'] },
      { path: '/api/enrollment-applications/:id', method: 'PUT', description: '更新招生申请', category: 'enrollment', requiresAuth: true, params: ['id'] },
      { path: '/api/enrollment-applications/:id', method: 'DELETE', description: '删除招生申请', category: 'enrollment', requiresAuth: true, params: ['id'] },
    );

    // 招生咨询API
    apiList.push(
      { path: '/api/enrollment-consultations', method: 'GET', description: '获取招生咨询列表', category: 'enrollment', requiresAuth: true },
      { path: '/api/enrollment-consultations', method: 'POST', description: '创建招生咨询', category: 'enrollment', requiresAuth: true },
      { path: '/api/enrollment-consultations/:id', method: 'GET', description: '获取招生咨询详情', category: 'enrollment', requiresAuth: true, params: ['id'] },
      { path: '/api/enrollment-consultations/:id', method: 'PUT', description: '更新招生咨询', category: 'enrollment', requiresAuth: true, params: ['id'] },
      { path: '/api/enrollment-consultations/:id', method: 'DELETE', description: '删除招生咨询', category: 'enrollment', requiresAuth: true, params: ['id'] },
    );

    // 招生配额API
    apiList.push(
      { path: '/api/enrollment-quotas', method: 'GET', description: '获取招生配额列表', category: 'enrollment', requiresAuth: true },
      { path: '/api/enrollment-quotas', method: 'POST', description: '创建招生配额', category: 'enrollment', requiresAuth: true },
      { path: '/api/enrollment-quotas/:id', method: 'GET', description: '获取招生配额详情', category: 'enrollment', requiresAuth: true, params: ['id'] },
      { path: '/api/enrollment-quotas/:id', method: 'PUT', description: '更新招生配额', category: 'enrollment', requiresAuth: true, params: ['id'] },
      { path: '/api/enrollment-quotas/:id', method: 'DELETE', description: '删除招生配额', category: 'enrollment', requiresAuth: true, params: ['id'] },
    );

    // 活动管理API
    apiList.push(
      { path: '/api/activities', method: 'GET', description: '获取活动列表', category: 'activity', requiresAuth: true },
      { path: '/api/activities', method: 'POST', description: '创建活动', category: 'activity', requiresAuth: true },
      { path: '/api/activities/:id', method: 'GET', description: '获取活动详情', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activities/:id', method: 'PUT', description: '更新活动', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activities/:id', method: 'DELETE', description: '删除活动', category: 'activity', requiresAuth: true, params: ['id'] },
    );

    // 活动计划API
    apiList.push(
      { path: '/api/activity-plans', method: 'GET', description: '获取活动计划列表', category: 'activity', requiresAuth: true },
      { path: '/api/activity-plans', method: 'POST', description: '创建活动计划', category: 'activity', requiresAuth: true },
      { path: '/api/activity-plans/:id', method: 'GET', description: '获取活动计划详情', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activity-plans/:id', method: 'PUT', description: '更新活动计划', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activity-plans/:id', method: 'DELETE', description: '删除活动计划', category: 'activity', requiresAuth: true, params: ['id'] },
    );

    // 活动注册API
    apiList.push(
      { path: '/api/activity-registrations', method: 'GET', description: '获取活动注册列表', category: 'activity', requiresAuth: true },
      { path: '/api/activity-registrations', method: 'POST', description: '创建活动注册', category: 'activity', requiresAuth: true },
      { path: '/api/activity-registrations/:id', method: 'GET', description: '获取活动注册详情', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activity-registrations/:id', method: 'PUT', description: '更新活动注册', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activity-registrations/:id', method: 'DELETE', description: '删除活动注册', category: 'activity', requiresAuth: true, params: ['id'] },
    );

    // 活动评价API
    apiList.push(
      { path: '/api/activity-evaluations', method: 'GET', description: '获取活动评价列表', category: 'activity', requiresAuth: true },
      { path: '/api/activity-evaluations', method: 'POST', description: '创建活动评价', category: 'activity', requiresAuth: true },
      { path: '/api/activity-evaluations/:id', method: 'GET', description: '获取活动评价详情', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activity-evaluations/:id', method: 'PUT', description: '更新活动评价', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activity-evaluations/:id', method: 'DELETE', description: '删除活动评价', category: 'activity', requiresAuth: true, params: ['id'] },
    );

    // 签到API
    apiList.push(
      { path: '/api/activity-checkins', method: 'GET', description: '获取签到列表', category: 'activity', requiresAuth: true },
      { path: '/api/activity-checkins', method: 'POST', description: '创建签到', category: 'activity', requiresAuth: true },
      { path: '/api/activity-checkins/:id', method: 'GET', description: '获取签到详情', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activity-checkins/:id', method: 'PUT', description: '更新签到', category: 'activity', requiresAuth: true, params: ['id'] },
      { path: '/api/activity-checkins/:id', method: 'DELETE', description: '删除签到', category: 'activity', requiresAuth: true, params: ['id'] },
    );

    // 营销活动API
    apiList.push(
      { path: '/api/marketing-campaigns', method: 'GET', description: '获取营销活动列表', category: 'marketing', requiresAuth: true },
      { path: '/api/marketing-campaigns', method: 'POST', description: '创建营销活动', category: 'marketing', requiresAuth: true },
      { path: '/api/marketing-campaigns/:id', method: 'GET', description: '获取营销活动详情', category: 'marketing', requiresAuth: true, params: ['id'] },
      { path: '/api/marketing-campaigns/:id', method: 'PUT', description: '更新营销活动', category: 'marketing', requiresAuth: true, params: ['id'] },
      { path: '/api/marketing-campaigns/:id', method: 'DELETE', description: '删除营销活动', category: 'marketing', requiresAuth: true, params: ['id'] },
    );

    // 广告管理API
    apiList.push(
      { path: '/api/advertisements', method: 'GET', description: '获取广告列表', category: 'marketing', requiresAuth: true },
      { path: '/api/advertisements', method: 'POST', description: '创建广告', category: 'marketing', requiresAuth: true },
      { path: '/api/advertisements/:id', method: 'GET', description: '获取广告详情', category: 'marketing', requiresAuth: true, params: ['id'] },
      { path: '/api/advertisements/:id', method: 'PUT', description: '更新广告', category: 'marketing', requiresAuth: true, params: ['id'] },
      { path: '/api/advertisements/:id', method: 'DELETE', description: '删除广告', category: 'marketing', requiresAuth: true, params: ['id'] },
    );

    // 转化跟踪API
    apiList.push(
      { path: '/api/conversion-trackings', method: 'GET', description: '获取转化跟踪列表', category: 'marketing', requiresAuth: true },
      { path: '/api/conversion-trackings', method: 'POST', description: '创建转化跟踪', category: 'marketing', requiresAuth: true },
      { path: '/api/conversion-trackings/:id', method: 'GET', description: '获取转化跟踪详情', category: 'marketing', requiresAuth: true, params: ['id'] },
      { path: '/api/conversion-trackings/:id', method: 'PUT', description: '更新转化跟踪', category: 'marketing', requiresAuth: true, params: ['id'] },
      { path: '/api/conversion-trackings/:id', method: 'DELETE', description: '删除转化跟踪', category: 'marketing', requiresAuth: true, params: ['id'] },
    );

    // 渠道跟踪API
    apiList.push(
      { path: '/api/channel-trackings', method: 'GET', description: '获取渠道跟踪列表', category: 'marketing', requiresAuth: true },
      { path: '/api/channel-trackings', method: 'POST', description: '创建渠道跟踪', category: 'marketing', requiresAuth: true },
      { path: '/api/channel-trackings/:id', method: 'GET', description: '获取渠道跟踪详情', category: 'marketing', requiresAuth: true, params: ['id'] },
      { path: '/api/channel-trackings/:id', method: 'PUT', description: '更新渠道跟踪', category: 'marketing', requiresAuth: true, params: ['id'] },
      { path: '/api/channel-trackings/:id', method: 'DELETE', description: '删除渠道跟踪', category: 'marketing', requiresAuth: true, params: ['id'] },
    );

    // 海报模板API
    apiList.push(
      { path: '/api/poster-templates', method: 'GET', description: '获取海报模板列表', category: 'poster', requiresAuth: true },
      { path: '/api/poster-templates', method: 'POST', description: '创建海报模板', category: 'poster', requiresAuth: true },
      { path: '/api/poster-templates/:id', method: 'GET', description: '获取海报模板详情', category: 'poster', requiresAuth: true, params: ['id'] },
      { path: '/api/poster-templates/:id', method: 'PUT', description: '更新海报模板', category: 'poster', requiresAuth: true, params: ['id'] },
      { path: '/api/poster-templates/:id', method: 'DELETE', description: '删除海报模板', category: 'poster', requiresAuth: true, params: ['id'] },
    );

    // 海报生成API
    apiList.push(
      { path: '/api/poster-generations', method: 'GET', description: '获取海报生成列表', category: 'poster', requiresAuth: true },
      { path: '/api/poster-generations', method: 'POST', description: '创建海报生成', category: 'poster', requiresAuth: true },
      { path: '/api/poster-generations/:id', method: 'GET', description: '获取海报生成详情', category: 'poster', requiresAuth: true, params: ['id'] },
      { path: '/api/poster-generations/:id', method: 'PUT', description: '更新海报生成', category: 'poster', requiresAuth: true, params: ['id'] },
      { path: '/api/poster-generations/:id', method: 'DELETE', description: '删除海报生成', category: 'poster', requiresAuth: true, params: ['id'] },
    );

    // 仪表盘API - 基于实际路由配置
    apiList.push(
      { path: '/api/dashboard/overview', method: 'GET', description: '获取仪表盘概览', category: 'dashboard', requiresAuth: true },
      { path: '/api/dashboard/activities', method: 'GET', description: '获取仪表盘活动', category: 'dashboard', requiresAuth: true },
    );

    // 营销分析API - 基于实际路由配置
    apiList.push(
      { path: '/api/marketing/analysis', method: 'GET', description: '获取营销分析', category: 'marketing', requiresAuth: true },
    );

    // 系统AI模型API - 基于实际路由配置
    apiList.push(
      { path: '/api/system/ai-models', method: 'GET', description: '获取AI模型列表', category: 'system', requiresAuth: true },
      { path: '/api/system/ai-models', method: 'POST', description: '创建AI模型', category: 'system', requiresAuth: true },
    );


    // 文件上传API - 基于实际路由配置
    apiList.push(
      { path: '/api/files', method: 'GET', description: '获取文件列表', category: 'file', requiresAuth: true },
      { path: '/api/files/upload', method: 'POST', description: '单文件上传', category: 'file', requiresAuth: true },
      { path: '/api/files/upload-multiple', method: 'POST', description: '多文件上传', category: 'file', requiresAuth: true },
      { path: '/api/files/statistics', method: 'GET', description: '获取文件统计', category: 'file', requiresAuth: true },
      { path: '/api/files/storage-info', method: 'GET', description: '获取存储空间信息', category: 'file', requiresAuth: true },
      { path: '/api/files/:id', method: 'GET', description: '获取文件详情', category: 'file', requiresAuth: true, params: ['id'] },
      { path: '/api/files/:id', method: 'PUT', description: '更新文件信息', category: 'file', requiresAuth: true, params: ['id'] },
      { path: '/api/files/:id', method: 'DELETE', description: '删除文件', category: 'file', requiresAuth: true, params: ['id'] },
    );

    // 待办事项API - 基于实际路由配置
    apiList.push(
      { path: '/api/todos', method: 'GET', description: '获取待办事项列表', category: 'todo', requiresAuth: true },
      { path: '/api/todos', method: 'POST', description: '创建待办事项', category: 'todo', requiresAuth: true },
      { path: '/api/todos/:id', method: 'PUT', description: '更新待办事项', category: 'todo', requiresAuth: true, params: ['id'] },
      { path: '/api/todos/:id', method: 'DELETE', description: '删除待办事项', category: 'todo', requiresAuth: true, params: ['id'] },
    );

    // 通知API - 基于实际路由配置
    apiList.push(
      { path: '/api/notifications', method: 'GET', description: '获取通知列表', category: 'notification', requiresAuth: true },
      { path: '/api/notifications', method: 'POST', description: '创建通知', category: 'notification', requiresAuth: true },
      { path: '/api/notifications/:id', method: 'PUT', description: '更新通知', category: 'notification', requiresAuth: true, params: ['id'] },
      { path: '/api/notifications/:id', method: 'DELETE', description: '删除通知', category: 'notification', requiresAuth: true, params: ['id'] },
    );

    // 日程API - 基于实际路由配置
    apiList.push(
      { path: '/api/schedules', method: 'GET', description: '获取日程列表', category: 'schedule', requiresAuth: true },
      { path: '/api/schedules', method: 'POST', description: '创建日程', category: 'schedule', requiresAuth: true },
      { path: '/api/schedules/:id', method: 'PUT', description: '更新日程', category: 'schedule', requiresAuth: true, params: ['id'] },
      { path: '/api/schedules/:id', method: 'DELETE', description: '删除日程', category: 'schedule', requiresAuth: true, params: ['id'] },
    );

    // 系统日志API - 基于实际路由配置
    apiList.push(
      { path: '/api/logs', method: 'GET', description: '获取系统日志列表', category: 'log', requiresAuth: true },
      { path: '/api/system-logs', method: 'GET', description: '获取系统日志列表(别名)', category: 'log', requiresAuth: true },
      { path: '/api/operation-logs', method: 'GET', description: '获取操作日志列表', category: 'log', requiresAuth: true },
    );

    // 系统配置API - 使用正确的id参数而不是key
    apiList.push(
      { path: '/api/system-configs', method: 'GET', description: '获取系统配置列表', category: 'system', requiresAuth: true },
      { path: '/api/system-configs', method: 'POST', description: '创建系统配置', category: 'system', requiresAuth: true },
      { path: '/api/system-configs/:id', method: 'GET', description: '获取系统配置详情', category: 'system', requiresAuth: true, params: ['id'] },
      { path: '/api/system-configs/:id', method: 'PUT', description: '更新系统配置', category: 'system', requiresAuth: true, params: ['id'] },
      { path: '/api/system-configs/:id', method: 'DELETE', description: '删除系统配置', category: 'system', requiresAuth: true, params: ['id'] },
    );

    // 系统日志API
    apiList.push(
      { path: '/api/system-logs', method: 'GET', description: '获取系统日志列表', category: 'system', requiresAuth: true },
      { path: '/api/system-logs', method: 'POST', description: '创建系统日志', category: 'system', requiresAuth: true },
      { path: '/api/system-logs/:id', method: 'GET', description: '获取系统日志详情', category: 'system', requiresAuth: true, params: ['id'] },
      { path: '/api/system-logs/:id', method: 'DELETE', description: '删除系统日志', category: 'system', requiresAuth: true, params: ['id'] },
    );

    // 操作日志API
    apiList.push(
      { path: '/api/operation-logs', method: 'GET', description: '获取操作日志列表', category: 'system', requiresAuth: true },
      { path: '/api/operation-logs', method: 'POST', description: '创建操作日志', category: 'system', requiresAuth: true },
      { path: '/api/operation-logs/:id', method: 'GET', description: '获取操作日志详情', category: 'system', requiresAuth: true, params: ['id'] },
      { path: '/api/operation-logs/:id', method: 'DELETE', description: '删除操作日志', category: 'system', requiresAuth: true, params: ['id'] },
    );

    // 通知API
    apiList.push(
      { path: '/api/notifications', method: 'GET', description: '获取通知列表', category: 'notification', requiresAuth: true },
      { path: '/api/notifications', method: 'POST', description: '创建通知', category: 'notification', requiresAuth: true },
      { path: '/api/notifications/:id', method: 'GET', description: '获取通知详情', category: 'notification', requiresAuth: true, params: ['id'] },
      { path: '/api/notifications/:id', method: 'PUT', description: '更新通知', category: 'notification', requiresAuth: true, params: ['id'] },
      { path: '/api/notifications/:id', method: 'DELETE', description: '删除通知', category: 'notification', requiresAuth: true, params: ['id'] },
    );

    // 消息模板API
    apiList.push(
      { path: '/api/message-templates', method: 'GET', description: '获取消息模板列表', category: 'notification', requiresAuth: true },
      { path: '/api/message-templates', method: 'POST', description: '创建消息模板', category: 'notification', requiresAuth: true },
      { path: '/api/message-templates/:id', method: 'GET', description: '获取消息模板详情', category: 'notification', requiresAuth: true, params: ['id'] },
      { path: '/api/message-templates/:id', method: 'PUT', description: '更新消息模板', category: 'notification', requiresAuth: true, params: ['id'] },
      { path: '/api/message-templates/:id', method: 'DELETE', description: '删除消息模板', category: 'notification', requiresAuth: true, params: ['id'] },
    );


    // 仪表板API
    apiList.push(
      { path: '/api/dashboard/overview', method: 'GET', description: '获取仪表板概要', category: 'dashboard', requiresAuth: true },
      { path: '/api/dashboard/statistics', method: 'GET', description: '获取统计数据', category: 'dashboard', requiresAuth: true },
      { path: '/api/dashboard/activities', method: 'GET', description: '获取最近活动', category: 'dashboard', requiresAuth: true },
    );

    // 统计API
    apiList.push(
      { path: '/api/statistics/enrollment', method: 'GET', description: '获取招生统计', category: 'statistics', requiresAuth: true },
      { path: '/api/statistics/activities', method: 'GET', description: '获取活动统计', category: 'statistics', requiresAuth: true },
      { path: '/api/marketing/analysis', method: 'GET', description: '获取营销统计', category: 'statistics', requiresAuth: true },
    );

    // AI相关API - 修正路径结构
    apiList.push(
      { path: '/api/ai/conversations', method: 'GET', description: '获取AI对话列表', category: 'ai', requiresAuth: true },
      { path: '/api/ai/conversations', method: 'POST', description: '创建AI对话', category: 'ai', requiresAuth: true },
      { path: '/api/ai/conversations/:id', method: 'GET', description: '获取AI对话详情', category: 'ai', requiresAuth: true, params: ['id'] },
      { path: '/api/ai/conversations/:id/messages', method: 'GET', description: '获取对话消息列表', category: 'ai', requiresAuth: true, params: ['id'] },
      { path: '/api/ai/conversations/:id/messages', method: 'POST', description: '发送AI消息', category: 'ai', requiresAuth: true, params: ['id'] },
      { path: '/api/ai/models', method: 'GET', description: '获取AI模型列表', category: 'ai', requiresAuth: true },
      { path: '/api/ai/feedback', method: 'POST', description: '提交AI反馈', category: 'ai', requiresAuth: true },
    );

    // 任务管理API
    apiList.push(
      { path: '/api/todos', method: 'GET', description: '获取任务列表', category: 'todo', requiresAuth: true },
      { path: '/api/todos', method: 'POST', description: '创建任务', category: 'todo', requiresAuth: true },
      { path: '/api/todos/:id', method: 'GET', description: '获取任务详情', category: 'todo', requiresAuth: true, params: ['id'] },
      { path: '/api/todos/:id', method: 'PUT', description: '更新任务', category: 'todo', requiresAuth: true, params: ['id'] },
      { path: '/api/todos/:id', method: 'DELETE', description: '删除任务', category: 'todo', requiresAuth: true, params: ['id'] },
    );

    // 日程管理API
    apiList.push(
      { path: '/api/schedules', method: 'GET', description: '获取日程列表', category: 'schedule', requiresAuth: true },
      { path: '/api/schedules', method: 'POST', description: '创建日程', category: 'schedule', requiresAuth: true },
      { path: '/api/schedules/:id', method: 'GET', description: '获取日程详情', category: 'schedule', requiresAuth: true, params: ['id'] },
      { path: '/api/schedules/:id', method: 'PUT', description: '更新日程', category: 'schedule', requiresAuth: true, params: ['id'] },
      { path: '/api/schedules/:id', method: 'DELETE', description: '删除日程', category: 'schedule', requiresAuth: true, params: ['id'] },
    );

    // 绩效管理API
    apiList.push(
      { path: '/api/performance/evaluations', method: 'GET', description: '获取绩效评估列表', category: 'performance', requiresAuth: true },
      { path: '/api/performance/evaluations', method: 'POST', description: '创建绩效评估', category: 'performance', requiresAuth: true },
      { path: '/api/performance/reports', method: 'GET', description: '获取绩效报告列表', category: 'performance', requiresAuth: true },
      { path: '/api/performance/rules', method: 'GET', description: '获取绩效规则列表', category: 'performance', requiresAuth: true },
    );

    return apiList;
  }

  // 获取认证令牌
  private async getAuthTokens(): Promise<void> {
    try {
      // 尝试登录获取管理员令牌
      const adminLoginResponse = await axios.post(`${this.baseUrl}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'  // 修正密码
      });

      console.log('登录响应:', adminLoginResponse.data);

      if (adminLoginResponse.data?.success && adminLoginResponse.data?.data?.token) {
        this.tokens.adminToken = adminLoginResponse.data.data.token;
        console.log('✅ 获取管理员令牌成功');
      } else if (adminLoginResponse.data?.token) {
        // 兼容不同的响应格式
        this.tokens.adminToken = adminLoginResponse.data.token;
        console.log('✅ 获取管理员令牌成功（兼容格式）');
      } else {
        // 开发环境使用模拟令牌
        this.tokens.adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6ImFkbWluIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OSwiZGV2TW9kZSI6dHJ1ZX0.mockSignatureForDevAndTestingPurposesOnly';
        console.log('✅ 使用开发环境模拟令牌');
      }
    } catch (error: any) {
      console.log('⚠️ 获取管理员令牌失败，使用开发环境模拟令牌');
      console.log('错误详情:', error.response?.data || error.message);
      // 开发环境使用模拟令牌
      this.tokens.adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6ImFkbWluIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OSwiZGV2TW9kZSI6dHJ1ZX0.mockSignatureForDevAndTestingPurposesOnly';
    }
  }

  // 测试单个API
  private async testApi(api: ApiDefinition): Promise<ApiTestResult> {
    const startTime = Date.now();
    
    try {
      // 替换路径参数
      let testPath = api.path;
      if (api.params) {
        api.params.forEach(param => {
          testPath = testPath.replace(`:${param}`, '1');
        });
      }

      // 构建请求配置
      const config: AxiosRequestConfig = {
        method: api.method.toLowerCase() as any,
        url: `${this.baseUrl}${testPath}`,
        timeout: 10000,
        headers: {}
      };

      // 添加认证头 - 对所有需要认证的API添加认证头
      if (api.requiresAuth && this.tokens.adminToken) {
        config.headers!['Authorization'] = `Bearer ${this.tokens.adminToken}`;
      }

      // 对于POST/PUT请求，添加基本的测试数据
      if (['POST', 'PUT'].includes(api.method.toUpperCase())) {
        config.data = this.getTestData(api.category);
        config.headers!['Content-Type'] = 'application/json';
      }

      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      return {
        path: api.path,
        method: api.method,
        category: api.category,
        status: 'success',
        httpCode: response.status,
        responseTime
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const httpCode = error.response?.status;
      
      let status: ApiTestResult['status'] = 'error';
      let errorMessage = error.message;
      
      // 添加详细错误信息日志
      console.log(`[调试] ${api.method} ${api.path} 失败:`, {
        httpCode,
        errorMessage,
        responseData: error.response?.data,
        hasAuth: !!this.tokens.adminToken
      });

      if (httpCode === 401 || httpCode === 403) {
        status = 'auth_required';
        errorMessage = '需要认证';
      } else if (httpCode === 404) {
        status = 'not_found';
        errorMessage = '接口不存在';
      } else if (httpCode >= 400 && httpCode < 500) {
        status = 'error';
        errorMessage = error.response?.data?.message || '客户端错误';
      } else if (httpCode >= 500) {
        status = 'error';
        errorMessage = error.response?.data?.message || '服务器错误';
      }

      return {
        path: api.path,
        method: api.method,
        category: api.category,
        status,
        httpCode,
        error: errorMessage,
        responseTime
      };
    }
  }

  // 获取测试数据 - 根据后端实际需求修正参数格式
  private getTestData(category: string): any {
    const testData: Record<string, any> = {
      user: { 
        username: 'testuser_' + Date.now(), 
        email: 'test@example.com', 
        password: 'Test123456!',
        realName: '测试用户',
        phone: '13800138001',
        status: 1,
        roleIds: [1]
      },
      role: { 
        name: '测试角色_' + Date.now(), 
        code: 'TEST_ROLE_' + Date.now(), 
        description: '测试角色描述',
        sort: 100,
        status: 1
      },
      permission: { 
        name: '测试权限_' + Date.now(), 
        code: 'TEST_PERM_' + Date.now(), 
        description: '测试权限描述',
        type: 'menu',
        status: 1
      },
      kindergarten: { 
        name: '测试幼儿园_' + Date.now(), 
        address: '测试地址123号', 
        phone: '13800138002',
        principal: '张园长',
        description: '测试幼儿园',
        status: 1
      },
      class: { 
        name: '测试班级_' + Date.now(), 
        grade: 'junior', 
        maxStudents: 30, 
        kindergartenId: 1,
        headTeacherId: 1,
        status: 1
      },
      teacher: { 
        name: '测试教师', 
        gender: 1,
        phone: '13800138003',
        email: 'teacher@test.com'
      },
      student: { 
        name: '测试学生_' + Date.now(), 
        studentNo: 'STU' + Date.now(),
        gender: 1,
        birthDate: '2020-01-01',
        kindergartenId: 1,
        classId: 1,
        parentName: '测试家长',
        parentPhone: '13800138004'
      },
      parent: { 
        name: '测试家长', 
        phone: '13800138005', 
        relationship: 'father',
        studentId: 1
      },
      enrollment: { 
        kindergartenId: 1,
        consultantId: 1,
        parentName: '测试家长',
        childName: '测试孩子',
        childAge: 36,
        childGender: 1,
        contactPhone: '13800138006',
        sourceChannel: 1,
        consultContent: '测试咨询内容',
        consultMethod: 1,
        consultDate: new Date().toISOString(),
        intentionLevel: 2,
        followupStatus: 1
      },
      activity: { 
        title: '测试活动_' + Date.now(), 
        description: '测试活动描述',
        type: 'education',
        startTime: new Date(Date.now() + 60*60*1000).toISOString(),
        endTime: new Date(Date.now() + 2*60*60*1000).toISOString(),
        location: '活动室A',
        maxParticipants: 30
      },
      marketing: { 
        name: '测试营销_' + Date.now(), 
        type: 'online',
        description: '测试营销描述',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
      },
      poster: { 
        name: '测试海报_' + Date.now(), 
        type: 'recruitment',
        description: '测试海报描述'
      },
      system: { 
        category: 'system',
        key: 'test_config_' + Date.now(), 
        value: 'test_value',
        description: '测试配置'
      },
      notification: { 
        title: '测试通知_' + Date.now(), 
        content: '测试通知内容',
        type: 'system'
      },
      file: { 
        originalName: 'test.txt', 
        mimeType: 'text/plain',
        size: 1024
      },
      dashboard: {},
      statistics: {},
      ai: { 
        feedbackType: 'suggestion',
        sourceType: 'conversation',
        content: '测试AI反馈功能',
        rating: 4
      },
      todo: { 
        title: '测试任务_' + Date.now(), 
        description: '测试任务描述',
        priority: 'medium',
        status: 'pending'
      },
      schedule: { 
        title: '测试日程_' + Date.now(), 
        description: '测试日程描述',
        startTime: new Date(Date.now() + 60*60*1000).toISOString(),
        endTime: new Date(Date.now() + 2*60*60*1000).toISOString()
      },
      performance: { 
        score: 90, 
        comment: '测试评价',
        period: '2024-Q1'
      }
    };

    return testData[category] || {};
  }

  // 运行完整测试
  public async runComprehensiveTest(): Promise<ApiTestResult[]> {
    console.log('🚀 开始运行全面API测试...');
    
    // 获取认证令牌
    await this.getAuthTokens();
    
    const apiList = this.extractAllApis();
    const results: ApiTestResult[] = [];
    
    console.log(`📊 共发现 ${apiList.length} 个API端点`);
    
    // 按类别分组进行测试
    const categories = [...new Set(apiList.map(api => api.category))];
    
    for (const category of categories) {
      console.log(`\n🔍 测试 ${category} 模块...`);
      const categoryApis = apiList.filter(api => api.category === category);
      
      for (const api of categoryApis) {
        const result = await this.testApi(api);
        results.push(result);
        
        const statusIcon = result.status === 'success' ? '✅' : 
                          result.status === 'auth_required' ? '🔐' :
                          result.status === 'not_found' ? '❌' : '⚠️';
        
        console.log(`${statusIcon} ${api.method} ${api.path} - ${result.status} (${result.responseTime}ms)`);
        
        // 避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  // 生成测试报告
  public async generateTestReport(results: ApiTestResult[]): Promise<void> {
    console.log('\n📋 生成测试报告...');
    
    // 统计数据
    const totalApis = results.length;
    const successCount = results.filter(r => r.status === 'success').length;
    const authRequiredCount = results.filter(r => r.status === 'auth_required').length;
    const notFoundCount = results.filter(r => r.status === 'not_found').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    const successRate = ((successCount / totalApis) * 100).toFixed(2);
    const avgResponseTime = results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;

    // 按类别分组结果
    const categories: Record<string, ApiTestResult[]> = {};
    results.forEach(result => {
      if (!categories[result.category]) {
        categories[result.category] = [];
      }
      categories[result.category].push(result);
    });

    // 生成Markdown报告
    let report = `# 全面API测试报告\n\n`;
    report += `测试时间: ${new Date().toLocaleString()}\n`;
    report += `基础URL: ${this.baseUrl}\n\n`;
    
    report += `## 总体统计\n\n`;
    report += `| 指标 | 数量 | 比例 |\n`;
    report += `|------|------|------|\n`;
    report += `| 总API数量 | ${totalApis} | 100% |\n`;
    report += `| 成功响应 | ${successCount} | ${successRate}% |\n`;
    report += `| 需要认证 | ${authRequiredCount} | ${((authRequiredCount/totalApis)*100).toFixed(2)}% |\n`;
    report += `| 接口不存在 | ${notFoundCount} | ${((notFoundCount/totalApis)*100).toFixed(2)}% |\n`;
    report += `| 错误响应 | ${errorCount} | ${((errorCount/totalApis)*100).toFixed(2)}% |\n`;
    report += `| 平均响应时间 | ${avgResponseTime.toFixed(2)}ms | - |\n\n`;

    // 按类别生成详细报告
    for (const [category, categoryResults] of Object.entries(categories)) {
      const categorySuccess = categoryResults.filter(r => r.status === 'success').length;
      const categoryTotal = categoryResults.length;
      const categoryRate = ((categorySuccess / categoryTotal) * 100).toFixed(2);
      
      report += `## ${category} 模块 (${categoryRate}% 成功率)\n\n`;
      report += `| API路径 | 方法 | 状态 | HTTP码 | 响应时间 | 错误信息 |\n`;
      report += `|---------|------|------|--------|----------|----------|\n`;
      
      categoryResults.forEach(result => {
        const statusText = {
          'success': '✅ 成功',
          'auth_required': '🔐 需要认证',
          'not_found': '❌ 不存在',
          'error': '⚠️ 错误'
        }[result.status] || result.status;
        
        const httpCode = result.httpCode || '-';
        const responseTime = result.responseTime ? `${result.responseTime}ms` : '-';
        const error = result.error || '-';
        
        report += `| ${result.path} | ${result.method} | ${statusText} | ${httpCode} | ${responseTime} | ${error} |\n`;
      });
      
      report += `\n`;
    }

    // 错误详情
    const errorResults = results.filter(r => r.status === 'error' || r.status === 'not_found');
    if (errorResults.length > 0) {
      report += `## 需要修复的API\n\n`;
      errorResults.forEach(result => {
        report += `### ${result.method} ${result.path}\n`;
        report += `- **类别**: ${result.category}\n`;
        report += `- **状态**: ${result.status}\n`;
        report += `- **HTTP状态码**: ${result.httpCode || '无响应'}\n`;
        report += `- **错误信息**: ${result.error || '未知错误'}\n\n`;
      });
    }

    // 保存报告
    const reportDir = path.join(__dirname, '../../docs/api');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportPath = path.join(reportDir, `comprehensive-api-test-report-${Date.now()}.md`);
    fs.writeFileSync(reportPath, report);
    
    console.log(`📄 测试报告已生成: ${reportPath}`);
    console.log(`📊 测试总结: ${successCount}/${totalApis} 成功 (${successRate}%)`);
  }
}

// 命令行执行入口
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3001';
  const tester = new ComprehensiveApiTester(baseUrl);
  
  tester.runComprehensiveTest()
    .then(results => tester.generateTestReport(results))
    .then(() => console.log('✨ 全面API测试完成'))
    .catch(error => console.error('❌ API测试失败:', error));
}

export default ComprehensiveApiTester;