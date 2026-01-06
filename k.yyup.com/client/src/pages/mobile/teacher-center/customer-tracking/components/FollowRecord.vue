<template>
  <div class="mobile-follow-record">
    <!-- 头部操作栏 -->
    <van-sticky>
      <div class="header-actions">
        <van-button
          type="primary"
          size="small"
          icon="plus"
          @click="showAddDialog = true"
        >
          新增跟进
        </van-button>
        <van-button
          size="small"
          icon="refresh"
          @click="$emit('refresh')"
        >
          刷新
        </van-button>
      </div>
    </van-sticky>

    <!-- 跟进记录时间线 -->
    <div class="timeline-container" v-loading="loading">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多记录了"
          @load="onLoad"
        >
          <div v-if="records.length > 0" class="timeline">
            <div
              v-for="(record, index) in records"
              :key="record.id"
              class="timeline-item"
              :class="{ 'last-item': index === records.length - 1 }"
            >
              <!-- 时间线节点 -->
              <div class="timeline-node" :class="getTimelineNodeClass(record.result)">
                <van-icon :name="getMethodIcon(record.method)" size="16" />
              </div>

              <!-- 时间线内容 -->
              <div class="timeline-content">
                <!-- 记录卡片 -->
                <van-swipe-cell>
                  <van-cell-group inset class="record-card" @click="viewRecordDetail(record)">
                    <!-- 卡片头部 -->
                    <template #title>
                      <div class="record-header">
                        <div class="record-method">
                          <van-tag :type="getMethodTagType(record.method)" size="small">
                            {{ getMethodText(record.method) }}
                          </van-tag>
                          <span class="record-time">{{ formatTime(record.followTime) }}</span>
                        </div>
                        <van-tag
                          :type="getResultType(record.result)"
                          size="small"
                          :color="getResultColor(record.result)"
                        >
                          {{ getResultText(record.result) }}
                        </van-tag>
                      </div>
                    </template>

                    <!-- 卡片内容 -->
                    <van-cell>
                      <template #title>
                        <div class="record-content">
                          <div class="content-item">
                            <span class="label">跟进内容：</span>
                            <span class="text">{{ record.content }}</span>
                          </div>
                          <div v-if="record.feedback" class="content-item">
                            <span class="label">客户反馈：</span>
                            <span class="text feedback">{{ record.feedback }}</span>
                          </div>
                          <div v-if="record.nextFollowTime" class="content-item">
                            <span class="label">下次跟进：</span>
                            <span
                              class="text next-follow"
                              :class="{ 'overdue': isOverdue(record.nextFollowTime) }"
                            >
                              {{ formatTime(record.nextFollowTime) }}
                            </span>
                          </div>
                          <div v-if="record.remark" class="content-item">
                            <span class="label">备注：</span>
                            <span class="text remark">{{ record.remark }}</span>
                          </div>
                        </div>
                      </template>
                    </van-cell>
                  </van-cell-group>

                  <!-- 滑动操作 -->
                  <template #right>
                    <van-button
                      square
                      type="primary"
                      text="编辑"
                      @click="editRecord(record)"
                    />
                    <van-button
                      square
                      type="danger"
                      text="删除"
                      @click="deleteRecord(record)"
                    />
                  </template>
                </van-swipe-cell>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <van-empty
            v-else
            description="暂无跟进记录"
            image="search"
          >
            <van-button
              type="primary"
              size="small"
              @click="showAddDialog = true"
            >
              添加第一条跟进记录
            </van-button>
          </van-empty>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 新增/编辑跟进弹窗 -->
    <van-popup
      v-model:show="showAddDialog"
      position="bottom"
      round
      :style="{ height: '90%' }"
      closeable
      close-icon="cross"
      @close="handleCloseDialog"
    >
      <div class="follow-form">
        <div class="form-header">
          <h3>{{ editingRecord ? '编辑跟进记录' : '新增跟进记录' }}</h3>
        </div>

        <van-form @submit="submitFollow" ref="followFormRef">
          <!-- 跟进方式 -->
          <van-cell-group inset>
            <van-field name="method" label="跟进方式">
              <template #input>
                <van-radio-group v-model="followForm.method" direction="horizontal">
                  <van-radio name="phone" checked-color="#1989fa">电话</van-radio>
                  <van-radio name="wechat" checked-color="#07c160">微信</van-radio>
                  <van-radio name="visit" checked-color="#ff976a">上门</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <van-field name="method" label="">
              <template #input>
                <van-radio-group v-model="followForm.method" direction="horizontal">
                  <van-radio name="online" checked-color="#7232dd">在线</van-radio>
                  <van-radio name="other" checked-color="#ee0a24">其他</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>

          <!-- 跟进内容 -->
          <van-cell-group inset>
            <van-field
              v-model="followForm.content"
              name="content"
              label="跟进内容"
              type="textarea"
              placeholder="请输入跟进内容"
              :rules="[{ required: true, message: '请输入跟进内容' }]"
              rows="4"
              maxlength="500"
              show-word-limit
            />
          </van-cell-group>

          <!-- 客户反馈 -->
          <van-cell-group inset>
            <van-field
              v-model="followForm.feedback"
              name="feedback"
              label="客户反馈"
              type="textarea"
              placeholder="请输入客户反馈"
              rows="3"
              maxlength="500"
              show-word-limit
            />
          </van-cell-group>

          <!-- 跟进结果 -->
          <van-cell-group inset>
            <van-field name="result" label="跟进结果">
              <template #input>
                <van-radio-group v-model="followForm.result">
                  <van-cell-group inset>
                    <van-cell
                      v-for="option in resultOptions"
                      :key="option.value"
                      :title="option.label"
                      :value="option.value"
                      clickable
                      @click="followForm.result = option.value"
                    >
                      <template #right-icon>
                        <van-radio :name="option.value" checked-color="#1989fa" />
                      </template>
                    </van-cell>
                  </van-cell-group>
                </van-radio-group>
              </template>
            </van-field>
          </van-cell-group>

          <!-- 下次跟进时间 -->
          <van-cell-group inset>
            <van-field
              v-model="followForm.nextFollowTime"
              name="nextFollowTime"
              label="下次跟进"
              placeholder="选择下次跟进时间"
              is-link
              readonly
              @click="showDatePicker = true"
            />
          </van-cell-group>

          <!-- 备注 -->
          <van-cell-group inset>
            <van-field
              v-model="followForm.remark"
              name="remark"
              label="备注"
              type="textarea"
              placeholder="其他备注信息"
              rows="2"
              maxlength="200"
              show-word-limit
            />
          </van-cell-group>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <van-button
              block
              type="primary"
              native-type="submit"
              :loading="submitting"
              size="large"
            >
              {{ editingRecord ? '更新记录' : '添加记录' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 日期时间选择器 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        v-model="followForm.nextFollowTime"
        type="datetime"
        title="选择下次跟进时间"
        :min-date="new Date()"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- 记录详情弹窗 -->
    <van-popup
      v-model:show="showDetailDialog"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <div class="record-detail" v-if="currentRecord">
        <div class="detail-header">
          <h3>跟进记录详情</h3>
        </div>
        <van-cell-group inset>
          <van-cell title="跟进方式">
            <template #value>
              <van-tag :type="getMethodTagType(currentRecord.method)">
                {{ getMethodText(currentRecord.method) }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="跟进时间" :value="formatTime(currentRecord.followTime)" />
          <van-cell title="跟进结果">
            <template #value>
              <van-tag :type="getResultType(currentRecord.result)">
                {{ getResultText(currentRecord.result) }}
              </van-tag>
            </template>
          </van-cell>
          <van-cell title="跟进内容" />
          <van-cell>
            <div class="detail-content">{{ currentRecord.content }}</div>
          </van-cell>
          <van-cell v-if="currentRecord.feedback" title="客户反馈" />
          <van-cell v-if="currentRecord.feedback">
            <div class="detail-content feedback">{{ currentRecord.feedback }}</div>
          </van-cell>
          <van-cell v-if="currentRecord.nextFollowTime" title="下次跟进" />
          <van-cell v-if="currentRecord.nextFollowTime">
            <div class="detail-content" :class="{ 'overdue': isOverdue(currentRecord.nextFollowTime) }">
              {{ formatTime(currentRecord.nextFollowTime) }}
            </div>
          </van-cell>
          <van-cell v-if="currentRecord.remark" title="备注" />
          <van-cell v-if="currentRecord.remark">
            <div class="detail-content remark">{{ currentRecord.remark }}</div>
          </van-cell>
        </van-cell-group>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'

interface FollowRecord {
  id: string
  customerId: string
  method: string
  content: string
  feedback: string
  result: string
  followTime: string
  nextFollowTime: string
  remark: string
}

interface Props {
  customerId: string
  records?: FollowRecord[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  records: () => [],
  loading: false
})

const emit = defineEmits<{
  'add-record': [record: Omit<FollowRecord, 'id'>]
  'update-record': [record: FollowRecord]
  'delete-record': [recordId: string]
  'refresh': []
}>()

// 响应式数据
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const showDatePicker = ref(false)
const submitting = ref(false)
const editingRecord = ref<FollowRecord | null>(null)
const currentRecord = ref<FollowRecord | null>(null)
const refreshing = ref(false)
const finished = ref(false)
const records = ref<FollowRecord[]>([])

// 跟进结果选项
const resultOptions = [
  { label: '🟢 有意向', value: 'interested' },
  { label: '🟡 需考虑', value: 'considering' },
  { label: '🔴 无意向', value: 'not_interested' },
  { label: '✅ 已成交', value: 'success' },
  { label: '❌ 已流失', value: 'lost' }
]

// 跟进表单
const followForm = reactive({
  method: 'phone',
  content: '',
  feedback: '',
  result: '',
  nextFollowTime: null as Date | null,
  remark: ''
})

const followFormRef = ref()

// 方法
const getMethodText = (method: string): string => {
  const texts = {
    phone: '电话',
    wechat: '微信',
    visit: '上门',
    online: '在线',
    other: '其他'
  }
  return texts[method] || method
}

const getMethodIcon = (method: string): string => {
  const icons = {
    phone: 'phone-o',
    wechat: 'wechat',
    visit: 'location-o',
    online: 'chat-o',
    other: 'more-o'
  }
  return icons[method] || 'more-o'
}

const getMethodTagType = (method: string): 'primary' | 'success' | 'warning' | 'danger' => {
  const types = {
    phone: 'primary',
    wechat: 'success',
    visit: 'warning',
    online: 'primary',
    other: 'default'
  }
  return types[method] || 'default'
}

const getResultText = (result: string): string => {
  const texts = {
    interested: '有意向',
    considering: '需考虑',
    not_interested: '无意向',
    success: '已成交',
    lost: '已流失'
  }
  return texts[result] || result
}

const getResultType = (result: string): 'success' | 'warning' | 'danger' => {
  const types = {
    interested: 'success',
    considering: 'warning',
    not_interested: 'danger',
    success: 'success',
    lost: 'danger'
  }
  return types[result] || 'default'
}

const getResultColor = (result: string): string => {
  const colors = {
    interested: '#07c160',
    considering: '#ff976a',
    not_interested: '#ee0a24',
    success: '#07c160',
    lost: '#ee0a24'
  }
  return colors[result] || '#1989fa'
}

const getTimelineNodeClass = (result: string): string => {
  const classes = {
    interested: 'success',
    considering: 'warning',
    not_interested: 'danger',
    success: 'success',
    lost: 'danger'
  }
  return classes[result] || 'primary'
}

const formatTime = (time: string): string => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isOverdue = (time: string): boolean => {
  if (!time) return false
  return new Date(time) < new Date()
}

const viewRecordDetail = (record: FollowRecord) => {
  currentRecord.value = record
  showDetailDialog.value = true
}

const editRecord = (record: FollowRecord) => {
  editingRecord.value = record
  Object.assign(followForm, {
    method: record.method,
    content: record.content,
    feedback: record.feedback,
    result: record.result,
    nextFollowTime: record.nextFollowTime ? new Date(record.nextFollowTime) : null,
    remark: record.remark
  })
  showAddDialog.value = true
}

const deleteRecord = async (record: FollowRecord) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这条跟进记录吗？',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#ee0a24'
    })
    emit('delete-record', record.id)
    showToast('删除成功')
  } catch {
    // 用户取消删除
  }
}

