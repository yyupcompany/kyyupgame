/**
 * 自定义课程API接口
 * 提供课程、课程内容、课程排期的完整CRUD操作
 */

import request from '@/utils/request';
import type { ApiResponse } from '@/types/api';

// ==================== 类型定义 ====================

/**
 * 课程类型
 */
export type CourseType = 'brain_science' | 'custom' | 'theme';

/**
 * 课程状态
 */
export type CourseStatus = 'draft' | 'published' | 'archived';

/**
 * 内容类型
 */
export type ContentType = 'text' | 'image' | 'video' | 'interactive' | 'document';

/**
 * 排期状态
 */
export type ScheduleStatus = 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';

/**
 * 四进度配置
 */
export interface ProgressConfig {
  indoor_weeks: number;
  outdoor_weeks: number;
  display_count: number;
  championship_count: number;
}

/**
 * 课程信息
 */
export interface CustomCourse {
  id: number;
  course_name: string;
  course_description?: string;
  course_type: CourseType;
  age_group: string;
  semester: string;
  academic_year: string;
  status: CourseStatus;
  thumbnail_url?: string;
  progress_config?: ProgressConfig;
  objectives?: string;
  target_class_type?: string;
  total_sessions?: number;
  session_duration?: number;
  created_by: number;
  kindergarten_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator?: {
    id: number;
    username: string;
    name?: string;
  };
  contents?: CourseContent[];
}

/**
 * 内容数据
 */
export interface ContentData {
  text?: string;
  image_url?: string;
  image_urls?: string[];
  video_url?: string;
  video_cover?: string;
  document_url?: string;
  interactive_id?: number;
  interactive_name?: string;
}

/**
 * 课程内容
 */
export interface CourseContent {
  id: number;
  course_id: number;
  content_type: ContentType;
  content_title: string;
  content_data: ContentData;
  sort_order: number;
  duration_minutes?: number;
  is_required: boolean;
  teaching_notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * 排课时间配置
 */
export interface ScheduleConfig {
  weekdays: number[];
  time_slots: string[];
}

/**
 * 课程排期
 */
export interface CourseSchedule {
  id: number;
  course_id: number;
  class_id: number;
  teacher_id: number;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  schedule_config?: ScheduleConfig;
  schedule_status: ScheduleStatus;
  delay_days: number;
  delay_reason?: string;
  completed_sessions: number;
  total_sessions: number;
  alert_level: 'none' | 'warning' | 'critical';
  alert_sent: boolean;
  teacher_confirmed: boolean;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  course?: CustomCourse;
  class?: { id: number; class_name: string };
  teacher?: { id: number; name: string };
}

/**
 * 互动课程关联
 */
export interface CourseInteractiveLink {
  id: number;
  course_id: number;
  course_content_id?: number;
  creative_curriculum_id: number;
  link_type: 'embedded' | 'reference';
  added_by: number;
  approved_by?: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_notes?: string;
  use_count: number;
  is_active: boolean;
  created_at: string;
  creativeCurriculum?: {
    id: number;
    name: string;
    description: string;
    domain: string;
    thumbnail?: string;
  };
  addedByUser?: {
    id: number;
    username: string;
    name?: string;
  };
}

/**
 * 课程统计数据
 */
export interface CourseStats {
  courses: {
    total: number;
    published: number;
    draft: number;
    brain_science: number;
    custom: number;
  };
  schedules: {
    total: number;
    in_progress: number;
    completed: number;
    delayed: number;
  };
  interactiveCourses?: {
    total: number;
    published: number;
    linked: number;
  };
}

/**
 * 延期告警数据
 */
export interface DelayedSchedule extends CourseSchedule {
  delay_days: number;
  remaining_days: number;
  alert_level: 'warning' | 'critical';
  alert_message: string;
}

// ==================== 查询参数 ====================

export interface GetCoursesParams {
  page?: number;
  pageSize?: number;
  course_type?: CourseType;
  status?: CourseStatus;
  age_group?: string;
  semester?: string;
  academic_year?: string;
  search?: string;
}

export interface GetSchedulesParams {
  class_id?: number;
  teacher_id?: number;
  status?: ScheduleStatus;
}

// ==================== API响应类型 ====================

export interface CoursesListResponse {
  list: CustomCourse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== API函数 ====================

const API_BASE = '/api/custom-courses';

/**
 * 获取课程列表
 */
export const getCourses = (params?: GetCoursesParams): Promise<ApiResponse<CoursesListResponse>> => {
  return request.get(API_BASE, { params });
};

/**
 * 获取单个课程详情
 */
export const getCourseById = (id: number): Promise<ApiResponse<CustomCourse>> => {
  return request.get(`${API_BASE}/${id}`);
};

/**
 * 创建课程
 */
export const createCourse = (data: Partial<CustomCourse>): Promise<ApiResponse<CustomCourse>> => {
  return request.post(API_BASE, data);
};

/**
 * 更新课程
 */
export const updateCourse = (id: number, data: Partial<CustomCourse>): Promise<ApiResponse<CustomCourse>> => {
  return request.put(`${API_BASE}/${id}`, data);
};

/**
 * 删除课程
 */
export const deleteCourse = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`${API_BASE}/${id}`);
};

