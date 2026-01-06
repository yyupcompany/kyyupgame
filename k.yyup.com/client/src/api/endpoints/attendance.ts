/**
 * 考勤管理API端点
 */

/**
 * 教师考勤API端点
 * 基础路径: /api/teacher/attendance
 */
export const TEACHER_ATTENDANCE_ENDPOINTS = {
  // 基础路径
  BASE: '/api/teacher/attendance',
  
  // 获取教师负责的班级列表
  CLASSES: '/api/teacher/attendance/classes',
  
  // 获取班级学生列表
  STUDENTS: (classId: string | number) => `/api/teacher/attendance/students/${classId}`,
  
  // 获取考勤记录
  RECORDS: '/api/teacher/attendance/records',
  
  // 更新考勤记录
  UPDATE_RECORD: (id: string | number) => `/api/teacher/attendance/records/${id}`,
  
  // 获取本班统计数据
  STATISTICS: '/api/teacher/attendance/statistics',
  
  // 导出本班考勤报表
  EXPORT: '/api/teacher/attendance/export',
};

/**
 * 考勤中心API端点（园长/管理员）
 * 基础路径: /api/attendance-center
 */
export const ATTENDANCE_CENTER_ENDPOINTS = {
  // 基础路径
  BASE: '/api/attendance-center',

  // 获取全园概览
  OVERVIEW: '/api/attendance-center/overview',

  // 统计相关
  STATISTICS: {
    // 获取日统计
    DAILY: '/api/attendance-center/statistics/daily',

    // 获取周统计
    WEEKLY: '/api/attendance-center/statistics/weekly',

    // 获取月统计
    MONTHLY: '/api/attendance-center/statistics/monthly',

    // 获取季度统计
    QUARTERLY: '/api/attendance-center/statistics/quarterly',

    // 获取年度统计
    YEARLY: '/api/attendance-center/statistics/yearly',

    // 按班级统计
    BY_CLASS: '/api/attendance-center/statistics/by-class',

    // 按年龄段统计
    BY_AGE: '/api/attendance-center/statistics/by-age',
  },

  // 记录管理
  RECORDS: '/api/attendance-center/records',

  // 更新记录
  UPDATE_RECORD: (id: string | number) => `/api/attendance-center/records/${id}`,

  // 删除记录
  DELETE_RECORD: (id: string | number) => `/api/attendance-center/records/${id}`,

  // 重置记录
  RESET_RECORD: '/api/attendance-center/records/reset',

  // 获取异常考勤分析
  ABNORMAL: '/api/attendance-center/abnormal',

  // 获取健康监测数据
  HEALTH: '/api/attendance-center/health',

  // 导出考勤报表
  EXPORT: '/api/attendance-center/export',

  // 批量导入考勤
  IMPORT: '/api/attendance-center/import',
};

/**
 * 旧版考勤API端点（兼容性保留）
 */
export const ATTENDANCE_ENDPOINTS = {
  // 学生考勤记录
  STUDENT: (studentId: string | number) => `/api/attendance/student/${studentId}`,
  
  // 班级考勤记录
  CLASS: (classId: string | number) => `/api/attendance/class/${classId}`,
  
  // 考勤记录
  RECORD: '/api/attendance/record',
  
  // 更新考勤记录
  UPDATE: (id: string | number) => `/api/attendance/record/${id}`,
  
  // 考勤统计
  STATISTICS: '/api/attendance/statistics',
};

