const fs = require('fs');
const path = require('path');

// 只用于检测和列出所有页面，不做任何修改
function listAllPages() {
  const pagesDir = path.join(__dirname, '../client/src/pages');
  const allPages = [];
  
  function scanDirectory(dir, basePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 递归扫描子目录
          scanDirectory(fullPath, basePath + '/' + item);
        } else if (item.endsWith('.vue') && item !== 'index.vue') {
          // Vue文件（除了index.vue）
          const pagePath = basePath + '/' + item.replace('.vue', '');
          allPages.push({
            name: item.replace('.vue', ''),
            path: pagePath,
            file: basePath + '/' + item,
            type: 'component'
          });
        } else if (item === 'index.vue') {
          // 主页面
          const pagePath = basePath || '/';
          allPages.push({
            name: basePath.split('/').pop() || 'home',
            path: pagePath,
            file: basePath + '/index.vue',
            type: 'main'
          });
        }
      }
    } catch (error) {
      console.error(`扫描目录 ${dir} 时出错:`, error.message);
    }
  }
  
  console.log('🔍 开始扫描所有页面...');
  scanDirectory(pagesDir);
  
  // 按模块分组
  const modules = {};
  allPages.forEach(page => {
    const module = page.path.split('/')[1] || 'root';
    if (!modules[module]) {
      modules[module] = [];
    }
    modules[module].push(page);
  });
  
  console.log('\n📊 页面统计:');
  console.log(`总页面数: ${allPages.length}`);
  console.log(`模块数: ${Object.keys(modules).length}`);
  
  console.log('\n📋 按模块分组的页面列表:');
  Object.keys(modules).sort().forEach(module => {
    console.log(`\n🔹 ${module} (${modules[module].length}个页面):`);
    modules[module].forEach(page => {
      console.log(`  - ${page.name} (${page.path}) [${page.type}]`);
    });
  });
  
  // 生成任务创建建议
  console.log('\n📝 需要创建的任务建议:');
  Object.keys(modules).sort().forEach(module => {
    if (module !== 'root' && modules[module].length > 0) {
      console.log(`\n${module}模块任务:`);
      modules[module].forEach(page => {
        const taskTitle = `${page.name}页面(${page.path})检查`;
        console.log(`  - ${taskTitle}`);
      });
    }
  });
  
  return { allPages, modules };
}

// 运行扫描（只检测，不修改）
listAllPages();
