<template>
  <div class="form-field" :class="fieldClass">
    <!-- 文本输入框 -->
    <van-field
      v-if="isTextField"
      :model-value="fieldValue"
      :name="field.name"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="field.required"
      :disabled="disabled"
      :readonly="readonly"
      :rules="field.rules"
      :maxlength="field.maxlength"
      :show-word-limit="field.showWordLimit"
      :type="getInputType()"
      :class="field.className"
      @update:model-value="updateValue"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- 文本域 -->
    <van-field
      v-else-if="field.type === 'textarea'"
      :model-value="fieldValue"
      :name="field.name"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="field.required"
      :disabled="disabled"
      :readonly="readonly"
      :rules="field.rules"
      :maxlength="field.maxlength"
      :show-word-limit="field.showWordLimit"
      type="textarea"
      :rows="field.rows || 3"
      autosize
      :class="field.className"
      @update:model-value="updateValue"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <!-- 选择器 -->
    <van-field
      v-else-if="field.type === 'select'"
      :model-value="displayValue"
      :name="field.name"
      :label="field.label"
      :placeholder="field.placeholder"
      :required="field.required"
      :disabled="disabled"
      :readonly="true"
      :rules="field.rules"
      is-link
      :class="['field-select', field.className]"
      @click="showPicker = true"
    >
      <template #right-icon>
        <van-icon name="arrow" />
      </template>
    </van-field>

    <!-- 单选框 -->
    <van-field
      v-else-if="field.type === 'radio'"
      :name="field.name"
      :label="field.label"
      :required="field.required"
      :rules="field.rules"
      :class="['field-radio', field.className]"
    >
      <template #input>
        <van-radio-group
          :model-value="fieldValue"
          :disabled="disabled"
          direction="horizontal"
          @update:model-value="updateValue"
        >
          <van-radio
            v-for="option in field.options"
            :key="option.value"
            :name="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>

    <!-- 复选框 -->
    <van-field
      v-else-if="field.type === 'checkbox'"
      :name="field.name"
      :label="field.label"
      :required="field.required"
      :rules="field.rules"
      :class="['field-checkbox', field.className]"
    >
      <template #input>
        <van-checkbox-group
          :model-value="fieldValue"
          :disabled="disabled"
          direction="horizontal"
          @update:model-value="updateValue"
        >
          <van-checkbox
            v-for="option in field.options"
            :key="option.value"
            :name="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </van-checkbox>
        </van-checkbox-group>
      </template>
    </van-field>

    <!-- 开关 -->
    <van-field
      v-else-if="field.type === 'switch'"
      :name="field.name"
      :label="field.label"
      :required="field.required"
      :rules="field.rules"
      :class="['field-switch', field.className]"
    >
      <template #input>
        <van-switch
          :model-value="fieldValue"
          :disabled="disabled"
          size="20px"
          @update:model-value="updateValue"
        />
      </template>
    </van-field>

    <!-- 日期选择器 -->
    <van-field
      v-else-if="field.type === 'date'"
      :model-value="displayValue"
      :name="field.name"
      :label="field.label"
      :placeholder="field.placeholder || '请选择日期'"
      :required="field.required"
      :disabled="disabled"
      :readonly="true"
      :rules="field.rules"
      is-link
      :class="['field-date', field.className]"
      @click="showDatePicker = true"
    >
      <template #right-icon>
        <van-icon name="calendar-o" />
      </template>
    </van-field>

    <!-- 日期时间选择器 -->
    <van-field
      v-else-if="field.type === 'datetime'"
      :model-value="displayValue"
      :name="field.name"
      :label="field.label"
      :placeholder="field.placeholder || '请选择日期时间'"
      :required="field.required"
      :disabled="disabled"
      :readonly="true"
      :rules="field.rules"
      is-link
      :class="['field-datetime', field.className]"
      @click="showDateTimePicker = true"
    >
      <template #right-icon>
        <van-icon name="clock-o" />
      </template>
    </van-field>

    <!-- 时间选择器 -->
    <van-field
      v-else-if="field.type === 'time'"
      :model-value="displayValue"
      :name="field.name"
      :label="field.label"
      :placeholder="field.placeholder || '请选择时间'"
      :required="field.required"
      :disabled="disabled"
      :readonly="true"
      :rules="field.rules"
      is-link
      :class="['field-time', field.className]"
      @click="showTimePicker = true"
    >
      <template #right-icon>
        <van-icon name="clock-o" />
      </template>
    </van-field>

    <!-- 文件上传 -->
    <van-field
      v-else-if="field.type === 'upload'"
      :name="field.name"
      :label="field.label"
      :required="field.required"
      :rules="field.rules"
      :class="['field-upload', field.className]"
    >
      <template #input>
        <van-uploader
          :model-value="fieldValue"
          :disabled="disabled"
          :multiple="field.multiple"
          :max-count="field.maxCount || 1"
          :accept="field.accept"
          :preview-size="60"
          @update:model-value="updateValue"
          @oversize="handleOversize"
          @delete="handleDelete"
        />
      </template>
    </van-field>

    <!-- 评分 -->
    <van-field
      v-else-if="field.type === 'rate'"
      :name="field.name"
      :label="field.label"
      :required="field.required"
      :rules="field.rules"
      :class="['field-rate', field.className]"
    >
      <template #input>
        <van-rate
          :model-value="fieldValue"
          :disabled="disabled"
          :count="5"
          :size="20"
          color="#ffd21e"
          void-icon="star"
          void-color="#eee"
          @update:model-value="updateValue"
        />
      </template>
    </van-field>

    <!-- 滑块 -->
    <van-field
      v-else-if="field.type === 'slider'"
      :name="field.name"
      :label="field.label"
      :required="field.required"
      :rules="field.rules"
      :class="['field-slider', field.className]"
    >
      <template #input>
        <van-slider
          :model-value="fieldValue"
          :disabled="disabled"
          :min="field.min || 0"
          :max="field.max || 100"
          :step="field.step || 1"
          :bar-height="4"
          button-size="20"
          @update:model-value="updateValue"
        />
        <div class="slider-value">{{ fieldValue }}</div>
      </template>
    </van-field>

    <!-- 自定义字段插槽 -->
    <slot v-else :name="field.name" :field="field" :value="fieldValue" :update-value="updateValue" />
  </div>

  <!-- 选择器弹窗 -->
  <van-popup v-model:show="showPicker" position="bottom" round>
    <van-picker
      :columns="pickerColumns"
      :title="field.label"
      @confirm="handlePickerConfirm"
      @cancel="showPicker = false"
    />
  </van-popup>

  <!-- 日期选择器弹窗 -->
  <van-popup v-model:show="showDatePicker" position="bottom" round>
    <van-date-picker
      :model-value="dateValue"
      :title="field.label"
      :min-date="field.minDate"
      :max-date="field.maxDate"
      @confirm="handleDateConfirm"
      @cancel="showDatePicker = false"
    />
  </van-popup>

  <!-- 日期时间选择器弹窗 -->
  <van-popup v-model:show="showDateTimePicker" position="bottom" round>
    <van-date-picker
      :model-value="dateTimeValue"
      :title="field.label"
      type="datetime"
      :min-date="field.minDate"
      :max-date="field.maxDate"
      @confirm="handleDateTimeConfirm"
      @cancel="showDateTimePicker = false"
    />
  </van-popup>

  <!-- 时间选择器弹窗 -->
  <van-popup v-model:show="showTimePicker" position="bottom" round>
    <van-time-picker
      :model-value="timeValue"
      :title="field.label"
      @confirm="handleTimeConfirm"
      @cancel="showTimePicker = false"
    />
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { showToast } from 'vant'
import type { FormField } from './MobileFormEnhanced.vue'

