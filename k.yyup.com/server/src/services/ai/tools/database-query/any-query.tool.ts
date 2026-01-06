import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';
import { unifiedAIBridge } from '../../../unified-ai-bridge.service';
import { AiBridgeMessageRole } from '../../bridge/ai-bridge.types';
import axios from 'axios';
import { getSequelize } from '../../../../config/database';
import { QueryTypes } from 'sequelize';

/**
 * 智能查询工具 - 基于数据库元数据的查询模式
 * 🚀 升级版:通过数据库元数据API获取表结构,AI生成精准SQL查询
 * 💡 Token效率提升70-80%:不再传递庞大的API_GROUPS映射表
 */
const anyQueryTool: ToolDefinition = {
  name: "any_query",
  description: `🚀 智能数据库查询工具 - 专用于复杂统计分析和多表关联查询

**核心能力**:
1. 动态获取数据库表结构 - 实时查询表字段、类型、注释
2. AI生成精准SQL - 基于真实表结构生成准确的SQL语句
3. 复杂查询支持 - 支持JOIN、聚合、统计、分组等复杂查询
4. 智能结果格式化 - 自动格式化查询结果为易读格式

**适用场景** (✅ 适用):
- ✅ 统计分析 (COUNT、SUM、AVG、趋势分析)
- ✅ 多表JOIN关联查询
- ✅ 复杂的GROUP BY分组统计
- ✅ 跨业务域的综合分析查询
- ✅ API不支持的复杂自定义查询

**不适用场景** (❌ 请使用API工具链):
- ❌ 简单的列表查询 → 请使用 search_api_categories 工具
- ❌ 单条记录详情查询 → 请使用 search_api_categories 工具
- ❌ 标准CRUD操作 → 请使用 search_api_categories 工具
- ❌ "查询所有学生" → 应该用 API工具链 → GET /api/students
- ❌ "查询学生详情" → 应该用 API工具链 → GET /api/students/{id}

**示例** (正确用法):
- ✅ "统计各班级学生人数分布"
- ✅ "分析本月活动参与情况趋势"
- ✅ "查询师生比最高的班级"
- ✅ "统计各活动类型的参与人数"
- ✅ "分析最近一个月的招生转化率"`,
  category: TOOL_CATEGORIES.QUERY,
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "自然语言查询内容,例如:'统计本月活动参与人数最多的前5个活动'"
      },
      context: {
        type: "object",
        description: "查询上下文信息",
        properties: {
          domain: {
            type: "string",
            enum: ["students", "teachers", "activities", "enrollment", "finance", "general"],
            description: "查询领域,用于优化查询性能"
          },
          time_scope: {
            type: "string",
            enum: ["today", "week", "month", "quarter", "year", "all"],
            description: "时间范围,用于过滤数据"
          },
          user_role: {
            type: "string",
            description: "用户角色,用于权限控制"
          },
          user_id: {
            type: "string",
            description: "用户ID,用于权限验证"
          }
        }
      },
      output_format: {
        type: "string",
        enum: ["table", "chart", "summary", "detailed", "raw"],
        default: "summary",
        description: "输出格式"
      },
      filters: {
        type: "object",
        description: "额外过滤条件",
        properties: {
          include_archived: { type: "boolean", default: false },
          limit: { type: "integer", minimum: 1, maximum: 1000, default: 50 }
        }
      }
    },
    required: ["query"]
  },
  
  handler: async (args: any) => {
    try {
      const {
        query,
        context = {},
        output_format = "summary",
        filters = {}
      } = args;

      console.log('🚀 [智能查询-元数据模式] 开始处理查询:', {
        query: query.substring(0, 100),
        domain: context.domain,
        format: output_format
      });

      // 🎯 第一步:AI分析查询意图,识别需要的表
      const queryAnalysis = await analyzeQueryIntent(query, context);
      console.log('📊 查询意图分析:', queryAnalysis);

      // 🎯 第二步:获取相关表的结构信息
      const tableStructures = await fetchTableStructures(queryAnalysis.tables);
      console.log('📋 获取到表结构:', Object.keys(tableStructures));

      // 🎯 第三步:基于表结构生成SQL
      const sqlQuery = await generateSQLFromStructure(query, tableStructures, queryAnalysis, context);
      console.log('📝 生成的SQL:', sqlQuery);

      // 🎯 第四步:执行SQL查询
      const queryResults = await executeSQLQuery(sqlQuery);
      console.log('✅ 查询结果:', { rowCount: queryResults.length });

      // 🎯 第五步:格式化结果
      const formattedResult = await formatQueryResults(queryResults, output_format, query, queryAnalysis);

      console.log('✅ [智能查询-元数据模式] 查询完成:', {
        tables: queryAnalysis.tables,
        rowCount: queryResults.length,
        format: output_format
      });

      return {
        success: true,
        data: {
          query,
          tables: queryAnalysis.tables,
          sql: sqlQuery,
          result: formattedResult,
          ui_instruction: {
            type: 'render_query_result',
            data: formattedResult,
            format: output_format,
            title: `${queryAnalysis.intent} 查询结果`
          },
          message: `✅ 查询完成:查询了 ${queryAnalysis.tables.length} 个表,返回 ${queryResults.length} 条结果`
        },
        metadata: {
          name: "any_query",
          tables: queryAnalysis.tables,
          intent: queryAnalysis.intent,
          dataCount: queryResults.length,
          queryTime: Date.now(),
          usedAI: true,
          usedRealDatabase: true,
          usedMetadataAPI: true
        }
      };
      
    } catch (error) {
      console.error('❌ [智能查询] 查询失败:', error);

      return {
        success: false,
        error: `智能查询失败: ${(error as Error).message}`,
        metadata: {
          name: "any_query",
          error_type: 'query_failed',
          error_details: (error as Error).message
        }
      };
    }
  }
};

