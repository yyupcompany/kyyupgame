<template>
  <MobileSubPageLayout title="客户资源池" back-path="/mobile/teacher-center">
    <div class="customer-pool-mobile">
      <!-- 统计卡片 -->
      <div class="stats-section">
        <van-grid :column-num="2" :gutter="12">
          <van-grid-item>
            <van-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon total">
                  <van-icon name="friends-o" />
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ stats.total }}</div>
                  <div class="stats-label">总客户数</div>
                </div>
              </div>
            </van-card>
          </van-grid-item>
          <van-grid-item>
            <van-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon unassigned">
                  <van-icon name="user-o" />
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ stats.unassigned }}</div>
                  <div class="stats-label">未分配</div>
                </div>
              </div>
            </van-card>
          </van-grid-item>
          <van-grid-item>
            <van-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon mine">
                  <van-icon name="checked" />
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ stats.mine }}</div>
                  <div class="stats-label">已分配给我</div>
                </div>
              </div>
            </van-card>
          </van-grid-item>
          <van-grid-item>
            <van-card class="stats-card">
              <div class="stats-content">
                <div class="stats-icon assigned">
                  <van-icon name="friends" />
                </div>
                <div class="stats-info">
                  <div class="stats-number">{{ stats.assigned }}</div>
                  <div class="stats-label">已分配给他人</div>
                </div>
              </div>
            </van-card>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 筛选区域 -->
      <van-card class="filter-section">
        <van-search
          v-model="filterForm.keyword"
          placeholder="请输入客户姓名或电话"
          @search="loadCustomers"
          @clear="loadCustomers"
        />

        <van-cell-group inset>
          <van-field
            :value="assignmentStatusText"
            label="分配状态"
            placeholder="选择状态"
            readonly
            is-link
            @click="showAssignmentStatusPicker = true"
          />
          <van-field
            :value="sourceText"
            label="客户来源"
            placeholder="选择来源"
            readonly
            is-link
            @click="showSourcePicker = true"
          />
        </van-cell-group>
      </van-card>

      <!-- 批量操作栏 -->
      <div v-if="selectedCustomers.length > 0" class="batch-actions">
        <div class="batch-bar" safe-area-inset-bottom>
          <div class="batch-content">
            <span class="batch-info">已选择 {{ selectedCustomers.length }} 个客户</span>
            <van-button
              type="primary"
              size="small"
              @click="handleBatchApply"
              :disabled="selectedCustomers.length === 0"
            >
              批量申请
            </van-button>
          </div>
        </div>
      </div>

      <!-- 客户列表 -->
      <van-card class="customer-list">
        <van-checkbox-group v-model="selectedCustomers">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <van-swipe-cell v-for="customer in customers" :key="customer.id">
              <van-cell-group inset>
                <van-cell
                  :border="false"
                  clickable
                  @click="toggleCustomerSelection(customer)"
                >
                  <template #icon>
                    <van-checkbox
                      v-if="!customer.assigned_teacher_id"
                      :name="customer.id"
                      @click.stop
                    />
                    <van-icon v-else name="info" color="#969799" />
                  </template>

                  <template #title>
                    <div class="customer-name">
                      {{ customer.name }}
                      <van-tag
                        :type="getSourceType(customer.source)"
                        size="small"
                        class="source-tag"
                      >
                        {{ getSourceText(customer.source) }}
                      </van-tag>
                    </div>
                  </template>

                  <template #label>
                    <div class="customer-info">
                      <div class="phone">{{ customer.phone }}</div>
                      <div class="time">创建时间：{{ formatDateTime(customer.createdAt) }}</div>
                      <div class="assignment-info">
                        <van-tag
                          :type="getAssignmentStatusType(customer)"
                          size="small"
                        >
                          {{ getAssignmentStatusText(customer) }}
                        </van-tag>
                        <span v-if="customer.assignedTeacherName" class="teacher-name">
                          {{ customer.assignedTeacherName }}
                        </span>
                      </div>
                    </div>
                  </template>

                  <template #right-icon>
                    <van-button
                      v-if="!customer.assigned_teacher_id"
                      type="primary"
                      size="small"
                      @click.stop="handleApply(customer)"
                    >
                      申请跟踪
                    </van-button>
                    <van-button
                      v-else-if="customer.assignmentStatus === 'mine'"
                      type="success"
                      size="small"
                      disabled
                    >
                      已分配给我
                    </van-button>
                    <van-button
                      v-else
                      type="default"
                      size="small"
                      disabled
                    >
                      已分配
                    </van-button>
                  </template>
                </van-cell>
              </van-cell-group>
            </van-swipe-cell>
          </van-list>
        </van-checkbox-group>
      </van-card>

      <!-- 申请对话框 -->
      <van-dialog
        v-model:show="applyDialogVisible"
        :title="isBatchApply ? '批量申请客户' : '申请客户'"
        :show-cancel-button="true"
        :before-close="beforeCloseApplyDialog"
      >
        <div class="apply-dialog-content">
          <div class="apply-customers">
            <van-cell-group inset>
              <van-cell v-if="isBatchApply" title="申请客户" is-link @click="showApplyCustomers = true">
                <template #value>
                  已选择 {{ applyCustomers.length }} 个客户
                </template>
              </van-cell>
              <van-cell v-else :title="applyCustomers[0]?.name" :label="applyCustomers[0]?.phone" />
            </van-cell-group>
          </div>

          <van-field
            v-model="applyForm.applyReason"
            type="textarea"
            label="申请理由"
            placeholder="请输入申请理由（选填）"
            :rows="4"
            maxlength="200"
            show-word-limit
          />
        </div>

        <template #footer>
          <van-button size="large" @click="applyDialogVisible = false">取消</van-button>
          <van-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="handleSubmitApply"
          >
            提交申请
          </van-button>
        </template>
      </van-dialog>

      <!-- 申请客户列表弹窗 -->
      <van-popup v-model:show="showApplyCustomers" position="bottom" :style="{ height: '60%' }">
        <div class="apply-customers-popup">
          <van-nav-bar
            title="已选择的客户"
            left-text="取消"
            right-text="确定"
            @click-left="showApplyCustomers = false"
            @click-right="showApplyCustomers = false"
          />
          <van-cell-group>
            <van-swipe-cell v-for="customer in applyCustomers" :key="customer.id">
              <van-cell :title="customer.name" :label="customer.phone">
                <template #right-icon>
                  <van-button
                    type="danger"
                    size="small"
                    @click="removeApplyCustomer(customer.id)"
                  >
                    移除
                  </van-button>
                </template>
              </van-cell>
            </van-swipe-cell>
          </van-cell-group>
        </div>
      </van-popup>

      <!-- 分配状态选择器 -->
      <van-popup v-model:show="showAssignmentStatusPicker" position="bottom">
        <van-picker
          :columns="assignmentStatusOptions"
          @confirm="onAssignmentStatusConfirm"
          @cancel="showAssignmentStatusPicker = false"
        />
      </van-popup>

      <!-- 客户来源选择器 -->
      <van-popup v-model:show="showSourcePicker" position="bottom">
        <van-picker
          :columns="sourceOptions"
          @confirm="onSourceConfirm"
          @cancel="showSourcePicker = false"
        />
      </van-popup>
    </div>
  </MobileSubPageLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant'
