# 创意课程生成器 - 快速开始指南

## 🎯 5 分钟快速上手

### 第一步：访问功能

1. 打开幼儿园管理系统
2. 以教师身份登录
3. 进入教师中心
4. 在左侧菜单中找到"创意课程生成器"
5. 点击进入

### 第二步：创建第一个课程

1. 点击页面上的"新建课程"按钮
2. 在弹出的模板选择器中选择一个模板
3. 例如：选择"🎨 艺术领域"中的"绘画创意工坊"
4. 点击"使用模板"按钮

### 第三步：预览课程

1. 代码编辑器会自动加载模板代码
2. 右侧预览面板会实时显示课程效果
3. 你可以看到一个完整的绘画应用

### 第四步：自定义课程

#### 修改课程信息
```
课程名称: 我的绘画课程
课程描述: 这是一个有趣的绘画课程，适合3-4岁的幼儿
```

#### 编辑 HTML 代码
- 点击"HTML"标签
- 修改课程内容
- 预览会实时更新

#### 编辑 CSS 代码
- 点击"CSS"标签
- 修改样式和颜色
- 预览会实时更新

#### 编辑 JavaScript 代码
- 点击"JavaScript"标签
- 修改交互逻辑
- 预览会实时更新

### 第五步：创建课程表

1. 点击"管理课程表"按钮
2. 点击"添加课程"按钮
3. 填写课程信息：
   - 星期：选择周一
   - 开始时间：09:00
   - 结束时间：09:30
   - 教室：教室A
   - 备注：第一节课

4. 点击"保存课程表"

### 第六步：保存课程

1. 点击"保存课程"按钮
2. 等待保存完成
3. 看到成功提示

## 📚 常用模板快速参考

### 🏃 健康领域 - 健康操表演
**适合年龄**: 3-4岁  
**时长**: 30分钟  
**特点**: 包含热身、主要运动、放松三个环节

**快速修改**:
- 修改 HTML 中的运动项目名称
- 修改 CSS 中的颜色和样式
- 修改 JavaScript 中的运动时长

### 🗣️ 语言领域 - 故事讲述互动
**适合年龄**: 4-5岁  
**时长**: 30分钟  
**特点**: 支持多页故事、文字朗读

**快速修改**:
- 在 JavaScript 中修改 `stories` 数组
- 添加新的故事页面
- 修改故事内容

### 👥 社会领域 - 角色扮演游戏
**适合年龄**: 3-5岁  
**时长**: 45分钟  
**特点**: 包含多个角色选择

**快速修改**:
- 在 HTML 中添加新的角色卡片
- 修改 CSS 中的角色样式
- 在 JavaScript 中添加角色逻辑

### 🔬 科学领域 - 科学实验探索
**适合年龄**: 4-5岁  
**时长**: 40分钟  
**特点**: 包含多个实验选项

**快速修改**:
- 在 HTML 中添加新的实验项目
- 修改实验描述
- 添加实验交互逻辑

### 🎨 艺术领域 - 绘画创意工坊
**适合年龄**: 3-5岁  
**时长**: 35分钟  
**特点**: 支持自由绘画、颜色选择

**快速修改**:
- 修改画布大小
- 添加更多颜色选项
- 修改笔刷大小范围

## 💡 实用技巧

### 技巧 1: 快速复制模板
1. 选择一个模板
2. 修改课程名称
3. 保存课程
4. 再次点击"新建课程"选择同一模板
5. 快速创建相似课程

### 技巧 2: 使用 Emoji 增加趣味
```html
<h1>🎨 我的绘画课程</h1>
<button>🖌️ 开始绘画</button>
<div>✅ 完成</div>
```

### 技巧 3: 添加按钮交互
```javascript
document.getElementById('myButton').addEventListener('click', function() {
  alert('按钮被点击了！');
});
```

### 技巧 4: 修改颜色
```css
/* 改变背景颜色 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 改变文字颜色 */
color: white;

/* 改变按钮颜色 */
background: #ff6b6b;
```

### 技巧 5: 添加动画效果
```css
transition: all 0.3s ease;
transform: scale(1.05);
```

## 🎓 教学示例

### 示例 1: 简单的问答游戏

**HTML**:
```html
<div class="quiz">
  <h1>问答游戏</h1>
  <p id="question">1 + 1 = ?</p>
  <button class="answer" data-answer="2">2</button>
  <button class="answer" data-answer="3">3</button>
  <div id="result"></div>
</div>
```

**JavaScript**:
```javascript
document.querySelectorAll('.answer').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.dataset.answer === '2') {
      document.getElementById('result').textContent = '✅ 正确！';
    } else {
      document.getElementById('result').textContent = '❌ 再试一次';
    }
  });
});
```

### 示例 2: 简单的计时器

**HTML**:
```html
<div class="timer">
  <h1>计时器</h1>
  <div id="time">00:30</div>
  <button id="startBtn">开始</button>
</div>
```

**JavaScript**:
```javascript
let seconds = 30;
document.getElementById('startBtn').addEventListener('click', function() {
  const interval = setInterval(() => {
    seconds--;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('time').textContent = 
      String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    if (seconds === 0) clearInterval(interval);
  }, 1000);
});
```

## ❓ 常见问题

**Q: 我的代码有错误怎么办？**  
A: 检查预览面板是否显示错误信息，修改代码后点击"刷新预览"。

**Q: 如何添加图片？**  
A: 使用 Data URL 或 Base64 编码的图片，或使用 Emoji。

**Q: 可以使用外部库吗？**  
A: 由于沙箱限制，建议使用原生 JavaScript。

**Q: 如何保存我的课程？**  
A: 点击"保存课程"按钮，课程会保存到数据库。

**Q: 可以导出课程吗？**  
A: 目前支持保存到系统，后续版本会支持导出功能。

## 🚀 下一步

1. **探索更多模板** - 尝试所有 5 个领域的模板
2. **自定义课程** - 根据教学需求修改模板
3. **创建课程表** - 为整个学期规划课程
4. **分享经验** - 与其他教师分享你的课程

## 📞 需要帮助？

- 查看 README.md 了解详细功能
- 查看 EXAMPLES.md 了解更多示例
- 查看代码注释了解技术细节

---

**祝你使用愉快！** 🎉

如有任何问题，请联系技术支持团队。

