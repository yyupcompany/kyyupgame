/**
 * 模型初始化调试脚本
 * 
 * 此脚本用于详细记录各个模型的初始化过程，帮助诊断问题
 */

import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 设置日志文件
const logFile = path.join(__dirname, '../model-debug.log');
fs.writeFileSync(logFile, `=== 模型初始化调试开始 ${new Date().toISOString()} ===\n`);

// 日志函数
function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 输出到控制台
  console.log(message);
  
  // 写入日志文件
  fs.appendFileSync(logFile, logMessage);
}

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });
log('环境变量加载完成');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  database: process.env.DB_NAME || 'kargerdensales',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  dialect: 'mysql' as const,
  timezone: '+08:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    underscored: true,
    freezeTableName: true, // 避免自动复数化
  },
  logging: (msg: string) => log(`SQL: ${msg}`)
};

log('数据库配置准备完成');

// 创建Sequelize实例
log('正在创建Sequelize实例...');
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    define: dbConfig.define,
    logging: (msg: string) => log(`SQL: ${msg}`)
  }
);
log('Sequelize实例创建完成');

// 获取模型文件列表
const modelsDir = path.join(__dirname, 'models');
log(`扫描模型目录: ${modelsDir}`);

let modelFiles: string[] = [];
try {
  modelFiles = fs.readdirSync(modelsDir).filter(file => 
    file.endsWith('.model.ts')
  );
  log(`找到 ${modelFiles.length} 个模型文件`);
} catch (error) {
  log(`扫描模型目录失败: ${error}`);
}

// 测试模型初始化
async function testModelInitialization(): Promise<void> {
  // 建立数据库连接
  try {
    log('正在测试数据库连接...');
    await sequelize.authenticate();
    log('数据库连接测试成功!');
  } catch (error) {
    log(`数据库连接测试失败: ${error}`);
    throw error;
  }
  
  // 按顺序测试每个模型
  const baseModels = ['user.model.ts', 'role.model.ts', 'permission.model.ts'];
  
  // 先测试基础模型
  log('=== 开始测试基础模型 ===');
  for (const modelFile of baseModels) {
    if (modelFiles.includes(modelFile)) {
      await testModel(modelFile);
    }
  }
  
  // 测试其他模型
  log('=== 开始测试其他模型 ===');
  for (const modelFile of modelFiles) {
    if (!baseModels.includes(modelFile)) {
      await testModel(modelFile);
    }
  }
}

// 测试单个模型初始化
async function testModel(modelFile: string): Promise<void> {
  log(`开始测试模型: ${modelFile}`);
  
  try {
    // 读取模型文件内容
    const filePath = path.join(modelsDir, modelFile);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查模型文件结构
    const hasInitMethod = content.includes('static initModel');
    log(`模型 ${modelFile} ${hasInitMethod ? '有' : '没有'} initModel 静态方法`);
    
    const hasSequelizeImport = content.includes('import { Sequelize }');
    log(`模型 ${modelFile} ${hasSequelizeImport ? '有' : '没有'} 导入 Sequelize`);
    
    // 提取模型类名
    const className = modelFile
      .replace('.model.ts', '')
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    log(`尝试导入模型: ${className}`);
    
    try {
      // 动态导入模型
      const modulePath = `./models/${modelFile.replace('.ts', '')}`;
      log(`模块路径: ${modulePath}`);
      
      const moduleImport = await import(modulePath);
      log(`模型 ${modelFile} 导入成功`);
      
      // 检查模型类是否存在
      if (moduleImport[className]) {
        log(`模型类 ${className} 存在`);
        
        // 检查initModel方法
        if (typeof moduleImport[className].initModel === 'function') {
          log(`模型 ${className} 有 initModel 方法`);
          
          try {
            // 尝试初始化模型
            log(`尝试初始化模型 ${className}...`);
            moduleImport[className].initModel(sequelize);
            log(`模型 ${className} 初始化成功`);
          } catch (initError) {
            log(`模型 ${className} 初始化失败: ${initError}`);
            if (initError instanceof Error) {
              log(`错误栈: ${initError.stack}`);
            }
          }
        } else {
          log(`模型 ${className} 没有 initModel 方法`);
        }
      } else {
        log(`模型类 ${className} 不存在，检查导出名称`);
        log(`模块导出: ${Object.keys(moduleImport).join(', ')}`);
      }
    } catch (importError) {
      log(`导入模型 ${modelFile} 失败: ${importError}`);
      if (importError instanceof Error) {
        log(`错误栈: ${importError.stack}`);
      }
    }
  } catch (error) {
    log(`测试模型 ${modelFile} 时出错: ${error}`);
    if (error instanceof Error) {
      log(`错误栈: ${error.stack}`);
    }
  }
  
  log(`模型 ${modelFile} 测试完成`);
}

// 执行测试
log('开始执行模型初始化诊断...');
testModelInitialization()
  .then(() => {
    log('模型初始化诊断脚本执行完成');
    log(`详细日志已写入 ${logFile}`);
    
    // 关闭数据库连接
    sequelize.close().then(() => {
      log('数据库连接已关闭');
      process.exit(0);
    });
  })
  .catch((error) => {
    log(`模型初始化诊断脚本执行失败: ${error}`);
    
    // 关闭数据库连接
    sequelize.close().then(() => {
      log('数据库连接已关闭');
      process.exit(1);
    });
  }); 