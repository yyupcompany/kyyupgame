<template>
  <div class="coupon-list">
    <!-- 头部统计 -->
    <div class="stats-section">
      <div class="stat-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <el-icon><Ticket /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalCoupons }}</div>
            <div class="stat-label">优惠券总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <el-icon><Download /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.usedCoupons }}</div>
            <div class="stat-label">已使用</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.validCoupons }}</div>
            <div class="stat-label">有效期内</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <el-icon><Coin /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ stats.totalSaved.toLocaleString() }}</div>
            <div class="stat-label">累计节省</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="action-section">
      <div class="header-left">
        <h3>优惠券管理</h3>
        <span class="subtitle">共 {{ total }} 个优惠券</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreateCoupon">
          <el-icon><Plus /></el-icon>
          创建优惠券
        </el-button>
        <el-button @click="handleBatchGenerate">
          <el-icon><Collection /></el-icon>
          批量生成
        </el-button>
        <el-button @click="refreshList">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="优惠券类型">
          <el-select
            v-model="filters.type"
            placeholder="全部类型"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="满减券" value="reduce" />
            <el-option label="折扣券" value="discount" />
            <el-option label="礼品券" value="gift" />
            <el-option label="现金券" value="cash" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filters.status"
            placeholder="全部状态"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="未使用" value="unused" />
            <el-option label="已使用" value="used" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期">
          <el-select
            v-model="filters.validity"
            placeholder="全部"
            clearable
            @change="handleFilterChange"
          >
            <el-option label="7天内有效" value="7" />
            <el-option label="30天内有效" value="30" />
            <el-option label="90天内有效" value="90" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 优惠券列表 -->
    <div class="coupon-cards" v-loading="loading">
      <div
        v-for="coupon in coupons"
        :key="coupon.id"
        class="coupon-card"
        :class="[
          `type-${coupon.type}`,
          {
            'used': coupon.status === 'used',
            'expired': coupon.status === 'expired'
          }
        ]"
      >
        <div class="coupon-card-inner">
          <!-- 左侧金额/折扣区域 -->
          <div class="coupon-left">
            <div class="coupon-value">
              <span v-if="coupon.type === 'reduce'">¥{{ coupon.value }}</span>
              <span v-else-if="coupon.type === 'discount'">{{ coupon.value }}折</span>
              <span v-else-if="coupon.type === 'gift'">{{ coupon.value }}</span>
              <span v-else-if="coupon.type === 'cash'">¥{{ coupon.value }}</span>
            </div>
            <div class="coupon-condition">
              <span v-if="coupon.condition">{{ coupon.condition }}</span>
              <span v-else>无门槛</span>
            </div>
          </div>

          <!-- 右侧信息区域 -->
          <div class="coupon-right">
            <div class="coupon-header">
              <h4>{{ coupon.title }}</h4>
              <el-tag :type="getStatusType(coupon.status)" size="small">
                {{ getStatusText(coupon.status) }}
              </el-tag>
            </div>

            <div class="coupon-info">
              <p class="coupon-desc">{{ coupon.description }}</p>
              <div class="coupon-meta">
                <div class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  <span>有效期：{{ formatDateRange(coupon.startTime, coupon.endTime) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>持有者：{{ coupon.owner?.name || '未领取' }}</span>
                </div>
              </div>
            </div>

            <div class="coupon-actions">
              <el-button
                v-if="coupon.status === 'unused' && isCouponValid(coupon)"
                type="primary"
                size="small"
                @click="handleUseCoupon(coupon)"
              >
                使用
              </el-button>
              <el-button
                v-if="!coupon.owner"
                type="success"
                size="small"
                @click="handleClaimCoupon(coupon)"
              >
                领取
              </el-button>
              <el-dropdown @command="(command) => handleCommand(command, coupon)">
                <el-button size="small">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="share">分享优惠券</el-dropdown-item>
                    <el-dropdown-item command="transfer" v-if="coupon.status === 'unused'">
                      转让
                    </el-dropdown-item>
                    <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                    <el-dropdown-item command="invalidate" v-if="coupon.status === 'unused'">
                      作废
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <!-- 使用状态覆盖层 -->
        <div v-if="coupon.status === 'used'" class="used-overlay">
          <div class="used-stamp">已使用</div>
        </div>
        <div v-else-if="coupon.status === 'expired'" class="expired-overlay">
          <div class="expired-stamp">已过期</div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-section" v-if="total > 0">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && coupons.length === 0" description="暂无优惠券数据">
      <el-button type="primary" @click="handleCreateCoupon">创建优惠券</el-button>
    </el-empty>

    <!-- 优惠券对话框 -->
    <CouponDialog
      v-model:visible="dialogVisible"
      :coupon="selectedCoupon"
      @success="handleDialogSuccess"
    />

    <!-- 批量生成对话框 -->
    <BatchGenerateDialog
      v-model:visible="batchDialogVisible"
      @success="handleBatchSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Ticket, Download, Clock, Coin, Plus, Collection, Refresh,
  Calendar, User, ArrowDown
} from '@element-plus/icons-vue'
import { request } from '@/utils/request'
import { COUPON_ENDPOINTS } from '@/api/endpoints/marketing'
import CouponDialog from './CouponDialog.vue'
import BatchGenerateDialog from './BatchGenerateDialog.vue'

interface Coupon {
  id: number
  code: string
  type: string
  title: string
  description: string
  value: number | string
  condition?: string
  status: string
  startTime: string
  endTime: string
  ownerId?: number
  owner?: any
  usedAt?: string
  createdAt: string
}

// 响应式数据
const loading = ref(false)
const coupons = ref<Coupon[]>([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  pageSize: 20,
})

const filters = reactive({
  type: '',
  status: '',
  validity: '',
})

const dialogVisible = ref(false)
const batchDialogVisible = ref(false)
const selectedCoupon = ref<any>(null)

// 统计数据
const stats = reactive({
  totalCoupons: 0,
  usedCoupons: 0,
  validCoupons: 0,
  totalSaved: 0,
})

// 暴露方法给父组件
defineExpose({
  refreshList,
})

// 方法
const loadCoupons = async () => {
  try {
    loading.value = true

    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    }

    if (filters.type) {
      params.type = filters.type
    }
    if (filters.status) {
      params.status = filters.status
    }
    if (filters.validity) {
      params.validity = filters.validity
    }

    const response = await request.get(COUPON_ENDPOINTS.LIST, { params })

    if (response.success) {
      coupons.value = response.data.items
      total.value = response.data.total
      stats.totalCoupons = response.data.stats.totalCoupons
      stats.usedCoupons = response.data.stats.usedCoupons
      stats.validCoupons = response.data.stats.validCoupons
      stats.totalSaved = response.data.stats.totalSaved
    } else {
      throw new Error(response.message || '获取优惠券列表失败')
    }
  } catch (error: any) {
    console.error('加载优惠券列表失败:', error)
    ElMessage.error(error.message || '加载优惠券列表失败')
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  loadCoupons()
}

const handleFilterChange = () => {
  pagination.page = 1
  loadCoupons()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadCoupons()
}

const handleSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadCoupons()
}

