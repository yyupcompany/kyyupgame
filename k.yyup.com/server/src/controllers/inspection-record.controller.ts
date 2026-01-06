import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async-handler';
import InspectionRecord, { InspectionRecordItem, InspectionItemStatus } from '../models/inspection-record.model';
import InspectionPlan from '../models/inspection-plan.model';
import InspectionType from '../models/inspection-type.model';

/**
 * 检查记录控制器
 */
export class InspectionRecordController {
  /**
   * 获取检查记录列表
   * GET /api/inspection-records
   */
  public getList = asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      pageSize = 10,
      inspectionPlanId,
      grade,
      startDate,
      endDate
    } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);
    const where: any = {};

    if (inspectionPlanId) where.inspectionPlanId = inspectionPlanId;
    if (grade) where.grade = grade;
    if (startDate || endDate) {
      where.checkDate = {};
      if (startDate) where.checkDate.$gte = startDate;
      if (endDate) where.checkDate.$lte = endDate;
    }

    const { rows: records, count: total } = await InspectionRecord.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset,
      include: [
        {
          model: InspectionPlan,
          as: 'inspectionPlan',
          include: [
            {
              model: InspectionType,
              as: 'type'
            }
          ]
        },
        {
          model: InspectionRecordItem,
          as: 'items'
        }
      ],
      order: [['checkDate', 'DESC']],
    });

    res.json({
      success: true,
      data: {
        items: records,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize))
      },
      message: '获取检查记录列表成功'
    });
  });

  /**
   * 获取检查记录详情
   * GET /api/inspection-records/:id
   */
  public getDetail = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const record = await InspectionRecord.findByPk(id, {
      include: [
        {
          model: InspectionPlan,
          as: 'inspectionPlan',
          include: [
            {
              model: InspectionType,
              as: 'type'
            }
          ]
        },
        {
          model: InspectionRecordItem,
          as: 'items',
          order: [['sortOrder', 'ASC']]
        }
      ]
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '检查记录不存在'
      });
    }

    res.json({
      success: true,
      data: record,
      message: '获取检查记录详情成功'
    });
  });

  /**
   * 创建检查记录
   * POST /api/inspection-records
   */
  public create = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const {
      inspectionPlanId,
      checkDate,
      checkerName,
      totalScore,
      grade,
      summary,
      suggestions,
      attachments,
      checkerSignature,
      items = []
    } = req.body;

    // 创建检查记录
    const record = await InspectionRecord.create({
      inspectionPlanId,
      checkDate,
      checkerId: userId,
      checkerName,
      totalScore,
      grade,
      summary,
      suggestions,
      attachments,
      checkerSignature,
      createdBy: userId
    });

    // 创建检查项明细
    if (items.length > 0) {
      const itemsToCreate = items.map((item: any, index: number) => ({
        recordId: record.id,
        itemName: item.itemName,
        itemCategory: item.itemCategory,
        status: item.status || InspectionItemStatus.PASS,
        score: item.score,
        maxScore: item.maxScore,
        problemDescription: item.problemDescription,
        photos: item.photos,
        notes: item.notes,
        sortOrder: item.sortOrder !== undefined ? item.sortOrder : index
      }));

      await InspectionRecordItem.bulkCreate(itemsToCreate);
    }

    // 更新检查计划状态
    await InspectionPlan.update(
      {
        actualDate: checkDate,
        status: 'completed' as any,
        result: summary,
        score: totalScore,
        grade
      },
      {
        where: { id: inspectionPlanId }
      }
    );

    // 返回完整记录
    const fullRecord = await InspectionRecord.findByPk(record.id, {
      include: [
        {
          model: InspectionPlan,
          as: 'inspectionPlan'
        },
        {
          model: InspectionRecordItem,
          as: 'items'
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: fullRecord,
      message: '创建检查记录成功'
    });
  });

  /**
   * 更新检查记录
   * PUT /api/inspection-records/:id
   */
  public update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      checkDate,
      checkerName,
      totalScore,
      grade,
      summary,
      suggestions,
      attachments,
      checkerSignature,
      items
    } = req.body;

    const record = await InspectionRecord.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '检查记录不存在'
      });
    }

    // 更新记录
    await record.update({
      checkDate,
      checkerName,
      totalScore,
      grade,
      summary,
      suggestions,
      attachments,
      checkerSignature
    });

    // 更新检查项
    if (items) {
      // 删除旧的检查项
      await InspectionRecordItem.destroy({
        where: { recordId: id }
      });

      // 创建新的检查项
      if (items.length > 0) {
        const itemsToCreate = items.map((item: any, index: number) => ({
          recordId: record.id,
          itemName: item.itemName,
          itemCategory: item.itemCategory,
          status: item.status || InspectionItemStatus.PASS,
          score: item.score,
          maxScore: item.maxScore,
          problemDescription: item.problemDescription,
          photos: item.photos,
          notes: item.notes,
          sortOrder: item.sortOrder !== undefined ? item.sortOrder : index
        }));

        await InspectionRecordItem.bulkCreate(itemsToCreate);
      }
    }

    // 返回更新后的记录
    const updatedRecord = await InspectionRecord.findByPk(id, {
      include: [
        {
          model: InspectionPlan,
          as: 'inspectionPlan'
        },
        {
          model: InspectionRecordItem,
          as: 'items'
        }
      ]
    });

    res.json({
      success: true,
      data: updatedRecord,
      message: '更新检查记录成功'
    });
  });

  /**
   * 删除检查记录
   * DELETE /api/inspection-records/:id
   */
  public delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const record = await InspectionRecord.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '检查记录不存在'
      });
    }

    await record.destroy();

    res.json({
      success: true,
      message: '删除检查记录成功'
    });
  });

  /**
   * 获取检查计划的所有记录
   * GET /api/inspection-records/plan/:planId
   */
  public getByPlan = asyncHandler(async (req: Request, res: Response) => {
    const { planId } = req.params;

    const records = await InspectionRecord.findAll({
      where: { inspectionPlanId: planId },
      include: [
        {
          model: InspectionRecordItem,
          as: 'items'
        }
      ],
      order: [['checkDate', 'DESC']]
    });

    res.json({
      success: true,
      data: records,
      message: '获取检查计划记录成功'
    });
  });
}

export default new InspectionRecordController();

