/**
 * 关联别名验证工具
 * 用于检测和防止模型关联中的别名冲突
 */

import { Model } from 'sequelize';

// 存储已使用的别名
const usedAliases: Map<string, string[]> = new Map();
// 记录别名的使用次数
const aliasUsageCount: Map<string, number> = new Map();
// 记录冲突的别名
const conflictingAliases: Map<string, string[]> = new Map();

/**
 * 检查别名是否已被使用
 * @param alias 要检查的别名
 * @param sourceModel 源模型名称
 * @param targetModel 目标模型名称
 * @returns 如果别名可用返回true，否则返回false
 */
export function validateAlias(alias: string, sourceModel: string, targetModel: string): boolean {
  if (!alias) {
    return true; // 没有指定别名，使用默认关联名
  }

  // 增加别名使用计数
  aliasUsageCount.set(alias, (aliasUsageCount.get(alias) || 0) + 1);

  // 如果别名已经存在
  if (usedAliases.has(alias)) {
    const existingAssociations = usedAliases.get(alias) || [];
    const currentAssociation = `${sourceModel} -> ${targetModel}`;
    
    // 添加当前关联到已使用列表
    existingAssociations.push(currentAssociation);
    usedAliases.set(alias, existingAssociations);
    
    // 记录冲突
    if (!conflictingAliases.has(alias)) {
      conflictingAliases.set(alias, [existingAssociations[0], currentAssociation]);
    } else {
      conflictingAliases.get(alias)?.push(currentAssociation);
    }
    
    console.warn(`警告：别名 "${alias}" 已被使用于 ${existingAssociations[0]}`);
    console.warn(`现在尝试在 ${currentAssociation} 中再次使用该别名`);
    console.warn('这可能导致Sequelize抛出AssociationError错误');
    return false;
  }

  // 记录新别名
  usedAliases.set(alias, [`${sourceModel} -> ${targetModel}`]);
  return true;
}

/**
 * 注册关联别名
 * @param sourceModel 源模型
 * @param targetModel 目标模型
 * @param alias 关联别名
 */
export function registerAlias(
  sourceModel: typeof Model | string, 
  targetModel: typeof Model | string, 
  alias: string
): void {
  const sourceName = typeof sourceModel === 'string' ? sourceModel : sourceModel.name;
  const targetName = typeof targetModel === 'string' ? targetModel : targetModel.name;
  
  validateAlias(alias, sourceName, targetName);
}

/**
 * 重置别名验证器（主要用于测试）
 */
export function resetAliasValidator(): void {
  usedAliases.clear();
  aliasUsageCount.clear();
  conflictingAliases.clear();
}

/**
 * 获取所有已注册的别名
 * @returns 所有已注册的别名及其关联关系
 */
export function getRegisteredAliases(): Record<string, string[]> {
  return Object.fromEntries(usedAliases.entries());
}

/**
 * 获取所有冲突的别名
 * @returns 所有冲突的别名及其关联关系
 */
export function getConflictingAliases(): Record<string, string[]> {
  return Object.fromEntries(conflictingAliases.entries());
}

/**
 * 检查别名是否与模型名冲突
 * @param alias 要检查的别名
 * @param modelNames 所有模型名称数组
 */
export function checkAliasModelConflict(alias: string, modelNames: string[]): boolean {
  const conflictingModel = modelNames.find(
    modelName => modelName.toLowerCase() === alias.toLowerCase()
  );
  
  if (conflictingModel) {
    console.warn(`警告：别名 "${alias}" 与模型名 "${conflictingModel}" 存在潜在冲突`);
    return false;
  }
  
  return true;
}

/**
 * 生成别名使用报告
 * @returns Markdown格式的别名使用报告
 */
export function generateAliasReport(): string {
  let report = '# 模型别名使用报告\n\n';
  
  // 重复使用的别名
  report += '## 重复使用的别名\n\n';
  conflictingAliases.forEach((usages, alias) => {
    report += `### ${alias} (使用次数: ${aliasUsageCount.get(alias) || 0})\n`;
    usages.forEach(usage => {
      report += `- ${usage}\n`;
    });
    report += '\n';
  });
  
  // 与模型名冲突的别名
  report += '## 与模型名冲突的别名\n\n';
  // 这里需要外部传入modelNames，此函数仅作为示例
  
  return report;
}

/**
 * 获取别名使用统计
 * @returns 所有别名的使用次数
 */
export function getAliasUsageStats(): Record<string, number> {
  return Object.fromEntries(aliasUsageCount.entries());
}

export default {
  validateAlias,
  registerAlias,
  resetAliasValidator,
  getRegisteredAliases,
  getConflictingAliases,
  checkAliasModelConflict,
  generateAliasReport,
  getAliasUsageStats
}; 