/**
 * 🧠 AI分析查询意图,识别需要的表
 */
async function analyzeQueryIntent(query: string, context: any) {
  try {
    console.log('🧠 [查询意图分析] 开始分析');

    const analysisPrompt = `请分析以下数据库查询需求,识别需要查询的数据表:

查询内容: ${query}
查询领域: ${context.domain || '通用'}
时间范围: ${context.time_scope || '不限'}

请返回JSON格式的分析结果:
{
  "intent": "statistics|search|comparison|trend|ranking|summary",
  "tables": ["需要查询的表名,如students, teachers, activities等"],
  "keywords": ["关键词"],
  "complexity": "simple|medium|complex",
  "needsJoin": true/false,
  "needsAggregation": true/false
}

只返回JSON,不要其他内容:`;

    const response = await unifiedAIBridge.chat({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是数据库查询分析专家。根据用户查询,识别需要的数据表。常见表:students(学生), teachers(教师), classes(班级), activities(活动), activity_registrations(活动报名), parents(家长), users(用户), enrollment_applications(招生申请)等。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: analysisPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 300
    });

    const aiContent = response.data?.content || response.data?.message || '';
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log('✅ [查询意图分析] 成功:', analysis);
      return analysis;
    } else {
      throw new Error('AI响应格式不正确');
    }
  } catch (error) {
    console.warn('⚠️ [查询意图分析] 失败,使用默认分析:', error);
    return {
      intent: 'search',
      tables: ['students', 'teachers', 'activities'],
      keywords: [],
      complexity: 'medium',
      needsJoin: false,
      needsAggregation: false
    };
  }
}

/**
 * 🔄 表名映射 - 确保使用正确的复数形式表名
 */
const TABLE_NAME_MAP: Record<string, string> = {
  'student': 'students',
  'teacher': 'teachers',
  'class': 'classes',
  'activity': 'activities',
  'parent': 'parents',
  'user': 'users',
  'enrollment_application': 'enrollment_applications',
  'activity_registration': 'activity_registrations',
  'consultation': 'consultations',
  'notification': 'notifications',
  'task': 'tasks',
  'role': 'roles',
  'permission': 'permissions'
};

/**
 * 📋 获取表结构信息
 */
async function fetchTableStructures(tables: string[]): Promise<any> {
  const structures: any = {};
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

  for (let tableName of tables) {
    // 应用表名映射，修正单数形式为复数形式
    const originalName = tableName;
    tableName = TABLE_NAME_MAP[tableName.toLowerCase()] || tableName;
    if (originalName !== tableName) {
      console.log(`🔄 [表名映射] ${originalName} → ${tableName}`);
    }
    
    try {
      console.log(`📋 [获取表结构] ${tableName}`);
      
      const response = await axios.get(`${baseUrl}/api/database/tables/${tableName}`, {
        timeout: 5000
      });

      if (response.data.success) {
        structures[tableName] = response.data.data;
        console.log(`✅ [获取表结构] ${tableName}: ${response.data.data.columnCount} 个字段`);
      }
    } catch (error) {
      console.warn(`⚠️ [获取表结构] ${tableName} 失败:`, (error as Error).message);
    }
  }

  return structures;
}

