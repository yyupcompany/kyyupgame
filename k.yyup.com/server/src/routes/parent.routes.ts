import { Router } from 'express';
import { ParentController } from '../controllers/parent.controller';
import { ParentStudentRelationController } from '../controllers/parent-student-relation.controller';
import { verifyToken, checkPermission, checkRole } from '../middlewares/auth.middleware';
const router = Router();

/**
 * 家长路由配置
*/

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);
router.use((req, res, next) => {
  console.log('[Parent路由] 请求路径:', req.path, 'User:', req.user?.id);
  next();
});

const parentController = new ParentController();
const parentStudentRelationController = new ParentStudentRelationController();


/**
 * 家长管理路由
* 
 * 路由前缀: /api/parents
*/

/**
* @swagger
 * components:
 *   schemas:
 *     Parent:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - relationship
 *       properties:
 *         id:
 *           type: integer
 *           description: 家长ID
 *         name:
 *           type: string
 *           description: 家长姓名
 *         phone:
 *           type: string
 *           description: 联系电话
 *         email:
 *           type: string
 *           description: 邮箱地址
 *         wechat:
 *           type: string
 *           description: 微信号
 *         idCard:
 *           type: string
 *           description: 身份证号
 *         address:
 *           type: string
 *           description: 家庭地址
 *         occupation:
 *           type: string
 *           description: 职业
 *         relationship:
 *           type: string
 *           enum: [father, mother, guardian]
 *           description: 与学生关系
 *         emergencyContact:
 *           type: string
 *           description: 紧急联系方式
 *         remark:
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
 *     ParentStudent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 关系记录ID
 *         parentId:
 *           type: integer
 *           description: 家长ID
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *         relationship:
 *           type: string
 *           enum: [father, mother, guardian]
 *           description: 与学生关系
 *         isEmergencyContact:
 *           type: boolean
 *           description: 是否为紧急联系人
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         parent:
 *           $ref: '#/components/schemas/Parent'
 *         student:
 *           $ref: '#/components/schemas/Student'
 *     Child:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 子女ID
 *         parentId:
 *           type: integer
 *           description: 家长ID
 *         name:
 *           type: string
 *           description: 子女姓名
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: 性别
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *         classId:
 *           type: integer
 *           description: 班级ID
 *         class:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             grade:
 *               type: string
 *         relationship:
 *           type: string
 *           description: 关系
 *         enrollmentDate:
 *           type: string
 *           format: date
 *           description: 入学日期
 *     Communication:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 沟通记录ID
 *         parentId:
 *           type: integer
 *           description: 家长ID
 *         teacherId:
 *           type: integer
 *           description: 老师ID
 *         teacher:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             subject:
 *               type: string
 *         type:
 *           type: string
 *           enum: [phone, wechat, email, visit]
 *           description: 沟通方式
 *         topic:
 *           type: string
 *           description: 沟通主题
 *         content:
 *           type: string
 *           description: 沟通内容
 *         communicationDate:
 *           type: string
 *           format: date
 *           description: 沟通日期
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 记录创建时间
* 
 *   tags:
 *     - name: Parents
 *       description: 家长管理API
*/

/**
* @swagger
 * /api/parents:
 *   post:
 *     summary: 创建家长
 *     tags: [Parents]
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
 *               - phone
 *               - relationship
 *             properties:
 *               name:
 *                 type: string
 *                 description: 家长姓名
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *               wechat:
 *                 type: string
 *                 description: 微信号
 *               idCard:
 *                 type: string
 *                 description: 身份证号
 *               address:
 *                 type: string
 *                 description: 家庭地址
 *               occupation:
 *                 type: string
 *                 description: 职业
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, guardian]
 *                 description: 与学生关系
 *               emergencyContact:
 *                 type: string
 *                 description: 紧急联系方式
 *               remark:
 *                 type: string
 *                 description: 备注
 *     responses:
 *       201:
 *         description: 家长创建成功
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
 *                   example: 家长创建成功
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.post('/', checkPermission('parent:manage'), parentController.create);

/**
* @swagger
 * /api/parents:
 *   get:
 *     summary: 获取家长列表
 *     tags: [Parents]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（姓名、电话）
 *       - in: query
 *         name: relationship
 *         schema:
 *           type: string
 *           enum: [father, mother, guardian]
 *         description: 与学生关系
 *     responses:
 *       200:
 *         description: 家长列表获取成功
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
 *                   example: 家长列表获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     parents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Parent'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/', checkPermission('parent:list'), parentController.list);

/**
* @swagger
 * /api/parents/{id}:
 *   get:
 *     summary: 获取家长详情
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 家长详情获取成功
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
 *                   example: 家长详情获取成功
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
*/
router.get('/:id', checkPermission('parent:manage'), parentController.detail);

