#!/usr/bin/env node

/**
 * UI组件修复建议工具
 * 基于验证结果生成具体的修复建议和代码示例
 */

const fs = require('fs');
const path = require('path');

class ComponentFixRecommender {
  constructor() {
    this.fixRecommendations = {
      missingImports: {
        issue: '缺少必需的样式导入',
        solution: `在<style>标签前添加以下导入语句：

<style lang="scss" scoped>
@import "@/styles/design-tokens.scss";
@import "@/styles/list-components-optimization.scss";

// 现有的样式代码...
</style>`,
        priority: 'high'
      },

      insufficientDesignTokens: {
        issue: 'CSS变量使用不足',
        solution: `将硬编码的CSS值替换为设计令牌变量：

// 常见的设计令牌替换示例：
background: #ffffff; → background: var(--bg-color);
background: #f5f7fa; → background: var(--bg-color-page);
color: #303133; → color: var(--text-color-primary);
color: #909399; → color: var(--text-color-regular);
color: #606266; → color: var(--text-color-secondary);
border: 1px solid #e4e7ed; → border: 1px solid var(--border-color-light);
border-radius: 4px; → border-radius: var(--border-radius-base);
padding: 12px; → padding: var(--spacing-md);
margin: 16px; → margin: var(--spacing-lg);
box-shadow: 0 2px 4px rgba(0,0,0,0.1); → box-shadow: var(--shadow-base);`,
        priority: 'high'
      },

      incorrectIconUsage: {
        issue: '图标系统使用不正确',
        solution: `使用UnifiedIcon组件替代错误的图标用法：

<!-- 错误用法 -->
<el-icon><Edit /></el-icon>
<i class="el-icon-edit"></i>

<!-- 正确用法 -->
<UnifiedIcon name="Edit" :size="16" />

<!-- 常用图标名称 -->
UnifiedIcon name="Edit"          <!-- 编辑 -->
UnifiedIcon name="Delete"        <!-- 删除 -->
UnifiedIcon name="Plus"          <!-- 添加 -->
UnifiedIcon name="Search"        <!-- 搜索 -->
UnifiedIcon name="View"          <!-- 查看 -->
UnifiedIcon name="Download"      <!-- 下载 -->
UnifiedIcon name="Upload"        <!-- 上传 -->
UnifiedIcon name="Setting"       <!-- 设置 -->
UnifiedIcon name="Close"         <!-- 关闭 -->
UnifiedIcon name="Check"         <!-- 确认 -->
UnifiedIcon name="Warning"       <!-- 警告 -->
UnifiedIcon name="Info"          <!-- 信息 -->
UnifiedIcon name="ArrowUp"       <!-- 向上箭头 -->
UnifiedIcon name="ArrowDown"     <!-- 向下箭头 -->
UnifiedIcon name="ArrowLeft"     <!-- 向左箭头 -->
UnifiedIcon name="ArrowRight"    <!-- 向右箭头 -->

<!-- 使用示例 -->
<UnifiedIcon
  name="Edit"
  :size="14"
  :color="var(--text-color-primary)"
  @click="handleEdit"
/>`,
        priority: 'medium'
      },

      hardcodedValues: {
        issue: '存在硬编码的CSS值',
        solution: `将硬编码值替换为对应的CSS变量：

// 颜色值替换
#ffffff → var(--bg-color)
#f5f7fa → var(--bg-color-page)
#ffffff → var(--bg-color-container)
#303133 → var(--text-color-primary)
#606266 → var(--text-color-secondary)
#909399 → var(--text-color-regular)
#c0c4cc → var(--text-color-placeholder)
#409eff → var(--color-primary)
#67c23a → var(--color-success)
#e6a23c → var(--color-warning)
#f56c6c → var(--color-danger)
#909399 → var(--color-info)
#e4e7ed → var(--border-color-light)
#dcdfe6 → var(--border-color-base)
#c0c4cc → var(--border-color-lighter)

// 尺寸值替换
0px → 0
1px → 1px (边框可以保留)
2px → 2px (边框可以保留)
4px → var(--border-radius-base) / var(--spacing-xs)
6px → var(--border-radius-small) / var(--spacing-sm)
8px → var(--border-radius-round) / var(--spacing-md)
12px → var(--spacing-md)
16px → var(--spacing-lg)
20px → var(--spacing-xl)
24px → var(--spacing-xxl)

// 阴影替换
box-shadow: 0 2px 4px rgba(0,0,0,0.1) → box-shadow: var(--shadow-base)
box-shadow: 0 4px 8px rgba(0,0,0,0.1) → box-shadow: var(--shadow-light)
box-shadow: 0 8px 16px rgba(0,0,0,0.1) → box-shadow: var(--shadow-medium)`,
        priority: 'high'
      }
    };
  }

