const fs = require('fs');
const path = require('path');

// 扫描目录
const pagesDir = path.join(__dirname, 'client/src/pages');

// 结果存储
const results = [];

// 未实现的标志
const unimplementedPatterns = [
  /待实现/,
  /TODO/,
  /FIXME/,
  /未实现/,
  /暂不支持/,
  /功能开发中/,
  /ElMessage\.info\(['"].*待.*['"]\)/,
  /console\.log\(['"].*待.*['"]\)/,
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
  const unimplementedButtons = [];
  
  // 提取script部分
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  const scriptContent = scriptMatch ? scriptMatch[1] : '';
  
  // 查找el-button标签
  const buttonRegex = /<el-button[^>]*>([\s\S]*?)<\/el-button>/gi;
  let match;
  
  while ((match = buttonRegex.exec(content)) !== null) {
    const buttonContent = match[1];
    const fullButton = match[0];
    
    // 提取按钮文本
    let buttonText = buttonContent
      .replace(/<el-icon[^>]*>[\s\S]*?<\/el-icon>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    
    // 提取@click事件
    const clickMatch = fullButton.match(/@click="([^"]+)"/);
    const clickEvent = clickMatch ? clickMatch[1] : '';
    
    if (!clickEvent || clickEvent === '-') {
      // 没有点击事件
      unimplementedButtons.push({
        text: buttonText || '(无文本)',
        event: '(无点击事件)',
        reason: '未绑定点击事件',
        line: getLineNumber(content, match.index)
      });
      continue;
    }
    
    // 检查是否是简单的赋值或内联代码
    if (clickEvent.includes('=') || clickEvent.includes('++') || clickEvent.includes('--')) {
      continue; // 内联代码，认为已实现
    }
    
    // 提取函数名
    const funcName = clickEvent.split('(')[0].trim();
    
    // 检查函数是否存在
    const funcPattern = new RegExp(`(const|let|var|function)\\s+${funcName}\\s*[=:]`, 'g');
    const funcExists = funcPattern.test(scriptContent);
    
    if (!funcExists) {
      unimplementedButtons.push({
        text: buttonText || '(无文本)',
        event: clickEvent,
        reason: '函数未定义',
        line: getLineNumber(content, match.index)
      });
      continue;
    }
    
    // 检查函数实现
    const funcDefMatch = scriptContent.match(
      new RegExp(`(?:const|let|var|function)\\s+${funcName}\\s*[=:]?\\s*(?:\\([^)]*\\))?\\s*(?:=>)?\\s*\\{([\\s\\S]*?)\\}`, 'g')
    );
    
    if (funcDefMatch) {
      const funcBody = funcDefMatch[0];
      
      // 检查是否包含未实现标志
      for (const pattern of unimplementedPatterns) {
        if (pattern.test(funcBody)) {
          unimplementedButtons.push({
            text: buttonText || '(无文本)',
            event: clickEvent,
            reason: '函数标记为待实现',
            line: getLineNumber(content, match.index),
            funcBody: funcBody.substring(0, 200) + '...'
          });
          break;
        }
      }
      
      // 检查函数体是否为空或只有注释
      const cleanBody = funcBody
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, '');
      
      if (cleanBody.length < 50) { // 函数体太短，可能未实现
        const hasRealCode = /(?:await|return|if|for|while|const|let|var|=)/.test(cleanBody);
        if (!hasRealCode) {
          unimplementedButtons.push({
            text: buttonText || '(无文本)',
            event: clickEvent,
            reason: '函数体为空或过于简单',
            line: getLineNumber(content, match.index)
          });
        }
      }
    }
  }
  
  if (unimplementedButtons.length > 0) {
    results.push({
      file: relativePath,
      buttons: unimplementedButtons
    });
  }
}

// 获取行号
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

// 生成Markdown报告
function generateReport() {
  let markdown = '# 未实现按钮检测报告\n\n';
  markdown += `> 扫描时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  markdown += `> 扫描目录: client/src/pages\n\n`;
  markdown += `> 包含未实现按钮的页面数: ${results.length}\n\n`;
  
  // 统计总按钮数
  const totalButtons = results.reduce((sum, item) => sum + item.buttons.length, 0);
  markdown += `> 未实现按钮总数: ${totalButtons}\n\n`;
  
  markdown += '---\n\n';
  markdown += '## 📋 概览\n\n';
  
  // 按原因分类统计
  const reasonStats = {};
  results.forEach(item => {
    item.buttons.forEach(button => {
      reasonStats[button.reason] = (reasonStats[button.reason] || 0) + 1;
    });
  });
  
  markdown += '### 未实现原因统计\n\n';
  markdown += '| 原因 | 数量 |\n';
  markdown += '|------|------|\n';
  
  Object.entries(reasonStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([reason, count]) => {
      markdown += `| ${reason} | ${count} |\n`;
    });
  
  markdown += '\n---\n\n';
  markdown += '## 📄 详细列表\n\n';
  
  // 生成详细列表
  results.forEach((item, index) => {
    const pageName = item.file.replace(/\\/g, '/').replace('.vue', '');
    markdown += `### ${index + 1}. ${pageName}\n\n`;
    markdown += `**文件路径**: \`client/src/pages/${item.file}\`\n\n`;
    markdown += `**未实现按钮数量**: ${item.buttons.length}\n\n`;
    
    // 按钮列表
    markdown += '| 序号 | 按钮文本 | 点击事件 | 未实现原因 | 行号 |\n';
    markdown += '|------|----------|----------|------------|------|\n';
    
    item.buttons.forEach((button, btnIndex) => {
      markdown += `| ${btnIndex + 1} | ${button.text} | ${button.event} | ${button.reason} | ${button.line} |\n`;
    });
    
    markdown += '\n';
  });
  
  markdown += '---\n\n';
  markdown += `**报告生成完成** - ${new Date().toLocaleString('zh-CN')}\n`;
  
  return markdown;
}

// 主函数
function main() {
  console.log('🔍 开始扫描未实现的按钮...');
  console.log(`📁 扫描目录: ${pagesDir}`);
  
  scanDirectory(pagesDir);
  
  console.log(`✅ 扫描完成！`);
  console.log(`📄 找到 ${results.length} 个包含未实现按钮的页面`);
  
  const totalButtons = results.reduce((sum, item) => sum + item.buttons.length, 0);
  console.log(`🔘 未实现按钮总数: ${totalButtons}`);
  
  console.log('\n📝 生成报告...');
  const markdown = generateReport();
  
  const outputPath = path.join(__dirname, '未实现按钮检测报告.md');
  fs.writeFileSync(outputPath, markdown, 'utf-8');
  
  console.log(`✅ 报告已生成: ${outputPath}`);
}

main();

