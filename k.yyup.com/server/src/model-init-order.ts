/**
 * 模型初始化顺序分析脚本
 * 
 * 该脚本分析模型之间的依赖关系，确定正确的初始化顺序
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from './utils/logger';

// 模型目录
const modelsDir = path.join(__dirname, 'models');

// 输出文件
const outputFile = path.join(__dirname, '../model-init-order.log');
fs.writeFileSync(outputFile, `=== 模型初始化顺序分析 ${new Date().toISOString()} ===\n`);

// 日志函数
function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 输出到控制台
  console.log(message);
  
  // 写入日志文件
  fs.appendFileSync(outputFile, logMessage);
  
  // 使用系统日志
  logger.info(message);
}

// 模型信息接口
interface ModelInfo {
  name: string;          // 模型名称
  file: string;          // 文件名
  dependencies: string[]; // 依赖的模型
  importedBy: string[];  // 被哪些模型导入
  level: number;         // 初始化级别：0=基础模型，1=业务模型，2=关系模型，3=功能模型
}

// 扫描模型文件获取依赖关系
async function scanModelDependencies(): Promise<Map<string, ModelInfo>> {
  const modelMap = new Map<string, ModelInfo>();
  
  try {
    // 读取模型目录
    log('扫描模型目录...');
    const files = fs.readdirSync(modelsDir);
    const modelFiles = files.filter(file => file.endsWith('.model.ts'));
    
    log(`找到 ${modelFiles.length} 个模型文件`);
    
    // 首先创建所有模型的基本信息
    for (const file of modelFiles) {
      const modelName = file
        .replace('.model.ts', '')
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      
      modelMap.set(modelName, {
        name: modelName,
        file,
        dependencies: [],
        importedBy: [],
        level: assignInitialLevel(file)
      });
    }
    
    // 然后分析每个模型的依赖关系
    for (const [modelName, modelInfo] of modelMap.entries()) {
      const filePath = path.join(modelsDir, modelInfo.file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 分析导入语句
      const importMatches = content.matchAll(/import\s+(?:{[^}]*}|\w+)\s+from\s+['"](.+?)['"]/g);
      for (const match of importMatches) {
        const importPath = match[1];
        
        // 检查是否是导入其他模型
        if (importPath.includes('./') || importPath.includes('../models/')) {
          // 提取模型名称
          let importedModelName = importPath.split('/').pop() || '';
          if (importedModelName.endsWith('.model')) {
            importedModelName = importedModelName
              .replace('.model', '')
              .split('-')
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join('');
            
            // 添加到依赖列表
            if (modelMap.has(importedModelName) && importedModelName !== modelName) {
              modelInfo.dependencies.push(importedModelName);
              
              // 同时更新被依赖模型的importedBy
              const importedModel = modelMap.get(importedModelName);
              if (importedModel) {
                importedModel.importedBy.push(modelName);
              }
            }
          }
        }
      }
    }
    
    return modelMap;
  } catch (error) {
    log(`扫描模型依赖关系时出错: ${error}`);
    return new Map();
  }
}

// 根据文件名分配初始级别
function assignInitialLevel(fileName: string): number {
  // 基础模型
  if (
    fileName.includes('user.model.ts') ||
    fileName.includes('role.model.ts') ||
    fileName.includes('permission.model.ts') ||
    fileName.includes('kindergarten.model.ts') ||
    fileName.includes('system-config.model.ts')
  ) {
    return 0;
  }
  
  // 关系模型
  if (
    fileName.includes('-role-') ||
    fileName.includes('role-') ||
    fileName.includes('-relation') ||
    fileName.includes('-teacher.model') ||
    fileName.includes('-assignee') ||
    fileName.includes('-staff')
  ) {
    return 2;
  }
  
  // 功能模型
  if (
    fileName.includes('notification') ||
    fileName.includes('message-') ||
    fileName.includes('file-') ||
    fileName.includes('-tracking') ||
    fileName.includes('-log') ||
    fileName.includes('ai-')
  ) {
    return 3;
  }
  
  // 默认为业务模型
  return 1;
}

// 检测循环依赖
function detectCircularDependencies(modelMap: Map<string, ModelInfo>): void {
  log('检测循环依赖...');
  
  for (const [modelName, modelInfo] of modelMap.entries()) {
    const visited = new Set<string>();
    const path: string[] = [];
    
    function dfs(currentModel: string) {
      if (path.includes(currentModel)) {
        // 找到循环依赖
        const cycle = [...path.slice(path.indexOf(currentModel)), currentModel];
        log(`发现循环依赖: ${cycle.join(' -> ')}`);
        return;
      }
      
      if (visited.has(currentModel)) {
        return;
      }
      
      visited.add(currentModel);
      path.push(currentModel);
      
      const model = modelMap.get(currentModel);
      if (model) {
        for (const dependency of model.dependencies) {
          dfs(dependency);
        }
      }
      
      path.pop();
    }
    
    dfs(modelName);
  }
}

// 生成拓扑排序
function generateTopologicalOrder(modelMap: Map<string, ModelInfo>): string[] {
  log('生成拓扑排序...');
  
  const visited = new Set<string>();
  const order: string[] = [];
  
  function visit(modelName: string) {
    if (visited.has(modelName)) {
      return;
    }
    
    visited.add(modelName);
    
    const model = modelMap.get(modelName);
    if (model) {
      // 先处理所有依赖
      for (const dependency of model.dependencies) {
        visit(dependency);
      }
      
      // 然后添加自己
      order.push(modelName);
    }
  }
  
  // 按照level排序，首先初始化基础模型
  const modelsByLevel = new Map<number, string[]>();
  for (const [modelName, modelInfo] of modelMap.entries()) {
    if (!modelsByLevel.has(modelInfo.level)) {
      modelsByLevel.set(modelInfo.level, []);
    }
    modelsByLevel.get(modelInfo.level)?.push(modelName);
  }
  
  // 按level从小到大排序
  const levels = Array.from(modelsByLevel.keys()).sort((a, b) => a - b);
  
  for (const level of levels) {
    const models = modelsByLevel.get(level) || [];
    for (const modelName of models) {
      visit(modelName);
    }
  }
  
  return order;
}

// 生成层次化初始化代码
function generateInitCode(modelMap: Map<string, ModelInfo>, order: string[]): string {
  log('生成初始化代码...');
  
  let code = `/**
 * 自动生成的模型初始化代码
 * 生成时间: ${new Date().toISOString()}
 */

