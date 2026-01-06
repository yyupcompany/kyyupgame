/**
 * 教师考勤管理API
 */
import { request } from '../../utils/request';
import type { ApiResponse } from '@/utils/request';
import { TEACHER_ATTENDANCE_ENDPOINTS, ATTENDANCE_ENDPOINTS } from '../endpoints';

// ==================== 类型定义 ====================

/**
 * 考勤状态枚举
 */
export enum AttendanceStatus {
  PRESENT = 'PRESENT',           // 出勤
  ABSENT = 'ABSENT',             // 缺勤
  LATE = 'LATE',                 // 迟到
  EARLY_LEAVE = 'EARLY_LEAVE',   // 早退
  SICK_LEAVE = 'SICK_LEAVE',     // 病假
  PERSONAL_LEAVE = 'PERSONAL_LEAVE', // 事假
}

/**
 * 健康状态枚举
 */
export enum HealthStatus {
  NORMAL = 'NORMAL',             // 正常
  FEVER = 'FEVER',               // 发烧
  COUGH = 'COUGH',               // 咳嗽
  COLD = 'COLD',                 // 感冒
  OTHER = 'OTHER',               // 其他
}

/**
 * 班级信息
 */
export interface ClassInfo {
  id: number;
  name: string;
  studentCount: number;
  kindergartenId: number;
  kindergartenName?: string;
}

/**
 * 学生信息
 */
export interface StudentInfo {
  id: number;
  name: string;
  studentNumber: string;
  gender: string;
  avatar?: string;
  classId: number;
  className?: string;
}

/**
 * 考勤记录
 */
export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName?: string;
  studentNumber?: string;
  classId: number;
  className?: string;
  kindergartenId: number;
  attendanceDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  temperature?: number;
  healthStatus?: HealthStatus;
  notes?: string;
  leaveReason?: string;
  recordedBy: number;
  recordedByName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 考勤统计数据
 */
export interface AttendanceStatistics {
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  sickLeaveCount: number;
  personalLeaveCount: number;
  attendanceRate: number;
  abnormalTemperature: number;
}

/**
 * 批量创建考勤记录DTO
 */
export interface BatchCreateAttendanceDto {
  classId: number;
  kindergartenId: number;
  attendanceDate: string;
  records: Array<{
    studentId: number;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    temperature?: number;
    healthStatus?: HealthStatus;
    notes?: string;
    leaveReason?: string;
  }>;
}

/**
 * 更新考勤记录DTO
 */
export interface UpdateAttendanceDto {
  status?: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  temperature?: number;
  healthStatus?: HealthStatus;
  notes?: string;
  leaveReason?: string;
  changeReason?: string;
}

/**
 * 查询考勤记录参数
 */
export interface QueryAttendanceParams {
  classId?: number;
  studentId?: number;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  page?: number;
  pageSize?: number;
}

/**
 * 导出考勤报表参数
 */
export interface ExportAttendanceParams {
  classId: number;
  startDate: string;
  endDate: string;
  format?: 'excel' | 'pdf';
}

// ==================== 教师考勤API ====================

/**
 * 获取教师负责的班级列表
 */
export function getTeacherClasses(): Promise<ApiResponse<ClassInfo[]>> {
  return request.get(TEACHER_ATTENDANCE_ENDPOINTS.CLASSES);
}

/**
 * 获取班级学生列表
 * @param classId 班级ID
 */
export function getClassStudents(classId: string | number): Promise<ApiResponse<StudentInfo[]>> {
  return request.get(TEACHER_ATTENDANCE_ENDPOINTS.STUDENTS(classId));
}

/**
 * 获取考勤记录
 * @param params 查询参数
 */
export function getAttendanceRecords(
  params: QueryAttendanceParams
): Promise<ApiResponse<{ rows: AttendanceRecord[]; count: number }>> {
  return request.get(TEACHER_ATTENDANCE_ENDPOINTS.RECORDS, { params });
}

/**
 * 创建考勤记录（批量）
 * @param data 考勤数据
 */
export function createAttendanceRecords(
  data: BatchCreateAttendanceDto
): Promise<ApiResponse<{ successCount: number; records: AttendanceRecord[] }>> {
  return request.post(TEACHER_ATTENDANCE_ENDPOINTS.RECORDS, data);
}

/**
 * 更新考勤记录（仅当天）
 * @param id 考勤记录ID
 * @param data 考勤数据
 */
export function updateAttendanceRecord(
  id: string | number,
  data: UpdateAttendanceDto
): Promise<ApiResponse<AttendanceRecord>> {
  return request.put(TEACHER_ATTENDANCE_ENDPOINTS.UPDATE_RECORD(id), data);
}

/**
 * 获取本班统计数据
 * @param params 查询参数
 */
export function getAttendanceStatistics(
  params: { classId: number; startDate?: string; endDate?: string }
): Promise<ApiResponse<AttendanceStatistics>> {
  return request.get(TEACHER_ATTENDANCE_ENDPOINTS.STATISTICS, { params });
}

/**
 * 导出本班考勤报表
 * @param data 导出参数
 */
export function exportAttendance(
  data: ExportAttendanceParams
): Promise<ApiResponse<{ url: string; filename: string }>> {
  return request.post(TEACHER_ATTENDANCE_ENDPOINTS.EXPORT, data);
}

// ==================== 旧版API（兼容性保留）====================

/**
 * 获取学生考勤记录
 * @param studentId 学生ID
 * @param params 查询参数
 */
export function getStudentAttendance(
  studentId: string | number,
  params?: { startDate?: string; endDate?: string }
): Promise<ApiResponse<any>> {
  return request.get(ATTENDANCE_ENDPOINTS.STUDENT(studentId), { params });
}

/**
 * 获取班级考勤记录
 * @param classId 班级ID
 * @param params 查询参数
 */
export function getClassAttendance(
  classId: string | number,
  params?: { date?: string; status?: string }
): Promise<ApiResponse<any>> {
  return request.get(ATTENDANCE_ENDPOINTS.CLASS(classId), { params });
}

/**
 * 创建考勤记录（单个）
 * @param data 考勤数据
 */
export function createAttendanceRecord(data: any): Promise<ApiResponse<any>> {
  return request.post(ATTENDANCE_ENDPOINTS.RECORD, data);
}