#!/usr/bin/env node
/**
 * 数据库优化CLI工具
 * 提供交互式命令行界面，方便开发人员进行数据库优化和诊断
 */

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { initDatabase, getSequelize, closeDatabase } from '../config/database';

import * as indexOptimizer from '../utils/index-optimizer';
import * as queryOptimizer from '../utils/query-optimizer';
import * as dbMonitor from '../utils/db-monitor';
import * as transactionMonitor from '../utils/transaction-monitor';
import * as slowQueryAnalyzer from '../utils/slow-query-analyzer';
import { getConnectionPoolStats, getConnectionPoolHealth } from '../config/connection-pool';

// 创建命令行程序
const program = new Command();

program
  .name('db-optimizer')
  .description('数据库优化和诊断工具')
  .version('1.0.0');

// 索引优化命令
program
  .command('optimize-indexes')
  .description('分析和优化数据库索引')
  .option('-t, --table <table>', '指定要优化的表名')
  .option('-a, --analyze-only', '仅分析不执行优化')
  .action(async (options) => {
    try {
      await initDatabase();
      const sequelize = getSequelize();
      const spinner = ora('正在分析数据库索引...').start();
      
      // 获取索引分析报告
      const report = await indexOptimizer.analyzeIndexes(sequelize, options.table);
      
      spinner.succeed('索引分析完成');
      
      // 显示报告
      console.log(chalk.blue('\n索引分析报告:'));
      console.log(`总索引数: ${report.totalIndexes}`);
      console.log(`未使用索引数: ${report.unusedIndexes}`);
      console.log(`重复索引数: ${report.duplicateIndexes}`);
      console.log(`缺失索引数: ${report.missingIndexes}`);
      
      if (report.recommendations.length === 0) {
        console.log(chalk.green('\n没有发现需要优化的索引'));
        return;
      }
      
      console.log(chalk.yellow(`\n索引优化建议 (${report.recommendations.length}):`));
      
      // 按优先级分组
      const byPriority = {
        HIGH: report.recommendations.filter(r => r.priority === 'HIGH'),
        MEDIUM: report.recommendations.filter(r => r.priority === 'MEDIUM'),
        LOW: report.recommendations.filter(r => r.priority === 'LOW')
      };
      
      // 显示建议
      Object.entries(byPriority).forEach(([priority, recs]) => {
        if (recs.length > 0) {
          console.log(chalk.yellow(`\n${priority}优先级建议 (${recs.length}):`));
          recs.forEach((rec, idx) => {
            console.log(`${idx + 1}. ${rec.recommendationType} ${rec.tableName}.${rec.columnName || ''}: ${rec.reason}`);
            if (rec.suggestedSQL) {
              console.log(chalk.cyan(`   ${rec.suggestedSQL}`));
            }
          });
        }
      });
      
      // 如果不是仅分析模式，询问是否执行优化
      if (!options.analyzeOnly && report.recommendations.length > 0) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: '是否执行建议的索引优化?',
            default: false
          }
        ]);
        
        if (confirm) {
          const { priority } = await inquirer.prompt([
            {
              type: 'list',
              name: 'priority',
              message: '选择要执行的优化建议优先级:',
              choices: [
                { name: '仅高优先级', value: 'HIGH' },
                { name: '高和中优先级', value: 'MEDIUM' },
                { name: '所有优先级', value: 'ALL' }
              ]
            }
          ]);
          
          const spinner = ora('正在执行索引优化...').start();
          
          let executed = 0;
          let failed = 0;
          
          // 根据选择的优先级筛选建议
          const toExecute = report.recommendations.filter(rec => {
            if (priority === 'HIGH') return rec.priority === 'HIGH';
            if (priority === 'MEDIUM') return rec.priority === 'HIGH' || rec.priority === 'MEDIUM';
            return true; // ALL
          });
          
          // 执行每个建议
          for (const rec of toExecute) {
            if (rec.suggestedSQL) {
              try {
                const success = await indexOptimizer.executeIndexOptimization(sequelize, rec);
                if (success) {
                  executed++;
                } else {
                  failed++;
                }
              } catch (error) {
                console.error(`执行索引优化失败: ${rec.suggestedSQL}`, error);
                failed++;
              }
            }
          }
          
          spinner.succeed(`索引优化完成: ${executed} 个成功, ${failed} 个失败`);
        }
      }
    } catch (error) {
      console.error('索引优化失败:', error);
      process.exit(1);
    } finally {
      await closeDatabase();
    }
  });

