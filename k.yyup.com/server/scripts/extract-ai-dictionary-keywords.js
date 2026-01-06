#!/usr/bin/env node

/**
 * AI字典关键词提取脚本
 * 分析所有AI字典文件，提取可测试的关键词和查询模板
 */

const fs = require('fs');
const path = require('path');

// 配置
const DICT_DIR = './src/config/ai-dictionaries';
const OUTPUT_FILE = './reports/ai-dictionary-keywords-analysis.json';

/**
 * 从directMatches结构中提取关键词
 */
function extractFromDirectMatches(directMatches, fileName) {
  const keywords = [];
  
  for (const [key, value] of Object.entries(directMatches)) {
    if (typeof value === 'string' || key.startsWith('//')) {
      continue; // 跳过注释
    }
    
    if (value && typeof value === 'object' && value.action) {
      keywords.push({
        keyword: key,
        type: 'directMatch',
        action: value.action,
        response: value.response,
        tokens: value.tokens || 10,
        file: fileName
      });
    }
  }
  
  return keywords;
}

/**
 * 从queryTemplates结构中提取关键词
 */
function extractFromQueryTemplates(queryTemplates, fileName) {
  const keywords = [];
  
  for (const [key, value] of Object.entries(queryTemplates)) {
    if (typeof value === 'string' || key.startsWith('//')) {
      continue; // 跳过注释
    }
    
    if (value && typeof value === 'object' && value.sql) {
      keywords.push({
        keyword: key,
        type: 'queryTemplate',
        sql: value.sql,
        description: value.description,
        table: value.table,
        response: value.response,
        tokens: value.tokens || 15,
        file: fileName
      });
    }
  }
  
  return keywords;
}

/**
 * 分析单个字典文件
 */
function analyzeDictionaryFile(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const dictionary = JSON.parse(content);
    
    let keywords = [];
    let fileType = 'unknown';
    
    // 检查文件类型和结构
    if (dictionary.directMatches) {
      fileType = 'directMatches';
      keywords = extractFromDirectMatches(dictionary.directMatches, fileName);
    } else if (dictionary.queryTemplates) {
      fileType = 'queryTemplates';
      keywords = extractFromQueryTemplates(dictionary.queryTemplates, fileName);
    } else if (dictionary.operations) {
      fileType = 'operations';
      // operations文件不包含可测试的关键词
    } else if (dictionary.aggregations) {
      fileType = 'aggregations';
      // aggregations文件不包含可测试的关键词
    } else if (dictionary.tableFields) {
      fileType = 'tableFields';
      // tableFields文件不包含可测试的关键词
    } else if (dictionary.timeParams) {
      fileType = 'timeParams';
      // timeParams文件不包含可测试的关键词
    }
    
    return {
      fileName,
      fileType,
      name: dictionary.name || fileName,
      description: dictionary.description || '',
      keywordCount: keywords.length,
      keywords
    };
    
  } catch (error) {
    console.error(`❌ 解析文件失败: ${fileName}`, error.message);
    return {
      fileName,
      fileType: 'error',
      error: error.message,
      keywordCount: 0,
      keywords: []
    };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 开始分析AI字典文件结构...');
  console.log('');
  
  // 确保输出目录存在
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 读取所有字典文件
  const files = fs.readdirSync(DICT_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('.backup.'))
    .sort();
  
  console.log(`📁 发现 ${files.length} 个字典文件`);
  console.log('');
  
  const analysis = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    totalKeywords: 0,
    fileTypes: {},
    files: [],
    allKeywords: []
  };
  
  // 分析每个文件
  for (const fileName of files) {
    const filePath = path.join(DICT_DIR, fileName);
    console.log(`📄 分析文件: ${fileName}`);
    
    const fileAnalysis = analyzeDictionaryFile(filePath, fileName);
    analysis.files.push(fileAnalysis);
    analysis.allKeywords.push(...fileAnalysis.keywords);
    
    // 统计文件类型
    if (!analysis.fileTypes[fileAnalysis.fileType]) {
      analysis.fileTypes[fileAnalysis.fileType] = 0;
    }
    analysis.fileTypes[fileAnalysis.fileType]++;
    
    console.log(`  类型: ${fileAnalysis.fileType}`);
    console.log(`  关键词数量: ${fileAnalysis.keywordCount}`);
    
    if (fileAnalysis.keywordCount > 0) {
      console.log(`  示例关键词: ${fileAnalysis.keywords.slice(0, 3).map(k => k.keyword).join(', ')}`);
    }
    console.log('');
  }
  
  analysis.totalKeywords = analysis.allKeywords.length;
  
  // 生成统计报告
  console.log('================================================================================');
  console.log('📊 AI字典关键词分析报告');
  console.log('================================================================================');
  console.log('');
  console.log(`📁 总文件数: ${analysis.totalFiles}`);
  console.log(`🔑 总关键词数: ${analysis.totalKeywords}`);
  console.log('');
  
  console.log('📋 文件类型分布:');
  for (const [type, count] of Object.entries(analysis.fileTypes)) {
    console.log(`  ${type}: ${count} 个文件`);
  }
  console.log('');
  
  console.log('🎯 可测试关键词分布:');
  const testableFiles = analysis.files.filter(f => f.keywordCount > 0);
  testableFiles.forEach(file => {
    console.log(`  ${file.fileName}: ${file.keywordCount} 个关键词`);
  });
  console.log('');
  
  console.log('📈 关键词类型统计:');
  const keywordTypes = {};
  analysis.allKeywords.forEach(k => {
    if (!keywordTypes[k.type]) keywordTypes[k.type] = 0;
    keywordTypes[k.type]++;
  });
  for (const [type, count] of Object.entries(keywordTypes)) {
    console.log(`  ${type}: ${count} 个关键词`);
  }
  
  // 保存分析结果
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(analysis, null, 2));
  console.log('');
  console.log(`💾 分析结果已保存到: ${OUTPUT_FILE}`);
  console.log('');
  console.log('✅ AI字典关键词分析完成！');
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, analyzeDictionaryFile };
