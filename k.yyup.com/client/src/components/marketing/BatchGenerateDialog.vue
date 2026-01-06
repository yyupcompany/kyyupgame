<template>
  <el-dialog
    v-model="visible"
    title="批量生成优惠券"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="优惠券类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="选择优惠券类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option label="满减券" value="reduce" />
          <el-option label="折扣券" value="discount" />
          <el-option label="礼品券" value="gift" />
          <el-option label="现金券" value="cash" />
        </el-select>
      </el-form-item>

      <el-form-item label="优惠券面值" prop="value">
        <el-input-number
          v-if="form.type === 'reduce' || form.type === 'cash'"
          v-model="form.value"
          :min="1"
          :max="10000"
          placeholder="输入面值金额"
          style="width: 100%"
        />
        <el-input-number
          v-else-if="form.type === 'discount'"
          v-model="form.value"
          :min="1"
          :max="99"
          placeholder="输入折扣比例"
          style="width: 100%"
        />
        <el-input
          v-else
          v-model="form.value"
          placeholder="输入礼品名称"
          maxlength="50"
        />
        <span class="unit-label">{{ getValueUnit(form.type) }}</span>
      </el-form-item>

      <el-form-item label="使用条件" prop="condition">
        <el-input
          v-model="form.condition"
          placeholder="例如：满100元可用，无限制则留空"
          maxlength="100"
        />
      </el-form-item>

      <el-form-item label="使用门槛" prop="minAmount" v-if="form.type === 'reduce'">
        <el-input-number
          v-model="form.minAmount"
          :min="0"
          placeholder="最低消费金额"
          style="width: 100%"
        />
        <span class="unit-label">元</span>
      </el-form-item>

      <el-form-item label="有效期限" prop="validityType">
        <el-radio-group v-model="form.validityType" @change="handleValidityTypeChange">
          <el-radio label="days">按天数</el-radio>
          <el-radio label="daterange">指定日期</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="有效天数" prop="validDays" v-if="form.validityType === 'days'">
        <el-input-number
          v-model="form.validDays"
          :min="1"
          :max="365"
          placeholder="从领取日开始计算"
          style="width: 100%"
        />
        <span class="unit-label">天</span>
      </el-form-item>

      <el-form-item label="有效期" prop="dateRange" v-if="form.validityType === 'daterange'">
        <el-date-picker
          v-model="form.dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="生成数量" prop="quantity">
        <el-input-number
          v-model="form.quantity"
          :min="1"
          :max="10000"
          placeholder="输入生成数量"
          style="width: 100%"
        />
        <span class="unit-label">张</span>
      </el-form-item>

      <el-form-item label="生成规则" prop="generateRule">
        <el-radio-group v-model="form.generateRule">
          <el-radio label="random">随机生成</el-radio>
          <el-radio label="prefix">前缀规则</el-radio>
          <el-radio label="custom">自定义规则</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="优惠券前缀" prop="prefix" v-if="form.generateRule === 'prefix'">
        <el-input
          v-model="form.prefix"
          placeholder="输入优惠券前缀"
          maxlength="10"
        />
        <div class="form-tip">前缀长度不能超过10个字符</div>
      </el-form-item>

      <el-form-item label="自定义规则" prop="customRule" v-if="form.generateRule === 'custom'">
        <el-input
          v-model="form.customRule"
          placeholder="例如：SPRING{####} 表示SPRING开头，后跟4位数字"
          maxlength="50"
        />
        <div class="form-tip">使用 {####} 表示随机数字，{####AA} 表示数字+字母组合</div>
      </el-form-item>

      <el-form-item label="优惠券描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="输入优惠券使用说明"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="适用范围" prop="applicableScope">
        <el-checkbox-group v-model="form.applicableScope">
          <el-checkbox value="all">全部活动</el-checkbox>
          <el-checkbox value="enrollment">招生报名</el-checkbox>
          <el-checkbox value="courses">课程购买</el-checkbox>
          <el-checkbox value="activities">活动报名</el-checkbox>
          <el-checkbox value="merchandise">商品购买</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="每人限领" prop="limitPerPerson">
        <el-input-number
          v-model="form.limitPerPerson"
          :min="1"
          :max="10"
          placeholder="每人最多可领取数量"
          style="width: 100%"
        />
        <span class="unit-label">张</span>
      </el-form-item>

      <!-- 预览区域 -->
      <el-divider>预览</el-divider>
      <div class="preview-section">
        <div class="preview-coupons">
          <div v-for="(code, index) in previewCodes" :key="index" class="preview-coupon">
            <div class="coupon-code">{{ code }}</div>
            <div class="coupon-info">
              <span class="coupon-type">{{ getTypeText(form.type) }}</span>
              <span class="coupon-value">{{ formatCouponValue(form.type, form.value) }}</span>
            </div>
          </div>
        </div>
        <el-button @click="generatePreview" :loading="previewLoading">
          生成预览
        </el-button>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          批量生成
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { request } from '@/utils/request'
import { COUPON_ENDPOINTS } from '@/api/endpoints/marketing'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const previewLoading = ref(false)
const formRef = ref<FormInstance>()
const previewCodes = ref<string[]>([])

// 表单数据
const form = reactive({
  type: '',
  value: null as number | string | null,
  condition: '',
  minAmount: 0,
  validityType: 'days',
  validDays: 30,
  dateRange: [] as string[],
  quantity: 100,
  generateRule: 'random',
  prefix: '',
  customRule: '',
  description: '',
  applicableScope: [] as string[],
  limitPerPerson: 1
})

// 表单验证规则
const rules: FormRules = {
  type: [
    { required: true, message: '请选择优惠券类型', trigger: 'change' }
  ],
  value: [
    { required: true, message: '请输入优惠券面值', trigger: 'blur' }
  ],
  validityType: [
    { required: true, message: '请选择有效期限类型', trigger: 'change' }
  ],
  validDays: [
    { required: true, message: '请输入有效天数', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '有效天数必须在1-365之间', trigger: 'blur' }
  ],
  dateRange: [
    { required: true, message: '请选择有效期', trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请输入生成数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 10000, message: '生成数量必须在1-10000之间', trigger: 'blur' }
  ],
  generateRule: [
    { required: true, message: '请选择生成规则', trigger: 'change' }
  ],
  prefix: [
    { required: true, message: '请输入优惠券前缀', trigger: 'blur' }
  ],
  customRule: [
    { required: true, message: '请输入自定义规则', trigger: 'blur' }
  ],
  applicableScope: [
    { required: true, message: '请选择适用范围', trigger: 'change', type: 'array', min: 1 }
  ],
  limitPerPerson: [
    { required: true, message: '请输入每人限领数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '每人限领数量必须在1-10之间', trigger: 'blur' }
  ]
}

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const resetForm = () => {
  Object.assign(form, {
    type: '',
    value: null,
    condition: '',
    minAmount: 0,
    validityType: 'days',
    validDays: 30,
    dateRange: [],
    quantity: 100,
    generateRule: 'random',
    prefix: '',
    customRule: '',
    description: '',
    applicableScope: [],
    limitPerPerson: 1
  })
  previewCodes.value = []
  formRef.value?.clearValidate()
}

const handleClose = () => {
  resetForm()
}

const handleCancel = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    await ElMessageBox.confirm(
      `确定要批量生成 ${form.quantity} 张优惠券吗？`,
      '确认生成',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    loading.value = true

    // 处理时间数据
    let startTime, endTime
    if (form.validityType === 'days') {
      startTime = new Date().toISOString()
      endTime = new Date(Date.now() + form.validDays * 24 * 60 * 60 * 1000).toISOString()
    } else {
      if (form.dateRange && form.dateRange.length === 2) {
        startTime = form.dateRange[0]
        endTime = form.dateRange[1]
      }
    }

    const payload = {
      ...form,
      startTime,
      endTime,
      batchGenerate: true
    }

    const response = await request.post(COUPON_ENDPOINTS.BATCH_GENERATE, payload)

    if (response.success) {
      ElMessage.success(`成功生成 ${response.data.count} 张优惠券`)
      emit('success', response.data)
      visible.value = false
      resetForm()
    } else {
      throw new Error(response.message || '批量生成失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      if (error.message) {
        ElMessage.error(error.message)
      }
    }
  } finally {
    loading.value = false
  }
}

const generatePreview = async () => {
  if (!form.type || !form.value) {
    ElMessage.warning('请先填写优惠券类型和面值')
    return
  }

  previewLoading.value = true
  try {
    const payload = {
      type: form.type,
      value: form.value,
      generateRule: form.generateRule,
      prefix: form.prefix,
      customRule: form.customRule,
      previewCount: 5
    }

    const response = await request.post(COUPON_ENDPOINTS.PREVIEW_CODES, payload)

    if (response.success) {
      previewCodes.value = response.data.codes
    }
  } catch (error) {
    console.error('生成预览失败:', error)
    ElMessage.error('生成预览失败')
  } finally {
    previewLoading.value = false
  }
}

const handleTypeChange = () => {
  form.value = null
}

const handleValidityTypeChange = () => {
  form.validDays = 30
  form.dateRange = []
}

const getValueUnit = (type: string) => {
  const unitMap: Record<string, string> = {
    'reduce': '元',
    'discount': '折',
    'gift': '',
    'cash': '元'
  }
  return unitMap[type] || ''
}

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'reduce': '满减券',
    'discount': '折扣券',
    'gift': '礼品券',
    'cash': '现金券'
  }
  return textMap[type] || type
}

const formatCouponValue = (type: string, value: number | string | null) => {
  if (!value) return ''
  switch (type) {
    case 'reduce':
    case 'cash':
      return `¥${value}`
    case 'discount':
      return `${value}折`
    case 'gift':
      return String(value)
    default:
      return String(value)
  }
}
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.unit-label {
  margin-left: 12px;
  color: #909399;
}

.form-tip {
  margin-top: 4px;
  font-size: var(--text-xs);
  color: #909399;
}

.preview-section {
  .preview-coupons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: 16px;
    max-height: 200px;
    overflow-y: auto;

    .preview-coupon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md) 16px;
      background: #f8f9fa;
      border: 1px dashed #dcdfe6;
      border-radius: 6px;

      .coupon-code {
        font-family: 'Courier New', monospace;
        font-weight: 600;
        color: #409eff;
      }

      .coupon-info {
        display: flex;
        gap: var(--spacing-md);
        font-size: var(--text-sm);

        .coupon-type {
          color: #909399;
        }

        .coupon-value {
          font-weight: 600;
          color: #67c23a;
        }
      }
    }
  }
}
</style>