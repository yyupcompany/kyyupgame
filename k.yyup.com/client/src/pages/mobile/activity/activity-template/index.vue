<template>
  <MobileCenterLayout title="活动模板" back-path="/mobile/activity/activity-index">
    <div class="activity-template-mobile">
      <!-- 搜索条 -->
      <van-sticky>
        <div class="search-bar">
          <van-search
            v-model="searchText"
            placeholder="搜索模板名称"
            @search="onSearch"
            @clear="onSearch"
          />
          <div class="filter-row">
            <van-dropdown-menu>
              <van-dropdown-item v-model="filterType" :options="typeOptions" @change="onSearch" />
              <van-dropdown-item v-model="filterStatus" :options="statusOptions" @change="onSearch" />
            </van-dropdown-menu>
          </div>
        </div>
      </van-sticky>

      <!-- 操作按钮 -->
      <div class="action-bar">
        <van-button type="primary" size="small" icon="plus" @click="handleCreate">
          新建模板
        </van-button>
        <van-button size="small" icon="replay" @click="handleRefresh">
          刷新
        </van-button>
      </div>

      <!-- 模板列表 -->
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="listLoading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div class="template-grid">
            <div
              v-for="template in templateList"
              :key="template.id"
              class="template-card"
              @click="handlePreview(template)"
            >
              <div class="template-icon">
                <van-icon name="description" size="40" color="#1989fa" />
              </div>
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-desc">{{ template.description || '暂无描述' }}</div>
                <div class="template-meta">
                  <van-tag :type="template.status === 1 ? 'success' : 'danger'" size="medium">
                    {{ template.status === 1 ? '启用' : '禁用' }}
                  </van-tag>
                  <span class="usage-count">使用 {{ template.usageCount || 0 }} 次</span>
                </div>
              </div>
              <div class="template-actions" @click.stop>
                <van-button size="mini" type="primary" @click="handleUse(template)">
                  使用
                </van-button>
                <van-popover
                  v-model:show="template.showPopover"
                  :actions="getActions(template)"
                  @select="(action) => onActionSelect(action, template)"
                  placement="bottom-end"
                >
                  <template #reference>
                    <van-button size="mini" icon="ellipsis" />
                  </template>
                </van-popover>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <van-empty v-if="templateList.length === 0 && !listLoading" description="暂无模板数据">
            <van-button type="primary" size="small" @click="handleCreate">创建第一个模板</van-button>
          </van-empty>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 新建/编辑模板弹窗 -->
    <van-popup
      v-model:show="showFormPopup"
      position="bottom"
      round
      :style="{ height: '80%' }"
      closeable
    >
      <div class="form-popup">
        <div class="form-title">{{ isEdit ? '编辑模板' : '新建模板' }}</div>
        <van-form @submit="onFormSubmit">
          <van-cell-group inset>
            <van-field
              v-model="templateForm.name"
              label="模板名称"
              placeholder="请输入模板名称"
              required
              :rules="[{ required: true, message: '请输入模板名称' }]"
            />
            <van-field
              v-model="templateForm.typeName"
              is-link
              readonly
              label="模板类型"
              placeholder="请选择模板类型"
              required
              @click="showFormTypePicker = true"
            />
            <van-field
              v-model="templateForm.description"
              label="模板描述"
              type="textarea"
              rows="2"
              placeholder="请输入模板描述"
            />
            <van-field
              v-model="templateForm.title"
              label="活动标题"
              placeholder="请输入活动标题模板"
            />
            <van-field
              v-model="templateForm.duration"
              label="活动时长"
              type="digit"
              placeholder="请输入"
            >
              <template #extra>分钟</template>
            </van-field>
            <van-field
              v-model="templateForm.capacity"
              label="参与人数"
              type="digit"
              placeholder="请输入"
            >
              <template #extra>人</template>
            </van-field>
            <van-field
              v-model="templateForm.fee"
              label="活动费用"
              type="number"
              placeholder="请输入"
            >
              <template #extra>元</template>
            </van-field>
          </van-cell-group>
          <div class="form-actions">
            <van-button type="primary" block native-type="submit" :loading="formSubmitting">
              {{ isEdit ? '保存修改' : '创建模板' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 模板类型选择 -->
    <van-popup v-model:show="showFormTypePicker" position="bottom" round>
      <van-picker
        title="选择模板类型"
        :columns="templateTypeOptions"
        @confirm="onFormTypeConfirm"
        @cancel="showFormTypePicker = false"
      />
    </van-popup>

    <!-- 模板预览弹窗 -->
    <van-popup
      v-model:show="showPreviewPopup"
      position="bottom"
      round
      :style="{ height: '70%' }"
      closeable
    >
      <div class="preview-popup" v-if="previewTemplate">
        <div class="preview-title">{{ previewTemplate.name }}</div>
        <van-cell-group inset>
          <van-cell title="模板类型" :value="getTypeName(previewTemplate.type)" />
          <van-cell title="活动标题" :value="previewTemplate.title || '-'" />
          <van-cell title="活动时长" :value="previewTemplate.duration ? `${previewTemplate.duration}分钟` : '-'" />
          <van-cell title="参与人数" :value="previewTemplate.capacity ? `${previewTemplate.capacity}人` : '-'" />
          <van-cell title="活动费用" :value="previewTemplate.fee ? `¥${previewTemplate.fee}` : '免费'" />
          <van-cell title="状态" :value="previewTemplate.status === 1 ? '启用' : '禁用'" />
          <van-cell title="使用次数" :value="String(previewTemplate.usageCount || 0)" />
        </van-cell-group>
        <van-cell-group inset title="模板描述" v-if="previewTemplate.description">
          <div class="preview-desc">{{ previewTemplate.description }}</div>
        </van-cell-group>
        <div class="preview-actions">
          <van-button type="primary" block @click="handleUse(previewTemplate)">使用此模板</van-button>
        </div>
      </div>
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

const router = useRouter()

// 搜索和筛选
const searchText = ref('')
const filterType = ref('')
const filterStatus = ref('')

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '开放日', value: 'open-day' },
  { text: '家长会', value: 'parent-meeting' },
  { text: '亲子活动', value: 'family' },
  { text: '招生宣讲', value: 'recruitment' }
]

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '启用', value: 1 },
  { text: '禁用', value: 0 }
]

