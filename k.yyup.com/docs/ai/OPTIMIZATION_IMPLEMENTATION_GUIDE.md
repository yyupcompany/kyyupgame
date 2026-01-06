# AI智能代理性能优化实施指南

## 📋 目录
1. [优化1: 智能跳过任务分析](#优化1-智能跳过任务分析)
2. [优化2: 优化any_query工具](#优化2-优化any_query工具)
3. [优化3: 添加查询缓存](#优化3-添加查询缓存)
4. [优化4: 工具调用策略优化](#优化4-工具调用策略优化)
5. [测试验证](#测试验证)

---

## 优化1: 智能跳过任务分析

### 目标
让AI智能判断是否需要调用`analyze_task_complexity`,简单查询直接跳过

### 实施步骤

#### 步骤1: 修改系统提示词

**文件**: `server/src/services/ai-operator/unified-intelligence.service.ts`

**位置**: 第1998-2030行

**修改前**:
```typescript
### 1. 智能代理工作流程（重要！）
**当智能代理模式开启时，您必须遵循以下工作流程：**

**第一步：任务分析（强制）**
- 收到用户请求后，**首先调用 `analyze_task_complexity` 工具**分析任务复杂度
```

**修改后**:
```typescript
### 1. 智能代理工作流程（重要！）
**当智能代理模式开启时，您必须遵循以下工作流程：**

**第零步：任务分类（智能判断）**
首先判断任务类型：

**简单任务（无需任务分析，直接执行）**:
- ✅ 数据查询: "查询班级信息"、"查看学生列表"、"统计活动数量"
- ✅ 数据展示: "用表格展示"、"显示图表"、"列出数据"
- ✅ 单一操作: "导航到XX页面"、"截图"、"查看状态"
- ✅ CRUD操作: "创建学生"、"更新班级"、"删除活动"

**对于简单任务，直接调用相应工具（如any_query、render_component），跳过analyze_task_complexity**

**复杂任务（需要任务分析）**:
- ❌ 多步骤任务: "策划活动并发布通知"
- ❌ 工作流任务: "完成招生流程"
- ❌ 批量操作: "批量导入学生数据"
- ❌ 复杂分析: "分析近3个月的活动效果并生成报告"

**对于复杂任务，第一步调用analyze_task_complexity**

**判断标准**:
1. 是否包含"并且"、"然后"、"接着"、"同时"等连接词? → 复杂任务
2. 是否需要多个工具配合完成? → 复杂任务
3. 是否只是查询或展示数据? → 简单任务
4. 是否只是单一CRUD操作? → 简单任务
5. 是否包含"策划"、"完成"、"批量"等关键词? → 复杂任务

**第一步：执行任务**
- 简单任务: 直接调用相应工具
- 复杂任务: 先调用analyze_task_complexity，再根据结果执行
```

#### 步骤2: 移除强制验证规则

**文件**: `server/src/services/ai-operator/unified-intelligence.service.ts`

**位置**: 第4545-4556行

**修改前**:
```typescript
// 🔴 规则1: 第一轮必须调用 analyze_task_complexity
if (isFirstIteration && !toolNames.includes('analyze_task_complexity')) {
  console.warn(`⚠️ [Workflow Validator] 违反强制性规则: 第一轮必须调用 analyze_task_complexity`);
}
```

**修改后**:
```typescript
// 🟢 规则1: 第一轮建议调用 analyze_task_complexity（复杂任务）
if (isFirstIteration && !toolNames.includes('analyze_task_complexity')) {
  // 检查是否是简单查询
  const isSimpleQuery = this.isSimpleQuery(conversationHistory[0]?.content || '');
  if (!isSimpleQuery) {
    console.warn(`⚠️ [Workflow Validator] 建议: 复杂任务应该先调用 analyze_task_complexity`);
  } else {
    console.log(`✅ [Workflow Validator] 简单查询，跳过任务分析`);
  }
}

// 辅助方法
private isSimpleQuery(content: string): boolean {
  const simpleKeywords = ['查询', '查看', '显示', '列出', '统计', '展示', '用表格', '用图表'];
  const complexKeywords = ['策划', '完成', '批量', '分析并', '执行', '创建并'];
  const hasMultipleSteps = /并且|然后|接着|同时/.test(content);
  
  const hasSimple = simpleKeywords.some(kw => content.includes(kw));
  const hasComplex = complexKeywords.some(kw => content.includes(kw));
  
  return hasSimple && !hasComplex && !hasMultipleSteps;
}
```

#### 步骤3: 调整强制性工具列表

**文件**: `server/src/services/ai-operator/unified-intelligence.service.ts`

**位置**: 第813-819行

**修改前**:
```typescript
// 🔴 强制性工具：复杂查询必须包含的工具
const mandatoryTools = [
  'analyze_task_complexity',
  'create_todo_list',
  'update_todo_task',
  'get_todo_list',
  'delete_todo_task'
];
```

**修改后**:
```typescript
// 🟢 可选工具：根据任务类型动态添加
const optionalTools = [
  'analyze_task_complexity',
  'create_todo_list',
  'update_todo_task',
  'get_todo_list',
  'delete_todo_task'
];

// 只在复杂任务时添加这些工具
const isComplexTask = !this.isSimpleQuery(request.content);
const mandatoryTools = isComplexTask ? optionalTools : [];
```

---

## 优化2: 优化any_query工具

### 目标
减少AI重复调用`any_query`工具的次数,提高首次查询成功率

### 实施步骤

#### 步骤1: 改进工具描述

**文件**: `server/src/services/ai-operator/unified-intelligence.service.ts`

**位置**: 第4842-4886行

**修改前**:
```typescript
{
  type: 'function',
  function: {
    name: 'any_query',
    description: '智能复杂查询功能，当用户需求复杂无法用现有工具满足时使用。系统会根据用户角色提供相关数据表结构，让AI生成精确的SQL查询',
    parameters: {
      // ...
    }
  }
}
```

**修改后**:
```typescript
{
  type: 'function',
  function: {
    name: 'any_query',
    description: `智能复杂查询功能，当用户需求复杂无法用现有工具满足时使用。

**重要提示 - 一次性生成正确的SQL**:
1. 仔细分析用户查询需求，**一次性生成正确的SQL**，避免重复调用
2. 优先使用简单的SELECT语句，避免复杂的JOIN
3. 确保返回结果包含用户要求的**所有字段**

**常见查询模板**（直接使用，不要修改）:
- 班级信息: "查询所有班级的名称、学生人数、教师姓名"
  → SELECT name AS 班级名称, student_count AS 学生人数, teacher_name AS 教师姓名 FROM classes WHERE status='active'
  
- 学生信息: "查询所有学生的姓名、班级、年龄"
  → SELECT name AS 姓名, class_name AS 班级, age AS 年龄 FROM students WHERE status='active'
  
- 活动信息: "查询所有活动的标题、时间、地点"
  → SELECT title AS 标题, start_time AS 开始时间, location AS 地点 FROM activities WHERE status='active'

**字段映射规则**:
- 班级表(classes): name(班级名称), student_count(学生人数), teacher_name(教师姓名)
- 学生表(students): name(姓名), class_name(班级), gender(性别), age(年龄)
- 活动表(activities): title(标题), start_time(开始时间), location(地点), capacity(容量)

**查询结果要求**:
- 必须使用AS别名，将英文字段名转换为中文
- 必须包含用户要求的所有字段
- 必须添加WHERE status='active'过滤条件
- 结果应该是完整的数据，不要使用LIMIT限制（除非用户明确要求）

**错误示例**（不要这样做）:
❌ SELECT * FROM classes  // 没有指定字段，没有别名
❌ SELECT name FROM classes  // 缺少用户要求的其他字段
❌ SELECT name, count FROM classes  // 字段名错误，应该是student_count

**正确示例**:
✅ SELECT name AS 班级名称, student_count AS 学生人数, teacher_name AS 教师姓名 FROM classes WHERE status='active'
`,
    parameters: {
      type: 'object',
      properties: {
        userQuery: {
          type: 'string',
          description: '用户的原始查询需求（完整描述）'
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
}
```

#### 步骤2: 添加查询结果验证

**文件**: `server/src/services/ai-operator/function-tools.service.ts`

**位置**: 在`anyQuery`方法中添加验证逻辑

**添加验证方法**:
```typescript
/**
 * 验证查询结果是否符合预期
 */
private validateQueryResult(result: any[], userQuery: string): {
  isValid: boolean;
  error?: string;
  suggestion?: string;
  correctedQuery?: string;
} {
  // 1. 检查结果是否为空
  if (!result || result.length === 0) {
    return {
      isValid: false,
      error: '查询结果为空',
      suggestion: '请检查查询条件或数据库中是否有符合条件的数据。确保添加了WHERE status=\'active\'条件。'
    };
  }
  
  // 2. 提取用户要求的字段
  const requiredFields = this.extractRequiredFields(userQuery);
  const actualFields = Object.keys(result[0]);
  const missingFields = requiredFields.filter(f => !actualFields.includes(f));
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `查询结果缺少字段: ${missingFields.join(', ')}`,
      suggestion: `请在SQL中添加这些字段，并使用AS别名转换为中文: ${missingFields.map(f => `${this.getEnglishFieldName(f)} AS ${f}`).join(', ')}`
    };
  }
  
  // 3. 检查字段是否使用了中文别名
  const hasEnglishFields = actualFields.some(f => /^[a-z_]+$/.test(f));
  if (hasEnglishFields) {
    return {
      isValid: false,
      error: '查询结果包含英文字段名',
      suggestion: '请使用AS别名将所有字段转换为中文，例如: name AS 班级名称, student_count AS 学生人数'
    };
  }
  
  return { isValid: true };
}

/**
 * 从用户查询中提取要求的字段
 */
private extractRequiredFields(userQuery: string): string[] {
  const fieldMap: Record<string, string[]> = {
    '班级': ['班级名称', '班级数量'],
    '学生': ['姓名', '班级'],
    '人数': ['学生人数', '人数'],
    '教师': ['教师姓名', '教师'],
    '活动': ['标题', '活动名称'],
    '时间': ['开始时间', '时间'],
    '地点': ['地点', '位置']
  };
  
  const fields: string[] = [];
  for (const [keyword, fieldNames] of Object.entries(fieldMap)) {
    if (userQuery.includes(keyword)) {
      fields.push(...fieldNames);
    }
  }
  
  return [...new Set(fields)]; // 去重
}

/**
 * 获取中文字段对应的英文字段名
 */
private getEnglishFieldName(chineseField: string): string {
  const fieldMap: Record<string, string> = {
    '班级名称': 'name',
    '学生人数': 'student_count',
    '教师姓名': 'teacher_name',
    '姓名': 'name',
    '班级': 'class_name',
    '性别': 'gender',
    '年龄': 'age',
    '标题': 'title',
    '开始时间': 'start_time',
    '地点': 'location'
  };
  
  return fieldMap[chineseField] || chineseField;
}
```

**修改anyQuery方法**:
```typescript
async anyQuery(args: any): Promise<any> {
  const { userQuery, queryType, expectedFormat } = args;
  
  try {
    // 执行查询
    const result = await this.executeQuery(userQuery);
    
    // ✅ 验证查询结果
    const validation = this.validateQueryResult(result, userQuery);
    
    if (!validation.isValid) {
      // 如果结果不符合预期，返回详细的错误信息
      console.error('❌ [any_query] 查询结果验证失败:', validation.error);
      return {
        success: false,
        error: validation.error,
        suggestion: validation.suggestion,
        // 提供修正建议，避免AI重复查询
        hint: '请根据suggestion修正SQL查询，确保包含所有必需字段并使用中文别名'
      };
    }
    
    // 查询成功
    console.log('✅ [any_query] 查询成功，返回结果');
    return {
      success: true,
      data: result,
      // 添加元数据，帮助AI理解结果
      metadata: {
        rowCount: result.length,
        columns: Object.keys(result[0] || {}),
        queryType: queryType,
        message: `成功查询到${result.length}条数据`
      }
    };
  } catch (error) {
    console.error('❌ [any_query] 查询执行失败:', error);
    return {
      success: false,
      error: error.message,
      suggestion: '请检查SQL语法是否正确，表名和字段名是否存在'
    };
  }
}
```

---

## 优化3: 添加查询缓存

### 目标
缓存常见查询结果，减少重复的数据库查询

### 实施步骤

#### 步骤1: 安装Redis依赖

```bash
cd server
npm install ioredis
npm install --save-dev @types/ioredis
```

#### 步骤2: 创建缓存服务

**新建文件**: `server/src/services/cache/query-cache.service.ts`

```typescript
import Redis from 'ioredis';
import crypto from 'crypto';

export class QueryCacheService {
  private redis: Redis;
  private readonly DEFAULT_TTL = 300; // 5分钟
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    });
    
    this.redis.on('error', (err) => {
      console.error('❌ [Redis] 连接错误:', err);
    });
    
    this.redis.on('connect', () => {
      console.log('✅ [Redis] 连接成功');
    });
  }
  
  /**
   * 获取缓存
   */
  async get(key: string): Promise<any | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        console.log(`✅ [缓存命中] ${key}`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('❌ [缓存读取失败]:', error);
      return null;
    }
  }
  
  /**
   * 设置缓存
   */
  async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      console.log(`✅ [缓存设置] ${key}, TTL: ${ttl}秒`);
    } catch (error) {
      console.error('❌ [缓存设置失败]:', error);
    }
  }
  
  /**
   * 生成查询缓存键
   */
  generateQueryKey(userQuery: string, userId?: number): string {
    // 标准化查询字符串
    const normalized = userQuery.toLowerCase().replace(/\s+/g, ' ').trim();
    const hash = crypto.createHash('md5').update(normalized).digest('hex');
    return `query:${userId || 'anonymous'}:${hash}`;
  }
  
  /**
   * 清除缓存
   */
  async clear(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`✅ [缓存清除] 清除了${keys.length}个缓存`);
      }
    } catch (error) {
      console.error('❌ [缓存清除失败]:', error);
    }
  }
  
  /**
   * 关闭连接
   */
  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
```

#### 步骤3: 在any_query中使用缓存

**文件**: `server/src/services/ai-operator/function-tools.service.ts`

```typescript
import { QueryCacheService } from '../cache/query-cache.service';

class FunctionToolsService {
  private queryCache: QueryCacheService;
  
  constructor() {
    this.queryCache = new QueryCacheService();
  }
  
  async anyQuery(args: any): Promise<any> {
    const { userQuery, queryType, expectedFormat } = args;
    const userId = this.currentUserId; // 从上下文获取
    
    // 生成缓存键
    const cacheKey = this.queryCache.generateQueryKey(userQuery, userId);
    
    // 检查缓存
    const cached = await this.queryCache.get(cacheKey);
    if (cached) {
      console.log('✅ [any_query] 返回缓存结果');
      return {
        ...cached,
        fromCache: true,
        cacheHit: true
      };
    }
    
    try {
      // 执行查询
      const result = await this.executeQuery(userQuery);
      
      // 验证查询结果
      const validation = this.validateQueryResult(result, userQuery);
      
      if (!validation.isValid) {
        // 不缓存失败的查询
        return {
          success: false,
          error: validation.error,
          suggestion: validation.suggestion
        };
      }
      
      // 构建响应
      const response = {
        success: true,
        data: result,
        metadata: {
          rowCount: result.length,
          columns: Object.keys(result[0] || {}),
          queryType: queryType,
          message: `成功查询到${result.length}条数据`
        },
        fromCache: false
      };
      
      // 缓存成功的查询结果
      await this.queryCache.set(cacheKey, response, 300); // 5分钟
      
      return response;
    } catch (error) {
      console.error('❌ [any_query] 查询执行失败:', error);
      return {
        success: false,
        error: error.message,
        suggestion: '请检查SQL语法是否正确'
      };
    }
  }
}
```

---

## 测试验证

### 测试用例1: 简单查询（跳过任务分析）

**测试查询**: "查询班级数量,每个班级的人数,都是什么班级"

**预期结果**:
- ✅ 不调用`analyze_task_complexity`
- ✅ 直接调用`any_query`
- ✅ 调用`render_component`渲染表格
- ✅ 总耗时: 约60-80秒（首次）

**验证方法**:
```bash
# 启动服务
npm run start:all

# 使用MCP浏览器测试
# 1. 登录admin账号
# 2. 点击Auto按钮开启智能代理
# 3. 发送查询: "查询班级数量,每个班级的人数,都是什么班级"
# 4. 观察工具调用历史，确认没有调用analyze_task_complexity
```

### 测试用例2: 缓存命中

**测试查询**: 重复发送"查询班级数量,每个班级的人数,都是什么班级"

**预期结果**:
- ✅ 第一次查询: 60-80秒
- ✅ 第二次查询: <5秒（缓存命中）
- ✅ 后端日志显示"✅ [缓存命中]"

### 测试用例3: 复杂任务（仍需任务分析）

**测试查询**: "策划一个亲子运动会活动并发布通知"

**预期结果**:
- ✅ 第一步调用`analyze_task_complexity`
- ✅ 第二步调用`execute_activity_workflow`
- ✅ 工作流程正常

---

**文档创建时间**: 2025-10-10
**最后更新**: 2025-10-10

