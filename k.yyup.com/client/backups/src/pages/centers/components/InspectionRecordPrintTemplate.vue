<template>
  <div class="inspection-record-print-template">
    <!-- 打印头部 -->
    <div class="print-header">
      <h1>{{ kindergartenName }}</h1>
      <h2>检查记录表</h2>
      <div class="header-info">
        <div class="info-item">
          <span class="label">编号：</span>
          <span class="value">{{ recordData.id || '______' }}</span>
        </div>
        <div class="info-item">
          <span class="label">检查日期：</span>
          <span class="value">{{ recordData.checkDate || '______' }}</span>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="section avoid-break">
      <h3 class="section-title">一、基本信息</h3>
      <table class="info-table">
        <tr>
          <td class="label-cell">检查类型</td>
          <td class="value-cell" colspan="3">{{ planData?.inspectionType?.name || '______' }}</td>
        </tr>
        <tr>
          <td class="label-cell">计划日期</td>
          <td class="value-cell">{{ planData?.planDate || '______' }}</td>
          <td class="label-cell">实际日期</td>
          <td class="value-cell">{{ recordData.checkDate || '______' }}</td>
        </tr>
        <tr>
          <td class="label-cell">检查人员</td>
          <td class="value-cell">{{ recordData.checkerName || '______' }}</td>
          <td class="label-cell">总分/等级</td>
          <td class="value-cell">{{ recordData.totalScore || '0' }}分 / {{ recordData.grade || '______' }}</td>
        </tr>
      </table>
    </div>

    <!-- 检查项明细 -->
    <div class="section">
      <h3 class="section-title">二、检查项明细</h3>
      <table class="detail-table">
        <thead>
          <tr>
            <th width="50">序号</th>
            <th width="150">检查项名称</th>
            <th width="100">检查分类</th>
            <th width="80">检查状态</th>
            <th width="80">得分</th>
            <th>问题描述</th>
            <th width="100">备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in recordData.items" :key="index" class="avoid-break">
            <td class="center">{{ index + 1 }}</td>
            <td>{{ item.itemName }}</td>
            <td>{{ item.itemCategory || '-' }}</td>
            <td class="center">
              <span :class="getStatusClass(item.status)">
                {{ getStatusLabel(item.status) }}
              </span>
            </td>
            <td class="center">{{ item.score || 0 }}/{{ item.maxScore || 0 }}</td>
            <td>{{ item.problemDescription || '-' }}</td>
            <td>{{ item.notes || '-' }}</td>
          </tr>
          <tr v-if="!recordData.items || recordData.items.length === 0">
            <td colspan="7" class="center empty-text">暂无检查项</td>
          </tr>
        </tbody>
      </table>

      <!-- 统计汇总 -->
      <div class="summary-box">
        <div class="summary-item">
          <span class="label">通过项：</span>
          <span class="value pass">{{ getStatusCount('pass') }}项</span>
        </div>
        <div class="summary-item">
          <span class="label">警告项：</span>
          <span class="value warning">{{ getStatusCount('warning') }}项</span>
        </div>
        <div class="summary-item">
          <span class="label">不通过项：</span>
          <span class="value fail">{{ getStatusCount('fail') }}项</span>
        </div>
        <div class="summary-item">
          <span class="label">总计：</span>
          <span class="value">{{ recordData.items?.length || 0 }}项</span>
        </div>
      </div>
    </div>

    <!-- 检查总结 -->
    <div class="section avoid-break">
      <h3 class="section-title">三、检查总结</h3>
      <div class="content-box">
        <pre>{{ recordData.summary || '暂无总结' }}</pre>
      </div>
    </div>

    <!-- 改进建议 -->
    <div class="section avoid-break">
      <h3 class="section-title">四、改进建议</h3>
      <div class="content-box">
        <pre>{{ recordData.suggestions || '暂无建议' }}</pre>
      </div>
    </div>

    <!-- 签名区 -->
    <div class="section signature-section avoid-break">
      <div class="signature-box">
        <div class="signature-item">
          <div class="signature-label">检查人签名：</div>
          <div class="signature-content">
            <img v-if="recordData.checkerSignature" :src="recordData.checkerSignature" class="signature-img" />
            <span v-else>________________</span>
          </div>
        </div>
        <div class="signature-item">
          <div class="signature-label">日期：</div>
          <div class="signature-content">{{ recordData.checkDate || '________________' }}</div>
        </div>
      </div>
    </div>

    <!-- 打印备注 -->
    <div class="print-footer">
      <p>打印时间：{{ new Date().toLocaleString('zh-CN') }}</p>
      <p>本记录由幼儿园招生管理系统自动生成</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Printer, Download } from '@element-plus/icons-vue';