// 查询优化命令
program
  .command('analyze-query')
  .description('分析和优化SQL查询')
  .option('-q, --query <query>', 'SQL查询语句')
  .action(async (options) => {
    try {
      await initDatabase();
      const sequelize = getSequelize();
      // 如果没有提供查询，则提示输入
      if (!options.query) {
        const { query } = await inquirer.prompt([
          {
            type: 'input',
            name: 'query',
            message: '请输入要分析的SQL查询:'
          }
        ]);
        options.query = query;
      }
      
      if (!options.query) {
        console.error('未提供SQL查询');
        return;
      }
      
      const spinner = ora('正在分析查询...').start();
      
      // 分析查询
      const analysis = await queryOptimizer.analyzeQuery(sequelize, options.query);
      
      spinner.succeed('查询分析完成');
      
      // 显示查询计划
      console.log(chalk.blue('\n查询执行计划:'));
      console.table(analysis.explainResults);
      
      // 显示优化建议
      if (analysis.recommendations.length > 0) {
        console.log(chalk.yellow('\n优化建议:'));
        analysis.recommendations.forEach((rec, idx) => {
          console.log(`${idx + 1}. ${rec.issue}`);
          console.log(chalk.cyan(`   ${rec.recommendation}`));
          if (rec.optimizedQuery) {
            console.log(chalk.green('   优化后的查询:'));
            console.log(chalk.green(`   ${rec.optimizedQuery}`));
          }
        });
      } else {
        console.log(chalk.green('\n查询已经是最优的，没有优化建议'));
      }
    } catch (error) {
      console.error('查询分析失败:', error);
      process.exit(1);
    } finally {
      await closeDatabase();
    }
  });

// 慢查询分析命令
program
  .command('slow-queries')
  .description('分析慢查询并提供优化建议')
  .option('-l, --limit <number>', '要分析的慢查询数量', '20')
  .option('-r, --report', '生成慢查询报告文件')
  .option('-e, --enable', '启用MySQL慢查询日志')
  .action(async (options) => {
    try {
      await initDatabase();
      const sequelize = getSequelize();
      // 启用慢查询日志
      if (options.enable) {
        const spinner = ora('正在启用MySQL慢查询日志...').start();
        const success = await slowQueryAnalyzer.enableSlowQueryLog(sequelize);
        if (success) {
          spinner.succeed('MySQL慢查询日志已启用');
        } else {
          spinner.fail('无法启用MySQL慢查询日志');
        }
      }
      
      const spinner = ora('正在获取慢查询...').start();
      
      // 获取慢查询
      const limit = parseInt(options.limit);
      const slowQueries = await slowQueryAnalyzer.getSlowQueries(sequelize, limit);
      
      if (slowQueries.length === 0) {
        spinner.fail('未找到慢查询记录');
        return;
      }
      
      spinner.succeed(`发现 ${slowQueries.length} 个慢查询`);
      
      // 分析慢查询
      const analysisSpinner = ora('正在分析慢查询...').start();
      const recommendations = await slowQueryAnalyzer.analyzeSlowQueries(sequelize, slowQueries);
      analysisSpinner.succeed('慢查询分析完成');
      
      // 显示统计信息
      const stats = await slowQueryAnalyzer.getSlowQueryStats(sequelize);
      console.log(chalk.blue('\n慢查询统计:'));
      console.log(`总数: ${stats.slowQueryCount}`);
      console.log(`平均查询时间: ${stats.avgQueryTime.toFixed(2)}秒`);
      console.log(`最长查询时间: ${stats.maxQueryTime.toFixed(2)}秒`);
      
      if (stats.commonTables.length > 0) {
        console.log(chalk.yellow('\n最常涉及的表:'));
        stats.commonTables.forEach(t => {
          console.log(`${t.table}: ${t.count} 次`);
        });
      }
      
      if (stats.commonPatterns.length > 0) {
        console.log(chalk.yellow('\n常见的性能问题:'));
        stats.commonPatterns.forEach(p => {
          console.log(`${p.pattern}: ${p.count} 次`);
        });
      }
      
      // 显示前5个慢查询
      console.log(chalk.yellow('\n最慢的查询:'));
      slowQueries.slice(0, 5).forEach((q, idx) => {
        console.log(chalk.cyan(`\n${idx + 1}. 查询时间: ${q.queryTime}秒, 扫描行数: ${q.rowsExamined}, 返回行数: ${q.rowsSent}`));
        console.log(q.query.substring(0, 200) + (q.query.length > 200 ? '...' : ''));
      });
      
      // 显示优化建议
      if (recommendations.length > 0) {
        console.log(chalk.yellow(`\n优化建议 (${recommendations.length}):`));
        // 按优先级分组
        const byPriority = {
          HIGH: recommendations.filter(r => r.priority === 'HIGH'),
          MEDIUM: recommendations.filter(r => r.priority === 'MEDIUM'),
          LOW: recommendations.filter(r => r.priority === 'LOW')
        };
        
        Object.entries(byPriority).forEach(([priority, recs]) => {
          if (recs.length > 0) {
            console.log(chalk.yellow(`\n${priority}优先级建议 (${recs.length}):`));
            recs.slice(0, 3).forEach((rec, idx) => {
              console.log(`${idx + 1}. ${rec.pattern}: ${rec.recommendation}`);
              if (rec.suggestedIndex) {
                console.log(chalk.cyan(`   建议的索引: ${rec.suggestedIndex}`));
              }
              if (rec.suggestedQuery) {
                console.log(chalk.green(`   建议的查询: ${rec.suggestedQuery}`));
              }
            });
            if (recs.length > 3) {
              console.log(`... 还有 ${recs.length - 3} 个建议`);
            }
          }
        });
      } else {
        console.log(chalk.green('\n没有优化建议'));
      }
      
      // 生成报告
      if (options.report) {
        const reportSpinner = ora('正在生成慢查询报告...').start();
        const success = await slowQueryAnalyzer.saveSlowQueriesReport(sequelize);
        if (success) {
          reportSpinner.succeed('慢查询报告已生成');
        } else {
          reportSpinner.fail('生成慢查询报告失败');
        }
      }
    } catch (error) {
      console.error('慢查询分析失败:', error);
      process.exit(1);
    } finally {
      await closeDatabase();
    }
  });

