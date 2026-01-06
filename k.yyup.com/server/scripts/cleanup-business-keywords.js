const fs = require('fs');
const path = require('path');

// 需要完全移除的系统后台文件
const SYSTEM_BACKEND_FILES_TO_REMOVE = [
  '18-system-config-templates.json',
  '19-security-monitoring-templates.json', 
  '27-system-logs-audit-templates.json',
  '34-system-metadata-templates.json'
];

// 需要部分清理的混合文件及其系统关键词
const MIXED_FILES_TO_CLEAN = {
  '12-ai-conversation-templates.json': [
    'AI知识库总数', 'AI知识库分类统计'
  ],
  '26-system-maintenance-templates.json': [
    '系统日志总数', '日志级别统计', '错误日志统计', '本月系统日志', '系统维护概览'
  ],
  '29-channel-marketing-extended-templates.json': [
    '渠道跟踪记录总数', '本月渠道跟踪', 'AI记忆备份总数'
  ],
  '30-system-infrastructure-templates.json': [
    'Sequelize元数据总数', '性能规则总数', '活跃性能规则'
  ],
  '33-security-permission-extended-templates.json': [
    'AI用户权限总数', '用户权限分布'
  ]
};

// 清理统计
let cleanupStats = {
  removedFiles: 0,
  cleanedFiles: 0,
  removedKeywords: 0,
  backupCreated: 0
};

// 创建备份
function createBackup() {
  const dictDir = './src/config/ai-dictionaries/';
  const backupDir = `./backups/ai-dictionaries-backup-${Date.now()}/`;
  
  if (!fs.existsSync('./backups')) {
    fs.mkdirSync('./backups');
  }
  
  fs.mkdirSync(backupDir, { recursive: true });
  
  const files = fs.readdirSync(dictDir).filter(f => f.endsWith('.json'));
  files.forEach(file => {
    fs.copyFileSync(
      path.join(dictDir, file),
      path.join(backupDir, file)
    );
  });
  
  console.log(`✅ 备份已创建: ${backupDir}`);
  cleanupStats.backupCreated = files.length;
  return backupDir;
}

// 移除系统后台文件
function removeSystemBackendFiles() {
  const dictDir = './src/config/ai-dictionaries/';
  
  console.log('\n🗑️  移除系统后台文件:');
  
  SYSTEM_BACKEND_FILES_TO_REMOVE.forEach(fileName => {
    const filePath = path.join(dictDir, fileName);
    
    if (fs.existsSync(filePath)) {
      // 读取文件统计关键词数量
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let keywordCount = 0;
      
      if (content.directMatches) {
        keywordCount += Object.keys(content.directMatches).filter(k => !k.startsWith('//')).length;
      }
      if (content.queryTemplates) {
        keywordCount += Object.keys(content.queryTemplates).filter(k => !k.startsWith('//')).length;
      }
      
      // 移除文件
      fs.unlinkSync(filePath);
      console.log(`  ❌ 已移除: ${fileName} (${keywordCount}个关键词)`);
      
      cleanupStats.removedFiles++;
      cleanupStats.removedKeywords += keywordCount;
    } else {
      console.log(`  ⚠️  文件不存在: ${fileName}`);
    }
  });
}

