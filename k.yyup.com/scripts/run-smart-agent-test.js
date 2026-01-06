#!/usr/bin/env node

/**
 * 智能代理测试运行器
 * 直接执行智能代理功能检测
 */

import { SmartAgentTester } from './智能代理功能检测.js';
import chalk from 'chalk';

async function runTests() {
  console.log(chalk.blue('🚀 开始执行智能代理功能检测...'));
  console.log(chalk.gray('配置信息:'));
  console.log(chalk.gray(`- BASE_URL: ${process.env.TEST_BASE_URL || 'http://localhost:3000'}`));
  console.log(chalk.gray(`- TOKEN: ${process.env.TEST_TOKEN ? '已设置' : '未设置'}`));
  console.log('');

  try {
    const tester = new SmartAgentTester();
    await tester.runAllTests();
    console.log(chalk.green('✅ 智能代理功能检测完成'));
  } catch (error) {
    console.error(chalk.red('❌ 测试执行失败:'), error);
    process.exit(1);
  }
}

// 直接运行
runTests();
