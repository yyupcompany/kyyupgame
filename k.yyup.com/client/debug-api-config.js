// 调试API配置脚本
// 模拟前端环境变量和配置

console.log('🔍 调试API配置...\n');

// 模拟不同环境下的环境变量
const environments = {
  development: {
    DEV: true,
    PROD: false,
    VITE_API_BASE_URL: '',
    VITE_NODE_ENV: 'development'
  },
  production: {
    DEV: false,
    PROD: true,
    VITE_API_BASE_URL: 'https://localhost:5173',
    VITE_NODE_ENV: 'production'
  },
  current: {
    // 当前实际环境变量
    DEV: process.env.NODE_ENV !== 'production',
    PROD: process.env.NODE_ENV === 'production',
    VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || '',
    VITE_NODE_ENV: process.env.VITE_NODE_ENV || process.env.NODE_ENV || 'development'
  }
};

// 模拟env.ts的逻辑
function createEnvConfig(envVars) {
  return {
    apiBaseUrl: envVars.VITE_API_BASE_URL || '',
    apiDomains: [
      'https://localhost:5173',
      'https://shlxlyzagqnc.sealoshzh.site',
      'http://127.0.0.1:3000',
      'http://server:3000'
    ],
    isDevelopment: envVars.DEV,
    isProduction: envVars.PROD
  };
}

// 模拟request.ts的baseURL逻辑
function getBaseURL(env) {
  return env.isDevelopment ? 'https://shlxlyzagqnc.sealoshzh.site' : (env.apiDomains?.[0] || env.apiBaseUrl);
}

// 测试不同环境的配置
Object.entries(environments).forEach(([envName, envVars]) => {
  console.log(`📋 ${envName.toUpperCase()} 环境:`);
  console.log(`  环境变量:`);
  console.log(`    DEV: ${envVars.DEV}`);
  console.log(`    PROD: ${envVars.PROD}`);
  console.log(`    VITE_API_BASE_URL: "${envVars.VITE_API_BASE_URL}"`);
  console.log(`    VITE_NODE_ENV: "${envVars.VITE_NODE_ENV}"`);
  
  const env = createEnvConfig(envVars);
  const baseURL = getBaseURL(env);
  
  console.log(`  计算结果:`);
  console.log(`    env.apiBaseUrl: "${env.apiBaseUrl}"`);
  console.log(`    env.isDevelopment: ${env.isDevelopment}`);
  console.log(`    env.isProduction: ${env.isProduction}`);
  console.log(`    最终baseURL: "${baseURL}"`);
  console.log('');
});

// 测试API请求URL构建
console.log('🔗 API请求URL测试:');
const testEndpoints = [
  '/api/auth/login',
  '/api/permissions/check-page',
  '/api/auth/me'
];

Object.entries(environments).forEach(([envName, envVars]) => {
  console.log(`\n${envName.toUpperCase()} 环境下的API URL:`);
  const env = createEnvConfig(envVars);
  const baseURL = getBaseURL(env);
  
  testEndpoints.forEach(endpoint => {
    const fullURL = baseURL + endpoint;
    console.log(`  ${endpoint} → ${fullURL}`);
  });
});

// 检查当前实际环境
console.log('\n🌍 当前实际环境检查:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`  VITE_API_BASE_URL: ${process.env.VITE_API_BASE_URL || 'undefined'}`);
console.log(`  VITE_NODE_ENV: ${process.env.VITE_NODE_ENV || 'undefined'}`);

// 推荐的解决方案
console.log('\n💡 解决方案建议:');
console.log('1. 确保生产环境构建时 VITE_API_BASE_URL=https://localhost:5173');
console.log('2. 或者修改逻辑，在外网访问时自动使用当前域名');
console.log('3. 检查部署脚本是否正确设置了环境变量');

// 创建修复建议
console.log('\n🔧 修复代码建议:');
console.log(`
// 在 request.ts 中修改 baseURL 逻辑:
const getApiBaseURL = () => {
  // 如果是通过外网域名访问，使用当前域名
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  
  // 否则使用环境变量配置
  return env.isDevelopment ? 'https://shlxlyzagqnc.sealoshzh.site' : (env.apiBaseUrl || env.apiDomains[0]);
};

const service = axios.create({
  baseURL: getApiBaseURL(),
  timeout: env.apiTimeout || 10000,
  withCredentials: false
});
`);