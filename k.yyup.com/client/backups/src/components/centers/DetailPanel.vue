<template>
  <div class="detail-panel" :class="{ 'detail-panel--collapsed': collapsed }">
    <!-- 面板头部 -->
    <div class="panel-header">
      <div class="header-left">
        <h3 class="panel-title">{{ title }}</h3>
        <el-tag v-if="subtitle" size="small" type="info">{{ subtitle }}</el-tag>
      </div>
      <div class="header-right">
        <slot name="header-actions">
          <el-button 
            v-if="editable && !editMode"
            type="primary" 
            size="small"
            :icon="Edit"
            @click="toggleEditMode"
          >
            编辑
          </el-button>
          <el-button 
            v-if="editMode"
            type="success" 
            size="small"
            :icon="Check"
            :loading="saving"
            @click="handleSave"
          >
            保存
          </el-button>
          <el-button 
            v-if="editMode"
            size="small"
            :icon="Close"
            @click="handleCancel"
          >
            取消
          </el-button>
        </slot>
        
        <el-button 
          v-if="collapsible"
          size="small" 
          :icon="collapsed ? Expand : Fold"
          @click="toggleCollapse"
        />
        
        <el-button 
          v-if="closable"
          size="small" 
          :icon="Close"
          @click="$emit('close')"
        />
      </div>
    </div>

    <!-- 面板内容 -->
    <div class="panel-content" v-show="!collapsed">
      <el-scrollbar :height="scrollHeight">
        <div class="content-wrapper">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <el-skeleton :rows="5" animated />
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="!data && showEmpty" class="empty-state">
            <el-empty 
              :description="emptyText"
              :image-size="80"
            />
          </div>
          
          <!-- 详情内容 -->
          <div v-else class="detail-content">
            <!-- 编辑模式 -->
            <el-form 
              v-if="editMode"
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-width="100px"
              label-position="left"
            >
              <slot 
                name="edit-form" 
                :data="formData"
                :rules="rules"
                :editMode="editMode"
              >
                <!-- 默认编辑表单 -->
                <el-form-item 
                  v-for="field in editableFields" 
                  :key="field.key"
                  :label="field.label"
                  :prop="field.key"
                >
                  <el-input 
                    v-if="field.type === 'input'"
                    v-model="formData[field.key]"
                    :placeholder="field.placeholder"
                  />
                  <el-input
                    v-else-if="field.type === 'textarea'"
                    v-model="formData[field.key]"
                    type="textarea"
                    :placeholder="field.placeholder"
                    :rows="3"
                  />
                  <el-select 
                    v-else-if="field.type === 'select'"
                    v-model="formData[field.key]"
                    :placeholder="field.placeholder"
                  >
                    <el-option 
                      v-for="option in field.options"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                  <el-date-picker 
                    v-else-if="field.type === 'date'"
                    v-model="formData[field.key]"
                    type="date"
                    :placeholder="field.placeholder"
                  />
                </el-form-item>
              </slot>
            </el-form>
            
            <!-- 查看模式 -->
            <div v-else class="view-content">
              <slot name="content" :data="data" :editMode="editMode">
                <!-- 默认详情展示 -->
                <div class="detail-sections">
                  <div 
                    v-for="section in sections" 
                    :key="section.title"
                    class="detail-section"
                  >
                    <h4 class="section-title">{{ section.title }}</h4>
                    <div class="section-content">
                      <div 
                        v-for="field in section.fields"
                        :key="field.key"
                        class="detail-field"
                      >
                        <label class="field-label">{{ field.label }}:</label>
                        <div class="field-value">
                          <slot 
                            :name="`field-${field.key}`" 
                            :value="data[field.key]"
                            :field="field"
                            :data="data"
                          >
                            {{ formatFieldValue(data[field.key], field) }}
                          </slot>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </slot>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 面板底部 -->
    <div class="panel-footer" v-if="$slots.footer && !collapsed">
      <slot name="footer" :data="data" :editMode="editMode"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Edit, Check, Close, Expand, Fold } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import dayjs from 'dayjs'

interface Field {
  key: string
  label: string
  type?: 'text' | 'input' | 'textarea' | 'select' | 'date' | 'tag'
  placeholder?: string
  options?: { label: string; value: any }[]
  format?: string
  formatter?: (value: any) => string
}

