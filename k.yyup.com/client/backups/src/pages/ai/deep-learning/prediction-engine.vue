<template>
  <div class="deep-learning-prediction-engine">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">深度学习预测分析引擎</h1>
      <div class="page-actions">
        <el-button type="primary" @click="trainNewModel" :loading="modelTraining">
          <el-icon><TrendCharts /></el-icon>
          训练新模型
        </el-button>
        <el-button @click="refreshModels">
          <el-icon><Refresh /></el-icon>
          刷新模型
        </el-button>
      </div>
    </div>

    <!-- 模型概览仪表板 -->
    <div class="models-dashboard">
      <div class="dashboard-metrics">
        <div class="metric-card">
          <div class="metric-value">{{ models.length }}</div>
          <div class="metric-label">活跃模型</div>
          <div class="metric-trend positive">
            <el-icon><ArrowUp /></el-icon>
            +{{ newModelsCount }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ averageAccuracy.toFixed(1) }}%</div>
          <div class="metric-label">平均准确率</div>
          <div class="metric-trend" :class="accuracyTrend">
            <el-icon><component :is="getTrendIcon(accuracyTrend)" /></el-icon>
            {{ accuracyChange }}%
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ totalPredictions }}</div>
          <div class="metric-label">总预测次数</div>
          <div class="metric-trend positive">
            <el-icon><ArrowUp /></el-icon>
            +{{ dailyPredictions }}
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-value">{{ anomaliesDetected }}</div>
          <div class="metric-label">检测到异常</div>
          <div class="metric-trend warning">
            <el-icon><Warning /></el-icon>
            {{ anomaliesDetected > 0 ? '需要关注' : '正常' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 模型管理 -->
        <el-tab-pane label="模型管理" name="models">
          <div class="models-grid">
            <div 
              v-for="model in models" 
              :key="model.id"
              class="model-card"
              :class="{ active: selectedModel?.id === model.id }"
              @click="selectModel(model)"
            >
              <div class="model-header">
                <h3>{{ model.name }}</h3>
                <el-tag :type="getModelStatusType(model.accuracy)">
                  {{ model.accuracy.toFixed(1) }}% 准确率
                </el-tag>
              </div>
              <div class="model-info">
                <div class="info-item">
                  <label>架构:</label>
                  <span>{{ model.architecture.toUpperCase() }}</span>
                </div>
                <div class="info-item">
                  <label>类型:</label>
                  <span>{{ getModelTypeLabel(model.type) }}</span>
                </div>
                <div class="info-item">
                  <label>最后更新:</label>
                  <span>{{ formatDate(model.lastUpdated) }}</span>
                </div>
              </div>
              <div class="model-performance">
                <div class="performance-bar">
                  <div 
                    class="performance-fill"
                    :style="{ width: model.accuracy + '%' }"
                  ></div>
                </div>
                <div class="performance-metrics">
                  <span>训练样本: {{ model.trainingData.sampleCount }}</span>
                  <span>验证精度: {{ model.performance.validationAccuracy.toFixed(1) }}%</span>
                </div>
              </div>
              <div class="model-actions">
                <el-button size="small" @click.stop="predictWithModel(model)">
                  预测
                </el-button>
                <el-button size="small" @click.stop="retrainModel(model)">
                  重训练
                </el-button>
                <el-button size="small" type="danger" @click.stop="deleteModel(model)">
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 预测分析 -->
        <el-tab-pane label="预测分析" name="predictions">
          <div class="predictions-workspace">
            <div class="prediction-controls">
              <div class="control-group">
                <label>选择预测模型:</label>
                <el-select v-model="selectedPredictionModel" placeholder="请选择模型">
                  <el-option 
                    v-for="model in models" 
                    :key="model.id"
                    :label="model.name"
                    :value="model.id"
                  />
                </el-select>
              </div>
              <div class="control-group">
                <label>预测时间范围:</label>
                <el-select v-model="predictionTimeHorizon" placeholder="选择时间范围">
                  <el-option label="1周" value="1week" />
                  <el-option label="1个月" value="1month" />
                  <el-option label="3个月" value="3months" />
                  <el-option label="6个月" value="6months" />
                  <el-option label="1年" value="1year" />
                </el-select>
              </div>
              <div class="control-group">
                <el-button type="primary" @click="runPrediction" :loading="predictionLoading">
                  <el-icon><TrendCharts /></el-icon>
                  开始预测
                </el-button>
              </div>
            </div>

            <div class="prediction-results" v-if="latestPrediction">
              <div class="prediction-header">
                <h3>预测结果</h3>
                <div class="confidence-score">
                  <span>置信度: {{ latestPrediction.confidence.toFixed(1) }}%</span>
                </div>
              </div>
              
              <div class="prediction-visualization">
                <div ref="predictionChart" class="prediction-chart"></div>
              </div>

              <div class="prediction-details">
                <div class="detail-section">
                  <h4>影响因素分析</h4>
                  <div class="factors-list">
                    <div 
                      v-for="factor in latestPrediction.factorsInfluence" 
                      :key="factor.name"
                      class="factor-item"
                    >
                      <span class="factor-name">{{ factor.name }}</span>
                      <div class="factor-impact">
                        <div class="impact-bar">
                          <div 
                            class="impact-fill"
                            :style="{ 
                              width: Math.abs(factor.impact) + '%',
                              backgroundColor: factor.impact > 0 ? 'var(--success-color)' : 'var(--danger-color)'
                            }"
                          ></div>
                        </div>
                        <span class="impact-value">{{ factor.impact.toFixed(1) }}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <h4>不确定性分析</h4>
                  <div class="uncertainty-range">
                    <span>预测范围: {{ latestPrediction.uncertaintyRange.min.toFixed(1) }} - {{ latestPrediction.uncertaintyRange.max.toFixed(1) }}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <h4>可解释性分析</h4>
                  <div class="explainability-content">
                    <p>{{ latestPrediction.explainability.explanation }}</p>
                    <div class="key-insights">
                      <div v-for="insight in latestPrediction.explainability.keyInsights" :key="insight" class="insight-item">
                        <el-icon><TrendCharts /></el-icon>
                        <span>{{ insight }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 异常检测 -->
        <el-tab-pane label="异常检测" name="anomaly">
          <div class="anomaly-detection-workspace">
            <div class="detection-controls">
              <div class="control-group">
                <label>检测敏感度:</label>
                <el-select v-model="anomalyDetectionSensitivity">
                  <el-option label="低" value="low" />
                  <el-option label="中" value="medium" />
                  <el-option label="高" value="high" />
                </el-select>
              </div>
              <div class="control-group">
                <el-button type="primary" @click="startAnomalyDetection" :loading="anomalyDetectionLoading">
                  <el-icon><Monitor /></el-icon>
                  开始检测
                </el-button>
              </div>
            </div>

            <div class="anomaly-results" v-if="anomalies.length > 0">
              <div class="anomaly-header">
                <h3>检测到的异常</h3>
                <el-tag type="danger" v-if="criticalAnomalies > 0">
                  {{ criticalAnomalies }} 个严重异常
                </el-tag>
              </div>

              <div class="anomaly-list">
                <div 
                  v-for="anomaly in anomalies" 
                  :key="anomaly.id"
                  class="anomaly-item"
                  :class="anomaly.severity"
                >
                  <div class="anomaly-info">
                    <div class="anomaly-title">
                      <span>{{ anomaly.type }}</span>
                      <el-tag :type="getSeverityType(anomaly.severity)">
                        {{ anomaly.severity }}
                      </el-tag>
                    </div>
                    <div class="anomaly-description">
                      {{ anomaly.description }}
                    </div>
                    <div class="anomaly-meta">
                      <span>检测时间: {{ formatDate(anomaly.detectedAt) }}</span>
                      <span>置信度: {{ anomaly.confidence.toFixed(1) }}%</span>
                    </div>
                  </div>
                  <div class="anomaly-actions">
                    <el-button size="small" @click="investigateAnomaly(anomaly)">
                      调查
                    </el-button>
                    <el-button size="small" type="success" @click="resolveAnomaly(anomaly)">
                      解决
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <div class="anomaly-visualization">
              <div ref="anomalyChart" class="anomaly-chart"></div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 模型训练 -->
        <el-tab-pane label="模型训练" name="training">
          <div class="training-workspace">
            <div class="training-form">
              <el-form :model="trainingForm" :rules="trainingRules" ref="trainingFormRef" label-width="120px">
                <el-form-item label="模型名称" prop="modelName">
                  <el-input v-model="trainingForm.modelName" placeholder="输入模型名称" />
                </el-form-item>
                
                <el-form-item label="模型类型" prop="modelType">
                  <el-select v-model="trainingForm.modelType" placeholder="选择模型类型">
                    <el-option label="学生表现预测" value="student_performance_prediction" />
                    <el-option label="招生趋势预测" value="enrollment_trend_prediction" />
                    <el-option label="异常行为检测" value="anomaly_detection" />
                    <el-option label="资源需求预测" value="resource_demand_prediction" />
                  </el-select>
                </el-form-item>

                <el-form-item label="模型架构" prop="architecture">
                  <el-select v-model="trainingForm.architecture" placeholder="选择架构">
                    <el-option label="LSTM" value="lstm" />
                    <el-option label="GRU" value="gru" />
                    <el-option label="Transformer" value="transformer" />
                    <el-option label="CNN" value="cnn" />
                    <el-option label="混合架构" value="hybrid" />
                  </el-select>
                </el-form-item>

                <el-form-item label="训练轮数" prop="epochs">
                  <el-input-number v-model="trainingForm.epochs" :min="10" :max="1000" :step="10" />
                </el-form-item>

                <el-form-item label="批次大小" prop="batchSize">
                  <el-input-number v-model="trainingForm.batchSize" :min="8" :max="512" :step="8" />
                </el-form-item>

                <el-form-item label="验证比例" prop="validationSplit">
                  <el-input-number v-model="trainingForm.validationSplit" :min="0.1" :max="0.5" :step="0.1" />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="startTraining" :loading="modelTraining">
                    <el-icon><VideoPlay /></el-icon>
                    开始训练
                  </el-button>
                  <el-button @click="resetTrainingForm">
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <div class="training-progress" v-if="trainingProgress">
              <div class="progress-header">
                <h3>训练进度</h3>
                <el-button size="small" type="danger" @click="stopTraining">
                  停止训练
                </el-button>
              </div>
              
              <div class="progress-metrics">
                <div class="metric-item">
                  <span>进度: {{ trainingProgress.currentEpoch }} / {{ trainingProgress.totalEpochs }}</span>
                  <el-progress :percentage="trainingProgress.progress" />
                </div>
                <div class="metric-item">
                  <span>训练损失: {{ trainingProgress.loss.toFixed(4) }}</span>
                </div>
                <div class="metric-item">
                  <span>验证准确率: {{ trainingProgress.validationAccuracy.toFixed(2) }}%</span>
                </div>
                <div class="metric-item">
                  <span>预估剩余时间: {{ trainingProgress.estimatedTimeRemaining }}</span>
                </div>
              </div>

              <div class="training-charts">
                <div ref="lossChart" class="training-chart"></div>
                <div ref="accuracyChart" class="training-chart"></div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  TrendCharts,
  Refresh,
  ArrowUp,
  ArrowDown,
  Warning,
  Monitor,
  VideoPlay
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';

// 深度学习模型接口
interface DeepLearningModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'time_series' | 'anomaly_detection';
  architecture: 'lstm' | 'gru' | 'transformer' | 'cnn' | 'hybrid';
  accuracy: number;
  trainingData: DatasetInfo;
  lastUpdated: string;
  performance: ModelPerformance;
}

interface DatasetInfo {
  sampleCount: number;
  features: string[];
  target: string;
  lastUpdated: string;
}

interface ModelPerformance {
  validationAccuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingTime: number;
}

interface PredictionResult {
  prediction: any;
  confidence: number;
  explainability: ExplanationData;
  uncertaintyRange: { min: number; max: number };
  factorsInfluence: InfluenceFactor[];
}

interface ExplanationData {
  explanation: string;
  keyInsights: string[];
  methodology: string;
}

interface InfluenceFactor {
  name: string;
  impact: number;
  description: string;
}

interface AnomalyDetectionResult {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  detectedAt: string;
  affectedSystems: string[];
}

interface TrainingProgress {
  currentEpoch: number;
  totalEpochs: number;
  progress: number;
  loss: number;
  validationAccuracy: number;
  estimatedTimeRemaining: string;
}

// 状态管理
const activeTab = ref('models');
const models = ref<DeepLearningModel[]>([]);
const selectedModel = ref<DeepLearningModel | null>(null);
const modelTraining = ref(false);
const predictions = ref<PredictionResult[]>([]);
const latestPrediction = ref<PredictionResult | null>(null);
const anomalies = ref<AnomalyDetectionResult[]>([]);
const trainingProgress = ref<TrainingProgress | null>(null);

// 预测分析状态
const selectedPredictionModel = ref('');
const predictionTimeHorizon = ref('3months');
const predictionLoading = ref(false);

// 异常检测状态
const anomalyDetectionSensitivity = ref('medium');
const anomalyDetectionLoading = ref(false);

// 训练表单
const trainingForm = ref({
  modelName: '',
  modelType: '',
  architecture: '',
  epochs: 100,
  batchSize: 32,
  validationSplit: 0.2
});

const trainingRules = {
  modelName: [
    { required: true, message: '请输入模型名称', trigger: 'blur' }
  ],
  modelType: [
    { required: true, message: '请选择模型类型', trigger: 'change' }
  ],
  architecture: [
    { required: true, message: '请选择模型架构', trigger: 'change' }
  ]
};

const trainingFormRef = ref();

// 计算属性
const newModelsCount = computed(() => {
  const recentModels = models.value.filter(model => {
    const lastUpdate = new Date(model.lastUpdated);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastUpdate > weekAgo;
  });
  return recentModels.length;
});

const averageAccuracy = computed(() => {
  if (models.value.length === 0) return 0;
  const totalAccuracy = models.value.reduce((sum, model) => sum + model.accuracy, 0);
  return totalAccuracy / models.value.length;
});

const totalPredictions = computed(() => predictions.value.length);
const dailyPredictions = computed(() => 45); // 模拟数据
const anomaliesDetected = computed(() => anomalies.value.length);
const criticalAnomalies = computed(() => 
  anomalies.value.filter(a => a.severity === 'critical').length
);

const accuracyTrend = computed(() => 'positive');
const accuracyChange = computed(() => '+12.5');

// 深度学习引擎核心功能
const useDeepLearningEngine = () => {
  // 学生表现预测模型
  const trainStudentPerformanceModel = async () => {
    try {
      modelTraining.value = true;
      
      // 模拟训练过程
      const trainingSteps = [
        { epoch: 1, loss: 0.8, accuracy: 65 },
        { epoch: 20, loss: 0.6, accuracy: 75 },
        { epoch: 40, loss: 0.4, accuracy: 85 },
        { epoch: 60, loss: 0.3, accuracy: 90 },
        { epoch: 80, loss: 0.2, accuracy: 94 },
        { epoch: 100, loss: 0.15, accuracy: 96 }
      ];

      for (const step of trainingSteps) {
        trainingProgress.value = {
          currentEpoch: step.epoch,
          totalEpochs: 100,
          progress: (step.epoch / 100) * 100,
          loss: step.loss,
          validationAccuracy: step.accuracy,
          estimatedTimeRemaining: `${Math.floor((100 - step.epoch) * 0.5)}分钟`
        };

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const newModel: DeepLearningModel = {
        id: `model_${Date.now()}`,
        name: '学生表现预测模型 v2.0',
        type: 'regression',
        architecture: 'lstm',
        accuracy: 96.2,
        trainingData: {
          sampleCount: 15000,
          features: ['attendance_pattern', 'engagement_score', 'learning_style'],
          target: 'future_academic_success',
          lastUpdated: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString(),
        performance: {
          validationAccuracy: 96.2,
          precision: 94.8,
          recall: 95.5,
          f1Score: 95.1,
          trainingTime: 3600
        }
      };

      models.value.push(newModel);
      ElMessage.success('学生表现预测模型训练完成');
      
    } catch (error) {
      console.error('Model training failed:', error);
      ElMessage.error('模型训练失败');
    } finally {
      modelTraining.value = false;
      trainingProgress.value = null;
    }
  };

  // 招生趋势预测
  const predictEnrollmentTrends = async (timeHorizon: string) => {
    try {
      predictionLoading.value = true;
      
      // 模拟预测过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const prediction: PredictionResult = {
        prediction: {
          expectedEnrollment: 245,
          trendDirection: 'increasing',
          seasonalityFactor: 1.2,
          marketShare: 0.15
        },
        confidence: 87.5,
        explainability: {
          explanation: '基于历史数据分析，预测未来6个月招生人数将增长15%，主要受季节性因素和教育政策影响。',
          keyInsights: [
            '春季招生季节性增长明显',
            '新校区开放将带来20%额外增长',
            '竞争对手减少提升市场份额',
            '口碑传播效应逐步显现'
          ],
          methodology: 'LSTM时间序列预测模型结合外部因素分析'
        },
        uncertaintyRange: { min: 220, max: 270 },
        factorsInfluence: [
          { name: '季节性因素', impact: 25.5, description: '春季招生旺季' },
          { name: '教育政策', impact: 18.2, description: '政策支持私立教育' },
          { name: '经济环境', impact: -8.3, description: '经济下行压力' },
          { name: '竞争环境', impact: 15.7, description: '竞争对手减少' },
          { name: '品牌影响力', impact: 22.1, description: '口碑提升' }
        ]
      };

      latestPrediction.value = prediction;
      predictions.value.push(prediction);
      
      // 更新图表
      updatePredictionChart(prediction);
      
    } catch (error) {
      console.error('Enrollment prediction failed:', error);
      ElMessage.error('预测失败，请重试');
    } finally {
      predictionLoading.value = false;
    }
  };

  // 异常行为检测
  const detectAnomalousPatterns = async () => {
    try {
      anomalyDetectionLoading.value = true;
      
      // 模拟异常检测过程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const detectedAnomalies: AnomalyDetectionResult[] = [
        {
          id: 'anomaly_1',
          type: '学生行为异常',
          severity: 'high',
          confidence: 92.3,
          description: '检测到多名学生在相同时间段内出现异常行为模式',
          detectedAt: new Date().toISOString(),
          affectedSystems: ['student_behavior', 'attendance']
        },
        {
          id: 'anomaly_2',
          type: '系统访问异常',
          severity: 'medium',
          confidence: 78.5,
          description: '检测到非正常时间段的高频系统访问',
          detectedAt: new Date().toISOString(),
          affectedSystems: ['system_usage']
        },
        {
          id: 'anomaly_3',
          type: '数据输入异常',
          severity: 'critical',
          confidence: 95.7,
          description: '检测到异常的数据输入模式，可能存在数据质量问题',
          detectedAt: new Date().toISOString(),
          affectedSystems: ['data_input', 'quality_control']
        }
      ];

      anomalies.value = detectedAnomalies;
      
      // 更新异常检测图表
      updateAnomalyChart(detectedAnomalies);
      
      ElMessage.success(`检测完成，发现 ${detectedAnomalies.length} 个异常`);
      
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      ElMessage.error('异常检测失败');
    } finally {
      anomalyDetectionLoading.value = false;
    }
  };

  return {
    trainStudentPerformanceModel,
    predictEnrollmentTrends,
    detectAnomalousPatterns
  };
};

// 使用深度学习引擎
const { trainStudentPerformanceModel, predictEnrollmentTrends, detectAnomalousPatterns } = useDeepLearningEngine();

// 界面交互方法
const selectModel = (model: DeepLearningModel) => {
  selectedModel.value = model;
};

const trainNewModel = () => {
  activeTab.value = 'training';
};

const refreshModels = async () => {
  // 刷新模型列表
  await loadModels();
  ElMessage.success('模型列表已刷新');
};

const predictWithModel = async (model: DeepLearningModel) => {
  selectedPredictionModel.value = model.id;
  activeTab.value = 'predictions';
  await runPrediction();
};

const retrainModel = async (model: DeepLearningModel) => {
  try {
    await ElMessageBox.confirm('确定要重新训练这个模型吗？', '确认重训练', {
      type: 'warning'
    });
    
    await trainStudentPerformanceModel();
    ElMessage.success('模型重训练完成');
  } catch {
    // 用户取消
  }
};

const deleteModel = async (model: DeepLearningModel) => {
  try {
    await ElMessageBox.confirm('确定要删除这个模型吗？', '确认删除', {
      type: 'warning'
    });
    
    models.value = models.value.filter(m => m.id !== model.id);
    if (selectedModel.value?.id === model.id) {
      selectedModel.value = null;
    }
    
    ElMessage.success('模型删除成功');
  } catch {
    // 用户取消
  }
};

const runPrediction = async () => {
  if (!selectedPredictionModel.value) {
    ElMessage.warning('请先选择预测模型');
    return;
  }
  
  await predictEnrollmentTrends(predictionTimeHorizon.value);
};

const startAnomalyDetection = async () => {
  await detectAnomalousPatterns();
};

const investigateAnomaly = (anomaly: AnomalyDetectionResult) => {
  ElMessage.info(`正在调查异常: ${anomaly.type}`);
};

const resolveAnomaly = (anomaly: AnomalyDetectionResult) => {
  anomalies.value = anomalies.value.filter(a => a.id !== anomaly.id);
  ElMessage.success('异常已标记为已解决');
};

const startTraining = async () => {
  if (!trainingFormRef.value) return;
  
  try {
    await trainingFormRef.value.validate();
    await trainStudentPerformanceModel();
  } catch (error) {
    console.error('Training validation failed:', error);
  }
};

const stopTraining = () => {
  modelTraining.value = false;
  trainingProgress.value = null;
  ElMessage.info('训练已停止');
};

const resetTrainingForm = () => {
  trainingForm.value = {
    modelName: '',
    modelType: '',
    architecture: '',
    epochs: 100,
    batchSize: 32,
    validationSplit: 0.2
  };
};

// 辅助方法
const getModelTypeLabel = (type: string) => {
  const labels = {
    'classification': '分类',
    'regression': '回归',
    'time_series': '时间序列',
    'anomaly_detection': '异常检测'
  };
  return labels[type] || type;
};

const getModelStatusType = (accuracy: number) => {
  if (accuracy >= 95) return 'success';
  if (accuracy >= 90) return 'primary';
  if (accuracy >= 80) return 'warning';
  return 'danger';
};

const getSeverityType = (severity: string) => {
  const types = {
    'low': 'info',
    'medium': 'warning',
    'high': 'danger',
    'critical': 'danger'
  };
  return types[severity] || 'info';
};

const getTrendIcon = (trend: string) => {
  return trend === 'positive' ? ArrowUp : ArrowDown;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 图表更新方法
const updatePredictionChart = (prediction: PredictionResult) => {
  // 实现预测图表逻辑
  console.log('更新预测图表:', prediction);
};

const updateAnomalyChart = (anomalies: AnomalyDetectionResult[]) => {
  // 实现异常检测图表逻辑
  console.log('更新异常检测图表:', anomalies);
};

// 初始化数据
const loadModels = async () => {
  // 模拟加载模型数据
  models.value = [
    {
      id: 'model_1',
      name: '学生表现预测模型',
      type: 'regression',
      architecture: 'lstm',
      accuracy: 94.2,
      trainingData: {
        sampleCount: 12000,
        features: ['attendance', 'engagement', 'assignments'],
        target: 'final_grade',
        lastUpdated: '2024-01-15'
      },
      lastUpdated: '2024-01-15',
      performance: {
        validationAccuracy: 94.2,
        precision: 92.8,
        recall: 93.5,
        f1Score: 93.1,
        trainingTime: 2400
      }
    },
    {
      id: 'model_2',
      name: '招生趋势预测模型',
      type: 'time_series',
      architecture: 'transformer',
      accuracy: 89.7,
      trainingData: {
        sampleCount: 8000,
        features: ['seasonal_data', 'economic_indicators', 'competition'],
        target: 'enrollment_count',
        lastUpdated: '2024-01-10'
      },
      lastUpdated: '2024-01-10',
      performance: {
        validationAccuracy: 89.7,
        precision: 88.2,
        recall: 90.1,
        f1Score: 89.1,
        trainingTime: 1800
      }
    }
  ];
};

// 组件生命周期
onMounted(() => {
  loadModels();
});
</script>

<style scoped lang="scss">
.deep-learning-prediction-engine {
  padding: var(--spacing-lg);
  min-height: 100vh;
  background: var(--bg-hover);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: var(--text-xs);
}

.models-dashboard {
  margin-bottom: var(--text-3xl);
}

.dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--text-base);
}

