const fs = require('fs');
const path = require('path');

// 扫描目录
const pagesDir = path.join(__dirname, 'client/src/pages');

// 结果存储
const results = [];

// 按钮关键词
const buttonKeywords = [
  '添加', '新增', '新建', '创建', '编辑', '修改', '删除', '导出', '导入', 
  '保存', '提交', '取消', '确定', '查询', '搜索', '筛选', '刷新', '重置',
  '上传', '下载', '打印', '审核', '通过', '拒绝', '发布', '撤回'
];

// 递归扫描文件
function scanDirectory(dir, relativePath = '') {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.join(relativePath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, relPath);
    } else if (file.endsWith('.vue')) {
      scanVueFile(fullPath, relPath);
    }
  }
}

// 扫描Vue文件
function scanVueFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const buttons = [];
  
  // 查找el-button标签
  const buttonRegex = /<el-button[^>]*>([\s\S]*?)<\/el-button>/gi;
  let match;
  
  while ((match = buttonRegex.exec(content)) !== null) {
    const buttonContent = match[1];
    const fullButton = match[0];
    
    // 提取按钮文本
    let buttonText = buttonContent
      .replace(/<el-icon[^>]*>[\s\S]*?<\/el-icon>/gi, '') // 移除图标
      .replace(/<[^>]+>/g, '') // 移除其他HTML标签
      .trim();
    
    // 提取type属性
    const typeMatch = fullButton.match(/type="([^"]+)"/);
    const buttonType = typeMatch ? typeMatch[1] : 'default';
    
    // 提取@click事件
    const clickMatch = fullButton.match(/@click="([^"]+)"/);
    const clickEvent = clickMatch ? clickMatch[1] : '';
    
    // 检查是否包含关键词
    const hasKeyword = buttonKeywords.some(keyword => 
      buttonText.includes(keyword) || clickEvent.includes(keyword)
    );
    
    if (buttonText || hasKeyword) {
      buttons.push({
        text: buttonText || '(无文本)',
        type: buttonType,
        event: clickEvent,
        hasKeyword
      });
    }
  }
  
  // 查找button标签（非el-button）
  const htmlButtonRegex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
  while ((match = htmlButtonRegex.exec(content)) !== null) {
    const buttonContent = match[1];
    const fullButton = match[0];
    
    let buttonText = buttonContent
      .replace(/<[^>]+>/g, '')
      .trim();
    
    const clickMatch = fullButton.match(/@click="([^"]+)"/);
    const clickEvent = clickMatch ? clickMatch[1] : '';
    
    const hasKeyword = buttonKeywords.some(keyword => 
      buttonText.includes(keyword) || clickEvent.includes(keyword)
    );
    
    if (buttonText || hasKeyword) {
      buttons.push({
        text: buttonText || '(无文本)',
        type: 'html-button',
        event: clickEvent,
        hasKeyword
      });
    }
  }
  
  if (buttons.length > 0) {
    results.push({
      file: relativePath,
      buttons: buttons
    });
  }
}

// 生成Markdown报告
function generateReport() {
  let markdown = '# 按钮检测报告\n\n';
  markdown += `> 扫描时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  markdown += `> 扫描目录: client/src/pages\n\n`;
  markdown += `> 扫描文件数: ${results.length}\n\n`;
  
  // 统计总按钮数
  const totalButtons = results.reduce((sum, item) => sum + item.buttons.length, 0);
  markdown += `> 总按钮数: ${totalButtons}\n\n`;
  
  markdown += '---\n\n';
  markdown += '## 目录\n\n';
  
  // 生成目录
  results.forEach((item, index) => {
    const pageName = item.file.replace(/\\/g, '/').replace('.vue', '');
    markdown += `${index + 1}. [${pageName}](#${index + 1}-${pageName.replace(/[\/\[\]]/g, '-')})\n`;
  });
  
  markdown += '\n---\n\n';
  markdown += '## 详细列表\n\n';
  
  // 生成详细列表
  results.forEach((item, index) => {
    const pageName = item.file.replace(/\\/g, '/').replace('.vue', '');
    markdown += `### ${index + 1}. ${pageName}\n\n`;
    markdown += `**文件路径**: \`client/src/pages/${item.file}\`\n\n`;
    markdown += `**按钮数量**: ${item.buttons.length}\n\n`;
    
    // 按钮列表
    markdown += '| 序号 | 按钮文本 | 类型 | 点击事件 | 包含关键词 |\n';
    markdown += '|------|----------|------|----------|------------|\n';
    
    item.buttons.forEach((button, btnIndex) => {
      markdown += `| ${btnIndex + 1} | ${button.text} | ${button.type} | ${button.event || '-'} | ${button.hasKeyword ? '✅' : '❌'} |\n`;
    });
    
    markdown += '\n';
  });
  
  // 统计信息
  markdown += '---\n\n';
  markdown += '## 统计信息\n\n';
  
  // 按关键词统计
  const keywordStats = {};
  buttonKeywords.forEach(keyword => {
    keywordStats[keyword] = 0;
  });
  
  results.forEach(item => {
    item.buttons.forEach(button => {
      buttonKeywords.forEach(keyword => {
        if (button.text.includes(keyword) || button.event.includes(keyword)) {
          keywordStats[keyword]++;
        }
      });
    });
  });
  
  markdown += '### 按钮关键词统计\n\n';
  markdown += '| 关键词 | 出现次数 |\n';
  markdown += '|--------|----------|\n';
  
  Object.entries(keywordStats)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([keyword, count]) => {
      markdown += `| ${keyword} | ${count} |\n`;
    });
  
  markdown += '\n';
  
  // 按类型统计
  const typeStats = {};
  results.forEach(item => {
    item.buttons.forEach(button => {
      typeStats[button.type] = (typeStats[button.type] || 0) + 1;
    });
  });
  
  markdown += '### 按钮类型统计\n\n';
  markdown += '| 类型 | 数量 |\n';
  markdown += '|------|------|\n';
  
  Object.entries(typeStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      markdown += `| ${type} | ${count} |\n`;
    });
  
  markdown += '\n---\n\n';
  markdown += `**报告生成完成** - ${new Date().toLocaleString('zh-CN')}\n`;
  
  return markdown;
}

// 主函数
function main() {
  console.log('🔍 开始扫描页面按钮...');
  console.log(`📁 扫描目录: ${pagesDir}`);
  
  scanDirectory(pagesDir);
  
  console.log(`✅ 扫描完成！`);
  console.log(`📄 找到 ${results.length} 个包含按钮的页面`);
  
  const totalButtons = results.reduce((sum, item) => sum + item.buttons.length, 0);
  console.log(`🔘 总按钮数: ${totalButtons}`);
  
  console.log('\n📝 生成报告...');
  const markdown = generateReport();
  
  const outputPath = path.join(__dirname, '按钮检测001.md');
  fs.writeFileSync(outputPath, markdown, 'utf-8');
  
  console.log(`✅ 报告已生成: ${outputPath}`);
}

main();

