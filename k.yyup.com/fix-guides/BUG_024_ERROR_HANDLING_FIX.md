# Bug #24 修复指南 - 前端错误处理不一致

## 问题描述
前端API错误处理不统一，不同位置的错误响应格式不一致，导致难以统一处理错误。

## 严重级别
**中**

## 受影响的文件
- `client/src/utils/request.ts`

## 问题分析

1. **格式不一致**: 不同API返回不同的错误格式
2. **处理困难**: 难以统一处理错误
3. **用户体验差**: 错误信息混乱
4. **调试困难**: 难以追踪错误来源

## 修复方案（统一错误响应格式处理）

### 步骤 1: 定义错误类型

在 `client/src/types/error.types.ts` 创建类型定义：

```typescript
/**
 * 统一的API错误响应格式
 */
export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
    stack?: string; // 仅开发环境
    timestamp?: string;
    path?: string;
  };
}

/**
 * 网络错误
 */
export interface NetworkError {
  success: false;
  error: {
    message: string;
    code: 'NETWORK_ERROR';
    details: {
      url?: string;
      method?: string;
      status?: number;
      statusText?: string;
    };
  };
}

/**
 * 超时错误
 */
export interface TimeoutError {
  success: false;
  error: {
    message: string;
    code: 'TIMEOUT_ERROR';
    details: {
      timeout: number;
    };
  };
}

/**
 * 错误类型
 */
export type ErrorResponse = ApiError | NetworkError | TimeoutError;

/**
 * 错误代码枚举
 */
export enum ErrorCode {
  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // 权限错误
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // 客户端错误
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // 服务器错误
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // 其他
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### 步骤 2: 创建错误处理器

在 `client/src/utils/error-handler.ts` 创建错误处理器：

```typescript
import { AxiosError } from 'axios';
import { ErrorCode, ErrorResponse, ApiError } from '../types/error.types';

/**
 * 开发环境检测
 */
const isDevelopment = import.meta.env.DEV;

/**
 * 统一错误处理类
 */
export class ErrorHandler {
  /**
   * 处理Axios错误
   */
  static handleAxiosError(error: AxiosError): ErrorResponse {
    // 网络错误
    if (!error.response) {
      return {
        success: false,
        error: {
          message: this.getNetworkErrorMessage(error),
          code: ErrorCode.NETWORK_ERROR,
          details: {
            url: error.config?.url,
            method: error.config?.method,
            message: error.message
          },
          timestamp: new Date().toISOString()
        }
      };
    }

    // 服务器返回错误
    const { status, data } = error.response;

    // 尝试解析标准错误格式
    if (data && typeof data === 'object' && 'error' in data) {
      const apiError = data as ApiError;
      return {
        ...apiError,
        error: {
          ...apiError.error,
          // 添加上下文信息
          timestamp: apiError.error.timestamp || new Date().toISOString(),
          path: error.config?.url
        }
      };
    }

    // 非标准格式，转换为标准格式
    return {
      success: false,
      error: {
        message: this.getHttpErrorMessage(status),
        code: this.getHttpErrorCode(status),
        details: isDevelopment ? data : undefined,
        timestamp: new Date().toISOString(),
        path: error.config?.url
      }
    };
  }

  /**
   * 获取网络错误消息
   */
  private static getNetworkErrorMessage(error: AxiosError): string {
    if (error.code === 'ECONNABORTED') {
      return '请求超时，请检查网络连接';
    }
    if (error.message.includes('Network Error')) {
      return '网络连接失败，请检查网络设置';
    }
    return `网络错误: ${error.message}`;
  }

