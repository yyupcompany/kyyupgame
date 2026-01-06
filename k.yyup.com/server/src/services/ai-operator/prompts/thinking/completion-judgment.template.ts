/**
 * 完成判断提示词模板
 * 指导AI判断任务是否完成
 */

export const completionJudgmentTemplate = {
  name: 'completion_judgment',
  description: '完成判断提示词 - 指导AI判断任务完成状态',
  variables: ['originalRequest', 'currentResult', 'remainingTasks'],

  template: `## ✅ 任务完成度评估

### 原始请求
\`\`\`
{{originalRequest}}
\`\`\`

### 当前结果
{{currentResult}}

### 剩余任务
{{remainingTasks}}

---

## 完成判断标准

### 1. 需求满足度
- ✅ 完全满足：所有需求都已解决
- ⚠️ 部分满足：主要需求解决，细节待补充
- ❌ 未满足：核心需求未解决

### 2. 信息完整性
- ✅ 信息完整：提供充分的信息和解释
- ⚠️ 基本完整：主要信息已提供
- ❌ 信息不足：关键信息缺失

### 3. 后续行动
- ✅ 无需行动：任务完全完成
- ⚠️ 建议行动：提供优化建议
- ❌ 需要继续：必须进一步处理

## 判断结论
基于以上标准，当前任务的完成状态是：[判断结果]`
};

export default completionJudgmentTemplate;
