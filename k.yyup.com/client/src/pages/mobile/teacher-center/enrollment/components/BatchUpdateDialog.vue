<template>
  <van-popup
    v-model:show="dialogVisible"
    position="bottom"
    :style="{ height: '50%' }"
    round
    closeable
    @closed="handleClosed"
  >
    <div class="batch-update-dialog">
      <!-- 头部 -->
      <div class="dialog-header">
        <van-icon name="edit" size="24" color="#409eff" />
        <h3>批量更新客户 ({{ customerIds.length }}个)</h3>
      </div>

      <!-- 更新表单 -->
      <div class="dialog-content">
        <van-form @submit="handleSubmit">
          <van-cell-group inset title="更新字段">
            <van-field
              v-model="updateForm.status"
              name="status"
              label="状态"
              placeholder="选择新状态"
              readonly
              is-link
              @click="showStatusPicker = true"
            >
              <template #left-icon>
                <van-icon name="shield-o" />
              </template>
            </van-field>

            <van-field
              v-model="updateForm.source"
              name="source"
              label="来源"
              placeholder="选择新来源"
              readonly
              is-link
              @click="showSourcePicker = true"
            >
              <template #left-icon>
                <van-icon name="location-o" />
              </template>
            </van-field>

            <van-field
              v-model="updateForm.notes"
              name="notes"
              label="备注"
              type="textarea"
              placeholder="添加备注（将追加到现有备注）"
              rows="3"
              maxlength="200"
              show-word-limit
            >
              <template #left-icon>
                <van-icon name="notes-o" />
              </template>
            </van-field>
          </van-cell-group>

          <div class="submit-button">
            <van-button
              type="primary"
              size="large"
              block
              native-type="submit"
              :loading="updating"
              loading-text="更新中..."
            >
              <van-icon name="success" />
              确认批量更新
            </van-button>
          </div>
        </van-form>
      </div>

      <!-- 状态选择器 -->
      <van-popup v-model:show="showStatusPicker" position="bottom">
        <van-picker
          :columns="statusColumns"
          @confirm="onStatusConfirm"
          @cancel="showStatusPicker = false"
        />
      </van-popup>

      <!-- 来源选择器 -->
      <van-popup v-model:show="showSourcePicker" position="bottom">
        <van-picker
          :columns="sourceColumns"
          @confirm="onSourceConfirm"
          @cancel="showSourcePicker = false"
        />
      </van-popup>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { updateCustomer } from '@/api/modules/customer'

interface Props {
  modelValue: boolean
  customerIds: string[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated', customerIds: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showStatusPicker = ref(false)
const showSourcePicker = ref(false)
const updating = ref(false)

const updateForm = reactive({
  status: '',
  source: '',
  notes: ''
})

const statusColumns = [
  { text: '不修改', value: '' },
  { text: '新增', value: 'new' },
  { text: '已联系', value: 'contacted' },
  { text: '跟进中', value: 'following' },
  { text: '已报名', value: 'enrolled' },
  { text: '已关闭', value: 'closed' }
]

const sourceColumns = [
  { text: '不修改', value: '' },
  { text: '线上推广', value: 'online' },
  { text: '线下活动', value: 'offline' },
  { text: '朋友推荐', value: 'referral' },
  { text: '其他', value: 'other' }
]

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const onStatusConfirm = ({ selectedOptions }: any) => {
  updateForm.status = selectedOptions[0].value
  updateForm.status = selectedOptions[0].text
  showStatusPicker.value = false
}

const onSourceConfirm = ({ selectedOptions }: any) => {
  updateForm.source = selectedOptions[0].value
  updateForm.source = selectedOptions[0].text
  showSourcePicker.value = false
}

const handleSubmit = async () => {
  // 检查是否至少选择了一个更新字段
  if (!updateForm.status && !updateForm.source && !updateForm.notes) {
    showToast('请至少选择一个更新字段')
    return
  }

  updating.value = true
  showLoadingToast({
    message: '批量更新中...',
    forbidClick: true,
    duration: 0
  })

  try {
    let successCount = 0
    let failedCount = 0

    // 批量更新每个客户
    for (const customerId of props.customerIds) {
      try {
        const updateData: any = {}

        if (updateForm.status) {
          updateData.status = updateForm.status === '不修改' ? undefined : statusColumns.find(s => s.text === updateForm.status)?.value
        }
        if (updateForm.source) {
          updateData.source = updateForm.source === '不修改' ? undefined : sourceColumns.find(s => s.text === updateForm.source)?.value
        }
        if (updateForm.notes) {
          updateData.notes = updateForm.notes
        }

        await updateCustomer(customerId, updateData)
        successCount++
      } catch (error) {
        console.error(`更新客户 ${customerId} 失败:`, error)
        failedCount++
      }
    }

    closeToast()

    if (failedCount === 0) {
      showToast(`成功更新 ${successCount} 个客户`)
    } else {
      showToast(`更新完成：成功 ${successCount} 个，失败 ${failedCount} 个`)
    }

    emit('updated', props.customerIds)
    dialogVisible.value = false
  } catch (error) {
    closeToast()
    console.error('批量更新失败:', error)
    showToast('批量更新失败，请重试')
  } finally {
    updating.value = false
  }
}

const handleClosed = () => {
  // 重置表单
  Object.assign(updateForm, {
    status: '',
    source: '',
    notes: ''
  })
}
</script>

<style scoped lang="scss">
.batch-update-dialog {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--van-background-color-light);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 16px 12px;
  border-bottom: 1px solid var(--van-border-color);

  h3 {
    flex: 1;
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--van-text-color);
  }
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);

  .submit-button {
    margin-top: 16px;
  }
}

// 暗黑模式适配
:root[data-theme="dark"] {
  .batch-update-dialog {
    background: var(--van-background-color-dark);
  }
}
</style>