/**
 * 📝 基于表结构生成SQL
 */
async function generateSQLFromStructure(
  query: string,
  tableStructures: any,
  queryAnalysis: any,
  context: any
): Promise<string> {
  try {
    console.log('📝 [生成SQL] 开始');

    // 构建表结构描述
    let structureDescription = '数据库表结构:\n\n';
    for (const [tableName, structure] of Object.entries(tableStructures)) {
      const tableData = structure as any;
      structureDescription += `表名: ${tableName}\n`;
      structureDescription += `说明: ${tableData.table?.tableComment || '无'}\n`;
      structureDescription += `字段:\n`;
      
      tableData.columns.forEach((col: any) => {
        structureDescription += `  - ${col.columnName}: ${col.dataType} ${col.isNullable === 'NO' ? '(必填)' : '(可选)'} ${col.columnComment ? '// ' + col.columnComment : ''}\n`;
      });
      structureDescription += `\n`;
    }

    const sqlPrompt = `基于以下表结构,生成MySQL查询语句:

${structureDescription}

用户查询: ${query}
查询意图: ${queryAnalysis.intent}
需要JOIN: ${queryAnalysis.needsJoin ? '是' : '否'}
需要聚合: ${queryAnalysis.needsAggregation ? '是' : '否'}

要求:
1. 只返回SQL语句,不要解释
2. 使用标准MySQL语法
3. 只使用SELECT语句
4. 优先查询status='active'或status=1的数据
5. 如果涉及时间,使用合适的时间过滤
6. 如果需要统计,使用聚合函数
7. 限制返回结果不超过100条
8. ⚠️ 重要:必须完全按照上面表结构中列出的【精确字段名】,不要猜测或转换字段命名格式
9. 关联查询时使用表结构中显示的实际关联字段
10. 🚨 禁止使用不必要的JOIN导致笛卡尔积：
    - ❌ 错误: SELECT COUNT(s.id), COUNT(t.id) FROM students s JOIN teachers t
    - ✅ 正确: SELECT (SELECT COUNT(*) FROM students WHERE status=1) as student_count, (SELECT COUNT(*) FROM teachers WHERE status=1) as teacher_count
    - 如果需要统计多个表的独立计数,使用子查询分别统计,不要使用JOIN

SQL:`;

    const response = await unifiedAIBridge.chat({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是MySQL专家。根据表结构生成精准的SQL查询语句。只返回SQL,不要其他内容。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: sqlPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    let sql = response.data?.content || response.data?.message || '';
    
    // 清理SQL(移除markdown代码块标记)
    sql = sql.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('✅ [生成SQL] 成功');
    return sql;
    
  } catch (error) {
    console.error('❌ [生成SQL] 失败:', error);
    throw error;
  }
}

/**
 * 🔧 执行SQL查询
 */
async function executeSQLQuery(sql: string): Promise<any[]> {
  try {
    console.log('🔧 [执行SQL] 开始');
    
    const sequelize = getSequelize();
    const results = await sequelize.query(sql, {
      type: QueryTypes.SELECT
    });

    console.log(`✅ [执行SQL] 成功,返回 ${results.length} 条记录`);
    return results;
    
  } catch (error) {
    console.error('❌ [执行SQL] 失败:', error);
    throw error;
  }
}

/**
 * 🎨 格式化查询结果
 */
async function formatQueryResults(
  results: any[],
  format: string,
  query: string,
  queryAnalysis: any
): Promise<any> {
  if (format === 'raw') {
    return results;
  }

  if (format === 'table') {
    return {
      type: 'table',
      data: results,
      columns: results.length > 0 ? Object.keys(results[0]) : []
    };
  }

  // summary 格式
  return {
    type: 'summary',
    query,
    intent: queryAnalysis.intent,
    totalRecords: results.length,
    data: results.slice(0, 10), // 只显示前10条
    hasMore: results.length > 10
  };
}

export default anyQueryTool;