import { Sequelize } from 'sequelize';
import { logger } from './utils/logger';

/**
 * 初始化所有模型
 * 按照依赖关系的拓扑排序顺序初始化
 */
export async function initializeAllModels(sequelize: Sequelize): Promise<void> {
  if (!sequelize) {
    throw new Error('初始化模型需要有效的Sequelize实例');
  }
  
  try {
    logger.info('=== 开始初始化所有模型 ===');
    
    // 1. 基础模型
    await initializeBaseModels(sequelize);
    
    // 2. 业务模型
    await initializeBusinessModels(sequelize);
    
    // 3. 关系模型
    await initializeRelationModels(sequelize);
    
    // 4. 功能模型
    await initializeFeatureModels(sequelize);
    
    logger.info('=== 所有模型初始化完成 ===');
  } catch (error) {
    logger.error('模型初始化过程中发生错误:', error);
    throw error;
  }
}\n\n`;
  
  // 按层次生成初始化函数
  const modelsByLevel = new Map<number, string[]>();
  for (const modelName of order) {
    const modelInfo = modelMap.get(modelName);
    if (modelInfo) {
      if (!modelsByLevel.has(modelInfo.level)) {
        modelsByLevel.set(modelInfo.level, []);
      }
      modelsByLevel.get(modelInfo.level)?.push(modelName);
    }
  }
  
  // 基础模型初始化
  code += `/**
 * 初始化基础模型
 */
