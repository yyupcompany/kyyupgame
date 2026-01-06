# 创意课程生成器 - 使用示例

## 示例 1: 互动式数字学习课程

### 课程信息
- **名称**: 数字认知游戏
- **领域**: 科学领域
- **年龄段**: 3-4岁
- **时长**: 25分钟

### HTML 代码
```html
<div class="number-game">
  <h1>🔢 数字认知游戏</h1>
  <div class="game-container">
    <div class="number-display" id="numberDisplay">1</div>
    <div class="buttons-group">
      <button class="number-btn" data-number="1">1️⃣</button>
      <button class="number-btn" data-number="2">2️⃣</button>
      <button class="number-btn" data-number="3">3️⃣</button>
      <button class="number-btn" data-number="4">4️⃣</button>
      <button class="number-btn" data-number="5">5️⃣</button>
    </div>
    <div id="feedback"></div>
    <button id="nextBtn">下一个</button>
  </div>
</div>
```

### CSS 代码
```css
.number-game {
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
  text-align: center;
}

.number-game h1 {
  font-size: 2.5em;
  margin-bottom: 30px;
}

.game-container {
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.number-display {
  font-size: 4em;
  margin-bottom: 30px;
  font-weight: bold;
}

.buttons-group {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.number-btn {
  padding: 15px;
  font-size: 1.5em;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.number-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

#feedback {
  font-size: 1.5em;
  margin: 20px 0;
  min-height: 30px;
}

#nextBtn {
  padding: 12px 30px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

#nextBtn:hover {
  background: #ff5252;
  transform: scale(1.05);
}
```

### JavaScript 代码
```javascript
let currentNumber = 1;
let score = 0;

function showNewNumber() {
  currentNumber = Math.floor(Math.random() * 5) + 1;
  document.getElementById('numberDisplay').textContent = currentNumber;
  document.getElementById('feedback').textContent = '';
}

document.querySelectorAll('.number-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const selected = parseInt(this.dataset.number);
    if (selected === currentNumber) {
      document.getElementById('feedback').textContent = '✅ 正确！';
      score++;
    } else {
      document.getElementById('feedback').textContent = '❌ 再试一次';
    }
  });
});

document.getElementById('nextBtn').addEventListener('click', showNewNumber);

showNewNumber();
```

---

## 示例 2: 颜色识别互动课程

### 课程信息
- **名称**: 颜色识别游戏
- **领域**: 艺术领域
- **年龄段**: 3-4岁
- **时长**: 20分钟

### HTML 代码
```html
<div class="color-game">
  <h1>🎨 颜色识别游戏</h1>
  <div class="game-area">
    <div class="color-box" id="colorBox"></div>
    <p id="colorName">请点击正确的颜色</p>
    <div class="color-options">
      <button class="color-option" style="background: #FF6B6B;" data-color="red">红色</button>
      <button class="color-option" style="background: #4ECDC4;" data-color="cyan">青色</button>
      <button class="color-option" style="background: #FFE66D;" data-color="yellow">黄色</button>
      <button class="color-option" style="background: #95E1D3;" data-color="green">绿色</button>
    </div>
    <div id="result"></div>
  </div>
</div>
```

### CSS 代码
```css
.color-game {
  padding: 30px;
  background: #f5f5f5;
  border-radius: 15px;
  text-align: center;
}

.color-game h1 {
  font-size: 2em;
  color: #333;
  margin-bottom: 30px;
}

.game-area {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.color-box {
  width: 150px;
  height: 150px;
  margin: 0 auto 20px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

#colorName {
  font-size: 1.3em;
  color: #333;
  margin: 20px 0;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
}

.color-option {
  padding: 20px;
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.color-option:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

#result {
  font-size: 1.5em;
  margin-top: 20px;
  min-height: 30px;
}
```