  /**
   * 生成修复建议报告
   */
  generateFixReport(validationResults) {
    console.log('\n' + '='.repeat(80));
    console.log('🔧 UI组件修复建议报告');
    console.log('='.repeat(80));

    const problemComponents = validationResults.components.filter(c => c.score < 75);

    if (problemComponents.length === 0) {
      console.log('\n🎉 所有组件都符合标准，无需修复！');
      return;
    }

    console.log(`\n📋 需要修复的组件 (${problemComponents.length}个):`);

    problemComponents.forEach(component => {
      console.log(`\n📁 ${component.path} (当前得分: ${component.score}/100)`);

      Object.entries(component.details).forEach(([aspect, detail]) => {
        if (detail.status === 'fail') {
          const aspectName = {
            imports: '样式导入',
            designTokens: '设计令牌',
            iconSystem: '图标系统',
            hardcodedValues: '硬编码值'
          }[aspect];

          console.log(`\n   🔧 修复 ${aspectName}:`);

          // 根据问题类型生成具体建议
          const recommendations = this.getSpecificRecommendations(aspect, detail.issues);
          recommendations.forEach(rec => {
            console.log(`      ❌ 问题: ${rec.problem}`);
            console.log(`      ✅ 解决方案:`);
            console.log(`      ${rec.solution}\n`);
          });
        }
      });

      console.log('   ' + '-'.repeat(60));
    });

    // 生成优先级修复计划
    this.generatePriorityPlan(problemComponents);
  }

  /**
   * 获取具体的修复建议
   */
  getSpecificRecommendations(aspect, issues) {
    const recommendations = [];

    switch (aspect) {
      case 'imports':
        recommendations.push({
          problem: issues[0],
          solution: this.fixRecommendations.missingImports.solution
        });
        break;

      case 'designTokens':
        recommendations.push({
          problem: issues[0],
          solution: this.fixRecommendations.insufficientDesignTokens.solution
        });
        break;

      case 'iconSystem':
        recommendations.push({
          problem: issues[0],
          solution: this.fixRecommendations.incorrectIconUsage.solution
        });
        break;

      case 'hardcodedValues':
        recommendations.push({
          problem: issues[0],
          solution: this.fixRecommendations.hardcodedValues.solution
        });
        break;
    }

    return recommendations;
  }

  /**
   * 生成优先级修复计划
   */
  generatePriorityPlan(problemComponents) {
    console.log('\n🎯 优先级修复计划:');
    console.log('\n🔴 高优先级 (核心样式问题):');

    const highPriorityComponents = problemComponents.filter(c =>
      c.details.imports.status === 'fail' ||
      c.details.designTokens.status === 'fail'
    );

    highPriorityComponents.forEach(component => {
      const reasons = [];
      if (component.details.imports.status === 'fail') reasons.push('缺少样式导入');
      if (component.details.designTokens.status === 'fail') reasons.push('设计令牌不足');

      console.log(`   • ${component.path} - ${reasons.join(', ')}`);
    });

    console.log('\n🟡 中优先级 (图标和硬编码值问题):');

    const mediumPriorityComponents = problemComponents.filter(c =>
      c.details.imports.status === 'pass' &&
      c.details.designTokens.status === 'pass' &&
      (c.details.iconSystem.status === 'fail' || c.details.hardcodedValues.status === 'fail')
    );

    mediumPriorityComponents.forEach(component => {
      const reasons = [];
      if (component.details.iconSystem.status === 'fail') reasons.push('图标系统');
      if (component.details.hardcodedValues.status === 'fail') reasons.push('硬编码值');

      console.log(`   • ${component.path} - ${reasons.join(', ')}`);
    });

    // 生成批量修复脚本建议
    this.generateBatchFixSuggestions(problemComponents);
  }

