#!/usr/bin/env node

/**
 * 前端测试整合器
 * 将所有前端测试用例去重后合并到 tests 目录
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FrontendTestConsolidator {
  constructor() {
    this.sourceDirectories = [
      './client/tests',
      './client/src/tests', 
      './client/全站评测目录'
    ];
    this.targetDirectory = './tests/frontend';
    this.duplicates = [];
    this.moved = [];
    this.skipped = [];
  }

  /**
   * 执行整合
   */
  async consolidate() {
    console.log('🔄 开始前端测试整合...\n');

    try {
      // 1. 创建目标目录
      await this.createTargetDirectory();

      // 2. 扫描所有测试文件
      const testFiles = await this.scanTestFiles();

      // 3. 分析重复文件
      const fileGroups = await this.analyzeFiles(testFiles);

      // 4. 执行去重和移动
      await this.consolidateFiles(fileGroups);

      // 5. 生成报告
      await this.generateReport();

      console.log('✅ 前端测试整合完成！');

    } catch (error) {
      console.error('❌ 整合失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 创建目标目录结构
   */
  async createTargetDirectory() {
    console.log('📁 创建目标目录结构...');

    const directories = [
      this.targetDirectory,
      `${this.targetDirectory}/unit`,
      `${this.targetDirectory}/integration`, 
      `${this.targetDirectory}/e2e`,
      `${this.targetDirectory}/components`,
      `${this.targetDirectory}/pages`,
      `${this.targetDirectory}/api`,
      `${this.targetDirectory}/utils`
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  ✅ 创建: ${dir}`);
      }
    });

    console.log('');
  }

  /**
   * 扫描所有测试文件
   */
  async scanTestFiles() {
    console.log('🔍 扫描测试文件...');

    const testFiles = [];

    this.sourceDirectories.forEach(sourceDir => {
      if (fs.existsSync(sourceDir)) {
        console.log(`  📂 扫描: ${sourceDir}`);
        const files = this.scanDirectory(sourceDir);
        testFiles.push(...files);
        console.log(`    发现 ${files.length} 个测试文件`);
      } else {
        console.log(`  ⚠️ 目录不存在: ${sourceDir}`);
      }
    });

    console.log(`📊 总计发现 ${testFiles.length} 个测试文件\n`);
    return testFiles;
  }

  /**
   * 递归扫描目录
   */
  scanDirectory(dir) {
    const files = [];

    try {
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
          files.push(...this.scanDirectory(fullPath));
        } else if (stat.isFile() && this.isTestFile(item)) {
          files.push({
            path: fullPath,
            name: item,
            basename: this.getBaseName(item),
            mtime: stat.mtime,
            size: stat.size,
            sourceDir: this.getSourceDir(fullPath)
          });
        }
      });
    } catch (error) {
      console.warn(`扫描目录失败: ${dir} - ${error.message}`);
    }

    return files;
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
   * 获取文件基础名称（用于去重比较）
   */
  getBaseName(filename) {
    return filename
      .replace(/\.(test|spec|e2e)\.(js|ts|vue)$/, '')
      .toLowerCase();
  }

  /**
   * 获取源目录
   */
  getSourceDir(filepath) {
    if (filepath.includes('/client/tests/')) return 'client/tests';
    if (filepath.includes('/client/src/tests/')) return 'client/src/tests';
    if (filepath.includes('/client/全站评测目录/')) return 'client/全站评测目录';
    return 'unknown';
  }

  /**
   * 分析文件，识别重复
   */
  async analyzeFiles(testFiles) {
    console.log('🔍 分析文件重复...');

    const fileGroups = new Map();

    // 按基础名称分组
    testFiles.forEach(file => {
      const key = file.basename;
      if (!fileGroups.has(key)) {
        fileGroups.set(key, []);
      }
      fileGroups.get(key).push(file);
    });

    // 统计重复情况
    let duplicateGroups = 0;
    let totalDuplicates = 0;

    fileGroups.forEach((files, basename) => {
      if (files.length > 1) {
        duplicateGroups++;
        totalDuplicates += files.length - 1;
        console.log(`  🔄 重复文件组: ${basename} (${files.length}个文件)`);
        files.forEach(file => {
          console.log(`    - ${file.path} (${file.mtime.toISOString()})`);
        });
      }
    });

    console.log(`📊 发现 ${duplicateGroups} 个重复文件组，${totalDuplicates} 个重复文件\n`);
    return fileGroups;
  }

  /**
   * 整合文件
   */
  async consolidateFiles(fileGroups) {
    console.log('📦 开始整合文件...');

    fileGroups.forEach((files, basename) => {
      if (files.length === 1) {
        // 单个文件，直接移动
        this.moveFile(files[0]);
      } else {
        // 多个文件，保留最新的
        const latest = files.reduce((prev, current) => 
          current.mtime > prev.mtime ? current : prev
        );
        
        this.moveFile(latest);
        
        // 记录重复文件
        files.forEach(file => {
          if (file !== latest) {
            this.duplicates.push({
              kept: latest.path,
              removed: file.path,
              reason: `保留更新的文件 (${latest.mtime.toISOString()} > ${file.mtime.toISOString()})`
            });
          }
        });
      }
    });

    console.log(`✅ 移动了 ${this.moved.length} 个文件`);
    console.log(`🗑️ 去重了 ${this.duplicates.length} 个文件\n`);
  }

  /**
   * 移动单个文件
   */
  moveFile(file) {
    try {
      // 确定目标路径
      const targetPath = this.getTargetPath(file);
      
      // 确保目标目录存在
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // 复制文件（而不是移动，保留原文件作为备份）
      fs.copyFileSync(file.path, targetPath);
      
      this.moved.push({
        source: file.path,
        target: targetPath,
        type: this.getTestType(file.path)
      });

      console.log(`  📄 ${file.path} → ${targetPath}`);

    } catch (error) {
      console.error(`移动文件失败: ${file.path} - ${error.message}`);
      this.skipped.push({
        file: file.path,
        reason: error.message
      });
    }
  }

  /**
   * 确定目标路径
   */
  getTargetPath(file) {
    const testType = this.getTestType(file.path);
    let subDir = '';

    // 根据文件路径和类型确定子目录
    if (file.path.includes('/api/')) {
      subDir = 'api';
    } else if (file.path.includes('/components/')) {
      subDir = 'components';
    } else if (file.path.includes('/pages/')) {
      subDir = 'pages';
    } else if (file.path.includes('/utils/')) {
      subDir = 'utils';
    } else {
      subDir = testType;
    }

    return path.join(this.targetDirectory, subDir, file.name);
  }

  /**
   * 获取测试类型
   */
  getTestType(filepath) {
    if (filepath.includes('.e2e.') || filepath.includes('/e2e/')) {
      return 'e2e';
    } else if (filepath.includes('/integration/')) {
      return 'integration';
    } else {
      return 'unit';
    }
  }

  /**
   * 生成整合报告
   */
  async generateReport() {
    console.log('📊 生成整合报告...');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalMoved: this.moved.length,
        totalDuplicates: this.duplicates.length,
        totalSkipped: this.skipped.length
      },
      moved: this.moved,
      duplicates: this.duplicates,
      skipped: this.skipped,
      targetDirectory: this.targetDirectory
    };

    // 保存JSON报告
    const reportPath = './test-results/frontend-test-consolidation-report.json';
    
    // 确保目录存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 生成HTML报告
    await this.generateHtmlReport(report);

    console.log(`✅ 整合报告已保存: ${reportPath}`);

    // 显示摘要
    console.log('\n📋 整合摘要:');
    console.log(`  移动文件: ${report.summary.totalMoved}`);
    console.log(`  去重文件: ${report.summary.totalDuplicates}`);
    console.log(`  跳过文件: ${report.summary.totalSkipped}`);
    console.log(`  目标目录: ${this.targetDirectory}`);

    if (this.duplicates.length > 0) {
      console.log('\n🗑️ 去重的文件:');
      this.duplicates.slice(0, 10).forEach((dup, index) => {
        console.log(`  ${index + 1}. 保留: ${dup.kept}`);
        console.log(`     删除: ${dup.removed}`);
        console.log(`     原因: ${dup.reason}`);
      });
      if (this.duplicates.length > 10) {
        console.log(`  ... 还有 ${this.duplicates.length - 10} 个重复文件`);
      }
    }
  }

  /**
   * 生成HTML报告
   */
  async generateHtmlReport(report) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>前端测试整合报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .file-list { max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>前端测试整合报告</h1>
    <div class="summary">
        <h2>整合摘要</h2>
        <p>移动文件: ${report.summary.totalMoved}</p>
        <p>去重文件: ${report.summary.totalDuplicates}</p>
        <p>跳过文件: ${report.summary.totalSkipped}</p>
        <p>目标目录: ${report.targetDirectory}</p>
        <p>整合时间: ${report.timestamp}</p>
    </div>
    
    <div class="section">
        <h2>移动的文件</h2>
        <div class="file-list">
            ${report.moved.map(item => `
                <div class="success">
                    ✅ ${item.source} → ${item.target} (${item.type})
                </div>
            `).join('')}
        </div>
    </div>
    
    <div class="section">
        <h2>去重的文件</h2>
        <div class="file-list">
            ${report.duplicates.map(item => `
                <div class="warning">
                    🗑️ 删除: ${item.removed}<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;保留: ${item.kept}<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;原因: ${item.reason}
                </div>
            `).join('')}
        </div>
    </div>
    
    ${report.skipped.length > 0 ? `
    <div class="section">
        <h2>跳过的文件</h2>
        <div class="file-list">
            ${report.skipped.map(item => `
                <div class="error">
                    ❌ ${item.file}: ${item.reason}
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}
</body>
</html>`;

    const htmlPath = './test-results/frontend-test-consolidation-report.html';
    fs.writeFileSync(htmlPath, html);
  }
}

// 运行整合
if (require.main === module) {
  const consolidator = new FrontendTestConsolidator();
  consolidator.consolidate().catch(error => {
    console.error('整合器失败:', error);
    process.exit(1);
  });
}

module.exports = FrontendTestConsolidator;
