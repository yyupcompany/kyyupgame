<template>
  <div class="resistance-animation">
    <div class="animation-controls">
      <el-button @click="playAnimation" type="primary" size="small">
        ▶️ 播放动画
      </el-button>
      <el-button @click="pauseAnimation" size="small">
        ⏸️ 暂停
      </el-button>
      <el-button @click="resetAnimation" size="small">
        🔄 重置
      </el-button>
    </div>

    <div class="animation-stage">
      <!-- 电流流动动画 -->
      <div class="current-flow">
        <div class="wire" ref="wireElement">
          <div class="electrons" :class="{ 'flowing': isAnimating }">
            <div
              v-for="i in 8"
              :key="i"
              class="electron"
              :style="{ animationDelay: `${i * 0.2}s` }"
            >
              e⁻
            </div>
          </div>
        </div>
      </div>

      <!-- 电阻器可视化 -->
      <div class="resistor-visual">
        <div class="resistor-body" :class="{ 'heating': isAnimating }">
          <div class="resistor-pattern">
            <div class="color-band" style="background: #8B4513;"></div>
            <div class="color-band" style="background: #000000;"></div>
            <div class="color-band" style="background: #FF0000;"></div>
            <div class="color-band" style="background: #FFD700;"></div>
          </div>
          <div class="resistance-value">1kΩ ±5%</div>
        </div>

        <!-- 热量动画 -->
        <div v-if="isAnimating" class="heat-waves">
          <div class="heat-wave" v-for="i in 3" :key="i" :style="{ animationDelay: `${i * 0.3}s` }"></div>
        </div>
      </div>

      <!-- 电压和电流显示 -->
      <div class="measurements">
        <div class="voltage-display">
          <span class="label">电压 (V):</span>
          <span class="value">{{ voltage }}V</span>
        </div>
        <div class="current-display">
          <span class="label">电流 (I):</span>
          <span class="value">{{ current }}mA</span>
        </div>
        <div class="resistance-display">
          <span class="label">电阻 (R):</span>
          <span class="value">1000Ω</span>
        </div>
      </div>

      <!-- 公式显示 -->
      <div class="formula-display">
        <div class="formula">
          V = I × R
        </div>
        <div class="calculation">
          {{ voltage }}V = {{ current }}mA × 1000Ω
        </div>
      </div>
    </div>

    <!-- 概念解释 -->
    <div class="concept-explanation">
      <el-collapse v-model="activeCollapse">
        <el-collapse-item title="🔌 什么是电阻？" name="resistance">
          <div class="explanation-content">
            <p>电阻是导体对电流的阻碍作用。就像水管中的狭窄部分会阻碍水流一样，电阻会阻碍电子的流动。</p>
            <ul>
              <li><strong>单位：</strong>欧姆 (Ω)</li>
              <li><strong>符号：</strong>R</li>
              <li><strong>作用：</strong>控制电流大小，保护电路</li>
            </ul>
          </div>
        </el-collapse-item>

        <el-collapse-item title="⚡ 电流是如何流动的？" name="current">
          <div class="explanation-content">
            <p>电流是电荷的定向移动。在金属导体中，自由电子在电场作用下定向移动形成电流。</p>
            <ul>
              <li><strong>方向：</strong>从正极流向负极（惯例）</li>
              <li><strong>实际：</strong>电子从负极流向正极</li>
              <li><strong>速度：</strong>电子漂移速度很慢，但电场传播速度接近光速</li>
            </ul>
          </div>
        </el-collapse-item>

        <el-collapse-item title="🌡️ 为什么电阻会发热？" name="heat">
          <div class="explanation-content">
            <p>当电子通过电阻时，会与原子碰撞，动能转化为热能，这就是焦耳热效应。</p>
            <ul>
              <li><strong>公式：</strong>P = I²R (功率 = 电流² × 电阻)</li>
              <li><strong>应用：</strong>电暖器、电烙铁、白炽灯</li>
              <li><strong>注意：</strong>大功率电阻需要散热</li>
            </ul>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isAnimating = ref(false)
const voltage = ref(5)
const current = ref(5)
const activeCollapse = ref(['resistance'])
const wireElement = ref<HTMLElement>()
let animationInterval: number | null = null

const playAnimation = () => {
  isAnimating.value = true
  startSimulation()
}

const pauseAnimation = () => {
  isAnimating.value = false
  stopSimulation()
}

const resetAnimation = () => {
  isAnimating.value = false
  voltage.value = 5
  current.value = 5
  stopSimulation()
}

