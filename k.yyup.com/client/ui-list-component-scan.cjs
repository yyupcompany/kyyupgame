/**
 * 幼儿园管理系统 - 列表组件UI优化扫描脚本
 * 全面检查所有页面的列表组件问题
 */

const fs = require('fs');
const path = require('path');

// 创建报告目录
const reportsDir = path.join(__dirname, 'docs', 'ui-optimization');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// 扫描结果
const scanResults = {
  timestamp: new Date().toISOString(),
  summary: {
    totalPagesScanned: 0,
    pagesWithListIssues: 0,
    totalIssuesFound: 0,
    issueTypes: {
      layout: 0,
      icons: 0,
      responsive: 0,
      styling: 0,
      interaction: 0
    }
  },
  pages: [],
  commonIssues: [],
  recommendations: []
};

// 页面列表
const pages = [
  '/dashboard',
  '/students',
  '/teachers',
  '/activities',
  '/enrollment',
  '/marketing',
  '/system',
  '/classes',
  '/parents',
  '/schedules',
  '/notifications',
  '/reports'
];

// 检查函数
function checkPageForListIssues(pagePath) {
  const pageIssues = [];

  // 1. 查找对应的Vue组件文件
  const componentFiles = findVueComponentsForPage(pagePath);

  componentFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');

    // 2. 检查列表组件相关问题
    const issues = analyzeComponentForListIssues(content, filePath);
    pageIssues.push(...issues);
  });

  return {
    page: pagePath,
    componentFiles: componentFiles,
    issues: pageIssues,
    hasListComponents: pageIssues.length > 0
  };
}

// 查找页面对应的Vue组件
function findVueComponentsForPage(pagePath) {
  const srcDir = path.join(__dirname, 'src');
  const components = [];

  // 页面路由到组件的映射
  const routeComponentMap = {
    '/dashboard': ['Dashboard.vue', 'DashboardIndex.vue'],
    '/students': ['StudentManagement.vue', 'student-management.vue'],
    '/teachers': ['TeacherManagement.vue', 'teacher-management.vue'],
    '/activities': ['ActivityManagement.vue', 'activity-management.vue'],
    '/enrollment': ['EnrollmentManagement.vue', 'enrollment-management.vue'],
    '/marketing': ['MarketingManagement.vue', 'marketing-management.vue'],
    '/system': ['SystemManagement.vue', 'system-management.vue'],
    '/classes': ['ClassManagement.vue', 'class-management.vue'],
    '/parents': ['ParentManagement.vue', 'parent-management.vue'],
    '/schedules': ['ScheduleManagement.vue', 'schedule-management.vue'],
    '/notifications': ['NotificationManagement.vue', 'notification-management.vue'],
    '/reports': ['ReportManagement.vue', 'report-management.vue']
  };

  const possibleFiles = routeComponentMap[pagePath] || [];

  // 在pages目录中查找
  possibleFiles.forEach(fileName => {
    const pagePath = path.join(srcDir, 'pages', fileName);
    if (fs.existsSync(pagePath)) {
      components.push(pagePath);
    }
  });

  // 在pages子目录中查找
  possibleFiles.forEach(fileName => {
    const subdirs = ['students', 'teachers', 'activities', 'enrollment', 'marketing', 'system'];
    subdirs.forEach(subdir => {
      const pagePath = path.join(srcDir, 'pages', subdir, fileName);
      if (fs.existsSync(pagePath)) {
        components.push(pagePath);
      }
    });
  });

  return components;
}

