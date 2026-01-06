<template>
  <div class="page-container">
    <div class="app-card">
      <div class="app-card-header">
        <div class="app-card-title">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/parent/children' }">孩子管理</el-breadcrumb-item>
            <el-breadcrumb-item>成长档案</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="card-actions">
          <el-button type="primary" @click="handleAddRecord">添加记录</el-button>
        </div>
      </div>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <div v-else-if="!childInfo" class="empty-container">
        <el-empty description="未找到孩子信息" />
      </div>
      
      <div v-else class="child-growth-content">
        <!-- 孩子基本信息 -->
        <div class="child-info-section">
          <el-descriptions :column="4" border>
            <el-descriptions-item label="姓名">{{ childInfo.name }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ childInfo.gender }}</el-descriptions-item>
            <el-descriptions-item label="年龄">{{ childInfo.age }}岁</el-descriptions-item>
            <el-descriptions-item label="出生日期">{{ childInfo.birthday }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 身高体重图表 -->
        <div class="growth-chart-section">
          <div class="section-title">
            <h3>身高体重曲线</h3>
            <el-radio-group v-model="chartType" size="small">
              <el-radio-button label="height">身高</el-radio-button>
              <el-radio-button label="weight">体重</el-radio-button>
              <el-radio-button label="both">身高体重</el-radio-button>
            </el-radio-group>
          </div>
          
          <div class="chart-container" ref="chartContainer"></div>
        </div>
        
        <!-- 成长里程碑 -->
        <div class="milestones-section">
          <div class="section-title">
            <h3>成长里程碑</h3>
          </div>
          
          <el-timeline>
            <el-timeline-item
              v-for="milestone in childInfo.milestones"
              :key="milestone.id"
              :timestamp="milestone.date"
              :type="getMilestoneType(milestone.category)"
              :color="getMilestoneColor(milestone.category)"
            >
              <h4>{{ milestone.title }}</h4>
              <p>{{ milestone.description }}</p>
              <div v-if="milestone.images && milestone.images.length > 0" class="milestone-images">
                <el-image
                  v-for="(image, index) in milestone.images"
                  :key="index"
                  :src="image"
                  :preview-src-list="milestone.images"
                  fit="cover"
                  class="milestone-image"
                />
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
        
        <!-- 成长评估记录 -->
        <div class="assessment-section">
          <div class="section-title">
            <h3>成长评估记录</h3>
          </div>
          
          <el-table :data="childInfo.assessments" style="width: 100%" border>
            <el-table-column prop="date" label="评估日期" width="120" />
            <el-table-column prop="height" label="身高(cm)" width="100" />
            <el-table-column prop="weight" label="体重(kg)" width="100" />
            <el-table-column prop="headCircumference" label="头围(cm)" width="100" />
            <el-table-column prop="evaluator" label="评估人" width="100" />
            <el-table-column prop="remarks" label="备注" min-width="200" />
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleEditRecord(scope.row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDeleteRecord(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    
    <!-- 添加/编辑记录对话框 -->
    <el-dialog
      v-model="showRecordDialog"
      :title="currentRecord.id ? '编辑记录' : '添加记录'"
      width="500px"
    >
      <el-form :model="currentRecord" label-width="100px">
        <el-form-item label="评估日期">
          <el-date-picker
            v-model="currentRecord.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="身高(cm)">
          <el-input-number v-model="currentRecord.height" :min="0" :max="200" :precision="1" />
        </el-form-item>
        <el-form-item label="体重(kg)">
          <el-input-number v-model="currentRecord.weight" :min="0" :max="100" :precision="1" />
        </el-form-item>
        <el-form-item label="头围(cm)">
          <el-input-number v-model="currentRecord.headCircumference" :min="0" :max="100" :precision="1" />
        </el-form-item>
        <el-form-item label="评估人">
          <el-input v-model="currentRecord.evaluator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="currentRecord.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRecordDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRecord">保存</el-button>
      </template>
    </el-dialog>
    
    <!-- 添加里程碑对话框 -->
    <el-dialog
      v-model="showMilestoneDialog"
      title="添加里程碑"
      width="500px"
    >
      <el-form :model="currentMilestone" label-width="100px">
        <el-form-item label="日期">
          <el-date-picker
            v-model="currentMilestone.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="currentMilestone.category" style="width: 100%">
            <el-option label="身体" value="physical" />
            <el-option label="语言" value="language" />
            <el-option label="认知" value="cognitive" />
            <el-option label="社交" value="social" />
            <el-option label="情感" value="emotional" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="currentMilestone.title" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentMilestone.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="照片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :file-list="uploadFiles"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMilestoneDialog = false">取消</el-button>
        <el-button type="primary" @click="saveMilestone">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';
import { Plus } from '@element-plus/icons-vue';
import { get, post, put, del } from '@/utils/request';
import { PARENT_ENDPOINTS } from '@/api/endpoints';
import { ErrorHandler } from '@/utils/errorHandler';

interface Assessment {
  id: number;
  date: string;
  height: number;
  weight: number;
  headCircumference: number;
  evaluator: string;
  remarks: string;
}

interface Milestone {
  id: number;
  date: string;
  category: 'physical' | 'language' | 'cognitive' | 'social' | 'emotional' | 'other';
  title: string;
  description: string;
  images: string[];
}

interface ChildInfo {
  id: number;
  name: string;
  gender: string;
  age: number;
  birthday: string;
  assessments: Assessment[];
  milestones: Milestone[];
}

export default defineComponent({
  name: 'ChildGrowth',
  components: {
    Plus
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(true);
    const childId = ref(parseInt(route.params.id as string));
    const childInfo = ref<ChildInfo | null>(null);
    const chartType = ref<'height' | 'weight' | 'both'>('both');
    const chartInstance = ref<echarts.ECharts | null>(null);
    const chartContainer = ref<HTMLElement | null>(null);
    
    // 记录对话框相关
    const showRecordDialog = ref(false);
    const currentRecord = ref<Partial<Assessment>>({});
    
    // 里程碑对话框相关
    const showMilestoneDialog = ref(false);
    const currentMilestone = ref<Partial<Milestone>>({});
    const uploadFiles = ref<any[]>([]);
    
    // 获取孩子信息
    const fetchChildInfo = async () => {
      if (!childId.value) {
        ElMessage.error('孩子ID不能为空');
        router.back();
        return;
      }

      loading.value = true;
      try {
        const response = await get(PARENT_ENDPOINTS.CHILD_GROWTH(childId.value));
        
        if (response.success && response.data) {
          childInfo.value = response.data;
          
          // 初始化图表
          nextTick(() => {
            initChart();
          });
        } else {
          const errorInfo = ErrorHandler.handle(new Error(response.message || '获取孩子成长信息失败'), true);
        }
      } catch (error) {
        const errorInfo = ErrorHandler.handle(error, true);
        router.back();
      } finally {
        loading.value = false;
      }
    };
    
    // 初始化图表
    const initChart = () => {
      if (!childInfo.value || !chartContainer.value) return;
      
      // 销毁之前的图表实例
      if (chartInstance.value) {
        chartInstance.value.dispose();
      }
      
      // 创建新的图表实例
      chartInstance.value = echarts.init(chartContainer.value);
      
      // 准备数据
      const assessments = childInfo.value.assessments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const dates = assessments.map(item => item.date);
      const heights = assessments.map(item => item.height);
      const weights = assessments.map(item => item.weight);
      
      // 根据选择的图表类型设置选项
      let option: any = {
        tooltip: {
          trigger: 'axis',
  formatter: function(params: any) {
            let result = params[0].name + '<br/>';
            params.forEach((param: any) => {
              let value = param.value;
              let unit = param.seriesName === '身高' ? 'cm' : 'kg';
              result += param.marker + param.seriesName + ': ' + value + unit + '<br/>';
            });
            return result;
          }
        },
  legend: {
          data: []
        },
  grid: {
          left: '3%',
  right: '4%',
  bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
  data: dates
        },
        yAxis: [],
  series: []
      };
      
      if (chartType.value === 'height' || chartType.value === 'both') {
        option.legend.data.push('身高');
        option.yAxis.push({
          type: 'value',
  name: '身高(cm)',
  position: 'left',
          axisLine: {
            lineStyle: {
              color: '#5470C6'
            }
          }
        });
        option.series.push({
          name: '身高',
  type: 'line',
  data: heights,
  smooth: true,
          yAxisIndex: 0,
          itemStyle: {
            color: '#5470C6'
          }
        });
      }
      
      if (chartType.value === 'weight' || chartType.value === 'both') {
        option.legend.data.push('体重');
        option.yAxis.push({
          type: 'value',
  name: '体重(kg)',
  position: chartType.value === 'both' ? 'right' : 'left',
          axisLine: {
            lineStyle: {
              color: '#91CC75'
            }
          }
        });
        option.series.push({
          name: '体重',
  type: 'line',
  data: weights,
  smooth: true,
          yAxisIndex: chartType.value === 'both' ? 1 : 0,
          itemStyle: {
            color: '#91CC75'
          }
        });
      }
      
      // 设置图表选项
      chartInstance.value.setOption(option);
    };
    
    // 获取里程碑类型对应的图标和颜色
    const getMilestoneType = (category: string): '' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
      switch (category) {
        case 'physical':
          return 'primary';
        case 'language':
          return 'success';
        case 'cognitive':
          return 'warning';
        case 'social':
          return 'info';
        case 'emotional':
          return 'danger';
        default:
          return '';
      }
    };
    
    const getMilestoneColor = (category: string): string => {
      switch (category) {
        case 'physical':
          return 'var(--primary-color)';
        case 'language':
          return 'var(--success-color)';
        case 'cognitive':
          return 'var(--warning-color)';
        case 'social':
          return 'var(--info-color)';
        case 'emotional':
          return 'var(--danger-color)';
        default:
          return 'var(--border-extra-light)';
      }
    };
    
    // 处理添加记录
    const handleAddRecord = () => {
      currentRecord.value = {
        date: new Date().toISOString().split('T')[0],
  height: 0,
  weight: 0,
        headCircumference: 0,
  evaluator: '',
  remarks: ''
      };
      showRecordDialog.value = true;
    };
    
    // 处理编辑记录
    const handleEditRecord = (record: Assessment) => {
      currentRecord.value = { ...record };
      showRecordDialog.value = true;
    };
    
    // 保存记录
    const saveRecord = () => {
      if (!childInfo.value) return;
      
      // 表单验证
      if (!currentRecord.value.date || !currentRecord.value.height || !currentRecord.value.weight) {
        ElMessage.warning('请填写必要的信息');
        return;
      }
      
      // 如果有ID则为编辑，否则为新增
      if (currentRecord.value.id) {
        // 更新记录
        const index = childInfo.value.assessments.findIndex(item => item.id === currentRecord.value.id);
        if (index !== -1) {
          childInfo.value.assessments[index] = currentRecord.value as Assessment;
        }
      } else {
        // 添加新记录
        const newId = Math.max(0, ...childInfo.value.assessments.map(a => a.id)) + 1;
        childInfo.value.assessments.push({
          ...currentRecord.value,
  id: newId
        } as Assessment);
      }
      
      // 关闭对话框
      showRecordDialog.value = false;
      
      // 更新图表
      nextTick(() => {
        initChart();
      });
      
      ElMessage.success('保存成功');
    };
    
    // 处理删除记录
    const handleDeleteRecord = (record: Assessment) => {
      ElMessageBox.confirm(
        '确定要删除这条记录吗？',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
  type: 'warning'
        }
      ).then(() => {
        if (!childInfo.value) return;
        
        // 删除记录
        childInfo.value.assessments = childInfo.value.assessments.filter(item => item.id !== record.id);
        
        // 更新图表
        nextTick(() => {
          initChart();
        });
        
        ElMessage.success('删除成功');
      }).catch(() => {
        // 取消删除
      });
    };
    
    // 处理添加里程碑
    const handleAddMilestone = () => {
      currentMilestone.value = {
        date: new Date().toISOString().split('T')[0],
  category: 'physical',
  title: '',
  description: '',
  images: []
      };
      uploadFiles.value = [];
      showMilestoneDialog.value = true;
    };
    
    // 处理文件变化
    const handleFileChange = (file: any) => {
      uploadFiles.value.push(file);
    };
    
    // 处理文件移除
    const handleFileRemove = (file: any) => {
      uploadFiles.value = uploadFiles.value.filter(item => item.uid !== file.uid);
    };
    
    // 保存里程碑
    const saveMilestone = () => {
      if (!childInfo.value) return;
      
      // 表单验证
      if (!currentMilestone.value.date || !currentMilestone.value.title) {
        ElMessage.warning('请填写必要的信息');
        return;
      }
      
      // 处理图片上传（模拟）
      const images = uploadFiles.value.map(file => URL.createObjectURL(file.raw));
      
      // 添加新里程碑
      const newId = Math.max(0, ...childInfo.value.milestones.map(m => m.id)) + 1;
      childInfo.value.milestones.push({
        ...currentMilestone.value,
  id: newId,
        images
      } as Milestone);
      
      // 关闭对话框
      showMilestoneDialog.value = false;
      
      ElMessage.success('保存成功');
    };
    
    // 监听图表类型变化
    const handleChartTypeChange = () => {
      nextTick(() => {
        initChart();
      });
    };
    
    // 窗口大小变化时重新调整图表大小
    const handleResize = () => {
      if (chartInstance.value) {
        chartInstance.value.resize();
      }
    };
    
    onMounted(() => {
      fetchChildInfo();
      
      // 监听图表类型变化
      watch(chartType, () => {
        handleChartTypeChange();
      });
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize);
    });
    
    onUnmounted(() => {
      // 销毁图表实例
      if (chartInstance.value) {
        chartInstance.value.dispose();
      }
      
      // 移除窗口大小变化监听
      window.removeEventListener('resize', handleResize);
    });
    
    return {
      loading,
      childInfo,
      chartType,
      chartContainer,
      showRecordDialog,
      currentRecord,
      showMilestoneDialog,
      currentMilestone,
      uploadFiles,
      
      getMilestoneType,
      getMilestoneColor,
      handleAddRecord,
      handleEditRecord,
      handleDeleteRecord,
      saveRecord,
      handleAddMilestone,
      handleFileChange,
      handleFileRemove,
      saveMilestone
    };
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.loading-container,
.empty-container {
  padding: var(--spacing-10xl);
  text-align: center;
}

.app-card {
  background-color: var(--bg-white);
  border-radius: var(--spacing-xs);
  box-shadow: 0 2px var(--text-sm) 0 var(--shadow-light);
  padding: var(--spacing-lg);
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.app-card-title {
  font-size: var(--text-lg);
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.child-growth-content {
  margin-top: var(--text-2xl);
}

.child-info-section {
  margin-bottom: var(--spacing-8xl);
}

.growth-chart-section {
  margin-bottom: var(--spacing-8xl);
}

.milestones-section {
  margin-bottom: var(--spacing-8xl);
}

.assessment-section {
  margin-bottom: var(--spacing-8xl);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.section-title h3 {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 600;
}

.chart-container {
  height: 400px;
  width: 100%;
}

.milestone-images {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-2xl);
}

.milestone-image {
  width: var(--avatar-size); height: var(--avatar-size);
  border-radius: var(--spacing-xs);
  object-fit: cover;
}
</style> 