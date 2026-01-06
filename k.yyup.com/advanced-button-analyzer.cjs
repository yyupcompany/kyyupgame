/**
 * 高级按钮功能分析器
 * 专门分析API调用、错误处理、loading状态等
 */

const fs = require('fs');
const path = require('path');

class AdvancedButtonAnalyzer {
  constructor() {
    this.clientPath = path.join(__dirname, 'client/src');
    this.results = {
      totalButtons: 0,
      apiCallButtons: 0,
      loadingButtons: 0,
      errorHandlingButtons: 0,
      validationButtons: 0,
      navigationButtons: 0,
      formSubmitButtons: 0,
      modalButtons: 0,
      issues: {
        missingApiCalls: [],
        missingErrorHandling: [],
        missingLoading: [],
        missingValidation: [],
        emptyHandlers: []
      },
      pageDetails: {},
      recommendations: []
    };
  }

  /**
   * 深度分析Vue文件中的按钮
   */
  analyzeVueFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(this.clientPath, filePath);
    
    // 提取所有按钮
    const buttonPattern = /<(?:button|Button|el-button|a)[^>]*>([^<]*)<\/(?:button|Button|el-button|a)>/g;
    const buttons = [];
    let match;
    
    while ((match = buttonPattern.exec(content)) !== null) {
      const fullElement = match[0];
      const buttonText = match[1];
      const startIdx = match.index;
      
      // 提取点击事件
      const clickMatch = fullElement.match(/@(?:click|submit)="([^"]*)"/);
      const clickHandler = clickMatch ? clickMatch[1] : null;
      
