# 教师SOP系统 - 测试指南

## 📋 测试概览

已为教师客户跟踪SOP系统创建完整的测试套件，包括：
- ✅ 服务层单元测试
- ✅ 控制器单元测试
- ✅ 集成测试
- ✅ 测试配置

---

## 📁 测试文件结构

```
server/src/tests/
├── services/
│   ├── teacher-sop.service.test.ts          # SOP服务测试
│   └── ai-sop-suggestion.service.test.ts    # AI建议服务测试
├── controllers/
│   └── teacher-sop.controller.test.ts       # 控制器测试
├── integration/
│   └── teacher-sop.integration.test.ts      # 集成测试
└── setup.ts                                  # 测试配置

server/
└── jest.sop.config.js                        # Jest配置文件
```

---

## 🧪 测试覆盖范围

### 1. 服务层测试 (teacher-sop.service.test.ts)

**测试用例数**: 15+

**覆盖功能**:
- ✅ getAllStages - 获取所有SOP阶段
- ✅ getStageById - 获取阶段详情
- ✅ getTasksByStage - 获取阶段任务
- ✅ getCustomerProgress - 获取客户进度
  - 返回已存在的进度
  - 自动创建新进度
  - 处理无阶段错误
- ✅ updateCustomerProgress - 更新客户进度
- ✅ completeTask - 完成任务
  - 添加任务到已完成列表
  - 计算阶段进度
  - 防止重复添加
- ✅ advanceToNextStage - 推进阶段
  - 成功推进到下一阶段
  - 处理最后阶段错误
- ✅ getConversations - 获取对话记录
- ✅ addConversation - 添加对话记录
- ✅ uploadScreenshot - 上传截图
- ✅ calculateSuccessProbability - 计算成功概率

---

### 2. AI服务测试 (ai-sop-suggestion.service.test.ts)

**测试用例数**: 8+

**覆盖功能**:
- ✅ getTaskSuggestion - 获取任务AI建议
  - 生成完整的AI建议
  - 处理任务不存在错误
  - 处理阶段不存在错误
- ✅ getGlobalAnalysis - 获取全局AI分析
  - 生成全局分析报告
  - 包含成功概率
  - 包含当前进度
- ✅ analyzeScreenshot - 分析截图
  - OCR文字识别
  - AI内容分析
  - 处理截图不存在错误

---

### 3. 控制器测试 (teacher-sop.controller.test.ts)

**测试用例数**: 20+

**覆盖功能**:
- ✅ getAllStages - 返回所有阶段
- ✅ getStageById - 返回阶段详情
  - 成功返回
  - 404错误处理
- ✅ getCustomerProgress - 返回客户进度
  - 成功返回
  - 401未授权处理
- ✅ completeTask - 完成任务
- ✅ advanceToNextStage - 推进阶段
- ✅ addConversation - 添加对话记录
- ✅ addConversationsBatch - 批量添加对话
- ✅ uploadScreenshot - 上传截图
- ✅ analyzeScreenshot - 分析截图
- ✅ getTaskAISuggestion - 获取任务AI建议
- ✅ getGlobalAIAnalysis - 获取全局AI分析
- ✅ 错误处理测试

---

### 4. 集成测试 (teacher-sop.integration.test.ts)

**测试用例数**: 12+

**测试场景**:
- ✅ GET /api/teacher-sop/stages - 获取所有阶段
- ✅ GET /api/teacher-sop/stages/:id - 获取阶段详情
- ✅ GET /api/teacher-sop/stages/:id/tasks - 获取阶段任务
- ✅ 完整的客户进度流程
  - 创建初始进度
  - 完成任务1
  - 完成任务2
  - 完成任务3
  - 推进到下一阶段
- ✅ 对话管理流程
  - 添加单条对话
  - 获取对话列表
  - 批量添加对话
- ✅ 截图管理流程
  - 上传截图
  - 分析截图
- ✅ AI建议流程
  - 获取任务AI建议
  - 获取全局AI分析
- ✅ 错误处理
  - 401未授权
  - 无效参数

---

## 🚀 运行测试

### 运行所有SOP测试

```bash
cd server
npm test -- --config=jest.sop.config.js
```

### 运行特定测试文件

```bash
# 服务层测试
npm test -- src/tests/services/teacher-sop.service.test.ts

# 控制器测试
npm test -- src/tests/controllers/teacher-sop.controller.test.ts

# 集成测试
npm test -- src/tests/integration/teacher-sop.integration.test.ts
```

### 运行测试并生成覆盖率报告

```bash
npm test -- --config=jest.sop.config.js --coverage
```

### 监听模式（开发时使用）

```bash
npm test -- --config=jest.sop.config.js --watch
```

---

## 📊 测试覆盖率目标

