/**
* @swagger
 * components:
 *   schemas:
 *     Teacher-center-creative-curriculum:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Teacher-center-creative-curriculum ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Teacher-center-creative-curriculum 名称
 *           example: "示例Teacher-center-creative-curriculum"
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
 *     CreateTeacher-center-creative-curriculumRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher-center-creative-curriculum 名称
 *           example: "新Teacher-center-creative-curriculum"
 *     UpdateTeacher-center-creative-curriculumRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher-center-creative-curriculum 名称
 *           example: "更新后的Teacher-center-creative-curriculum"
 *     Teacher-center-creative-curriculumListResponse:
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
 *                 $ref: '#/components/schemas/Teacher-center-creative-curriculum'
 *         message:
 *           type: string
 *           example: "获取teacher-center-creative-curriculum列表成功"
 *     Teacher-center-creative-curriculumResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Teacher-center-creative-curriculum'
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
 * teacher-center-creative-curriculum管理路由文件
 * 提供teacher-center-creative-curriculum的基础CRUD操作
*
 * 功能包括：
 * - 获取teacher-center-creative-curriculum列表
 * - 创建新teacher-center-creative-curriculum
 * - 获取teacher-center-creative-curriculum详情
 * - 更新teacher-center-creative-curriculum信息
 * - 删除teacher-center-creative-curriculum
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router, Request, Response } from 'express';
import { CreativeCurriculum } from '../models/creative-curriculum.model';
import { Op } from 'sequelize';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

/**
* @swagger
 * /teacher-center/creative-curriculum/save:
 *   post:
 *     summary: 保存创意课程
 *     description: 保存或更新教师创建的创意课程，支持HTML/CSS/JS代码编辑
 *     tags: [教师创意课程]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 课程ID (更新时必填，新建时可选)
 *               name:
 *                 type: string
 *                 description: 课程名称
 *               description:
 *                 type: string
 *                 description: 课程描述
 *               domain:
 *                 type: string
 *                 description: 课程领域 (语言/数学/科学/艺术等)
 *               ageGroup:
 *                 type: string
 *                 description: 适用年龄段
 *               htmlCode:
 *                 type: string
 *                 description: HTML代码
 *               cssCode:
 *                 type: string
 *                 description: CSS代码
 *               jsCode:
 *                 type: string
 *                 description: JavaScript代码
 *               schedule:
 *                 type: string
 *                 description: 课程安排
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 default: draft
 *                 description: 课程状态
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 课程标签
 *               isPublic:
 *                 type: boolean
 *                 default: false
 *                 description: 是否公开
 *     responses:
 *       200:
 *         description: 课程保存成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "课程保存成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 课程ID
 *                     name:
 *                       type: string
 *                       description: 课程名称
 *                     domain:
 *                       type: string
 *                       description: 课程领域
 *       400:
 *         description: 缺少必填字段
 *       401:
 *         description: 用户未认证
 *       403:
 *         description: 无权限更新此课程
 *       404:
 *         description: 课程不存在
 *       500:
 *         description: 服务器错误
*/
router.post('/save', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const kindergartenId = (req as any).user?.kindergartenId;

    if (!userId) {
      return res.status(401).json({
        code: 401,
        success: false,
        message: '用户未认证'
      });
    }

    // 如果用户没有关联幼儿园，使用默认值或null
    console.log('💾 保存课程 - userId:', userId, 'kindergartenId:', kindergartenId);

    const {
      id,
      name,
      description,
      domain,
      ageGroup,
      htmlCode,
      cssCode,
      jsCode,
      schedule,
      status = 'draft',
      tags,
      isPublic = false
    } = req.body;

    // 验证必填字段
    if (!name || !domain || !htmlCode || !cssCode || !jsCode) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: '缺少必填字段'
      });
    }

    let curriculum;

    if (id) {
      // 更新现有课程
      curriculum = await CreativeCurriculum.findByPk(id);
      if (!curriculum) {
        return res.status(404).json({
          code: 404,
          success: false,
          message: '课程不存在'
        });
      }

      // 验证权限：只有创建者或管理员可以更新
      if (curriculum.creatorId !== userId) {
        return res.status(403).json({
          code: 403,
          success: false,
          message: '无权限更新此课程'
        });
      }

      await curriculum.update({
        name,
        description,
        domain,
        ageGroup,
        htmlCode,
        cssCode,
        jsCode,
        schedule,
        status,
        tags,
        isPublic
      });
    } else {
      // 创建新课程
      const createData: any = {
        creatorId: userId,
        name,
        description,
        domain,
        ageGroup,
        htmlCode,
        cssCode,
        jsCode,
        schedule,
        status,
        tags,
        isPublic
      };

      // 如果有kindergartenId，则添加到创建数据中
      if (kindergartenId) {
        createData.kindergartenId = kindergartenId;
      }

      curriculum = await CreativeCurriculum.create(createData);
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: id ? '课程更新成功' : '课程保存成功',
      data: {
        id: curriculum.id,
        name: curriculum.name,
        domain: curriculum.domain,
        message: id ? '课程更新成功' : '课程保存成功'
      }
    });
  } catch (error) {
    console.error('❌ 保存课程失败:', error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: '保存课程失败'
    });
  }
});

