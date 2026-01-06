/**
 * 路由-模型自动映射工具
 * 实现路由路径与Sequelize模型的自动绑定
 */

import { ModelStatic, Model } from 'sequelize';
import { TABLE_TO_ROUTE_MAPPING, TABLE_TO_MODEL_MAPPING } from '../config/field-mapping';

// 动态导入所有模型
const models: Record<string, ModelStatic<any>> = {};

// 路由路径到模型的映射缓存
const routeToModelCache: Map<string, ModelStatic<any>> = new Map();
const modelToRouteCache: Map<ModelStatic<any>, string> = new Map();

/**
 * 路由模型映射器
 */
export class RouteModelMapper {
  /**
   * 初始化模型映射
   */
  static async initializeModels(): Promise<void> {
    try {
      // 动态导入所有模型文件
      const modelImports = await Promise.allSettled([
        // 核心用户模型
        import('../models/user.model').then(m => ({ User: m.User })),
        import('../models/role.model').then(m => ({ Role: m.Role })),
        import('../models/permission.model').then(m => ({ Permission: m.Permission })),
        import('../models/user-role.model').then(m => ({ UserRole: m.UserRole })),
        import('../models/role-permission.model').then(m => ({ RolePermission: m.RolePermission })),
        
        // 教育管理模型
        import('../models/student.model').then(m => ({ Student: m.Student })),
        import('../models/teacher.model').then(m => ({ Teacher: m.Teacher })),
        import('../models/parent.model').then(m => ({ Parent: m.Parent })),
        import('../models/class.model').then(m => ({ Class: m.Class })),
        import('../models/parent-student-relation.model').then(m => ({ ParentStudentRelation: m.ParentStudentRelation })),
        
        // 招生管理模型
        import('../models/enrollment-plan.model').then(m => ({ EnrollmentPlan: m.EnrollmentPlan })),
        import('../models/enrollment-application.model').then(m => ({ EnrollmentApplication: m.EnrollmentApplication })),
        import('../models/enrollment-consultation.model').then(m => ({ EnrollmentConsultation: m.EnrollmentConsultation })),
        import('../models/enrollment-task.model').then(m => ({ EnrollmentTask: m.EnrollmentTask })),

        // 活动管理模型
        import('../models/activity.model').then(m => ({ Activity: m.Activity })),
        import('../models/activity-registration.model').then(m => ({ ActivityRegistration: m.ActivityRegistration })),
        import('../models/activity-evaluation.model').then(m => ({ ActivityEvaluation: m.ActivityEvaluation })),
        
        // 营销管理模型
        import('../models/marketing-campaign.model').then(m => ({ MarketingCampaign: m.MarketingCampaign })),
        import('../models/advertisement.model').then(m => ({ Advertisement: m.Advertisement })),

        // AI服务模型
        import('../models/ai-conversation.model').then(m => ({ AIConversation: m.AIConversation })),
        import('../models/ai-message.model').then(m => ({ AIMessage: m.AIMessage })),
        // AIMemory model removed - replaced by six-dimensional memory system
        import('../models/ai-feedback.model').then(m => ({ AIFeedback: m.AIFeedback })),
        // 🚀 AI模型已迁移到统一租户中心
        // import('../models/ai-model-config.model').then(m => ({ AIModelConfig: m.AIModelConfig })),
        // import('../models/ai-model-usage.model').then(m => ({ AIModelUsage: m.AIModelUsage })),

        // 系统管理模型
        import('../models/system-config.model').then(m => ({ SystemConfig: m.SystemConfig })),
        import('../models/system-log.model').then(m => ({ SystemLog: m.SystemLog })),
        import('../models/operation-log.model').then(m => ({ OperationLog: m.OperationLog })),
        import('../models/notification.model').then(m => ({ Notification: m.Notification })),
        import('../models/schedule.model').then(m => ({ Schedule: m.Schedule })),
        import('../models/todo.model').then(m => ({ Todo: m.Todo })),

        // 其他模型
        import('../models/kindergarten.model').then(m => ({ Kindergarten: m.Kindergarten })),
        import('../models/message-template.model').then(m => ({ MessageTemplate: m.MessageTemplate })),
        import('../models/poster-template.model').then(m => ({ PosterTemplate: m.PosterTemplate })),
        import('../models/poster-generation.model').then(m => ({ PosterGeneration: m.PosterGeneration })),
      ]);

      // 处理导入结果
      modelImports.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          Object.assign(models, result.value);
        } else if (result.status === 'rejected') {
          console.warn(`模型导入失败 (${index}):`, result.reason);
        }
      });

      // 构建映射缓存
      this.buildMappingCache();
      
      console.log(`✅ 成功初始化 ${Object.keys(models).length} 个模型`);
    } catch (error) {
      console.error('初始化模型映射失败:', error);
    }
  }

  /**
   * 构建映射缓存
   */
  private static buildMappingCache(): void {
    // 基于TABLE_TO_ROUTE_MAPPING和TABLE_TO_MODEL_MAPPING构建缓存
    Object.entries(TABLE_TO_ROUTE_MAPPING).forEach(([tableName, routePath]) => {
      const modelName = TABLE_TO_MODEL_MAPPING[tableName];
      const model = models[modelName];
      
      if (model) {
        routeToModelCache.set(routePath, model);
        modelToRouteCache.set(model, routePath);
        
        // 同时支持无前缀的路径查找
        const pathWithoutSlash = routePath.substring(1);
        routeToModelCache.set(pathWithoutSlash, model);
      }
    });
    
    console.log(`🗺️ 构建了 ${routeToModelCache.size} 个路由-模型映射`);
  }

  /**
   * 根据路由路径获取对应的模型
   */
  static getModelFromRoute(routePath: string): ModelStatic<any> | null {
    // 清理路径：移除 /api, /v1, /v2 前缀
    const cleanPath = this.cleanRoutePath(routePath);
    
    // 从缓存中查找
    let model = routeToModelCache.get(cleanPath);
    
    if (!model) {
      // 尝试其他变体
      const variants = this.generatePathVariants(cleanPath);
      for (const variant of variants) {
        model = routeToModelCache.get(variant);
        if (model) break;
      }
    }
    
    return model || null;
  }

  /**
   * 根据模型获取对应的路由路径
   */
  static getRouteFromModel(model: ModelStatic<any>): string | null {
    return modelToRouteCache.get(model) || null;
  }

  /**
   * 根据表名获取模型
   */
  static getModelFromTable(tableName: string): ModelStatic<any> | null {
    const modelName = TABLE_TO_MODEL_MAPPING[tableName];
    return models[modelName] || null;
  }

  /**
   * 根据模型名获取模型
   */
  static getModelByName(modelName: string): ModelStatic<any> | null {
    return models[modelName] || null;
  }

  /**
   * 获取所有已注册的模型
   */
  static getAllModels(): Record<string, ModelStatic<any>> {
    return { ...models };
  }

  /**
   * 获取所有路由-模型映射
   */
  static getAllMappings(): Array<{ route: string; model: string; table?: string }> {
    const mappings: Array<{ route: string; model: string; table?: string }> = [];
    
    routeToModelCache.forEach((model, route) => {
      if (route.startsWith('/')) {
        // 查找对应的表名
        const tableName = Object.entries(TABLE_TO_MODEL_MAPPING)
          .find(([table, modelName]) => models[modelName] === model)?.[0];
        
        mappings.push({
          route,
          model: model.name,
          table: tableName
        });
      }
    });
    
    return mappings;
  }

  /**
   * 清理路由路径
   */
  private static cleanRoutePath(routePath: string): string {
    return routePath
      .replace(/^\/api(\/v[12])?/, '') // 移除 /api, /api/v1, /api/v2
      .replace(/\/:[^\/]+/g, '') // 移除参数部分，如 /:id
      .replace(/\/$/, '') // 移除尾部斜杠
      || '/';
  }

  /**
   * 生成路径变体用于匹配
   */
  private static generatePathVariants(path: string): string[] {
    const variants: string[] = [];
    
    if (path === '' || path === '/') {
      return variants;
    }
    
    const basePath = path.startsWith('/') ? path.substring(1) : path;
    
    variants.push(
      `/${basePath}`,           // /students
      basePath,                 // students
      `/${basePath}s`,          // /studentss (处理复数问题)
      basePath + 's',           // studentss
    );
    
    // 处理单复数转换
    if (basePath.endsWith('s')) {
      const singular = basePath.slice(0, -1);
      variants.push(
        `/${singular}`,         // /student
        singular,               // student
      );
    } else {
      const plural = basePath + 's';
      variants.push(
        `/${plural}`,           // /students
        plural,                 // students
      );
    }
    
    // 处理连字符和下划线
    if (basePath.includes('-')) {
      const withUnderscore = basePath.replace(/-/g, '_');
      variants.push(
        `/${withUnderscore}`,
        withUnderscore
      );
    }
    
    if (basePath.includes('_')) {
      const withHyphen = basePath.replace(/_/g, '-');
      variants.push(
        `/${withHyphen}`,
        withHyphen
      );
    }
    
    return variants;
  }

  /**
   * 注册新的模型映射
   */
  static registerModel(modelName: string, model: ModelStatic<any>, routePath?: string, tableName?: string): void {
    models[modelName] = model;
    
    if (routePath) {
      routeToModelCache.set(routePath, model);
      modelToRouteCache.set(model, routePath);
    }
    
    if (tableName && routePath) {
      TABLE_TO_MODEL_MAPPING[tableName] = modelName;
      TABLE_TO_ROUTE_MAPPING[tableName] = routePath;
    }
    
    console.log(`📝 注册新模型映射: ${modelName} -> ${routePath || '未指定路由'}`);
  }

  /**
   * 检查路由是否有对应的模型
   */
  static hasModelForRoute(routePath: string): boolean {
    return this.getModelFromRoute(routePath) !== null;
  }

  /**
   * 检查模型是否有对应的路由
   */
  static hasRouteForModel(model: ModelStatic<any>): boolean {
    return this.getRouteFromModel(model) !== null;
  }

  /**
   * 获取映射统计信息
   */
  static getMappingStats(): {
    totalModels: number;
    totalMappings: number;
    unmappedModels: string[];
    duplicateRoutes: string[];
  } {
    const totalModels = Object.keys(models).length;
    const totalMappings = routeToModelCache.size;
    
    // 查找未映射的模型
    const unmappedModels = Object.keys(models).filter(modelName => {
      const model = models[modelName];
      return !this.hasRouteForModel(model);
    });
    
    // 查找重复的路由
    const routeGroups = new Map<string, string[]>();
    routeToModelCache.forEach((model, route) => {
      if (!routeGroups.has(route)) {
        routeGroups.set(route, []);
      }
      routeGroups.get(route)!.push(model.name);
    });
    
    const duplicateRoutes = Array.from(routeGroups.entries())
      .filter(([route, models]) => models.length > 1)
      .map(([route]) => route);
    
    return {
      totalModels,
      totalMappings,
      unmappedModels,
      duplicateRoutes
    };
  }
}

// 默认导出映射器类
export default RouteModelMapper;

// 便捷函数导出
export const getModelFromRoute = (routePath: string) => RouteModelMapper.getModelFromRoute(routePath);
export const getRouteFromModel = (model: ModelStatic<any>) => RouteModelMapper.getRouteFromModel(model);
export const getModelFromTable = (tableName: string) => RouteModelMapper.getModelFromTable(tableName);
export const getModelByName = (modelName: string) => RouteModelMapper.getModelByName(modelName);