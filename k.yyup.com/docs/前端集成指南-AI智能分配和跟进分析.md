# 前端集成指南 - AI智能分配和跟进分析

## 📋 概述

本文档描述如何在前端集成AI智能分配和跟进分析功能。

---

## 🎯 功能1：AI智能分配

### 页面位置
`client/src/pages/centers/CustomerPoolCenter.vue` - 客户管理标签页

### UI布局

#### 1. 顶部操作栏添加按钮
```vue
<template>
  <div class="action-toolbar">
    <!-- 现有按钮 -->
    <el-button @click="toggleUnassignedFilter">
      未分配客户 ({{ unassignedCount }})
    </el-button>
    
    <!-- 🎯 新增：AI智能分配按钮 -->
    <el-button 
      type="primary" 
      :icon="Robot"
      @click="handleAISmartAssign"
      :disabled="selectedCustomers.length === 0"
      :loading="aiAssigning"
    >
      🤖 AI智能分配 ({{ selectedCustomers.length }})
    </el-button>
    
    <el-button @click="handleBatchAssign">批量分配</el-button>
  </div>
</template>
```

#### 2. AI分配建议对话框
```vue
<template>
  <!-- AI分配建议对话框 -->
  <el-dialog 
    v-model="showAssignDialog" 
    title="🤖 AI智能分配建议"
    width="800px"
    :close-on-click-modal="false"
  >
    <div v-loading="analyzing" element-loading-text="AI正在分析最佳分配方案...">
      <!-- 分配建议列表 -->
      <div v-for="assignment in assignments" :key="assignment.customerId" class="assignment-card">
        <div class="customer-info">
          <h4>【客户】{{ assignment.customerName }}</h4>
          <p>电话: {{ assignment.customerInfo.phone }}</p>
          <p>孩子年龄: {{ assignment.customerInfo.childAge }}岁</p>
          <p>意向程度: {{ assignment.customerInfo.intentionLevel }}</p>
        </div>

        <div class="recommendation">
          <div class="teacher-card recommended">
            <div class="teacher-header">
              <span class="teacher-name">推荐教师: {{ assignment.recommendedTeacher.name }}</span>
              <el-rate 
                v-model="getRatingFromScore(assignment.recommendedTeacher.matchScore)" 
                disabled 
                show-score
                :max="5"
              />
              <span class="match-score">匹配度: {{ assignment.recommendedTeacher.matchScore }}分</span>
            </div>

            <div class="reasons">
              <p><strong>推荐理由：</strong></p>
              <ul>
                <li v-for="(reason, idx) in assignment.recommendedTeacher.reasons" :key="idx">
                  ✓ {{ reason }}
                </li>
              </ul>
            </div>

            <div class="teacher-stats">
              <span>负责客户: {{ assignment.recommendedTeacher.currentStats.totalCustomers }}个</span>
              <span>转化率: {{ assignment.recommendedTeacher.currentStats.conversionRate }}%</span>
              <span>班级人数: {{ assignment.recommendedTeacher.currentStats.classSize }}人</span>
            </div>

            <el-button type="primary" size="small" @click="selectTeacher(assignment, assignment.recommendedTeacher)">
              选择此教师
            </el-button>
          </div>

          <!-- 备选方案 -->
          <el-collapse v-if="assignment.alternatives.length > 0">
            <el-collapse-item title="查看其他备选教师">
              <div v-for="alt in assignment.alternatives" :key="alt.id" class="teacher-card alternative">
                <span class="teacher-name">{{ alt.name }}</span>
                <span class="match-score">{{ alt.matchScore }}分</span>
                <p>{{ alt.reason }}</p>
                <el-button size="small" @click="selectTeacher(assignment, alt)">
                  选择
                </el-button>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="showAssignDialog = false">取消</el-button>
      <el-button @click="handleCustomAdjust">自定义调整</el-button>
      <el-button type="primary" @click="handleConfirmAssign" :loading="assigning">
        全部采纳
      </el-button>
    </template>
  </el-dialog>
</template>
```