/**
* @swagger
 * /teacher-center/creative-curriculum/{id}:
 *   get:
 *     summary: 获取课程详情
 *     description: 获取指定创意课程的详细信息，包括HTML/CSS/JS代码
 *     tags: [教师创意课程]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 课程ID
 *     responses:
 *       200:
 *         description: 获取课程成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取课程成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 课程ID
 *                     name:
 *                       type: string
 *                       description: 课程名称
 *                     description:
 *                       type: string
 *                       description: 课程描述
 *                     domain:
 *                       type: string
 *                       description: 课程领域
 *                     ageGroup:
 *                       type: string
 *                       description: 适用年龄段
 *                     htmlCode:
 *                       type: string
 *                       description: HTML代码
 *                     cssCode:
 *                       type: string
 *                       description: CSS代码
 *                     jsCode:
 *                       type: string
 *                       description: JavaScript代码
 *                     schedule:
 *                       type: string
 *                       description: 课程安排
 *                     status:
 *                       type: string
 *                       description: 课程状态
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 课程标签
 *                     isPublic:
 *                       type: boolean
 *                       description: 是否公开
 *                     viewCount:
 *                       type: integer
 *                       description: 浏览次数
 *                     createdAt:
 *                       type: string
 *                       description: 创建时间
 *                     updatedAt:
 *                       type: string
 *                       description: 更新时间
 *       401:
 *         description: 用户未认证
 *       403:
 *         description: 无权限查看此课程
 *       404:
 *         description: 课程不存在
 *       500:
 *         description: 服务器错误
*/
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const curriculum = await CreativeCurriculum.findByPk(id);
    if (!curriculum) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '课程不存在'
      });
    }

    // 如果课程不是公开的，只有创建者可以查看
    if (!curriculum.isPublic && curriculum.creatorId !== userId) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: '无权限查看此课程'
      });
    }

    // 增加浏览次数
    await curriculum.increment('viewCount');

    return res.status(200).json({
      code: 200,
      success: true,
      message: '获取课程成功',
      data: curriculum
    });
  } catch (error) {
    console.error('❌ 获取课程失败:', error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: '获取课程失败'
    });
  }
});

/**
* @swagger
 * /teacher-center/creative-curriculum:
 *   get:
 *     summary: 获取我的课程列表
 *     description: 获取当前教师创建的创意课程列表，支持分页和筛选
 *     tags: [教师创意课程]
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
 *         name: domain
 *         schema:
 *           type: string
 *         description: 课程领域筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: 课程状态筛选
 *       - in: query
 *         name: ageGroup
 *         schema:
 *           type: string
 *         description: 年龄段筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取课程列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取课程列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     limit:
 *                       type: integer
 *                       description: 每页数量
 *                     rows:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 课程ID
 *                           name:
 *                             type: string
 *                             description: 课程名称
 *                           description:
 *                             type: string
 *                             description: 课程描述
 *                           domain:
 *                             type: string
 *                             description: 课程领域
 *                           ageGroup:
 *                             type: string
 *                             description: 适用年龄段
 *                           status:
 *                             type: string
 *                             description: 课程状态
 *                           isPublic:
 *                             type: boolean
 *                             description: 是否公开
 *                           viewCount:
 *                             type: integer
 *                             description: 浏览次数
 *                           createdAt:
 *                             type: string
 *                             description: 创建时间
 *                           updatedAt:
 *                             type: string
 *                             description: 更新时间
 *       401:
 *         description: 用户未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const kindergartenId = (req as any).user?.kindergartenId;
    const { page = 1, limit = 10, domain, status, ageGroup, search } = req.query;

    console.log('📚 获取课程列表 - userId:', userId, 'kindergartenId:', kindergartenId);

    // 构建查询条件
    const where: any = {
      creatorId: userId
    };

    // 如果有幼儿园ID，则添加到查询条件
    if (kindergartenId) {
      where.kindergartenId = kindergartenId;
    }

    if (domain) {
      where.domain = domain;
    }

    if (status) {
      where.status = status;
    }

    // 年龄段筛选
    if (ageGroup) {
      where.ageGroup = ageGroup;
    }

    // 搜索功能
    if (search) {
      where.name = {
        [Op.like]: `%${search}%`
      };
    }

    const offset = (Number(page) - 1) * Number(limit);

    console.log('📚 查询条件:', where);

    const { count, rows } = await CreativeCurriculum.findAndCountAll({
      where,
      offset,
      limit: Number(limit),
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ 获取课程列表成功，共', count, '个课程');

    return res.status(200).json({
      code: 200,
      success: true,
      message: '获取课程列表成功',
      data: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        rows: rows
      }
    });
  } catch (error) {
    console.error('❌ 获取课程列表失败:', error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: '获取课程列表失败'
    });
  }
});

/**
* @swagger
 * /teacher-center/creative-curriculum/{id}:
 *   delete:
 *     summary: 删除课程
 *     description: 删除指定的创意课程，只有课程创建者可以删除
 *     tags: [教师创意课程]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 课程ID
 *     responses:
 *       200:
 *         description: 课程删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "课程删除成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 被删除的课程ID
 *       401:
 *         description: 用户未认证
 *       403:
 *         description: 无权限删除此课程
 *       404:
 *         description: 课程不存在
 *       500:
 *         description: 服务器错误
*/
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const curriculum = await CreativeCurriculum.findByPk(id);
    if (!curriculum) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: '课程不存在'
      });
    }

    // 验证权限：只有创建者可以删除
    if (curriculum.creatorId !== userId) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: '无权限删除此课程'
      });
    }

    await curriculum.destroy();

    return res.status(200).json({
      code: 200,
      success: true,
      message: '课程删除成功',
      data: { id }
    });
  } catch (error) {
    console.error('❌ 删除课程失败:', error);
    return res.status(500).json({
      code: 500,
      success: false,
      message: '删除课程失败'
    });
  }
});

export default router;

