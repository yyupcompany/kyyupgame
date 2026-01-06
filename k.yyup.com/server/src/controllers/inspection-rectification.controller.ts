import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import InspectionRectification, { RectificationProgressLog, RectificationStatus, ProblemSeverity } from '../models/inspection-rectification.model';
import InspectionPlan from '../models/inspection-plan.model';
import InspectionRecord from '../models/inspection-record.model';
import { InspectionRecordItem } from '../models/inspection-record.model';

/**
 * 整改管理控制器
 */
export class InspectionRectificationController {
  /**
   * 获取整改任务列表
   * GET /api/inspection-rectifications
   */
  public getList = asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      pageSize = 10,
      inspectionPlanId,
      status,
      responsiblePersonId,
      problemSeverity
    } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);
    const where: any = {};

    if (inspectionPlanId) where.inspectionPlanId = inspectionPlanId;
    if (status) where.status = status;
    if (responsiblePersonId) where.responsiblePersonId = responsiblePersonId;
    if (problemSeverity) where.problemSeverity = problemSeverity;

    const { rows: rectifications, count: total } = await InspectionRectification.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset,
      include: [
        {
          model: InspectionPlan,
          as: 'inspectionPlan'
        },
        {
          model: InspectionRecord,
          as: 'record'
        },
        {
          model: InspectionRecordItem,
          as: 'recordItem'
        },
        {
          model: RectificationProgressLog,
          as: 'progressLogs',
          order: [['logDate', 'DESC']],
          limit: 5
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        items: rectifications,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize))
      },
      message: '获取整改任务列表成功'
    });
  });

  /**
   * 获取整改任务详情
   * GET /api/inspection-rectifications/:id
   */
  public getDetail = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const rectification = await InspectionRectification.findByPk(id, {
      include: [
        {
          model: InspectionPlan,
          as: 'inspectionPlan'
        },
        {
          model: InspectionRecord,
          as: 'record'
        },
        {
          model: InspectionRecordItem,
          as: 'recordItem'
        },
        {
          model: RectificationProgressLog,
          as: 'progressLogs',
          order: [['logDate', 'DESC']]
        }
      ]
    });

    if (!rectification) {
      return res.status(404).json({
        success: false,
        message: '整改任务不存在'
      });
    }

    res.json({
      success: true,
      data: rectification,
      message: '获取整改任务详情成功'
    });
  });

  /**
   * 创建整改任务
   * POST /api/inspection-rectifications
   */
  public create = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const {
      inspectionPlanId,
      recordId,
      recordItemId,
      problemDescription,
      problemSeverity = ProblemSeverity.MEDIUM,
      rectificationMeasures,
      responsiblePersonId,
      responsiblePersonName,
      deadline,
      notes
    } = req.body;

    const rectification = await InspectionRectification.create({
      inspectionPlanId,
      recordId,
      recordItemId,
      problemDescription,
      problemSeverity,
      rectificationMeasures,
      responsiblePersonId,
      responsiblePersonName,
      deadline,
      status: RectificationStatus.PENDING,
      progress: 0,
      notes,
      createdBy: userId
    });

    res.status(201).json({
      success: true,
      data: rectification,
      message: '创建整改任务成功'
    });
  });

  /**
   * 更新整改任务
   * PUT /api/inspection-rectifications/:id
   */
  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      problemDescription,
      problemSeverity,
      rectificationMeasures,
      responsiblePersonId,
      responsiblePersonName,
      deadline,
      status,
      progress,
      notes
    } = req.body;

    const rectification = await InspectionRectification.findByPk(id);
    if (!rectification) {
      return res.status(404).json({
        success: false,
        message: '整改任务不存在'
      });
    }

    await rectification.update({
      problemDescription,
      problemSeverity,
      rectificationMeasures,
      responsiblePersonId,
      responsiblePersonName,
      deadline,
      status,
      progress,
      notes
    });

    res.json({
      success: true,
      data: rectification,
      message: '更新整改任务成功'
    });
  });

  /**
   * 完成整改
   * POST /api/inspection-rectifications/:id/complete
   */
  public complete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const {
      completionDescription,
      completionPhotos
    } = req.body;

    const rectification = await InspectionRectification.findByPk(id);
    if (!rectification) {
      return res.status(404).json({
        success: false,
        message: '整改任务不存在'
      });
    }

    await rectification.update({
      status: RectificationStatus.COMPLETED,
      progress: 100,
      completionDate: new Date(),
      completionDescription,
      completionPhotos
    });

    res.json({
      success: true,
      data: rectification,
      message: '整改任务完成'
    });
  });

  /**
   * 验收整改
   * POST /api/inspection-rectifications/:id/verify
   */
  public verify = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const {
      verificationStatus,
      verificationResult,
      verifierName
    } = req.body;

    const rectification = await InspectionRectification.findByPk(id);
    if (!rectification) {
      return res.status(404).json({
        success: false,
        message: '整改任务不存在'
      });
    }

    if (rectification.status !== RectificationStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: '只能验收已完成的整改任务'
      });
    }

    await rectification.update({
      status: verificationStatus === 'pass' ? RectificationStatus.VERIFIED : RectificationStatus.REJECTED,
      verifierId: userId,
      verifierName,
      verificationDate: new Date(),
      verificationResult,
      verificationStatus
    });

    res.json({
      success: true,
      data: rectification,
      message: '验收完成'
    });
  });

  /**
   * 添加进度日志
   * POST /api/inspection-rectifications/:id/progress
   */
  public addProgressLog = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const {
      progress,
      description,
      photos,
      operatorName
    } = req.body;

    const rectification = await InspectionRectification.findByPk(id);
    if (!rectification) {
      return res.status(404).json({
        success: false,
        message: '整改任务不存在'
      });
    }

    // 创建进度日志
    const progressLog = await RectificationProgressLog.create({
      rectificationId: Number(id),
      logDate: new Date(),
      progress,
      description,
      photos,
      operatorId: userId,
      operatorName
    });

    // 更新整改任务进度
    await rectification.update({
      progress,
      status: progress === 100 ? RectificationStatus.COMPLETED : RectificationStatus.IN_PROGRESS
    });

    res.json({
      success: true,
      data: progressLog,
      message: '添加进度日志成功'
    });
  });

  /**
   * 获取进度日志
   * GET /api/inspection-rectifications/:id/progress
   */
  public getProgressLogs = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const logs = await RectificationProgressLog.findAll({
      where: { rectificationId: id },
      order: [['logDate', 'DESC']]
    });

    res.json({
      success: true,
      data: logs,
      message: '获取进度日志成功'
    });
  });

  /**
   * 删除整改任务
   * DELETE /api/inspection-rectifications/:id
   */
  public delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const rectification = await InspectionRectification.findByPk(id);
    if (!rectification) {
      return res.status(404).json({
        success: false,
        message: '整改任务不存在'
      });
    }

    await rectification.destroy();

    res.json({
      success: true,
      message: '删除整改任务成功'
    });
  });

  /**
   * 获取检查计划的整改任务
   * GET /api/inspection-rectifications/plan/:planId
   */
  public getByPlan = asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;

    const rectifications = await InspectionRectification.findAll({
      where: { inspectionPlanId: planId },
      include: [
        {
          model: InspectionRecord,
          as: 'record'
        },
        {
          model: InspectionRecordItem,
          as: 'recordItem'
        },
        {
          model: RectificationProgressLog,
          as: 'progressLogs',
          order: [['logDate', 'DESC']],
          limit: 3
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: rectifications,
      message: '获取检查计划整改任务成功'
    });
  });
}

export default new InspectionRectificationController();

