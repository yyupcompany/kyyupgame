<template>
  <div class="form-modal-test">
    <h2>FormModal测试页面</h2>
    <p>当前模态框状态: {{ testModalVisible }}</p>
    <el-button type="primary" @click="openModal">打开FormModal</el-button>
    
    <!-- 测试FormModal -->
    <FormModal
      v-model="testModalVisible"
      title="测试表单"
      :fields="testFields"
      :data="testData"
      @confirm="handleConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FormModal from '@/components/centers/FormModal.vue'

const testModalVisible = ref(false)
const testData = ref({})
const testFields = ref([
  { prop: 'name', label: '姓名', type: 'input', required: true, span: 12 },
  { prop: 'email', label: '邮箱', type: 'input', required: true, span: 12 }
])

const openModal = () => {
  console.log('准备打开模态框，当前状态:', testModalVisible.value)
  testModalVisible.value = true
  console.log('模态框状态已设置为:', testModalVisible.value)
}

const handleConfirm = (data: any) => {
  console.log('确认提交数据:', data)
  testModalVisible.value = false
}
</script>

<style scoped>
.form-modal-test {
  padding: var(--text-2xl);
}
</style>