#!/usr/bin/env node

/**
 * AI字典覆盖率分析脚本
 * 分析现有字典文件覆盖的表，识别缺失和过时的条目
 */

const fs = require('fs');
const path = require('path');

// AI字典文件路径
const dictionaryPath = path.join(__dirname, '../src/config/ai-dictionaries');

/**
 * 读取所有AI字典文件
 */
function loadDictionaryFiles() {
  const files = fs.readdirSync(dictionaryPath).filter(file => file.endsWith('.json'));
  const dictionaries = {};
  
  files.forEach(file => {
    const filePath = path.join(dictionaryPath, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    dictionaries[file] = content;
  });
  
  return dictionaries;
}

/**
 * 从查询模板中提取表名
 */
function extractTablesFromQueryTemplates(queryTemplates) {
  const tables = new Set();
  
  for (const [queryName, queryData] of Object.entries(queryTemplates)) {
    if (typeof queryData === 'string' || queryName.startsWith('//')) {
      continue; // 跳过注释
    }
    
    // 从table字段提取
    if (queryData.table) {
      if (queryData.table === 'multiple') {
        // 从SQL中提取表名
        if (queryData.sql) {
          const tableMatches = queryData.sql.match(/FROM\s+`?(\w+)`?/gi);
          if (tableMatches) {
            tableMatches.forEach(match => {
              const tableName = match.replace(/FROM\s+`?/i, '').replace(/`?$/, '').trim();
              tables.add(tableName);
            });
          }
        }
      } else {
        tables.add(queryData.table);
      }
    }
    
    // 从joins中提取表名
    if (queryData.joins && Array.isArray(queryData.joins)) {
      queryData.joins.forEach(table => tables.add(table));
    }
    
    // 从SQL语句中提取更多表名
    if (queryData.sql) {
      const joinMatches = queryData.sql.match(/JOIN\s+`?(\w+)`?/gi);
      if (joinMatches) {
        joinMatches.forEach(match => {
          const tableName = match.replace(/JOIN\s+`?/i, '').replace(/`?$/, '').trim();
          tables.add(tableName);
        });
      }
    }
  }
  
  return Array.from(tables);
}

/**
 * 从表字段映射中提取表名
 */
function extractTablesFromTableFields(tableFields) {
  const tables = new Set();
  
  for (const [key, tableData] of Object.entries(tableFields)) {
    if (typeof tableData === 'string' || key.startsWith('//')) {
      continue; // 跳过注释
    }
    
    const tableName = tableData.tableName || key;
    tables.add(tableName);
  }
  
  return Array.from(tables);
}

/**
 * 分析字典覆盖率
 */
function analyzeDictionaryCoverage() {
  try {
    console.log('读取数据库分析报告...');
    const dbAnalysisPath = path.join(__dirname, '../reports/database-tables-analysis.json');
    if (!fs.existsSync(dbAnalysisPath)) {
      throw new Error('请先运行 analyze-database-tables.js 生成数据库分析报告');
    }
    
    const dbAnalysis = JSON.parse(fs.readFileSync(dbAnalysisPath, 'utf8'));
    const allDbTables = dbAnalysis.tableAnalysis.map(t => t.tableName);
    const highPriorityTables = dbAnalysis.tableAnalysis
      .filter(t => t.priority === 'high')
      .map(t => t.tableName);
    const mediumPriorityTables = dbAnalysis.tableAnalysis
      .filter(t => t.priority === 'medium')
      .map(t => t.tableName);
    
    console.log('读取AI字典文件...');
    const dictionaries = loadDictionaryFiles();
    
    console.log('分析字典覆盖率...');
    
    const coverageAnalysis = {
      timestamp: new Date().toISOString(),
      databaseTables: {
        total: allDbTables.length,
        highPriority: highPriorityTables.length,
        mediumPriority: mediumPriorityTables.length
      },
      dictionaryCoverage: {},
      overallCoverage: {
        coveredTables: new Set(),
        uncoveredTables: new Set(),
        obsoleteTables: new Set()
      },
      recommendations: []
    };
    
    // 分析每个字典文件
    for (const [fileName, dictionary] of Object.entries(dictionaries)) {
      console.log(`分析字典文件: ${fileName}`);
      
      let coveredTables = [];
      
      if ((fileName === '05-query-templates.json' || fileName.includes('-templates.json')) && dictionary.queryTemplates) {
        coveredTables = extractTablesFromQueryTemplates(dictionary.queryTemplates);
      } else if (fileName === '02-table-fields.json' && dictionary.tableFields) {
        coveredTables = extractTablesFromTableFields(dictionary.tableFields);
      }
      
      // 检查覆盖的表是否在数据库中存在
      const validTables = coveredTables.filter(table => allDbTables.includes(table));
      const obsoleteTables = coveredTables.filter(table => !allDbTables.includes(table));
      
      coverageAnalysis.dictionaryCoverage[fileName] = {
        coveredTables: coveredTables.length,
        validTables: validTables.length,
        obsoleteTables: obsoleteTables.length,
        tables: validTables,
        obsolete: obsoleteTables
      };
      
      // 添加到总体覆盖率
      validTables.forEach(table => coverageAnalysis.overallCoverage.coveredTables.add(table));
      obsoleteTables.forEach(table => coverageAnalysis.overallCoverage.obsoleteTables.add(table));
    }
    
    // 计算未覆盖的表
    allDbTables.forEach(table => {
      if (!coverageAnalysis.overallCoverage.coveredTables.has(table)) {
        coverageAnalysis.overallCoverage.uncoveredTables.add(table);
      }
    });
    
    // 转换Set为Array以便JSON序列化
    coverageAnalysis.overallCoverage.coveredTables = Array.from(coverageAnalysis.overallCoverage.coveredTables);
    coverageAnalysis.overallCoverage.uncoveredTables = Array.from(coverageAnalysis.overallCoverage.uncoveredTables);
    coverageAnalysis.overallCoverage.obsoleteTables = Array.from(coverageAnalysis.overallCoverage.obsoleteTables);
    
    // 按优先级分析未覆盖的表
    const uncoveredHighPriority = highPriorityTables.filter(table => 
      coverageAnalysis.overallCoverage.uncoveredTables.includes(table)
    );
    const uncoveredMediumPriority = mediumPriorityTables.filter(table => 
      coverageAnalysis.overallCoverage.uncoveredTables.includes(table)
    );
    
    // 生成建议
    if (uncoveredHighPriority.length > 0) {
      coverageAnalysis.recommendations.push({
        priority: 'high',
        action: 'create_query_templates',
        tables: uncoveredHighPriority,
        description: '为高优先级核心业务表创建查询模板'
      });
    }
    
    if (uncoveredMediumPriority.length > 0) {
      coverageAnalysis.recommendations.push({
        priority: 'medium',
        action: 'create_query_templates',
        tables: uncoveredMediumPriority,
        description: '为中优先级业务表创建查询模板'
      });
    }
    
    if (coverageAnalysis.overallCoverage.obsoleteTables.length > 0) {
      coverageAnalysis.recommendations.push({
        priority: 'low',
        action: 'remove_obsolete_entries',
        tables: coverageAnalysis.overallCoverage.obsoleteTables,
        description: '清理过时的表引用'
      });
    }
    
    // 计算覆盖率统计
    const totalCoverage = (coverageAnalysis.overallCoverage.coveredTables.length / allDbTables.length * 100).toFixed(1);
    const highPriorityCoverage = ((highPriorityTables.length - uncoveredHighPriority.length) / highPriorityTables.length * 100).toFixed(1);
    const mediumPriorityCoverage = ((mediumPriorityTables.length - uncoveredMediumPriority.length) / mediumPriorityTables.length * 100).toFixed(1);
    
    coverageAnalysis.coverageStats = {
      totalCoverage: `${totalCoverage}%`,
      highPriorityCoverage: `${highPriorityCoverage}%`,
      mediumPriorityCoverage: `${mediumPriorityCoverage}%`,
      uncoveredHighPriority: uncoveredHighPriority.length,
      uncoveredMediumPriority: uncoveredMediumPriority.length
    };
    
    // 保存分析结果
    const reportPath = path.join(__dirname, '../reports/dictionary-coverage-analysis.json');
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(coverageAnalysis, null, 2));
    
    // 输出报告
    console.log('\n' + '='.repeat(80));
    console.log('AI字典覆盖率分析报告');
    console.log('='.repeat(80));
    
    console.log(`\n📊 总体覆盖率: ${totalCoverage}% (${coverageAnalysis.overallCoverage.coveredTables.length}/${allDbTables.length})`);
    console.log(`📈 高优先级表覆盖率: ${highPriorityCoverage}% (${highPriorityTables.length - uncoveredHighPriority.length}/${highPriorityTables.length})`);
    console.log(`📈 中优先级表覆盖率: ${mediumPriorityCoverage}% (${mediumPriorityTables.length - uncoveredMediumPriority.length}/${mediumPriorityTables.length})`);
    
    console.log('\n📁 各字典文件覆盖情况:');
    Object.entries(coverageAnalysis.dictionaryCoverage).forEach(([fileName, coverage]) => {
      console.log(`  ${fileName}: ${coverage.validTables} 个有效表, ${coverage.obsoleteTables} 个过时表`);
    });
    
    console.log('\n🚨 未覆盖的高优先级表:');
    uncoveredHighPriority.forEach(table => {
      const tableInfo = dbAnalysis.tableAnalysis.find(t => t.tableName === table);
      console.log(`  - ${table} (${tableInfo?.rowCount || 0} 行, ${tableInfo?.businessType || 'unknown'})`);
    });
    
    console.log('\n⚠️ 未覆盖的中优先级表:');
    uncoveredMediumPriority.slice(0, 10).forEach(table => {
      const tableInfo = dbAnalysis.tableAnalysis.find(t => t.tableName === table);
      console.log(`  - ${table} (${tableInfo?.rowCount || 0} 行, ${tableInfo?.businessType || 'unknown'})`);
    });
    if (uncoveredMediumPriority.length > 10) {
      console.log(`  ... 还有 ${uncoveredMediumPriority.length - 10} 个表`);
    }
    
    if (coverageAnalysis.overallCoverage.obsoleteTables.length > 0) {
      console.log('\n🗑️ 过时的表引用:');
      coverageAnalysis.overallCoverage.obsoleteTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    }
    
    console.log(`\n详细分析报告已保存到: ${reportPath}`);
    
    return coverageAnalysis;
    
  } catch (error) {
    console.error('分析过程中出错:', error);
  }
}

// 运行分析
if (require.main === module) {
  analyzeDictionaryCoverage();
}

module.exports = { analyzeDictionaryCoverage };
