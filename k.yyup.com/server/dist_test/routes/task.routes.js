"use strict";
exports.__esModule = true;
var express_1 = require("express");
var task_controller_1 = require("../controllers/task.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
var taskController = new task_controller_1.TaskController();
// 应用认证中间件
router.use(auth_middleware_1.verifyToken);
// ==================== 任务管理路由 ====================
/**
 * 测试路由
 * GET /api/tasks/test
 */
router.get('/test', function (req, res) {
    res.json({
        success: true,
        message: '任务API测试成功',
        data: {
            timestamp: new Date().toISOString(),
            path: req.path
        }
    });
});
/**
 * 获取任务统计数据
 * GET /api/tasks/stats
 */
router.get('/stats', taskController.getTaskStats.bind(taskController));
/**
 * 获取任务列表
 * GET /api/tasks
 */
router.get('/', taskController.getTasks.bind(taskController));
/**
 * 获取任务详情
 * GET /api/tasks/:id
 */
router.get('/:id', taskController.getTaskById.bind(taskController));
/**
 * 创建任务
 * POST /api/tasks
 */
router.post('/', taskController.createTask.bind(taskController));
/**
 * 更新任务
 * PUT /api/tasks/:id
 */
router.put('/:id', taskController.updateTask.bind(taskController));
/**
 * 删除任务
 * DELETE /api/tasks/:id
 */
router["delete"]('/:id', taskController.deleteTask.bind(taskController));
exports["default"] = router;
