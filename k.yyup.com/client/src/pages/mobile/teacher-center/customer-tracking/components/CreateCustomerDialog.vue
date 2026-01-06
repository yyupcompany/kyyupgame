<template>
  <el-dialog
    v-model="visible"
    title="新建客户"
    :width="isMobile ? '95%' : '600px'"
    :fullscreen="isMobile"
    :show-close="!isMobile"
    @close="handleClose"
    custom-class="mobile-create-customer-dialog"
  >
    <!-- 移动端顶部工具栏 -->
    <template #header="{ close, titleId, titleClass }">
      <div class="mobile-dialog-header">
        <el-button
          v-if="isMobile"
          text
          @click="handleClose"
          class="close-btn"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <h3 :id="titleId" :class="titleClass">新建客户</h3>
        <div class="header-spacer"></div>
      </div>
    </template>

    <!-- 表单内容 -->
    <div class="mobile-form-container">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-position="isMobile ? 'top' : 'right'"
        :label-width="isMobile ? 'auto' : '100px'"
        class="customer-form"
      >
        <!-- 基础信息 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><User /></el-icon>
            <span>客户信息</span>
          </div>

          <div class="form-grid">
            <el-form-item label="客户姓名" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入客户姓名"
                :size="inputSize"
                clearable
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="联系电话" prop="phone">
              <el-input
                v-model="form.phone"
                placeholder="请输入手机号码"
                :size="inputSize"
                clearable
                maxlength="11"
                show-word-limit
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="来源渠道" prop="source">
              <el-select
                v-model="form.source"
                placeholder="请选择来源渠道"
                :size="inputSize"
                style="width: 100%"
              >
                <el-option
                  v-for="source in sourceOptions"
                  :key="source.value"
                  :label="source.label"
                  :value="source.value"
                >
                  <div class="source-option">
                    <el-icon>
                      <component :is="source.icon" />
                    </el-icon>
                    <span>{{ source.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <!-- 孩子信息 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Avatar /></el-icon>
            <span>孩子信息</span>
          </div>

          <div class="form-grid">
            <el-form-item label="孩子姓名" prop="childName">
              <el-input
                v-model="form.childName"
                placeholder="请输入孩子姓名"
                :size="inputSize"
                clearable
              >
                <template #prefix>
                  <el-icon><Avatar /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="孩子年龄" prop="childAge">
              <el-input-number
                v-model="form.childAge"
                :min="1"
                :max="10"
                :size="inputSize"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>

            <el-form-item label="孩子性别" prop="childGender">
              <el-radio-group
                v-model="form.childGender"
                :size="inputSize"
                class="gender-radio-group"
              >
                <el-radio-button label="男">
                  <el-icon><Male /></el-icon>
                  男
                </el-radio-button>
                <el-radio-button label="女">
                  <el-icon><Female /></el-icon>
                  女
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="出生日期" prop="birthDate">
              <el-date-picker
                v-model="form.birthDate"
                type="date"
                placeholder="请选择出生日期"
                :size="inputSize"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 扩展信息 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><MoreFilled /></el-icon>
            <span>扩展信息</span>
          </div>

          <div class="form-grid">
            <el-form-item label="咨询内容">
              <el-input
                v-model="form.consultationContent"
                type="textarea"
                :rows="3"
                placeholder="请输入咨询的具体内容"
                :size="inputSize"
                resize="none"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="备注">
              <el-input
                v-model="form.notes"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息"
                :size="inputSize"
                resize="none"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 移动端底部操作栏 -->
    <template #footer>
      <div class="mobile-dialog-footer">
        <el-button
          @click="handleClose"
          :size="inputSize"
          class="cancel-btn"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="loading"
          :size="inputSize"
          class="submit-btn"
        >
          <el-icon v-if="!loading"><Check /></el-icon>
          {{ loading ? '创建中...' : '确定创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElRadioGroup,
  ElRadioButton,
  ElDatePicker,
  ElButton,
  ElIcon
} from 'element-plus'
import {
  ArrowLeft,
  User,
  Phone,
  Avatar,
  MoreFilled,
  Male,
  Female,
  Check,
  Link,
  Location,
  Share,
  Plus
} from '@element-plus/icons-vue'

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [customer: any];
}>()

const visible = ref(false)
const loading = ref(false)
const formRef = ref()

const isMobile = computed(() => {
  return window.innerWidth < 768
})

const inputSize = computed(() => {
  return isMobile.value ? 'large' : 'default'
})

const form = ref({
  name: '',
  phone: '',
  childName: '',
  childAge: 3,
  childGender: '男',
  birthDate: '',
  source: '',
  consultationContent: '',
  notes: ''
})

// 来源渠道选项
const sourceOptions = [
  { label: '官网咨询', value: '官网咨询', icon: 'Link' },
  { label: '电话咨询', value: '电话咨询', icon: 'Phone' },
  { label: '朋友推荐', value: '朋友推荐', icon: 'Share' },
  { label: '线下活动', value: '线下活动', icon: 'Location' },
  { label: '其他渠道', value: '其他', icon: 'Plus' }
]

const rules = {
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度为2-10个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  childName: [
    { required: true, message: '请输入孩子姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度为2-10个字符', trigger: 'blur' }
  ],
  childAge: [
    { required: true, message: '请输入孩子年龄', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '年龄范围为1-10岁', trigger: 'blur' }
  ],
  childGender: [
    { required: true, message: '请选择孩子性别', trigger: 'change' }
  ],
  source: [
    { required: true, message: '请选择来源渠道', trigger: 'change' }
  ]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function resetForm() {
  form.value = {
    name: '',
    phone: '',
    childName: '',
    childAge: 3,
    childGender: '男',
    birthDate: '',
    source: '',
    consultationContent: '',
    notes: ''
  }
  formRef.value?.clearValidate()
}

function handleClose() {
  formRef.value?.resetFields()
  visible.value = false
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()

    loading.value = true

    // 构建客户数据
    const customerData = {
      ...form.value,
      createTime: new Date().toISOString(),
      status: 'potential', // 潜在客户
      followStatus: 'pending', // 待跟进
      teacherId: null, // 待分配
      lastContactTime: new Date().toISOString()
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('客户创建成功')
    emit('success', customerData)
    handleClose()
  } catch (error) {
    if (error !== false) { // 不是表单验证错误
      console.error('创建客户失败:', error)
      ElMessage.error('创建失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.mobile-create-customer-dialog {
  .mobile-dialog-header {
    display: flex;
    align-items: center;
    padding: 0;
    margin: 0;

    .close-btn {
      margin-right: var(--spacing-sm);
      padding: var(--spacing-xs);

      .el-icon {
        font-size: var(--text-xl);
      }
    }

    h3 {
      margin: 0;
      font-size: var(--font-size-large);
      font-weight: 600;
      color: var(--text-primary);
    }

    .header-spacer {
      flex: 1;
    }
  }

  .mobile-form-container {
    max-height: 70vh;
    overflow-y: auto;
    padding: 0 var(--spacing-md);

    .customer-form {
      .form-section {
        margin-bottom: var(--spacing-xl);

        .section-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--text-primary);
          padding-bottom: var(--spacing-sm);
          border-bottom: 1px solid var(--border-color-lighter);

          .el-icon {
            color: var(--primary-color);
          }
        }

        .form-grid {
          display: grid;
          gap: var(--spacing-md);

          .el-form-item {
            margin-bottom: 0;

            :deep(.el-form-item__label) {
              font-weight: 500;
              color: var(--text-regular);
            }

            .gender-radio-group {
              width: 100%;

              :deep(.el-radio-button__inner) {
                flex: 1;
                padding: var(--spacing-sm) var(--spacing-lg);
              }
            }
          }
        }
      }
    }
  }

  .mobile-dialog-footer {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
    margin: 0;
    background: var(--bg-color);
    border-top: 1px solid var(--border-color-lighter);

    .el-button {
      flex: 1;
      height: 48px;
      font-weight: 500;

      &.cancel-btn {
        border: 1px solid var(--border-color);
      }

      &.submit-btn {
        .el-icon {
          margin-right: var(--spacing-xs);
        }
      }
    }
  }
}

// 来源选项样式
.source-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  .el-icon {
    color: var(--primary-color);
  }
}

// 移动端优化
@media (max-width: var(--breakpoint-md)) {
  .mobile-create-customer-dialog {
    :deep(.el-dialog) {
      margin: 0;
      border-radius: 0;
    }

    :deep(.el-dialog__header) {
      padding: var(--spacing-md);
      border-bottom: 1px solid var(--border-color-lighter);
    }

    :deep(.el-dialog__body) {
      padding: 0;
      max-height: calc(100vh - 120px);
    }

    :deep(.el-dialog__footer) {
      padding: 0;
      border-top: 1px solid var(--border-color-lighter);
    }

    .mobile-form-container {
      padding: var(--spacing-md);

      .customer-form {
        .form-section {
          margin-bottom: var(--spacing-lg);

          .form-grid {
            gap: var(--spacing-sm);
          }
        }
      }
    }
  }
}

// 桌面端样式
@media (min-width: 769px) {
  .mobile-create-customer-dialog {
    .mobile-dialog-header {
      .close-btn {
        display: none;
      }
    }

    .mobile-form-container {
      padding: 0;
      max-height: none;
      overflow: visible;
    }

    .mobile-dialog-footer {
      padding: 0;
      background: transparent;
      border-top: none;

      .el-button {
        flex: none;
        width: auto;
        height: auto;
        min-width: 100px;
      }
    }
  }
}
</style>