.metric-card {
  background: white;
  padding: var(--text-2xl);
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  text-align: center;
}

.metric-value {
  font-size: var(--text-4xl);
  font-weight: 700;
  color: #1d2129;
  margin-bottom: var(--spacing-sm);
}

.metric-label {
  font-size: var(--text-sm);
  color: #86909c;
  margin-bottom: var(--text-sm);
}

.metric-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: 500;
}

.metric-trend.positive {
  color: #00b42a;
}

.metric-trend.negative {
  color: #f53f3f;
}

.metric-trend.warning {
  color: #ff7d00;
}

.main-content {
  background: white;
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  overflow: hidden;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--text-base);
  padding: var(--spacing-lg);
}

.model-card {
  background: var(--bg-gray-light);
  border: 2px solid #e5e6eb;
  border-radius: var(--text-xs);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.model-card:hover {
  border-color: #3370ff;
  box-shadow: 0 var(--spacing-xs) var(--text-lg) rgba(51, 112, 255, 0.2);
}

.model-card.active {
  border-color: #3370ff;
  background: #f2f5ff;
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-lg);
}

.model-header h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: #1d2129;
  margin: 0;
}

.model-info {
  margin-bottom: var(--text-lg);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: var(--text-sm);
}

.info-item label {
  color: #86909c;
}

