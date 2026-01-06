import { Router } from 'express';
// FunctionToolsService removed - replaced by six-dimensional memory system
import { authMiddleware } from '../../middlewares/auth.middleware';
import { body, validationResult } from 'express-validator';
import axios from 'axios';

// 工具调用类型定义
interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// 消息类型定义
interface ChatMessage {
  role: string;
  content: string | null;
  tool_calls?: ToolCall[] | null;
  tool_call_id?: string;
}

const router = Router();

/**
* @swagger
* tags:
*   - name: "AI工具管理"
*     description: "AI功能工具和智能处理接口"
*/

/**
* @swagger
* components:
*   schemas:
*     FunctionCall:
*       type: object
*       properties:
*         name:
*           type: string
*           description: "函数名称"
*           example: "any_query"
*         arguments:
*           type: object
*           description: "函数参数对象"
*           example: {"userQuery": "查询最近10个活动"}
*     FunctionCallRequest:
*       type: object
*       required:
*         - function_calls
*       properties:
*         function_calls:
*           type: array
*           items:
*             $ref: '#/components/schemas/FunctionCall'
*           description: "函数调用列表"
*         conversation_id:
*           type: integer
*           description: "会话ID"
*         user_id:
*           type: integer
*           description: "用户ID"
*     FunctionCallResult:
*       type: object
*       properties:
*         success:
*           type: boolean
*           example: true
*         data:
*           type: object
*           description: "函数执行结果"
*         metadata:
*           type: object
*           properties:
*             executed_at:
*               type: string
*               format: date-time
*               description: "执行时间"
*             function_count:
*               type: integer
*               description: "执行的函数数量"
*     AvailableTool:
*       type: object
*       properties:
*         name:
*           type: string
*           description: "工具名称"
*           example: "any_query"
*         description:
*           type: string
*           example: "智能自然语言查询 - 支持所有数据查询"
*         category:
*           type: string
*           description: "工具类别"
*           example: "database"
*         requiredRole:
*           type: array
*           items:
*             type: string
*           description: "所需角色权限"
*         features:
*           type: array
*           items:
*             type: string
*           description: "工具特性"
*     ToolCategory:
*       type: object
*       properties:
*         database_query:
*           type: array
*           items:
*             $ref: '#/components/schemas/AvailableTool'
*         page_operation:
*           type: array
*           items:
*             $ref: '#/components/schemas/AvailableTool'
*         business_operation:
*           type: array
*           items:
*             $ref: '#/components/schemas/AvailableTool'
*     SmartChatRequest:
*       type: object
*       required:
*         - messages
*       properties:
*         messages:
*           type: array
*           items:
*             type: object
*             properties:
*               role:
*                 type: string
*                 enum: [user, assistant, system]
*               content:
*                 type: string
*           description: "对话消息列表"
*         conversation_id:
*           type: integer
*           description: "会话ID"
*         max_iterations:
*           type: integer
*           default: 12
*           description: "最大对话轮数"
*     SmartChatResponse:
*       type: object
*       properties:
*         success:
*           type: boolean
*           example: true
*         data:
*           type: object
*           properties:
*             message:
*               type: string
*               description: "AI回复内容"
*             conversation_id:
*               type: string
*               description: "会话ID"
*             model_used:
*               type: string
*               description: "使用的AI模型"
*             usage:
*               type: object
*               description: "Token使用统计"
*             iterations:
*               type: integer
*               description: "对话轮数"
*             conversation_history:
*               type: array
*               items:
*                 type: object
*               description: "对话历史记录"
*             final_response:
*               type: boolean
*               description: "是否为最终回复"
*             incomplete:
*               type: boolean
*               description: "是否未完成"
*     SSEEvent:
*       type: object
*       properties:
*         event:
*           type: string
*           enum: [thinking-start, thinking-complete, response-start, response-content, complete, error]
*           description: "事件类型"
*         data:
*           type: object
*           description: "事件数据"
*/

