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
    padding: 0 var(--spacing-xl);
  }

  .hero-section {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
    color: var(--text-on-primary);
    padding: var(--spacing-3xl) var(--spacing-lg);
    text-align: center;

    h1 {
      font-size: var(--text-2xl);
      margin-bottom: var(--spacing-md);
      font-weight: 600;
    }

    .subtitle {
      font-size: var(--text-lg);
      margin-bottom: var(--spacing-2xl);
      opacity: 0.9;
    }
  }

  .features-section {
    padding: var(--spacing-3xl) 0;

    h2 {
      text-align: center;
      font-size: var(--text-2xl);
      margin-bottom: var(--spacing-2xl);
      color: var(--text-primary);
      font-weight: 600;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-xl);
      padding: 0 var(--spacing-lg);

      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }

      .feature-card {
        background: var(--bg-card);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
        text-align: center;
        box-shadow: var(--shadow-sm);
        transition: all 0.3s ease;
        min-height: 220px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        max-width: 100%;
        overflow: hidden;

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .feature-icon {
          font-size: var(--text-4xl);
          margin-bottom: var(--spacing-lg);
          line-height: 1;
          flex-shrink: 0;
        }

        h3 {
          margin-bottom: var(--spacing-md);
          color: var(--text-primary);
          font-size: var(--text-lg);
          font-weight: 600;
          width: 100%;
          word-wrap: break-word;
          word-break: keep-word;
          overflow-wrap: break-word;
        }

        p {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: var(--text-sm);
          width: 100%;
          max-width: 100%;
          word-wrap: break-word;
          word-break: keep-word;
          overflow-wrap: break-word;
          white-space: normal;
          text-align: center;
          overflow: hidden;
        }
      }
    }
  }

  .process-section {
    padding: var(--spacing-3xl) 0;
    background: var(--bg-card);

    h2 {
      text-align: center;
      font-size: var(--text-2xl);
      margin-bottom: var(--spacing-2xl);
      color: var(--text-primary);
      font-weight: 600;
    }

    .process-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-2xl);
      padding: 0 var(--spacing-lg);

      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }

      .step {
        text-align: center;
        padding: var(--spacing-lg);
        width: 100%;
        max-width: 100%;
        overflow: hidden;

        .step-number {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
          color: var(--text-on-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-lg);
          font-size: var(--text-xl);
          font-weight: 600;
          box-shadow: var(--shadow-md);
          flex-shrink: 0;
        }

        h3 {
          margin-bottom: var(--spacing-sm);
          color: var(--text-primary);
          font-size: var(--text-lg);
          font-weight: 600;
          width: 100%;
          word-wrap: break-word;
          word-break: keep-word;
          overflow-wrap: break-word;
        }

        p {
          color: var(--text-secondary);
          font-size: var(--text-sm);
          line-height: 1.5;
          width: 100%;
          word-wrap: break-word;
          word-break: keep-word;
          overflow-wrap: break-word;
          white-space: normal;
        }
      }
    }
  }
}
</style>





