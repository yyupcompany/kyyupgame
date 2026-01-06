<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑检查计划' : '创建检查计划'"
    width="700px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="检查类型" prop="inspectionTypeId">
        <el-select
          v-model="form.inspectionTypeId"
          placeholder="请选择检查类型"
          style="width: 100%"
          @change="handleTypeChange"
        >
          <el-option
            v-for="type in inspectionTypes"
            :key="type.id"
            :label="type.name"
            :value="type.id"
          >
            <span>{{ type.name }}</span>
            <span style="float: right; color: #8492a6; font-size: var(--text-sm)">
              {{ getCategoryLabel(type.category) }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="计划日期" prop="plannedDate">
        <el-date-picker
          v-model="form.plannedDate"
          type="date"
          placeholder="选择计划日期"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="负责人" prop="responsiblePerson">
        <el-input
          v-model="form.responsiblePerson"
          placeholder="请输入负责人姓名"
        />
      </el-form-item>

      <el-form-item label="联系电话">
        <el-input
          v-model="form.contactPhone"
          placeholder="请输入联系电话"
        />
      </el-form-item>

      <el-form-item label="检查状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="待开始" value="pending" />
          <el-option label="准备中" value="preparing" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="4"
          placeholder="请输入备注信息"
        />
      </el-form-item>

      <el-divider v-if="selectedType">检查类型信息</el-divider>

      <div v-if="selectedType" class="type-info">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="检查部门">
            {{ selectedType.department }}
          </el-descriptions-item>
          <el-descriptions-item label="检查频率">
            {{ selectedType.frequency }}
          </el-descriptions-item>
          <el-descriptions-item label="检查时长">
            {{ selectedType.duration }}天
          </el-descriptions-item>
          <el-descriptions-item label="分类">
            {{ getCategoryLabel(selectedType.category) }}
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ selectedType.description }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedType.requiredDocuments && selectedType.requiredDocuments.length > 0" style="margin-top: var(--text-lg)">
          <div style="margin-bottom: var(--spacing-sm); font-weight: 600">所需文档：</div>
          <el-tag
            v-for="(doc, index) in selectedType.requiredDocuments"
            :key="index"
            style="margin-right: var(--spacing-sm); margin-bottom: var(--spacing-sm)"
          >
            {{ doc }}
          </el-tag>
        </div>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { get, post, put } from '@/utils/request'

interface Props {
  visible: boolean
  planData?: any
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  planData: null
})

const emit = defineEmits<Emits>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const inspectionTypes = ref<any[]>([])
const selectedType = ref<any>(null)

const isEdit = computed(() => !!props.planData?.id)

const form = ref({
  inspectionTypeId: null,
  plannedDate: '',
  responsiblePerson: '',
  contactPhone: '',
  status: 'pending',
  notes: ''
})

const rules: FormRules = {
  inspectionTypeId: [
    { required: true, message: '请选择检查类型', trigger: 'change' }
  ],
  plannedDate: [
    { required: true, message: '请选择计划日期', trigger: 'change' }
  ],
  responsiblePerson: [
    { required: true, message: '请输入负责人姓名', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择检查状态', trigger: 'change' }
  ]
}

// 加载检查类型列表
const loadInspectionTypes = async () => {
  try {
    const response = await get('/inspection/types')
    if (response.success) {
      inspectionTypes.value = response.data || []
    }
  } catch (error) {
    console.error('加载检查类型失败:', error)
  }
}

// 处理检查类型变更
const handleTypeChange = (typeId: number) => {
  selectedType.value = inspectionTypes.value.find(t => t.id === typeId)
}

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    'annual': '年度检查',
    'special': '专项检查',
    'routine': '常态化督导'
  }
  return categoryMap[category] || category
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitting.value = true

      if (isEdit.value) {
        // 更新
        const response = await put(`/inspection/plans/${props.planData.id}`, form.value)
        if (response.success) {
          ElMessage.success('保存成功')
          emit('success')
          handleClose()
        }
      } else {
        // 创建
        const response = await post('/inspection/plans', form.value)
        if (response.success) {
          ElMessage.success('创建成功')
          emit('success')
          handleClose()
        }
      }
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error(isEdit.value ? '保存失败' : '创建失败')
    } finally {
      submitting.value = false
    }
  })
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  selectedType.value = null
  emit('update:visible', false)
}

// 监听对话框打开
watch(() => props.visible, (val) => {
  if (val) {
    loadInspectionTypes()
    
    if (props.planData) {
      // 编辑模式，填充数据
      form.value = {
        inspectionTypeId: props.planData.inspectionTypeId,
        plannedDate: props.planData.plannedDate,
        responsiblePerson: props.planData.responsiblePerson || '',
        contactPhone: props.planData.contactPhone || '',
        status: props.planData.status || 'pending',
        notes: props.planData.notes || ''
      }
      
      // 设置选中的检查类型
      if (props.planData.inspectionTypeId) {
        setTimeout(() => {
          handleTypeChange(props.planData.inspectionTypeId)
        }, 100)
      }
    } else {
      // 新建模式，重置表单
      form.value = {
        inspectionTypeId: null,
        plannedDate: '',
        responsiblePerson: '',
        contactPhone: '',
        status: 'pending',
        notes: ''
      }
    }
  }
})
</script>

<style scoped lang="scss">
.type-info {
  padding: var(--text-lg);
  background: var(--bg-hover);
  border-radius: var(--spacing-xs);
}
</style>

