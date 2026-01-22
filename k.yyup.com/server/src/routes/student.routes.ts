import { Router, Request, Response, NextFunction } from 'express';
import { StudentController } from '../controllers/student.controller';
import { checkPermission, checkParentStudentAccess, verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

const studentControllerInstance = new StudentController();

/**
 * 自定义中间件：允许教师和管理员使用student:view权限，家长仅能查看自己的孩子
 */
const checkStudentViewOrParent = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  // 家长角色允许通过（list方法会过滤数据）
  if (user.role === 'parent') {
    console.log('[学生权限] 家长角色，允许访问学生列表');
    next();
    return;
  }

  // 其他角色需要 student:view 权限
  checkPermission('student:view')(req, res, next);
};

/**
* @swagger
 * tags:
 *   name: Students
 *   description: 学生管理接口
*/

/**
* @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - name
 *         - studentId
 *         - birthDate
 *         - gender
 *       properties:
 *         id:
 *           type: integer
 *           description: 学生ID
 *         name:
 *           type: string
 *           description: 学生姓名
 *         studentId:
 *           type: string
 *           description: 学号
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: 性别
 *         classId:
 *           type: integer
 *           description: 班级ID
 *         status:
 *           type: string
 *           enum: [active, inactive, graduated]
 *           description: 学生状态
 *         enrollmentDate:
 *           type: string
 *           format: date
 *           description: 入学日期
 *         photoUrl:
 *           type: string
 *           description: 头像URL
 *         address:
 *           type: string
 *           description: 家庭地址
 *         phone:
 *           type: string
 *           description: 联系电话
 *         emergencyContact:
 *           type: string
 *           description: 紧急联系人
 *         emergencyPhone:
 *           type: string
 *           description: 紧急联系电话
 *         allergies:
 *           type: string
 *           description: 过敏信息
 *         medicalConditions:
 *           type: string
 *           description: 健康状况
 *         notes:
 *           type: string
 *           description: 备注
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
*     
 *     StudentRequest:
 *       type: object
 *       required:
 *         - name
 *         - studentId
 *         - birthDate
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *           description: 学生姓名
 *           example: "张小明"
 *         studentId:
 *           type: string
 *           description: 学号
 *           example: "STU001"
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *           example: "2018-05-15"
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: 性别
 *           example: "male"
 *         classId:
 *           type: integer
 *           description: 班级ID
 *           example: 1
 *         enrollmentDate:
 *           type: string
 *           format: date
 *           description: 入学日期
 *           example: "2024-09-01"
 *         photoUrl:
 *           type: string
 *           description: 头像URL
 *         address:
 *           type: string
 *           description: 家庭地址
 *           example: "北京市朝阳区某某街道"
 *         phone:
 *           type: string
 *           description: 联系电话
 *           example: "13800138000"
 *         emergencyContact:
 *           type: string
 *           description: 紧急联系人
 *           example: "张父"
 *         emergencyPhone:
 *           type: string
 *           description: 紧急联系电话
 *           example: "13900139000"
 *         allergies:
 *           type: string
 *           description: 过敏信息
 *         medicalConditions:
 *           type: string
 *           description: 健康状况
 *         notes:
 *           type: string
 *           description: 备注
*     
 *     StudentStats:
 *       type: object
 *       properties:
 *         totalStudents:
 *           type: integer
 *           description: 学生总数
 *         activeStudents:
 *           type: integer
 *           description: 在读学生数
 *         inactiveStudents:
 *           type: integer
 *           description: 非在读学生数
 *         graduatedStudents:
 *           type: integer
 *           description: 毕业学生数
 *         studentsWithoutClass:
 *           type: integer
 *           description: 未分配班级学生数
 *         averageAge:
 *           type: number
 *           description: 平均年龄
*     
 *     GrowthRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 记录ID
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *         recordDate:
 *           type: string
 *           format: date
 *           description: 记录日期
 *         height:
 *           type: number
 *           description: 身高(cm)
 *         weight:
 *           type: number
 *           description: 体重(kg)
 *         milestone:
 *           type: string
 *           description: 发展里程碑
 *         teacherNote:
 *           type: string
 *           description: 教师备注
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
*/

