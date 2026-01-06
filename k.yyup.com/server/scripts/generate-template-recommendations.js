#!/usr/bin/env node

/**
 * 查询模板规划脚本
 * 为未覆盖的数据库表生成查询模板建议
 */

const fs = require('fs');
const path = require('path');

/**
 * 生成基础统计查询模板
 */
function generateBasicStatsTemplates(tableName, tableInfo) {
  const templates = {};
  const displayName = getTableDisplayName(tableName);
  
  // 总数查询
  templates[`${displayName}总数`] = {
    sql: `SELECT COUNT(*) as count FROM ${tableName}`,
    description: `查询${displayName}总数`,
    table: tableName,
    response: `当前${displayName}总数为{count}个`,
    tokens: 10
  };
  
  // 如果有status字段，添加按状态查询
  const statusField = tableInfo.columns && Array.isArray(tableInfo.columns) ?
    tableInfo.columns.find(col =>
      col.name && col.name.toLowerCase().includes('status') ||
      col.name && col.name.toLowerCase().includes('state')
    ) : null;
  
  if (statusField) {
    templates[`活跃${displayName}数量`] = {
      sql: `SELECT COUNT(*) as count FROM ${tableName} WHERE ${statusField.name} = 1`,
      description: `查询活跃${displayName}数量`,
      table: tableName,
      response: `当前活跃${displayName}数量为{count}个`,
      tokens: 12
    };
  }
  
  // 如果有created_at字段，添加时间相关查询
  const createdAtField = tableInfo.columns && Array.isArray(tableInfo.columns) ?
    tableInfo.columns.find(col =>
      col.name && col.name.toLowerCase().includes('created_at') ||
      col.name && col.name.toLowerCase().includes('create_time')
    ) : null;
  
  if (createdAtField) {
    templates[`本月新增${displayName}`] = {
      sql: `SELECT COUNT(*) as count FROM ${tableName} WHERE YEAR(${createdAtField.name}) = YEAR(NOW()) AND MONTH(${createdAtField.name}) = MONTH(NOW())`,
      description: `查询本月新增${displayName}数量`,
      table: tableName,
      response: `本月新增${displayName}{count}个`,
      tokens: 20
    };
  }
  
  return templates;
}

/**
 * 生成关联查询模板
 */
function generateRelationTemplates(tableName, tableInfo, allTables) {
  const templates = {};
  const displayName = getTableDisplayName(tableName);
  
  // 基于外键生成关联查询
  if (tableInfo.foreignKeys && Array.isArray(tableInfo.foreignKeys)) {
    tableInfo.foreignKeys.forEach(fk => {
      const refTable = fk.referencedTable;
      if (!refTable) return;

      const refDisplayName = getTableDisplayName(refTable);

      if (allTables[refTable]) {
        templates[`${displayName}按${refDisplayName}分布`] = {
          sql: `SELECT r.name as ${refTable}_name, COUNT(t.id) as count FROM ${refTable} r LEFT JOIN ${tableName} t ON r.id = t.${fk.column} GROUP BY r.id, r.name ORDER BY count DESC`,
          description: `查询${displayName}按${refDisplayName}的分布情况`,
          table: tableName,
          joins: [refTable],
          response: `${displayName}按${refDisplayName}分布统计完成`,
          tokens: 25
        };
      }
    });
  }
  
  return templates;
}

/**
 * 生成业务特定查询模板
 */
