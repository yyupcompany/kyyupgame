import fs from 'fs';
import path from 'path';
import DocumentTemplate from '../src/models/document-template.model';
import { sequelize } from '../src/config/database';

/**
 * 模板导入脚本
 * 将73个Markdown模板导入到数据库
 */

// 类别映射
const CATEGORY_MAP: Record<string, string> = {
  '01-年度检查类': 'annual',
  '02-专项检查类': 'special',
  '03-常态化督导类': 'routine',
  '04-教职工管理类': 'staff',
  '05-幼儿管理类': 'student',
  '06-财务管理类': 'finance',
  '07-保教工作类': 'education'
};

// 使用频率映射
const FREQUENCY_MAP: Record<string, string> = {
  '每日': 'daily',
  '每周': 'weekly',
  '每月': 'monthly',
  '每学期': 'quarterly',
  '每年': 'yearly',
  '年度': 'yearly',
  '日常': 'daily'
};

/**
 * 从文件名提取模板编号和名称
 */
function parseFileName(fileName: string): { code: string; name: string } {
  // 文件名格式：01-幼儿园年检自查报告.md
  const match = fileName.match(/^(\d+-\d+)-(.+)\.md$/);
  if (match) {
    return {
      code: match[1],
      name: match[2]
    };
  }
  
  // 如果没有匹配，尝试简单格式
  const simpleMatch = fileName.match(/^(.+)\.md$/);
  if (simpleMatch) {
    return {
      code: simpleMatch[1],
      name: simpleMatch[1]
    };
  }
  
  return {
    code: fileName,
    name: fileName
  };
}

/**
 * 从内容中提取变量
 */
function extractVariables(content: string): Record<string, any> {
  const variables: Record<string, any> = {};
  const regex = /\{\{(\w+)\}\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const varName = match[1];
    if (!variables[varName]) {
      variables[varName] = {
        label: formatLabel(varName),
        type: guessType(varName),
        source: 'auto',
        required: true
      };
    }
  }
  
  return variables;
}

/**
 * 格式化变量标签
 */
function formatLabel(varName: string): string {
  const labelMap: Record<string, string> = {
    kindergarten_name: '幼儿园名称',
    kindergarten_address: '幼儿园地址',
    principal_name: '园长姓名',
    inspection_date: '检查日期',
    current_date: '当前日期',
    current_year: '当前年份',
    teacher_count: '教师数量',
    student_count: '学生数量',
    class_count: '班级数量',
    // 更多映射...
  };
  
  return labelMap[varName] || varName;
}

/**
 * 猜测变量类型
 */
function guessType(varName: string): string {
  if (varName.includes('date')) return 'date';
  if (varName.includes('count') || varName.includes('number') || varName.includes('area')) return 'number';
  if (varName.includes('name') || varName.includes('address')) return 'string';
  return 'string';
}

/**
 * 判断是否为详细模板
 */
function isDetailedTemplate(content: string): boolean {
  const lineCount = content.split('\n').length;
  return lineCount >= 250;
}

/**
 * 估算填写时间
 */
function estimateFillTime(content: string, variables: Record<string, any>): number {
  const lineCount = content.split('\n').length;
  const varCount = Object.keys(variables).length;
  
  // 基础时间：每100行约10分钟
  const baseTime = Math.ceil(lineCount / 100) * 10;
  
  // 变量填写时间：每个变量约2分钟
  const varTime = varCount * 2;
  
  return baseTime + varTime;
}

/**
 * 导入单个模板
 */
async function importTemplate(
  categoryPath: string,
  fileName: string,
  category: string
): Promise<void> {
  const filePath = path.join(categoryPath, fileName);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const { code, name } = parseFileName(fileName);
  const variables = extractVariables(content);
  const lineCount = content.split('\n').length;
  const isDetailed = isDetailedTemplate(content);
  const estimatedTime = estimateFillTime(content, variables);
  
  // 从内容中猜测使用频率
  let frequency = 'as_needed';
  for (const [key, value] of Object.entries(FREQUENCY_MAP)) {
    if (content.includes(key)) {
      frequency = value;
      break;
    }
  }
  
  // 判断优先级
  let priority = 'optional';
  if (content.includes('必填') || content.includes('必需') || name.includes('年检')) {
    priority = 'required';
  } else if (content.includes('推荐') || content.includes('建议')) {
    priority = 'recommended';
  }
  
  try {
    await DocumentTemplate.create({
      code,
      name,
      description: `${name} - 自动导入`,
      fileType: 'html', // 使用html作为markdown的替代
      templateContent: content,
      variables,
      version: '1.0',
      isSystem: true,
      isActive: true,
      createdBy: 1 // 系统用户
    });
    
    console.log(`✅ 导入成功: ${code} - ${name}`);
  } catch (error: any) {
    console.error(`❌ 导入失败: ${code} - ${name}`, error.message);
  }
}

/**
 * 导入所有模板
 */
async function importAllTemplates(): Promise<void> {
  console.log('========================================');
  console.log('开始导入文档模板');
  console.log('========================================\n');
  
  const templateDir = path.join(__dirname, '../../docs/检查中心文档模板库');
  
  // 检查目录是否存在
  if (!fs.existsSync(templateDir)) {
    console.error(`❌ 错误：模板目录不存在: ${templateDir}`);
    process.exit(1);
  }
  
  let totalCount = 0;
  let successCount = 0;
  let failCount = 0;
  
  // 遍历所有类别目录
  for (const [categoryDir, categoryCode] of Object.entries(CATEGORY_MAP)) {
    const categoryPath = path.join(templateDir, categoryDir);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  跳过不存在的目录: ${categoryDir}`);
      continue;
    }
    
    console.log(`\n📁 处理类别: ${categoryDir}`);
    
    const files = fs.readdirSync(categoryPath);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    console.log(`   找到 ${mdFiles.length} 个模板文件`);
    
    for (const file of mdFiles) {
      totalCount++;
      try {
        await importTemplate(categoryPath, file, categoryCode);
        successCount++;
      } catch (error) {
        failCount++;
      }
    }
  }
  
  console.log('\n========================================');
  console.log('导入完成');
  console.log('========================================');
  console.log(`总计: ${totalCount} 个模板`);
  console.log(`成功: ${successCount} 个`);
  console.log(`失败: ${failCount} 个`);
  console.log('========================================\n');
}

/**
 * 主函数
 */
async function main() {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 初始化模型
    DocumentTemplate.initModel(sequelize);
    
    // 同步数据库（仅在开发环境）
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync();
      console.log('✅ 数据库同步成功\n');
    }
    
    // 导入模板
    await importAllTemplates();
    
    // 关闭数据库连接
    await sequelize.close();
    console.log('✅ 数据库连接已关闭');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  }
}

// 运行
main();

