/**
 * 考勤中心API（园长/管理员）
 */
import { request } from '../../utils/request';
import type { ApiResponse } from '@/utils/request';
import { ATTENDANCE_CENTER_ENDPOINTS } from '../endpoints';
import type { AttendanceRecord, AttendanceStatus } from './attendance';

// ==================== 类型定义 ====================

/**
 * 全园概览数据
 */
export interface OverviewData {
  date: string;
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
 * 日统计数据
 */
export interface DailyStatistics {
  date: string;
  classes: Array<{
    classId: number;
    className: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
  }>;
}

/**
 * 周统计数据
 */
export interface WeeklyStatistics {
  startDate: string;
  endDate: string;
  dailyData: Array<{
    date: string;
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
  }>;
}

/**
 * 月统计数据
 */
export interface MonthlyStatistics {
  year: number;
  month: number;
  dailyData: Array<{
    date: string;
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
  }>;
  totalAttendanceRate: number;
}

/**
 * 季度统计数据
 */
export interface QuarterlyStatistics {
  year: number;
  quarter: number;
  monthlyData: Array<{
    month: number;
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
  }>;
}

/**
 * 年度统计数据
 */
export interface YearlyStatistics {
  year: number;
  monthlyData: Array<{
    month: number;
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
  }>;
}

/**
 * 按班级统计数据
 */
export interface ClassStatistics {
  classId: number;
  className: string;
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  sickLeaveCount: number;
  personalLeaveCount: number;
  attendanceRate: number;
}

/**
 * 按年龄段统计数据
 */
export interface AgeStatistics {
  ageGroup: string;
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

/**
 * 异常考勤分析数据
 */
export interface AbnormalAnalysis {
  // 连续缺勤学生
  consecutiveAbsent: Array<{
    studentId: number;
    studentName: string;
    className: string;
    consecutiveDays: number;
    lastAbsentDate: string;
  }>;
  
  // 频繁迟到学生
  frequentLate: Array<{
    studentId: number;
    studentName: string;
    className: string;
    lateCount: number;
    lateDates: string[];
  }>;
  
  // 频繁早退学生
  frequentEarlyLeave: Array<{
    studentId: number;
    studentName: string;
    className: string;
    earlyLeaveCount: number;
    earlyLeaveDates: string[];
  }>;
}

/**
 * 健康监测数据
 */
export interface HealthMonitoring {
  // 体温异常记录
  abnormalTemperature: Array<{
    studentId: number;
    studentName: string;
    className: string;
    temperature: number;
    date: string;
  }>;
  
  // 病假统计
  sickLeaveStats: Array<{
    studentId: number;
    studentName: string;
    className: string;
    sickLeaveDays: number;
    lastSickLeaveDate: string;
  }>;
}

/**
 * 查询所有考勤记录参数
 */
export interface QueryAllRecordsParams {
  kindergartenId: number;
  classId?: number;
  studentId?: number;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  page?: number;
  pageSize?: number;
}

/**
 * 更新考勤记录DTO
 */
export interface UpdateRecordDto {
  status?: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  temperature?: number;
  healthStatus?: string;
  notes?: string;
  leaveReason?: string;
  changeReason?: string;
}

/**
 * 重置考勤记录DTO
 */
export interface ResetRecordDto {
  id: number;
  changeReason?: string;
}

/**
 * 导出考勤报表参数
 */
export interface ExportParams {
  kindergartenId: number;
  startDate: string;
  endDate: string;
  format?: 'excel' | 'pdf';
}

/**
 * 批量导入考勤记录
 */
export interface ImportRecordDto {
  studentId: number;
  classId: number;
  kindergartenId: number;
  attendanceDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  temperature?: number;
  healthStatus?: string;
  notes?: string;
  leaveReason?: string;
}

// ==================== API方法 ====================

/**
 * 获取全园概览
 * @param params 查询参数
 */
export function getOverview(params: {
  kindergartenId: number;
  date?: string;
}): Promise<ApiResponse<OverviewData>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.OVERVIEW, params);
}

/**
 * 获取日统计
 * @param params 查询参数
 */
