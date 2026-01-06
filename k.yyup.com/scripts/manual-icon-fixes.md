# 📋 手动图标修复清单

## 剩余需要修复的文件和图标

### 1. ReportChart.vue (line 89-91)
```vue
# 替换前：
{ value: 'bar', label: '柱状图', icon: 'el-icon-data-analysis' }
{ value: 'line', label: '折线图', icon: 'el-icon-trend-charts' }
{ value: 'pie', label: '饼图', icon: 'el-icon-pie-chart' }

# 替换后：
{ value: 'bar', label: '柱状图', icon: 'bar-chart-3' }
{ value: 'line', label: '折线图', icon: 'trending-up' }
{ value: 'pie', label: '饼图', icon: 'pie-chart' }
```

### 2. 硬编码的图标映射 (MediaGallery.vue line 322-325)
```javascript
// 替换前：
'el-icon-picture'
'el-icon-video-camera'
'el-icon-picture-outline'
'el-icon-video-play'

// 替换后：
'image'
'video'
'image'
'play'
```

## 🛠️ 快速修复命令

```bash
# 修复 ReportChart.vue
sed -i 's/el-icon-data-analysis/bar-chart-3/g' client/src/components/ai/ReportChart.vue
sed -i 's/el-icon-trend-charts/trending-up/g' client/src/components/ai/ReportChart.vue
sed -i 's/el-icon-pie-chart/pie-chart/g' client/src/components/ai/ReportChart.vue

# 修复 MediaGallery.vue 的硬编码映射
sed -i "s/'el-icon-picture':/'image':/g" client/src/components/ai/MediaGallery.vue
sed -i "s/'el-icon-video-camera':/'video':/g" client/src/components/ai/MediaGallery.vue
sed -i "s/'el-icon-picture-outline':/'image':/g" client/src/components/ai/MediaGallery.vue
sed -i "s/'el-icon-video-play':/'play':/g" client/src/components/ai/MediaGallery.vue
```

## ✅ 验证步骤

1. 运行修复命令
2. 检查代码语法是否正确
3. 启动开发服务器测试图标显示
4. 确保所有图标都正常显示为 LucideIcon 样式

## 🎯 最终目标

- [ ] 所有 el-icon-* 都替换为 LucideIcon
- [ ] 所有文件都正确导入 LucideIcon
- [ ] 图标大小和样式保持一致
- [ ] 页面显示正常无错误