// 模板类型选项
const templateTypeOptions = [
  { text: '开放日', value: 'open-day' },
  { text: '家长会', value: 'parent-meeting' },
  { text: '亲子活动', value: 'family' },
  { text: '招生宣讲', value: 'recruitment' },
  { text: '园区参观', value: 'tour' },
  { text: '其他', value: 'other' }
]

const getTypeName = (type: string) => {
  return templateTypeOptions.find(t => t.value === type)?.text || type
}

// 列表状态
const refreshing = ref(false)
const listLoading = ref(false)
const finished = ref(false)
const page = ref(1)

interface Template {
  id: number
  name: string
  type: string
  description: string
  title: string
  duration: number
  capacity: number
  fee: number
  status: number
  usageCount: number
  showPopover?: boolean
}

const templateList = ref<Template[]>([])

// 获取操作菜单
const getActions = (template: Template) => [
  { text: '编辑', icon: 'edit' },
  { text: '复制', icon: 'description' },
  { text: template.status === 1 ? '禁用' : '启用', icon: template.status === 1 ? 'close' : 'success' },
  { text: '删除', icon: 'delete', color: '#ee0a24' }
]

// 操作选择
const onActionSelect = async (action: any, template: Template) => {
  template.showPopover = false
  switch (action.text) {
    case '编辑':
      handleEdit(template)
      break
    case '复制':
      handleCopy(template)
      break
    case '启用':
    case '禁用':
      handleToggleStatus(template)
      break
    case '删除':
      handleDelete(template)
      break
  }
}

// 加载数据
const loadData = async () => {
  // 模拟数据
  const mockTemplates: Template[] = [
    { id: 1, name: '开放日模板', type: 'open-day', description: '适用于幼儿园开放日活动', title: '幼儿园开放日', duration: 180, capacity: 50, fee: 0, status: 1, usageCount: 25 },
    { id: 2, name: '家长会模板', type: 'parent-meeting', description: '定期家长会使用', title: '第X学期家长会', duration: 120, capacity: 100, fee: 0, status: 1, usageCount: 18 },
    { id: 3, name: '亲子运动会', type: 'family', description: '亲子互动运动会活动', title: '亲子运动会', duration: 240, capacity: 80, fee: 50, status: 1, usageCount: 12 },
    { id: 4, name: '招生宣讲模板', type: 'recruitment', description: '招生宣传活动', title: '新生招生宣讲会', duration: 90, capacity: 200, fee: 0, status: 0, usageCount: 8 }
  ]
  return mockTemplates
}

const onLoad = async () => {
  listLoading.value = true
  try {
    const data = await loadData()
    if (page.value === 1) {
      templateList.value = data
    } else {
      templateList.value.push(...data)
    }
    finished.value = true // 模拟数据加载完毕
  } finally {
    listLoading.value = false
  }
}

const onRefresh = async () => {
  page.value = 1
  finished.value = false
  await onLoad()
  refreshing.value = false
}

