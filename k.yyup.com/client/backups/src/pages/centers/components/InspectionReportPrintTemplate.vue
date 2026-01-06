<template>
  <div class="inspection-report-print-template">
    <!-- 打印头部 -->
    <div class="print-header">
      <h1>{{ kindergartenName }}</h1>
      <h2>{{ reportData.year || new Date().getFullYear() }}年度检查工作报告</h2>
      <div class="header-info">
        <div class="info-item">
          <span class="label">报告编号：</span>
          <span class="value">{{ reportData.reportNo || generateReportNo() }}</span>
        </div>
        <div class="info-item">
          <span class="label">报告日期：</span>
          <span class="value">{{ formatDate(new Date()) }}</span>
        </div>
      </div>
    </div>

    <!-- 概述 -->
    <div class="section avoid-break">
      <h3 class="section-title">一、工作概述</h3>
      <div class="content-box">
        <p>本年度共计划检查 <strong>{{ statistics.totalPlans || 0 }}</strong> 次，实际完成 <strong>{{ statistics.completedPlans || 0 }}</strong> 次，完成率 <strong>{{ statistics.completionRate || 0 }}%</strong>。</p>
        <p>发现问题 <strong>{{ statistics.totalProblems || 0 }}</strong> 项，其中高危问题 <strong>{{ statistics.highSeverityProblems || 0 }}</strong> 项，已完成整改 <strong>{{ statistics.rectifiedProblems || 0 }}</strong> 项，整改率 <strong>{{ statistics.rectificationRate || 0 }}%</strong>。</p>
      </div>
    </div>

    <!-- 检查计划完成情况 -->
    <div class="section">
      <h3 class="section-title">二、检查计划完成情况</h3>
      <table class="detail-table">
        <thead>
          <tr>
            <th width="50">序号</th>
            <th width="120">检查日期</th>
            <th width="150">检查类型</th>
            <th width="80">状态</th>
            <th width="80">得分</th>
            <th width="80">等级</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(plan, index) in completedPlans" :key="index" class="avoid-break">
            <td class="center">{{ index + 1 }}</td>
            <td class="center">{{ plan.planDate }}</td>
            <td>{{ plan.inspectionType?.name || '-' }}</td>
            <td class="center">
              <span :class="`status-${plan.status}`">{{ getStatusLabel(plan.status) }}</span>
            </td>
            <td class="center">{{ plan.score || '-' }}</td>
            <td class="center">
              <span :class="`grade-${plan.grade}`">{{ plan.grade || '-' }}</span>
            </td>
            <td>{{ plan.notes || '-' }}</td>
          </tr>
          <tr v-if="!completedPlans || completedPlans.length === 0">
            <td colspan="7" class="center empty-text">暂无完成的检查计划</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 问题统计分析 -->
    <div class="section avoid-break">
      <h3 class="section-title">三、问题统计分析</h3>
      
      <!-- 问题统计表 -->
      <table class="stats-table">
        <thead>
          <tr>
            <th>问题类型</th>
            <th>发现数量</th>
            <th>已整改</th>
            <th>整改中</th>
            <th>待整改</th>
            <th>整改率</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(stat, index) in problemStats" :key="index">
            <td>{{ stat.category }}</td>
            <td class="center">{{ stat.total }}</td>
            <td class="center success-text">{{ stat.rectified }}</td>
            <td class="center warning-text">{{ stat.inProgress }}</td>
            <td class="center danger-text">{{ stat.pending }}</td>
            <td class="center">
              <strong>{{ stat.rectificationRate }}%</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 整改任务列表 -->
    <div class="section" v-if="rectifications && rectifications.length > 0">
      <h3 class="section-title">四、整改任务清单</h3>
      <table class="detail-table">
        <thead>
          <tr>
            <th width="50">序号</th>
            <th width="150">问题描述</th>
            <th width="80">严重程度</th>
            <th width="100">责任人</th>
            <th width="80">截止日期</th>
            <th width="80">状态</th>
            <th width="60">进度</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(rect, index) in rectifications" :key="index" class="avoid-break">
            <td class="center">{{ index + 1 }}</td>
            <td>{{ rect.problemDescription }}</td>
            <td class="center">
              <span :class="`severity-${rect.problemSeverity}`">
                {{ getSeverityLabel(rect.problemSeverity) }}
              </span>
            </td>
            <td class="center">{{ rect.responsiblePersonName }}</td>
            <td class="center">{{ rect.deadline }}</td>
            <td class="center">
              <span :class="`status-${rect.status}`">
                {{ getRectificationStatusLabel(rect.status) }}
              </span>
            </td>
            <td class="center">{{ rect.progress }}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 工作总结 -->
    <div class="section avoid-break">
      <h3 class="section-title">五、工作总结与展望</h3>
      <div class="content-box">
        <div class="subsection">
          <h4>工作成效</h4>
          <pre>{{ reportData.summary || '本年度检查工作按计划有序开展，整体完成情况良好。' }}</pre>
        </div>
        <div class="subsection">
          <h4>存在问题</h4>
          <pre>{{ reportData.problems || '暂无' }}</pre>
        </div>
        <div class="subsection">
          <h4>改进措施</h4>
          <pre>{{ reportData.improvements || '暂无' }}</pre>
        </div>
        <div class="subsection">
          <h4>下一步工作计划</h4>
          <pre>{{ reportData.nextSteps || '暂无' }}</pre>
        </div>
      </div>
    </div>

    <!-- 签名区 -->
    <div class="section signature-section avoid-break">
      <div class="signature-row">
        <div class="signature-box">
          <div class="signature-label">报告人：</div>
          <div class="signature-content">________________</div>
        </div>
        <div class="signature-box">
          <div class="signature-label">审核人：</div>
          <div class="signature-content">________________</div>
        </div>
        <div class="signature-box">
          <div class="signature-label">批准人：</div>
          <div class="signature-content">________________</div>
        </div>
      </div>
      <div class="date-row">
        <span>日期：{{ formatDate(new Date()) }}</span>
      </div>
    </div>

    <!-- 打印备注 -->
    <div class="print-footer">
      <p>打印时间：{{ new Date().toLocaleString('zh-CN') }}</p>
      <p>本报告由幼儿园招生管理系统自动生成</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  reportData: any;
  completedPlans?: any[];
  rectifications?: any[];
  statistics?: any;
  problemStats?: any[];
  kindergartenName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  kindergartenName: '幼儿园',
  completedPlans: () => [],
  rectifications: () => [],
  statistics: () => ({
    totalPlans: 0,
    completedPlans: 0,
    completionRate: 0,
    totalProblems: 0,
    highSeverityProblems: 0,
    rectifiedProblems: 0,
    rectificationRate: 0
  }),
  problemStats: () => []
});

