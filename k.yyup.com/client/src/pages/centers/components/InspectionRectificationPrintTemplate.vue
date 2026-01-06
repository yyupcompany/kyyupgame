<template>
  <div class="rectification-print-template">
    <!-- 打印头部 -->
    <div class="print-header">
      <h1>{{ kindergartenName }}</h1>
      <h2>整改任务单</h2>
      <div class="header-info">
        <div class="info-item">
          <span class="label">任务编号：</span>
          <span class="value">{{ rectificationData.id || '______' }}</span>
        </div>
        <div class="info-item">
          <span class="label">创建日期：</span>
          <span class="value">{{ formatDate(rectificationData.createdAt) }}</span>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="section avoid-break">
      <h3 class="section-title">一、问题信息</h3>
      <table class="info-table">
        <tr>
          <td class="label-cell">问题描述</td>
          <td class="value-cell" colspan="3">{{ rectificationData.problemDescription || '______' }}</td>
        </tr>
        <tr>
          <td class="label-cell">问题严重程度</td>
          <td class="value-cell">
            <span :class="`severity-${rectificationData.problemSeverity}`">
              {{ getSeverityLabel(rectificationData.problemSeverity) }}
            </span>
          </td>
          <td class="label-cell">检查计划</td>
          <td class="value-cell">{{ planData?.inspectionType?.name || '______' }}</td>
        </tr>
        <tr>
          <td class="label-cell">责任人</td>
          <td class="value-cell">{{ rectificationData.responsiblePersonName || '______' }}</td>
          <td class="label-cell">截止日期</td>
          <td class="value-cell">{{ rectificationData.deadline || '______' }}</td>
        </tr>
      </table>
    </div>

    <!-- 整改措施 -->
    <div class="section avoid-break">
      <h3 class="section-title">二、整改措施</h3>
      <div class="content-box">
        <pre>{{ rectificationData.rectificationMeasures || '暂无整改措施' }}</pre>
      </div>
    </div>

    <!-- 整改进度 -->
    <div class="section" v-if="progressLogs && progressLogs.length > 0">
      <h3 class="section-title">三、整改进度记录</h3>
      <table class="detail-table">
        <thead>
          <tr>
            <th width="80">日期</th>
            <th width="80">进度</th>
            <th>进度说明</th>
            <th width="100">操作人</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in progressLogs" :key="index" class="avoid-break">
            <td class="center">{{ log.logDate }}</td>
            <td class="center">
              <span class="progress-value">{{ log.progress }}%</span>
            </td>
            <td>{{ log.description || '-' }}</td>
            <td class="center">{{ log.operatorName || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 完成情况 -->
    <div class="section avoid-break" v-if="rectificationData.status === 'completed' || rectificationData.status === 'verified'">
      <h3 class="section-title">四、完成情况</h3>
      <table class="info-table">
        <tr>
          <td class="label-cell">完成日期</td>
          <td class="value-cell">{{ rectificationData.completionDate || '______' }}</td>
          <td class="label-cell">完成进度</td>
          <td class="value-cell">
            <span class="complete-badge">{{ rectificationData.progress }}% 已完成</span>
          </td>
        </tr>
        <tr>
          <td class="label-cell">完成说明</td>
          <td class="value-cell" colspan="3">
            <pre>{{ rectificationData.completionDescription || '暂无说明' }}</pre>
          </td>
        </tr>
      </table>
    </div>

    <!-- 验收情况 -->
    <div class="section avoid-break" v-if="rectificationData.status === 'verified'">
      <h3 class="section-title">五、验收情况</h3>
      <table class="info-table">
        <tr>
          <td class="label-cell">验收人</td>
          <td class="value-cell">{{ rectificationData.verifierName || '______' }}</td>
          <td class="label-cell">验收日期</td>
          <td class="value-cell">{{ rectificationData.verificationDate || '______' }}</td>
        </tr>
        <tr>
          <td class="label-cell">验收状态</td>
          <td class="value-cell" colspan="3">
            <span :class="`verify-${rectificationData.verificationStatus}`">
              {{ rectificationData.verificationStatus === 'pass' ? '✓ 验收通过' : '✗ 验收不通过' }}
            </span>
          </td>
        </tr>
        <tr>
          <td class="label-cell">验收结果</td>
          <td class="value-cell" colspan="3">
            <pre>{{ rectificationData.verificationResult || '暂无结果' }}</pre>
          </td>
        </tr>
      </table>
    </div>

    <!-- 签名区 -->
    <div class="section signature-section avoid-break">
      <div class="signature-row">
        <div class="signature-box">
          <div class="signature-label">责任人签名：</div>
          <div class="signature-content">________________</div>
        </div>
        <div class="signature-box" v-if="rectificationData.status === 'verified'">
          <div class="signature-label">验收人签名：</div>
          <div class="signature-content">________________</div>
        </div>
      </div>
    </div>

    <!-- 打印备注 -->
    <div class="print-footer">
      <p>打印时间：{{ new Date().toLocaleString('zh-CN') }}</p>
      <p>本任务单由幼儿园招生管理系统自动生成</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  rectificationData: any;
  planData?: any;
  progressLogs?: any[];
  kindergartenName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  kindergartenName: '幼儿园',
  progressLogs: () => []
});

