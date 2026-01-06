const fs = require('fs');
const path = require('path');

// 定义系统后台相关的表和关键词模式
const SYSTEM_BACKEND_PATTERNS = {
  // 系统后台表名模式
  systemTables: [
    'system_configs', 'system_logs', 'system_maintenance',
    'security_configs', 'security_threats', 'security_vulnerabilities', 'security_scan_logs',
    'change_log', 'operation_logs', 'ai_model_billing', 'ai_model_config',
    'file_storages', 'knowledge_vault', 'token_blacklist',
    'permissions_backup', 'role_permissions_backup', 'ai_user_permissions',
    'sequelize_meta', 'migrations', 'performance_rules',
    'channel_trackings', 'ai_memories_backup'
  ],
  
  // 系统后台关键词模式
  systemKeywords: [
    // 系统配置相关
    '系统配置', '安全配置', 'AI模型配置', '系统级配置', '只读配置', '配置值类型',
    // 安全监控相关
    '安全威胁', '安全漏洞', '安全扫描', '威胁类型', '漏洞分类', 'CVSS评分', '风险评分',
    // 系统日志相关
    '系统日志', '变更日志', '操作日志', '审计日志', '错误日志', '日志级别',
    // 系统维护相关
    '系统维护', '性能规则', '迁移记录', '元数据',
    // 权限备份相关
    '权限备份', '角色权限备份', '用户权限',
    // AI系统相关
    'AI模型计费', 'AI模型提供商', 'AI模型类型', 'AI令牌限制',
    // 文件存储相关
    '文件存储', '存储状态', '文件类型统计',
    // 知识库系统相关
    '知识库', '知识分类', '知识状态', '知识访问',
    // 渠道跟踪相关
    '渠道跟踪', 'AI记忆备份'
  ],
  
  // 业务层面关键词模式（应该保留的）
  businessKeywords: [
    // 学生管理
    '学生', '学生总数', '学生数量', '学生列表', '学生信息', '学生档案', '在校学生',
    // 教师管理
    '教师', '老师', '教师总数', '教师数量', '教师列表', '教师信息', '教师档案',
    // 班级管理
    '班级', '班级总数', '班级数量', '班级列表', '班级信息', '班级分布',
    // 活动管理
    '活动', '今日活动', '本周活动', '本月活动', '活动安排', '活动列表', '活动统计',
    // 课程管理
    '课程', '课程表', '今日课程', '本周课程', '课程安排', '课程列表',
    // 招生管理
    '招生', '招生统计', '招生报告', '招生计划', '报名',
    // 家长管理
    '家长', '家长总数', '家长跟进', '家长关系', '家长联系',
    // 幼儿园管理
    '幼儿园', '幼儿园概况', '幼儿园总数',
    // 营销管理
    '营销', '推广', '渠道', '广告', '海报',
    // 统计分析
    '统计', '分布', '概览', '报告', '分析'
  ]
};