const onDateConfirm = (value: Date) => {
  followForm.nextFollowTime = value
  showDatePicker.value = false
}

const submitFollow = async () => {
  try {
    await followFormRef.value?.validate()
    submitting.value = true

    const recordData = {
      customerId: props.customerId,
      method: followForm.method,
      content: followForm.content,
      feedback: followForm.feedback,
      result: followForm.result,
      followTime: new Date().toISOString(),
      nextFollowTime: followForm.nextFollowTime ? followForm.nextFollowTime.toISOString() : '',
      remark: followForm.remark
    }

    if (editingRecord.value) {
      emit('update-record', { ...recordData, id: editingRecord.value.id })
      showToast('跟进记录更新成功')
    } else {
      emit('add-record', recordData)
      showToast('跟进记录添加成功')
    }

    handleCloseDialog()
  } catch (error) {
    showToast('操作失败，请检查表单内容')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(followForm, {
    method: 'phone',
    content: '',
    feedback: '',
    result: '',
    nextFollowTime: null,
    remark: ''
  })
  followFormRef.value?.resetValidation()
  editingRecord.value = null
}

const handleCloseDialog = () => {
  resetForm()
  showAddDialog.value = false
}

const onRefresh = () => {
  finished.value = false
  emit('refresh')
  setTimeout(() => {
    refreshing.value = false
  }, 1000)
}

const onLoad = () => {
  // 模拟加载更多
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 监听器
watch(() => props.records, (newRecords) => {
  records.value = newRecords
}, { immediate: true })
</script>

<style scoped lang="scss">
.mobile-follow-record {
  background: var(--van-background-color);
  min-height: 100vh;
  padding-bottom: var(--van-padding-md);

  .header-actions {
    display: flex;
    gap: var(--van-padding-sm);
    padding: var(--van-padding-sm);
    background: white;
    box-shadow: 0 2px 8px rgba(100, 101, 102, 0.08);
  }

  .timeline-container {
    padding: var(--van-padding-sm);
  }

  .timeline {
    .timeline-item {
      display: flex;
      margin-bottom: var(--van-padding-lg);

      &.last-item {
        .timeline-node::after {
          display: none;
        }
      }

      .timeline-node {
        position: relative;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: var(--van-padding-md);
        flex-shrink: 0;
        background: white;
        color: white;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        &::after {
          content: '';
          position: absolute;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: calc(100% + var(--van-padding-lg));
          background: var(--van-border-color);
        }

        &.primary {
          background: var(--van-primary-color);
        }

        &.success {
          background: var(--van-success-color);
        }

        &.warning {
          background: var(--van-warning-color);
        }

        &.danger {
          background: var(--van-danger-color);
        }
      }

      .timeline-content {
        flex: 1;
        min-width: 0;
      }
    }
  }

  .record-card {
    margin-bottom: var(--van-padding-sm);

    .record-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--van-padding-xs);

      .record-method {
        display: flex;
        align-items: center;
        gap: var(--van-padding-xs);
      }

      .record-time {
        font-size: var(--van-font-size-xs);
        color: var(--van-gray-6);
      }
    }

    .record-content {
      .content-item {
        display: flex;
        margin-bottom: var(--van-padding-xs);
        line-height: 1.5;

        .label {
          min-width: 80px;
          color: var(--van-gray-6);
          font-size: var(--van-font-size-sm);
          flex-shrink: 0;
        }

        .text {
          flex: 1;
          font-size: var(--van-font-size-sm);
          color: var(--van-text-color);
          word-break: break-word;

          &.feedback {
            color: var(--van-success-color);
          }

          &.next-follow {
            &.overdue {
              color: var(--van-danger-color);
              font-weight: 600;
            }
          }

          &.remark {
            color: var(--van-gray-6);
            font-style: italic;
          }
        }
      }
    }
  }
}

