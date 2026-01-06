/**
 * 动态环境配置系统
 * 解决硬编码问题，支持多环境自动适配
 */

// 环境类型定义
export type Environment = 'development' | 'production' | 'test' | 'staging';

// 环境配置接口
export interface EnvironmentConfig {
  // API配置
  apiBaseUrl: string;
  apiTimeout: number;
  apiDomains: string[];
  
  // 应用配置
  appUrl: string;
  appName: string;
  
  // 开发配置
  devHost: string;
  hmrHost: string;
  hmrPort: number;
  wsUrl: string;
  
  // 上传配置
  uploadUrl: string;
  uploadSizeLimit: number;
  
  // 认证配置
  tokenExpireTime: number;
  
  // 功能开关
  enableMockData: boolean;
  enableDebug: boolean;
}

// 默认配置
const defaultConfig: EnvironmentConfig = {
  apiBaseUrl: '/api',
  apiTimeout: 15000,
  apiDomains: [],
  appUrl: '',
  appName: '幼儿园管理系统',
  devHost: 'localhost',
  hmrHost: 'localhost',
  hmrPort: 24678,
  wsUrl: '',
  uploadUrl: '/api/upload',
  uploadSizeLimit: 10 * 1024 * 1024,
  tokenExpireTime: 86400,
  enableMockData: false,
  enableDebug: false
};

// 环境检测函数
export function detectEnvironment(): Environment {
  // 优先使用环境变量
  if (import.meta.env.VITE_NODE_ENV) {
    return import.meta.env.VITE_NODE_ENV as Environment;
  }
  
  // 根据构建模式判断
  if (import.meta.env.DEV) {
    return 'development';
  }
  
  if (import.meta.env.PROD) {
    return 'production';
  }
  
  // 根据域名判断
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    
    if (hostname.includes('test') || hostname.includes('staging')) {
      return 'staging';
    }
  }
  
  return 'production';
}

// 动态配置生成函数
export function generateEnvironmentConfig(): EnvironmentConfig {
  const env = detectEnvironment();
  const config = { ...defaultConfig };
  
  // 从环境变量读取配置
  config.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl();
  config.apiTimeout = Number(import.meta.env.VITE_API_TIMEOUT) || config.apiTimeout;
  config.appUrl = import.meta.env.VITE_APP_URL || getDefaultAppUrl();
  config.appName = import.meta.env.VITE_APP_NAME || config.appName;
  config.devHost = import.meta.env.VITE_DEV_HOST || config.devHost;
  config.hmrHost = import.meta.env.VITE_HMR_HOST || config.hmrHost;
  config.hmrPort = Number(import.meta.env.VITE_HMR_CLIENT_PORT) || config.hmrPort;
  config.wsUrl = import.meta.env.VITE_WS_URL || getDefaultWsUrl();
  config.uploadUrl = import.meta.env.VITE_UPLOAD_URL || config.uploadUrl;
  config.uploadSizeLimit = Number(import.meta.env.VITE_UPLOAD_SIZE_LIMIT) || config.uploadSizeLimit;
  config.tokenExpireTime = Number(import.meta.env.VITE_TOKEN_EXPIRE_TIME) || config.tokenExpireTime;
  
  // 解析API域名列表
  if (import.meta.env.VITE_API_DOMAINS) {
    config.apiDomains = import.meta.env.VITE_API_DOMAINS.split(',').map((d: string) => d.trim());
  } else {
    config.apiDomains = getDefaultApiDomains();
  }
  
  // 环境特定配置
  switch (env) {
    case 'development':
      config.enableMockData = import.meta.env.VITE_ENABLE_MOCK === 'true';
      config.enableDebug = true;
      break;
      
    case 'staging':
      config.enableDebug = import.meta.env.VITE_ENABLE_DEBUG === 'true';
      break;
      
    case 'production':
      config.enableMockData = false;
      config.enableDebug = false;
      break;
  }
  
  return config;
}

// 获取默认API基础URL
function getDefaultApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '/api';
  }
  
  const { protocol, hostname } = window.location;
  
  // 开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // 开发环境使用vite代理，使用相对路径
    return '/api';
  }
  
  // 生产环境使用相对路径
  return '/api';
}

// 获取默认应用URL
function getDefaultAppUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  return `${window.location.protocol}//${window.location.host}`;
}

// 获取默认WebSocket URL
function getDefaultWsUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  const { protocol, hostname } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  
  // 开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${wsProtocol}//${hostname}:5173`;
  }
  
  return '';
}

// 获取默认API域名列表
function getDefaultApiDomains(): string[] {
  const domains: string[] = [];
  
  // 添加当前域名
  if (typeof window !== 'undefined') {
    domains.push(`${window.location.protocol}//${window.location.host}`);
  }
  
  // 添加备用域名（可以通过环境变量配置）
  if (import.meta.env.VITE_API_PROXY_TARGET) {
    domains.push(import.meta.env.VITE_API_PROXY_TARGET);
  }
  
  return domains;
}

// 导出当前环境配置
export const currentEnvironment = detectEnvironment();
export const environmentConfig = generateEnvironmentConfig();

// 开发环境日志
if (environmentConfig.enableDebug) {
  console.log('🔧 环境配置:', {
    environment: currentEnvironment,
    config: environmentConfig
  });
}