### 前端逻辑实现

#### 1. 状态管理
```typescript
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Robot } from '@element-plus/icons-vue';

// 状态变量
const selectedCustomers = ref<number[]>([]);
const showAssignDialog = ref(false);
const analyzing = ref(false);
const assigning = ref(false);
const aiAssigning = ref(false);
const assignments = ref<any[]>([]);
const selectedAssignments = ref<Map<number, number>>(new Map());
```

#### 2. API调用
```typescript
import { post, get } from '@/utils/request';

/**
 * AI智能分配
 */
const handleAISmartAssign = async () => {
  if (selectedCustomers.value.length === 0) {
    ElMessage.warning('请先选择要分配的客户');
    return;
  }

  try {
    aiAssigning.value = true;
    analyzing.value = true;
    showAssignDialog.value = true;

    console.log('🤖 开始AI智能分配...');

    const response = await post('/ai/smart-assign', {
      customerIds: selectedCustomers.value,
      options: {
        considerWorkload: true,
        considerConversionRate: true,
        considerLocation: true
      }
    });

    if (response.success) {
      assignments.value = response.data.assignments;
      
      // 自动选择推荐的教师
      assignments.value.forEach(assignment => {
        selectedAssignments.value.set(
          assignment.customerId,
          assignment.recommendedTeacher.id
        );
      });

      ElMessage.success('AI分配建议生成成功');
    } else {
      throw new Error(response.message || 'AI分配失败');
    }
  } catch (error: any) {
    console.error('❌ AI智能分配失败:', error);
    ElMessage.error(error.message || 'AI智能分配失败');
    showAssignDialog.value = false;
  } finally {
    aiAssigning.value = false;
    analyzing.value = false;
  }
};

/**
 * 选择教师
 */
const selectTeacher = (assignment: any, teacher: any) => {
  selectedAssignments.value.set(assignment.customerId, teacher.id);
  ElMessage.success(`已选择 ${teacher.name} 负责 ${assignment.customerName}`);
};

/**
 * 确认分配
 */
const handleConfirmAssign = async () => {
  try {
    assigning.value = true;

    // 构建分配列表
    const assignmentList = Array.from(selectedAssignments.value.entries()).map(
      ([customerId, teacherId]) => ({ customerId, teacherId })
    );

    console.log('📝 执行批量分配...', assignmentList);

    const response = await post('/ai/batch-assign', {
      assignments: assignmentList,
      note: 'AI智能分配'
    });

    if (response.success) {
      ElMessage.success(
        `分配完成: 成功${response.data.successCount}个，失败${response.data.failedCount}个`
      );
      
      // 关闭对话框
      showAssignDialog.value = false;
      
      // 清空选择
      selectedCustomers.value = [];
      selectedAssignments.value.clear();
      
      // 刷新列表
      loadCustomersData();
    } else {
      throw new Error(response.message || '批量分配失败');
    }
  } catch (error: any) {
    console.error('❌ 批量分配失败:', error);
    ElMessage.error(error.message || '批量分配失败');
  } finally {
    assigning.value = false;
  }
};

/**
 * 自定义调整
 */
const handleCustomAdjust = () => {
  ElMessageBox.alert(
    '您可以在上方的备选教师中选择其他教师，或点击"选择此教师"按钮确认推荐',
    '自定义调整',
    { confirmButtonText: '知道了' }
  );
};

/**
 * 将匹配度评分转换为星级（0-5星）
 */
const getRatingFromScore = (score: number): number => {
  return Math.round((score / 100) * 5);
};
```

