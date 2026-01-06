#!/usr/bin/env node

/**
 * 幼儿园管理系统 - 智能全角色功能按钮扫描器
 * 全面扫描所有角色的页面、组件、功能按钮和开发状态
 */

const fs = require('fs');
const path = require('path');

// 静态菜单配置
const ROLE_MENU_CONFIG = {
  admin: {
    name: '系统管理员',
    pages: [
      { path: '/dashboard', component: 'Dashboard', title: '仪表板' },
      { path: '/centers/personnel', component: 'centers/PersonnelCenter', title: '人员管理' },
      { path: '/centers/ai', component: 'centers/AICenter', title: 'AI中心' },
      { path: '/centers/activity', component: 'centers/ActivityCenter', title: '活动管理' },
      { path: '/assessment-analytics/overview', component: 'assessment-analytics/overview', title: '测评总览' },
      { path: '/assessment-analytics/records', component: 'assessment-analytics/records', title: '测评记录' },
      { path: '/assessment-analytics/reports', component: 'assessment-analytics/reports', title: '测评报告' },
      { path: '/assessment-analytics/trends', component: 'assessment-analytics/trends', title: '数据趋势' },
      { path: '/centers/enrollment', component: 'centers/EnrollmentCenter', title: '招生管理' },
      { path: '/centers/finance', component: 'centers/FinanceCenter', title: '财务管理' },
      { path: '/centers/system', component: 'centers/SystemCenter', title: '系统管理' },
      // 教师中心所有页面
      { path: '/teacher-center/dashboard', component: 'teacher-center/Dashboard', title: '教师工作台' },
      { path: '/teacher-center/teaching', component: 'teacher-center/Teaching', title: '教学管理' },
      { path: '/teacher-center/attendance', component: 'teacher-center/Attendance', title: '考勤管理' },
      { path: '/teacher-center/activities', component: 'teacher-center/Activities', title: '活动管理' },
      { path: '/teacher-center/tasks', component: 'teacher-center/Tasks', title: '任务管理' },
      { path: '/teacher-center/student-assessment', component: 'teacher-center/student-assessment', title: '学生测评' },
      { path: '/teacher-center/notifications', component: 'teacher-center/Notifications', title: '通知中心' },
      { path: '/teacher-center/enrollment', component: 'teacher-center/Enrollment', title: '招生中心' },
      { path: '/teacher-center/customer-tracking', component: 'teacher-center/CustomerTracking', title: '客户跟踪' },
      { path: '/teacher-center/creative-curriculum', component: 'teacher-center/CreativeCurriculum', title: 'AI互动课堂' },
      { path: '/teacher-center/performance-rewards', component: 'teacher-center/PerformanceRewards', title: '绩效中心' },
      // 家长中心所有页面
      { path: '/parent-center/dashboard', component: 'parent-center/Dashboard', title: '家长工作台' },
      { path: '/parent-center/children', component: 'parent-center/Children', title: '孩子管理' },
      { path: '/parent-center/activities', component: 'parent-center/Activities', title: '招生活动' },
      { path: '/parent-center/assessment', component: 'parent-center/Assessment', title: '成长评估' },
      { path: '/parent-center/communication', component: 'parent-center/Communication', title: '家校沟通' },
      // AI助手所有页面
      { path: '/ai/assistant', component: 'ai/AIAssistant', title: '智能助手' },
      { path: '/ai/query-interface', component: 'ai/AIQueryInterface', title: '智能查询' },
      { path: '/ai/analytics', component: 'ai/analytics', title: '数据分析' },
      { path: '/ai/models', component: 'ai/models', title: '模型管理' }
    ]
  },
  principal: {
    name: '园长',
    pages: [
      { path: '/dashboard', component: 'Dashboard', title: '仪表板' },
      { path: '/centers/personnel', component: 'centers/PersonnelCenter', title: '人员管理' },
      { path: '/centers/ai', component: 'centers/AICenter', title: 'AI中心' },
      { path: '/centers/activity', component: 'centers/ActivityCenter', title: '活动管理' },
      { path: '/assessment-analytics/overview', component: 'assessment-analytics/overview', title: '测评总览' },
      { path: '/assessment-analytics/records', component: 'assessment-analytics/records', title: '测评记录' },
      { path: '/assessment-analytics/reports', component: 'assessment-analytics/reports', title: '测评报告' },
      { path: '/assessment-analytics/trends', component: 'assessment-analytics/trends', title: '数据趋势' },
      { path: '/centers/enrollment', component: 'centers/EnrollmentCenter', title: '招生管理' },
      { path: '/centers/finance', component: 'centers/FinanceCenter', title: '财务管理' },
      // 教师中心所有页面
      { path: '/teacher-center/dashboard', component: 'teacher-center/Dashboard', title: '教师工作台' },
      { path: '/teacher-center/teaching', component: 'teacher-center/Teaching', title: '教学管理' },
      { path: '/teacher-center/attendance', component: 'teacher-center/Attendance', title: '考勤管理' },
      { path: '/teacher-center/activities', component: 'teacher-center/Activities', title: '活动管理' },
      { path: '/teacher-center/tasks', component: 'teacher-center/Tasks', title: '任务管理' },
      { path: '/teacher-center/notifications', component: 'teacher-center/Notifications', title: '通知中心' },
      { path: '/teacher-center/enrollment', component: 'teacher-center/Enrollment', title: '招生中心' },
      { path: '/teacher-center/customer-tracking', component: 'teacher-center/CustomerTracking', title: '客户跟踪' },
      { path: '/teacher-center/creative-curriculum', component: 'teacher-center/CreativeCurriculum', title: 'AI互动课堂' },
      { path: '/teacher-center/performance-rewards', component: 'teacher-center/PerformanceRewards', title: '绩效中心' },
      // AI助手部分页面
      { path: '/ai/assistant', component: 'ai/AIAssistant', title: '智能助手' },
      { path: '/ai/query-interface', component: 'ai/AIQueryInterface', title: '智能查询' },
      { path: '/ai/analytics', component: 'ai/analytics', title: '数据分析' }
    ]
  },
  teacher: {
    name: '教师',
    pages: [
      { path: '/dashboard', component: 'Dashboard', title: '仪表板' },
      { path: '/teacher-center/dashboard', component: 'teacher-center/Dashboard', title: '工作台' },
      { path: '/teacher-center/teaching', component: 'teacher-center/Teaching', title: '教学管理' },
      { path: '/teacher-center/attendance', component: 'teacher-center/Attendance', title: '考勤管理' },
      { path: '/teacher-center/activities', component: 'teacher-center/Activities', title: '活动管理' },
      { path: '/teacher-center/tasks', component: 'teacher-center/Tasks', title: '任务管理' },
      { path: '/teacher-center/student-assessment', component: 'teacher-center/student-assessment', title: '学生测评' },
      { path: '/teacher-center/notifications', component: 'teacher-center/Notifications', title: '通知中心' },
      { path: '/teacher-center/enrollment', component: 'teacher-center/Enrollment', title: '招生中心' },
      { path: '/teacher-center/customer-tracking', component: 'teacher-center/CustomerTracking', title: '客户跟踪' },
      { path: '/teacher-center/creative-curriculum', component: 'teacher-center/CreativeCurriculum', title: 'AI互动课堂' },
      { path: '/teacher-center/performance-rewards', component: 'teacher-center/PerformanceRewards', title: '绩效中心' },
      // AI助手部分页面
      { path: '/ai/assistant', component: 'ai/AIAssistant', title: '智能助手' },
      { path: '/ai/query-interface', component: 'ai/AIQueryInterface', title: '智能查询' }
    ]
  },
  parent: {
    name: '家长',
    pages: [
      { path: '/dashboard', component: 'Dashboard', title: '仪表板' },
      { path: '/parent-center/dashboard', component: 'parent-center/Dashboard', title: '工作台' },
      { path: '/parent-center/children', component: 'parent-center/Children', title: '孩子管理' },
      { path: '/parent-center/activities', component: 'parent-center/Activities', title: '招生活动' },
      { path: '/parent-center/assessment', component: 'parent-center/Assessment', title: '成长评估' },
      { path: '/parent-center/communication', component: 'parent-center/Communication', title: '家校沟通' },
      // AI助手部分页面
      { path: '/ai/assistant', component: 'ai/AIAssistant', title: '智能助手' },
      { path: '/ai/query-interface', component: 'ai/AIQueryInterface', title: '智能查询' }
    ]
  }
};

