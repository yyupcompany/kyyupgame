import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query, param } from 'express-validator';
import { Op } from 'sequelize';
import { Alert } from '../models/alert.model';
import { AlertRule } from '../models/alert-rule.model';
import { User } from '../models/user.model';

// 验证规则
export const createAlertValidation = [
  body('alertType')
    .isIn(['attendance', 'payment', 'health', 'safety', 'enrollment', 'custom'])
    .withMessage('告警类型无效'),
  body('alertLevel')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('告警级别无效'),
  body('title').isString().isLength({ min: 1, max: 200 }).withMessage('标题必填'),
  body('description').isString().isLength({ min: 1 }).withMessage('描述必填'),
  body('sourceType')
    .optional()
    .isIn(['system', 'manual', 'scheduled'])
    .withMessage('来源类型无效'),
  body('sourceId').optional().isString(),
  body('priority').optional().isInt({ min: 0, max: 100 }),
  body('metadata').optional().isObject()
];

export const updateAlertValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID必须是正整数'),
  body('status')
    .optional()
    .isIn(['active', 'acknowledged', 'resolved', 'dismissed'])
    .withMessage('状态无效'),
  body('resolution').optional().isString()
];

export const listValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('alertType').optional().isIn(['attendance', 'payment', 'health', 'safety', 'enrollment', 'custom']),
  query('alertLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('status').optional().isIn(['active', 'acknowledged', 'resolved', 'dismissed']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
];

export const createRuleValidation = [
  body('name').isString().isLength({ min: 1, max: 100 }).withMessage('规则名称必填'),
  body('alertType')
    .isIn(['attendance', 'payment', 'health', 'safety', 'enrollment', 'custom'])
    .withMessage('告警类型无效'),
  body('alertLevel')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('告警级别无效'),
  body('conditionType')
    .isIn(['threshold', 'schedule', 'event', 'expression'])
    .withMessage('条件类型无效'),
  body('conditionConfig').isObject().withMessage('条件配置必须是对象'),
  body('actionType').isIn(['notify', 'escalate', 'auto_resolve']).withMessage('动作类型无效'),
  body('actionConfig').isObject().withMessage('动作配置必须是对象'),
  body('enabled').optional().isBoolean(),
  body('cooldownMinutes').optional().isInt({ min: 0 })
];

/**
 * 创建告警
 */
export const createAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = (req.user as User)?.id || req.body.userId || 1;

    const alert = await Alert.create({
      ...req.body,
      triggeredAt: new Date(),
      status: 'active',
      priority: req.body.priority || getPriorityByLevel(req.body.alertLevel)
    });

    res.status(201).json({
      success: true,
      data: alert,
      message: '告警创建成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取告警列表
 */
export const listAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      alertType,
      alertLevel,
      status,
      startDate,
      endDate
    } = req.query;

    const where: any = {};

    if (alertType) where.alertType = alertType;
    if (alertLevel) where.alertLevel = alertLevel;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.triggeredAt = {};
      if (startDate) where.triggeredAt[Op.gte] = startDate;
      if (endDate) where.triggeredAt[Op.lte] = endDate;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Alert.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'acknowledger',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'name']
        }
      ],
      order: [['priority', 'DESC'], ['triggeredAt', 'DESC']],
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
        alerts: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取告警详情
 */
export const getAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByPk(id, {
      include: [
        {
          model: User,
          as: 'acknowledger',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: '告警不存在'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新告警状态
 */
export const updateAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const userId = (req.user as User)?.id || 1;

    const alert = await Alert.findByPk(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: '告警不存在'
      });
    }

    const { status, resolution } = req.body;

    // 如果确认告警
    if (status === 'acknowledged' && alert.status === 'active') {
      await alert.update({
        status,
        acknowledgedAt: new Date(),
        acknowledgedBy: userId
      });
    }
    // 如果解决告警
    else if (status === 'resolved') {
      await alert.update({
        status,
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolution
      });
    }
    // 如果忽略告警
    else if (status === 'dismissed') {
      await alert.update({
        status,
        resolvedAt: new Date(),
        resolvedBy: userId
      });
    } else {
      await alert.update(req.body);
    }

    res.json({
      success: true,
      data: alert,
      message: '告警更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除告警
 */
export const deleteAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByPk(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: '告警不存在'
      });
    }

    await alert.destroy();

    res.json({
      success: true,
      message: '告警删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取告警统计
 */
export const getAlertStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.triggeredAt = {};
      if (startDate) where.triggeredAt[Op.gte] = startDate;
      if (endDate) where.triggeredAt[Op.lte] = endDate;
    }

    // 按类型统计
    const byType = await Alert.findAll({
      where,
      attributes: [
        'alertType',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['alertType']
    });

    // 按级别统计
    const byLevel = await Alert.findAll({
      where,
      attributes: [
        'alertLevel',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['alertLevel']
    });

    // 按状态统计
    const byStatus = await Alert.findAll({
      where,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      group: ['status']
    });

    // 待处理告警数
    const activeCount = await Alert.count({ where: { ...where, status: 'active' } });

    // 今日新增
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Alert.count({
      where: { ...where, triggeredAt: { [Op.gte]: today } }
    });

    // 本周趋势 (简化计算)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    res.json({
      success: true,
      data: {
        total: byType.reduce((sum: number, item: any) => sum + parseInt(item.dataValues.count), 0),
        activeCount,
        todayCount,
        byType,
        byLevel,
        byStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建告警规则
 */
export const createRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const rule = await AlertRule.create(req.body);

    res.status(201).json({
      success: true,
      data: rule,
      message: '告警规则创建成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取告警规则列表
 */
export const listRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, alertType, enabled } = req.query;

    const where: any = {};
    if (alertType) where.alertType = alertType;
    if (enabled !== undefined) where.enabled = enabled === 'true';

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await AlertRule.findAndCountAll({
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
        rules: rows
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 切换规则启用状态
 */
export const toggleRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const rule = await AlertRule.findByPk(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: '规则不存在'
      });
    }

    await rule.update({ enabled: !rule.enabled });

    res.json({
      success: true,
      data: rule,
      message: rule.enabled ? '规则已启用' : '规则已禁用'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 触发告警检查 (定时任务调用)
 */
export const checkAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;

    const where: any = { enabled: true };
    if (type) where.alertType = type;

    const rules = await AlertRule.findAll({ where });

    const triggeredAlerts: any[] = [];
    const now = new Date();

    for (const rule of rules) {
      if (rule.shouldTrigger({ currentTime: now.toISOString() })) {
        // 创建告警
        const alert = await Alert.create({
          alertType: rule.alertType,
          alertLevel: rule.alertLevel,
          title: rule.name,
          description: rule.description,
          sourceType: 'scheduled',
          sourceId: `rule-${rule.id}`,
          status: 'active',
          priority: getPriorityByLevel(rule.alertLevel),
          triggeredAt: now,
          metadata: {
            ruleId: rule.id,
            ruleName: rule.name,
            actionConfig: rule.actionConfig
          }
        });

        // 更新规则触发信息
        await rule.update({
          lastTriggeredAt: now,
          triggerCount: rule.triggerCount + 1
        });

        triggeredAlerts.push(alert);
      }
    }

    res.json({
      success: true,
      data: {
        checkedRules: rules.length,
        triggeredAlerts: triggeredAlerts.length,
        alerts: triggeredAlerts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 辅助函数：根据级别获取优先级
 */
function getPriorityByLevel(level: string): number {
  const priorityMap: Record<string, number> = {
    low: 10,
    medium: 50,
    high: 80,
    critical: 100
  };
  return priorityMap[level] || 0;
}
