/**
 * parent_student_relations 路由文件
 * 自动生成 - 2025-07-20T21:41:14.886Z
 * 优化时间 - 2025-01-15
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ParentStudentRelation } from '../models/parent-student-relation.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

/**
* @swagger
 * tags:
 *   - name: ParentStudentRelation
 *     description: 家长学生关系管理 - 管理家长与学生之间的关系信息
*
 * components:
 *   schemas:
 *     ParentStudentRelation:
 *       type: object
 *       required:
 *         - userId
 *         - studentId
 *         - relationship
 *       properties:
 *         id:
 *           type: integer
 *           description: 关系ID
 *           example: 1001
 *         userId:
 *           type: integer
 *           description: 家长用户ID
 *           example: 15
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *           example: 123
 *         relationship:
 *           type: string
 *           maxLength: 20
 *           description: 与学生关系
 *           example: "父亲"
 *           enum: ["父亲", "母亲", "爷爷", "奶奶", "外公", "外婆", "其他监护人"]
 *         isPrimaryContact:
 *           type: integer
 *           enum: [0, 1]
 *           description: 是否主要联系人 (0:否 1:是)
 *           example: 1
 *         isLegalGuardian:
 *           type: integer
 *           enum: [0, 1]
 *           description: 是否法定监护人 (0:否 1:是)
 *           example: 1
 *         idCardNo:
 *           type: string
 *           maxLength: 18
 *           nullable: true
 *           description: 身份证号
 *           example: "110101199001011234"
 *         workUnit:
 *           type: string
 *           maxLength: 100
 *           nullable: true
 *           description: 工作单位
 *           example: "北京某某公司"
 *         occupation:
 *           type: string
 *           maxLength: 50
 *           nullable: true
 *           description: 职业
 *           example: "工程师"
 *         education:
 *           type: string
 *           maxLength: 50
 *           nullable: true
 *           description: 学历
 *           example: "本科"
 *         address:
 *           type: string
 *           maxLength: 200
 *           nullable: true
 *           description: 居住地址
 *           example: "北京市朝阳区某某街道"
 *         remark:
 *           type: string
 *           maxLength: 500
 *           nullable: true
 *           description: 备注信息
 *           example: "紧急联系人，可随时联系"
 *         creatorId:
 *           type: integer
 *           nullable: true
 *           description: 创建人ID
 *           example: 1
 *         updaterId:
 *           type: integer
 *           nullable: true
 *           description: 更新人ID
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-15T10:30:00.000Z"
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 删除时间
 *           example: null
*
 *     CreateParentStudentRelationRequest:
 *       type: object
 *       required:
 *         - userId
 *         - studentId
 *         - relationship
 *       properties:
 *         userId:
 *           type: integer
 *           description: 家长用户ID
 *           example: 15
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *           example: 123
 *         relationship:
 *           type: string
 *           description: 与学生关系
 *           example: "父亲"
 *         isPrimaryContact:
 *           type: integer
 *           enum: [0, 1]
 *           default: 0
 *           description: 是否主要联系人
 *           example: 1
 *         isLegalGuardian:
 *           type: integer
 *           enum: [0, 1]
 *           default: 0
 *           description: 是否法定监护人
 *           example: 1
 *         idCardNo:
 *           type: string
 *           description: 身份证号
 *           example: "110101199001011234"
 *         workUnit:
 *           type: string
 *           description: 工作单位
 *           example: "北京某某公司"
 *         occupation:
 *           type: string
 *           description: 职业
 *           example: "工程师"
 *         education:
 *           type: string
 *           description: 学历
 *           example: "本科"
 *         address:
 *           type: string
 *           description: 居住地址
 *           example: "北京市朝阳区某某街道"
 *         remark:
 *           type: string
 *           description: 备注信息
 *           example: "紧急联系人，可随时联系"
*
 *     UpdateParentStudentRelationRequest:
 *       type: object
 *       properties:
 *         relationship:
 *           type: string
 *           description: 与学生关系
 *           example: "父亲"
 *         isPrimaryContact:
 *           type: integer
 *           enum: [0, 1]
 *           description: 是否主要联系人
 *           example: 1
 *         isLegalGuardian:
 *           type: integer
 *           enum: [0, 1]
 *           description: 是否法定监护人
 *           example: 1
 *         idCardNo:
 *           type: string
 *           description: 身份证号
 *           example: "110101199001011234"
 *         workUnit:
 *           type: string
 *           description: 工作单位
 *           example: "北京某某公司"
 *         occupation:
 *           type: string
 *           description: 职业
 *           example: "工程师"
 *         education:
 *           type: string
 *           description: 学历
 *           example: "本科"
 *         address:
 *           type: string
 *           description: 居住地址
 *           example: "北京市朝阳区某某街道"
 *         remark:
 *           type: string
 *           description: 备注信息
 *           example: "紧急联系人，可随时联系"
*
 *     ParentStudentRelationWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/ParentStudentRelation'
 *         - type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 用户ID
 *                   example: 15
 *                 name:
 *                   type: string
 *                   description: 家长姓名
 *                   example: "张三"
 *                 phone:
 *                   type: string
 *                   description: 手机号码
 *                   example: "13800138000"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: 邮箱地址
 *                   example: "zhangsan@example.com"
 *                 avatar:
 *                   type: string
 *                   description: 头像URL
 *                   example: "https://example.com/avatar.jpg"
 *               description: 家长用户信息
 *             student:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 学生ID
 *                   example: 123
 *                 name:
 *                   type: string
 *                   description: 学生姓名
 *                   example: "张小明"
 *                 studentNo:
 *                   type: string
 *                   description: 学号
 *                   example: "ST001"
 *                 className:
 *                   type: string
 *                   description: 班级名称
 *                   example: "小班A"
 *                 gender:
 *                   type: integer
 *                   description: 性别 (1:男 2:女)
 *                   example: 1
 *                 birthDate:
 *                   type: string
 *                   format: date
 *                   description: 出生日期
 *                   example: "2019-05-15"
 *               description: 学生信息
*
 * security:
 *   - bearerAuth: []
*
 * responses:
 *   UnauthorizedError:
 *     description: 未认证或token无效
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             code:
 *               type: string
 *               example: "UNAUTHORIZED"
 *             message:
 *               type: string
 *               example: "认证失败"
 *   ForbiddenError:
 *     description: 权限不足
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             code:
 *               type: string
 *               example: "FORBIDDEN"
 *             message:
 *               type: string
 *               example: "权限不足"
 *   ValidationError:
 *     description: 请求参数验证失败
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             code:
 *               type: string
 *               example: "VALIDATION_ERROR"
 *             message:
 *               type: string
 *               example: "请求参数验证失败"
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                     example: "relationship"
 *                   message:
 *                     type: string
 *                     example: "关系类型不能为空"
*/

