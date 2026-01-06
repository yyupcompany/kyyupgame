<template>
  <div class="circuit-simulator">
    <div class="toolbar">
      <el-button-group>
        <el-button @click="setMode('select')" :type="mode === 'select' ? 'primary' : 'default'" size="small">
          👆 选择
        </el-button>
        <el-button @click="setMode('wire')" :type="mode === 'wire' ? 'primary' : 'default'" size="small">
          📏 导线
        </el-button>
        <el-button @click="addComponent('battery')" size="small">
          🔋 电源
        </el-button>
        <el-button @click="addComponent('resistor')" size="small">
          🔧 电阻
        </el-button>
        <el-button @click="addComponent('bulb')" size="small">
          💡 灯泡
        </el-button>
        <el-button @click="addComponent('switch')" size="small">
          🔌 开关
        </el-button>
        <el-button @click="addComponent('ammeter')" size="small">
          📊 电流表
        </el-button>
        <el-button @click="addComponent('voltmeter')" size="small">
          📈 电压表
        </el-button>
      </el-button-group>

      <div class="toolbar-spacer"></div>

      <el-button @click="runSimulation" :type="simulating ? 'success' : 'primary'" size="small">
        ⚡ {{ simulating ? '停止模拟' : '开始模拟' }}
      </el-button>
      <el-button @click="clearCircuit" type="danger" size="small">
        🗑️ 清空
      </el-button>
    </div>

    <div class="canvas-container">
      <canvas
        ref="canvasRef"
        width="800"
        height="500"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @click="handleCanvasClick"
      ></canvas>

      <!-- 网格背景 -->
      <div class="grid-overlay"></div>
    </div>

    <!-- 属性面板 -->
    <div v-if="selectedComponent" class="properties-panel">
      <h4>组件属性</h4>
      <div class="property-group">
        <label>类型：</label>
        <span>{{ getComponentTypeName(selectedComponent.type) }}</span>
      </div>

      <div v-if="selectedComponent.type === 'battery'" class="property-group">
        <label>电压 (V)：</label>
        <el-input-number
          v-model="selectedComponent.voltage"
          :min="0"
          :max="100"
          :step="0.5"
          size="small"
          @change="updateSimulation"
        />
      </div>

      <div v-if="selectedComponent.type === 'resistor'" class="property-group">
        <label>电阻 (Ω)：</label>
        <el-input-number
          v-model="selectedComponent.resistance"
          :min="1"
          :max="10000"
          :step="10"
          size="small"
          @change="updateSimulation"
        />
      </div>

      <div v-if="selectedComponent.type === 'switch'" class="property-group">
        <label>状态：</label>
        <el-switch
          v-model="selectedComponent.closed"
          @change="updateSimulation"
          active-text="闭合"
          inactive-text="断开"
        />
      </div>

      <el-button @click="deleteSelectedComponent" type="danger" size="small">
        删除组件
      </el-button>
    </div>

    <!-- 模拟状态显示 -->
    <div v-if="simulating" class="simulation-status">
      <div class="status-indicator running"></div>
      <span>模拟运行中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'

// 定义类型
interface Component {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  voltage?: number
  resistance?: number
  closed?: boolean
  value?: number
  unit?: string
}

interface Wire {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
}

interface Point {
  x: number
  y: number
}

// 响应式数据
const canvasRef = ref<HTMLCanvasElement>()
const mode = ref('select')
const components = ref<Component[]>([])
const wires = ref<Wire[]>([])
const selectedComponent = ref<Component | null>(null)
const simulating = ref(false)
const isDragging = ref(false)
const dragStart = ref<Point>({ x: 0, y: 0 })
const isDrawingWire = ref(false)
const wireStart = ref<Point>({ x: 0, y: 0 })
const animationFrameId = ref<number>()

// 发射事件
const emit = defineEmits(['simulation-update', 'update:circuit'])

// 设置模式
const setMode = (newMode: string) => {
  mode.value = newMode
  selectedComponent.value = null
}