/**
 * 发布课程
 */
export const publishCourse = (id: number): Promise<ApiResponse<CustomCourse>> => {
  return request.put(`${API_BASE}/${id}/publish`);
};

/**
 * 归档课程
 */
export const archiveCourse = (id: number): Promise<ApiResponse<CustomCourse>> => {
  return request.put(`${API_BASE}/${id}/archive`);
};

// ==================== 课程内容API ====================

/**
 * 获取课程内容列表
 */
export const getCourseContents = (courseId: number): Promise<ApiResponse<CourseContent[]>> => {
  return request.get(`${API_BASE}/${courseId}/contents`);
};

/**
 * 添加课程内容
 */
export const addCourseContent = (courseId: number, data: Partial<CourseContent>): Promise<ApiResponse<CourseContent>> => {
  return request.post(`${API_BASE}/${courseId}/contents`, data);
};

/**
 * 更新课程内容
 */
export const updateCourseContent = (contentId: number, data: Partial<CourseContent>): Promise<ApiResponse<CourseContent>> => {
  return request.put(`${API_BASE}/contents/${contentId}`, data);
};

/**
 * 删除课程内容
 */
export const deleteCourseContent = (contentId: number): Promise<ApiResponse<void>> => {
  return request.delete(`${API_BASE}/contents/${contentId}`);
};

/**
 * 更新课程内容排序
 */
export const reorderCourseContents = (courseId: number, contentIds: number[]): Promise<ApiResponse<void>> => {
  return request.put(`${API_BASE}/${courseId}/contents/reorder`, { contentIds });
};

// ==================== 课程排期API ====================

/**
 * 获取课程排期列表
 */
export const getCourseSchedules = (courseId: number, params?: GetSchedulesParams): Promise<ApiResponse<CourseSchedule[]>> => {
  return request.get(`${API_BASE}/${courseId}/schedules`, { params });
};

/**
 * 创建课程排期
 */
export const createCourseSchedule = (courseId: number, data: Partial<CourseSchedule>): Promise<ApiResponse<CourseSchedule>> => {
  return request.post(`${API_BASE}/${courseId}/schedules`, data);
};

/**
 * 更新课程排期
 */
export const updateCourseSchedule = (scheduleId: number, data: Partial<CourseSchedule>): Promise<ApiResponse<CourseSchedule>> => {
  return request.put(`${API_BASE}/schedules/${scheduleId}`, data);
};

/**
 * 删除课程排期
 */
export const deleteCourseSchedule = (scheduleId: number): Promise<ApiResponse<void>> => {
  return request.delete(`${API_BASE}/schedules/${scheduleId}`);
};

/**
 * 教师确认课程排期
 */
export const confirmSchedule = (scheduleId: number): Promise<ApiResponse<CourseSchedule>> => {
  return request.put(`${API_BASE}/schedules/${scheduleId}/confirm`);
};

// ==================== AI互动课程关联API ====================

/**
 * 获取课程的互动课程关联列表
 */
