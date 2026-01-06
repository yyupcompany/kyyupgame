#!/usr/bin/env node

/**
 * 文件分类分析脚本 - 分析Vue文件的类型和用途
 * File Classification Analysis Script - Analyze Vue file types and purposes
 */

const fs = require('fs');
const path = require('path');

// 统计结果
let stats = {
  total: 0,
  pages: 0,
  components: 0,
  views: 0,
  testFiles: 0,
  backupFiles: 0,
  demoFiles: 0,
  productionFiles: 0
};

// 文件分类
let fileCategories = {
  pages: [],
  components: [],
  views: [],
  testFiles: [],
  backupFiles: [],
  demoFiles: [],
  productionFiles: [],
  otherFiles: []
};

/**
 * 判断文件类型
 */
function classifyFile(filePath) {
  const fileName = path.basename(filePath);
  const dirPath = path.dirname(filePath);
  
  // 备份文件
  if (fileName.includes('-original') || fileName.includes('-backup') || 
      fileName.includes('-old') || fileName.includes('-copy') ||
      fileName.includes('.bak') || fileName.includes('.orig')) {
    return 'backupFiles';
  }
  
  // 测试文件
  if (fileName.includes('test') || fileName.includes('Test') || fileName.includes('spec') ||
      dirPath.includes('/test/') || dirPath.includes('/tests/')) {
    return 'testFiles';
  }
  
  // 演示文件
  if (fileName.includes('demo') || fileName.includes('Demo') || fileName.includes('example') ||
      dirPath.includes('/demo/') || dirPath.includes('/examples/')) {
    return 'demoFiles';
  }
  
  // 页面文件
  if (dirPath.includes('/pages/')) {
    return 'pages';
  }
  
  // 组件文件
  if (dirPath.includes('/components/')) {
    return 'components';
  }
  
  // 视图文件
  if (dirPath.includes('/views/')) {
    return 'views';
  }
  
  return 'otherFiles';
}

/**
 * 递归查找所有Vue文件
 */
function findVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 排除node_modules等目录
      if (!['node_modules', 'dist', '.git', 'coverage'].includes(file)) {
        findVueFiles(filePath, fileList);
      }
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始分析Vue文件分类...\n');
  
  try {
    // 查找所有Vue文件
    const allVueFiles = findVueFiles(process.cwd());
    stats.total = allVueFiles.length;
    
    console.log(`📁 找到 ${stats.total} 个Vue文件\n`);
    
    // 分类文件
    allVueFiles.forEach(filePath => {
      const category = classifyFile(filePath);
      fileCategories[category].push(filePath);
      stats[category]++;
    });
    
    // 输出统计结果
    console.log('📊 文件分类统计:');
    console.log(`   总文件数: ${stats.total}`);
    console.log(`   页面文件 (pages/): ${stats.pages}`);
    console.log(`   组件文件 (components/): ${stats.components}`);
    console.log(`   视图文件 (views/): ${stats.views}`);
    console.log(`   测试文件: ${stats.testFiles}`);
    console.log(`   备份文件: ${stats.backupFiles}`);
    console.log(`   演示文件: ${stats.demoFiles}`);
    console.log(`   其他文件: ${stats.otherFiles.length}`);
    
    // 计算生产环境文件数量
    stats.productionFiles = stats.pages + stats.components + stats.views - stats.testFiles - stats.backupFiles - stats.demoFiles;
    
    console.log(`\n🎯 生产环境相关文件: ${stats.productionFiles}`);
    
    // 详细列出测试文件
    if (fileCategories.testFiles.length > 0) {
      console.log('\n🧪 测试文件列表:');
      fileCategories.testFiles.slice(0, 20).forEach(file => {
        console.log(`   - ${file}`);
      });
      if (fileCategories.testFiles.length > 20) {
        console.log(`   ... 还有 ${fileCategories.testFiles.length - 20} 个测试文件`);
      }
    }
    
    // 详细列出备份文件
    if (fileCategories.backupFiles.length > 0) {
      console.log('\n💾 备份文件列表:');
      fileCategories.backupFiles.forEach(file => {
        console.log(`   - ${file}`);
      });
    }
    
    // 详细列出演示文件
    if (fileCategories.demoFiles.length > 0) {
      console.log('\n🎭 演示文件列表:');
      fileCategories.demoFiles.forEach(file => {
        console.log(`   - ${file}`);
      });
    }
    
    // 核心页面目录分析
    console.log('\n📂 核心目录分析:');
    console.log(`   src/pages/: ${stats.pages} 个文件`);
    console.log(`   src/components/: ${stats.components} 个文件`);
    console.log(`   src/views/: ${stats.views} 个文件`);
    
    // 实际生产页面统计（排除测试、备份、演示）
    const actualPages = fileCategories.pages.filter(file => 
      !file.includes('test') && !file.includes('demo') && !file.includes('example')
    ).length;
    
    console.log(`\n🏠 实际生产页面数: ${actualPages}`);
    
    // 保存详细报告
    const reportPath = path.join(process.cwd(), 'vue-file-classification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats,
      fileCategories
    }, null, 2));
    
    console.log(`\n📄 详细报告已保存到: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ 分析过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { classifyFile, findVueFiles };