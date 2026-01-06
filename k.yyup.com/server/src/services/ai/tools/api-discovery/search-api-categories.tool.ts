import { ToolDefinition } from '../types/tool.types';
import { specs } from '../../../../config/swagger.config';

interface CategorySearchResult {
  categoryName: string;
  matchedKeywords: string[];
  relevanceScore: number;
  apiCount: number;
  examples: string[];
}

/**
 * 🏷️ 第1步：search_api_categories 工具
 * 从用户需求中智能识别API分类
 */
const searchApiCategoriesTool: ToolDefinition = {
  name: "search_api_categories",
  description: `🏷️ API分类搜索工具 - 第一步：确定业务分类

🎯 核心功能：
- 从用户需求中智能识别相关的API分类
- 支持口语化表达和同义词映射
- 返回最相关的业务分类供大模型选择

💡 使用场景：
1. 用户："查询我园的娃有多少" 
   → 搜索关键词：["查询", "学生"]
   → 返回分类：[Students], [班级管理] 等

2. 用户："删除一个老师"
   → 搜索关键词：["删除", "教师"]
   → 返回分类：[Teacher], [教师管理] 等

⚠️ 重要提示：
- 这是第1步，用于确定业务领域
- 选定分类后，使用 get_api_endpoints 查看该分类下的API端点
- 不要直接跳到 get_api_details 或 http_request`,

  parameters: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        description: `搜索关键词数组，支持中英文和口语化表达。

示例：
- "查询我园的娃有多少" → ["查询", "学生"]
- "删除一个老师" → ["删除", "教师"]
- "更新班级信息" → ["更新", "班级"]

💡 关键词提取技巧：
- 口语化词汇会自动映射到标准词汇（"娃"→"学生"）
- 提取核心实体：学生、教师、班级、活动、家长
- 可包含操作类型：增删改查、创建、获取`,
        items: { type: "string" },
        default: []
      },
      limit: {
        type: "number",
        description: "返回分类数量限制，默认5个",
        default: 5
      }
    },
    required: ["keywords"]
  },

  execute: async (args: any) => {
    return searchApiCategoriesTool.implementation!(args);
  },

  implementation: async (args: any) => {
    console.log('🏷️ [分类搜索] 开始搜索API分类:', JSON.stringify(args, null, 2));
    
    try {
      const { keywords = [], limit = 5 } = args;

      // 🎯 同义词映射表（支持口语化表达）
      const synonymMap: Record<string, string[]> = {
        '学生': ['学生', 'student', '娃', '孩子', '幼儿', '小朋友', '宝宝', 'students'],
        '教师': ['教师', 'teacher', '老师', '教员', '园丁', 'teachers'],
        '班级': ['班级', 'class', '班', '年级', 'classes'],
        '活动': ['活动', 'activity', '课程', '项目', 'activities'],
        '家长': ['家长', 'parent', '父母', '爸妈', 'parents'],
        '考勤': ['考勤', 'attendance', '签到', '打卡', '出勤'],
        '招生': ['招生', 'enrollment', '报名', '入园'],
        '财务': ['财务', 'finance', '收费', '缴费', '费用'],
        '权限': ['权限', 'permission', '角色', 'role'],
        '营销': ['营销', 'marketing', '推广', '宣传'],
        '统计': ['统计', 'statistics', '分析', 'analytics', '报表'],
        '幼儿园': ['幼儿园', 'kindergarten', '园所', '机构'],
      };

      // 🔍 扩展关键词（包含同义词）
      const expandedKeywords = new Set<string>();
      for (const keyword of keywords) {
        const kwLower = keyword.toLowerCase().trim();
        if (!kwLower) continue;
        
        expandedKeywords.add(kwLower);
        
        // 查找同义词
        for (const [mainWord, synonyms] of Object.entries(synonymMap)) {
          if (synonyms.some(syn => kwLower.includes(syn.toLowerCase()) || syn.toLowerCase().includes(kwLower))) {
            synonyms.forEach(syn => expandedKeywords.add(syn.toLowerCase()));
            break;
          }
        }
      }

      console.log(`🎯 [分类搜索] 原始关键词: ${keywords.join(', ')}`);
      console.log(`🔄 [分类搜索] 扩展关键词: ${Array.from(expandedKeywords).join(', ')}`);

      // 获取所有API的tags
      const paths = (specs as any).paths || {};
      const categoryMap = new Map<string, { paths: string[], methods: Set<string> }>();

      // 统计每个分类下的API
      for (const [path, pathItem] of Object.entries(paths)) {
        const methods = Object.keys(pathItem as any).filter(m => 
          ['get', 'post', 'put', 'patch', 'delete'].includes(m)
        );

        for (const method of methods) {
          const operation = (pathItem as any)[method];
          const tags = operation?.tags || [];
          
          for (const tag of tags) {
            if (!categoryMap.has(tag)) {
              categoryMap.set(tag, { paths: [], methods: new Set() });
            }
            const catData = categoryMap.get(tag)!;
            catData.paths.push(path);
            catData.methods.add(method.toUpperCase());
          }
        }
      }

      console.log(`📚 [分类搜索] 发现 ${categoryMap.size} 个API分类`);

      // 计算每个分类的相关性得分
      const categoryResults: CategorySearchResult[] = [];

      for (const [categoryName, catData] of categoryMap.entries()) {
        let relevanceScore = 0;
        const matchedKeywords: string[] = [];
        const categoryLower = categoryName.toLowerCase();

        // 匹配关键词
        for (const kw of expandedKeywords) {
          if (categoryLower.includes(kw) || kw.includes(categoryLower)) {
            relevanceScore += 100;
            matchedKeywords.push(kw);
          }
        }

        // 如果有匹配，添加到结果
        if (relevanceScore > 0) {
          categoryResults.push({
            categoryName,
            matchedKeywords,
            relevanceScore,
            apiCount: catData.paths.length,
            examples: catData.paths.slice(0, 3), // 只显示前3个示例路径
          });
        }
      }

      // 按相关性排序
      categoryResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // 限制返回数量
      const topResults = categoryResults.slice(0, limit);

      console.log(`✅ [分类搜索] 找到 ${topResults.length} 个相关分类`);

      // ⚠️ 重要：即使未找到匹配分类，也返回 success: true，并提供所有分类供AI选择
      if (topResults.length === 0) {
        console.warn(`⚠️ [分类搜索] 未找到精确匹配，返回所有可用分类供AI选择`);
        
        // 返回所有分类的前10个作为候选
        const allCategories = Array.from(categoryMap.entries())
          .map(([categoryName, catData]) => ({
            categoryName,
            matchedKeywords: [],
            relevanceScore: 0,
            apiCount: catData.paths.length,
            examples: catData.paths.slice(0, 3),
          }))
          .sort((a, b) => b.apiCount - a.apiCount) // 按API数量排序
          .slice(0, 10);

        return {
          success: true, // ← 改为true，让AI继续流程
          message: `未找到关键词「${keywords.join(', ')}」的精确匹配，以下是系统中最常用的API分类`,
          categories: allCategories,
          expandedKeywords: Array.from(expandedKeywords),
          totalCategories: categoryMap.size,
          nextStep: "🤖 【自动执行】请立即自动选择最相关的分类（不要返回给用户），然后直接调用 get_api_endpoints 工具",
          autoSelect: true,
          hint: "AI必须自动选择分类并继续执行，禁止返回分类信息让用户选择"
        };
      }

      return {
        success: true,
        message: `✅ 找到 ${topResults.length} 个相关的API分类`,
        categories: topResults,
        nextStep: "🤖 【自动执行】请立即自动选择匹配度最高的分类（第一个），然后直接调用 get_api_endpoints 工具获取端点列表。禁止停止！禁止返回分类信息给用户！",
        autoSelect: true,
        selectedCategory: topResults[0]?.categoryName || null,
        hint: "AI必须自动选择第一个分类并继续执行下一步，不需要用户确认"
      };

    } catch (error: any) {
      console.error('❌ [分类搜索] 搜索失败:', error);
      return {
        success: false,
        error: error.message,
        message: '搜索API分类时发生错误',
      };
    }
  }
};

export default searchApiCategoriesTool;
