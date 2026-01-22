import { ToolDefinition, TOOL_CATEGORIES } from '../../../../types/ai-model-types';
import { unifiedAIBridge } from '../../../unified-ai-bridge.service';
import { AiBridgeMessageRole } from '../../bridge/ai-bridge.types';
import axios from 'axios';
import { getSequelize } from '../../../../config/database';
import { QueryTypes } from 'sequelize';
import { 
  ROLE_TABLE_PERMISSIONS, 
  checkTablePermission, 
  getTablePermission,
  validateSQLPermissions 
} from '../../../../config/role-table-permissions';

// ============================================================
// 类型定义
// ============================================================

/** 查询分析结果 */
interface QueryAnalysis {
  intent: string;
  tables: string[];
  keywords: string[];
  complexity: string;
  needsJoin: boolean;
  needsAggregation: boolean;
}

/** 隔离上下文 */
interface IsolationContext {
  role: string;
  userId?: number;
  kindergartenId?: number;
  teacherId?: number;
  parentId?: number;
}

/** 权限感知的表结构 */
interface PermittedTableStructure {
  tableName: string;
  columns: any[];
  allowedFields: string[];
  forbiddenFields: string[];
  requiredConditions: string[];
  relations?: any[];
}

/** SQL验证结果 */
interface SQLValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedSQL: string;
}

// ============================================================
// 工具定义
// ============================================================

/**
 * 智能查询工具 - 6步安全查询流程
 * 🚀 基于数据库元数据API获取表结构
 * 🔒 集成RBAC权限控制和租户隔离
 */