#### 3. 样式
```scss
<style scoped lang="scss">
.assignment-card {
  margin-bottom: 24px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);

  .customer-info {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    h4 {
      margin: 0 0 8px 0;
      color: var(--el-text-color-primary);
      font-size: 16px;
      font-weight: 600;
    }

    p {
      margin: 4px 0;
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }

  .recommendation {
    .teacher-card {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;

      &.recommended {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: 2px solid #667eea;

        .teacher-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          .teacher-name {
            font-size: 18px;
            font-weight: 600;
          }

          .match-score {
            margin-left: auto;
            font-size: 16px;
            font-weight: 600;
          }
        }

        .reasons {
          margin: 12px 0;

          ul {
            margin: 8px 0;
            padding-left: 20px;

            li {
              margin: 6px 0;
              line-height: 1.6;
            }
          }
        }

        .teacher-stats {
          display: flex;
          gap: 16px;
          margin: 12px 0;
          padding: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;

          span {
            font-size: 14px;
          }
        }
      }

      &.alternative {
        background: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color);
        display: flex;
        align-items: center;
        gap: 12px;

        .teacher-name {
          font-weight: 600;
        }

        .match-score {
          color: var(--el-color-primary);
          font-weight: 600;
        }

        p {
          flex: 1;
          margin: 0;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}
</style>
```

---

## 🎯 功能2：跟进质量分析

### 页面位置
`client/src/pages/centers/CustomerPoolCenter.vue` - 跟进记录标签页

### UI布局

#### 1. 顶部操作栏
```vue
<template>
  <div class="action-toolbar">
    <el-button 
      type="primary" 
      :icon="TrendCharts"
      @click="handleAnalyzeFollowup"
      :loading="analyzing"
    >
      🔍 分析跟进质量
    </el-button>
    
    <el-button 
      :icon="Document"
      @click="handleGenerateReport"
    >
      📊 生成报告
    </el-button>
    
    <el-button 
      :icon="Download"
      @click="handleBatchGeneratePDF"
      :disabled="selectedTeachers.length === 0"
      :loading="generatingPDF"
    >
      📄 批量生成PDF ({{ selectedTeachers.length }})
    </el-button>
  </div>
</template>
```

#### 2. 整体统计卡片
```vue
<template>
  <div class="stats-cards">
    <el-card class="stat-card">
      <div class="stat-content">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ overallStats.totalTeachers }}</div>
          <div class="stat-label">总教师数</div>
        </div>
      </div>
    </el-card>

    <el-card class="stat-card">
      <div class="stat-content">
        <div class="stat-icon">📞</div>
        <div class="stat-info">
          <div class="stat-value">{{ overallStats.avgFollowupInterval }}</div>
          <div class="stat-label">平均跟进频率（天/次）</div>
        </div>
      </div>
    </el-card>

    <el-card class="stat-card">
      <div class="stat-content">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-value">{{ overallStats.avgConversionRate }}%</div>
          <div class="stat-label">平均转化率</div>
        </div>
      </div>
    </el-card>

    <el-card class="stat-card warning">
      <div class="stat-content">
        <div class="stat-icon">⚠️</div>
        <div class="stat-info">
          <div class="stat-value">{{ overallStats.overdueCustomers }}</div>
          <div class="stat-label">超期未跟进客户</div>
        </div>
      </div>
    </el-card>
  </div>
</template>
```

#### 3. 教师跟进排名表格
```vue
<template>
  <el-table 
    :data="teachersData" 
    @selection-change="handleTeacherSelectionChange"
    stripe
  >
    <el-table-column type="selection" width="55" />
    
    <el-table-column label="排名" width="80">
      <template #default="{ $index }">
        <span :class="getRankClass($index)">
          {{ getRankIcon($index) }} {{ $index + 1 }}
        </span>
      </template>
    </el-table-column>
    
    <el-table-column prop="name" label="教师" width="120" />
    <el-table-column prop="totalCustomers" label="客户数" width="100" />
    <el-table-column prop="followupCount" label="跟进次数" width="100" />
    
    <el-table-column prop="conversionRate" label="转化率" width="100">
      <template #default="{ row }">
        {{ row.conversionRate }}%
      </template>
    </el-table-column>
    
    <el-table-column prop="avgInterval" label="平均间隔" width="100">
      <template #default="{ row }">
        <span :class="getIntervalClass(row.avgInterval)">
          {{ row.avgInterval }}天
        </span>
      </template>
    </el-table-column>
    
    <el-table-column prop="status" label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="getStatusType(row.status)">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
    
    <el-table-column label="操作" width="200">
      <template #default="{ row }">
        <el-button size="small" @click="handleViewDetail(row)">
          详情
        </el-button>
        <el-button size="small" @click="handleGenerateSinglePDF(row)">
          生成PDF
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
```

