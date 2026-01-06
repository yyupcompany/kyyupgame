// 教师课程管理API
import { request } from '@/utils/request';

/**
 * 课程状态枚举
 */
export enum CourseStatus {
  ASSIGNED = 'assigned',      // 已分配
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed',     // 已完成
  PAUSED = 'paused'           // 已暂停
}

/**
 * 教学效果枚举
 */
export enum TeachingEffect {
  EXCELLENT = 'excellent',  // 优秀
  GOOD = 'good',           // 良好
  AVERAGE = 'average',     // 一般
  POOR = 'poor'           // 较差
}

/**
 * 教师课程接口
 */
export interface TeacherCourse {
  id: number;
  teacher_id: number;
  class_id: number;
  course_plan_id: number;
  brain_science_course_id: number;
  status: CourseStatus;
  start_date?: string;
  expected_end_date?: string;
  actual_end_date?: string;
  remarks?: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  
  // 关联数据
  class?: {
    id: number;
    class_name: string;
    grade?: string;
    student_count?: number;
  };
  coursePlan?: {
    id: number;
    plan_name: string;
    description?: string;
    total_weeks?: number;
    weekly_lessons?: number;
  };
  brainScienceCourse?: {
    id: number;
    course_name: string;
    course_type?: string;  // 课程类型
    age_group?: string;
    domain?: string;
    course_cover?: string;
    course_objectives?: string;
  };
  assignedByUser?: {
    id: number;
    username: string;
    name?: string;
  };
  records?: TeacherCourseRecord[];
  progress?: {
    completed_lessons: number;
    total_lessons: number;
    progress_percentage: number;
    last_lesson_date?: string;
  };
}

/**
 * 教学记录接口
 */
export interface TeacherCourseRecord {
  id: number;
  teacher_class_course_id: number;
  teacher_id: number;
  class_id: number;
  course_plan_id: number;
  lesson_number?: number;
  lesson_date: string;
  lesson_duration?: number;
  attendance_count?: number;
  teaching_content?: string;
  teaching_method?: string;
  teaching_effect?: TeachingEffect;
  student_feedback?: string;
  difficulties?: string;
  improvements?: string;
  media_files?: any[];
  created_at: string;
  updated_at: string;
}

/**
 * 课程统计接口
 */
export interface CourseStats {
  statusStats: {
    assigned: number;
    in_progress: number;
    completed: number;
    paused: number;
  };
  thisWeekRecords: number;
  totalCourses: number;
  totalRecords: number;
}

/**
 * 课程查询参数
 */
export interface CourseQueryParams {
  status?: CourseStatus | string;
  classId?: number;
}

/**
 * 教学记录创建参数
 */
export interface CourseRecordCreateParams {
  lesson_date: string;
  lesson_number?: number;
  lesson_duration?: number;
  attendance_count?: number;
  teaching_content?: string;
  teaching_method?: string;
  teaching_effect?: TeachingEffect;
  student_feedback?: string;
  difficulties?: string;
  improvements?: string;
  media_files?: any[];
}

/**
 * 获取教师的所有课程列表
 * @param params 查询参数
 */
export const getMyCourses = (params?: CourseQueryParams) => {
  return request.get<TeacherCourse[]>('/teacher/courses', { params });
};

/**
 * 获取课程统计数据
 */
export const getCourseStats = () => {
  return request.get<CourseStats>('/teacher/courses/stats');
};

/**
 * 获取课程详情
 * @param courseId 课程ID
 */
export const getCourseDetail = (courseId: number) => {
  return request.get<TeacherCourse>(`/teacher/courses/${courseId}`);
};

/**
 * 更新课程状态
 * @param courseId 课程ID
 * @param status 新状态
 */
export const updateCourseStatus = (courseId: number, status: CourseStatus) => {
  return request.put(`/teacher/courses/${courseId}/status`, { status });
};

/**
 * 添加教学记录
 * @param courseId 课程ID
 * @param data 记录数据
 */
export const addCourseRecord = (courseId: number, data: CourseRecordCreateParams) => {
  return request.post<TeacherCourseRecord>(`/teacher/courses/${courseId}/records`, data);
};

/**
 * 更新教学记录
 * @param courseId 课程ID
 * @param recordId 记录ID
 * @param data 更新数据
 */
export const updateCourseRecord = (courseId: number, recordId: number, data: Partial<CourseRecordCreateParams>) => {
  return request.put<TeacherCourseRecord>(`/teacher/courses/${courseId}/records/${recordId}`, data);
};

/**
 * 删除教学记录
 * @param courseId 课程ID
 * @param recordId 记录ID
 */
export const deleteCourseRecord = (courseId: number, recordId: number) => {
  return request.delete(`/teacher/courses/${courseId}/records/${recordId}`);
};