// 添加组件
const addComponent = (type: string) => {
  const component: Component = {
    id: Date.now().toString(),
    type,
    x: 100 + Math.random() * 600,
    y: 100 + Math.random() * 300,
    width: getComponentWidth(type),
    height: getComponentHeight(type)
  }

  // 设置默认值
  switch (type) {
    case 'battery':
      component.voltage = 12
      break
    case 'resistor':
      component.resistance = 100
      break
    case 'switch':
      component.closed = false
      break
    case 'ammeter':
      component.unit = 'A'
      component.value = 0
      break
    case 'voltmeter':
      component.unit = 'V'
      component.value = 0
      break
  }

  components.value.push(component)
  mode.value = 'select'
}

// 获取组件宽度
const getComponentWidth = (type: string): number => {
  const widths: Record<string, number> = {
    battery: 60,
    resistor: 80,
    bulb: 50,
    switch: 60,
    ammeter: 60,
    voltmeter: 60
  }
  return widths[type] || 60
}

// 获取组件高度
const getComponentHeight = (type: string): number => {
  const heights: Record<string, number> = {
    battery: 40,
    resistor: 30,
    bulb: 50,
    switch: 40,
    ammeter: 60,
    voltmeter: 60
  }
  return heights[type] || 40
}

// 鼠标事件处理
const handleMouseDown = (e: MouseEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return

  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (mode.value === 'select') {
    // 查找点击的组件
    const clicked = components.value.find(comp =>
      x >= comp.x && x <= comp.x + comp.width &&
      y >= comp.y && y <= comp.y + comp.height
    )

    selectedComponent.value = clicked || null

    if (clicked) {
      isDragging.value = true
      dragStart.value = { x: x - clicked.x, y: y - clicked.y }
    }
  } else if (mode.value === 'wire') {
    isDrawingWire.value = true
    wireStart.value = { x: snapToGrid(x), y: snapToGrid(y) }
  }
}

const handleMouseMove = (e: MouseEvent) => {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return

  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  if (isDragging.value && selectedComponent.value) {
    selectedComponent.value.x = snapToGrid(x - dragStart.value.x)
    selectedComponent.value.y = snapToGrid(y - dragStart.value.y)
    drawCircuit()
  } else if (isDrawingWire.value) {
    drawCircuit()
    drawTempWire(wireStart.value.x, wireStart.value.y, snapToGrid(x), snapToGrid(y))
  }
}

const handleMouseUp = (e: MouseEvent) => {
  if (isDragging.value) {
    isDragging.value = false
  } else if (isDrawingWire.value) {
    const rect = canvasRef.value?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const wire: Wire = {
        id: Date.now().toString(),
        startX: wireStart.value.x,
        startY: wireStart.value.y,
        endX: snapToGrid(x),
        endY: snapToGrid(y)
      }
      wires.value.push(wire)
    }
    isDrawingWire.value = false
  }
  drawCircuit()
}

const handleCanvasClick = (e: MouseEvent) => {
  // 处理点击事件
}

// 网格对齐
const snapToGrid = (value: number): number => {
  return Math.round(value / 20) * 20
}

// 删除选中的组件
const deleteSelectedComponent = () => {
  if (selectedComponent.value) {
    const index = components.value.findIndex(c => c.id === selectedComponent.value?.id)
    if (index > -1) {
      components.value.splice(index, 1)
      selectedComponent.value = null
      drawCircuit()
    }
  }
}

// 清空电路
const clearCircuit = () => {
  components.value = []
  wires.value = []
  selectedComponent.value = null
  simulating.value = false
  drawCircuit()
}

// 绘制电路
const drawCircuit = () => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!ctx || !canvas) return

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制网格
  drawGrid(ctx, canvas.width, canvas.height)

  // 绘制导线
  wires.value.forEach(wire => {
    drawWire(ctx, wire)
  })

  // 绘制组件
  components.value.forEach(component => {
    drawComponent(ctx, component)
  })

  // 高亮选中的组件
  if (selectedComponent.value) {
    ctx.strokeStyle = '#007bff'
    ctx.lineWidth = 2
    ctx.strokeRect(
      selectedComponent.value.x - 2,
      selectedComponent.value.y - 2,
      selectedComponent.value.width + 4,
      selectedComponent.value.height + 4
    )
  }
}