  /**
   * 获取HTTP错误消息
   */
  private static getHttpErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      403: '没有权限执行此操作',
      404: '请求的资源不存在',
      409: '数据冲突，请刷新后重试',
      429: '请求过于频繁，请稍后再试',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '网关超时'
    };

    return messages[status] || `请求失败 (${status})`;
  }

  /**
   * 获取HTTP错误代码
   */
  private static getHttpErrorCode(status: number): ErrorCode {
    const codes: Record<number, ErrorCode> = {
      400: ErrorCode.BAD_REQUEST,
      401: ErrorCode.UNAUTHORIZED,
      403: ErrorCode.FORBIDDEN,
      404: ErrorCode.NOT_FOUND,
      409: ErrorCode.CONFLICT,
      429: ErrorCode.RATE_LIMIT_EXCEEDED,
      500: ErrorCode.INTERNAL_ERROR,
      502: ErrorCode.SERVICE_UNAVAILABLE,
      503: ErrorCode.SERVICE_UNAVAILABLE,
      504: ErrorCode.TIMEOUT_ERROR
    };

    return codes[status] || ErrorCode.UNKNOWN_ERROR;
  }

  /**
   * 显示错误通知
   */
  static showError(errorResponse: ErrorResponse, showMessage: boolean = true): void {
    const { error } = errorResponse;

    // 开发环境：打印完整错误
    if (isDevelopment) {
      console.error('🚨 API错误:', errorResponse);
    }

    // 显示用户友好的错误消息
    if (showMessage) {
      // 使用Element Plus的ElMessage
      if (typeof ElMessage !== 'undefined') {
        ElMessage.error(error.message);
      } else {
        // 降级为console
        console.error('❌', error.message);
      }
    }

    // 特殊错误处理
    if (error.code === ErrorCode.TOKEN_EXPIRED || error.code === ErrorCode.UNAUTHORIZED) {
      // 跳转到登录页
      this.handleAuthError();
    }
  }

  /**
   * 处理认证错误
   */
  private static handleAuthError(): void {
    // 清除token
    localStorage.removeItem('kindergarten_token');
    localStorage.removeItem('kindergarten_refresh_token');

    // 跳转到登录页
    if (typeof router !== 'undefined') {
      router.push('/login');
    } else {
      window.location.href = '/login';
    }
  }

  /**
   * 提取错误消息
   */
  static extractMessage(error: any): string {
    // Axios错误
    if (error?.isAxiosError) {
      const errorResponse = this.handleAxiosError(error);
      return errorResponse.error.message;
    }

    // 标准API错误
    if (error?.error?.message) {
      return error.error.message;
    }

    // 字符串错误
    if (typeof error === 'string') {
      return error;
    }

    // Error对象
    if (error?.message) {
      return error.message;
    }

    // 默认消息
    return '操作失败，请稍后重试';
  }

  /**
   * 判断是否为特定错误
   */
  static isErrorCode(error: ErrorResponse, code: ErrorCode): boolean {
    return error.error.code === code;
  }

  /**
   * 判断是否为网络错误
   */
  static isNetworkError(error: ErrorResponse): boolean {
    return error.error.code === ErrorCode.NETWORK_ERROR ||
           error.error.code === ErrorCode.TIMEOUT_ERROR;
  }

  /**
   * 判断是否为认证错误
   */
  static isAuthError(error: ErrorResponse): boolean {
    return [
      ErrorCode.UNAUTHORIZED,
      ErrorCode.TOKEN_EXPIRED,
      ErrorCode.TOKEN_INVALID
    ].includes(error.error.code as ErrorCode);
  }

  /**
   * 判断是否为权限错误
   */
  static isPermissionError(error: ErrorResponse): boolean {
    return error.error.code === ErrorCode.FORBIDDEN ||
           error.error.code === ErrorCode.INSUFFICIENT_PERMISSIONS;
  }

  /**
   * 判断是否为验证错误
   */
  static isValidationError(error: ErrorResponse): boolean {
    return error.error.code === ErrorCode.VALIDATION_ERROR ||
           error.error.code === ErrorCode.BAD_REQUEST;
  }
}
```

### 步骤 3: 更新request.ts

在 `client/src/utils/request.ts` 中统一错误处理：

```typescript
import axios, { AxiosError } from 'axios';
import { ErrorHandler } from './error-handler';
import type { ErrorResponse } from '../types/error.types';

