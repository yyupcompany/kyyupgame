import { Request, Response } from 'express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { validateMarketingCampaign } from '../validations/marketing-campaign.validator';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { SqlHelper } from '../utils/sqlHelper';
import { MarketingCampaignStatistics, CampaignPerformance } from '../services/marketing/interfaces/marketing-campaign-service.interface';

// 定义状态枚举
enum CampaignStatus {
  DRAFT = 0,
  ACTIVE = 1,
  PAUSED = 2,
  COMPLETED = 3,
  CANCELLED = 4
}

/**
 * 营销活动控制器
 * @description 处理营销活动相关的HTTP请求
 */
export class MarketingCampaignController {

  /**
   * 创建营销活动
   * @param req 请求对象
   * @param res 响应对象
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const userData = req.user as { id: number };
      
      const {
        kindergartenId,
        title,
        campaignType,
        startDate,
        endDate,
        targetAudience,
        budget,
        objective,
        description,
        rules,
        rewards,
        coverImage,
        bannerImage,
        status = CampaignStatus.DRAFT,
        remark
      } = req.body;

      // 验证必填字段
      if (!kindergartenId || !title || !campaignType || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '缺少必填字段'
          }
        });
        return;
      }

      // 插入营销活动
      const insertQuery = `
        INSERT INTO ${tenantDb}.marketing_campaigns (
          kindergarten_id, title, campaign_type, start_date, end_date,
          target_audience, budget, objective, description, rules, rewards,
          cover_image, banner_image, participant_count, conversion_count,
          view_count, total_revenue, status, remark, creator_id, updater_id,
          created_at, updated_at
        ) VALUES (
          :kindergartenId, :title, :campaignType, :startDate, :endDate,
          :targetAudience, :budget, :objective, :description, :rules, :rewards,
          :coverImage, :bannerImage, 0, 0, 0, 0, :status, :remark,
          :creatorId, :creatorId, NOW(), NOW()
        )
      `;

      const insertResults = await sequelize.query(insertQuery, {
        replacements: {
          kindergartenId,
          title,
          campaignType,
          startDate,
          endDate,
          targetAudience: targetAudience || null,
          budget: budget || null,
          objective: objective || null,
          description: description || null,
          rules: rules || null,
          rewards: rewards || null,
          coverImage: coverImage || null,
          bannerImage: bannerImage || null,
          status,
          remark: remark || null,
          creatorId: userData.id
        },
        type: QueryTypes.INSERT
      });

      const campaignId = (insertResults[0] as any).insertId || insertResults[0];

      // 查询创建的记录
      const selectQuery = `
        SELECT mc.*, k.name as kindergarten_name
        FROM ${tenantDb}.marketing_campaigns mc
        LEFT JOIN ${tenantDb}.kindergartens k ON mc.kindergarten_id = k.id
        WHERE mc.id = :campaignId
      `;

      const campaignsResults = await sequelize.query(selectQuery, {
        replacements: { campaignId },
        type: QueryTypes.SELECT
      });

      const campaign = campaignsResults[0] as any;

      res.status(201).json({
        success: true,
        data: {
          id: campaign.id,
          kindergartenId: campaign.kindergarten_id,
          title: campaign.title,
          campaignType: campaign.campaign_type,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          targetAudience: campaign.target_audience,
          budget: campaign.budget,
          objective: campaign.objective,
          description: campaign.description,
          rules: campaign.rules,
          rewards: campaign.rewards,
          coverImage: campaign.cover_image,
          bannerImage: campaign.banner_image,
          participantCount: campaign.participant_count,
          conversionCount: campaign.conversion_count,
          viewCount: campaign.view_count,
          totalRevenue: campaign.total_revenue,
          status: campaign.status,
          statusText: this.getStatusText(campaign.status),
          campaignTypeText: this.getCampaignTypeText(campaign.campaign_type),
          remark: campaign.remark,
          creatorId: campaign.creator_id,
          updaterId: campaign.updater_id,
          createdAt: campaign.created_at,
          updatedAt: campaign.updated_at,
          kindergarten: campaign.kindergarten_name ? {
            id: campaign.kindergarten_id,
            name: campaign.kindergarten_name
          } : null
        }
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 获取活动状态文本
   * @param status 状态码
   * @returns 状态文本
   */
  private getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: '草稿',
      1: '进行中',
      2: '已暂停',
      3: '已结束',
      4: '已取消'
    };
    return statusMap[status] || '未知状态';
  }

  /**
   * 获取活动类型文本
   * @param type 类型码
   * @returns 类型文本
   */
  private getCampaignTypeText(type: number): string {
    const typeMap: Record<number, string> = {
      1: '推广活动',
      2: '优惠活动',
      3: '品牌活动',
      4: '招生活动'
    };
    return typeMap[type] || '其他';
  }

  /**
   * 获取单个营销活动
   * @param req 请求对象
   * @param res 响应对象
   */
  async findOne(req: Request, res: Response): Promise<void> {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { id } = req.params;

      const query = `
        SELECT mc.*, k.name as kindergarten_name,
               creator.real_name as creator_name,
               updater.real_name as updater_name
        FROM ${tenantDb}.marketing_campaigns mc
        LEFT JOIN ${tenantDb}.kindergartens k ON mc.kindergarten_id = k.id
        LEFT JOIN ${tenantDb}.users creator ON mc.creator_id = creator.id
        LEFT JOIN ${tenantDb}.users updater ON mc.updater_id = updater.id
        WHERE mc.id = :id AND mc.deleted_at IS NULL
      `;

      const campaigns = await sequelize.query(query, {
        replacements: { id },
        type: QueryTypes.SELECT
      });

      const campaign = campaigns[0] as any;

      if (!campaign) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '营销活动不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: campaign.id,
          kindergartenId: campaign.kindergarten_id,
          title: campaign.title,
          campaignType: campaign.campaign_type,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          targetAudience: campaign.target_audience,
          budget: campaign.budget,
          objective: campaign.objective,
          description: campaign.description,
          rules: campaign.rules,
          rewards: campaign.rewards,
          coverImage: campaign.cover_image,
          bannerImage: campaign.banner_image,
          participantCount: campaign.participant_count,
          conversionCount: campaign.conversion_count,
          viewCount: campaign.view_count,
          totalRevenue: campaign.total_revenue,
          status: campaign.status,
          statusText: this.getStatusText(campaign.status),
          campaignTypeText: this.getCampaignTypeText(campaign.campaign_type),
          remark: campaign.remark,
          creatorId: campaign.creator_id,
          updaterId: campaign.updater_id,
          createdAt: campaign.created_at,
          updatedAt: campaign.updated_at,
          kindergarten: campaign.kindergarten_name ? {
            id: campaign.kindergarten_id,
            name: campaign.kindergarten_name
          } : null,
          creator: campaign.creator_name ? {
            id: campaign.creator_id,
            name: campaign.creator_name
          } : null,
          updater: campaign.updater_name ? {
            id: campaign.updater_id,
            name: campaign.updater_name
          } : null
        }
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 获取营销活动列表
   * @param req 请求对象
   * @param res 响应对象
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, pageSize = 10, ...filters } = req.query;
      const limit = Number(pageSize) || 10;
      const offset = (Number(page) || 1 - 1) * limit;

      // 构建查询条件
      let whereClause = 'mc.deleted_at IS NULL';
      const replacements: Record<string, unknown> = { limit, offset };

      if (filters.kindergartenId) {
        whereClause += ' AND mc.kindergarten_id = :kindergartenId';
        replacements.kindergartenId = filters.kindergartenId;
      }
      if (filters.status !== undefined) {
        whereClause += ' AND mc.status = :status';
        replacements.status = filters.status;
      }
      if (filters.campaignType) {
        whereClause += ' AND mc.campaign_type = :campaignType';
        replacements.campaignType = filters.campaignType;
      }
      if (filters.title) {
        whereClause += ' AND mc.title LIKE :title';
        replacements.title = `%${filters.title}%`;
      }

      // 查询总数
      const countQuery = `
        SELECT COUNT(*) as total
        FROM marketing_campaigns mc
        WHERE ${whereClause}
      `;

      const countResults = await sequelize.query(countQuery, {
        replacements,
        type: QueryTypes.SELECT
      });

      const total = (countResults[0] as any).total;

      // 查询列表数据
      const listQuery = `
        SELECT mc.*, k.name as kindergarten_name
        FROM marketing_campaigns mc
        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id
        WHERE ${whereClause}
        ORDER BY mc.created_at DESC
        LIMIT :limit OFFSET :offset
      `;

      const campaigns = await sequelize.query(listQuery, {
        replacements,
        type: QueryTypes.SELECT
      });

      const formattedCampaigns = (campaigns as any[]).map(campaign => ({
        id: campaign.id,
        kindergartenId: campaign.kindergarten_id,
        title: campaign.title,
        campaignType: campaign.campaign_type,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        targetAudience: campaign.target_audience,
        budget: campaign.budget,
        participantCount: campaign.participant_count,
        conversionCount: campaign.conversion_count,
        viewCount: campaign.view_count,
        totalRevenue: campaign.total_revenue,
        status: campaign.status,
        statusText: this.getStatusText(campaign.status),
        campaignTypeText: this.getCampaignTypeText(campaign.campaign_type),
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at,
        kindergarten: campaign.kindergarten_name ? {
          id: campaign.kindergarten_id,
          name: campaign.kindergarten_name
        } : null
      }));

      res.json({
        success: true,
        data: {
          list: formattedCampaigns,
          pagination: {
            page: Number(page) || 0,
            pageSize: limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 更新营销活动
   * @param req 请求对象
   * @param res 响应对象
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData = req.user as { id: number };

      const {
        kindergartenId,
        title,
        campaignType,
        startDate,
        endDate,
        targetAudience,
        budget,
        objective,
        description,
        rules,
        rewards,
        coverImage,
        bannerImage,
        status,
        remark
      } = req.body;

      // 检查记录是否存在
      const checkQuery = `
        SELECT id FROM marketing_campaigns 
        WHERE id = :id AND deleted_at IS NULL
      `;
      
      const existingResults = await sequelize.query(checkQuery, {
        replacements: { id },
        type: QueryTypes.SELECT
      });
      const existing = existingResults[0];

      if (!existing) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '营销活动不存在'
          }
        });
        return;
      }

      // 构建更新字段
      const updateFields = [];
      const replacements: any = { id, updaterId: userData.id };

      if (kindergartenId !== undefined) {
        updateFields.push('kindergarten_id = :kindergartenId');
        replacements.kindergartenId = kindergartenId;
      }
      if (title !== undefined) {
        updateFields.push('title = :title');
        replacements.title = title;
      }
      if (campaignType !== undefined) {
        updateFields.push('campaign_type = :campaignType');
        replacements.campaignType = campaignType;
      }
      if (startDate !== undefined) {
        updateFields.push('start_date = :startDate');
        replacements.startDate = startDate;
      }
      if (endDate !== undefined) {
        updateFields.push('end_date = :endDate');
        replacements.endDate = endDate;
      }
      if (targetAudience !== undefined) {
        updateFields.push('target_audience = :targetAudience');
        replacements.targetAudience = targetAudience;
      }
      if (budget !== undefined) {
        updateFields.push('budget = :budget');
        replacements.budget = budget;
      }
      if (objective !== undefined) {
        updateFields.push('objective = :objective');
        replacements.objective = objective;
      }
      if (description !== undefined) {
        updateFields.push('description = :description');
        replacements.description = description;
      }
      if (rules !== undefined) {
        updateFields.push('rules = :rules');
        replacements.rules = rules;
      }
      if (rewards !== undefined) {
        updateFields.push('rewards = :rewards');
        replacements.rewards = rewards;
      }
      if (coverImage !== undefined) {
        updateFields.push('cover_image = :coverImage');
        replacements.coverImage = coverImage;
      }
      if (bannerImage !== undefined) {
        updateFields.push('banner_image = :bannerImage');
        replacements.bannerImage = bannerImage;
      }
      if (status !== undefined) {
        updateFields.push('status = :status');
        replacements.status = status;
      }
      if (remark !== undefined) {
        updateFields.push('remark = :remark');
        replacements.remark = remark;
      }

      if (updateFields.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '没有提供要更新的字段'
          }
        });
        return;
      }

      // 执行更新
      const updateQuery = `
        UPDATE marketing_campaigns 
        SET ${updateFields.join(', ')}, updater_id = :updaterId, updated_at = NOW()
        WHERE id = :id
      `;

      await sequelize.query(updateQuery, {
        replacements,
        type: QueryTypes.UPDATE
      });

      // 获取更新后的记录
      const selectQuery = `
        SELECT mc.*, k.name as kindergarten_name
        FROM marketing_campaigns mc
        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id
        WHERE mc.id = :id
      `;

      const campaignsResults = await sequelize.query(selectQuery, {
        replacements: { id },
        type: QueryTypes.SELECT
      });

      const campaign = campaignsResults[0] as any;

      res.json({
        success: true,
        data: {
          id: campaign.id,
          kindergartenId: campaign.kindergarten_id,
          title: campaign.title,
          campaignType: campaign.campaign_type,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          targetAudience: campaign.target_audience,
          budget: campaign.budget,
          objective: campaign.objective,
          description: campaign.description,
          rules: campaign.rules,
          rewards: campaign.rewards,
          coverImage: campaign.cover_image,
          bannerImage: campaign.banner_image,
          participantCount: campaign.participant_count,
          conversionCount: campaign.conversion_count,
          viewCount: campaign.view_count,
          totalRevenue: campaign.total_revenue,
          status: campaign.status,
          statusText: this.getStatusText(campaign.status),
          campaignTypeText: this.getCampaignTypeText(campaign.campaign_type),
          remark: campaign.remark,
          updaterId: campaign.updater_id,
          updatedAt: campaign.updated_at
        }
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 删除营销活动
   * @param req 请求对象
   * @param res 响应对象
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData = req.user as { id: number };

      // 软删除
      const deleteQuery = `
        UPDATE marketing_campaigns 
        SET deleted_at = NOW(), updater_id = :updaterId, updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL
      `;

      const deleteResults = await sequelize.query(deleteQuery, {
        replacements: { id, updaterId: userData.id },
        type: QueryTypes.UPDATE
      });

      if ((deleteResults[1] as any).affectedRows === 0) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '营销活动不存在或已被删除'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '删除营销活动成功'
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 设置活动规则
   * @param req 请求对象
   * @param res 响应对象
   */
  async setRules(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { rules } = req.body;
      const userData = req.user as { id: number };

      const updateQuery = `
        UPDATE marketing_campaigns 
        SET rules = :rules, updater_id = :updaterId, updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL
      `;

      const updateResults = await sequelize.query(updateQuery, {
        replacements: { id, rules, updaterId: userData.id },
        type: QueryTypes.UPDATE
      });

      if ((updateResults[1] as any).affectedRows === 0) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '营销活动不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '设置活动规则成功'
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 获取活动统计
   * @param req 请求对象
   * @param res 响应对象
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          participant_count,
          conversion_count,
          view_count,
          total_revenue,
          CASE 
            WHEN participant_count > 0 THEN ROUND((conversion_count / participant_count) * 100, 2)
            ELSE 0
          END as conversion_rate
        FROM marketing_campaigns
        WHERE id = :id AND deleted_at IS NULL
      `;

      const statsResults = await sequelize.query(query, {
        replacements: { id },
        type: QueryTypes.SELECT
      });

      const result = statsResults[0] as any;

      if (!result) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '营销活动不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          participantCount: result.participant_count,
          conversionCount: result.conversion_count,
          viewCount: result.view_count,
          totalRevenue: result.total_revenue,
          conversionRate: result.conversion_rate
        }
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 获取活动性能数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async getPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // 简化版本：返回基本性能数据
      const query = `
        SELECT 
          participant_count,
          conversion_count,
          view_count,
          total_revenue,
          created_at,
          start_date,
          end_date
        FROM marketing_campaigns
        WHERE id = :id AND deleted_at IS NULL
      `;

      const performanceResults = await sequelize.query(query, {
        replacements: { id },
        type: QueryTypes.SELECT
      });

      const result = performanceResults[0] as any;

      if (!result) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '营销活动不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          participantCount: result.participant_count,
          conversionCount: result.conversion_count,
          viewCount: result.view_count,
          totalRevenue: result.total_revenue,
          startDate: result.start_date,
          endDate: result.end_date,
          createdAt: result.created_at
        }
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 启动活动
   * @param req 请求对象
   * @param res 响应对象
   */
  async launch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData = req.user as { id: number };

      const updateQuery = `
        UPDATE marketing_campaigns 
        SET status = :status, updater_id = :updaterId, updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL AND status = :draftStatus
      `;

      const launchResults = await sequelize.query(updateQuery, {
        replacements: { 
          id, 
          status: CampaignStatus.ACTIVE, 
          draftStatus: CampaignStatus.DRAFT,
          updaterId: userData.id 
        },
        type: QueryTypes.UPDATE
      });

      if ((launchResults[1] as any).affectedRows === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: '只能启动草稿状态的活动'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '启动活动成功'
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 暂停活动
   * @param req 请求对象
   * @param res 响应对象
   */
  async pause(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData = req.user as { id: number };

      const updateQuery = `
        UPDATE marketing_campaigns 
        SET status = :status, updater_id = :updaterId, updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL AND status = :activeStatus
      `;

      const pauseResults = await sequelize.query(updateQuery, {
        replacements: { 
          id, 
          status: CampaignStatus.PAUSED, 
          activeStatus: CampaignStatus.ACTIVE,
          updaterId: userData.id 
        },
        type: QueryTypes.UPDATE
      });

      if ((pauseResults[1] as any).affectedRows === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: '只能暂停进行中的活动'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '暂停活动成功'
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }

  /**
   * 结束活动
   * @param req 请求对象
   * @param res 响应对象
   */
  async end(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData = req.user as { id: number };

      const updateQuery = `
        UPDATE marketing_campaigns 
        SET status = :status, updater_id = :updaterId, updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL AND status IN (:activeStatus, :pausedStatus)
      `;

      const endResults = await sequelize.query(updateQuery, {
        replacements: { 
          id, 
          status: CampaignStatus.COMPLETED, 
          activeStatus: CampaignStatus.ACTIVE,
          pausedStatus: CampaignStatus.PAUSED,
          updaterId: userData.id 
        },
        type: QueryTypes.UPDATE
      });

      if ((endResults[1] as any).affectedRows === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: '只能结束进行中或已暂停的活动'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '结束活动成功'
      });
    } catch (error) {
      const typedError = error as Error;
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: typedError.message
        }
      });
    }
  }
}

// 创建控制器实例
const marketingCampaignController = new MarketingCampaignController();

// 导出控制器方法
export const {
  create,
  findOne,
  findAll,
  update,
  delete: deleteCampaign,
  setRules,
  getStats,
  getPerformance,
  launch,
  pause,
  end
} = marketingCampaignController; 
