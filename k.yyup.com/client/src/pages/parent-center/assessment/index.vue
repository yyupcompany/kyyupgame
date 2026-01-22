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
/* 使用设计令牌 */

/* ==================== 测评首页容器 ==================== */
.assessment-index-page {
  min-height: 100vh;
  background: var(--el-fill-color-light);

  .container {
    max-width: var(--breakpoint-xl);
    margin: 0 auto;
    padding: 0 var(--spacing-xl);
  }

  /* ==================== 英雄区域 ==================== */
  .hero-section {
    background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    color: white;
    padding: var(--spacing-3xl) var(--spacing-lg);
    text-align: center;
    border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);

    h1 {
      font-size: var(--text-2xl);
      margin-bottom: var(--spacing-md);
      font-weight: 600;
    }

    .subtitle {
      font-size: var(--text-lg);
      margin-bottom: var(--spacing-2xl);
      opacity: 0.9;
      line-height: var(--leading-relaxed);
    }

    :deep(.el-button--primary) {
      --el-button-bg-color: white;
      --el-button-border-color: white;
      --el-button-text-color: var(--el-color-primary);
      --el-button-hover-bg-color: var(--el-fill-color);
      --el-button-hover-border-color: white;
      font-weight: 600;
      padding: var(--spacing-md) var(--spacing-2xl);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }
    }
  }

  /* ==================== 特色功能区域 ==================== */
  .features-section {
    padding: var(--spacing-3xl) 0;

    h2 {
      text-align: center;
      font-size: var(--text-xl);
      margin-bottom: var(--spacing-2xl);
      color: var(--el-text-color-primary);
      font-weight: 600;

      &::after {
        content: '';
        display: block;
        width: 60px;
        height: 3px;
        background: var(--el-color-primary);
        margin: var(--spacing-sm) auto 0;
        border-radius: 2px;
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--spacing-lg);
      padding: 0 var(--spacing-md);

      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }

      .feature-card {
        background: var(--bg-card);
        padding: var(--spacing-xl);
        border-radius: var(--radius-lg);
        text-align: center;
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-base);
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        border: 1px solid var(--border-color-lighter);

        &:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--el-color-primary-light-3);
        }

        .feature-icon {
          font-size: var(--text-3xl);
          margin-bottom: var(--spacing-md);
          line-height: 1;
        }

        h3 {
          margin-bottom: var(--spacing-sm);
          color: var(--el-text-color-primary);
          font-size: var(--text-base);
          font-weight: 600;
        }

        p {
          color: var(--el-text-color-secondary);
          line-height: var(--leading-normal);
          font-size: var(--text-sm);
          margin: 0;
        }
      }
    }
  }

  /* ==================== 测评流程区域 ==================== */
  .process-section {
    padding: var(--spacing-3xl) 0;
    background: var(--bg-card);
    border-top: 1px solid var(--border-color-lighter);

    h2 {
      text-align: center;
      font-size: var(--text-xl);
      margin-bottom: var(--spacing-2xl);
      color: var(--el-text-color-primary);
      font-weight: 600;

      &::after {
        content: '';
        display: block;
        width: 60px;
        height: 3px;
        background: var(--el-color-primary);
        margin: var(--spacing-sm) auto 0;
        border-radius: 2px;
      }
    }

    .process-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: var(--spacing-lg);
      padding: 0 var(--spacing-md);

      @media (max-width: var(--breakpoint-md)) {
        grid-template-columns: 1fr;
      }

      .step {
        text-align: center;
        padding: var(--spacing-lg);

        .step-number {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--spacing-md);
          font-size: var(--text-lg);
          font-weight: 600;
          box-shadow: var(--shadow-md);
          flex-shrink: 0;
        }

        h3 {
          margin-bottom: var(--spacing-xs);
          color: var(--el-text-color-primary);
          font-size: var(--text-base);
          font-weight: 600;
        }

        p {
          color: var(--el-text-color-secondary);
          font-size: var(--text-sm);
          line-height: var(--leading-normal);
          margin: 0;
        }
      }
    }
  }

  /* ==================== 响应式设计 ==================== */
  @media (max-width: var(--breakpoint-md)) {
    .hero-section {
      padding: var(--spacing-2xl) var(--spacing-md);

      h1 {
        font-size: var(--text-xl);
      }

      .subtitle {
        font-size: var(--text-base);
        margin-bottom: var(--spacing-lg);
      }
    }

    .features-section,
    .process-section {
      padding: var(--spacing-2xl) 0;

      h2 {
        font-size: var(--text-lg);
        margin-bottom: var(--spacing-lg);
      }
    }
  }
}
</style>





