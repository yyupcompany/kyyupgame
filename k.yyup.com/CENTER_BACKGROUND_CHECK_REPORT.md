# 中心页面背景色检查报告

**检查时间**: 2025/10/10 04:06:48

## 📊 统计

- 总共检查: 14 个文件
- 已有正确背景: 0 个
- 需要修复: 14 个
- 错误: 0 个

## ✅ 已有正确背景色的页面



## ❌ 需要修复的页面

- PersonnelCenter.vue - ❌ 没有设置背景色
- EnrollmentCenter.vue - ❌ 背景色为transparent
- TeachingCenter.vue - ⚠️  背景色不标准
- MarketingCenter.vue - ❌ 背景色为transparent
- SystemCenter.vue - ❌ 背景色为transparent
- AICenter.vue - ❌ 背景色为transparent
- CustomerPoolCenter.vue - 没有scoped样式
- AttendanceCenter.vue - ❌ 没有设置背景色
- BusinessCenter.vue - ❌ 背景色为transparent
- TaskCenter.vue - 没有scoped样式
- InspectionCenter.vue - ❌ 没有设置背景色
- ScriptCenter.vue - ❌ 背景色为transparent
- AnalyticsCenter.vue - 没有找到center-container
- FinanceCenter.vue - 没有找到center-container

## ⚠️ 错误



## 🔧 修复建议

对于需要修复的页面，在主容器类的样式中添加：

```scss
.your-center-class {
  background: var(--bg-secondary, #f5f7fa);
  // 其他样式...
}
```

参考活动中心的实现：

```scss
.activity-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--bg-secondary, #f5f7fa);  // ✅ 关键
}
```
