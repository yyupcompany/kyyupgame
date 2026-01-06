#!/usr/bin/env node

/**
 * 角色功能按钮扫描摘要生成器
 * 生成更详细和可视化的扫描摘要
 */

const fs = require('fs');
const path = require('path');

// 读取完整的扫描报告
const reportPath = path.join(__dirname, '../ROLE_FUNCTION_SCAN_REPORT.md');
const reportContent = fs.readFileSync(reportPath, 'utf-8');

// 提取关键数据
function extractSummaryData() {
  const lines = reportContent.split('\n');
  const data = {
    generatedAt: null,
    totalPages: 0,
    implementedPages: 0,
    missingPages: 0,
    totalButtons: 0,
    totalTodos: 0,
    roles: []
  };

  // 提取生成时间
  const timeMatch = reportContent.match(/生成时间: (.+)/);
  if (timeMatch) {
    data.generatedAt = timeMatch[1];
  }

  // 提取总体概览
  const totalPagesMatch = reportContent.match(/- \*\*总页面数\*\*: (\d+)/);
  const implementedMatch = reportContent.match(/- \*\*已实现\*\*: (\d+)/);
  const missingMatch = reportContent.match(/- \*\*缺失\*\*: (\d+)/);
  const buttonsMatch = reportContent.match(/- \*\*总按钮数\*\*: (\d+)/);
  const todosMatch = reportContent.match(/- \*\*待开发项\*\*: (\d+)/);

  if (totalPagesMatch) data.totalPages = parseInt(totalPagesMatch[1]);
  if (implementedMatch) data.implementedPages = parseInt(implementedMatch[1]);
  if (missingMatch) data.missingPages = parseInt(missingMatch[1]);
  if (buttonsMatch) data.totalButtons = parseInt(buttonsMatch[1]);
  if (todosMatch) data.totalTodos = parseInt(todosMatch[1]);

  // 提取角色数据
  const roleTableRegex = /\| (.+?) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \| (\d+) \| ([\d.]+)% \|/g;
  let roleMatch;
  while ((roleMatch = roleTableRegex.exec(reportContent)) !== null) {
    data.roles.push({
      name: roleMatch[1],
      pages: parseInt(roleMatch[2]),
      implemented: parseInt(roleMatch[3]),
      missing: parseInt(roleMatch[4]),
      buttons: parseInt(roleMatch[5]),
      todos: parseInt(roleMatch[6]),
      completionRate: parseFloat(roleMatch[7])
    });
  }

  return data;
}

// 生成可视化图表
function generateBarChart(label, value, max, width = 30) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percentage = ((value / max) * 100).toFixed(1);
  return `${label}\n${bar} ${value}/${max} (${percentage}%)`;
}

