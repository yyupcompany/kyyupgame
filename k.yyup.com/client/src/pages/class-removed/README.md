# 班级考勤页面（已删除）

## 删除原因

班级考勤页面已于2023年12月19日从项目中删除，主要原因如下：

1. 后端API不支持：系统中不存在班级考勤相关的API接口
2. API检测显示功能无法正常使用：在API检测过程中，未发现与班级考勤相关的可用API
3. 避免无效代码：删除无法正常工作的功能，减少系统维护负担

## 原功能规划

班级考勤页面原计划提供以下功能：

- 按班级查看学生考勤记录
- 支持按日期、考勤状态进行筛选
- 支持批量记录考勤信息
- 生成考勤统计报表
- 导出考勤数据

## 恢复建议

如果未来需要恢复此功能，需要完成以下工作：

1. 由后端开发团队实现相关API，参考设计：
   - GET /api/classes/{id}/attendance - 获取班级考勤记录
   - POST /api/classes/{id}/attendance - 记录班级考勤
   - GET /api/classes/{id}/attendance/statistics - 获取班级考勤统计
   - GET /api/students/{id}/attendance - 获取学生考勤记录

2. 创建考勤相关的类型定义：
   ```typescript
   export interface Attendance {
     id: number;
     studentId: number;
     studentName: string;
     classId: number;
     className: string;
     date: string;
     status: 'present' | 'absent' | 'late' | 'leave';
     reason: string;
     remark: string;
     recordedBy: number;
     recordedAt: string;
   }
   
   export interface AttendanceStatistics {
     classId: number;
     className: string;
     totalStudents: number;
     presentCount: number;
     absentCount: number;
     lateCount: number;
     leaveCount: number;
     attendanceRate: number;
     startDate: string;
     endDate: string;
   }
   ```

3. 重新创建前端页面并与API对接

## 备注

删除操作已记录在任务计划表中：`docs/前端页面任务计划表（教师）.md` 