const CLIENT_PAGES_DIR = path.join(__dirname, '../client/src/pages');

// 待开发标记
const TODO_PATTERNS = [
  /TODO:/gi,
  /待开发/gi,
  /Coming Soon/gi,
  /FIXME:/gi,
  /XXX:/gi,
  /HACK:/gi,
  /占位/gi,
  /placeholder/gi
];

// 组件路径映射表（手动映射特殊路径）
const COMPONENT_PATH_MAP = {
  'Dashboard': 'dashboard/index.vue',
  'centers/PersonnelCenter': 'centers/PersonnelCenter.vue',
  'centers/AICenter': 'centers/AICenter.vue',
  'centers/ActivityCenter': 'centers/ActivityCenter.vue',
  'centers/EnrollmentCenter': 'centers/EnrollmentCenter.vue',
  'centers/FinanceCenter': 'centers/FinanceCenter.vue',
  'centers/SystemCenter': 'centers/SystemCenter.vue',
  'teacher-center/Dashboard': 'teacher-center/dashboard/index.vue',
  'teacher-center/Teaching': 'teacher-center/teaching/index.vue',
  'teacher-center/Attendance': 'teacher-center/attendance/index.vue',
  'teacher-center/Activities': 'teacher-center/activities/index.vue',
  'teacher-center/Tasks': 'teacher-center/tasks/index.vue',
  'teacher-center/student-assessment': 'teacher-center/student-assessment/index.vue',
  'teacher-center/Notifications': 'teacher-center/notifications/index.vue',
  'teacher-center/Enrollment': 'teacher-center/enrollment/index.vue',
  'teacher-center/CustomerTracking': 'teacher-center/customer-tracking/index.vue',
  'teacher-center/CreativeCurriculum': 'teacher-center/creative-curriculum/index.vue',
  'teacher-center/PerformanceRewards': 'teacher-center/performance-rewards/index.vue',
  'parent-center/Dashboard': 'parent-center/dashboard/index.vue',
  'parent-center/Children': 'parent-center/children/index.vue',
  'parent-center/Activities': 'parent-center/activities/index.vue',
  'parent-center/Assessment': 'parent-center/assessment/index.vue',
  'parent-center/Communication': 'parent-center/communication/index.vue',
  'ai/AIAssistant': 'ai/assistant.vue',
  'ai/AIQueryInterface': 'ai/query-interface/index.vue',
  'ai/analytics': 'ai/analytics/index.vue',
  'ai/models': 'ai/models/index.vue',
  'assessment-analytics/overview': 'assessment-analytics/overview/index.vue',
  'assessment-analytics/records': 'assessment-analytics/records/index.vue',
  'assessment-analytics/reports': 'assessment-analytics/reports/index.vue',
  'assessment-analytics/trends': 'assessment-analytics/trends/index.vue'
};