const startSimulation = () => {
  let step = 0
  animationInterval = setInterval(() => {
    step++
    // 模拟电压变化
    voltage.value = 5 + Math.sin(step * 0.1) * 2
    // 根据欧姆定律计算电流 (V = IR, 所以 I = V/R)
    current.value = (voltage.value / 1000) * 1000 // 转换为mA
  }, 100)
}

const stopSimulation = () => {
  if (animationInterval) {
    clearInterval(animationInterval)
    animationInterval = null
  }
}

onUnmounted(() => {
  stopSimulation()
})
</script>

<style scoped lang="scss">
.resistance-animation {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.animation-controls {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin-bottom: var(--spacing-4xl);
}

.animation-stage {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--text-lg);
  padding: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
  position: relative;
  min-height: 300px;
}

.current-flow {
  margin-bottom: var(--spacing-4xl);

  .wire {
    height: 40px;
    background: linear-gradient(90deg, #666 0%, #888 50%, #666 100%);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

    .electrons {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 20px;

      .electron {
        position: absolute;
        color: #00ff00;
        font-weight: bold;
        font-size: var(--text-sm);
        text-shadow: 0 0 4px #00ff00;
        opacity: 0.8;

        &.flowing {
          animation: flowElectron 2s linear infinite;
        }
      }
    }
  }
}

@keyframes flowElectron {
  0% {
    left: -20px;
  }
  100% {
    left: calc(100% + 20px);
  }
}

.resistor-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
  position: relative;

  .resistor-body {
    width: 200px;
    height: 60px;
    background: linear-gradient(90deg, #D2B48C 0%, #DEB887 50%, #D2B48C 100%);
    border: 2px solid #8B4513;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &.heating {
      background: linear-gradient(90deg, #DEB887 0%, #F4A460 50%, #DEB887 100%);
      box-shadow: 0 4px 12px rgba(255, 100, 0, 0.3);
    }

    .resistor-pattern {
      display: flex;
      gap: var(--spacing-sm);

      .color-band {
        width: 12px;
        height: 40px;
        border-radius: 2px;
        border: 1px solid rgba(0, 0, 0, 0.2);
      }
    }

    .resistance-value {
      position: absolute;
      bottom: -25px;
      font-size: var(--text-xs);
      color: #666;
      font-weight: 600;
    }
  }

  .heat-waves {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 5px;

    .heat-wave {
      width: 220px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #ff6b6b, transparent);
      border-radius: 1px;
      animation: heatWave 2s ease-out infinite;
    }
  }
}

@keyframes heatWave {
  0% {
    opacity: 0;
    transform: scaleX(0.5);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(1.2) translateY(-10px);
  }
}

.measurements {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-4xl);

  .voltage-display, .current-display, .resistance-display {
    background: rgba(255, 255, 255, 0.1);
    padding: var(--spacing-md);
    border-radius: var(--spacing-md);
    text-align: center;

    .label {
      display: block;
      font-size: var(--text-xs);
      color: #999;
      margin-bottom: 4px;
    }

    .value {
      display: block;
      font-size: var(--text-lg);
      font-weight: bold;
      color: #fff;
    }
  }
}

.formula-display {
  background: rgba(0, 123, 255, 0.1);
  border-left: 4px solid #007bff;
  padding: var(--spacing-lg);
  border-radius: var(--spacing-md);

  .formula {
    font-size: var(--text-xl);
    font-weight: bold;
    color: #007bff;
    margin-bottom: var(--spacing-sm);
    text-align: center;
  }

  .calculation {
    font-size: var(--text-sm);
    color: #666;
    text-align: center;
  }
}

.concept-explanation {
  .el-collapse {
    border: none;

    :deep(.el-collapse-item__header) {
      background: rgba(255, 255, 255, 0.1);
      color: #333;
      font-weight: 600;
      border-radius: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      padding: 0 var(--spacing-lg);

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }

    :deep(.el-collapse-item__content) {
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--spacing-md);
      padding: var(--spacing-lg);
    }
  }

  .explanation-content {
    p {
      margin-bottom: var(--spacing-md);
      line-height: 1.6;
      color: #666;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        padding: var(--spacing-xs) 0;
        color: #666;
        position: relative;
        padding-left: var(--spacing-lg);

        &:before {
          content: "•";
          color: #007bff;
          position: absolute;
          left: 0;
          font-weight: bold;
        }
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .measurements {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .resistor-visual .resistor-body {
    width: 160px;
    height: 50px;
  }

  .animation-controls {
    flex-wrap: wrap;
  }
}
</style>