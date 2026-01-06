<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="600px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :lock-scroll="true"
    class="missing-fields-dialog"
    @close="handleClose"
    @opened="handleDialogOpened"
  >
    <div class="dialog-content">
      <!-- 提示信息 -->
      <el-alert
        :title="dialogMessage"
        type="info"
        :closable="false"
        show-icon
        class="info-alert"
      />

      <!-- 动态表单 -->
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="missing-fields-form"
      >
        <el-form-item
          v-for="field in missingFields"
          :key="field.name"
          :label="field.label"
          :prop="field.name"
        >
          <!-- 🎯 智能推荐值 -->
          <div v-if="hasRecommendations(field)" class="field-recommendations">
            <div class="recommendation-header">
              <span>⭐ 智能推荐</span>
            </div>
            <div class="recommendation-buttons">
              <!-- 用户个人偏好（优先显示） -->
              <el-tag
                v-for="(rec, index) in field.userPreferences"
                :key="`user-${index}`"
                type="success"
                effect="plain"
                class="recommendation-tag user-preference"
                @click="applyRecommendation(field.name, rec.value)"
              >
                👤 {{ rec.value }} ({{ rec.percentage }}%)
              </el-tag>

              <!-- 全局推荐 -->
              <el-tag
                v-for="(rec, index) in field.recommendations"
                :key="`global-${index}`"
                type="primary"
                effect="plain"
                class="recommendation-tag"
                @click="applyRecommendation(field.name, rec.value)"
              >
                {{ rec.value }} ({{ rec.percentage }}%)
              </el-tag>
            </div>
          </div>

          <!-- 文本输入 -->
          <el-input
            v-if="field.type === 'string'"
            v-model="formData[field.name]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            clearable
          />

          <!-- 数字输入 -->
          <el-input-number
            v-else-if="field.type === 'number'"
            v-model="formData[field.name]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            :min="0"
            style="width: 100%"
          />

          <!-- 日期选择 -->
          <el-date-picker
            v-else-if="field.type === 'date'"
            v-model="formData[field.name]"
            type="date"
            :placeholder="field.placeholder || `请选择${field.label}`"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />

          <!-- 枚举选择 -->
          <el-select
            v-else-if="field.type === 'enum' && field.enumValues"
            v-model="formData[field.name]"
            :placeholder="field.placeholder || `请选择${field.label}`"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="option in field.enumValues"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <!-- 布尔选择 -->
          <el-switch
            v-else-if="field.type === 'boolean'"
            v-model="formData[field.name]"
          />

          <!-- 默认文本输入 -->
          <el-input
            v-else
            v-model="formData[field.name]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            clearable
          />

          <!-- 字段描述 -->
          <div v-if="field.description" class="field-description">
            {{ field.description }}
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="left-buttons">
          <el-button @click="showTemplateList">
            <el-icon><collection /></el-icon>
            应用模板
          </el-button>
          <el-button @click="saveAsTemplate">
            <el-icon><document-add /></el-icon>
            保存为模板
          </el-button>
        </div>
        <div class="right-buttons">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确认提交
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { fieldTemplateApi } from '@/api/modules/field-template'

// 推荐值接口
interface FieldRecommendation {
  value: any
  frequency: number
  percentage: number
  lastUsed?: string
}

// 字段定义接口
interface FieldDefinition {
  name: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum'
  required: boolean
  description?: string
  placeholder?: string
  enumValues?: Array<{ value: any; label: string }>
  recommendations?: FieldRecommendation[]
  userPreferences?: FieldRecommendation[]
}

// 缺失字段数据接口
interface MissingFieldsData {
  type: 'missing_fields'
  table_name: string
  current_data: any
  missing_fields: FieldDefinition[]
  ui_instruction: {
    type: 'show_missing_fields_dialog'
    title: string
    message: string
  }
}

// Props
interface Props {
  modelValue: boolean
  data: MissingFieldsData | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: any]
}>()

// 响应式数据
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const formData = ref<Record<string, any>>({})
const submitting = ref(false)

// 计算属性
const dialogTitle = computed(() => {
  return props.data?.ui_instruction?.title || '补充必填信息'
})

