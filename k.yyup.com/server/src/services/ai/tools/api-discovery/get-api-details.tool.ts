import { ToolDefinition } from '../types/tool.types';
import { specs } from '../../../../config/swagger.config';

/**
 * 📋 第2步：get_api_details 工具
 * 获取特定 API 的完整规格信息
 */
const getApiDetailsTool: ToolDefinition = {
  name: "get_api_details",
  description: `📋 获取API详细信息工具 - 查看特定接口的完整规格

🎯 核心功能：
- 获取 API 的完整 OpenAPI 规格
- 查看参数结构、请求体、响应示例
- 了解权限要求和使用说明

📦 返回信息：
- parameters: 路径参数、查询参数
- requestBody: 请求体结构和示例
- responses: 各状态码的响应示例
- security: 权限要求
- tags: 接口分类

💡 使用场景：
1. 从 search_apis 获取候选列表后
2. 需要了解接口的具体调用方式
3. 准备构造 http_request 的参数

⚠️ 重要提示：
- 这是第2步，在 search_apis 之后使用
- 获取详情后，使用 http_request 执行调用`,

  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: `API 路径，从 search_apis 的结果中获取
        
示例：
- /api/students/{id}
- /api/classes
- /api/activities/{activityId}/register`,
      },
      method: {
        type: "string",
        description: "HTTP 方法",
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"]
      }
    },
    required: ["path", "method"]
  },

  execute: async (args: any) => {
    return getApiDetailsTool.implementation!(args);
  },

  implementation: async (args: any) => {
    console.log('📋 [API详情] 获取API详细信息:', JSON.stringify(args, null, 2));
    
    try {
      const { path, method } = args;

      // 获取 Swagger 文档
      const paths = (specs as any).paths || {};
      
      // 查找指定的 API
      const pathSpec = paths[path];
      if (!pathSpec) {
        return {
          name: "get_api_details",
          status: "error",
          result: null,
          error: `未找到路径 ${path}，请使用 search_apis 工具搜索可用的API`
        };
      }

      const methodSpec = pathSpec[method.toLowerCase()];
      if (!methodSpec) {
        const availableMethods = Object.keys(pathSpec).filter(m => 
          ['get', 'post', 'put', 'delete', 'patch'].includes(m)
        );
        return {
          name: "get_api_details",
          status: "error",
          result: null,
          error: `路径 ${path} 不支持 ${method} 方法，可用方法：${availableMethods.join(', ')}`
        };
      }

      // 🎯 提取完整的 API 规格
      const apiSpec = {
        path,
        method: method.toUpperCase(),
        summary: methodSpec.summary || '',
        description: methodSpec.description || '',
        tags: methodSpec.tags || [],
        parameters: methodSpec.parameters || [],
        requestBody: methodSpec.requestBody || null,
        responses: methodSpec.responses || {},
        security: methodSpec.security || [],
        deprecated: methodSpec.deprecated || false
      };

      // 📝 生成人类可读的说明
      const readableDescription: string[] = [];
      
      // 基本信息
      readableDescription.push(`## ${method.toUpperCase()} ${path}`);
      readableDescription.push(`\n**摘要**: ${apiSpec.summary}`);
      if (apiSpec.description) {
        readableDescription.push(`\n**描述**: ${apiSpec.description.substring(0, 300)}`);
      }
      readableDescription.push(`\n**分类**: ${apiSpec.tags.join(', ')}`);

      // 路径参数
      const pathParams = apiSpec.parameters.filter((p: any) => p.in === 'path');
      if (pathParams.length > 0) {
        readableDescription.push(`\n### 📍 路径参数:`);
        pathParams.forEach((p: any) => {
          readableDescription.push(`- **${p.name}** (${p.schema?.type || 'string'}): ${p.description || ''}`);
          if (p.required) readableDescription.push(`  [必填]`);
        });
      }

      // 查询参数
      const queryParams = apiSpec.parameters.filter((p: any) => p.in === 'query');
      if (queryParams.length > 0) {
        readableDescription.push(`\n### 🔍 查询参数:`);
        queryParams.forEach((p: any) => {
          readableDescription.push(`- **${p.name}** (${p.schema?.type || 'string'}): ${p.description || ''}`);
          if (p.required) readableDescription.push(`  [必填]`);
          if (p.schema?.default) readableDescription.push(`  默认值: ${p.schema.default}`);
        });
      }

      // 请求体
      if (apiSpec.requestBody) {
        readableDescription.push(`\n### 📦 请求体:`);
        const content = apiSpec.requestBody.content;
        if (content && content['application/json']) {
          const schema = content['application/json'].schema;
          const example = content['application/json'].example;
          
          if (schema?.required) {
            readableDescription.push(`**必填字段**: ${schema.required.join(', ')}`);
          }
          if (example) {
            readableDescription.push(`**示例**:\n\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\``);
          }
        }
      }

      // 响应示例
      readableDescription.push(`\n### ✅ 响应:`);
      Object.entries(apiSpec.responses).forEach(([status, response]: [string, any]) => {
        readableDescription.push(`- **${status}**: ${response.description || ''}`);
      });

      // 权限要求
      if (apiSpec.security && apiSpec.security.length > 0) {
        readableDescription.push(`\n### 🔒 权限要求: 需要认证`);
      }

      console.log(`✅ [API详情] 成功获取 ${method} ${path} 的详细信息`);

      return {
        name: "get_api_details",
        status: "success",
        result: {
          type: 'api_details',
          spec: apiSpec,
          readableDescription: readableDescription.join('\n'),
          nextStep: `🤖 【自动执行】已了解接口详情，请立即自动准备参数并直接调用 http_request 工具执行请求。禁止停止！禁止返回参数信息给用户！`,
          autoExecute: true,
          hint: "AI必须自动构建请求并执行http_request，不需要用户确认"
        }
      };

    } catch (error: any) {
      console.error('❌ [API详情] 获取失败:', error);
      return {
        name: "get_api_details",
        status: "error",
        result: null,
        error: `获取API详情失败: ${error.message}`
      };
    }
  }
};

export default getApiDetailsTool;
