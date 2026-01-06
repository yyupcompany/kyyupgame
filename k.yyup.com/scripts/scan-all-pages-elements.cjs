const fs = require('fs');
const path = require('path');

// 扫描目录
const PAGES_DIR = path.join(__dirname, '../client/src/pages');
const CENTERS_DIR = path.join(PAGES_DIR, 'centers');
const OUTPUT_FILE = path.join(__dirname, '../全页面元素级检查001.md');

// 页面分析结果
const results = {
  centers: [],
  otherPages: [],
  totalPages: 0,
  totalCenters: 0,
  summary: {
    withCRUD: 0,
    withList: 0,
    withDialog: 0,
    withForm: 0,
    withTable: 0,
    issues: []
  }
};

/**
 * 分析Vue文件内容
 */
function analyzeVueFile(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const analysis = {
      fileName,
      path: filePath.replace(PAGES_DIR, 'pages'),
      hasTemplate: /<template>/i.test(content),
      hasScript: /<script/i.test(content),
      
      // CRUD操作检测
      crud: {
        create: /(@click|function|const)\s*=\s*["']?(create|add|new|handleCreate|handleAdd)/i.test(content),
        read: /(@click|function|const)\s*=\s*["']?(get|fetch|load|query|handleView|handleDetail)/i.test(content),
        update: /(@click|function|const)\s*=\s*["']?(update|edit|modify|handleEdit|handleUpdate)/i.test(content),
        delete: /(@click|function|const)\s*=\s*["']?(delete|remove|handleDelete|handleRemove)/i.test(content)
      },
      
      // UI组件检测
      components: {
        table: /<el-table/i.test(content),
        dialog: /<el-dialog/i.test(content),
        form: /<el-form/i.test(content),
        pagination: /<el-pagination/i.test(content),
        button: /<el-button/i.test(content),
        tabs: /<el-tabs/i.test(content)
      },
      
      // 列表字段检测
      tableColumns: extractTableColumns(content),
      
      // 表单字段检测
      formFields: extractFormFields(content),
      
      // 对话框检测
      dialogs: extractDialogs(content),
      
      // 问题检测
      issues: []
    };
    
    // 检测问题
    detectIssues(analysis, content);
    
    return analysis;
  } catch (error) {
    console.error(`分析文件失败: ${filePath}`, error.message);
    return null;
  }
}

/**
 * 提取表格列
 */
function extractTableColumns(content) {
  const columns = [];
  const columnRegex = /<el-table-column[^>]*label=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = columnRegex.exec(content)) !== null) {
    columns.push(match[1]);
  }
  
  return columns;
}

/**
 * 提取表单字段
 */
function extractFormFields(content) {
  const fields = [];
  const fieldRegex = /<el-form-item[^>]*label=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = fieldRegex.exec(content)) !== null) {
    fields.push(match[1]);
  }
  
  return fields;
}

/**
 * 提取对话框
 */
function extractDialogs(content) {
  const dialogs = [];
  const dialogRegex = /<el-dialog[^>]*title=["']([^"']+)["'][^>]*>/gi;
  let match;
  
  while ((match = dialogRegex.exec(content)) !== null) {
    dialogs.push(match[1]);
  }
  
  return dialogs;
}

/**
 * 检测问题
 */