/**
* @swagger
 * /api/students:
 *   post:
 *     summary: 创建学生
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRequest'
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
 *                 message:
 *                   type: string
 *                   example: "创建学生成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       409:
 *         description: 学号已存在
*/
/**
* @swagger
 * /api/students/by-class:
 *   get:
 *     summary: 按班级获取学生列表
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: 班级ID
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
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词(姓名、学号)
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
 *                 message:
 *                   type: string
 *                   example: "获取班级学生列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       403:
 *         description: 权限不足
*/
router.get('/by-class', checkPermission('student:view'), studentControllerInstance.getStudentsByClass);

/**
* @swagger
 * /api/students/search:
 *   get:
 *     summary: 搜索学生
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词(姓名、学号)
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, graduated]
 *         description: 学生状态
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "搜索学生成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: 权限不足
*/
router.get('/search', checkPermission('student:view'), studentControllerInstance.search);

/**
* @swagger
 * /api/students/available:
 *   get:
 *     summary: 获取可用学生列表
 *     description: 获取未分配班级的学生列表
 *     tags: [Students]
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取可用学生列表成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       403:
 *         description: 权限不足
*/
router.get('/available', checkPermission('student:view'), studentControllerInstance.getAvailableStudents);

/**
* @swagger
 * /api/students/stats:
 *   get:
 *     summary: 获取学生统计
 *     tags: [Students]
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取学生统计成功"
 *                 data:
 *                   $ref: '#/components/schemas/StudentStats'
 *       403:
 *         description: 权限不足
*/
router.get('/stats', checkPermission('student:view'), studentControllerInstance.getStats);

/**
* @swagger
 * /api/students/statistics:
 *   get:
 *     summary: 获取学生统计信息
 *     description: 兼容性接口，功能同/stats
 *     tags: [Students]
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
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取学生统计成功"
 *                 data:
 *                   $ref: '#/components/schemas/StudentStats'
 *       403:
 *         description: 权限不足
*/
router.get('/statistics', checkPermission('student:view'), studentControllerInstance.getStats);

/**
* @swagger
 * /api/students:
 *   get:
 *     summary: 获取学生列表
 *     tags: [Students]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, graduated]
 *         description: 学生状态
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
 *                 message:
 *                   type: string
 *                   example: "获取学生列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: 权限不足
*/
router.get('/', checkStudentViewOrParent, studentControllerInstance.list);

/**
* @swagger
 * /api/students/status:
 *   put:
 *     summary: 更新学生状态
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - status
 *             properties:
 *               studentId:
 *                 type: integer
 *                 description: 学生ID
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [active, inactive, graduated]
 *                 description: 新状态
 *                 example: "active"
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
 *                 message:
 *                   type: string
 *                   example: "更新学生状态成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
*/
router.put('/status', checkPermission('student:update'), studentControllerInstance.updateStatus);

/**
* @swagger
 * /api/students/assign-class:
 *   post:
 *     summary: 为学生分配班级
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - classId
 *             properties:
 *               studentId:
 *                 type: integer
 *                 description: 学生ID
 *                 example: 1
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *                 example: 1
 *     responses:
 *       200:
 *         description: 分配成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "分配班级成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生或班级不存在
*/
router.post('/assign-class', checkPermission('student:update'), studentControllerInstance.assignClass);

/**
* @swagger
 * /api/students/add-to-class:
 *   post:
 *     summary: 添加学生到班级
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/StudentRequest'
 *               - type: object
 *                 required:
 *                   - classId
 *                 properties:
 *                   classId:
 *                     type: string
 *                     description: 班级ID
 *                     example: "1"
 *     responses:
 *       201:
 *         description: 添加成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "学生已添加到班级"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 班级不存在
*/
router.post('/add-to-class', checkPermission('student:manage'), studentControllerInstance.addToClass);