function generateBusinessSpecificTemplates(tableName, tableInfo) {
  const templates = {};
  const displayName = getTableDisplayName(tableName);
  const businessType = tableInfo.businessType;
  
  switch (businessType) {
    case 'activity':
      if (tableName.includes('registration')) {
        templates[`活动报名统计`] = {
          sql: `SELECT COUNT(*) as total_registrations, COUNT(DISTINCT activity_id) as activities_count FROM ${tableName}`,
          description: '统计活动报名情况',
          table: tableName,
          response: '活动报名统计完成',
          tokens: 20
        };
      }
      break;
      
    case 'enrollment':
      templates[`招生数据统计`] = {
        sql: `SELECT COUNT(*) as total_count, COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count FROM ${tableName}`,
        description: '统计招生数据',
        table: tableName,
        response: '招生数据统计完成',
        tokens: 25
      };
      break;
      
    case 'marketing':
      templates[`营销活动效果`] = {
        sql: `SELECT COUNT(*) as campaign_count, AVG(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_rate FROM ${tableName}`,
        description: '统计营销活动效果',
        table: tableName,
        response: '营销活动效果统计完成',
        tokens: 30
      };
      break;
  }
  
  return templates;
}

/**
 * 获取表的显示名称
 */
function getTableDisplayName(tableName) {
  if (!tableName || typeof tableName !== 'string') {
    return '未知表';
  }

  const nameMap = {
    'class_teachers': '班级教师',
    'kindergartens': '幼儿园',
    'parent_followups': '家长跟进',
    'parent_student_relations': '家长学生关系',
    'parents': '家长',
    'activity_registrations': '活动报名',
    'activity_evaluations': '活动评估',
    'activity_plans': '活动计划',
    'admission_notifications': '入学通知',
    'admission_results': '入学结果',
    'marketing_campaigns': '营销活动',
    'expert_consultations': '专家咨询',
    'ai_conversations': 'AI对话',
    'ai_messages': 'AI消息',
    'notifications': '通知',
    'schedules': '日程安排'
  };

  return nameMap[tableName] || tableName.replace(/_/g, '');
}

/**
 * 生成模板文件结构建议
 */
function generateTemplateFileStructure(uncoveredTables, allTables) {
  const fileStructure = {
    '06-core-business-templates.json': {
      description: '核心业务表查询模板',
      tables: [],
      estimatedLines: 0
    },
    '07-activity-templates.json': {
      description: '活动相关表查询模板',
      tables: [],
      estimatedLines: 0
    },
    '08-enrollment-templates.json': {
      description: '招生相关表查询模板',
      tables: [],
      estimatedLines: 0
    },
    '09-marketing-templates.json': {
      description: '营销相关表查询模板',
      tables: [],
      estimatedLines: 0
    },
    '10-system-templates.json': {
      description: '系统功能表查询模板',
      tables: [],
      estimatedLines: 0
    }
  };
  
  uncoveredTables.forEach(tableName => {
    const tableInfo = allTables[tableName];
    if (!tableInfo) return;
    
    let targetFile;
    switch (tableInfo.businessType) {
      case 'core_business':
        targetFile = '06-core-business-templates.json';
        break;
      case 'activity':
        targetFile = '07-activity-templates.json';
        break;
      case 'enrollment':
        targetFile = '08-enrollment-templates.json';
        break;
      case 'marketing':
        targetFile = '09-marketing-templates.json';
        break;
      default:
        targetFile = '10-system-templates.json';
    }
    
    fileStructure[targetFile].tables.push(tableName);
    // 估算每个表大约需要50-100行
    fileStructure[targetFile].estimatedLines += 80;
  });
  
  return fileStructure;
}

/**
 * 主函数
 */
