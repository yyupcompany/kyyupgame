#!/usr/bin/env node

/**
 * 硬编码数据检测脚本
 * 用于识别Vue组件中的硬编码数据模式
 */

const fs = require('fs');
const path = require('path');

class HardcodedDataFinder {
  constructor(srcDir = 'client/src') {
    this.srcDir = srcDir;
    this.issues = [];
  }

  /**
   * 递归获取所有Vue文件
   */
  getAllVueFiles(dir) {
    const files = [];

    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory() && !item.name.startsWith('.')) {
          files.push(...this.getAllVueFiles(fullPath));
        } else if (item.name.endsWith('.vue')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`读取目录失败: ${dir}`, error.message);
    }

    return files;
  }

  /**
   * 检查硬编码数据模式
   */
  checkHardcodedPatterns(content, filePath) {
    const lines = content.split('\n');
    const relativePath = path.relative(this.srcDir, filePath);

    // 检测硬编码表格数据
    const tableDataPattern = /:(?:data|table-data)\s*=\s*["'][^"']*["']/g;
    let match;
    while ((match = tableDataPattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1];

      // 排除合理的绑定
      if (!/\w+Data|form\.\w+|props\.\w+/.test(line)) {
        this.addIssue({
          type: 'hardcoded_table_data',
          file: relativePath,
          line: lineNumber,
          content: line.trim(),
          severity: 'high'
        });
      }
    }

    // 检测静态数组
    const staticArrayPattern = /const\s+(\w+)\s*=\s*\[.*?\{.*?id.*?\}.*?\]/gs;
    while ((match = staticArrayPattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1];

      // 排除配置数据
      if (!/config|routes|columns|fields|meta/i.test(line)) {
        this.addIssue({
          type: 'static_array_data',
          file: relativePath,
          line: lineNumber,
          content: line.trim(),
          severity: 'medium'
        });
      }
    }

    // 检测硬编码选项数据
    const optionsPattern = /options.*=\s*\[.*\{.*label.*:.*value.*:/g;
    while ((match = optionsPattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1];

      // 排除合理的选择器选项
      if (!/(gender|status|type|yes|no|true|false)/i.test(line)) {
        this.addIssue({
          type: 'hardcoded_options',
          file: relativePath,
          line: lineNumber,
          content: line.trim(),
          severity: 'medium'
        });
      }
    }

    // 检测硬编码统计数据
    const statsPattern = /const\s+(stats|data|metrics)\s*=\s*\{.*total.*:/g;
    while ((match = statsPattern.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1];

      // 排除默认配置
      if (!/default|initial/i.test(line)) {
        this.addIssue({
          type: 'hardcoded_stats',
          file: relativePath,
          line: lineNumber,
          content: line.trim(),
          severity: 'high'
        });
      }
    }
  }

  /**
   * 检查API调用情况
   */
  checkApiUsage(content, filePath) {
    const lines = content.split('\n');
    const relativePath = path.relative(this.srcDir, filePath);

    // 检查是否有数据但没有API调用
    const hasStaticData = /(?:const|let|var)\s+\w+Data\s*=\s*\[/.test(content);
    const hasApiCall = /request\.|api\.|fetch\(|axios\./.test(content);

    if (hasStaticData && !hasApiCall) {
      this.addIssue({
        type: 'data_without_api',
        file: relativePath,
        line: 1,
        content: '发现静态数据但没有API调用',
        severity: 'high'
      });
    }

    // 检查表格组件缺少加载状态
    if (content.includes('<el-table') && !content.includes('v-loading')) {
      const lineNumber = content.split('\n').findIndex(line => line.includes('<el-table')) + 1;
      this.addIssue({
        type: 'table_without_loading',
        file: relativePath,
        line: lineNumber,
        content: '表格组件缺少加载状态',
        severity: 'medium'
      });
    }

    // 检查缺少错误处理
    if (content.includes('request.') && !content.includes('catch') && !content.includes('try')) {
      this.addIssue({
        type: 'api_without_error_handling',
        file: relativePath,
        line: 1,
        content: 'API调用缺少错误处理',
        severity: 'high'
      });
    }
  }

  /**
   * 添加问题
   */
  addIssue(issue) {
    this.issues.push(issue);
  }

  /**
   * 运行检测
   */
  run() {
    console.log('🔍 开始扫描硬编码数据...\n');

    const vueFiles = this.getAllVueFiles(this.srcDir);

    console.log(`📁 扫描 ${vueFiles.length} 个Vue文件\n`);

    for (const filePath of vueFiles) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        this.checkHardcodedPatterns(content, filePath);
        this.checkApiUsage(content, filePath);
      } catch (error) {
        console.error(`❌ 读取文件失败: ${filePath}`, error.message);
      }
    }

    this.report();
  }

  /**
   * 生成报告
   */
  report() {
    console.log('\n📊 硬编码数据检测报告');
    console.log('='.repeat(50));

    // 按严重程度分组
    const issuesBySeverity = {
      high: this.issues.filter(issue => issue.severity === 'high'),
      medium: this.issues.filter(issue => issue.severity === 'medium'),
      low: this.issues.filter(issue => issue.severity === 'low')
    };

    // 高危问题
    if (issuesBySeverity.high.length > 0) {
      console.log('\n🚨 高危问题 (需要立即修复)');
      console.log('-'.repeat(30));

      issuesBySeverity.high.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.file}:${issue.line}`);
        console.log(`   类型: ${this.getTypeLabel(issue.type)}`);
        console.log(`   代码: ${issue.content}`);
        console.log('');
      });
    }

    // 中危问题
    if (issuesBySeverity.medium.length > 0) {
      console.log('⚠️  中危问题 (建议修复)');
      console.log('-'.repeat(30));

      issuesBySeverity.medium.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.file}:${issue.line}`);
        console.log(`   类型: ${this.getTypeLabel(issue.type)}`);
        console.log(`   代码: ${issue.content}`);
        console.log('');
      });
    }

    // 统计信息
    console.log('📈 统计信息');
    console.log('-'.repeat(30));
    console.log(`总问题数: ${this.issues.length}`);
    console.log(`高危问题: ${issuesBySeverity.high.length}`);
    console.log(`中危问题: ${issuesBySeverity.medium.length}`);
    console.log(`低危问题: ${issuesBySeverity.low.length}`);

    // 按类型统计
    const issuesByType = {};
    this.issues.forEach(issue => {
      issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
    });

    console.log('\n📋 问题类型分布');
    console.log('-'.repeat(30));
    Object.entries(issuesByType).forEach(([type, count]) => {
      console.log(`${this.getTypeLabel(type)}: ${count}`);
    });

    // 生成修复建议
    this.generateFixSuggestions();
  }

  /**
   * 获取类型标签
   */
  getTypeLabel(type) {
    const labels = {
      'hardcoded_table_data': '硬编码表格数据',
      'static_array_data': '静态数组数据',
      'hardcoded_options': '硬编码选项数据',
      'hardcoded_stats': '硬编码统计数据',
      'data_without_api': '数据无API调用',
      'table_without_loading': '表格无加载状态',
      'api_without_error_handling': 'API无错误处理'
    };
    return labels[type] || type;
  }

  /**
   * 生成修复建议
   */
  generateFixSuggestions() {
    console.log('\n🔧 修复建议');
    console.log('-'.repeat(30));

    console.log('1. 优先修复高危问题：');
    console.log('   - 使用 useApiData composable 替换硬编码数据');
    console.log('   - 为表格添加加载状态和错误处理');
    console.log('   - 为API调用添加 try-catch 错误处理');

    console.log('\n2. 标准化数据获取流程：');
    console.log('   - 使用统一的 API 响应格式');
    console.log('   - 实现加载状态管理');
    console.log('   - 添加重试机制');

    console.log('\n3. 改进用户体验：');
    console.log('   - 显示友好的错误信息');
    console.log('   - 添加空数据状态显示');
    console.log('   - 实现数据刷新功能');

    console.log('\n📚 参考文档：');
    console.log('   - 硬编码数据修复方案.md');
    console.log('   - 测试盲区诊断报告.md');
  }
}

// 运行脚本
if (require.main === module) {
  const finder = new HardcodedDataFinder();
  finder.run();
}

module.exports = HardcodedDataFinder;