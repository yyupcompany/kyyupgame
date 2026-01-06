<template>
  <div class="page-container">
    <div class="page-header">
      <h1>招生名额管理</h1>
      <div class="header-actions">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="refreshData" :disabled="!currentPlanId">刷新</el-button>
        <el-button type="success" @click="showAddQuotaDialog" :disabled="!currentPlanId">添加名额</el-button>
      </div>
    </div>

    <!-- 无效planId提示 -->
    <div v-if="!currentPlanId" class="no-plan-container">
      <el-empty description="请从招生计划列表选择具体计划">
        <el-button type="primary" @click="router.push('/enrollment-plan/PlanList')">
          前往招生计划列表
        </el-button>
      </el-empty>
    </div>

    <!-- 主要内容区域 - 只有当有有效planId时才显示 -->
    <div v-if="currentPlanId">
    <!-- 计划信息 -->
    <el-card class="plan-info-card" v-loading="planLoading">
      <template #header>
        <div class="card-header">
          <span>计划信息</span>
          <el-tag :type="getStatusType(planInfo.status)" v-if="planInfo.status !== undefined">
            {{ statusOptions[planInfo.status] }}
          </el-tag>
        </div>
      </template>
      
      <el-descriptions :column="3" border>
        <el-descriptions-item label="计划名称">{{ planInfo.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="开始日期">{{ planInfo.startDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="结束日期">{{ planInfo.endDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="目标人数">{{ planInfo.targetCount ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="已分配名额">{{ totalAssignedQuota }}</el-descriptions-item>
        <el-descriptions-item label="未分配名额">{{ (planInfo.targetCount ?? 0) - totalAssignedQuota }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 名额统计 -->
    <el-card class="stat-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>名额统计</span>
          <div class="header-actions">
            <el-button-group>
              <el-button type="primary" size="small" @click="showBatchAdjustDialog">批量调整</el-button>
              <el-button type="success" size="small" @click="exportQuotaData">导出数据</el-button>
            </el-button-group>
          </div>
        </div>
      </template>
      
      <div class="stat-overview">
        <div class="stat-item">
          <div class="stat-value">{{ quotaData.length }}</div>
          <div class="stat-label">班级总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalQuota }}</div>
          <div class="stat-label">总名额</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalUsed }}</div>
          <div class="stat-label">已使用</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalRemaining }}</div>
          <div class="stat-label">剩余名额</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ formatPercent(averageUsageRate) }}</div>
          <div class="stat-label">平均使用率</div>
        </div>
      </div>
    </el-card>
    
    <!-- 名额列表 -->
    <el-card class="quota-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>名额列表</span>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索班级名称"
              clearable
              @clear="handleSearch"
              class="search-input"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </template>
      
            <!-- 空状态处理 -->
      <EmptyState 
        v-if="!loading && filteredQuotaData.length === 0"
        type="no-data"
        title="暂无名额数据"
        description="当前招生计划还没有分配班级名额"
        :primary-action="{
          text: '添加名额',
          handler: showAddQuotaDialog
        }"
        :secondary-action="{
          text: '刷新数据',
          handler: refreshData
        }"
        :suggestions="[
          '检查网络连接是否正常',
          '确认是否有相关数据',
          '联系管理员获取帮助'
        ]"
        :show-suggestions="true"
      />
      
      <el-table
        v-else
        :data="filteredQuotaData" border class="full-width">
        <el-table-column type="index" width="50" />
        <el-table-column prop="className" label="班级名称" min-width="120" />
        <el-table-column prop="ageRange" label="年龄范围" width="120" />
        <el-table-column prop="totalQuota" label="总名额" width="80" />
        <el-table-column prop="usedQuota" label="已使用" width="80" />
        <el-table-column prop="remainingQuota" label="剩余名额" width="80" />
        <el-table-column label="使用率" width="180">
          <template #default="{ row }">
            <el-progress :percentage="row.usageRate" :status="getProgressStatus(row.usageRate)" />
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdated" label="更新时间" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" size="small" @click="handleAdjust(row)">调整</el-button>
            <el-popconfirm
              title="确定删除该名额配置吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 添加/编辑名额对话框 -->
    <el-dialog
      v-model="quotaDialogVisible"
      :title="isEdit ? '编辑名额' : '添加名额'"
      width="500px"
    >
      <el-form
        ref="quotaFormRef"
        :model="quotaForm"
        :rules="quotaRules"
        label-width="100px"
      >
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="quotaForm.className" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="年龄范围" prop="ageRange">
          <el-input v-model="quotaForm.ageRange" placeholder="请输入年龄范围" />
        </el-form-item>
        <el-form-item label="名额数量" prop="totalQuota">
          <el-input-number
            v-model="quotaForm.totalQuota"
            :min="1"
            :max="100"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="已使用名额" prop="usedQuota" v-if="isEdit">
          <el-input-number
            v-model="quotaForm.usedQuota"
            :min="0"
            :max="quotaForm.totalQuota"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quotaDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitQuotaForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 调整名额对话框 -->
    <el-dialog
      v-model="adjustDialogVisible"
      title="调整名额"
      width="400px"
    >
      <div class="adjust-info" v-if="currentQuota">
        <p><strong>班级名称：</strong>{{ currentQuota.className }}</p>
        <p><strong>当前名额：</strong>{{ currentQuota.totalQuota }}</p>
        <p><strong>已使用名额：</strong>{{ currentQuota.usedQuota }}</p>
        <p><strong>剩余名额：</strong>{{ currentQuota.remainingQuota }}</p>
      </div>
      
      <el-form
        ref="adjustFormRef"
        :model="adjustForm"
        :rules="adjustRules"
        label-width="100px"
      >
        <el-form-item label="调整数量" prop="adjustment">
          <el-input-number
            v-model="adjustForm.adjustment"
            :min="currentQuota ? -(currentQuota.remainingQuota || 0) : 0"
            :max="100"
            controls-position="right"
          />
          <div class="form-tip">正数增加名额，负数减少名额</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="adjustDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdjustForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量调整名额对话框 -->
    <el-dialog
      v-model="batchAdjustDialogVisible"
      title="批量调整名额"
      width="600px"
    >
      <el-alert
        title="批量调整将对所有选中班级的名额进行相同数量的增减"
        type="warning"
        :closable="false"
        class="batch-adjust-alert"
      />
      
      <el-form
        ref="batchAdjustFormRef"
        :model="batchAdjustForm"
        :rules="batchAdjustRules"
        label-width="100px"
      >
        <el-form-item label="选择班级" prop="selectedClasses">
          <el-checkbox-group v-model="batchAdjustForm.selectedClasses">
            <el-checkbox
              v-for="item in quotaData"
              :key="item.id"
              :label="item.id"
            >
              {{ item.className }} (当前名额: {{ item.totalQuota }})
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="调整数量" prop="adjustment">
          <el-input-number
            v-model="batchAdjustForm.adjustment"
            :min="-10"
            :max="10"
            controls-position="right"
          />
          <div class="form-tip">正数增加名额，负数减少名额（-10~10范围内）</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAdjustDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitBatchAdjustForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
    </div> <!-- 结束主要内容区域 -->
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElForm } from 'element-plus';