/**
 * 智能查找组件文件
 */
function findComponentFile(componentPath) {
  // 首先检查映射表
  if (COMPONENT_PATH_MAP[componentPath]) {
    const mappedPath = path.join(CLIENT_PAGES_DIR, COMPONENT_PATH_MAP[componentPath]);
    if (fs.existsSync(mappedPath)) {
      return mappedPath;
    }
  }

  // 标准化路径
  const normalPath = componentPath
    .replace(/^\/+/, '')
    .replace(/\/([A-Z])/g, (match, letter) => '/' + letter.toLowerCase());

  // 尝试多种可能的路径
  const possiblePaths = [
    path.join(CLIENT_PAGES_DIR, normalPath, 'index.vue'),
    path.join(CLIENT_PAGES_DIR, normalPath + '.vue'),
    path.join(CLIENT_PAGES_DIR, componentPath, 'index.vue'),
    path.join(CLIENT_PAGES_DIR, componentPath + '.vue'),
    path.join(CLIENT_PAGES_DIR, componentPath.replace(/\/Layout$/, '') + '/index.vue'),
    path.join(CLIENT_PAGES_DIR, componentPath.toLowerCase(), 'index.vue')
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  return null;
}

/**
 * 扫描组件文件内容
 */
function scanComponentFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return {
      exists: false,
      buttons: [],
      todos: [],
      permissions: new Set(),
      error: null
    };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = {
      exists: true,
      buttons: [],
      todos: [],
      permissions: new Set(),
      error: null,
      lineCount: content.split('\n').length,
      buttonCount: 0
    };

    // 扫描按钮 - 改进版
    // 查找所有 el-button 开始标签
    const buttonStartRegex = /<el-button([^>]*)>/g;
    let buttonMatch;
    let buttonIndex = 0;

    while ((buttonMatch = buttonStartRegex.exec(content)) !== null) {
      buttonIndex++;
      const attrs = buttonMatch[1] || '';

      // 提取按钮属性
      const iconMatch = attrs.match(/icon=["']([^"']+)["']/);
      const typeMatch = attrs.match(/type=["']([^"']+)["']/);
      const sizeMatch = attrs.match(/size=["']([^"']+)["']/);
      const plainMatch = attrs.match(/plain(?!=)/);
      const roundMatch = attrs.match(/round(?!=)/);
      const circleMatch = attrs.match(/circle(?!=)/);
      const textMatch = attrs.match(/text(?!=)/);
      const linkMatch = attrs.match(/link(?!=)/);
      const bgMatch = attrs.match(/bg(?!=)/);
      const disabledMatch = attrs.match(/disabled(?!=)/);
      const loadingMatch = attrs.match(/loading(?!=)/);

      // 尝试提取按钮文本 - 查找按钮标签之后的内容
      const afterButton = content.slice(buttonMatch.index + buttonMatch[0].length);
      const textRegex = /^\s*([^<\n]{1,50})\s*<\/el-button>/;
      const textMatchResult = afterButton.match(textRegex);
      const btnText = textMatchResult ? textMatchResult[1].trim() : '';

      result.buttons.push({
        index: buttonIndex,
        text: btnText || 'N/A',
        icon: iconMatch ? iconMatch[1] : null,
        type: typeMatch ? typeMatch[1] : 'default',
        size: sizeMatch ? sizeMatch[1] : null,
        plain: !!plainMatch,
        round: !!roundMatch,
        circle: !!circleMatch,
        isText: !!textMatch,
        link: !!linkMatch,
        bg: !!bgMatch,
        disabled: !!disabledMatch,
        loading: !!loadingMatch
      });
    }

    result.buttonCount = result.buttons.length;

    // 扫描权限
    const permissionRegex = /v-permission\s*=\s*["']([^"']+)["']/g;
    while ((match = permissionRegex.exec(content)) !== null) {
      result.permissions.add(match[1]);
    }

    // 扫描待开发标记
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      for (const pattern of TODO_PATTERNS) {
        if (pattern.test(line)) {
          result.todos.push({
            line: index + 1,
            content: line.trim().substring(0, 100),
            type: pattern.source.replace(/\\/g, '')
          });
        }
      }
    });

    result.permissionCount = result.permissions.size;

    return result;
  } catch (error) {
    return {
      exists: true,
      buttons: [],
      todos: [],
      permissions: new Set(),
      error: error.message,
      buttonCount: 0
    };
  }
}

