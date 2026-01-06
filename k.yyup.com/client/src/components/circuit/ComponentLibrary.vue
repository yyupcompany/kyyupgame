<template>
  <div class="component-library">
    <h3>基础电路组件</h3>

    <div class="components-grid">
      <!-- 电源 -->
      <div class="component-card" @click="selectComponent('battery')">
        <div class="component-preview">
          <svg viewBox="0 0 100 60" width="100" height="60">
            <!-- 电池符号 -->
            <line x1="20" y1="20" x2="20" y2="40" stroke="#333" stroke-width="2"/>
            <line x1="80" y1="15" x2="80" y2="45" stroke="#333" stroke-width="4"/>
            <text x="30" y="35" font-size="12" fill="#666">DC</text>
            <text x="10" y="55" font-size="10" fill="#999">+</text>
            <text x="85" y="55" font-size="10" fill="#999">-</text>
          </svg>
        </div>
        <div class="component-info">
          <h4>电源</h4>
          <p>提供电压</p>
        </div>
      </div>

      <!-- 电阻 -->
      <div class="component-card" @click="selectComponent('resistor')">
        <div class="component-preview">
          <svg viewBox="0 0 100 60" width="100" height="60">
            <!-- 电阻符号 -->
            <line x1="10" y1="30" x2="25" y2="30" stroke="#333" stroke-width="2"/>
            <rect x="25" y="20" width="50" height="20" fill="none" stroke="#333" stroke-width="2"/>
            <line x1="75" y1="30" x2="90" y2="30" stroke="#333" stroke-width="2"/>
            <text x="35" y="35" font-size="10" fill="#666">R</text>
          </svg>
        </div>
        <div class="component-info">
          <h4>电阻</h4>
          <p>阻碍电流</p>
        </div>
      </div>

      <!-- 电容 -->
      <div class="component-card" @click="selectComponent('capacitor')">
        <div class="component-preview">
          <svg viewBox="0 0 100 60" width="100" height="60">
            <!-- 电容符号 -->
            <line x1="10" y1="30" x2="40" y2="30" stroke="#333" stroke-width="2"/>
            <line x1="40" y1="15" x2="40" y2="45" stroke="#333" stroke-width="2"/>
            <line x1="60" y1="15" x2="60" y2="45" stroke="#333" stroke-width="2"/>
            <line x1="60" y1="30" x2="90" y2="30" stroke="#333" stroke-width="2"/>
            <text x="45" y="15" font-size="10" fill="#666">C</text>
          </svg>
        </div>
        <div class="component-info">
          <h4>电容</h4>
          <p>存储电荷</p>
        </div>
      </div>

      <!-- 电感 -->
      <div class="component-card" @click="selectComponent('inductor')">
        <div class="component-preview">
          <svg viewBox="0 0 100 60" width="100" height="60">
            <!-- 电感符号 -->
            <line x1="10" y1="30" x2="20" y2="30" stroke="#333" stroke-width="2"/>
            <path d="M 20 30 Q 25 20, 30 30 T 40 30 T 50 30 T 60 30 T 70 30"
                  fill="none" stroke="#333" stroke-width="2"/>
            <line x1="70" y1="30" x2="90" y2="30" stroke="#333" stroke-width="2"/>
            <text x="40" y="15" font-size="10" fill="#666">L</text>
          </svg>
        </div>
        <div class="component-info">
          <h4>电感</h4>
          <p>存储磁能</p>
        </div>
      </div>

      <!-- 开关 -->
      <div class="component-card" @click="selectComponent('switch')">
        <div class="component-preview">
          <svg viewBox="0 0 100 60" width="100" height="60">
            <!-- 开关符号 -->
            <circle cx="25" cy="30" r="3" fill="#333"/>
            <circle cx="75" cy="30" r="3" fill="#333"/>
            <line x1="10" y1="30" x2="25" y2="30" stroke="#333" stroke-width="2"/>
            <line x1="28" y1="30" x2="70" y2="20" stroke="#333" stroke-width="2"/>
            <line x1="75" y1="30" x2="90" y2="30" stroke="#333" stroke-width="2"/>
            <text x="45" y="15" font-size="10" fill="#666">S</text>
          </svg>
        </div>
        <div class="component-info">
          <h4>开关</h4>
          <p>控制通断</p>
        </div>
      </div>

      <!-- 灯泡 -->
      <div class="component-card" @click="selectComponent('bulb')">
        <div class="component-preview">
          <svg viewBox="0 0 100 60" width="100" height="60">
            <!-- 灯泡符号 -->
            <circle cx="50" cy="25" r="15" fill="none" stroke="#333" stroke-width="2"/>
            <line x1="10" y1="25" x2="35" y2="25" stroke="#333" stroke-width="2"/>
            <line x1="65" y1="25" x2="90" y2="25" stroke="#333" stroke-width="2"/>
            <path d="M 50 40 L 45 45 L 55 45 Z" fill="#333"/>
            <text x="45" y="55" font-size="10" fill="#666">LAMP</text>
          </svg>
        </div>
        <div class="component-info">
          <h4>灯泡</h4>
          <p>发光元件</p>
        </div>
      </div>

      <!-- 电压表 -->
      <div class="component-card" @click="selectComponent('voltmeter')">
        <div class="component-preview">
          <svg viewBox="0 0 100 60" width="100" height="60">
            <!-- 电压表符号 -->
            <circle cx="50" cy="30" r="20" fill="none" stroke="#333" stroke-width="2"/>
            <text x="50" y="35" font-size="12" fill="#666" text-anchor="middle">V</text>
            <line x1="10" y1="20" x2="30" y2="20" stroke="#333" stroke-width="2"/>
            <line x1="70" y1="20" x2="90" y2="20" stroke="#333" stroke-width="2"/>
          </svg>
        </div>
        <div class="component-info">
          <h4>电压表</h4>
          <p>测量电压</p>
        </div>
      </div>

      <!-- 电流表 -->
      <div class="component-card" @click="selectComponent('ammeter')">
        <div class="component-preview">
          <svg viewBox="0 0 100 60" width="100" height="60">
            <!-- 电流表符号 -->
            <circle cx="50" cy="30" r="20" fill="none" stroke="#333" stroke-width="2"/>
            <text x="50" y="35" font-size="12" fill="#666" text-anchor="middle">A</text>
            <line x1="10" y1="30" x2="30" y2="30" stroke="#333" stroke-width="2"/>
            <line x1="70" y1="30" x2="90" y2="30" stroke="#333" stroke-width="2"/>
          </svg>
        </div>
        <div class="component-info">
          <h4>电流表</h4>
          <p>测量电流</p>
        </div>
      </div>
    </div>

    <!-- 组件详情面板 -->
    <div v-if="selectedComponent" class="component-details">
      <h4>{{ getComponentName(selectedComponent) }}</h4>
      <div class="details-content">
        <div class="description">
          <p><strong>作用：</strong>{{ getComponentDescription(selectedComponent) }}</p>
          <p><strong>单位：</strong>{{ getComponentUnit(selectedComponent) }}</p>
          <p><strong>符号：</strong>{{ getComponentSymbol(selectedComponent) }}</p>
        </div>
        <div class="formula" v-if="getComponentFormula(selectedComponent)">
          <strong>相关公式：</strong>
          <div class="formula-display">{{ getComponentFormula(selectedComponent) }}</div>
        </div>
        <div class="applications" v-if="getComponentApplications(selectedComponent)">
          <strong>应用场景：</strong>
          <ul>
            <li v-for="app in getComponentApplications(selectedComponent)" :key="app">{{ app }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedComponent = ref('')

const emit = defineEmits(['component-selected'])

const selectComponent = (component: string) => {
  selectedComponent.value = component
  emit('component-selected', component)
}

const getComponentName = (component: string): string => {
  const names: Record<string, string> = {
    battery: '直流电源',
    resistor: '电阻器',
    capacitor: '电容器',
    inductor: '电感器',
    switch: '开关',
    bulb: '灯泡',
    voltmeter: '电压表',
    ammeter: '电流表'
  }
  return names[component] || component
}

const getComponentDescription = (component: string): string => {
  const descriptions: Record<string, string> = {
    battery: '提供稳定的直流电压，是电路的能量来源',
    resistor: '限制电流通过，产生电压降，消耗电能转化为热能',
    capacitor: '存储电荷能量，隔直流通交流，用于滤波和耦合',
    inductor: '存储磁能，阻碍电流变化，用于滤波和储能',
    switch: '控制电路的通断状态',
    bulb: '将电能转化为光能的发光元件',
    voltmeter: '并联在电路中测量两点间的电压差',
    ammeter: '串联在电路中测量通过导体的电流'
  }
  return descriptions[component] || ''
}

const getComponentUnit = (component: string): string => {
  const units: Record<string, string> = {
    battery: '伏特 (V)',
    resistor: '欧姆 (Ω)',
    capacitor: '法拉 (F)',
    inductor: '亨利 (H)',
    switch: '无单位',
    bulb: '瓦特 (W)',
    voltmeter: '伏特 (V)',
    ammeter: '安培 (A)'
  }
  return units[component] || ''
}

const getComponentSymbol = (component: string): string => {
  const symbols: Record<string, string> = {
    battery: 'E 或 V',
    resistor: 'R',
    capacitor: 'C',
    inductor: 'L',
    switch: 'S',
    bulb: 'Rₗ',
    voltmeter: 'V',
    ammeter: 'A'
  }
  return symbols[component] || ''
}

const getComponentFormula = (component: string): string => {
  const formulas: Record<string, string> = {
    resistor: 'V = I × R',
    capacitor: 'Q = C × V',
    inductor: 'V = L × (di/dt)',
    bulb: 'P = V × I = I²R'
  }
  return formulas[component] || ''
}

const getComponentApplications = (component: string): string[] => {
  const applications: Record<string, string[]> = {
    resistor: ['限流保护', '分压电路', '偏置电路', '负载电阻'],
    capacitor: ['电源滤波', '信号耦合', '时间延迟', '储能电路'],
    inductor: ['电源滤波', '变压器', '电机线圈', '储能电路'],
    bulb: ['照明设备', '指示灯', '显示设备'],
    switch: ['电源控制', '信号切换', '保护电路']
  }
  return applications[component] || []
}
</script>

<style scoped lang="scss">
.component-library {
  width: 100%;
}

h3 {
  text-align: center;
  margin-bottom: var(--spacing-4xl);
  color: #333;
  font-size: 1.5rem;
}

.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-4xl);
}