// 格式化日期
const formatDate = (date: any) => {
  if (!date) return '______';
  return new Date(date).toLocaleDateString('zh-CN');
};

// 获取严重程度标签
const getSeverityLabel = (severity: string) => {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  };
  return labels[severity] || severity;
};
</script>

<style scoped lang="scss">
.rectification-print-template {
  font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
  color: var(--text-primary);
  line-height: 1.6;

  .print-header {
    text-align: center;
    border-bottom: var(--transform-drop) solid #000;
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
          border-bottom: var(--z-index-dropdown) solid var(--text-primary);
          padding: 0 var(--spacing-2xl);
          min-max-width: 150px; width: 100%;
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
      border-left: var(--spacing-xs) solid var(--danger-color);
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
      max-width: 120px; width: 100%;
      text-align: right;
      padding-right: var(--spacing-4xl);
    }

    .value-cell {
      padding-left: var(--spacing-4xl);

      pre {
        margin: 0;
        font-family: inherit;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.6;
      }
    }

    .center {
      text-align: center;
    }
  }

  .severity-low {
    color: var(--info-color);
  }

  .severity-medium {
    color: var(--warning-color);
    font-weight: bold;
  }

  .severity-high {
    color: var(--danger-color);
    font-weight: bold;
  }

  .severity-urgent {
    color: var(--danger-color);
    font-weight: bold;
    background: #fef0f0;
    padding: var(--spacing-sm) var(--spacing-sm);
    border-radius: var(--radius-xs);
  }

  .progress-value {
    font-weight: bold;
    color: var(--primary-color);
  }

  .complete-badge {
    color: var(--success-color);
    font-weight: bold;
  }

  .verify-pass {
    color: var(--success-color);
    font-weight: bold;
  }

  .verify-fail {
    color: var(--danger-color);
    font-weight: bold;
  }

  .content-box {
    border: var(--border-width-base) solid #ddd;
    padding: var(--spacing-4xl);
    background: var(--bg-tertiary);
    border-radius: var(--spacing-xs);
    min-min-height: 60px; height: auto;

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

    .signature-row {
      display: flex;
      justify-content: space-around;
      gap: var(--spacing-5xl);

      .signature-box {
        flex: 1;
        text-align: center;

        .signature-label {
          font-weight: bold;
          margin-bottom: var(--spacing-10xl);
        }

        .signature-content {
          border-bottom: var(--z-index-dropdown) solid var(--text-primary);
          padding-bottom: var(--spacing-base);
          min-min-height: 32px; height: auto;
        }
      }
    }
  }

  .print-footer {
    margin-top: var(--spacing-10xl);
    padding-top: var(--text-2xl);
    border-top: var(--z-index-dropdown) solid #ddd;
    text-align: center;
    font-size: var(--text-sm);
    color: var(--text-tertiary);

    p {
      margin: var(--spacing-base) 0;
    }
  }
}

@media print {
  .rectification-print-template {
    .info-table .label-cell,
    .detail-table th {
      background: var(--bg-gray-light) !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .severity-urgent {
      background: #fef0f0 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
}
</style>

