# 教师任务API问题深度分析报告

**分析日期**: 2025-10-17  
**问题**: 任务状态更新返回 500 错误  
**根本原因**: 后端实现不完整 + 数据模型不匹配

---

## 🔍 问题诊断

### 前端调用
```typescript
// client/src/api/modules/teacher-tasks.ts (line 88-90)
updateTaskStatus: async (id: number, status: string): Promise<Task> => {
  const res = await request.put<Task>(`/teacher-dashboard/tasks/${id}/status`, { completed: status === 'completed' })
  return res.data
}
```

**调用的API**: `PUT /teacher-dashboard/tasks/:id/status`  
**请求体**: `{ completed: boolean }`

### 后端路由
```typescript
// server/src/routes/teacher-dashboard.routes.ts (line 202-204)
router.put('/tasks/:taskId/status',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.updateTaskStatus
);
```

**路由定义**: `PUT /teacher-dashboard/tasks/:taskId/status` ✅ 匹配

### 后端控制器实现
```typescript
// server/src/controllers/teacher-dashboard.controller.ts (line 347-383)
public static async updateTaskStatus(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const taskId = req.params.taskId;
    const { completed } = req.body;  // ✅ 正确解析

    // 查找教师记录
    const teacher = await Teacher.findOne({
      where: { userId: userId }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: '教师信息不存在'
      });
    }

    // 调用服务层
    const updatedTask = await TeacherDashboardService.updateTaskStatus(
      parseInt(taskId),
      teacher.id,
      completed
    );

    res.json({
      success: true,
      data: updatedTask,
      message: completed ? '任务已完成' : '任务已重新打开'
    });
  } catch (error) {
    // ❌ 错误处理不完整
    console.error('更新任务状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新任务状态失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}
```

### 后端服务层实现
```typescript
// server/src/services/teacher-dashboard.service.ts (line 352-369)
static async updateTaskStatus(taskId: number, teacherId: number, completed: boolean) {
  const task = await Todo.findOne({
    where: {
      id: taskId,
      assignedTo: teacherId  // ❌ 问题1: 使用 Todo 模型
    }
  });

  if (!task) {
    throw new Error('任务不存在或无权限');
  }

  task.status = completed ? TodoStatus.COMPLETED : TodoStatus.PENDING;
  task.completedDate = completed ? new Date() : null;
  await task.save();

  return task;
}
```

---

## 🐛 发现的问题

### 问题 1: 数据模型不匹配
**症状**: 500 错误  
**原因**: 
- 前端使用的是 `Task` 模型（来自 `tasks` 表）
- 后端服务层使用的是 `Todo` 模型（来自 `todos` 表）
- 这两个表的结构不同

**证据**:
- Task 模型: `creator_id`, `assignee_id`, `progress`
- Todo 模型: `assignedTo`, `completedDate`

### 问题 2: 字段名不匹配
**症状**: 查询失败  
**原因**:
- 后端查询条件: `assignedTo: teacherId`
- 但前端发送的任务可能没有这个字段，或字段名不同

### 问题 3: 教师和任务的关系不清楚
**症状**: 权限验证失败  
**原因**:
- 任务可能由园长创建，分配给教师
- 教师只能更新分配给自己的任务
- 但当前实现没有正确处理这个关系

---

## 🏗️ 系统架构分析

### 任务创建流程（园长创建）
```
园长 (Admin) 
  ↓
创建任务 (POST /tasks)
  ↓
Task 表 (creator_id = 园长ID, assignee_id = 教师ID)
  ↓
教师看到任务
```

### 任务执行流程（教师执行）
```
教师 (Teacher)
  ↓
查看任务 (GET /teacher-dashboard/tasks)
  ↓
更新任务状态 (PUT /teacher-dashboard/tasks/:id/status)
  ↓
❌ 500 错误 - 因为使用了错误的模型
```

---

## ✅ 解决方案

### 方案 1: 统一使用 Task 模型（推荐）
修改 `teacher-dashboard.service.ts`:
```typescript
static async updateTaskStatus(taskId: number, teacherId: number, completed: boolean) {
  // 使用 Task 模型而不是 Todo
  const { Task, Teacher } = require('../models');
  
  // 先找到教师的ID
  const task = await Task.findOne({
    where: {
      id: taskId,
      assignee_id: teacherId  // 使用 Task 模型的字段
    }
  });

  if (!task) {
    throw new Error('任务不存在或无权限');
  }

  task.status = completed ? 'completed' : 'pending';
  task.updated_at = new Date();
  await task.save();

  return task;
}
```

### 方案 2: 修复前端API调用
确保前端发送正确的数据格式

### 方案 3: 添加错误日志
在控制器中添加详细的错误日志，便于调试

---

## 📋 修复清单

- [ ] 修改 `teacher-dashboard.service.ts` 使用正确的 Task 模型
- [ ] 验证 Task 表中的字段名（assignee_id vs assignedTo）
- [ ] 添加详细的错误日志
- [ ] 测试任务状态更新功能
- [ ] 验证教师权限检查
- [ ] 检查园长创建任务的流程

---

## 🔗 相关文件

- `server/src/controllers/teacher-dashboard.controller.ts` - 控制器
- `server/src/services/teacher-dashboard.service.ts` - 服务层
- `server/src/models/task.model.ts` - Task 模型
- `server/src/models/todo.model.ts` - Todo 模型
- `client/src/api/modules/teacher-tasks.ts` - 前端API
- `server/src/routes/teacher-dashboard.routes.ts` - 路由

---

## 🎯 建议

1. **立即修复**: 修改服务层使用正确的模型
2. **添加测试**: 为任务状态更新添加单元测试
3. **文档更新**: 更新API文档说明任务模型
4. **权限审查**: 确保教师只能更新分配给自己的任务

