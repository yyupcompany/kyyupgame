/**
 * 模型初始化调试脚本
 * 
 * 此脚本用于详细记录各个模型的初始化过程，帮助诊断问题
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 设置日志文件
const logFile = path.join(__dirname, '../model-debug.log');
fs.writeFileSync(logFile, `=== 模型初始化调试开始 ${new Date().toISOString()} ===\n`);

// 日志函数
function log(message) {
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
  dialect: 'mysql',
  timezone: '+08:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    underscored: true,
    freezeTableName: true, // 避免自动复数化
  },
  logging: (msg) => log(`SQL: ${msg}`)
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
    logging: (msg) => log(`SQL: ${msg}`)
  }
);
log('Sequelize实例创建完成');

// 获取模型文件列表
const modelsDir = path.join(__dirname, 'models');
log(`扫描模型目录: ${modelsDir}`);

let modelFiles = [];
try {
  modelFiles = fs.readdirSync(modelsDir).filter(file => 
    file.endsWith('.model.ts') || file.endsWith('.model.js')
  );
  log(`找到 ${modelFiles.length} 个模型文件`);
} catch (error) {
  log(`扫描模型目录失败: ${error}`);
}

// 测试模型初始化
async function testModelInitialization() {
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
async function testModel(modelFile) {
  log(`开始测试模型: ${modelFile}`);
  
  try {
    // 读取模型文件内容
    const filePath = path.join(modelsDir, modelFile);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查模型文件结构
    const hasInitMethod = content.includes('static initModel');
    log(`模型 ${modelFile} ${hasInitMethod ? '有' : '没有'} initModel 静态方法`);
    
    const hasSequelizeImport = content.includes('import { Sequelize }') || content.includes('require(\'sequelize\')');
    log(`模型 ${modelFile} ${hasSequelizeImport ? '有' : '没有'} 导入 Sequelize`);
    
    // 提取模型类名
    const className = modelFile
      .replace('.model.ts', '')
      .replace('.model.js', '')
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    log(`尝试导入模型: ${className}`);
    
    try {
      // 动态导入模型 - 使用require
      const modulePath = path.join(modelsDir, modelFile.replace('.ts', ''));
      log(`模块路径: ${modulePath}`);
      
      // 由于使用require无法直接导入TS文件，这里直接检查文件结构
      log(`由于使用CommonJS无法直接导入TS模型，跳过初始化测试`);
      log(`建议使用model-init-order.js脚本生成初始化代码`);
      
      // 输出模型基本信息
      log(`模型名称: ${className}`);
      log(`模型文件: ${modelFile}`);
      log(`模型路径: ${modulePath}`);
      
      // 检查是否有循环依赖问题
      const hasCircularDependency = content.includes('from \'../init-models\'');
      if (hasCircularDependency) {
        log(`警告: 模型 ${className} 存在潜在的循环依赖问题，导入了init-models`);
      }
      
    } catch (importError) {
      log(`分析模型 ${modelFile} 失败: ${importError}`);
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