// 绘制网格
const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 0.5

  for (let x = 0; x <= width; x += 20) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  for (let y = 0; y <= height; y += 20) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

// 绘制导线
const drawWire = (ctx: CanvasRenderingContext2D, wire: Wire) => {
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(wire.startX, wire.startY)
  ctx.lineTo(wire.endX, wire.endY)
  ctx.stroke()
}

// 绘制临时导线
const drawTempWire = (startX: number, startY: number, endX: number, endY: number) => {
  const canvas = canvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!ctx) return

  ctx.strokeStyle = '#007bff'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()
  ctx.setLineDash([])
}

// 绘制组件
const drawComponent = (ctx: CanvasRenderingContext2D, component: Component) => {
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2

  switch (component.type) {
    case 'battery':
      drawBattery(ctx, component)
      break
    case 'resistor':
      drawResistor(ctx, component)
      break
    case 'bulb':
      drawBulb(ctx, component)
      break
    case 'switch':
      drawSwitch(ctx, component)
      break
    case 'ammeter':
      drawMeter(ctx, component, 'A')
      break
    case 'voltmeter':
      drawMeter(ctx, component, 'V')
      break
  }
}

// 绘制电池
const drawBattery = (ctx: CanvasRenderingContext2D, battery: Component) => {
  ctx.fillStyle = '#4CAF50'
  ctx.fillRect(battery.x, battery.y, battery.width, battery.height)
  ctx.strokeRect(battery.x, battery.y, battery.width, battery.height)

  ctx.fillStyle = '#fff'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${battery.voltage}V`, battery.x + battery.width / 2, battery.y + battery.height / 2 + 4)
}

// 绘制电阻
const drawResistor = (ctx: CanvasRenderingContext2D, resistor: Component) => {
  ctx.fillStyle = '#FF9800'
  ctx.fillRect(resistor.x, resistor.y, resistor.width, resistor.height)
  ctx.strokeRect(resistor.x, resistor.y, resistor.width, resistor.height)

  ctx.fillStyle = '#fff'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${resistor.resistance}Ω`, resistor.x + resistor.width / 2, resistor.y + resistor.height / 2 + 4)
}

// 绘制灯泡
const drawBulb = (ctx: CanvasRenderingContext2D, bulb: Component) => {
  ctx.beginPath()
  ctx.arc(bulb.x + bulb.width / 2, bulb.y + bulb.height / 2, bulb.width / 2, 0, Math.PI * 2)
  ctx.fillStyle = simulating.value ? '#FFEB3B' : '#f0f0f0'
  ctx.fill()
  ctx.stroke()
}

// 绘制开关
const drawSwitch = (ctx: CanvasRenderingContext2D, switch_: Component) => {
  ctx.fillStyle = '#9E9E9E'
  ctx.fillRect(switch_.x, switch_.y, switch_.width, switch_.height)
  ctx.strokeRect(switch_.x, switch_.y, switch_.width, switch_.height)

  if (switch_.closed) {
    ctx.beginPath()
    ctx.moveTo(switch_.x + 10, switch_.y + switch_.height / 2)
    ctx.lineTo(switch_.x + switch_.width - 10, switch_.y + switch_.height / 2)
    ctx.stroke()
  } else {
    ctx.beginPath()
    ctx.moveTo(switch_.x + 10, switch_.y + switch_.height / 2)
    ctx.lineTo(switch_.x + switch_.width - 15, switch_.y + switch_.height / 2 - 10)
    ctx.stroke()
  }
}

