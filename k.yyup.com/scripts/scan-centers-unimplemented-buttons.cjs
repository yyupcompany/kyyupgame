#!/usr/bin/env node

/**
 * 扫描centers目录下的未实现按钮
 * 只检测 client/src/pages/centers/ 目录下的Vue文件
 */

const fs = require('fs');
const path = require('path');

// 配置
const CENTERS_DIR = path.join(__dirname, '../client/src/pages/centers');
const OUTPUT_FILE = path.join(__dirname, '../centers未实现按钮检测报告.md');

// 统计数据
const stats = {
  totalFiles: 0,
  filesWithUnimplemented: 0,
  totalUnimplementedButtons: 0,
  byReason: {
    '函数标记为待实现': 0,
    '未绑定点击事件': 0,
    '函数未定义': 0
  }
};

// 存储所有未实现按钮的详细信息
const unimplementedButtons = [];

/**
 * 检查函数是否标记为待实现
 */
function isFunctionMarkedAsUnimplemented(content, functionName) {
  // 查找函数定义
  const functionPatterns = [
    new RegExp(`(const|let|var)\\s+${functionName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*{([^}]*)}`, 's'),
    new RegExp(`function\\s+${functionName}\\s*\\([^)]*\\)\\s*{([^}]*)}`, 's'),
    new RegExp(`${functionName}\\s*\\([^)]*\\)\\s*{([^}]*)}`, 's')
  ];

  for (const pattern of functionPatterns) {
    const match = content.match(pattern);
    if (match) {
      const functionBody = match[2] || match[1];
      // 检查是否包含待实现标记
      if (
        functionBody.includes('TODO') ||
        functionBody.includes('待实现') ||
        functionBody.includes('开发中') ||
        functionBody.includes('功能开发中') ||
        functionBody.includes('console.log') && functionBody.trim().split('\n').length <= 3
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 检查函数是否存在
 */
function isFunctionDefined(content, functionName) {
  const patterns = [
    new RegExp(`(const|let|var)\\s+${functionName}\\s*=`),
    new RegExp(`function\\s+${functionName}\\s*\\(`),
    new RegExp(`${functionName}\\s*\\([^)]*\\)\\s*{`)
  ];
  return patterns.some(pattern => pattern.test(content));
}

/**
 * 扫描Vue文件中的未实现按钮
 */
function scanVueFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const buttons = [];

  // 匹配按钮的正则表达式
  const buttonPatterns = [
    /<el-button[^>]*@click="([^"]+)"[^>]*>([^<]+)<\/el-button>/g,
    /<el-button[^>]*>([^<]+)<\/el-button>/g,
    /<button[^>]*@click="([^"]+)"[^>]*>([^<]+)<\/button>/g,
    /<button[^>]*>([^<]+)<\/button>/g
  ];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // 检查所有按钮模式
    for (const pattern of buttonPatterns) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(line)) !== null) {
        const clickHandler = match[1];
        const buttonText = match[2] || match[1];

        // 跳过一些明显已实现的按钮
        if (!clickHandler || clickHandler.includes('$router') || clickHandler.includes('visible')) {
          continue;
        }

        // 提取函数名
        const functionMatch = clickHandler.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (!functionMatch) continue;

        const functionName = functionMatch[1];

        // 检查未实现原因
        let reason = null;
        if (!clickHandler || clickHandler.trim() === '') {
          reason = '未绑定点击事件';
        } else if (!isFunctionDefined(content, functionName)) {
          reason = '函数未定义';
        } else if (isFunctionMarkedAsUnimplemented(content, functionName)) {
          reason = '函数标记为待实现';
        }

        if (reason) {
          buttons.push({
            text: buttonText.trim(),
            clickEvent: clickHandler || '(无点击事件)',
            reason,
            lineNumber
          });
          stats.totalUnimplementedButtons++;
          stats.byReason[reason]++;
        }
      }
    }
  });

  return buttons;
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 跳过备份文件和node_modules
      if (!file.includes('.backup') && file !== 'node_modules') {
        scanDirectory(filePath, baseDir);
      }
    } else if (file.endsWith('.vue') && !file.includes('.backup')) {
      stats.totalFiles++;
      const buttons = scanVueFile(filePath);

      if (buttons.length > 0) {
        stats.filesWithUnimplemented++;
        const relativePath = path.relative(path.join(__dirname, '..'), filePath);
        unimplementedButtons.push({
          file: relativePath,
          name: path.basename(file, '.vue'),
          buttons
        });
      }
    }
  });
}

/**
 * 生成Markdown报告
 */
function generateReport() {
  const now = new Date();
  const timestamp = now.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false 
  }).replace(/\//g, '/');

  let report = `# Centers目录未实现按钮检测报告\n\n`;
  report += `> 扫描时间: ${timestamp}\n\n`;
  report += `> 扫描目录: client/src/pages/centers\n\n`;
  report += `> 包含未实现按钮的页面数: ${stats.filesWithUnimplemented}\n\n`;
  report += `> 未实现按钮总数: ${stats.totalUnimplementedButtons}\n\n`;
  report += `---\n\n`;

  // 概览
  report += `## 📋 概览\n\n`;
  report += `### 未实现原因统计\n\n`;
  report += `| 原因 | 数量 |\n`;
  report += `|------|------|\n`;
  Object.entries(stats.byReason).forEach(([reason, count]) => {
    report += `| ${reason} | ${count} |\n`;
  });
  report += `\n---\n\n`;

  // 详细列表
  report += `## 📄 详细列表\n\n`;

  unimplementedButtons.forEach((item, index) => {
    report += `### ${index + 1}. ${item.name}\n\n`;
    report += `**文件路径**: \`${item.file}\`\n\n`;
    report += `**未实现按钮数量**: ${item.buttons.length}\n\n`;
    report += `| 序号 | 按钮文本 | 点击事件 | 未实现原因 | 行号 |\n`;
    report += `|------|----------|----------|------------|------|\n`;

    item.buttons.forEach((button, btnIndex) => {
      report += `| ${btnIndex + 1} | ${button.text} | ${button.clickEvent} | ${button.reason} | ${button.lineNumber} |\n`;
    });

    report += `\n`;
  });

  return report;
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始扫描centers目录下的未实现按钮...\n');

  // 检查目录是否存在
  if (!fs.existsSync(CENTERS_DIR)) {
    console.error(`❌ 错误: 目录不存在 ${CENTERS_DIR}`);
    process.exit(1);
  }

  // 扫描目录
  scanDirectory(CENTERS_DIR);

  // 生成报告
  const report = generateReport();
  fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');

  // 输出统计信息
  console.log('✅ 扫描完成!\n');
  console.log(`📊 统计信息:`);
  console.log(`   - 扫描文件总数: ${stats.totalFiles}`);
  console.log(`   - 包含未实现按钮的文件: ${stats.filesWithUnimplemented}`);
  console.log(`   - 未实现按钮总数: ${stats.totalUnimplementedButtons}`);
  console.log(`\n📝 报告已生成: ${OUTPUT_FILE}\n`);
}

// 运行
main();