.info-item span {
  color: #1d2129;
  font-weight: 500;
}

.model-performance {
  margin-bottom: var(--text-lg);
}

.performance-bar {
  height: var(--spacing-sm);
  background: #e5e6eb;
  border-radius: var(--spacing-xs);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.performance-fill {
  height: 100%;
  background: linear-gradient(90deg, #3370ff, #00b42a);
  transition: width 0.3s ease;
}

.performance-metrics {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: #86909c;
}

.model-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.predictions-workspace,
.anomaly-detection-workspace,
.training-workspace {
  padding: var(--spacing-lg);
}

.prediction-controls,
.detection-controls {
  display: flex;
  gap: var(--text-base);
  align-items: end;
  margin-bottom: var(--text-3xl);
  padding: var(--text-base);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.control-group label {
  font-size: var(--text-xs);
  color: #86909c;
}

.prediction-results {
  background: white;
  border: var(--border-width-base) solid #e5e6eb;
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
}

.prediction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.confidence-score {
  font-size: var(--text-sm);
  font-weight: 500;
  color: #00b42a;
}

.prediction-chart,
.anomaly-chart,
.training-chart {
  height: 300px;
  margin-bottom: var(--text-2xl);
}

.prediction-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.detail-section {
  background: var(--bg-gray-light);
  padding: var(--text-base);
  border-radius: var(--spacing-sm);
}

.detail-section h4 {
  font-size: var(--text-sm);
  font-weight: 600;
  color: #1d2129;
  margin-bottom: var(--text-sm);
}

.factors-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.factor-item {
  display: flex;
  align-items: center;
  gap: var(--text-xs);
}

.factor-name {
  font-size: var(--text-xs);
  color: #1d2129;
  min-width: 80px;
}

.factor-impact {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.impact-bar {
  flex: 1;
  height: 6px;
  background: #e5e6eb;
  border-radius: var(--radius-xs);
  overflow: hidden;
}

.impact-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.impact-value {
  font-size: var(--text-xs);
  font-weight: 500;
  min-width: 40px;
}

.explainability-content p {
  font-size: var(--text-sm);
  line-height: 1.6;
  color: #1d2129;
  margin-bottom: var(--text-sm);
}

.key-insights {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.insight-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-xs);
  color: #1d2129;
}

.anomaly-list {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.anomaly-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--text-base);
  background: var(--bg-white)7f7;
  border: var(--border-width-base) solid #ffcdd2;
  border-radius: var(--spacing-sm);
}

.anomaly-item.medium {
  background: var(--bg-white)8e1;
  border-color: #ffcc02;
}

.anomaly-item.high {
  background: #ffebee;
  border-color: #f44336;
}

.anomaly-item.critical {
  background: #fce4ec;
  border-color: #e91e63;
}

.anomaly-info {
  flex: 1;
}

.anomaly-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.anomaly-title span {
  font-weight: 600;
  color: #1d2129;
}

.anomaly-description {
  font-size: var(--text-sm);
  color: #4e5969;
  margin-bottom: var(--spacing-sm);
}

.anomaly-meta {
  display: flex;
  gap: var(--text-base);
  font-size: var(--text-xs);
  color: #86909c;
}

.anomaly-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.training-form {
  background: var(--bg-gray-light);
  padding: var(--spacing-lg);
  border-radius: var(--spacing-sm);
  margin-bottom: var(--text-2xl);
}

.training-progress {
  background: white;
  border: var(--border-width-base) solid #e5e6eb;
  border-radius: var(--spacing-sm);
  padding: var(--spacing-lg);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-2xl);
}

.progress-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--text-base);
  margin-bottom: var(--text-2xl);
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.metric-item span {
  font-size: var(--text-sm);
  color: #1d2129;
}

.training-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

@media (max-width: var(--breakpoint-md)) {
  .dashboard-metrics {
    grid-template-columns: 1fr;
  }
  
  .models-grid {
    grid-template-columns: 1fr;
  }
  
  .prediction-details {
    grid-template-columns: 1fr;
  }
  
  .training-charts {
    grid-template-columns: 1fr;
  }
}
</style>