// 组件导入
import EmptyState from '@/components/common/EmptyState.vue'
import type { FormInstance, FormRules } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { 
  getEnrollmentPlanDetail 
} from '@/api/modules/enrollment-plan';
import { 
  getEnrollmentQuotas,
  createEnrollmentQuota,
  updateEnrollmentQuota,
  deleteEnrollmentQuota,
  batchAdjustEnrollmentQuota,
  getQuotasByPlanId
} from '@/api/enrollment-quota';
import type { EnrollmentQuota, EnrollmentQuotaRequest } from '@/types/enrollment';

interface EnrollmentPlan {
  id: number;
  name: string;
  targetCount: number;
  status: string;
  year: number;
  semester: string;
  startDate: string;
  endDate: string;
}

interface EnrollmentQuota {
  id: number;
  planId: number;
  className: string;
  ageRange?: string;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  usageRate: number;
  lastUpdated: string;
}

interface QuotaForm {
  id: number;
  planId: number;
  className: string;
  ageRange: string;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  usageRate: number;
  lastUpdated: string;
}

interface AdjustForm {
  adjustment: number;
}

interface BatchAdjustForm {
  selectedClasses: number[];
  adjustment: number;
}

export default defineComponent({
  name: 'EnrollmentQuotaManage',
  components: {
    Search
  },
  props: {
    planId: {
      type: Number,
      required: false,
      default: undefined
    }
  },
  setup(props: { planId?: number }) {
    const route = useRoute();
    const router = useRouter();
    const quotaFormRef = ref<FormInstance | null>(null);
    const adjustFormRef = ref<FormInstance | null>(null);
    const batchAdjustFormRef = ref<FormInstance | null>(null);
    
    // 统一的planId获取逻辑
    const currentPlanId = computed(() => {
      if (props.planId && props.planId > 0) {
        return props.planId;
      }
      if (route.params.id) {
        const id = Number(route.params.id);
        if (id > 0) {
          return id;
        }
      }
      // 如果没有有效的planId，尝试从路由查询参数或路由状态获取
      if (route.query.planId) {
        const queryId = Number(route.query.planId);
        if (queryId > 0) {
          return queryId;
        }
      }
      return undefined;
    });
    
    // 状态
    const planLoading = ref(false);
    const loading = ref(false);
    const submitting = ref(false);
    const isEdit = ref(false);
    const quotaDialogVisible = ref(false);
    const adjustDialogVisible = ref(false);
    const batchAdjustDialogVisible = ref(false);
    const searchKeyword = ref('');
    
    // 数据
    const planInfo = ref<EnrollmentPlan>({
      id: 0,
  name: '',
      targetCount: 0,
  status: 'draft',
  year: 2023,
  semester: 'autumn',
      startDate: '',
      endDate: ''
    });
    const quotaData = ref<EnrollmentQuota[]>([]);
    const currentQuota = ref<EnrollmentQuota | null>(null);
    
    // 表单
    const quotaForm = ref<QuotaForm>({
      id: 0,
      planId: currentPlanId.value,
      className: '',
      ageRange: '',
      totalQuota: 30,
      usedQuota: 0,
      remainingQuota: 30,
      usageRate: 0,
      lastUpdated: new Date().toISOString()
    });
    
    const adjustForm = ref<AdjustForm>({
      adjustment: 0
    });
    
    const batchAdjustForm = ref<BatchAdjustForm>({
      selectedClasses: [],
  adjustment: 0
    });
    
    // 表单验证规则
    const quotaRules = ref<FormRules>({
      className: [
        { required: true, message: '请输入班级名称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ],
      ageRange: [
        { required: true, message: '请输入年龄范围', trigger: 'blur' }
      ],
      totalQuota: [
        { required: true, message: '请输入名额数量', trigger: 'blur' },
        { type: 'number', min: 1, message: '名额数量必须大于0', trigger: 'blur' }
      ]
    });
    
    const adjustRules = ref<FormRules>({
      adjustment: [
        { required: true, message: '请输入调整数量', trigger: 'blur' },
        { type: 'number', message: '调整数量必须为数字', trigger: 'blur' }
      ]
    });
    
    const batchAdjustRules = ref<FormRules>({
      selectedClasses: [
        { type: 'array', required: true, message: '请至少选择一个班级', trigger: 'change' }
      ],
  adjustment: [
        { required: true, message: '请输入调整数量', trigger: 'blur' },
        { type: 'number', min: -10, max: 10, message: '调整数量必须在-10到10之间', trigger: 'blur' }
      ]
    });
    
    // 状态选项
    const statusOptions: Record<string, string> = {
      'draft': '草稿',
      'pending': '未开始',
      'ongoing': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    
    // 计算属性
    const filteredQuotaData = computed(() => {
      if (!Array.isArray(quotaData.value)) return [];
      if (!searchKeyword.value) return quotaData.value;
      return quotaData.value.filter(item => 
        item.className.toLowerCase().includes(searchKeyword.value.toLowerCase())
      );
    });
    
    const totalQuota = computed(() => {
      if (!Array.isArray(quotaData.value)) return 0;
      return quotaData.value.reduce((sum, item) => sum + (item.totalQuota || 0), 0);
    });
    
    const totalUsed = computed(() => {
      if (!Array.isArray(quotaData.value)) return 0;
      return quotaData.value.reduce((sum, item) => sum + (item.usedQuota || 0), 0);
    });
    
    const totalRemaining = computed(() => {
      if (!Array.isArray(quotaData.value)) return 0;
      return quotaData.value.reduce((sum, item) => sum + (item.remainingQuota || 0), 0);
    });
    
    const averageUsageRate = computed(() => {
      if (!Array.isArray(quotaData.value) || quotaData.value.length === 0) return 0;
      const total = quotaData.value.reduce((sum, item) => sum + (item.usageRate || 0), 0);
      return total / quotaData.value.length;
    });
    
    const totalAssignedQuota = computed(() => {
      return totalQuota.value;
    });
    
    // 获取状态对应的标签类型
    const getStatusType = (status: string) => {
      const statusMap: Record<string, "info" | "success" | "warning" | "primary" | "danger"> = {
        'draft': 'info',
        'pending': 'warning',
        'ongoing': 'success',
        'completed': 'primary',
        'cancelled': 'danger'
      };
      return statusMap[status] || 'info';
    };
    
    // 获取进度条状态
    const getProgressStatus = (usageRate: number) => {
      if (usageRate >= 90) return 'exception';
      if (usageRate >= 70) return 'warning';
      return 'success';
    };
    
    // 格式化百分比
    const formatPercent = (value: number) => {
      return `${Math.round(value)}%`;
    };
    
    // 加载计划详情
    const loadPlanDetail = async () => {
      if (!currentPlanId.value || isNaN(currentPlanId.value) || currentPlanId.value <= 0) {
        console.error('Invalid planId for plan detail:', currentPlanId.value);
        ElMessage.error('无效的招生计划ID，请从计划列表页面正确进入');
        return;
      }
      
      planLoading.value = true;
      try {
        const res = await getEnrollmentPlanDetail(currentPlanId.value);
        if (res.success && res.data) {
          planInfo.value = { ...planInfo.value, ...res.data };
        } else {
          ElMessage.error(res.message || '获取招生计划详情失败');
        }
      } catch (error) {
        console.error('获取招生计划详情失败', error);
        ElMessage.error('获取招生计划详情失败');
      } finally {
        planLoading.value = false;
      }
    };
    
    // 加载名额数据
    const loadQuotaData = async () => {
      if (!currentPlanId.value || isNaN(currentPlanId.value) || currentPlanId.value <= 0) {
        console.error('Invalid planId:', currentPlanId.value);
        ElMessage.error('无效的招生计划ID，请从计划列表页面正确进入');
        return;
      }
      
      loading.value = true;
      try {
        const res = await getQuotasByPlanId(currentPlanId.value);
        if (res.success && res.data) {
          quotaData.value = res.data.map((item: any) => ({
            id: item.id,
            planId: item.planId,
            className: item.className,
            ageRange: item.ageRange,
            totalQuota: item.totalQuota,
            usedQuota: item.usedQuota,
            remainingQuota: item.totalQuota - item.usedQuota,
            usageRate: item.totalQuota > 0 ? Math.round((item.usedQuota / item.totalQuota) * 100) : 0,
            lastUpdated: new Date(item.updatedAt || Date.now()).toLocaleDateString()
          }));
        } else {
          ElMessage.warning(res.message || '获取招生名额数据失败，将显示默认数据');
          // 使用默认数据
          quotaData.value = [
            {
              id: 1,
              planId: currentPlanId.value,
              className: '小班1班',
              ageRange: '3-4岁',
              totalQuota: 30,
              usedQuota: 28,
              remainingQuota: 2,
              usageRate: 93.33,
              lastUpdated: '2023-05-15'
            },
            {
              id: 2,
              planId: currentPlanId.value,
              className: '小班2班',
              ageRange: '3-4岁',
              totalQuota: 30,
              usedQuota: 25,
              remainingQuota: 5,
              usageRate: 83.33,
              lastUpdated: '2023-05-16'
            }
          ];
        }
      } catch (error) {
        console.error('获取招生名额数据失败', error);
        ElMessage.error('获取招生名额数据失败');
        // 使用默认数据
        quotaData.value = [
          {
            id: 1,
            planId: currentPlanId.value,
            className: '小班1班',
            ageRange: '3-4岁',
            totalQuota: 30,
            usedQuota: 28,
            remainingQuota: 2,
            usageRate: 93.33,
            lastUpdated: '2023-05-15'
          },
          {
            id: 2,
            planId: currentPlanId.value,
            className: '小班2班',
            ageRange: '3-4岁',
            totalQuota: 30,
            usedQuota: 25,
            remainingQuota: 5,
            usageRate: 83.33,
            lastUpdated: '2023-05-16'
          }
        ];
      } finally {
        loading.value = false;
      }
    };
    
    // 刷新数据
    const refreshData = () => {
      loadPlanDetail();
      loadQuotaData();
      ElMessage.success('数据已刷新');
    };
    
    // 搜索处理
    const handleSearch = () => {
      // 不需要额外处理，computed已经实现了过滤
    };
    
    // 显示添加名额对话框
    const showAddQuotaDialog = () => {
      isEdit.value = false;
      quotaForm.value.id = 0;
      quotaForm.value.planId = currentPlanId.value;
      quotaForm.value.className = '';
      quotaForm.value.ageRange = '';
      quotaForm.value.totalQuota = 30;
      quotaForm.value.usedQuota = 0;
      quotaForm.value.remainingQuota = 30;
      quotaForm.value.usageRate = 0;
      quotaDialogVisible.value = true;
    };
    
    // 编辑名额
    const handleEdit = (row: EnrollmentQuota) => {
      isEdit.value = true;
      quotaForm.value.id = row.id;
      quotaForm.value.planId = row.planId;
      quotaForm.value.className = row.className;
      quotaForm.value.ageRange = row.ageRange || '';
      quotaForm.value.totalQuota = row.totalQuota || 0;
      quotaForm.value.usedQuota = row.usedQuota || 0;
      quotaForm.value.remainingQuota = row.remainingQuota || 0;
      quotaForm.value.usageRate = row.usageRate || 0;
      quotaDialogVisible.value = true;
    };
    
    // 调整名额
    const handleAdjust = (row: EnrollmentQuota) => {
      currentQuota.value = row;
      adjustForm.value.adjustment = 0;
      adjustDialogVisible.value = true;
    };
    
    // 删除名额
    const handleDelete = async (row: EnrollmentQuota) => {
      try {
        const res = await deleteEnrollmentQuota(row.id);
        if (res.success) {
          ElMessage.success('删除成功');
          loadQuotaData();
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      } catch (error) {
        console.error('删除失败', error);
        ElMessage.error('删除失败');
      }
    };
    
    // 提交名额表单
    const submitQuotaForm = async () => {
      if (!quotaFormRef.value) return;
      
      await quotaFormRef.value.validate(async (valid: boolean) => {
        if (!valid) return;
        
        submitting.value = true;
        try {
          const quotaRequest: EnrollmentQuotaRequest = {
            planId: quotaForm.value.planId,
            className: quotaForm.value.className,
            ageRange: quotaForm.value.ageRange,
            totalQuota: quotaForm.value.totalQuota
          };
          
          let res;
          if (isEdit.value) {
            res = await updateEnrollmentQuota(quotaForm.value.id, quotaRequest);
          } else {
            res = await createEnrollmentQuota(quotaRequest);
          }
          
          if (res.success) {
            ElMessage.success(isEdit.value ? '编辑成功' : '添加成功');
            quotaDialogVisible.value = false;
            loadQuotaData();
          } else {
            ElMessage.error(res.message || (isEdit.value ? '编辑失败' : '添加失败'));
          }
        } catch (error) {
          console.error(isEdit.value ? '编辑失败' : '添加失败', error);
          ElMessage.error(isEdit.value ? '编辑失败' : '添加失败');
        } finally {
          submitting.value = false;
        }
      });
    };
    
    // 提交调整表单
    const submitAdjustForm = async () => {
      if (!adjustFormRef.value || !currentQuota.value) return;
      
      await adjustFormRef.value.validate(async (valid: boolean) => {
        if (!valid) return;
        
        submitting.value = true;
        try {
          const newTotalQuota = currentQuota.value!.totalQuota + adjustForm.value.adjustment;
          if (newTotalQuota < currentQuota.value!.usedQuota) {
            ElMessage.error('调整后的名额不能少于已使用的名额');
            return;
          }
          
          const updateData: EnrollmentQuotaRequest = {
            planId: currentQuota.value!.planId,
            className: currentQuota.value!.className,
            ageRange: currentQuota.value!.ageRange || '',
            totalQuota: newTotalQuota
          };
          
          const res = await updateEnrollmentQuota(currentQuota.value!.id, updateData);
          if (res.success) {
            ElMessage.success('调整成功');
            adjustDialogVisible.value = false;
            loadQuotaData();
          } else {
            ElMessage.error(res.message || '调整失败');
          }
        } catch (error) {
          console.error('调整失败', error);
          ElMessage.error('调整失败');
        } finally {
          submitting.value = false;
        }
      });
    };
    
    // 显示批量调整对话框
    const showBatchAdjustDialog = () => {
      batchAdjustForm.value.selectedClasses = [];
      batchAdjustForm.value.adjustment = 0;
      batchAdjustDialogVisible.value = true;
    };
    
    // 提交批量调整表单
    const submitBatchAdjustForm = async () => {
      if (!batchAdjustFormRef.value) return;
      
      await batchAdjustFormRef.value.validate(async (valid: boolean) => {
        if (!valid) return;
        
        submitting.value = true;
        try {
          const res = await batchAdjustEnrollmentQuota({
            quotaIds: batchAdjustForm.value.selectedClasses,
            adjustmentValue: Math.abs(batchAdjustForm.value.adjustment),
            adjustmentType: batchAdjustForm.value.adjustment >= 0 ? 'increase' : 'decrease'
          } as any);
          
          if (res.success) {
            ElMessage.success('批量调整成功');
            batchAdjustDialogVisible.value = false;
            loadQuotaData();
          } else {
            ElMessage.error(res.message || '批量调整失败');
          }
        } catch (error) {
          console.error('批量调整失败', error);
          ElMessage.error('批量调整失败');
        } finally {
          submitting.value = false;
        }
      });
    };
    
    // 导出数据
    const exportQuotaData = () => {
      try {
        const csvContent = [
          ['班级名称', '年龄范围', '总名额', '已使用', '剩余名额', '使用率', '更新时间'],
          ...quotaData.value.map(item => [
            item.className,
            item.ageRange || '',
            item.totalQuota,
            item.usedQuota,
            item.remainingQuota,
            `${Math.round(item.usageRate)}%`,
            item.lastUpdated
          ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `招生名额数据_${new Date().toLocaleDateString()}

.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        ElMessage.success('导出成功');
      } catch (error) {
        console.error('导出失败', error);
        ElMessage.error('导出失败');
      }
    };
    
    // 返回上一页
    const goBack = () => {
      router.go(-1);
    };
    
    onMounted(async () => {
      // 详细的路由参数检查和调试信息
      console.log('QuotaManage mounted - Route info:', {
        params: route.params,
        query: route.query,
        path: route.path,
        name: route.name,
        props: props
      });
      
      if (!currentPlanId.value) {
        console.error('Invalid planId on mount:', {
          currentPlanId: currentPlanId.value,
          'route.params.id': route.params.id,
          'route.query.planId': route.query.planId,
          propsId: props.planId,
          routePath: route.path
        });

        // 尝试等待路由完全加载后重新检查
        await nextTick();

        if (!currentPlanId.value) {
          ElMessage.warning('请从招生计划列表页面选择具体计划进入名额管理');
          // 不自动重定向，让用户手动选择
          return;
        }
      }
      
      console.log('Loading data for planId:', currentPlanId.value);
      loadPlanDetail();
      loadQuotaData();
    });
    
    return {
      planInfo,
      quotaData,
      filteredQuotaData,
      currentQuota,
      statusOptions,
      planLoading,
      loading,
      submitting,
      isEdit,
      quotaDialogVisible,
      adjustDialogVisible,
      batchAdjustDialogVisible,
      searchKeyword,
      quotaForm,
      adjustForm,
      batchAdjustForm,
      quotaFormRef,
      adjustFormRef,
      batchAdjustFormRef,
      quotaRules,
      adjustRules,
      batchAdjustRules,
      totalQuota,
      totalUsed,
      totalRemaining,
      averageUsageRate,
      totalAssignedQuota,
      currentPlanId,
      getStatusType,
      getProgressStatus,
      handleSearch,
      showAddQuotaDialog,
      handleEdit,
      handleAdjust,
      handleDelete,
      submitQuotaForm,
      submitAdjustForm,
      showBatchAdjustDialog,
      submitBatchAdjustForm,
      refreshData,
      exportQuotaData,
      formatPercent,
      goBack
    };
  }
});
</script>

<style scoped>
.page-container {
  padding: var(--spacing-lg);
}

.no-plan-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: var(--spacing-sm);
  margin-top: var(--text-2xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  
  h1 {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.plan-info-card {
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  margin-bottom: var(--spacing-lg);
}

.quota-card {
  margin-bottom: var(--spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
}

.stat-overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: var(--spacing-lg);
  background-color: var(--el-bg-color-page);
  border-radius: var(--radius-md);
  margin: 0 var(--spacing-xs);
  border: var(--border-width-base) solid var(--border-color);
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
    border-color: var(--primary-light);
  }
}

.stat-value {
  font-size: var(--text-2xl);
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.adjust-info {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--el-bg-color-page);
  border-radius: var(--radius-md);
}

.form-tip {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.search-input {
  width: 200px;
}

.full-width {
  width: 100%;
}

.batch-adjust-alert {
  margin-bottom: var(--spacing-lg);
}
</style>