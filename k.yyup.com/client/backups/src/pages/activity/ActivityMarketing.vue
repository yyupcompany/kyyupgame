<template>
  <div class="activity-marketing">
    <PageWrapper title="活动营销配置" :auto-empty-state="false">
      <!-- 页面头部 -->
      <div class="page-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/centers/activity' }">活动中心</el-breadcrumb-item>
          <el-breadcrumb-item>营销配置</el-breadcrumb-item>
        </el-breadcrumb>
        <h1>活动营销配置</h1>
        <p>为活动配置团购、积攒、优惠券等营销策略，提高活动参与度和转化率</p>
      </div>

      <!-- 活动选择 -->
      <el-card class="activity-selector" shadow="never">
        <template #header>
          <div class="card-header">
            <span>选择活动</span>
          </div>
        </template>
        <el-select
          v-model="selectedActivityId"
          placeholder="请选择要配置营销策略的活动"
          style="width: 100%"
          @change="loadActivityMarketingConfig"
        >
          <el-option
            v-for="activity in activities"
            :key="activity.id"
            :label="activity.title"
            :value="activity.id"
          >
            <span style="float: left">{{ activity.title }}</span>
            <span style="float: right; color: #8492a6; font-size: var(--text-sm)">
              {{ activity.status === 'DRAFT' ? '草稿' : activity.status === 'PUBLISHED' ? '已发布' : '进行中' }}
            </span>
          </el-option>
        </el-select>
      </el-card>

      <!-- 营销配置面板 -->
      <div v-if="selectedActivityId" class="marketing-config-panel">
        <el-tabs v-model="activeTab" type="card">
          <!-- 团购设置 -->
          <el-tab-pane label="团购活动" name="group">
            <el-card shadow="never">
              <template #header>
                <div class="config-header">
                  <span>🛒 团购活动配置</span>
                  <el-switch
                    v-model="marketingConfig.groupBuy.enabled"
                    active-text="启用"
                    inactive-text="关闭"
                  />
                </div>
              </template>
              
              <div v-if="marketingConfig.groupBuy.enabled" class="config-content">
                <el-form label-width="120px">
                  <el-form-item label="成团人数">
                    <el-input-number
                      v-model="marketingConfig.groupBuy.minPeople"
                      :min="2"
                      :max="50"
                      placeholder="最少成团人数"
                    />
                    <span class="form-tip">至少{{ marketingConfig.groupBuy.minPeople }}人才能成团</span>
                  </el-form-item>

                  <el-form-item label="团购价格">
                    <el-input-number
                      v-model="marketingConfig.groupBuy.price"
                      :min="0"
                      :precision="2"
                      placeholder="团购优惠价格"
                    />
                    <span class="form-tip">团购成功后的优惠价格</span>
                  </el-form-item>

                  <el-form-item label="团购截止">
                    <el-date-picker
                      v-model="marketingConfig.groupBuy.deadline"
                      type="datetime"
                      placeholder="选择团购截止时间"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </el-tab-pane>

          <!-- 积攒设置 -->
          <el-tab-pane label="积攒活动" name="collect">
            <el-card shadow="never">
              <template #header>
                <div class="config-header">
                  <span>💰 积攒活动配置</span>
                  <el-switch
                    v-model="marketingConfig.collect.enabled"
                    active-text="启用"
                    inactive-text="关闭"
                  />
                </div>
              </template>
              
              <div v-if="marketingConfig.collect.enabled" class="config-content">
                <el-form label-width="120px">
                  <el-form-item label="积攒目标">
                    <el-input-number
                      v-model="marketingConfig.collect.target"
                      :min="10"
                      :max="1000"
                      placeholder="积攒目标人数"
                    />
                    <span class="form-tip">需要{{ marketingConfig.collect.target }}人积攒才能享受优惠</span>
                  </el-form-item>

                  <el-form-item label="积攒奖励">
                    <el-radio-group v-model="marketingConfig.collect.rewardType">
                      <el-radio label="discount">折扣优惠</el-radio>
                      <el-radio label="gift">赠送礼品</el-radio>
                      <el-radio label="free">免费参与</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item v-if="marketingConfig.collect.rewardType === 'discount'" label="折扣比例">
                    <el-input-number
                      v-model="marketingConfig.collect.discountPercent"
                      :min="10"
                      :max="90"
                      placeholder="折扣百分比"
                    />
                    <span class="form-tip">{{ marketingConfig.collect.discountPercent }}% 折扣</span>
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </el-tab-pane>

          <!-- 优惠券设置 -->
          <el-tab-pane label="优惠券" name="coupon">
            <el-card shadow="never">
              <template #header>
                <div class="config-header">
                  <span>🎫 优惠券配置</span>
                  <el-switch
                    v-model="marketingConfig.coupon.enabled"
                    active-text="启用"
                    inactive-text="关闭"
                  />
                </div>
              </template>
              
              <div v-if="marketingConfig.coupon.enabled" class="config-content">
                <el-form label-width="120px">
                  <el-form-item label="优惠券类型">
                    <el-radio-group v-model="marketingConfig.coupon.type">
                      <el-radio label="reduce">满减券</el-radio>
                      <el-radio label="discount">折扣券</el-radio>
                      <el-radio label="gift">礼品券</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label="发放数量">
                    <el-input-number
                      v-model="marketingConfig.coupon.quantity"
                      :min="1"
                      :max="10000"
                      placeholder="优惠券发放数量"
                    />
                    <span class="form-tip">限量{{ marketingConfig.coupon.quantity }}张</span>
                  </el-form-item>

                  <el-form-item label="使用条件">
                    <el-input
                      v-model="marketingConfig.coupon.condition"
                      placeholder="如：满100元可用"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </el-tab-pane>

          <!-- 推荐奖励设置 -->
          <el-tab-pane label="推荐奖励" name="referral">
            <el-card shadow="never">
              <template #header>
                <div class="config-header">
                  <span>🎁 推荐奖励配置</span>
                  <el-switch
                    v-model="marketingConfig.referral.enabled"
                    active-text="启用"
                    inactive-text="关闭"
                  />
                </div>
              </template>
              
              <div v-if="marketingConfig.referral.enabled" class="config-content">
                <el-form label-width="120px">
                  <el-form-item label="推荐奖励">
                    <el-input-number
                      v-model="marketingConfig.referral.reward"
                      :min="1"
                      :max="1000"
                      :precision="2"
                      placeholder="推荐奖励金额"
                    />
                    <span class="form-tip">每成功推荐一人奖励 ¥{{ marketingConfig.referral.reward }}</span>
                  </el-form-item>

                  <el-form-item label="最大奖励次数">
                    <el-input-number
                      v-model="marketingConfig.referral.maxRewards"
                      :min="1"
                      :max="100"
                      placeholder="单人最大获奖次数"
                    />
                    <span class="form-tip">每人最多可获得{{ marketingConfig.referral.maxRewards }}次奖励</span>
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </el-tab-pane>
        </el-tabs>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button @click="$router.go(-1)">返回</el-button>
          <el-button type="primary" @click="saveMarketingConfig" :loading="saving">
            保存配置
          </el-button>
          <el-button type="success" @click="previewMarketing">
            预览效果
          </el-button>
        </div>
      </div>
    </PageWrapper>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageWrapper from '@/components/common/PageWrapper.vue'