const dialogMessage = computed(() => {
  return props.data?.ui_instruction?.message || '请补充以下必填字段'
})

const missingFields = computed(() => {
  return props.data?.missing_fields || []
})

// 动态生成表单验证规则
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  
  missingFields.value.forEach(field => {
    if (field.required) {
      rules[field.name] = [
        {
          required: true,
          message: `${field.label}是必填项`,
          trigger: field.type === 'enum' ? 'change' : 'blur'
        }
      ]
    }
  })
  
  return rules
})

// 监听对话框打开，初始化表单数据
watch(visible, (newVal) => {
  if (newVal && props.data) {
    // 初始化表单数据
    formData.value = {}
    missingFields.value.forEach(field => {
      // 如果当前数据中已有值，使用现有值
      if (props.data?.current_data && props.data.current_data[field.name] !== undefined) {
        formData.value[field.name] = props.data.current_data[field.name]
      } else {
        // 否则设置默认值
        formData.value[field.name] = getDefaultValue(field.type)
      }
    })
  }
})

// 获取字段类型的默认值
function getDefaultValue(type: string): any {
  switch (type) {
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'date':
      return ''
    default:
      return ''
  }
}

// 🎯 检查字段是否有推荐值
function hasRecommendations(field: FieldDefinition): boolean {
  return (
    (field.recommendations && field.recommendations.length > 0) ||
    (field.userPreferences && field.userPreferences.length > 0)
  )
}

// 🎯 应用推荐值
function applyRecommendation(fieldName: string, value: any) {
  formData.value[fieldName] = value
  ElMessage.success(`已应用推荐值: ${value}`)
}

// 处理关闭
function handleClose() {
  visible.value = false
  formData.value = {}
  formRef.value?.resetFields()
}

// 🎯 显示模板列表
async function showTemplateList() {
  try {
    const result = await fieldTemplateApi.getTemplateList({
      entityType: props.missingFieldsData?.table_name,
      page: 1,
      pageSize: 20
    })

    if (result.success && result.data.items.length > 0) {
      // 显示模板选择对话框
      const templateOptions = result.data.items.map((t: any) => ({
        label: `${t.name} ${t.description ? `(${t.description})` : ''}`,
        value: t.id
      }))

      ElMessageBox.prompt('请选择要应用的模板', '应用模板', {
        confirmButtonText: '应用',
        cancelButtonText: '取消',
        inputType: 'select',
        inputOptions: templateOptions
      }).then(async ({ value }) => {
        if (value) {
          await applyTemplateById(parseInt(value))
        }
      }).catch(() => {
        // 用户取消
      })
    } else {
      ElMessage.info('暂无可用模板')
    }
  } catch (error: any) {
    console.error('获取模板列表失败:', error)
    ElMessage.error('获取模板列表失败')
  }
}

// 🎯 应用模板
async function applyTemplateById(templateId: number) {
  try {
    const result = await fieldTemplateApi.applyTemplate(templateId)

    if (result.success) {
      // 将模板值应用到表单
      Object.assign(formData.value, result.data)
      ElMessage.success('模板应用成功')
    } else {
      ElMessage.error('模板应用失败')
    }
  } catch (error: any) {
    console.error('应用模板失败:', error)
    ElMessage.error('应用模板失败')
  }
}

// 🎯 保存为模板
async function saveAsTemplate() {
  try {
    // 检查是否有填写的数据
    if (Object.keys(formData.value).length === 0) {
      ElMessage.warning('请先填写字段值')
      return
    }

    // 弹出对话框输入模板名称和描述
    ElMessageBox.prompt('请输入模板名称', '保存为模板', {
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '模板名称不能为空'
    }).then(async ({ value: name }) => {
      // 询问是否公开
      ElMessageBox.confirm('是否将此模板设为公开？公开模板所有用户可见。', '模板可见性', {
        confirmButtonText: '公开',
        cancelButtonText: '私有',
        type: 'info'
      }).then(async () => {
        // 公开模板
        await createTemplate(name, true)
      }).catch(async () => {
        // 私有模板
        await createTemplate(name, false)
      })
    }).catch(() => {
      // 用户取消
    })
  } catch (error: any) {
    console.error('保存模板失败:', error)
    ElMessage.error('保存模板失败')
  }
}