const onSearch = () => {
  page.value = 1
  finished.value = false
  templateList.value = []
  onLoad()
}

const handleRefresh = () => {
  refreshing.value = true
  onRefresh()
}

// 表单状态
const showFormPopup = ref(false)
const showFormTypePicker = ref(false)
const isEdit = ref(false)
const formSubmitting = ref(false)
const editingTemplate = ref<Template | null>(null)

const templateForm = reactive({
  name: '',
  type: '',
  typeName: '',
  description: '',
  title: '',
  duration: '',
  capacity: '',
  fee: ''
})

const resetForm = () => {
  templateForm.name = ''
  templateForm.type = ''
  templateForm.typeName = ''
  templateForm.description = ''
  templateForm.title = ''
  templateForm.duration = ''
  templateForm.capacity = ''
  templateForm.fee = ''
}

const handleCreate = () => {
  isEdit.value = false
  editingTemplate.value = null
  resetForm()
  showFormPopup.value = true
}

const handleEdit = (template: Template) => {
  isEdit.value = true
  editingTemplate.value = template
  templateForm.name = template.name
  templateForm.type = template.type
  templateForm.typeName = getTypeName(template.type)
  templateForm.description = template.description
  templateForm.title = template.title
  templateForm.duration = String(template.duration)
  templateForm.capacity = String(template.capacity)
  templateForm.fee = String(template.fee)
  showFormPopup.value = true
}

const onFormTypeConfirm = ({ selectedOptions }: any) => {
  showFormTypePicker.value = false
  if (selectedOptions[0]) {
    templateForm.type = selectedOptions[0].value
    templateForm.typeName = selectedOptions[0].text
  }
}

const onFormSubmit = async () => {
  if (!templateForm.name) {
    showToast('请输入模板名称')
    return
  }
  formSubmitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    showSuccessToast(isEdit.value ? '修改成功' : '创建成功')
    showFormPopup.value = false
    onRefresh()
  } finally {
    formSubmitting.value = false
  }
}

// 预览
const showPreviewPopup = ref(false)
const previewTemplate = ref<Template | null>(null)

const handlePreview = (template: Template) => {
  previewTemplate.value = template
  showPreviewPopup.value = true
}

// 使用模板
const handleUse = (template: Template) => {
  showPreviewPopup.value = false
  showConfirmDialog({
    title: '使用模板',
    message: `确定使用「${template.name}」创建新活动？`
  }).then(() => {
    router.push(`/mobile/activity/activity-create?templateId=${template.id}`)
  }).catch(() => {})
}

// 复制模板
const handleCopy = async (template: Template) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  showSuccessToast('复制成功')
  onRefresh()
}

// 切换状态
const handleToggleStatus = async (template: Template) => {
  const newStatus = template.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  showConfirmDialog({
    title: `${action}模板`,
    message: `确定${action}「${template.name}」？`
  }).then(async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    template.status = newStatus
    showSuccessToast(`已${action}`)
  }).catch(() => {})
}

// 删除
const handleDelete = (template: Template) => {
  showConfirmDialog({
    title: '删除模板',
    message: `确定删除「${template.name}」？此操作不可撤销。`
  }).then(async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    showSuccessToast('删除成功')
    onRefresh()
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.activity-template-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.search-bar {
  background: #fff;
  padding-bottom: 8px;

  .filter-row {
    padding: 0 12px;
  }
}

.action-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  margin-bottom: 12px;
}

.template-grid {
  padding: 0 12px;
}

.template-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .template-icon {
    width: 60px;
    height: 60px;
    background: #f0f7ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .template-info {
    flex: 1;
    min-width: 0;

    .template-name {
      font-size: 15px;
      font-weight: 500;
      color: #323233;
      margin-bottom: 4px;
    }

    .template-desc {
      font-size: 12px;
      color: #969799;
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .template-meta {
      display: flex;
      align-items: center;
      gap: 8px;

      .usage-count {
        font-size: 12px;
        color: #969799;
      }
    }
  }

  .template-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-shrink: 0;
  }
}

.form-popup {
  padding: 16px;
  height: 100%;
  overflow-y: auto;

  .form-title {
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 16px;
  }

  .form-actions {
    padding: 16px 0;
  }
}

.preview-popup {
  padding: 16px;
  height: 100%;
  overflow-y: auto;

  .preview-title {
    font-size: 18px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 16px;
  }

  .preview-desc {
    padding: 12px 16px;
    color: #646566;
    font-size: 14px;
    line-height: 1.6;
  }

  .preview-actions {
    padding: 16px 0;
  }
}
</style>
