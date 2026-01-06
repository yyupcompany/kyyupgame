/**
 * 修复模型文件中的sequelize导入路径
 * 将 from '../config/database' 替换为 from '../init'
 */

const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../src/models');

// 需要修复的文件列表
const filesToFix = [
  'ai-suggestion-history.model.ts',
  'conversation-record.model.ts',
  'customer-sop-progress.model.ts',
  'ai-query-cache.model.ts',
  'conversation-screenshot.model.ts',
  'sop-task.model.ts',
  'ai-query-log.model.ts',
  'brain-science-course.model.ts',
  'teaching-media-record.model.ts',
  'ai-query-template.model.ts',
  'ai-query-feedback.model.ts',
  'course-progress.model.ts'
];

let fixedCount = 0;
let errorCount = 0;

console.log('🔧 开始修复sequelize导入路径...\n');

filesToFix.forEach(filename => {
  const filePath = path.join(modelsDir, filename);
  
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  文件不存在: ${filename}`);
      return;
    }
    
    // 读取文件内容
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 检查是否需要修复
    if (!content.includes("from '../config/database'")) {
      console.log(`✅ ${filename} - 无需修复`);
      return;
    }
    
    // 替换导入路径
    const newContent = content.replace(
      /from ['"]\.\.\/config\/database['"]/g,
      "from '../init'"
    );
    
    // 写回文件
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✅ ${filename} - 修复成功`);
    fixedCount++;
    
  } catch (error) {
    console.error(`❌ ${filename} - 修复失败:`, error.message);
    errorCount++;
  }
});

console.log(`\n📊 修复统计:`);
console.log(`   成功: ${fixedCount} 个文件`);
console.log(`   失败: ${errorCount} 个文件`);
console.log(`\n✅ 修复完成！`);