function detectIssues(analysis, content) {
  // 检查是否有表格但没有分页
  if (analysis.components.table && !analysis.components.pagination) {
    analysis.issues.push('表格缺少分页组件');
  }
  
  // 检查是否有表单但没有验证
  if (analysis.components.form && !/rules\s*=/i.test(content)) {
    analysis.issues.push('表单可能缺少验证规则');
  }
  
  // 检查是否有对话框但没有关闭按钮
  if (analysis.components.dialog && !/@click.*close|handleClose|handleCancel/i.test(content)) {
    analysis.issues.push('对话框可能缺少关闭处理');
  }
  
  // 检查CRUD完整性
  const crudCount = Object.values(analysis.crud).filter(Boolean).length;
  if (crudCount > 0 && crudCount < 4) {
    analysis.issues.push(`CRUD操作不完整 (${crudCount}/4)`);
  }
  
  // 检查TODO标记
  const todoMatches = content.match(/TODO|待实现|开发中/gi);
  if (todoMatches && todoMatches.length > 0) {
    analysis.issues.push(`包含${todoMatches.length}个TODO标记`);
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir, isCenters = false) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    // 跳过备份文件和组件目录
    if (file.includes('.backup') || file === 'components' || file === '__tests__') {
      return;
    }
    
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath, isCenters);
    } else if (file.endsWith('.vue')) {
      const analysis = analyzeVueFile(filePath, file);
      if (analysis) {
        results.totalPages++;
        
        if (isCenters) {
          results.totalCenters++;
          results.centers.push(analysis);
        } else {
          results.otherPages.push(analysis);
        }
        
        // 更新统计
        if (Object.values(analysis.crud).some(Boolean)) {
          results.summary.withCRUD++;
        }
        if (analysis.tableColumns.length > 0) {
          results.summary.withList++;
        }
        if (analysis.components.dialog) {
          results.summary.withDialog++;
        }
        if (analysis.components.form) {
          results.summary.withForm++;
        }
        if (analysis.components.table) {
          results.summary.withTable++;
        }
        if (analysis.issues.length > 0) {
          results.summary.issues.push({
            file: file,
            issues: analysis.issues
          });
        }
      }
    }
  });
}

/**
 * 生成Markdown报告
 */
