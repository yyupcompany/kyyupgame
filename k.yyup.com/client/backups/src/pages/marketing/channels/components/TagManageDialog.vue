<template>
  <el-dialog
    v-model="visible"
    :title="`管理渠道标签 - ${channel?.channelName || ''}`"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="tag-manage">
      <!-- 添加标签 -->
      <div class="add-tag-section">
        <el-form :inline="true" @submit.prevent="addTags">
          <el-form-item label="标签">
            <el-select
              v-model="selectedTags"
              multiple
              filterable
              allow-create
              placeholder="选择或输入新标签"
              style="width: 300px"
            >
              <el-option
                v-for="tag in availableTags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addTags" :loading="addLoading">
              <el-icon><Plus /></el-icon>
              添加
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 当前标签 -->
      <div class="current-tags">
        <h4>当前标签</h4>
        <div class="tags-container">
          <el-tag
            v-for="tag in currentTags"
            :key="tag.id"
            closable
            @close="removeTag(tag)"
            style="margin-right: var(--spacing-sm); margin-bottom: var(--spacing-sm)"
          >
            {{ tag.name }}
          </el-tag>
          <div v-if="currentTags.length === 0" class="empty-tags">
            暂无标签
          </div>
        </div>
      </div>

      <!-- 标签统计 -->
      <div class="tag-stats">
        <h4>标签使用统计</h4>
        <el-table :data="tagStats" size="small" style="width: 100%">
          <el-table-column prop="name" label="标签名称" />
          <el-table-column prop="count" label="使用次数" width="100" />
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button
                size="small"
                @click="addExistingTag(row.name)"
                :disabled="isTagExists(row.name)"
              >
                添加
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
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

const addLoading = ref(false)
const currentTags = ref<any[]>([])
const availableTags = ref<string[]>([])
const tagStats = ref<any[]>([])
const selectedTags = ref<string[]>([])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loadCurrentTags = async () => {
  if (!props.channel?.id) return

  try {
    const res = await request.get(`/marketing/channels/${props.channel.id}/tags`)
    currentTags.value = res.data?.items || []
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '加载标签失败')
  }
}

const loadAvailableTags = async () => {
  try {
    const res = await request.get('/marketing/channels/tags')
    availableTags.value = res.data?.items || []
  } catch (e: any) {
    console.error('加载可用标签失败:', e)
    // 如果API不存在，使用默认标签
    if (e.response?.status === 404) {
      availableTags.value = ['重要', '推荐', '热门', '新渠道', '高转化', '低成本', '活跃', '优质']
    }
  }
}

const loadTagStats = async () => {
  try {
    const res = await request.get('/marketing/channels/tags/stats')
    tagStats.value = res.data?.items || []
  } catch (e: any) {
    console.error('加载标签统计失败:', e)
  }
}

const addTags = async () => {
  if (selectedTags.value.length === 0) {
    ElMessage.warning('请选择要添加的标签')
    return
  }

  if (!props.channel?.id) return

  addLoading.value = true
  try {
    await request.post(`/marketing/channels/${props.channel.id}/tags`, {
      tags: selectedTags.value
    })
    ElMessage.success('添加标签成功')
    selectedTags.value = []
    loadCurrentTags()
    loadTagStats()
    emit('success')
  } catch (e: any) {
    ElMessage.error(e.message || '添加标签失败')
  } finally {
    addLoading.value = false
  }
}

const addExistingTag = (tagName: string) => {
  if (!selectedTags.value.includes(tagName)) {
    selectedTags.value.push(tagName)
  }
}

const removeTag = async (tag: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除标签"${tag.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await request.delete(`/marketing/channels/${props.channel.id}/tags/${tag.id}`)
    ElMessage.success('删除成功')
    loadCurrentTags()
    loadTagStats()
    emit('success')
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '删除失败')
    }
  }
}

const isTagExists = (tagName: string) => {
  return currentTags.value.some(tag => tag.name === tagName)
}

const handleClose = () => {
  selectedTags.value = []
  visible.value = false
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.channel?.id) {
    loadCurrentTags()
    loadTagStats()
  }
})

onMounted(() => {
  loadAvailableTags()
})
</script>

<style scoped lang="scss">
@import '@/styles/design-tokens.scss';

.tag-manage {
  .add-tag-section {
    background: var(--color-bg-soft);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-lg);
  }

  .current-tags {
    margin-bottom: var(--spacing-lg);

    h4 {
      margin-bottom: var(--spacing-md);
      color: var(--color-text-primary);
    }

    .tags-container {
      min-height: var(--button-height-lg);
      padding: var(--spacing-md);
      border: var(--border-width-base) dashed var(--color-border-light);
      border-radius: var(--border-radius-md);

      .empty-tags {
        color: var(--color-text-secondary);
        text-align: center;
        padding: var(--spacing-md);
      }
    }
  }

  .tag-stats {
    h4 {
      margin-bottom: var(--spacing-md);
      color: var(--color-text-primary);
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
