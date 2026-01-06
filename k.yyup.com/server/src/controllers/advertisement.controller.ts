import { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { SqlHelper } from '../utils/sqlHelper';
const Joi = require('joi');

/**
 * 广告状态枚举
 */
enum AdvertisementStatus {
  DRAFT = 0,
  ACTIVE = 1,
  PAUSED = 2,
  ENDED = 3,
  CANCELLED = 4
}

/**
 * 广告类型枚举
 */
enum AdvertisementType {
  IMAGE = 1,
  VIDEO = 2,
  TEXT = 3,
  BANNER = 4,
  POPUP = 5,
  FEED = 6,
  SEARCH = 7,
  OTHER = 8
}

/**
 * 广告统计数据接口
 */
interface AdvertisementStat {
  total_value?: number;
  [key: string]: any;
}

/**
 * 广告控制器
 * @description 处理广告相关的HTTP请求
 */
export class AdvertisementController {
  /**
   * 创建广告
   * @param req 请求对象
   * @param res 响应对象
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const userId = req.user?.id;
      const {
        kindergartenId = 1,
        campaignId,
        title,
        adType = 1,
        type, // 兼容测试数据中的type字段
        platform,
        position,
        targetAudience,
        content,
        imageUrl,
        videoUrl,
        landingPage,
        startDate,
        endDate,
        budget,
        status = AdvertisementStatus.DRAFT,
        remark
      } = req.body;

      // 处理字段映射
      const finalAdType = adType || (type === 'banner' ? AdvertisementType.BANNER : 1);
      const finalStartDate = startDate || new Date().toISOString().split('T')[0];
      const finalEndDate = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const result = await sequelize.query(`
        INSERT INTO advertisements (
          kindergarten_id, title, ad_type, platform, start_date, end_date, 
          status, creator_id, updater_id, created_at, updated_at
        ) VALUES (
          :kindergartenId, :title, :adType, :platform, :startDate, :endDate,
          :status, :userId, :userId, NOW(), NOW()
        )
      `, {
        replacements: {
          kindergartenId, title, adType: finalAdType, platform,
          startDate: finalStartDate, endDate: finalEndDate, status, userId
        },
        type: QueryTypes.INSERT
      });

      const insertId = Array.isArray(result) && result.length > 0 ? 
        (result[0] as any).insertId || (result[0] as any) : null;

      res.json({
        success: true,
        message: '创建广告成功',
        data: {
          id: insertId,
          title,
          adType: finalAdType,
          platform,
          status,
          createTime: new Date()
        }
      });
    } catch (error) {
      console.error('创建广告失败:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('错误详情:', errorMessage);
      console.error('错误堆栈:', errorStack);
      res.status(500).json({ 
        success: false, 
        message: '创建广告失败',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }

  /**
   * 获取广告列表
   * @param req 请求对象
   * @param res 响应对象
   */
  async findAll(req: Request, res: Response): Promise<void> {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const { page = 1, limit = 10 } = req.query;
      const offset = ((Number(page) - 1) || 0) * Number(limit) || 0;

      const advertisements = await sequelize.query(`
        SELECT a.*, k.name as kindergarten_name
        FROM advertisements a
        LEFT JOIN kindergartens k ON a.kindergarten_id = k.id
        WHERE a.deleted_at IS NULL
        ORDER BY a.created_at DESC
        LIMIT :limit OFFSET :offset
      `, {
        replacements: { limit: Number(limit) || 0, offset },
        type: QueryTypes.SELECT
      });

      const totalResults = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM advertisements a
        WHERE a.deleted_at IS NULL
      `, {
        type: QueryTypes.SELECT
      }) as any;
      const total = (totalResults[0] as any).total;

      res.json({
        success: true,
        message: '获取广告列表成功',
        data: {
          items: advertisements,
          page: Number(page) || 0,
          limit: Number(limit) || 0,
          total: Number(total) || 0,
          totalPages: Math.ceil(Number(total) || 0 / Number(limit) || 0)
        }
      });
    } catch (error) {
      console.error('获取广告列表失败:', error);
      res.status(500).json({ success: false, message: '获取广告列表失败' });
    }
  }

  /**
   * 获取单个广告详情
   * @param req 请求对象
   * @param res 响应对象
   */
  async findOne(req: Request, res: Response): Promise<void> {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const { id } = req.params;

      const advertisements = await sequelize.query(`
        SELECT a.*, k.name as kindergarten_name
        FROM advertisements a
        LEFT JOIN kindergartens k ON a.kindergarten_id = k.id
        WHERE a.id = :id AND a.deleted_at IS NULL
      `, {
        replacements: { id: Number(id) || 0 },
        type: QueryTypes.SELECT
      });
      const advertisement = advertisements[0];

      if (!advertisement) {
        res.status(404).json({ success: false, message: '广告不存在' });
        return;
      }

      res.json({
        success: true,
        message: '获取广告详情成功',
        data: advertisement
      });
    } catch (error) {
      console.error('获取广告详情失败:', error);
      res.status(500).json({ success: false, message: '获取广告详情失败' });
    }
  }

  /**
   * 更新广告
   * @param req 请求对象
   * @param res 响应对象
   */
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const { id } = req.params;
      const userId = req.user?.id;
      const {
        title,
        adType,
        type, // 兼容测试数据中的type字段
        platform,
        position,
        targetAudience,
        content,
        imageUrl,
        videoUrl,
        landingPage,
        startDate,
        endDate,
        budget,
        status,
        remark
      } = req.body;
      
      console.log('广告更新请求参数:', req.body);
      
      // 处理字段映射
      const finalAdType = adType || (type === 'banner' ? AdvertisementType.BANNER : undefined);
      
      // 处理状态映射
      let finalStatus = status;
      if (typeof status === 'string') {
        const statusMap: Record<string, number> = {
          'draft': AdvertisementStatus.DRAFT,
          'active': AdvertisementStatus.ACTIVE,
          'paused': AdvertisementStatus.PAUSED,
          'ended': AdvertisementStatus.ENDED,
          'cancelled': AdvertisementStatus.CANCELLED
        };
        finalStatus = statusMap[status.toLowerCase()] || undefined;
      }

      // 创建替换参数对象，只包含实际提供的字段
      const replacements: any = { id: Number(id) || 0, userId };
      if (title !== undefined) replacements.title = title;
      if (finalAdType !== undefined) replacements.adType = finalAdType;
      if (platform !== undefined) replacements.platform = platform;
      if (position !== undefined) replacements.position = position;
      if (targetAudience !== undefined) replacements.targetAudience = targetAudience;
      if (content !== undefined) replacements.content = content;
      if (imageUrl !== undefined) replacements.imageUrl = imageUrl;
      if (videoUrl !== undefined) replacements.videoUrl = videoUrl;
      if (landingPage !== undefined) replacements.landingPage = landingPage;
      if (startDate !== undefined) replacements.startDate = startDate;
      if (endDate !== undefined) replacements.endDate = endDate;
      if (budget !== undefined) replacements.budget = budget;
      if (finalStatus !== undefined) replacements.status = finalStatus;
      if (remark !== undefined) replacements.remark = remark;

      console.log('广告更新替换参数:', replacements);

      // 构建动态SET子句
      const setClause = Object.keys(replacements)
        .filter(key => key !== 'id' && key !== 'userId')
        .map(key => {
          const columnName = key === 'adType' ? 'ad_type' : 
                            key === 'imageUrl' ? 'image_url' :
                            key === 'videoUrl' ? 'video_url' :
                            key === 'landingPage' ? 'landing_page' :
                            key === 'targetAudience' ? 'target_audience' :
                            key === 'startDate' ? 'start_date' :
                            key === 'endDate' ? 'end_date' :
                            key;
          return `${columnName.replace(/([A-Z])/g, '_$1').toLowerCase()} = :${key}`;
        })
        .concat(['updater_id = :userId', 'updated_at = NOW()'])
        .join(', ');

      const query = `
        UPDATE advertisements 
        SET ${setClause}
        WHERE id = :id AND deleted_at IS NULL
      `;

      console.log('广告更新SQL:', query);

      await sequelize.query(query, {
        replacements,
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '更新广告成功',
        data: {
          id: Number(id) || 0,
          updateTime: new Date()
        }
      });
    } catch (error) {
      console.error('更新广告失败:', error);
      res.status(500).json({ success: false, message: '更新广告失败' });
    }
  };

  /**
   * 删除广告
   * @param req 请求对象
   * @param res 响应对象
   */
  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const { id } = req.params;

      await sequelize.query(`
        UPDATE advertisements 
        SET deleted_at = NOW()
        WHERE id = :id AND deleted_at IS NULL
      `, {
        replacements: { id: Number(id) || 0 },
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '删除广告成功',
        data: {
          id: Number(id) || 0
        }
      });
    } catch (error) {
      console.error('删除广告失败:', error);
      res.status(500).json({ success: false, message: '删除广告失败' });
    }
  };

  /**
   * 获取广告统计数据
   * @param req 请求对象
   * @param res 响应对象
   */
  public getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const { id } = req.params;

      const statsResults = await sequelize.query(`
        SELECT 
          impressions,
          clicks,
          conversions,
          spent,
          budget,
          CASE WHEN impressions > 0 THEN ROUND(clicks / impressions * 100, 2) ELSE 0 END as ctr,
          CASE WHEN clicks > 0 THEN ROUND(conversions / clicks * 100, 2) ELSE 0 END as conversion_rate,
          CASE WHEN clicks > 0 THEN ROUND(spent / clicks, 2) ELSE 0 END as cost_per_click,
          CASE WHEN conversions > 0 THEN ROUND(spent / conversions, 2) ELSE 0 END as cost_per_conversion
        FROM advertisements 
        WHERE id = :id AND deleted_at IS NULL
      `, {
        replacements: { id: Number(id) || 0 },
        type: QueryTypes.SELECT
      }) as any;
      const stats = statsResults[0];

      if (!stats) {
        res.status(404).json({ success: false, message: '广告不存在' });
        return;
      }

      res.json({
        success: true,
        message: '获取广告统计数据成功',
        data: stats
      });
    } catch (error) {
      console.error('获取广告统计数据失败:', error);
      res.status(500).json({ success: false, message: '获取广告统计数据失败' });
    }
  };

  /**
   * 获取全部广告统计数据
   * @param req 请求对象
   * @param res 响应对象
   */
  public getAllStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const statsResults = await sequelize.query(`
        SELECT 
          COUNT(*) as total_ads,
          SUM(COALESCE(impressions, 0)) as total_impressions,
          SUM(COALESCE(clicks, 0)) as total_clicks,
          SUM(COALESCE(conversions, 0)) as total_conversions,
          SUM(COALESCE(spent, 0)) as total_spent,
          SUM(COALESCE(budget, 0)) as total_budget,
          CASE WHEN SUM(COALESCE(impressions, 0)) > 0 THEN ROUND(SUM(COALESCE(clicks, 0)) / SUM(COALESCE(impressions, 0)) * 100, 2) ELSE 0 END as avg_ctr,
          CASE WHEN SUM(COALESCE(clicks, 0)) > 0 THEN ROUND(SUM(COALESCE(conversions, 0)) / SUM(COALESCE(clicks, 0)) * 100, 2) ELSE 0 END as avg_conversion_rate,
          CASE WHEN SUM(COALESCE(clicks, 0)) > 0 THEN ROUND(SUM(COALESCE(spent, 0)) / SUM(COALESCE(clicks, 0)), 2) ELSE 0 END as avg_cost_per_click,
          CASE WHEN SUM(COALESCE(conversions, 0)) > 0 THEN ROUND(SUM(COALESCE(spent, 0)) / SUM(COALESCE(conversions, 0)), 2) ELSE 0 END as avg_cost_per_conversion
        FROM advertisements 
        WHERE deleted_at IS NULL
      `, {
        type: QueryTypes.SELECT
      }) as any;
      const stats = statsResults[0];

      res.json({
        success: true,
        message: '获取全部广告统计数据成功',
        data: stats
      });
    } catch (error) {
      console.error('获取全部广告统计数据失败:', error);
      res.status(500).json({ success: false, message: '获取全部广告统计数据失败' });
    }
  };

  /**
   * 按类型获取广告
   * @param req 请求对象
   * @param res 响应对象
   */
  async findByType(req: Request, res: Response): Promise<void> {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const { type } = req.params;

      // 处理类型映射，支持字符串类型
      let adType = Number(type) || 0;
      if (isNaN(adType)) {
        // 如果是字符串类型名称，进行映射
        const typeMap: Record<string, number> = {
          'banner': AdvertisementType.BANNER,
          'image': AdvertisementType.IMAGE,
          'video': AdvertisementType.VIDEO,
          'text': AdvertisementType.TEXT,
          'popup': AdvertisementType.POPUP,
          'feed': AdvertisementType.FEED,
          'search': AdvertisementType.SEARCH,
          'other': AdvertisementType.OTHER
        };
        adType = typeMap[String(type).toLowerCase()] || 1;
      }

      console.log('按类型获取广告，类型:', type, '映射后类型:', adType);

      const advertisements = await sequelize.query(`
        SELECT a.*, k.name as kindergarten_name
        FROM advertisements a
        LEFT JOIN kindergartens k ON a.kindergarten_id = k.id
        WHERE a.ad_type = :type AND a.deleted_at IS NULL
        ORDER BY a.created_at DESC
      `, {
        replacements: { type: adType },
        type: QueryTypes.SELECT
      });

      res.json({
        success: true,
        message: '按类型获取广告成功',
        data: {
          type: Number(type) || 0,
          items: advertisements,
          total: advertisements.length
        }
      });
    } catch (error) {
      console.error('按类型获取广告失败:', error);
      res.status(500).json({ success: false, message: '按类型获取广告失败' });
    }
  }

  /**
   * 按状态获取广告
   * @param req 请求对象
   * @param res 响应对象
   */
  async findByStatus(req: Request, res: Response): Promise<void> {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const { status } = req.params;

      // 处理状态映射，支持字符串状态
      let adStatus = Number(status) || 0;
      if (isNaN(adStatus)) {
        // 如果是字符串状态名称，进行映射
        const statusMap: Record<string, number> = {
          'draft': AdvertisementStatus.DRAFT,
          'active': AdvertisementStatus.ACTIVE,
          'paused': AdvertisementStatus.PAUSED,
          'ended': AdvertisementStatus.ENDED,
          'cancelled': AdvertisementStatus.CANCELLED
        };
        adStatus = statusMap[String(status).toLowerCase()] || 0;
      }
      
      console.log('按状态获取广告，状态:', status, '映射后状态:', adStatus);

      // 特殊处理banner和active等字符串值
      if (status === 'banner') {
        req.params.type = 'banner';
        return this.findByType(req, res);
      }

      const advertisements = await sequelize.query(`
        SELECT a.*, k.name as kindergarten_name
        FROM advertisements a
        LEFT JOIN kindergartens k ON a.kindergarten_id = k.id
        WHERE a.status = :status AND a.deleted_at IS NULL
        ORDER BY a.created_at DESC
      `, {
        replacements: { status: adStatus },
        type: QueryTypes.SELECT
      });

      res.json({
        success: true,
        message: '按状态获取广告成功',
        data: {
          status: Number(status) || 0,
          items: advertisements,
          total: advertisements.length
        }
      });
    } catch (error) {
      console.error('按状态获取广告失败:', error);
      res.status(500).json({ success: false, message: '按状态获取广告失败' });
    }
  }

  /**
   * 暂停广告
   * @param req 请求对象
   * @param res 响应对象
   */
  async pauseAdvertisement(req: Request, res: Response): Promise<void> {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const { id } = req.params;

      await sequelize.query(`
        UPDATE advertisements 
        SET status = :pausedStatus, updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL
      `, {
        replacements: { 
          id: Number(id) || 0, 
          pausedStatus: AdvertisementStatus.PAUSED 
        },
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '暂停广告成功',
        data: {
          id: Number(id) || 0,
          status: AdvertisementStatus.PAUSED
        }
      });
    } catch (error) {
      console.error('暂停广告失败:', error);
      res.status(500).json({ success: false, message: '暂停广告失败' });
    }
  }

  /**
   * 恢复广告
   * @param req 请求对象
   * @param res 响应对象
   */
  async resumeAdvertisement(req: Request, res: Response): Promise<void> {
    try {
      // 使用从 init.ts 导入的 sequelize 实例
      const { id } = req.params;

      await sequelize.query(`
        UPDATE advertisements 
        SET status = :activeStatus, updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL
      `, {
        replacements: { 
          id: Number(id) || 0, 
          activeStatus: AdvertisementStatus.ACTIVE 
        },
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '恢复广告成功',
        data: {
          id: Number(id) || 0,
          status: AdvertisementStatus.ACTIVE
        }
      });
    } catch (error) {
      console.error('恢复广告失败:', error);
      res.status(500).json({ success: false, message: '恢复广告失败' });
    }
  }
}

// 创建控制器实例
const advertisementController = new AdvertisementController();

// 导出控制器方法
export const createAdvertisement = advertisementController.create.bind(advertisementController);
export const getAdvertisements = advertisementController.findAll.bind(advertisementController);
export const getAdvertisement = advertisementController.findOne.bind(advertisementController);
export const updateAdvertisement = advertisementController.update.bind(advertisementController);
export const deleteAdvertisement = advertisementController.delete.bind(advertisementController);
export const getAdvertisementStatistics = advertisementController.getStatistics.bind(advertisementController);
export const getAllAdvertisementStatistics = advertisementController.getAllStatistics.bind(advertisementController);
export const getAdvertisementsByType = advertisementController.findByType.bind(advertisementController);
export const getAdvertisementsByStatus = advertisementController.findByStatus.bind(advertisementController);
export const pauseAdvertisement = advertisementController.pauseAdvertisement.bind(advertisementController);
export const resumeAdvertisement = advertisementController.resumeAdvertisement.bind(advertisementController);