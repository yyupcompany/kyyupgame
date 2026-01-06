/**
 * 网络搜索工具
 * 实现真正的网络搜索功能，集成火山引擎融合搜索
 *
 * 参考实现：commit 6175a0ec
 */

import axios from 'axios';
import { logger } from '../../../../utils/logger';
import modelConfigService from '../../ai-model-config.service';

// 搜索结果接口
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishTime?: string;
  source?: string;
  relevanceScore?: number;
}

// 搜索响应接口
interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
  relatedQueries?: string[];
  aiSummary?: string;
}

/**
 * 网络搜索工具类
 */
export class WebSearchTool {
  private searchCache: Map<string, { data: SearchResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10分钟缓存

  /**
   * 执行网络搜索
   */
  async search(query: string, options: {
    maxResults?: number;
    language?: string;
    enableAISummary?: boolean;
  } = {}): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      // 检查缓存
      const cacheKey = `${query}_${JSON.stringify(options)}`;
      const cached = this.searchCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        logger.info(`🔍 网络搜索缓存命中: ${query}`);
        return cached.data;
      }

      logger.info(`🔍 开始网络搜索: ${query}`);

      // 获取搜索模型配置（使用"search"能力的默认模型）
      const searchModel = await modelConfigService.getDefaultModel('search');
      if (!searchModel || searchModel.isActive === false) {
        throw new Error('搜索服务未配置或未启用，请联系管理员配置火山引擎搜索API');
      }

      // 构建搜索请求
      const searchParams = {
        query: query,
        max_results: options.maxResults || 10,
        language: options.language || 'zh-CN',
        enable_ai_summary: options.enableAISummary || true
      };

      // 调用火山引擎搜索API
      const response = await this.callVolcanoSearch(searchModel, searchParams);

      const searchTime = Date.now() - startTime;

      // 解析搜索响应
      let searchResults: SearchResult[] = [];
      let aiSummary = '';
      let totalResults = 0;

      if (response && response.Result) {
        // 解析搜索结果
        if (Array.isArray(response.Result.WebResults)) {
          searchResults = response.Result.WebResults.map((item: any) => ({
            title: item.Title || item.title || '无标题',
            url: item.Url || item.url || '',
            snippet: item.Snippet || item.snippet || item.Summary || item.summary || '',
            publishTime: item.PublishTime || item.publishTime,
            source: item.SiteName || item.siteName || '网络',
            relevanceScore: item.RankScore || item.rankScore || 0
          }));
          totalResults = response.Result.ResultCount || searchResults.length;
          logger.info(`✅ 解析到 ${searchResults.length} 个搜索结果`);
        }

        // 解析AI总结
        if (Array.isArray(response.Result.Choices)) {
          const summaryParts = response.Result.Choices
            .filter((choice: any) => choice.Delta && choice.Delta.Content)
            .map((choice: any) => choice.Delta.Content);
          aiSummary = summaryParts.join('');
          if (aiSummary) {
            logger.info(`✅ 获取到AI总结: ${aiSummary.length} 字符`);
          }
        }
      }

      // 检查是否有有效结果
      if (searchResults.length === 0 && !aiSummary) {
        logger.warn(`⚠️ API返回空结果: ${query}`);
        // 即使没有搜索结果，也返回空响应而不是模拟数据
        const emptyResponse: SearchResponse = {
          query,
          results: [],
          totalResults: 0,
          searchTime,
          suggestions: [],
          relatedQueries: [],
          aiSummary: ''
        };
        return emptyResponse;
      }

      const searchResponse: SearchResponse = {
        query,
        results: searchResults,
        totalResults,
        searchTime,
        suggestions: [],
        relatedQueries: [],
        aiSummary
      };

      // 缓存结果
      this.searchCache.set(cacheKey, {
        data: searchResponse,
        timestamp: Date.now()
      });

      // 清理过期缓存
      this.cleanExpiredCache();

