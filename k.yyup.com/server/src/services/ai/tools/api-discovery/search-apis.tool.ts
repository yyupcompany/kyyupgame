import { ToolDefinition } from '../types/tool.types';
import { specs } from '../../../../config/swagger.config';

interface ApiSearchResult {
  path: string;
  method: string;
  summary: string;
  description: string;
  tags: string[];
  relevanceScore: number;
  matchedKeywords: string[];
}

/**
 * 🔍 第1步：search_apis 工具
 * 从 Swagger 文档中智能搜索 API 接口
 */
const searchApisTool: ToolDefinition = {
  name: "search_apis",
  description: `🔍 智能API搜索工具 - 从完整的API文档中搜索相关接口

🎯 核心功能：
- 基于关键词在 1000+ API 中模糊搜索
- 自动分析 path、summary、description、tags
- 返回相关性排序的候选列表

📋 搜索范围：
- API 路径 (如 /api/students/{id})
- 接口摘要 (如 "删除学生")
- 详细描述
- 标签分类 (如 "学生管理")

💡 使用场景：
1. 用户询问"如何删除学生" → 搜索 ["删除", "学生"]
2. 用户询问"查询班级列表" → 搜索 ["查询", "班级", "列表"]
3. 用户询问"更新用户信息" → 搜索 ["更新", "用户", "信息"]

⚠️ 重要提示：
- 这是第1步，用于发现可用的 API
- 找到候选 API 后，使用 get_api_details 查看详情
- 最后使用 http_request 执行调用`,

  parameters: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        description: `搜索关键词数组，支持中英文。
        
示例：
- 删除学生 → ["删除", "学生"]
- 查询班级 → ["查询", "班级"]
- 更新用户 → ["更新", "用户"]

💡 关键词提取技巧：
- 提取动词：增删改查、创建、获取、更新
- 提取名词：学生、班级、教师、活动
- 提取限定词：单个、批量、详情、列表`,
        items: { type: "string" },
        default: []
      },
      method: {
        type: "string",
        description: `HTTP 方法过滤（可选）
- GET: 查询操作
- POST: 创建操作
- PUT/PATCH: 更新操作
- DELETE: 删除操作`,
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        nullable: true
      },
      limit: {
        type: "number",
        description: "返回结果数量限制，默认10个",
        default: 10
      }
    },
    required: ["keywords"]
  },

  execute: async (args: any) => {
    return searchApisTool.implementation!(args);
  },

  implementation: async (args: any) => {
    console.log('🔍 [API搜索] 开始从 Swagger 文档搜索API:', JSON.stringify(args, null, 2));
    
    try {
      const { keywords = [], method, limit = 10 } = args;

      // 获取 Swagger 文档
      const paths = (specs as any).paths || {};
      const searchResults: ApiSearchResult[] = [];

      console.log(`📚 [API搜索] Swagger 文档中共有 ${Object.keys(paths).length} 个路径`);

      // 🎯 同义词映射表（支持口语化表达）
      const synonymMap: Record<string, string[]> = {
        '学生': ['学生', 'student', '娃', '孩子', '幼儿', '小朋友', '宝宝'],
        '教师': ['教师', 'teacher', '老师', '教员', '园丁'],
        '班级': ['班级', 'class', '班', '年级'],
        '活动': ['活动', 'activity', '课程', '项目'],
        '家长': ['家长', 'parent', '父母', '爸妈'],
        '考勤': ['考勤', 'attendance', '签到', '打卡', '出勤'],
        '招生': ['招生', 'enrollment', '报名', '入园'],
      };

      // 🔍 扩展关键词（包含同义词）
      const expandedKeywords = new Set<string>();
      for (const keyword of keywords) {
        const kwLower = keyword.toLowerCase();
        expandedKeywords.add(kwLower);
        
        // 查找同义词
        for (const [mainWord, synonyms] of Object.entries(synonymMap)) {
          if (synonyms.some(syn => kwLower.includes(syn.toLowerCase()) || syn.toLowerCase().includes(kwLower))) {
            synonyms.forEach(syn => expandedKeywords.add(syn.toLowerCase()));
            break;
          }
        }
      }

      // 过滤纯通用操作词（但保留实体相关词）
      const pureGenericWords = ['查询', '获取', '查看', '列表', '详情', '总数', 'get', 'query', 'list', 'find'];
      const entityKeywords = Array.from(expandedKeywords).filter(kw => 
        !pureGenericWords.includes(kw)
      );

      console.log(`🎯 [API搜索] 原始关键词: ${keywords.join(', ')}`);
      console.log(`🔄 [API搜索] 扩展关键词: ${Array.from(expandedKeywords).join(', ')}`);
      console.log(`✨ [API搜索] 实体关键词: ${entityKeywords.join(', ')}`);

      // 🔍 遍历所有 API 路径
      for (const [path, methods] of Object.entries(paths)) {
        for (const [httpMethod, details] of Object.entries(methods as any)) {
          // 跳过非 HTTP 方法
          if (!['get', 'post', 'put', 'delete', 'patch'].includes(httpMethod.toLowerCase())) {
            continue;
          }

          // 方法过滤
          if (method && httpMethod.toUpperCase() !== method.toUpperCase()) {
            continue;
          }

          const apiDetails = details as any;
          const summary = apiDetails.summary || '';
          const description = apiDetails.description || '';
          const tags = apiDetails.tags || [];

          // 🎯 计算相关性评分（使用扩展后的关键词）
          let relevanceScore = 0;
          const matchedKeywords: string[] = [];

          if (expandedKeywords.size > 0) {
            // 优先使用实体关键词，如果没有则使用所有扩展关键词
            const keywordsToUse = entityKeywords.length > 0 ? entityKeywords : Array.from(expandedKeywords);

            for (const keyword of keywordsToUse) {
              const kw = keyword.toLowerCase();
              let matched = false;
              let isEntityKeyword = entityKeywords.includes(keyword);

              // 1️⃣ 路径匹配 (实体关键词: 100分, 通用关键词: 30分)
              if (path.toLowerCase().includes(kw)) {
                relevanceScore += isEntityKeyword ? 100 : 30;
                matched = true;
              }

              // 2️⃣ 摘要匹配 (实体关键词: 120分, 通用关键词: 40分)
              if (summary.toLowerCase().includes(kw)) {
                relevanceScore += isEntityKeyword ? 120 : 40;
                matched = true;
              }

              // 3️⃣ 描述匹配 (实体关键词: 60分, 通用关键词: 20分)
              if (description.toLowerCase().includes(kw)) {
                relevanceScore += isEntityKeyword ? 60 : 20;
                matched = true;
              }

              // 4️⃣ 标签匹配 (实体关键词: 100分, 通用关键词: 30分)
              if (tags.some((tag: string) => tag.toLowerCase().includes(kw))) {
                relevanceScore += isEntityKeyword ? 100 : 30;
                matched = true;
              }

              // 5️⃣ HTTP 方法匹配（仅对通用关键词生效）
              if (!isEntityKeyword) {
                const methodKeywordMap: Record<string, string[]> = {
                  'get': ['查询', '获取', '查看', '列表', '详情', 'get', 'query', 'list', 'find', 'search'],
                  'post': ['创建', '新增', '添加', 'create', 'add', 'post'],
                  'put': ['更新', '修改', '编辑', 'update', 'edit', 'put', 'modify'],
                  'patch': ['更新', '修改', '编辑', 'update', 'edit', 'patch', 'modify'],
                  'delete': ['删除', '移除', 'delete', 'remove', 'del']
                };

                const methodKeywords = methodKeywordMap[httpMethod.toLowerCase()] || [];
                if (methodKeywords.some(mk => kw.includes(mk) || mk.includes(kw))) {
                  relevanceScore += 20;
                  matched = true;
                }
              }

              if (matched) {
                matchedKeywords.push(keyword);
              }
            }
          } else {
            // 无关键词时，所有 API 都给基础分
            relevanceScore = 10;
          }

          // 只保留有匹配的结果
          if (relevanceScore > 0) {
            searchResults.push({
              path,
              method: httpMethod.toUpperCase(),
              summary,
              description: description.substring(0, 200), // 限制描述长度
              tags,
              relevanceScore,
              matchedKeywords
            });
          }
        }
      }

      // 📊 按相关性排序
      searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const limitedResults = searchResults.slice(0, limit);

      console.log(`✅ [API搜索] 找到 ${searchResults.length} 个匹配结果，返回前 ${limitedResults.length} 个`);
      console.log(`🏆 [API搜索] 最佳匹配: ${limitedResults[0]?.method} ${limitedResults[0]?.path} (评分: ${limitedResults[0]?.relevanceScore})`);

      return {
        name: "search_apis",
        status: "success",
        result: {
          type: 'api_search_results',
          query: { keywords, method, limit },
          totalFound: searchResults.length,
          returned: limitedResults.length,
          results: limitedResults.map(api => ({
            path: api.path,
            method: api.method,
            summary: api.summary,
            tags: api.tags,
            relevanceScore: api.relevanceScore,
            matchedKeywords: api.matchedKeywords
          })),
          preview: limitedResults.slice(0, 3).map(api => 
            `${api.method} ${api.path} - ${api.summary} (评分: ${api.relevanceScore})`
          ).join('\n'),
          nextStep: limitedResults.length > 0 
            ? `找到 ${limitedResults.length} 个相关API。下一步请使用 get_api_details 工具查看具体接口的详细信息，选择参数：{ path: "${limitedResults[0].path}", method: "${limitedResults[0].method}" }`
            : '未找到匹配的API，请尝试使用不同的关键词搜索'
        }
      };

    } catch (error: any) {
      console.error('❌ [API搜索] 搜索失败:', error);
      return {
        name: "search_apis",
        status: "error",
        result: null,
        error: `API搜索失败: ${error.message}`
      };
    }
  }
};

export default searchApisTool;
