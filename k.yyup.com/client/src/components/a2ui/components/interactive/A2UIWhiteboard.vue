<template>
  <div class="a2ui-whiteboard">
    <div class="whiteboard-toolbar">
      <div class="tool-group">
        <el-tooltip v-for="tool in tools" :key="tool.type" :content="tool.label" placement="top">
          <button
            class="tool-btn"
            :class="{ active: currentTool === tool.type }"
            @click="currentTool = tool.type"
          >
            <el-icon :size="20">
              <component :is="tool.icon" />
            </el-icon>
          </button>
        </el-tooltip>
      </div>

      <div class="tool-group">
        <el-color-picker
          v-model="strokeColor"
          :predefine="predefineColors"
          show-alpha
          size="small"
        />
        <el-slider
          v-model="strokeWidth"
          :min="1"
          :max="20"
          :step="1"
          class="width-slider"
        />
      </div>

      <div class="tool-group">
        <el-button size="small" @click="handleUndo">
          <el-icon><Back /></el-icon>
          撤销
        </el-button>
        <el-button size="small" @click="handleRedo">
          <el-icon><Right /></el-icon>
          重做
        </el-button>
        <el-button size="small" @click="handleClear">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>

      <div v-if="showSave" class="tool-group">
        <el-button type="primary" size="small" @click="handleSave">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </div>
    </div>

    <div class="whiteboard-canvas-wrapper" ref="canvasWrapper">
      <canvas
        ref="canvasRef"
        class="whiteboard-canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawingTouch"
        @touchmove.prevent="drawTouch"
        @touchend="stopDrawing"
      />
    </div>

    <div v-if="showHint" class="whiteboard-hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import {
  Edit,
  Delete,
  Back,
  Right,
  Check,
  Star,
  CircleClose,
  Minus
} from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  width?: number;
  height?: number;
  showSave?: boolean;
  showHint?: boolean;
  hint?: string;
  backgroundColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
  showSave: true,
  showHint: false,
  hint: '',
  backgroundColor: '#ffffff'
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
  (e: 'save', dataUrl: string): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasWrapper = ref<HTMLElement | null>(null);
const currentTool = ref<'pen' | 'eraser' | 'line' | 'star'>('pen');
const strokeColor = ref('#409EFF');
const strokeWidth = ref(4);
const isDrawing = ref(false);
const history = ref<string[]>([]);
const historyIndex = ref(-1);

const tools = [
  { type: 'pen', label: '画笔', icon: Edit },
  { type: 'eraser', label: '橡皮擦', icon: CircleClose },
  { type: 'line', label: '直线', icon: Minus },
  { type: 'star', label: '画星星', icon: Star }
];

const predefineColors = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#000000',
  '#ffffff'
];

let ctx: CanvasRenderingContext2D | null = null;
let lastX = 0;
let lastY = 0;
let currentPath: Array<{ x: number; y: number }> = [];

function getCanvasPoint(e: MouseEvent | Touch): { x: number; y: number } {
  if (!canvasRef.value) return { x: 0, y: 0 };
  const rect = canvasRef.value.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvasRef.value.width / rect.width),
    y: (e.clientY - rect.top) * (canvasRef.value.height / rect.height)
  };
}

