# AI计费系统前端集成总结

## ✅ 已完成工作

### 1. 后端API路由 ✅
**文件:** `server/src/routes/ai-billing.routes.ts`

**接口列表:**
- `GET /api/ai-billing/my-bill` - 获取当前用户账单
- `GET /api/ai-billing/user/:userId/bill` - 获取指定用户账单
- `GET /api/ai-billing/user/:userId/export` - 导出账单CSV
- `GET /api/ai-billing/statistics` - 获取计费统计（支持月度/季度/年度）
- `PUT /api/ai-billing/record/:billingId/status` - 更新计费状态
- `PUT /api/ai-billing/records/batch-status` - 批量更新计费状态
- `GET /api/ai-billing/user/:userId/trend` - 获取用户计费趋势

### 2. 前端API调用 ✅
**文件:** `client/src/api/endpoints/ai-billing.ts`

**功能:**
- 完整的TypeScript类型定义
- 所有API接口的封装
- 格式化函数（计费类型、状态、颜色等）

### 3. 新的用量中心页面 ✅
**文件:** `client/src/pages/centers/AIBillingCenter.vue`

**功能特性:**
- ✅ **周期切换**: 月度、季度、年度
- ✅ **统计卡片**: 总费用、总调用次数、Token使用量、视频时长
- ✅ **趋势图表**: ECharts折线图，支持日度/周度/月度切换
- ✅ **类型分布**: 四种计费类型的详细统计和圆形进度图
- ✅ **账单明细表格**: 完整的数据展示，支持搜索、排序、分页
- ✅ **详情对话框**: 单条计费记录的详细信息
- ✅ **导出功能**: 支持CSV格式导出

### 4. 路由注册 ✅
**文件:** `server/src/routes/index.ts`

已添加:
```typescript
import aiBillingRoutes from './ai-billing.routes';
router.use('/ai-billing', aiBillingRoutes);
```

---

## 🔧 需要完成的步骤

### 步骤1: 注册AIBillingRecord模型

编辑 `server/src/models/index.ts`:

```typescript
// 在文件顶部添加导入
import { AIBillingRecord, initAIBillingRecord, initAIBillingRecordAssociations } from './ai-billing-record.model';

// 在导出列表中添加
export { AIBillingRecord } from './ai-billing-record.model';

// 在 initModels 函数中添加初始化
export const initModels = (sequelize: Sequelize): void => {
  // ... 其他初始化代码 ...
  
  // AI计费模型
  initAIBillingRecord(sequelize);
  
  // ... 其他初始化代码 ...
};

// 在 initAssociations 函数中添加关联
export const initAssociations = (): void => {
  // ... 其他关联代码 ...
  
  // AI计费记录关联
  initAIBillingRecordAssociations();
  
  // ... 其他关联代码 ...
};
```

### 步骤2: 运行数据库迁移

```bash
cd /home/zhgue/kyyupgame/k.yyup.com/server
npm run migrate
```

这将创建 `ai_billing_records` 表。

### 步骤3: 添加前端路由配置

需要在侧边栏菜单中添加"AI用量与计费中心"入口。

**选项A: 替换现有用量中心**

编辑 `client/src/config/static-menu.ts` 或相应的路由配置文件:

```typescript
{
  id: 'usage-center',
  title: 'AI用量与计费',
  path: '/centers/ai-billing',
  component: 'centers/AIBillingCenter',
  roles: ['admin', 'principal'],
  icon: 'chart-bar',
  meta: {
    requiresAuth: true
  }
}
```

**选项B: 保留两个页面**

```typescript
{
  id: 'system-usage',
  title: '系统用量',
  path: '/centers/usage',
  component: 'centers/UsageCenter',
  roles: ['admin', 'principal'],
  icon: 'monitor',
},
{
  id: 'ai-billing',
  title: 'AI计费',
  path: '/centers/ai-billing',
  component: 'centers/AIBillingCenter',
  roles: ['admin', 'principal'],
  icon: 'money',
}
```

### 步骤4: 配置Vue Router

编辑前端路由文件（如 `client/src/router/index.ts`）:

```typescript
{
  path: '/centers/ai-billing',
  name: 'AIBillingCenter',
  component: () => import('@/pages/centers/AIBillingCenter.vue'),
  meta: {
    requiresAuth: true,
    roles: ['admin', 'principal'],
    title: 'AI用量与计费中心'
  }
}
```

