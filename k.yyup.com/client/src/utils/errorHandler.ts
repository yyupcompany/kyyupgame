import { ElMessage, ElNotification } from "element-plus";
import router from "../router";
import { useUserStore } from "../stores/user";

export enum ErrorCode {
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
  TIMEOUT = "TIMEOUT",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  MISSING_REQUIRED_FIELDS = "MISSING_REQUIRED_FIELDS",
  INVALID_FORMAT = "INVALID_FORMAT",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  OPERATION_FAILED = "OPERATION_FAILED",
  INSUFFICIENT_PERMISSION = "INSUFFICIENT_PERMISSION",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  INVALID_STATUS = "INVALID_STATUS"
}

interface ErrorInfo {
  code: ErrorCode;
  message: string;
  detail?: any;
  statusCode?: number;
}

// 防止重复提示和跳转的标志
let isHandlingAuthError = false;
let authErrorTimer: NodeJS.Timeout | null = null;

export class ErrorHandler {
  static handle(error: any, showMessage = true): ErrorInfo {
    const errorInfo = this.parseError(error);

    switch (errorInfo.code) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.TOKEN_EXPIRED:
        // 防止并发401请求重复处理
        if (isHandlingAuthError) {
          // 如果已经在处理401错误，静默返回
          return errorInfo;
        }

        // 设置标志，防止重复处理
        isHandlingAuthError = true;

        // 使用userStore统一清除用户信息
        const userStore = useUserStore();
        userStore.clearUserInfo();

        // 清除所有token
        localStorage.removeItem("kindergarten_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("kindergarten_refresh_token");
        localStorage.removeItem("userInfo");

        // 只显示一次提示
        if (showMessage) {
          ElMessage.warning({
            message: "登录已过期，请重新登录",
            duration: 2000,
            showClose: true
          });
        }

        // 清除之前的定时器
        if (authErrorTimer) {
          clearTimeout(authErrorTimer);
        }

        // 延迟跳转到登录页，并重置标志
        authErrorTimer = setTimeout(() => {
          router.push("/login").finally(() => {
            // 跳转完成后重置标志
            setTimeout(() => {
              isHandlingAuthError = false;
            }, 1000);
          });
        }, 500);
        break;
      
      case ErrorCode.NETWORK_ERROR:
        if (showMessage) {
          ElNotification.error({
            title: "网络错误",
            message: "请检查网络连接",
            duration: 5000
          });
        }
        break;
      
      case ErrorCode.NOT_IMPLEMENTED:
        if (showMessage) {
          ElMessage.warning("该功能暂未开放");
        }
        break;
      
      case ErrorCode.VALIDATION_ERROR:
      case ErrorCode.MISSING_REQUIRED_FIELDS:
        if (showMessage) {
          ElMessage.error(errorInfo.message || "请检查输入信息");
        }
        break;
      
      case ErrorCode.NOT_FOUND:
        // 检查是否是需要静默处理的请求
        const url = error?.config?.url || error?.request?.responseURL || '';
        const isBasicInfoRequest = url.includes('/kindergarten/basic-info');
        const isPageGuideRequest = url.includes('/page-guides/by-path');
        const isAIKnowledgeRequest = url.includes('/ai-knowledge/by-page');

        // 对于基础资料、页面说明、AI知识库的404错误，静默处理
        if (showMessage && !isBasicInfoRequest && !isPageGuideRequest && !isAIKnowledgeRequest) {
          ElMessage.error("请求的资源不存在");
        } else if (isBasicInfoRequest) {
          console.log('幼儿园基本资料未配置，静默处理404错误');
        } else if (isPageGuideRequest) {
          console.log('页面说明文档未配置，静默处理404错误');
        } else if (isAIKnowledgeRequest) {
          console.log('AI知识库文档未配置，静默处理404错误');
        }
        break;
      
      case ErrorCode.ALREADY_EXISTS:
        if (showMessage) {
          ElMessage.error("资源已存在");
        }
        break;
      
      case ErrorCode.INSUFFICIENT_PERMISSION:
        if (showMessage) {
          ElMessage.error("权限不足");
        }
        break;
      
      case ErrorCode.TIMEOUT:
        if (showMessage) {
          ElMessage.error("请求超时，请稍后重试");
        }
        break;
      
      default:
        if (showMessage) {
          ElMessage.error(errorInfo.message || "操作失败");
        }
    }
    
    // 开发环境打印详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error("Error details:", errorInfo);
    }
    