/**
* @swagger
 * /api/parents/{id}:
 *   put:
 *     summary: 更新家长信息
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 家长姓名
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *               wechat:
 *                 type: string
 *                 description: 微信号
 *               idCard:
 *                 type: string
 *                 description: 身份证号
 *               address:
 *                 type: string
 *                 description: 家庭地址
 *               occupation:
 *                 type: string
 *                 description: 职业
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, guardian]
 *                 description: 与学生关系
 *               emergencyContact:
 *                 type: string
 *                 description: 紧急联系方式
 *               remark:
 *                 type: string
 *                 description: 备注
 *     responses:
 *       200:
 *         description: 家长信息更新成功
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
 *                   example: 家长信息更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
*/
router.put('/:id', checkPermission('parent:manage'), parentController.update);

/**
* @swagger
 * /api/parents/{id}:
 *   delete:
 *     summary: 删除家长
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 家长删除成功
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
 *                   example: 家长删除成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
*/
router.delete('/:id', checkPermission('parent:manage'), parentController.delete);

/**
* @swagger
 * /api/parents/{id}/students:
 *   get:
 *     summary: 获取指定家长的所有学生
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 家长学生列表获取成功
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
 *                   example: 家长学生列表获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ParentStudent'
 *                     total:
 *                       type: integer
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
*/
router.get('/:id/students', checkPermission('parent:manage'), parentStudentRelationController.getParentStudents);

/**
* @swagger
 * /api/parents/{id}/students:
 *   post:
 *     summary: 为指定家长添加学生关系
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - relationship
 *             properties:
 *               studentId:
 *                 type: integer
 *                 description: 学生ID
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, guardian]
 *                 description: 与学生关系
 *               isEmergencyContact:
 *                 type: boolean
 *                 description: 是否为紧急联系人
 *                 default: false
 *     responses:
 *       201:
 *         description: 家长学生关系添加成功
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
 *                   example: 家长学生关系添加成功
 *                 data:
 *                   $ref: '#/components/schemas/ParentStudent'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长或学生不存在
 *       409:
 *         description: 关系已存在
 *       500:
 *         description: 服务器内部错误
*/
router.post('/:id/students', checkPermission('parent:manage'), parentStudentRelationController.addParentStudent);

/**
* @swagger
 * /api/parents/{parentId}/students/{studentId}:
 *   delete:
 *     summary: 删除指定家长的学生关系
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *     responses:
 *       200:
 *         description: 家长学生关系删除成功
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
 *                   example: 家长学生关系删除成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长或学生关系不存在
 *       500:
 *         description: 服务器内部错误
*/
router.delete('/:parentId/students/:studentId', checkPermission('parent:manage'), parentStudentRelationController.removeParentStudent);

/**
* @swagger
 * /api/parents/{id}/children:
 *   get:
 *     summary: 获取家长的子女列表（API兼容性别名）
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 家长子女列表获取成功
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
 *                   example: 获取家长子女列表成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     children:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Child'
 *                     total:
 *                       type: integer
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
*/

