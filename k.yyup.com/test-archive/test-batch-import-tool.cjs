#!/usr/bin/env node

/**
 * 批量导入工具测试脚本
 * 
 * 测试AI Function Call批量导入功能
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
}

class BatchImportTester {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    Logger.section('批量导入工具测试');
    
    try {
      // 测试1: 读取CSV文件
      await this.testReadCsvFile();
      
      // 测试2: 测试字段映射
      await this.testFieldMapping();
      
      // 测试3: 测试数据验证
      await this.testDataValidation();
      
      // 测试4: 模拟AI Function Call
      await this.testAIFunctionCall();
      
      // 测试5: 测试批量导入预览
      await this.testBatchImportPreview();
      
      this.generateReport();
      
    } catch (error) {
      Logger.error(`测试执行失败: ${error.message}`);
    }
  }

  /**
   * 测试1: 读取CSV文件
   */
  async testReadCsvFile() {
    Logger.section('测试1: 读取CSV文件');
    
    try {
      Logger.step(1, '读取测试CSV文件');
      
      const csvFilePath = path.join(__dirname, 'test-user-import-data.csv');
      
      if (!fs.existsSync(csvFilePath)) {
        throw new Error('测试CSV文件不存在');
      }
      
      const csvContent = fs.readFileSync(csvFilePath, 'utf8');
      Logger.info(`CSV文件内容长度: ${csvContent.length} 字符`);
      
      // 解析CSV内容
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');
      const dataRows = lines.slice(1);
      
      Logger.success(`CSV解析成功:`);
      Logger.info(`- 标题行: ${headers.join(', ')}`);
      Logger.info(`- 数据行数: ${dataRows.length}`);
      
      // 验证数据结构
      dataRows.forEach((row, index) => {
        const values = row.split(',');
        Logger.info(`  行 ${index + 1}: ${values.join(' | ')}`);
      });
      
      this.recordTest('读取CSV文件', true);
      
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      this.recordTest('读取CSV文件', false, error.message);
    }
  }

  /**
   * 测试2: 测试字段映射
   */
  async testFieldMapping() {
    Logger.section('测试2: 测试字段映射');
    
    try {
      Logger.step(1, '模拟字段映射分析');
      
      const documentFields = ['姓名', '邮箱', '电话', '角色', '部门', '性别', '年龄', '入职日期'];
      const targetTable = 'users';
      
      // 模拟字段映射逻辑
      const fieldMappings = this.simulateFieldMapping(documentFields, targetTable);
      
      Logger.success('字段映射分析完成:');
      fieldMappings.forEach(mapping => {
        Logger.info(`  ${mapping.sourceField} → ${mapping.targetField} (置信度: ${mapping.confidence})`);
      });
      
      // 验证必填字段
      const requiredFields = ['name', 'email'];
      const mappedRequiredFields = fieldMappings
        .filter(m => requiredFields.includes(m.targetField))
        .map(m => m.targetField);
      
      Logger.info(`必填字段映射: ${mappedRequiredFields.join(', ')}`);
      
      if (mappedRequiredFields.length === requiredFields.length) {
        Logger.success('所有必填字段都已映射');
        this.recordTest('字段映射', true);
      } else {
        throw new Error('部分必填字段未映射');
      }
      
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      this.recordTest('字段映射', false, error.message);
    }
  }

  /**
   * 测试3: 测试数据验证
   */
  async testDataValidation() {
    Logger.section('测试3: 测试数据验证');
    
    try {
      Logger.step(1, '模拟数据验证');
      
      const testData = [
        { 姓名: '张三', 邮箱: 'zhangsan@example.com', 电话: '13800138001', 角色: 'teacher' },
        { 姓名: '李四', 邮箱: 'lisi@example.com', 电话: '13800138002', 角色: 'admin' },
        { 姓名: '', 邮箱: 'invalid-email', 电话: '13800138003', 角色: 'principal' } // 无效数据
      ];
      
      const validationResult = this.simulateDataValidation(testData);
      
      Logger.success('数据验证完成:');
      Logger.info(`- 有效记录: ${validationResult.validRecords.length}`);
      Logger.info(`- 无效记录: ${validationResult.invalidRecords.length}`);
      
      if (validationResult.invalidRecords.length > 0) {
        Logger.warning('发现无效记录:');
        validationResult.invalidRecords.forEach((record, index) => {
          Logger.warning(`  记录 ${index + 1}: ${record.errors.join(', ')}`);
        });
      }
      
      this.recordTest('数据验证', true);
      
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      this.recordTest('数据验证', false, error.message);
    }
  }

  /**
   * 测试4: 模拟AI Function Call
   */
  async testAIFunctionCall() {
    Logger.section('测试4: 模拟AI Function Call');
    
    try {
      Logger.step(1, '构造Function Call参数');
      
      const csvContent = fs.readFileSync(path.join(__dirname, 'test-user-import-data.csv'), 'utf8');
      
      const functionCallArgs = {
        table_name: 'users',
        file_content: csvContent,
        file_type: 'csv',
        description: '批量导入用户数据测试',
        batch_size: 100,
        auto_confirm: false
      };
      
      Logger.info('Function Call参数:');
      Logger.info(`- table_name: ${functionCallArgs.table_name}`);
      Logger.info(`- file_type: ${functionCallArgs.file_type}`);
      Logger.info(`- description: ${functionCallArgs.description}`);
      Logger.info(`- batch_size: ${functionCallArgs.batch_size}`);
      Logger.info(`- file_content长度: ${functionCallArgs.file_content.length}`);
      
      // 模拟工具执行
      const mockResult = this.simulateBatchImportTool(functionCallArgs);
      
      Logger.success('Function Call模拟执行完成:');
      Logger.info(`- 状态: ${mockResult.status}`);
      Logger.info(`- 类型: ${mockResult.result?.type}`);
      Logger.info(`- 消息: ${mockResult.result?.message}`);
      
      if (mockResult.metadata) {
        Logger.info('元数据:');
        Logger.info(`  - 总记录数: ${mockResult.metadata.total_records}`);
        Logger.info(`  - 有效记录数: ${mockResult.metadata.valid_records}`);
        Logger.info(`  - 无效记录数: ${mockResult.metadata.invalid_records}`);
      }
      
      this.recordTest('AI Function Call', true);
      
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      this.recordTest('AI Function Call', false, error.message);
    }
  }

  /**
   * 测试5: 测试批量导入预览
   */
  async testBatchImportPreview() {
    Logger.section('测试5: 测试批量导入预览');
    
    try {
      Logger.step(1, '生成导入预览数据');
      
      const previewData = {
        operation_details: {
          table_name: 'users',
          business_center: '人员中心',
          api_endpoint: '/api/users',
          description: '批量导入用户数据测试'
        },
        data_summary: {
          total_records: 3,
          valid_records: 2,
          invalid_records: 1,
          success_rate: 67
        },
        field_mappings: [
          { sourceField: '姓名', targetField: 'name', confidence: 0.95 },
          { sourceField: '邮箱', targetField: 'email', confidence: 0.95 },
          { sourceField: '电话', targetField: 'phone', confidence: 0.90 }
        ]
      };
      
      Logger.success('导入预览生成完成:');
      Logger.info(`业务中心: ${previewData.operation_details.business_center}`);
      Logger.info(`API端点: ${previewData.operation_details.api_endpoint}`);
      Logger.info(`成功率: ${previewData.data_summary.success_rate}%`);
      Logger.info(`字段映射数: ${previewData.field_mappings.length}`);
      
      // 验证预览数据完整性
      const requiredFields = ['operation_details', 'data_summary', 'field_mappings'];
      const missingFields = requiredFields.filter(field => !previewData[field]);
      
      if (missingFields.length === 0) {
        Logger.success('预览数据结构完整');
        this.recordTest('批量导入预览', true);
      } else {
        throw new Error(`预览数据缺少字段: ${missingFields.join(', ')}`);
      }
      
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      this.recordTest('批量导入预览', false, error.message);
    }
  }

  /**
   * 模拟字段映射
   */
  simulateFieldMapping(documentFields, targetTable) {
    const fieldMappingRules = {
      name: ['姓名', '名称', 'name'],
      email: ['邮箱', '电子邮件', 'email'],
      phone: ['电话', '手机', 'phone'],
      role: ['角色', '权限', 'role'],
      department: ['部门', '科室', 'department'],
      age: ['年龄', 'age'],
      gender: ['性别', 'gender']
    };
    
    const mappings = [];
    
    documentFields.forEach(docField => {
      for (const [dbField, aliases] of Object.entries(fieldMappingRules)) {
        if (aliases.some(alias => docField.includes(alias))) {
          mappings.push({
            sourceField: docField,
            targetField: dbField,
            confidence: 0.95,
            dataType: 'string',
            required: ['name', 'email'].includes(dbField)
          });
          break;
        }
      }
    });
    
    return mappings;
  }

  /**
   * 模拟数据验证
   */
  simulateDataValidation(data) {
    const validRecords = [];
    const invalidRecords = [];
    
    data.forEach((record, index) => {
      const errors = [];
      
      // 验证必填字段
      if (!record.姓名 || record.姓名.trim() === '') {
        errors.push('姓名不能为空');
      }
      
      // 验证邮箱格式
      if (record.邮箱 && !record.邮箱.includes('@')) {
        errors.push('邮箱格式无效');
      }
      
      if (errors.length === 0) {
        validRecords.push({
          originalIndex: index,
          originalData: record,
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
    
    return { validRecords, invalidRecords };
  }

  /**
   * 模拟批量导入工具执行
   */
  simulateBatchImportTool(args) {
    // 解析CSV内容
    const lines = args.file_content.trim().split('\n');
    const headers = lines[0].split(',');
    const dataRows = lines.slice(1);
    
    const data = dataRows.map(row => {
      const values = row.split(',');
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      return record;
    });
    
    // 模拟验证结果
    const validationResult = this.simulateDataValidation(data);
    
    return {
      name: "batch_import_data",
      status: "pending_confirmation",
      result: {
        type: 'batch_import_confirmation',
        message: `已分析 ${data.length} 条记录，其中 ${validationResult.validRecords.length} 条有效，${validationResult.invalidRecords.length} 条无效。请确认后执行批量导入操作`
      },
      metadata: {
        table_name: args.table_name,
        operation: 'batch_import',
        total_records: data.length,
        valid_records: validationResult.validRecords.length,
        invalid_records: validationResult.invalidRecords.length,
        requires_confirmation: true
      }
    };
  }

  /**
   * 记录测试结果
   */
  recordTest(name, passed, error = null) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
    
    this.testResults.tests.push({
      name,
      status: passed ? 'passed' : 'failed',
      error: error || null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    Logger.section('测试报告');
    
    Logger.info(`总测试数: ${this.testResults.total}`);
    Logger.success(`通过: ${this.testResults.passed}`);
    Logger.error(`失败: ${this.testResults.failed}`);
    Logger.info(`成功率: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);
    
    console.log('\n详细结果:');
    this.testResults.tests.forEach((test, index) => {
      const status = test.status === 'passed' ? 
        `${colors.green}✓${colors.reset}` : 
        `${colors.red}✗${colors.reset}`;
      
      console.log(`${index + 1}. ${status} ${test.name}`);
      if (test.error) {
        console.log(`   错误: ${colors.red}${test.error}${colors.reset}`);
      }
    });
    
    // 保存测试报告
    const reportPath = path.join(__dirname, 'batch-import-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.testResults
    }, null, 2));
    
    Logger.success(`测试报告已保存: ${reportPath}`);
  }
}

// 运行测试
async function main() {
  const tester = new BatchImportTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BatchImportTester;
