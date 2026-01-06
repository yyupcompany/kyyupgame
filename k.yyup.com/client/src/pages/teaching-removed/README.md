# 教学计划模块（已删除）

## 删除原因

此模块已于2023年12月19日从项目中删除，主要原因如下：

1. 后端API不支持：系统中不存在教学计划相关的API接口
2. API检测显示模块无法正常使用：在API检测过程中，未发现与教学计划相关的可用API
3. 避免无效代码：删除无法正常工作的模块，减少系统维护负担

## 原模块规划

此模块原计划包含以下页面：

| 页面名称 | 功能描述 |
|---------|---------|
| 课程列表 | 显示所有课程，支持搜索和筛选 |
| 课程详情 | 查看课程的详细信息 |
| 课程创建 | 创建新的课程 |
| 课程编辑 | 编辑已有课程信息 |
| 教学计划 | 管理教学计划 |
| 教学评估 | 进行教学评估 |

## 恢复建议

如果未来需要恢复此模块，需要完成以下工作：

1. 由后端开发团队实现相关API，参考设计：
   - GET /api/teachers/{id}/teaching-plans - 获取教学计划
   - POST /api/teachers/{id}/teaching-plans - 创建教学计划
   - PUT /api/teachers/{id}/teaching-plans/{planId} - 更新教学计划
   - GET /api/courses - 获取课程列表
   - GET /api/courses/{id} - 获取课程详情
   - POST /api/courses - 创建课程
   - PUT /api/courses/{id} - 更新课程

2. 在移动端已有的类型定义基础上完善前端代码：
   ```typescript
   // 已在 kindergarten-mobile/src/types/teacher.ts 中定义
   export interface TeachingPlan extends BaseItem {
     title: string;
     content: string;
     startDate: string;
     endDate: string;
     classId: number;
     className: string;
     subject: string;
     goals: string;
     materials: string;
     evaluation: string;
     status: 'draft' | 'published' | 'completed';
   }
   ```

3. 重新创建前端页面并与API对接

## 备注

删除操作已记录在任务计划表中：`docs/前端页面任务计划表（教师）.md` 