/**
 * 扫描子组件
 */
function scanChildComponents(componentDir) {
  if (!componentDir || !fs.existsSync(componentDir)) {
    return [];
  }

  try {
    const componentsDir = path.join(componentDir, 'components');
    if (!fs.existsSync(componentsDir)) {
      return [];
    }

    const items = fs.readdirSync(componentsDir, { withFileTypes: true });
    const components = [];

    for (const item of items) {
      if (item.isFile() && item.name.endsWith('.vue')) {
        const componentPath = path.join(componentsDir, item.name);
        components.push({
          name: item.name.replace('.vue', ''),
          path: componentPath,
          scan: scanComponentFile(componentPath)
        });
      }
    }

    return components;
  } catch (error) {
    return [];
  }
}

/**
 * 扫描单个角色
 */
function scanRole(roleKey, roleConfig) {
  console.log(`\n🔍 扫描角色: ${roleConfig.name} (${roleKey})`);

  const roleReport = {
    role: roleKey,
    roleName: roleConfig.name,
    totalPages: roleConfig.pages.length,
    pages: [],
    summary: {
      total: 0,
      exists: 0,
      missing: 0,
      withErrors: 0,
      totalButtons: 0,
      totalTodos: 0,
      withTodos: 0
    }
  };

  roleConfig.pages.forEach(pageConfig => {
    const fullPath = findComponentFile(pageConfig.component);
    const componentDir = fullPath ? path.dirname(fullPath) : null;

    const pageReport = {
      path: pageConfig.path,
      title: pageConfig.title,
      component: pageConfig.component,
      fullPath: fullPath,
      exists: !!fullPath,
      scan: null,
      childComponents: [],
      status: 'unknown'
    };

    if (fullPath) {
      pageReport.scan = scanComponentFile(fullPath);

      // 扫描子组件
      if (componentDir) {
        pageReport.childComponents = scanChildComponents(componentDir);

        // 累加子组件的按钮和待开发项
        pageReport.childComponents.forEach(child => {
          if (child.scan && child.scan.exists) {
            pageReport.scan.buttonCount += child.scan.buttonCount || 0;
            // 合并子组件的待开发项
            if (child.scan.todos && child.scan.todos.length > 0) {
              pageReport.scan.todos.push(...child.scan.todos);
            }
          }
        });
      }

      // 确定状态
      if (pageReport.scan.error) {
        pageReport.status = 'error';
        roleReport.summary.withErrors++;
      } else if (pageReport.scan.todos.length > 0) {
        pageReport.status = 'incomplete';
        roleReport.summary.withTodos++;
      } else {
        pageReport.status = 'complete';
      }

      roleReport.summary.exists++;
      roleReport.summary.totalButtons += pageReport.scan.buttonCount || 0;
      roleReport.summary.totalTodos += pageReport.scan.todos?.length || 0;
    } else {
      pageReport.status = 'missing';
      roleReport.summary.missing++;
    }

    roleReport.summary.total++;
    roleReport.pages.push(pageReport);

    // 输出进度
    const statusIcon = pageReport.exists ?
      (pageReport.status === 'complete' ? '✅' : (pageReport.status === 'incomplete' ? '⚠️' : '❌')) :
      '❌';
    const buttonInfo = pageReport.scan ? `${pageReport.scan.buttonCount || 0} 按钮` : 'N/A';
    console.log(`  ${statusIcon} ${pageReport.title} - ${buttonInfo}`);
  });

  return roleReport;
}

