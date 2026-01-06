<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="优惠券标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入优惠券标题"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

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

      <el-form-item label="发放数量" prop="quantity">
        <el-input-number
          v-model="form.quantity"
          :min="1"
          :max="10000"
          placeholder="输入发放数量"
          style="width: 100%"
        />
        <span class="unit-label">张</span>
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
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ coupon ? '更新' : '创建' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { request } from '@/utils/request'
import { COUPON_ENDPOINTS } from '@/api/endpoints/marketing'

interface Props {
  modelValue: boolean
  coupon?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  title: '',
  type: '',
  value: null as number | string | null,
  condition: '',
  minAmount: 0,
  validityType: 'days',
  validDays: 30,
  dateRange: [] as string[],
  quantity: 100,
  description: '',
  applicableScope: [] as string[],
  limitPerPerson: 1
})

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入优惠券标题', trigger: 'blur' }
  ],
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
    { required: true, message: '请输入发放数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 10000, message: '发放数量必须在1-10000之间', trigger: 'blur' }
  ],
  applicableScope: [
    { required: true, message: '请选择适用范围', trigger: 'change', type: 'array', min: 1 }
  ],
  limitPerPerson: [
    { required: true, message: '请输入每人限领数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '每人限领数量必须在1-10之间', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return props.coupon ? '编辑优惠券' : '创建优惠券'
})

const coupon = computed(() => props.coupon)

// 监听器
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    if (props.coupon) {
      // 编辑模式，填充表单数据
      Object.assign(form, {
        title: props.coupon.title,
        type: props.coupon.type,
        value: props.coupon.value,
        condition: props.coupon.condition || '',
        minAmount: props.coupon.minAmount || 0,
        validityType: props.coupon.validityType || 'days',
        validDays: props.coupon.validDays || 30,
        dateRange: props.coupon.dateRange || [],
        quantity: props.coupon.quantity || 100,
        description: props.coupon.description || '',
        applicableScope: props.coupon.applicableScope || [],
        limitPerPerson: props.coupon.limitPerPerson || 1
      })
    } else {
      // 新建模式，重置表单
      resetForm()
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const resetForm = () => {
  Object.assign(form, {
    title: '',
    type: '',
    value: null,
    condition: '',
    minAmount: 0,
    validityType: 'days',
    validDays: 30,
    dateRange: [],
    quantity: 100,
    description: '',
    applicableScope: [],
    limitPerPerson: 1
  })
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

    loading.value = true

    const isEdit = !!props.coupon
    const url = isEdit
      ? COUPON_ENDPOINTS.UPDATE(props.coupon.id)
      : COUPON_ENDPOINTS.CREATE
    const method = isEdit ? 'put' : 'post'

    // 处理时间数据
    let startTime, endTime
    if (form.validityType === 'days') {
      // 按天数的，发放时开始时间为当前时间
      startTime = new Date().toISOString()
      endTime = new Date(Date.now() + form.validDays * 24 * 60 * 60 * 1000).toISOString()
    } else {
      // 指定日期的
      if (form.dateRange && form.dateRange.length === 2) {
        startTime = form.dateRange[0]
        endTime = form.dateRange[1]
      }
    }

    const payload = {
      ...form,
      startTime,
      endTime
    }

    const response = await request[method](url, payload)

    if (response.success) {
      ElMessage.success(`优惠券${isEdit ? '更新' : '创建'}成功`)
      emit('success', response.data)
      visible.value = false
      resetForm()
    } else {
      throw new Error(response.message || '操作失败')
    }
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    loading.value = false
  }
}

const handleTypeChange = () => {
  // 清空面值
  form.value = null
}

const handleValidityTypeChange = () => {
  // 清空相关字段
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
</style>