function generateReport() {
  let report = `# 全页面元素级检查报告 001\n\n`;
  report += `> 生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
  report += `> 扫描范围: Centers目录所有页面\n\n`;
  report += `---\n\n`;

  // 执行摘要
  report += `## 📋 执行摘要\n\n`;
  report += `本报告对 **${results.totalCenters}个中心页面** 进行了全面的元素级检查，包括CRUD操作、UI组件、表格列、表单字段、对话框等关键元素的分析。\n\n`;

  const completeCRUD = results.centers.filter(p =>
    Object.values(p.crud).every(Boolean)
  ).length;

  const hasTable = results.centers.filter(p => p.components.table).length;
  const hasDialog = results.centers.filter(p => p.components.dialog).length;
  const hasForm = results.centers.filter(p => p.components.form).length;

  report += `**关键发现**:\n`;
  report += `- ✅ **完整CRUD**: ${completeCRUD}个页面实现了完整的增删改查功能\n`;
  report += `- 📊 **数据展示**: ${hasTable}个页面包含数据表格\n`;
  report += `- 💬 **交互对话**: ${hasDialog}个页面包含对话框\n`;
  report += `- 📝 **表单输入**: ${hasForm}个页面包含表单\n`;
  report += `- ⚠️ **需要优化**: ${results.summary.issues.length}个页面存在待优化项\n\n`;

  // 总体统计
  report += `## 📊 总体统计\n\n`;
  report += `| 指标 | 数量 | 占比 |\n`;
  report += `|------|------|------|\n`;
  report += `| 总页面数 | ${results.totalPages} | 100% |\n`;
  report += `| 中心页面数 | ${results.totalCenters} | 100% |\n`;
  report += `| 完整CRUD | ${completeCRUD} | ${(completeCRUD/results.totalCenters*100).toFixed(1)}% |\n`;
  report += `| 包含CRUD操作 | ${results.summary.withCRUD} | ${(results.summary.withCRUD/results.totalCenters*100).toFixed(1)}% |\n`;
  report += `| 包含列表 | ${results.summary.withList} | ${(results.summary.withList/results.totalCenters*100).toFixed(1)}% |\n`;
  report += `| 包含对话框 | ${results.summary.withDialog} | ${(results.summary.withDialog/results.totalCenters*100).toFixed(1)}% |\n`;
  report += `| 包含表单 | ${results.summary.withForm} | ${(results.summary.withForm/results.totalCenters*100).toFixed(1)}% |\n`;
  report += `| 包含表格 | ${results.summary.withTable} | ${(results.summary.withTable/results.totalCenters*100).toFixed(1)}% |\n`;
  report += `| 存在问题的页面 | ${results.summary.issues.length} | ${(results.summary.issues.length/results.totalCenters*100).toFixed(1)}% |\n\n`;
  
  // 中心页面详情
  report += `## 🏢 中心页面详情 (${results.totalCenters}个)\n\n`;
  
  results.centers.forEach((page, index) => {
    report += `### ${index + 1}. ${page.fileName}\n\n`;
    report += `**路径**: \`${page.path}\`\n\n`;
    
    // CRUD操作
    report += `**CRUD操作**:\n`;
    report += `- Create (创建): ${page.crud.create ? '✅' : '❌'}\n`;
    report += `- Read (查询): ${page.crud.read ? '✅' : '❌'}\n`;
    report += `- Update (更新): ${page.crud.update ? '✅' : '❌'}\n`;
    report += `- Delete (删除): ${page.crud.delete ? '✅' : '❌'}\n\n`;
    
    // UI组件
    report += `**UI组件**:\n`;
    report += `- 表格: ${page.components.table ? '✅' : '❌'}\n`;
    report += `- 对话框: ${page.components.dialog ? '✅' : '❌'}\n`;
    report += `- 表单: ${page.components.form ? '✅' : '❌'}\n`;
    report += `- 分页: ${page.components.pagination ? '✅' : '❌'}\n`;
    report += `- 标签页: ${page.components.tabs ? '✅' : '❌'}\n\n`;
    
    // 表格列
    if (page.tableColumns.length > 0) {
      report += `**表格列** (${page.tableColumns.length}列):\n`;
      page.tableColumns.forEach(col => {
        report += `- ${col}\n`;
      });
      report += `\n`;
    }
    
    // 表单字段
    if (page.formFields.length > 0) {
      report += `**表单字段** (${page.formFields.length}个):\n`;
      page.formFields.forEach(field => {
        report += `- ${field}\n`;
      });
      report += `\n`;
    }
    
    // 对话框
    if (page.dialogs.length > 0) {
      report += `**对话框** (${page.dialogs.length}个):\n`;
      page.dialogs.forEach(dialog => {
        report += `- ${dialog}\n`;
      });
      report += `\n`;
    }
    
    // 问题
    if (page.issues.length > 0) {
      report += `**⚠️ 发现问题**:\n`;
      page.issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
      report += `\n`;
    }
    
    report += `---\n\n`;
  });

  // 问题汇总
  report += `## ⚠️ 问题汇总\n\n`;

  if (results.summary.issues.length > 0) {
    // 按问题类型分类
    const issuesByType = {};
    results.summary.issues.forEach(item => {
      item.issues.forEach(issue => {
        if (!issuesByType[issue]) {
          issuesByType[issue] = [];
        }
        issuesByType[issue].push(item.file);
      });
    });

    Object.keys(issuesByType).sort().forEach(issueType => {
      const files = issuesByType[issueType];
      report += `### ${issueType}\n\n`;
      report += `**影响页面** (${files.length}个):\n`;
      files.forEach(file => {
        report += `- ${file}\n`;
      });
      report += `\n`;
    });
  } else {
    report += `✅ 未发现问题\n\n`;
  }

  // 优化建议
  report += `## 💡 优化建议\n\n`;

  report += `### 1. CRUD操作完整性\n\n`;
  const incompleteCRUD = results.centers.filter(p => {
    const count = Object.values(p.crud).filter(Boolean).length;
    return count > 0 && count < 4;
  });

  if (incompleteCRUD.length > 0) {
    report += `**需要补充CRUD操作的页面** (${incompleteCRUD.length}个):\n\n`;
    incompleteCRUD.forEach(page => {
      const missing = [];
      if (!page.crud.create) missing.push('Create');
      if (!page.crud.read) missing.push('Read');
      if (!page.crud.update) missing.push('Update');
      if (!page.crud.delete) missing.push('Delete');

      report += `- **${page.fileName}**: 缺少 ${missing.join(', ')}\n`;
    });
    report += `\n`;
  }

  report += `### 2. 表格分页\n\n`;
  const tableWithoutPagination = results.centers.filter(p =>
    p.components.table && !p.components.pagination
  );

  if (tableWithoutPagination.length > 0) {
    report += `**需要添加分页的表格** (${tableWithoutPagination.length}个):\n\n`;
    tableWithoutPagination.forEach(page => {
      report += `- ${page.fileName}\n`;
    });
    report += `\n`;
  }

  report += `### 3. 表单验证\n\n`;
  const formWithoutValidation = results.centers.filter(p =>
    p.issues.includes('表单可能缺少验证规则')
  );

  if (formWithoutValidation.length > 0) {
    report += `**需要添加验证规则的表单** (${formWithoutValidation.length}个):\n\n`;
    formWithoutValidation.forEach(page => {
      report += `- ${page.fileName}\n`;
    });
    report += `\n`;
  }

  report += `### 4. TODO标记清理\n\n`;
  const withTODO = results.centers.filter(p =>
    p.issues.some(i => i.includes('TODO'))
  );

  if (withTODO.length > 0) {
    report += `**包含TODO标记的页面** (${withTODO.length}个):\n\n`;
    withTODO.forEach(page => {
      const todoIssue = page.issues.find(i => i.includes('TODO'));
      report += `- ${page.fileName}: ${todoIssue}\n`;
    });
    report += `\n`;
  }

  // 最佳实践示例
  report += `## ✨ 最佳实践示例\n\n`;

  const bestPractices = results.centers.filter(p =>
    Object.values(p.crud).every(Boolean) &&
    p.components.table &&
    p.components.pagination &&
    p.issues.length === 0
  );

  if (bestPractices.length > 0) {
    report += `以下页面实现了完整的CRUD操作，包含表格和分页，且无明显问题，可作为参考:\n\n`;
    bestPractices.forEach(page => {
      report += `- **${page.fileName}**\n`;
      report += `  - ✅ 完整CRUD操作\n`;
      report += `  - ✅ 数据表格 (${page.tableColumns.length}列)\n`;
      report += `  - ✅ 分页组件\n`;
      if (page.components.dialog) {
        report += `  - ✅ 对话框 (${page.dialogs.length}个)\n`;
      }
      if (page.components.form) {
        report += `  - ✅ 表单 (${page.formFields.length}个字段)\n`;
      }
      report += `\n`;
    });
  } else {
    report += `暂无完全符合最佳实践的页面，建议参考以下标准:\n\n`;
    report += `- ✅ 实现完整的CRUD操作\n`;
    report += `- ✅ 表格包含分页组件\n`;
    report += `- ✅ 表单包含验证规则\n`;
    report += `- ✅ 对话框包含关闭处理\n`;
    report += `- ✅ 清理所有TODO标记\n\n`;
  }

  // 下一步行动
  report += `## 🎯 下一步行动\n\n`;
  report += `### 优先级1: 高优先级\n\n`;
  report += `1. **补充CRUD操作**: 为${incompleteCRUD.length}个页面补充缺失的CRUD功能\n`;
  report += `2. **添加表格分页**: 为${tableWithoutPagination.length}个表格添加分页组件\n\n`;

  report += `### 优先级2: 中优先级\n\n`;
  report += `1. **表单验证**: 为${formWithoutValidation.length}个表单添加验证规则\n`;
  report += `2. **对话框优化**: 确保所有对话框有正确的关闭处理\n\n`;

  report += `### 优先级3: 低优先级\n\n`;
  report += `1. **TODO清理**: 清理${withTODO.length}个页面中的TODO标记\n`;
  report += `2. **代码规范**: 统一代码风格和命名规范\n\n`;

  report += `---\n\n`;
  report += `**报告生成时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  report += `**扫描工具**: scripts/scan-all-pages-elements.cjs\n`;

  return report;
}

// 执行扫描
console.log('开始扫描页面...');
console.log('扫描中心目录:', CENTERS_DIR);

scanDirectory(CENTERS_DIR, true);

console.log(`\n扫描完成!`);
console.log(`- 总页面数: ${results.totalPages}`);
console.log(`- 中心页面数: ${results.totalCenters}`);
console.log(`- 包含CRUD: ${results.summary.withCRUD}`);
console.log(`- 存在问题: ${results.summary.issues.length}`);

// 生成报告
const report = generateReport();
fs.writeFileSync(OUTPUT_FILE, report, 'utf-8');

console.log(`\n报告已生成: ${OUTPUT_FILE}`);

