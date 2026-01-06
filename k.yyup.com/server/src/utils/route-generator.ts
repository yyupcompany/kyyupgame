/**
 * 通用路由生成器
 * 基于 CRUD 工厂自动生成标准化的路由
 */

import { Router } from 'express';
import { ModelStatic } from 'sequelize';
import { crudFactory, CRUDOptions } from '../middlewares/crud-factory.middleware';
import { verifyToken } from '../middlewares/auth.middleware';
import { RouteModelMapper } from './route-model-mapper';
import { getRoutePathByTable, getModelNameByTable } from '../config/field-mapping';

// 路由生成配置
export interface RouteGeneratorConfig {
  tableName: string;
  routePath?: string;
  model?: ModelStatic<any>;
  
  // CRUD 操作启用控制
  enableCreate?: boolean;
  enableRead?: boolean;
  enableUpdate?: boolean;
  enableDelete?: boolean;
  enableList?: boolean;
  
  // 字段配置
  searchFields?: string[];
  sortFields?: string[];
  excludeFields?: string[];
  includeRelations?: any[];
  
  // 认证和权限
  requireAuth?: boolean;
  permissions?: {
    create?: string;
    read?: string;
    update?: string;
    delete?: string;
    list?: string;
  };
  
  // 自定义钩子
  hooks?: {
    beforeCreate?: (req: any, data?: any) => Promise<any>;
    afterCreate?: (req: any, result: any) => Promise<any>;
    beforeUpdate?: (req: any, data?: any) => Promise<any>;
    afterUpdate?: (req: any, result: any) => Promise<any>;
    beforeDelete?: (req: any) => Promise<any>;
    afterDelete?: (req: any, result: any) => Promise<any>;
  };
  
  // 自定义验证
  validators?: {
    create?: (req: any) => Promise<string | null>;
    update?: (req: any) => Promise<string | null>;
  };
}

/**
 * 路由生成器类
 */
export class RouteGenerator {
  
  /**
   * 为指定表生成完整的 CRUD 路由
   */
  static generateCRUDRoutes(config: RouteGeneratorConfig): Router {
    const router = Router();
    const {
      tableName,
      routePath,
      enableCreate = true,
      enableRead = true,
      enableUpdate = true,
      enableDelete = true,
      enableList = true,
      requireAuth = true,
      searchFields = ['name', 'title', 'description'],
      sortFields = ['id', 'createdAt', 'updatedAt', 'name'],
      excludeFields = ['password', 'token', 'secret'],
      includeRelations = [],
      permissions = {},
      hooks = {},
      validators = {}
    } = config;

    // 添加认证中间件
    if (requireAuth) {
      router.use(verifyToken);
    }

    // 获取模型
    const model = config.model || RouteModelMapper.getModelFromTable(tableName);
    const modelName = getModelNameByTable(tableName);
    const basePath = routePath || getRoutePathByTable(tableName);

    // 生成 Swagger 文档注释
    const swaggerTag = modelName;

    if (!model) {
      console.warn(`⚠️ 未找到表 ${tableName} 对应的模型，跳过路由生成`);
      return router;
    }

    // 1. GET / - 列表查询
    if (enableList) {
      /**
       * @swagger
       * ${basePath}:
       *   get:
       *     summary: 获取${tableName}列表
       *     tags: [${swaggerTag}]
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
       *         name: search
       *         schema:
       *           type: string
       *         description: 搜索关键词
       *       - in: query
       *         name: sort
       *         schema:
       *           type: string
       *           default: id
       *         description: 排序字段
       *       - in: query
       *         name: order
       *         schema:
       *           type: string
       *           enum: [ASC, DESC]
       *           default: ASC
       *         description: 排序方向
       *     responses:
       *       200:
       *         description: 查询成功
       */
      router.get('/', crudFactory.list({
        model,
        searchFields,
        sortFields,
        include: includeRelations,
        exclude: excludeFields,
        requirePermission: permissions.list,
        afterHook: hooks.afterCreate
      }));
    }

    // 2. POST / - 创建记录
    if (enableCreate) {
      /**
       * @swagger
       * ${basePath}:
       *   post:
       *     summary: 创建${tableName}
       *     tags: [${swaggerTag}]
       *     security:
       *       - bearerAuth: []
       *     requestBody:
       *       required: true
       *       content:
       *         application/json:
       *           schema:
       *             type: object
       *     responses:
       *       200:
       *         description: 创建成功
       */
      router.post('/', crudFactory.create({
        model,
        exclude: excludeFields,
        requirePermission: permissions.create,
        beforeHook: hooks.beforeCreate,
        afterHook: hooks.afterCreate,
        customValidation: validators.create
      }));
    }

    // 3. GET /:id - 获取单条记录
    if (enableRead) {
      /**
       * @swagger
       * ${basePath}/{id}:
       *   get:
       *     summary: 获取${tableName}详情
       *     tags: [${swaggerTag}]
       *     security:
       *       - bearerAuth: []
       *     parameters:
       *       - in: path
       *         name: id
       *         required: true
       *         schema:
       *           type: integer
       *     responses:
       *       200:
       *         description: 查询成功
       */
      router.get('/:id', crudFactory.read({
        model,
        include: includeRelations,
        requirePermission: permissions.read
      }));
    }

    // 4. PUT /:id - 更新记录
    if (enableUpdate) {
      /**
       * @swagger
       * ${basePath}/{id}:
       *   put:
       *     summary: 更新${tableName}
       *     tags: [${swaggerTag}]
       *     security:
       *       - bearerAuth: []
       *     parameters:
       *       - in: path
       *         name: id
       *         required: true
       *         schema:
       *           type: integer
       *     requestBody:
       *       required: true
       *       content:
       *         application/json:
       *           schema:
       *             type: object
       *     responses:
       *       200:
       *         description: 更新成功
       */
      router.put('/:id', crudFactory.update({
        model,
        exclude: excludeFields,
        include: includeRelations,
        requirePermission: permissions.update,
        beforeHook: hooks.beforeUpdate,
        afterHook: hooks.afterUpdate,
        customValidation: validators.update
      }));
    }

    // 5. DELETE /:id - 删除记录
    if (enableDelete) {
      /**
       * @swagger
       * ${basePath}/{id}:
       *   delete:
       *     summary: 删除${tableName}
       *     tags: [${swaggerTag}]
       *     security:
       *       - bearerAuth: []
       *     parameters:
       *       - in: path
       *         name: id
       *         required: true
       *         schema:
       *           type: integer
       *     responses:
       *       200:
       *         description: 删除成功
       */
      router.delete('/:id', crudFactory.delete({
        model,
        requirePermission: permissions.delete,
        beforeHook: hooks.beforeDelete,
        afterHook: hooks.afterDelete
      }));
    }

    console.log(`✅ 为表 ${tableName} 生成了 ${this.getEnabledOperationsCount(config)} 个 CRUD 路由`);
    return router;
  }

