const fs = require('fs');
const path = require('path');

// 扫描Vue组件的目录
const srcDir = path.join(__dirname, 'src');

// 扫描结果
const scanResults = {
  totalFiles: 0,
  listComponents: [],
  tableComponents: [],
  componentsWithOptimizedStyles: [],
  componentsWithoutOptimizedStyles: [],
  personnelCenterComponents: [],
  teacherComponents: [],
  summary: {
    totalListComponents: 0,
    totalTableComponents: 0,
    componentsWithStyles: 0,
    componentsWithoutStyles: 0,
    personnelCenterFiles: 0,
    teacherFiles: 0
  }
};

// 检查文件是否包含列表相关的关键词
function checkForListComponents(content, filePath) {
  const listPatterns = [
    /<el-table[^>]*>/gi,
    /<table[^>]*>/gi,
    /\.el-table/gi,
    /data-table/gi,
    /list-container/gi,
    /<ul[^>]*>/gi,
    /<ol[^>]*>/gi,
    /v-for.*in/gi,
    /:data/gi,
    /tableData/gi,
    /listData/gi,
    /items.*\[\]/gi,
    /<.*list.*>/gi,
    /<.*List.*>/gi,
    /<.*Table.*>/gi,
    /<.*Grid.*>/gi,
  ];

  const foundPatterns = [];
  listPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      foundPatterns.push({
        pattern: pattern.source,
        count: matches.length,
        matches: matches.slice(0, 3) // 保存前3个匹配
      });
    }
  });

  return foundPatterns;
}

// 检查是否引用了优化样式
function checkForOptimizedStyles(content) {
  const stylePatterns = [
    /@import.*list-components-optimization/gi,
    /require.*list-components-optimization/gi,
    /import.*list-components-optimization/gi,
    /list-components-optimization\.scss/gi,
    /unified-icon/gi,
    /UnifiedIcon/gi,
    /list-optimized/gi,
    /table-optimized/gi,
  ];

  const foundStyles = [];
  stylePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      foundPatterns.push({
        pattern: pattern.source,
        count: matches.length
      });
    }
  });

  return foundStyles.length > 0;
}

// 扫描单个Vue文件
function scanVueFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(__dirname, filePath);

    scanResults.totalFiles++;

    const fileInfo = {
      path: relativePath,
      size: content.length,
      lastModified: fs.statSync(filePath).mtime
    };

    // 检查列表组件
    const listPatterns = checkForListComponents(content, filePath);
    if (listPatterns.length > 0) {
      fileInfo.listPatterns = listPatterns;
      scanResults.listComponents.push(fileInfo);
      scanResults.summary.totalListComponents++;
    }

    // 检查表格组件
    const hasTable = /<el-table|<table|\.el-table|tableData/i.test(content);
    if (hasTable) {
      scanResults.tableComponents.push(fileInfo);
      scanResults.summary.totalTableComponents++;
    }

    // 检查优化样式
    const hasOptimizedStyles = checkForOptimizedStyles(content);
    if (hasOptimizedStyles) {
      scanResults.componentsWithOptimizedStyles.push(fileInfo);
      scanResults.summary.componentsWithStyles++;
    } else if (listPatterns.length > 0) {
      scanResults.componentsWithoutOptimizedStyles.push(fileInfo);
      scanResults.summary.componentsWithoutStyles++;
    }

    // 检查是否在特定目录中
    if (relativePath.includes('pages/centers/PersonnelCenter')) {
      scanResults.personnelCenterComponents.push(fileInfo);
      scanResults.summary.personnelCenterFiles++;
    }

    if (relativePath.includes('pages/teacher/')) {
      scanResults.teacherComponents.push(fileInfo);
      scanResults.summary.teacherFiles++;
    }

  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

// 递归扫描目录
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 跳过node_modules和其他不需要的目录
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        scanDirectory(filePath);
      }
    } else if (file.endsWith('.vue')) {
      scanVueFile(filePath);
    }
  }
}

// 分析组件质量
function analyzeComponentQuality() {
  const qualityAnalysis = {
    needsOptimization: [],
    alreadyOptimized: [],
    missingStyles: []
  };

  // 找出需要优化的组件（有列表但没有优化样式）
  scanResults.componentsWithoutOptimizedStyles.forEach(component => {
    qualityAnalysis.needsOptimization.push({
      path: component.path,
      listPatterns: component.listPatterns,
      priority: calculatePriority(component)
    });
  });

  // 已优化的组件
  scanResults.componentsWithOptimizedStyles.forEach(component => {
    qualityAnalysis.alreadyOptimized.push({
      path: component.path,
      hasListPatterns: component.listPatterns && component.listPatterns.length > 0
    });
  });

  return qualityAnalysis;
}

// 计算优化优先级
function calculatePriority(component) {
  let priority = 1;

  // 如果在特定中心目录，提高优先级
  if (component.path.includes('PersonnelCenter') || component.path.includes('teacher/')) {
    priority += 2;
  }

  // 如果是表格组件，提高优先级
  if (component.listPatterns.some(p => p.pattern.includes('table'))) {
    priority += 1;
  }

  return priority;
}

