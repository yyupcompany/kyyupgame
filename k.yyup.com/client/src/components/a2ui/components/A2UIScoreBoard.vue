<template>
  <div class="a2ui-score-board">
    <div class="score-main">
      <div class="score-item">
        <span class="score-label">得分</span>
        <span class="score-value score-current">{{ score }}</span>
        <span v-if="maxScore" class="score-max">/ {{ maxScore }}</span>
      </div>
      <div v-if="timeBonus > 0" class="score-item score-bonus">
        <span class="score-label">时间加成</span>
        <span class="score-value">+{{ timeBonus }}</span>
      </div>
    </div>
    <div v-if="combo > 1" class="score-combo">
      <el-tag type="warning" effect="dark" size="large">
        <el-icon><Star /></el-icon>
        {{ combo }} 连击
      </el-tag>
    </div>
    <div v-if="showTimer && timerValue !== undefined" class="score-timer">
      <A2UITimer
        :id="`timer-${id}`"
        :start-time="timerValue"
        format="minutes-seconds"
        auto-start
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Star } from '@element-plus/icons-vue';
import A2UITimer from './A2UITimer.vue';

interface Props {
  id: string;
  score: number;
  timeBonus?: number;
  combo?: number;
  maxScore?: number;
  showTimer?: boolean;
  timerValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  timeBonus: 0,
  combo: 0,
  maxScore: 100,
  showTimer: false,
  timerValue: 0
});
</script>

<style scoped lang="scss">
.a2ui-score-board {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-5) 100%);
  border-radius: 12px;
  color: #fff;
}

.score-main {
  display: flex;
  align-items: center;
  gap: 24px;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  &.score-bonus {
    .score-value {
      color: var(--el-color-warning-light-3);
    }
  }
}

.score-label {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;

  &.score-current {
    font-size: 48px;
  }
}

.score-max {
  font-size: 16px;
  opacity: 0.7;
}

.score-combo {
  .el-tag {
    font-size: 16px;
  }
}

.score-timer {
  :deep(.a2ui-timer) {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
}
</style>
