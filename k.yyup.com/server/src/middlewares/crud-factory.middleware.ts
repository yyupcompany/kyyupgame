/**
 * CRUD 工厂中间件
 * 自动化处理标准 CRUD 操作，减少重复代码
 * 基于数据库-路由完全对齐的基础设施
 */

import { Request, Response, NextFunction } from 'express';
import { ModelStatic, Model, WhereOptions, FindOptions, OrderItem } from 'sequelize';
import { RouteModelMapper } from '../utils/route-model-mapper';
import { ApiResponse } from '../utils/apiResponse';
import { getAPIFieldName } from '../config/field-mapping';

// CRUD 操作类型枚举
export enum CRUDOperation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update', 
  DELETE = 'delete',
  LIST = 'list'
}

// CRUD 配置选项
export interface CRUDOptions {
  operation: CRUDOperation;
  model?: ModelStatic<any>;
  tableName?: string;
  routePath?: string;
  include?: any[];
  exclude?: string[];
  searchFields?: string[];
  sortFields?: string[];
  requireAuth?: boolean;
  requirePermission?: string;
  beforeHook?: (req: Request, data?: any) => Promise<any>;
  afterHook?: (req: Request, result: any) => Promise<any>;
  customValidation?: (req: Request) => Promise<string | null>;
}

// 查询参数接口
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * CRUD 工厂中间件类
 */
export class CRUDFactory {
  