// 分析AI字典文件
function analyzeAIDictionaryFiles() {
  const dictDir = './src/config/ai-dictionaries/';
  const files = fs.readdirSync(dictDir).filter(f => 
    f.endsWith('.json') && 
    !f.includes('backup') && 
    !f.includes('time-params') && 
    !f.includes('table-fields') && 
    !f.includes('operations') && 
    !f.includes('aggregations')
  );

  const analysis = {
    systemBackendFiles: [],
    businessFiles: [],
    systemKeywords: [],
    businessKeywords: [],
    mixedFiles: []
  };

  console.log('🔍 开始分析AI字典文件...\n');

  files.forEach(file => {
    const filePath = path.join(dictDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const fileAnalysis = analyzeFile(file, content);
    
    // 分类文件
    if (fileAnalysis.systemKeywordCount > fileAnalysis.businessKeywordCount) {
      analysis.systemBackendFiles.push(fileAnalysis);
    } else if (fileAnalysis.businessKeywordCount > 0) {
      analysis.businessFiles.push(fileAnalysis);
    }
    
    if (fileAnalysis.systemKeywordCount > 0 && fileAnalysis.businessKeywordCount > 0) {
      analysis.mixedFiles.push(fileAnalysis);
    }
    
    // 收集关键词
    analysis.systemKeywords.push(...fileAnalysis.systemKeywords);
    analysis.businessKeywords.push(...fileAnalysis.businessKeywords);
  });

  return analysis;
}

// 分析单个文件
function analyzeFile(fileName, content) {
  const analysis = {
    fileName,
    systemKeywords: [],
    businessKeywords: [],
    systemKeywordCount: 0,
    businessKeywordCount: 0,
    totalKeywords: 0,
    isSystemBackend: false,
    isBusiness: false
  };

  // 检查文件名是否包含系统后台相关内容
  const isSystemFile = SYSTEM_BACKEND_PATTERNS.systemTables.some(table => 
    fileName.includes(table.replace('_', '-')) || 
    fileName.includes('system') || 
    fileName.includes('security') || 
    fileName.includes('logs') || 
    fileName.includes('audit') || 
    fileName.includes('permission') || 
    fileName.includes('backup') || 
    fileName.includes('infrastructure') || 
    fileName.includes('metadata')
  );

  // 分析directMatches
  if (content.directMatches) {
    Object.keys(content.directMatches).forEach(keyword => {
      if (keyword.startsWith('//')) return; // 跳过注释
      
      analysis.totalKeywords++;
      
      if (isSystemKeyword(keyword)) {
        analysis.systemKeywords.push(keyword);
        analysis.systemKeywordCount++;
      } else if (isBusinessKeyword(keyword)) {
        analysis.businessKeywords.push(keyword);
        analysis.businessKeywordCount++;
      }
    });
  }

  // 分析queryTemplates
  if (content.queryTemplates) {
    Object.keys(content.queryTemplates).forEach(keyword => {
      if (keyword.startsWith('//')) return; // 跳过注释
      
      analysis.totalKeywords++;
      
      if (isSystemKeyword(keyword)) {
        analysis.systemKeywords.push(keyword);
        analysis.systemKeywordCount++;
      } else if (isBusinessKeyword(keyword)) {
        analysis.businessKeywords.push(keyword);
        analysis.businessKeywordCount++;
      }
    });
  }

  analysis.isSystemBackend = isSystemFile || analysis.systemKeywordCount > analysis.businessKeywordCount;
  analysis.isBusiness = analysis.businessKeywordCount > 0;

  return analysis;
}

// 判断是否为系统后台关键词
function isSystemKeyword(keyword) {
  return SYSTEM_BACKEND_PATTERNS.systemKeywords.some(pattern => 
    keyword.includes(pattern)
  );
}

// 判断是否为业务层面关键词
function isBusinessKeyword(keyword) {
  return SYSTEM_BACKEND_PATTERNS.businessKeywords.some(pattern => 
    keyword.includes(pattern)
  );
}

// 生成分析报告
function generateReport(analysis) {
  console.log('📊 AI字典关键词业务化分析报告');
  console.log('='.repeat(50));
  
  console.log('\n🔧 系统后台文件 (建议清理):');
  analysis.systemBackendFiles.forEach(file => {
    console.log(`  📁 ${file.fileName}`);
    console.log(`     系统关键词: ${file.systemKeywordCount}个`);
    console.log(`     业务关键词: ${file.businessKeywordCount}个`);
    console.log(`     总关键词: ${file.totalKeywords}个`);
    if (file.systemKeywords.length > 0) {
      console.log(`     系统关键词示例: ${file.systemKeywords.slice(0, 3).join(', ')}${file.systemKeywords.length > 3 ? '...' : ''}`);
    }
    console.log('');
  });

  console.log('\n✅ 业务层面文件 (保留):');
  analysis.businessFiles.forEach(file => {
    console.log(`  📁 ${file.fileName}`);
    console.log(`     业务关键词: ${file.businessKeywordCount}个`);
    console.log(`     系统关键词: ${file.systemKeywordCount}个`);
    console.log(`     总关键词: ${file.totalKeywords}个`);
    console.log('');
  });

  console.log('\n⚠️  混合文件 (需要部分清理):');
  analysis.mixedFiles.forEach(file => {
    console.log(`  📁 ${file.fileName}`);
    console.log(`     业务关键词: ${file.businessKeywordCount}个`);
    console.log(`     系统关键词: ${file.systemKeywordCount}个`);
    console.log(`     需要清理的系统关键词: ${file.systemKeywords.join(', ')}`);
    console.log('');
  });

  console.log('\n📈 统计总结:');
  console.log(`  系统后台文件: ${analysis.systemBackendFiles.length}个`);
  console.log(`  业务层面文件: ${analysis.businessFiles.length}个`);
  console.log(`  混合文件: ${analysis.mixedFiles.length}个`);
  console.log(`  系统关键词总数: ${analysis.systemKeywords.length}个`);
  console.log(`  业务关键词总数: ${analysis.businessKeywords.length}个`);
  
  const totalFiles = analysis.systemBackendFiles.length + analysis.businessFiles.length;
  const systemRatio = ((analysis.systemBackendFiles.length / totalFiles) * 100).toFixed(1);
  console.log(`  系统后台文件占比: ${systemRatio}%`);
  
  console.log('\n🎯 清理建议:');
  console.log(`  1. 完全移除 ${analysis.systemBackendFiles.length} 个系统后台文件`);
  console.log(`  2. 部分清理 ${analysis.mixedFiles.length} 个混合文件中的系统关键词`);
  console.log(`  3. 保留 ${analysis.businessFiles.length} 个业务层面文件`);
  console.log(`  4. 预计清理后关键词数量减少: ${analysis.systemKeywords.length}个`);
}

// 主函数
function main() {
  try {
    const analysis = analyzeAIDictionaryFiles();
    generateReport(analysis);
    
    // 保存详细分析结果
    const reportPath = './reports/business-keywords-analysis.json';
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 详细分析结果已保存到: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeAIDictionaryFiles, generateReport };
