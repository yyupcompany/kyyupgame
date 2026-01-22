// 海报模板模块API服务
import { get, post, put, del, ApiResponse } from '@/utils/request';
import { POSTER_TEMPLATE_ENDPOINTS, POSTER_GENERATION_ENDPOINTS } from '../endpoints';

// 后端兼容的海报模板接口类型
export interface PosterTemplateData {
  id: number;
  name: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  createdAt: string; // 后端日期字段
  updatedAt: string; // 后端日期字段
  usageCount: number;
  width: number;
  height: number;
  description: string | null;
  marketingTools: string[] | null;
  groupBuySettings: {
    minUsers: number;
    discount: number;
  } | null;
  pointsSettings: {
    points: number;
    discount: number;
  } | null;
  customSettings: Record<string, any> | null;
}

// 前端使用的海报模板接口类型
export interface PosterTemplate {
  id: number;
  name: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  createdAt: Date; // 前端日期对象
  updatedAt: Date; // 前端日期对象
  usageCount: number;
  width: number;
  height: number;
  description: string | null;
  marketingTools: string[];
  groupBuySettings: {
    minUsers: number;
    discount: number;
  } | null;
  pointsSettings: {
    points: number;
    discount: number;
  } | null;
  customSettings: Record<string, any> | null;
}

// 查询参数类型
export interface PosterTemplateQueryParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  category?: string;
  keyword?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// 将后端数据转换为前端数据
export function transformPosterTemplate(data: PosterTemplateData): PosterTemplate {
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    marketingTools: data.marketingTools || [],
  };
}

// 创建海报模板请求接口
export interface CreatePosterTemplateRequest {
  name: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  width: number;
  height: number;
  description?: string;
  marketingTools?: string[];
  groupBuySettings?: {
    minUsers: number;
    discount: number;
  };
  pointsSettings?: {
    points: number;
    discount: number;
  };
  customSettings?: Record<string, any>;
}

// 海报模板API服务
const posterApi = {
  /**
   * 获取海报模板列表
   * @param params 查询参数
   * @returns Promise<ApiResponse<{ templates: PosterTemplate[]; total: number }>>
   */
  async getTemplates(params?: PosterTemplateQueryParams): Promise<ApiResponse<{ templates: PosterTemplate[]; total: number }>> {
    // 转换参数格式，适配后端
    const apiParams: Record<string, any> = {
      ...params,
      pageSize: params?.pageSize || params?.limit
    };
    
    // 删除不需要的参数
    if ('limit' in apiParams) {
      delete apiParams.limit;
    }
    
    try {
      // 使用默认的request服务
      const response = await get(POSTER_TEMPLATE_ENDPOINTS.BASE, apiParams);
      
      if (response.success) {
        // 转换数据格式
        let templates: PosterTemplate[] = [];
        let total = 0;
        
        if (response.data && response.data.items) {
          // 标准格式
          templates = (response.data.items || []).map(transformPosterTemplate);
          total = response.data.total || 0;
        } else if (Array.isArray(response.data)) {
          // 数组格式
          templates = response.data.map(transformPosterTemplate);
          total = templates.length;
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          // 标准分页格式
          templates = response.data.items.map(transformPosterTemplate);
          total = response.data.total || templates.length;
        }
        
        return {
          success: true,
          data: {
            templates,
            total
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('获取海报模板列表失败:', error);
      return {
        success: false,
        message: '获取海报模板列表失败',
        data: { templates: [], total: 0 }
      };
    }
  },

  /**
   * 获取海报模板详情
   * @param id 模板ID
   * @returns Promise<ApiResponse<PosterTemplate>>
   */
  async getTemplate(id: number): Promise<ApiResponse<PosterTemplate>> {
    try {
      // 使用默认的request服务
      const response = await get(`${POSTER_TEMPLATE_ENDPOINTS.BASE}/${id}`);
      
      if (response.success && response.data) {
        return {
          ...response,
          data: transformPosterTemplate(response.data)
        };
      }
      
      return response;
    } catch (error) {
      console.error('获取海报模板详情失败:', error);
      return {
        success: false,
        message: '获取海报模板详情失败',
        data: null as any
      };
    }
  },

  /**
   * 创建海报模板
   * @param data 模板数据
   * @returns Promise<ApiResponse<PosterTemplate>>
   */
  async createTemplate(data: Omit<PosterTemplateData, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<ApiResponse<PosterTemplate>> {
    const response = await post(POSTER_TEMPLATE_ENDPOINTS.BASE, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: transformPosterTemplate(response.data)
      };
    }
    
    return response;
  },

  /**
   * 更新海报模板
   * @param id 模板ID
   * @param data 模板数据
   * @returns Promise<ApiResponse<PosterTemplate>>
   */
  async updateTemplate(id: number, data: Partial<Omit<PosterTemplateData, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>>): Promise<ApiResponse<PosterTemplate>> {
    const response = await put(`${POSTER_TEMPLATE_ENDPOINTS.BASE}/${id}`, data);
    
    if (response.success && response.data) {
      return {
        ...response,
        data: transformPosterTemplate(response.data)
      };
    }
    
    return response;
  },

  /**
   * 删除海报模板
   * @param id 模板ID
   * @returns Promise<ApiResponse<{ id: number }>>
   */
  async deleteTemplate(id: number): Promise<ApiResponse<{ id: number }>> {
    return del(`${POSTER_TEMPLATE_ENDPOINTS.BASE}/${id}`);
  },

  /**
   * 获取海报模板类别
   * @returns Promise<ApiResponse<string[]>>
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    return get('/api/poster-templates/categories');
  },

  /**
   * 生成海报
   * @param data 生成参数
   * @returns Promise<ApiResponse<{ url: string }>>
   */
  async generatePoster(data: {
    templateId: number;
    customData: Record<string, any>;
  }): Promise<ApiResponse<{ url: string }>> {
    return post(POSTER_GENERATION_ENDPOINTS.GENERATE, data);
  },

  /**
   * 获取海报使用统计
   * @param params 查询参数
   * @returns Promise<ApiResponse<{ usageStats: Array<{ date: string; count: number }> }>>
   */
  async getUsageStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ usageStats: Array<{ date: string; count: number }> }>> {
    return get('/api/poster-templates/statistics', { params });
  }
};

export default posterApi; 