/**
 * 跟进记录管理API路由
 * 用于管理客户跟进、学生跟进等业务记录
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { FollowUp } from '../models/followup.model';
import { Student } from '../models/student.model';
import { User } from '../models/user.model';
import { Op } from 'sequelize';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken);

/**
* @swagger
 * /api/followups:
 *   get:
 *     summary: 获取跟进记录列表
 *     tags: [跟进管理]
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
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [student, parent, teacher, general]
 *         description: 跟进类型
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: 跟进状态
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *         description: 优先级
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const {
      page = 1,
      limit = 20,
      type,
      status,
      priority,
      startDate,
      endDate
    } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权访问',
        data: null
      });
    }

    // 构建查询条件
    const whereClause: any = {};

    // 非管理员只能看到自己的跟进记录
    if (userRole !== 'admin' && userRole !== 'manager') {
      whereClause.assigneeId = userId;
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    // 日期范围查询
    if (startDate || endDate) {
      whereClause.followUpDate = {};
      if (startDate) {
        whereClause.followUpDate[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.followUpDate[Op.lte] = new Date(endDate as string);
      }
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { count, rows: followups } = await FollowUp.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'className']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName']
        }
      ],
      order: [['followUpDate', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit as string),
      offset
    });

    console.log(`[FOLLOWUP]: 📋 获取跟进记录列表: 用户${userId}, 找到${count}条记录`);

    res.json({
      success: true,
      message: '获取跟进记录列表成功',
      data: {
        followups,
        pagination: {
          current: parseInt(page as string),
          pageSize: parseInt(limit as string),
          total: count,
          pages: Math.ceil(count / parseInt(limit as string))
        }
      }
    });

  } catch (error: any) {
    console.error('[FOLLOWUP]: 获取跟进记录列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取跟进记录列表失败',
      error: error.message,
      data: null
    });
  }
});

/**
* @swagger
 * /api/followups:
 *   post:
 *     summary: 创建跟进记录
 *     tags: [跟进管理]
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
 *               - content
 *               - type
 *               - followUpDate
 *             properties:
 *               title:
 *                 type: string
 *                 description: 跟进标题
 *               content:
 *                 type: string
 *                 description: 跟进内容
 *               type:
 *                 type: string
 *                 enum: [student, parent, teacher, general]
 *                 description: 跟进类型
 *               targetId:
 *                 type: integer
 *                 description: 目标对象ID (学生/家长/教师ID)
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *                 description: 跟进日期
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 default: medium
 *                 description: 优先级
 *               assigneeId:
 *                 type: integer
 *                 description: 分配给的负责人ID
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post('/', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const {
      title,
      content,
      type,
      targetId,
      followUpDate,
      priority = 'medium',
      assigneeId
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权访问',
        data: null
      });
    }

    // 验证必填字段
    if (!title || !content || !type || !followUpDate) {
      return res.status(400).json({
        success: false,
        message: '标题、内容、类型和跟进日期为必填项',
        data: null
      });
    }

    // 如果没有指定分配人，默认分配给创建者
    const finalAssigneeId = assigneeId || userId;

    const followup = await FollowUp.create({
      title,
      content,
      type,
      targetId,
      followUpDate: new Date(followUpDate),
      priority,
      assigneeId: finalAssigneeId,
      createdById: userId,
      status: 'pending'
    });

    // 关联数据查询
    const followupWithAssociations = await FollowUp.findByPk(followup.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'className']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName']
        }
      ]
    });

    console.log(`[FOLLOWUP]: ✅ 创建跟进记录成功: ID${followup.id}, 类型: ${type}`);

    res.status(201).json({
      success: true,
      message: '创建跟进记录成功',
      data: followupWithAssociations
    });

  } catch (error: any) {
    console.error('[FOLLOWUP]: 创建跟进记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建跟进记录失败',
      error: error.message,
      data: null
    });
  }
});

/**
* @swagger
 * /api/followups/{id}:
 *   get:
 *     summary: 获取跟进记录详情
 *     tags: [跟进管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 跟进记录ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 记录不存在
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/:id', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权访问',
        data: null
      });
    }

    const followup = await FollowUp.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'className', 'parentName', 'phoneNumber']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName', 'email', 'phoneNumber']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'realName']
        }
      ]
    });

    if (!followup) {
      return res.status(404).json({
        success: false,
        message: '跟进记录不存在',
        data: null
      });
    }

    // 权限检查：非管理员只能查看自己创建或分配给自己的记录
    if (userRole !== 'admin' && userRole !== 'manager') {
      if (followup.assigneeId !== userId && followup.createdById !== userId) {
        return res.status(403).json({
          success: false,
          message: '没有权限查看此跟进记录',
          data: null
        });
      }
    }

    console.log(`[FOLLOWUP]: 📄 获取跟进记录详情: ID${id}`);

    res.json({
      success: true,
      message: '获取跟进记录详情成功',
      data: followup
    });

  } catch (error: any) {
    console.error('[FOLLOWUP]: 获取跟进记录详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取跟进记录详情失败',
      error: error.message,
      data: null
    });
  }
});

/**
* @swagger
 * /api/followups/{id}:
 *   put:
 *     summary: 更新跟进记录
 *     tags: [跟进管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 跟进记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 跟进标题
 *               content:
 *                 type: string
 *                 description: 跟进内容
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 description: 跟进状态
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 description: 优先级
 *               followUpDate:
 *                 type: string
 *                 format: date-time
 *                 description: 跟进日期
 *               assigneeId:
 *                 type: integer
 *                 description: 分配给的负责人ID
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 记录不存在
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.put('/:id', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权访问',
        data: null
      });
    }

    const followup = await FollowUp.findByPk(id);

    if (!followup) {
      return res.status(404).json({
        success: false,
        message: '跟进记录不存在',
        data: null
      });
    }

    // 权限检查：非管理员只能更新自己创建或分配给自己的记录
    if (userRole !== 'admin' && userRole !== 'manager') {
      if (followup.assigneeId !== userId && followup.createdById !== userId) {
        return res.status(403).json({
          success: false,
          message: '没有权限更新此跟进记录',
          data: null
        });
      }
    }

    // 更新记录
    await followup.update({
      ...updateData,
      updatedById: userId,
      updatedAt: new Date()
    });

    // 查询更新后的完整记录
    const updatedFollowup = await FollowUp.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'className']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'username', 'realName']
        }
      ]
    });

    console.log(`[FOLLOWUP]: ✅ 更新跟进记录成功: ID${id}`);

    res.json({
      success: true,
      message: '更新跟进记录成功',
      data: updatedFollowup
    });

  } catch (error: any) {
    console.error('[FOLLOWUP]: 更新跟进记录失败:', error);
    res.status(500).json({
      success: false,
      message: '更新跟进记录失败',
      error: error.message,
      data: null
    });
  }
});

/**
* @swagger
 * /api/followups/{id}:
 *   delete:
 *     summary: 删除跟进记录
 *     tags: [跟进管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 跟进记录ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 记录不存在
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.delete('/:id', async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权访问',
        data: null
      });
    }

    const followup = await FollowUp.findByPk(id);

    if (!followup) {
      return res.status(404).json({
        success: false,
        message: '跟进记录不存在',
        data: null
      });
    }

    // 权限检查：只有管理员或创建者可以删除记录
    if (userRole !== 'admin' && followup.createdById !== userId) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除此跟进记录',
        data: null
      });
    }

    await followup.destroy();

    console.log(`[FOLLOWUP]: 🗑️ 删除跟进记录成功: ID${id}`);

    res.json({
      success: true,
      message: '删除跟进记录成功',
      data: {
        id: parseInt(id),
        deleted: true
      }
    });

  } catch (error: any) {
    console.error('[FOLLOWUP]: 删除跟进记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除跟进记录失败',
      error: error.message,
      data: null
    });
  }
});

export default router;