const handleCreateCoupon = () => {
  selectedCoupon.value = null
  dialogVisible.value = true
}

const handleBatchGenerate = () => {
  batchDialogVisible.value = true
}

const handleUseCoupon = async (coupon: Coupon) => {
  try {
    await ElMessageBox.confirm(
      `确定要使用优惠券 ${coupon.code} 吗？`,
      '确认使用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await request.post(COUPON_ENDPOINTS.USE(coupon.id))

    if (response.success) {
      ElMessage.success('优惠券使用成功')
      loadCoupons()
    } else {
      throw new Error(response.message || '使用优惠券失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('使用优惠券失败:', error)
      ElMessage.error(error.message || '使用优惠券失败')
    }
  }
}

const handleClaimCoupon = async (coupon: Coupon) => {
  try {
    const response = await request.post(COUPON_ENDPOINTS.CLAIM(coupon.id))

    if (response.success) {
      ElMessage.success('优惠券领取成功')
      loadCoupons()
    } else {
      throw new Error(response.message || '领取优惠券失败')
    }
  } catch (error: any) {
    console.error('领取优惠券失败:', error)
    ElMessage.error(error.message || '领取优惠券失败')
  }
}

const handleCommand = async (command: string, coupon: Coupon) => {
  switch (command) {
    case 'share':
      await handleShareCoupon(coupon)
      break
    case 'transfer':
      handleTransferCoupon(coupon)
      break
    case 'detail':
      handleViewDetail(coupon)
      break
    case 'invalidate':
      await handleInvalidateCoupon(coupon)
      break
  }
}

const handleShareCoupon = async (coupon: Coupon) => {
  try {
    const shareUrl = `${window.location.origin}/coupon/${coupon.code}`
    await navigator.clipboard.writeText(shareUrl)
    ElMessage.success('优惠券链接已复制到剪贴板')
  } catch (error: any) {
    ElMessage.error('复制优惠券链接失败')
  }
}

const handleTransferCoupon = (coupon: Coupon) => {
  // TODO: 实现转让功能
  ElMessage.info('转让功能开发中...')
}

const handleViewDetail = (coupon: Coupon) => {
  selectedCoupon.value = coupon
  dialogVisible.value = true
}

const handleInvalidateCoupon = async (coupon: Coupon) => {
  try {
    await ElMessageBox.confirm(
      '确定要作废这张优惠券吗？此操作不可恢复。',
      '确认作废',
      {
        confirmButtonText: '确定作废',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await request.post(COUPON_ENDPOINTS.INVALIDATE(coupon.id))

    if (response.success) {
      ElMessage.success('优惠券已作废')
      loadCoupons()
    } else {
      throw new Error(response.message || '作废优惠券失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('作废优惠券失败:', error)
      ElMessage.error(error.message || '作废优惠券失败')
    }
  }
}

const handleDialogSuccess = () => {
  ElMessage.success('操作成功！')
  loadCoupons()
}

const handleBatchSuccess = () => {
  ElMessage.success('批量生成成功！')
  loadCoupons()
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'unused': 'success',
    'used': 'info',
    'expired': 'danger',
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'unused': '未使用',
    'used': '已使用',
    'expired': '已过期',
  }
  return statusMap[status] || status
}

const isCouponValid = (coupon: Coupon) => {
  const now = new Date()
  const startTime = new Date(coupon.startTime)
  const endTime = new Date(coupon.endTime)
  return now >= startTime && now <= endTime
}

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start).toLocaleDateString('zh-CN')
  const endDate = new Date(end).toLocaleDateString('zh-CN')
  return `${startDate} - ${endDate}`
}

// 定义emit
const emit = defineEmits<{
  'refresh': []
}>()

// 生命周期
onMounted(() => {
  loadCoupons()
})
</script>

<style scoped lang="scss">
.coupon-list {
  .stats-section {
    margin-bottom: 24px;

    .stat-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: var(--spacing-lg);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: var(--text-2xl);
            color: white;
          }
        }

        .stat-content {
          .stat-value {
            font-size: var(--text-2xl);
            font-weight: 700;
            color: #303133;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: var(--text-sm);
            color: #909399;
          }
        }
      }
    }
  }

  .action-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      h3 {
        margin: 0 8px 0 0;
        font-size: var(--text-lg);
        font-weight: 600;
      }

      .subtitle {
        color: #909399;
        font-size: var(--text-sm);
      }
    }

    .header-right {
      display: flex;
      gap: var(--spacing-md);
    }
  }

  .filter-section {
    margin-bottom: 20px;
    padding: var(--spacing-md);
    background: #f8f9fa;
    border-radius: 8px;

    .filter-form {
      margin: 0;
    }
  }

  .coupon-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: 20px;

    .coupon-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      &.type-reduce {
        .coupon-card-inner {
          background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
        }
      }

      &.type-discount {
        .coupon-card-inner {
          background: linear-gradient(135deg, #4ecdc4 0%, #6ee7df 100%);
        }
      }

      &.type-gift {
        .coupon-card-inner {
          background: linear-gradient(135deg, #ffe66d 0%, #fff1a0 100%);
        }
      }

      &.type-cash {
        .coupon-card-inner {
          background: linear-gradient(135deg, #a8e6cf 0%, #c3f0df 100%);
        }
      }

      &.used, &.expired {
        opacity: 0.7;
      }

      .coupon-card-inner {
        display: flex;
        padding: var(--spacing-lg);
        color: white;
        position: relative;
        height: 160px;

        &::before {
          content: '';
          position: absolute;
          right: 100px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 8px,
            rgba(255, 255, 255, 0.3) 8px,
            rgba(255, 255, 255, 0.3) 16px
          );
        }

        .coupon-left {
          flex: 0 0 120px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding-right: 20px;

          .coupon-value {
            font-size: var(--text-4xl);
            font-weight: 700;
            margin-bottom: 8px;
            line-height: 1;
          }

          .coupon-condition {
            font-size: var(--text-xs);
            opacity: 0.9;
          }
        }

        .coupon-right {
          flex: 1;
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .coupon-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;

            h4 {
              margin: 0;
              font-size: var(--text-base);
              font-weight: 600;
              color: white;
              flex: 1;
              margin-right: 8px;
            }

            :deep(.el-tag) {
              background: rgba(255, 255, 255, 0.2);
              border-color: rgba(255, 255, 255, 0.3);
              color: white;
            }
          }

          .coupon-info {
            flex: 1;

            .coupon-desc {
              margin: 0 0 12px 0;
              font-size: var(--text-sm);
              opacity: 0.9;
              line-height: 1.4;
            }

            .coupon-meta {
              .meta-item {
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                font-size: var(--text-xs);
                opacity: 0.8;
                margin-bottom: 4px;

                .el-icon {
                  font-size: var(--text-sm);
                }
              }
            }
          }

          .coupon-actions {
            display: flex;
            gap: var(--spacing-sm);

            .el-button {
              border-color: rgba(255, 255, 255, 0.5);
              background: rgba(255, 255, 255, 0.1);
              color: white;

              &:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.8);
              }
            }
          }
        }
      }

      .used-overlay, .expired-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;

        .used-stamp, .expired-stamp {
          background: rgba(255, 255, 255, 0.9);
          color: #67c23a;
          padding: var(--spacing-sm) 16px;
          border-radius: 4px;
          font-weight: 600;
          font-size: var(--text-lg);
          transform: rotate(-15deg);
        }

        .expired-stamp {
          color: #f56c6c;
        }
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>