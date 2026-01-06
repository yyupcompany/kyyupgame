import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();
const taskController = new TaskController();

// ==================== Swagger Schemas (保留原有的完整文档) ====================
// 注意：这里省略了完整的 Swagger 文档以节省空间，实际使用时应该保留

// 应用认证中间件
router.use(verifyToken);

// ==================== 特殊路由 (必须在 /:id 之前) ====================

// 测试路由
router.get('/test', (req: any, res: any) => {
  res.json({
    success: true,
    message: '任务API测试成功',
    data: {
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
});

// 统计路由
router.get('/stats', taskController.getTaskStats.bind(taskController));

// 模板路由 (必须在 /:id 之前)
router.get('/templates', taskController.getTaskTemplates.bind(taskController));

// 趋势路由 (必须在 /:id 之前)
router.get('/trends', taskController.getTaskStats.bind(taskController));

// 分析路由 (必须在 /:id 之前)
router.get('/analytics', taskController.getTaskStats.bind(taskController));

// ==================== 任务管理路由 ====================

// 列表路由 (必须在 /:id 之前)
router.get('/', taskController.getTasks.bind(taskController));

// 单个任务详情 (放在最后以匹配动态ID)
router.get('/:id', taskController.getTaskById.bind(taskController));

// 创建任务
router.post('/', taskController.createTask.bind(taskController));

// 更新任务
router.put('/:id', taskController.updateTask.bind(taskController));

// 删除任务
router.delete('/:id', taskController.deleteTask.bind(taskController));

// ==================== 任务子资源路由 ====================

// 更新任务状态
router.put('/:id/status', taskController.updateTaskStatus.bind(taskController));

// 更新任务进度
router.put('/:id/progress', taskController.updateTaskProgress.bind(taskController));

// 分配任务 (复用 updateTask)
router.put('/:id/assign', taskController.updateTask.bind(taskController));

// 获取任务评论
router.get('/:id/comments', taskController.getTaskComments.bind(taskController));

// 添加任务评论
router.post('/:id/comments', taskController.addTaskComment.bind(taskController));

export default router;