/**
* @swagger
 * /api/students/{id}/remove-from-class:
 *   delete:
 *     summary: 从班级移除学生
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学生ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *             properties:
 *               classId:
 *                 type: string
 *                 description: 班级ID
 *                 example: "1"
 *     responses:
 *       200:
 *         description: 移除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "学生已从班级移除"
 *                 data:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生或班级不存在
*/
router.delete('/:id/remove-from-class', checkPermission('student:manage'), checkParentStudentAccess(), studentControllerInstance.removeFromClass);

/**
* @swagger
 * /api/students/batch-assign-class:
 *   post:
 *     summary: 批量为学生分配班级
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *               - classId
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 学生ID列表
 *                 example: [1, 2, 3]
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *                 example: 1
 *     responses:
 *       200:
 *         description: 批量分配成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "批量分配班级成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     successCount:
 *                       type: integer
 *                       description: 成功分配数量
 *                       example: 3
 *                     failedCount:
 *                       type: integer
 *                       description: 失败分配数量
 *                       example: 0
 *                     updatedStudents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 班级不存在
*/
router.post('/batch-assign-class', checkPermission('student:update'), studentControllerInstance.batchAssignClass);

/**
* @swagger
 * /api/students/{id}:
 *   get:
 *     summary: 获取学生详情
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
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
 *                 message:
 *                   type: string
 *                   example: "获取学生详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
*/
router.get('/:id', checkPermission('student:view'), checkParentStudentAccess(), studentControllerInstance.detail);

/**
* @swagger
 * /api/students/{id}:
 *   put:
 *     summary: 更新学生信息
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRequest'
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
 *                 message:
 *                   type: string
 *                   example: "更新学生信息成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 *       409:
 *         description: 学号已存在
*/
router.put('/:id', checkPermission('student:update'), checkParentStudentAccess(), studentControllerInstance.update);

/**
* @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: 删除学生
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
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
 *                 message:
 *                   type: string
 *                   example: "删除学生成功"
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 *       409:
 *         description: 学生已分配班级或有相关记录，无法删除
*/
router.delete('/:id', checkPermission('student:manage'), checkParentStudentAccess(), studentControllerInstance.delete);

/**
* @swagger
 * /api/students/{id}/parents:
 *   get:
 *     summary: 获取学生的家长列表
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
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
 *                 message:
 *                   type: string
 *                   example: "获取学生家长列表成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Parent'
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
*/
router.get('/:id/parents', checkPermission('student:view'), checkParentStudentAccess(), studentControllerInstance.getParents);

/**
* @swagger
 * /api/students/{id}/growth-records:
 *   get:
 *     summary: 获取学生成长记录
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
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
 *                 message:
 *                   type: string
 *                   example: "获取学生成长记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GrowthRecord'
 *                     total:
 *                       type: integer
 *                       description: 记录总数
 *                       example: 2
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 *       500:
 *         description: 获取学生成长记录失败
*/
router.get('/:id/growth-records', checkPermission('student:view'), checkParentStudentAccess(), async (req, res) => {
  try {
    const studentId = req.params.id;
    const mockGrowthRecords = [
      {
        id: 1,
        studentId: parseInt(studentId),
        recordDate: '2024-06-01',
        height: 105.5,
        weight: 18.2,
        milestone: '能够完整表达简单句子',
        teacherNote: '语言表达能力有明显提升',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        studentId: parseInt(studentId),
        recordDate: '2024-05-01', 
        height: 104.8,
        weight: 17.9,
        milestone: '能够独立完成简单拼图',
        teacherNote: '动手能力和专注力都有进步',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      message: '获取学生成长记录成功',
      data: {
        records: mockGrowthRecords,
        total: mockGrowthRecords.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取学生成长记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router; 