// 验证中间件
const validateFunctionCall = [
  body('function_calls').isArray().withMessage('function_calls必须是数组'),
  body('function_calls.*.name').isString().notEmpty().withMessage('函数名称不能为空'),
  body('function_calls.*.arguments').isObject().withMessage('函数参数必须是对象'),
  body('conversation_id').optional().isInt().withMessage('conversation_id必须是整数'),
  body('user_id').optional().isInt().withMessage('user_id必须是整数')
];

/**
* @swagger
* /api/ai/function-tools/execute:
*   post:
*     summary: "执行Function Calls"
*     description: "批量执行AI功能工具调用，支持多种工具的协同工作"
*     tags: [AI工具管理]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/FunctionCallRequest'
*           examples:
*             simple_query:
*               summary: "简单数据查询"
*               value:
*                 function_calls:
*                   - name: "any_query"
*                     arguments:
*                       userQuery: "查询最近10个活动"
*                       queryType: "detailed"
*                 conversation_id: 123
*             complex_workflow:
*               summary: "复杂工作流"
*               value:
*                 function_calls:
*                   - name: "analyze_task_complexity"
*                     arguments:
*                       task: "创建新活动并生成海报"
*                   - name: "create_todo_list"
*                     arguments:
*                       title: "活动创建工作流"
*                       tasks: ["分析需求", "创建活动", "设计海报", "配置营销"]
*                 conversation_id: 456
*                 user_id: 789
*     responses:
*       200:
*         description: "函数执行成功"
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/FunctionCallResult'
*       400:
*         description: "请求参数错误"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: false
*                 errors:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       msg:
*                         type: string
*                         example: "function_calls必须是数组"
*                       param:
*                         type: string
*                         example: "function_calls"
*                       location:
*                         type: string
*                         example: "body"
*       401:
*         description: "未授权访问"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: false
*                 error:
*                   type: string
*                   example: "未授权访问"
*       500:
*         description: "服务器内部错误"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: false
*                 error:
*                   type: string
*                   example: "执行失败"
*/
// 执行Function Calls
router.post('/execute', authMiddleware, validateFunctionCall, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { function_calls, conversation_id, user_id } = req.body;
    const userId = user_id || req.user.id;

    // 执行Function Calls
    // FunctionToolsService已被六维记忆系统替代
    const results = { status: 'error', error: 'FunctionToolsService已被六维记忆系统替代' };

    res.json({
      success: true,
      data: results,
      metadata: {
        executed_at: new Date().toISOString(),
        function_count: function_calls.length
      }
    });
  } catch (error) {
    console.error('执行Function Calls失败:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '执行失败'
    });
  }
});