export const getCourseInteractiveLinks = (courseId: number): Promise<ApiResponse<CourseInteractiveLink[]>> => {
  return request.get(`${API_BASE}/${courseId}/interactive-links`);
};

/**
 * 关联AI互动课程
 */
export const linkInteractiveCourse = (courseId: number, data: {
  creative_curriculum_id: number;
  course_content_id?: number;
  link_type?: 'embedded' | 'reference';
}): Promise<ApiResponse<CourseInteractiveLink>> => {
  return request.post(`${API_BASE}/${courseId}/interactive-links`, data);
};

/**
 * 取消关联AI互动课程
 */
export const unlinkInteractiveCourse = (linkId: number): Promise<ApiResponse<void>> => {
  return request.delete(`${API_BASE}/interactive-links/${linkId}`);
};

/**
 * 审核互动课程关联
 */
export const approveInteractiveLink = (linkId: number, data: {
  approval_status: 'approved' | 'rejected';
  approval_notes?: string;
}): Promise<ApiResponse<CourseInteractiveLink>> => {
  return request.put(`${API_BASE}/interactive-links/${linkId}/approve`, data);
};

// ==================== 统计和告警API ====================

/**
 * 获取课程统计数据
 */
export const getCourseStats = (): Promise<ApiResponse<CourseStats>> => {
  return request.get(`${API_BASE}/stats`);
};

/**
 * 获取延期告警列表
 */
export const getDelayedSchedules = (): Promise<ApiResponse<DelayedSchedule[]>> => {
  return request.get(`${API_BASE}/delayed-schedules`);
};

// ==================== 教师端API ====================

/**
 * 获取教师的课程列表
 */
export const getTeacherCourses = (params?: {
  status?: ScheduleStatus;
  class_id?: number;
}): Promise<ApiResponse<CourseSchedule[]>> => {
  return request.get(`${API_BASE}/teacher/my-courses`, { params });
};

// ==================== 课程分配API ====================

/**
 * 获取分配统计数据
 */
export const getAssignmentStats = (): Promise<ApiResponse<any>> => {
  return request.get(`${API_BASE}/assignments/stats`);
};

/**
 * 获取课程的分配列表
 */
export const getCourseAssignments = (courseId: number): Promise<ApiResponse<any[]>> => {
  return request.get(`${API_BASE}/${courseId}/assignments`);
};

/**
 * 创建课程分配
 */
export const createCourseAssignment = (courseId: number, data: {
  teacher_id: number;
  class_id: number;
  start_date?: string;
  expected_end_date?: string;
  notes?: string;
}): Promise<ApiResponse<any>> => {
  return request.post(`${API_BASE}/${courseId}/assignments`, data);
};

/**
 * 更新课程分配
 */
export const updateCourseAssignment = (assignmentId: number, data: {
  status?: string;
  start_date?: string;
  expected_end_date?: string;
  actual_end_date?: string;
  notes?: string;
}): Promise<ApiResponse<any>> => {
  return request.put(`${API_BASE}/assignments/${assignmentId}`, data);
};

/**
 * 取消课程分配
 */
export const cancelCourseAssignment = (assignmentId: number): Promise<ApiResponse<void>> => {
  return request.delete(`${API_BASE}/assignments/${assignmentId}`);
};

/**
 * 获取教师的课程分配列表
 */
export const getTeacherAssignments = (): Promise<ApiResponse<any[]>> => {
  return request.get(`${API_BASE}/teacher/my-assignments`);
};

export default {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  archiveCourse,
  getCourseContents,
  addCourseContent,
  updateCourseContent,
  deleteCourseContent,
  reorderCourseContents,
  getCourseSchedules,
  createCourseSchedule,
  updateCourseSchedule,
  deleteCourseSchedule,
  confirmSchedule,
  getCourseInteractiveLinks,
  linkInteractiveCourse,
  unlinkInteractiveCourse,
  approveInteractiveLink,
  getCourseStats,
  getDelayedSchedules,
  getTeacherCourses,
  getAssignmentStats,
  getCourseAssignments,
  createCourseAssignment,
  updateCourseAssignment,
  cancelCourseAssignment,
  getTeacherAssignments
};

