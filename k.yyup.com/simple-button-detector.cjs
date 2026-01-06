/**
 * 简化版按钮功能检测器
 */

const fs = require('fs');
const path = require('path');

class SimpleButtonDetector {
  constructor() {
    this.clientPath = path.join(__dirname, 'client/src');
    this.results = {
      totalFiles: 0,
      vueFiles: 0,
      totalButtons: 0,
      buttonsWithEvents: 0,
      buttonsWithoutEvents: 0,
      emptyEventHandlers: 0,
      issues: [],
      pageAnalysis: {}
    };
  }

  /**
   * 扫描Vue文件
   */
  scanVueFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.clientPath, filePath);
    
    // 查找按钮元素
    const buttonPatterns = [
      /<(?:button|Button|el-button|a)[^>]*>/g,
      /<[^>]*class="[^"]*btn[^"]*"[^>]*>/g
    ];

    const buttons = [];
    let match;

    for (const pattern of buttonPatterns) {
      while ((match = pattern.exec(content)) !== null) {
        buttons.push({
          element: match[0],
          line: this.getLineNumber(content, match.index)
        });
      }
    }

    // 查找点击事件
    const clickEvents = [];
    const clickEventPattern = /@(?:click|submit)="([^"]*)"/g;
    
    while ((match = clickEventPattern.exec(content)) !== null) {
      clickEvents.push({
        handler: match[1],
        line: this.getLineNumber(content, match.index)
      });
    }

    return {
      filePath: relativePath,
      buttons,
      clickEvents,
      content
    };
  }

  /**
   * 分析按钮
   */
  analyzeButtons(fileAnalysis) {
    const { filePath, buttons, clickEvents, content } = fileAnalysis;
    const pageResult = {
      filePath,
      totalButtons: buttons.length,
      functionalButtons: 0,
      nonFunctionalButtons: 0,
      buttonsWithIssues: []
    };

    buttons.forEach(button => {
      const hasClickEvent = button.element.includes('@click=') || button.element.includes('v-on:click=');
      
      if (hasClickEvent) {
        // 提取事件处理器
        const clickMatch = button.element.match(/@(?:click|submit)="([^"]*)"/);
        if (clickMatch) {
          const handler = clickMatch[1];
          
          if (handler === '' || handler === '()' || handler === 'return false') {
            pageResult.buttonsWithIssues.push({
              element: button.element.substring(0, 100),
              line: button.line,
              issue: 'EMPTY_EVENT_HANDLER',
              severity: 'HIGH',
              message: '按钮事件处理为空或只阻止默认行为'
            });
            pageResult.nonFunctionalButtons++;
          } else {
            // 检查是否真的实现了功能
            const hasImplementation = this.checkMethodImplementation(content, handler);
            if (hasImplementation) {
              pageResult.functionalButtons++;
            } else {
              pageResult.buttonsWithIssues.push({
                element: button.element.substring(0, 100),
                line: button.line,
                issue: 'NO_IMPLEMENTATION',
                severity: 'MEDIUM',
                message: '找不到事件处理函数的实现'
              });
              pageResult.nonFunctionalButtons++;
            }
          }
        } else {
          pageResult.functionalButtons++;
        }
      } else {
        // 检查是否是导航链接
        if (button.element.includes('router-link=') || button.element.includes('href=') || button.element.includes('to=')) {
          pageResult.functionalButtons++;
        } else {
          pageResult.buttonsWithIssues.push({
            element: button.element.substring(0, 100),
            line: button.line,
            issue: 'NO_CLICK_EVENT',
            severity: 'HIGH',
            message: '按钮没有点击事件或导航功能'
          });
          pageResult.nonFunctionalButtons++;
        }
      }
    });

    return pageResult;
  }

  /**
   * 检查方法实现
   */
  checkMethodImplementation(content, handler) {
    // 提取方法名
    const methodName = handler.replace(/\([^)]*\)/, '').trim();
    
    // 查找方法定义
    const methodPattern = new RegExp(`\\b${methodName}\\s*\\([^)]*\\)[^{]*\\{([^}]*)\\}`, 's');
    const match = content.match(methodPattern);
    
    if (match) {
      const methodBody = match[1];
      return methodBody.trim().length > 5; // 至少要有一些实现
    }
    
    // 如果找不到方法定义，可能是内联函数或计算属性
    return handler.length > 10 && !handler.includes('return false');
  }

  /**
   * 获取行号
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * 递归扫描目录
   */
  scanDirectory(dirPath) {
    const files = [];
    
    if (!fs.existsSync(dirPath)) {
      return files;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)) {
          continue;
        }
        files.push(...this.scanDirectory(fullPath));
      } else if (stat.isFile() && item.endsWith('.vue')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * 运行检测
   */
  async runDetection() {
    console.log('🚀 开始按钮功能检测...\n');

    const vueFiles = this.scanDirectory(this.clientPath);
    this.results.totalFiles = vueFiles.length;
    console.log(`📁 发现 ${vueFiles.length} 个Vue文件\n`);

    for (const file of vueFiles) {
      try {
        const fileAnalysis = this.scanVueFile(file);
        if (fileAnalysis.buttons.length > 0) {
          this.results.vueFiles++;
          const pageResult = this.analyzeButtons(fileAnalysis);
          this.results.pageAnalysis[fileAnalysis.filePath] = pageResult;
          
          this.results.totalButtons += pageResult.totalButtons;
          this.results.buttonsWithEvents += pageResult.functionalButtons;
          this.results.buttonsWithoutEvents += pageResult.nonFunctionalButtons;
          
          pageResult.buttonsWithIssues.forEach(issue => {
            this.results.issues.push({
              ...issue,
              filePath: fileAnalysis.filePath
            });
          });
        }
      } catch (error) {
        console.error(`❌ 处理文件失败: ${file}`, error.message);
      }
    }

    this.generateReport();
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 生成按钮功能检测报告...\n');

    const functionalityRate = this.results.totalButtons > 0 ? 
      ((this.results.buttonsWithEvents / this.results.totalButtons) * 100).toFixed(2) : '0';

    console.log('\n' + '='.repeat(60));
    console.log('📋 按钮功能检测总结报告');
    console.log('='.repeat(60));
    console.log(`📄 扫描文件数: ${this.results.totalFiles}`);
    console.log(`📄 包含按钮的文件: ${this.results.vueFiles}`);
    console.log(`🔘 总按钮数: ${this.results.totalButtons}`);
    console.log(`✅ 功能正常按钮: ${this.results.buttonsWithEvents} (${functionalityRate}%)`);
    console.log(`❌ 功能异常按钮: ${this.results.buttonsWithoutEvents}`);
    console.log(`🚨 问题总数: ${this.results.issues.length}`);

    // 显示问题最多的页面
    const problematicPages = Object.entries(this.results.pageAnalysis)
      .filter(([_, pageData]) => pageData.nonFunctionalButtons > 0)
      .sort((a, b) => b[1].nonFunctionalButtons - a[1].nonFunctionalButtons)
      .slice(0, 10);

    if (problematicPages.length > 0) {
      console.log('\n🔝 问题最多的页面:');
      problematicPages.forEach(([filePath, pageData], index) => {
        const issueRate = ((pageData.nonFunctionalButtons / pageData.totalButtons) * 100).toFixed(1);
        console.log(`${index + 1}. ${filePath} (${pageData.nonFunctionalButtons}/${pageData.totalButtons} 按钮有问题, ${issueRate}% 异常率)`);
      });
    }

    // 按问题类型分类
    const issuesByType = {};
    this.results.issues.forEach(issue => {
      if (!issuesByType[issue.issue]) {
        issuesByType[issue.issue] = [];
      }
      issuesByType[issue.issue].push(issue);
    });

    if (Object.keys(issuesByType).length > 0) {
      console.log('\n🔍 问题类型分析:');
      Object.entries(issuesByType).forEach(([type, issues]) => {
        console.log(`- ${type}: ${issues.length} 个`);
        if (issues.length <= 3) {
          issues.forEach(issue => {
            console.log(`  • ${issue.filePath}:${issue.line}`);
          });
        } else {
          console.log(`  • ${issues[0].filePath}:${issues[0].line} 等 ${issues.length} 个文件`);
        }
      });
    }

    // 保存详细报告
    const report = {
      summary: {
        totalFiles: this.results.totalFiles,
        vueFiles: this.results.vueFiles,
        totalButtons: this.results.totalButtons,
        functionalButtons: this.results.buttonsWithEvents,
        nonFunctionalButtons: this.results.buttonsWithoutEvents,
        functionalityRate: functionalityRate + '%',
        totalIssues: this.results.issues.length
      },
      problematicPages: problematicPages.map(([filePath, pageData]) => ({
        filePath,
        totalButtons: pageData.totalButtons,
        nonFunctionalButtons: pageData.nonFunctionalButtons,
        issueRate: ((pageData.nonFunctionalButtons / pageData.totalButtons) * 100).toFixed(1) + '%'
      })),
      issuesByType,
      allIssues: this.results.issues
    };

    const reportPath = path.join(__dirname, 'button-detection-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ 详细报告已保存到: ${reportPath}`);

    console.log('\n' + '='.repeat(60));
  }
}

// 运行检测
if (require.main === module) {
  const detector = new SimpleButtonDetector();
  detector.runDetection().catch(console.error);
}

module.exports = SimpleButtonDetector;