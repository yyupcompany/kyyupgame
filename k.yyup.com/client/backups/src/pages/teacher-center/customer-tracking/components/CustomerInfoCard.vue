<template>
  <el-card class="customer-info-card" v-loading="loading">
    <template #header>
      <div class="card-header">
        <h4>
          <el-icon><User /></el-icon>
          客户信息
        </h4>
      </div>
    </template>

    <div v-if="customer" class="customer-info">
      <div class="info-item">
        <div class="label">客户姓名</div>
        <div class="value">{{ customer.name }}</div>
      </div>
      
      <div class="info-item">
        <div class="label">联系电话</div>
        <div class="value">
          <el-icon><Phone /></el-icon>
          {{ customer.phone }}
        </div>
      </div>
      
      <div class="info-item">
        <div class="label">孩子信息</div>
        <div class="value">
          {{ customer.childName }} ({{ customer.childAge }}岁 {{ customer.childGender }})
        </div>
      </div>
      
      <div class="info-item">
        <div class="label">来源渠道</div>
        <div class="value">
          <el-tag size="small">{{ customer.source }}</el-tag>
        </div>
      </div>
      
      <div class="info-item">
        <div class="label">创建时间</div>
        <div class="value">{{ formatDate(customer.createdAt) }}</div>
      </div>
      
      <div class="info-item">
        <div class="label">负责教师</div>
        <div class="value">{{ customer.teacherName }}</div>
      </div>
      
      <div v-if="customer.notes" class="info-item full-width">
        <div class="label">备注</div>
        <div class="value notes">{{ customer.notes }}</div>
      </div>
    </div>
    
    <el-empty v-else description="暂无客户信息" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User, Phone } from '@element-plus/icons-vue';

interface Props {
  customerId: number;
}

const props = defineProps<Props>();

const loading = ref(false);
const customer = ref<any>(null);

function formatDate(date: string): string {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
}

async function loadCustomerInfo() {
  loading.value = true;
  try {
    // TODO: 从API加载客户信息
    // const response = await getCustomerInfo(props.customerId);
    // customer.value = response.data;
    
    // 模拟数据
    customer.value = {
      name: '张女士',
      phone: '138****1234',
      childName: '小明',
      childAge: 3,
      childGender: '男',
      source: '官网咨询',
      createdAt: '2025-10-01 10:30:00',
      teacherName: '李老师',
      notes: '客户对蒙氏教育很感兴趣，希望了解更多课程细节'
    };
  } catch (error) {
    console.error('加载客户信息失败:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCustomerInfo();
});
</script>

<style scoped lang="scss">
.customer-info-card {
  height: 100%;

  :deep(.el-card) {
    backdrop-filter: blur(10px);
    background: var(--el-bg-color, var(--white-alpha-90)) !important;
    border: var(--border-width-base) solid var(--el-border-color, var(--shadow-light)) !important;
    box-shadow: 0 var(--spacing-sm) var(--spacing-3xl) rgba(31, 38, 135, 0.1) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 var(--text-sm) 40px rgba(31, 38, 135, 0.15) !important;
    }
  }

  .card-header {
    h4 {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin: 0;
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .customer-info {
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: var(--spacing-md) 0;
      border-bottom: var(--border-width-base) solid var(--el-border-color-light);

      &:last-child {
        border-bottom: none;
      }

      &.full-width {
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .label {
        color: var(--el-text-color-secondary);
        font-size: var(--text-sm);
        min-width: 80px;
        font-weight: 500;
      }

      .value {
        color: var(--el-text-color-primary);
        font-size: var(--text-base);
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);

        &.notes {
          color: var(--el-text-color-secondary);
          font-weight: 400;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>