function initCanvas() {
  if (!canvasRef.value) return;

  // Set actual canvas size
  canvasRef.value.width = props.width;
  canvasRef.value.height = props.height;

  ctx = canvasRef.value.getContext('2d');
  if (ctx) {
    ctx.fillStyle = props.backgroundColor;
    ctx.fillRect(0, 0, props.width, props.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  saveState();
}

function saveState() {
  if (!canvasRef.value) return;

  // Remove any future history if we're in the middle
  history.value = history.value.slice(0, historyIndex.value + 1);

  // Save current canvas state
  history.value.push(canvasRef.value.toDataURL());
  historyIndex.value = history.value.length - 1;

  // Limit history
  if (history.value.length > 50) {
    history.value.shift();
    historyIndex.value--;
  }
}

function startDrawing(e: MouseEvent | Touch) {
  isDrawing.value = true;
  const point = getCanvasPoint(e);
  lastX = point.x;
  lastY = point.y;
  currentPath = [{ x: lastX, y: lastY }];

  if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    ctx!.beginPath();
    ctx!.moveTo(lastX, lastY);
  }
}

function draw(e: MouseEvent | Touch) {
  if (!isDrawing.value) return;
  if (!ctx) return;

  const point = getCanvasPoint(e);

  if (currentTool.value === 'pen') {
    ctx.strokeStyle = strokeColor.value;
    ctx.lineWidth = strokeWidth.value;
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  } else if (currentTool.value === 'eraser') {
    ctx.strokeStyle = props.backgroundColor;
    ctx.lineWidth = strokeWidth.value * 3;
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  } else if (currentTool.value === 'line') {
    // Preview line - restore last state and draw new line
    restoreState();
    ctx.strokeStyle = strokeColor.value;
    ctx.lineWidth = strokeWidth.value;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  } else if (currentTool.value === 'star') {
    // Preview star
    restoreState();
    drawStar(point.x, point.y, 5, strokeWidth.value * 3, strokeWidth.value * 1.5);
  }

  currentPath.push({ x: point.x, y: point.y });
}

function stopDrawing() {
  if (isDrawing.value) {
    isDrawing.value = false;
    saveState();

    emitEvent('whiteboard.draw', {
      tool: currentTool.value,
      points: currentPath,
      color: strokeColor.value,
      width: strokeWidth.value
    });
  }
}

function startDrawingTouch(e: TouchEvent) {
  startDrawing(e.touches[0]);
}

function drawTouch(e: TouchEvent) {
  draw(e.touches[0]);
}

function drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  if (!ctx) return;

  ctx.beginPath();
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;

  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    const x = cx + Math.cos(rot) * outerRadius;
    const y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    const x2 = cx + Math.cos(rot) * innerRadius;
    const y2 = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x2, y2);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.strokeStyle = strokeColor.value;
  ctx.lineWidth = strokeWidth.value;
  ctx.stroke();
  ctx.fillStyle = strokeColor.value + '33';
  ctx.fill();
}

function restoreState() {
  if (!canvasRef.value || history.value[historyIndex.value]) return;

  const img = new Image();
  img.onload = () => {
    ctx!.clearRect(0, 0, props.width, props.height);
    ctx!.drawImage(img, 0, 0);
  };
  img.src = history.value[historyIndex.value];
}

function handleUndo() {
  if (historyIndex.value > 0) {
    historyIndex.value--;
    restoreState();
    emitEvent('whiteboard.undo', {});
  }
}

function handleRedo() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++;
    restoreState();
    emitEvent('whiteboard.redo', {});
  }
}

function handleClear() {
  if (!ctx || !canvasRef.value) return;

  ctx.fillStyle = props.backgroundColor;
  ctx.fillRect(0, 0, props.width, props.height);
  saveState();
  emitEvent('whiteboard.clear', {});
}

function handleSave() {
  if (!canvasRef.value) return;

  const dataUrl = canvasRef.value.toDataURL('image/png');
  emit('save', dataUrl);
  emitEvent('whiteboard.save', { format: 'png' });
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'whiteboard',
    eventType,
    payload,
    sessionId: ''
  };
  emit('event', event);
}

function handleResize() {
  if (!canvasRef.value || !canvasWrapper.value) return;

  const wrapperRect = canvasWrapper.value.getBoundingClientRect();
  const scale = Math.min(
    wrapperRect.width / props.width,
    wrapperRect.height / props.height
  );

  canvasRef.value.style.transform = `scale(${scale})`;
  canvasRef.value.style.transformOrigin = 'top left';
}

onMounted(() => {
  initCanvas();
  window.addEventListener('resize', handleResize);
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

watch(() => props.backgroundColor, (newColor) => {
  if (ctx) {
    ctx.fillStyle = newColor;
    ctx.fillRect(0, 0, props.width, props.height);
  }
});
</script>

<style scoped lang="scss">
.a2ui-whiteboard {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.whiteboard-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }
}

.width-slider {
  width: 100px;
}

.whiteboard-canvas-wrapper {
  width: 100%;
  overflow: hidden;
  background: var(--el-fill-color);
  border-radius: 8px;
}

.whiteboard-canvas {
  display: block;
  background: white;
  cursor: crosshair;
}

.whiteboard-hint {
  text-align: center;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
</style>