function generateTemplateRecommendations() {
  try {
    console.log('读取分析报告...');
    
    // 读取数据库分析报告
    const dbAnalysisPath = path.join(__dirname, '../reports/database-tables-analysis.json');
    const dbAnalysis = JSON.parse(fs.readFileSync(dbAnalysisPath, 'utf8'));
    
    // 读取覆盖率分析报告
    const coverageAnalysisPath = path.join(__dirname, '../reports/dictionary-coverage-analysis.json');
    const coverageAnalysis = JSON.parse(fs.readFileSync(coverageAnalysisPath, 'utf8'));
    
    console.log('生成查询模板建议...');
    
    // 创建表信息映射
    const allTables = {};
    dbAnalysis.tableAnalysis.forEach(table => {
      allTables[table.tableName] = table;
    });
    
    // 获取未覆盖的高优先级和中优先级表
    const highPriorityUncovered = coverageAnalysis.overallCoverage.uncoveredTables.filter(tableName => {
      const tableInfo = allTables[tableName];
      return tableInfo && tableInfo.priority === 'high';
    });
    
    const mediumPriorityUncovered = coverageAnalysis.overallCoverage.uncoveredTables.filter(tableName => {
      const tableInfo = allTables[tableName];
      return tableInfo && tableInfo.priority === 'medium';
    });
    
    const recommendations = {
      timestamp: new Date().toISOString(),
      summary: {
        highPriorityTables: highPriorityUncovered.length,
        mediumPriorityTables: mediumPriorityUncovered.length,
        totalRecommendations: highPriorityUncovered.length + mediumPriorityUncovered.length
      },
      fileStructure: generateTemplateFileStructure(
        [...highPriorityUncovered, ...mediumPriorityUncovered], 
        allTables
      ),
      templateRecommendations: {}
    };
    
    // 为每个未覆盖的表生成模板建议
    [...highPriorityUncovered, ...mediumPriorityUncovered].forEach(tableName => {
      const tableInfo = allTables[tableName];
      if (!tableInfo) return;
      
      console.log(`生成 ${tableName} 的查询模板建议...`);
      
      const templates = {
        ...generateBasicStatsTemplates(tableName, tableInfo),
        ...generateRelationTemplates(tableName, tableInfo, allTables),
        ...generateBusinessSpecificTemplates(tableName, tableInfo)
      };
      
      recommendations.templateRecommendations[tableName] = {
        tableName,
        displayName: getTableDisplayName(tableName),
        businessType: tableInfo.businessType,
        priority: tableInfo.priority,
        rowCount: tableInfo.rowCount,
        templateCount: Object.keys(templates).length,
        templates
      };
    });
    
    // 保存建议报告
    const reportPath = path.join(__dirname, '../reports/template-recommendations.json');
    fs.writeFileSync(reportPath, JSON.stringify(recommendations, null, 2));
    
    // 输出报告
    console.log('\n' + '='.repeat(80));
    console.log('查询模板规划建议报告');
    console.log('='.repeat(80));
    
    console.log(`\n📊 建议概览:`);
    console.log(`  高优先级表: ${recommendations.summary.highPriorityTables} 个`);
    console.log(`  中优先级表: ${recommendations.summary.mediumPriorityTables} 个`);
    console.log(`  总计需要处理: ${recommendations.summary.totalRecommendations} 个表`);
    
    console.log('\n📁 建议的文件结构:');
    Object.entries(recommendations.fileStructure).forEach(([fileName, info]) => {
      if (info.tables.length > 0) {
        console.log(`  ${fileName}:`);
        console.log(`    描述: ${info.description}`);
        console.log(`    表数量: ${info.tables.length} 个`);
        console.log(`    预估行数: ${info.estimatedLines} 行`);
        console.log(`    包含表: ${info.tables.slice(0, 3).join(', ')}${info.tables.length > 3 ? '...' : ''}`);
      }
    });
    
    console.log('\n🎯 高优先级表模板建议:');
    highPriorityUncovered.forEach(tableName => {
      const rec = recommendations.templateRecommendations[tableName];
      if (rec) {
        console.log(`  ${rec.displayName} (${tableName}):`);
        console.log(`    数据量: ${rec.rowCount} 行`);
        console.log(`    建议模板数: ${rec.templateCount} 个`);
        console.log(`    模板示例: ${Object.keys(rec.templates).slice(0, 2).join(', ')}`);
      }
    });
    
    console.log(`\n详细建议报告已保存到: ${reportPath}`);
    
    return recommendations;
    
  } catch (error) {
    console.error('生成建议过程中出错:', error);
  }
}

// 运行生成
if (require.main === module) {
  generateTemplateRecommendations();
}

module.exports = { generateTemplateRecommendations };
