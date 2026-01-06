/**
 * 全面扫描Vue组件中的列表相关问题
 */

const fs = require('fs');
const path = require('path');

// 创建报告目录
const reportsDir = path.join(__dirname, 'docs', 'ui-optimization');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// 扫描结果
const results = {
  timestamp: new Date().toISOString(),
  totalFiles: 0,
  filesWithListComponents: 0,
  files: [],
  commonIssues: [],
  summary: {
    tableComponents: 0,
    listComponents: 0,
    iconIssues: 0,
    layoutIssues: 0,
    responsiveIssues: 0
  }
};

// 递归查找所有Vue文件
function findVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findVueFiles(filePath, fileList);
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// 分析单个Vue文件
function analyzeVueFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(__dirname, filePath);

  const analysis = {
    file: relativePath,
    hasListComponents: false,
    issues: [],
    listComponents: [],
    iconUsages: [],
    layoutPatterns: [],
    responsiveFeatures: []
  };

  // 检查表格组件
  const tablePatterns = [
    { regex: /<el-table[^>]*>/g, type: 'el-table', description: 'Element Plus表格' },
    { regex: /<table[^>]*>/g, type: 'html-table', description: 'HTML表格' },
    { regex: /<el-table-column[^>]*>/g, type: 'el-table-column', description: 'Element Plus表格列' }
  ];

  // 检查列表组件
  const listPatterns = [
    { regex: /<el-list[^>]*>/g, type: 'el-list', description: 'Element Plus列表' },
    { regex: /<el-card[^>]*>/g, type: 'el-card', description: 'Element Plus卡片' },
    { regex: /<div[^>]*class="[^"]*list[^"]*"[^>]*>/g, type: 'div-list', description: 'DIV列表容器' },
    { regex: /<div[^>]*class="[^"]*grid[^"]*"[^>]*>/g, type: 'div-grid', description: 'DIV网格布局' },
    { regex: /<ul[^>]*>/g, type: 'ul-list', description: '无序列表' },
    { regex: /<ol[^>]*>/g, type: 'ol-list', description: '有序列表' }
  ];

  // 检查图标使用
  const iconPatterns = [
    { regex: /<UnifiedIcon[^>]*name="([^"]*)"[^>]*>/g, type: 'unified-icon', description: '统一图标组件' },
    { regex: /<el-icon[^>]*>/g, type: 'el-icon', description: 'Element Plus图标' },
    { regex: /<i[^>]*class="[^"]*icon[^"]*"[^>]*>/g, type: 'font-icon', description: '字体图标' }
  ];

  // 检查布局模式
  const layoutPatterns = [
    { regex: /display:\s*flex/g, type: 'flex-layout', description: 'Flex布局' },
    { regex: /display:\s*grid/g, type: 'grid-layout', description: 'Grid布局' },
    { regex: /<el-row[^>]*>/g, type: 'el-row', description: 'Element Plus行' },
    { regex: /<el-col[^>]*>/g, type: 'el-col', description: 'Element Plus列' }
  ];

  // 检查响应式特性
  const responsivePatterns = [
    { regex: /@media[^{]*{/g, type: 'media-query', description: '媒体查询' },
    { regex: /:xs="[^"]*"/g, type: 'responsive-xs', description: '超小屏幕响应' },
    { regex: /:sm="[^"]*"/g, type: 'responsive-sm', description: '小屏幕响应' },
    { regex: /:md="[^"]*"/g, type: 'responsive-md', description: '中等屏幕响应' },
    { regex: /:lg="[^"]*"/g, type: 'responsive-lg', description: '大屏幕响应' },
    { regex: /:xl="[^"]*"/g, type: 'responsive-xl', description: '超大屏幕响应' },
    { regex: /responsive/g, type: 'responsive-class', description: '响应式类名' }
  ];

  // 检查常见问题
  const problemPatterns = [
    {
      regex: /style="[^"]*overflow:\s*hidden[^"]*"/g,
      type: 'overflow-hidden',
      description: '可能截断内容的overflow hidden',
      severity: 'warning'
    },
    {
      regex: /style="[^"]*white-space:\s*nowrap[^"]*"/g,
      type: 'text-nowrap',
      description: '强制不换行可能导致内容显示不全',
      severity: 'warning'
    },
    {
      regex: /width:\s*(\d+px)(?!;.*responsive)/g,
      type: 'fixed-width',
      description: '固定宽度可能影响响应式设计',
      severity: 'warning'
    },
    {
      regex: /height:\s*(\d+px)(?!;.*responsive)/g,
      type: 'fixed-height',
      description: '固定高度可能影响响应式设计',
      severity: 'warning'
    },
    {
      regex: /:data="[^"]*\[\]/g,
      type: 'empty-data-array',
      description: '空数据数组可能显示加载状态',
      severity: 'info'
    }
  ];

  // 执行检查
  [...tablePatterns, ...listPatterns].forEach(({ regex, type, description }) => {
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      analysis.hasListComponents = true;
      analysis.listComponents.push({
        type,
        description,
        count: matches.length,
        examples: matches.slice(0, 3) // 只保留前3个例子
      });

      if (type.includes('table')) {
        results.summary.tableComponents++;
      } else {
        results.summary.listComponents++;
      }
    }
  });

  // 检查图标
  iconPatterns.forEach(({ regex, type, description }) => {
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      analysis.iconUsages.push({
        type,
        description,
        count: matches.length
      });

      if (type === 'unified-icon') {
        // 详细分析UnifiedIcon使用
        matches.forEach(match => {
          const nameMatch = match.match(/name="([^"]*)"/);
          if (nameMatch) {
            const iconName = nameMatch[1];
            // 检查常见问题图标
            const problematicIcons = ['Edit', 'Delete', 'View', 'Plus', 'Search', 'Close', 'Check', 'Arrow'];
            if (problematicIcons.some(icon => iconName.includes(icon))) {
              analysis.issues.push({
                type: 'icon-issue',
                subtype: 'potentially-problematic-icon',
                description: `可能存在问题的图标: ${iconName}`,
                icon: iconName,
                severity: 'warning',
                line: findLineNumber(content, match)
              });
            }
          }
        });
      }

      results.summary.iconIssues++;
    }
  });

  // 检查布局
  layoutPatterns.forEach(({ regex, type, description }) => {
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      analysis.layoutPatterns.push({
        type,
        description,
        count: matches.length
      });
    }
  });

  // 检查响应式
  responsivePatterns.forEach(({ regex, type, description }) => {
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      analysis.responsiveFeatures.push({
        type,
        description,
        count: matches.length
      });
    }
  });

  // 检查问题
  problemPatterns.forEach(({ regex, type, description, severity }) => {
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        analysis.issues.push({
          type: 'layout-issue',
          subtype: type,
          description,
          severity,
          line: findLineNumber(content, match)
        });
      });

      results.summary.layoutIssues++;
    }
  });

  // 检查是否缺少响应式设计
  if (analysis.hasListComponents && analysis.responsiveFeatures.length === 0) {
    analysis.issues.push({
      type: 'responsive-issue',
      subtype: 'missing-responsive-design',
      description: '列表组件缺少响应式设计',
      severity: 'warning'
    });
    results.summary.responsiveIssues++;
  }

  return analysis;
}