// 数据库监控命令
program
  .command('monitor')
  .description('监控数据库性能')
  .option('-t, --time <seconds>', '监控持续时间（秒）', '60')
  .option('-i, --interval <seconds>', '监控间隔（秒）', '5')
  .action(async (options) => {
    try {
      await initDatabase();
      const sequelize = getSequelize();
      const duration = parseInt(options.time);
      const interval = parseInt(options.interval) * 1000;
      const iterations = Math.floor(duration / (interval / 1000));
      
      console.log(chalk.blue(`开始监控数据库 (持续 ${duration} 秒, 间隔 ${interval / 1000} 秒)...`));
      
      // 初始化计数器
      let iterationCount = 0;
      
      // 监控函数
      const monitor = async () => {
        iterationCount++;
        console.log(chalk.yellow(`\n--- 监控报告 #${iterationCount} (${new Date().toLocaleTimeString()}) ---`));
        
        // 获取连接池统计
        try {
          const poolStats = getConnectionPoolStats(sequelize);
          const poolHealth = getConnectionPoolHealth(poolStats);
          
          console.log(chalk.blue('\n连接池状态:'));
          console.log(`总连接数: ${poolStats.total}`);
          console.log(`活跃连接: ${poolStats.used}`);
          console.log(`空闲连接: ${poolStats.idle}`);
          console.log(`等待连接: ${poolStats.waiting}`);
          console.log(`利用率: ${(poolHealth.utilization * 100).toFixed(2)}%`);
          console.log(`健康状态: ${poolHealth.status}`);
          
          if (poolHealth.recommendations.length > 0) {
            console.log(chalk.yellow('\n连接池建议:'));
            poolHealth.recommendations.forEach(rec => {
              console.log(`- ${rec}`);
            });
          }
        } catch (error) {
          console.error('获取连接池统计失败:', error);
        }
        
        // 获取查询性能
        try {
          const queryStats = await dbMonitor.getQueryStats(sequelize);
          
          console.log(chalk.blue('\n查询性能:'));
          console.log(`总查询数: ${queryStats.totalQueries}`);
          console.log(`慢查询数: ${queryStats.slowQueries}`);
          console.log(`平均查询时间: ${queryStats.averageQueryTime.toFixed(2)}ms`);
          console.log(`最大查询时间: ${queryStats.maxQueryTime}ms`);
          
          if (queryStats.slowestQueries.length > 0) {
            console.log(chalk.yellow('\n最慢查询:'));
            queryStats.slowestQueries.forEach((q, idx) => {
              console.log(`${idx + 1}. ${q.executionTime}ms: ${q.query.substring(0, 100)}...`);
            });
          }
        } catch (error) {
          console.error('获取查询性能失败:', error);
        }
        
        // 获取事务状态
        try {
          const txStats = await transactionMonitor.getTransactionStats(sequelize);
          const txHealth = await transactionMonitor.getTransactionHealth(sequelize);
          
          console.log(chalk.blue('\n事务状态:'));
          console.log(`活跃事务: ${txStats.activeCount}`);
          console.log(`长时间运行事务: ${txStats.longRunningCount}`);
          console.log(`等待锁事务: ${txStats.waitingForLockCount}`);
          console.log(`平均持续时间: ${txStats.avgDuration.toFixed(2)}秒`);
          
          if (txHealth.issues.length > 0) {
            console.log(chalk.yellow('\n事务问题:'));
            txHealth.issues.forEach(issue => {
              console.log(`- ${issue}`);
            });
          }
          
          if (txHealth.recommendations.length > 0) {
            console.log(chalk.yellow('\n事务建议:'));
            txHealth.recommendations.forEach(rec => {
              console.log(`- ${rec}`);
            });
          }
        } catch (error) {
          console.error('获取事务状态失败:', error);
        }
        
        // 继续监控或结束
        if (iterationCount < iterations) {
          setTimeout(monitor, interval);
        } else {
          console.log(chalk.green('\n监控结束'));
          await closeDatabase();
        }
      };
      
      // 开始监控
      monitor();
    } catch (error) {
      console.error('监控失败:', error);
      process.exit(1);
    }
  });

