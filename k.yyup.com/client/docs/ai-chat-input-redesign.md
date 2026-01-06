# AI聊天输入区域重新设计

## 🎯 设计目标
将原有的按钮样式改为更现代化的图标样式，提升用户体验和界面美观度。

## 🔄 主要改进

### 1. 按钮样式改进
- **原设计**: 使用Element Plus的按钮组件，占用空间较大
- **新设计**: 使用自定义图标按钮，更简洁美观

### 2. 新增功能
- **文件上传**: 📄 支持上传PDF、Word、Excel等文档
- **图片上传**: 🖼️ 支持上传各种格式的图片
- **语音输入**: 🎤 保留原有语音输入功能
- **语音播放**: 🔊 保留原有语音播放功能
- **发送消息**: ➤ 优化发送按钮样式

### 3. 交互体验优化
- **悬停效果**: 图标在悬停时有轻微上移和阴影效果
- **状态指示**: 不同状态下图标颜色和样式会发生变化
- **加载动画**: 发送时显示旋转的加载图标
- **脉冲动画**: 语音录音时显示脉冲效果

## 🎨 视觉设计

### 图标尺寸
- **普通图标**: 18px
- **发送图标**: 20px

### 按钮尺寸
- **普通按钮**: 36x36px
- **发送按钮**: 40x40px

### 颜色方案
- **默认状态**: 使用CSS变量，适配主题
- **悬停状态**: 轻微高亮
- **激活状态**: 
  - 语音录音: 红色渐变 + 脉冲动画
  - 语音播放: 橙色渐变
  - 发送按钮: 蓝紫色渐变

### 动画效果
- **悬停**: `translateY(-1px)` + 阴影
- **点击**: `translateY(0)`
- **脉冲**: 录音时的呼吸效果
- **旋转**: 发送时的加载效果

## 🛠️ 技术实现

### 新增组件
```vue
<!-- 文件上传 -->
<div class="action-icon" @click="handleFileUpload" title="上传文件">
  <el-icon size="18"><Document /></el-icon>
  <input ref="fileInput" type="file" style="display: none" />
</div>

<!-- 图片上传 -->
<div class="action-icon" @click="handleImageUpload" title="上传图片">
  <el-icon size="18"><Picture /></el-icon>
  <input ref="imageInput" type="file" style="display: none" />
</div>

<!-- 发送按钮 -->
<div class="send-icon" @click="sendMessage">
  <el-icon size="20"><Promotion /></el-icon>
</div>
```

### 新增方法
- `handleFileUpload()`: 触发文件选择
- `onFileSelected()`: 处理文件选择结果
- `handleImageUpload()`: 触发图片选择
- `onImageSelected()`: 处理图片选择结果

### CSS类名
- `.action-icon`: 普通功能图标
- `.voice-icon`: 语音输入图标
- `.voice-play-icon`: 语音播放图标
- `.send-icon`: 发送按钮图标

## 📱 响应式支持
设计考虑了移动端适配，图标大小和间距在小屏幕上会自动调整。

## 🔧 文件限制
- **文档文件**: 最大10MB，支持PDF、Word、Excel、TXT等
- **图片文件**: 最大5MB，支持所有常见图片格式

## 🎉 用户体验提升
1. **视觉更简洁**: 减少了界面噪音
2. **功能更丰富**: 支持文件和图片上传
3. **交互更流畅**: 优化了动画和反馈
4. **操作更直观**: 图标语义更清晰
