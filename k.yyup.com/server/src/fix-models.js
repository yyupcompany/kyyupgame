/**
 * 模型初始化修复脚本
 * 
 * 该脚本用于修复模型文件中的初始化问题，主要解决：
 * 1. 修复循环依赖问题
 * 2. 统一initModel方法的实现
 * 3. 添加缺失的大括号
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// 日志文件
const logFile = path.join(__dirname, '../fix-models.log');
fs.writeFileSync(logFile, `=== 模型修复开始 ${new Date().toISOString()} ===\n`);

// 日志函数
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 输出到控制台
  console.log(message);
  
  // 写入日志文件
  fs.appendFileSync(logFile, logMessage);
}

// 模型目录
const modelsDir = path.join(__dirname, 'models');

// 模板代码 - 标准initModel方法
const initModelTemplate = `
  /**
   * 初始化模型
   * @param {import('sequelize').Sequelize} sequelize - Sequelize实例
   */
  public static initModel(sequelize: Sequelize): void {
    if (!sequelize) {
      throw new Error('No Sequelize instance passed to initModel');
    }

    MODEL_NAME.init({
`;

// 修复initModel方法
async function fixInitModelMethod(filePath, content, modelName) {
  // 检查是否有initModel方法
  if (!content.includes('static initModel')) {
    log(`${modelName} - 缺少initModel方法，将添加`);
    
    // 查找类定义的结束位置
    const classEndIndex = content.lastIndexOf('}');
    if (classEndIndex === -1) {
      log(`${modelName} - 无法找到类定义的结束位置，跳过`);
      return content;
    }
    
    // 插入initModel方法
    const newContent = content.slice(0, classEndIndex) + 
      initModelTemplate.replace('MODEL_NAME', modelName) +
      '      // 属性定义会在这里\n    }, {\n      sequelize,\n      tableName: \'MODEL_TABLE\',\n      timestamps: true\n    });\n  }\n' +
      content.slice(classEndIndex);
    
    return newContent;
  }
  
  // 查找initModel方法的开始和结束位置
  const initModelStartMatch = content.match(/public\s+static\s+initModel\s*\(\s*sequelize\s*:\s*Sequelize\s*\)\s*:\s*void\s*\{/);
  if (!initModelStartMatch) {
    log(`${modelName} - 无法找到initModel方法的开始位置，跳过`);
    return content;
  }
  
  const initModelStartIndex = initModelStartMatch.index;
  
  // 检查是否有sequelize检查
  if (!content.includes('No Sequelize instance passed') && 
      !content.includes('!sequelize')) {
    log(`${modelName} - 缺少sequelize检查，将添加`);
    
    // 查找initModel方法体的开始位置
    const methodBodyStart = content.indexOf('{', initModelStartIndex) + 1;
    
    // 插入sequelize检查
    const newContent = content.slice(0, methodBodyStart) + 
      '\n    if (!sequelize) {\n      throw new Error(\'No Sequelize instance passed to initModel\');\n    }\n' +
      content.slice(methodBodyStart);
    
    return newContent;
  }
  
  return content;
}

// 修复大括号匹配问题
function fixBracketMatching(content, modelName) {
  // 计算大括号数量
  const openBrackets = (content.match(/\{/g) || []).length;
  const closeBrackets = (content.match(/\}/g) || []).length;
  
  if (openBrackets === closeBrackets) {
    return content;
  }
  
  log(`${modelName} - 大括号不匹配，打开:${openBrackets}，关闭:${closeBrackets}`);
  
  if (openBrackets > closeBrackets) {
    // 缺少关闭大括号
    const diff = openBrackets - closeBrackets;
    log(`${modelName} - 缺少 ${diff} 个关闭大括号，将添加`);
    
    let newContent = content;
    for (let i = 0; i < diff; i++) {
      newContent += '\n}\n';
    }
    return newContent;
  }
  
  // 缺少打开大括号的情况比较复杂，需要手动处理
  log(`${modelName} - 缺少打开大括号，需要手动检查`);
  return content;
}

// 修复导出问题
function fixExport(content, modelName) {
  // 检查是否有默认导出
  if (!content.includes(`export default ${modelName}`)) {
    log(`${modelName} - 缺少默认导出，将添加`);
    
    // 添加默认导出
    let newContent = content;
    if (!content.endsWith('\n')) {
      newContent += '\n';
    }
    newContent += `\nexport default ${modelName};\n`;
    
    return newContent;
  }
  
  return content;
}

// 修复循环依赖问题
function fixCircularDependency(content, modelName) {
  // 检查是否从init-models导入sequelize
  if (content.includes('import { sequelize }') && 
      content.includes('from \'../init-models\'')) {
    log(`${modelName} - 存在循环依赖，将修改为直接接收sequelize参数`);
    
    // 移除导入
    const newContent = content.replace(/import\s*\{\s*sequelize\s*\}\s*from\s*['"]\.\.\/init-models['"]\s*;?/g, '');
    
    return newContent;
  }
  
  return content;
}

// 添加Sequelize导入
function addSequelizeImport(content) {
  if (!content.includes('import { Sequelize }')) {
    log(`缺少Sequelize导入，将添加`);
    
    // 找到第一个import语句的位置
    const importIndex = content.indexOf('import');
    if (importIndex === -1) {
      // 如果没有import语句，添加到文件开头
      return `import { Sequelize } from 'sequelize';\n\n${content}`;
    }
    
    // 在第一个import之前添加
    const newContent = content.slice(0, importIndex) + 
      `import { Sequelize } from 'sequelize';\n` +
      content.slice(importIndex);
    
    return newContent;
  }
  
  return content;
}

// 修复特定模型
async function fixModel(modelFile) {
  const filePath = path.join(modelsDir, modelFile);
  log(`开始修复模型: ${modelFile}`);
  
  try {
    // 读取文件内容
    let content = await readFile(filePath, 'utf8');
    
    // 提取模型名称
    const modelName = modelFile
      .replace('.model.ts', '')
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    log(`模型名称: ${modelName}`);
    
    // 添加Sequelize导入
    content = addSequelizeImport(content);
    
    // 修复循环依赖
    content = fixCircularDependency(content, modelName);
    
    // 修复initModel方法
    content = await fixInitModelMethod(filePath, content, modelName);
    
    // 修复大括号匹配
    content = fixBracketMatching(content, modelName);
    
    // 修复导出
    content = fixExport(content, modelName);
    
    // 写入修改后的文件
    await writeFile(filePath, content, 'utf8');
    
    log(`模型 ${modelFile} 修复完成`);
  } catch (error) {
    log(`修复模型 ${modelFile} 时出错: ${error}`);
  }
}

// 修复所有模型
async function fixAllModels() {
  try {
    log(`扫描模型目录: ${modelsDir}`);
    
    // 获取所有模型文件
    const files = await readdir(modelsDir);
    const modelFiles = files.filter(file => file.endsWith('.model.ts'));
    
    log(`找到 ${modelFiles.length} 个模型文件`);
    
    // 依次修复每个模型
    for (const modelFile of modelFiles) {
      await fixModel(modelFile);
    }
    
    log('所有模型修复完成');
  } catch (error) {
    log(`修复模型时出错: ${error}`);
  }
}

// 执行修复
log('开始执行模型修复...');
fixAllModels()
  .then(() => {
    log('模型修复脚本执行完成');
    log(`详细日志已写入 ${logFile}`);
  })
  .catch((error) => {
    log(`模型修复脚本执行失败: ${error}`);
  }); 