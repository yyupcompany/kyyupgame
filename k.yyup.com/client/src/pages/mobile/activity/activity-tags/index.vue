<template>
  <MobileCenterLayout title="活动标签" back-path="/mobile/activity/activity-index">
    <div class="activity-tags-mobile">
      <!-- 操作栏 -->
      <div class="action-bar">
        <van-button type="primary" size="small" icon="plus" @click="handleCreate">新建标签</van-button>
      </div>

      <!-- 标签分类 -->
      <div class="tag-categories">
        <div v-for="category in tagCategories" :key="category.id" class="category-section">
          <div class="category-header">
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.tags.length }}个</span>
          </div>
          <div class="tag-list">
            <van-tag
              v-for="tag in category.tags"
              :key="tag.id"
              :type="tag.color"
              size="large"
              closeable
              @close="handleDelete(tag)"
              @click="handleEdit(tag)"
            >
              {{ tag.name }}
            </van-tag>
          </div>
        </div>
      </div>

      <van-empty v-if="tagCategories.length === 0" description="暂无标签" />
    </div>

    <!-- 新建/编辑标签 -->
    <van-popup v-model:show="showForm" position="bottom" round :style="{ height: '50%' }" closeable>
      <div class="form-popup">
        <div class="popup-title">{{ isEdit ? '编辑标签' : '新建标签' }}</div>
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field v-model="tagForm.name" label="标签名称" placeholder="请输入" required :rules="[{ required: true }]" />
            <van-field v-model="tagForm.categoryName" is-link readonly label="所属分类" placeholder="请选择" required @click="showCategoryPicker = true" />
            <van-field label="标签颜色">
              <template #input>
                <div class="color-selector">
                  <van-tag v-for="c in colorOptions" :key="c" :type="c" size="medium" :class="{ active: tagForm.color === c }" @click="tagForm.color = c">示例</van-tag>
                </div>
              </template>
            </van-field>
          </van-cell-group>
          <div class="form-actions">
            <van-button type="primary" block native-type="submit" :loading="submitting">{{ isEdit ? '保存' : '创建' }}</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showCategoryPicker" position="bottom" round>
      <van-picker title="选择分类" :columns="categoryOptions" @confirm="onCategoryConfirm" @cancel="showCategoryPicker = false" />
    </van-popup>
  </MobileCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import type { TagType } from 'vant'
import MobileCenterLayout from '@/components/mobile/layouts/MobileCenterLayout.vue'

interface Tag { id: number; name: string; categoryId: number; color: TagType }
interface Category { id: number; name: string; tags: Tag[] }

const tagCategories = ref<Category[]>([])
const showForm = ref(false)
const showCategoryPicker = ref(false)
const isEdit = ref(false)
const submitting = ref(false)

const colorOptions: TagType[] = ['primary', 'success', 'warning', 'danger', 'default']

const categoryOptions = [
  { text: '活动类型', value: 1 },
  { text: '参与人群', value: 2 },
  { text: '活动状态', value: 3 }
]

const tagForm = reactive({
  id: 0,
  name: '',
  categoryId: 0,
  categoryName: '',
  color: 'primary'
})

const loadData = async () => {
  tagCategories.value = [
    { id: 1, name: '活动类型', tags: [
      { id: 1, name: '开放日', categoryId: 1, color: 'primary' },
      { id: 2, name: '家长会', categoryId: 1, color: 'success' },
      { id: 3, name: '亲子活动', categoryId: 1, color: 'warning' }
    ]},
    { id: 2, name: '参与人群', tags: [
      { id: 4, name: '全体家长', categoryId: 2, color: 'primary' },
      { id: 5, name: '新生家长', categoryId: 2, color: 'success' },
      { id: 6, name: '毕业班', categoryId: 2, color: 'danger' }
    ]},
    { id: 3, name: '活动状态', tags: [
      { id: 7, name: '即将开始', categoryId: 3, color: 'warning' },
      { id: 8, name: '热门', categoryId: 3, color: 'danger' }
    ]}
  ]
}

const handleCreate = () => {
  isEdit.value = false
  tagForm.id = 0
  tagForm.name = ''
  tagForm.categoryId = 0
  tagForm.categoryName = ''
  tagForm.color = 'primary'
  showForm.value = true
}

const handleEdit = (tag: Tag) => {
  isEdit.value = true
  tagForm.id = tag.id
  tagForm.name = tag.name
  tagForm.categoryId = tag.categoryId
  tagForm.categoryName = categoryOptions.find(c => c.value === tag.categoryId)?.text || ''
  tagForm.color = tag.color
  showForm.value = true
}

const handleDelete = (tag: Tag) => {
  showConfirmDialog({ title: '删除标签', message: `确定删除标签「${tag.name}」？` }).then(() => {
    showSuccessToast('删除成功')
    loadData()
  }).catch(() => {})
}

const onCategoryConfirm = ({ selectedOptions }: any) => {
  showCategoryPicker.value = false
  if (selectedOptions[0]) {
    tagForm.categoryId = selectedOptions[0].value
    tagForm.categoryName = selectedOptions[0].text
  }
}

const onSubmit = async () => {
  if (!tagForm.name || !tagForm.categoryId) {
    showToast('请填写完整信息')
    return
  }
  submitting.value = true
  await new Promise(r => setTimeout(r, 1000))
  submitting.value = false
  showForm.value = false
  showSuccessToast(isEdit.value ? '保存成功' : '创建成功')
  loadData()
}

onMounted(() => { loadData() })
</script>

<style scoped lang="scss">
.activity-tags-mobile {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.action-bar {
  padding: 12px 16px;
  background: #fff;
}

.tag-categories {
  padding: 12px;
}

.category-section {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;

  .category-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    .category-name { font-size: 15px; font-weight: 500; }
    .category-count { font-size: 12px; color: #969799; }
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.form-popup {
  padding: 16px;
  .popup-title { font-size: 18px; font-weight: 500; text-align: center; margin-bottom: 16px; }
  .form-actions { padding: 16px 0; }
}

.color-selector {
  display: flex;
  gap: 8px;
  .van-tag {
    cursor: pointer;
    opacity: 0.6;
    &.active { opacity: 1; transform: scale(1.1); }
  }
}
</style>
