<template>
  <div class="demo-view">
    <div class="demo-controls">
      <button @click="startAnimation" class="demo-btn">重新播放动画</button>
      <button @click="goToNext" class="demo-btn next-btn">下一个动画 →</button>
    </div>

    <BlocksAnimation
      :show="showAnimation"
      @complete="onAnimationComplete"
    />

    <div v-if="!showAnimation" class="demo-content">
      <h2>CSS 3D方块动画</h2>
      <div class="feature-list">
        <div class="feature-item">✨ 纯CSS 3D transforms实现</div>
        <div class="feature-item">🎯 横向方块旋转入场效果</div>
        <div class="feature-item">🌈 渐变背景设计</div>
        <div class="feature-item">📊 实时进度条显示</div>
        <div class="feature-item">🎨 6个业务模块展示</div>
        <div class="feature-item">📱 响应式设计支持</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BlocksAnimation from '@/components/animations/BlocksAnimation.vue'

const router = useRouter()
const showAnimation = ref(false)

const startAnimation = () => {
  showAnimation.value = false
  setTimeout(() => {
    showAnimation.value = true
  }, 100)
}

const onAnimationComplete = () => {
  console.log('动画完成')
  setTimeout(() => {
    showAnimation.value = false
  }, 1000)
}

const goToNext = () => {
  router.push('/gsap-cards')
}

onMounted(() => {
  setTimeout(() => {
    showAnimation.value = true
  }, 500)
})
</script>

<style scoped lang="scss">
.demo-view {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-controls {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .demo-btn {
    padding: 0.8rem 1.5rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    &.next-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }
}

.demo-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 3rem;
  max-width: 600px;
  text-align: center;
  color: white;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .feature-list {
    display: grid;
    gap: 1rem;

    .feature-item {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 0.5rem;
      font-size: 1.1rem;
      text-align: left;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateX(5px);
      }
    }
  }
}

@media (max-width: 768px) {
  .demo-controls {
    top: 80px;
    right: 10px;

    .demo-btn {
      padding: 0.6rem 1rem;
      font-size: 0.8rem;
    }
  }

  .demo-content {
    padding: 2rem;
    margin: 0 1rem;

    h2 {
      font-size: 2rem;
    }

    .feature-list {
      .feature-item {
        font-size: 1rem;
      }
    }
  }
}
</style>