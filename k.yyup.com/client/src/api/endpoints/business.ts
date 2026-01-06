/**
 * 业务核心功能相关API端点
 */
import { API_PREFIX } from './base';

// 幼儿园管理接口
export const KINDERGARTEN_ENDPOINTS = {
  BASE: `${API_PREFIX}kindergartens`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}kindergartens/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}kindergartens/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}kindergartens/${id}`,
  GET_CLASSES: (id: number | string) => `${API_PREFIX}kindergartens/${id}/classes`,
  GET_TEACHERS: (id: number | string) => `${API_PREFIX}kindergartens/${id}/teachers`,
  GET_STUDENTS: (id: number | string) => `${API_PREFIX}kindergartens/${id}/students`,
  STATISTICS: (id: number | string) => `${API_PREFIX}kindergartens/${id}/statistics`,
} as const;

// 班级管理接口
export const CLASS_ENDPOINTS = {
  BASE: `${API_PREFIX}classes`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}classes/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}classes/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}classes/${id}`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}classes/${id}/status`,
  TEACHERS: (id: number | string) => `${API_PREFIX}classes/${id}/teachers`,
  STUDENTS: (id: number | string) => `${API_PREFIX}classes/${id}/students`,
  REMOVE_STUDENT: (classId: number | string, studentId: number | string) => 
    `${API_PREFIX}classes/${classId}/students/${studentId}`,
  TRANSFER: (id: number | string) => `${API_PREFIX}classes/${id}/transfer`,
  STATISTICS: `${API_PREFIX}classes/stats`,
  AVAILABLE_CLASSROOMS: `${API_PREFIX}classes/available-classrooms`,
  EXPORT: `${API_PREFIX}classes/export`,
  GET_STUDENTS: (id: number | string) => `${API_PREFIX}classes/${id}/students`,
  GET_TEACHERS: (id: number | string) => `${API_PREFIX}classes/${id}/teachers`,
  ASSIGN_TEACHER: (classId: number | string, teacherId: number | string) => 
    `${API_PREFIX}classes/${classId}/teachers/${teacherId}`,
  REMOVE_TEACHER: (classId: number | string, teacherId: number | string) => 
    `${API_PREFIX}classes/${classId}/teachers/${teacherId}`,
  BATCH_ASSIGN_STUDENTS: (id: number | string) => `${API_PREFIX}classes/${id}/students/batch-assign`,
  ATTENDANCE: (id: number | string) => `${API_PREFIX}classes/${id}/attendance`,
} as const;

// 教师管理接口
export const TEACHER_ENDPOINTS = {
  BASE: `${API_PREFIX}teachers`,
  LIST: `${API_PREFIX}teachers`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}teachers/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}teachers/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}teachers/${id}`,
  CREATE: `${API_PREFIX}teachers`,
  GET_CLASSES: (id: number | string) => `${API_PREFIX}teachers/${id}/classes`,
  SEARCH: `${API_PREFIX}teachers/search`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}teachers/${id}/status`,
  EXPORT: `${API_PREFIX}teachers/export`,
  BATCH_DELETE: `${API_PREFIX}teachers/batch-delete`,
  ASSIGN_CLASSES: (id: number | string) => `${API_PREFIX}teachers/${id}/classes`,
  PERFORMANCE: (id: number | string) => `${API_PREFIX}teachers/${id}/performance`,
  SCHEDULE: (id: number | string) => `${API_PREFIX}teachers/${id}/schedule`,
  WORKLOAD: (id: number | string) => `${API_PREFIX}teachers/${id}/workload`,
  STATS: (id: number | string) => `${API_PREFIX}teachers/${id}/stats`,
} as const;

// 学生管理接口
export const STUDENT_ENDPOINTS = {
  BASE: `${API_PREFIX}students`,
  LIST: `${API_PREFIX}students`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}students/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}students/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}students/${id}`,
  GET_CLASS: (id: number | string) => `${API_PREFIX}students/${id}/class`,
  GET_PARENTS: (id: number | string) => `${API_PREFIX}students/${id}/parents`,
  SEARCH: `${API_PREFIX}students/search`,
  AVAILABLE: `${API_PREFIX}students/available`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}students/${id}/status`,
  STATS: `${API_PREFIX}students/stats`,
  STATISTICS: `${API_PREFIX}students/statistics`,
  EXPORT: `${API_PREFIX}students/export`,
  BATCH_DELETE: `${API_PREFIX}students/batch-delete`,
  ATTENDANCE: (id: number | string) => `${API_PREFIX}students/${id}/attendance`,
  GRADES: (id: number | string) => `${API_PREFIX}students/${id}/grades`,
  GROWTH_RECORDS: (id: number | string) => `${API_PREFIX}students/${id}/growth-records`,
  GROWTH_RECORD: (id: number | string) => `${API_PREFIX}students/${id}/growth-record`,
  ANALYTICS: (id: number | string) => `${API_PREFIX}students/${id}/analytics`,
  ASSESSMENTS: `${API_PREFIX}students/assessments`,
  DETAIL: (id: number | string) => `${API_PREFIX}students/${id}`,
  EXPORT_GROWTH_REPORT: (id: number | string) => `${API_PREFIX}students/${id}/export-growth-report`,
  EXPORT_ASSESSMENTS: `${API_PREFIX}students/export-assessments`,
  EXPORT_ANALYTICS: (id: number | string) => `${API_PREFIX}students/${id}/export-analytics`,
  REMOVE_FROM_CLASS: (studentId: number | string, classId: number | string) => 
    `${API_PREFIX}students/${studentId}/remove-from-class/${classId}`,
} as const;

// 家长管理接口
export const PARENT_ENDPOINTS = {
  BASE: `${API_PREFIX}parents`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}parents/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}parents/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}parents/${id}`,
  GET_CHILDREN: (id: number | string) => `${API_PREFIX}parents/${id}/students`,
  SEARCH: `${API_PREFIX}parents/search`,
  EXPORT: `${API_PREFIX}parents/export`,
  BATCH_DELETE: `${API_PREFIX}parents/batch-delete`,
  COMMUNICATION_HISTORY: (id: number | string) => `${API_PREFIX}parents/${id}/communication`,
  FEEDBACK: (id: number | string) => `${API_PREFIX}parents/${id}/feedback`,
  MEETINGS: (id: number | string) => `${API_PREFIX}parents/${id}/meetings`,
} as const;