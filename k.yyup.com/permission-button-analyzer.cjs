/**
 * 按钮权限和状态管理分析器
 */

const fs = require('fs');
const path = require('path');

class PermissionButtonAnalyzer {
  constructor() {
    this.clientPath = path.join(__dirname, 'client/src');
    this.results = {
      totalButtons: 0,
      buttonsWithPermission: 0,
      buttonsWithDisabled: 0,
      buttonsWithConditionalDisplay: 0,
      permissionIssues: [],
      stateIssues: [],
      pageAnalysis: {}
    };
  }

  /**
   * 分析Vue文件中的按钮权限和状态管理
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
        hasPermission: false,
        hasDisabled: false,
        hasConditionalDisplay: false,
        hasRoleCheck: false,
        hasPermissionDirective: false,
        permissionFeatures: []
      };

      // 检查权限相关特性
      this.checkPermissionFeatures(buttonInfo, content);
      
      buttons.push(buttonInfo);
    }

    return {
      filePath: relativePath,
      buttons,
      content
    };
  }

  /**
   * 检查按钮的权限特性
   */
  checkPermissionFeatures(buttonInfo, content) {
    const element = buttonInfo.element;
    
    // 检查权限指令
    if (element.includes('v-permission=') || element.includes('v-if=') || element.includes('v-show=')) {
      buttonInfo.hasPermissionDirective = true;
      buttonInfo.hasPermission = true;
      
      if (element.includes('permission')) {
        buttonInfo.permissionFeatures.push('permission-directive');
      }
    }

    // 检查角色检查
    if (element.includes('role') || element.includes('admin') || element.includes('user')) {
      buttonInfo.hasRoleCheck = true;
      buttonInfo.hasPermission = true;
      buttonInfo.permissionFeatures.push('role-check');
    }

    // 检查条件显示
    if (element.includes('v-if=') || element.includes('v-show=')) {
      buttonInfo.hasConditionalDisplay = true;
      
      // 分析条件内容
      const vIfMatch = element.match(/v-if="([^"]*)"/);
      if (vIfMatch) {
        const condition = vIfMatch[1];
        if (condition.includes('role') || condition.includes('permission') || condition.includes('auth')) {
          buttonInfo.permissionFeatures.push('conditional-permission');
        }
      }
    }

    // 检查禁用状态
    if (element.includes(':disabled=') || element.includes('disabled=')) {
      buttonInfo.hasDisabled = true;
    }