// 分析组件中的列表问题
function analyzeComponentForListIssues(content, filePath) {
  const issues = [];

  // 1. 检查表格相关的HTML结构
  const tablePatterns = [
    { pattern: /<el-table[^>]*>/g, type: 'element-table', description: 'Element Plus表格组件' },
    { pattern: /<table[^>]*>/g, type: 'html-table', description: '原生HTML表格' },
    { pattern: /<el-table-column[^>]*>/g, type: 'table-column', description: '表格列配置' }
  ];

  // 2. 检查列表相关的组件
  const listPatterns = [
    { pattern: /<el-list[^>]*>/g, type: 'element-list', description: 'Element Plus列表组件' },
    { pattern: /<el-card[^>]*>/g, type: 'element-card', description: 'Element Plus卡片组件' },
    { pattern: /<div[^>]*class="[^"]*list[^"]*"[^>]*>/g, type: 'div-list', description: 'DIV模拟列表' }
  ];

  // 3. 检查图标使用
  const iconPatterns = [
    { pattern: /<UnifiedIcon[^>]*name="([^"]*)"[^>]*>/g, type: 'unified-icon', description: '统一图标组件' },
    { pattern: /<el-icon[^>]*>/g, type: 'element-icon', description: 'Element Plus图标' },
    { pattern: /<i[^>]*class="[^"]*icon[^"]*"[^>]*>/g, type: 'font-icon', description: '字体图标' }
  ];

  // 4. 检查样式相关
  const stylePatterns = [
    { pattern: /display:\s*flex/g, type: 'flex-layout', description: 'Flex布局' },
    { pattern: /display:\s*grid/g, type: 'grid-layout', description: 'Grid布局' },
    { pattern: /width:\s*(\d+px|%|em|rem)/g, type: 'fixed-width', description: '固定宽度' },
    { pattern: /height:\s*(\d+px|%|em|rem)/g, type: 'fixed-height', description: '固定高度' }
  ];

  // 执行检查
  [...tablePatterns, ...listPatterns].forEach(({ pattern, type, description }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      issues.push({
        type: 'list-component',
        subtype: type,
        description: description,
        count: matches.length,
        severity: 'info'
      });
    }
  });

  // 检查图标问题
  iconPatterns.forEach(({ pattern, type, description }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      if (type === 'unified-icon') {
        // 检查UnifiedIcon的具体使用
        matches.forEach(match => {
          const nameMatch = match.match(/name="([^"]*)"/);
          if (nameMatch) {
            const iconName = nameMatch[1];
            // 检查是否是常见问题图标
            const problematicIcons = ['Edit', 'Delete', 'View', 'Plus', 'Search'];
            if (problematicIcons.includes(iconName)) {
              issues.push({
                type: 'icon-issue',
                subtype: 'potentially-problematic-icon',
                description: `可能存在问题的图标: ${iconName}`,
                icon: iconName,
                severity: 'warning'
              });
            }
          }
        });
      }

      issues.push({
        type: 'icon-usage',
        subtype: type,
        description: description,
        count: matches.length,
        severity: 'info'
      });
    }
  });

  // 5. 检查常见的列表问题模式
  const problemPatterns = [
    {
      pattern: /<el-table[^>]*>\s*<template[^>]*>/g,
      type: 'table-template-nesting',
      description: '表格模板嵌套可能影响性能',
      severity: 'warning'
    },
    {
      pattern: /style="[^"]*overflow:\s*hidden[^"]*"/g,
      type: 'overflow-hidden',
      description: 'overflow hidden可能截断内容',
      severity: 'warning'
    },
    {
      pattern: /class="[^"]*text-ellipsis[^"]*"/g,
      type: 'text-overflow',
      description: '文本溢出处理',
      severity: 'info'
    },
    {
      pattern: /:data="[^"]*\[\]/g,
      type: 'empty-data',
      description: '空数据数组可能显示问题',
      severity: 'warning'
    }
  ];

  problemPatterns.forEach(({ pattern, type, description, severity }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      issues.push({
        type: 'potential-problem',
        subtype: type,
        description: description,
        count: matches.length,
        severity: severity
      });
    }
  });

  // 6. 检查响应式设计
  const responsivePatterns = [
    { pattern: /@media[^{]*{/g, type: 'media-query', description: '媒体查询' },
    { pattern: /col-[xs|sm|md|lg|xl]/g, type: 'grid-system', description: '栅格系统' },
    { pattern: /responsive/g, type: 'responsive-class', description: '响应式类名' }
  ];

  let hasResponsiveDesign = false;
  responsivePatterns.forEach(({ pattern, type, description }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      hasResponsiveDesign = true;
      issues.push({
        type: 'responsive-design',
        subtype: type,
        description: description,
        count: matches.length,
        severity: 'info'
      });
    }
  });

  if (!hasResponsiveDesign && issues.some(i => i.type === 'list-component')) {
    issues.push({
      type: 'missing-responsive',
      subtype: 'no-responsive-design',
      description: '列表组件缺少响应式设计',
      severity: 'warning'
    });
  }

  return issues;
}

