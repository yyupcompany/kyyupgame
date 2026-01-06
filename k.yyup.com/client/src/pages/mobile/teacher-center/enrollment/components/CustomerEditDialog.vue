<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '85%' }"
    round
  >
    <div class="customer-edit-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-nav-bar
          :title="isEdit ? '编辑客户' : '添加客户'"
          left-text="取消"
          right-text="保存"
          @click-left="handleClose"
          @click-right="handleSave"
        />
      </div>

      <!-- 表单内容 -->
      <div class="dialog-content">
        <van-form @submit="handleSave" ref="formRef">
          <van-cell-group inset title="客户信息">
            <van-field
              v-model="formData.name"
              name="name"
              label="客户姓名"
              placeholder="请输入客户姓名"
              :rules="[{ required: true, message: '请输入客户姓名' }]"
            />

            <van-field
              v-model="formData.phone"
              name="phone"
              label="联系电话"
              type="tel"
              placeholder="请输入联系电话"
              :rules="[
                { required: true, message: '请输入联系电话' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
              ]"
            />
          </van-cell-group>

          <van-cell-group inset title="孩子信息">
            <van-field
              v-model="formData.childName"
              name="childName"
              label="孩子姓名"
              placeholder="请输入孩子姓名"
              :rules="[{ required: true, message: '请输入孩子姓名' }]"
            />

            <van-field
              name="childAge"
              label="孩子年龄"
              readonly
              is-link
              @click="showAgePicker = true"
            >
              <template #input>
                <span>{{ formData.childAge }}岁</span>
              </template>
            </van-field>

            <van-field name="childGender" label="孩子性别" readonly is-link @click="showGenderPicker = true">
              <template #input>
                <span>{{ formData.childGender }}</span>
              </template>
            </van-field>
          </van-cell-group>

          <van-cell-group inset title="其他信息">
            <van-field
              name="source"
              label="来源渠道"
              readonly
              is-link
              @click="showSourcePicker = true"
            >
              <template #input>
                <span>{{ formData.source || '请选择' }}</span>
              </template>
            </van-field>

            <van-field
              v-model="formData.remark"
              name="remark"
              label="备注"
              type="textarea"
              rows="3"
              placeholder="请输入备注信息"
            />
          </van-cell-group>
        </van-form>
      </div>

      <!-- 年龄选择器 -->
      <van-popup v-model:show="showAgePicker" position="bottom">
        <van-picker
          :columns="ageColumns"
          @confirm="onAgeConfirm"
          @cancel="showAgePicker = false"
        />
      </van-popup>

      <!-- 性别选择器 -->
      <van-popup v-model:show="showGenderPicker" position="bottom">
        <van-picker
          :columns="genderColumns"
          @confirm="onGenderConfirm"
          @cancel="showGenderPicker = false"
        />
      </van-popup>

      <!-- 来源选择器 -->
      <van-popup v-model:show="showSourcePicker" position="bottom">
        <van-picker
          :columns="sourceColumns"
          @confirm="onSourceConfirm"
          @cancel="showSourcePicker = false"
        />
      </van-popup>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { createCustomer, updateCustomer } from '@/api/modules/customer'

interface Customer {
  id?: string
  name?: string
  phone?: string
  childName?: string
  childAge?: number
  childGender?: string
  source?: string
  remark?: string
}

interface Props {
  modelValue: boolean
  customerData: Customer | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  refresh: []
}>()

// 响应式数据
const formRef = ref()
const showAgePicker = ref(false)
const showGenderPicker = ref(false)
const showSourcePicker = ref(false)

const formData = ref<Customer>({
  name: '',
  phone: '',
  childName: '',
  childAge: 3,
  childGender: '男',
  source: '',
  remark: ''
})

// 选项数据
const ageColumns = Array.from({ length: 10 }, (_, i) => i + 1).map(age => ({ text: `${age}岁`, value: age }))
const genderColumns = [
  { text: '男', value: '男' },
  { text: '女', value: '女' }
]
const sourceColumns = [
  { text: '官网咨询', value: '官网咨询' },
  { text: '电话咨询', value: '电话咨询' },
  { text: '朋友推荐', value: '朋友推荐' },
  { text: '线下活动', value: '线下活动' },
  { text: '其他', value: '其他' }
]

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.customerData?.id)

// 监听弹窗显示状态
watch(() => props.modelValue, (visible) => {
  if (visible && props.customerData) {
    // 编辑模式：填充数据
    formData.value = { ...props.customerData }
  } else if (visible) {
    // 新建模式：重置表单
    resetForm()
  }
})

// 方法
const handleClose = () => {
  emit('update:modelValue', false)
}

const resetForm = () => {
  formData.value = {
    name: '',
    phone: '',
    childName: '',
    childAge: 3,
    childGender: '男',
    source: '',
    remark: ''
  }
}

// 选择器确认处理
const onAgeConfirm = ({ selectedOptions }: any) => {
  formData.value.childAge = selectedOptions[0].value
  showAgePicker.value = false
}

const onGenderConfirm = ({ selectedOptions }: any) => {
  formData.value.childGender = selectedOptions[0].value
  showGenderPicker.value = false
}

const onSourceConfirm = ({ selectedOptions }: any) => {
  formData.value.source = selectedOptions[0].value
  showSourcePicker.value = false
}

const handleSave = async () => {
  try {
    // 验证表单
    await formRef.value.validate()

    showLoadingToast({ message: '保存中...', forbidClick: true })

    if (isEdit.value) {
      // 更新客户
      await updateCustomer(props.customerData!.id!, formData.value)
      showToast('客户信息更新成功')
    } else {
      // 创建客户
      await createCustomer(formData.value)
      showToast('客户添加成功')
    }

    emit('refresh')
    handleClose()
  } catch (error: any) {
    console.error('保存客户失败:', error)
    showToast(error.message || '保存失败')
  } finally {
    closeToast()
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.customer-edit-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;

  .dialog-header {
    flex-shrink: 0;
  }

  .dialog-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md) 0;
  }

  :deep(.van-cell-group) {
    margin-bottom: 12px;
  }

  :deep(.van-cell-group__title) {
    font-weight: 600;
    color: var(--primary-color);
  }
}
</style>
