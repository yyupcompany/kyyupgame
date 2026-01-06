<template>
  <div class="demo-index">
    <div class="demo-header">
      <h1>🧪 演示中心</h1>
      <p>体验各种AI功能演示</p>
    </div>
    
    <div class="demo-grid">
      <div class="demo-card" @click="navigateTo('/demo/expert-team')">
        <div class="demo-icon">🧠</div>
        <h3>动态专家团队</h3>
        <p>体验AI专家团队协作决策过程，支持活动管理和招生中心场景</p>
        <div class="demo-features">
          <span class="feature-tag">多专家协作</span>
          <span class="feature-tag">实时可视化</span>
          <span class="feature-tag">场景切换</span>
        </div>
        <div class="demo-status new">NEW</div>
      </div>
      
      <div class="demo-card" @click="navigateTo('/demo/circuit')">
        <div class="demo-icon">⚡</div>
        <h3>物理电路学习</h3>
        <p>交互式电路图和电阻概念动画演示，帮你理解物理电路原理</p>
        <div class="demo-features">
          <span class="feature-tag">动画演示</span>
          <span class="feature-tag">电路模拟</span>
          <span class="feature-tag">互动练习</span>
        </div>
        <div class="demo-status new">NEW</div>
      </div>

      <div class="demo-card" @click="navigateTo('/demo/kindergarten-ai')">
        <div class="demo-icon">🎨</div>
        <h3>幼儿园AI配图</h3>
        <p>AI智能生成幼儿园相关图片和配图内容</p>
        <div class="demo-features">
          <span class="feature-tag">图片生成</span>
          <span class="feature-tag">智能配图</span>
        </div>
        <div class="demo-status">DEMO</div>
      </div>
      
      <div class="demo-card coming-soon">
        <div class="demo-icon">🤖</div>
        <h3>智能页面操作</h3>
        <p>AI自动执行页面操作，模拟用户行为</p>
        <div class="demo-features">
          <span class="feature-tag">自动操作</span>
          <span class="feature-tag">可视化执行</span>
          <span class="feature-tag">错误处理</span>
        </div>
        <div class="demo-status coming">COMING SOON</div>
      </div>
      
      <div class="demo-card coming-soon">
        <div class="demo-icon">📊</div>
        <h3>智能数据分析</h3>
        <p>AI自动分析数据并生成洞察报告</p>
        <div class="demo-features">
          <span class="feature-tag">数据分析</span>
          <span class="feature-tag">智能洞察</span>
          <span class="feature-tag">报告生成</span>
        </div>
        <div class="demo-status coming">COMING SOON</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped lang="scss">
.demo-index {
  padding: var(--spacing-10xl) var(--text-2xl);
  max-width: 100%; max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-10xl);
  
  h1 {
    color: var(--text-primary);
    margin-bottom: var(--text-sm);
    font-size: 2.5rem;
  }
  
  p {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--text-3xl);
}

.demo-card {
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--text-lg);
  padding: var(--text-3xl);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  
  &:hover:not(.coming-soon) {
    border-color: var(--primary-color);
    transform: translateY(-var(--spacing-xs));
    box-shadow: 0 var(--spacing-sm) 25px var(--shadow-medium);
  }
  
  &.coming-soon {
    opacity: 0.6;
    cursor: not-allowed;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        var(--shadow-lighter) 10px,
        var(--shadow-lighter) var(--text-2xl)
      );
    }
  }
  
  .demo-icon {
    font-size: 3rem;
    margin-bottom: var(--text-lg);
    text-align: center;
  }
  
  h3 {
    color: var(--text-primary);
    margin-bottom: var(--text-sm);
    font-size: 1.3rem;
    font-weight: 600;
  }
  
  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: var(--text-lg);
  }
  
  .demo-features {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-bottom: var(--text-lg);
    
    .feature-tag {
      background: var(--bg-secondary);
      color: var(--text-primary);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--spacing-sm);
      font-size: 0.75rem;
      font-weight: 500;
    }
  }
  
  .demo-status {
    position: absolute;
    top: var(--text-lg);
    right: var(--text-lg);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--spacing-sm);
    font-size: 0.7rem;
    font-weight: 600;
    
    &.new {
      background: var(--success-color);
      color: white;
    }
    
    &:not(.new):not(.coming) {
      background: var(--primary-color);
      color: white;
    }
    
    &.coming {
      background: var(--warning-color);
      color: white;
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-header h1 {
    font-size: 2rem;
  }
}
</style>