// 生成修复建议
function generateFixSuggestions(qualityAnalysis) {
  const suggestions = [];

  // 按优先级排序
  qualityAnalysis.needsOptimization.sort((a, b) => b.priority - a.priority);

  qualityAnalysis.needsOptimization.forEach(component => {
    suggestions.push({
      filePath: component.path,
      priority: component.priority,
      neededChanges: [
        '添加 @import "@/styles/list-components-optimization.scss" 到样式部分',
        '替换硬编码图标为 UnifiedIcon 组件',
        '应用响应式设计类名',
        '确保表格使用统一的样式类'
      ],
      listTypes: component.listPatterns.map(p => p.pattern)
    });
  });

  return suggestions;
}

// 开始扫描
function startScan() {
  console.log('🔍 开始静态代码扫描...');
  console.log(`📁 扫描目录: ${srcDir}`);

  if (!fs.existsSync(srcDir)) {
    console.error(`❌ 目录不存在: ${srcDir}`);
    return;
  }

  scanDirectory(srcDir);

  // 生成质量分析
  const qualityAnalysis = analyzeComponentQuality();
  const fixSuggestions = generateFixSuggestions(qualityAnalysis);

  // 保存结果
  const results = {
    ...scanResults,
    qualityAnalysis,
    fixSuggestions,
    scanDate: new Date().toISOString()
  };

  // 确保输出目录存在
  const outputDir = path.join(__dirname, 'docs', '浏览器检查');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const resultsPath = path.join(outputDir, 'static-list-scan-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  // 生成可读的报告
  const reportPath = path.join(outputDir, 'static-list-scan-report.md');
  generateMarkdownReport(results, reportPath);

  console.log('\n📊 扫描完成！');
  console.log(`📄 总文件数: ${scanResults.totalFiles}`);
  console.log(`📋 列表组件数: ${scanResults.summary.totalListComponents}`);
  console.log(`📊 表格组件数: ${scanResults.summary.totalTableComponents}`);
  console.log(`✅ 已优化组件: ${scanResults.summary.componentsWithStyles}`);
  console.log(`⚠️  需要优化组件: ${scanResults.summary.componentsWithoutStyles}`);
  console.log(`👨‍👩‍👧‍👦 PersonnelCenter组件: ${scanResults.summary.personnelCenterFiles}`);
  console.log(`👨‍🏫 Teacher组件: ${scanResults.summary.teacherFiles}`);
  console.log(`📁 详细结果: ${resultsPath}`);
  console.log(`📄 报告文件: ${reportPath}`);

  return results;
}

// 生成Markdown报告
function generateMarkdownReport(results, reportPath) {
  let report = `# 列表组件静态扫描报告\n\n`;
  report += `**扫描时间**: ${results.scanDate}\n\n`;

  // 概览
  report += `## 📊 扫描概览\n\n`;
  report += `- **总文件数**: ${results.totalFiles}\n`;
  report += `- **列表组件数**: ${results.summary.totalListComponents}\n`;
  report += `- **表格组件数**: ${results.summary.totalTableComponents}\n`;
  report += `- **已优化组件**: ${results.summary.componentsWithStyles}\n`;
  report += `- **需要优化组件**: ${results.summary.componentsWithoutStyles}\n`;
  report += `- **PersonnelCenter组件**: ${results.summary.personnelCenterFiles}\n`;
  report += `- **Teacher组件**: ${results.summary.teacherFiles}\n\n`;

  // 需要优化的组件
  if (results.fixSuggestions.length > 0) {
    report += `## ⚠️ 需要优化的组件\n\n`;
    results.fixSuggestions.forEach((suggestion, index) => {
      report += `### ${index + 1}. ${suggestion.filePath}\n\n`;
      report += `**优先级**: ${'⭐'.repeat(suggestion.priority)}\n\n`;
      report += `**列表类型**: \n`;
      suggestion.listTypes.forEach(type => {
        report += `- ${type}\n`;
      });
      report += `\n**需要的修改**:\n`;
      suggestion.neededChanges.forEach(change => {
        report += `- [ ] ${change}\n`;
      });
      report += `\n`;
    });
  }

  // PersonnelCenter组件详情
  if (results.personnelCenterComponents.length > 0) {
    report += `## 👨‍👩‍👧‍👦 PersonnelCenter组件\n\n`;
    results.personnelCenterComponents.forEach(component => {
      report += `### ${component.path}\n\n`;
      if (component.listPatterns && component.listPatterns.length > 0) {
        report += `**发现的列表模式**:\n`;
        component.listPatterns.forEach(pattern => {
          report += `- ${pattern.pattern} (${pattern.count}个)\n`;
        });
      }
      report += `\n`;
    });
  }

  // Teacher组件详情
  if (results.teacherComponents.length > 0) {
    report += `## 👨‍🏫 Teacher组件\n\n`;
    results.teacherComponents.forEach(component => {
      report += `### ${component.path}\n\n`;
      if (component.listPatterns && component.listPatterns.length > 0) {
        report += `**发现的列表模式**:\n`;
        component.listPatterns.forEach(pattern => {
          report += `- ${pattern.pattern} (${pattern.count}个)\n`;
        });
      }
      report += `\n`;
    });
  }

  fs.writeFileSync(reportPath, report);
}

// 运行扫描
startScan();