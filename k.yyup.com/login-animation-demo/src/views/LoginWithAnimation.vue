<template>
  <div class="login-demo">
    <div class="demo-controls">
      <button @click="toggleAnimation" class="demo-btn control-btn">
        {{ showAnimation ? '隐藏动画' : '显示随机动画' }}
      </button>
      <div class="animation-selector">
        <label>选择动画类型：</label>
        <select v-model="selectedType" @change="changeAnimationType">
          <option value="random">🎲 随机动画</option>
          <option value="blocks">🔳 3D方块</option>
          <option value="gsap-cards">🎴 GSAP卡片</option>
          <option value="particle-wave">🌊 粒子波浪</option>
          <option value="matrix-blocks">🏢️ 方块矩阵</option>
          <option value="helix-spiral">🌀 螺旋3D</option>
          <option value="cube-explosion">💥 立方体爆炸</option>
          <option value="liquid-flow">💧 液体流动</option>
          <option value="neon-grid">🌐 霓虹网格</option>
        </select>
      </div>
      <button @click="triggerRandomAnimation" class="demo-btn random-btn" :disabled="showAnimation">
        🎲 触发随机动画
      </button>
    </div>

    <!-- 模拟登录表单 -->
    <div class="login-form">
      <div class="form-header">
        <h1>系统登录</h1>
        <p>智能管理平台 v2.0</p>
      </div>

      <div class="form-body">
        <div class="form-group">
          <label>用户名</label>
          <input
            type="text"
            v-model="formData.username"
            placeholder="请输入用户名"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            type="password"
            v-model="formData.password"
            placeholder="请输入密码"
            class="form-input"
            @keyup.enter="handleLogin"
          />
        </div>

        <div class="form-actions">
          <button @click="handleLogin" class="login-btn" :disabled="isLogging">
            {{ isLogging ? '登录中...' : '登录系统' }}
          </button>
        </div>

        <div class="form-footer">
          <a href="#" class="forgot-password">忘记密码？</a>
          <span class="separator">|</span>
          <a href="#" class="register-link">注册账号</a>
        </div>
      </div>
    </div>

    <!-- 入场动画 -->
    <EntranceAnimationWrapper
      :show="showAnimation"
      :type="selectedType"
      @complete="onAnimationComplete"
    />

    <!-- 提示信息 -->
    <div v-if="showMessage" class="message-toast">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EntranceAnimationWrapper from '@/components/EntranceAnimationWrapper.vue'

const showAnimation = ref(false)
const selectedType = ref<'random' | 'blocks' | 'gsap-cards' | 'particle-wave' | 'matrix-blocks' | 'helix-spiral' | 'cube-explosion' | 'liquid-flow' | 'neon-grid'>('random')
const isLogging = ref(false)
const message = ref('')
const showMessage = ref(false)

// 表单数据
const formData = ref({
  username: '',
  password: ''
})

const toggleAnimation = () => {
  showAnimation.value = !showAnimation.value
}

const changeAnimationType = () => {
  if (showAnimation.value) {
    // 如果当前有动画，先隐藏再显示新的
    showAnimation.value = false
    setTimeout(() => {
      showAnimation.value = true
    }, 300)
  }
}

const triggerRandomAnimation = () => {
  if (showAnimation.value) return

  // 随机选择动画类型
  const types: Array<'random' | 'blocks' | 'gsap-cards' | 'particle-wave' | 'matrix-blocks' | 'helix-spiral' | 'cube-explosion' | 'liquid-flow' | 'neon-grid'> = [
    'random', 'blocks', 'gsap-cards', 'particle-wave', 'matrix-blocks',
    'helix-spiral', 'cube-explosion', 'liquid-flow', 'neon-grid'
  ]
  selectedType.value = types[Math.floor(Math.random() * types.length)]

  showAnimation.value = true
}

const onAnimationComplete = () => {
  console.log('登录入场动画完成')
}

const handleLogin = async () => {
  if (!formData.value.username || !formData.value.password) {
    showToast('请填写用户名和密码')
    return
  }

  isLogging.value = true

  // 模拟登录过程
  setTimeout(() => {
    isLogging.value = false
    showToast(`登录成功！欢迎 ${formData.value.username}`)

    // 清空表单
    formData.value = {
      username: '',
      password: ''
    }
  }, 1500)
}

const showToast = (msg: string) => {
  message.value = msg
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

// 页面加载时显示随机动画
const showInitialAnimation = () => {
  // 延迟500ms后显示动画
  setTimeout(() => {
    showAnimation.value = true
  }, 500)
}

// 组件挂载时显示初始动画
showInitialAnimation()
</script>

<style scoped lang="scss">
.login-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.demo-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;

  .control-btn {
    padding: 0.8rem 1.2rem;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }

    &.random-btn {
      background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
    }
  }

  .animation-selector {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
      color: white;
      font-size: 0.9rem;
    }

    select {
      width: 160px;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 0.25rem;
      color: white;
      font-size: 0.85rem;
      cursor: pointer;

      option {
        background: #667eea;
        color: white;
      }
    }
  }
}

.login-form {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 3rem;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);

  .form-header {
    text-align: center;
    margin-bottom: 2rem;

    h1 {
      color: white;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1rem;
    }
  }

  .form-body {
    .form-group {
      margin-bottom: 1.5rem;

      label {
        display: block;
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .form-input {
        width: 100%;
        padding: 0.8rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 0.5rem;
        color: white;
        font-size: 1rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.15);
        }

        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      }
    }

    .form-actions {
      margin-bottom: 1.5rem;

      .login-btn {
        width: 100%;
        padding: 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 0.5rem;
        color: white;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    .form-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      font-size: 0.9rem;

      a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: all 0.3s ease;

        &:hover {
          color: white;
        }
      }

      .separator {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

.message-toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  backdrop-filter: blur(10px);
  z-index: 10001;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .demo-controls {
    top: 10px;
    right: 10px;
    gap: 0.5rem;

    .control-btn {
      padding: 0.6rem 1rem;
      font-size: 0.8rem;
    }

    .animation-selector {
      padding: 0.8rem;

      label {
        font-size: 0.8rem;
      }

      select {
        width: 140px;
        padding: 0.4rem;
        font-size: 0.8rem;
      }
    }
  }

  .login-form {
    padding: 2rem;

    .form-header {
      h1 {
        font-size: 1.5rem;
      }

      p {
        font-size: 0.9rem;
      }
    }
  }
}
</style>