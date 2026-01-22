<template>
  <div class="a2ui-puzzle-game">
    <div class="puzzle-header">
      <h3 class="puzzle-title">{{ title }}</h3>
      <div class="puzzle-stats">
        <span v-if="showMoves" class="stat">
          <el-icon><Rank /></el-icon>
          {{ moves }}步
        </span>
        <span v-if="showTimer" class="stat">
          <el-icon><Timer /></el-icon>
          {{ formatTime(time) }}
        </span>
      </div>
    </div>

    <div class="puzzle-board" :style="boardStyle">
      <div
        v-for="(tile, index) in tiles"
        :key="tile.id"
        class="puzzle-tile"
        :class="{ 'is-empty': tile.isEmpty, 'is-movable': canMove(index) }"
        :style="getTileStyle(tile)"
        @click="handleTileClick(index)"
      >
        <template v-if="!tile.isEmpty && imageSrc">
          <img :src="imageSrc" :style="getImageClipStyle(tile)" alt="" />
        </template>
        <template v-else-if="!tile.isEmpty">
          <span class="tile-number">{{ tile.number }}</span>
        </template>
      </div>
    </div>

    <div v-if="showControls" class="puzzle-controls">
      <el-button @click="handleShuffle">
        <el-icon><Refresh /></el-icon>
        重新打乱
      </el-button>
      <el-button type="primary" @click="handlePreview">
        <el-icon><View /></el-icon>
        预览完整图
      </el-button>
    </div>

    <div v-if="showFeedback && isComplete" class="puzzle-success">
      <el-icon class="success-icon"><CircleCheck /></el-icon>
      <span>恭喜完成！用时{{ formatTime(time) }}，共{{ moves }}步</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Rank, Timer, Refresh, View, CircleCheck } from '@element-plus/icons-vue';
import type { A2UIEvent } from '@/types/a2ui-protocol';

interface Props {
  title?: string;
  imageSrc?: string;
  rows?: number;
  cols?: number;
  showMoves?: boolean;
  showTimer?: boolean;
  showControls?: boolean;
  showPreview?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '拼图游戏',
  rows: 3,
  cols: 3,
  showMoves: true,
  showTimer: true,
  showControls: true,
  showPreview: true
});

const emit = defineEmits<{
  (e: 'event', event: A2UIEvent): void;
}>();

const tiles = ref<Array<{ id: number; number: number; row: number; col: number; isEmpty: boolean }>>([]);
const moves = ref(0);
const time = ref(0);
const timer = ref<number | null>(null);
const isComplete = ref(false);
const showFeedback = ref(false);

const boardStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.cols}, 1fr)`,
  gridTemplateRows: `repeat(${props.rows}, 1fr)`
}));

function initTiles() {
  const totalTiles = props.rows * props.cols;
  tiles.value = [];

  for (let i = 0; i < totalTiles; i++) {
    tiles.value.push({
      id: i,
      number: i + 1,
      row: Math.floor(i / props.cols),
      col: i % props.cols,
      isEmpty: i === totalTiles - 1
    });
  }
}

function shuffleTiles() {
  // Fisher-Yates shuffle
  for (let i = tiles.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap positions in grid, not in array
    const tempRow = tiles.value[i].row;
    const tempCol = tiles.value[i].col;
    tiles.value[i].row = tiles.value[j].row;
    tiles.value[i].col = tiles.value[j].col;
    tiles.value[j].row = tempRow;
    tiles.value[j].col = tempCol;
  }

  // Ensure solvable - count inversions
  // For simplicity, just swap empty tile with neighbor a few times
  for (let i = 0; i < 10; i++) {
    const emptyIndex = tiles.value.findIndex(t => t.isEmpty);
    const neighbors = getNeighbors(emptyIndex);
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    swapTiles(emptyIndex, randomNeighbor);
  }

  moves.value = 0;
  time.value = 0;
  isComplete.value = false;
  showFeedback.value = false;
  startTimer();
}

function getNeighbors(index: number): number[] {
  const neighbors: number[] = [];
  const row = Math.floor(index / props.cols);
  const col = index % props.cols;

  if (row > 0) neighbors.push(index - props.cols);
  if (row < props.rows - 1) neighbors.push(index + props.cols);
  if (col > 0) neighbors.push(index - 1);
  if (col < props.cols - 1) neighbors.push(index + 1);

  return neighbors;
}

function canMove(index: number): boolean {
  const emptyTile = tiles.value.find(t => t.isEmpty);
  if (!emptyTile) return false;

  const tile = tiles.value[index];
  const rowDiff = Math.abs(tile.row - emptyTile.row);
  const colDiff = Math.abs(tile.col - emptyTile.col);

  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function handleTileClick(index: number) {
  if (isComplete.value) return;
  if (!canMove(index)) return;

  swapTiles(index, tiles.value.findIndex(t => t.isEmpty));
  moves.value++;
  checkCompletion();
}

function swapTiles(index1: number, index2: number) {
  const tempRow = tiles.value[index1].row;
  const tempCol = tiles.value[index1].col;
  tiles.value[index1].row = tiles.value[index2].row;
  tiles.value[index1].col = tiles.value[index2].col;
  tiles.value[index2].row = tempRow;
  tiles.value[index2].col = tempCol;
}

function getTileStyle(tile: { row: number; col: number; isEmpty: boolean }) {
  return {
    gridRow: tile.row + 1,
    gridColumn: tile.col + 1,
    opacity: tile.isEmpty ? 0 : 1
  };
}

function getImageClipStyle(tile: { row: number; col: number }) {
  const tileWidth = 100 / props.cols;
  const tileHeight = 100 / props.rows;
  return {
    width: `${tileWidth}%`,
    height: `${tileHeight}%`,
    left: `-${tile.col * tileWidth}%`,
    top: `-${tile.row * tileHeight}%`
  };
}

function checkCompletion() {
  const totalTiles = props.rows * props.cols;
  const isSolved = tiles.value.every((tile, index) => {
    if (tile.isEmpty) return index === totalTiles - 1;
    return tile.id === index;
  });

  if (isSolved) {
    isComplete.value = true;
    showFeedback.value = true;
    stopTimer();
    emitEvent('puzzle.complete', {
      moves: moves.value,
      time: time.value,
      rows: props.rows,
      cols: props.cols
    });
  }
}

function startTimer() {
  stopTimer();
  timer.value = window.setInterval(() => {
    time.value++;
  }, 1000);
}

function stopTimer() {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function handleShuffle() {
  shuffleTiles();
}

function handlePreview() {
  emitEvent('puzzle.preview', {});
}

function emitEvent(eventType: string, payload: Record<string, any>) {
  const event: A2UIEvent = {
    messageId: crypto.randomUUID(),
    componentId: 'puzzle-game',
    eventType,
    payload,
    sessionId: ''
  };
  emit('event', event);
}

onMounted(() => {
  initTiles();
  shuffleTiles();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped lang="scss">
.a2ui-puzzle-game {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.puzzle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.puzzle-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.puzzle-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.puzzle-board {
  display: grid;
  gap: 4px;
  aspect-ratio: 1;
  background: var(--el-fill-color);
  padding: 4px;
  border-radius: 8px;
}

.puzzle-tile {
  background: var(--el-bg-color);
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  &:hover:not(.is-empty) {
    transform: scale(0.98);
    box-shadow: inset 0 0 0 2px var(--el-color-primary-light-5);
  }

  &.is-empty {
    cursor: default;
  }

  &.is-movable {
    box-shadow: inset 0 0 0 2px var(--el-color-primary-light-3);
  }

  img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.tile-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.puzzle-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.puzzle-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: var(--el-color-success-light-9);
  border-radius: 8px;
  color: var(--el-color-success);
  font-weight: 500;
}

.success-icon {
  font-size: 20px;
}
</style>