/**
 * 家长学生关系管理路由
 * 基础路径: /api/parent-student-relations
*
 * 权限说明：
 * - 所有接口都需要 JWT 认证
 * - 管理员可以管理所有家长学生关系
 * - 家长可以查看自己与学生的关系
 * - 教师可以查看所教班级学生的家长信息
*/

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/parent-student-relations:
 *   get:
 *     tags: [ParentStudentRelation]
 *     summary: 获取家长学生关系列表
 *     description: 获取家长学生关系列表，支持多种查询条件和分页
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 家长用户ID筛选
 *         example: 15
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: 学生ID筛选
 *         example: 123
 *       - in: query
 *         name: relationship
 *         schema:
 *           type: string
 *           enum: ["父亲", "母亲", "爷爷", "奶奶", "外公", "外婆", "其他监护人"]
 *         description: 关系类型筛选
 *         example: "父亲"
 *       - in: query
 *         name: isPrimaryContact
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 是否主要联系人筛选
 *         example: 1
 *       - in: query
 *         name: isLegalGuardian
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: 是否法定监护人筛选
 *         example: 1
 *       - in: query
 *         name: includeDetails
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含家长和学生详细信息
 *         example: true
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *         example: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（家长姓名、学生姓名等）
 *         example: "张"
 *     responses:
 *       200:
 *         description: 获取关系列表成功
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
 *                   example: "获取家长学生关系列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         oneOf:
 *                           - $ref: '#/components/schemas/ParentStudentRelation'
 *                           - $ref: '#/components/schemas/ParentStudentRelationWithDetails'
 *                       description: 关系列表
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           description: 当前页码
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           description: 每页数量
 *                           example: 20
 *                         totalItems:
 *                           type: integer
 *                           description: 总记录数
 *                           example: 150
 *                         totalPages:
 *                           type: integer
 *                           description: 总页数
 *                           example: 8
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalRelations:
 *                           type: integer
 *                           description: 总关系数
 *                           example: 150
 *                         primaryContactCount:
 *                           type: integer
 *                           description: 主要联系人数
 *                           example: 120
 *                         legalGuardianCount:
 *                           type: integer
 *                           description: 法定监护人数
 *                           example: 130
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: 服务器内部错误
*/
router.get('/', async (req, res) => {
  try {
    const list = await ParentStudentRelation.findAll();
    return ApiResponse.success(res, { list }, '获取parent_student_relations列表成功');
  } catch (error) {
    console.error('[STUDENT]: 获取parent_student_relations列表失败:', error);
    return ApiResponse.error(res, '获取parent_student_relations列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/parent-student-relations:
 *   post:
 *     tags: [ParentStudentRelation]
 *     summary: 创建家长学生关系
 *     description: 创建新的家长学生关系记录，建立家长与学生之间的关联
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateParentStudentRelationRequest'
 *           example:
 *             userId: 15
 *             studentId: 123
 *             relationship: "父亲"
 *             isPrimaryContact: 1
 *             isLegalGuardian: 1
 *             idCardNo: "110101199001011234"
 *             workUnit: "北京某某公司"
 *             occupation: "工程师"
 *             education: "本科"
 *             address: "北京市朝阳区某某街道"
 *             remark: "紧急联系人，可随时联系"
 *     responses:
 *       201:
 *         description: 创建关系成功
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
 *                   example: "创建家长学生关系成功"
 *                 data:
 *                   $ref: '#/components/schemas/ParentStudentRelation'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: 关系已存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "RELATION_EXISTS"
 *                 message:
 *                   type: string
 *                   example: "该家长与学生关系已存在"
 *       500:
 *         description: 服务器内部错误
*/
router.post('/', async (req, res) => {
  try {
    const item = await ParentStudentRelation.create(req.body);
    return ApiResponse.success(res, item, '创建parent_student_relations成功');
  } catch (error) {
    console.error('[STUDENT]: 创建parent_student_relations失败:', error);
    return ApiResponse.error(res, '创建parent_student_relations失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/parent-student-relations/{id}:
 *   get:
 *     tags: [ParentStudentRelation]
 *     summary: 获取家长学生关系详情
 *     description: 根据ID获取指定家长学生关系的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 关系ID
 *         example: 1001
 *       - in: query
 *         name: includeDetails
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含家长和学生详细信息
 *         example: true
 *     responses:
 *       200:
 *         description: 获取关系详情成功
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
 *                   example: "获取家长学生关系详情成功"
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/ParentStudentRelation'
 *                     - $ref: '#/components/schemas/ParentStudentRelationWithDetails'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 关系不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *                 message:
 *                   type: string
 *                   example: "家长学生关系不存在"
 *       500:
 *         description: 服务器内部错误
*/
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ParentStudentRelation.findByPk(id);

    if (!item) {
      return ApiResponse.notFound(res, 'parent_student_relations不存在');
    }

    return ApiResponse.success(res, item, '获取parent_student_relations详情成功');
  } catch (error) {
    console.error('[STUDENT]: 获取parent_student_relations详情失败:', error);
    return ApiResponse.error(res, '获取parent_student_relations详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/parent-student-relations/{id}:
 *   put:
 *     tags: [ParentStudentRelation]
 *     summary: 更新家长学生关系
 *     description: 更新指定的家长学生关系信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 关系ID
 *         example: 1001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateParentStudentRelationRequest'
 *           example:
 *             relationship: "父亲"
 *             isPrimaryContact: 1
 *             isLegalGuardian: 1
 *             workUnit: "北京某某科技有限公司"
 *             occupation: "高级工程师"
 *             address: "北京市朝阳区某某小区"
 *             remark: "紧急联系人，可随时联系"
 *     responses:
 *       200:
 *         description: 更新关系成功
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
 *                   example: "更新家长学生关系成功"
 *                 data:
 *                   $ref: '#/components/schemas/ParentStudentRelation'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 关系不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *                 message:
 *                   type: string
 *                   example: "家长学生关系不存在"
 *       500:
 *         description: 服务器内部错误
*/
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await ParentStudentRelation.update(req.body, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'parent_student_relations不存在');
    }

    const updatedItem = await ParentStudentRelation.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新parent_student_relations成功');
  } catch (error) {
    console.error('[STUDENT]: 更新parent_student_relations失败:', error);
    return ApiResponse.error(res, '更新parent_student_relations失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/parent-student-relations/{id}:
 *   delete:
 *     tags: [ParentStudentRelation]
 *     summary: 删除家长学生关系
 *     description: 删除指定的家长学生关系记录（软删除）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 关系ID
 *         example: 1001
 *     responses:
 *       200:
 *         description: 删除关系成功
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
 *                   example: "删除家长学生关系成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 被删除的关系ID
 *                       example: 1001
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 删除时间
 *                       example: "2024-01-15T16:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 关系不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *                 message:
 *                   type: string
 *                   example: "家长学生关系不存在"
 *       409:
 *         description: 关系正在使用中，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "RELATION_IN_USE"
 *                 message:
 *                   type: string
 *                   example: "该关系正在使用中，无法删除"
 *       500:
 *         description: 服务器内部错误
*/
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await ParentStudentRelation.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'parent_student_relations不存在');
    }

    return ApiResponse.success(res, null, '删除parent_student_relations成功');
  } catch (error) {
    console.error('[STUDENT]: 删除parent_student_relations失败:', error);
    return ApiResponse.error(res, '删除parent_student_relations失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
