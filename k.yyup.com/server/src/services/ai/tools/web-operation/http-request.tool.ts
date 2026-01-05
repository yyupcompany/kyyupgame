import { ToolDefinition } from '../types/tool.types';

const httpRequestTool: ToolDefinition = {
  name: "http_request",
  description: `直接调用HTTP API接口 - 用于查询、创建、更新、删除数据

🎯 使用场景：
- 在使用 search_api_categories 、get_api_endpoints 和 get_api_details 了解API后，调用该API
- 支持GET、POST、PUT、DELETE等所有HTTP方法
- 自动处理认证和请求头

📋 使用流程（四步法）：
1. 第1步：使用 search_api_categories 搜索合适的API分类
2. 第2步：使用 get_api_endpoints 获取分类下的端点
3. 第3步：使用 get_api_details 查看API详情
4. 第4步：使用 http_request 调用API

⚠️ 注意：
- 必须先通过四步流程了解API的参数要求
- GET请求使用query参数，POST/PUT使用body
- DELETE/PUT/PATCH 操作会触发用户确认对话框
- 返回标准的API响应格式

🔒 确认机制（极其重要！）：
- DELETE/PUT/PATCH 操作在首次调用时 **禁止** 设置 confirmed=true
- 必须让 confirmed 参数保持默认值 false 或完全不传递
- 系统会自动向用户显示确认对话框
- 用户点击确认后，系统会自动以 confirmed=true 重新调用
- AI 绝对不能自行决定 confirmed=true`,

  parameters: {
    type: "object",
    properties: {
      endpoint: {
        type: "string",
        description: "API端点路径，如：/api/students、/api/classes"
      },
      method: {
        type: "string",
        enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        description: "HTTP方法",
        default: "GET"
      },
      query: {
        type: "object",
        description: "URL查询参数（用于GET请求），如：{ page: 1, pageSize: 10 }"
      },
      body: {
        type: "object",
        description: "请求体（用于POST/PUT请求）"
      },
      headers: {
        type: "object",
        description: "额外的请求头"
      },
      confirmed: {
        type: "boolean",
        description: "用户是否已确认此操作。⚠️ 首次调用时必须设置为 false 或不传递此参数！系统会自动弹出确认对话框，用户确认后系统会自动以 confirmed=true 重新调用。禁止AI在首次调用时设置为true。",
        default: false
      }
    },
    required: ["endpoint", "method"]
  },

  execute: async (args: any) => {
    return httpRequestTool.implementation!(args);
  },

  implementation: async (args: any) => {
    console.log('🌐 [HTTP请求] 开始调用API:', JSON.stringify(args, null, 2));
    
    try {
      const { endpoint, method = 'GET', query = {}, body, headers = {}, confirmed = false } = args;

      // 🚨 必填字段检查（POST请求）
      if (method === 'POST' && body) {
        const requiredFieldsMap: Record<string, { fields: string[], labels: Record<string, string> }> = {
          '/api/students': {
            fields: ['name', 'gender', 'birthDate', 'enrollmentDate'],
            labels: {
              name: '姓名',
              gender: '性别（男/女）',
              birthDate: '出生日期（YYYY-MM-DD）',
              enrollmentDate: '入学日期（YYYY-MM-DD）'
            }
          },
          '/api/teachers': {
            fields: ['name', 'phone'],
            labels: {
              name: '姓名',
              phone: '手机号（11位数字）'
            }
          },
          '/api/classes': {
            fields: ['name', 'code', 'type'],
            labels: {
              name: '班级名称',
              code: '班级代码',
              type: '班级类型（小班/中班/大班）'
            }
          },
          '/api/activities': {
            fields: ['title', 'activityType', 'startTime', 'endTime'],
            labels: {
              title: '活动名称',
              activityType: '活动类型',
              startTime: '开始时间（YYYY-MM-DD HH:mm）',
              endTime: '结束时间（YYYY-MM-DD HH:mm）'
            }
          }
        };

        const config = requiredFieldsMap[endpoint];
        if (config) {
          const missingFields = config.fields.filter(field => !body[field] || body[field] === '');
          
          if (missingFields.length > 0) {
            console.log('⛔ [HTTP请求] 缺少必填字段:', missingFields);
            
            // 生成填写模板
            const entityName = body.name || '（未指定）';
            const entityType = endpoint.replace('/api/', '').replace('s', '');
            const entityTypeCN = {
              'student': '学生',
              'teacher': '教师',
              'class': '班级',
              'activitie': '活动'
            }[entityType] || entityType;
            
            const missingFieldsTable = missingFields.map(field => 
              `| ${config.labels[field]} | 必填 | - |`
            ).join('\n');
            
            const templateFields = missingFields.map(field => 
              `- ${config.labels[field].split('（')[0]}：（请填写）`
            ).join('\n');
            
            const exampleFields = missingFields.map(field => {
              const examples: Record<string, string> = {
                gender: '男',
                birthDate: '2018-05-15',
                enrollmentDate: '2024-09-01',
                phone: '13800138000',
                code: 'XB-001',
                type: '小班',
                activityType: '户外活动',
                startTime: '2024-09-01 09:00',
                endTime: '2024-09-01 11:00'
              };
              return `- ${config.labels[field].split('（')[0]}：${examples[field] || '示例值'}`;
            }).join('\n');

            return {
              name: "http_request",
              status: "missing_required_fields",
              result: null,
              missing_fields: missingFields,
              user_prompt_required: true,
              ai_response_template: `😊 好的，我来帮您创建${entityTypeCN}"「${entityName}」"的记录。

📝 **还需要您提供以下必填信息：**

| 字段 | 说明 | 状态 |
|------|------|------|
${missingFieldsTable}

📋 **请复制下方模板，填写后发送给我：**

\`\`\`
创建${entityTypeCN}：${entityName}
${templateFields}
\`\`\`

💡 **填写示例：**

\`\`\`
创建${entityTypeCN}：${entityName}
${exampleFields}
\`\`\``
            };
          }
        }
      }

      // 🔒 需要确认的操作类型
      const needsConfirmation = ['DELETE', 'PUT', 'PATCH'].includes(method);
      
      // 如果是需要确认的操作且用户尚未确认，返回确认请求
      if (needsConfirmation && !confirmed) {
        console.log('⚠️ [HTTP请求] 需要用户确认的操作:', method, endpoint);
        
        let operationType = 'modify';
        if (method === 'DELETE') operationType = 'delete';
        else if (method === 'PUT' || method === 'PATCH') operationType = 'update';
        
        return {
          name: "http_request",
          status: "wait_for_confirmation",
          result: null,
          confirmation_required: true,
          confirmation_data: {
            operation_type: operationType,
            endpoint,
            method,
            body,
            query,
            ui_instruction: {
              title: `确认${operationType === 'delete' ? '删除' : '更新'}操作`,
              message: `即将执行 ${method} 请求到 ${endpoint}，请确认是否继续`
            }
          }
        };
      }

      // 🔧 修复：动态构建URL，避免硬编码
      const port = process.env.PORT || 3000;
      const baseUrl = process.env.API_BASE_URL || `http://127.0.0.1:${port}`;
      let url = `${baseUrl}${endpoint}`;

      if (method === 'GET' && Object.keys(query).length > 0) {
        const queryString = new URLSearchParams(query).toString();
        url += `?${queryString}`;
      }

      const token = args.__userContext?.token;
      const defaultHeaders: any = {
        'Content-Type': 'application/json',
        ...headers
      };

      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }

      const fetchOptions: any = {
        method,
        headers: defaultHeaders
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        fetchOptions.body = JSON.stringify(body);
      }

      console.log('📡 [HTTP请求] 发起请求:', { url, method, hasBody: !!body, confirmed });

      const response = await fetch(url, fetchOptions);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [HTTP请求] API返回错误:', response.status, data);
        return {
          name: "http_request",
          status: "error",
          result: null,
          error: data.message || `API请求失败: ${response.status}`
        };
      }

      console.log('✅ [HTTP请求] API调用成功');

      return {
        name: "http_request",
        status: "success",
        result: {
          type: 'api_response',
          endpoint,
          method,
          data: data.data || data,
          success: data.success !== false,
          message: data.message
        }
      };

    } catch (error: any) {
      console.error('❌ [HTTP请求] 调用失败:', error);
      return {
        name: "http_request",
        status: "error",
        result: null,
        error: `HTTP请求失败: ${error.message}`
      };
    }
  }
};

export default httpRequestTool;