      logger.info(`✅ 网络搜索完成: ${query}, 找到 ${searchResponse.results.length} 条结果, 耗时 ${searchTime}ms`);
      return searchResponse;

    } catch (error) {
      logger.error(`❌ 网络搜索失败: ${query}`, error);
      // 抛出错误，不使用模拟数据
      throw new Error(`网络搜索失败: ${(error as Error).message || '未知错误'}`);
    }
  }

  /**
   * 调用火山引擎融合搜索API
   */
  private async callVolcanoSearch(model: any, params: any): Promise<any> {
    try {
      // 构建请求体格式
      const requestBody = {
        Query: params.query,
        SearchType: "web_summary",
        Count: params.max_results || 10,
        NeedSummary: true
      };

      logger.info('🔍 发送火山引擎搜索请求:', {
        url: model.apiEndpoint,
        query: requestBody.Query
      });

      const response = await axios.post(model.apiEndpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${model.apiKey || process.env.VOLCANO_API_KEY || 'demo-key'}`,
          'User-Agent': 'YY-AI-Assistant/1.0'
        },
        timeout: 30000
      });

      logger.info('📡 搜索API响应状态:', response.status);

      // 检查API响应是否包含错误
      if (response.data && response.data.ResponseMetadata && response.data.ResponseMetadata.Error) {
        const error = response.data.ResponseMetadata.Error;
        logger.warn(`🚫 搜索API错误: ${error.Code} - ${error.Message}`);
        throw new Error(`API错误: ${error.Message}`);
      }

      return response.data;
    } catch (error) {
      logger.error('🔄 火山引擎搜索API调用失败', error);
      throw error;
    }
  }

  /**
   * 获取模拟搜索结果（已弃用 - 不再使用模拟数据，仅使用真实搜索）
   * @deprecated 此方法已弃用，系统现在只使用真实的火山引擎搜索API
   */
  private getMockSearchResults(query: string, searchTime: number): SearchResponse {
    const mockResults: SearchResult[] = [
      {
        title: `关于"${query}"的最新信息`,
        url: 'https://example.com/search-result-1',
        snippet: `这是关于${query}的详细信息。根据最新的政策和规定，相关内容包括...`,
        publishTime: new Date().toISOString(),
        source: '教育部官网',
        relevanceScore: 0.95
      },
      {
        title: `${query} - 专业解读和分析`,
        url: 'https://example.com/search-result-2',
        snippet: `专家对${query}进行了深入分析，指出了关键要点和实施建议...`,
        publishTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        source: '中国教育新闻网',
        relevanceScore: 0.88
      },
      {
        title: `${query}的实践案例和经验分享`,
        url: 'https://example.com/search-result-3',
        snippet: `多个幼儿园在${query}方面的成功实践，为其他机构提供了宝贵经验...`,
        publishTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        source: '学前教育网',
        relevanceScore: 0.82
      }
    ];

    return {
      query,
      results: mockResults,
      totalResults: mockResults.length,
      searchTime,
      suggestions: [`${query}政策解读`, `${query}实施指南`, `${query}案例分析`],
      relatedQueries: [`${query}最新动态`, `${query}实践经验`, `${query}专家观点`]
    };
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.searchCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.searchCache.delete(key);
      }
    }
  }

  /**
   * 检查搜索查询是否需要网络搜索
   */
  static shouldUseWebSearch(query: string): boolean {
    const webSearchKeywords = [
      '搜索', '查找', '搜一下', '找一下', '网上', '最新', '新闻', '政策',
      '资讯', '信息', '了解', '什么是', '如何', '怎么', '为什么',
      '最近', '今天', '昨天', '本周', '本月', '今年', '趋势', '动态'
    ];

    return webSearchKeywords.some(keyword => query.includes(keyword)) ||
           query.includes('?') || query.includes('？') ||
           query.length > 20;
  }

  /**
   * 格式化搜索结果为文本
   */
  static formatSearchResults(searchResponse: SearchResponse): string {
    const { query, results, totalResults, searchTime, aiSummary } = searchResponse;

    let formatted = `🔍 网络搜索结果 - "${query}"\n`;
    formatted += `📊 找到 ${totalResults} 条相关信息，搜索耗时 ${searchTime}ms\n\n`;

    // 如果有AI总结，优先显示
    if (aiSummary && aiSummary.trim()) {
      formatted += `🤖 AI智能总结：\n${aiSummary.trim()}\n\n`;
    }

    // 显示搜索结果
    if (results && results.length > 0) {
      formatted += `📋 详细搜索结果：\n\n`;
      results.slice(0, 5).forEach((result, index) => {
        formatted += `${index + 1}. **${result.title}**\n`;
        formatted += `   ${result.snippet}\n`;
        formatted += `   🔗 来源: ${result.source || '网络'}\n`;
        if (result.publishTime) {
          formatted += `   📅 发布时间: ${new Date(result.publishTime).toLocaleDateString('zh-CN')}\n`;
        }
        formatted += '\n';
      });
    }

    if (searchResponse.suggestions && searchResponse.suggestions.length > 0) {
      formatted += `💡 相关建议: ${searchResponse.suggestions.join(', ')}\n`;
    }

    return formatted;
  }
}

// 导出工具实例
export const webSearchTool = new WebSearchTool();

/**
 * 网络搜索工具定义
 */
const webSearchToolDefinition = {
  name: 'web_search',
  displayName: '网络搜索',
  description: `🌐 网络搜索工具 - 获取最新的网络信息和资讯

**核心能力**:
1. 火山引擎融合搜索 - 集成豆包搜索API
2. AI智能总结 - 自动生成搜索结果摘要
3. 智能缓存 - 10分钟缓存提升响应速度
4. 错误处理 - API失败时返回明确错误信息

**适用场景**:
- ✅ 查询最新政策法规
- ✅ 了解行业动态和趋势
- ✅ 搜索专业知识和案例
- ✅ 获取最新新闻资讯
- ✅ 查找实施指南和经验

**不适用场景**:
- ❌ 查询幼儿园内部数据 → 使用 search_api_categories + http_request
- ❌ 查询学生/教师信息 → 使用 API工具链
- ❌ 统计分析数据 → 使用 any_query

**示例**:
- "搜索最新的学前教育政策"
- "查找幼儿园安全管理指南"
- "了解幼小衔接的最新研究"
- "搜索招生营销的最佳实践"`,
  category: 'web-operation',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '搜索查询关键词，例如："最新学前教育政策"'
      },
      maxResults: {
        type: 'number',
        description: '最大搜索结果数量，默认10',
        default: 10
      },
      enableAISummary: {
        type: 'boolean',
        description: '是否启用AI总结，默认true',
        default: true
      }
    },
    required: ['query']
  },

  execute: async (params: any) => {
    const { query, maxResults = 10, enableAISummary = true } = params;

    console.log('🔍 [网络搜索] 开始搜索:', {
      query: query.substring(0, 50),
      maxResults,
      enableAISummary
    });

    try {
      const searchResponse = await webSearchTool.search(query, {
        maxResults,
        enableAISummary
      });

      const formatted = WebSearchTool.formatSearchResults(searchResponse);

      console.log('✅ [网络搜索] 搜索完成:', {
        resultCount: searchResponse.results.length,
        hasSummary: !!searchResponse.aiSummary,
        searchTime: searchResponse.searchTime
      });

      return {
        success: true,
        data: searchResponse,
        formatted,
        narration: searchResponse.aiSummary
          ? `找到${searchResponse.totalResults}条相关信息。${searchResponse.aiSummary.substring(0, 100)}...`
          : `找到${searchResponse.totalResults}条关于"${query}"的相关信息`,
        metadata: {
          name: 'web_search',
          query,
          resultCount: searchResponse.results.length,
          searchTime: searchResponse.searchTime,
          hasAISummary: !!searchResponse.aiSummary
        }
      };

    } catch (error) {
      console.error('❌ [网络搜索] 搜索失败:', error);

      return {
        success: false,
        error: (error as Error).message || '网络搜索失败，请稍后重试',
        narration: `搜索"${query}"时遇到问题：${(error as Error).message}`
      };
    }
  },

  // 判断是否需要使用网络搜索
  shouldUseWebSearch: (query: string) => {
    return WebSearchTool.shouldUseWebSearch(query);
  }
};

export default webSearchToolDefinition;
