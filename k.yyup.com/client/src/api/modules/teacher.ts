// 教师管理模块API服务
import { get, post, put, del } from '../../utils/request';
import { TEACHER_ENDPOINTS } from '../endpoints';
import { transformTeacherData, transformListResponse } from '../../utils/dataTransform';
import { API_PREFIX } from '../endpoints/base';

// 用户管理端点
const USERS_ENDPOINTS = {
  BASE: `${API_PREFIX}/users`
} as const;

// 教师客户管理端点
const TEACHER_CUSTOMERS_ENDPOINTS = {
  STATS: `${API_PREFIX}/teacher/customers/stats`,
  LIST: `${API_PREFIX}/teacher/customers/list`,
  FOLLOW: (customerId: number) => `${API_PREFIX}/teacher/customers/${customerId}/follow`
} as const;

/**
 * API响应类型
 */
interface ApiResponseType<T = any> {
  items?: T[];
  total?: number;
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

/**
 * 教师状态
 */
export enum TeacherStatus {
  ACTIVE = 'ACTIVE',       // 在职
  ON_LEAVE = 'ON_LEAVE',   // 请假中
  RESIGNED = 'RESIGNED',   // 离职
  PROBATION = 'PROBATION'  // 见习期
}

/**
 * 教师职位
 */
export enum TeacherPosition {
  PRINCIPAL = 'PRINCIPAL',               // 园长
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',     // 副园长
  RESEARCH_DIRECTOR = 'RESEARCH_DIRECTOR', // 教研主任
  HEAD_TEACHER = 'HEAD_TEACHER',         // 班主任
  REGULAR_TEACHER = 'REGULAR_TEACHER',   // 普通教师
  ASSISTANT_TEACHER = 'ASSISTANT_TEACHER' // 助教
}

/**
 * 教师类型
 */
export enum TeacherType {
  FULL_TIME = 'FULL_TIME',   // 全职
  PART_TIME = 'PART_TIME',   // 兼职
  CONTRACT = 'CONTRACT',     // 合同工
  INTERN = 'INTERN'          // 实习生
}

/**
 * 教师信息
 */
export interface Teacher {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email?: string;
  avatar?: string;
  employeeId?: string;
  status: TeacherStatus;
  position: TeacherPosition;
  type: TeacherType;
  title?: string;
  department?: string;
  hireDate: string;
  education?: {
    degree?: string;
    major?: string;
    school?: string;
    graduationYear?: number;
  };
  certification?: string[];
  skills?: string[];
  classIds?: string[];
  classNames?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 教师简要信息
 */
export interface TeacherBrief {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  position?: TeacherPosition;
  phone: string;
  status: TeacherStatus;
}

/**
 * 教师创建参数
 */
export interface TeacherCreateParams {
  name: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email?: string;
  employeeId?: string;
  status?: TeacherStatus;
  position: TeacherPosition;
  type: TeacherType;
  title?: string;
  department?: string;
  hireDate: string;
  avatar?: string;
  education?: {
    degree?: string;
    major?: string;
    school?: string;
    graduationYear?: number;
  };
  certification?: string[];
  skills?: string[];
}

/**
 * 教师查询参数
 */
export interface TeacherQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: TeacherStatus;
  position?: TeacherPosition;
  type?: TeacherType;
  department?: string;
  classId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 获取教师列表
 * @param params 查询参数
 * @returns 教师列表和总数
 */
export function getTeacherList(params?: TeacherQueryParams): Promise<ApiResponseType<Teacher>> {
  return get(TEACHER_ENDPOINTS.LIST, params).then(response => {
    // 使用数据转换层处理响应
    return transformListResponse(response, transformTeacherData);
  });
}

/**
 * 获取教师详情
 * @param id 教师ID
 * @returns 教师详情
 */
export function getTeacherDetail(id: string): Promise<ApiResponseType<Teacher>> {
  return get(TEACHER_ENDPOINTS.GET_BY_ID(id)).then(response => {
    // 转换响应数据
    if (response.data) {
      response.data = transformTeacherData(response.data);
    }
    return response;
  });
}

/**
 * 创建教师
 * @param data 教师创建参数
 * @returns 创建结果
 */
export async function createTeacher(data: TeacherCreateParams): Promise<ApiResponseType<Teacher>> {
  try {
    // 首先创建用户
    const userCreateData = {
      username: data.phone, // 使用手机号作为用户名
      password: '123456', // 默认密码，用户首次登录后需要修改
      real_name: data.name,
      phone: data.phone,
      email: data.email,
      gender: data.gender === 'MALE' ? 1 : data.gender === 'FEMALE' ? 2 : 1,
      status: 1, // 激活状态
      role: 'TEACHER' // 教师角色
    };

    // 创建用户
    const userResponse = await post(USERS_ENDPOINTS.BASE, userCreateData);

    if (!userResponse.success) {
      throw new Error(userResponse.message || '创建用户失败');
    }

    const userId = userResponse.data.id;

    // 然后创建教师记录
    const teacherCreateData = {
      userId: userId,
      kindergartenId: 1, // 假设默认幼儿园ID为1，实际应该从用户上下文获取
      position: data.position === 'PRINCIPAL' ? 1 : 
                data.position === 'VICE_PRINCIPAL' ? 2 : 
                data.position === 'RESEARCH_DIRECTOR' ? 3 : 
                data.position === 'HEAD_TEACHER' ? 4 : 
                data.position === 'ASSISTANT_TEACHER' ? 6 : 5, // REGULAR_TEACHER
      teacherNo: data.employeeId,
      status: data.status === 'ACTIVE' ? 1 : data.status === 'ON_LEAVE' ? 2 : data.status === 'PROBATION' ? 3 : 0,
      remark: `教师类型: ${data.type}, 部门: ${data.department || '未指定'}`
    };

    const teacherResponse = await post(TEACHER_ENDPOINTS.BASE, teacherCreateData);

    // 转换响应数据
    if (teacherResponse.data) {
      teacherResponse.data = transformTeacherData(teacherResponse.data);
    }
    
    return teacherResponse;
  } catch (error) {
    console.error('创建教师失败:', error);
    throw error;
  }
}

/**
 * 更新教师
 * @param id 教师ID
 * @param data 教师更新参数
 * @returns 更新结果
 */
export function updateTeacher(id: string, data: Partial<TeacherCreateParams>): Promise<ApiResponseType<Teacher>> {
  return put(TEACHER_ENDPOINTS.GET_BY_ID(id), data);
}

/**
 * 删除教师
 * @param id 教师ID
 * @returns 删除结果
 */
export function deleteTeacher(id: string): Promise<ApiResponseType<{ success: boolean }>> {
  return del(TEACHER_ENDPOINTS.GET_BY_ID(id));
}

/**
 * 搜索教师
 * @param params 搜索参数
 * @returns 教师列表
 */
export function searchTeachers(params: {
  keyword: string;
  excludeIds?: string[];
}): Promise<ApiResponseType<TeacherBrief>> {
  return get(TEACHER_ENDPOINTS.SEARCH, params);
}

/**
 * 获取教师所带班级
 * @param id 教师ID
 * @returns 班级列表
 */
export function getTeacherClasses(id: string): Promise<ApiResponseType<{ 
  id: string;
  name: string;
  type: string;
  role: 'HEAD_TEACHER' | 'ASSISTANT_TEACHER';
}>> {
  return get(TEACHER_ENDPOINTS.GET_CLASSES(id));
}

// ===== 教师客户管理相关API =====

/**
 * 客户信息接口
 */
export interface CustomerInfo {
  id: number;
  customerName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  childName: string;
  childAge: number;
  source: 'ONLINE' | 'REFERRAL' | 'VISIT' | 'PHONE';
  status: 'NEW' | 'FOLLOWING' | 'CONVERTED' | 'LOST';
  // 🎯 新增教师权限相关字段
  followStatus: '待跟进' | '跟进中' | '已转化' | '已放弃';
  priority: number; // 1-高，2-中，3-低
  isPublic: boolean;
  assignedTeacherId?: number;
  lastFollowupAt?: string;
  lastFollowDate?: string;
  assignDate: string;
  remarks?: string;
  createTime?: string;
  assignedBy?: string;
}

/**
 * 客户统计信息接口
 */
export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  pendingFollow: number;
  convertedCustomers: number;
  lostCustomers: number;
  conversionRate: number;
}

/**
 * 跟进记录接口
 */
export interface FollowRecord {
  id: number;
  followType: string;
  content: string;
  nextFollowDate?: string;
  followDate: string;
  teacherName: string;
}

/**
 * 客户查询参数
 */
export interface CustomerQueryParams {
  page?: number;
  pageSize?: number;
  customerName?: string;
  phone?: string;
  status?: string;
  source?: string;
}

/**
 * 跟进记录参数
 */
export interface FollowRecordParams {
  followType: string;
  content: string;
  nextFollowDate?: string;
  followStatus?: string;
  priority?: number;
}

/**
 * 获取教师客户统计
 * @returns 客户统计信息
 */
export function getTeacherCustomerStats(): Promise<ApiResponseType<CustomerStats>> {
  return get(TEACHER_CUSTOMERS_ENDPOINTS.STATS);
}

/**
 * 获取教师客户列表
 * @param params 查询参数
 * @returns 客户列表
 */
export function getTeacherCustomerList(params?: CustomerQueryParams): Promise<ApiResponseType<{
  list: CustomerInfo[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}>> {
  return get(TEACHER_CUSTOMERS_ENDPOINTS.LIST, params);
}

/**
 * 添加客户跟进记录
 * @param customerId 客户ID
 * @param data 跟进记录数据
 * @returns 操作结果
 */
export function addCustomerFollowRecord(customerId: number, data: FollowRecordParams): Promise<ApiResponseType<any>> {
  return post(TEACHER_CUSTOMERS_ENDPOINTS.FOLLOW(customerId), data);
}

/**
 * 更新客户状态
 * @param customerId 客户ID
 * @param status 新状态
 * @param remarks 备注
 * @returns 操作结果
 */
export function updateCustomerStatus(customerId: number, status: string, remarks?: string): Promise<ApiResponseType<any>> {
  return put(`/api/teacher/customers/${customerId}/status`, { status, remarks });
}

/**
 * 获取客户跟进记录
 * @param customerId 客户ID
 * @returns 跟进记录列表
 */
export function getCustomerFollowRecords(customerId: number): Promise<ApiResponseType<FollowRecord[]>> {
  return get(`/api/teacher/customers/${customerId}/follow-records`);
}

/**
 * 获取教师活动统计数据
 * @returns 教师活动统计信息
 */
export function getTeacherActivityStatistics(): Promise<ApiResponseType<{
  overview: {
    totalActivities: number;
    publishedActivities: number;
    draftActivities: number;
    cancelledActivities: number;
    totalRegistrations: number;
    totalCheckins: number;
    avgCheckinRate: number;
  };
  trends: Array<{
    date: string;
    count: number;
  }>;
}>> {
  return get('/teacher-dashboard/activity-statistics');
}