/**
* @swagger
* /api/ai/function-tools/available-tools:
*   get:
*     summary: "获取可用工具列表"
*     description: "根据用户角色权限返回当前可用的AI功能工具列表"
*     tags: [AI工具管理]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: "获取工具列表成功"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   $ref: '#/components/schemas/ToolCategory'
*                 metadata:
*                   type: object
*                   properties:
*                     user_role:
*                       type: string
*                       description: "用户角色"
*                       example: "teacher"
*                     total_tools:
*                       type: integer
*                       description: "可用工具总数"
*                       example: 25
*       401:
*         description: "未授权访问"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: false
*                 error:
*                   type: string
*                   example: "未授权访问"
*       500:
*         description: "服务器内部错误"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: false
*                 error:
*                   type: string
*                   example: "获取失败"
*     example:
*       summary: "教师角色获取工具列表"
*       value:
*         success: true
*         data:
*           database_query:
*             - name: "any_query"
*               description: "智能自然语言查询 - 支持所有数据查询"
*               category: "database"
*           page_operation:
*             - name: "capture_screen"
*               description: "截取页面截图查看当前状态"
*               category: "page_operation"
*           business_operation: []
*           activity_workflow:
*             - name: "generate_complete_activity_plan"
*               description: "🎯 智能生成完整活动方案（含海报设计和营销策略）"
*               category: "workflow"
*               requiredRole: ["admin", "principal", "teacher"]
*         metadata:
*           user_role: "teacher"
*           total_tools: 20
*/
// 获取可用工具列表
router.get('/available-tools', authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.role;
    
    // 根据用户角色返回可用工具
    const tools = {
      database_query: [
        {
          name: 'any_query',
          description: '智能自然语言查询 - 支持所有数据查询',
          category: 'database'
        }
      ],
      database_crud: [
        {
          name: 'create_data_record',
          description: '创建数据记录',
          category: 'database'
        },
        {
          name: 'update_data_record',
          description: '更新数据记录',
          category: 'database'
        },
        {
          name: 'delete_data_record',
          description: '删除数据记录',
          category: 'database'
        },
        {
          name: 'batch_import_data',
          description: '批量导入数据',
          category: 'database'
        }
      ],
      // page_operation: 页面操作工具已移除，改用数据库操作和工作流
      // 保留文件工具、文档工具、图片识别工具等实用工具
      file_operation: [
        {
          name: 'upload_file',
          description: '上传文件',
          category: 'file_operation'
        },
        {
          name: 'analyze_image',
          description: '图片识别和分析',
          category: 'file_operation'
        },
        {
          name: 'parse_document',
          description: '解析文档内容（PDF、Word、Excel等）',
          category: 'file_operation'
        }
      ],
      business_operation: [
        {
          name: 'generate_poster',
          description: '生成活动海报',
          category: 'business',
          requiredRole: ['admin', 'principal', 'teacher']
        }
      ],
      activity_workflow: [
        {
          name: 'generate_complete_activity_plan',
          description: '🎯 智能生成完整活动方案（含海报设计和营销策略）',
          category: 'workflow',
          requiredRole: ['admin', 'principal', 'teacher'],
          features: ['AI智能分析', 'Markdown编辑', '一键生成']
        },
        {
          name: 'execute_activity_workflow',
          description: '🚀 执行完整活动创建工作流（自动化全流程）',
          category: 'workflow',
          requiredRole: ['admin', 'principal', 'teacher'],
          features: ['自动创建活动', '生成海报', '配置营销', '手机海报']
        }
      ],
      data_import_workflow: [
        {
          name: 'import_teacher_data',
          description: '👨‍🏫 智能导入老师数据（支持Excel、CSV、PDF、Word）',
          category: 'data-import',
          requiredRole: ['admin', 'principal'],
          features: ['智能字段映射', '数据验证', '批量导入', '错误处理']
        },
        {
          name: 'import_parent_data',
          description: '👨‍👩‍👧‍👦 智能导入家长数据（支持多种格式）',
          category: 'data-import',
          requiredRole: ['admin', 'principal', 'teacher'],
          features: ['自动解析', '字段匹配', '数据清洗', '安全导入']
        }
      ]
    };

    // 根据角色过滤工具
    const filteredTools = {
      database_query: tools.database_query,
      database_crud: tools.database_crud,
      file_operation: tools.file_operation, // 保留文件操作工具
      business_operation: tools.business_operation.filter(tool => {
        if (!tool.requiredRole) return true;
        return tool.requiredRole.includes(userRole);
      }),
      activity_workflow: tools.activity_workflow.filter(tool => {
        if (!tool.requiredRole) return true;
        return tool.requiredRole.includes(userRole);
      }),
      data_import_workflow: tools.data_import_workflow.filter(tool => {
        if (!tool.requiredRole) return true;
        return tool.requiredRole.includes(userRole);
      })
    };

    res.json({
      success: true,
      data: filteredTools,
      metadata: {
        user_role: userRole,
        total_tools: Object.values(filteredTools).flat().length
      }
    });
  } catch (error) {
    console.error('获取工具列表失败:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '获取失败'
    });
  }
});

// 执行单个工具函数（用于测试）
router.post('/execute-single', authMiddleware, async (req, res) => {
  try {
    const { function_name, arguments: args } = req.body;

    if (!function_name || !args) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }

    // FunctionToolsService已被六维记忆系统替代
    const result = { status: 'error', error: 'FunctionToolsService已被六维记忆系统替代' };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('执行单个工具失败:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '执行失败'
    });
  }
});

