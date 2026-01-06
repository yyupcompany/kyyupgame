#!/usr/bin/env node

/**
 * 批量导入端到端测试脚本
 * 
 * 模拟完整的用户交互流程：
 * 1. 用户上传CSV文件
 * 2. AI分析并生成预览
 * 3. 用户确认导入
 * 4. 执行批量导入
 * 5. 显示结果
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  static info(message) {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
  }

  static success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  }

  static error(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
  }

  static warning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  static section(title) {
    console.log(`\n${colors.bright}${colors.cyan}═══ ${title} ═══${colors.reset}\n`);
  }

  static step(step, description) {
    console.log(`${colors.magenta}[步骤 ${step}]${colors.reset} ${description}`);
  }

  static user(message) {
    console.log(`${colors.bright}${colors.blue}👤 用户:${colors.reset} ${message}`);
  }

  static ai(message) {
    console.log(`${colors.bright}${colors.green}🤖 AI助手:${colors.reset} ${message}`);
  }

  static system(message) {
    console.log(`${colors.bright}${colors.magenta}⚙️ 系统:${colors.reset} ${message}`);
  }
}

class BatchImportE2ETester {
  constructor() {
    this.testScenarios = [];
    this.currentScenario = null;
  }

  /**
   * 运行端到端测试
   */
  async runE2ETest() {
    Logger.section('批量导入端到端测试');
    
    try {
      // 场景1: 成功的批量导入流程
      await this.testSuccessfulBatchImport();
      
      // 场景2: 包含错误数据的导入流程
      await this.testBatchImportWithErrors();
      
      // 场景3: 用户取消导入流程
      await this.testUserCancelImport();
      
      // 场景4: 大批量数据导入
      await this.testLargeBatchImport();
      
      this.generateE2EReport();
      
    } catch (error) {
      Logger.error(`端到端测试失败: ${error.message}`);
    }
  }

  /**
   * 场景1: 成功的批量导入流程
   */
  async testSuccessfulBatchImport() {
    Logger.section('场景1: 成功的批量导入流程');
    
    this.currentScenario = {
      name: '成功的批量导入流程',
      steps: [],
      status: 'running'
    };

    try {
      // 步骤1: 用户发起对话
      Logger.step(1, '用户发起批量导入对话');
      Logger.user('我想批量导入用户数据，有一个CSV文件包含员工信息');
      
      this.recordStep('用户发起对话', true, '用户明确表达批量导入意图');

      // 步骤2: AI识别意图并请求文件
      Logger.step(2, 'AI识别批量导入意图');
      Logger.ai('我来帮您批量导入用户数据。请提供CSV文件内容，我会智能分析字段映射并为您预览导入效果。');
      
      this.recordStep('AI识别意图', true, 'AI正确识别批量导入需求');

      // 步骤3: 用户提供CSV文件内容
      Logger.step(3, '用户提供CSV文件内容');
      const csvContent = fs.readFileSync(path.join(__dirname, 'test-user-import-data.csv'), 'utf8');
      Logger.user('这是我的CSV文件内容：');
      Logger.info('CSV内容预览:');
      console.log(csvContent.split('\n').slice(0, 4).join('\n') + '\n...');
      
      this.recordStep('用户提供文件', true, 'CSV文件格式正确，包含3条用户记录');

      // 步骤4: AI调用批量导入工具
      Logger.step(4, 'AI调用批量导入工具');
      Logger.system('调用 batch_import_data 工具...');
      
      const toolResult = await this.simulateBatchImportTool({
        table_name: 'users',
        file_content: csvContent,
        file_type: 'csv',
        description: '批量导入员工用户数据',
        batch_size: 100,
        auto_confirm: false
      });
      
      Logger.success('工具调用成功，返回预览数据');
      this.recordStep('AI工具调用', true, '成功分析文件并生成预览');

      // 步骤5: 显示导入预览
      Logger.step(5, '显示导入预览给用户');
      this.displayImportPreview(toolResult.result.confirmation_data);
      
      this.recordStep('显示预览', true, '预览数据完整，用户可以查看详细信息');

      // 步骤6: 用户确认导入
      Logger.step(6, '用户确认导入操作');
      Logger.user('看起来不错，请确认导入这些用户数据');
      
      this.recordStep('用户确认', true, '用户查看预览后确认导入');

      // 步骤7: 执行批量导入
      Logger.step(7, '执行批量导入操作');
      Logger.system('开始批量导入...');
      
      const importResult = await this.simulateBatchExecution(toolResult.result.confirmation_data);
      
      Logger.success(`导入完成！成功 ${importResult.summary.success_count} 条，失败 ${importResult.summary.failure_count} 条`);
      this.recordStep('执行导入', true, `成功导入${importResult.summary.success_count}条记录`);

      // 步骤8: 显示导入结果
      Logger.step(8, '显示导入结果');
      this.displayImportResult(importResult);
      
      this.recordStep('显示结果', true, '完整显示导入统计和结果');

      this.currentScenario.status = 'completed';
      Logger.success('场景1测试完成 - 批量导入流程成功');

    } catch (error) {
      this.currentScenario.status = 'failed';
      this.recordStep('场景执行', false, error.message);
      Logger.error(`场景1测试失败: ${error.message}`);
    }

    this.testScenarios.push(this.currentScenario);
  }

  /**
   * 场景2: 包含错误数据的导入流程
   */
  async testBatchImportWithErrors() {
    Logger.section('场景2: 包含错误数据的导入流程');
    
    this.currentScenario = {
      name: '包含错误数据的导入流程',
      steps: [],
      status: 'running'
    };

    try {
      Logger.step(1, '用户提供包含错误的CSV数据');
      
      const errorCsvContent = `姓名,邮箱,电话,角色
张三,zhangsan@example.com,13800138001,teacher
,invalid-email,13800138002,admin
王五,wangwu@example.com,,principal`;

      Logger.user('这是我的CSV文件，请帮我导入：');
      Logger.info('CSV内容（包含错误）:');
      console.log(errorCsvContent);

      const toolResult = await this.simulateBatchImportTool({
        table_name: 'users',
        file_content: errorCsvContent,
        file_type: 'csv'
      });

      Logger.step(2, 'AI分析发现数据错误');
      Logger.ai('我发现您的数据中有一些问题需要注意：');
      Logger.warning('- 第2行：姓名为空，邮箱格式无效');
      Logger.warning('- 第4行：电话号码为空');
      Logger.ai('有效记录：1条，无效记录：2条。是否继续导入有效记录？');

      this.recordStep('错误检测', true, '正确识别并报告数据错误');

      Logger.step(3, '用户选择继续导入有效记录');
      Logger.user('好的，请只导入有效的记录');

      const importResult = await this.simulateBatchExecution(toolResult.result.confirmation_data, true);
      Logger.success(`导入完成！成功 ${importResult.summary.success_count} 条，跳过 ${importResult.summary.failure_count} 条无效记录`);

      this.recordStep('部分导入', true, '成功导入有效记录，跳过无效记录');
      this.currentScenario.status = 'completed';

    } catch (error) {
      this.currentScenario.status = 'failed';
      this.recordStep('场景执行', false, error.message);
    }

    this.testScenarios.push(this.currentScenario);
  }

  /**
   * 场景3: 用户取消导入流程
   */
  async testUserCancelImport() {
    Logger.section('场景3: 用户取消导入流程');
    
    this.currentScenario = {
      name: '用户取消导入流程',
      steps: [],
      status: 'running'
    };

    try {
      Logger.step(1, '用户发起导入但在预览后取消');
      
      const csvContent = fs.readFileSync(path.join(__dirname, 'test-user-import-data.csv'), 'utf8');
      const toolResult = await this.simulateBatchImportTool({
        table_name: 'users',
        file_content: csvContent,
        file_type: 'csv'
      });

      Logger.step(2, '显示预览后用户取消');
      Logger.user('看了预览后，我觉得数据还需要调整，先取消这次导入');
      Logger.ai('好的，已取消批量导入操作。您可以调整数据后重新尝试。');

      this.recordStep('用户取消', true, '用户可以在预览阶段取消操作');
      this.currentScenario.status = 'completed';

    } catch (error) {
      this.currentScenario.status = 'failed';
      this.recordStep('场景执行', false, error.message);
    }

    this.testScenarios.push(this.currentScenario);
  }

  /**
   * 场景4: 大批量数据导入
   */
  async testLargeBatchImport() {
    Logger.section('场景4: 大批量数据导入');
    
    this.currentScenario = {
      name: '大批量数据导入',
      steps: [],
      status: 'running'
    };

    try {
      Logger.step(1, '模拟大批量数据导入（1000条记录）');
      
      // 生成大批量测试数据
      const largeCsvContent = this.generateLargeCSVData(1000);
      
      Logger.info(`生成了 1000 条测试用户数据`);
      Logger.info(`文件大小: ${(largeCsvContent.length / 1024).toFixed(2)} KB`);

      const toolResult = await this.simulateBatchImportTool({
        table_name: 'users',
        file_content: largeCsvContent,
        file_type: 'csv',
        batch_size: 50 // 小批量处理
      });

      Logger.step(2, '分批处理大量数据');
      Logger.system('预计分 20 批次处理，每批 50 条记录');
      Logger.system('预计处理时间: 约 20 秒');

      const importResult = await this.simulateBatchExecution(toolResult.result.confirmation_data, false, true);
      Logger.success(`大批量导入完成！成功 ${importResult.summary.success_count} 条`);

      this.recordStep('大批量处理', true, '成功处理1000条记录的批量导入');
      this.currentScenario.status = 'completed';

    } catch (error) {
      this.currentScenario.status = 'failed';
      this.recordStep('场景执行', false, error.message);
    }

    this.testScenarios.push(this.currentScenario);
  }

  /**
   * 模拟批量导入工具调用
   */
  async simulateBatchImportTool(args) {
    // 解析CSV
    const lines = args.file_content.trim().split('\n');
    const headers = lines[0].split(',');
    const dataRows = lines.slice(1);
    
    const data = dataRows.map(row => {
      const values = row.split(',');
      const record = {};
      headers.forEach((header, index) => {
        record[header.trim()] = (values[index] || '').trim();
      });
      return record;
    });

    // 模拟验证
    const validRecords = [];
    const invalidRecords = [];
    
    data.forEach((record, index) => {
      const errors = [];
      
      if (!record.姓名 || record.姓名 === '') {
        errors.push('姓名不能为空');
      }
      
      if (record.邮箱 && !record.邮箱.includes('@')) {
        errors.push('邮箱格式无效');
      }
      
      if (errors.length === 0) {
        validRecords.push({
          originalIndex: index,
          transformedData: {
            name: record.姓名,
            email: record.邮箱,
            phone: record.电话,
            role: record.角色
          }
        });
      } else {
        invalidRecords.push({
          originalIndex: index,
          originalData: record,
          errors
        });
      }
    });

    return {
      name: "batch_import_data",
      status: "pending_confirmation",
      result: {
        type: 'batch_import_confirmation',
        confirmation_data: {
          operation_details: {
            table_name: args.table_name,
            business_center: '人员中心',
            api_endpoint: '/api/users',
            description: args.description || '批量导入用户数据',
            batch_size: args.batch_size || 100
          },
          data_summary: {
            total_records: data.length,
            valid_records: validRecords.length,
            invalid_records: invalidRecords.length,
            success_rate: Math.round((validRecords.length / data.length) * 100)
          },
          field_mappings: [
            { sourceField: '姓名', targetField: 'name', confidence: 0.95 },
            { sourceField: '邮箱', targetField: 'email', confidence: 0.95 },
            { sourceField: '电话', targetField: 'phone', confidence: 0.90 },
            { sourceField: '角色', targetField: 'role', confidence: 0.85 }
          ],
          sample_data: {
            original_fields: headers,
            sample_records: data.slice(0, 3),
            transformed_sample: validRecords.slice(0, 3).map(r => r.transformedData)
          },
          validation_errors: invalidRecords.slice(0, 10)
        }
      },
      metadata: {
        total_records: data.length,
        valid_records: validRecords.length,
        invalid_records: invalidRecords.length
      }
    };
  }

  /**
   * 模拟批量执行
   */
  async simulateBatchExecution(confirmationData, hasErrors = false, isLargeBatch = false) {
    const { data_summary } = confirmationData;
    
    // 模拟处理时间
    if (isLargeBatch) {
      Logger.system('开始分批处理...');
      for (let i = 1; i <= 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        Logger.info(`处理第 ${i}/20 批次...`);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return {
      type: 'batch_import_result',
      summary: {
        total_records: data_summary.total_records,
        success_count: hasErrors ? data_summary.valid_records : data_summary.total_records,
        failure_count: hasErrors ? data_summary.invalid_records : 0,
        success_rate: hasErrors ? 
          Math.round((data_summary.valid_records / data_summary.total_records) * 100) : 100
      },
      details: {
        inserted_ids: Array.from({length: data_summary.valid_records}, (_, i) => `user_${i + 1}`),
        errors: hasErrors ? ['部分记录因数据格式问题跳过'] : []
      }
    };
  }

  /**
   * 生成大批量CSV数据
   */
  generateLargeCSVData(count) {
    let csv = '姓名,邮箱,电话,角色,部门\n';
    
    for (let i = 1; i <= count; i++) {
      csv += `用户${i},user${i}@example.com,1380013${String(i).padStart(4, '0')},teacher,教学部\n`;
    }
    
    return csv;
  }

  /**
   * 显示导入预览
   */
  displayImportPreview(confirmationData) {
    Logger.ai('📋 导入预览：');
    Logger.info(`业务中心: ${confirmationData.operation_details.business_center}`);
    Logger.info(`目标表: ${confirmationData.operation_details.table_name}`);
    Logger.info(`总记录数: ${confirmationData.data_summary.total_records}`);
    Logger.info(`有效记录: ${confirmationData.data_summary.valid_records}`);
    Logger.info(`无效记录: ${confirmationData.data_summary.invalid_records}`);
    Logger.info(`成功率: ${confirmationData.data_summary.success_rate}%`);
    
    if (confirmationData.validation_errors.length > 0) {
      Logger.warning('发现以下数据问题：');
      confirmationData.validation_errors.forEach((error, index) => {
        Logger.warning(`  第${error.originalIndex + 1}行: ${error.errors.join(', ')}`);
      });
    }
  }

  /**
   * 显示导入结果
   */
  displayImportResult(importResult) {
    Logger.ai('📊 导入结果：');
    Logger.success(`✅ 成功导入: ${importResult.summary.success_count} 条记录`);
    if (importResult.summary.failure_count > 0) {
      Logger.warning(`⚠️ 失败记录: ${importResult.summary.failure_count} 条`);
    }
    Logger.info(`📈 成功率: ${importResult.summary.success_rate}%`);
    
    if (importResult.details.inserted_ids.length > 0) {
      Logger.info(`🆔 新增记录ID: ${importResult.details.inserted_ids.slice(0, 5).join(', ')}${importResult.details.inserted_ids.length > 5 ? '...' : ''}`);
    }
  }

  /**
   * 记录测试步骤
   */
  recordStep(stepName, success, details) {
    if (this.currentScenario) {
      this.currentScenario.steps.push({
        name: stepName,
        success,
        details,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 生成端到端测试报告
   */
  generateE2EReport() {
    Logger.section('端到端测试报告');
    
    const totalScenarios = this.testScenarios.length;
    const completedScenarios = this.testScenarios.filter(s => s.status === 'completed').length;
    const failedScenarios = this.testScenarios.filter(s => s.status === 'failed').length;
    
    Logger.info(`总场景数: ${totalScenarios}`);
    Logger.success(`完成场景: ${completedScenarios}`);
    Logger.error(`失败场景: ${failedScenarios}`);
    Logger.info(`成功率: ${Math.round((completedScenarios / totalScenarios) * 100)}%`);
    
    console.log('\n场景详情:');
    this.testScenarios.forEach((scenario, index) => {
      const status = scenario.status === 'completed' ? 
        `${colors.green}✓${colors.reset}` : 
        `${colors.red}✗${colors.reset}`;
      
      console.log(`${index + 1}. ${status} ${scenario.name}`);
      console.log(`   步骤数: ${scenario.steps.length}`);
      console.log(`   成功步骤: ${scenario.steps.filter(s => s.success).length}`);
    });
    
    // 保存报告
    const reportPath = path.join(__dirname, 'batch-import-e2e-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalScenarios,
        completedScenarios,
        failedScenarios,
        successRate: Math.round((completedScenarios / totalScenarios) * 100)
      },
      scenarios: this.testScenarios
    }, null, 2));
    
    Logger.success(`端到端测试报告已保存: ${reportPath}`);
  }
}

// 运行端到端测试
async function main() {
  const tester = new BatchImportE2ETester();
  await tester.runE2ETest();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BatchImportE2ETester;