.follow-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .form-header {
    padding: var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    h3 {
      margin: 0;
      font-size: var(--van-font-size-lg);
      text-align: center;
    }
  }

  :deep(.van-form) {
    flex: 1;
    overflow-y: auto;
    padding: var(--van-padding-sm);
  }

  .form-actions {
    padding: var(--van-padding-md);
    background: white;
    border-top: 1px solid var(--van-border-color);
  }
}

.record-detail {
  height: 100%;
  display: flex;
  flex-direction: column;

  .detail-header {
    padding: var(--van-padding-md);
    border-bottom: 1px solid var(--van-border-color);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    h3 {
      margin: 0;
      font-size: var(--van-font-size-lg);
      text-align: center;
    }
  }

  :deep(.van-cell-group) {
    flex: 1;
    overflow-y: auto;
    margin: var(--van-padding-sm);
  }

  .detail-content {
    padding: var(--van-padding-sm);
    background: var(--van-gray-1);
    border-radius: var(--van-border-radius-sm);
    line-height: 1.6;
    font-size: var(--van-font-size-sm);

    &.feedback {
      background: rgba(7, 193, 96, 0.1);
      border-left: 3px solid var(--van-success-color);
    }

    &.overdue {
      background: rgba(238, 10, 36, 0.1);
      border-left: 3px solid var(--van-danger-color);
      color: var(--van-danger-color);
      font-weight: 600;
    }

    &.remark {
      background: rgba(255, 156, 0, 0.1);
      border-left: 3px solid var(--van-warning-color);
      color: var(--van-gray-7);
    }
  }
}

/* 暗黑模式适配 */
:deep([data-theme="dark"]) {
  .mobile-follow-record {
    .header-actions {
      background: var(--van-background-color-dark);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .timeline-node {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .detail-content {
      background: var(--van-gray-8);

      &.feedback {
        background: rgba(7, 193, 96, 0.2);
      }

      &.overdue {
        background: rgba(238, 10, 36, 0.2);
      }

      &.remark {
        background: rgba(255, 156, 0, 0.2);
      }
    }
  }
}
</style>