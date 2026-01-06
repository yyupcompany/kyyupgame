#!/usr/bin/env node

/**
 * 生成AI字典扩展项目综合报告
 */

const fs = require('fs');
const path = require('path');

function generateComprehensiveReport() {
  try {
    console.log('='.repeat(100));
    console.log('AI字典扩展和优化项目 - 综合执行报告');
    console.log('='.repeat(100));
    
    // 读取所有分析报告
    const reportsDir = path.join(__dirname, '../reports');
    const dbAnalysis = JSON.parse(fs.readFileSync(path.join(reportsDir, 'database-tables-analysis.json'), 'utf8'));
    const coverageAnalysis = JSON.parse(fs.readFileSync(path.join(reportsDir, 'dictionary-coverage-analysis.json'), 'utf8'));
    const templateRecommendations = JSON.parse(fs.readFileSync(path.join(reportsDir, 'template-recommendations.json'), 'utf8'));
    
    console.log('\n📊 项目执行概览');
    console.log('-'.repeat(60));
    console.log(`执行时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`数据库: ${dbAnalysis.database}`);
    console.log(`分析表总数: ${dbAnalysis.totalTables} 个`);
    console.log(`有数据表: ${dbAnalysis.summary.tablesWithData} 个`);
    console.log(`无数据表: ${dbAnalysis.summary.tablesWithoutData} 个`);
    
    console.log('\n🎯 数据库表优先级分布');
    console.log('-'.repeat(60));
    console.log(`高优先级表: ${dbAnalysis.summary.highPriorityTables} 个 (核心业务表)`);
    console.log(`中优先级表: ${dbAnalysis.summary.mediumPriorityTables} 个 (业务功能表)`);
    console.log(`低优先级表: ${dbAnalysis.summary.lowPriorityTables} 个 (配置日志表)`);
    console.log(`忽略表: ${dbAnalysis.summary.ignoreTables} 个 (系统表/空表)`);
    
    console.log('\n📈 业务类型分布');
    console.log('-'.repeat(60));
    Object.entries(dbAnalysis.businessTypeStats).forEach(([type, count]) => {
      const typeNames = {
        'core_business': '核心业务',
        'activity': '活动相关',
        'enrollment': '招生相关',
        'auth': '用户权限',
        'ai': 'AI功能',
        'marketing': '营销推广',
        'config': '配置管理',
        'log': '日志记录',
        'system': '系统表',
        'other': '其他'
      };
      console.log(`${(typeNames[type] || type).padEnd(8)}: ${count.toString().padStart(3)} 个表`);
    });
    
    console.log('\n📋 当前AI字典覆盖率分析');
    console.log('-'.repeat(60));
    console.log(`总体覆盖率: ${coverageAnalysis.coverageStats.totalCoverage}`);
    console.log(`高优先级表覆盖率: ${coverageAnalysis.coverageStats.highPriorityCoverage}`);
    console.log(`中优先级表覆盖率: ${coverageAnalysis.coverageStats.mediumPriorityCoverage}`);
    console.log(`已覆盖表数: ${coverageAnalysis.overallCoverage.coveredTables.length} 个`);
    console.log(`未覆盖表数: ${coverageAnalysis.overallCoverage.uncoveredTables.length} 个`);
    
    console.log('\n🚨 未覆盖的高优先级表 (需要立即处理)');
    console.log('-'.repeat(60));
    const highPriorityUncovered = coverageAnalysis.overallCoverage.uncoveredTables.filter(tableName => {
      const tableInfo = dbAnalysis.tableAnalysis.find(t => t.tableName === tableName);
      return tableInfo && tableInfo.priority === 'high';
    });
    
    highPriorityUncovered.forEach((tableName, index) => {
      const tableInfo = dbAnalysis.tableAnalysis.find(t => t.tableName === tableName);
      const rec = templateRecommendations.templateRecommendations[tableName];
      console.log(`${(index + 1).toString().padStart(2)}. ${rec?.displayName || tableName}`);
      console.log(`    表名: ${tableName}`);
      console.log(`    数据量: ${tableInfo?.rowCount || 0} 行`);
      console.log(`    业务类型: ${tableInfo?.businessType || 'unknown'}`);
      console.log(`    建议模板数: ${rec?.templateCount || 0} 个`);
    });
    
    console.log('\n📁 建议的新增字典文件结构');
    console.log('-'.repeat(60));
    Object.entries(templateRecommendations.fileStructure).forEach(([fileName, info]) => {
      if (info.tables.length > 0) {
        console.log(`📄 ${fileName}`);
        console.log(`   描述: ${info.description}`);
        console.log(`   包含表: ${info.tables.length} 个`);
        console.log(`   预估行数: ${info.estimatedLines} 行`);
        console.log(`   主要表: ${info.tables.slice(0, 3).join(', ')}${info.tables.length > 3 ? '...' : ''}`);
        console.log('');
      }
    });
    
    console.log('\n🎯 优先级处理建议');
    console.log('-'.repeat(60));
    console.log('第一优先级 (立即处理):');
    console.log('  ✅ 06-core-business-templates.json');
    console.log('     - 包含5个高优先级核心业务表');
    console.log('     - 涉及班级教师、幼儿园、家长等核心数据');
    console.log('     - 预估400行，建议优先完成');
    
    console.log('\n第二优先级 (近期处理):');
    console.log('  📋 07-activity-templates.json');
    console.log('     - 活动相关功能表，用户查询频率较高');
    console.log('     - 包含活动评估、计划、报名等');
    console.log('  📋 08-enrollment-templates.json');
    console.log('     - 招生相关功能表，业务重要性高');
    console.log('     - 包含入学通知、结果、咨询等');
    
    console.log('\n第三优先级 (后续处理):');
    console.log('  📋 09-marketing-templates.json');
    console.log('     - 营销推广相关表');
    console.log('  📋 10-system-templates.json');
    console.log('     - 系统功能表，查询频率较低');
    
    console.log('\n📝 具体实施步骤');
    console.log('-'.repeat(60));
    console.log('步骤1: 创建06-core-business-templates.json');
    console.log('  - 手动创建文件，遵循05-query-templates.json的格式');
    console.log('  - 为以下5个表创建查询模板:');
    highPriorityUncovered.forEach(tableName => {
      const rec = templateRecommendations.templateRecommendations[tableName];
      console.log(`    * ${rec?.displayName || tableName} (${tableName})`);
    });
    
    console.log('\n步骤2: 验证新增模板');
    console.log('  - 使用现有的验证脚本测试新模板');
    console.log('  - 确保SQL查询语法正确且能返回数据');
    console.log('  - 验证字段名和状态值映射正确');
    
    console.log('\n步骤3: 逐步扩展其他文件');
    console.log('  - 按优先级顺序创建其他模板文件');
    console.log('  - 每个文件完成后进行验证测试');
    console.log('  - 保持文件大小在500-1000行以内');
    
    console.log('\n📊 预期效果');
    console.log('-'.repeat(60));
    const currentCoverage = parseFloat(coverageAnalysis.coverageStats.totalCoverage);
    const potentialCoverage = ((coverageAnalysis.overallCoverage.coveredTables.length + templateRecommendations.summary.totalRecommendations) / dbAnalysis.totalTables * 100).toFixed(1);
    
    console.log(`当前覆盖率: ${coverageAnalysis.coverageStats.totalCoverage}`);
    console.log(`完成后预期覆盖率: ${potentialCoverage}%`);
    console.log(`新增查询模板: ${templateRecommendations.summary.totalRecommendations} 个表`);
    console.log(`高优先级表覆盖率: 37.5% → 100%`);
    console.log(`中优先级表覆盖率: 5.8% → 100%`);
    
    console.log('\n⚠️ 注意事项');
    console.log('-'.repeat(60));
    console.log('1. 所有新增模板必须手动创建，不使用自动写入脚本');
    console.log('2. 严格遵循现有JSON格式规范和命名约定');
    console.log('3. 每个查询模板都要包含完整的元数据信息');
    console.log('4. 状态值映射要与数据库实际值保持一致');
    console.log('5. 定期使用验证脚本确保模板正确性');
    
    console.log('\n🔧 可用的验证工具');
    console.log('-'.repeat(60));
    console.log('- check-ai-dictionary-keywords.js: 验证查询模板正确性');
    console.log('- analyze-database-tables.js: 重新分析数据库结构');
    console.log('- analyze-dictionary-coverage.js: 检查覆盖率变化');
    console.log('- final-validation-test.js: 全面测试所有查询');
    
    console.log('\n📈 项目价值');
    console.log('-'.repeat(60));
    console.log('✅ 大幅提升AI助手查询能力覆盖面');
    console.log('✅ 消除用户查询时的"未查询到"错误');
    console.log('✅ 支持更丰富的业务数据查询场景');
    console.log('✅ 提供标准化的查询模板扩展框架');
    console.log('✅ 为未来数据库变更提供维护指导');
    
    console.log('\n' + '='.repeat(100));
    console.log('报告生成完成 - 项目准备就绪，可开始手动创建模板文件');
    console.log('='.repeat(100));
    
    // 生成详细的模板创建指南
    generateTemplateCreationGuide(templateRecommendations);
    
  } catch (error) {
    console.error('生成报告时出错:', error);
  }
}

function generateTemplateCreationGuide(templateRecommendations) {
  console.log('\n📋 高优先级表模板创建指南');
  console.log('='.repeat(80));
  
  const highPriorityTables = ['class_teachers', 'kindergartens', 'parent_followups', 'parent_student_relations', 'parents'];
  
  highPriorityTables.forEach((tableName, index) => {
    const rec = templateRecommendations.templateRecommendations[tableName];
    if (!rec) return;
    
    console.log(`\n${index + 1}. ${rec.displayName} (${tableName})`);
    console.log('-'.repeat(40));
    console.log(`数据量: ${rec.rowCount} 行`);
    console.log(`业务类型: ${rec.businessType}`);
    console.log(`建议查询模板:`);
    
    Object.entries(rec.templates).forEach(([queryName, template]) => {
      console.log(`\n  "${queryName}": {`);
      console.log(`    "sql": "${template.sql}",`);
      console.log(`    "description": "${template.description}",`);
      console.log(`    "table": "${template.table}",`);
      console.log(`    "response": "${template.response}",`);
      console.log(`    "tokens": ${template.tokens}`);
      console.log(`  },`);
    });
  });
  
  console.log('\n📝 JSON格式注意事项:');
  console.log('- 确保所有字符串都用双引号包围');
  console.log('- 注意逗号的正确使用，最后一个条目不要逗号');
  console.log('- SQL语句中的单引号要正确转义');
  console.log('- 保持缩进格式一致');
}

// 运行报告生成
if (require.main === module) {
  generateComprehensiveReport();
}

module.exports = { generateComprehensiveReport };