interface Props {
  field: FormField
  formData: Record<string, any>
  disabled?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  update: [fieldName: string, value: any, field: FormField]
  focus: [fieldName: string, field: FormField]
  blur: [fieldName: string, field: FormField]
}>()

// 弹窗状态
const showPicker = ref(false)
const showDatePicker = ref(false)
const showDateTimePicker = ref(false)
const showTimePicker = ref(false)

// 字段值
const fieldValue = computed(() => props.formData[props.field.name] ?? props.field.defaultValue ?? '')

// 计算属性
const isTextField = computed(() => {
  return ['text', 'password', 'number', 'email', 'tel'].includes(props.field.type)
})

const fieldClass = computed(() => {
  return [
    `field-${props.field.type}`,
    {
      'field-disabled': props.disabled,
      'field-readonly': props.readonly,
      'field-required': props.field.required
    }
  ]
})

// 显示值
const displayValue = computed(() => {
  const value = fieldValue.value

  if (props.field.type === 'select' && props.field.options) {
    const option = props.field.options.find(opt => opt.value === value)
    return option?.label || ''
  }

  if (['date', 'datetime', 'time'].includes(props.field.type)) {
    if (!value) return ''

    if (props.field.type === 'date') {
      return formatDate(value, 'YYYY-MM-DD')
    } else if (props.field.type === 'datetime') {
      return formatDate(value, 'YYYY-MM-DD HH:mm')
    } else if (props.field.type === 'time') {
      return formatDate(value, 'HH:mm')
    }
  }

  return value
})

