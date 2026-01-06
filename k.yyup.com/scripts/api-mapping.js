// API 映射表：从错误的调用映射到正确的端点
const apiMapping = {
  '/ai-billing/bills': '/ai-billing/statistics',  // 改用统计端点
  '/business/overview': '/business-center/overview',
  '/call-center/records': '/call-center/calls/history',
  '/documents': '/documents',  // 需要检查是否存在
  '/inspection-center/tasks': '/inspection-center/tasks',  // 需要检查
  '/tasks/my': '/tasks',  // 改为列表端点
  '/notifications': '/notifications',  // 已存在
  '/permissions/roles': '/permissions/roles',  // 需要检查
  '/photo-albums': '/photo-album',  // 改为 /photo-album
  '/principal/dashboard': '/principal/dashboard-stats',  // 改为 stats
  '/system/settings': '/system/settings',  // 已存在
  '/system/status': '/system/health',  // 改为 health
  '/system-logs': '/system/logs',  // 改为系统中间件的日志端点
  '/teaching-center/course-progress': '/teaching-center/course-progress',  // 已正确
  '/feedback/my-records': '/feedback/my-records',  // 需要检查
  '/parent/promotion/stats': '/parent/promotion/stats',  // 需要检查
  '/parent/promotion/activities': '/parent/promotion/activities',
  '/parent/promotion/rewards': '/parent/promotion/rewards',
  '/parent/share/overview': '/parent/share/overview',  // 需要检查
  '/parent/share/records': '/parent/share/records',
  '/teacher/appointments': '/teacher/appointments',  // 需要检查
  '/teacher/classes': '/teacher/classes',
  '/teacher/performance/stats': '/teacher/performance/stats',
  '/teacher/schedule/weekly': '/teacher/schedule/weekly'
};

module.exports = apiMapping;
