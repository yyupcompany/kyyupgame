# 检查中心文档模板系统 - API接口文档

## 📋 API概览

### 基础URL
```
开发环境: http://localhost:3000/api
生产环境: https://api.yyup.cc/api
```

### 认证方式
所有API请求需要在Header中携带JWT Token：
```
Authorization: Bearer <token>
```

---

## 1️⃣ 文档模板管理 API

### 1.1 获取模板列表

**需求1：找文件容易**

```http
GET /document-templates
```

**Query参数**:
```typescript
{
  page?: number;              // 页码，默认1
  pageSize?: number;          // 每页数量，默认20
  category?: string;          // 类别筛选
  subCategory?: string;       // 子类别筛选
  frequency?: string;         // 使用频率筛选
  priority?: string;          // 重要程度筛选
  keyword?: string;           // 关键词搜索
  isDetailed?: boolean;       // 是否详细模板
  sortBy?: string;            // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "code": "01-01",
        "name": "幼儿园年检自查报告",
        "category": "annual",
        "subCategory": "inspection",
        "frequency": "yearly",
        "priority": "required",
        "isDetailed": true,
        "lineCount": 300,
        "estimatedFillTime": 120,
        "useCount": 15,
        "lastUsedAt": "2025-10-01T10:00:00Z"
      }
    ],
    "total": 73,
    "page": 1,
    "pageSize": 20
  }
}
```

### 1.2 获取模板详情

```http
GET /document-templates/:id
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "01-01",
    "name": "幼儿园年检自查报告",
    "category": "annual",
    "templateContent": "# 幼儿园年检自查报告\n\n...",
    "variables": [
      {
        "name": "kindergarten_name",
        "label": "幼儿园名称",
        "type": "string",
        "required": true,
        "defaultValue": "",
        "guide": "填写幼儿园全称"
      },
      {
        "name": "inspection_date",
        "label": "检查日期",
        "type": "date",
        "required": true
      }
    ],
    "relatedTemplates": [2, 3, 50, 56],
    "inspectionTypeIds": [1, 2]
  }
}
```

### 1.3 智能推荐模板

**需求1：找文件容易 - 智能推荐**

```http
GET /document-templates/recommend
```

**Query参数**:
```typescript
{
  type?: 'recent' | 'frequent' | 'upcoming' | 'related';
  limit?: number;
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "recentUsed": [...],      // 最近使用
    "frequentUsed": [...],    // 常用模板
    "upcoming": [...],        // 即将需要
    "related": [...]          // 相关推荐
  }
}
```

### 1.4 收藏/取消收藏模板

```http
POST /document-templates/:id/favorite
DELETE /document-templates/:id/favorite
```

**请求体**:
```json
{
  "folderName": "我的常用"  // 可选，收藏夹名称
}
```

---

## 2️⃣ 文档实例管理 API

### 2.1 创建文档实例

**需求2：编辑容易 - 创建文档**

```http
POST /document-instances
```

**请求体**:
```json
{
  "templateId": 1,
  "inspectionPlanId": 10,
  "title": "2025年度年检自查报告",
  "assignedTo": 5,
  "deadline": "2025-10-15T23:59:59Z"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "templateId": 1,
    "title": "2025年度年检自查报告",
    "status": "draft",
    "progress": 0,
    "ownerId": 1,
    "assignedTo": 5,
    "deadline": "2025-10-15T23:59:59Z",
    "createdAt": "2025-10-01T10:00:00Z"
  }
}
```

### 2.2 获取文档实例列表

```http
GET /document-instances
```

**Query参数**:
```typescript
{
  page?: number;
  pageSize?: number;
  templateId?: number;
  inspectionPlanId?: number;
  status?: string;
  ownerId?: number;
  assignedTo?: number;
  keyword?: string;
}
```

### 2.3 更新文档内容

**需求2：编辑容易 - 在线编辑**

```http
PUT /document-instances/:id
```

**请求体**:
```json
{
  "content": "更新后的文档内容...",
  "filledVariables": {
    "kindergarten_name": "阳光幼儿园",
    "inspection_date": "2025-10-01",
    "principal_name": "张园长"
  },
  "progress": 50
}
```

### 2.4 自动填充变量

**需求2：编辑容易 - 变量自动填充**

```http
POST /document-instances/:id/auto-fill
```