.component-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: var(--spacing-md);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    border-color: #007bff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  }

  &.selected {
    border-color: #007bff;
    background: rgba(0, 123, 255, 0.05);
  }
}

.component-preview {
  margin-bottom: var(--spacing-sm);

  svg {
    width: 100%;
    height: auto;
  }
}

.component-info {
  h4 {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: var(--text-sm);
    color: #333;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: var(--text-xs);
    color: #666;
  }
}

.component-details {
  background: rgba(0, 123, 255, 0.05);
  border: 1px solid rgba(0, 123, 255, 0.2);
  border-radius: var(--spacing-md);
  padding: var(--spacing-lg);

  h4 {
    margin: 0 0 var(--spacing-md) 0;
    color: #007bff;
    font-size: 1.2rem;
  }
}

.details-content {
  .description {
    margin-bottom: var(--spacing-lg);

    p {
      margin: var(--spacing-xs) 0;
      line-height: 1.5;

      strong {
        color: #333;
      }
    }
  }

  .formula {
    margin-bottom: var(--spacing-lg);

    strong {
      color: #333;
      display: block;
      margin-bottom: var(--spacing-xs);
    }

    .formula-display {
      background: #f8f9fa;
      padding: var(--spacing-md);
      border-radius: var(--spacing-sm);
      font-family: 'Courier New', monospace;
      font-size: var(--text-sm);
      color: #007bff;
      text-align: center;
      font-weight: 600;
    }
  }

  .applications {
    strong {
      color: #333;
      display: block;
      margin-bottom: var(--spacing-xs);
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

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
  .components-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: var(--spacing-md);
  }

  .component-card {
    padding: var(--spacing-sm);
  }
}
</style>