// Function-tools工具定义 - 简化版本，只保留核心CRUD和查询工具
const FUNCTION_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'any_query',
      description: '智能自然语言查询 - 支持所有数据查询需求。系统会根据用户角色提供相关数据表结构，让AI生成精确的SQL查询',
      parameters: {
        type: 'object',
        properties: {
          userQuery: {
            type: 'string',
            description: '用户的原始查询需求'
          },
          queryType: {
            type: 'string',
            description: '查询类型：statistical（统计分析）、detailed（详细数据）、comparison（对比分析）、trend（趋势分析）',
            default: 'detailed'
          },
          expectedFormat: {
            type: 'string',
            description: '期望的返回格式：table（表格）、chart（图表）、summary（摘要）、mixed（混合）',
            default: 'mixed'
          }
        },
        required: ['userQuery']
      }
    }
  },
  // 注意：navigate_to_page 已移除
  {
    type: 'function',
    function: {
      name: 'capture_screen',
      description: '截取页面截图查看当前状态',
      parameters: {
        type: 'object',
        properties: {
          element: {
            type: 'string',
            description: '要截取的元素选择器，留空表示整个页面'
          }
        }
      }
    }
  }
];

// Function-tools工具执行函数
async function executeFunctionTool(toolName: string, args: any) {
  console.log(`🔧 开始执行Function工具: ${toolName}，参数:`, args);

  try {
    // 尝试使用新的工具加载器系统
    console.log(`🔄 [FunctionTools] 尝试使用新工具系统执行: ${toolName}`);
    try {
      const { ToolLoaderService } = await import('../../services/ai/tools/core/tool-loader.service');
      const loader = new ToolLoaderService();
      const toolDefs = await loader.loadTools([toolName]);
      const toolDef = toolDefs[0];

      if (toolDef) {
        console.log(`✅ [FunctionTools] 通过新工具系统找到工具: ${toolName}`);
        // ToolDefinition 使用 handler 作为执行入口，这里通过 loader.executeTool 统一调用
        const result = await loader.executeTool(toolName, args);
        console.log(`✅ ${toolName} 执行完成，结果:`, result);
        return result;
      } else {
        console.warn(`⚠️ [FunctionTools] 新工具系统中未找到工具: ${toolName}`);
        const result = { status: 'error', error: `工具 ${toolName} 在新工具系统中未找到实现` };
        console.log(`❌ ${toolName} 执行失败，结果:`, result);
        return result;
      }
    } catch (loadError) {
      console.error(`❌ [FunctionTools] 新工具系统执行失败: ${toolName}`, loadError);
      const errorMessage = loadError instanceof Error ? loadError.message : '未知错误';
      const result = { status: 'error', error: `工具 ${toolName} 执行失败: ${errorMessage}` };
      console.log(`❌ ${toolName} 执行失败，结果:`, result);
      return result;
    }
  } catch (error) {
    console.error(`❌ Function工具执行失败: ${toolName}`, error);
    throw error;
  }
}

