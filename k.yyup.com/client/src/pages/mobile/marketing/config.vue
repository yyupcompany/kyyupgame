<template>
  <MobileMainLayout
    title="营销配置"
    :show-back="true"
    :show-footer="false"
    content-padding="var(--app-gap)"
  >
    <div class="mobile-marketing-config">
      <!-- 活动选择 -->
      <van-cell-group class="activity-selector" inset>
        <van-field
          v-model="selectedActivityTitle"
          readonly
          placeholder="请选择活动"
          right-icon="arrow"
          @click="showActivityPicker = true"
        />
      </van-cell-group>

      <!-- 营销功能卡片 -->
      <div v-if="selectedActivityId" class="marketing-features">
        <!-- 团购活动 -->
        <van-cell-group inset title="🛒 团购活动">
          <van-switch-cell
            v-model="marketingConfig.groupBuy.enabled"
            title="启用团购"
          />

          <template v-if="marketingConfig.groupBuy.enabled">
            <van-field
              v-model="marketingConfig.groupBuy.minPeople"
              label="成团人数"
              type="number"
              placeholder="最少成团人数"
              input-align="right"
            />
            <van-field
              v-model="marketingConfig.groupBuy.groupPrice"
              label="团购价格"
              type="number"
              placeholder="团购优惠价格"
              input-align="right"
            >
              <template #right-icon>
                <span class="price-unit">元</span>
              </template>
            </van-field>
            <van-field
              v-model="marketingConfig.groupBuy.deadline"
              label="截止时间"
              readonly
              placeholder="选择团购截止时间"
              right-icon="calendar-o"
              @click="showDeadlinePicker = true"
            />
          </template>
        </van-cell-group>

        <!-- 积攒活动 -->
        <van-cell-group inset title="💰 积攒活动">
          <van-switch-cell
            v-model="marketingConfig.collect.enabled"
            title="启用积攒"
          />

          <template v-if="marketingConfig.collect.enabled">
            <van-field
              v-model="marketingConfig.collect.target"
              label="积攒目标"
              type="number"
              placeholder="积攒目标人数"
              input-align="right"
            >
              <template #right-icon>
                <span class="unit">人</span>
              </template>
            </van-field>

            <van-cell title="积攒奖励" :value="rewardTypeLabel" @click="showRewardTypePicker = true" />

            <van-field
              v-if="marketingConfig.collect.rewardType === 'discount'"
              v-model="marketingConfig.collect.discountPercent"
              label="折扣比例"
              type="number"
              placeholder="折扣百分比"
              input-align="right"
            >
              <template #right-icon>
                <span class="unit">%</span>
              </template>
            </van-field>
          </template>
        </van-cell-group>

        <!-- 阶梯奖励 -->
        <van-cell-group inset title="🏆 阶梯奖励">
          <van-switch-cell
            v-model="marketingConfig.tiered.enabled"
            title="启用阶梯奖励"
          />

          <template v-if="marketingConfig.tiered.enabled">
            <van-collapse v-model="activeTiers" accordion>
              <!-- 第一级奖励 -->
              <van-collapse-item name="tier1" title="第一级奖励">
                <div class="tier-config">
                  <van-field
                    v-model="marketingConfig.tiered.tiers[0].targetValue"
                    label="触发条件"
                    type="number"
                    placeholder="达到人数触发"
                    input-align="right"
                  >
                    <template #right-icon>
                      <span class="unit">人</span>
                    </template>
                  </van-field>

                  <van-cell title="奖励类型" :value="tieredRewardTypeLabels[0]" @click="showTieredRewardTypePicker(0)" />

                  <van-field
                    v-model="marketingConfig.tiered.tiers[0].rewardValue"
                    label="奖励内容"
                    placeholder="输入奖励具体内容"
                    input-align="right"
                  />

                  <van-field
                    v-model="marketingConfig.tiered.tiers[0].rewardDescription"
                    label="奖励描述"
                    type="textarea"
                    placeholder="奖励描述文字"
                    autosize
                  />
                </div>
              </van-collapse-item>

              <!-- 第二级奖励 -->
              <van-collapse-item name="tier2" title="第二级奖励">
                <div class="tier-config">
                  <van-field
                    v-model="marketingConfig.tiered.tiers[1].targetValue"
                    label="触发条件"
                    type="number"
                    placeholder="达到人数触发"
                    input-align="right"
                  >
                    <template #right-icon>
                      <span class="unit">人</span>
                    </template>
                  </van-field>

                  <van-cell title="奖励类型" :value="tieredRewardTypeLabels[1]" @click="showTieredRewardTypePicker(1)" />

                  <van-field
                    v-model="marketingConfig.tiered.tiers[1].rewardValue"
                    label="奖励内容"
                    placeholder="输入奖励具体内容"
                    input-align="right"
                  />

                  <van-field
                    v-model="marketingConfig.tiered.tiers[1].rewardDescription"
                    label="奖励描述"
                    type="textarea"
                    placeholder="奖励描述文字"
                    autosize
                  />
                </div>
              </van-collapse-item>
            </van-collapse>
          </template>
        </van-cell-group>

        <!-- 推荐奖励 -->
        <van-cell-group inset title="🎁 推荐奖励">
          <van-switch-cell
            v-model="marketingConfig.referral.enabled"
            title="启用推荐奖励"
          />

          <template v-if="marketingConfig.referral.enabled">
            <van-field
              v-model="marketingConfig.referral.reward"
              label="推荐奖励"
              type="number"
              placeholder="推荐奖励金额"
              input-align="right"
            >
              <template #right-icon>
                <span class="price-unit">元</span>
              </template>
            </van-field>

            <van-field
              v-model="marketingConfig.referral.maxRewards"
              label="最大次数"
              type="number"
              placeholder="单人最大获奖次数"
              input-align="right"
            />
          </template>
        </van-cell-group>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <van-empty description="请先选择要配置营销策略的活动" />
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button block type="primary" @click="saveConfig" :loading="saving">
          保存配置
        </van-button>
        <van-button block @click="previewConfig" style="margin-top: 12px;">
          预览效果
        </van-button>
      </div>

      <!-- 活动选择器 -->
      <van-popup v-model:show="showActivityPicker" position="bottom" round>
        <van-picker
          :columns="activityColumns"
          @confirm="onActivityConfirm"
          @cancel="showActivityPicker = false"
          title="选择活动"
        />
      </van-popup>

      <!-- 截止时间选择器 -->
      <van-popup v-model:show="showDeadlinePicker" position="bottom" round>
        <van-date-picker
          v-model="marketingConfig.groupBuy.deadline"
          type="datetime"
          title="选择截止时间"
          @confirm="showDeadlinePicker = false"
          @cancel="showDeadlinePicker = false"
        />
      </van-popup>

      <!-- 积攒奖励类型选择器 -->
      <van-popup v-model:show="showRewardTypePicker" position="bottom" round>
        <van-picker
          :columns="rewardTypeColumns"
          @confirm="onRewardTypeConfirm"
          @cancel="showRewardTypePicker = false"
          title="选择奖励类型"
        />
      </van-popup>

      <!-- 阶梯奖励类型选择器 -->
      <van-popup v-model:show="showTieredRewardTypePicker" position="bottom" round>
        <van-picker
          :columns="tieredRewardTypeColumns"
          @confirm="onTieredRewardTypeConfirm"
          @cancel="showTieredRewardTypePicker = false"
          title="选择奖励类型"
        />
      </van-popup>
    </div>
  </MobileMainLayout>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import MobileMainLayout from '@/components/mobile/layouts/MobileMainLayout.vue'
