/**
 * API分组映射服务
 * 🎯 基于Swagger文档自动生成API映射关系
 */

import { specs } from '../../config/swagger.config';

export interface ApiEndpointInfo {
  path: string;
  method: string;
  summary: string;
  description: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
  tags?: string[];
}

export class ApiGroupMappingService {
  private static instance: ApiGroupMappingService;
  private apiMap: Map<string, ApiEndpointInfo[]> = new Map();
  private initialized: boolean = false;

  static getInstance(): ApiGroupMappingService {
    if (!ApiGroupMappingService.instance) {
      ApiGroupMappingService.instance = new ApiGroupMappingService();
    }
    return ApiGroupMappingService.instance;
  }

  /**
   * 初始化API映射（从 Swagger 文档读取）
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('📖 [初始化] 从 Swagger 文档加载API映射...');

    try {
      const paths = (specs as any).paths || {};
      
      for (const [path, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries(methods as any)) {
          if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
            const apiInfo: ApiEndpointInfo = {
              path,
              method: method.toUpperCase(),
              summary: (details as any).summary || '',
              description: (details as any).description || '',
              parameters: (details as any).parameters || [],
              requestBody: (details as any).requestBody,
              responses: (details as any).responses,
              tags: (details as any).tags || []
            };

            const entity = this.extractEntityFromPath(path);
            if (entity) {
              if (!this.apiMap.has(entity)) {
                this.apiMap.set(entity, []);
              }
              this.apiMap.get(entity)!.push(apiInfo);
            }
          }
        }
      }

      this.initialized = true;
      console.log(`✅ [初始化] 加载了 ${this.apiMap.size} 个实体的API映射`);
    } catch (error) {
      console.error('❌ [初始化] 加载API映射失败:', error);
    }
  }

  /**
   * 从路径提取实体名（如 /api/students -> students）
   */
  private extractEntityFromPath(path: string): string | null {
    const match = path.match(/\/api\/([^\/\{]+)/);
    return match ? match[1] : null;
  }

  async getMapping(api: string): Promise<any> {
    await this.initialize();
    console.log('🔗 获取API映射:', api);
    return { group: 'default', api };
  }

  /**
   * 识别API组
   */
  async identifyApiGroups(query: string): Promise<string[]> {
    await this.initialize();
    console.log('🔍 识别API组:', query);
    const groups: string[] = [];

    if (query.includes('用户') || query.includes('登录')) {
      groups.push('user');
    }
    if (query.includes('活动') || query.includes('课程')) {
      groups.push('activity');
    }
    if (query.includes('报名') || query.includes('招生')) {
      groups.push('enrollment');
    }

    return groups.length > 0 ? groups : ['general'];
  }

  /**
   * 根据实体名获取API端点
   */
  getApiEndpointByEntity(entity: string): string | null {
    console.log('🎯 获取API端点:', entity);
    const entityMap: Record<string, string> = {
      'students': '/api/students',
      'teachers': '/api/teachers',
      'classes': '/api/classes',
      'activities': '/api/activities',
      'parents': '/api/parents',
      'users': '/api/users',
      'enrollments': '/api/enrollments'
    };

    return entityMap[entity] || null;
  }

  /**
   * 获取API详细信息（从 Swagger 文档）
   */
  async getApiDetailsByEntity(entity: string): Promise<any> {
    await this.initialize();
    console.log('📖 获取API详细信息:', entity);
    
    const apis = this.apiMap.get(entity);
    if (apis && apis.length > 0) {
      return {
        entity,
        endpoint: apis[0].path,
        method: apis[0].method,
        description: apis[0].summary || `查询${entity}数据`,
        apis: apis
      };
    }

    return {
      entity,
      endpoint: this.getApiEndpointByEntity(entity),
      method: 'GET',
      description: `查询${entity}数据`,
      apis: []
    };
  }

  /**
   * 获取支持的实体列表
   */
  async getSupportedEntities(): Promise<string[]> {
    await this.initialize();
    return Array.from(this.apiMap.keys());
  }
}

export const apiGroupMappingService = ApiGroupMappingService.getInstance();