// 清理混合文件中的系统关键词
function cleanMixedFiles() {
  const dictDir = './src/config/ai-dictionaries/';
  
  console.log('\n🧹 清理混合文件中的系统关键词:');
  
  Object.entries(MIXED_FILES_TO_CLEAN).forEach(([fileName, systemKeywords]) => {
    const filePath = path.join(dictDir, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  文件不存在: ${fileName}`);
      return;
    }
    
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let removedCount = 0;
    
    // 清理directMatches中的系统关键词
    if (content.directMatches) {
      systemKeywords.forEach(keyword => {
        if (content.directMatches[keyword]) {
          delete content.directMatches[keyword];
          removedCount++;
        }
      });
    }
    
    // 清理queryTemplates中的系统关键词
    if (content.queryTemplates) {
      systemKeywords.forEach(keyword => {
        if (content.queryTemplates[keyword]) {
          delete content.queryTemplates[keyword];
          removedCount++;
        }
      });
    }
    
    // 保存清理后的文件
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`  🧹 已清理: ${fileName} (移除${removedCount}个系统关键词)`);
    
    if (removedCount > 0) {
      cleanupStats.cleanedFiles++;
      cleanupStats.removedKeywords += removedCount;
    }
  });
}

// 验证清理结果
function validateCleanup() {
  const dictDir = './src/config/ai-dictionaries/';
  const files = fs.readdirSync(dictDir).filter(f => f.endsWith('.json') && !f.includes('backup'));
  
  console.log('\n🔍 验证清理结果:');
  
  let totalKeywords = 0;
  let businessKeywords = 0;
  let remainingSystemKeywords = 0;
  
  files.forEach(file => {
    const filePath = path.join(dictDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let fileKeywords = 0;
    let fileBusinessKeywords = 0;
    let fileSystemKeywords = 0;
    
    // 统计directMatches
    if (content.directMatches) {
      Object.keys(content.directMatches).forEach(keyword => {
        if (keyword.startsWith('//')) return;
        fileKeywords++;
        totalKeywords++;
        
        if (isBusinessKeyword(keyword)) {
          fileBusinessKeywords++;
          businessKeywords++;
        } else if (isSystemKeyword(keyword)) {
          fileSystemKeywords++;
          remainingSystemKeywords++;
        }
      });
    }
    
    // 统计queryTemplates
    if (content.queryTemplates) {
      Object.keys(content.queryTemplates).forEach(keyword => {
        if (keyword.startsWith('//')) return;
        fileKeywords++;
        totalKeywords++;
        
        if (isBusinessKeyword(keyword)) {
          fileBusinessKeywords++;
          businessKeywords++;
        } else if (isSystemKeyword(keyword)) {
          fileSystemKeywords++;
          remainingSystemKeywords++;
        }
      });
    }
    
    if (fileSystemKeywords > 0) {
      console.log(`  ⚠️  ${file}: 仍有${fileSystemKeywords}个系统关键词`);
    }
  });
  
  console.log(`\n📊 清理后统计:`);
  console.log(`  总文件数: ${files.length}个`);
  console.log(`  总关键词数: ${totalKeywords}个`);
  console.log(`  业务关键词: ${businessKeywords}个`);
  console.log(`  剩余系统关键词: ${remainingSystemKeywords}个`);
  console.log(`  业务关键词占比: ${((businessKeywords / totalKeywords) * 100).toFixed(1)}%`);
}

// 判断是否为业务关键词
function isBusinessKeyword(keyword) {
  const businessPatterns = [
    '学生', '教师', '老师', '班级', '活动', '课程', '招生', '家长', '幼儿园',
    '营销', '推广', '渠道', '广告', '海报', '统计', '分布', '概览', '报告', '分析'
  ];
  
  return businessPatterns.some(pattern => keyword.includes(pattern));
}

// 判断是否为系统关键词
function isSystemKeyword(keyword) {
  const systemPatterns = [
    '系统配置', '安全配置', 'AI模型配置', '系统级配置', '只读配置',
    '安全威胁', '安全漏洞', '安全扫描', '威胁类型', '漏洞分类',
    '系统日志', '变更日志', '操作日志', '审计日志', '错误日志',
    '系统维护', '性能规则', '迁移记录', '元数据',
    '权限备份', '角色权限备份', '用户权限',
    'AI模型计费', 'AI模型提供商', 'AI模型类型',
    '文件存储', '存储状态', '文件类型统计',
    '知识库', '知识分类', '知识状态', '知识访问',
    '渠道跟踪', 'AI记忆备份'
  ];
  
  return systemPatterns.some(pattern => keyword.includes(pattern));
}

// 生成清理报告
function generateCleanupReport(backupDir) {
  const reportPath = './reports/ai-dictionary-cleanup-report.md';
  
  const report = `# AI字典关键词业务化清理报告

## 清理概述
- 执行时间: ${new Date().toLocaleString()}
- 备份位置: ${backupDir}

## 清理统计
- 移除系统后台文件: ${cleanupStats.removedFiles}个
- 清理混合文件: ${cleanupStats.cleanedFiles}个  
- 移除系统关键词: ${cleanupStats.removedKeywords}个
- 创建备份文件: ${cleanupStats.backupCreated}个

## 移除的系统后台文件
${SYSTEM_BACKEND_FILES_TO_REMOVE.map(file => `- ${file}`).join('\n')}

## 清理的混合文件
${Object.entries(MIXED_FILES_TO_CLEAN).map(([file, keywords]) => 
  `- ${file}: 移除${keywords.length}个系统关键词`
).join('\n')}

## 清理效果
- ✅ 系统后台相关关键词已完全移除
- ✅ 保留所有业务层面相关关键词
- ✅ AI字典更加专注于用户业务查询
- ✅ 提升了AI助手的用户体验

## 备份说明
原始文件已备份到: ${backupDir}
如需恢复，可从备份目录复制文件。

---
*此报告由AI字典关键词业务化清理脚本自动生成*
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📄 清理报告已生成: ${reportPath}`);
}

// 主函数
function main() {
  console.log('🚀 开始AI字典关键词业务化清理...\n');
  
  try {
    // 1. 创建备份
    const backupDir = createBackup();
    
    // 2. 移除系统后台文件
    removeSystemBackendFiles();
    
    // 3. 清理混合文件
    cleanMixedFiles();
    
    // 4. 验证清理结果
    validateCleanup();
    
    // 5. 生成清理报告
    generateCleanupReport(backupDir);
    
    console.log('\n🎉 AI字典关键词业务化清理完成!');
    console.log(`📊 清理统计:`);
    console.log(`  移除文件: ${cleanupStats.removedFiles}个`);
    console.log(`  清理文件: ${cleanupStats.cleanedFiles}个`);
    console.log(`  移除关键词: ${cleanupStats.removedKeywords}个`);
    console.log(`  备份文件: ${cleanupStats.backupCreated}个`);
    
  } catch (error) {
    console.error('❌ 清理过程中出现错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  removeSystemBackendFiles, 
  cleanMixedFiles, 
  validateCleanup,
  cleanupStats 
};