### 步骤5: 测试功能

1. **启动后端服务器**
```bash
cd /home/zhgue/kyyupgame/k.yyup.com/server
npm run dev
```

2. **启动前端开发服务器**
```bash
cd /home/zhgue/kyyupgame/k.yyup.com/client
npm run dev
```

3. **访问测试**
```
http://localhost:5173/centers/ai-billing
```

4. **测试场景**
- [ ] 切换月度/季度/年度周期
- [ ] 查看统计卡片数据更新
- [ ] 查看趋势图表
- [ ] 搜索和筛选账单
- [ ] 查看单条记录详情
- [ ] 导出CSV文件

---

## 📊 数据展示说明

### 周期选择
- **月度**: 显示当前月份的数据 (如: 2025-01)
- **季度**: 显示当前季度的数据 (如: 2025-Q1)
- **年度**: 显示当前年份的数据 (如: 2025)

### 四种计费类型

1. **Token计费 (文本模型)**
   - 图标: CPU
   - 计量: input_tokens + output_tokens
   - 单位: token
   - 计算: input_tokens × input_price + output_tokens × output_price

2. **字符计费 (TTS语音)**
   - 图标: 文件文本
   - 计量: character_count
   - 单位: character
   - 计算: character_count × unit_price

3. **次数计费 (图片生成)**
   - 图标: 图片
   - 计量: image_count
   - 单位: image
   - 计算: image_count × unit_price

4. **时长计费 (视频生成)**
   - 图标: 视频
   - 计量: duration_seconds
   - 单位: second
   - 计算: duration_seconds × unit_price

### 趋势图表切换
- **月度**: 显示最近12个月的数据
- **周度**: 显示最近12周的数据
- **日度**: 显示最近30天的数据

---

## 🎨 UI特性

- **响应式设计**: 适配不同屏幕尺寸
- **深色/浅色主题**: 跟随系统主题
- **Element Plus组件**: 统一的UI风格
- **ECharts图表**: 专业的数据可视化
- **平滑动画**: 提升用户体验

---

## 📝 示例数据

### 账单记录示例

```json
{
  "id": 1,
  "userId": 123,
  "modelId": 5,
  "billingType": "token",
  "inputTokens": 1000,
  "outputTokens": 500,
  "quantity": 1500,
  "unit": "token",
  "inputPrice": 0.0000005,
  "outputPrice": 0.0000015,
  "totalCost": 0.00125,
  "billingStatus": "paid",
  "billingCycle": "2025-01",
  "createdAt": "2025-01-21T10:30:00Z",
  "modelConfig": {
    "name": "doubao-seed-1-6",
    "modelType": "text"
  }
}
```

---

## 🐛 故障排查

### 问题1: 页面显示"加载数据失败"

**原因**: 后端API未启动或数据库表未创建

**解决方案**:
```bash
# 检查后端服务
curl http://localhost:3000/api/ai-billing/my-bill

# 检查数据库表
mysql -u root -p
USE your_database;
SHOW TABLES LIKE 'ai_billing_records';
```

### 问题2: 导出CSV失败

**原因**: 权限不足或userId未获取

**解决方案**:
检查 `localStorage` 中的 `userInfo`:
```javascript
console.log(JSON.parse(localStorage.getItem('userInfo')))
```

### 问题3: 趋势图表不显示

**原因**: ECharts未正确初始化

**解决方案**:
检查浏览器控制台是否有错误，确保 `echarts` 已正确安装:
```bash
cd client
npm install echarts --save
```

---

## 🔄 后续优化建议

1. **实时数据**: WebSocket实时推送新的计费记录
2. **数据缓存**: Redis缓存统计数据，提升性能
3. **告警功能**: 费用超标自动告警
4. **预算管理**: 设置每月预算限额
5. **详细报表**: PDF格式的月度账单报告
6. **权限控制**: 细粒度的数据访问权限
7. **批量操作**: 批量标记为已支付等

---

## 📞 技术支持

如遇问题，请检查:
1. 后端日志: `server/logs/` 或控制台输出
2. 前端控制台: 浏览器开发者工具
3. 数据库: 确认表结构和数据
4. 网络请求: 检查API响应状态

---

**创建时间**: 2025-01-21  
**版本**: 1.0.0  
**状态**: ✅ 开发完成，待部署测试