  /**
   * 创建 CRUD 中间件
   */
  static create(options: CRUDOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 1. 获取模型
        const model = await this.getModel(options, req);
        if (!model) {
          return ApiResponse.error(res, '未找到对应的数据模型', 'MODEL_NOT_FOUND', 404);
        }

        // 2. 执行前置钩子
        if (options.beforeHook) {
          await options.beforeHook(req);
        }

        // 3. 根据操作类型执行相应逻辑
        let result: any;
        switch (options.operation) {
          case CRUDOperation.LIST:
            result = await this.handleList(req, res, model, options);
            break;
          case CRUDOperation.CREATE:
            result = await this.handleCreate(req, res, model, options);
            break;
          case CRUDOperation.READ:
            result = await this.handleRead(req, res, model, options);
            break;
          case CRUDOperation.UPDATE:
            result = await this.handleUpdate(req, res, model, options);
            break;
          case CRUDOperation.DELETE:
            result = await this.handleDelete(req, res, model, options);
            break;
          default:
            return ApiResponse.error(res, '不支持的操作类型', 'INVALID_OPERATION', 400);
        }

        // 4. 执行后置钩子
        if (options.afterHook && result) {
          result = await options.afterHook(req, result);
        }

        return result;

      } catch (error) {
        console.error(`CRUD Factory Error [${options.operation}]:`, error);
        return ApiResponse.error(res, '服务器内部错误', 'INTERNAL_ERROR', 500);
      }
    };
  }

  /**
   * 获取模型实例
   */
  private static async getModel(options: CRUDOptions, req: Request): Promise<ModelStatic<any> | null> {
    // 1. 直接指定的模型
    if (options.model) {
      return options.model;
    }

    // 2. 根据表名获取模型
    if (options.tableName) {
      return RouteModelMapper.getModelFromTable(options.tableName);
    }

    // 3. 根据路由路径获取模型
    if (options.routePath) {
      return RouteModelMapper.getModelFromRoute(options.routePath);
    }

    // 4. 从请求路径自动推断
    const routePath = req.baseUrl || req.route?.path || req.path;
    return RouteModelMapper.getModelFromRoute(routePath);
  }

  /**
   * 处理列表查询
   */
  private static async handleList(
    req: Request, 
    res: Response, 
    model: ModelStatic<any>, 
    options: CRUDOptions
  ) {
    const queryParams = this.parseQueryParams(req);
    
    // 构建查询选项
    const findOptions: FindOptions = {
      include: options.include || [],
      order: this.buildOrderOptions(queryParams, options),
      where: this.buildWhereOptions(queryParams, options),
    };

    // 分页处理
    if (queryParams.page && queryParams.limit) {
      findOptions.offset = (queryParams.page - 1) * queryParams.limit;
      findOptions.limit = queryParams.limit;
    }

    // 执行查询
    const { count, rows } = await model.findAndCountAll(findOptions);
    
    // 构建响应数据
    const responseData = {
      list: rows,
      pagination: {
        total: count,
        page: queryParams.page || 1,
        limit: queryParams.limit || count,
        totalPages: queryParams.limit ? Math.ceil(count / queryParams.limit) : 1
      }
    };

    return ApiResponse.success(res, responseData, '查询成功');
  }

  /**
   * 处理创建操作
   */
  private static async handleCreate(
    req: Request,
    res: Response,
    model: ModelStatic<any>,
    options: CRUDOptions
  ) {
    // 自定义验证
    if (options.customValidation) {
      const validationError = await options.customValidation(req);
      if (validationError) {
        return ApiResponse.error(res, validationError, 'VALIDATION_ERROR', 400);
      }
    }

    // 字段过滤
    const createData = this.filterFields(req.body, options);
    
    // 创建记录
    const newRecord = await model.create(createData);
    
    return ApiResponse.success(res, newRecord, '创建成功');
  }

  /**
   * 处理读取单条记录
   */
  private static async handleRead(
    req: Request,
    res: Response,
    model: ModelStatic<any>,
    options: CRUDOptions
  ) {
    const { id } = req.params;
    
    const record = await model.findByPk(id, {
      include: options.include || []
    });

    if (!record) {
      return ApiResponse.notFound(res, '记录不存在');
    }

    return ApiResponse.success(res, record, '查询成功');
  }

  /**
   * 处理更新操作
   */
  private static async handleUpdate(
    req: Request,
    res: Response,
    model: ModelStatic<any>,
    options: CRUDOptions
  ) {
    const { id } = req.params;

    // 自定义验证
    if (options.customValidation) {
      const validationError = await options.customValidation(req);
      if (validationError) {
        return ApiResponse.error(res, validationError, 'VALIDATION_ERROR', 400);
      }
    }

    // 字段过滤
    const updateData = this.filterFields(req.body, options);
    
    // 执行更新
    const [updatedRowsCount] = await model.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, '记录不存在');
    }

    // 返回更新后的记录
    const updatedRecord = await model.findByPk(id, {
      include: options.include || []
    });

    return ApiResponse.success(res, updatedRecord, '更新成功');
  }

  /**
   * 处理删除操作
   */
  private static async handleDelete(
    req: Request,
    res: Response,
    model: ModelStatic<any>,
    options: CRUDOptions
  ) {
    const { id } = req.params;

    const deletedRowsCount = await model.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, '记录不存在');
    }

    return ApiResponse.success(res, null, '删除成功');
  }

  /**
   * 解析查询参数
   */
  private static parseQueryParams(req: Request): QueryParams {
    const {
      page = 1,
      limit = 20,
      sort = 'id',
      order = 'ASC',
      search = '',
      ...filters
    } = req.query;

    return {
      page: parseInt(page as string) || 1,
      limit: Math.min(parseInt(limit as string) || 20, 100), // 最大限制100
      sort: sort as string,
      order: (order as string).toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      search: search as string,
      filters: filters as Record<string, any>
    };
  }

  /**
   * 构建排序选项
   */
  private static buildOrderOptions(queryParams: QueryParams, options: CRUDOptions): OrderItem[] {
    const { sort, order } = queryParams;
    
    // 检查排序字段是否被允许
    if (options.sortFields && !options.sortFields.includes(sort)) {
      return [['id', 'ASC']]; // 默认排序
    }

    return [[sort, order]];
  }

  /**
   * 构建查询条件
   */
  private static buildWhereOptions(queryParams: QueryParams, options: CRUDOptions): WhereOptions {
    const { search, filters } = queryParams;
    const whereOptions: WhereOptions = {};

    // 处理搜索
    if (search && options.searchFields && options.searchFields.length > 0) {
      const searchConditions = options.searchFields.map(field => ({
        [field]: {
          [require('sequelize').Op.like]: `%${search}%`
        }
      }));
      
      whereOptions[require('sequelize').Op.or] = searchConditions;
    }

    // 处理过滤器
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          whereOptions[key] = value;
        }
      });
    }

    return whereOptions;
  }

  /**
   * 字段过滤
   */
  private static filterFields(data: any, options: CRUDOptions): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const filteredData = { ...data };

    // 排除指定字段
    if (options.exclude) {
      options.exclude.forEach(field => {
        delete filteredData[field];
      });
    }

    return filteredData;
  }
}

/**
 * 便捷的 CRUD 工厂函数
 */
export const crudFactory = {
  list: (options: Omit<CRUDOptions, 'operation'> = {}) => 
    CRUDFactory.create({ ...options, operation: CRUDOperation.LIST }),
    
  create: (options: Omit<CRUDOptions, 'operation'> = {}) => 
    CRUDFactory.create({ ...options, operation: CRUDOperation.CREATE }),
    
  read: (options: Omit<CRUDOptions, 'operation'> = {}) => 
    CRUDFactory.create({ ...options, operation: CRUDOperation.READ }),
    
  update: (options: Omit<CRUDOptions, 'operation'> = {}) => 
    CRUDFactory.create({ ...options, operation: CRUDOperation.UPDATE }),
    
  delete: (options: Omit<CRUDOptions, 'operation'> = {}) => 
    CRUDFactory.create({ ...options, operation: CRUDOperation.DELETE }),
};

export default CRUDFactory;