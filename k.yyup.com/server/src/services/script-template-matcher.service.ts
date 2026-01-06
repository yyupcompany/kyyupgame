/**
 * 话术模板匹配服务
 * 根据ASR识别的文本，匹配最合适的话术模板
 */

import ScriptTemplate from '../models/script-template.model';
import { Op } from 'sequelize';

interface MatchResult {
  template: ScriptTemplate | null;
  score: number;
  matchedKeywords: string[];
}

export class ScriptTemplateMatcherService {
  private static instance: ScriptTemplateMatcherService;

  private constructor() {}

  public static getInstance(): ScriptTemplateMatcherService {
    if (!ScriptTemplateMatcherService.instance) {
      ScriptTemplateMatcherService.instance = new ScriptTemplateMatcherService();
    }
    return ScriptTemplateMatcherService.instance;
  }

  /**
   * 匹配话术模板
   * @param userInput ASR识别的用户输入
   * @param category 可选的分类过滤
   * @returns 匹配结果
   */
  public async matchTemplate(
    userInput: string,
    category?: string
  ): Promise<MatchResult> {
    try {
      console.log(`🔍 开始匹配话术模板: "${userInput}"`);

      // 1. 获取所有激活的话术模板
      const whereClause: any = { status: 'active' };
      if (category) {
        whereClause.category = category;
      }

      const templates = await ScriptTemplate.findAll({
        where: whereClause,
        order: [['priority', 'DESC'], ['usageCount', 'DESC']],
      });

      if (templates.length === 0) {
        console.log('⚠️  没有找到激活的话术模板');
        return { template: null, score: 0, matchedKeywords: [] };
      }

      // 2. 对每个模板计算匹配分数
      const matches: Array<{
        template: ScriptTemplate;
        score: number;
        matchedKeywords: string[];
      }> = [];

      for (const template of templates) {
        const keywords = template.getKeywordsArray();
        const { score, matchedKeywords } = this.calculateMatchScore(
          userInput,
          keywords,
          template.priority
        );

        if (score > 0) {
          matches.push({ template, score, matchedKeywords });
        }
      }

      // 3. 按分数排序，返回最高分的模板
      if (matches.length === 0) {
        console.log('⚠️  没有匹配到任何话术模板');
        return { template: null, score: 0, matchedKeywords: [] };
      }

      matches.sort((a, b) => b.score - a.score);
      const bestMatch = matches[0];

      console.log(`✅ 匹配到话术模板: "${bestMatch.template.title}" (分数: ${bestMatch.score}, 关键词: ${bestMatch.matchedKeywords.join(', ')})`);

      return bestMatch;
    } catch (error) {
      console.error('❌ 匹配话术模板失败:', error);
      return { template: null, score: 0, matchedKeywords: [] };
    }
  }

  /**
   * 计算匹配分数
   * @param userInput 用户输入
   * @param keywords 关键词列表
   * @param priority 优先级
   * @returns 匹配分数和匹配到的关键词
   */
  private calculateMatchScore(
    userInput: string,
    keywords: string[],
    priority: number
  ): { score: number; matchedKeywords: string[] } {
    const normalizedInput = userInput.toLowerCase().trim();
    const matchedKeywords: string[] = [];
    let baseScore = 0;

    // 1. 精确匹配（权重：10分）
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.toLowerCase().trim();
      if (normalizedInput === normalizedKeyword) {
        baseScore += 10;
        matchedKeywords.push(keyword);
      }
    }

    // 2. 包含匹配（权重：5分）
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.toLowerCase().trim();
      if (normalizedInput.includes(normalizedKeyword) && !matchedKeywords.includes(keyword)) {
        baseScore += 5;
        matchedKeywords.push(keyword);
      }
    }

    // 3. 模糊匹配（权重：2分）
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.toLowerCase().trim();
      if (this.fuzzyMatch(normalizedInput, normalizedKeyword) && !matchedKeywords.includes(keyword)) {
        baseScore += 2;
        matchedKeywords.push(keyword);
      }
    }

    // 4. 加上优先级权重（优先级 * 0.5）
    const finalScore = baseScore + (priority * 0.5);

    return { score: finalScore, matchedKeywords };
  }

  /**
   * 模糊匹配（使用编辑距离）
   * @param str1 字符串1
   * @param str2 字符串2
   * @returns 是否模糊匹配
   */
  private fuzzyMatch(str1: string, str2: string): boolean {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    const similarity = 1 - distance / maxLength;
    return similarity >= 0.7; // 相似度阈值70%
  }

  /**
   * 计算编辑距离（Levenshtein Distance）
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,     // 删除
            dp[i][j - 1] + 1,     // 插入
            dp[i - 1][j - 1] + 1  // 替换
          );
        }
      }
    }

    return dp[m][n];
  }

  /**
   * 获取默认话术（当没有匹配到任何模板时使用）
   */
  public async getDefaultTemplate(): Promise<ScriptTemplate | null> {
    try {
      const defaultTemplate = await ScriptTemplate.findOne({
        where: {
          status: 'active',
          category: 'other',
          keywords: {
            [Op.like]: '%默认%',
          },
        },
        order: [['priority', 'DESC']],
      });

      return defaultTemplate;
    } catch (error) {
      console.error('❌ 获取默认话术失败:', error);
      return null;
    }
  }

  /**
   * 根据分类获取话术模板
   */
  public async getTemplatesByCategory(category: string): Promise<ScriptTemplate[]> {
    try {
      return await ScriptTemplate.findAll({
        where: {
          status: 'active',
          category,
        },
        order: [['priority', 'DESC'], ['usageCount', 'DESC']],
      });
    } catch (error) {
      console.error(`❌ 获取分类话术失败 (${category}):`, error);
      return [];
    }
  }

  /**
   * 记录话术使用情况
   */
  public async recordUsage(templateId: number, isSuccess: boolean): Promise<void> {
    try {
      const template = await ScriptTemplate.findByPk(templateId);
      if (template) {
        await template.incrementUsage();
        await template.updateSuccessRate(isSuccess);
        console.log(`📊 记录话术使用: ID=${templateId}, 成功=${isSuccess}`);
      }
    } catch (error) {
      console.error('❌ 记录话术使用失败:', error);
    }
  }
}

// 导出单例
export const scriptTemplateMatcherService = ScriptTemplateMatcherService.getInstance();