interface Section {
  title: string
  fields: Field[]
}

interface Props {
  title: string
  subtitle?: string
  data?: any
  sections?: Section[]
  editableFields?: Field[]
  rules?: any
  loading?: boolean
  saving?: boolean
  editable?: boolean
  collapsible?: boolean
  closable?: boolean
  collapsed?: boolean
  scrollHeight?: string
  emptyText?: string
  showEmpty?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
  editableFields: () => [],
  rules: () => ({}),
  loading: false,
  saving: false,
  editable: false,
  collapsible: false,
  closable: false,
  collapsed: false,
  scrollHeight: '400px',
  emptyText: '暂无数据',
  showEmpty: true
})

const emit = defineEmits<{
  close: []
  save: [data: any]
  cancel: []
  'edit-mode-change': [editMode: boolean]
  'collapse-change': [collapsed: boolean]
}>()

const formRef = ref()
const editMode = ref(false)
const collapsed = ref(props.collapsed)
const formData = ref<any>({})

// 初始化表单数据
const initFormData = () => {
  if (props.data) {
    formData.value = cloneDeep(props.data)
  } else {
    formData.value = {}
    props.editableFields.forEach(field => {
      formData.value[field.key] = ''
    })
  }
}

// 切换编辑模式
const toggleEditMode = () => {
  editMode.value = !editMode.value
  if (editMode.value) {
    initFormData()
  }
  emit('edit-mode-change', editMode.value)
}

// 保存处理
const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    emit('save', cloneDeep(formData.value))
    editMode.value = false
    emit('edit-mode-change', false)
  } catch (error) {
    ElMessage.error('请检查表单输入')
  }
}

// 取消处理
const handleCancel = () => {
  editMode.value = false
  initFormData()
  emit('cancel')
  emit('edit-mode-change', false)
}

// 切换折叠状态
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  emit('collapse-change', collapsed.value)
}

// 格式化字段值
const formatFieldValue = (value: any, field: Field) => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  
  if (field.formatter) {
    return field.formatter(value)
  }
  
  if (field.type === 'date' && field.format) {
    return dayjs(value).format(field.format)
  }
  
  return String(value)
}

// 监听数据变化
watch(() => props.data, () => {
  if (!editMode.value) {
    initFormData()
  }
}, { deep: true })

// 监听collapsed属性变化
watch(() => props.collapsed, (newVal) => {
  collapsed.value = newVal
})

// 暴露方法
defineExpose({
  toggleEditMode,
  toggleCollapse,
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate(),
  getFormData: () => cloneDeep(formData.value)
})
</script>

<style scoped lang="scss">
.detail-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-elevated);
  border: var(--border-width-base) solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;

  &--collapsed {
    .panel-header {
      border-bottom: none;
    }
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: var(--border-width-base) solid var(--border-primary);
  background: var(--bg-tertiary);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--text-sm);
  }

  .panel-title {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }

  .header-right {
    display: flex;
    gap: var(--spacing-sm);
  }
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.content-wrapper {
  padding: var(--text-lg);
}

.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.detail-content {
  .view-content {
    .detail-sections {
      display: flex;
      flex-direction: column;
      gap: var(--text-3xl);
    }

    .detail-section {
      .section-title {
        margin: 0 0 var(--spacing-md) 0;
        font-size: var(--text-sm);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        border-bottom: var(--border-width-base) solid var(--border-primary);
        padding-bottom: var(--spacing-2);
      }

      .section-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--text-lg);
      }

      .detail-field {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);

        .field-label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          font-weight: var(--font-medium);
        }

        .field-value {
          font-size: var(--text-sm);
          color: var(--text-primary);
          word-break: break-all;
        }
      }
    }
  }
}

.panel-footer {
  padding: var(--spacing-md);
  border-top: var(--border-width-base) solid var(--border-primary);
  background: var(--bg-tertiary);
}

// 响应式设计
@media (max-width: var(--breakpoint-md)) {
  .panel-header {
    flex-direction: column;
    gap: var(--text-sm);
    align-items: flex-start;

    .header-right {
      width: 100%;
      justify-content: flex-end;
    }
  }

  .detail-section {
    .section-content {
      grid-template-columns: 1fr;
    }
  }
}
</style>