interface Props {
  recordData: any;
  planData?: any;
  kindergartenName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  kindergartenName: '幼儿园'
});

// 获取状态统计
const getStatusCount = (status: string) => {
  if (!props.recordData.items) return 0;
  return props.recordData.items.filter((item: any) => item.status === status).length;
};

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pass: '✓ 通过',
    warning: '⚠ 警告',
    fail: '✗ 不通过'
  };
  return labels[status] || status;
};

// 获取状态样式类
const getStatusClass = (status: string) => {
  return `status-${status}`;
};
</script>

<style scoped lang="scss">
.inspection-record-print-template {
  font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
  color: var(--text-primary);
  line-height: 1.6;

  .print-header {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: var(--text-2xl);
    margin-bottom: var(--spacing-8xl);

    h1 {
      font-size: var(--text-3xl);
      font-weight: bold;
      margin: 0 0 var(--spacing-2xl) 0;
      color: #000;
    }

    h2 {
      font-size: var(--text-2xl);
      font-weight: bold;
      margin: 0 0 var(--spacing-4xl) 0;
      color: var(--text-primary);
    }

    .header-info {
      display: flex;
      justify-content: space-between;
      margin-top: var(--spacing-4xl);
      font-size: var(--text-base);

      .info-item {
        .label {
          font-weight: bold;
        }
        .value {
          border-bottom: var(--border-width-base) solid var(--text-primary);
          padding: 0 var(--spacing-2xl);
          min-width: 150px;
          display: inline-block;
        }
      }
    }
  }

  .section {
    margin-bottom: var(--spacing-6xl);

    .section-title {
      font-size: var(--text-lg);
      font-weight: bold;
      margin-bottom: var(--spacing-4xl);
      color: #000;
      border-left: var(--spacing-xs) solid var(--primary-color);
      padding-left: var(--spacing-2xl);
    }
  }

  .info-table,
  .detail-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--spacing-4xl);

    th, td {
      border: var(--border-width-base) solid var(--text-primary);
      padding: var(--spacing-2xl);
      font-size: var(--text-sm);
    }

    th {
      background-color: var(--bg-secondary);
      font-weight: bold;
      text-align: center;
    }

    .label-cell {
      background-color: #f9f9f9;
      font-weight: bold;
      width: 120px;
      text-align: right;
      padding-right: var(--spacing-4xl);
    }

    .value-cell {
      padding-left: var(--spacing-4xl);
    }

    .center {
      text-align: center;
    }

    .empty-text {
      color: var(--text-tertiary);
      font-style: italic;
    }
  }

  .detail-table {
    .status-pass {
      color: var(--success-color);
      font-weight: bold;
    }

    .status-warning {
      color: var(--warning-color);
      font-weight: bold;
    }

    .status-fail {
      color: var(--danger-color);
      font-weight: bold;
    }
  }

  .summary-box {
    display: flex;
    justify-content: space-around;
    padding: var(--spacing-4xl);
    background: #f9f9f9;
    border: var(--border-width-base) solid #ddd;
    border-radius: var(--spacing-xs);
    margin-top: var(--spacing-2xl);

    .summary-item {
      text-align: center;

      .label {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .value {
        font-size: var(--text-xl);
        font-weight: bold;
        margin-left: var(--spacing-base);

        &.pass {
          color: var(--success-color);
        }

        &.warning {
          color: var(--warning-color);
        }

        &.fail {
          color: var(--danger-color);
        }
      }
    }
  }

  .content-box {
    border: var(--border-width-base) solid #ddd;
    padding: var(--spacing-4xl);
    background: var(--bg-tertiary);
    border-radius: var(--spacing-xs);
    min-height: 100px;

    pre {
      margin: 0;
      font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.8;
      font-size: var(--text-sm);
    }
  }

  .signature-section {
    margin-top: var(--spacing-10xl);

    .signature-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .signature-item {
        .signature-label {
          font-weight: bold;
          margin-bottom: var(--spacing-2xl);
        }

        .signature-content {
          min-width: 200px;
          border-bottom: var(--border-width-base) solid var(--text-primary);
          padding-bottom: var(--spacing-base);
          text-align: center;

          .signature-img {
            max-width: 150px;
            max-height: 80px;
          }
        }
      }
    }
  }

  .print-footer {
    margin-top: var(--spacing-10xl);
    padding-top: var(--text-2xl);
    border-top: var(--border-width-base) solid #ddd;
    text-align: center;
    font-size: var(--text-sm);
    color: var(--text-tertiary);

    p {
      margin: var(--spacing-base) 0;
    }
  }
}

// 打印模式专用样式
@media print {
  .inspection-record-print-template {
    .summary-box {
      background: var(--bg-secondary) !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .info-table .label-cell,
    .detail-table th {
      background: var(--bg-gray-light) !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
}
</style>