### JavaScript 代码
```javascript
const colors = [
  { name: '红色', value: '#FF6B6B', english: 'red' },
  { name: '青色', value: '#4ECDC4', english: 'cyan' },
  { name: '黄色', value: '#FFE66D', english: 'yellow' },
  { name: '绿色', value: '#95E1D3', english: 'green' }
];

let currentColor;

function showNewColor() {
  currentColor = colors[Math.floor(Math.random() * colors.length)];
  document.getElementById('colorBox').style.background = currentColor.value;
  document.getElementById('colorName').textContent = '请点击 ' + currentColor.name;
  document.getElementById('result').textContent = '';
}

document.querySelectorAll('.color-option').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.dataset.color === currentColor.english) {
      document.getElementById('result').textContent = '✅ 太棒了！';
      setTimeout(showNewColor, 1000);
    } else {
      document.getElementById('result').textContent = '❌ 再试一次';
    }
  });
});

showNewColor();
```

---

## 示例 3: 形状识别课程

### 课程信息
- **名称**: 形状识别游戏
- **领域**: 科学领域
- **年龄段**: 4-5岁
- **时长**: 25分钟

### HTML 代码
```html
<div class="shape-game">
  <h1>⭐ 形状识别游戏</h1>
  <div class="shape-display" id="shapeDisplay"></div>
  <p id="shapeName">识别这个形状</p>
  <div class="shape-options">
    <button class="shape-btn" data-shape="circle">⭕ 圆形</button>
    <button class="shape-btn" data-shape="square">⬜ 正方形</button>
    <button class="shape-btn" data-shape="triangle">🔺 三角形</button>
    <button class="shape-btn" data-shape="star">⭐ 星形</button>
  </div>
  <div id="shapeResult"></div>
</div>
```

### CSS 代码
```css
.shape-game {
  padding: 30px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 15px;
  text-align: center;
  color: white;
}

.shape-game h1 {
  font-size: 2.5em;
  margin-bottom: 30px;
}

.shape-display {
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5em;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

#shapeName {
  font-size: 1.5em;
  margin: 20px 0;
}

.shape-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
}

.shape-btn {
  padding: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  border-radius: 10px;
  color: white;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shape-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

#shapeResult {
  font-size: 1.5em;
  margin-top: 20px;
  min-height: 30px;
}
```

### JavaScript 代码
```javascript
const shapes = [
  { name: '圭形', emoji: '⭕', type: 'circle' },
  { name: '正方形', emoji: '⬜', type: 'square' },
  { name: '三角形', emoji: '🔺', type: 'triangle' },
  { name: '星形', emoji: '⭐', type: 'star' }
];

let currentShape;

function showNewShape() {
  currentShape = shapes[Math.floor(Math.random() * shapes.length)];
  document.getElementById('shapeDisplay').textContent = currentShape.emoji;
  document.getElementById('shapeName').textContent = '这是什么形状？';
  document.getElementById('shapeResult').textContent = '';
}

document.querySelectorAll('.shape-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    if (this.dataset.shape === currentShape.type) {
      document.getElementById('shapeResult').textContent = '🎉 完美！';
      setTimeout(showNewShape, 1500);
    } else {
      document.getElementById('shapeResult').textContent = '再想想...';
    }
  });
});

showNewShape();
```

---

## 课程表示例

### 春季学期课程表（3-4岁班）

| 星期 | 开始时间 | 结束时间 | 教室 | 课程 |
|------|--------|--------|------|------|
| 周一 | 09:00 | 09:30 | 教室A | 健康操表演 |
| 周二 | 09:00 | 09:30 | 教室B | 颜色识别游戏 |
| 周三 | 09:00 | 09:30 | 教室A | 数字认知游戏 |
| 周四 | 09:00 | 09:30 | 教室C | 形状识别游戏 |
| 周五 | 09:00 | 09:30 | 教室B | 绘画创意工坊 |

---

## 提示和技巧

1. **使用 Emoji** - 在课程中使用 Emoji 使其更加生动有趣
2. **响应式设计** - 确保课程在不同屏幕尺寸上都能正常显示
3. **交互反馈** - 为用户操作提供即时反馈（如成功/失败提示）
4. **渐进难度** - 根据幼儿进度逐步增加课程难度
5. **定期测试** - 在实际教学前充分测试课程功能

---

**更多示例持续更新中...**