### 前端逻辑实现

```typescript
import { ref } from 'vue';
import { get, post } from '@/utils/request';
import { ElMessage } from 'element-plus';

// 状态变量
const analyzing = ref(false);
const generatingPDF = ref(false);
const overallStats = ref({
  totalTeachers: 0,
  avgFollowupInterval: 0,
  avgConversionRate: 0,
  overdueCustomers: 0
});
const teachersData = ref<any[]>([]);
const selectedTeachers = ref<number[]>([]);

/**
 * 分析跟进质量
 */
const handleAnalyzeFollowup = async () => {
  try {
    analyzing.value = true;

    const response = await get('/followup/analysis');

    if (response.success) {
      overallStats.value = response.data.overall;
      teachersData.value = response.data.teachers;
      ElMessage.success('跟进质量分析完成');
    }
  } catch (error: any) {
    ElMessage.error('分析失败: ' + error.message);
  } finally {
    analyzing.value = false;
  }
};

/**
 * 生成单个教师PDF
 */
const handleGenerateSinglePDF = async (teacher: any) => {
  try {
    const response = await post('/followup/generate-pdf', {
      teacherIds: [teacher.id],
      mergeAll: false,
      includeAIAnalysis: true,
      format: 'detailed'
    });

    if (response.success && response.data.pdfUrls.length > 0) {
      window.open(response.data.pdfUrls[0], '_blank');
      ElMessage.success('PDF报告生成成功');
    }
  } catch (error: any) {
    ElMessage.error('PDF生成失败: ' + error.message);
  }
};

/**
 * 批量生成PDF
 */
const handleBatchGeneratePDF = async () => {
  if (selectedTeachers.value.length === 0) {
    ElMessage.warning('请先选择教师');
    return;
  }

  try {
    generatingPDF.value = true;

    const response = await post('/followup/generate-pdf', {
      teacherIds: selectedTeachers.value,
      mergeAll: false,
      includeAIAnalysis: true,
      format: 'detailed'
    });

    if (response.success) {
      response.data.pdfUrls.forEach((url: string) => {
        window.open(url, '_blank');
      });
      ElMessage.success(`成功生成${response.data.pdfUrls.length}个PDF报告`);
    }
  } catch (error: any) {
    ElMessage.error('批量生成失败: ' + error.message);
  } finally {
    generatingPDF.value = false;
  }
};

/**
 * 获取排名样式
 */
const getRankClass = (index: number) => {
  if (index === 0) return 'rank-first';
  if (index === 1) return 'rank-second';
  if (index === 2) return 'rank-third';
  return 'rank-normal';
};

/**
 * 获取排名图标
 */
const getRankIcon = (index: number) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return '';
};

/**
 * 获取间隔样式
 */
const getIntervalClass = (interval: number) => {
  if (interval > 7) return 'text-danger';
  if (interval > 5) return 'text-warning';
  return 'text-success';
};

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
  if (status === '优秀') return 'success';
  if (status === '需改进') return 'danger';
  return 'warning';
};
```

---

## 📝 完整示例代码

完整的前端集成代码请参考：
- `client/src/pages/centers/CustomerPoolCenter.vue`（需要添加上述功能）

---

**文档版本**: v1.0  
**创建日期**: 2025-01-04  
**最后更新**: 2025-01-04