**响应**:
```json
{
  "success": true,
  "data": {
    "filledVariables": {
      "kindergarten_name": "阳光幼儿园",
      "kindergarten_address": "北京市朝阳区...",
      "principal_name": "张园长",
      "current_date": "2025-10-09",
      "current_year": 2025,
      "teacher_count": 25,
      "student_count": 150
    }
  }
}
```

### 2.5 生成文档文件

**需求3：打印容易 - 生成文件**

```http
POST /document-instances/:id/generate
```

**请求体**:
```json
{
  "fileType": "pdf",  // pdf | docx | xlsx
  "printOptions": {
    "pageSize": "A4",
    "orientation": "portrait",
    "includeHeader": true,
    "includeFooter": true,
    "includePageNumber": true
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "filePath": "/uploads/documents/年检自查报告_阳光幼儿园_20251001.pdf",
    "fileName": "年检自查报告_阳光幼儿园_20251001.pdf",
    "fileSize": 1024000,
    "downloadUrl": "/api/document-instances/100/download"
  }
}
```

### 2.6 批量打印

**需求3：打印容易 - 批量打印**

```http
POST /document-instances/batch-print
```

**请求体**:
```json
{
  "documentIds": [100, 101, 102],
  "mergeDocuments": true,
  "printOptions": {...}
}
```

---

## 3️⃣ 任务管理 API

### 3.1 创建任务（基于模板）

**需求4：分配任务容易 - 一键分配**

```http
POST /document-tasks/create-from-template
```

**请求体**:
```json
{
  "taskTemplateId": 1,
  "inspectionPlanId": 10,
  "assignments": [
    {
      "taskIndex": 0,
      "assignedTo": 5
    },
    {
      "taskIndex": 1,
      "assignedTo": 6
    }
  ]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "createdTasks": [
      {
        "id": 201,
        "title": "准备年检自查报告",
        "assignedTo": 5,
        "dueDate": "2025-10-10",
        "status": "pending"
      },
      {
        "id": 202,
        "title": "整理教职工花名册",
        "assignedTo": 6,
        "dueDate": "2025-10-12",
        "status": "pending"
      }
    ]
  }
}
```

### 3.2 获取任务列表

```http
GET /document-tasks
```

**Query参数**:
```typescript
{
  assignedTo?: number;
  status?: string;
  inspectionPlanId?: number;
  dueDate?: string;
}
```

### 3.3 更新任务状态

**需求4：分配任务容易 - 进度跟踪**

```http
PUT /document-tasks/:id
```

**请求体**:
```json
{
  "status": "completed",
  "progress": 100,
  "result": "任务已完成，文档已提交"
}
```

### 3.4 获取任务看板数据

```http
GET /document-tasks/kanban
```

**响应**:
```json
{
  "success": true,
  "data": {
    "pending": [...],
    "in_progress": [...],
    "review": [...],
    "completed": [...]
  }
}
```

---

## 4️⃣ 表单收集 API

### 4.1 分发表单

**需求5：自动收回合并 - 表单分发**

```http
POST /form-distributions
```

**请求体**:
```json
{
  "templateId": 13,  // 晨检记录表
  "recipients": [5, 6, 7, 8],  // 各班老师
  "deadline": "2025-10-10T18:00:00Z",
  "required": true,
  "reminders": {
    "beforeDeadline": [3, 1],  // 截止前3天、1天提醒
    "afterSubmission": true
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "distributionId": 301,
    "createdTasks": [...]
  }
}
```

### 4.2 提交表单

```http
POST /form-submissions
```

**请求体**:
```json
{
  "templateId": 13,
  "taskId": 201,
  "formData": {
    "date": "2025-10-09",
    "class": "大一班",
    "records": [
      {
        "studentName": "小明",
        "temperature": 36.5,
        "healthStatus": "正常"
      }
    ]
  }
}
```

### 4.3 获取提交统计

```http
GET /form-submissions/stats
```

**Query参数**:
```typescript
{
  templateId: number;
  distributionId?: number;
  startDate?: string;
  endDate?: string;
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "total": 10,
    "submitted": 8,
    "pending": 2,
    "submissionRate": 80,
    "submissions": [...]
  }
}
```

---

## 5️⃣ AI数据分析 API

### 5.1 分析表单数据

**需求5：自动收回合并 - AI分析**

```http
POST /analysis/analyze-submissions
```