      buttons.push({
        element: fullElement,
        text: buttonText.trim(),
        clickHandler,
        line: this.getLineNumber(content, startIdx),
        hasApiCall: false,
        hasErrorHandling: false,
        hasLoading: false,
        hasValidation: false,
        isNavigation: false,
        isFormSubmit: false,
        isModal: false
      });
    }

    // 分析每个按钮
    buttons.forEach(button => {
      this.analyzeButtonFeatures(button, content);
    });

    return {
      filePath: relativePath,
      buttons,
      content
    };
  }

  /**
   * 分析按钮功能特性
   */
  analyzeButtonFeatures(button, content) {
    if (!button.clickHandler) {
      // 检查是否是导航链接
      if (button.element.includes('router-link=') || button.element.includes('href=') || button.element.includes('to=')) {
        button.isNavigation = true;
      }
      // 检查是否是表单提交按钮
      if (button.element.includes('type="submit"') || button.element.includes('form')) {
        button.isFormSubmit = true;
      }
      return;
    }

    // 检查是否是空处理器
    if (button.clickHandler === '' || button.clickHandler === '()' || button.clickHandler === 'return false') {
      return;
    }

    // 提取方法名
    const methodName = button.clickHandler.replace(/\([^)]*\)/, '').trim();
    
    // 查找方法定义
    const methodPatterns = [
      new RegExp(`${methodName}\\s*\\([^)]*\\)[^{]*\\{([^{}]*)\\}`, 's'),
      new RegExp(`const\\s+${methodName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{([^{}]*)\\}`, 's'),
      new RegExp(`${methodName}\\s*:\\s*function\\s*\\([^)]*\\)\\s*\\{([^{}]*)\\}`, 's')
    ];

    let methodBody = '';
    for (const pattern of methodPatterns) {
      const match = content.match(pattern);
      if (match) {
        methodBody = match[1];
        break;
      }
    }

    if (!methodBody) {
      return;
    }

    // 分析API调用
    const apiPatterns = [
      /\.get\s*\(`,
      /\.post\s*\(`,
      /\.put\s*\(`,
      /\.delete\s*\(`,
      /fetch\s*\(`,
      /axios\./,
      /api\./,
      /request\s*\(`,
      /store\.dispatch\s*\(`,
      /store\.commit\s*\(`,
      /useUserStore/,
      /useAuthStore/,
      /await\s+\w+\.|await\s+\w+\s*\./
    ];

    button.hasApiCall = apiPatterns.some(pattern => pattern.test(methodBody));

    // 分析错误处理
    const errorPatterns = [
      /try\s*{[\s\S]*?}\s*catch/,
      /\.catch\s*\(`,
      /catch\s*\(/,
      /error\s*:/,
      /Error/,
      /ElMessage\.error/,
      /ElNotification\.error/,
      /showError/,
      /onError/
    ];

    button.hasErrorHandling = errorPatterns.some(pattern => pattern.test(methodBody));

    // 分析loading状态
    const loadingPatterns = [
      /loading\s*=\s*true/,
      /isLoading\s*=\s*true/,
      /setLoading\s*\(/,
      /:disabled.*loading/,
      /v-loading/,
      /loading\s*=\s*!loading/,
      /\.loading\s*=\s*true/,
      /spinner/,
      /disabled\s*:\s*loading/
    ];

    button.hasLoading = loadingPatterns.some(pattern => 
      pattern.test(methodBody) || pattern.test(button.element)
    );

    // 分析表单验证
    const validationPatterns = [
      /validate\s*\(/,
      /validateForm/,
      /valid\s*=\s*true/,
      /isValid/,
      /if\s*.*valid/,
      /if\s*.*required/,
      /if\s*.*empty/,
      /\.\s*validate\s*\(/,
      /rules/,
      /formValidate/
    ];

    button.hasValidation = validationPatterns.some(pattern => pattern.test(methodBody));

    // 检查是否是模态框相关
    const modalPatterns = [
      /dialog/,
      /modal/,
      /visible\s*=\s*true/,
      /showDialog/,
      /openModal/,
      /\.show\s*\(\)/,
      /ElDialog/,
      /ElMessageBox/
    ];

    button.isModal = modalPatterns.some(pattern => 
      pattern.test(methodBody) || pattern.test(button.element)
    );
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
   * 运行深度分析
   */
  async runAnalysis() {
    console.log('🔬 开始高级按钮功能分析...\n');

    const vueFiles = this.scanDirectory(this.clientPath);
    console.log(`📁 分析 ${vueFiles.length} 个Vue文件（排除demo和test目录）\n`);

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

    this.generateComprehensiveReport();
  }

  /**
   * 处理文件分析结果
   */
  processFileAnalysis(fileAnalysis) {
    const { filePath, buttons, content } = fileAnalysis;
    
    const pageResult = {
      filePath,
      totalButtons: buttons.length,
      apiCallButtons: 0,
      loadingButtons: 0,
      errorHandlingButtons: 0,
      validationButtons: 0,
      navigationButtons: 0,
      formSubmitButtons: 0,
      modalButtons: 0,
      issues: []
    };

    buttons.forEach(button => {
      this.results.totalButtons++;
      
      if (button.hasApiCall) {
        this.results.apiCallButtons++;
        pageResult.apiCallButtons++;
      }
      
      if (button.hasLoading) {
        this.results.loadingButtons++;
        pageResult.loadingButtons++;
      }
      
      if (button.hasErrorHandling) {
        this.results.errorHandlingButtons++;
        pageResult.errorHandlingButtons++;
      }
      
      if (button.hasValidation) {
        this.results.validationButtons++;
        pageResult.validationButtons++;
      }
      
      if (button.isNavigation) {
        this.results.navigationButtons++;
        pageResult.navigationButtons++;
      }
      
      if (button.isFormSubmit) {
        this.results.formSubmitButtons++;
        pageResult.formSubmitButtons++;
      }
      
      if (button.isModal) {
        this.results.modalButtons++;
        pageResult.modalButtons++;
      }

      // 收集问题
      const buttonIssues = this.identifyButtonIssues(button, content);
      if (buttonIssues.length > 0) {
        pageResult.issues.push({
          button: button.text,
          line: button.line,
          issues: buttonIssues
        });
        
        buttonIssues.forEach(issue => {
          this.results.issues[issue.type].push({
            filePath,
            button: button.text,
            line: button.line,
            description: issue.description
          });
        });
      }
    });

    this.results.pageDetails[filePath] = pageResult;
  }

  /**
   * 识别按钮问题
   */
  identifyButtonIssues(button, content) {
    const issues = [];

    // 检查是否需要API调用但没有
    if (this.shouldHaveApiCall(button) && !button.hasApiCall) {
      issues.push({
        type: 'missingApiCalls',
        description: '按钮功能需要API调用但未实现'
      });
    }

    // 检查是否有API调用但没有错误处理
    if (button.hasApiCall && !button.hasErrorHandling) {
      issues.push({
        type: 'missingErrorHandling',
        description: '按钮包含API调用但缺少错误处理'
      });
    }

    // 检查是否有API调用但没有loading状态
    if (button.hasApiCall && !button.hasLoading) {
      issues.push({
        type: 'missingLoading',
        description: '按钮包含API调用但缺少loading状态指示'
      });
    }

    // 检查表单提交是否缺少验证
    if (button.isFormSubmit && !button.hasValidation) {
      issues.push({
        type: 'missingValidation',
        description: '表单提交按钮缺少数据验证'
      });
    }

    // 检查空事件处理器
    if (button.clickHandler === '' || button.clickHandler === '()' || button.clickHandler === 'return false') {
      issues.push({
        type: 'emptyHandlers',
        description: '按钮事件处理器为空'
      });
    }

    return issues;
  }

  /**
   * 判断按钮是否应该有API调用
   */
  shouldHaveApiCall(button) {
    const apiCallKeywords = [
      '提交', '保存', '删除', '修改', '更新', '添加', '创建', '登录', '注册',
      'submit', 'save', 'delete', 'update', 'add', 'create', 'login', 'register',
      '确认', '取消', '搜索', '查询', 'upload', '下载'
    ];

    const buttonText = button.text.toLowerCase();
    return apiCallKeywords.some(keyword => buttonText.includes(keyword.toLowerCase()));
  }

  /**
   * 生成综合报告
   */
  generateComprehensiveReport() {
    console.log('\n📊 生成高级按钮功能分析报告...\n');

    const totalButtons = this.results.totalButtons;
    const apiCallRate = totalButtons > 0 ? ((this.results.apiCallButtons / totalButtons) * 100).toFixed(2) : 0;
    const loadingRate = totalButtons > 0 ? ((this.results.loadingButtons / totalButtons) * 100).toFixed(2) : 0;
    const errorHandlingRate = totalButtons > 0 ? ((this.results.errorHandlingButtons / totalButtons) * 100).toFixed(2) : 0;
    const validationRate = totalButtons > 0 ? ((this.results.validationButtons / totalButtons) * 100).toFixed(2) : 0;

    console.log('\n' + '='.repeat(80));
    console.log('📋 高级按钮功能分析报告');
    console.log('='.repeat(80));
    console.log(`🔘 总按钮数: ${totalButtons}`);
    console.log(`🌐 包含API调用: ${this.results.apiCallButtons} (${apiCallRate}%)`);
    console.log(`⏳ 包含Loading状态: ${this.results.loadingButtons} (${loadingRate}%)`);
    console.log(`🚨 包含错误处理: ${this.results.errorHandlingButtons} (${errorHandlingRate}%)`);
    console.log(`✅ 包含表单验证: ${this.results.validationButtons} (${validationRate}%)`);
    console.log(`🔗 导航按钮: ${this.results.navigationButtons}`);
    console.log(`📝 表单提交按钮: ${this.results.formSubmitButtons}`);
    console.log(`🪟 模态框按钮: ${this.results.modalButtons}`);

    console.log('\n🚨 主要问题统计:');
    console.log(`❌ 缺少API调用: ${this.results.issues.missingApiCalls.length}`);
    console.log(`❌ 缺少错误处理: ${this.results.issues.missingErrorHandling.length}`);
    console.log(`❌ 缺少Loading状态: ${this.results.issues.missingLoading.length}`);
    console.log(`❌ 缺少表单验证: ${this.results.issues.missingValidation.length}`);
    console.log(`❌ 空事件处理器: ${this.results.issues.emptyHandlers.length}`);

    // 显示问题最多的页面
    const problematicPages = Object.entries(this.results.pageDetails)
      .map(([filePath, pageData]) => ({
        filePath,
        totalIssues: pageData.issues.reduce((sum, issue) => sum + issue.issues.length, 0),
        apiRate: pageData.totalButtons > 0 ? 
          ((pageResult.apiCallButtons / pageResult.totalButtons) * 100).toFixed(1) : 0
      }))
      .filter(page => page.totalIssues > 0)
      .sort((a, b) => b.totalIssues - a.totalIssues)
      .slice(0, 10);

    if (problematicPages.length > 0) {
      console.log('\n🔝 最需要改进的页面:');
      problematicPages.forEach((page, index) => {
        console.log(`${index + 1}. ${page.filePath} (${page.totalIssues} 个问题)`);
      });
    }

    // 生成建议
    this.generateRecommendations(apiCallRate, loadingRate, errorHandlingRate, validationRate);

    // 保存报告
    const report = {
      summary: {
        totalButtons,
        apiCallButtons: this.results.apiCallButtons,
        loadingButtons: this.results.loadingButtons,
        errorHandlingButtons: this.results.errorHandlingButtons,
        validationButtons: this.results.validationButtons,
        navigationButtons: this.results.navigationButtons,
        formSubmitButtons: this.results.formSubmitButtons,
        modalButtons: this.results.modalButtons,
        rates: {
          apiCall: apiCallRate + '%',
          loading: loadingRate + '%',
          errorHandling: errorHandlingRate + '%',
          validation: validationRate + '%'
        }
      },
      issues: this.results.issues,
      problematicPages,
      recommendations: this.results.recommendations,
      pageDetails: this.results.pageDetails
    };

    const reportPath = path.join(__dirname, 'advanced-button-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ 详细分析报告已保存到: ${reportPath}`);

    console.log('\n' + '='.repeat(80));
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(apiCallRate, loadingRate, errorHandlingRate, validationRate) {
    this.results.recommendations = [];

    if (parseFloat(apiCallRate) < 40) {
      this.results.recommendations.push({
        priority: 'HIGH',
        category: 'API集成',
        issue: `只有 ${apiCallRate}% 的按钮包含API调用`,
        solution: '为需要数据交互的按钮添加API调用，实现完整的业务功能',
        example: `
// 添加API调用示例
const handleSave = async () => {
  try {
    loading.value = true
    await api.saveData(formData)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    loading.value = false
  }
}`
      });
    }

    if (parseFloat(errorHandlingRate) < 60) {
      this.results.recommendations.push({
        priority: 'HIGH',
        category: '错误处理',
        issue: `只有 ${errorHandlingRate}% 的按钮包含错误处理`,
        solution: '为所有API调用的按钮添加try-catch错误处理机制',
        example: `
// 错误处理示例
const handleSubmit = async () => {
  try {
    const result = await api.submitForm(data)
    // 处理成功情况
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}`
      });
    }

    if (parseFloat(loadingRate) < 50) {
      this.results.recommendations.push({
        priority: 'MEDIUM',
        category: '用户体验',
        issue: `只有 ${loadingRate}% 的按钮包含loading状态`,
        solution: '为耗时操作添加loading状态指示器，改善用户体验',
        example: `
// Loading状态示例
<button :disabled="loading" @click="handleClick">
  <el-icon v-if="loading" class="is-loading">
    <Loading />
  </el-icon>
  {{ loading ? '处理中...' : '提交' }}
</button>`
      });
    }

    if (parseFloat(validationRate) < 70 && this.results.formSubmitButtons > 0) {
      this.results.recommendations.push({
        priority: 'MEDIUM',
        category: '数据验证',
        issue: `表单提交按钮中只有 ${validationRate}% 包含数据验证`,
        solution: '为所有表单提交按钮添加客户端数据验证',
        example: `
// 表单验证示例
const validateAndSubmit = async () => {
  if (!form.value.name) {
    ElMessage.error('请输入姓名')
    return
  }
  
  if (!/^1[3-9]\\d{9}$/.test(form.value.phone)) {
    ElMessage.error('请输入正确的手机号')
    return
  }
  
  // 提交表单
  await submitForm()
}`
      });
    }

    if (this.results.issues.emptyHandlers.length > 0) {
      this.results.recommendations.push({
        priority: 'HIGH',
        category: '功能实现',
        issue: `发现 ${this.results.issues.emptyHandlers.length} 个空事件处理器`,
        solution: '实现所有按钮的具体业务逻辑，移除空的点击事件处理器',
        example: `
// 避免空处理器
<button @click="() => {}"> <!-- 错误做法 -->

<button @click="handleClick"> <!-- 正确做法 -->
// 实现handleClick方法的具体逻辑
const handleClick = () => {
  // 实现具体功能
}`
      });
    }

    console.log('\n💡 改进建议:');
    this.results.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.category}`);
      console.log(`   问题: ${rec.issue}`);
      console.log(`   解决方案: ${rec.solution}`);
    });
  }
}

// 运行分析
if (require.main === module) {
  const analyzer = new AdvancedButtonAnalyzer();
  analyzer.runAnalysis().catch(console.error);
}

module.exports = AdvancedButtonAnalyzer;