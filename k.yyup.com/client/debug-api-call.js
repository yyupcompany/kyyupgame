// 调试API调用
console.log('=== API调用调试 ===');

// 模拟API_PREFIX
const API_PREFIX = '';

// 模拟PRINCIPAL_ENDPOINTS
const PRINCIPAL_ENDPOINTS = {
  POSTER_TEMPLATES: `${API_PREFIX}/principal/poster-templates`,
};

// 模拟axios的baseURL
const baseURL = '/api';

// 模拟实际请求
const endpoint = PRINCIPAL_ENDPOINTS.POSTER_TEMPLATES;
console.log('端点:', endpoint);

// 检查是否有重复的API前缀
if (endpoint.startsWith('/api/')) {
  console.log('❌ 端点本身包含/api/前缀!');
  console.log('这会导致重复的API前缀');
  console.log('baseURL + endpoint =', baseURL + endpoint);
} else {
  console.log('✅ 端点不包含/api/前缀');
  console.log('baseURL + endpoint =', baseURL + endpoint);
}

// 检查完整URL
const fullURL = baseURL + endpoint;
console.log('完整URL:', fullURL);

if (fullURL.includes('/api/api/')) {
  console.log('❌ 发现重复的API前缀!');
} else {
  console.log('✅ 没有重复的API前缀');
}