#!/usr/bin/env node

import { Command } from 'commander';
import { logger } from '../utils/logger';
import { runSeed } from '../scripts/run-seed';

// 创建命令行程序
const program = new Command();

program
  .name('seed-data')
  .description('生成幼儿园管理系统的模拟数据')
  .version('1.0.0');

// 添加全部生成命令
program
  .command('all')
  .description('生成所有模拟数据')
  .action(async () => {
    try {
      logger.info('开始生成所有模拟数据...');
      await runSeed();
      logger.info('所有模拟数据生成完成！');
      process.exit(0);
    } catch (error) {
      logger.error('生成所有模拟数据失败:', error);
      process.exit(1);
    }
  });

// 添加基础数据生成命令
program
  .command('basic')
  .description('生成基础数据（角色、权限、幼儿园等）')
  .action(async () => {
    try {
      logger.info('开始生成基础数据...');
      await runSeed();
      logger.info('基础数据生成完成！');
      process.exit(0);
    } catch (error) {
      logger.error('生成基础数据失败:', error);
      process.exit(1);
    }
  });

// 暂时注释掉其他命令，等相应的生成函数实现后再逐步添加
/*
// 添加教师和班级数据生成命令
program
  .command('teacher-class')
  .description('生成教师和班级数据')
  .action(async () => {
    try {
      logger.info('开始生成教师和班级数据...');
      await generateTeacherClassData();
      logger.info('教师和班级数据生成完成！');
      process.exit(0);
    } catch (error) {
      logger.error('生成教师和班级数据失败:', error);
      process.exit(1);
    }
  });

// 添加学生和家长数据生成命令
program
  .command('student-parent')
  .description('生成学生和家长数据')
  .action(async () => {
    try {
      logger.info('开始生成学生和家长数据...');
      await generateStudentParentData();
      logger.info('学生和家长数据生成完成！');
      process.exit(0);
    } catch (error) {
      logger.error('生成学生和家长数据失败:', error);
      process.exit(1);
    }
  });

// 添加活动数据生成命令
program
  .command('activity')
  .description('生成活动相关数据')
  .action(async () => {
    try {
      logger.info('开始生成活动相关数据...');
      await generateActivityData();
      logger.info('活动相关数据生成完成！');
      process.exit(0);
    } catch (error) {
      logger.error('生成活动相关数据失败:', error);
      process.exit(1);
    }
  });

// 添加招生和营销数据生成命令
program
  .command('enrollment-marketing')
  .description('生成招生和营销相关数据')
  .action(async () => {
    try {
      logger.info('开始生成招生和营销相关数据...');
      await generateEnrollmentMarketingData();
      logger.info('招生和营销相关数据生成完成！');
      process.exit(0);
    } catch (error) {
      logger.error('生成招生和营销相关数据失败:', error);
      process.exit(1);
    }
  });

// 添加系统功能数据生成命令
program
  .command('system')
  .description('生成系统功能相关数据')
  .action(async () => {
    try {
      logger.info('开始生成系统功能相关数据...');
      await generateSystemData();
      logger.info('系统功能相关数据生成完成！');
      process.exit(0);
    } catch (error) {
      logger.error('生成系统功能相关数据失败:', error);
      process.exit(1);
    }
  });
*/

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 