import { request } from '@/utils/request'

const router = useRouter()

// 响应式数据
const selectedActivityId = ref('')
const selectedActivityTitle = ref('')
const saving = ref(false)
const showActivityPicker = ref(false)
const showDeadlinePicker = ref(false)
const showRewardTypePicker = ref(false)
const showTieredRewardTypePicker = ref(false)
const activeTiers = ref(['tier1'])

const activities = ref([])
const currentTierIndex = ref(0)

// 营销配置
const marketingConfig = reactive({
  groupBuy: {
    enabled: false,
    minPeople: 3,
    groupPrice: 0,
    deadline: ''
  },
  collect: {
    enabled: false,
    target: 50,
    rewardType: 'discount',
    discountPercent: 80
  },
  tiered: {
    enabled: false,
    tiers: [
      {
        tier: 1,
        targetValue: 10,
        rewardType: 'discount',
        rewardValue: '10',
        rewardDescription: '满10人享9折优惠'
      },
      {
        tier: 2,
        targetValue: 20,
        rewardType: 'gift',
        rewardValue: '精美玩具',
        rewardDescription: '满20人赠送精美玩具'
      }
    ]
  },
  referral: {
    enabled: false,
    reward: 10,
    maxRewards: 5
  }
})

// 计算属性
const activityColumns = computed(() => {
  return activities.value.map(activity => ({
    text: activity.title,
    value: activity.id
  }))
})

