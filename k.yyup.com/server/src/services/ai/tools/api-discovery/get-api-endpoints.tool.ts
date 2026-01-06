import { ToolDefinition } from '../types/tool.types';
import { specs } from '../../../../config/swagger.config';

interface EndpointInfo {
  path: string;
  method: string;
  summary: string;
}

/**
 * 📋 第2步：get_api_endpoints 工具
 * 获取指定分类下的所有API端点（不包含参数详情）
 */
const getApiEndpointsTool: ToolDefinition = {
  name: "get_api_endpoints",
  description: `📋 API端点列表工具 - 第二步：查看分类下的所有端点

🎯 核心功能：
- 获取指定API分类下的所有端点
- 只显示路径、方法、摘要，不显示参数详情
- 让大模型根据业务需求选择合适的端点

💡 使用场景：
1. 已确定分类为 [Students]
   → 获取该分类下的所有端点：GET /api/students, POST /api/students 等
   
2. 已确定分类为 [Teacher]
   → 获取该分类下的所有端点：GET /api/teachers, DELETE /api/teachers/{id} 等

⚠️ 重要提示：
- 这是第2步，用于查看可用的API端点
- 选定端点后，使用 get_api_details 查看详细参数说明
- 不要直接跳到 http_request`,

  parameters: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: `API分类名称（从第1步 search_api_categories 的结果中选择）

示例：
- "Students"
- "Teacher"
- "班级管理"
- "AI工具管理"`,
      },
      method: {
        type: "string",
        description: `HTTP方法过滤（可选）
- GET: 查询操作
- POST: 创建操作
- PUT/PATCH: 更新操作
- DELETE: 删除操作`,
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        nullable: true
      }
    },
    required: ["category"]
  },

  execute: async (args: any) => {
    return getApiEndpointsTool.implementation!(args);
  },

  implementation: async (args: any) => {
    console.log('📋 [端点列表] 开始获取API端点:', JSON.stringify(args, null, 2));
    
    try {
      const { category, method } = args;

      if (!category) {
        return {
          success: false,
          message: '请提供 category 参数（API分类名称）',
        };
      }

      // 获取 Swagger 文档
      const paths = (specs as any).paths || {};
      const endpoints: EndpointInfo[] = [];

      // 遍历所有路径
      for (const [path, pathItem] of Object.entries(paths)) {
        const methods = Object.keys(pathItem as any).filter(m => 
          ['get', 'post', 'put', 'patch', 'delete'].includes(m)
        );

        for (const methodName of methods) {
          const operation = (pathItem as any)[methodName];
          const tags = operation?.tags || [];
          
          // 检查是否属于指定分类
          if (tags.includes(category)) {
            const methodUpper = methodName.toUpperCase();
            
            // 如果指定了method过滤，则进行过滤
            if (method && methodUpper !== method) {
              continue;
            }

            endpoints.push({
              path,
              method: methodUpper,
              summary: operation.summary || '无描述',
            });
          }
        }
      }

      console.log(`✅ [端点列表] 在分类 "${category}" 下找到 ${endpoints.length} 个端点`);

      if (endpoints.length === 0) {
        return {
          success: false,
          message: `在分类 "${category}" 下未找到任何API端点`,
          hint: "请检查分类名称是否正确，或使用 search_api_categories 重新搜索分类",
        };
      }

      // 按HTTP方法分组（方便大模型理解）
      const groupedByMethod = {
        GET: endpoints.filter(e => e.method === 'GET'),
        POST: endpoints.filter(e => e.method === 'POST'),
        PUT: endpoints.filter(e => e.method === 'PUT'),
        PATCH: endpoints.filter(e => e.method === 'PATCH'),
        DELETE: endpoints.filter(e => e.method === 'DELETE'),
      };

      return {
        success: true,
        message: `分类 "${category}" 下共有 ${endpoints.length} 个API端点`,
        category,
        totalCount: endpoints.length,
        endpoints,
        groupedByMethod,
        nextStep: "🤖 【自动执行】请立即自动选择最适合的端点（如统计/列表/详情等），然后直接调用 get_api_details 工具获取参数说明。禁止停止！禁止返回端点信息给用户！",
        autoSelect: true,
        hint: "AI必须自动选择端点并继续执行下一步，不需要用户确认"
      };

    } catch (error: any) {
      console.error('❌ [端点列表] 获取失败:', error);
      return {
        success: false,
        error: error.message,
        message: '获取API端点列表时发生错误',
      };
    }
  }
};

export default getApiEndpointsTool;
