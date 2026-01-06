# ⚡ 图标映射工具 - 快速参考

## 🚀 一键检测

```bash
# 进入client目录
cd client

# 运行侧边栏检测（推荐）
node scripts/check-sidebar-icons.js

# 或运行全项目检测
node scripts/check-unmapped-icons.js
```

## 📋 常见图标映射

### 基础图标
```
'layoutdashboard' → 'dashboard'    # 布局面板
'graduationcap'   → 'school'       # 毕业帽
'calendar'        → 'calendar'     # 日历
'home'            → 'home'         # 首页
```

### 功能图标
```
'checksquare'     → 'task'         # 勾选框
'messagesquare'   → 'chat-square'  # 消息方框
'usercheck'       → 'user-check'   # 用户勾选
'star'            → 'star'         # 星星
```

### 业务图标
```
'briefcase'       → 'briefcase'    # 公文包
'phone'           → 'phone'        # 电话
'bookopen'        → 'book-open'    # 打开的书
'barchart3'       → 'analytics'    # 柱状图
```

## 🔧 快速修复

### 在 icon-mapping.ts 中添加映射
```typescript
const ICON_ALIASES = {
  // 现有映射...

  // 添加新映射
  'newicon': 'targeticon'
}
```

### 在 UnifiedIcon.vue 中添加定义
```typescript
const kindergartenIcons = {
  // 现有图标...

  // 添加新定义
  'newicon': {
    path: 'M12 2l3.09 6.26...'
  }
}
```

## ✅ 检查清单

- [ ] 运行检测脚本
- [ ] 检查控制台警告
- [ ] 确认侧边栏图标显示正常
- [ ] 验证映射配置已更新

## 📞 文档链接

- [完整使用指南](USAGE_GUIDE.md)
- [README](README-icon-checker.md)
- [完整总结](../../ICON_MAPPING_TOOL_SUMMARY.md)

---
*保持更新：2025-11-16*
