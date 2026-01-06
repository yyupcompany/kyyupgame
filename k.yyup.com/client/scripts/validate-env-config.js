#!/usr/bin/env node

/**
 * 环境配置验证脚本
 * 严格模式：验证零硬编码标准，确保所有配置通过环境变量管理
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🔍 开始验证环境配置...'));

// 验证配置
const config = {
  files: [
    '.env',
    '.env.development',
    '.env.template',
    '.env.example',
    'vite.config.ts'
  ],

  // 硬编码检测模式
  hardcodedPatterns: [
    /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,  // 完整域名
    /k\.yyup\.cc/g,                                // 特定硬编码域名
    /rent\.yyup\.cc/g,                             // 特定硬编码域名
    /localhost:[0-9]+/g,                          // localhost:端口
    /127\.0\.0\.1:[0-9]+/g,                       // IPv4地址+端口
  ],

  // 允许的环境变量模式
  envVarPatterns: [
    /\$\{[A-Z_][A-Z0-9_]*\}/g,                    // ${VAR_NAME}
    /\$\{[A-Z_][A-Z0-9_]*:[^}]*\}/g,              // ${VAR_NAME:default}
  ],

  // 必需的环境变量
  requiredEnvVars: [
    'VITE_API_PROXY_TARGET',
    'VITE_APP_URL',
    'VITE_UNIFIED_TENANT_URL',
    'VITE_API_BASE_URL',
    'VITE_DEV_HOST',
    'VITE_DEV_PORT'
  ]
};

let hasErrors = false;
let hasWarnings = false;

/**
 * 检查文件是否存在
 */
function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(chalk.red(`❌ 文件不存在: ${filePath}`));
    hasErrors = true;
    return false;
  }
  console.log(chalk.green(`✅ 文件存在: ${filePath}`));
  return true;
}

/**
 * 检查硬编码内容
 */
function checkHardcoded(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  const content = fs.readFileSync(fullPath, 'utf8');

  let foundHardcoded = [];

  config.hardcodedPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      // 排除注释中的硬编码和环境变量默认值配置
      const filteredMatches = matches.filter(match => {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(match)) {
            const line = lines[i].trim();
            // 跳过注释行
            if (line.startsWith('//') || line.startsWith('#')) {
              return false;
            }
            // 跳过环境变量默认值配置 (${VAR:-default})
            if (line.includes('${') && line.includes(':-')) {
              return false;
            }
            // 跳过Vite默认值配置 (|| 操作符)
            if (line.includes('||') && (line.includes('127.0.0.1') || line.includes('localhost'))) {
              return false;
            }
            return true;
          }
        }
        return true;
      });

      if (filteredMatches.length > 0) {
        foundHardcoded.push(...filteredMatches);
      }
    }
  });

  if (foundHardcoded.length > 0) {
    console.log(chalk.red(`❌ ${filePath} 发现硬编码:`));
    foundHardcoded.forEach(hardcoded => {
      console.log(chalk.red(`   - ${hardcoded}`));
    });
    hasErrors = true;
  } else {
    console.log(chalk.green(`✅ ${filePath} 无硬编码`));
  }

  return foundHardcoded;
}

/**
 * 检查环境变量使用
 */
function checkEnvVars(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  const content = fs.readFileSync(fullPath, 'utf8');

  let envVarCount = 0;
  config.envVarPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      envVarCount += matches.length;
    }
  });

  console.log(chalk.blue(`📊 ${filePath} 环境变量使用: ${envVarCount} 处`));

  return envVarCount;
}

/**
 * 检查必需的环境变量
 */
function checkRequiredEnvVars(filePath) {
  if (!filePath.endsWith('.env') && !filePath.endsWith('.env.development')) {
    return;
  }

  const fullPath = path.join(process.cwd(), filePath);
  const content = fs.readFileSync(fullPath, 'utf8');

  let missingVars = [];

  config.requiredEnvVars.forEach(varName => {
    if (!content.includes(varName)) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log(chalk.yellow(`⚠️  ${filePath} 缺少环境变量:`));
    missingVars.forEach(varName => {
      console.log(chalk.yellow(`   - ${varName}`));
    });
    hasWarnings = true;
  } else {
    console.log(chalk.green(`✅ ${filePath} 包含所有必需环境变量`));
  }
}

/**
 * 检查Vite配置
 */
function checkViteConfig() {
  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  const content = fs.readFileSync(viteConfigPath, 'utf8');

  // 检查是否使用loadEnv
  if (!content.includes('loadEnv')) {
    console.log(chalk.red('❌ vite.config.ts 未使用loadEnv函数'));
    hasErrors = true;
  } else {
    console.log(chalk.green('✅ vite.config.ts 使用loadEnv函数'));
  }

  // 检查代理配置
  if (!content.includes('env.VITE_API_PROXY_TARGET')) {
    console.log(chalk.red('❌ vite.config.ts 代理配置未使用环境变量'));
    hasErrors = true;
  } else {
    console.log(chalk.green('✅ vite.config.ts 代理配置使用环境变量'));
  }

  // 检查服务器配置
  const serverConfigs = ['VITE_DEV_HOST', 'VITE_DEV_PORT', 'VITE_HMR_CLIENT_PORT'];
  serverConfigs.forEach(configVar => {
    if (content.includes(configVar)) {
      console.log(chalk.green(`✅ vite.config.ts 使用 ${configVar}`));
    }
  });
}

/**
 * 生成修复建议
 */
function generateFixSuggestions() {
  console.log(chalk.blue('\n📝 修复建议:'));

  console.log(chalk.yellow('1. 硬编码域名修复:'));
  console.log(chalk.gray('   将: VITE_APP_URL=http://k.yyup.cc'));
  console.log(chalk.gray('   改为: VITE_APP_URL=${APP_URL}'));

  console.log(chalk.yellow('2. API代理配置:'));
  console.log(chalk.gray('   将: VITE_API_PROXY_TARGET=http://localhost:3000'));
  console.log(chalk.gray('   改为: VITE_API_PROXY_TARGET=${API_PROXY_TARGET:-http://127.0.0.1:3000}'));

  console.log(chalk.yellow('3. 端口配置:'));
  console.log(chalk.gray('   将: VITE_DEV_PORT=5173'));
  console.log(chalk.gray('   改为: VITE_DEV_PORT=${DEV_PORT:-5173}'));
}

// 主验证流程
async function main() {
  console.log(chalk.blue('\n📋 检查文件存在性...'));

  for (const file of config.files) {
    checkFileExists(file);
  }

  console.log(chalk.blue('\n🔍 检查硬编码内容...'));

  for (const file of config.files) {
    if (checkFileExists(file)) {
      checkHardcoded(file);
      checkEnvVars(file);
      checkRequiredEnvVars(file);
    }
  }

  console.log(chalk.blue('\n⚙️  检查Vite配置...'));
  checkViteConfig();

  console.log(chalk.blue('\n📊 验证总结:'));

  if (hasErrors) {
    console.log(chalk.red('❌ 发现错误，需要修复硬编码问题'));
    generateFixSuggestions();
    process.exit(1);
  } else if (hasWarnings) {
    console.log(chalk.yellow('⚠️  发现警告，建议优化配置'));
  } else {
    console.log(chalk.green('✅ 环境配置验证通过！符合零硬编码标准'));
  }

  console.log(chalk.blue('\n📚 详细文档: client/ENVIRONMENT_CONFIG_GUIDE.md'));
}

// 运行验证
main().catch(error => {
  console.error(chalk.red('验证过程中发生错误:'), error);
  process.exit(1);
});