// 数据库诊断命令
program
  .command('diagnose')
  .description('全面诊断数据库健康状况')
  .action(async () => {
    try {
      await initDatabase();
      const sequelize = getSequelize();
      console.log(chalk.blue('开始诊断数据库健康状况...'));
      
      // 1. 检查连接池
      const poolSpinner = ora('检查连接池状态...').start();
      const poolStats = getConnectionPoolStats(sequelize);
      const poolHealth = getConnectionPoolHealth(poolStats);
      poolSpinner.succeed('连接池检查完成');
      
      // 2. 检查索引
      const indexSpinner = ora('分析数据库索引...').start();
      const indexReport = await indexOptimizer.analyzeIndexes(sequelize);
      indexSpinner.succeed('索引分析完成');
      
      // 3. 检查查询性能
      const querySpinner = ora('检查查询性能...').start();
      const queryStats = await dbMonitor.getQueryStats(sequelize);
      querySpinner.succeed('查询性能检查完成');
      
      // 4. 检查事务
      const txSpinner = ora('检查事务状态...').start();
      const txHealth = await transactionMonitor.getTransactionHealth(sequelize);
      txSpinner.succeed('事务检查完成');
      
      // 5. 检查慢查询
      const slowQuerySpinner = ora('分析慢查询...').start();
      const slowQueryStats = await slowQueryAnalyzer.getSlowQueryStats(sequelize);
      slowQuerySpinner.succeed('慢查询分析完成');
      
      // 输出诊断报告
      console.log(chalk.blue('\n=== 数据库健康状况诊断报告 ==='));
      
      // 连接池状态
      console.log(chalk.yellow('\n连接池状态:'));
      console.log(`健康状态: ${poolHealth.status}`);
      console.log(`总连接数: ${poolStats.total}`);
      console.log(`活跃连接: ${poolStats.used}`);
      console.log(`利用率: ${(poolHealth.utilization * 100).toFixed(2)}%`);
      
      if (poolHealth.recommendations.length > 0) {
        console.log(chalk.cyan('建议:'));
        poolHealth.recommendations.forEach(rec => {
          console.log(`- ${rec}`);
        });
      }
      
      // 索引状态
      console.log(chalk.yellow('\n索引状态:'));
      console.log(`总索引数: ${indexReport.totalIndexes}`);
      console.log(`未使用索引: ${indexReport.unusedIndexes}`);
      console.log(`重复索引: ${indexReport.duplicateIndexes}`);
      console.log(`缺失索引: ${indexReport.missingIndexes}`);
      
      if (indexReport.recommendations.length > 0) {
        const highPriorityRecs = indexReport.recommendations.filter(r => r.priority === 'HIGH');
        console.log(chalk.cyan(`高优先级索引建议 (${highPriorityRecs.length}):`));
        highPriorityRecs.slice(0, 3).forEach(rec => {
          console.log(`- ${rec.recommendationType} ${rec.tableName}.${rec.columnName || ''}: ${rec.reason}`);
        });
        if (highPriorityRecs.length > 3) {
          console.log(`... 还有 ${highPriorityRecs.length - 3} 个建议`);
        }
      }
      
      // 查询性能
      console.log(chalk.yellow('\n查询性能:'));
      console.log(`慢查询比例: ${queryStats.totalQueries > 0 ? (queryStats.slowQueries / queryStats.totalQueries * 100).toFixed(2) : 0}%`);
      console.log(`平均查询时间: ${queryStats.averageQueryTime.toFixed(2)}ms`);
      
      // 事务状态
      console.log(chalk.yellow('\n事务状态:'));
      console.log(`健康状态: ${txHealth.status}`);
      
      if (txHealth.issues.length > 0) {
        console.log(chalk.cyan('问题:'));
        txHealth.issues.forEach(issue => {
          console.log(`- ${issue}`);
        });
      }
      
      // 慢查询
      console.log(chalk.yellow('\n慢查询情况:'));
      console.log(`慢查询数量: ${slowQueryStats.slowQueryCount}`);
      console.log(`平均查询时间: ${slowQueryStats.avgQueryTime.toFixed(2)}秒`);
      
      if (slowQueryStats.commonPatterns.length > 0) {
        console.log(chalk.cyan('常见问题:'));
        slowQueryStats.commonPatterns.slice(0, 3).forEach(p => {
          console.log(`- ${p.pattern}: ${p.count} 次`);
        });
      }
      
      // 总体健康状态
      const healthStatus = [
        poolHealth.status,
        txHealth.status,
        indexReport.recommendations.some(r => r.priority === 'HIGH') ? 'warning' : 'healthy',
        queryStats.slowQueries > 5 ? 'warning' : 'healthy',
        slowQueryStats.slowQueryCount > 10 ? 'warning' : 'healthy'
      ];
      
      const overallStatus = healthStatus.includes('critical') ? 'critical' : 
                           healthStatus.includes('warning') ? 'warning' : 'healthy';
      
      console.log(chalk.blue('\n总体健康状态:'), overallStatus === 'healthy' ? 
        chalk.green('健康') : overallStatus === 'warning' ? 
        chalk.yellow('警告') : chalk.red('严重'));
      
      // 输出建议的下一步操作
      console.log(chalk.blue('\n建议的优化步骤:'));
      
      if (indexReport.recommendations.some(r => r.priority === 'HIGH')) {
        console.log('1. 运行 `db-optimizer optimize-indexes` 优化数据库索引');
      }
      
      if (slowQueryStats.slowQueryCount > 0) {
        console.log('2. 运行 `db-optimizer slow-queries --report` 生成详细的慢查询报告');
      }
      
      if (txHealth.status !== 'healthy') {
        console.log('3. 运行 `db-optimizer monitor` 实时监控数据库性能');
      }
      
      if (queryStats.slowQueries > 0) {
        console.log('4. 使用 `db-optimizer analyze-query` 优化频繁执行的慢查询');
      }
    } catch (error) {
      console.error('诊断失败:', error);
      process.exit(1);
    } finally {
      await closeDatabase();
    }
  });

// 处理未知命令
program.on('command:*', () => {
  console.error('无效命令: %s\n使用 --help 查看可用命令', program.args.join(' '));
  process.exit(1);
});

// 当没有提供任何命令时显示帮助
if (process.argv.length <= 2) {
  program.help();
}

// 解析命令行参数
program.parse(process.argv); 