/**
 * 教师管理相关类型定义
 */

import { PaginationParams } from './api-response';

/**
 * 教师状态枚举
 */
export enum TeacherStatus {
  ACTIVE = 'ACTIVE',       // 在职
  LEAVE = 'LEAVE',         // 请假
  RESIGNED = 'RESIGNED',   // 离职
  SUSPENDED = 'SUSPENDED'  // 停职
}

/**
 * 教师类型枚举
 */
export enum TeacherType {
  FULL_TIME = 'FULL_TIME',   // 全职
  PART_TIME = 'PART_TIME',   // 兼职
  CONTRACT = 'CONTRACT',     // 合同工
  INTERN = 'INTERN'          // 实习生
}

/**
 * 教师职级枚举
 */
export enum TeacherLevel {
  JUNIOR = 'JUNIOR',         // 初级
  INTERMEDIATE = 'INTERMEDIATE', // 中级
  SENIOR = 'SENIOR',         // 高级
  EXPERT = 'EXPERT'          // 专家级
}

/**
 * 教师教育背景接口
 */
export interface TeacherEducation {
  degree: string;          // 学位
  major: string;           // 专业
  school: string;          // 学校
  graduationYear: number;  // 毕业年份
}

/**
 * 教师基础信息接口
 */
export interface Teacher {
  id: number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email?: string;
  avatar?: string;
  employeeId?: string;       // 工号
  status: TeacherStatus;
  type: TeacherType;
  level?: TeacherLevel;
  title?: string;            // 职称
  department?: string;       // 部门
  subject?: string;          // 主教科目
  hireDate: string;          // 入职日期
  birthday?: string;         // 生日
  address?: string;          // 地址
  education?: TeacherEducation; // 教育背景
  certification?: string[];  // 资格证书
  skills?: string[];         // 技能标签
  experience?: number;       // 工作经验(年)
  salary?: {
    base: number;           // 基本工资
    allowance?: number;     // 津贴
    bonus?: number;         // 奖金
  };
  classIds?: number[];       // 所带班级ID
  classNames?: string[];     // 所带班级名称
  kindergartenId?: number;   // 所属幼儿园ID
  createdAt: string;
  updatedAt: string;
}

/**
 * 教师详细信息接口
 */
export interface TeacherDetail extends Teacher {
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  workExperience?: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description?: string;
  }[];
  performance?: {
    score: number;
    rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
    period: string;
    comments?: string;
  }[];
}

/**
 * 教师简要信息接口
 */
export interface TeacherBrief {
  id: string | number;
  name: string;
  gender: 'MALE' | 'FEMALE';
  avatar?: string;
  title?: string;
  phone: string;
  status: TeacherStatus;
  type: TeacherType;
  department?: string;
  classNames?: string[];
}

/**
 * 教师创建参数
 */
export interface CreateTeacherParams {
  name: string;
  gender: 'MALE' | 'FEMALE';
  phone: string;
  email?: string;
  employeeId?: string;
  status?: TeacherStatus;
  type: TeacherType;
  level?: TeacherLevel;
  title?: string;
  department?: string;
  subject?: string;
  hireDate: string;
  birthday?: string;
  address?: string;
  avatar?: string;
  education?: TeacherEducation;
  certification?: string[];
  skills?: string[];
  experience?: number;
  kindergartenId?: string | number;
}

/**
 * 教师更新参数
 */
export interface UpdateTeacherParams {
  name?: string;
  phone?: string;
  email?: string;
  status?: TeacherStatus;
  type?: TeacherType;
  level?: TeacherLevel;
  title?: string;
  department?: string;
  subject?: string;
  birthday?: string;
  address?: string;
  avatar?: string;
  education?: TeacherEducation;
  certification?: string[];
  skills?: string[];
  experience?: number;
}

/**
 * 教师查询参数
 */
export interface TeacherQueryParams extends PaginationParams {
  keyword?: string;
  status?: TeacherStatus;
  type?: TeacherType;
  level?: TeacherLevel;
  department?: string;
  subject?: string;
  classId?: string | number;
  kindergartenId?: string | number;
  hireStartDate?: string;
  hireEndDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 教师搜索参数
 */
export interface TeacherSearchParams {
  keyword: string;
  excludeIds?: (string | number)[];
  classId?: string | number;
  department?: string;
  limit?: number;
}

/**
 * 教师班级关联信息
 */
export interface TeacherClassInfo {
  id: string | number;
  name: string;
  type: string;
  grade: string;
  role: 'HEAD_TEACHER' | 'ASSISTANT_TEACHER' | 'SUBJECT_TEACHER';
  startDate: string;
  endDate?: string;
}

/**
 * 教师统计信息
 */
export interface TeacherStats {
  totalTeachers: number;
  activeTeachers: number;
  newTeachersToday: number;
  newTeachersThisMonth: number;
  typeDistribution: {
    [key in TeacherType]?: number;
  };
  statusDistribution: {
    [key in TeacherStatus]?: number;
  };
  departmentDistribution: {
    [department: string]: number;
  };
  averageExperience: number;
  averageAge: number;
}

/**
 * 教师考勤信息
 */
export interface TeacherAttendance {
  id: string | number;
  teacherId: string | number;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  leaveType?: 'SICK' | 'PERSONAL' | 'ANNUAL' | 'MATERNITY';
  notes?: string;
}

/**
 * 教师培训记录
 */
export interface TeacherTraining {
  id: string | number;
  teacherId: string | number;
  title: string;
  type: 'INTERNAL' | 'EXTERNAL' | 'ONLINE';
  startDate: string;
  endDate: string;
  duration: number; // 小时
  certificate?: string; // 证书编号
  score?: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED';
  description?: string;
}