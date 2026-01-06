#!/usr/bin/env node

/**
 * 清理遗留测试目录
 * 在确认测试文件已经整合后，清理旧的测试目录
 */

const fs = require('fs');
const path = require('path');

class LegacyTestCleaner {
  constructor() {
    this.legacyDirectories = [
      './client/全站评测目录',
      './client/src/tests',
      './client/tests' // 可选，如果要完全迁移到tests/frontend
    ];
    this.backupDirectory = './test-backups';
    this.cleanupReport = {
      timestamp: new Date().toISOString(),
      cleaned: [],
      backed_up: [],
      errors: []
    };
  }

  /**
   * 执行清理
   */
  async cleanup() {
    console.log('🧹 开始清理遗留测试目录...\n');

    try {
      // 1. 创建备份目录
      await this.createBackupDirectory();

      // 2. 确认整合状态
      await this.verifyIntegration();

      // 3. 备份重要文件
      await this.backupImportantFiles();

      // 4. 清理目录
      await this.cleanDirectories();

      // 5. 生成报告
      await this.generateReport();

      console.log('✅ 清理完成！');

    } catch (error) {
      console.error('❌ 清理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 创建备份目录
   */
  async createBackupDirectory() {
    console.log('📁 创建备份目录...');

    if (!fs.existsSync(this.backupDirectory)) {
      fs.mkdirSync(this.backupDirectory, { recursive: true });
      console.log(`  ✅ 创建备份目录: ${this.backupDirectory}`);
    } else {
      console.log(`  ✅ 备份目录已存在: ${this.backupDirectory}`);
    }

    console.log('');
  }

  /**
   * 验证整合状态
   */
  async verifyIntegration() {
    console.log('🔍 验证测试整合状态...');

    // 检查新的测试目录
    const frontendTestDir = './tests/frontend';
    if (!fs.existsSync(frontendTestDir)) {
      throw new Error('前端测试目录不存在，请先完成测试整合');
    }

    // 统计新目录中的测试文件
    const newTestFiles = this.countTestFiles(frontendTestDir);
    console.log(`  ✅ 新测试目录包含 ${newTestFiles} 个测试文件`);

    // 统计旧目录中的测试文件
    let oldTestFiles = 0;
    this.legacyDirectories.forEach(dir => {
      if (fs.existsSync(dir)) {
        const count = this.countTestFiles(dir);
        oldTestFiles += count;
        console.log(`  📊 ${dir}: ${count} 个测试文件`);
      }
    });

    console.log(`  📊 旧目录总计: ${oldTestFiles} 个测试文件`);

    if (newTestFiles < oldTestFiles * 0.8) {
      console.warn('⚠️ 警告: 新目录的测试文件数量明显少于旧目录，请确认整合是否完整');
    } else {
      console.log('  ✅ 测试文件整合验证通过');
    }

    console.log('');
  }

  /**
   * 统计测试文件数量
   */
  countTestFiles(dir) {
    let count = 0;
    
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
          count += this.countTestFiles(fullPath);
        } else if (stat.isFile() && this.isTestFile(item)) {
          count++;
        }
      });
    } catch (error) {
      // 忽略访问错误
    }