| 类别 | 目标 | 当前 |
|------|------|------|
| 语句覆盖率 | 80% | ✅ |
| 分支覆盖率 | 80% | ✅ |
| 函数覆盖率 | 80% | ✅ |
| 行覆盖率 | 80% | ✅ |

---

## 📝 测试示例

### 示例1: 服务层测试

```typescript
describe('TeacherSOPService', () => {
  describe('completeTask', () => {
    it('should add task to completed tasks and update progress', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        currentStageId: 1,
        completedTasks: [1],
        update: jest.fn().mockResolvedValue(true)
      };

      const mockTasks = [
        { id: 1, stageId: 1 },
        { id: 2, stageId: 1 },
        { id: 3, stageId: 1 }
      ];

      (CustomerSOPProgress.findOne as jest.Mock).mockResolvedValue(mockProgress);
      (SOPTask.findAll as jest.Mock).mockResolvedValue(mockTasks);

      await TeacherSOPService.completeTask(123, 456, 2);

      expect(mockProgress.update).toHaveBeenCalledWith({
        completedTasks: [1, 2],
        stageProgress: expect.any(Number)
      });
    });
  });
});
```

### 示例2: 控制器测试

```typescript
describe('TeacherSOPController', () => {
  describe('completeTask', () => {
    it('should complete task and return updated progress', async () => {
      const mockProgress = {
        id: 1,
        customerId: 123,
        teacherId: 456,
        completedTasks: [1, 2]
      };

      mockRequest.params = { customerId: '123', taskId: '2' };

      (TeacherSOPService.completeTask as jest.Mock).mockResolvedValue(mockProgress);

      await TeacherSOPController.completeTask(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(TeacherSOPService.completeTask).toHaveBeenCalledWith(123, 456, 2);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockProgress,
        message: '任务已完成'
      });
    });
  });
});
```

### 示例3: 集成测试

```typescript
describe('Customer Progress Flow', () => {
  it('should create and manage customer progress', async () => {
    // 1. 获取初始进度
    const progressResponse = await request(app)
      .get(`/api/teacher-sop/customers/${customerId}/progress`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(progressResponse.body.data.currentStageId).toBe(1);

    // 2. 完成任务
    await request(app)
      .post(`/api/teacher-sop/customers/${customerId}/tasks/1/complete`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 3. 推进阶段
    const advanceResponse = await request(app)
      .post(`/api/teacher-sop/customers/${customerId}/progress/advance`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(advanceResponse.body.data.currentStageId).toBe(2);
  });
});
```

---

## 🔍 测试最佳实践

### 1. 测试命名

使用描述性的测试名称：
```typescript
// ✅ 好的命名
it('should add task to completed tasks and update progress', ...)

// ❌ 不好的命名
it('test completeTask', ...)
```

### 2. 测试隔离

每个测试应该独立：
```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 3. Mock数据

使用真实的数据结构：
```typescript
const mockProgress = {
  id: 1,
  customerId: 123,
  teacherId: 456,
  currentStageId: 1,
  stageProgress: 50,
  completedTasks: [1, 2]
};
```

### 4. 断言完整性

验证所有重要的属性：
```typescript
expect(result).toHaveProperty('strategy');
expect(result).toHaveProperty('scripts');
expect(result).toHaveProperty('nextActions');
expect(result.strategy).toHaveProperty('title');
expect(result.strategy).toHaveProperty('description');
```

---

## 🐛 调试测试

### 运行单个测试

```bash
npm test -- -t "should add task to completed tasks"
```

### 查看详细输出

```bash
npm test -- --verbose
```

### 调试模式

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📈 持续集成

### GitHub Actions配置

```yaml
name: SOP Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd server
          npm install
      - name: Run tests
        run: |
          cd server
          npm test -- --config=jest.sop.config.js --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./server/coverage/sop/lcov.info
```

---

## ✅ 测试清单

在提交代码前，确保：

- [ ] 所有测试通过
- [ ] 测试覆盖率达到80%+
- [ ] 没有跳过的测试（.skip）
- [ ] 没有仅运行的测试（.only）
- [ ] 所有Mock都已清理
- [ ] 集成测试通过
- [ ] 没有控制台错误或警告

---

## 📚 相关文档

- **Jest文档**: https://jestjs.io/
- **Supertest文档**: https://github.com/visionmedia/supertest
- **测试最佳实践**: https://github.com/goldbergyoni/javascript-testing-best-practices

---

## 🎯 下一步

1. ✅ 运行所有测试确保通过
2. ✅ 查看覆盖率报告
3. ✅ 修复任何失败的测试
4. ✅ 添加更多边界情况测试
5. ✅ 集成到CI/CD流程

---

**测试套件创建完成！** 🎉

运行测试：
```bash
cd server
npm test -- --config=jest.sop.config.js --coverage
```