// 生成报告编号
const generateReportNo = () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DC${year}${month}${random}`;
};

// 格式化日期
const formatDate = (date: any) => {
  if (!date) return '______';
  return new Date(date).toLocaleDateString('zh-CN');
};

// 获取状态标签
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待开始',
    preparing: '准备中',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已逾期'
  };
  return labels[status] || status;
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

// 获取整改状态标签
const getRectificationStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待整改',
    in_progress: '整改中',
    completed: '已完成',
    verified: '已验收',
    rejected: '未通过'
  };
  return labels[status] || status;
};
</script>

<style scoped lang="scss">
.inspection-report-print-template {
  font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
  color: var(--text-primary);
  line-height: 1.6;

  .print-header {
    text-align: center;
    border-bottom: 3px double #000;
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
          min-width: 180px;
          display: inline-block;
        }
      }
    }
  }

  .section {
    margin-bottom: var(--spacing-8xl);

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
  .detail-table,
  .stats-table {
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

    .center {
      text-align: center;
    }

    .empty-text {
      color: var(--text-tertiary);
      font-style: italic;
    }
  }

  .stats-table {
    .success-text {
      color: var(--success-color);
      font-weight: bold;
    }

    .warning-text {
      color: var(--warning-color);
      font-weight: bold;
    }

    .danger-text {
      color: var(--danger-color);
      font-weight: bold;
    }
  }

  .status-completed {
    color: var(--success-color);
  }

  .status-in_progress {
    color: var(--primary-color);
  }

  .status-pending {
    color: var(--info-color);
  }

  .grade-优秀 {
    color: var(--success-color);
    font-weight: bold;
  }

  .grade-良好 {
    color: var(--primary-color);
    font-weight: bold;
  }

  .grade-合格 {
    color: var(--warning-color);
  }

  .grade-不合格 {
    color: var(--danger-color);
    font-weight: bold;
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
    color: var(--bg-white);
    background: var(--danger-color);
    padding: var(--spacing-sm) var(--spacing-sm);
    border-radius: var(--radius-xs);
    font-weight: bold;
  }

  .status-verified {
    color: var(--success-color);
  }

  .status-completed {
    color: var(--primary-color);
  }

  .status-in_progress {
    color: var(--warning-color);
  }

  .status-pending {
    color: var(--info-color);
  }

  .status-rejected {
    color: var(--danger-color);
  }

  .content-box {
    border: var(--border-width-base) solid #ddd;
    padding: var(--spacing-4xl);
    background: var(--bg-tertiary);
    border-radius: var(--spacing-xs);

    p {
      margin: var(--spacing-2xl) 0;
      line-height: 2;
      text-indent: 2em;

      strong {
        color: var(--primary-color);
        font-size: var(--text-lg);
      }
    }

    pre {
      margin: 0;
      font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.8;
      font-size: var(--text-sm);
    }

    .subsection {
      margin-bottom: var(--text-2xl);

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        font-size: var(--text-base);
        font-weight: bold;
        color: var(--text-primary);
        margin: var(--spacing-2xl) 0;
        padding-left: var(--spacing-2xl);
        border-left: 3px solid var(--primary-color);
      }
    }
  }

  .signature-section {
    margin-top: 50px;

    .signature-row {
      display: flex;
      justify-content: space-around;
      gap: var(--spacing-8xl);
      margin-bottom: var(--text-2xl);

      .signature-box {
        flex: 1;
        text-align: center;

        .signature-label {
          font-weight: bold;
          margin-bottom: 50px;
        }

        .signature-content {
          border-bottom: var(--border-width-base) solid var(--text-primary);
          padding-bottom: var(--spacing-base);
          min-height: 30px;
        }
      }
    }

    .date-row {
      text-align: right;
      margin-top: var(--text-2xl);
      font-size: var(--text-base);
    }
  }

  .print-footer {
    margin-top: 50px;
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

@media print {
  .inspection-report-print-template {
    .info-table th,
    .detail-table th,
    .stats-table th {
      background: var(--bg-gray-light) !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .content-box {
      background: var(--bg-tertiary) !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .severity-urgent {
      background: var(--danger-color) !important;
      color: var(--bg-white) !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .grade-优秀,
    .grade-良好,
    .grade-合格,
    .grade-不合格,
    .status-completed,
    .status-verified,
    .success-text,
    .warning-text,
    .danger-text {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
}
</style>