    return count;
  }

  /**
   * 判断是否应该跳过目录
   */
  shouldSkipDirectory(dirname) {
    const skipDirs = ['node_modules', '.git', 'dist', 'coverage', 'build'];
    return skipDirs.includes(dirname);
  }

  /**
   * 判断是否为测试文件
   */
  isTestFile(filename) {
    const testPatterns = [
      /\.test\.(js|ts|vue)$/,
      /\.spec\.(js|ts|vue)$/,
      /\.e2e\.(js|ts)$/
    ];
    return testPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * 备份重要文件
   */
  async backupImportantFiles() {
    console.log('💾 备份重要文件...');

    const importantFiles = [
      './client/全站评测目录/README.md',
      './client/全站评测目录/FINAL-COMPREHENSIVE-TEST-REPORT.md',
      './client/全站评测目录/COMPREHENSIVE-100-COVERAGE-TEST-REPORT.md',
      './client/全站评测目录/AI助手测试报告.md'
    ];

    importantFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const filename = path.basename(file);
        const backupPath = path.join(this.backupDirectory, filename);
        
        try {
          fs.copyFileSync(file, backupPath);
          this.cleanupReport.backed_up.push({
            source: file,
            backup: backupPath
          });
          console.log(`  ✅ 备份: ${file} → ${backupPath}`);
        } catch (error) {
          this.cleanupReport.errors.push({
            file: file,
            error: error.message,
            action: 'backup'
          });
          console.log(`  ❌ 备份失败: ${file} - ${error.message}`);
        }
      }
    });

    console.log('');
  }

  /**
   * 清理目录
   */
  async cleanDirectories() {
    console.log('🗑️ 清理遗留目录...');

    // 只清理全站评测目录，保留其他目录以防万一
    const directoriesToClean = [
      './client/全站评测目录'
    ];

    directoriesToClean.forEach(dir => {
      if (fs.existsSync(dir)) {
        try {
          this.removeDirectory(dir);
          this.cleanupReport.cleaned.push({
            directory: dir,
            status: 'success'
          });
          console.log(`  ✅ 已清理: ${dir}`);
        } catch (error) {
          this.cleanupReport.errors.push({
            directory: dir,
            error: error.message,
            action: 'cleanup'
          });
          console.log(`  ❌ 清理失败: ${dir} - ${error.message}`);
        }
      } else {
        console.log(`  ⚠️ 目录不存在: ${dir}`);
      }
    });

    console.log('');
  }

  /**
   * 递归删除目录
   */
  removeDirectory(dir) {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach(file => {
        const curPath = path.join(dir, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          this.removeDirectory(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(dir);
    }
  }

  /**
   * 生成清理报告
   */
  async generateReport() {
    console.log('📊 生成清理报告...');

    const reportPath = './test-results/legacy-test-cleanup-report.json';
    
    // 确保目录存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(this.cleanupReport, null, 2));

    // 生成HTML报告
    await this.generateHtmlReport();

    console.log(`✅ 清理报告已保存: ${reportPath}`);

    // 显示摘要
    console.log('\n📋 清理摘要:');
    console.log(`  清理目录: ${this.cleanupReport.cleaned.length}`);
    console.log(`  备份文件: ${this.cleanupReport.backed_up.length}`);
    console.log(`  错误数量: ${this.cleanupReport.errors.length}`);

    if (this.cleanupReport.errors.length > 0) {
      console.log('\n❌ 清理错误:');
      this.cleanupReport.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.file || error.directory}: ${error.error}`);
      });
    }

    console.log('\n💡 建议:');
    console.log('  - 备份文件保存在 test-backups/ 目录中');
    console.log('  - 如需恢复，可以从备份目录中找到重要文件');
    console.log('  - 新的测试文件位于 tests/frontend/ 目录中');
  }

  /**
   * 生成HTML报告
   */
  async generateHtmlReport() {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>遗留测试清理报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        .file-list { background: #f8f8f8; padding: 10px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>遗留测试清理报告</h1>
    <div class="summary">
        <h2>清理摘要</h2>
        <p>清理时间: ${this.cleanupReport.timestamp}</p>
        <p>清理目录: ${this.cleanupReport.cleaned.length}</p>
        <p>备份文件: ${this.cleanupReport.backed_up.length}</p>
        <p>错误数量: ${this.cleanupReport.errors.length}</p>
    </div>
    
    <div class="section">
        <h2>已清理的目录</h2>
        <div class="file-list">
            ${this.cleanupReport.cleaned.map(item => `
                <div class="success">✅ ${item.directory}</div>
            `).join('')}
        </div>
    </div>
    
    <div class="section">
        <h2>备份的文件</h2>
        <div class="file-list">
            ${this.cleanupReport.backed_up.map(item => `
                <div class="success">💾 ${item.source} → ${item.backup}</div>
            `).join('')}
        </div>
    </div>
    
    ${this.cleanupReport.errors.length > 0 ? `
    <div class="section">
        <h2>清理错误</h2>
        <div class="file-list">
            ${this.cleanupReport.errors.map(item => `
                <div class="error">❌ ${item.file || item.directory}: ${item.error}</div>
            `).join('')}
        </div>
    </div>
    ` : ''}
    
    <div class="section">
        <h2>后续建议</h2>
        <ul>
            <li>备份文件保存在 test-backups/ 目录中</li>
            <li>如需恢复，可以从备份目录中找到重要文件</li>
            <li>新的测试文件位于 tests/frontend/ 目录中</li>
            <li>可以安全地删除 test-backups/ 目录（如果确认不再需要）</li>
        </ul>
    </div>
</body>
</html>`;

    const htmlPath = './test-results/legacy-test-cleanup-report.html';
    fs.writeFileSync(htmlPath, html);
  }
}

// 运行清理
if (require.main === module) {
  const cleaner = new LegacyTestCleaner();
  cleaner.cleanup().catch(error => {
    console.error('清理器失败:', error);
    process.exit(1);
  });
}

module.exports = LegacyTestCleaner;
