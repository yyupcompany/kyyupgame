import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import TodoService, { 
  CreateTodoDto, 
  UpdateTodoDto, 
  TodoQueryParams 
} from '../services/system/todo.service';
import { TodoPriority, TodoStatus } from '../models/todo.model';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 待办事项ID
 *         title:
 *           type: string
 *           description: 任务标题
 *         description:
 *           type: string
 *           description: 任务描述
 *         priority:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *           description: 优先级（1-最低，5-最高）
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled, overdue]
 *           description: 任务状态
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: 截止日期
 *         userId:
 *           type: integer
 *           description: 创建用户ID
 *         assignedTo:
 *           type: integer
 *           description: 分配给用户ID
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 标签列表
 *         relatedId:
 *           type: integer
 *           description: 关联ID
 *         relatedType:
 *           type: string
 *           description: 关联类型
 *         notify:
 *           type: boolean
 *           description: 是否通知
 *         notifyTime:
 *           type: string
 *           format: date-time
 *           description: 通知时间
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       required:
 *         - id
 *         - title
 *         - status
 *         - userId
*/

/**
* @swagger
 * /api/todos:
 *   get:
 *     summary: 获取待办事项列表
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 创建用户ID
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         description: 分配给用户ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled, overdue]
 *         description: 任务状态
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *         description: 优先级
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: relatedType
 *         schema:
 *           type: string
 *         description: 关联类型
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
*/
router.get('/', async (req, res) => {
  try {
    const params: TodoQueryParams = {
      userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
      assignedTo: req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined,
      status: req.query.status as TodoStatus,
      priority: req.query.priority ? parseInt(req.query.priority as string) as TodoPriority : undefined,
      keyword: req.query.keyword as string,
      relatedType: req.query.relatedType as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
      sortBy: req.query.sortBy as string || 'created_at',
      sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC'
    };

    const result = await TodoService.getTodos(params);
    const totalPages = Math.ceil(result.count / params.pageSize!);

    return ApiResponse.success(res, {
      items: result.rows,
      total: result.count,
      page: params.page,
      pageSize: params.pageSize,
      totalPages
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取待办事项列表失败');
  }
});

/**
* @swagger
 * /api/todos/my:
 *   get:
 *     summary: 获取我的待办事项列表
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled, overdue]
 *         description: 任务状态
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *         description: 优先级
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
*/
router.get('/my', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const params: TodoQueryParams = {
      userId,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
      status: req.query.status as TodoStatus,
      priority: req.query.priority ? parseInt(req.query.priority as string) as TodoPriority : undefined
    };

    const result = await TodoService.getTodos(params);

    return ApiResponse.success(res, {
      items: result.rows,
      total: result.count
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取我的待办失败');
  }
});

/**
* @swagger
 * /api/todos/statistics:
 *   get:
 *     summary: 获取待办事项统计信息
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: 总数
 *                 pending:
 *                   type: integer
 *                   description: 待处理数量
 *                 in_progress:
 *                   type: integer
 *                   description: 进行中数量
 *                 completed:
 *                   type: integer
 *                   description: 已完成数量
 *                 overdue:
 *                   type: integer
 *                   description: 逾期数量
*/
router.get('/statistics', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const stats = await TodoService.getTodoStats(userId);

    return ApiResponse.success(res, stats);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取待办统计失败');
  }
});

/**
* @swagger
 * /api/todos/stats:
 *   get:
 *     summary: 获取待办事项统计信息（别名）
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: 总数
 *                 pending:
 *                   type: integer
 *                   description: 待处理数量
 *                 in_progress:
 *                   type: integer
 *                   description: 进行中数量
 *                 completed:
 *                   type: integer
 *                   description: 已完成数量
 *                 overdue:
 *                   type: integer
 *                   description: 逾期数量
*/
router.get('/stats', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const stats = await TodoService.getTodoStats(userId);

    return ApiResponse.success(res, stats);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取待办统计失败');
  }
});

/**
* @swagger
 * /api/todos:
 *   post:
 *     summary: 创建待办事项
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 任务标题
 *                 example: "完成项目文档"
 *               description:
 *                 type: string
 *                 description: 任务描述
 *                 example: "编写API文档和用户手册"
 *               priority:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5]
 *                 description: 优先级
 *                 default: 3
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled, overdue]
 *                 description: 任务状态
 *                 default: pending
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *               assignedTo:
 *                 type: integer
 *                 description: 分配给用户ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *               relatedId:
 *                 type: integer
 *                 description: 关联ID
 *               relatedType:
 *                 type: string
 *                 description: 关联类型
 *               notify:
 *                 type: boolean
 *                 description: 是否通知
 *                 default: false
 *               notifyTime:
 *                 type: string
 *                 format: date-time
 *                 description: 通知时间
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
*/
router.post('/', async (req, res) => {
  try {
    const data: CreateTodoDto = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      status: req.body.status,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      userId: (req as any).user?.id,
      assignedTo: req.body.assignedTo,
      tags: req.body.tags,
      relatedId: req.body.relatedId,
      relatedType: req.body.relatedType,
      notify: req.body.notify,
      notifyTime: req.body.notifyTime ? new Date(req.body.notifyTime) : undefined
    };

    const todo = await TodoService.createTodo(data);
    return ApiResponse.success(res, todo, '创建待办事项成功', 201);
  } catch (error) {
    return ApiResponse.handleError(res, error, '创建待办事项失败');
  }
});

/**
* @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: 获取待办事项详情
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
*/
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const todo = await TodoService.getTodoById(id);
    return ApiResponse.success(res, todo);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取待办事项详情失败');
  }
});

/**
* @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: 更新待办事项
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *               priority:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5]
 *                 description: 优先级
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled, overdue]
 *                 description: 任务状态
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *               assignedTo:
 *                 type: integer
 *                 description: 分配给用户ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *               notify:
 *                 type: boolean
 *                 description: 是否通知
 *               notifyTime:
 *                 type: string
 *                 format: date-time
 *                 description: 通知时间
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
*/
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data: UpdateTodoDto = {
      ...req.body,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      notifyTime: req.body.notifyTime ? new Date(req.body.notifyTime) : undefined
    };

    const todo = await TodoService.updateTodo(id, data);
    return ApiResponse.success(res, todo, '更新待办事项成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '更新待办事项失败');
  }
});

/**
* @swagger
 * /api/todos/{id}/complete:
 *   patch:
 *     summary: 标记待办事项为完成
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
 *     responses:
 *       200:
 *         description: 标记成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
*/
router.patch('/:id/complete', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const todo = await TodoService.markTodoCompleted(id);
    return ApiResponse.success(res, todo, '标记待办完成成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '标记待办完成失败');
  }
});

/**
* @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: 删除待办事项
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: 'null'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
*/
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await TodoService.deleteTodo(id);
    return ApiResponse.success(res, null, '删除待办事项成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '删除待办事项失败');
  }
});

export default router; 