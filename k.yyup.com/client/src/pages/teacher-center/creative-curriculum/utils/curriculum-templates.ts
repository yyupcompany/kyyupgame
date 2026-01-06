/**
 * 创意课程生成器 - 课程模板库
 * 基于中国教育局五大领域课程要求
 */

import { CurriculumTemplate, CurriculumDomain } from '../types/curriculum'

export const curriculumTemplates: CurriculumTemplate[] = [
  // 健康领域
  {
    id: 'health-001',
    name: '健康操表演',
    domain: CurriculumDomain.HEALTH,
    description: '通过音乐和动作培养幼儿的身体协调能力',
    ageGroup: '3-4岁',
    objectives: ['增强身体协调能力', '培养节奏感', '提高身体灵活性'],
    materials: ['音乐播放器', '垫子', '彩带'],
    htmlTemplate: `<div class="health-exercise">
  <h1>健康操表演</h1>
  <div class="exercise-container">
    <div class="exercise-item">
      <h3>热身运动</h3>
      <p>跟随音乐做简单的热身动作</p>
    </div>
    <div class="exercise-item">
      <h3>主要运动</h3>
      <p>学习基本的健康操动作</p>
    </div>
    <div class="exercise-item">
      <h3>放松运动</h3>
      <p>缓慢的放松和拉伸动作</p>
    </div>
  </div>
  <button id="startBtn">开始运动</button>
</div>`,
    cssTemplate: `.health-exercise {
  padding: var(--spacing-4xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: 10px;
  color: var(--text-on-primary);
  font-family: 'Arial', sans-serif;
}

.health-exercise h1 {
  text-align: center;
  font-size: 2em;
  margin-bottom: var(--spacing-4xl);
}

.exercise-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
}

.exercise-item {
  background: rgba(255, 255, 255, 0.1);
  padding: var(--spacing-lg);
  border-radius: 8px;
  text-align: center;
}

.exercise-item h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-on-primary);
}

#startBtn {
  display: block;
  margin: var(--spacing-xl) auto 0;
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--success-color);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
}

#startBtn:hover {
  background: var(--success-hover);
  transform: translateY(-2px);
}`,
    jsTemplate: `document.getElementById('startBtn').addEventListener('click', function() {
  alert('开始健康操表演！请跟随音乐做动作。');
  this.textContent = '运动中...';
  this.disabled = true;
  
  setTimeout(() => {
    this.textContent = '开始运动';
    this.disabled = false;
    alert('运动完成！做得很好！');
  }, 30000);
});`
  },

  // 语言领域
  {
    id: 'language-001',
    name: '故事讲述互动',
    domain: CurriculumDomain.LANGUAGE,
    description: '通过互动故事培养幼儿的语言表达能力',
    ageGroup: '4-5岁',
    objectives: ['提高语言表达能力', '增强理解能力', '培养想象力'],
    materials: ['故事书', '图片卡片', '录音设备'],
    htmlTemplate: `<div class="story-container">
  <h1>🎭 故事讲述</h1>
  <div class="story-content">
    <div class="story-image">📖</div>
    <div class="story-text">
      <h2 id="storyTitle">小红帽的冒险</h2>
      <p id="storyContent">从前，有一个小女孩叫小红帽...</p>
    </div>
  </div>
  <div class="controls">
    <button id="prevBtn">⬅️ 上一页</button>
    <button id="nextBtn">下一页 ➡️</button>
    <button id="speakBtn">🔊 朗读</button>
  </div>
</div>`,
    cssTemplate: `.story-container {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--text-2xl);
  background: var(--warning-light-bg);
  border-radius: 15px;
  box-shadow: var(--shadow-md);
}

.story-container h1 {
  text-align: center;
  color: #d4a574;
  font-size: 2em;
  margin-bottom: var(--text-2xl);
}

.story-content {
  display: flex;
  gap: var(--text-2xl);
  margin: var(--text-2xl) 0;
  align-items: center;
}

.story-image {
  font-size: 4em;
  min-width: 100px;
  text-align: center;
}

.story-text {
  flex: 1;
}

.story-text h2 {
  color: #8b4513;
  margin: 0 0 10px 0;
}

.story-text p {
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: var(--text-2xl);
  flex-wrap: wrap;
}

.controls button {
  padding: 10px var(--text-2xl);
  background: #8b4513;
  color: white;
  border: none;
  border-radius: var(--text-2xl);
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s ease;
}

.controls button:hover {
  background: #a0522d;
  transform: translateY(-2px);
}`,
    jsTemplate: `const stories = [
  { title: '小红帽的冒险', content: '从前，有一个小女孩叫小红帽...' },
  { title: '第二页', content: '她穿着红色的斗篷，去森林里采蘑菇...' },
  { title: '第三页', content: '突然，她遇到了一只友好的小兔子...' }
];

let currentPage = 0;

function updateStory() {
  document.getElementById('storyTitle').textContent = stories[currentPage].title;
  document.getElementById('storyContent').textContent = stories[currentPage].content;
}

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentPage > 0) currentPage--;
  updateStory();
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentPage < stories.length - 1) currentPage++;
  updateStory();
});

document.getElementById('speakBtn').addEventListener('click', () => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(stories[currentPage].content);
    utterance.lang = 'zh-CN';
    speechSynthesis.speak(utterance);
  }
});`
  },

  // 社会领域
  {
    id: 'social-001',
    name: '角色扮演游戏',
    domain: CurriculumDomain.SOCIAL,
    description: '通过角色扮演培养幼儿的社交能力',
    ageGroup: '3-5岁',
    objectives: ['培养社交能力', '理解不同角色', '学习合作'],
    materials: ['服装道具', '场景布置', '音乐'],
    htmlTemplate: `<div class="role-play">
  <h1>👥 角色扮演游戏</h1>
  <div class="roles-grid">
    <div class="role-card" data-role="doctor">
      <div class="role-icon">👨‍⚕️</div>
      <h3>医生</h3>
      <p>帮助病人恢复健康</p>
    </div>
    <div class="role-card" data-role="teacher">
      <div class="role-icon">👩‍🏫</div>
      <h3>老师</h3>
      <p>教导学生知识</p>
    </div>
    <div class="role-card" data-role="chef">
      <div class="role-icon">👨‍🍳</div>
      <h3>厨师</h3>
      <p>烹饪美味食物</p>
    </div>
    <div class="role-card" data-role="shopkeeper">
      <div class="role-icon">🏪</div>
      <h3>店员</h3>
      <p>销售商品</p>
    </div>
  </div>
  <div id="selectedRole" style="text-align: center; margin-top: var(--text-2xl);"></div>
</div>`,
    cssTemplate: `.role-play {
  padding: var(--text-2xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--danger-color) 100%);
  border-radius: 15px;
  color: white;
}

.role-play h1 {
  text-align: center;
  font-size: 2em;
  margin-bottom: 30px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: var(--text-2xl) 0;
}

.role-card {
  background: var(--bg-overlay);
  padding: var(--text-2xl);
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.role-card:hover {
  background: var(--bg-overlay-light);
  transform: translateY(-5px);
  border-color: var(--border-color);
}

.role-icon {
  font-size: 3em;
  margin-bottom: 10px;
}

.role-card h3 {
  margin: 10px 0 5px 0;
  font-size: 1.2em;
}

.role-card p {
  margin: 0;
  font-size: 0.9em;
  opacity: 0.9;
}`,
    jsTemplate: `document.querySelectorAll('.role-card').forEach(card => {
  card.addEventListener('click', function() {
    const role = this.dataset.role;
    const roleNames = {
      doctor: '医生',
      teacher: '老师',
      chef: '厨师',
      shopkeeper: '店员'
    };
    document.getElementById('selectedRole').innerHTML = 
      '<h2>你选择了：' + roleNames[role] + '</h2><p>现在开始你的角色扮演吧！</p>';
  });
});`
  },

  // 科学领域
  {
    id: 'science-001',
    name: '科学实验探索',
    domain: CurriculumDomain.SCIENCE,
    description: '通过简单实验培养幼儿的科学探索精神',
    ageGroup: '4-5岁',
    objectives: ['培养观察能力', '理解科学原理', '激发探索欲望'],
    materials: ['实验用具', '安全防护用品', '记录表'],
    htmlTemplate: `<div class="science-experiment">
  <h1>🔬 科学实验探索</h1>
  <div class="experiment-list">
    <div class="experiment-item">
      <h3>🌈 彩虹实验</h3>
      <p>用水和光线创造美丽的彩虹</p>
      <button class="start-btn">开始实验</button>
    </div>
    <div class="experiment-item">
      <h3>🧲 磁铁实验</h3>
      <p>探索磁铁的神奇力量</p>
      <button class="start-btn">开始实验</button>
    </div>
    <div class="experiment-item">
      <h3>🌱 植物生长</h3>
      <p>观察种子如何生长成植物</p>
      <button class="start-btn">开始实验</button>
    </div>
  </div>
</div>`,
    cssTemplate: `.science-experiment {
  padding: var(--text-2xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.science-experiment h1 {
  text-align: center;
  font-size: 2em;
  margin-bottom: 30px;
}

.experiment-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-2xl);
}

.experiment-item {
  background: rgba(255, 255, 255, 0.1);
  padding: var(--text-2xl);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.experiment-item h3 {
  margin: 0 0 10px 0;
  font-size: 1.3em;
}

.experiment-item p {
  margin: 0 0 15px 0;
  opacity: 0.9;
}

.start-btn {
  width: 100%;
  padding: 10px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s ease;
}

.start-btn:hover {
  background: #ff5252;
  transform: scale(1.05);
}`,
    jsTemplate: `document.querySelectorAll('.start-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    alert('实验开始！请按照老师的指导进行操作。');
  });
});`
  },

  // 艺术领域
  {
    id: 'art-001',
    name: '绘画创意工坊',
    domain: CurriculumDomain.ART,
    description: '通过绘画培养幼儿的创意和艺术表达能力',
    ageGroup: '3-5岁',
    objectives: ['培养创意思维', '提高艺术表达能力', '增强色彩认知'],
    materials: ['画笔', '颜料', '画纸', '调色板'],
    htmlTemplate: `<div class="art-workshop">
  <h1>🎨 绘画创意工坊</h1>
  <canvas id="drawingCanvas" width="400" height="300"></canvas>
  <div class="controls">
    <div class="color-picker">
      <label>选择颜色：</label>
      <input type="color" id="colorPicker" value="#000000">
    </div>
    <div class="brush-size">
      <label>笔刷大小：</label>
      <input type="range" id="brushSize" min="1" max="20" value="5">
    </div>
    <button id="clearBtn">清空画布</button>
    <button id="saveBtn">保存作品</button>
  </div>
</div>`,
    cssTemplate: `.art-workshop {
  padding: var(--text-2xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--danger-color) 100%);
  border-radius: 15px;
  color: white;
  max-width: 500px;
  margin: 0 auto;
}

.art-workshop h1 {
  text-align: center;
  font-size: 2em;
  margin-bottom: var(--text-2xl);
}

#drawingCanvas {
  display: block;
  margin: var(--text-2xl) auto;
  background: white;
  border-radius: 10px;
  cursor: crosshair;
  box-shadow: var(--shadow-lg);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: var(--text-2xl);
}

.color-picker, .brush-size {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-picker label, .brush-size label {
  min-width: 80px;
}

#colorPicker {
  width: 50px;
  height: 40px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

#brushSize {
  flex: 1;
}

#clearBtn, #saveBtn {
  padding: 10px;
  background: var(--bg-overlay);
  color: white;
  border: 2px solid var(--border-color);
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: all 0.3s ease;
}

#clearBtn:hover, #saveBtn:hover {
  background: var(--bg-overlay-light);
}`,
    jsTemplate: `const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

let isDrawing = false;

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.strokeStyle = colorPicker.value;
  ctx.lineWidth = brushSize.value;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseout', () => isDrawing = false);

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveBtn.addEventListener('click', () => {
  alert('作品已保存！');
});`
  }
]

export function getCurriculumTemplatesByDomain(domain: CurriculumDomain): CurriculumTemplate[] {
  return curriculumTemplates.filter(template => template.domain === domain)
}

export function getCurriculumTemplateById(id: string): CurriculumTemplate | undefined {
  return curriculumTemplates.find(template => template.id === id)
}

