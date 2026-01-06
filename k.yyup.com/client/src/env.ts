/**
 * 环境变量配置
 * 使用动态环境配置系统，解决硬编码问题
 */

import { environmentConfig, currentEnvironment } from './config/environment';

// 导出动态环境配置
const env = {
  // API相关配置 - 使用动态配置
  apiBaseUrl: environmentConfig.apiBaseUrl,
  apiDomains: environmentConfig.apiDomains,
  apiTimeout: environmentConfig.apiTimeout,
  useMockData: environmentConfig.enableMockData,

  // 登录相关
  tokenExpireTime: environmentConfig.tokenExpireTime,

  // 上传配置
  uploadUrl: environmentConfig.uploadUrl,
  uploadSizeLimit: environmentConfig.uploadSizeLimit,

  // 主题配置
  theme: import.meta.env.VITE_THEME || 'light',

  // 应用配置
  appName: environmentConfig.appName,
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appUrl: environmentConfig.appUrl,

  // 开发配置
  devHost: environmentConfig.devHost,
  hmrHost: environmentConfig.hmrHost,
  hmrPort: environmentConfig.hmrPort,
  wsUrl: environmentConfig.wsUrl,

  // 环境信息
  environment: currentEnvironment,
  isDevelopment: currentEnvironment === 'development',
  isProduction: currentEnvironment === 'production',
  isStaging: currentEnvironment === 'staging',
  enableDebug: environmentConfig.enableDebug,

  // 平台相关
  platform: 'pc'
}

// 如果是开发环境，输出环境配置
if (import.meta.env.DEV) {
  console.log('环境配置:', env);
  
  // 热模块更新处理
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      console.log('环境配置已更新');
    });
  }
}

export default env; 