  /**
   * 批量生成多个表的路由
   */
  static generateBatchRoutes(configs: RouteGeneratorConfig[]): Record<string, Router> {
    const routes: Record<string, Router> = {};
    
    console.log(`🚀 开始批量生成 ${configs.length} 个表的路由...`);
    
    configs.forEach(config => {
      try {
        const router = this.generateCRUDRoutes(config);
        const routePath = config.routePath || getRoutePathByTable(config.tableName);
        routes[routePath] = router;
        
      } catch (error) {
        console.error(`❌ 生成表 ${config.tableName} 的路由失败:`, error);
      }
    });
    
    console.log(`✅ 批量生成完成，成功生成 ${Object.keys(routes).length} 个路由`);
    return routes;
  }

  /**
   * 为所有已对齐的表自动生成基础 CRUD 路由
   */
  static async generateAllAlignedRoutes(): Promise<Record<string, Router>> {
    console.log('🔄 自动生成所有已对齐表的基础 CRUD 路由...');
    
    // 获取所有已对齐的表
    const mappings = RouteModelMapper.getAllMappings();
    
    const configs: RouteGeneratorConfig[] = mappings.map(mapping => ({
      tableName: mapping.table || '',
      routePath: mapping.route,
      // 默认配置 - 可以根据具体需求调整
      searchFields: ['name', 'title', 'description', 'content'],
      sortFields: ['id', 'createdAt', 'updatedAt', 'name', 'title'],
      excludeFields: ['password', 'token', 'secret', 'apiKey'],
      requireAuth: true,
      
      // 根据表名特殊配置
      ...this.getTableSpecificConfig(mapping.table || '')
    })).filter(config => config.tableName); // 过滤掉无效配置
    
    return this.generateBatchRoutes(configs);
  }

  /**
   * 根据表名获取特殊配置
   */
  private static getTableSpecificConfig(tableName: string): Partial<RouteGeneratorConfig> {
    const configs: Record<string, Partial<RouteGeneratorConfig>> = {
      // 系统表 - 只读
      'sequelize_meta': {
        enableCreate: false,
        enableUpdate: false,
        enableDelete: false,
        requireAuth: true
      },
      'system_logs': {
        enableCreate: false,
        enableUpdate: false,
        enableDelete: false
      },
      'operation_logs': {
        enableCreate: false,
        enableUpdate: false,
        enableDelete: false
      },
      
      // 用户表 - 排除敏感字段
      'users': {
        excludeFields: ['password', 'token', 'resetToken'],
        searchFields: ['username', 'email', 'fullName'],
        sortFields: ['id', 'createdAt', 'username', 'email']
      },
      
      // 学生表
      'students': {
        searchFields: ['name', 'studentNo', 'idCardNo'],
        sortFields: ['id', 'createdAt', 'name', 'enrollmentDate']
      },
      
      // 教师表
      'teachers': {
        searchFields: ['name', 'employeeNo', 'department'],
        sortFields: ['id', 'createdAt', 'name', 'hireDate']
      },
      
      // 活动表
      'activities': {
        searchFields: ['title', 'description', 'location'],
        sortFields: ['id', 'createdAt', 'startDate', 'title']
      }
    };
    
    return configs[tableName] || {};
  }

  /**
   * 计算启用的操作数量
   */
  private static getEnabledOperationsCount(config: RouteGeneratorConfig): number {
    const operations = ['enableList', 'enableCreate', 'enableRead', 'enableUpdate', 'enableDelete'];
    return operations.filter(op => config[op as keyof RouteGeneratorConfig] !== false).length;
  }
}

/**
 * 便捷函数：为单个表生成路由
 */
export function createTableRoutes(tableName: string, customConfig: Partial<RouteGeneratorConfig> = {}): Router {
  return RouteGenerator.generateCRUDRoutes({
    tableName,
    ...customConfig
  });
}

/**
 * 便捷函数：批量生成表路由
 */
export function createBatchRoutes(tableNames: string[], customConfig: Partial<RouteGeneratorConfig> = {}): Record<string, Router> {
  const configs = tableNames.map(tableName => ({
    tableName,
    ...customConfig
  }));
  
  return RouteGenerator.generateBatchRoutes(configs);
}

export default RouteGenerator;