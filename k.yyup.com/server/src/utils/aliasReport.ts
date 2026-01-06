/**
 * 别名报告生成工具
 * 用于生成模型关联别名使用情况的报告
 */

import aliasValidator from './aliasValidator';
import fs from 'fs';
import path from 'path';

/**
 * 别名报告生成器
 */
class AliasReportGenerator {
  /**
   * 生成别名使用报告
   * @param modelNames 所有模型名称数组
   * @returns Markdown格式的别名使用报告
   */
  generateReport(modelNames: string[]): string {
    let report = '# 模型别名使用报告\n\n';
    
    // 获取所有已注册的别名
    const allAliases = aliasValidator.getRegisteredAliases();
    
    // 获取所有冲突的别名
    const conflictingAliases = aliasValidator.getConflictingAliases();
    
    // 获取别名使用统计
    const aliasStats = aliasValidator.getAliasUsageStats();
    
    // 添加冲突别名部分
    report += '## 别名冲突情况\n\n';
    if (Object.keys(conflictingAliases).length === 0) {
      report += '目前没有发现别名冲突。\n\n';
    } else {
      Object.entries(conflictingAliases).forEach(([alias, usages]) => {
        report += `### 别名: ${alias} (使用次数: ${aliasStats[alias] || 0})\n`;
        usages.forEach(usage => {
          report += `- ${usage}\n`;
        });
        report += '\n';
      });
    }
    
    // 添加与模型名冲突的别名
    report += '## 与模型名冲突的别名\n\n';
    const modelConflicts: Record<string, string[]> = {};
    
    Object.keys(allAliases).forEach(alias => {
      const conflictingModel = modelNames.find(
        modelName => modelName.toLowerCase() === alias.toLowerCase()
      );
      
      if (conflictingModel) {
        if (!modelConflicts[alias]) {
          modelConflicts[alias] = [];
        }
        allAliases[alias].forEach(usage => {
          modelConflicts[alias].push(`${usage} (冲突模型: ${conflictingModel})`);
        });
      }
    });
    
    if (Object.keys(modelConflicts).length === 0) {
      report += '目前没有发现与模型名冲突的别名。\n\n';
    } else {
      Object.entries(modelConflicts).forEach(([alias, usages]) => {
        report += `### 别名: ${alias}\n`;
        usages.forEach(usage => {
          report += `- ${usage}\n`;
        });
        report += '\n';
      });
    }
    
    // 添加别名使用频率统计
    report += '## 别名使用频率统计\n\n';
    report += '| 别名 | 使用次数 |\n';
    report += '|------|----------|\n';
    
    // 按使用频率降序排列
    const sortedAliases = Object.entries(aliasStats)
      .sort(([, countA], [, countB]) => countB - countA);
    
    sortedAliases.forEach(([alias, count]) => {
      report += `| ${alias} | ${count} |\n`;
    });
    
    report += '\n';
    
    // 添加别名优化建议
    report += '## 别名优化建议\n\n';
    
    // 对于使用频率高的别名
    const highUsageAliases = sortedAliases
      .filter(([, count]) => count > 1)
      .map(([alias]) => alias);
    
    if (highUsageAliases.length > 0) {
      report += '### 高频使用的别名\n\n';
      report += '以下别名被多次使用，建议添加前缀或使用更具体的名称：\n\n';
      
      highUsageAliases.forEach(alias => {
        report += `- \`${alias}\` (使用次数: ${aliasStats[alias]})\n`;
        report += `  - 建议替代: \`${this.suggestAlternative(alias)}\`\n`;
      });
      
      report += '\n';
    }
    
    // 对于与模型名冲突的别名
    if (Object.keys(modelConflicts).length > 0) {
      report += '### 与模型名冲突的别名\n\n';
      report += '以下别名与模型名冲突，建议修改：\n\n';
      
      Object.keys(modelConflicts).forEach(alias => {
        report += `- \`${alias}\` 与模型 \`${modelNames.find(m => m.toLowerCase() === alias.toLowerCase())}\` 冲突\n`;
        report += `  - 建议替代: \`${this.suggestAlternative(alias)}\`\n`;
      });
      
      report += '\n';
    }
    
    return report;
  }
  
  /**
   * 保存别名报告到文件
   * @param report 报告内容
   * @param filePath 保存路径
   */
  saveReportToFile(report: string, filePath: string): void {
    try {
      // 确保目录存在
      const dirname = path.dirname(filePath);
      if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
      }
      
      // 写入文件
      fs.writeFileSync(filePath, report, 'utf8');
      console.log(`别名报告已保存到: ${filePath}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`保存别名报告失败: ${errorMessage}`);
    }
  }
  
  /**
   * 为冲突别名建议替代名称
   * @param alias 原别名
   * @returns 建议的替代别名
   */
  private suggestAlternative(alias: string): string {
    // 简单策略：添加前缀或后缀
    const suggestions = [
      `${alias}Item`,
      `related${alias.charAt(0).toUpperCase() + alias.slice(1)}`,
      `${alias}Association`,
    ];
    
    // 特殊情况处理
    switch (alias.toLowerCase()) {
      case 'user':
        return 'relatedUser 或 userAccount';
      case 'role':
        return 'assignedRole 或 userRole';
      case 'parent':
        return 'studentParent 或 parentInfo';
      case 'class':
        return 'assignedClass 或 studentClass';
      case 'student':
        return 'enrolledStudent 或 classStudent';
      case 'teacher':
        return 'classTeacher 或 courseTeacher';
      case 'plan':
        return 'enrollmentPlan 或 activityPlan';
      case 'creator':
        return 'createdByUser 或 recordCreator';
      case 'updater':
        return 'updatedByUser 或 recordUpdater';
      default:
        return suggestions[0];
    }
  }
}

export default new AliasReportGenerator(); 