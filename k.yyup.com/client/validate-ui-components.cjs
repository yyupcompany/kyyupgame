#!/usr/bin/env node

/**
 * UI组件修复验证工具
 * 用于验证已修复的UI组件是否符合设计标准
 */

const fs = require('fs');
const path = require('path');

class ComponentValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      details: []
    };

    // 验证规则配置
    this.rules = {
      // 必需的样式导入
      requiredImports: [
        '@/styles/design-tokens.scss',
        '@/styles/list-components-optimization.scss'
      ],

      // 硬编码颜色值（应该使用CSS变量）
      hardcodedColors: [
        /#[0-9a-fA-F]{3,6}/g, // 十六进制颜色
        /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g, // RGB颜色
        /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g, // RGBA颜色
        /(white|black|red|blue|green|yellow|orange|purple|gray|grey)(?![a-z-])/gi, // 基础颜色名
      ],

      // 硬编码尺寸值（应该使用CSS变量）
      hardcodedSizes: [
        /\b(0|1|2|3|4|5|6|8|10|12|14|16|18|20|24|28|30|32|36|40|48|56|64|72|80|96|120|160|200|240|320)\s*(px|rem|em)(?![a-z-])/g,
      ],

      // 硬编码边框圆角（应该使用CSS变量）
      hardcodedBorderRadius: [
        /\b(0|1|2|3|4|6|8|10|12|16|20|24|30|40|50)%?\s*(px|rem|em)?(?![a-z-])/g,
      ],

      // 错误的图标使用方式
      incorrectIconPatterns: [
        /<el-icon>[\s\S]*?<\/el-icon>/g,
        /<i\s+class=["'][^"']*el-icon-[^"']*["'][^>]*>/gi,
        /class=["'][^"']*el-icon-[^"']*["']/gi,
      ],

      // 正确的图标使用方式
      correctIconPattern: /<UnifiedIcon\s+name=/g,

      // CSS变量使用模式
      cssVariablePattern: /var\s*\(\s*--[\w-]+\s*\)/g,
    };

    // 需要验证的组件列表
    this.components = {
      center: [
        'src/components/business-center/QuickActionDialog.vue',
        'src/components/centers/DetailPanel.vue',
        'src/components/centers/FormModal.vue',
        'src/components/centers/SimpleFormModal.vue',
        'src/pages/parent/ParentList.vue',
        'src/pages/parent-center/children/index.vue',
      ],
      system: [
        'src/pages/system/Log.vue',
        'src/components/system/UserList.vue',
        'src/pages/system/settings/index.vue',
        'src/components/system/settings/BasicSettings.vue',
        'src/components/system/settings/EmailSettings.vue',
        'src/components/system/settings/SecuritySettings.vue',
        'src/components/system/settings/StorageSettings.vue',
        'src/components/system/RoleList.vue',
      ],
      activity: [
        'src/pages/activity/ActivityList.vue',
        'src/pages/activity/ActivityDetail.vue',
        'src/pages/activity/ActivityEdit.vue',
        'src/components/activity/ActivityActions.vue',
        'src/components/activity/ActivityStatusTag.vue',
        'src/pages/activity/ActivityForm.vue',
        'src/pages/activity/ActivityRegistrations.vue',
        'src/components/centers/activity/RegistrationDetail.vue',
        'src/pages/activity/analytics/ActivityAnalytics.vue',
        'src/pages/activity/analytics/intelligent-analysis.vue',
      ]
    };
  }

  /**
   * 验证单个组件
   */
  validateComponent(componentPath, category) {
    const fullPath = path.resolve(componentPath);

    if (!fs.existsSync(fullPath)) {
      return {
        path: componentPath,
        category,
        exists: false,
        score: 0,
        issues: [`文件不存在: ${fullPath}`]
      };
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const result = {
      path: componentPath,
      category,
      exists: true,
      score: 0,
      passed: 0,
      total: 0,
      issues: [],
      details: {
        imports: { status: 'fail', issues: [] },
        designTokens: { status: 'fail', issues: [] },
        iconSystem: { status: 'fail', issues: [] },
        hardcodedValues: { status: 'fail', issues: [] }
      }
    };

    // 1. 验证样式导入
    result.total++;
    const importResult = this.validateImports(content);
    if (importResult.passed) {
      result.passed++;
      result.details.imports.status = 'pass';
    } else {
      result.details.imports.issues = importResult.issues;
      result.issues.push(...importResult.issues);
    }

    // 2. 验证CSS变量使用
    result.total++;
    const tokenResult = this.validateDesignTokens(content);
    if (tokenResult.passed) {
      result.passed++;
      result.details.designTokens.status = 'pass';
    } else {
      result.details.designTokens.issues = tokenResult.issues;
      result.issues.push(...tokenResult.issues);
    }

    // 3. 验证图标系统
    result.total++;
    const iconResult = this.validateIconSystem(content);
    if (iconResult.passed) {
      result.passed++;
      result.details.iconSystem.status = 'pass';
    } else {
      result.details.iconSystem.issues = iconResult.issues;
      result.issues.push(...iconResult.issues);
    }

    // 4. 验证硬编码值
    result.total++;
    const hardcodedResult = this.validateHardcodedValues(content);
    if (hardcodedResult.passed) {
      result.passed++;
      result.details.hardcodedValues.status = 'pass';
    } else {
      result.details.hardcodedValues.issues = hardcodedResult.issues;
      result.issues.push(...hardcodedResult.issues);
    }

    // 计算得分
    result.score = Math.round((result.passed / result.total) * 100);

    return result;
  }

  /**
   * 验证样式导入
   */
  validateImports(content) {
    const result = { passed: false, issues: [] };
    const missingImports = [];

    for (const requiredImport of this.rules.requiredImports) {
      if (!content.includes(requiredImport)) {
        missingImports.push(requiredImport);
      }
    }

    if (missingImports.length === 0) {
      result.passed = true;
    } else {
      result.issues.push(`缺少必需的样式导入: ${missingImports.join(', ')}`);
    }

    return result;
  }

  /**
   * 验证设计令牌使用
   */
  validateDesignTokens(content) {
    const result = { passed: false, issues: [] };
    const cssVariableMatches = content.match(this.rules.cssVariablePattern) || [];

    if (cssVariableMatches.length >= 5) { // 至少使用5个CSS变量
      result.passed = true;
    } else {
      result.issues.push(`CSS变量使用不足 (${cssVariableMatches.length}个)，应该使用设计令牌`);
    }

    return result;
  }

  /**
   * 验证图标系统
   */
  validateIconSystem(content) {
    const result = { passed: false, issues: [] };

    const incorrectIcons = [];
    for (const pattern of this.rules.incorrectIconPatterns) {
      const matches = content.match(pattern) || [];
      incorrectIcons.push(...matches);
    }

    const correctIcons = content.match(this.rules.correctIconPattern) || [];

    if (incorrectIcons.length === 0 && correctIcons.length > 0) {
      result.passed = true;
    } else {
      if (incorrectIcons.length > 0) {
        result.issues.push(`发现 ${incorrectIcons.length} 个错误的图标使用方式`);
      }
      if (correctIcons.length === 0) {
        result.issues.push('未使用UnifiedIcon组件');
      }
    }

    return result;
  }

  /**
   * 验证硬编码值
   */
  validateHardcodedValues(content) {
    const result = { passed: false, issues: [] };
    const hardcodedValues = [];

    // 检查硬编码颜色
    for (const pattern of this.rules.hardcodedColors) {
      const matches = content.match(pattern) || [];
      // 过滤掉注释中的颜色
      const nonCommentMatches = matches.filter(match =>
        !this.isInComment(content, match) &&
        !this.isInString(content, match) &&
        !match.includes('var(')
      );
      hardcodedValues.push(...nonCommentMatches.map(m => ({ type: 'color', value: m })));
    }

    // 检查硬编码尺寸
    for (const pattern of this.rules.hardcodedSizes) {
      const matches = content.match(pattern) || [];
      const nonCommentMatches = matches.filter(match =>
        !this.isInComment(content, match) &&
        !this.isInString(content, match)
      );
      hardcodedValues.push(...nonCommentMatches.map(m => ({ type: 'size', value: m })));
    }

    // 检查硬编码边框圆角
    for (const pattern of this.rules.hardcodedBorderRadius) {
      const matches = content.match(pattern) || [];
      const nonCommentMatches = matches.filter(match =>
        !this.isInComment(content, match) &&
        !this.isInString(content, match) &&
        !match.includes('border-radius')
      );
      hardcodedValues.push(...nonCommentMatches.map(m => ({ type: 'borderRadius', value: m })));
    }

    if (hardcodedValues.length === 0) {
      result.passed = true;
    } else {
      const grouped = hardcodedValues.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});

      result.issues.push(`发现硬编码值: ${Object.entries(grouped).map(([type, count]) => `${type}(${count}个)`).join(', ')}`);
    }

    return result;
  }

  /**
   * 检查是否在注释中
   */
  isInComment(content, match) {
    const index = content.indexOf(match);
    const before = content.substring(0, index);
    const lines = before.split('\n');
    const lastLine = lines[lines.length - 1];
    return lastLine.includes('//') || lastLine.includes('/*');
  }

  /**
   * 检查是否在字符串中
   */
  isInString(content, match) {
    const index = content.indexOf(match);
    const before = content.substring(0, index);
    const singleQuoteCount = (before.match(/'/g) || []).length;
    const doubleQuoteCount = (before.match(/"/g) || []).length;
    return (singleQuoteCount % 2) !== 0 || (doubleQuoteCount % 2) !== 0;
  }

  /**
   * 运行完整验证
   */
  async runValidation() {
    console.log('🔍 开始UI组件修复验证...\n');

    const allComponents = [
      ...this.components.center.map(p => ({ path: p, category: 'center' })),
      ...this.components.system.map(p => ({ path: p, category: 'system' })),
      ...this.components.activity.map(p => ({ path: p, category: 'activity' }))
    ];

    for (const component of allComponents) {
      console.log(`📋 验证组件: ${component.path}`);
      const result = this.validateComponent(component.path, component.category);

      this.results.total++;
      if (result.score >= 75) { // 75分以上算通过
        this.results.passed++;
      } else {
        this.results.failed++;
      }

      this.results.details.push(result);

      // 显示简要结果
      const status = result.exists ?
        (result.score >= 75 ? '✅' : '❌') : '⚠️';
      console.log(`   ${status} 得分: ${result.score}/100 (${result.passed}/${result.total}项通过)\n`);
    }

    this.generateReport();
  }

  /**
   * 生成详细报告
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 UI组件修复验证报告');
    console.log('='.repeat(80));

    // 总体统计
    console.log(`\n📈 总体统计:`);
    console.log(`   总组件数: ${this.results.total}`);
    console.log(`   通过验证: ${this.results.passed}`);
    console.log(`   未通过: ${this.results.failed}`);
    console.log(`   通过率: ${Math.round((this.results.passed / this.results.total) * 100)}%`);

    // 分类统计
    const categoryStats = {
      center: { total: 0, passed: 0, avgScore: 0 },
      system: { total: 0, passed: 0, avgScore: 0 },
      activity: { total: 0, passed: 0, avgScore: 0 }
    };

    this.results.details.forEach(result => {
      categoryStats[result.category].total++;
      if (result.score >= 75) categoryStats[result.category].passed++;
      categoryStats[result.category].avgScore += result.score;
    });

    console.log(`\n📋 分类统计:`);
    Object.entries(categoryStats).forEach(([category, stats]) => {
      stats.avgScore = Math.round(stats.avgScore / stats.total);
      const categoryName = {
        center: '中心组件',
        system: '系统管理组件',
        activity: '活动管理组件'
      }[category];

      console.log(`   ${categoryName}:`);
      console.log(`     总数: ${stats.total}, 通过: ${stats.passed}, 平均分: ${stats.avgScore}/100`);
    });

    // 详细问题列表
    const problemComponents = this.results.details.filter(r => r.score < 75);
    if (problemComponents.length > 0) {
      console.log(`\n⚠️  需要修复的组件 (${problemComponents.length}个):`);

      problemComponents.forEach(component => {
        console.log(`\n   📁 ${component.path} (${component.score}/100)`);

        if (!component.exists) {
          console.log(`      ❌ 文件不存在`);
          return;
        }

        Object.entries(component.details).forEach(([aspect, detail]) => {
          if (detail.status === 'fail') {
            const aspectName = {
              imports: '样式导入',
              designTokens: '设计令牌',
              iconSystem: '图标系统',
              hardcodedValues: '硬编码值'
            }[aspect];

            console.log(`      ❌ ${aspectName}:`);
            detail.issues.forEach(issue => {
              console.log(`         • ${issue}`);
            });
          }
        });
      });
    }

    // 优秀组件列表
    const excellentComponents = this.results.details.filter(r => r.score === 100);
    if (excellentComponents.length > 0) {
      console.log(`\n🌟 完美修复的组件 (${excellentComponents.length}个):`);
      excellentComponents.forEach(component => {
        console.log(`   ✅ ${component.path}`);
      });
    }

    // 质量评估
    const overallScore = Math.round(
      this.results.details.reduce((sum, r) => sum + r.score, 0) / this.results.total
    );

    console.log(`\n🎯 整体质量评估: ${overallScore}/100`);

    let qualityLevel = '';
    if (overallScore >= 90) qualityLevel = '优秀 🏆';
    else if (overallScore >= 80) qualityLevel = '良好 👍';
    else if (overallScore >= 70) qualityLevel = '合格 ✅';
    else if (overallScore >= 60) qualityLevel = '需改进 ⚠️';
    else qualityLevel = '不合格 ❌';

    console.log(`   质量等级: ${qualityLevel}`);

    // 生成JSON报告文件
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        passRate: Math.round((this.results.passed / this.results.total) * 100),
        overallScore
      },
      categoryStats,
      components: this.results.details,
      excellentComponents: excellentComponents.map(c => c.path),
      problemComponents: problemComponents.map(c => c.path)
    };

    const reportPath = path.resolve('ui-component-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 详细报告已保存至: ${reportPath}`);
  }
}

// 运行验证
if (require.main === module) {
  const validator = new ComponentValidator();
  validator.runValidation().catch(console.error);
}

module.exports = ComponentValidator;