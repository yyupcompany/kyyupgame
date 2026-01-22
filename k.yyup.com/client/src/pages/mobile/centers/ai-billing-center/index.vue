<template>
  <MobileCenterLayout title="AI计费中心" back-path="/mobile/centers">
    <div class="ai-billing-mobile">
      <!-- 账户余额 -->
      <div class="balance-section">
        <div class="balance-card">
          <div class="balance-label">账户余额</div>
          <div class="balance-value">¥ {{ balance.toFixed(2) }}</div>
          <div class="balance-actions">
            <van-button type="primary" size="medium" round @click="handleRecharge">充值</van-button>
            <van-button plain size="medium" round @click="viewDetails">明细</van-button>
          </div>
        </div>
      </div>

      <!-- 使用概览 -->
      <div class="overview-section">
        <div class="section-title">本月使用</div>
        <van-grid :column-num="3" :gutter="10">
          <van-grid-item v-for="stat in usageStats" :key="stat.key" class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 消费记录 -->
      <div class="records-section">
        <div class="section-header">
          <span class="section-title">消费记录</span>
          <van-button size="medium" plain @click="exportRecords">导出</van-button>
        </div>
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div v-for="item in records" :key="item.id" class="record-card">
            <div class="record-info">
              <div class="record-title">{{ item.title }}</div>
              <div class="record-time">{{ item.time }}</div>
            </div>
            <div class="record-amount" :class="item.type">
              {{ item.type === 'expense' ? '-' : '+' }}¥{{ item.amount.toFixed(2) }}
            </div>
          </div>
        </van-list>
      </div>

      <!-- 套餐方案 -->
      <div class="plans-section">
        <div class="section-title">充值套餐</div>
        <div class="plans-grid">
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="plan-card"
            :class="{ popular: plan.popular }"
            @click="selectPlan(plan)"
          >
            <div class="plan-badge" v-if="plan.popular">推荐</div>
            <div class="plan-amount">¥{{ plan.amount }}</div>
            <div class="plan-tokens">{{ plan.tokens }} Tokens</div>
            <div class="plan-bonus" v-if="plan.bonus">赠送 {{ plan.bonus }} Tokens</div>
          </div>
        </div>
      </div>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

// 数据
const balance = ref(256.80)
const loading = ref(false)
const finished = ref(false)

// 使用统计
const usageStats = reactive([
  { key: 'tokens', label: 'Tokens消耗', value: '12.5K' },
  { key: 'cost', label: '消费金额', value: '¥45.60' },
  { key: 'requests', label: '请求次数', value: '328' }
])

// 消费记录
const records = ref([
  { id: 1, title: 'AI对话服务', time: '今天 10:30', amount: 2.50, type: 'expense' },
  { id: 2, title: '报告生成服务', time: '今天 09:15', amount: 5.00, type: 'expense' },
  { id: 3, title: '账户充值', time: '昨天 14:20', amount: 100.00, type: 'recharge' },
  { id: 4, title: '数据查询服务', time: '昨天 11:00', amount: 1.80, type: 'expense' }
])

// 充值套餐
const plans = [
  { id: 1, amount: 50, tokens: 5000, bonus: 0, popular: false },
  { id: 2, amount: 100, tokens: 12000, bonus: 2000, popular: true },
  { id: 3, amount: 200, tokens: 25000, bonus: 5000, popular: false }
]

// 加载更多
const onLoad = () => {
  finished.value = true
}

// 操作
const handleRecharge = () => showToast('跳转充值页面')
const viewDetails = () => showToast('查看消费明细')
const exportRecords = () => showToast('导出消费记录')
const selectPlan = (plan: any) => showToast(`选择套餐: ¥${plan.amount}`)
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
.ai-billing-mobile {
  min-height: 100vh;
  background: var(--van-background-2);
  padding-bottom: 20px;
}

.balance-section {
  padding: 16px;
  
  .balance-card {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 12px;
    padding: 24px;
    color: #fff;
    text-align: center;
    
    .balance-label {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .balance-value {
      font-size: 36px;
      font-weight: 600;
      margin: 8px 0 16px;
    }
    
    .balance-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      
      :deep(.van-button--primary) {
        background: #fff;
        color: #6366f1;
        border: none;
      }
      
      :deep(.van-button--plain) {
        border-color: rgba(255, 255, 255, 0.5);
        color: #fff;
      }
    }
  }
}

.overview-section,
.records-section,
.plans-section {
  padding: 0 12px 16px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--van-text-color);
    margin-bottom: 12px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-card {
  :deep(.van-grid-item__content) {
    padding: 12px;
    background: var(--van-background);
    border-radius: 8px;
  }
}

.stat-content {
  text-align: center;
  
  .stat-value {
    font-size: 18px;
    font-weight: 600;
    color: var(--van-primary-color);
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--van-text-color-2);
    margin-top: 4px;
  }
}

.record-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--van-background);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  
  .record-info {
    .record-title {
      font-size: 14px;
      color: var(--van-text-color);
    }
    
    .record-time {
      font-size: 12px;
      color: var(--van-text-color-3);
      margin-top: 2px;
    }
  }
  
  .record-amount {
    font-size: 16px;
    font-weight: 500;
    
    &.expense {
      color: #ef4444;
    }
    
    &.recharge {
      color: #10b981;
    }
  }
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  
  .plan-card {
    position: relative;
    background: var(--van-background);
    border-radius: 8px;
    padding: 16px 8px;
    text-align: center;
    border: 2px solid transparent;
    
    &.popular {
      border-color: var(--van-primary-color);
    }
    
    .plan-badge {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--van-primary-color);
      color: #fff;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
    }
    
    .plan-amount {
      font-size: 20px;
      font-weight: 600;
      color: var(--van-text-color);
    }
    
    .plan-tokens {
      font-size: 12px;
      color: var(--van-text-color-2);
      margin-top: 4px;
    }
    
    .plan-bonus {
      font-size: 11px;
      color: var(--van-primary-color);
      margin-top: 4px;
    }
  }
}
</style>