/**
 * 生成Markdown报告
 */
function generateMarkdownReport(reports) {
  let markdown = '# 幼儿园管理系统 - 全角色功能按钮扫描报告\n\n';
  markdown += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

  // 总览
  markdown += '## 📊 总体概览\n\n';

  let grandTotal = 0;
  let grandExists = 0;
  let grandMissing = 0;
  let grandButtons = 0;
  let grandTodos = 0;

  reports.forEach(report => {
    grandTotal += report.summary.total;
    grandExists += report.summary.exists;
    grandMissing += report.summary.missing;
    grandButtons += report.summary.totalButtons;
    grandTodos += report.summary.totalTodos;
  });

  const completionRate = grandTotal > 0 ? ((grandExists / grandTotal) * 100).toFixed(2) : '0.00';

  markdown += `- **总页面数**: ${grandTotal}\n`;
  markdown += `- **已实现**: ${grandExists} (${completionRate}%)\n`;
  markdown += `- **缺失**: ${grandMissing}\n`;
  markdown += `- **总按钮数**: ${grandButtons}\n`;
  markdown += `- **待开发项**: ${grandTodos}\n\n`;

  // 角色概览表格
  markdown += '## 🎭 角色概览\n\n';
  markdown += '| 角色 | 页面总数 | 已实现 | 缺失 | 按钮总数 | 待开发项 | 完成率 |\n';
  markdown += '|------|---------|--------|------|----------|----------|--------|\n';

  reports.forEach(report => {
    const rate = report.summary.total > 0 ?
      ((report.summary.exists / report.summary.total) * 100).toFixed(2) : '0.00';
    markdown += `| ${report.roleName} | ${report.summary.total} | ${report.summary.exists} | ` +
      `${report.summary.missing} | ${report.summary.totalButtons} | ${report.summary.totalTodos} | ${rate}% |\n`;
  });

  markdown += '\n';

  // 详细报告 - 按角色
  reports.forEach(report => {
    markdown += `## 👤 ${report.roleName} (${report.role})\n\n`;
    markdown += `### 概要统计\n\n`;
    markdown += `- **页面总数**: ${report.summary.total}\n`;
    markdown += `- **已实现**: ${report.summary.exists}\n`;
    markdown += `- **缺失**: ${report.summary.missing}\n`;
    markdown += `- **有错误**: ${report.summary.withErrors}\n`;
    markdown += `- **总按钮数**: ${report.summary.totalButtons}\n`;
    markdown += `- **待开发项**: ${report.summary.totalTodos}\n`;
    markdown += `- **有待开发标记的页面**: ${report.summary.withTodos}\n\n`;

    // 页面详情
    markdown += `### 页面详情\n\n`;

    // 已完整实现的页面
    const completePages = report.pages.filter(p => p.status === 'complete');
    if (completePages.length > 0) {
      markdown += `#### ✅ 完整实现的页面 (${completePages.length})\n\n`;
      completePages.forEach(page => {
        markdown += `- **${page.title}** (\`${page.path}\`)\n`;
        if (page.scan && page.scan.buttonCount > 0) {
          markdown += `  - 按钮: ${page.scan.buttonCount} 个\n`;
        }
        if (page.childComponents.length > 0) {
          markdown += `  - 子组件: ${page.childComponents.length} 个\n`;
        }
      });
      markdown += '\n';
    }

    // 有待开发标记的页面
    const incompletePages = report.pages.filter(p => p.status === 'incomplete');
    if (incompletePages.length > 0) {
      markdown += `#### ⚠️ 有待开发标记的页面 (${incompletePages.length})\n\n`;
      incompletePages.forEach(page => {
        markdown += `- **${page.title}** (\`${page.path}\`)\n`;
        if (page.scan && page.scan.todos && page.scan.todos.length > 0) {
          markdown += `  - 待开发项: ${page.scan.todos.length} 个\n`;
        }
      });
      markdown += '\n';
    }

    // 缺失的页面
    const missingPages = report.pages.filter(p => p.status === 'missing');
    if (missingPages.length > 0) {
      markdown += `#### 🔴 缺失的页面 (${missingPages.length})\n\n`;
      missingPages.forEach(page => {
        markdown += `- **${page.title}** (\`${page.path}\`) - 组件: \`${page.component}\`\n`;
      });
      markdown += '\n';
    }

    markdown += '\n';
  });

  // 问题汇总
  markdown += '## 🚨 问题汇总\n\n';

  const allMissing = reports.flatMap(r => r.pages.filter(p => p.status === 'missing'));
  const allIncomplete = reports.flatMap(r => r.pages.filter(p => p.status === 'incomplete'));

  if (allMissing.length > 0) {
    markdown += `### 缺失页面 (${allMissing.length})\n\n`;
    allMissing.forEach(page => {
      markdown += `- [${page.title}] \`${page.path}\` (\`${page.component}\`)\n`;
    });
    markdown += '\n';
  }

  if (allIncomplete.length > 0) {
    markdown += `### 需要完善的页面 (${allIncomplete.length})\n\n`;
    allIncomplete.forEach(page => {
      const todoCount = page.scan ? (page.scan.todos?.length || 0) : 0;
      markdown += `- [${page.title}] \`${page.path}\` - ${todoCount} 个待开发项\n`;
    });
    markdown += '\n';
  }

  // 功能按钮统计
  markdown += '## 🔘 功能按钮统计\n\n';
  markdown += '| 角色 | 按钮总数 | 平均每页按钮数 |\n';
  markdown += '|------|---------|---------------|\n';
  reports.forEach(report => {
    const avg = report.summary.exists > 0 ?
      (report.summary.totalButtons / report.summary.exists).toFixed(2) : '0.00';
    markdown += `| ${report.roleName} | ${report.summary.totalButtons} | ${avg} |\n`;
  });
  markdown += '\n';

  // 结论
  markdown += '## 📝 结论\n\n';
  if (grandMissing === 0 && grandTodos === 0) {
    markdown += '✅ 所有角色的页面都已完整实现，无缺失页面和待开发项。\n';
  } else {
    if (grandMissing > 0) {
      markdown += `⚠️ 发现 ${grandMissing} 个缺失页面需要创建。\n`;
    }
    if (grandTodos > 0) {
      markdown += `⚠️ 发现 ${grandTodos} 个待开发项需要完善。\n`;
    }
    markdown += `\n建议优先处理缺失页面和标记为 TODO 的功能点。\n`;
  }

  return markdown;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始全角色功能按钮扫描...\n');

  const reports = [];

  // 扫描所有角色
  Object.entries(ROLE_MENU_CONFIG).forEach(([roleKey, roleConfig]) => {
    const report = scanRole(roleKey, roleConfig);
    reports.push(report);
  });

  // 生成报告
  console.log('\n📊 生成扫描报告...');
  const markdown = generateMarkdownReport(reports);

  // 保存报告
  const reportPath = path.join(__dirname, '../ROLE_FUNCTION_SCAN_REPORT.md');
  fs.writeFileSync(reportPath, markdown, 'utf-8');

  console.log(`\n✅ 扫描完成！报告已保存到: ${reportPath}`);

  // 输出简要统计
  console.log('\n📈 简要统计:');
  reports.forEach(report => {
    const rate = report.summary.total > 0 ?
      ((report.summary.exists / report.summary.total) * 100).toFixed(2) : '0.00';
    console.log(`  ${report.roleName}: ${report.summary.exists}/${report.summary.total} (${rate}%) - ` +
      `${report.summary.totalButtons} 按钮`);
  });
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { scanRole, generateMarkdownReport };