// 选择器列数据
const pickerColumns = computed(() => {
  if (props.field.type === 'select' && props.field.options) {
    return props.field.options.map(option => ({
      text: option.label,
      value: option.value,
      disabled: option.disabled
    }))
  }
  return []
})

// 日期值
const dateValue = computed(() => {
  const value = fieldValue.value
  return value ? new Date(value) : new Date()
})

const dateTimeValue = computed(() => {
  const value = fieldValue.value
  return value ? new Date(value) : new Date()
})

const timeValue = computed(() => {
  const value = fieldValue.value
  if (value) {
    const [hours, minutes] = value.split(':')
    return new Date(2000, 0, 1, parseInt(hours), parseInt(minutes))
  }
  return new Date(2000, 0, 1, 0, 0)
})

// 方法
const getInputType = () => {
  const typeMap: Record<string, string> = {
    text: 'text',
    password: 'password',
    number: 'number',
    email: 'email',
    tel: 'tel'
  }
  return typeMap[props.field.type] || 'text'
}

const formatDate = (date: string | Date, format: string) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
}

const updateValue = (value: any) => {
  emit('update', props.field.name, value, props.field)
}

const handleFocus = () => {
  emit('focus', props.field.name, props.field)
}

const handleBlur = () => {
  emit('blur', props.field.name, props.field)
}

// 选择器确认
const handlePickerConfirm = ({ selectedValues }: any) => {
  updateValue(selectedValues[0])
  showPicker.value = false
}

// 日期确认
const handleDateConfirm = ({ selectedValues }: any) => {
  const [year, month, day] = selectedValues
  const date = new Date(year, month - 1, day)
  updateValue(date.toISOString().split('T')[0])
  showDatePicker.value = false
}

// 日期时间确认
const handleDateTimeConfirm = ({ selectedValues }: any) => {
  const [year, month, day, hours, minutes] = selectedValues
  const date = new Date(year, month - 1, day, hours, minutes)
  updateValue(date.toISOString().slice(0, 16))
  showDateTimePicker.value = false
}

// 时间确认
const handleTimeConfirm = ({ selectedValues }: any) => {
  const [hours, minutes] = selectedValues
  const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  updateValue(time)
  showTimePicker.value = false
}

// 文件上传事件
const handleOversize = () => {
  showToast({
    type: 'fail',
    message: '文件大小超出限制'
  })
}

const handleDelete = () => {
  // 文件删除处理
}

// 监听字段值变化
watch(fieldValue, (newValue) => {
  if (newValue !== props.formData[props.field.name]) {
    props.formData[props.field.name] = newValue
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';

.form-field {
  margin-bottom: 0;

  // 字段状态样式
  &.field-disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &.field-readonly {
    .van-field__control {
      color: var(--text-secondary);
      cursor: default;
    }
  }

  &.field-required {
    .van-field__label {
      &::after {
        content: ' *';
        color: var(--danger-color);
      }
    }
  }

  // 特定字段类型样式
  &.field-select,
  &.field-date,
  &.field-datetime,
  &.field-time {
    :deep(.van-field__control) {
      cursor: pointer;
    }
  }

  &.field-radio,
  &.field-checkbox {
    :deep(.van-field__value) {
      flex: 1;
    }
  }

  &.field-switch {
    :deep(.van-field__value) {
      display: flex;
      justify-content: flex-end;
    }
  }

  &.field-upload {
    :deep(.van-field__value) {
      flex: 1;
    }
  }

  &.field-rate {
    :deep(.van-field__value) {
      display: flex;
      align-items: center;
      gap: var(--mobile-gap);
    }
  }

  &.field-slider {
    :deep(.van-field__value) {
      display: flex;
      align-items: center;
      gap: var(--mobile-gap);

      .slider-value {
        min-width: 40px;
        text-align: center;
        font-size: var(--mobile-text-sm);
        color: var(--text-secondary);
      }
    }
  }
}

// 响应式适配
@media (max-width: 479px) {
  .form-field {
    &.field-radio,
    &.field-checkbox {
      :deep(.van-radio-group),
      :deep(.van-checkbox-group) {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: var(--mobile-gap-xs);
      }
    }
  }
}
</style>