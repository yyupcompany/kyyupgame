/**
 * 教师学生测评管理 API
 */
import request from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
export const TEACHER_ASSESSMENT_ENDPOINTS = {
  STUDENTS: `${API_PREFIX}/teacher/assessment/students`,
  STUDENT_DETAIL: (studentId: number) => `${API_PREFIX}/teacher/assessment/student/${studentId}`,
  STUDENT_HISTORY: (studentId: number) => `${API_PREFIX}/teacher/assessment/student/${studentId}/history`,
  NOTE: `${API_PREFIX}/teacher/assessment/note`,
  CLASS_STATISTICS: `${API_PREFIX}/teacher/assessment/class-statistics`,
  FOCUS_STUDENTS: `${API_PREFIX}/teacher/assessment/focus-students`
} as const;

export interface StudentAssessmentSummary {
  id: number;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  assessmentCount: number;
  lastAssessmentDate: string;
  averageScore: number;
  className?: string;
}

export interface StudentAssessmentDetail {
  student: {
    id: number;
    name: string;
    age: number;
    gender: string;
    avatar: string;
    className: string;
  };
  assessmentHistory: Array<{
    id: number;
    type: string;
    totalScore: number;
    createdAt: string;
    dimensionScores: {
      cognitive: number;
      physical: number;
      social: number;
      emotional: number;
      language: number;
    };
  }>;
  latestDimensions: {
    cognitive: number;
    physical: number;
    social: number;
    emotional: number;
    language: number;
  };
  teacherNotes: Array<{
    id: number;
    content: string;
    createdAt: string;
    teacherName: string;
  }>;
}

export interface ClassStatistics {
  className: string;
  studentCount: number;
  averageScore: number;
  assessmentCount: number;
  dimensionAverages: {
    cognitive: number;
    physical: number;
    social: number;
    emotional: number;
    language: number;
  };
}

/**
 * 获取教师班级学生列表（含测评统计）
 */
export function getTeacherStudents() {
  return request.get<StudentAssessmentSummary[]>(TEACHER_ASSESSMENT_ENDPOINTS.STUDENTS);
}

/**
 * 获取学生测评详情
 */
export function getStudentAssessmentDetail(studentId: number) {
  return request.get<StudentAssessmentDetail>(TEACHER_ASSESSMENT_ENDPOINTS.STUDENT_DETAIL(studentId));
}

/**
 * 获取学生测评历史
 */
export function getStudentAssessmentHistory(studentId: number) {
  return request.get(TEACHER_ASSESSMENT_ENDPOINTS.STUDENT_HISTORY(studentId));
}

/**
 * 添加教师备注
 */
export function addTeacherNote(data: {
  studentId: number;
  recordId: number;
  content: string;
}) {
  return request.post(TEACHER_ASSESSMENT_ENDPOINTS.NOTE, data);
}

/**
 * 获取班级统计
 */
export function getClassStatistics() {
  return request.get<ClassStatistics>(TEACHER_ASSESSMENT_ENDPOINTS.CLASS_STATISTICS);
}

/**
 * 获取重点关注学生列表
 */
export function getFocusStudents() {
  return request.get(TEACHER_ASSESSMENT_ENDPOINTS.FOCUS_STUDENTS);
}










