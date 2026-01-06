<template>
  <el-dialog
    v-model="visible"
    :title="`管理渠道联系人 - ${channel?.channelName || ''}`"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="contact-manage">
      <!-- 添加联系人 -->
      <div class="add-contact-section">
        <el-form :inline="true" :model="newContact" @submit.prevent="addContact">
          <el-form-item label="姓名">
            <el-input v-model="newContact.name" placeholder="联系人姓名" style="max-max-max-width: 120px; width: 100%; width: 100%; width: 100%" />
          </el-form-item>
          <el-form-item label="职位">
            <el-input v-model="newContact.position" placeholder="职位" style="width: 120px" />
          </el-form-item>
          <el-form-item label="电话">
            <el-input v-model="newContact.phone" placeholder="手机号码" style="max-width: 140px; width: 100%" />
          </el-form-item>
          <el-form-item label="微信">
            <el-input v-model="newContact.wechat" placeholder="微信号" style="width: 120px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addContact" :loading="addLoading">
              <UnifiedIcon name="Plus" />
              添加
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 联系人列表 -->
      <div class="contact-list">
        <div class="table-wrapper">
<el-table class="responsive-table" :data="contacts" v-loading="loading" style="width: 100%">
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="position" label="职位" width="120" />
          <el-table-column prop="phone" label="电话" width="140" />
          <el-table-column prop="wechat" label="微信" width="120" />
          <el-table-column label="添加时间" width="120">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-button 
                size="small" 
                type="danger" 
                @click="removeContact(row)"
                :loading="row.deleting"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
</div>

        <div v-if="contacts.length === 0" class="empty-state">
          <el-empty description="暂无联系人" />
        </div>
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
import { ref, reactive, computed, watch } from 'vue'
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

const loading = ref(false)
const addLoading = ref(false)
const contacts = ref<any[]>([])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const newContact = reactive({
  name: '',
  position: '',
  phone: '',
  wechat: ''
})

const resetNewContact = () => {
  Object.assign(newContact, {
    name: '',
    position: '',
    phone: '',
    wechat: ''
  })
}

const loadContacts = async () => {
  if (!props.channel?.id) return

  loading.value = true
  try {
    const res = await request.get(`/api/marketing/channels/${props.channel.id}/contacts`)
    contacts.value = res.data?.items || []
  } catch (e: any) {
    console.error(e)
    ElMessage.error(e.message || '加载联系人失败')
  } finally {
    loading.value = false
  }
}

const addContact = async () => {
  if (!newContact.name.trim()) {
    ElMessage.warning('请输入联系人姓名')
    return
  }

  if (!props.channel?.id) return

  addLoading.value = true
  try {
    await request.post(`/api/marketing/channels/${props.channel.id}/contacts`, newContact)
    ElMessage.success('添加联系人成功')
    resetNewContact()
    loadContacts()
    emit('success')
  } catch (e: any) {
    ElMessage.error(e.message || '添加联系人失败')
  } finally {
    addLoading.value = false
  }
}

const removeContact = async (contact: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除联系人"${contact.name}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    contact.deleting = true
    await request.delete(`/api/marketing/channels/${props.channel.id}/contacts/${contact.id}`)
    ElMessage.success('删除成功')
    loadContacts()
    emit('success')
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.message || '删除失败')
    }
  } finally {
    contact.deleting = false
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

const handleClose = () => {
  resetNewContact()
  visible.value = false
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.channel?.id) {
    loadContacts()
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.contact-manage {
  .add-contact-section {
    background: var(--color-bg-soft);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-lg);
  }

  .contact-list {
    .empty-state {
      padding: var(--spacing-xl);
      text-align: center;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>
