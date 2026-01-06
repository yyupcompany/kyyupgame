/**
 * 班级管理模块类型定义
 */

// 基础项目接口
export interface BaseItem {
  id: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 班级状态枚举
 */
export enum ClassStatus {
  ACTIVE = 'ACTIVE',       // 活跃
  INACTIVE = 'INACTIVE',   // 非活跃
  PENDING = 'PENDING',     // 待开班
  CLOSED = 'CLOSED'        // 已结业
}

/**
 * 班级类型枚举
 */
export enum ClassType {
  FULL_TIME = 'FULL_TIME',
  HALF_TIME = 'HALF_TIME',
  SPECIAL = 'SPECIAL'
}

/**
 * 班级基本信息
 */
export interface Class {
  id: string;
  name: string;
  grade: string;
  capacity: number;
  currentCount: number;
  headTeacherId?: string;
  kindergartenId: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/**
 * 班级课程表
 */
export interface ClassSchedule {
  id: string;
  classId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherId: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 班级创建请求
 */
export interface ClassCreateRequest {
  name: string;
  grade: string;
  capacity: number;
  headTeacherId?: string;
  kindergartenId: string;
}

/**
 * 班级创建参数（API使用）
 */
export interface ClassCreateParams {
  name: string;
  grade: string;
  capacity: number;
  kindergartenId: number;
  teacherId: number;
  academicYear: string;
  currentCount?: number;
  type?: ClassType;
  status?: ClassStatus;
  description?: string;
  classroom?: string;
}

/**
 * 班级更新请求
 */
export interface ClassUpdateRequest {
  name?: string;
  grade?: string;
  capacity?: number;
  headTeacherId?: string;
  status?: 'active' | 'inactive';
}

/**
 * 班级信息（包含关联数据）
 */
export interface ClassInfo extends Class {
  headTeacher?: {
    id: string;
    name: string;
    avatar?: string;
  };
  teachers?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
  students?: Array<{
    id: string;
    name: string;
    avatar?: string;
    age: number;
    gender: 'male' | 'female';
  }>;
  schedule?: ClassSchedule[];
}

/**
 * 班级学生信息接口
 */
export interface ClassStudent {
  id: string;
  studentId: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  birthDate?: string;
  enrollmentDate?: string;
  joinDate: string;
  parentName: string;
  parentContact: string;
  address?: string;
  remarks?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
  attendanceRate: number;
}

/**
 * 班级查询参数接口
 */
export interface ClassQueryParams {
  keyword?: string;
  type?: ClassType;
  status?: ClassStatus;
  page?: number;
  pageSize?: number;
}

/**
 * 教师分配参数接口
 */
export interface TeacherAssignmentParams {
  headTeacherId?: string;
  assistantTeacherIds?: string[];
}

// 班级详情
export interface ClassDetail {
  id: string;
  name: string;
  type: ClassType;
  status: ClassStatus;
  capacity: number;
  currentCount: number;
  headTeacherId?: string;
  headTeacherName?: string;
  assistantTeacherIds?: string[];
  assistantTeacherNames?: string[];
  classroom?: string;
  ageRange: string;
  startDate: string;
  endDate?: string;
  description?: string;
  classSchedule?: ScheduleItem[];
  createdAt: string;
  updatedAt: string;
  teachers: TeacherInfo[];
  students: StudentBrief[];
}

// 教师简要信息
export interface TeacherInfo {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  age?: number;
  contact?: string;
  email?: string;
  position?: string;
  isHeadTeacher?: boolean;
}

// 学生简要信息
export interface StudentBrief {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  age: number;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED';
}

// 课程表项接口
export interface ScheduleItem {
  day: number; // 1-7 代表周一到周日
  subject: string;
  startTime: string; // 格式 HH:MM
  endTime: string; // 格式 HH:MM
}

// 学生出勤记录接口
export interface StudentAttendance {
  id: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks?: string;
  recordedAt: string;
  recordedBy: string;
}

/**
 * 班级教师信息接口
 */
export interface ClassTeacherInfo {
  id: number;
  teacherId: number;
  teacherName: string;
  classId: number;
  className: string;
  role: 'HEAD' | 'ASSISTANT';
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

/**
 * 班级搜索过滤接口
 */
export interface ClassFilter {
  name?: string;
  type?: ClassType;
  status?: ClassStatus;
  teacherId?: number;
  startDateRange?: [string, string];
  page: number;
  size: number;
}

/**
 * 班级搜索结果接口
 */
export interface ClassSearchResult {
  items: ClassInfo[];
  total: number;
  page: number;
  size: number;
}

// 班级筛选请求
export interface ClassFilterRequest {
  keyword?: string;
  type?: ClassType;
  status?: ClassStatus;
  schoolYear?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 班级学生关联请求
export interface ClassStudentAssignRequest {
  classId: number;
  studentIds: number[];
}

// 班级教师关联请求
export interface ClassTeacherAssignRequest {
  classId: number;
  teacherIds: number[];
}

// 班级统计数据接口
export interface ClassStatistics {
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  totalTeachers: number;
  averageCapacityRate: number;
  classTypeDistribution: Array<{
    type: ClassType;
    count: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    count: number;
  }>;
} 