// 生成详细摘要
function generateDetailedSummary() {
  const data = extractSummaryData();

  let summary = '# 幼儿园管理系统 - 角色功能按钮扫描详细摘要\n\n';
  summary += `生成时间: ${data.generatedAt}\n\n`;

  // 执行摘要
  summary += '## 📋 执行摘要\n\n';
  summary += '本次扫描对幼儿园管理系统的四个角色（系统管理员、园长、教师、家长）进行了全面的功能按钮和开发状态扫描。\n\n';

  summary += '### 关键指标\n\n';
  summary += `- **页面总数**: ${data.totalPages}\n`;
  summary += `- **实现率**: ${((data.implementedPages / data.totalPages) * 100).toFixed(2)}%\n`;
  summary += `- **功能按钮总数**: ${data.totalButtons}\n`;
  summary += `- **待开发项总数**: ${data.totalTodos}\n`;
  summary += `- **平均每页按钮数**: ${(data.totalButtons / data.implementedPages).toFixed(2)}\n\n`;

  // 角色概览
  summary += '## 👥 角色概览\n\n';
  data.roles.forEach(role => {
    const avgButtons = (role.buttons / role.implemented).toFixed(2);
    summary += `### ${role.name}\n\n`;
    summary += `- **页面**: ${role.implemented}/${role.pages} (${role.completionRate}%)\n`;
    summary += `- **功能按钮**: ${role.buttons} 个\n`;
    summary += `- **平均每页**: ${avgButtons} 个按钮\n`;
    summary += `- **待开发项**: ${role.todos} 个\n\n`;
  });

  // 可视化图表
  summary += '## 📊 可视化分析\n\n';

  // 页面完成率
  summary += '### 角色页面完成率\n\n';
  data.roles.forEach(role => {
    summary += generateBarChart(role.name, role.implemented, role.pages) + '\n\n';
  });

  // 功能按钮分布
  summary += '### 功能按钮分布\n\n';
  const maxButtons = Math.max(...data.roles.map(r => r.buttons));
  data.roles.forEach(role => {
    summary += generateBarChart(role.name, role.buttons, maxButtons) + '\n\n';
  });

  // 待开发项分布
  summary += '### 待开发项分布\n\n';
  const maxTodos = Math.max(...data.roles.map(r => r.todos));
  data.roles.forEach(role => {
    summary += generateBarChart(role.name, role.todos, maxTodos) + '\n\n';
  });

  // 详细角色分析
  summary += '## 🔍 详细角色分析\n\n';

  data.roles.forEach(role => {
    summary += `### ${role.name}\n\n`;
    summary += `**访问权限**:\n`;
    summary += `- 可访问页面数: ${role.pages}\n`;
    summary += `- 已实现页面数: ${role.implemented}\n`;
    summary += `- 缺失页面数: ${role.missing}\n\n`;

    summary += `**功能丰富度**:\n`;
    summary += `- 总按钮数: ${role.buttons}\n`;
    summary += `- 平均每页按钮数: ${(role.buttons / role.implemented).toFixed(2)}\n`;
    summary += `- 按钮密度: ${role.buttons > 200 ? '高' : role.buttons > 100 ? '中' : '低'}\n\n`;

    summary += `**开发进度**:\n`;
    summary += `- 待开发项: ${role.todos}\n`;
    summary += `- 开发完成度: ${((role.implemented - role.todos / 10) / role.implemented * 100).toFixed(2)}% (估算)\n\n`;

    summary += `**评估**:\n`;
    if (role.completionRate === 100 && role.todos === 0) {
      summary += `✅ ${role.name}的所有页面已完整实现，无需进一步开发。\n`;
    } else if (role.completionRate === 100) {
      summary += `⚠️ ${role.name}的所有页面已创建，但有 ${role.todos} 个待开发项需要完善。\n`;
    } else {
      summary += `❌ ${role.name}有 ${role.missing} 个页面缺失，需要创建。\n`;
    }
    summary += '\n';
  });

  // 功能按钮详细统计
  summary += '## 🔘 功能按钮详细统计\n\n';
  summary += '| 角色 | 按钮总数 | 平均每页 | 密度评级 |\n';
  summary += '|------|---------|---------|----------|\n';
  data.roles.forEach(role => {
    const avg = (role.buttons / role.implemented).toFixed(2);
    const density = role.buttons > 200 ? '高' : role.buttons > 100 ? '中' : '低';
    summary += `| ${role.name} | ${role.buttons} | ${avg} | ${density} |\n`;
  });
  summary += '\n';

  // 待开发项详细统计
  summary += '## ⚠️ 待开发项详细统计\n\n';
  summary += '| 角色 | 待开发项 | 占比 | 优先级 |\n';
  summary += '|------|---------|------|--------|\n';
  data.roles.forEach(role => {
    const percentage = ((role.todos / data.totalTodos) * 100).toFixed(2);
    const priority = role.todos > 300 ? '高' : role.todos > 100 ? '中' : '低';
    summary += `| ${role.name} | ${role.todos} | ${percentage}% | ${priority} |\n`;
  });
  summary += '\n';

  // 建议
  summary += '## 💡 建议\n\n';

  // 基于数据的建议
  const highPriorityRoles = data.roles.filter(r => r.todos > 300);
  const lowButtonRoles = data.roles.filter(r => (r.buttons / r.implemented) < 10);

  if (highPriorityRoles.length > 0) {
    summary += '### 高优先级任务\n\n';
    highPriorityRoles.forEach(role => {
      summary += `- **${role.name}**: 有 ${role.todos} 个待开发项，建议优先处理\n`;
    });
    summary += '\n';
  }

  if (lowButtonRoles.length > 0) {
    summary += '### 功能增强建议\n\n';
    lowButtonRoles.forEach(role => {
      summary += `- **${role.name}**: 平均每页仅 ${(role.buttons / role.implemented).toFixed(2)} 个按钮，建议增加更多交互功能\n`;
    });
    summary += '\n';
  }

  summary += '### 通用建议\n\n';
  summary += '1. **优先处理缺失页面**: 确保所有角色的所有页面都已创建\n';
  summary += '2. **完善待开发功能**: 按优先级处理标记为 TODO 的功能点\n';
  summary += '3. **提高功能密度**: 为按钮较少的页面增加更多交互功能\n';
  summary += '4. **统一用户体验**: 确保不同角色的相似页面具有一致的功能\n\n';

  // 总结
  summary += '## 📝 总结\n\n';
  summary += `本次扫描覆盖了 **${data.totalPages}** 个页面，发现 **${data.totalButtons}** 个功能按钮，`;
  summary += `识别出 **${data.totalTodos}** 个待开发项。\n\n`;

  const completionRate = (data.implementedPages / data.totalPages * 100).toFixed(2);
  if (completionRate === '100.00') {
    summary += '### ✅ 整体评估\n\n';
    summary += '所有角色的所有页面均已实现，系统架构完整。下一步应专注于：\n';
    summary += '1. 完善待开发功能点\n';
    summary += '2. 优化用户体验\n';
    summary += '3. 提高功能丰富度\n';
  } else {
    summary += '### ⚠️ 整体评估\n\n';
    summary += `系统完成度为 **${completionRate}%**，仍有 ${data.missingPages} 个页面需要创建。\n`;
    summary += '建议优先完成缺失页面的开发，确保系统功能完整性。\n';
  }

  summary += '\n---\n\n';
  summary += '*本报告由智能角色扫描工具自动生成*\n';

  return summary;
}

// 主函数
function main() {
  console.log('📊 生成详细扫描摘要...');

  const summary = generateDetailedSummary();
  const summaryPath = path.join(__dirname, '../ROLE_FUNCTION_SCAN_SUMMARY.md');

  fs.writeFileSync(summaryPath, summary, 'utf-8');

  console.log(`✅ 摘要已保存到: ${summaryPath}`);
  console.log('\n📈 关键数据:');
  const data = extractSummaryData();
  console.log(`  - 总页面数: ${data.totalPages}`);
  console.log(`  - 完成率: ${((data.implementedPages / data.totalPages) * 100).toFixed(2)}%`);
  console.log(`  - 总按钮数: ${data.totalButtons}`);
  console.log(`  - 待开发项: ${data.totalTodos}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateDetailedSummary, extractSummaryData };