    // 检查权限相关的store调用
    const clickMatch = element.match(/@(?:click|submit)="([^"]*)"/);
    if (clickMatch) {
      const handler = clickMatch[1];
      const methodName = handler.replace(/\([^)]*\)/, '').trim();
      
      // 查找方法实现中的权限检查
      const methodPattern = new RegExp(`${methodName}\\s*\\([^)]*\\)[^{]*\\{([^}]*)\\}`, 's');
      const methodMatch = content.match(methodPattern);
      
      if (methodMatch) {
        const methodBody = methodMatch[1];
        if (this.containsPermissionCheck(methodBody)) {
          buttonInfo.hasPermission = true;
          buttonInfo.permissionFeatures.push('runtime-permission-check');
        }
      }
    }
  }

  /**
   * 检查是否包含权限检查逻辑
   */
  containsPermissionCheck(content) {
    const permissionPatterns = [
      /hasPermission/,
      /checkPermission/,
      /canAccess/,
      /userRole/,
      /user\.role/,
      /store\.getters/,
      /permissions/,
      /auth/,
      /isAdmin/,
      /role\s*===/
    ];

    return permissionPatterns.some(pattern => pattern.test(content));
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
    console.log('🔐 开始按钮权限和状态管理分析...\n');

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
      buttonsWithPermission: 0,
      buttonsWithDisabled: 0,
      buttonsWithConditionalDisplay: 0,
      permissionIssues: [],
      stateIssues: []
    };

    buttons.forEach(button => {
      this.results.totalButtons++;
      
      if (button.hasPermission) {
        this.results.buttonsWithPermission++;
        pageResult.buttonsWithPermission++;
      }
      
      if (button.hasDisabled) {
        this.results.buttonsWithDisabled++;
        pageResult.buttonsWithDisabled++;
      }
      
      if (button.hasConditionalDisplay) {
        this.results.buttonsWithConditionalDisplay++;
        pageResult.buttonsWithConditionalDisplay++;
      }

      // 识别权限问题
      const permissionIssues = this.identifyPermissionIssues(button);
      if (permissionIssues.length > 0) {
        permissionIssues.forEach(issue => {
          this.results.permissionIssues.push({
            filePath,
            button: button.text,
            line: button.line,
            issue: issue
          });
          pageResult.permissionIssues.push(issue);
        });
      }

      // 识别状态管理问题
      const stateIssues = this.identifyStateIssues(button);
      if (stateIssues.length > 0) {
        stateIssues.forEach(issue => {
          this.results.stateIssues.push({
            filePath,
            button: button.text,
            line: button.line,
            issue: issue
          });
          pageResult.stateIssues.push(issue);
        });
      }
    });

    this.results.pageAnalysis[filePath] = pageResult;
  }

  /**
   * 识别权限问题
   */
  identifyPermissionIssues(button) {
    const issues = [];

    // 检查敏感操作按钮是否缺少权限控制
    const sensitiveActions = ['删除', '修改', '添加', '创建', '编辑', '删除', '导出', '导入'];
    const isSensitiveAction = sensitiveActions.some(action => 
      button.text.includes(action) || button.text.toLowerCase().includes(action.toLowerCase())
    );

    if (isSensitiveAction && !button.hasPermission) {
      issues.push({
        type: 'MISSING_PERMISSION_CHECK',
        severity: 'HIGH',
        description: `敏感操作"${button.text}"缺少权限控制`
      });
    }

    // 检查管理功能按钮
    const managementActions = ['管理', '设置', '配置', '管理员', '系统'];
    const isManagementAction = managementActions.some(action => 
      button.text.includes(action) || button.text.toLowerCase().includes(action.toLowerCase())
    );

    if (isManagementAction && !button.hasRoleCheck) {
      issues.push({
        type: 'MISSING_ROLE_CHECK',
        severity: 'HIGH',
        description: `管理功能"${button.text}"缺少角色检查`
      });
    }

    return issues;
  }

  /**
   * 识别状态管理问题
   */
  identifyStateIssues(button) {
    const issues = [];

    // 检查是否有禁用状态但没有loading状态
    if (button.hasDisabled && !button.element.includes('loading')) {
      issues.push({
        type: 'MISSING_LOADING_STATE',
        severity: 'MEDIUM',
        description: `按钮"${button.text}"有禁用状态但缺少loading指示器`
      });
    }

    return issues;
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('\n📊 生成按钮权限和状态管理报告...\n');

    const totalButtons = this.results.totalButtons;
    const permissionRate = totalButtons > 0 ? 
      ((this.results.buttonsWithPermission / totalButtons) * 100).toFixed(2) : 0;
    const disabledRate = totalButtons > 0 ? 
      ((this.results.buttonsWithDisabled / totalButtons) * 100).toFixed(2) : 0;
    const conditionalRate = totalButtons > 0 ? 
      ((this.results.buttonsWithConditionalDisplay / totalButtons) * 100).toFixed(2) : 0;

    console.log('\n' + '='.repeat(70));
    console.log('📋 按钮权限和状态管理分析报告');
    console.log('='.repeat(70));
    console.log(`🔘 总按钮数: ${totalButtons}`);
    console.log(`🔐 包含权限控制: ${this.results.buttonsWithPermission} (${permissionRate}%)`);
    console.log(`🚫 包含禁用状态: ${this.results.buttonsWithDisabled} (${disabledRate}%)`);
    console.log(`👁️ 包含条件显示: ${this.results.buttonsWithConditionalDisplay} (${conditionalRate}%)`);
    console.log(`⚠️ 权限问题: ${this.results.permissionIssues.length}`);
    console.log(`⚙️ 状态管理问题: ${this.results.stateIssues.length}`);

    // 显示权限问题
    if (this.results.permissionIssues.length > 0) {
      console.log('\n🚨 权限控制问题:');
      this.results.permissionIssues.slice(0, 10).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.filePath}:${issue.line} - ${issue.issue.description}`);
      });
      
      if (this.results.permissionIssues.length > 10) {
        console.log(`... 还有 ${this.results.permissionIssues.length - 10} 个权限问题`);
      }
    }

    // 显示状态管理问题
    if (this.results.stateIssues.length > 0) {
      console.log('\n⚙️ 状态管理问题:');
      this.results.stateIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.filePath}:${issue.line} - ${issue.issue.description}`);
      });
    }

    // 生成改进建议
    const recommendations = this.generateRecommendations(permissionRate, disabledRate, conditionalRate);
    
    console.log('\n💡 改进建议:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.title}`);
      console.log(`   ${rec.description}`);
    });

    // 保存报告
    const report = {
      summary: {
        totalButtons,
        buttonsWithPermission: this.results.buttonsWithPermission,
        buttonsWithDisabled: this.results.buttonsWithDisabled,
        buttonsWithConditionalDisplay: this.results.buttonsWithConditionalDisplay,
        permissionIssues: this.results.permissionIssues.length,
        stateIssues: this.results.stateIssues.length,
        rates: {
          permission: permissionRate + '%',
          disabled: disabledRate + '%',
          conditional: conditionalRate + '%'
        }
      },
      permissionIssues: this.results.permissionIssues,
      stateIssues: this.results.stateIssues,
      recommendations,
      pageAnalysis: this.results.pageAnalysis
    };

    const reportPath = path.join(__dirname, 'permission-button-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ 详细报告已保存到: ${reportPath}`);

    console.log('\n' + '='.repeat(70));
  }

  /**
   * 生成改进建议
   */
  generateRecommendations(permissionRate, disabledRate, conditionalRate) {
    const recommendations = [];

    if (parseFloat(permissionRate) < 50) {
      recommendations.push({
        priority: 'HIGH',
        title: '加强权限控制',
        description: `只有 ${permissionRate}% 的按钮包含权限控制，建议为敏感操作添加权限检查`
      });
    }

    if (this.results.permissionIssues.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        title: '修复权限问题',
        description: `发现 ${this.results.permissionIssues.length} 个权限控制问题，需要立即修复`
      });
    }

    if (parseFloat(disabledRate) < 30) {
      recommendations.push({
        priority: 'MEDIUM',
        title: '完善状态管理',
        description: `只有 ${disabledRate}% 的按钮包含禁用状态，建议添加交互状态控制`
      });
    }

    if (this.results.stateIssues.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        title: '优化用户体验',
        description: `发现 ${this.results.stateIssues.length} 个状态管理问题，影响用户体验`
      });
    }

    return recommendations;
  }
}

// 运行分析
if (require.main === module) {
  const analyzer = new PermissionButtonAnalyzer();
  analyzer.runAnalysis().catch(console.error);
}

module.exports = PermissionButtonAnalyzer;