// 响应式数据
const selectedActivityId = ref('')
const activeTab = ref('group')
const activities = ref([])
const saving = ref(false)

// 营销配置
const marketingConfig = reactive({
  groupBuy: {
    enabled: false,
    minPeople: 3,
    price: 0,
    deadline: ''
  },
  collect: {
    enabled: false,
    target: 50,
    rewardType: 'discount',
    discountPercent: 80
  },
  coupon: {
    enabled: false,
    type: 'reduce',
    quantity: 100,
    condition: ''
  },
  referral: {
    enabled: false,
    reward: 10,
    maxRewards: 5
  }
})

// 加载活动列表
const loadActivities = async () => {
  try {
    // 这里应该调用实际的API
    activities.value = [
      { id: '1', title: '春季亲子运动会', status: 'DRAFT' },
      { id: '2', title: '儿童节庆祝活动', status: 'PUBLISHED' },
      { id: '3', title: '暑期夏令营', status: 'REGISTRATION_OPEN' }
    ]
  } catch (error) {
    console.error('Failed to load activities:', error)
    ElMessage.error('加载活动列表失败')
  }
}

// 加载活动营销配置
const loadActivityMarketingConfig = async () => {
  if (!selectedActivityId.value) return
  
  try {
    // 这里应该调用实际的API加载活动的营销配置
    console.log('Loading marketing config for activity:', selectedActivityId.value)
  } catch (error) {
    console.error('Failed to load marketing config:', error)
    ElMessage.error('加载营销配置失败')
  }
}

// 保存营销配置
const saveMarketingConfig = async () => {
  if (!selectedActivityId.value) {
    ElMessage.warning('请先选择活动')
    return
  }

  saving.value = true
  try {
    // 这里应该调用实际的API保存营销配置
    console.log('Saving marketing config:', marketingConfig)
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟API调用
    
    ElMessage.success('营销配置保存成功')
  } catch (error) {
    console.error('Failed to save marketing config:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 预览营销效果
const previewMarketing = () => {
  ElMessage.info('预览功能开发中...')
}

// 组件挂载时加载数据
onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.activity-marketing {
  padding: var(--text-2xl);
}

.page-header {
  margin-bottom: var(--text-2xl);
}

.page-header h1 {
  margin: var(--spacing-2xl) 0;
  color: var(--text-primary);
}

.page-header p {
  color: var(--text-regular);
  margin: 0;
}

.activity-selector {
  margin-bottom: var(--text-2xl);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-content {
  padding: var(--text-2xl) 0;
}

.form-tip {
  margin-left: var(--spacing-2xl);
  color: var(--info-color);
  font-size: var(--text-sm);
}

.action-buttons {
  margin-top: var(--spacing-8xl);
  text-align: center;
}

.action-buttons .el-button {
  margin: 0 10px;
}

.marketing-config-panel {
  margin-top: var(--text-2xl);
}
</style>