/**
 * 创建axios实例
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * 请求拦截器
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加token
    const token = localStorage.getItem('kindergarten_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 添加请求ID（用于追踪）
    config.headers['X-Request-ID'] = generateRequestId();

    // 开发环境：打印请求信息
    if (isDevelopment) {
      console.log(`📤 [${config.method?.toUpperCase()}] ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器 - 统一错误处理
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // 成功响应
    return response;
  },
  (error: AxiosError) => {
    // 统一处理错误
    const errorResponse = ErrorHandler.handleAxiosError(error);

    // 显示错误消息
    ErrorHandler.showError(errorResponse);

    // 返回标准化的错误
    return Promise.reject(errorResponse);
  }
);

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 导出实例
 */
export default axiosInstance;

/**
 * 导出错误处理器
 */
export { ErrorHandler };
```

### 步骤 4: 创建API调用包装器

在 `client/src/utils/api-wrapper.ts` 创建API包装器：

```typescript
import axiosInstance from './request';
import { ErrorHandler } from './error-handler';
import type { ErrorResponse } from '../types/error.types';

/**
 * API请求包装器
 */
export async function apiRequest<T = any>(
  config: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    params?: any;
    headers?: Record<string, string>;
    showError?: boolean;
    silent?: boolean;
  }
): Promise<T> {
  const { showError = true, silent = false, ...axiosConfig } = config;

  try {
    const response = await axiosInstance.request<T>({
      ...axiosConfig,
      headers: {
        ...(axiosConfig.headers || {}),
        // 添加客户端版本
        'X-Client-Version': import.meta.env.APP_VERSION || '1.0.0'
      }
    });

    return response.data;
  } catch (error: any) {
    // 如果是标准错误响应
    if (error?.success === false && error?.error) {
      // 不在这里显示错误，让调用者决定
      if (showError && !silent) {
        ErrorHandler.showError(error as ErrorResponse);
      }
      throw error;
    }

    // 其他类型的错误
    throw error;
  }
}

/**
 * GET请求
 */
export function get<T = any>(
  url: string,
  params?: any,
  options?: { showError?: boolean; silent?: boolean }
): Promise<T> {
  return apiRequest<T>({
    url,
    method: 'GET',
    params,
    ...options
  });
}

/**
 * POST请求
 */