// 🎯 创建模板
async function createTemplate(name: string, isPublic: boolean) {
  try {
    const result = await fieldTemplateApi.createTemplate({
      name,
      entityType: props.missingFieldsData?.table_name || '',
      fieldValues: formData.value,
      isPublic
    })

    if (result.success) {
      ElMessage.success('模板保存成功')
    } else {
      ElMessage.error('模板保存失败')
    }
  } catch (error: any) {
    console.error('创建模板失败:', error)
    ElMessage.error('创建模板失败')
  }
}

// 对话框打开后的处理
function handleDialogOpened() {
  console.log('📖 [缺失字段对话框] 对话框已打开，确保按钮可见')

  // 确保对话框内容滚动到顶部
  setTimeout(() => {
    const dialogContent = document.querySelector('.missing-fields-dialog .dialog-content')
    if (dialogContent) {
      dialogContent.scrollTop = 0
      console.log('✅ [缺失字段对话框] 内容已滚动到顶部')
    }
  }, 100)
}

// 处理提交
async function handleSubmit() {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    submitting.value = true

    // 合并当前数据和补充的数据
    const completeData = {
      ...props.data?.current_data,
      ...formData.value
    }

    console.log('✅ [缺失字段对话框] 提交补充数据:', completeData)

    // 触发提交事件
    emit('submit', {
      table_name: props.data?.table_name,
      data: completeData
    })

    ElMessage.success('数据补充成功')
    handleClose()

  } catch (error) {
    console.error('❌ [缺失字段对话框] 表单验证失败:', error)
    ElMessage.warning('请填写所有必填字段')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.missing-fields-dialog {
  // 🔧 修复：确保对话框高度合理，按钮始终可见
  :deep(.el-dialog) {
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-dialog__body) {
    flex: 1;
    overflow: hidden;
    padding: var(--text-2xl);
  }

  :deep(.el-dialog__footer) {
    flex-shrink: 0;
    padding: var(--spacing-4xl) var(--text-2xl);
    border-top: var(--border-width-base) solid var(--border-color);
    background: var(--bg-tertiary);
  }

  .dialog-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .info-alert {
      margin-bottom: var(--text-2xl);
      flex-shrink: 0;
    }

    .missing-fields-form {
      flex: 1;
      max-height: 400px;
      overflow-y: auto;
      padding-right: var(--spacing-2xl);

      // 🔧 优化滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: var(--radius-xs);

        &:hover {
          background: var(--text-placeholder);
        }
      }

      &::-webkit-scrollbar-track {
        background: var(--bg-hover);
        border-radius: var(--radius-xs);
      }

      // 🎯 智能推荐样式
      .field-recommendations {
        margin-bottom: var(--text-sm);
        padding: var(--text-sm);
        background: linear-gradient(135deg, var(--bg-container) 0%, #e8eef5 100%);
        border-radius: var(--spacing-sm);
        border: var(--border-width-base) solid var(--border-color-light);

        .recommendation-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--text-regular);

          .el-icon {
            color: var(--warning-color);
          }
        }

        .recommendation-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);

          .recommendation-tag {
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: var(--text-sm);
            padding: var(--spacing-lg) var(--text-sm);
            border-radius: var(--radius-md);

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 var(--spacing-xs) var(--spacing-sm) var(--shadow-light);
            }

            &.user-preference {
              background: linear-gradient(135deg, var(--success-color) 0%, var(--success-light) 100%);
              color: white;
              border: none;
              font-weight: 500;

              .el-icon {
                margin-right: var(--spacing-xs);
              }

              &:hover {
                background: linear-gradient(135deg, var(--success-light) 0%, #95d475 100%);
              }
            }

            &:not(.user-preference) {
              &:hover {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
              }
            }
          }
        }
      }

      .field-description {
        font-size: var(--text-sm);
        color: var(--info-color);
        margin-top: var(--spacing-base);
        line-height: 1.5;
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-2xl);

    .left-buttons,
    .right-buttons {
      display: flex;
      gap: var(--spacing-2xl);
    }
  }
}
</style>