/**
* @swagger
* /api/ai/function-tools/smart-chat:
*   post:
*     summary: "AI智能聊天接口"
*     description: "支持多轮工具调用的智能聊天接口，可自动执行复杂工作流"
*     tags: [AI工具管理]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/SmartChatRequest'
*           examples:
*             simple_question:
*               summary: "简单问答"
*               value:
*                 messages:
*                   - role: "user"
*                     content: "查询最近10个活动的基本信息"
*                 conversation_id: 123
*                 max_iterations: 3
*             complex_workflow:
*               summary: "复杂工作流"
*               value:
*                 messages:
*                   - role: "user"
*                     content: "帮我创建一个春游活动，包括活动策划、海报设计和营销推广"
*                 conversation_id: 456
*                 max_iterations: 12
*     responses:
*       200:
*         description: "智能对话成功"
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/SmartChatResponse'
*       400:
*         description: "请求参数错误"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "消息格式错误"
*       500:
*         description: "服务器内部错误"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: false
*                 error:
*                   type: string
*                   example: "服务暂时不可用"
*                 message:
*                   type: string
*                   example: "抱歉，Function-tools暂时无法为您提供服务。请稍后重试或联系技术支持。"
*     example:
*       summary: "创建活动工作流响应示例"
*       value:
*         success: true
*         data:
*           message: "已为您完成春游活动的创建，包括活动信息录入、海报设计和营销推广配置。活动已成功创建，您可以在活动列表中查看详情。"
*           conversation_id: "1647892345678"
*           model_used: "gpt-3.5-turbo"
*           usage:
*             prompt_tokens: 150
*             completion_tokens: 200
*             total_tokens: 350
*           iterations: 8
*           conversation_history:
*             - iteration: 1
*               ai_response: "我来帮您创建春游活动..."
*               tool_calls:
*                 - id: "call_123"
*                   function:
*                     name: "analyze_task_complexity"
*                     arguments: '{"task": "创建春游活动"}'
*             - iteration: 2
*               ai_response: "根据分析，这是一个复杂任务，我需要..."
*               tool_results: [...]
*           final_response: true
*/
// Function-tools智能聊天接口 (支持多轮工具调用)
router.post('/smart-chat', async (req, res) => {
  try {
    // 🔧 使用环境变量配置工具调用轮数（优先使用请求参数，其次使用环境变量，默认12）
    const ENV_MAX_ITERATIONS = Number(process.env.AI_MAX_ITERATIONS || 12);
    const { messages, conversation_id, max_iterations = ENV_MAX_ITERATIONS } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '消息格式错误' });
    }

    // Function-tools系统提示词
    const systemPrompt = `你是一个智能的幼儿园管理助手，专门帮助用户查询数据、分析趋势和执行系统操作。

你可以使用以下工具：

**数据查询工具**：
1. any_query - 智能自然语言查询，支持所有数据查询需求（活动、招生、学生、教师、班级等）

**数据操作工具（CRUD）**：
2. create_data_record - 创建数据记录（学生、教师、活动、班级等）
3. update_data_record - 更新数据记录
4. delete_data_record - 删除数据记录（支持软删除和硬删除）
5. batch_import_data - 批量导入数据

**🎯 API调用工具（新四步流程）**：
6. search_api_categories - 📌 第1步：搜索API分类（支持口语化表达，如“娃”→“学生”）
7. get_api_endpoints - 📝 第2步：查看分类下的API端点列表（不包含参数）
8. get_api_details - 🔍 第3步：获取端点的详细参数说明
9. http_request - 🚀 第4步：执行API调用

**文件操作工具**：
10. upload_file - 上传文件
11. analyze_image - 图片识别和分析
12. parse_document - 解析文档内容（PDF、Word、Excel等）

**任务管理工具**：
13. analyze_task_complexity - 分析任务复杂度，判断是否需要TodoList
14. create_todo_list - 为复杂任务创建待办事项清单
15. update_todo_task - 更新TodoList中的任务状态

**🎯 活动工作流工具（NEW）**：
16. generate_complete_activity_plan - 🎯 智能生成完整活动方案（含海报设计和营销策略）
17. execute_activity_workflow - 🚀 执行完整活动创建工作流（自动化全流程）

**数据导入工作流工具**：
18. import_teacher_data - 👨‍🏫 智能导入老师数据（支持Excel、CSV、PDF、Word）
19. import_parent_data - 👨‍👩‍👧‍👦 智能导入家长数据（支持多种格式）

**核心开发模式**：
- 以数据库操作和工作流为核心
- 不再使用页面操作工具（如navigate_to_page、fill_form等）
- 所有业务操作通过数据库CRUD和工作流完成

**🔥 API调用四步流程（强制执行）**：

当用户需求涉及“查询学生”、“删除老师”、“更新班级”等API操作时，**必须**按顺序执行四步流程：

📌 **STEP 1: 搜索API分类 (MANDATORY)**
- 工具：search_api_categories
- 输入：提取关键词（支持口语化，如“娃”、“孩子”→“学生”）
- 示例：用户问“查询我园的娃有多少” → keywords: ["query", "student"]
- 输出：返回相关分类列表（如 [Students], [Student] 等）

📝 **STEP 2: 查看端点列表 (MANDATORY)**
- 工具：get_api_endpoints
- 输入：从第1步选择的分类名（如 "Students"）
- 输出：返回该分类下的所有端点（只有path、method、summary，**不包含参数**）
- 示例输出：GET /api/students, POST /api/students, DELETE /api/students/{id}

🔍 **STEP 3: 获取详细参数 (MANDATORY)**
- 工具：get_api_details
- 输入：从第2步选择的端点（path + method）
- 输出：返回完整的参数说明、请求体、响应格式

🚀 **STEP 4: 执行API调用 (MANDATORY)**
- 工具：http_request
- 输入：根据第3步的参数说明构建请求
- 注意：删除/更新/创建操作会触发用户确认对话框

⚠️ **严禁跳过步骤**：
- ✖️ 禁止直接调用 http_request（必须先执行第1-3步）
- ✖️ 禁止跳过 search_api_categories（必须先确定分类）
- ✖️ 禁止跳过 get_api_endpoints（必须看到可用端点）
- ✅ 必须按 1→2→3→4 的顺序依次执行

**数据查询最佳实践**：
- 对于所有数据查询需求，优先使用 any_query 工具
- any_query 支持自然语言查询，会自动转换为SQL
- 示例：“查询最近10个活动”、“统计每个班级的学生数量”、“分析最近6个月的招生趋势”

**MANDATORY EXECUTION WORKFLOW:**

🔴 **STEP 1: 复杂度分析 (REQUIRED)**
- 对于任何用户查询，MUST首先调用 analyze_task_complexity
- 这是强制性的第一步，绝对不可跳过

🔴 **STEP 2: TodoList创建 (CONDITIONAL MANDATORY)**
- IF analyze_task_complexity.needsTodoList === true
- THEN MUST立即调用 create_todo_list 工具
- 将用户原始需求作为title，基于分析结果生成任务列表

🔴 **STEP 3: 顺序执行 (SEQUENTIAL MANDATORY)**
- 按照TodoList顺序执行每个任务
- 每完成一个任务MUST调用 update_todo_task 更新状态
- 每个工具调用后MUST验证结果再继续

**TodoList使用场景**：
- 用户提到多个操作动词 (如“创建并发送通知”)
- 检测到时间序列词汇 (如“首先...然后...最后”)
- 复杂任务关键词 (如“策划活动”、“组织会议”)
- 长句描述 (超过50字的复杂需求)

**智能执行原则**：
1. **数据优先** - 通过数据库操作完成业务逻辑
2. **工作流自动化** - 使用预定义工作流处理复杂任务
3. **实时验证** - 每步操作后验证数据结果
4. **错误处理** - 遇到错误时提供清晰的反馈和解决方案

请根据用户需求智能使用工具，主动创建TodoList管理复杂任务，并提供专业的服务。`;

    // 执行多轮对话循环，直到不再需要工具调用
    let currentMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({ role: msg.role, content: msg.content }))
    ];
    let iterationCount = 0;
    let finalResult = null;
    const conversationHistory: any[] = [];

    while (iterationCount < max_iterations) {
      iterationCount++;
      console.log(`🔄 开始第 ${iterationCount} 轮对话...`);
      console.log('📝 当前消息数:', currentMessages.length);

      try {
        // 🚀 使用AIBridgeService替代直接axios调用
        const { aiBridgeService } = await import('../../services/ai/bridge/ai-bridge.service');
        const AIModelConfigModule = await import('../../models/ai-model-config.model');
        const AIModelConfig = AIModelConfigModule.default;

        // 获取模型配置
        const modelConfig = await AIModelConfig.findOne({
          where: { status: 'active', isDefault: true }
        });

        if (!modelConfig) {
          throw new Error('未找到可用的AI模型配置');
        }

        const response = await aiBridgeService.generateChatCompletion({
          model: modelConfig.name,
          messages: currentMessages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          tools: FUNCTION_TOOLS.map((tool: any) => ({
            type: 'function' as const,
            function: tool.function
          })),
          tool_choice: 'auto',
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        }, {
          endpointUrl: modelConfig.endpointUrl,
          apiKey: modelConfig.apiKey
        }); // 🚀 使用AIBridgeService统一配置

        console.log(`✅ 第 ${iterationCount} 轮AI调用成功`);
        const choice = response.choices[0];
        const message = choice?.message;

        // 将AI的回复添加到对话历史
        currentMessages.push({
          role: 'assistant',
          content: message.content || null,
          tool_calls: message.tool_calls || null
        });

        conversationHistory.push({
          iteration: iterationCount,
          ai_response: message.content,
          tool_calls: message.tool_calls,
          timestamp: new Date().toISOString()
        });

        // 检查是否有工具调用
        if (message?.tool_calls && message.tool_calls.length > 0) {
          console.log(`🔧 第 ${iterationCount} 轮检测到 ${message.tool_calls.length} 个工具调用`);

          // 处理工具调用并准备工具结果消息
          const toolResultMessages = [];

          for (const toolCall of message.tool_calls) {
            try {
              console.log(`🔧 执行工具: ${toolCall.function.name}，参数: ${toolCall.function.arguments}`);
              const result = await executeFunctionTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
              console.log(`✅ 工具调用成功，结果:`, result);

              // 将工具结果作为消息添加到对话
              toolResultMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(result)
              });

            } catch (error) {
              console.error(`❌ 工具调用失败: ${toolCall.function.name}`, error);
              toolResultMessages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  error: 'Function工具调用失败',
                  message: error instanceof Error ? error.message : '未知错误'
                })
              });
            }
          }

          // 将工具结果消息添加到对话历史
          currentMessages.push(...toolResultMessages);
          
          conversationHistory[conversationHistory.length - 1].tool_results = toolResultMessages;

          console.log(`📋 第 ${iterationCount} 轮工具调用完成，继续下一轮对话...`);
          // 继续循环，让AI处理工具结果
          continue;

        } else {
          // 没有工具调用，对话结束
          console.log(`✅ 对话完成，共进行了 ${iterationCount} 轮`);
          finalResult = {
            success: true,
            data: {
              message: message.content || '任务已完成',
              conversation_id: conversation_id || Date.now().toString(),
              model_used: response.model,
              usage: response.usage,
              iterations: iterationCount,
              conversation_history: conversationHistory,
              final_response: true
            }
          };
          break;
        }

      } catch (iterationError) {
        console.error(`❌ 第 ${iterationCount} 轮对话失败:`, iterationError);
        // 如果这轮失败，尝试下一轮（除非已经是最后一轮）
        if (iterationCount >= max_iterations) {
          throw iterationError;
        }
        continue;
      }
    }

    // 返回最终结果
    if (finalResult) {
      res.json(finalResult);
    } else {
      // 达到最大迭代次数但未完成
      res.json({
        success: true,
        data: {
          message: '任务部分完成，已达到最大对话轮数限制',
          conversation_id: conversation_id || Date.now().toString(),
          iterations: iterationCount,
          conversation_history: conversationHistory,
          incomplete: true
        }
      });
    }

  } catch (error) {
    console.error('Function-tools智能聊天失败:', error);
    res.status(500).json({
      success: false,
      error: '服务暂时不可用',
      message: '抱歉，Function-tools暂时无法为您提供服务。请稍后重试或联系技术支持。'
    });
  }
});