async function initializeBaseModels(sequelize: Sequelize): Promise<void> {
  logger.info('--- 开始初始化基础模型 ---');
  
  // 导入基础模型
`;

  const baseModels = modelsByLevel.get(0) || [];
  for (const model of baseModels) {
    const modelInfo = modelMap.get(model);
    if (modelInfo) {
      const importPath = `./models/${modelInfo.file.replace('.ts', '')}`;
      code += `  const ${model}Module = await import('${importPath}');\n`;
    }
  }
  
  code += `\n  // 初始化基础模型\n`;
  for (const model of baseModels) {
    code += `  if (${model}Module && ${model}Module.${model} && typeof ${model}Module.${model}.initModel === 'function') {\n`;
    code += `    logger.info('初始化 ${model} 模型');\n`;
    code += `    ${model}Module.${model}.initModel(sequelize);\n`;
    code += `  } else {\n`;
    code += `    logger.warn('${model}模型初始化失败，模型可能不存在或没有initModel方法');\n`;
    code += `  }\n\n`;
  }
  
  code += `  logger.info('--- 基础模型初始化完成 ---');\n}\n\n`;
  
  // 业务模型初始化
  code += `/**
 * 初始化业务模型
 */
async function initializeBusinessModels(sequelize: Sequelize): Promise<void> {
  logger.info('--- 开始初始化业务模型 ---');
  
  // 导入业务模型
`;

  const businessModels = modelsByLevel.get(1) || [];
  for (const model of businessModels) {
    const modelInfo = modelMap.get(model);
    if (modelInfo) {
      const importPath = `./models/${modelInfo.file.replace('.ts', '')}`;
      code += `  const ${model}Module = await import('${importPath}');\n`;
    }
  }
  
  code += `\n  // 初始化业务模型\n`;
  for (const model of businessModels) {
    code += `  if (${model}Module && ${model}Module.${model} && typeof ${model}Module.${model}.initModel === 'function') {\n`;
    code += `    logger.info('初始化 ${model} 模型');\n`;
    code += `    ${model}Module.${model}.initModel(sequelize);\n`;
    code += `  } else {\n`;
    code += `    logger.warn('${model}模型初始化失败，模型可能不存在或没有initModel方法');\n`;
    code += `  }\n\n`;
  }
  
  code += `  logger.info('--- 业务模型初始化完成 ---');\n}\n\n`;
  
  // 关系模型初始化
  code += `/**
 * 初始化关系模型
 */
async function initializeRelationModels(sequelize: Sequelize): Promise<void> {
  logger.info('--- 开始初始化关系模型 ---');
  
  // 导入关系模型
`;

  const relationModels = modelsByLevel.get(2) || [];
  for (const model of relationModels) {
    const modelInfo = modelMap.get(model);
    if (modelInfo) {
      const importPath = `./models/${modelInfo.file.replace('.ts', '')}`;
      code += `  const ${model}Module = await import('${importPath}');\n`;
    }
  }
  
  code += `\n  // 初始化关系模型\n`;
  for (const model of relationModels) {
    code += `  if (${model}Module && ${model}Module.${model} && typeof ${model}Module.${model}.initModel === 'function') {\n`;
    code += `    logger.info('初始化 ${model} 模型');\n`;
    code += `    ${model}Module.${model}.initModel(sequelize);\n`;
    code += `  } else {\n`;
    code += `    logger.warn('${model}模型初始化失败，模型可能不存在或没有initModel方法');\n`;
    code += `  }\n\n`;
  }
  
  code += `  logger.info('--- 关系模型初始化完成 ---');\n}\n\n`;
  
  // 功能模型初始化
  code += `/**
 * 初始化功能模型
 */
async function initializeFeatureModels(sequelize: Sequelize): Promise<void> {
  logger.info('--- 开始初始化功能模型 ---');
  
  // 导入功能模型
`;

  const featureModels = modelsByLevel.get(3) || [];
  for (const model of featureModels) {
    const modelInfo = modelMap.get(model);
    if (modelInfo) {
      const importPath = `./models/${modelInfo.file.replace('.ts', '')}`;
      code += `  const ${model}Module = await import('${importPath}');\n`;
    }
  }
  
  code += `\n  // 初始化功能模型\n`;
  for (const model of featureModels) {
    code += `  if (${model}Module && ${model}Module.${model} && typeof ${model}Module.${model}.initModel === 'function') {\n`;
    code += `    logger.info('初始化 ${model} 模型');\n`;
    code += `    ${model}Module.${model}.initModel(sequelize);\n`;
    code += `  } else {\n`;
    code += `    logger.warn('${model}模型初始化失败，模型可能不存在或没有initModel方法');\n`;
    code += `  }\n\n`;
  }
  
  code += `  logger.info('--- 功能模型初始化完成 ---');\n}\n\n`;
  
  // 添加初始化关联关系的代码
  code += `/**
 * 初始化模型关联关系
 * 在所有模型初始化之后调用
 */
export async function initializeModelAssociations(): Promise<void> {
  try {
    logger.info('=== 开始初始化模型关联关系 ===');
    
    // 获取所有可能需要建立关联的模型
`;

  // 所有模型
  const allModels = [...baseModels, ...businessModels, ...relationModels, ...featureModels];
  for (const model of allModels) {
    const modelInfo = modelMap.get(model);
    if (modelInfo) {
      const importPath = `./models/${modelInfo.file.replace('.ts', '')}`;
      code += `    const ${model}Module = await import('${importPath}');\n`;
    }
  }
  
  code += `\n    // 建立模型关联关系\n`;
  code += `    // 注意：这里只是一个框架，需要根据实际模型关系填写\n`;
  code += `    // 例如：ModelA.belongsTo(ModelB, { foreignKey: 'model_b_id' });\n\n`;
  
  code += `    logger.info('=== 模型关联关系初始化完成 ===');\n`;
  code += `  } catch (error) {\n`;
  code += `    logger.error('初始化模型关联关系时出错:', error);\n`;
  code += `    throw error;\n`;
  code += `  }\n}\n`;
  
  return code;
}

// 主函数
async function analyzeModelInitOrder(): Promise<void> {
  try {
    // 1. 扫描模型依赖关系
    const modelMap = await scanModelDependencies();
    
    // 2. 检测循环依赖
    detectCircularDependencies(modelMap);
    
    // 3. 生成拓扑排序
    const order = generateTopologicalOrder(modelMap);
    
    // 4. 输出结果
    log('模型初始化顺序:');
    for (let i = 0; i < order.length; i++) {
      const modelName = order[i];
      const modelInfo = modelMap.get(modelName);
      log(`${i + 1}. ${modelName} (Level: ${modelInfo?.level}, 依赖: ${modelInfo?.dependencies.join(', ') || 'None'})`);
    }
    
    // 5. 生成初始化代码
    const initCode = generateInitCode(modelMap, order);
    const codeOutputFile = path.join(__dirname, '../generated-init-code.ts');
    fs.writeFileSync(codeOutputFile, initCode);
    log(`生成的初始化代码已写入: ${codeOutputFile}`);
    
    log('模型初始化顺序分析完成');
  } catch (error) {
    log(`分析模型初始化顺序时出错: ${error}`);
  }
}

// 执行分析
log('开始分析模型初始化顺序...');
analyzeModelInitOrder()
  .then(() => {
    log('分析完成');
  })
  .catch((error) => {
    log(`分析过程中发生错误: ${error}`);
  }); 