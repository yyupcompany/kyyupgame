/**
 * 从console-test-config.ts提取页面配置
 * 用于真实环境测试
 */

const fs = require('fs');
const path = require('path');

function extractPagesConfig() {
  const configPath = path.join(__dirname, 'console-test-config.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  const pages = [];
  
  // 解析模块配置
  const moduleRegex = /\/\/ (.+?)\n\s+(\w+):\s*\{\s*name:\s*'(.+?)',[\s\S]*?pages:\s*\[([\s\S]*?)\]/g;
  
  let match;
  while ((match = moduleRegex.exec(configContent)) !== null) {
    const moduleComment = match[1];
    const moduleKey = match[2];
    const moduleName = match[3];
    const pagesContent = match[4];
    
    // 解析页面配置
    const pageRegex = /\{\s*name:\s*'(.+?)',\s*path:\s*'(.+?)'/g;
    let pageMatch;
    
    while ((pageMatch = pageRegex.exec(pagesContent)) !== null) {
      const pageName = pageMatch[1];
      const pagePath = pageMatch[2];
      
      // 转换文件路径为URL路径
      let urlPath = '/' + pagePath
        .replace(/\.vue$/, '')
        .replace(/\/index$/, '')
        .replace(/^Login\//, 'login')
        .replace(/^dashboard\//, 'dashboard/')
        .replace(/^activity\//, 'activity/')
        .replace(/^ai\//, 'ai/')
        .replace(/^centers\//, 'centers/')
        .replace(/^enrollment\//, 'enrollment/')
        .replace(/^principal\//, 'principal/')
        .replace(/^system\//, 'system/')
        .replace(/^teacher\//, 'teacher/')
        .replace(/^marketing\//, 'marketing/')
        .replace(/^demo\//, 'demo/')
        .replace(/^mobile\//, 'mobile/')
        .replace(/^testing\//, 'testing/');
      
      // 特殊路径处理
      if (pageName === 'Login') urlPath = '/login';
      if (pageName === '403') urlPath = '/403';
      if (pageName === '404') urlPath = '/404';
      if (pageName === 'Register') urlPath = '/register';
      if (pageName === 'NotFound') urlPath = '/not-found';
      if (pageName === 'Error') urlPath = '/error';
      
      pages.push({
        name: pageName,
        path: urlPath,
        module: moduleName
      });
    }
  }
  
  return pages;
}

// 导出配置
if (require.main === module) {
  const pages = extractPagesConfig();
  console.log(`提取了 ${pages.length} 个页面配置`);
  console.log(JSON.stringify(pages, null, 2));
}

module.exports = { extractPagesConfig };

