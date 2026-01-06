/**
 * API统一响应类型定义
 * 用于标准化所有API接口的响应格式
 */

// ==================== 基础响应类型 ====================

/**
 * API基础响应接口
 */
export interface ApiResponse<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data?: T;
  /** 错误代码（失败时） */
  errorCode?: string;
  /** 错误详情（失败时） */
  errorDetails?: Record<string, any>;
  /** 时间戳 */
  timestamp?: string | number;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T = any> {
  /** 数据列表 */
  items: T[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有上一页 */
  hasPrevious?: boolean;
  /** 是否有下一页 */
  hasNext?: boolean;
}

/**
 * 列表响应（带成功标识）
 */
export interface ListResponse<T = any> extends ApiResponse<PaginatedResponse<T>> {
  success: true;
  message: string;
  data: PaginatedResponse<T>;
}

/**
 * 详情响应
 */
export interface DetailResponse<T = any> extends ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * 创建响应
 */
export interface CreateResponse<T = any> extends ApiResponse<T> {
  success: true;
  message: string;
  data: T & {
    /** 创建的资源ID */
    id: number | string;
  };
}

/**
 * 更新响应
 */
export interface UpdateResponse<T = any> extends ApiResponse<T> {
  success: true;
  message: string;
  data?: T;
}

/**
 * 删除响应
 */
export interface DeleteResponse extends ApiResponse {
  success: true;
  message: string;
  data?: {
    /** 被删除的资源ID */
    deletedId: number | string;
    /** 删除的数量 */
    deletedCount?: number;
  };
}

// ==================== 错误响应类型 ====================

/**
 * 错误响应
 */
export interface ErrorResponse extends ApiResponse {
  success: false;
  message: string;
  errorCode: string;
  errorDetails?: {
    /** 字段错误 */
    fieldErrors?: FieldError[];
    /** 堆栈跟踪（仅开发环境） */
    stack?: string;
    /** 请求路径 */
    path?: string;
    /** 请求方法 */
    method?: string;
  };
}

/**
 * 字段错误
 */
export interface FieldError {
  /** 字段名 */
  field: string;
  /** 错误消息 */
  message: string;
  /** 拒绝值 */
  rejectedValue?: any;
  /** 约束类型 */
  constraint?: string;
}

/**
 * 验证错误响应
 */
export interface ValidationErrorResponse extends ErrorResponse {
  errorCode: 'VALIDATION_ERROR';
  errorDetails: {
    fieldErrors: FieldError[];
  };
}

// ==================== HTTP状态码对应的响应类型 ====================

/**
 * 200 OK响应
 */
export interface OkResponse<T = any> extends ApiResponse<T> {
  success: true;
  data: T;
}

/**
 * 201 Created响应
 */
export interface CreatedResponse<T = any> extends CreateResponse<T> {
  success: true;
}

/**
 * 204 No Content响应
 */
export interface NoContentResponse extends ApiResponse {
  success: true;
  message: string;
}

/**
 * 400 Bad Request响应
 */
export interface BadRequestResponse extends ErrorResponse {
  errorCode: 'BAD_REQUEST' | 'VALIDATION_ERROR';
}

/**
 * 401 Unauthorized响应
 */
export interface UnauthorizedResponse extends ErrorResponse {
  errorCode: 'UNAUTHORIZED' | 'TOKEN_EXPIRED' | 'INVALID_TOKEN';
}

/**
 * 403 Forbidden响应
 */
export interface ForbiddenResponse extends ErrorResponse {
  errorCode: 'FORBIDDEN' | 'PERMISSION_DENIED';
}

/**
 * 404 Not Found响应
 */
export interface NotFoundResponse extends ErrorResponse {
  errorCode: 'NOT_FOUND' | 'RESOURCE_NOT_FOUND';
}

/**
 * 409 Conflict响应
 */
export interface ConflictResponse extends ErrorResponse {
  errorCode: 'CONFLICT' | 'ALREADY_EXISTS' | 'DUPLICATE_ENTRY';
}

/**
 * 429 Too Many Requests响应
 */
export interface TooManyRequestsResponse extends ApiResponse {
  success: false;
  errorCode: 'RATE_LIMIT_EXCEEDED';
  errorDetails?: {
    /** 重试时间（秒） */
    retryAfter: number;
    /** 限制类型 */
    limitType: string;
  };
}

/**
 * 500 Internal Server Error响应
 */
export interface InternalServerErrorResponse extends ErrorResponse {
  errorCode: 'INTERNAL_SERVER_ERROR';
}

// ==================== 特殊场景响应类型 ====================

/**
 * 文件上传响应
 */
export interface FileUploadResponse extends ApiResponse {
  success: true;
  message: string;
  data: {
    /** 文件URL */
    url: string;
    /** 文件名 */
    filename: string;
    /** 文件大小（字节） */
    size: number;
    /** 文件类型 */
    mimeType: string;
    /** 文件路径 */
    path?: string;
    /** 缩略图URL（如果是图片） */
    thumbnail?: string;
  };
}

/**
 * 批量操作响应
 */
export interface BatchOperationResponse extends ApiResponse {
  success: boolean;
  message: string;
  data: {
    /** 总数 */
    total: number;
    /** 成功数 */
    success: number;
    /** 失败数 */
    failed: number;
    /** 失败详情 */
    failures?: Array<{
      /** 项目标识 */
      id: string | number;
      /** 错误消息 */
      error: string;
    }>;
  };
}

/**
 * 导出响应
 */
export interface ExportResponse extends ApiResponse {
  success: true;
  message: string;
  data: {
    /** 导出文件URL */
    fileUrl: string;
    /** 文件名 */
    filename: string;
    /** 文件大小 */
    fileSize: number;
    /** 导出时间 */
    exportedAt: string;
    /** 过期时间 */
    expiresAt?: string;
  };
}

/**
 * 统计响应
 */
export interface StatisticsResponse<T = Record<string, number>> extends ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

// ==================== 工具类型 ====================

/**
 * 响应构建器选项
 */
export interface ResponseBuilderOptions<T = any> {
  /** 响应数据 */
  data?: T;
  /** 响应消息 */
  message?: string;
  /** 错误代码 */
  errorCode?: string;
  /** 错误详情 */
  errorDetails?: Record<string, any>;
  /** 是否包含时间戳 */
  includeTimestamp?: boolean;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 页码（从1开始） */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
}

/**
 * 查询参数
 */
export interface QueryParams extends PaginationParams {
  /** 搜索关键词 */
  search?: string;
  /** 筛选条件 */
  filters?: Record<string, any>;
  /** 包含字段 */
  fields?: string[];
  /** 排除字段 */
  excludeFields?: string[];
}

/**
 * 元数据
 */
export interface ResponseMetadata {
  /** 请求ID */
  requestId?: string;
  /** 服务版本 */
  version?: string;
  /** 处理时间（毫秒） */
  processingTime?: number;
  /** 缓存状态 */
  cacheStatus?: 'hit' | 'miss';
}

/**
 * 带元数据的响应
 */
export interface ResponseWithMetadata<T = any> extends ApiResponse<T> {
  /** 元数据 */
  metadata: ResponseMetadata;
}

// ==================== 类型守卫 ====================

/**
 * 检查是否为成功响应
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is OkResponse<T> {
  return response.success === true;
}

/**
 * 检查是否为错误响应
 */
export function isErrorResponse(response: ApiResponse): response is ErrorResponse {
  return response.success === false;
}

/**
 * 检查是否为分页响应
 */
export function isPaginatedResponse<T>(data: any): data is PaginatedResponse<T> {
  return data && typeof data === 'object' && 'items' in data && 'total' in data && 'page' in data;
}

// ==================== 响应构建器类型 ====================

/**
 * 响应构建器接口
 */
export interface IResponseBuilder {
  /**
   * 构建成功响应
   */
  success<T>(data?: T, message?: string): OkResponse<T>;

  /**
   * 构建创建成功响应
   */
  created<T>(data: T, message?: string): CreatedResponse<T>;

  /**
   * 构建错误响应
   */
  error(message: string, errorCode?: string, errorDetails?: Record<string, any>): ErrorResponse;

  /**
   * 构建验证错误响应
   */
  validationError(fieldErrors: FieldError[]): ValidationErrorResponse;

  /**
   * 构建分页响应
   */
  paginated<T>(items: T[], total: number, page: number, pageSize: number): ListResponse<T>;

  /**
   * 构建批量操作响应
   */
  batchOperation(total: number, success: number, failed: number, failures?: any[]): BatchOperationResponse;
}
