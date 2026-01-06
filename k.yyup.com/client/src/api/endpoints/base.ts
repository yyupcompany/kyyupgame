/**
 * 基础API端点配置
 */

// API端点前缀
// 重要说明：
// 1. request.ts 的 baseURL 设置为 '/api'，通过 Vite 代理转发到后端
// 2. 但是endpoints.ts中的所有路径都是 `${API_PREFIX}/xxx`，如果API_PREFIX=''，会导致路径以'/'开头
// 3. Axios将以'/'开头的路径视为绝对路径，忽略baseURL，导致请求发送到 http://localhost:3000/xxx 而不是 /api/xxx
// 4. ✅ 修复：将API_PREFIX设置为'/api'，这样 `${API_PREFIX}/dashboard/stats` = '/api/dashboard/stats'
// 5. 然后baseURL设置为空字符串，让路径自己包含/api前缀
export const API_PREFIX = '/api';

// 基础API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code?: number;
  items?: T[];
  total?: number;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

// 搜索参数基础类型
export interface BaseSearchParams {
  name?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}