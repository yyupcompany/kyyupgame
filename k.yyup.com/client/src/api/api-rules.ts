/**
 * API请求规则和最佳实践
 * 
 * 本文件定义了前端项目中API请求的统一规范和最佳实践
 * 所有API相关实现都应遵循以下规则
 */

import { get, post, put, del } from '@/utils/request';
import type { ApiResponse } from '@/utils/request';

/**
 * API请求规则：
 * 
 * 1. 统一使用request工具
 *    - 禁止直接使用axios进行API请求
 *    - 所有HTTP请求必须使用@/utils/request中导出的get、post、put、del方法
 * 
 * 2. 统一的API响应类型
 *    - 所有API响应都应使用ApiResponse<T>类型
 *    - 从@/utils/request导入ApiResponse类型，而非从@/types/system
 * 
 * 3. API端点定义
 *    - 所有API端点常量应在@/api/endpoints.ts中定义
 *    - 模块相关的端点应在对应的子目录中定义(如PRINCIPAL_ENDPOINTS)
 * 
 * 4. 端口配置
 *    - 开发环境API请求应统一使用端口3001
 *    - 不应直接在代码中硬编码端口号
 *    - 通过@/utils/request中的连接机制判断后端可用性
 * 
 * 5. API实现结构
 *    - 每个功能模块的API应在单独的文件中实现
 *    - 模块API可以实现为对象(如dashboardApi)或独立函数集合
 *    - 导出接口类型定义应在API实现的顶部
 * 
 * 6. 统一的错误处理
 *    - 使用request工具中内置的错误处理机制
 *    - 特殊错误处理应在调用API的地方实现，而不是修改request工具
 * 
 * 7. 认证与授权
 *    - 不要在每个API调用中单独处理token
 *    - 统一通过request拦截器添加认证令牌
 */

/**
 * API实现示例
 */

// 正确示例：使用get、post、put、del方法
export const goodApiExample = {
  getData(id: string): Promise<ApiResponse<any>> {
    return get(`/api/data/${id}`);
  },
  
  createData(data: any): Promise<ApiResponse<any>> {
    return post('/api/data', data);
  },
  
  updateData(id: string, data: any): Promise<ApiResponse<any>> {
    return put(`/api/data/${id}`, data);
  },
  
  deleteData(id: string): Promise<ApiResponse<any>> {
    return del(`/api/data/${id}`);
  }
};

// 错误示例：直接使用axios（不要这样做）
/*
import axios from 'axios';

export const badApiExample = {
  getData(id: string) {
    return axios.get(`/api/data/${id}`)
      .then(response => response.data);
  },
  
  createData(data: any) {
    return axios.post('/api/data', data)
      .then(response => response.data);
  }
};
*/

export default {
  /**
   * 标准化API请求函数
   * @param apiFunc 原始API请求函数
   */
  standardizeApi<T, P extends any[]>(
    apiFunc: (...args: P) => Promise<any>
  ): (...args: P) => Promise<ApiResponse<T>> {
    return async (...args: P) => {
      try {
        return await apiFunc(...args);
      } catch (error) {
        console.error('API请求失败:', error);
        throw error;
      }
    };
  }
}; 