export function getDailyStatistics(params: {
  kindergartenId: number;
  date?: string;
}): Promise<ApiResponse<DailyStatistics>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.STATISTICS.DAILY, params);
}

/**
 * 获取周统计
 * @param params 查询参数
 */
export function getWeeklyStatistics(params: {
  kindergartenId: number;
  startDate: string;
  endDate: string;
}): Promise<ApiResponse<WeeklyStatistics>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.STATISTICS.WEEKLY, params);
}

/**
 * 获取月统计
 * @param params 查询参数
 */
export function getMonthlyStatistics(params: {
  kindergartenId: number;
  year: number;
  month: number;
}): Promise<ApiResponse<MonthlyStatistics>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.STATISTICS.MONTHLY, params);
}

/**
 * 获取季度统计
 * @param params 查询参数
 */
export function getQuarterlyStatistics(params: {
  kindergartenId: number;
  year: number;
  quarter: number;
}): Promise<ApiResponse<QuarterlyStatistics>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.STATISTICS.QUARTERLY, params);
}

/**
 * 获取年度统计
 * @param params 查询参数
 */
export function getYearlyStatistics(params: {
  kindergartenId: number;
  year: number;
}): Promise<ApiResponse<YearlyStatistics>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.STATISTICS.YEARLY, params);
}

/**
 * 按班级统计
 * @param params 查询参数
 */
export function getStatisticsByClass(params: {
  kindergartenId: number;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<ClassStatistics[]>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.STATISTICS.BY_CLASS, params);
}

/**
 * 按年龄段统计
 * @param params 查询参数
 */
export function getStatisticsByAge(params: {
  kindergartenId: number;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AgeStatistics[]>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.STATISTICS.BY_AGE, params);
}

/**
 * 获取所有考勤记录
 * @param params 查询参数
 */
export function getAllRecords(
  params: QueryAllRecordsParams
): Promise<ApiResponse<{ rows: AttendanceRecord[]; count: number }>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.RECORDS, params);
}

/**
 * 修改任意考勤记录（园长权限）
 * @param id 考勤记录ID
 * @param data 更新数据
 */
export function updateRecord(
  id: string | number,
  data: UpdateRecordDto
): Promise<ApiResponse<AttendanceRecord>> {
  return request.put(ATTENDANCE_CENTER_ENDPOINTS.UPDATE_RECORD(id), data);
}

/**
 * 删除考勤记录（园长权限）
 * @param id 考勤记录ID
 */
export function deleteRecord(id: string | number): Promise<ApiResponse<void>> {
  return request.delete(ATTENDANCE_CENTER_ENDPOINTS.DELETE_RECORD(id));
}

/**
 * 重置考勤记录（园长权限）
 * @param data 重置数据
 */
export function resetRecord(data: ResetRecordDto): Promise<ApiResponse<AttendanceRecord>> {
  return request.post(ATTENDANCE_CENTER_ENDPOINTS.RESET_RECORD, data);
}

/**
 * 获取异常考勤分析
 * @param params 查询参数
 */
export function getAbnormalAnalysis(params: {
  kindergartenId: number;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<AbnormalAnalysis>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.ABNORMAL, params);
}

/**
 * 获取健康监测数据
 * @param params 查询参数
 */
export function getHealthMonitoring(params: {
  kindergartenId: number;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<HealthMonitoring>> {
  return request.get(ATTENDANCE_CENTER_ENDPOINTS.HEALTH, params);
}

/**
 * 导出考勤报表（园长权限）
 * @param data 导出参数
 */
export function exportAttendance(
  data: ExportParams
): Promise<ApiResponse<{ url: string; filename: string }>> {
  return request.post(ATTENDANCE_CENTER_ENDPOINTS.EXPORT, data);
}

/**
 * 批量导入考勤（园长权限）
 * @param data 导入数据
 */
export function importAttendance(data: {
  records: ImportRecordDto[];
}): Promise<ApiResponse<{ successCount: number; failureCount: number; errors: string[] }>> {
  return request.post(ATTENDANCE_CENTER_ENDPOINTS.IMPORT, data);
}