  /**
   * 生成批量修复建议
   */
  generateBatchFixSuggestions(problemComponents) {
    console.log('\n🔧 批量修复建议:');
    console.log('\n1. 批量添加样式导入:');
    console.log('   对于缺少样式导入的组件，可以统一添加以下导入语句：');
    console.log(this.fixRecommendations.missingImports.solution);

    console.log('\n2. 批量替换常用硬编码值:');
    console.log('   可以使用正则表达式批量替换以下模式：');
    console.log('   • 颜色值: #([0-9a-fA-F]{6}) → var(--color-xxx)');
    console.log('   • 尺寸值: (\\d+)px → var(--spacing-xxx)');
    console.log('   • 圆角: border-radius: (\\d+)px → border-radius: var(--border-radius-xxx)');

    console.log('\n3. 批量替换图标组件:');
    console.log('   搜索所有 <el-icon> 和 class="el-icon-" 的使用，替换为 UnifiedIcon');

    // 生成自动化修复脚本模板
    this.generateAutoFixScript(problemComponents);
  }

  /**
   * 生成自动化修复脚本
   */
  generateAutoFixScript(problemComponents) {
    const autoFixScript = `#!/usr/bin/env node

/**
 * 自动化修复脚本
 * 基于验证结果自动修复组件问题
 */

const fs = require('fs');
const path = require('path');

const componentsToFix = ${JSON.stringify(problemComponents.map(c => c.path), null, 2)};

// 修复规则
const fixRules = {
  // 添加样式导入
  addImports: (content) => {
    if (!content.includes('@import "@/styles/design-tokens.scss"')) {
      content = content.replace(
        /<style lang="scss" scoped>/,
        '<style lang="scss" scoped>\\n@import "@/styles/design-tokens.scss";\\n@import "@/styles/list-components-optimization.scss";\\n'
      );
    }
    return content;
  },

  // 替换颜色值
  replaceColors: (content) => {
    const colorMap = {
      '#ffffff': 'var(--bg-color)',
      '#f5f7fa': 'var(--bg-color-page)',
      '#303133': 'var(--text-color-primary)',
      '#606266': 'var(--text-color-secondary)',
      '#909399': 'var(--text-color-regular)',
      '#e4e7ed': 'var(--border-color-light)',
      '#409eff': 'var(--color-primary)',
      '#67c23a': 'var(--color-success)',
      '#e6a23c': 'var(--color-warning)',
      '#f56c6c': 'var(--color-danger)'
    };

    Object.entries(colorMap).forEach(([hex, variable]) => {
      const regex = new RegExp(\`(?<!var\\\\()\\\\$\{hex}\\\\b\`, 'g');
      content = content.replace(regex, variable);
    });

    return content;
  },

  // 替换尺寸值
  replaceSizes: (content) => {
    const sizeMap = {
      '4px': 'var(--border-radius-base)',
      '6px': 'var(--border-radius-small)',
      '8px': 'var(--border-radius-round)',
      '12px': 'var(--spacing-md)',
      '16px': 'var(--spacing-lg)',
      '20px': 'var(--spacing-xl)',
      '24px': 'var(--spacing-xxl)'
    };

    Object.entries(sizeMap).forEach(([size, variable]) => {
      const regex = new RegExp(\`\\\\b\${size}\\\\b\`, 'g');
      content = content.replace(regex, variable);
    });

    return content;
  }
};

// 执行修复
componentsToFix.forEach(componentPath => {
  const fullPath = path.resolve(componentPath);

  if (!fs.existsSync(fullPath)) {
    console.log(\`⚠️  文件不存在: \${fullPath}\`);
    return;
  }

  console.log(\`🔧 修复组件: \${componentPath}\`);

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // 应用修复规则
  content = fixRules.addImports(content);
  content = fixRules.replaceColors(content);
  content = fixRules.replaceSizes(content);

  // 保存修复后的文件
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(\`   ✅ 已修复\`);
  } else {
    console.log(\`   ℹ️  无需修复\`);
  }
});

console.log('\\n🎉 自动修复完成！');
`;

    const scriptPath = path.resolve('auto-fix-components.js');
    fs.writeFileSync(scriptPath, autoFixScript);
    console.log(`\n📄 自动修复脚本已生成: ${scriptPath}`);
    console.log('   ⚠️  运行前请先备份代码：');
    console.log('      cp -r src src-backup');
    console.log('      node auto-fix-components.js');
  }
}

// 主执行函数
function main() {
  // 读取验证报告
  const reportPath = path.resolve('ui-component-validation-report.json');

  if (!fs.existsSync(reportPath)) {
    console.log('❌ 未找到验证报告文件，请先运行验证脚本：');
    console.log('   node validate-ui-components.cjs');
    return;
  }

  const validationResults = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  const recommender = new ComponentFixRecommender();
  recommender.generateFixReport(validationResults);
}

if (require.main === module) {
  main();
}

module.exports = ComponentFixRecommender;