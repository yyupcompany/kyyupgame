<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1 class="demo-title">幼儿园管理系统 - 样式演示</h1>
      <p class="demo-subtitle">展示改进的布局和字体样式</p>
    </div>

    <div class="demo-content">
      <!-- 卡片组件演示 -->
      <div class="demo-section">
        <h2 class="section-title">卡片组件</h2>
        <div class="card-grid">
          <div class="demo-card">
            <div class="card-header">
              <h3>学生统计</h3>
              <el-tag type="primary">今日</el-tag>
            </div>
            <div class="card-content">
              <div class="stat-item">
                <span class="stat-label">总学生数</span>
                <span class="stat-value">1,248</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">新增学生</span>
                <span class="stat-value success">+12</span>
              </div>
            </div>
            <div class="card-footer">
              <el-button type="primary" plain>查看详情</el-button>
            </div>
          </div>

          <div class="demo-card">
            <div class="card-header">
              <h3>教师管理</h3>
              <el-tag type="success">活跃</el-tag>
            </div>
            <div class="card-content">
              <div class="stat-item">
                <span class="stat-label">教师总数</span>
                <span class="stat-value">86</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">请假教师</span>
                <span class="stat-value warning">3</span>
              </div>
            </div>
            <div class="card-footer">
              <el-button type="success" plain>管理教师</el-button>
            </div>
          </div>

          <div class="demo-card">
            <div class="card-header">
              <h3>活动安排</h3>
              <el-tag type="warning">进行中</el-tag>
            </div>
            <div class="card-content">
              <div class="stat-item">
                <span class="stat-label">本周活动</span>
                <span class="stat-value">5</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">已完成</span>
                <span class="stat-value info">3</span>
              </div>
            </div>
            <div class="card-footer">
              <el-button type="warning" plain>查看活动</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 表单组件演示 -->
      <div class="demo-section">
        <h2 class="section-title">表单组件</h2>
        <div class="demo-form">
          <el-form :model="form" label-width="120px">
            <el-form-item label="学生姓名">
              <el-input v-model="form.name" placeholder="请输入学生姓名" />
            </el-form-item>
            <el-form-item label="年龄">
              <el-input-number v-model="form.age" :min="1" :max="18" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio label="男" />
                <el-radio label="女" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="班级">
              <el-select v-model="form.class" placeholder="请选择班级">
                <el-option label="小班" value="small" />
                <el-option label="中班" value="middle" />
                <el-option label="大班" value="large" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注信息" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">提交</el-button>
              <el-button>重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 按钮样式演示 -->
      <div class="demo-section">
        <h2 class="section-title">按钮样式</h2>
        <div class="button-demo">
          <div class="button-group">
            <h3>基础按钮</h3>
            <div class="button-row">
              <el-button>默认按钮</el-button>
              <el-button type="primary">主要按钮</el-button>
              <el-button type="success">成功按钮</el-button>
              <el-button type="warning">警告按钮</el-button>
              <el-button type="danger">危险按钮</el-button>
              <el-button type="info">信息按钮</el-button>
            </div>
          </div>

          <div class="button-group">
            <h3>朴素按钮</h3>
            <div class="button-row">
              <el-button plain>朴素按钮</el-button>
              <el-button type="primary" plain>主要按钮</el-button>
              <el-button type="success" plain>成功按钮</el-button>
              <el-button type="warning" plain>警告按钮</el-button>
              <el-button type="danger" plain>危险按钮</el-button>
              <el-button type="info" plain>信息按钮</el-button>
            </div>
          </div>

          <div class="button-group">
            <h3>自定义按钮</h3>
            <div class="button-row">
              <button class="btn-gradient">渐变按钮</button>
              <button class="btn-gradient btn-gradient--success">成功渐变</button>
              <button class="btn-gradient btn-gradient--warning">警告渐变</button>
              <button class="btn-gradient btn-gradient--danger">危险渐变</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 主题切换演示 -->
      <div class="demo-section">
        <h2 class="section-title">主题切换</h2>
        <div class="theme-demo">
          <p>当前主题: <span class="theme-name">{{ currentTheme }}</span></p>
          <div class="theme-buttons">
            <el-button @click="changeTheme('theme-light')" :type="currentTheme === 'theme-light' ? 'primary' : 'default'">
              明亮主题
            </el-button>
            <el-button @click="changeTheme('theme-dark')" :type="currentTheme === 'theme-dark' ? 'primary' : 'default'">
              暗黑主题
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 表单数据
const form = ref({
  name: '',
  age: 3,
  gender: '男',
  class: '',
  remark: ''
})

// 当前主题
const currentTheme = ref('theme-light')

// 切换主题
const changeTheme = (theme: string) => {
  currentTheme.value = theme
  document.documentElement.className = theme
  document.body.className = theme
  localStorage.setItem('theme', theme)
}

// 初始化主题
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    changeTheme(savedTheme)
  }
})
</script>

<style lang="scss" scoped>
.demo-container {
  padding: var(--spacing-6xl);
  background-color: var(--bg-primary);
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-8xl);
  padding: var(--spacing-6xl) 0;
}

.demo-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-3xl);
  line-height: 1.2;
}

.demo-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 0;
}

.demo-content {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-section {
  margin-bottom: var(--spacing-10xl);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6xl);
  box-shadow: var(--shadow-md);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-6xl);
  padding-bottom: var(--spacing-3xl);
  border-bottom: var(--border-width-base) solid var(--border-color);
}

/* 卡片样式 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-6xl);
}

.demo-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-var(--spacing-xs));
    box-shadow: var(--shadow-lg);
  }
}

.card-header {
  padding: var(--spacing-5xl) 2var(--spacing-xs) var(--spacing-md);
  border-bottom: var(--border-width-base) solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h3 {
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}

.card-content {
  padding: var(--spacing-5xl) 2var(--spacing-xs);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.stat-label {
  font-size: 1rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  
  &.success {
    color: var(--success-color);
  }
  
  &.warning {
    color: var(--warning-color);
  }
  
  &.info {
    color: var(--info-color);
  }
}

.card-footer {
  padding: var(--spacing-4xl) 2var(--spacing-xs) 2var(--spacing-xs);
  text-align: right;
}

/* 表单样式 */
.demo-form {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6xl);
  box-shadow: var(--shadow-sm);
}

/* 按钮演示样式 */
.button-demo {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6xl);
  box-shadow: var(--shadow-sm);
}

.button-group {
  margin-bottom: var(--spacing-8xl);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-4xl);
  }
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  align-items: center;
  
  .el-button,
  .btn-gradient {
    margin: var(--spacing-md) 0;
  }
}

/* 主题演示样式 */
.theme-demo {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6xl);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.theme-name {
  font-weight: 600;
  color: var(--primary-color);
}

.theme-buttons {
  margin-top: var(--spacing-5xl);
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .demo-container {
    padding: var(--spacing-4xl);
  }
  
  .demo-title {
    font-size: 2rem;
  }
  
  .demo-subtitle {
    font-size: 1.125rem;
  }
  
  .demo-section {
    padding: var(--spacing-4xl);
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .button-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .theme-buttons {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>