    return errorInfo;
  }
  
  static parseError(error: any): ErrorInfo {
    // Axios错误响应
    if (error.response) {
      const data = error.response.data;
      const status = error.response.status;
      
      // 后端返回的标准错误格式
      if (data.error && data.error.code) {
        return {
          code: data.error.code as ErrorCode || ErrorCode.UNKNOWN_ERROR,
          message: data.error.message || this.getDefaultMessage(status),
          detail: data.error.detail,
          statusCode: status
        };
      }
      
      // 非标准格式
      return {
        code: this.getErrorCodeByStatus(status),
        message: data.message || data.msg || this.getDefaultMessage(status),
        detail: data,
        statusCode: status
      };
    }
    
    // 网络错误
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: "网络连接失败"
      };
    }
    
    // 超时错误
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return {
        code: ErrorCode.TIMEOUT,
        message: "请求超时"
      };
    }
    
    // 其他错误
    return {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message || "未知错误"
    };
  }
  
  private static getErrorCodeByStatus(status: number): ErrorCode {
    switch (status) {
      case 400:
        return ErrorCode.VALIDATION_ERROR;
      case 401:
        return ErrorCode.UNAUTHORIZED;
      case 403:
        return ErrorCode.INSUFFICIENT_PERMISSION;
      case 404:
        return ErrorCode.NOT_FOUND;
      case 409:
        return ErrorCode.ALREADY_EXISTS;
      case 501:
        return ErrorCode.NOT_IMPLEMENTED;
      case 504:
        return ErrorCode.TIMEOUT;
      default:
        return ErrorCode.UNKNOWN_ERROR;
    }
  }
  
  private static getDefaultMessage(status: number): string {
    switch (status) {
      case 400:
        return "请求参数错误";
      case 401:
        return "未授权，请先登录";
      case 403:
        return "没有权限访问此资源";
      case 404:
        return "请求的资源不存在";
      case 409:
        return "资源冲突";
      case 500:
        return "服务器内部错误";
      case 501:
        return "功能暂未实现";
      case 502:
        return "网关错误";
      case 503:
        return "服务暂时不可用";
      case 504:
        return "网关超时";
      default:
        return "请求失败";
    }
  }
  
  // 格式化验证错误
  static formatValidationErrors(errors: any): string {
    if (typeof errors === "string") {
      return errors;
    }
    
    if (Array.isArray(errors)) {
      return errors.map(err => err.message || err).join("；");
    }
    
    if (typeof errors === "object") {
      return Object.entries(errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join("；");
    }
    
    return "验证失败";
  }
  
  // 处理表单验证错误
  static handleFormErrors(errors: Record<string, string>, showMessage = true) {
    const firstError = Object.values(errors)[0];
    if (showMessage && firstError) {
      ElMessage.error(firstError);
    }
    return errors;
  }
  
  // 创建用户友好的错误消息
  static createUserFriendlyMessage(error: any): string {
    const errorInfo = this.parseError(error);
    
    switch (errorInfo.code) {
      case ErrorCode.NETWORK_ERROR:
        return "网络连接异常，请检查您的网络设置";
      case ErrorCode.TIMEOUT:
        return "请求超时，请检查网络后重试";
      case ErrorCode.UNAUTHORIZED:
        return "您尚未登录或登录已过期";
      case ErrorCode.INSUFFICIENT_PERMISSION:
        return "您没有权限执行此操作";
      case ErrorCode.NOT_FOUND:
        return "您访问的内容不存在";
      case ErrorCode.VALIDATION_ERROR:
        return errorInfo.detail ? this.formatValidationErrors(errorInfo.detail) : "输入信息有误，请检查后重试";
      default:
        return errorInfo.message || "操作失败，请稍后重试";
    }
  }
  
  // 批量错误处理
  static handleMultipleErrors(errors: any[], showMessage = true): ErrorInfo[] {
    return errors.map(error => this.handle(error, showMessage));
  }
  
  // 错误恢复建议
  static getRecoverySuggestion(errorCode: ErrorCode): string {
    switch (errorCode) {
      case ErrorCode.NETWORK_ERROR:
        return "请检查网络连接后重试";
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.TOKEN_EXPIRED:
        return "请重新登录";
      case ErrorCode.VALIDATION_ERROR:
        return "请检查输入信息是否正确";
      case ErrorCode.NOT_FOUND:
        return "请确认访问地址是否正确";
      case ErrorCode.INSUFFICIENT_PERMISSION:
        return "请联系管理员获取权限";
      case ErrorCode.TIMEOUT:
        return "请稍后重试或刷新页面";
      default:
        return "请稍后重试或联系技术支持";
    }
  }
}

// 导出错误代码映射
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNKNOWN_ERROR]: "未知错误",
  [ErrorCode.NETWORK_ERROR]: "网络连接错误",
  [ErrorCode.UNAUTHORIZED]: "未授权，请先登录",
  [ErrorCode.TOKEN_EXPIRED]: "登录已过期，请重新登录",
  [ErrorCode.VALIDATION_ERROR]: "数据验证失败",
  [ErrorCode.NOT_FOUND]: "资源不存在",
  [ErrorCode.NOT_IMPLEMENTED]: "功能暂未实现",
  [ErrorCode.TIMEOUT]: "请求超时",
  [ErrorCode.INVALID_CREDENTIALS]: "用户名或密码错误",
  [ErrorCode.MISSING_REQUIRED_FIELDS]: "缺少必填字段",
  [ErrorCode.INVALID_FORMAT]: "数据格式错误",
  [ErrorCode.ALREADY_EXISTS]: "资源已存在",
  [ErrorCode.OPERATION_FAILED]: "操作失败",
  [ErrorCode.INSUFFICIENT_PERMISSION]: "权限不足",
  [ErrorCode.QUOTA_EXCEEDED]: "超出配额限制",
  [ErrorCode.INVALID_STATUS]: "状态不允许此操作"
};

export type { ErrorInfo };