// 查找文本在文件中的行号
function findLineNumber(content, text) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(text)) {
      return i + 1;
    }
  }
  return 0;
}

// 生成常见问题总结
function generateCommonIssuesSummary() {
  const issueFrequency = {};

  results.files.forEach(file => {
    file.issues.forEach(issue => {
      const key = `${issue.type}-${issue.subtype}`;
      if (!issueFrequency[key]) {
        issueFrequency[key] = {
          type: issue.type,
          subtype: issue.subtype,
          description: issue.description,
          count: 0,
          files: [],
          severity: issue.severity
        };
      }
      issueFrequency[key].count++;
      if (!issueFrequency[key].files.includes(file.file)) {
        issueFrequency[key].files.push(file.file);
      }
    });
  });

  results.commonIssues = Object.values(issueFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

// 生成报告
function generateReport() {
  const report = `# 全面列表组件扫描报告

**扫描时间**: ${new Date(results.timestamp).toLocaleString('zh-CN')}

## 📊 总体统计

- 总扫描文件数: ${results.totalFiles}
- 包含列表组件的文件: ${results.filesWithListComponents}
- 表格组件数量: ${results.summary.tableComponents}
- 列表组件数量: ${results.summary.listComponents}
- 图标使用次数: ${results.summary.iconIssues}
- 布局问题数量: ${results.summary.layoutIssues}
- 响应式问题数量: ${results.summary.responsiveIssues}

## 📄 详细文件分析

${results.files.filter(f => f.hasListComponents).map(file => `
### ${file.file}

**列表组件**:
${file.listComponents.map(comp => `- ${comp.description} (${comp.count}个)`).join('\n')}

**图标使用**:
${file.iconUsages.map(icon => `- ${icon.description} (${icon.count}个)`).join('\n')}

**布局模式**:
${file.layoutPatterns.map(layout => `- ${layout.description} (${layout.count}个)`).join('\n')}

**响应式特性**:
${file.responsiveFeatures.length > 0 ? file.responsiveFeatures.map(r => `- ${r.description} (${r.count}个)`).join('\n') : '❌ 无响应式设计'}

**发现问题**:
${file.issues.length > 0 ? file.issues.map(issue => {
  const icon = issue.severity === 'warning' ? '⚠️' : issue.severity === 'error' ? '❌' : 'ℹ️';
  return `${icon} **${issue.description}** (第${issue.line}行)`;
}).join('\n') : '✅ 无明显问题'}

---
`).join('\n')}

## 🔍 常见问题分析

${results.commonIssues.map((issue, index) => `
### ${index + 1}. ${issue.description}

- **出现频次**: ${issue.count} 次
- **严重程度**: ${issue.severity}
- **影响文件**: ${issue.files.length} 个
- **问题类型**: ${issue.type} - ${issue.subtype}

`).join('\n')}

## 💡 优化建议

1. **图标统一化**: 将所有图标使用统一为UnifiedIcon组件，确保主题适配
2. **响应式设计**: 为所有列表组件添加响应式设计，支持不同屏幕尺寸
3. **布局优化**: 使用Element Plus的栅格系统替代固定宽度和高度
4. **性能优化**: 避免在表格中使用复杂的嵌套模板
5. **可访问性**: 添加适当的ARIA标签和键盘导航支持

## 🔧 修复优先级

### 🔴 高优先级
- 修复UnifiedIcon组件显示问题
- 添加缺失的响应式设计

### 🟡 中优先级
- 优化布局模式，使用栅格系统
- 修复overflow和文本换行问题

### 🟢 低优先级
- 统一图标使用规范
- 添加可访问性支持
`;

  // 保存报告
  const reportPath = path.join(reportsDir, `comprehensive-list-scan-${new Date().toISOString().replace(/[:.]/g, '-')}.md`);
  fs.writeFileSync(reportPath, report);

  // 保存JSON数据
  const jsonPath = path.join(reportsDir, `comprehensive-list-scan-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  console.log(`📄 报告已保存到: ${reportPath}`);
  console.log(`📊 数据已保存到: ${jsonPath}`);
}

// 主函数
async function main() {
  console.log('🔍 开始全面扫描Vue组件中的列表相关问题...');

  const vueFiles = findVueFiles(path.join(__dirname, 'src'));
  results.totalFiles = vueFiles.length;

  console.log(`📁 找到 ${vueFiles.length} 个Vue文件`);

  for (const filePath of vueFiles) {
    const analysis = analyzeVueFile(filePath);
    results.files.push(analysis);

    if (analysis.hasListComponents) {
      results.filesWithListComponents++;
      console.log(`✅ ${path.relative(__dirname, filePath)} - 发现列表组件`);
    }
  }

  generateCommonIssuesSummary();
  generateReport();

  console.log('🎉 扫描完成！');
  console.log(`📊 总计发现 ${results.filesWithListComponents} 个文件包含列表组件`);
  console.log(`⚠️ 发现 ${results.commonIssues.reduce((sum, issue) => sum + issue.count, 0)} 个问题`);
}

main().catch(console.error);