**请求体**:
```json
{
  "templateId": 13,
  "submissionIds": [101, 102, 103, 104],
  "analysisType": "merge",  // merge | statistics | trend | anomaly | summary
  "options": {
    "mergeMethod": "ai_smart",
    "enableDataCleaning": true,
    "enableAnomalyDetection": true,
    "enableTrendAnalysis": true,
    "generateCharts": true
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "analysisId": 401,
    "mergedData": {...},
    "analysis": {
      "summary": "AI生成的总结...",
      "anomalies": [...],
      "trends": [...],
      "recommendations": [...]
    },
    "charts": [
      {
        "type": "bar",
        "title": "各班体温分布",
        "data": {...}
      }
    ],
    "reportUrl": "/api/analysis/401/report"
  }
}
```

### 5.2 获取分析结果

```http
GET /analysis/:id
```

### 5.3 下载分析报告

```http
GET /analysis/:id/report
```

**Query参数**:
```typescript
{
  format?: 'pdf' | 'excel' | 'word';
}
```

---

## 6️⃣ 提醒系统 API

### 6.1 配置提醒

**需求6：提示信息 - 智能提醒**

```http
POST /reminders/config
```

**请求体**:
```json
{
  "templateId": 13,
  "reminderType": "time",
  "config": {
    "beforeDeadline": [7, 3, 1],
    "onDeadline": true,
    "afterDeadline": true
  },
  "channels": ["inApp", "email", "wechat"]
}
```

### 6.2 获取提醒列表

```http
GET /reminders
```

**Query参数**:
```typescript
{
  isRead?: boolean;
  type?: string;
  startDate?: string;
  endDate?: string;
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "unreadCount": 5,
    "items": [
      {
        "id": 501,
        "type": "deadline_approaching",
        "title": "任务即将到期",
        "content": "您的任务"准备年检自查报告"将在3天后到期",
        "actionUrl": "/inspection-center/tasks/201",
        "isRead": false,
        "sentAt": "2025-10-07T10:00:00Z"
      }
    ]
  }
}
```

### 6.3 标记已读

```http
PUT /reminders/:id/read
```

### 6.4 批量标记已读

```http
PUT /reminders/batch-read
```

**请求体**:
```json
{
  "reminderIds": [501, 502, 503]
}
```

---

## 7️⃣ 搜索和推荐 API

### 7.1 全文搜索

**需求1：找文件容易 - 快速搜索**

```http
GET /search
```

**Query参数**:
```typescript
{
  keyword: string;
  type?: 'template' | 'document' | 'task' | 'all';
  filters?: {
    category?: string;
    status?: string;
    dateRange?: [string, string];
  };
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "templates": [...],
    "documents": [...],
    "tasks": [...],
    "total": 15
  }
}
```

### 7.2 智能推荐

```http
GET /recommendations
```

**响应**:
```json
{
  "success": true,
  "data": {
    "upcomingInspections": [...],
    "pendingTasks": [...],
    "frequentTemplates": [...],
    "relatedDocuments": [...]
  }
}
```

---

## 📊 WebSocket实时通知

### 连接
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### 事件监听

```javascript
// 新任务分配
socket.on('task:assigned', (data) => {
  console.log('新任务:', data);
});

// 任务状态更新
socket.on('task:updated', (data) => {
  console.log('任务更新:', data);
});

// 新提醒
socket.on('reminder:new', (data) => {
  console.log('新提醒:', data);
});

// 表单提交
socket.on('form:submitted', (data) => {
  console.log('表单提交:', data);
});
```

---

## 🔐 权限控制

### 权限级别

| 操作 | 园长 | 教务主任 | 教师 | 保育员 |
|------|------|---------|------|--------|
| 查看所有模板 | ✅ | ✅ | ✅ | ✅ |
| 创建文档 | ✅ | ✅ | ✅ | ❌ |
| 编辑自己的文档 | ✅ | ✅ | ✅ | ❌ |
| 编辑他人的文档 | ✅ | ✅ | ❌ | ❌ |
| 分配任务 | ✅ | ✅ | ❌ | ❌ |
| 查看分析报告 | ✅ | ✅ | ❌ | ❌ |
| 配置提醒 | ✅ | ✅ | ✅ | ✅ |

---

## 📝 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器错误 |

**错误响应格式**:
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "参数错误",
    "details": "templateId is required"
  }
}
```

---

**下一步**: 创建前端组件设计文档