/**
* @swagger
* /api/ai/function-tools/thinking-sse:
*   post:
*     summary: "SSE思考过程接口"
*     description: "实时流式显示AI思考过程和回复内容，支持Server-Sent Events"
*     tags: [AI工具管理]
*     security:
*       - bearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - messages
*             properties:
*               messages:
*                 type: array
*                 items:
*                   type: object
*                   properties:
*                     role:
*                       type: string
*                       enum: [user, assistant, system]
*                     content:
*                       type: string
*                 description: "对话消息列表"
*                 example:
*                   - role: "user"
*                     content: "如何提高幼儿园的招生效果？"
*     responses:
*       200:
*         description: "SSE流式响应连接建立成功"
*         content:
*           text/event-stream:
*             schema:
*               type: string
*               example: "event: thinking-start\\ndata: {\\"status\\": \\"thinking\\"}"
*       400:
*         description: "请求参数错误"
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 error:
*                   type: string
*                   example: "消息格式错误"
*       500:
*         description: "服务器内部错误"
*         content:
*           text/event-stream:
*             schema:
*               type: string
*               example: |
*                 event: error
*                 data: {"error": "服务暂时不可用"}
*     x-server-sent-events:
*       description: "支持Server-Sent Events流式响应"
*       eventTypes:
*         - thinking-start: "思考开始"
*         - thinking-complete: "思考完成"
*         - response-start: "开始回复"
*         - response-content: "回复内容片段"
*         - complete: "对话完成"
*         - error: "错误事件"
*       connectionTimeout: "30秒"
*       keepAlive: "长连接保持"
*     example:
*       summary: "流式响应示例"
*       description: "建立SSE连接后的完整事件流"
*       value: |
*         event: thinking-start
*         data: {"status": "thinking"}
*
*         event: response-content
*         data: {"content": "提高招生效果是每个幼儿园都关注的重要问题"}
*
*         event: response-content
*         data: {"content": "以下是我建议的策略："}
*
*         event: complete
*         data: {"status": "complete"}
*/
// SSE思考过程接口 - 实时显示大模型思考过程
router.post('/thinking-sse', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '消息格式错误' });
    }

    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 系统提示词
    const systemPrompt = `你是一个智能的幼儿园管理助手，专门帮助用户处理各种幼儿园管理相关的问题。

请仔细思考用户的问题，然后提供专业的建议和回复。如果用户需要查询数据或执行操作，请明确告诉用户需要什么信息，或者提供具体的操作建议。

保持回复自然、专业和有用。`;

    // 准备消息
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    console.log('🔄 开始SSE思考对话...');

    // 发送开始思考事件
    res.write(`event: thinking-start\ndata: {"status": "thinking"}\n\n`);

    // 调用豆包AI模型 - 使用Flash版本提升响应速度
    const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      model: 'doubao-seed-1-6-flash-250715',
      messages: aiMessages,
      temperature: 0.1, // Flash模型使用较低温度
      max_tokens: 2000,
      stream: true
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1c155dc7-0cec-441b-9b00-0fb8ccc16089'
      },
      responseType: 'stream',
      timeout: 30000 // Flash模型响应快，30秒超时足够
    });

    let isThinkingPhase = true;
    let thinkingContent = '';
    let finalContent = '';

    // 处理流式响应
    response.data.on('data', (chunk: Buffer) => {
      const lines = chunk.toString().split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            // 发送思考完成事件
            res.write(`event: thinking-complete\ndata: {"thinking": ${JSON.stringify(thinkingContent)}}\n\n`);
            
            // 发送最终回复开始事件
            res.write(`event: response-start\ndata: {"status": "responding"}\n\n`);
            
            // 发送最终回复内容
            if (finalContent) {
              res.write(`event: response-content\ndata: {"content": ${JSON.stringify(finalContent)}}\n\n`);
            }
            
            // 发送完成事件
            res.write(`event: complete\ndata: {"status": "complete"}\n\n`);
            res.end();
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;

            // 检查是否有内容
            if (delta?.content) {
              res.write(`event: response-content\ndata: {"content": ${JSON.stringify(delta.content)}}\n\n`);
            }
          } catch (error) {
            console.error('解析SSE数据失败:', error);
          }
        }
      }
    });

    response.data.on('end', () => {
      res.write(`event: complete\ndata: {"status": "complete"}\n\n`);
      res.end();
    });

    response.data.on('error', (error: Error) => {
      console.error('流式响应错误:', error);
      res.write(`event: error\ndata: {"error": "${error.message}"}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('❌ 流式聊天错误:', error);
    res.write(`event: error\ndata: {"error": "${error instanceof Error ? error.message : '未知错误'}"}\n\n`);
    res.end();
  }
});

export default router;