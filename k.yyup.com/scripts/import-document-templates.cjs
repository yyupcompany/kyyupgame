#!/usr/bin/env node

/**
 * 导入检查中心文档模板脚本
 * 将docs/检查中心文档模板库中的73个模板文件导入到数据库
 */

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// 数据库配置
const config = require('../server/src/config/database.js');
const sequelize = new Sequelize(config.development);

// 模板目录映射
const TEMPLATE_CATEGORIES = {
  '01-年度检查类': 'annual',
  '02-专项检查类': 'special', 
  '03-常态化督导类': 'routine',
  '04-教职工管理类': 'staff',
  '05-幼儿管理类': 'student',
  '06-财务管理类': 'finance',
  '07-保教工作类': 'education'
};

// 模板基础目录
const TEMPLATES_BASE_DIR = path.join(__dirname, '../docs/检查中心文档模板库');

/**
 * 读取模板文件内容
 */
function readTemplateFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ 读取文件失败: ${filePath}`, error.message);
    return null;
  }
}

/**
 * 解析模板文件名获取编号和名称
 */
function parseTemplateFileName(fileName) {
  // 文件名格式: "01-幼儿园年检自查报告.md"
  const match = fileName.match(/^(\d+)-(.+)\.md$/);
  if (match) {
    return {
      number: match[1],
      name: match[2]
    };
  }
  return null;
}

/**
 * 提取模板变量
 */
function extractTemplateVariables(content) {
  const variables = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }
  
  return variables;
}

/**
 * 扫描所有模板文件
 */
function scanTemplateFiles() {
  const templates = [];
  
  // 遍历每个类别目录
  Object.keys(TEMPLATE_CATEGORIES).forEach(categoryDir => {
    const categoryPath = path.join(TEMPLATES_BASE_DIR, categoryDir);
    
    if (!fs.existsSync(categoryPath)) {
      console.warn(`⚠️ 目录不存在: ${categoryPath}`);
      return;
    }
    
    const files = fs.readdirSync(categoryPath);
    
    files.forEach(fileName => {
      if (!fileName.endsWith('.md')) return;
      
      const filePath = path.join(categoryPath, fileName);
      const parsed = parseTemplateFileName(fileName);
      
      if (!parsed) {
        console.warn(`⚠️ 无法解析文件名: ${fileName}`);
        return;
      }
      
      const content = readTemplateFile(filePath);
      if (!content) return;
      
      const variables = extractTemplateVariables(content);
      
      templates.push({
        code: `${categoryDir.substring(0, 2)}-${parsed.number}`,
        name: parsed.name,
        category: TEMPLATE_CATEGORIES[categoryDir],
        categoryName: categoryDir,
        fileName: fileName,
        filePath: filePath,
        content: content,
        variables: variables,
        variableCount: variables.length
      });
    });
  });
  
  return templates.sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * 导入模板到数据库
 */
async function importTemplates() {
  try {
    console.log('🔍 扫描模板文件...');
    const templates = scanTemplateFiles();
    
    console.log(`📊 发现 ${templates.length} 个模板文件`);
    
    // 按类别统计
    const categoryStats = {};
    templates.forEach(template => {
      if (!categoryStats[template.categoryName]) {
        categoryStats[template.categoryName] = 0;
      }
      categoryStats[template.categoryName]++;
    });
    
    console.log('📋 模板分布:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count}个`);
    });
    
    console.log('\n🔗 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 检查现有模板
    const [existingTemplates] = await sequelize.query(
      'SELECT code FROM document_templates'
    );
    const existingCodes = existingTemplates.map(t => t.code);
    
    console.log(`📄 数据库中现有模板: ${existingCodes.length}个`);
    
    // 准备导入数据
    const newTemplates = templates.filter(t => !existingCodes.includes(t.code));
    const updateTemplates = templates.filter(t => existingCodes.includes(t.code));
    
    console.log(`➕ 需要新增: ${newTemplates.length}个`);
    console.log(`🔄 需要更新: ${updateTemplates.length}个`);
    
    if (newTemplates.length === 0 && updateTemplates.length === 0) {
      console.log('✅ 所有模板都已是最新状态');
      return;
    }
    
    // 开始事务
    const transaction = await sequelize.transaction();
    
    try {
      let insertCount = 0;
      let updateCount = 0;
      
      // 插入新模板
      for (const template of newTemplates) {
        await sequelize.query(`
          INSERT INTO document_templates (
            code, name, category, description, template_content,
            variables, file_type, content_type, priority,
            is_detailed, use_count, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, {
          replacements: [
            template.code,
            template.name,
            template.category,
            `${template.categoryName} - ${template.name}`,
            template.content,
            JSON.stringify(template.variables),
            'html',
            'markdown',
            'required',
            true,
            0,
            true
          ],
          transaction
        });
        
        insertCount++;
        console.log(`➕ 新增: [${template.code}] ${template.name}`);
      }
      
      // 更新现有模板
      for (const template of updateTemplates) {
        await sequelize.query(`
          UPDATE document_templates SET
            name = ?, description = ?, template_content = ?,
            variables = ?, updated_at = NOW()
          WHERE code = ?
        `, {
          replacements: [
            template.name,
            `${template.categoryName} - ${template.name}`,
            template.content,
            JSON.stringify(template.variables),
            template.code
          ],
          transaction
        });
        
        updateCount++;
        console.log(`🔄 更新: [${template.code}] ${template.name}`);
      }
      
      await transaction.commit();
      
      console.log('\n🎉 导入完成!');
      console.log(`✅ 新增模板: ${insertCount}个`);
      console.log(`✅ 更新模板: ${updateCount}个`);
      console.log(`📊 总模板数: ${templates.length}个`);
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ 导入失败:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行导入
if (require.main === module) {
  importTemplates();
}

module.exports = { importTemplates, scanTemplateFiles };