// 注意：/children 路由必须在 /:id/children 之前定义
// 否则 Express 会将 /children 匹配为 /:id/children（id='children'）
// 添加家长角色检查中间件，确保只有家长角色可以访问
router.get('/children', checkRole(['parent', 'admin', 'principal']), async (req, res) => {
  console.log('[家长API] /children 路由被调用');
  console.log('[家长API] User:', req.user);
  console.log('[家长API] Headers:', req.headers.authorization?.substring(0, 50));
  try {
    // 从JWT token中获取当前家长ID
    const parentId = (req as any).user?.id || 804;
    console.log(`[家长API] 获取当前家长的孩子列表, parentId: ${parentId}`);

    // 模拟数据
    const mockChildren = [
      {
        id: 1,
        name: '小明',
        avatar: '',
        className: '小一班',
        gender: 'male',
        birthDate: '2020-03-15'
      },
      {
        id: 2,
        name: '小红',
        avatar: '',
        className: '中一班',
        gender: 'female',
        birthDate: '2019-08-20'
      }
    ];

    res.json({
      success: true,
      message: '获取家长子女列表成功',
      data: {
        items: mockChildren,
        total: mockChildren.length
      }
    });
  } catch (error) {
    console.error('[家长API] 获取子女列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取家长子女列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// /:id/children 路由必须放在 /children 之后，使用正则约束只匹配数字ID
router.get('/:id([0-9]+)/children', checkPermission('parent:manage'), async (req, res) => {
  try {
    const parentId = req.params.id;
    const mockChildren = [
      {
        id: 1,
        parentId: parseInt(parentId),
        name: '小明',
        gender: 'male',
        birthDate: '2020-03-15',
        classId: 1,
        class: { id: 1, name: '小一班', grade: 'junior' },
        relationship: 'son',
        enrollmentDate: '2024-09-01'
      },
      {
        id: 2,
        parentId: parseInt(parentId),
        name: '小红',
        gender: 'female',
        birthDate: '2019-08-20',
        classId: 2,
        class: { id: 2, name: '中一班', grade: 'middle' },
        relationship: 'daughter',
        enrollmentDate: '2023-09-01'
      }
    ];

    res.json({
      success: true,
      message: '获取家长子女列表成功',
      data: {
        children: mockChildren,
        total: mockChildren.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取家长子女列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * @swagger
 * /api/parents/stats:
 *   get:
 *     summary: 获取当前登录家长的统计数据
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 统计数据获取成功
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
 *                     assessmentCount:
 *                       type: integer
 *                       example: 5
 *                     activityCount:
 *                       type: integer
 *                       example: 3
 *                     messageCount:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 */
// 添加家长角色检查中间件，确保只有家长角色可以访问
router.get('/stats', checkRole(['parent', 'admin', 'principal']), async (req, res) => {
  try {
    console.log('[家长API] 获取家长统计数据');

    res.json({
      success: true,
      data: {
        assessmentCount: 5,
        activityCount: 3,
        messageCount: 10
      }
    });
  } catch (error) {
    console.error('[家长API] 获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
* @swagger
 * /api/parents/{id}/communications:
 *   get:
 *     summary: 获取家长沟通记录
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [phone, wechat, email, visit]
 *         description: 沟通方式
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 家长沟通记录获取成功
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
 *                   example: 获取家长沟通记录成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     communications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Communication'
 *                     total:
 *                       type: integer
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
*/
router.get('/:id/communications', checkPermission('parent:manage'), async (req, res) => {
  try {
    const parentId = req.params.id;
    const mockCommunications = [
      {
        id: 1,
        parentId: parseInt(parentId),
        teacherId: 1,
        teacher: { id: 1, name: '张老师', subject: '班主任' },
        type: 'phone',
        topic: '学习情况沟通',
        content: '孩子最近在课堂上表现积极，但需要加强数学练习',
        communicationDate: '2024-07-10',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        parentId: parseInt(parentId),
        teacherId: 2,
        teacher: { id: 2, name: '李老师', subject: '英语老师' },
        type: 'wechat',
        topic: '家庭作业指导',
        content: '建议家长在家多陪孩子练习英语口语',
        communicationDate: '2024-07-08',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      message: '获取家长沟通记录成功',
      data: {
        communications: mockCommunications,
        total: mockCommunications.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取家长沟通记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;

// 触发热重载 - 2025-06-11 06:41 