// 绘制仪表
const drawMeter = (ctx: CanvasRenderingContext2D, meter: Component, type: string) => {
  ctx.beginPath()
  ctx.arc(meter.x + meter.width / 2, meter.y + meter.height / 2, meter.width / 2, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#333'
  ctx.font = 'bold 14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(type, meter.x + meter.width / 2, meter.y + meter.height / 2)

  if (meter.value !== undefined) {
    ctx.font = '10px Arial'
    ctx.fillText(`${meter.value?.toFixed(2)}${meter.unit}`, meter.x + meter.width / 2, meter.y + meter.height / 2 + 15)
  }
}

// 运行模拟
const runSimulation = () => {
  simulating.value = !simulating.value

  if (simulating.value) {
    startSimulation()
  } else {
    stopSimulation()
  }
}

const startSimulation = () => {
  // 简单的模拟逻辑
  const battery = components.value.find(c => c.type === 'battery')
  if (!battery) return

  let totalResistance = 0
  const resistors = components.value.filter(c => c.type === 'resistor')
  const switches = components.value.filter(c => c.type === 'switch')

  // 检查是否有断开的开关
  const openSwitch = switches.find(s => !s.closed)
  if (openSwitch) {
    // 如果有断开的开关，电流为0
    updateMeters(0)
    return
  }

  // 计算总电阻（简化计算，假设串联）
  resistors.forEach(resistor => {
    totalResistance += resistor.resistance || 0
  })

  if (totalResistance === 0) totalResistance = 1 // 避免除零

  // 计算电流 (I = V / R)
  const current = (battery.voltage || 0) / totalResistance

  // 更新仪表读数
  updateMeters(current)

  // 发射模拟数据更新事件
  emitSimulationData(current, totalResistance, battery.voltage || 0)
}

const stopSimulation = () => {
  updateMeters(0)
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
}

const updateMeters = (current: number) => {
  const battery = components.value.find(c => c.type === 'battery')

  components.value.forEach(component => {
    if (component.type === 'ammeter') {
      component.value = current
    } else if (component.type === 'voltmeter') {
      // 简化计算：电压表读数等于电池电压
      component.value = battery?.voltage || 0
    }
  })

  drawCircuit()
}

const emitSimulationData = (current: number, resistance: number, voltage: number) => {
  emit('simulation-update', {
    current: current * 1000, // 转换为mA
    resistance,
    power: current * voltage,
    voltage,
    temperature: 25 + (current * current * resistance) * 0.1 // 简化的温度计算
  })
}

const updateSimulation = () => {
  if (simulating.value) {
    startSimulation()
  }
}

// 获取组件类型名称
const getComponentTypeName = (type: string): string => {
  const names: Record<string, string> = {
    battery: '电源',
    resistor: '电阻',
    bulb: '灯泡',
    switch: '开关',
    ammeter: '电流表',
    voltmeter: '电压表'
  }
  return names[type] || type
}

// 生命周期
onMounted(() => {
  drawCircuit()
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})

// 监听组件变化，重新绘制
watch(components, () => {
  drawCircuit()
}, { deep: true })

watch(wires, () => {
  drawCircuit()
}, { deep: true })
</script>

<style scoped lang="scss">
.circuit-simulator {
  position: relative;
  width: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background: white;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  border-radius: var(--spacing-md) var(--spacing-md) 0 0;

  .toolbar-spacer {
    flex: 1;
  }
}

.canvas-container {
  position: relative;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 var(--spacing-md) var(--spacing-md);
  overflow: hidden;

  canvas {
    display: block;
    cursor: crosshair;
  }

  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
    opacity: 0.5;
  }
}

.properties-panel {
  position: absolute;
  right: var(--spacing-lg);
  top: var(--spacing-lg);
  width: 250px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: var(--spacing-md);
  padding: var(--spacing-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;

  h4 {
    margin: 0 0 var(--spacing-lg) 0;
    color: #333;
    font-size: 1rem;
  }

  .property-group {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-md);

    label {
      min-width: 80px;
      font-size: var(--text-sm);
      color: #666;
    }

    span {
      font-weight: 600;
      color: #333;
    }
  }
}

.simulation-status {
  position: absolute;
  left: var(--spacing-lg);
  top: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid #4CAF50;
  border-radius: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: #4CAF50;
  font-weight: 600;
  font-size: var(--text-sm);

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4CAF50;

    &.running {
      animation: pulse 1s ease-in-out infinite;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: var(--breakpoint-md)) {
  .toolbar {
    flex-wrap: wrap;
    gap: var(--spacing-sm);

    .toolbar-spacer {
      display: none;
    }
  }

  .properties-panel {
    position: static;
    width: 100%;
    margin-top: var(--spacing-lg);
  }

  .simulation-status {
    position: static;
    margin-bottom: var(--spacing-md);
    align-self: flex-start;
  }
}
</style>