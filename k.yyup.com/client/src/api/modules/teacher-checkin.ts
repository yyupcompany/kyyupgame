import { request } from '@/utils/request';

/**
 * 教师打卡API模块
 * 处理教师自己的签到签退和请假
 */

// ==================== 类型定义 ====================

/**
 * 教师考勤状态
 */
export enum TeacherAttendanceStatus {
  PRESENT = 'present',           // 出勤
  ABSENT = 'absent',             // 缺勤
  LATE = 'late',                 // 迟到
  EARLY_LEAVE = 'early_leave',   // 早退
  LEAVE = 'leave',               // 请假
}

/**
 * 请假类型
 */
export enum LeaveType {
  SICK = 'sick',           // 病假
  PERSONAL = 'personal',   // 事假
  ANNUAL = 'annual',       // 年假
  MATERNITY = 'maternity', // 产假
  OTHER = 'other',         // 其他
}

/**
 * 教师考勤记录
 */
export interface TeacherAttendanceRecord {
  id: number;
  teacherId: number;
  userId: number;
  kindergartenId: number;
  attendanceDate: string;
  status: TeacherAttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  workDuration?: number; // 工作时长（分钟）
  leaveType?: LeaveType;
  leaveReason?: string;
  leaveStartTime?: string;
  leaveEndTime?: string;
  notes?: string;
  isApproved: boolean;
  approvedBy?: number;
  approvedAt?: string;
  approvalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 签到请求参数
 */
export interface CheckInRequest {
  teacherId: number;
  userId: number;
  kindergartenId: number;
}

/**
 * 签退请求参数
 */
export interface CheckOutRequest {
  teacherId: number;
}

/**
 * 请假申请参数
 */
export interface LeaveRequest {
  teacherId: number;
  userId: number;
  kindergartenId: number;
  leaveType: LeaveType;
  leaveReason: string;
  leaveStartTime: string;
  leaveEndTime: string;
}

/**
 * 教师考勤统计
 */
export interface TeacherAttendanceStatistics {
  totalDays: number;
  attendanceDays: number;
  presentCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  leaveCount: number;
  absentCount: number;
  attendanceRate: number;
}

/**
 * 考勤历史查询参数
 */
export interface AttendanceHistoryParams {
  teacherId: number;
  startDate: string;
  endDate: string;
  status?: TeacherAttendanceStatus;
  page: number;
  pageSize: number;
}

/**
 * 考勤历史响应
 */
export interface AttendanceHistoryResponse {
  count: number;
  rows: TeacherAttendanceRecord[];
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== API方法 ====================

/**
 * 签到
 */
export function checkIn(data: CheckInRequest) {
  return request.request({
    url: '/api2333',
    method: 'post',
    data,
  });
}

/**
 * 签退
 */
export function checkOut(data: CheckOutRequest) {
  return request.request({
    url: '/api2501',
    method: 'post',
    data,
  });
}

/**
 * 获取今日考勤
 */
export function getTodayAttendance(teacherId: number) {
  return request.request({
    url: '/api2680',
    method: 'get',
    params: { teacherId },
  });
}

/**
 * 获取本月考勤
 */
export function getMonthAttendance(teacherId: number, year: number, month: number) {
  return request.request({
    url: '/api2900',
    method: 'get',
    params: { teacherId, year, month },
  });
}

/**
 * 创建请假申请
 */
export function createLeaveRequest(data: LeaveRequest) {
  return request.request({
    url: '/api3105',
    method: 'post',
    data,
  });
}

/**
 * 获取教师考勤统计
 */
export function getTeacherStatistics(teacherId: number, startDate: string, endDate: string) {
  return request.request({
    url: '/api3320',
    method: 'get',
    params: { teacherId, startDate, endDate },
  });
}

/**
 * 获取教师考勤历史
 */
export function getTeacherHistory(params: AttendanceHistoryParams) {
  return request.request({
    url: '/api3551',
    method: 'get',
    params,
  });
}

/**
 * 审核请假申请
 */
export function approveLeaveRequest(data: {
  recordId: number;
  approvedBy: number;
  isApproved: boolean;
  approvalNotes?: string;
}) {
  return request.request({
    url: '/api3813',
    method: 'post',
    data,
  });
}

// 导出所有API
export default {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMonthAttendance,
  createLeaveRequest,
  getTeacherStatistics,
  getTeacherHistory,
  approveLeaveRequest,
};

