<!--
  自定义专家编辑对话框
-->

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditing ? '编辑自定义专家' : '添加自定义专家'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="top"
    >
      <!-- 专家名称 -->
      <el-form-item label="专家名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入专家名称（如：家园沟通专家）"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <!-- 专家图标 -->
      <el-form-item label="专家图标" prop="icon">
        <div class="icon-selector">
          <div
            v-for="icon in EXPERT_ICONS"
            :key="icon"
            class="icon-option"
            :class="{ 'selected': formData.icon === icon }"
            @click="formData.icon = icon"
          >
            {{ icon }}
          </div>
        </div>
      </el-form-item>

      <!-- 专家颜色 -->
      <el-form-item label="专家颜色" prop="color">
        <div class="color-selector">
          <div
            v-for="color in EXPERT_COLORS"
            :key="color"
            class="color-option"
            :class="{ 'selected': formData.color === color }"
            :style="{ backgroundColor: color }"
            @click="formData.color = color"
          />
        </div>
      </el-form-item>

      <!-- 专家描述 -->
      <el-form-item label="专家描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="请简要描述专家的专长领域（如：家园沟通、家长工作、亲子活动）"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 系统提示词 -->
      <el-form-item label="系统提示词" prop="systemPrompt">
        <el-input
          v-model="formData.systemPrompt"
          type="textarea"
          :rows="12"
          placeholder="请输入详细的系统提示词，描述专家的背景、能力和工作方式..."
          maxlength="2000"
          show-word-limit
        />
        <div class="prompt-tips">
          <el-alert
            title="提示词编写建议"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <ul>
                <li>描述专家的专业背景和经验（如：15年幼儿园工作经验）</li>
                <li>列出专家的核心能力（如：家园沟通、活动策划等）</li>
                <li>说明专家擅长解决的问题</li>
                <li>强调以幼儿园托育为核心领域</li>
                <li>提示词越详细，AI回答越专业</li>
              </ul>
            </template>
          </el-alert>
        </div>
      </el-form-item>

      <!-- 能力标签 -->
      <el-form-item label="能力标签（可选）">
        <el-tag
          v-for="(tag, index) in formData.capabilities"
          :key="index"
          closable
          @close="removeCapability(index)"
          style="margin-right: var(--spacing-sm); margin-bottom: var(--spacing-sm);"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="showCapabilityInput"
          ref="capabilityInputRef"
          v-model="newCapability"
          size="small"
          style="width: 120px;"
          @keyup.enter="addCapability"
          @blur="addCapability"
        />
        <el-button
          v-else
          size="small"
          @click="showCapabilityInput = true"
        >
          + 添加标签
        </el-button>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">
        保存专家
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  EXPERT_ICONS, 
  EXPERT_COLORS, 
  createDefaultCustomExpert,
  validateCustomExpert
} from '@/config/ai-experts'
import type { CustomExpert } from '@/config/ai-experts'

// ==================== Props ====================
interface Props {
  visible: boolean
  expert?: CustomExpert | null
}

const props = withDefaults(defineProps<Props>(), {
  expert: null
})

// ==================== Emits ====================
const emit = defineEmits<{
  'update:visible': [visible: boolean]
  save: [expert: Partial<CustomExpert>]
}>()

// ==================== State ====================
const formRef = ref<FormInstance>()
const capabilityInputRef = ref()
const saving = ref(false)
const showCapabilityInput = ref(false)
const newCapability = ref('')

const formData = ref<Partial<CustomExpert>>(createDefaultCustomExpert())

// ==================== Computed ====================
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEditing = computed(() => !!props.expert)

// ==================== Form Rules ====================
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入专家名称', trigger: 'blur' },
    { min: 2, max: 20, message: '名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请选择专家图标', trigger: 'change' }
  ],
  color: [
    { required: true, message: '请选择专家颜色', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入专家描述', trigger: 'blur' },
    { min: 10, max: 100, message: '描述长度在 10 到 100 个字符', trigger: 'blur' }
  ],
  systemPrompt: [
    { required: true, message: '请输入系统提示词', trigger: 'blur' },
    { min: 50, max: 2000, message: '提示词长度在 50 到 2000 个字符', trigger: 'blur' }
  ]
}

// ==================== Watch ====================
watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.expert) {
      // 编辑模式：加载现有专家数据
      formData.value = { ...props.expert }
    } else {
      // 新建模式：使用默认模板
      formData.value = createDefaultCustomExpert()
    }
  }
})

// ==================== Methods ====================
/**
 * 添加能力标签
 */
const addCapability = () => {
  if (newCapability.value && newCapability.value.trim()) {
    if (!formData.value.capabilities) {
      formData.value.capabilities = []
    }
    if (!formData.value.capabilities.includes(newCapability.value.trim())) {
      formData.value.capabilities.push(newCapability.value.trim())
    }
    newCapability.value = ''
  }
  showCapabilityInput.value = false
}

/**
 * 移除能力标签
 */
const removeCapability = (index: number) => {
  formData.value.capabilities?.splice(index, 1)
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  formRef.value?.resetFields()
  emit('update:visible', false)
}

/**
 * 保存专家
 */
const handleSave = async () => {
  if (!formRef.value) return

  try {
    // 表单验证
    await formRef.value.validate()

    // 数据验证
    const validation = validateCustomExpert(formData.value)
    if (!validation.valid) {
      ElMessage.error(validation.errors[0])
      return
    }

    saving.value = true

    // 触发保存事件
    emit('save', formData.value)

    // 关闭对话框
    handleClose()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.icon-selector {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: var(--spacing-sm);
  max-height: 200px;
  overflow-y: auto;
  padding: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
  border-radius: var(--spacing-xs);

  .icon-option {
    width: var(--icon-size); height: var(--icon-size);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-3xl);
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: var(--spacing-xs);
    transition: all 0.3s;

    &:hover {
      background-color: var(--el-fill-color-light);
      transform: scale(1.1);
    }

    &.selected {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }
}

.color-selector {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: var(--border-width-base) solid var(--el-border-color);
  border-radius: var(--spacing-xs);

  .color-option {
    width: var(--icon-size); height: var(--icon-size);
    border-radius: var(--radius-full);
    cursor: pointer;
    border: 3px solid transparent;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px var(--spacing-sm) var(--shadow-heavy);
    }

    &.selected {
      border-color: var(--bg-white);
      box-shadow: 0 0 0 2px var(--el-color-primary);
      transform: scale(1.15);
    }
  }
}

.prompt-tips {
  margin-top: var(--spacing-sm);

  :deep(.el-alert__content) {
    ul {
      margin: 0;
      padding-left: var(--text-2xl);
      
      li {
        margin: var(--spacing-xs) 0;
        font-size: var(--text-sm);
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>

