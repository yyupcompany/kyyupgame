<template>
  <div class="price-steps">
    <!-- 当前价格展示 -->
    <div class="current-price">
      <div class="price-label">当前价格</div>
      <div class="price-value">
        <span class="currency">¥</span>
        <span class="amount">{{ currentPrice }}</span>
        <span v-if="originalPrice > currentPrice" class="original-price">
          ¥{{ originalPrice }}
        </span>
      </div>
      <div v-if="discount > 0" class="discount-badge">
        省{{ discount }}元
      </div>
    </div>

    <!-- 阶梯价格进度条 -->
    <div v-if="priceSteps && priceSteps.length > 0" class="steps-progress">
      <div class="steps-container">
        <div
          v-for="(step, index) in sortedSteps"
          :key="index"
          class="step-item"
          :class="{
            'is-active': currentPeople >= step.people,
            'is-current': isCurrentStep(step),
            'is-next': isNextStep(step)
          }"
        >
          <div class="step-marker">
            <el-icon v-if="currentPeople >= step.people"><CircleCheckFilled /></el-icon>
            <el-icon v-else><CircleFilled /></el-icon>
          </div>
          <div class="step-info">
            <div class="step-people">{{ step.people }}人</div>
            <div class="step-price">¥{{ step.price }}</div>
          </div>
          
          <!-- 连接线 -->
          <div 
            v-if="index < sortedSteps.length - 1" 
            class="step-line"
            :class="{ 'is-active': currentPeople >= sortedSteps[index + 1].people }"
          />
        </div>
      </div>

      <!-- 下一档提示 -->
      <div v-if="nextStep" class="next-step-tip">
        <el-alert
          :title="`再邀请 ${nextStep.remaining} 人，即可享受 ¥${nextStep.price} 优惠价！`"
          type="success"
          :closable="false"
          show-icon
        />
      </div>
    </div>

    <!-- 简单模式：无阶梯价格 -->
    <div v-else class="simple-mode">
      <el-tag type="info">固定团购价 ¥{{ currentPrice }}</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheckFilled, CircleFilled } from '@element-plus/icons-vue'

interface PriceStep {
  people: number
  price: number
}

interface Props {
  /** 当前价格 */
  currentPrice: number
  /** 原价 */
  originalPrice: number
  /** 当前人数 */
  currentPeople: number
  /** 阶梯价格配置 */
  priceSteps?: PriceStep[]
}

const props = defineProps<Props>()

// 计算属性
const sortedSteps = computed(() => {
  if (!props.priceSteps) return []
  return [...props.priceSteps].sort((a, b) => a.people - b.people)
})

const discount = computed(() => {
  return Math.max(0, props.originalPrice - props.currentPrice)
})

const nextStep = computed(() => {
  if (!props.priceSteps) return null
  
  for (const step of sortedSteps.value) {
    if (step.people > props.currentPeople) {
      return {
        people: step.people,
        price: step.price,
        remaining: step.people - props.currentPeople,
      }
    }
  }
  
  return null
})

const isCurrentStep = (step: PriceStep): boolean => {
  if (!sortedSteps.value.length) return false
  
  const currentIndex = sortedSteps.value.findIndex(
    s => s.price === props.currentPrice
  )
  
  if (currentIndex === -1) return false
  
  return sortedSteps.value[currentIndex].people === step.people
}

const isNextStep = (step: PriceStep): boolean => {
  return nextStep.value?.people === step.people
}
</script>

<style scoped lang="scss">
.price-steps {
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.current-price {
  text-align: center;
  margin-bottom: 24px;
  position: relative;

  .price-label {
    font-size: var(--text-sm);
    color: #909399;
    margin-bottom: 8px;
  }

  .price-value {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: var(--spacing-sm);

    .currency {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: #ef4444;
    }

    .amount {
      font-size: var(--text-5xl);
      font-weight: 700;
      color: #ef4444;
      line-height: 1;
    }

    .original-price {
      font-size: var(--text-lg);
      color: #909399;
      text-decoration: line-through;
    }
  }

  .discount-badge {
    display: inline-block;
    margin-top: 8px;
    padding: var(--spacing-xs) 12px;
    background: #fbbf24;
    color: white;
    font-size: var(--text-sm);
    font-weight: 600;
    border-radius: 12px;
  }
}

.steps-progress {
  margin-top: 20px;

  .steps-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    padding: var(--spacing-lg) 0;
  }

  .step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;

    .step-marker {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-2xl);
      color: #9ca3af;
      transition: all 0.3s;
      margin-bottom: 8px;
    }

    &.is-active .step-marker {
      background: #10b981;
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    &.is-current .step-marker {
      background: #3b82f6;
      color: white;
      animation: pulse 2s infinite;
    }

    &.is-next .step-marker {
      background: #fbbf24;
      color: white;
      animation: bounce 1s infinite;
    }

    .step-info {
      text-align: center;

      .step-people {
        font-size: var(--text-sm);
        font-weight: 600;
        color: #4b5563;
        margin-bottom: 4px;
      }

      .step-price {
        font-size: var(--text-base);
        font-weight: 700;
        color: #ef4444;
      }
    }

    .step-line {
      position: absolute;
      top: 20px;
      left: 50%;
      width: 100%;
      height: 4px;
      background: #e5e7eb;
      z-index: -1;
      transition: all 0.3s;

      &.is-active {
        background: #10b981;
      }
    }

    &:last-child .step-line {
      display: none;
    }
  }

  .next-step-tip {
    margin-top: 16px;

    :deep(.el-alert__title) {
      font-size: var(--text-sm);
      font-weight: 600;
    }
  }
}

.simple-mode {
  text-align: center;
  padding: var(--spacing-md);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .current-price {
    .price-value {
      .currency {
        font-size: var(--text-lg);
      }

      .amount {
        font-size: var(--text-4xl);
      }

      .original-price {
        font-size: var(--text-sm);
      }
    }
  }

  .steps-progress {
    .step-item {
      .step-marker {
        width: 32px;
        height: 32px;
        font-size: var(--text-xl);
      }

      .step-info {
        .step-people {
          font-size: var(--text-xs);
        }

        .step-price {
          font-size: var(--text-sm);
        }
      }
    }
  }
}
</style>