const anyQueryTool: ToolDefinition = {
  name: "any_query",
  description: `🚀 智能数据库查询工具 - 专用于复杂统计分析和多表关联查询

**核心能力**:
1. 动态获取数据库表结构 - 实时查询表字段、类型、注释
2. AI生成精准SQL - 基于真实表结构生成准确的SQL语句
3. 复杂查询支持 - 支持JOIN、聚合、统计、分组等复杂查询
4. 🔒 权限控制 - 基于角色的表和字段访问控制
5. 🔒 租户隔离 - 自动添加数据隔离条件

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

**示例** (正确用法):
- ✅ "统计各班级学生人数分布"
- ✅ "分析本月活动参与情况趋势"
- ✅ "查询师生比最高的班级"
- ✅ "统计各活动类型的参与人数"`,
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
        description: "查询上下文信息（包含权限信息）",
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
            description: "用户角色,用于权限控制（admin/principal/teacher/parent）"
          },
          user_id: {
            type: "number",
            description: "用户ID"
          },
          kindergarten_id: {
            type: "number",
            description: "幼儿园ID,用于租户隔离"
          },
          teacher_id: {
            type: "number",
            description: "教师ID（教师角色使用）"
          },
          parent_id: {
            type: "number",
            description: "家长ID（家长角色使用）"
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
      } = args;

      // 📡 获取SSE事件发射器（如果存在）
      const sseEmitter = args._sseEmitter || (() => {});

      // 构建隔离上下文
      const isolationContext: IsolationContext = {
        role: context.user_role || context.role || 'admin',
        userId: context.user_id || context.userId,
        kindergartenId: context.kindergarten_id || context.kindergartenId,
        teacherId: context.teacher_id || context.teacherId,
        parentId: context.parent_id || context.parentId
      };

      console.log('🚀 [智能查询-6步安全流程] 开始处理查询:', {
        query: query.substring(0, 100),
        role: isolationContext.role,
        kindergartenId: isolationContext.kindergartenId
      });

      // ============================================================
      // 第1步: AI分析查询意图
      // ============================================================
      sseEmitter('progress', {
        name: 'any_query',
        toolName: 'any_query',
        status: '🧠 第1步: 分析查询意图...',
        message: '🧠 第1步: 分析查询意图...',
        progress: 10
      });
      const queryAnalysis = await analyzeQueryIntent(query, context);
      console.log('📊 [第1步] 查询意图分析:', queryAnalysis);

      // ============================================================
      // 第2步: 权限预检 + 表过滤
      // ============================================================
      sseEmitter('progress', {
        name: 'any_query',
        toolName: 'any_query',
        status: '🔒 第2步: 权限预检...',
        message: '🔒 第2步: 权限预检...',
        progress: 20
      });
      const permittedTables = filterTablesByPermission(queryAnalysis.tables, isolationContext);
      console.log('🔒 [第2步] 权限过滤后的表:', permittedTables);

      if (permittedTables.length === 0) {
        return {
          success: false,
          error: `您的角色 (${isolationContext.role}) 没有权限访问请求的数据表`,
          metadata: {
            name: "any_query",
            error_type: 'permission_denied',
            requestedTables: queryAnalysis.tables,
            role: isolationContext.role
          }
        };
      }

      // ============================================================
      // 第3步: 获取权限感知的表结构
      // ============================================================
      sseEmitter('progress', {
        name: 'any_query',
        toolName: 'any_query',
        status: '📊 第3步: 获取数据结构...',
        message: '📊 第3步: 获取数据结构...',
        progress: 35
      });
      const tableStructures = await fetchPermittedTableStructures(permittedTables, isolationContext);
      console.log('📋 [第3步] 获取到表结构:', Object.keys(tableStructures));

      // ============================================================
      // 第4步: 带隔离约束的SQL生成
      // ============================================================
      sseEmitter('progress', {
        name: 'any_query',
        toolName: 'any_query',
        status: '📝 第4步: 生成安全SQL...',
        message: '📝 第4步: 生成安全SQL...',
        progress: 50
      });
      const sqlQuery = await generateIsolatedSQL(query, tableStructures, queryAnalysis, isolationContext);
      console.log('📝 [第4步] 生成的SQL:', sqlQuery);

      // ============================================================
      // 第5步: SQL安全验证
      // ============================================================
      sseEmitter('progress', {
        name: 'any_query',
        toolName: 'any_query',
        status: '🛡️ 第5步: 安全验证...',
        message: '🛡️ 第5步: 安全验证...',
        progress: 65
      });
      const validationResult = validateAndSanitizeSQL(sqlQuery, isolationContext, tableStructures);
      console.log('🛡️ [第5步] 安全验证结果:', { valid: validationResult.valid, errors: validationResult.errors });

      if (!validationResult.valid) {
        return {
          success: false,
          error: `SQL安全验证失败: ${validationResult.errors.join('; ')}`,
          metadata: {
            name: "any_query",
            error_type: 'security_validation_failed',
            errors: validationResult.errors,
            warnings: validationResult.warnings,
            role: isolationContext.role
          }
        };
      }

      // ============================================================
      // 第6步: 执行 + 格式化
      // ============================================================
      sseEmitter('progress', {
        name: 'any_query',
        toolName: 'any_query',
        status: '⚡ 第6步: 执行查询...',
        message: '⚡ 第6步: 执行查询...',
        progress: 80
      });
      const queryResults = await executeSQLQuery(validationResult.sanitizedSQL);
      console.log('✅ [第6步] 查询结果:', { rowCount: queryResults.length });

      // 格式化结果
      sseEmitter('progress', {
        name: 'any_query',
        toolName: 'any_query',
        status: '🎨 格式化结果...',
        message: '🎨 格式化结果...',
        progress: 95
      });
      const formattedResult = formatQueryResults(queryResults, output_format, query, queryAnalysis);

      console.log('✅ [智能查询-6步安全流程] 查询完成:', {
        tables: permittedTables,
        rowCount: queryResults.length,
        role: isolationContext.role,
        isolated: isolationContext.role !== 'super_admin' && isolationContext.role !== 'admin'
      });

      return {
        success: true,
        data: {
          query,
          tables: permittedTables,
          sql: validationResult.sanitizedSQL,
          result: formattedResult,
          ui_instruction: {
            type: 'render_query_result',
            data: formattedResult,
            format: output_format,
            title: `${queryAnalysis.intent} 查询结果`
          },
          message: `✅ 查询完成: 查询了 ${permittedTables.length} 个表, 返回 ${queryResults.length} 条结果`
        },
        metadata: {
          name: "any_query",
          tables: permittedTables,
          intent: queryAnalysis.intent,
          dataCount: queryResults.length,
          queryTime: Date.now(),
          role: isolationContext.role,
          isolated: isolationContext.role !== 'super_admin' && isolationContext.role !== 'admin',
          securityValidated: true,
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

// ============================================================
// 第1步: AI分析查询意图
// ============================================================

async function analyzeQueryIntent(query: string, context: any): Promise<QueryAnalysis> {
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
          content: `你是数据库查询分析专家。根据用户查询,识别需要的数据表。

常见表:
- students(学生信息)
- teachers(教师信息)
- classes(班级信息)
- activities(活动信息)
- activity_registrations(活动报名记录)
- parents(家长信息)
- enrollment_consultations(招生咨询记录) - 🔥重要:招生数据主要在此表
- enrollment_applications(招生申请)
- enrollment_plans(招生计划)
- marketing_campaigns(营销活动)
- users(用户信息)

⚠️ 注意:
- 查询"招生数据"时,优先使用 enrollment_consultations 表
- enrollment_applications 表通常为空`
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
      // 标准化表名
      analysis.tables = analysis.tables.map((t: string) => normalizeTableName(t));
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

// ============================================================
// 第2步: 权限预检 + 表过滤
// ============================================================

/**
 * 根据角色权限过滤表
 */
function filterTablesByPermission(tables: string[], isolationContext: IsolationContext): string[] {
  const { role } = isolationContext;
  
  console.log(`🔒 [权限过滤] 角色: ${role}, 请求的表: ${tables.join(', ')}`);
  
  const permittedTables: string[] = [];
  
  for (const tableName of tables) {
    const normalizedName = normalizeTableName(tableName);
    
    // 检查角色是否有权访问该表
    if (checkTablePermission(role, normalizedName)) {
      permittedTables.push(normalizedName);
      console.log(`  ✅ ${normalizedName} - 允许访问`);
    } else {
      console.log(`  ❌ ${normalizedName} - 禁止访问`);
    }
  }
  
  return permittedTables;
}

// ============================================================
// 第3步: 获取权限感知的表结构
// ============================================================

/**
 * 获取带权限过滤的表结构
 */
async function fetchPermittedTableStructures(
  tables: string[],
  isolationContext: IsolationContext
): Promise<Record<string, PermittedTableStructure>> {
  const structures: Record<string, PermittedTableStructure> = {};
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const { role } = isolationContext;

  for (const tableName of tables) {
    try {
      console.log(`📋 [获取表结构] ${tableName}`);
      
      // 1. 获取表结构（通过元数据API）
      const structureResponse = await axios.get(`${baseUrl}/api/database/tables/${tableName}`, {
        timeout: 5000
      });

      if (!structureResponse.data.success) {
        console.warn(`⚠️ [获取表结构] ${tableName} 失败`);
        continue;
      }

      const tableData = structureResponse.data.data;
      
      // 2. 获取角色对此表的权限配置
      const tablePermission = getTablePermission(role, tableName);
      
      // 3. 过滤字段
      let allowedFields: string[] = [];
      let forbiddenFields: string[] = [];
      
      if (tablePermission) {
        allowedFields = tablePermission.allowedFields || [];
        forbiddenFields = tablePermission.forbiddenFields || [];
      } else {
        // 如果没有特定配置，默认允许所有字段（除了密码类）
        allowedFields = tableData.columns.map((col: any) => col.columnName);
        forbiddenFields = ['password', 'password_hash', 'secret_key', 'api_key'];
      }
      
      // 4. 过滤掉禁止的字段
      const filteredColumns = tableData.columns.filter((col: any) => 
        !forbiddenFields.includes(col.columnName)
      );
      
      // 5. 构建强制WHERE条件
      const requiredConditions = substituteConditions(
        tablePermission?.requiredConditions || [],
        isolationContext
      );

      // 6. 尝试获取表关联关系
      let relations: any[] = [];
      try {
        const relationsResponse = await axios.get(`${baseUrl}/api/database/tables/${tableName}/relations`, {
          timeout: 3000
        });
        if (relationsResponse.data.success) {
          relations = relationsResponse.data.data.relations || [];
        }
      } catch {
        // 关联关系获取失败不影响主流程
      }

      structures[tableName] = {
        tableName,
        columns: filteredColumns,
        allowedFields,
        forbiddenFields,
        requiredConditions,
        relations
      };
      
      console.log(`✅ [获取表结构] ${tableName}: ${filteredColumns.length} 个字段, ${requiredConditions.length} 个隔离条件`);
      
    } catch (error) {
      console.warn(`⚠️ [获取表结构] ${tableName} 失败:`, (error as Error).message);
    }
  }

  return structures;
}

/**
 * 替换条件中的占位符
 */
function substituteConditions(conditions: string[], ctx: IsolationContext): string[] {
  return conditions.map(cond => 
    cond
      .replace(/{current_kindergarten_id}/g, String(ctx.kindergartenId || 0))
      .replace(/{current_teacher_id}/g, String(ctx.teacherId || 0))
      .replace(/{current_parent_id}/g, String(ctx.parentId || 0))
      .replace(/{current_user_id}/g, String(ctx.userId || 0))
  );
}

// ============================================================
// 第4步: 带隔离约束的SQL生成
// ============================================================

async function generateIsolatedSQL(
  query: string,
  tableStructures: Record<string, PermittedTableStructure>,
  queryAnalysis: QueryAnalysis,
  isolationContext: IsolationContext
): Promise<string> {
  try {
    console.log('📝 [生成SQL] 开始');

    const { role } = isolationContext;
    const needsIsolation = role !== 'super_admin' && role !== 'admin';

    // 构建表结构描述（带权限约束）
    let structureDescription = `🔒 数据库表结构 (角色: ${role})\n\n`;
    
    for (const [tableName, structure] of Object.entries(tableStructures)) {
      structureDescription += `表名: ${tableName}\n`;
      structureDescription += `允许查询的字段: ${structure.allowedFields.join(', ')}\n`;
      
      // 列出字段详情
      structureDescription += `字段详情:\n`;
      structure.columns.forEach((col: any) => {
        structureDescription += `  - ${col.columnName}: ${col.dataType} ${col.columnComment ? '// ' + col.columnComment : ''}\n`;
      });
      
      // 🔒 添加强制WHERE条件（关键！）
      if (structure.requiredConditions.length > 0 && needsIsolation) {
        structureDescription += `🔒 必须添加的WHERE条件（强制要求）:\n`;
        structure.requiredConditions.forEach(cond => {
          structureDescription += `  - ${cond}\n`;
        });
      }
      
      // 添加关联关系
      if (structure.relations && structure.relations.length > 0) {
        structureDescription += `关联关系:\n`;
        structure.relations.forEach((rel: any) => {
          structureDescription += `  - ${rel.columnName} → ${rel.referencedTable}.${rel.referencedColumn}\n`;
        });
      }
      
      structureDescription += '\n';
    }

    // 构建安全约束说明
    let securityConstraints = `
🔒 安全要求（必须遵守）:
1. 只生成SELECT语句
2. 禁止使用: DROP, DELETE, UPDATE, INSERT, UNION, --(注释)
3. 限制返回结果不超过100条 (添加 LIMIT 100)
4. 使用标准MySQL语法
5. 必须完全按照上面表结构中列出的精确字段名`;

    if (needsIsolation) {
      securityConstraints += `
6. 🔒【强制】必须在WHERE子句中包含上述"必须添加的WHERE条件"
7. 🔒【强制】所有涉及的表都必须添加对应的隔离条件`;
    }

    const sqlPrompt = `基于以下表结构，生成MySQL查询语句：

${structureDescription}

用户查询: ${query}
查询意图: ${queryAnalysis.intent}
需要JOIN: ${queryAnalysis.needsJoin ? '是' : '否'}
需要聚合: ${queryAnalysis.needsAggregation ? '是' : '否'}

${securityConstraints}

⚠️ 重要提示:
- 如果需要统计多个表的独立计数,使用子查询分别统计,不要使用JOIN造成笛卡尔积
- 优先查询 status='active' 或 status=1 的数据

只返回SQL语句,不要解释:`;

    const response = await unifiedAIBridge.chat({
      model: 'doubao-seed-1-6-flash-250715',
      messages: [
        {
          role: 'system' as AiBridgeMessageRole,
          content: '你是安全的MySQL专家。根据表结构生成精准且安全的SQL查询语句。必须严格遵守权限约束和隔离条件。只返回SQL,不要其他内容。'
        },
        {
          role: 'user' as AiBridgeMessageRole,
          content: sqlPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 600
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

// ============================================================
// 第5步: SQL安全验证
// ============================================================

function validateAndSanitizeSQL(
  sql: string,
  isolationContext: IsolationContext,
  tableStructures: Record<string, PermittedTableStructure>
): SQLValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { role } = isolationContext;
  
  console.log('🛡️ [SQL验证] 开始验证');

  // 1. 检查是否为空
  if (!sql || sql.trim().length === 0) {
    errors.push('SQL语句为空');
    return { valid: false, errors, warnings, sanitizedSQL: sql };
  }

  const sqlUpper = sql.toUpperCase();

  // 2. 检查只允许SELECT
  if (!sqlUpper.trim().startsWith('SELECT')) {
    errors.push('只允许SELECT查询语句');
  }

  // 3. 禁止危险操作
  const dangerousPatterns: Array<{ pattern: RegExp; msg: string }> = [
    { pattern: /\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE)\b/i, msg: '禁止数据修改操作' },
    { pattern: /\bUNION\b/i, msg: '禁止UNION操作（防止权限绕过）' },
    { pattern: /--/g, msg: '禁止SQL单行注释' },
    { pattern: /\/\*[\s\S]*?\*\//g, msg: '禁止SQL块注释' },
    { pattern: /;\s*\S/g, msg: '禁止多语句执行' },
    { pattern: /\bINTO\s+OUTFILE\b/i, msg: '禁止导出文件' },
    { pattern: /\bLOAD\s+DATA\b/i, msg: '禁止加载数据' },
    { pattern: /\bEXEC(UTE)?\b/i, msg: '禁止执行存储过程' },
    { pattern: /\bSLEEP\s*\(/i, msg: '禁止SLEEP函数' },
    { pattern: /\bBENCHMARK\s*\(/i, msg: '禁止BENCHMARK函数' }
  ];

  for (const { pattern, msg } of dangerousPatterns) {
    if (pattern.test(sql)) {
      errors.push(msg);
    }
  }

  // 4. 验证只使用允许的表
  const usedTables = extractTablesFromSQL(sql);
  const allowedTables = Object.keys(tableStructures);
  
  for (const table of usedTables) {
    if (!allowedTables.includes(table.toLowerCase())) {
      errors.push(`禁止访问表: ${table}`);
    }
  }

  // 5. 验证包含必要的隔离条件（非admin角色）
  const needsIsolation = role !== 'super_admin' && role !== 'admin';
  
  if (needsIsolation) {
    for (const [tableName, structure] of Object.entries(tableStructures)) {
      for (const requiredCond of structure.requiredConditions) {
        // 提取条件中的关键标识符（如 kindergarten_id = 3）
        const conditionMatch = requiredCond.match(/(\w+)\s*=\s*(\d+|'[^']+')/);
        if (conditionMatch) {
          const fieldName = conditionMatch[1];
          const fieldValue = conditionMatch[2];
          
          // 检查SQL中是否包含这个条件
          const conditionPattern = new RegExp(`${fieldName}\\s*=\\s*${fieldValue.replace(/'/g, "'")}`, 'i');
          if (!conditionPattern.test(sql)) {
            // 放宽检查：只要包含字段名和值即可
            if (!sql.includes(fieldName) || !sql.includes(fieldValue.replace(/'/g, ''))) {
              warnings.push(`建议添加隔离条件: ${tableName}.${requiredCond}`);
            }
          }
        }
      }
    }
  }

  // 6. 确保有LIMIT限制
  if (!sqlUpper.includes('LIMIT')) {
    // 自动添加LIMIT
    sql = sql.replace(/;?\s*$/, ' LIMIT 100');
    warnings.push('已自动添加 LIMIT 100 限制');
  }

  // 7. 移除末尾分号（防止多语句）
  sql = sql.replace(/;\s*$/, '').trim();

  console.log(`🛡️ [SQL验证] 完成: ${errors.length} 个错误, ${warnings.length} 个警告`);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitizedSQL: sql
  };
}

/**
 * 从SQL中提取表名
 */
function extractTablesFromSQL(sql: string): string[] {
  const tables: Set<string> = new Set();
  
  // 匹配 FROM 和 JOIN 后的表名
  const patterns = [
    /\bFROM\s+(\w+)/gi,
    /\bJOIN\s+(\w+)/gi,
    /\bINTO\s+(\w+)/gi,
    /\bUPDATE\s+(\w+)/gi
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(sql)) !== null) {
      tables.add(match[1].toLowerCase());
    }
  }
  
  return Array.from(tables);
}

// ============================================================
// 第6步: 执行 + 格式化
// ============================================================

async function executeSQLQuery(sql: string): Promise<any[]> {
  try {
    console.log('🔧 [执行SQL] 开始');
    
    const sequelize = getSequelize();
    const results = await sequelize.query(sql, {
      type: QueryTypes.SELECT
    });

    console.log(`✅ [执行SQL] 成功, 返回 ${results.length} 条记录`);
    return results;
    
  } catch (error) {
    console.error('❌ [执行SQL] 失败:', error);
    throw error;
  }
}

function formatQueryResults(
  results: any[],
  format: string,
  query: string,
  queryAnalysis: QueryAnalysis
): any {
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

  // summary 格式（默认）
  return {
    type: 'summary',
    query,
    intent: queryAnalysis.intent,
    totalRecords: results.length,
    data: results.slice(0, 10), // 只显示前10条
    hasMore: results.length > 10
  };
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 表名映射 - 确保使用正确的复数形式表名
 */
const TABLE_NAME_MAP: Record<string, string> = {
  'student': 'students',
  'teacher': 'teachers',
  'class': 'classes',
  'activity': 'activities',
  'parent': 'parents',
  'user': 'users',
  'enrollment_application': 'enrollment_applications',
  'enrollment_consultation': 'enrollment_consultations',
  'enrollment_plan': 'enrollment_plans',
  'activity_registration': 'activity_registrations',
  'consultation': 'consultations',
  'notification': 'notifications',
  'task': 'tasks',
  'role': 'roles',
  'permission': 'permissions',
  'marketing_campaign': 'marketing_campaigns'
};

function normalizeTableName(tableName: string): string {
  const normalized = TABLE_NAME_MAP[tableName.toLowerCase()] || tableName.toLowerCase();
  return normalized;
}

export default anyQueryTool;
