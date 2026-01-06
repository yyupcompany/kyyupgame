<template>
  <div class="assessment-index-page">
    <div class="hero-section">
      <div class="container">
        <h1>2-6岁儿童发育商测评</h1>
        <p class="subtitle">免费测评，专业报告，助力孩子成长</p>
        <el-button type="primary" size="large" @click="startAssessment">
          立即开始测评
        </el-button>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2>测评特色</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>多维度评估</h3>
            <p>专注力、记忆力、逻辑思维、语言能力、精细动作、社交能力</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎮</div>
            <h3>互动游戏</h3>
            <p>通过趣味游戏测评，让孩子在玩乐中完成评估</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>AI智能分析</h3>
            <p>专业AI生成个性化报告和成长建议</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>成长追踪</h3>
            <p>记录每次测评结果，追踪孩子成长轨迹</p>
          </div>
        </div>
      </div>
    </div>

    <div class="process-section">
      <div class="container">
        <h2>测评流程</h2>
        <div class="process-steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>填写信息</h3>
            <p>输入孩子基本信息</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>开始测评</h3>
            <p>完成问答和互动游戏</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>生成报告</h3>
            <p>AI智能生成专业报告</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>查看结果</h3>
            <p>查看报告并分享给朋友</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startAssessment = () => {
  router.push('/parent-center/assessment/start')
}
</script>

<style scoped lang="scss">
.assessment-index-page {
  min-height: 100vh;
  background: var(--bg-hover);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--text-2xl);
  }

  .hero-section {
    background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
    color: white;
    padding: var(--spacing-20xl) var(--text-2xl);
    text-align: center;

    h1 {
      font-size: var(--text-5xl);
      margin-bottom: var(--text-2xl);
    }

    .subtitle {
      font-size: var(--text-3xl);
      margin-bottom: var(--spacing-10xl);
      opacity: 0.9;
    }
  }

  .features-section {
    padding: var(--spacing-20xl) var(--text-2xl);

    h2 {
      text-align: center;
      font-size: var(--text-4xl);
      margin-bottom: var(--spacing-15xl);
      color: var(--text-primary);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-8xl);

      .feature-card {
        background: white;
        padding: var(--spacing-10xl) 30px;
        border-radius: var(--spacing-sm);
        text-align: center;
        box-shadow: 0 2px var(--text-sm) var(--shadow-light);
        transition: transform 0.3s;

        &:hover {
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: var(--text-5xl);
          margin-bottom: var(--text-2xl);
        }

        h3 {
          margin-bottom: var(--spacing-4xl);
          color: var(--text-primary);
        }

        p {
          color: var(--text-secondary);
          line-height: 1.6;
        }
      }
    }
  }

  .process-section {
    padding: var(--spacing-20xl) var(--text-2xl);
    background: white;

    h2 {
      text-align: center;
      font-size: var(--text-4xl);
      margin-bottom: var(--spacing-15xl);
      color: var(--text-primary);
    }

    .process-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-8xl);

      .step {
        text-align: center;

        .step-number {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary-color) 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-3xl);
          font-weight: bold;
          margin: 0 auto var(--text-2xl);
        }

        h3 {
          margin-bottom: var(--spacing-2xl);
          color: var(--text-primary);
        }

        p {
          color: var(--text-secondary);
        }
      }
    }
  }
}
</style>





