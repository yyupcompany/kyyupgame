<template>
  <UnifiedCenterLayout
    title="缴费管理"
    description="管理学生缴费单生成、支付确认和状态跟踪"
    :show-header="true"
    :show-actions="true"
    @create="showCreateDialog = true"
    @refresh="handleRefresh"
  >
    <template #actions>
      <el-button @click="handleRefresh" :loading="loading">
        <UnifiedIcon name="Refresh" />
        刷新
      </el-button>
      <el-button type="success" @click="showBatchDialog = true">
        <UnifiedIcon name="default" />
        批量生成
      </el-button>
      <el-button type="primary" @click="showCreateDialog = true">
        <UnifiedIcon name="Plus" />
        创建缴费单
      </el-button>
    </template>

    <template #content>
      <!-- 测试内容 -->
      <div class="test-content">
        <h3>缴费管理页面测试</h3>
        <p>如果您能看到这个内容，说明CenterContainer组件工作正常。</p>

        <!-- 简化的统计卡片 -->
        <div class="stats-grid-unified">
          <div class="stat-card">
            <h4>待缴费</h4>
            <p>{{ stats.pending }}笔</p>
            <p>¥{{ formatMoney(stats.pendingAmount) }}</p>
          </div>
          <div class="stat-card">
            <h4>已缴费</h4>
            <p>{{ stats.paid }}笔</p>
            <p>¥{{ formatMoney(stats.paidAmount) }}</p>
          </div>
          <div class="stat-card">
            <h4>逾期费用</h4>
            <p>{{ stats.overdue }}笔</p>
            <p>¥{{ formatMoney(stats.overdueAmount) }}</p>
          </div>
          <div class="stat-card">
            <h4>已取消</h4>
            <p>{{ stats.cancelled }}笔</p>
            <p>¥{{ formatMoney(stats.cancelledAmount) }}</p>
          </div>
        </div>
      </div>
    </template>



    <!-- 创建缴费单对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建缴费单"
      width="800px"

    >
      <!-- 这里放置创建缴费单的表单 -->
      <div class="create-form">
        <el-alert
          title="创建缴费单功能开发中"
          type="info"
          :closable="false"
          show-icon
        />
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary">创建</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量生成对话框 -->
    <el-dialog
      v-model="showBatchDialog"
      title="批量生成缴费单"
      width="600px"

    >
      <div class="batch-form">
        <el-alert
          title="批量生成功能开发中"
          type="info"
          :closable="false"
          show-icon
        />
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showBatchDialog = false">取消</el-button>
          <el-button type="primary">生成</el-button>
        </div>
      </template>
    </el-dialog>
  </UnifiedCenterLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Refresh, Plus, Document
} from '@element-plus/icons-vue'
import UnifiedCenterLayout from '@/components/layout/UnifiedCenterLayout.vue'

const loading = ref(false)
const showCreateDialog = ref(false)
const showBatchDialog = ref(false)

// 统计数据
const stats = reactive({
  pending: 23,
  pendingAmount: 85000,
  paid: 142,
  paidAmount: 520000,
  overdue: 5,
  overdueAmount: 12000,
  cancelled: 3,
  cancelledAmount: 8500
})

// 格式化金额
const formatMoney = (amount: number): string => {
  return amount.toLocaleString()
}

// 刷新处理
const handleRefresh = () => {
  ElMessage.success('刷新成功')
}
</script>

<style scoped lang="scss">
.test-content {
  padding: var(--text-2xl);

  h3 {
    color: var(--text-primary);
    margin-bottom: var(--text-lg);
  }

  p {
    color: var(--text-secondary);
    margin-bottom: var(--text-2xl);
  }
}

.stat-card {
  background: white;
  border-radius: var(--spacing-sm);
  padding: var(--text-lg);
  box-shadow: 0 2px var(--spacing-xs) var(--shadow-light);
  text-align: center;

  h4 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-primary);
  }

  p {
    margin: var(--spacing-xs) 0;
    color: var(--text-secondary);
  }
}
</style>