<template>
  <div class="circuit-demo">
    <div class="demo-header">
      <h1>⚡ 物理电路学习助手</h1>
      <p>通过交互式动画理解电路图和电阻概念</p>
      <div class="mode-selector">
        <el-button
          :type="currentMode === 'learn' ? 'primary' : 'default'"
          @click="currentMode = 'learn'"
          size="large"
        >
          📚 学习模式
        </el-button>
        <el-button
          :type="currentMode === 'practice' ? 'primary' : 'default'"
          @click="currentMode = 'practice'"
          size="large"
        >
          ✏️ 练习模式
        </el-button>
        <el-button
          :type="currentMode === 'simulation' ? 'primary' : 'default'"
          @click="currentMode = 'simulation'"
          size="large"
        >
          🔬 模拟模式
        </el-button>
      </div>
    </div>

    <!-- 学习模式 -->
    <div v-if="currentMode === 'learn'" class="learn-mode">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card title="电阻概念动画" class="concept-card">
            <ResistanceAnimation />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card title="基础电路组件" class="components-card">
            <ComponentLibrary />
          </el-card>
        </el-col>
      </el-row>

      <el-card title="欧姆定律演示" class="ohms-law-card">
        <OhmsLawDemo />
      </el-card>
    </div>

    <!-- 练习模式 -->
    <div v-if="currentMode === 'practice'" class="practice-mode">
      <el-card title="电路图练习" class="practice-card">
        <CircuitPractice />
      </el-card>
    </div>

    <!-- 模拟模式 -->
    <div v-if="currentMode === 'simulation'" class="simulation-mode">
      <el-row :gutter="24">
        <el-col :span="16">
          <el-card title="电路模拟器" class="simulator-card">
            <CircuitSimulator
              v-model:circuit="circuitData"
              @simulation-update="handleSimulationUpdate"
            />
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card title="实时数据" class="data-card">
            <SimulationData :simulation-data="simulationData" />
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 公式参考面板 -->
    <div class="formula-panel">
      <el-card title="常用公式" size="small">
        <FormulaReference />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ResistanceAnimation from '@/components/circuit/ResistanceAnimation.vue'
import ComponentLibrary from '@/components/circuit/ComponentLibrary.vue'
import OhmsLawDemo from '@/components/circuit/OhmsLawDemo.vue'
import CircuitPractice from '@/components/circuit/CircuitPractice.vue'
import CircuitSimulator from '@/components/circuit/CircuitSimulator.vue'
import SimulationData from '@/components/circuit/SimulationData.vue'
import FormulaReference from '@/components/circuit/FormulaReference.vue'

const currentMode = ref('learn')

const circuitData = reactive({
  components: [],
  connections: [],
  voltage: 0,
  frequency: 0
})

const simulationData = reactive({
  current: 0,
  resistance: 0,
  power: 0,
  voltage: 0,
  temperature: 0
})

const handleSimulationUpdate = (data: any) => {
  Object.assign(simulationData, data)
}
</script>

<style scoped lang="scss">
.circuit-demo {
  padding: var(--spacing-10xl);
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--spacing-10xl);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: var(--spacing-4xl);
  border-radius: var(--text-xl);

  h1 {
    color: white;
    margin-bottom: var(--text-sm);
    font-size: 2.5rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
    margin-bottom: var(--text-2xl);
  }
}

.mode-selector {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;

  .el-button {
    min-width: 140px;
    height: 50px;
    font-size: 1rem;
    border-radius: var(--text-lg);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }
}

.learn-mode, .practice-mode, .simulation-mode {
  .el-card {
    margin-bottom: var(--spacing-4xl);
    border-radius: var(--text-xl);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

    :deep(.el-card__header) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      font-size: 1.2rem;
    }

    :deep(.el-card__body) {
      padding: var(--spacing-4xl);
    }
  }
}

.concept-card, .components-card {
  :deep(.el-card__body) {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.ohms-law-card {
  :deep(.el-card__body) {
    min-height: 300px;
  }
}

.practice-card, .simulator-card {
  :deep(.el-card__body) {
    min-height: 500px;
  }
}

.data-card {
  :deep(.el-card__body) {
    min-height: 500px;
  }
}

.formula-panel {
  position: fixed;
  right: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  width: 250px;
  z-index: 1000;

  .el-card {
    border-radius: var(--text-lg);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

    :deep(.el-card__header) {
      background: var(--primary-color);
      color: white;
      font-size: 1rem;
      padding: var(--spacing-md) var(--spacing-lg);
    }

    :deep(.el-card__body) {
      padding: var(--spacing-lg);
    }
  }
}

@media (max-width: 1200px) {
  .formula-panel {
    position: static;
    transform: none;
    width: 100%;
    margin-top: var(--spacing-4xl);
  }
}

@media (max-width: var(--breakpoint-md)) {
  .circuit-demo {
    padding: var(--spacing-4xl) var(--spacing-lg);
  }

  .demo-header {
    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
    }
  }

  .mode-selector {
    .el-button {
      min-width: 100px;
      height: 45px;
      font-size: 0.9rem;
    }
  }

  .formula-panel {
    display: none;
  }
}
</style>