const rewardTypeColumns = [
  { text: '折扣优惠', value: 'discount' },
  { text: '赠送礼品', value: 'gift' },
  { text: '免费参与', value: 'free' }
]

const tieredRewardTypeColumns = [
  { text: '折扣优惠', value: 'discount' },
  { text: '赠送礼品', value: 'gift' },
  { text: '现金返还', value: 'cashback' },
  { text: '积分奖励', value: 'points' },
  { text: '免费名额', value: 'free' }
]

const rewardTypeLabel = computed(() => {
  const typeMap = {
    discount: '折扣优惠',
    gift: '赠送礼品',
    free: '免费参与'
  }
  return typeMap[marketingConfig.collect.rewardType] || '请选择'
})

const tieredRewardTypeLabels = computed(() => {
  return marketingConfig.tiered.tiers.map(tier => {
    const typeMap = {
      discount: '折扣优惠',
      gift: '赠送礼品',
      cashback: '现金返还',
      points: '积分奖励',
      free: '免费名额'
    }
    return typeMap[tier.rewardType] || '请选择'
  })
})

// 方法
const loadActivities = async () => {
  try {
    // 这里应该调用实际的API
    activities.value = [
      { id: '1', title: '春季亲子运动会' },
      { id: '2', title: '儿童节庆祝活动' },
      { id: '3', title: '暑期夏令营' }
    ]
  } catch (error) {
    console.error('Failed to load activities:', error)
    showToast('加载活动列表失败')
  }
}

const onActivityConfirm = ({ selectedOptions }) => {
  const option = selectedOptions[0]
  selectedActivityId.value = option.value
  selectedActivityTitle.value = option.text
  showActivityPicker.value = false
  loadMarketingConfig()
}

const onRewardTypeConfirm = ({ selectedOptions }) => {
  marketingConfig.collect.rewardType = selectedOptions[0].value
  showRewardTypePicker.value = false
}

const showTieredRewardTypePicker = (index: number) => {
  currentTierIndex.value = index
  showTieredRewardTypePicker.value = true
}

const onTieredRewardTypeConfirm = ({ selectedOptions }) => {
  marketingConfig.tiered.tiers[currentTierIndex.value].rewardType = selectedOptions[0].value
  showTieredRewardTypePicker.value = false
}

const loadMarketingConfig = async () => {
  if (!selectedActivityId.value) return

  try {
    // 这里应该调用实际的API加载活动的营销配置
    console.log('Loading marketing config for activity:', selectedActivityId.value)
  } catch (error) {
    console.error('Failed to load marketing config:', error)
    showToast('加载营销配置失败')
  }
}

const saveConfig = async () => {
  if (!selectedActivityId.value) {
    showToast('请先选择活动')
    return
  }

  saving.value = true
  try {
    // 这里应该调用实际的API保存营销配置
    console.log('Saving marketing config:', marketingConfig)

    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用

    showSuccessToast('营销配置保存成功')
  } catch (error) {
    console.error('Failed to save marketing config:', error)
    showFailToast('保存失败')
  } finally {
    saving.value = false
  }
}

const previewConfig = () => {
  showToast('预览功能开发中...')
}

// 组件挂载时加载数据
onMounted(() => {
  loadActivities()
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.mobile-marketing-config {
  padding: var(--spacing-md);
  background: var(--van-background-color-light);
  min-height: 100vh;
}

.activity-selector {
  margin-bottom: 16px;
}

.marketing-features {
  margin-bottom: 80px; // 为底部按钮留出空间
}

.tier-config {
  padding: var(--spacing-md);
  background: var(--van-background-color-light);
}

.empty-state {
  margin-top: 60px;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-md);
  background: var(--van-background-color-light);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.price-unit,
.unit {
  font-size: var(--text-sm);
  color: var(--van-text-color-2);
}

// 自定义折叠面板样式
:deep(.van-collapse-item) {
  background: var(--van-background-color-light);

  .van-collapse-item__title {
    color: var(--van-text-color);
    font-weight: 600;
  }
}

// 深色模式适配
:root[data-theme="dark"] {
  .mobile-marketing-config {
    background: var(--van-background-color-dark);
  }

  .tier-config {
    background: var(--van-background-color-dark);
  }

  .action-buttons {
    background: var(--van-background-color-dark);
  }
}
</style>