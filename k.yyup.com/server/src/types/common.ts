/**
 * 分页参数接口
 * 用于API中的分页查询
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 分页结果接口
 * 用于返回分页查询结果
 */
export interface PaginatedResult<T> {
  rows: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * API响应结构
 * 标准化API响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  timestamp: number;
}

/**
 * 坐标接口
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * 通用ID参数
 */
export interface IdParam {
  id: number;
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  id?: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  path?: string;
  thumbnailUrl?: string;
}

/**
 * 地址信息接口
 */
export interface AddressInfo {
  province: string;
  city: string;
  district: string;
  address: string;
  postcode?: string;
  coordinates?: Coordinates;
}

/**
 * 联系人信息接口
 */
export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  position?: string;
}

/**
 * 日期范围接口
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * 通用状态信息
 */
export interface StatusInfo {
  status: number;
  statusText: string;
  updatedAt: Date;
  updatedBy?: number;
}

/**
 * 排序选项
 */
export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}

/**
 * 通用筛选参数
 */
export interface FilterParams {
  [key: string]: string | number | boolean | Date | Array<string | number | Date> | null;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  total: number;
  items: T[];
  page: number;
  pageSize: number;
}

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
  creatorId?: number;
  updaterId?: number;
}

export interface BaseDto {
  status?: number;
  remark?: string;
} 