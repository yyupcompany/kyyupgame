import { Request, Response } from 'express';
import { Kindergarten } from '../models/kindergarten.model';
import { KindergartenCompletenessService } from '../services/kindergarten-completeness.service';

/**
 * 幼儿园信息完整度控制器
 */
export class KindergartenCompletenessController {
  
  /**
   * 获取当前幼儿园的信息完整度
   * GET /api/kindergarten/completeness
   */
  static async getCompleteness(req: Request, res: Response) {
    try {
      // 从用户信息中获取幼儿园ID
      const kindergartenId = (req as any).user?.kindergartenId;
      
      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '未找到幼儿园信息'
          }
        });
      }
      
      // 查询幼儿园信息
      const kindergarten = await Kindergarten.findByPk(kindergartenId);
      
      if (!kindergarten) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '幼儿园不存在'
          }
        });
      }
      
      // 计算完整度
      const completeness = KindergartenCompletenessService.calculateCompleteness(kindergarten);
      
      // 获取缺失字段的友好标签
      const missingRequiredLabels = KindergartenCompletenessService.getMissingFieldsLabels(
        completeness.missingRequired
      );
      const missingRecommendedLabels = KindergartenCompletenessService.getMissingFieldsLabels(
        completeness.missingRecommended
      );
      
      // 更新数据库中的完整度字段
      await kindergarten.update({
        infoCompleteness: completeness.score,
        infoLastUpdatedAt: new Date()
      });
      
      return res.json({
        success: true,
        data: {
          score: completeness.score,
          level: completeness.level,
          levelDescription: KindergartenCompletenessService.getLevelDescription(completeness.level),
          missingRequired: completeness.missingRequired,
          missingRequiredLabels,
          missingRecommended: completeness.missingRecommended,
          missingRecommendedLabels,
          canUseAdvancedFeatures: completeness.canUseAdvancedFeatures,
          message: completeness.message
        }
      });
    } catch (error: any) {
      console.error('获取信息完整度失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取信息完整度失败',
          details: error.message
        }
      });
    }
  }
  
  /**
   * 获取缺失字段列表
   * GET /api/kindergarten/missing-fields
   */
  static async getMissingFields(req: Request, res: Response) {
    try {
      const kindergartenId = (req as any).user?.kindergartenId;
      
      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '未找到幼儿园信息'
          }
        });
      }
      
      const kindergarten = await Kindergarten.findByPk(kindergartenId);
      
      if (!kindergarten) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '幼儿园不存在'
          }
        });
      }
      
      const completeness = KindergartenCompletenessService.calculateCompleteness(kindergarten);
      
      // 构建缺失字段详情
      const requiredFields = KindergartenCompletenessService.getRequiredFields();
      const recommendedFields = KindergartenCompletenessService.getRecommendedFields();
      
      const missingRequiredDetails = completeness.missingRequired.map(fieldName => {
        const field = requiredFields.find(f => f.name === fieldName);
        return {
          name: fieldName,
          label: field?.label || fieldName,
          type: 'required'
        };
      });
      
      const missingRecommendedDetails = completeness.missingRecommended.map(fieldName => {
        const field = recommendedFields.find(f => f.name === fieldName);
        return {
          name: fieldName,
          label: field?.label || fieldName,
          type: 'recommended'
        };
      });
      
      return res.json({
        success: true,
        data: {
          missingRequired: missingRequiredDetails,
          missingRecommended: missingRecommendedDetails,
          totalMissing: missingRequiredDetails.length + missingRecommendedDetails.length
        }
      });
    } catch (error: any) {
      console.error('获取缺失字段失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取缺失字段失败',
          details: error.message
        }
      });
    }
  }
  
  /**
   * 批量更新基础信息
   * PUT /api/kindergarten/base-info/batch
   */
  static async batchUpdateBaseInfo(req: Request, res: Response) {
    try {
      const kindergartenId = (req as any).user?.kindergartenId;
      
      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '未找到幼儿园信息'
          }
        });
      }
      
      const kindergarten = await Kindergarten.findByPk(kindergartenId);
      
      if (!kindergarten) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '幼儿园不存在'
          }
        });
      }
      
      // 获取要更新的字段
      const updateData = req.body;
      
      // 过滤掉不允许更新的字段
      const allowedFields = [
        ...KindergartenCompletenessService.getRequiredFields().map(f => f.name),
        ...KindergartenCompletenessService.getRecommendedFields().map(f => f.name),
        ...KindergartenCompletenessService.getOptionalFields().map(f => f.name)
      ];
      
      const filteredData: any = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });
      
      // 更新幼儿园信息
      await kindergarten.update(filteredData);
      
      // 重新计算完整度
      const updatedKindergarten = await Kindergarten.findByPk(kindergartenId);
      const completeness = KindergartenCompletenessService.calculateCompleteness(updatedKindergarten!);
      
      // 更新完整度字段
      await updatedKindergarten!.update({
        infoCompleteness: completeness.score,
        infoLastUpdatedAt: new Date()
      });
      
      return res.json({
        success: true,
        data: {
          updated: true,
          updatedFields: Object.keys(filteredData),
          completeness: {
            score: completeness.score,
            level: completeness.level,
            canUseAdvancedFeatures: completeness.canUseAdvancedFeatures,
            message: completeness.message
          }
        }
      });
    } catch (error: any) {
      console.error('批量更新基础信息失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '批量更新基础信息失败',
          details: error.message
        }
      });
    }
  }
  
  /**
   * 手动计算并更新完整度
   * POST /api/kindergarten/calculate-completeness
   */
  static async calculateCompleteness(req: Request, res: Response) {
    try {
      const kindergartenId = (req as any).user?.kindergartenId;
      
      if (!kindergartenId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '未找到幼儿园信息'
          }
        });
      }
      
      const kindergarten = await Kindergarten.findByPk(kindergartenId);
      
      if (!kindergarten) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '幼儿园不存在'
          }
        });
      }
      
      const completeness = KindergartenCompletenessService.calculateCompleteness(kindergarten);
      
      await kindergarten.update({
        infoCompleteness: completeness.score,
        infoLastUpdatedAt: new Date()
      });
      
      return res.json({
        success: true,
        data: {
          score: completeness.score,
          level: completeness.level,
          message: '完整度计算成功'
        }
      });
    } catch (error: any) {
      console.error('计算完整度失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '计算完整度失败',
          details: error.message
        }
      });
    }
  }
  
  /**
   * 获取字段配置
   * GET /api/kindergarten/field-config
   */
  static async getFieldConfig(req: Request, res: Response) {
    try {
      return res.json({
        success: true,
        data: {
          required: KindergartenCompletenessService.getRequiredFields(),
          recommended: KindergartenCompletenessService.getRecommendedFields(),
          optional: KindergartenCompletenessService.getOptionalFields()
        }
      });
    } catch (error: any) {
      console.error('获取字段配置失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取字段配置失败',
          details: error.message
        }
      });
    }
  }
}

