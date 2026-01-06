# 移动端考勤中心

## 功能概述

移动端考勤中心页面严格按照PC端1:1复制原则开发，提供完整的考勤管理功能。

## 文件结构

```
attendance-center/
├── index.vue                           # 主页面
├── components/                         # 组件目录
│   ├── MobileStatisticsTab.vue        # 统计分析Tab组件
│   ├── MobileClassStatisticsTab.vue   # 班级统计Tab组件
│   ├── MobileAbnormalAnalysisTab.vue  # 异常分析Tab组件
│   ├── MobileHealthMonitoringTab.vue  # 健康监测Tab组件
│   └── MobileRecordsManagementTab.vue # 记录管理Tab组件
└── README.md                          # 说明文档
```

## 主要功能

### 1. 全园概览
- 总人数、出勤人数、缺勤人数、出勤率统计
- 迟到、早退、病假、事假详细统计
- 支持日期选择和实时刷新

### 2. 统计分析
- 日/周/月/季度/年统计
- 自定义时间范围统计
- 统计概览和趋势图表
- 详细数据列表展示

### 3. 班级统计
- 各班级考勤率统计
- 支持多种排序方式
- 班级详细考勤信息
- 班级详情查看和报表导出

### 4. 异常分析
- 连续缺勤学生监控
- 频繁迟到学生统计
- 频繁早退学生统计
- 学生详情查看和处理

### 5. 健康监测
- 体温异常记录管理
- 病假统计分析
- 健康趋势图表
- 异常处理和家长通知

### 6. 记录管理
- 考勤记录搜索和筛选
- 批量操作（删除、导出）
- 记录添加和编辑
- 详情查看和修改记录

## 技术特点

### UI组件
- 使用Vant 4组件库
- 响应式设计，适配移动端
- 卡片式布局，信息层次清晰
- 交互友好，操作便捷

### 数据处理
- 集成现有API接口
- 实时数据加载和刷新
- 分页加载优化性能
- 错误处理和状态管理

### 移动端优化
- 触摸友好的交互设计
- 底部弹出式操作面板
- 滑动手势支持
- 移动端专用导航栏

## API集成

所有功能都通过现有的API接口实现：

- `getOverview()` - 获取全园概览
- `getDailyStatistics()` - 日统计
- `getStatisticsByClass()` - 班级统计
- `getAbnormalAnalysis()` - 异常分析
- `getHealthMonitoring()` - 健康监测
- `getAllRecords()` - 考勤记录管理
- `exportAttendance()` - 导出报表

## 页面路径

```
/mobile/centers/attendance-center
```

## 权限控制

- 需要考勤管理权限
- 支持园长、管理员角色
- 根据用户权限显示相应功能

## 响应式适配

- 主要适配移动端（320px - 768px）
- 平板端兼容（768px - 1024px）
- 最大宽度限制在768px，居中显示

## 开发说明

1. 使用Vue 3 Composition API
2. TypeScript类型安全
3. Vant 4组件库
4. 响应式数据管理
5. 错误处理和加载状态

## 使用说明

1. 确保有相应的API服务支持
2. 用户需要登录并有相应权限
3. 网络环境良好，支持实时数据加载
4. 建议在移动设备上使用以获得最佳体验