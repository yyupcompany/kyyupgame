/**
* @swagger
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Teacher ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Teacher 名称
 *           example: "示例Teacher"
 *         status:
 *           type: string
 *           description: 状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T00:00:00.000Z"
 *     CreateTeacherRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher 名称
 *           example: "新Teacher"
 *     UpdateTeacherRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher 名称
 *           example: "更新后的Teacher"
 *     TeacherListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 *         message:
 *           type: string
 *           example: "获取teacher列表成功"
 *     TeacherResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Teacher'
 *         message:
 *           type: string
 *           example: "操作成功"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "操作失败"
 *         code:
 *           type: string
 *           example: "INTERNAL_ERROR"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
 * teacher管理路由文件
 * 提供teacher的基础CRUD操作
*
 * 功能包括：
 * - 获取teacher列表
 * - 创建新teacher
 * - 获取teacher详情
 * - 更新teacher信息
 * - 删除teacher
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { teacherController } from '../controllers/teacher.controller';
import { asyncHandler } from '../middlewares/async-handler';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

/**
* @swagger
 * /api/teachers/search:
 *   get:
 *     summary: 搜索教师
 *     description: 根据查询条件搜索教师列表
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: 教师姓名（支持模糊搜索）
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: 工号
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: 部门
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: 状态
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 搜索成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "搜索成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Teacher'
 *                     total:
 *                       type: integer
 *                       description: 总数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 教师搜索接口（必须放在 /:id 之前）
router.get(
  '/search', checkPermission('teacher:view'),
  asyncHandler(teacherController.list.bind(teacherController))
);

/**
* @swagger
 * /api/teachers/by-user/{userId}:
 *   get:
 *     summary: 根据用户ID获取教师信息
 *     description: 通过用户ID查询对应的教师信息
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取成功"
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 根据用户ID获取教师信息（必须放在 /:id 之前）
router.get(
  '/by-user/:userId', checkPermission('teacher:view'),
  asyncHandler(teacherController.getByUserId.bind(teacherController))
);

/**
* @swagger
 * /api/teachers/statistics:
 *   get:
 *     summary: 获取全局教师统计信息
 *     description: 获取系统中教师的全局统计数据，包括总数、状态分布等
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取统计信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取统计信息成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 教师总数
 *                     active:
 *                       type: integer
 *                       description: 在职教师数
 *                     inactive:
 *                       type: integer
 *                       description: 离职教师数
 *                     suspended:
 *                       type: integer
 *                       description: 停职教师数
 *                     byDepartment:
 *                       type: object
 *                       description: 各部门教师分布
 *                     avgExperience:
 *                       type: number
 *                       description: 平均工作经验（年）
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 获取全局教师统计信息（必须放在 /:id 之前）
router.get(
  '/statistics', checkPermission('teacher:view'),
  asyncHandler(teacherController.globalStats.bind(teacherController))
);

/**
* @swagger
 * /api/teachers:
 *   get:
 *     summary: 获取教师列表
 *     description: 获取教师列表，支持分页和筛选
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: 教师状态筛选
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: 部门筛选
 *     responses:
 *       200:
 *         description: 获取教师列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取教师列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Teacher'
 *                     total:
 *                       type: integer
 *                       description: 总数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 获取教师列表
router.get(
  '/', checkPermission('teacher:view'),
  asyncHandler(teacherController.list.bind(teacherController))
);

/**
* @swagger
 * /api/teachers/{id}:
 *   get:
 *     summary: 获取教师详情
 *     description: 根据教师ID获取教师详细信息
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     responses:
 *       200:
 *         description: 获取教师详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取教师详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 获取教师详情
router.get(
  '/:id', checkPermission('teacher:view'),
  asyncHandler(teacherController.detail.bind(teacherController))
);

/**
* @swagger
 * /api/teachers:
 *   post:
 *     summary: 创建教师
 *     description: 创建新的教师记录
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - employeeId
 *               - phone
 *               - email
 *               - department
 *             properties:
 *               name:
 *                 type: string
 *                 description: 教师姓名
 *                 example: "张老师"
 *               employeeId:
 *                 type: string
 *                 description: 工号
 *                 example: "T001"
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *                 example: "13800138000"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱
 *                 example: "teacher@example.com"
 *               department:
 *                 type: string
 *                 description: 部门
 *                 example: "教学部"
 *               position:
 *                 type: string
 *                 description: 职位
 *                 example: "主班老师"
 *               qualification:
 *                 type: string
 *                 description: 教师资格证号
 *               experience:
 *                 type: integer
 *                 description: 工作经验（年）
 *                 example: 5
 *               address:
 *                 type: string
 *                 description: 住址
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 生日
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 性别
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 default: active
 *                 description: 状态
 *     responses:
 *       201:
 *         description: 创建教师成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "创建教师成功"
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: 工号或邮箱已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 创建教师
router.post(
  '/', checkPermission('teacher:manage'),
  asyncHandler(teacherController.create.bind(teacherController))
);

/**
* @swagger
 * /api/teachers/{id}:
 *   put:
 *     summary: 更新教师信息
 *     description: 根据教师ID更新教师信息
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 教师姓名
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱
 *               department:
 *                 type: string
 *                 description: 部门
 *               position:
 *                 type: string
 *                 description: 职位
 *               qualification:
 *                 type: string
 *                 description: 教师资格证号
 *               experience:
 *                 type: integer
 *                 description: 工作经验（年）
 *               address:
 *                 type: string
 *                 description: 住址
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: 生日
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 性别
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *                 description: 状态
 *     responses:
 *       200:
 *         description: 更新教师信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "更新教师信息成功"
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: 邮箱已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 更新教师信息
router.put(
  '/:id', checkPermission('teacher:update'),
  asyncHandler(teacherController.update.bind(teacherController))
);

/**
* @swagger
 * /api/teachers/{id}:
 *   delete:
 *     summary: 删除教师
 *     description: 根据教师ID删除教师记录
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     responses:
 *       200:
 *         description: 删除教师成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "删除教师成功"
 *                 data:
 *                   type: object
 *                   nullable: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: 教师仍有关联数据，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 删除教师
router.delete(
  '/:id', checkPermission('teacher:manage'),
  asyncHandler(teacherController.delete.bind(teacherController))
);

/**
* @swagger
 * /api/teachers/{id}/classes:
 *   get:
 *     summary: 获取教师分配的班级
 *     description: 获取指定教师负责的班级列表
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     responses:
 *       200:
 *         description: 获取教师班级成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取教师班级成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       $ref: '#/components/schemas/Teacher'
 *                     classes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Class'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 获取教师分配的班级
router.get(
  '/:id/classes', checkPermission('teacher:view'),
  asyncHandler(async (req, res) => {
    // 这里可以添加获取教师班级的逻辑
    // 目前先返回教师详情中的班级信息
    await teacherController.detail(req, res);
  })
);

/**
* @swagger
 * /api/teachers/{id}/stats:
 *   get:
 *     summary: 获取教师统计信息
 *     description: 获取指定教师的详细统计信息，包括班级数量、学生数量等
 *     tags:
 *       - 教师管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     responses:
 *       200:
 *         description: 获取教师统计信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取教师统计信息成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacherId:
 *                       type: integer
 *                       description: 教师ID
 *                     teacherName:
 *                       type: string
 *                       description: 教师姓名
 *                     classCount:
 *                       type: integer
 *                       description: 负责班级数量
 *                     studentCount:
 *                       type: integer
 *                       description: 管理学生总数
 *                     experienceYears:
 *                       type: integer
 *                       description: 工作经验年数
 *                     performanceRating:
 *                       type: number
 *                       format: float
 *                       description: 绩效评分
 *                     attendanceRate:
 *                       type: number
 *                       format: float
 *                       description: 出勤率（百分比）
 *                     classPerformance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           classId:
 *                             type: integer
 *                             description: 班级ID
 *                           className:
 *                             type: string
 *                             description: 班级名称
 *                           studentCount:
 *                             type: integer
 *                             description: 班级学生数量
 *                           avgScore:
 *                             type: number
 *                             format: float
 *                             description: 班级平均成绩
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
*/
// 获取教师统计信息
router.get(
  '/:id/stats', checkPermission('teacher:view'),
  asyncHandler(teacherController.stats.bind(teacherController))
);

export default router; 