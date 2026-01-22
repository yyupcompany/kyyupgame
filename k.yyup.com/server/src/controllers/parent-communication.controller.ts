import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query, param } from 'express-validator';
import { ParentCommunication } from '../models/parent-communication.model';
import { ParentStudentRelation } from '../models/parent-student-relation.model';
import { User } from '../models/user.model';
import { Op } from 'sequelize';

// 验证规则
export const createValidation = [
  body('parentId').isInt({ min: 1 }).withMessage('家长ID必须是正整数'),
  body('studentId').isInt({ min: 1 }).withMessage('学生ID必须是正整数'),
  body('communicationType')
    .isIn(['phone', 'message', 'meeting', 'video', 'wechat'])
    .withMessage('沟通类型无效'),
  body('direction').isIn(['inbound', 'outbound']).withMessage('沟通方向无效'),
  body('content').isString().isLength({ min: 1, max: 10000 }).withMessage('内容长度必须在1-10000字符之间'),
  body('summary').optional().isString().isLength({ max: 500 }),
  body('sentiment').optional().isFloat({ min: -1, max: 1 }),
  body('topics').optional().isArray(),
  body('duration').optional().isInt({ min: 0 }),
  body('status')
    .optional()
    .isIn(['completed', 'followup_needed', 'escalated'])
    .withMessage('状态无效'),
  body('followupRequired').optional().isBoolean(),
  body('nextFollowupDate').optional().isISO8601(),
  body('responseRequired').optional().isBoolean(),
  body('responseDeadline').optional().isISO8601()
];

export const updateValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
  body('content').optional().isString().isLength({ max: 10000 }),
  body('summary').optional().isString().isLength({ max: 500 }),
  body('status').optional().isIn(['completed', 'followup_needed', 'escalated']),
  body('followupRequired').optional().isBoolean(),
  body('nextFollowupDate').optional().isISO8601()
];

export const listValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('parentId').optional().isInt({ min: 1 }).toInt(),
  query('studentId').optional().isInt({ min: 1 }).toInt(),
  query('communicationType').optional().isIn(['phone', 'message', 'meeting', 'video', 'wechat']),
  query('direction').optional().isIn(['inbound', 'outbound']),
  query('status').optional().isIn(['completed', 'followup_needed', 'escalated']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('topics').optional().isString()
];

/**
 * 创建沟通记录
 */
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = (req.user as User)?.id || req.body.userId || 1;

    const communication = await ParentCommunication.create({
      ...req.body,
      createdBy: userId,
      topics: req.body.topics || [],
      status: req.body.status || 'completed'
    });

    res.status(201).json({
      success: true,
      data: communication,
      message: '沟通记录创建成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取沟通记录详情
 */
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const communication = await ParentCommunication.findByPk(id);

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: '沟通记录不存在'
      });
    }

    res.json({
      success: true,
      data: communication
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取沟通记录列表
 */
export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      parentId,
      studentId,
      communicationType,
      direction,
      status,
      startDate,
      endDate,
      topics
    } = req.query;

    const where: any = {};

    if (parentId) where.parentId = parentId;
    if (studentId) where.studentId = studentId;
    if (communicationType) where.communicationType = communicationType;
    if (direction) where.direction = direction;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = startDate;
      if (endDate) where.createdAt[Op.lte] = endDate;
    }

    if (topics) {
      where.topics = { [Op.contains]: (topics as string).split(',') };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await ParentCommunication.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
        communications: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新沟通记录
 */
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;

    const communication = await ParentCommunication.findByPk(id);
    if (!communication) {
      return res.status(404).json({
        success: false,
        message: '沟通记录不存在'
      });
    }

    await communication.update(req.body);

    res.json({
      success: true,
      data: communication,
      message: '沟通记录更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除沟通记录
 */
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const communication = await ParentCommunication.findByPk(id);
    if (!communication) {
      return res.status(404).json({
        success: false,
        message: '沟通记录不存在'
      });
    }

    await communication.destroy();

    res.json({
      success: true,
      message: '沟通记录删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取沟通统计
 */
export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = startDate;
      if (endDate) where.createdAt[Op.lte] = endDate;
    }

    // 按沟通类型统计
    const typeStats = await ParentCommunication.findAll({
      where,
      attributes: [
        'communicationType',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['communicationType']
    });

    // 按状态统计
    const statusStats = await ParentCommunication.findAll({
      where,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['status']
    });

    // 按方向统计
    const directionStats = await ParentCommunication.findAll({
      where,
      attributes: [
        'direction',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['direction']
    });

    // 平均响应时间 (模拟数据)
    const avgResponseTime = 2.5; // 小时

    // 家长满意度 (模拟数据)
    const satisfactionScore = 4.6;

    res.json({
      success: true,
      data: {
        totalCommunications: typeStats.reduce((sum: number, item: any) => sum + parseInt(item.dataValues.count), 0),
        byType: typeStats,
        byStatus: statusStats,
        byDirection: directionStats,
        avgResponseTime,
        satisfactionScore
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取需要跟进的沟通记录
 */
export const getPendingFollowups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followups = await ParentCommunication.findAll({
      where: {
        followupRequired: true,
        nextFollowupDate: {
          [Op.lte]: new Date()
        },
        status: 'followup_needed'
      },
      include: [
        {
          model: ParentStudentRelation,
          as: 'parent',
          attributes: ['id', 'parentName', 'phone', 'studentName']
        }
      ],
      order: [['nextFollowupDate', 'ASC']]
    });

    res.json({
      success: true,
      data: followups
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 生成AI回复建议
 */
export const generateAiSuggestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { communicationId } = req.params;

    const communication = await ParentCommunication.findByPk(communicationId);
    if (!communication) {
      return res.status(404).json({
        success: false,
        message: '沟通记录不存在'
      });
    }

    // 模拟AI建议生成
    const suggestions = [
      {
        id: `suggestion-${Date.now()}-1`,
        tone: 'professional_friendly',
        confidence: 92,
        response: `感谢您的反馈！我们非常重视与家长的沟通。针对您提到的${communication.topics.join('、')}，我们将安排专人跟进，并在近期给您详细的回复。`,
        alternativeResponses: [
          '我们理解您的关切，会立即安排处理。',
          '感谢您的建议，我们会认真考虑并改进。'
        ]
      },
      {
        id: `suggestion-${Date.now()}-2`,
        tone: 'empathetic',
        confidence: 88,
        response: `我们完全理解您的心情。对于${communication.topics.join('和')}，我们的老师会给予特别关注。如果您方便的话，我们可以安排一次面对面沟通，共同讨论如何更好地支持孩子的发展。`,
        alternativeResponses: [
          '每个孩子都有自己的发展节奏，我们一起努力。',
          '感谢您的耐心，我们会持续关注。'
        ]
      }
    ];

    res.json({
      success: true,
      data: {
        communicationId,
        suggestions,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
};
