/**
 * 按钮用户体验分析器
 * 专门分析错误处理、用户反馈、loading状态等UX相关功能
 */

const fs = require('fs');
const path = require('path');

class UXButtonAnalyzer {
  constructor() {
    this.clientPath = path.join(__dirname, 'client/src');
    this.results = {
      totalButtons: 0,
      buttonsWithFeedback: 0,
      buttonsWithConfirmation: 0,
      buttonsWithTooltip: 0,
      buttonsWithAccessibility: 0,
      buttonsWithProperText: 0,
      uxIssues: {
        missingFeedback: [],
        missingConfirmation: [],
        poorAccessibility: [],
        unclearText: [],
        noErrorHandling: [],
        noLoadingState: []
      },
      pageAnalysis: {}
    };
  }

  /**
   * 分析Vue文件中的按钮用户体验
   */
  analyzeVueFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.clientPath, filePath);
    
    // 查找按钮元素
    const buttonPattern = /<(?:button|Button|el-button|a)[^>]*>([^<]*)<\/(?:button|Button|el-button|a)>/g;
    const buttons = [];
    let match;
    
    while ((match = buttonPattern.exec(content)) !== null) {
      const fullElement = match[0];
      const buttonText = match[1];
      const startIdx = match.index;
      
      const buttonInfo = {
        element: fullElement,
        text: buttonText.trim(),
        line: this.getLineNumber(content, startIdx),
        hasFeedback: false,
        hasConfirmation: false,
        hasTooltip: false,
        hasAccessibility: false,
        hasProperText: false,
        hasErrorHandling: false,
        hasLoadingState: false,
        uxFeatures: [],
        uxIssues: []
      };

      // 检查用户体验特性
      this.checkUXFeatures(buttonInfo, content);
      
      buttons.push(buttonInfo);
    }

    return {
      filePath: relativePath,
      buttons,
      content
    };
  }

  /**
   * 检查按钮的用户体验特性
   */
  checkUXFeatures(buttonInfo, content) {
    const element = buttonInfo.element;
    const text = buttonInfo.text;

    // 检查反馈机制
    const feedbackFeatures = [
      'ElMessage',
      'ElNotification',
      'message',
      'notification',
      'alert',
      'toast',
      'showMessage',
      'showSuccess',
      'showError',
      'showInfo'
    ];

    const clickMatch = element.match(/@(?:click|submit)="([^"]*)"/);
    if (clickMatch) {
      const handler = clickMatch[1];
      const methodName = handler.replace(/\([^)]*\)/, '').trim();
      
      // 查找方法实现
      const methodPattern = new RegExp(`${methodName}\\s*\\([^)]*\\)[^{]*\\{([^{}]*)\\}`, 's');
      const methodMatch = content.match(methodPattern);
      
      if (methodMatch) {
        const methodBody = methodMatch[1];
        
        // 检查用户反馈
        if (feedbackFeatures.some(feature => methodBody.includes(feature))) {
          buttonInfo.hasFeedback = true;
          buttonInfo.uxFeatures.push('user-feedback');
        }

        // 检查错误处理
        if (methodBody.includes('try') && methodBody.includes('catch')) {
          buttonInfo.hasErrorHandling = true;
          buttonInfo.uxFeatures.push('error-handling');
        }

        // 检查loading状态
        if (methodBody.includes('loading') || element.includes('loading')) {
          buttonInfo.hasLoadingState = true;
          buttonInfo.uxFeatures.push('loading-state');
        }
      }
    }

    // 检查确认对话框
    const confirmationFeatures = [
      'confirm',
      'MessageBox',
      'Dialog',
      'Modal',
      '确认',
      '删除.*确认'
    ];

    if (confirmationFeatures.some(feature => element.includes(feature) || 
        (clickMatch && content.includes(feature)))) {
      buttonInfo.hasConfirmation = true;
      buttonInfo.uxFeatures.push('confirmation-dialog');
    }

    // 检查工具提示
    const tooltipFeatures = [
      'title=',
      'tooltip',
      'placeholder',
      'aria-label',
      'description='
    ];

    if (tooltipFeatures.some(feature => element.includes(feature))) {
      buttonInfo.hasTooltip = true;
      buttonInfo.uxFeatures.push('tooltip');
    }

    // 检查可访问性
    const accessibilityFeatures = [
      'aria-',
      'role=',
      'tabindex',
      'alt=',
      'for=',
      'label='
    ];

    if (accessibilityFeatures.some(feature => element.includes(feature))) {
      buttonInfo.hasAccessibility = true;
      buttonInfo.uxFeatures.push('accessibility');
    }

    // 检查按钮文本质量
    if (this.isProperButtonText(text)) {
      buttonInfo.hasProperText = true;
      buttonInfo.uxFeatures.push('proper-text');
    }
  }

  /**
   * 检查按钮文本是否合适
   */
  isProperButtonText(text) {
    // 排除不好的按钮文本
    const poorTexts = [
      '',
      '按钮',
      'button',
      'btn',
      '点击',
      'click',
      '确定',
      'OK',
      'Cancel',
      '取消'
    ];

    const cleanText = text.trim().toLowerCase();
    
    // 如果文本太短或在黑名单中，则认为不合适
    if (cleanText.length < 2 || poorTexts.some(poor => cleanText.includes(poor.toLowerCase()))) {
      return false;
    }

    // 好的按钮文本应该描述动作
    const actionWords = [
      '提交', '保存', '删除', '修改', '编辑', '添加', '创建', '查询', '搜索',
      'submit', 'save', 'delete', 'edit', 'add', 'create', 'search', 'update',
      '下载', '上传', '导出', '导入', '查看', '预览', '启动', '停止'
    ];

    return actionWords.some(action => cleanText.includes(action.toLowerCase())) || cleanText.length > 4;
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
        if (['node_modules', '.git', 'dist', 'build', 'coverage', 'demo', 'test'].includes(item)) {
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
   * 运行分析
   */
  async runAnalysis() {
    console.log('🎨 开始按钮用户体验分析...\n');

    const vueFiles = this.scanDirectory(this.clientPath);
    console.log(`📁 分析 ${vueFiles.length} 个Vue文件\n`);

    for (const file of vueFiles) {
      try {
        const fileAnalysis = this.analyzeVueFile(file);
        if (fileAnalysis.buttons.length > 0) {
          this.processFileAnalysis(fileAnalysis);
        }
      } catch (error) {
        console.error(`❌ 处理文件失败: ${file}`, error.message);
      }
    }

    this.generateReport();
  }

  /**
   * 处理文件分析结果
   */
  processFileAnalysis(fileAnalysis) {
    const { filePath, buttons } = fileAnalysis;
    
    const pageResult = {
      filePath,
      totalButtons: buttons.length,
      buttonsWithFeedback: 0,
      buttonsWithConfirmation: 0,
      buttonsWithTooltip: 0,
      buttonsWithAccessibility: 0,
      buttonsWithProperText: 0,
      uxIssues: []
    };

    buttons.forEach(button => {
      this.results.totalButtons++;
      
      if (button.hasFeedback) {
        this.results.buttonsWithFeedback++;
        pageResult.buttonsWithFeedback++;
      }
      
      if (button.hasConfirmation) {
        this.results.buttonsWithConfirmation++;
        pageResult.buttonsWithConfirmation++;
      }
      
      if (button.hasTooltip) {
        this.results.buttonsWithTooltip++;
        pageResult.buttonsWithTooltip++;
      }
      
      if (button.hasAccessibility) {
        this.results.buttonsWithAccessibility++;
        pageResult.buttonsWithAccessibility++;
      }
      
      if (button.hasProperText) {
        this.results.buttonsWithProperText++;
        pageResult.buttonsWithProperText++;
      }

      // 识别用户体验问题
      const uxIssues = this.identifyUXIssues(button);
      if (uxIssues.length > 0) {
        uxIssues.forEach(issue => {
          this.results.uxIssues[issue.type].push({
            filePath,
            button: button.text,
            line: button.line,
            issue: issue.description
          });
          pageResult.uxIssues.push(issue);
        });
      }
    });

    this.results.pageAnalysis[filePath] = pageResult;
  }

  /**
   * 识别用户体验问题
   */
  identifyUXIssues(button) {
    const issues = [];
    const text = button.text.trim();

    // 检查缺少用户反馈
    if (this.shouldHaveFeedback(button) && !button.hasFeedback) {
      issues.push({
        type: 'missingFeedback',
        severity: 'MEDIUM',
        description: `按钮"${text}"缺少用户反馈机制`
      });
    }

    // 检查危险操作缺少确认
    if (this.needsConfirmation(button) && !button.hasConfirmation) {
      issues.push({
        type: 'missingConfirmation',
        severity: 'HIGH',
        description: `危险操作"${text}"缺少确认对话框`
      });
    }

    // 检查缺少工具提示
    if (this.needsTooltip(button) && !button.hasTooltip) {
      issues.push({
        type: 'poorAccessibility',
        severity: 'LOW',
        description: `按钮"${text}"缺少工具提示或说明`
      });
    }

    // 检查可访问性问题
    if (!button.hasAccessibility) {
      issues.push({
        type: 'poorAccessibility',
        severity: 'LOW',
        description: `按钮"${text}"缺少可访问性属性`
      });
    }

    // 检查按钮文本不清晰
    if (!button.hasProperText) {
      issues.push({
        type: 'unclearText',
        severity: 'MEDIUM',
        description: `按钮文本"${text}"不够清晰或描述性不足`
      });
    }

    // 检查缺少错误处理
    if (this.shouldHaveErrorHandling(button) && !button.hasErrorHandling) {
      issues.push({
        type: 'noErrorHandling',
        severity: 'HIGH',
        description: `按钮"${text}"缺少错误处理机制`
      });
    }

    // 检查缺少loading状态
    if (this.shouldHaveLoading(button) && !button.hasLoadingState) {
      issues.push({
        type: 'noLoadingState',
        severity: 'MEDIUM',
        description: `按钮"${text}"缺少loading状态指示器`
      });
    }

    return issues;
  }

  /**
   * 判断按钮是否应该有反馈
   */
  shouldHaveFeedback(button) {
    const feedbackActions = ['提交', '保存', '删除', '修改', '添加', '创建', '登录', '注册'];
    return feedbackActions.some(action => 
      button.text.includes(action) || button.text.toLowerCase().includes(action.toLowerCase())
    );
  }

  /**
   * 判断按钮是否需要确认
   */
  needsConfirmation(button) {
    const dangerousActions = ['删除', '清空', '重置', '移除', '批量删除'];
    return dangerousActions.some(action => 
      button.text.includes(action) || button.text.toLowerCase().includes(action.toLowerCase())
    );
  }

  /**
   * 判断按钮是否需要工具提示
   */
  needsTooltip(button) {
    // 图标按钮或文本较短的按钮需要工具提示
    return button.text.length <= 2 || button.element.includes('icon');
  }

  /**
   * 判断按钮是否应该有错误处理
   */
  shouldHaveErrorHandling(button) {
    const errorProneActions = ['提交', '保存', '删除', '修改', '上传', '下载', '登录'];
    return errorProneActions.some(action => 
      button.text.includes(action) || button.text.toLowerCase().includes(action.toLowerCase())
    );
  }

  /**
   * 判断按钮是否应该有loading状态
   */
  shouldHaveLoading(button) {
    const slowActions = ['提交', '保存', '删除', '上传', '下载', '导入', '导出'];
    return slowActions.some(action => 
      button.text.includes(action) || button.text.toLowerCase().includes(action.toLowerCase())
    );
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 生成按钮用户体验分析报告...\n');

    const totalButtons = this.results.totalButtons;
    const feedbackRate = totalButtons > 0 ? 
      ((this.results.buttonsWithFeedback / totalButtons) * 100).toFixed(2) : 0;
    const confirmationRate = totalButtons > 0 ? 
      ((this.results.buttonsWithConfirmation / totalButtons) * 100).toFixed(2) : 0;
    const tooltipRate = totalButtons > 0 ? 
      ((this.results.buttonsWithTooltip / totalButtons) * 100).toFixed(2) : 0;
    const accessibilityRate = totalButtons > 0 ? 
      ((this.results.buttonsWithAccessibility / totalButtons) * 100).toFixed(2) : 0;
    const properTextRate = totalButtons > 0 ? 
      ((this.results.buttonsWithProperText / totalButtons) * 100).toFixed(2) : 0;

    console.log('\n' + '='.repeat(80));
    console.log('📋 按钮用户体验分析报告');
    console.log('='.repeat(80));
    console.log(`🔘 总按钮数: ${totalButtons}`);
    console.log(`💬 包含用户反馈: ${this.results.buttonsWithFeedback} (${feedbackRate}%)`);
    console.log(`✅ 包含确认对话框: ${this.results.buttonsWithConfirmation} (${confirmationRate}%)`);
    console.log(`💡 包含工具提示: ${this.results.buttonsWithTooltip} (${tooltipRate}%)`);
    console.log(`♿ 包含可访问性: ${this.results.buttonsWithAccessibility} (${accessibilityRate}%)`);
    console.log(`📝 文本描述清晰: ${this.results.buttonsWithProperText} (${properTextRate}%)`);

    console.log('\n🚨 用户体验问题统计:');
    Object.entries(this.results.uxIssues).forEach(([type, issues]) => {
      if (issues.length > 0) {
        const typeName = this.getIssueTypeName(type);
        console.log(`❌ ${typeName}: ${issues.length}`);
      }
    });

    // 显示最严重的UX问题
    const allIssues = Object.entries(this.results.uxIssues)
      .filter(([_, issues]) => issues.length > 0)
      .flatMap(([_, issues]) => issues);

    if (allIssues.length > 0) {
      console.log('\n🔝 主要用户体验问题:');
      allIssues.slice(0, 15).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.filePath}:${issue.line} - ${issue.issue}`);
      });
      
      if (allIssues.length > 15) {
        console.log(`... 还有 ${allIssues.length - 15} 个用户体验问题`);
      }
    }

    // 生成改进建议
    const recommendations = this.generateRecommendations(feedbackRate, confirmationRate, accessibilityRate, properTextRate);
    
    console.log('\n💡 用户体验改进建议:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.title}`);
      console.log(`   ${rec.description}`);
    });

    // 保存报告
    const report = {
      summary: {
        totalButtons,
        buttonsWithFeedback: this.results.buttonsWithFeedback,
        buttonsWithConfirmation: this.results.buttonsWithConfirmation,
        buttonsWithTooltip: this.results.buttonsWithTooltip,
        buttonsWithAccessibility: this.results.buttonsWithAccessibility,
        buttonsWithProperText: this.results.buttonsWithProperText,
        totalIssues: allIssues.length,
        rates: {
          feedback: feedbackRate + '%',
          confirmation: confirmationRate + '%',
          tooltip: tooltipRate + '%',
          accessibility: accessibilityRate + '%',
          properText: properTextRate + '%'
        }
      },
      uxIssues: this.results.uxIssues,
      allIssues,
      recommendations,
      pageAnalysis: this.results.pageAnalysis
    };

    const reportPath = path.join(__dirname, 'ux-button-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ 详细报告已保存到: ${reportPath}`);

    console.log('\n' + '='.repeat(80));
  }

  /**
   * 获取问题类型名称
   */
  getIssueTypeName(type) {
    const names = {
      missingFeedback: '缺少用户反馈',
      missingConfirmation: '缺少确认对话框',
      poorAccessibility: '可访问性问题',
      unclearText: '文本不清晰',
      noErrorHandling: '缺少错误处理',
      noLoadingState: '缺少loading状态'
    };
    return names[type] || type;
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(feedbackRate, confirmationRate, accessibilityRate, properTextRate) {
    const recommendations = [];

    if (parseFloat(feedbackRate) < 60) {
      recommendations.push({
        priority: 'HIGH',
        title: '加强用户反馈',
        description: `只有 ${feedbackRate}% 的按钮包含用户反馈，建议为所有操作添加明确的反馈机制`
      });
    }

    if (this.results.uxIssues.missingConfirmation.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: '添加确认对话框',
        description: `发现 ${this.results.uxIssues.missingConfirmation.length} 个危险操作缺少确认，需要添加确认对话框`
      });
    }

    if (parseFloat(accessibilityRate) < 30) {
      recommendations.push({
        priority: 'MEDIUM',
        title: '改善可访问性',
        description: `只有 ${accessibilityRate}% 的按钮包含可访问性属性，建议添加aria-label、title等属性`
      });
    }

    if (parseFloat(properTextRate) < 70) {
      recommendations.push({
        priority: 'MEDIUM',
        title: '优化按钮文本',
        description: `只有 ${properTextRate}% 的按钮文本描述清晰，建议使用更具体的操作描述`
      });
    }

    if (this.results.uxIssues.noErrorHandling.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: '完善错误处理',
        description: `发现 ${this.results.uxIssues.noErrorHandling.length} 个按钮缺少错误处理，可能导致用户体验问题`
      });
    }

    if (this.results.uxIssues.noLoadingState.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        title: '添加loading状态',
        description: `发现 ${this.results.uxIssues.noLoadingState.length} 个按钮缺少loading状态，建议添加进度指示器`
      });
    }

    return recommendations;
  }
}

// 运行分析
if (require.main === module) {
  const analyzer = new UXButtonAnalyzer();
  analyzer.runAnalysis().catch(console.error);
}

module.exports = UXButtonAnalyzer;