import { formatDateTime } from '@/utils/date'
import { customerApplicationApi } from '@/api/endpoints/customer-application'
import { customerPoolApi } from '@/api/modules/customer-pool'

// 页面组件
import MobileSubPageLayout from '@/components/mobile/layouts/MobileSubPageLayout.vue'

// 组合式API
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const finished = ref(false)
const applyDialogVisible = ref(false)
const showApplyCustomers = ref(false)
const showAssignmentStatusPicker = ref(false)
const showSourcePicker = ref(false)
const isBatchApply = ref(false)
const selectedCustomers = ref<number[]>([])
const applyCustomers = ref<any[]>([])

// 统计数据
const stats = reactive({
  total: 0,
  unassigned: 0,
  mine: 0,
  assigned: 0,
})

// 筛选表单
const filterForm = reactive({
  assignmentStatus: '',
  source: '',
  keyword: '',
})

// 申请表单
const applyForm = reactive({
  applyReason: '',
})

// 客户列表
const customers = ref<any[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

// 分配状态选项
const assignmentStatusOptions = [
  { text: '全部', value: '' },
  { text: '未分配', value: 'unassigned' },
  { text: '已分配给我', value: 'mine' },
  { text: '已分配给他人', value: 'assigned' },
]

// 客户来源选项
const sourceOptions = [
  { text: '全部', value: '' },
  { text: '线上咨询', value: 'online' },
  { text: '电话咨询', value: 'phone' },
  { text: '现场咨询', value: 'onsite' },
  { text: '转介绍', value: 'referral' },
]

// 计算属性
const assignmentStatusText = computed(() => {
  const option = assignmentStatusOptions.find(opt => opt.value === filterForm.assignmentStatus)
  return option ? option.text : ''
})

const sourceText = computed(() => {
  const option = sourceOptions.find(opt => opt.value === filterForm.source)
  return option ? option.text : ''
})

// 加载客户列表
const loadCustomers = async (reset = false) => {
  if (reset) {
    pagination.page = 1
    customers.value = []
    finished.value = false
  }

  loading.value = true
  try {
    const response = await customerPoolApi.getCustomers({
      ...filterForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })

    const data = response.data

    if (reset) {
      customers.value = data.items || []
      // 更新统计数据
      if (data.stats) {
        Object.assign(stats, data.stats)
      }
    } else {
      customers.value.push(...(data.items || []))
    }

    pagination.total = data.total || 0

    // 如果没有返回统计数据，根据当前列表计算
    if (!data.stats) {
      stats.total = customers.value.length
      stats.unassigned = customers.value.filter(c => !c.assigned_teacher_id).length
      stats.mine = customers.value.filter(c => c.assignmentStatus === 'mine').length
      stats.assigned = customers.value.filter(c => c.assignmentStatus === 'assigned').length
    }

    // 检查是否已加载完成
    if (customers.value.length >= pagination.total) {
      finished.value = true
    }

    pagination.page++
  } catch (error: any) {
    console.error('加载客户列表失败:', error)

    // 如果API调用失败，使用模拟数据作为fallback
    if (reset) {
      const mockCustomers = [
        {
          id: 1,
          name: '张三',
          phone: '13800138001',
          source: 'online',
          assigned_teacher_id: null,
          assignmentStatus: 'unassigned',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: '李四',
          phone: '13800138002',
          source: 'phone',
          assigned_teacher_id: userStore.userId,
          assignmentStatus: 'mine',
          assignedTeacherName: '我',
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          name: '王五',
          phone: '13800138003',
          source: 'onsite',
          assigned_teacher_id: 999,
          assignmentStatus: 'assigned',
          assignedTeacherName: '其他教师',
          createdAt: new Date().toISOString(),
        },
        {
          id: 4,
          name: '赵六',
          phone: '13800138004',
          source: 'referral',
          assigned_teacher_id: null,
          assignmentStatus: 'unassigned',
          createdAt: new Date().toISOString(),
        },
      ]

      customers.value = mockCustomers
      pagination.total = mockCustomers.length

      // 更新统计
      stats.total = customers.value.length
      stats.unassigned = customers.value.filter(c => !c.assigned_teacher_id).length
      stats.mine = customers.value.filter(c => c.assignmentStatus === 'mine').length
      stats.assigned = customers.value.filter(c => c.assignmentStatus === 'assigned').length

      finished.value = true
    }

    // 如果是开发环境，显示提示信息，否则不干扰用户体验
    if (process.env.NODE_ENV === 'development') {
      console.warn('使用模拟数据，请检查API连接:', error.message)
    }
  } finally {
    loading.value = false
  }
}

// 列表加载更多
const onLoad = () => {
  loadCustomers()
}

// 选择器确认事件处理
const onAssignmentStatusConfirm = ({ selectedOptions }: any) => {
  filterForm.assignmentStatus = selectedOptions[0]?.value || ''
  showAssignmentStatusPicker.value = false
  loadCustomers(true)
}

const onSourceConfirm = ({ selectedOptions }: any) => {
  filterForm.source = selectedOptions[0]?.value || ''
  showSourcePicker.value = false
  loadCustomers(true)
}

// 切换客户选择状态
const toggleCustomerSelection = (customer: any) => {
  if (!customer.assigned_teacher_id) {
    const index = selectedCustomers.value.indexOf(customer.id)
    if (index > -1) {
      selectedCustomers.value.splice(index, 1)
    } else {
      selectedCustomers.value.push(customer.id)
    }
  }
}

// 单个申请
const handleApply = (customer: any) => {
  isBatchApply.value = false
  applyCustomers.value = [customer]
  applyForm.applyReason = ''
  applyDialogVisible.value = true
}

// 批量申请
const handleBatchApply = async () => {
  if (selectedCustomers.value.length === 0) {
    showToast('请选择要申请的客户')
    return
  }

  const selectedCustomerDetails = customers.value.filter(c =>
    selectedCustomers.value.includes(c.id)
  )

  isBatchApply.value = true
  applyCustomers.value = selectedCustomerDetails
  applyForm.applyReason = ''
  applyDialogVisible.value = true
}

// 移除申请客户
const removeApplyCustomer = (customerId: number) => {
  const index = applyCustomers.value.findIndex(c => c.id === customerId)
  if (index > -1) {
    applyCustomers.value.splice(index, 1)
  }

  // 同时从已选择列表中移除
  const selectedIndex = selectedCustomers.value.indexOf(customerId)
  if (selectedIndex > -1) {
    selectedCustomers.value.splice(selectedIndex, 1)
  }

  if (applyCustomers.value.length === 0) {
    applyDialogVisible.value = false
  }
}

// 对话框关闭前的处理
const beforeCloseApplyDialog = (action: string, done: () => void) => {
  if (action === 'confirm') {
    handleSubmitApply().then(() => {
      done()
    })
  } else {
    done()
  }
}

// 提交申请
const handleSubmitApply = async () => {
  if (applyCustomers.value.length === 0) {
    showToast('没有要申请的客户')
    return false
  }

  submitting.value = true
  try {
    const customerIds = applyCustomers.value.map(c => c.id)
    const response = await customerApplicationApi.applyForCustomers({
      customerIds,
      applyReason: applyForm.applyReason || undefined,
    })

    const result = response.data
    if (result.successCount > 0) {
      showToast(`成功申请 ${result.successCount} 个客户`)

      if (result.failedCount > 0) {
        showToast(`${result.failedCount} 个客户申请失败`)
      }

      // 刷新列表
      loadCustomers(true)
      applyDialogVisible.value = false
      selectedCustomers.value = []
      showApplyCustomers.value = false
      return true
    } else {
      showToast('申请失败')
      return false
    }
  } catch (error: any) {
    console.error('申请失败:', error)
    showToast(error.message || '申请失败')
    return false
  } finally {
    submitting.value = false
  }
}

// 获取来源文本
const getSourceText = (source: string) => {
  const sourceMap: Record<string, string> = {
    online: '线上咨询',
    phone: '电话咨询',
    onsite: '现场咨询',
    referral: '转介绍',
  }
  return sourceMap[source] || source
}

// 获取来源标签类型
const getSourceType = (source: string) => {
  const typeMap: Record<string, any> = {
    online: 'primary',
    phone: 'success',
    onsite: 'warning',
    referral: 'info',
  }
  return typeMap[source] || 'default'
}

// 获取分配状态文本
const getAssignmentStatusText = (row: any) => {
  if (!row.assigned_teacher_id) return '未分配'
  if (row.assignmentStatus === 'mine') return '已分配给我'
  return '已分配给他人'
}

// 获取分配状态标签类型
const getAssignmentStatusType = (row: any) => {
  if (!row.assigned_teacher_id) return 'default'
  if (row.assignmentStatus === 'mine') return 'success'
  return 'warning'
}

// 生命周期
onMounted(() => {
  // 主题检测
  const detectTheme = () => {
    const htmlTheme = document.documentElement.getAttribute('data-theme')
    // isDark.value = htmlTheme === 'dark'
  }
  detectTheme()
  loadCustomers(true)
})
</script>

<style lang="scss" scoped>
@import '@/styles/mobile-base.scss';
.customer-pool-mobile {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 50px; // 为底部导航栏留空间

  .stats-section {
    margin: var(--spacing-md);

    .stats-card {
      margin: 0;
      background: var(--card-bg);

      :deep(.van-card__content) {
        padding: var(--spacing-md);
      }

      .stats-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .stats-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-lg);

          &.total {
            background: #e3f2fd;
            color: #1976d2;
          }

          &.unassigned {
            background: #e8f5e8;
            color: #4caf50;
          }

          &.mine {
            background: #fff3e0;
            color: #ff9800;
          }

          &.assigned {
            background: #f5f5f5;
            color: #9e9e9e;
          }
        }

        .stats-info {
          flex: 1;

          .stats-number {
            font-size: var(--text-2xl);
            font-weight: 600;
            color: #323233;
            line-height: 1;
          }

          .stats-label {
            font-size: var(--text-xs);
            color: #969799;
            margin-top: var(--spacing-xs);
          }
        }
      }
    }
  }

  .filter-section {
    margin: var(--spacing-md);
  }

  .batch-actions {
    position: sticky;
    top: 46px;
    z-index: 100;
    background: var(--card-bg);
    border-bottom: 1px solid #ebedf0;

    .batch-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-sm) 16px;

      .batch-info {
        font-size: var(--text-sm);
        color: #323233;
      }
    }
  }

  .customer-list {
    margin: var(--spacing-md);

    .customer-name {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-weight: 500;

      .source-tag {
        flex-shrink: 0;
      }
    }

    .customer-info {
      .phone {
        color: #323233;
        font-size: var(--text-sm);
        margin-bottom: var(--spacing-xs);
      }

      .time {
        color: #969799;
        font-size: var(--text-xs);
        margin-bottom: var(--spacing-xs);
      }

      .assignment-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .teacher-name {
          font-size: var(--text-xs);
          color: #969799;
        }
      }
    }
  }

  .apply-dialog-content {
    padding: var(--spacing-md);

    .apply-customers {
      margin-bottom: var(--spacing-lg);
    }
  }

  .apply-customers-popup {
    height: 100%;
    background: var(--card-bg);
  }

  .batch-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    padding: 10px 16px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom));

    .batch-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .batch-info {
        font-size: var(--text-sm);
        color: #323233;
      }
    }
  }
}

// 响应式适配
@media (min-width: 768px) {
  .customer-pool-mobile {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}

/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
</style>