export function post<T = any>(
  url: string,
  data?: any,
  options?: { showError?: boolean; silent?: boolean }
): Promise<T> {
  return apiRequest<T>({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT请求
 */
export function put<T = any>(
  url: string,
  data?: any,
  options?: { showError?: boolean; silent?: boolean }
): Promise<T> {
  return apiRequest<T>({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求
 */
export function del<T = any>(
  url: string,
  params?: any,
  options?: { showError?: boolean; silent?: boolean }
): Promise<T> {
  return apiRequest<T>({
    url,
    method: 'DELETE',
    params,
    ...options
  });
}

/**
 * PATCH请求
 */
export function patch<T = any>(
  url: string,
  data?: any,
  options?: { showError?: boolean; silent?: boolean }
): Promise<T> {
  return apiRequest<T>({
    url,
    method: 'PATCH',
    data,
    ...options
  });
}
```

### 步骤 5: 在组件中使用

```typescript
import { get, post, ErrorHandler } from '@/utils/api-wrapper';
import type { ErrorResponse } from '@/types/error.types';

export default {
  async fetchUsers() {
    try {
      const response = await get<{ list: User[] }>('/users', { page: 1 });
      this.users = response.list;
    } catch (error: ErrorResponse) {
      // 错误已自动显示（默认）
      // 可以在这里做额外处理
      if (ErrorHandler.isAuthError(error)) {
        // 特殊处理认证错误
      } else if (ErrorHandler.isNetworkError(error)) {
        // 特殊处理网络错误
        this.loading = false;
      }
    }
  },

  async createUser(userData: any) {
    try {
      const response = await post<User>('/users', userData);
      this.users.push(response);
      ElMessage.success('创建成功');
    } catch (error: ErrorResponse) {
      // 错误已自动显示
      // 可以检查是否为验证错误
      if (ErrorHandler.isValidationError(error)) {
        // 显示详细的验证错误
        if (error.error.details) {
          ElMessage.error(JSON.stringify(error.error.details));
        }
      }
    }
  },

  // 静默请求（不显示错误）
  async checkStatus() {
    try {
      await get('/status', undefined, { silent: true });
      this.isOnline = true;
    } catch (error) {
      // 不显示错误消息
      this.isOnline = false;
    }
  },

  // 自定义错误处理
  async customRequest() {
    try {
      const response = await get('/data', undefined, { showError: false });
      return response;
    } catch (error: ErrorResponse) {
      // 完全自定义错误处理
      if (error.error.code === 'CUSTOM_ERROR') {
        // 自定义处理
      } else {
        // 其他错误也显示
        ErrorHandler.showError(error);
      }
      throw error;
    }
  }
};
```

### 步骤 6: 环境变量配置

在 `client/.env` 中添加：

```bash
# API配置
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT=30000

# 应用版本
VITE_APP_VERSION=1.0.0
```

## 本地调试保证

### 开发环境详细错误

```typescript
const isDevelopment = import.meta.env.DEV;

// 开发环境显示详细错误
if (isDevelopment) {
  console.error('🚨 API错误:', errorResponse);
}
```

- ✅ 开发环境打印完整错误
- ✅ 生产环境只显示用户友好的消息
- ✅ 不影响调试

### 保持现有功能

```typescript
// 所有现有API调用保持不变
axios.get('/api/users')
axios.post('/api/users', data)

// 错误处理被自动拦截和统一
```

## 验证步骤

### 1. 测试标准错误响应

```typescript
// 测试400错误
try {
  await post('/users', { invalid: 'data' });
} catch (error: ErrorResponse) {
  console.log(error.error.code);    // 'VALIDATION_ERROR'
  console.log(error.error.message); // '请求参数错误'
}
```

### 2. 测试网络错误

```typescript
// 断开网络后测试
try {
  await get('/users');
} catch (error: ErrorResponse) {
  console.log(error.error.code);    // 'NETWORK_ERROR'
  console.log(error.error.message); // '网络连接失败，请检查网络设置'
}
```

### 3. 测试认证错误

```typescript
// 清除token后测试
localStorage.removeItem('kindergarten_token');

try {
  await get('/protected');
} catch (error: ErrorResponse) {
  console.log(error.error.code);    // 'UNAUTHORIZED'
  // 应该自动跳转到登录页
}
```

### 4. 测试静默请求

```typescript
// 测试不显示错误的请求
await get('/status', undefined, { silent: true });
// 即使失败也不会显示错误消息
```

### 5. 测试错误判断

```typescript
try {
  await get('/users');
} catch (error: ErrorResponse) {
  console.log('是否为网络错误:', ErrorHandler.isNetworkError(error));
  console.log('是否为认证错误:', ErrorHandler.isAuthError(error));
  console.log('是否为权限错误:', ErrorHandler.isPermissionError(error));
  console.log('是否为验证错误:', ErrorHandler.isValidationError(error));
}
```

## 回滚方案

如果新错误处理导致问题：

1. **禁用自动错误显示**：
   ```typescript
   await get('/users', undefined, { showError: false });
   ```

2. **完全跳过拦截器**：
   ```typescript
   // 使用原始axios
   import axios from 'axios';
   const response = await axios.get('/api/users');
   ```

3. **恢复旧的处理方式**：
   ```typescript
   // 恢复原来的catch块
   .catch(error => {
     // 旧的错误处理逻辑
   });
   ```

## 修复完成检查清单

- [ ] 错误类型定义已创建
- [ ] 错误处理器已创建
- [ ] request.ts已更新
- [ ] API包装器已创建
- [ ] 环境变量已配置
- [ ] 单元测试已通过
- [ ] 手动测试已通过
- [ ] 错误消息统一且友好
- [ ] 本地调试正常工作

## 风险评估

- **风险级别**: 低
- **影响范围**: 所有API调用
- **回滚难度**: 低（恢复旧代码）
- **本地调试影响**: 无（开发环境详细错误）

---

**修复时间估计**: 4-6 小时
**测试时间估计**: 2-3 小时
**总时间估计**: 6-9 小时
