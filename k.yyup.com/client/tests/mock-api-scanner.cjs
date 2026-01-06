/**
 * Mock API 扫描器
 * 扫描项目中所有包含Mock API的测试文件，为真实API集成做准备
 */

const fs = require('fs');
const path = require('path');

class MockAPIScanner {
  constructor() {
    this.projectRoot = '/home/devbox/project/client';
    this.testDirs = [
      'tests/unit',
      'tests/integration', 
      'tests/e2e',
      'tests'
    ];
    this.mockPatterns = [
      /vi\.mock\(/g,
      /jest\.mock\(/g,
      /mockResolvedValue/g,
      /mockRejectedValue/g,
      /mockImplementation/g,
      /mockReturnValue/g,
      /\.fn\(\)\.mockResolvedValue/g,
      /\.fn\(\)\.mockRejectedValue/g
    ];
    this.results = {
      totalFiles: 0,
      mockFiles: [],
      apiModules: new Set(),
      summary: {},
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 扫描所有测试文件
   */
  async scanAllTestFiles() {
    console.log('🔍 开始扫描Mock API测试文件...\n');

    for (const testDir of this.testDirs) {
      const fullPath = path.join(this.projectRoot, testDir);
      if (fs.existsSync(fullPath)) {
        await this.scanDirectory(fullPath, testDir);
      }
    }

    this.generateSummary();
    this.generateReport();
    
    console.log(`\n✅ 扫描完成！共发现 ${this.results.mockFiles.length} 个包含Mock API的测试文件`);
    return this.results;
  }

  /**
   * 扫描指定目录
   */
  async scanDirectory(dirPath, relativePath) {
    const files = this.getAllTestFiles(dirPath);

    for (const file of files) {
      this.results.totalFiles++;
      await this.scanFile(file, relativePath);
    }
  }

  /**
   * 获取所有测试文件
   */
  getAllTestFiles(dirPath) {
    const files = [];
    
    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.match(/\.(test|spec)\.(ts|js)$/)) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(dirPath);
    return files;
  }

  /**
   * 扫描单个文件
   */
  async scanFile(filePath, testDir) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.projectRoot, filePath);
      
      const mockInfo = {
        file: relativePath,
        testDir: testDir,
        mockPatterns: [],
        apiModules: [],
        mockCount: 0,
        lineNumbers: []
      };

      // 检查Mock模式
      this.mockPatterns.forEach((pattern, index) => {
        const matches = [...content.matchAll(pattern)];
        if (matches.length > 0) {
          mockInfo.mockPatterns.push({
            pattern: pattern.source,
            count: matches.length,
            matches: matches.map(match => ({
              text: match[0],
              index: match.index
            }))
          });
          mockInfo.mockCount += matches.length;
        }
      });

      // 提取API模块引用
      const apiImportPattern = /vi\.mock\(['"`]([^'"`]+)['"`]\)/g;
      const apiMatches = [...content.matchAll(apiImportPattern)];
      apiMatches.forEach(match => {
        const modulePath = match[1];
        mockInfo.apiModules.push(modulePath);
        this.results.apiModules.add(modulePath);
      });

      // 提取行号信息
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (this.mockPatterns.some(pattern => pattern.test(line))) {
          mockInfo.lineNumbers.push({
            line: index + 1,
            content: line.trim()
          });
        }
      });

      if (mockInfo.mockCount > 0) {
        this.results.mockFiles.push(mockInfo);
        console.log(`📄 发现Mock文件: ${relativePath} (${mockInfo.mockCount}个Mock)`);
      }

    } catch (error) {
      console.error(`❌ 扫描文件失败: ${filePath}`, error.message);
    }
  }

  /**
   * 生成汇总信息
   */
  generateSummary() {
    // 按测试目录分组
    const byDirectory = {};
    this.results.mockFiles.forEach(file => {
      if (!byDirectory[file.testDir]) {
        byDirectory[file.testDir] = [];
      }
      byDirectory[file.testDir].push(file);
    });

    // 按API模块分组
    const byApiModule = {};
    this.results.mockFiles.forEach(file => {
      file.apiModules.forEach(module => {
        if (!byApiModule[module]) {
          byApiModule[module] = [];
        }
        byApiModule[module].push(file.file);
      });
    });

    this.results.summary = {
      totalTestFiles: this.results.totalFiles,
      mockTestFiles: this.results.mockFiles.length,
      mockCoverage: ((this.results.mockFiles.length / this.results.totalFiles) * 100).toFixed(2) + '%',
      byDirectory,
      byApiModule,
      topMockModules: this.getTopMockModules()
    };
  }

  /**
   * 获取使用最多的Mock模块
   */
  getTopMockModules() {
    const moduleCount = {};
    this.results.mockFiles.forEach(file => {
      file.apiModules.forEach(module => {
        moduleCount[module] = (moduleCount[module] || 0) + 1;
      });
    });

    return Object.entries(moduleCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([module, count]) => ({ module, count }));
  }

  /**
   * 生成详细报告
   */
  generateReport() {
    const reportPath = path.join(this.projectRoot, 'tests/reports/mock-api-scan-report.json');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // 生成Markdown报告
    this.generateMarkdownReport();
    
    console.log(`\n📊 详细报告已生成: ${reportPath}`);
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport() {
    const reportPath = path.join(this.projectRoot, 'tests/reports/mock-api-scan-report.md');
    
    let markdown = `# Mock API 扫描报告\n\n`;
    markdown += `**扫描时间**: ${this.results.timestamp}\n\n`;
    markdown += `## 📊 扫描统计\n\n`;
    markdown += `- **总测试文件数**: ${this.results.summary.totalTestFiles}\n`;
    markdown += `- **包含Mock的文件数**: ${this.results.summary.mockTestFiles}\n`;
    markdown += `- **Mock覆盖率**: ${this.results.summary.mockCoverage}\n`;
    markdown += `- **涉及API模块数**: ${this.results.apiModules.size}\n\n`;

    markdown += `## 📁 按目录分布\n\n`;
    Object.entries(this.results.summary.byDirectory).forEach(([dir, files]) => {
      markdown += `### ${dir}\n`;
      markdown += `- 文件数: ${files.length}\n`;
      files.forEach(file => {
        markdown += `  - \`${file.file}\` (${file.mockCount}个Mock)\n`;
      });
      markdown += `\n`;
    });

    markdown += `## 🔧 需要处理的API模块\n\n`;
    this.results.summary.topMockModules.forEach((item, index) => {
      markdown += `${index + 1}. \`${item.module}\` - ${item.count}个文件使用\n`;
    });

    fs.writeFileSync(reportPath, markdown);
  }

  /**
   * 生成分组任务建议
   */
  generateGroupTasks() {
    const groups = [];
    const files = [...this.results.mockFiles];
    
    // 每5个文件为一组
    for (let i = 0; i < files.length; i += 5) {
      const group = files.slice(i, i + 5);
      const groupNumber = Math.floor(i / 5) + 1;
      
      groups.push({
        groupId: `Frontend-${groupNumber.toString().padStart(2, '0')}`,
        title: `【Frontend-${groupNumber.toString().padStart(2, '0')}组】测试用例真实API集成（No.${(i + 1).toString().padStart(2, '0')}-No.${Math.min(i + 5, files.length).toString().padStart(2, '0')}）`,
        files: group.map(f => f.file),
        totalMocks: group.reduce((sum, f) => sum + f.mockCount, 0),
        apiModules: [...new Set(group.flatMap(f => f.apiModules))]
      });
    }

    return groups;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const scanner = new MockAPIScanner();
  scanner.scanAllTestFiles().then(results => {
    console.log('\n🎯 生成分组任务建议...');
    const groups = scanner.generateGroupTasks();
    
    console.log(`\n📋 建议创建 ${groups.length} 个子任务组：\n`);
    groups.forEach(group => {
      console.log(`${group.groupId}: ${group.title}`);
      console.log(`  - 文件数: ${group.files.length}`);
      console.log(`  - Mock数: ${group.totalMocks}`);
      console.log(`  - API模块: ${group.apiModules.join(', ')}`);
      console.log('');
    });
  }).catch(error => {
    console.error('❌ 扫描失败:', error);
  });
}

module.exports = MockAPIScanner;
