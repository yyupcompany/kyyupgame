/**
 * 统一认证项目前端页面按钮功能全面检测
 * 系统性检测按钮元素、事件处理、状态管理、错误处理等
 */

const fs = require('fs');
const path = require('path');

class ButtonFunctionalityDetector {
  constructor() {
    this.clientPath = path.join(__dirname, 'client/src');
    this.results = {
      totalButtons: 0,
      buttonsWithEvents: 0,
      buttonsWithoutEvents: 0,
      buttonsWithEmptyEvents: 0,
      buttonsWithApiCalls: 0,
      buttonsWithErrorHandling: 0,
      buttonsWithLoading: 0,
      issues: [],
      pageAnalysis: {},
      severityStats: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };
  }

  /**
   * 扫描Vue文件中的按钮元素
   */
  scanVueFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.clientPath, filePath);
    
    // 检测按钮元素
    const buttonPatterns = [
      /<[^>]*(?:button|Button)[^>]*>/g,
      /<[^>]*el-button[^>]*>/g,
      /<[^>]*a[^>]*[^>]*>/g,
      /@click="([^"]*)"/g,
      /v-on:click="([^"]*)"/g
    ];

    const buttons = [];
    let match;

    // 查找所有按钮相关的HTML元素
    const buttonElementPatterns = [
      /<(?:button|Button|el-button)[^>]*>(.*?)<\/(?:button|Button|el-button)>/g,
      /<a[^>]*href="[^"]*"[^>]*>(.*?)<\/a>/g,
      /<[^>]*class="[^"]*btn[^"]*"[^>]*>(.*?)<\/[^>]*>/g
    ];

    for (const pattern of buttonElementPatterns) {
      while ((match = pattern.exec(content)) !== null) {
        buttons.push({
          element: match[0],
          text: match[1] || '',
          line: this.getLineNumber(content, match.index)
        });
      }
    }

    // 查找点击事件
    const clickEvents = [];
    const clickEventPatterns = [
      /@click="([^"]*)"/g,
      /v-on:click="([^"]*)"/g
    ];

    for (const pattern of clickEventPatterns) {
      while ((match = pattern.exec(content)) !== null) {
        clickEvents.push({
          handler: match[1],
          line: this.getLineNumber(content, match.index)
        });
      }
    }

    return {
      filePath: relativePath,
      buttons,
      clickEvents,
      content
    };
  }

  /**
   * 分析按钮功能实现
   */
  analyzeButtonFunctionality(fileAnalysis) {
    const { filePath, buttons, clickEvents, content } = fileAnalysis;
    const pageResult = {
      filePath,
      totalButtons: buttons.length,
      functionalButtons: 0,
      nonFunctionalButtons: 0,
      buttonsWithIssues: [],
      eventHandlers: [],
      apiCalls: [],
      loadingStates: [],
      errorHandling: []
    };

    // 分析每个按钮
    buttons.forEach((button, index) => {
      const buttonAnalysis = this.analyzeIndividualButton(button, content, clickEvents);
      
      if (buttonAnalysis.isFunctional) {
        pageResult.functionalButtons++;
      } else {
        pageResult.nonFunctionalButtons++;
        pageResult.buttonsWithIssues.push(buttonAnalysis);
      }

      // 收集各种功能类型
      if (buttonAnalysis.hasEvent) {
        pageResult.eventHandlers.push(buttonAnalysis);
      }
      if (buttonAnalysis.hasApiCall) {
        pageResult.apiCalls.push(buttonAnalysis);
      }
      if (buttonAnalysis.hasLoading) {
        pageResult.loadingStates.push(buttonAnalysis);
      }
      if (buttonAnalysis.hasErrorHandling) {
        pageResult.errorHandling.push(buttonAnalysis);
      }
    });

    return pageResult;
  }

  /**
   * 分析单个按钮的功能
   */
  analyzeIndividualButton(button, content, clickEvents) {
    const analysis = {
      element: button.element,
      text: button.text.trim(),
      line: button.line,
      isFunctional: false,
      hasEvent: false,
      hasApiCall: false,
      hasLoading: false,
      hasErrorHandling: false,
      isEmptyHandler: false,
      issues: []
    };

    // 检查是否有点击事件
    const clickEventMatch = button.element.match(/@(?:click|submit)="([^"]*)"/);
    if (clickEventMatch) {
      analysis.hasEvent = true;
      const handler = clickEventMatch[1];
      
      // 检查是否是空事件处理
      if (handler === '' || handler === '()') {
        analysis.isEmptyHandler = true;
        analysis.issues.push({
          type: 'EMPTY_EVENT_HANDLER',
          severity: 'HIGH',
          message: '按钮点击事件处理函数为空'
        });
      } else if (handler === 'return false' || handler === 'e.preventDefault()' || handler === 'e.stopPropagation()') {
        analysis.issues.push({
          type: 'PREVENT_ONLY',
          severity: 'MEDIUM',
          message: '按钮只阻止默认行为，没有实际功能'
        });
      } else {
        // 检查事件处理函数的实现
        const methodMatch = content.match(new RegExp(`${handler.replace(/\([^)]*\)/, '')}\\s*\\([^)]*\\)[^{]*\\{([^}]*)\\}`));
        if (methodMatch) {
          const methodBody = methodMatch[1];
          
          // 检查是否是空方法体
          if (!methodBody.trim() || methodBody.trim() === '{}' || methodBody.trim().length < 5) {
            analysis.isEmptyHandler = true;
            analysis.issues.push({
              type: 'EMPTY_METHOD',
              severity: 'HIGH',
              message: '事件处理函数方法体为空'
            });
          } else {
            analysis.isFunctional = true;
            
            // 检查API调用
            if (this.containsApiCall(methodBody)) {
              analysis.hasApiCall = true;
            }
            
            // 检查loading状态
            if (this.containsLoadingState(methodBody, content)) {
              analysis.hasLoading = true;
            }
            
            // 检查错误处理
            if (this.containsErrorHandling(methodBody)) {
              analysis.hasErrorHandling = true;
            }
          }
        } else {
          // 可能是内联函数或组件方法
          if (handler.length > 5 && !handler.includes('return false') && !handler.includes('preventDefault')) {
            analysis.isFunctional = true;
          }
        }
      }
    } else {
      analysis.issues.push({
        type: 'NO_CLICK_EVENT',
        severity: 'HIGH',
        message: '按钮没有点击事件处理'
      });
    }

    // 检查按钮的禁用状态
    if (button.element.includes(':disabled=') || button.element.includes('disabled=')) {
      // 检查禁用逻辑是否合理
      analysis.hasDisabledState = true;
    }

    // 检查按钮的显示条件
    if (button.element.includes('v-if=') || button.element.includes('v-show=')) {
      analysis.hasConditionalDisplay = true;
    }

    return analysis;
  }

  /**
   * 检查是否包含API调用
   */
  containsApiCall(content) {
    const apiPatterns = [
      /api\./,
      /fetch\(/,
      /axios\./,
      /request\(/,
      /get\(/,
      /post\(/,
      /put\(/,
      /delete\(/,
      /\$\w+\.\w+\(/,
      /store\./,
      /dispatch\(/,
      /commit\(/
    ];

    return apiPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 检查是否包含loading状态
   */
  containsLoadingState(content, fileContent) {
    const loadingPatterns = [
      /loading/,
      /isLoading/,
      /disabled.*loading/,
      /:loading/,
      v-loading/,
      /spinner/,
      /loading-state/
    ];

    return loadingPatterns.some(pattern => pattern.test(content) || pattern.test(fileContent));
  }

  /**
   * 检查是否包含错误处理
   */
  containsErrorHandling(content) {
    const errorPatterns = [
      /catch\(/,
      /try.*catch/,
      /\.catch\(/,
      /onError/,
      /error/,
      /errorMessage/,
      /showError/,
      ElMessage\.error/,
      ElNotification\.error/
    ];

    return errorPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 获取行号
   */
  getLineNumber(content, index) {
    const lines = content.substring(0, index).split('\n');
    return lines.length;
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
        // 跳过node_modules等目录
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
   * 运行全面检测
   */
  async runDetection() {
    console.log('🚀 开始按钮功能全面检测...\n');

    // 扫描所有Vue文件
    const vueFiles = this.scanDirectory(this.clientPath);
    console.log(`📁 发现 ${vueFiles.length} 个Vue文件\n`);

    // 分析每个文件
    for (const file of vueFiles) {
      try {
        const fileAnalysis = this.scanVueFile(file);
        if (fileAnalysis.buttons.length > 0) {
          const pageResult = this.analyzeButtonFunctionality(fileAnalysis);
          this.results.pageAnalysis[fileAnalysis.filePath] = pageResult;
          
          // 更新全局统计
          this.results.totalButtons += pageResult.totalButtons;
          this.results.buttonsWithEvents += pageResult.functionalButtons;
          this.results.buttonsWithoutEvents += pageResult.nonFunctionalButtons;
          
          // 收集所有问题
          pageResult.buttonsWithIssues.forEach(buttonIssue => {
            this.results.issues.push({
              ...buttonIssue,
              filePath: fileAnalysis.filePath
            });
            
            // 更新严重程度统计
            buttonIssue.issues.forEach(issue => {
              this.results.severityStats[issue.severity.toLowerCase()]++;
            });
          });
        }
      } catch (error) {
        console.error(`❌ 处理文件失败: ${file}`, error.message);
      }
    }

    // 生成报告
    this.generateReport();
  }

  /**
   * 生成详细报告
   */
  generateReport() {
    console.log('\n📊 生成按钮功能检测报告...\n');

    const report = {
      summary: {
        totalFiles: Object.keys(this.results.pageAnalysis).length,
        totalButtons: this.results.totalButtons,
        functionalButtons: this.results.buttonsWithEvents,
        nonFunctionalButtons: this.results.buttonsWithoutEvents,
        functionalityRate: this.results.totalButtons > 0 ? 
          ((this.results.buttonsWithEvents / this.results.totalButtons) * 100).toFixed(2) + '%' : '0%',
        buttonsWithApiCalls: 0,
        buttonsWithLoading: 0,
        buttonsWithErrorHandling: 0,
        criticalIssues: this.results.severityStats.critical,
        highIssues: this.results.severityStats.high,
        mediumIssues: this.results.severityStats.medium,
        lowIssues: this.results.severityStats.low
      },
      severityDistribution: this.results.severityStats,
      issuesByType: this.categorizeIssues(),
      pageDetails: this.results.pageAnalysis,
      recommendations: this.generateRecommendations(),
      topProblematicPages: this.getTopProblematicPages()
    };

    // 计算API调用等统计
    Object.values(this.results.pageAnalysis).forEach(page => {
      report.summary.buttonsWithApiCalls += page.apiCalls.length;
      report.summary.buttonsWithLoading += page.loadingStates.length;
      report.summary.buttonsWithErrorHandling += page.errorHandling.length;
    });

    // 保存报告
    const reportPath = path.join(__dirname, 'button-functionality-detection-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // 生成Markdown报告
    this.generateMarkdownReport(report);

    console.log(`✅ 检测完成！报告已保存到: ${reportPath}`);
    this.printSummary(report);
  }

  /**
   * 按类型分类问题
   */
  categorizeIssues() {
    const categories = {};
    
    this.results.issues.forEach(buttonIssue => {
      buttonIssue.issues.forEach(issue => {
        if (!categories[issue.type]) {
          categories[issue.type] = {
            count: 0,
            severity: issue.severity,
            description: issue.message,
            examples: []
          };
        }
        categories[issue.type].count++;
        
        if (categories[issue.type].examples.length < 3) {
          categories[issue.type].examples.push({
            filePath: buttonIssue.filePath,
            line: buttonIssue.line,
            buttonText: buttonIssue.text,
            element: buttonIssue.element.substring(0, 100) + '...'
          });
        }
      });
    });
    
    return categories;
  }

  /**
   * 获取问题最多的页面
   */
  getTopProblematicPages() {
    return Object.entries(this.results.pageAnalysis)
      .map(([filePath, pageData]) => ({
        filePath,
        totalIssues: pageData.buttonsWithIssues.reduce((sum, btn) => sum + btn.issues.length, 0),
        totalButtons: pageData.totalButtons,
        nonFunctionalRate: pageData.totalButtons > 0 ? 
          (pageData.nonFunctionalButtons / pageData.totalButtons * 100).toFixed(2) + '%' : '0%'
      }))
      .sort((a, b) => b.totalIssues - a.totalIssues)
      .slice(0, 10);
  }

  /**
   * 生成修复建议
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.severityStats.critical > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: '修复严重按钮问题',
        description: `发现 ${this.results.severityStats.critical} 个严重问题，需要立即修复空事件处理函数和缺失点击事件的按钮`,
        action: '为所有按钮添加适当的点击事件处理函数'
      });
    }
    
    if (this.results.severityStats.high > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: '完善按钮功能实现',
        description: `发现 ${this.results.severityStats.high} 个高优先级问题，主要是空的方法体`,
        action: '实现所有按钮事件处理函数的具体业务逻辑'
      });
    }
    
    // 检查API调用比例
    const apiCallRate = this.results.totalButtons > 0 ? 
      (this.results.buttonsWithApiCalls / this.results.totalButtons * 100).toFixed(2) : 0;
    if (parseFloat(apiCallRate) < 30) {
      recommendations.push({
        priority: 'MEDIUM',
        title: '增加按钮API集成',
        description: `只有 ${apiCallRate}% 的按钮包含API调用，可能存在功能缺失`,
        action: '为需要数据交互的按钮添加相应的API调用'
      });
    }
    
    // 检查错误处理
    const errorHandlingRate = this.results.totalButtons > 0 ? 
      (this.results.buttonsWithErrorHandling / this.results.totalButtons * 100).toFixed(2) : 0;
    if (parseFloat(errorHandlingRate) < 50) {
      recommendations.push({
        priority: 'MEDIUM',
        title: '改进错误处理',
        description: `只有 ${errorHandlingRate}% 的按钮包含错误处理`,
        action: '为所有API调用的按钮添加try-catch错误处理'
      });
    }
    
    // 检查loading状态
    const loadingRate = this.results.totalButtons > 0 ? 
      (this.results.buttonsWithLoading / this.results.totalButtons * 100).toFixed(2) : 0;
    if (parseFloat(loadingRate) < 40) {
      recommendations.push({
        priority: 'LOW',
        title: '改善用户体验',
        description: `只有 ${loadingRate}% 的按钮包含loading状态`,
        action: '为耗时操作添加loading状态指示器'
      });
    }
    
    return recommendations;
  }

  /**
   * 打印总结报告
   */
  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 按钮功能检测总结报告');
    console.log('='.repeat(60));
    console.log(`📄 扫描文件数: ${report.summary.totalFiles}`);
    console.log(`🔘 总按钮数: ${report.summary.totalButtons}`);
    console.log(`✅ 功能正常按钮: ${report.summary.functionalButtons} (${report.summary.functionalityRate})`);
    console.log(`❌ 功能异常按钮: ${report.summary.nonFunctionalButtons}`);
    console.log(`🌐 包含API调用: ${report.summary.buttonsWithApiCalls}`);
    console.log(`⏳ 包含Loading状态: ${report.summary.buttonsWithLoading}`);
    console.log(`🚨 包含错误处理: ${report.summary.buttonsWithErrorHandling}`);
    console.log('\n📊 问题严重程度分布:');
    console.log(`🔴 严重: ${report.summary.criticalIssues}`);
    console.log(`🟠 高: ${report.summary.highIssues}`);
    console.log(`🟡 中: ${report.summary.mediumIssues}`);
    console.log(`🟢 低: ${report.summary.lowIssues}`);
    
    console.log('\n🔝 问题最多的页面:');
    report.topProblematicPages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.filePath} (${page.totalIssues} 个问题, ${page.nonFunctionalRate} 异常率)`);
    });
    
    console.log('\n💡 主要修复建议:');
    report.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.title}`);
    });
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * 生成Markdown格式报告
   */
  generateMarkdownReport(report) {
    const markdown = `# 统一认证项目按钮功能检测报告

## 📊 检测概览

- **扫描文件数**: ${report.summary.totalFiles}
- **总按钮数**: ${report.summary.totalButtons}
- **功能正常按钮**: ${report.summary.functionalButtons} (${report.summary.functionalityRate})
- **功能异常按钮**: ${report.summary.nonFunctionalButtons}
- **包含API调用**: ${report.summary.buttonsWithApiCalls}
- **包含Loading状态**: ${report.summary.buttonsWithLoading}
- **包含错误处理**: ${report.summary.buttonsWithErrorHandling}

## 🚨 问题严重程度分布

| 严重程度 | 数量 | 百分比 |
|---------|------|--------|
| 🔴 严重 | ${report.summary.criticalIssues} | ${((report.summary.criticalIssues / report.summary.totalButtons) * 100).toFixed(2)}% |
| 🟠 高 | ${report.summary.highIssues} | ${((report.summary.highIssues / report.summary.totalButtons) * 100).toFixed(2)}% |
| 🟡 中 | ${report.summary.mediumIssues} | ${((report.summary.mediumIssues / report.summary.totalButtons) * 100).toFixed(2)}% |
| 🟢 低 | ${report.summary.lowIssues} | ${((report.summary.lowIssues / report.summary.totalButtons) * 100).toFixed(2)}% |

## 🔍 问题类型分析

${Object.entries(report.issuesByType).map(([type, data]) => `
### ${type}

- **数量**: ${data.count}
- **严重程度**: ${data.severity}
- **描述**: ${data.description}

**示例**:
${data.examples.map(example => `- \`${example.filePath}:${example.line}\` - "${example.buttonText}"`).join('\n')}
`).join('\n')}

## 🏆 问题最多的页面

| 排名 | 文件路径 | 问题数量 | 异常率 |
|------|----------|----------|--------|
${report.topProblematicPages.map((page, index) => 
  `| ${index + 1} | \`${page.filePath}\` | ${page.totalIssues} | ${page.nonFunctionalRate} |`
).join('\n')}

## 💡 修复建议

${report.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title} [${rec.priority}]

**描述**: ${rec.description}

**建议操作**: ${rec.action}
`).join('\n')}

## 📈 改进建议优先级

1. **立即处理**: 修复所有严重和高优先级问题
2. **短期改进**: 完善API调用和错误处理
3. **长期优化**: 改善用户体验，添加loading状态和更好的反馈

---

*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

    const markdownPath = path.join(__dirname, 'button-functionality-detection-report.md');
    fs.writeFileSync(markdownPath, markdown);
    console.log(`📝 Markdown报告已保存到: ${markdownPath}`);
  }
}

// 运行检测
if (require.main === module) {
  const detector = new ButtonFunctionalityDetector();
  detector.runDetection().catch(console.error);
}

module.exports = ButtonFunctionalityDetector;