// 开始扫描
async function scanAllPages() {
  console.log('🔍 开始扫描幼儿园管理系统列表组件...');

  for (const pagePath of pages) {
    console.log(`📄 扫描页面: ${pagePath}`);

    const result = checkPageForListIssues(pagePath);
    scanResults.pages.push(result);
    scanResults.summary.totalPagesScanned++;

    if (result.hasListComponents) {
      scanResults.summary.pagesWithListIssues++;
      scanResults.summary.totalIssuesFound += result.issues.length;

      // 统计问题类型
      result.issues.forEach(issue => {
        const category = issue.type;
        if (scanResults.summary.issueTypes[category] !== undefined) {
          scanResults.summary.issueTypes[category]++;
        }
      });
    }

    console.log(`  ✅ 发现 ${result.issues.length} 个问题`);
  }

  // 生成常见问题总结
  generateCommonIssuesSummary();

  // 生成建议
  generateRecommendations();

  // 保存报告
  const reportPath = path.join(reportsDir, `list-component-scan-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(scanResults, null, 2));

  console.log('📊 扫描完成！');
  console.log(`📁 报告已保存到: ${reportPath}`);

  // 生成可读性报告
  generateReadableReport();

  return scanResults;
}

// 生成常见问题总结
function generateCommonIssuesSummary() {
  const issueFrequency = {};

  scanResults.pages.forEach(page => {
    page.issues.forEach(issue => {
      const key = `${issue.type}-${issue.subtype}`;
      if (!issueFrequency[key]) {
        issueFrequency[key] = {
          type: issue.type,
          subtype: issue.subtype,
          description: issue.description,
          count: 0,
          pages: []
        };
      }
      issueFrequency[key].count++;
      issueFrequency[key].pages.push(page.page);
    });
  });

  // 按频率排序
  scanResults.commonIssues = Object.values(issueFrequency)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // 取前10个最常见的问题
}

// 生成建议
function generateRecommendations() {
  const recommendations = [];

  // 基于问题类型生成建议
  if (scanResults.summary.issueTypes.icons > 0) {
    recommendations.push({
      priority: 'high',
      category: '图标优化',
      description: '修复UnifiedIcon组件的图标显示问题，确保所有图标在不同主题下都能正常显示',
      action: '检查并修复UnifiedIcon组件的实现，添加主题适配'
    });
  }

  if (scanResults.summary.issueTypes.responsive > 0) {
    recommendations.push({
      priority: 'medium',
      category: '响应式设计',
      description: '为列表组件添加响应式设计，确保在不同屏幕尺寸下都有良好的显示效果',
      action: '使用Element Plus的栅格系统和响应式属性'
    });
  }

  if (scanResults.summary.issueTypes.layout > 0) {
    recommendations.push({
      priority: 'medium',
      category: '布局优化',
      description: '统一列表组件的布局规范，改善间距和对齐',
      action: '制定统一的列表组件样式规范'
    });
  }

  if (scanResults.summary.issueTypes.styling > 0) {
    recommendations.push({
      priority: 'low',
      category: '样式统一',
      description: '统一列表组件的视觉风格，确保整体设计一致性',
      action: '创建统一的列表组件样式文件'
    });
  }

  scanResults.recommendations = recommendations;
}

// 生成可读性报告
function generateReadableReport() {
  let report = `# 幼儿园管理系统 - 列表组件UI优化扫描报告\n\n`;
  report += `**扫描时间**: ${new Date(scanResults.timestamp).toLocaleString('zh-CN')}\n\n`;

  // 概要
  report += `## 📊 扫描概要\n\n`;
  report += `- 总扫描页面数: ${scanResults.summary.totalPagesScanned}\n`;
  report += `- 有列表问题的页面: ${scanResults.summary.pagesWithListIssues}\n`;
  report += `- 总发现问题数: ${scanResults.summary.totalIssuesFound}\n\n`;

  report += `### 问题类型分布\n\n`;
  Object.entries(scanResults.summary.issueTypes).forEach(([type, count]) => {
    if (count > 0) {
      report += `- ${getTypeLabel(type)}: ${count}\n`;
    }
  });
  report += `\n`;

  // 页面详情
  report += `## 📄 页面详情\n\n`;
  scanResults.pages.forEach(page => {
    if (page.hasListComponents) {
      report += `### ${page.page}\n\n`;
      report += `**组件文件**:\n`;
      page.componentFiles.forEach(file => {
        report += `- \`${path.relative(__dirname, file)}\`\n`;
      });
      report += `\n**发现的问题** (${page.issues.length}):\n\n`;

      page.issues.forEach((issue, index) => {
        const severityIcon = getSeverityIcon(issue.severity);
        report += `${index + 1}. ${severityIcon} **${issue.description}** (${issue.subtype})\n`;
        if (issue.count > 1) {
          report += `   - 出现次数: ${issue.count}\n`;
        }
      });
      report += `\n`;
    }
  });

  // 常见问题
  report += `## 🔍 常见问题分析\n\n`;
  scanResults.commonIssues.forEach((issue, index) => {
    report += `### ${index + 1}. ${issue.description}\n\n`;
    report += `- **出现频次**: ${issue.count} 次\n`;
    report += `- **影响页面**: ${issue.pages.join(', ')}\n`;
    report += `- **问题类型**: ${issue.type} - ${issue.subtype}\n\n`;
  });

  // 优化建议
  report += `## 💡 优化建议\n\n`;
  scanResults.recommendations.forEach((rec, index) => {
    const priorityIcon = getPriorityIcon(rec.priority);
    report += `### ${index + 1}. ${priorityIcon} ${rec.category}\n\n`;
    report += `**问题描述**: ${rec.description}\n\n`;
    report += `**建议行动**: ${rec.action}\n\n`;
  });

  // 保存可读性报告
  const readableReportPath = path.join(reportsDir, `list-component-scan-${new Date().toISOString().replace(/[:.]/g, '-')}.md`);
  fs.writeFileSync(readableReportPath, report);

  console.log(`📄 可读性报告已保存到: ${readableReportPath}`);
}

function getTypeLabel(type) {
  const labels = {
    layout: '布局问题',
    icons: '图标问题',
    responsive: '响应式问题',
    styling: '样式问题',
    interaction: '交互问题'
  };
  return labels[type] || type;
}

function getSeverityIcon(severity) {
  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[severity] || 'ℹ️';
}

function getPriorityIcon(priority) {
  const icons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢'
  };
  return icons[priority] || '🟡';
}

// 执行扫描
scanAllPages().catch(console.error);