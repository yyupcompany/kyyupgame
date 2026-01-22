<template>
  <MobileCenterLayout title="使用模板" back-path="/mobile/centers">
    <div class="mobile-template-use">
      <van-loading v-if="loading" type="spinner" color="#1989fa" class="loading-center">
        加载中...
      </van-loading>

      <template v-else>
        <div class="template-header">
          <h2 class="template-name">{{ template.name }}</h2>
          <p class="template-desc">{{ template.code }} · {{ getCategoryName(template.category) }}</p>
        </div>

        <van-form @submit="handleSubmit" class="template-form">
          <!-- 自动填充的信息展示 -->
          <van-cell-group inset title="自动填充信息">
            <van-cell title="幼儿园名称" :value="autoInfo.kindergartenName" />
            <van-cell title="幼儿园地址" :value="autoInfo.kindergartenAddress" />
            <van-cell title="园长姓名" :value="autoInfo.principalName" />
            <van-cell title="联系电话" :value="autoInfo.phoneNumber" />
          </van-cell-group>

          <!-- 需要填写的变量 -->
          <van-cell-group 
            v-for="(group, groupName) in groupedVariables" 
            :key="groupName"
            :title="groupName"
            inset
          >
            <van-field
              v-for="variable in group"
              :key="variable.name"
              :label="variable.label"
              :placeholder="`请输入${variable.label}`"
              :required="variable.required"
              :rules="[{ required: variable.required, message: `请填写${variable.label}` }]"
              v-model="formData[variable.name]"
            />
          </van-cell-group>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <van-button
              type="primary"
              block
              size="large"
              native-type="submit"
              :loading="submitting"
            >
              生成文档
            </van-button>
            <van-button
              block
              size="large"
              @click="handleSaveDraft"
              class="save-draft-btn"
            >
              保存草稿
            </van-button>
          </div>
        </van-form>
      </template>
    </div>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'
import { getTemplateById, type Template } from '@/api/endpoints/document-templates'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const template = ref<Template>({
  id: 0,
  code: '',
  name: '',
  category: '',
  priority: '',
  estimatedFillTime: 0,
  useCount: 0,
  templateContent: '',
  variables: {},
  version: '',
  isActive: false,
  createdAt: '',
  updatedAt: ''
})

const formData = ref<Record<string, any>>({})

const autoInfo = ref({
  kindergartenName: '示例幼儿园',
  kindergartenAddress: '示例地址',
  principalName: '张园长',
  phoneNumber: '13800138000'
})

// 计算属性
const variableList = computed(() => {
  if (!template.value.variables) return []
  return Object.entries(template.value.variables).map(([name, config]: [string, any]) => ({
    name,
    label: config.label || name,
    type: config.type || 'string',
    source: config.source || 'manual',
    required: config.required !== false,
    group: config.group || '基本信息'
  }))
})

const groupedVariables = computed(() => {
  const groups: Record<string, any[]> = {}
  variableList.value.forEach(variable => {
    if (!groups[variable.group]) {
      groups[variable.group] = []
    }
    groups[variable.group].push(variable)
  })
  return groups
})

// 方法
const goBack = () => {
  router.back()
}

const getCategoryName = (code: string) => {
  const map: Record<string, string> = {
    annual: '年度检查类',
    special: '专项检查类',
    routine: '常态化督导类',
    staff: '教职工管理类',
    student: '幼儿管理类',
    finance: '财务管理类',
    education: '保教工作类'
  }
  return map[code] || code
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    // TODO: 调用生成文档API
    await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟API调用
    showSuccessToast('文档生成成功')
    router.push('/mobile/centers/document-instance-list')
  } catch (error) {
    console.error('生成文档失败:', error)
    showFailToast('生成文档失败')
  } finally {
    submitting.value = false
  }
}

const handleSaveDraft = async () => {
  try {
    // TODO: 调用保存草稿API
    showToast('草稿保存成功')
  } catch (error) {
    console.error('保存草稿失败:', error)
    showFailToast('保存草稿失败')
  }
}

// 数据加载
const loadTemplate = async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const response = await getTemplateById(id)
    if (response.success) {
      template.value = response.data
      // 初始化表单数据
      const initialData: Record<string, any> = {}
      variableList.value.forEach(variable => {
        if (variable.source === 'manual') {
          initialData[variable.name] = ''
        }
      })
      formData.value = initialData
    } else {
      showFailToast('加载模板失败')
    }
  } catch (error) {
    console.error('加载模板失败:', error)
    showFailToast('加载模板失败')
  } finally {
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadTemplate()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;
@import '@/styles/mixins/responsive-mobile.scss';
@import '@/styles/mobile-base.scss';

.mobile-template-use {
  background: var(--van-background-color-light);
  min-height: calc(100vh - var(--mobile-header-height) - var(--mobile-footer-height));

  .loading-center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }

  .template-header {
    padding: var(--van-padding-lg);
    text-align: center;

    .template-name {
      font-size: var(--van-font-size-xl);
      font-weight: 600;
      margin: 0 0 var(--van-padding-sm) 0;
    }

    .template-desc {
      color: var(--van-text-color-2);
      margin: 0;
    }
  }

  .template-form {
    padding: var(--van-padding-md);

    .van-cell-group {
      margin-bottom: var(--van-padding-md);
    }

    .form-actions {
      padding: var(--van-padding-lg) 0;
      display: flex;
      flex-direction: column;
      gap: var(--van-padding-sm);

      .save-draft-btn {
        background: var(--van-background-color-light);
        border: 1px solid var(--van-border-color);
      }
    }
  }
}
</style>