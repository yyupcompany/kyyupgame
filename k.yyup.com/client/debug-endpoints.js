// 临时调试文件
console.log('=== 端点配置调试 ===');

// 检查API_PREFIX
const API_PREFIX = '';
console.log('API_PREFIX:', `"${API_PREFIX}"`);

// 检查POSTER_TEMPLATES端点
const POSTER_TEMPLATES = `${API_PREFIX}/principal/poster-templates`;
console.log('POSTER_TEMPLATES:', POSTER_TEMPLATES);

// 检查完整URL
const baseURL = '/api';
const fullURL = baseURL + POSTER_TEMPLATES;
console.log('完整URL:', fullURL);

// 检查是否有重复的API前缀
if (fullURL.includes('/api/api/')) {
  console.log('❌ 发现重复的API前缀!');
  console.log('baseURL:', baseURL);
  console.log('endpoint:', POSTER_TEMPLATES);
  console.log('结果:', fullURL);
} else {
  console.log('✅ 没有重复的API前缀');
}