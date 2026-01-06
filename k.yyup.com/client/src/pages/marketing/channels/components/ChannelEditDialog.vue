<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑渠道' : '新建渠道'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="渠道名称" prop="channelName">
        <el-input v-model="form.channelName" placeholder="请输入渠道名称" />
      </el-form-item>

      <el-form-item label="渠道类型" prop="channelType">
        <el-select v-model="form.channelType" placeholder="请选择渠道类型" style="width: 100%">
          <el-option label="线上" value="online" />
          <el-option label="线下" value="offline" />
          <el-option label="推荐" value="referral" />
          <el-option label="广告" value="advertisement" />
        </el-select>
      </el-form-item>

      <el-form-item label="UTM来源" prop="utmSource">
        <el-input v-model="form.utmSource" placeholder="请输入UTM来源标识" />
      </el-form-item>

      <el-form-item label="渠道描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入渠道描述"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio value="active">启用</el-radio>
          <el-radio value="inactive">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="预算设置">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-input
              v-model.number="form.monthlyBudget"
              placeholder="月度预算"
              type="number"
            >
              <template #prepend>¥</template>
            </el-input>
          </el-col>
          <el-col :span="12">
            <el-input
              v-model.number="form.costPerLead"
              placeholder="单个线索成本"
              type="number"
            >
              <template #prepend>¥</template>
            </el-input>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="目标设置">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-input
              v-model.number="form.targetLeads"
              placeholder="月度线索目标"
              type="number"
            />
          </el-col>
          <el-col :span="12">
            <el-input
              v-model.number="form.targetConversions"
              placeholder="月度转化目标"
              type="number"
            />
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import request from '@/utils/request'

interface Props {
  modelValue: boolean
  channel?: any
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.channel?.id)

const form = reactive({
  channelName: '',
  channelType: '',
  utmSource: '',
  description: '',
  status: 'active',
  monthlyBudget: 0,
  costPerLead: 0,
  targetLeads: 0,
  targetConversions: 0
})

const rules: FormRules = {
  channelName: [
    { required: true, message: '请输入渠道名称', trigger: 'blur' },
    { min: 2, max: 50, message: '渠道名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  channelType: [
    { required: true, message: '请选择渠道类型', trigger: 'change' }
  ],
  utmSource: [
    { required: true, message: '请输入UTM来源', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: 'UTM来源只能包含字母、数字、下划线和横线', trigger: 'blur' }
  ]
}

const resetForm = () => {
  Object.assign(form, {
    channelName: '',
    channelType: '',
    utmSource: '',
    description: '',
    status: 'active',
    monthlyBudget: 0,
    costPerLead: 0,
    targetLeads: 0,
    targetConversions: 0
  })
}

const loadChannelData = () => {
  if (props.channel) {
    Object.assign(form, {
      channelName: props.channel.channelName || '',
      channelType: props.channel.channelType || '',
      utmSource: props.channel.utmSource || '',
      description: props.channel.description || '',
      status: props.channel.status || 'active',
      monthlyBudget: props.channel.monthlyBudget || 0,
      costPerLead: props.channel.costPerLead || 0,
      targetLeads: props.channel.targetLeads || 0,
      targetConversions: props.channel.targetConversions || 0
    })
  } else {
    resetForm()
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    const data = { ...form }
    
    if (isEdit.value) {
      await request.put(`/api/marketing/channels/${props.channel.id}`, data)
      ElMessage.success('更新渠道成功')
    } else {
      await request.post('/api/marketing/channels', data)
      ElMessage.success('创建渠道成功')
    }

    emit('success')
  } catch (e: any) {
    if (e.message) {
      ElMessage.error(e.message)
    }
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
  visible.value = false
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadChannelData()
  }
})
</script>

<style scoped lang="scss">
.dialog-footer {
  text-align: right;
}
</style>
