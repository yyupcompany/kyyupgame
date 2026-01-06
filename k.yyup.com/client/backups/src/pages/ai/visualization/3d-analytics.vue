<template>
  <div class="analytics-3d-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">3D数据可视化分析</h1>
      <div class="page-actions">
        <el-button type="primary" @click="initializeVRMode" :loading="vrInitializing">
          <el-icon><View /></el-icon>
          {{ vrMode ? '退出VR模式' : '启动VR模式' }}
        </el-button>
        <el-button @click="exportVisualization">
          <el-icon><Download /></el-icon>
          导出可视化
        </el-button>
        <el-button @click="resetCamera">
          <el-icon><Refresh /></el-icon>
          重置视角
        </el-button>
      </div>
    </div>

    <!-- 3D可视化控制面板 -->
    <div class="visualization-controls">
      <div class="control-section">
        <h4>可视化类型</h4>
        <el-select v-model="selectedVisualizationType" @change="changeVisualizationType">
          <el-option label="3D散点图" value="3d_scatter" />
          <el-option label="3D网络图" value="3d_network" />
          <el-option label="3D热力图" value="3d_heatmap" />
          <el-option label="3D流向图" value="3d_flow" />
          <el-option label="VR沉浸式" value="vr_immersive" />
        </el-select>
      </div>

      <div class="control-section">
        <h4>数据维度</h4>
        <div class="dimension-controls">
          <div class="dimension-item">
            <label>X轴:</label>
            <el-select v-model="dimensionConfig.x.field" size="small">
              <el-option label="学生成绩" value="academic_score" />
              <el-option label="参与度" value="engagement" />
              <el-option label="出勤率" value="attendance" />
            </el-select>
          </div>
          <div class="dimension-item">
            <label>Y轴:</label>
            <el-select v-model="dimensionConfig.y.field" size="small">
              <el-option label="社交能力" value="social_score" />
              <el-option label="创造力" value="creativity" />
              <el-option label="运动能力" value="physical_score" />
            </el-select>
          </div>
          <div class="dimension-item">
            <label>Z轴:</label>
            <el-select v-model="dimensionConfig.z.field" size="small">
              <el-option label="行为表现" value="behavior_score" />
              <el-option label="情感发展" value="emotional_score" />
              <el-option label="语言能力" value="language_score" />
            </el-select>
          </div>
        </div>
      </div>

      <div class="control-section">
        <h4>视觉映射</h4>
        <div class="mapping-controls">
          <div class="mapping-item">
            <label>颜色映射:</label>
            <el-select v-model="visualMapping.color" size="small">
              <el-option label="年龄分组" value="age_group" />
              <el-option label="性别" value="gender" />
              <el-option label="班级" value="class" />
              <el-option label="表现等级" value="performance_level" />
            </el-select>
          </div>
          <div class="mapping-item">
            <label>大小映射:</label>
            <el-select v-model="visualMapping.size" size="small">
              <el-option label="综合评分" value="overall_score" />
              <el-option label="进步幅度" value="improvement" />
              <el-option label="家长满意度" value="parent_satisfaction" />
            </el-select>
          </div>
        </div>
      </div>

      <div class="control-section">
        <h4>渲染质量</h4>
        <el-radio-group v-model="renderQuality" @change="updateRenderQuality">
          <el-radio label="low">低质量</el-radio>
          <el-radio label="medium">中等质量</el-radio>
          <el-radio label="high">高质量</el-radio>
          <el-radio label="ultra">超高质量</el-radio>
        </el-radio-group>
      </div>

      <div class="control-section">
        <h4>交互模式</h4>
        <div class="interaction-controls">
          <el-switch v-model="interactionMode.rotate" active-text="旋转" />
          <el-switch v-model="interactionMode.zoom" active-text="缩放" />
          <el-switch v-model="interactionMode.select" active-text="选择" />
          <el-switch v-model="interactionMode.animate" active-text="动画" />
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 3D学生表现可视化 -->
        <el-tab-pane label="学生表现3D分析" name="student-performance">
          <div class="visualization-workspace">
            <div class="visualization-container">
              <div ref="threejsContainer" class="threejs-container"></div>
              
              <!-- 3D场景覆盖层信息 -->
              <div class="scene-overlay">
                <div class="scene-stats">
                  <div class="stat-item">
                    <span class="stat-label">数据点:</span>
                    <span class="stat-value">{{ sceneStats.dataPoints }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">渲染FPS:</span>
                    <span class="stat-value">{{ sceneStats.fps }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">内存使用:</span>
                    <span class="stat-value">{{ sceneStats.memoryUsage }}MB</span>
                  </div>
                </div>

                <div class="camera-controls">
                  <el-button-group size="small">
                    <el-button @click="setCameraView('front')">正视图</el-button>
                    <el-button @click="setCameraView('side')">侧视图</el-button>
                    <el-button @click="setCameraView('top')">俯视图</el-button>
                    <el-button @click="setCameraView('perspective')">透视图</el-button>
                  </el-button-group>
                </div>
              </div>
            </div>

            <div class="visualization-sidebar">
              <div class="sidebar-section">
                <h4>数据筛选</h4>
                <div class="filter-controls">
                  <div class="filter-item">
                    <label>年龄范围:</label>
                    <el-slider 
                      v-model="dataFilters.ageRange" 
                      range 
                      :min="3" 
                      :max="6" 
                      @change="applyDataFilters"
                    />
                  </div>
                  <div class="filter-item">
                    <label>成绩范围:</label>
                    <el-slider 
                      v-model="dataFilters.scoreRange" 
                      range 
                      :min="0" 
                      :max="100"
                      @change="applyDataFilters"
                    />
                  </div>
                  <div class="filter-item">
                    <label>班级筛选:</label>
                    <el-select v-model="dataFilters.selectedClasses" multiple size="small">
                      <el-option label="小班A" value="small_a" />
                      <el-option label="小班B" value="small_b" />
                      <el-option label="中班A" value="medium_a" />
                      <el-option label="中班B" value="medium_b" />
                      <el-option label="大班A" value="large_a" />
                      <el-option label="大班B" value="large_b" />
                    </el-select>
                  </div>
                </div>
              </div>

              <div class="sidebar-section">
                <h4>选中数据详情</h4>
                <div v-if="selectedDataPoint" class="data-details">
                  <div class="detail-item">
                    <label>学生姓名:</label>
                    <span>{{ selectedDataPoint.name }}</span>
                  </div>
                  <div class="detail-item">
                    <label>年龄:</label>
                    <span>{{ selectedDataPoint.age }}岁</span>
                  </div>
                  <div class="detail-item">
                    <label>班级:</label>
                    <span>{{ selectedDataPoint.class }}</span>
                  </div>
                  <div class="detail-item">
                    <label>综合评分:</label>
                    <span>{{ selectedDataPoint.overallScore }}</span>
                  </div>
                  <div class="detail-item">
                    <label>学术表现:</label>
                    <el-progress :percentage="selectedDataPoint.academicScore" />
                  </div>
                  <div class="detail-item">
                    <label>社交能力:</label>
                    <el-progress :percentage="selectedDataPoint.socialScore" />
                  </div>
                  <div class="detail-item">
                    <label>行为表现:</label>
                    <el-progress :percentage="selectedDataPoint.behaviorScore" />
                  </div>
                </div>
                <div v-else class="no-selection">
                  <p>点击3D场景中的数据点查看详情</p>
                </div>
              </div>

              <div class="sidebar-section">
                <h4>3D分析工具</h4>
                <div class="analysis-tools">
                  <el-button size="small" @click="performClusterAnalysis">
                    <el-icon><TrendCharts /></el-icon>
                    聚类分析
                  </el-button>
                  <el-button size="small" @click="detectOutliers">
                    <el-icon><Warning /></el-icon>
                    异常检测
                  </el-button>
                  <el-button size="small" @click="showCorrelationLines">
                    <el-icon><Connection /></el-icon>
                    相关性连线
                  </el-button>
                  <el-button size="small" @click="generatePredictionSurface">
                    <el-icon><TrendCharts /></el-icon>
                    预测表面
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- VR沉浸式分析环境 -->
        <el-tab-pane label="VR沉浸式分析" name="vr-analysis">
          <div class="vr-analysis-workspace">
            <div class="vr-status-panel">
              <div class="vr-status">
                <div class="status-indicator" :class="{ active: vrMode }">
                  <el-icon><View /></el-icon>
                  <span>{{ vrMode ? 'VR模式已启动' : 'VR模式未启动' }}</span>
                </div>
                <div class="vr-device-info" v-if="vrDeviceInfo">
                  <span>设备: {{ vrDeviceInfo.deviceName }}</span>
                  <span>分辨率: {{ vrDeviceInfo.resolution }}</span>
                  <span>刷新率: {{ vrDeviceInfo.refreshRate }}Hz</span>
                </div>
              </div>

              <div class="vr-controls">
                <el-button type="primary" @click="enterVREnvironment" :disabled="!vrMode">
                  进入VR环境
                </el-button>
                <el-button @click="calibrateVRControllers" :disabled="!vrMode">
                  校准控制器
                </el-button>
                <el-button @click="toggleSpatialAudio" :disabled="!vrMode">
                  {{ spatialAudio ? '关闭' : '开启' }}空间音频
                </el-button>
              </div>
            </div>

            <div class="vr-environment-config">
              <h4>VR环境配置</h4>
              <div class="config-grid">
                <div class="config-item">
                  <label>环境类型:</label>
                  <el-select v-model="vrConfig.environmentType">
                    <el-option label="虚拟教室" value="virtual_classroom" />
                    <el-option label="数据宇宙" value="data_universe" />
                    <el-option label="分析实验室" value="analysis_lab" />
                    <el-option label="花园场景" value="garden_scene" />
                  </el-select>
                </div>
                <div class="config-item">
                  <label>沉浸等级:</label>
                  <el-select v-model="vrConfig.immersionLevel">
                    <el-option label="部分沉浸" value="partial" />
                    <el-option label="完全沉浸" value="full" />
                    <el-option label="增强现实" value="ar" />
                  </el-select>
                </div>
                <div class="config-item">
                  <label>交互方式:</label>
                  <el-checkbox-group v-model="vrConfig.interactionMethods">
                    <el-checkbox label="hand_tracking">手部追踪</el-checkbox>
                    <el-checkbox label="controller">控制器</el-checkbox>
                    <el-checkbox label="voice">语音控制</el-checkbox>
                    <el-checkbox label="eye_tracking">眼球追踪</el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
            </div>

            <div class="vr-preview-container">
              <div ref="vrPreviewContainer" class="vr-preview"></div>
              <div class="vr-overlay-info">
                <h5>VR环境预览</h5>
                <p>在VR模式下，您可以：</p>
                <ul>
                  <li>360度查看3D数据可视化</li>
                  <li>使用手势操控数据点</li>
                  <li>通过语音命令执行分析</li>
                  <li>体验沉浸式数据探索</li>
                </ul>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 实时数据流可视化 -->
        <el-tab-pane label="实时数据流" name="data-flow">
          <div class="data-flow-workspace">
            <div class="flow-controls">
              <div class="control-group">
                <label>数据流类型:</label>
                <el-select v-model="selectedDataStream" @change="switchDataStream">
                  <el-option label="学生活动流" value="student_activity" />
                  <el-option label="教师互动流" value="teacher_interaction" />
                  <el-option label="系统使用流" value="system_usage" />
                  <el-option label="家长参与流" value="parent_engagement" />
                </el-select>
              </div>
              <div class="control-group">
                <label>流速控制:</label>
                <el-slider v-model="flowSpeed" :min="0.1" :max="2" :step="0.1" />
              </div>
              <div class="control-group">
                <el-button type="primary" @click="startDataFlow" :loading="dataFlowActive">
                  {{ dataFlowActive ? '停止流动' : '开始流动' }}
                </el-button>
              </div>
            </div>

            <div class="flow-visualization-container">
              <div ref="flowContainer" class="flow-canvas"></div>
              
              <div class="flow-metrics">
                <div class="metric-card">
                  <div class="metric-icon">
                    <el-icon><DataBoard /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-value">{{ flowMetrics.throughput }}</div>
                    <div class="metric-label">数据吞吐量/秒</div>
                  </div>
                </div>
                <div class="metric-card">
                  <div class="metric-icon">
                    <el-icon><Clock /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-value">{{ flowMetrics.latency }}ms</div>
                    <div class="metric-label">平均延迟</div>
                  </div>
                </div>
                <div class="metric-card">
                  <div class="metric-icon">
                    <el-icon><Connection /></el-icon>
                  </div>
                  <div class="metric-info">
                    <div class="metric-value">{{ flowMetrics.activeConnections }}</div>
                    <div class="metric-label">活跃连接数</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flow-analysis-panel">
              <h4>流动模式分析</h4>
              <div class="pattern-insights">
                <div class="insight-item" v-for="insight in flowInsights" :key="insight.type">
                  <div class="insight-type">{{ insight.type }}</div>
                  <div class="insight-description">{{ insight.description }}</div>
                  <div class="insight-confidence">置信度: {{ insight.confidence }}%</div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 高级交互式图表 -->
        <el-tab-pane label="交互式图表" name="interactive-charts">
          <div class="interactive-charts-workspace">
            <div class="charts-grid">
              <div class="chart-container">
                <h4>多维度关系图</h4>
                <div ref="relationshipChart" class="chart-canvas"></div>
                <div class="chart-controls">
                  <el-button size="small" @click="toggleChartAnimation">
                    {{ chartAnimation ? '停止动画' : '开始动画' }}
                  </el-button>
                  <el-button size="small" @click="exportChartData">导出数据</el-button>
                </div>
              </div>

              <div class="chart-container">
                <h4>时间序列预测</h4>
                <div ref="timeSeriesChart" class="chart-canvas"></div>
                <div class="chart-controls">
                  <el-date-picker 
                    v-model="timeRange" 
                    type="daterange" 
                    size="small"
                    @change="updateTimeSeriesData"
                  />
                </div>
              </div>

              <div class="chart-container">
                <h4>网络拓扑图</h4>
                <div ref="networkTopologyChart" class="chart-canvas"></div>
                <div class="chart-controls">
                  <el-select v-model="networkLayout" size="small" @change="updateNetworkLayout">
                    <el-option label="力导向布局" value="force" />
                    <el-option label="圆形布局" value="circular" />
                    <el-option label="层次布局" value="hierarchical" />
                  </el-select>
                </div>
              </div>

              <div class="chart-container">
                <h4>热力地图</h4>
                <div ref="heatmapChart" class="chart-canvas"></div>
                <div class="chart-controls">
                  <el-slider 
                    v-model="heatmapIntensity" 
                    :min="0" 
                    :max="1" 
                    :step="0.1"
                    @change="updateHeatmapIntensity"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  View, 
  Download,
  Refresh,
  TrendCharts,
  Warning,
  Connection,
  DataBoard,
  Clock
} from '@element-plus/icons-vue';

// 3D可视化接口定义
interface ThreeDVisualization {
  id: string;
  type: '3d_scatter' | '3d_network' | '3d_heatmap' | '3d_flow' | 'vr_immersive';
  data: any[];
  config: Visualization3DConfig;
  interactions: InteractionConfig;
  performance: PerformanceMetrics;
}

interface Visualization3DConfig {
  dimensions: {
    x: AxisConfig;
    y: AxisConfig;
    z: AxisConfig;
    color?: ColorMapping;
    size?: SizeMapping;
  };
  camera: CameraConfig;
  lighting: LightingConfig;
  animation: AnimationConfig;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

interface AxisConfig {
  field: string;
  label: string;
  min: number;
  max: number;
}

interface ColorMapping {
  field: string;
  scale: string[];
}

interface SizeMapping {
  field: string;
  range: [number, number];
}

interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

interface LightingConfig {
  ambient: number;
  directional: {
    intensity: number;
    position: [number, number, number];
  };
}

interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
}

interface InteractionConfig {
  rotate: boolean;
  zoom: boolean;
  select: boolean;
  hover: boolean;
}

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
}

interface VRConfig {
  environmentType: string;
  immersionLevel: string;
  interactionMethods: string[];
  spatialAudio: boolean;
}

interface DataPoint {
  id: string;
  name: string;
  age: number;
  class: string;
  overallScore: number;
  academicScore: number;
  socialScore: number;
  behaviorScore: number;
  position: [number, number, number];
}

// 状态管理
const activeTab = ref('student-performance');
const selectedVisualizationType = ref('3d_scatter');
const renderQuality = ref('high');
const vrMode = ref(false);
const vrInitializing = ref(false);
const spatialAudio = ref(false);
const dataFlowActive = ref(false);
const chartAnimation = ref(true);

// 3D场景相关
const threejsContainer = ref<HTMLElement | null>(null);
const vrPreviewContainer = ref<HTMLElement | null>(null);
const flowContainer = ref<HTMLElement | null>(null);
const scene = ref<any>(null);
const renderer = ref<any>(null);
const camera = ref<any>(null);

// 维度配置
const dimensionConfig = ref({
  x: { field: 'academic_score', label: '学术成绩' },
  y: { field: 'social_score', label: '社交能力' },
  z: { field: 'behavior_score', label: '行为表现' }
});

// 视觉映射
const visualMapping = ref({
  color: 'age_group',
  size: 'overall_score'
});

// 交互模式
const interactionMode = ref({
  rotate: true,
  zoom: true,
  select: true,
  animate: true
});

// 数据筛选
const dataFilters = ref({
  ageRange: [3, 6],
  scoreRange: [0, 100],
  selectedClasses: ['small_a', 'medium_a', 'large_a']
});

// 场景统计
const sceneStats = ref({
  dataPoints: 0,
  fps: 60,
  memoryUsage: 45
});

// 选中的数据点
const selectedDataPoint = ref<DataPoint | null>(null);

// VR配置
const vrConfig = ref<VRConfig>({
  environmentType: 'virtual_classroom',
  immersionLevel: 'full',
  interactionMethods: ['hand_tracking', 'controller'],
  spatialAudio: true
});

const vrDeviceInfo = ref({
  deviceName: 'Meta Quest 3',
  resolution: '2064x2208',
  refreshRate: 90
});

// 数据流配置
const selectedDataStream = ref('student_activity');
const flowSpeed = ref(1.0);

const flowMetrics = ref({
  throughput: 1250,
  latency: 12,
  activeConnections: 23
});

const flowInsights = ref([
  {
    type: '高峰模式',
    description: '学生活动在上午9-11点达到高峰',
    confidence: 94
  },
  {
    type: '交互模式',
    description: '教师-学生互动主要集中在小组活动时间',
    confidence: 87
  },
  {
    type: '使用模式',
    description: '家长参与度在晚间7-9点最高',
    confidence: 91
  }
]);

// 图表相关
const relationshipChart = ref<HTMLElement | null>(null);
const timeSeriesChart = ref<HTMLElement | null>(null);
const networkTopologyChart = ref<HTMLElement | null>(null);
const heatmapChart = ref<HTMLElement | null>(null);

const timeRange = ref<[Date, Date]>([new Date(), new Date()]);
const networkLayout = ref('force');
const heatmapIntensity = ref(0.8);

// 3D可视化引擎
const use3DVisualization = () => {
  // 初始化3D环境
  const initialize3DEnvironment = () => {
    console.log('初始化3D环境...');
    
    // 模拟Three.js初始化
    try {
      // 创建场景、相机、渲染器
      scene.value = { name: 'Scene' };
      camera.value = { 
        position: [10, 10, 10],
        target: [0, 0, 0]
      };
      renderer.value = {
        domElement: document.createElement('canvas'),
        setSize: (width: number, height: number) => {},
        render: () => {}
      };

      // 设置容器
      if (threejsContainer.value) {
        threejsContainer.value.appendChild(renderer.value.domElement);
      }

      sceneStats.value.dataPoints = 150;
      
      console.log('3D环境初始化完成');
    } catch (error) {
      console.error('3D环境初始化失败:', error);
      ElMessage.error('3D环境初始化失败');
    }
  };

  // 创建3D学生表现可视化
  const create3DStudentPerformanceViz = async () => {
    try {
      console.log('创建3D学生表现可视化...');
      
      // 模拟加载学生数据
      const studentData = generateMockStudentData();
      
      // 创建3D散点图
      studentData.forEach((student, index) => {
        // 模拟在3D场景中添加数据点
        console.log(`添加学生数据点: ${student.name}`);
      });

      // 添加交互事件
      addInteractionEvents();
      
      ElMessage.success('3D学生表现可视化创建完成');
    } catch (error) {
      console.error('3D学生可视化创建失败:', error);
      ElMessage.error('创建3D可视化失败');
    }
  };

  // 创建VR沉浸式分析环境
  const createVRAnalyticsEnvironment = async () => {
    try {
      vrInitializing.value = true;
      
      console.log('创建VR分析环境...');
      
      // 模拟VR环境初始化
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      vrMode.value = true;
      
      ElMessage.success('VR分析环境创建完成');
    } catch (error) {
      console.error('VR环境创建失败:', error);
      ElMessage.error('VR环境创建失败');
    } finally {
      vrInitializing.value = false;
    }
  };

  // 实时数据流3D可视化
  const createRealTimeFlow3D = (dataStream: string) => {
    console.log(`创建实时数据流: ${dataStream}`);
    
    // 模拟WebSocket连接
    const mockWebSocket = {
      onmessage: (callback: (event: any) => void) => {
        const interval = setInterval(() => {
          if (dataFlowActive.value) {
            const mockData = {
              type: 'flow_update',
              data: {
                nodes: generateFlowNodes(),
                edges: generateFlowEdges(),
                timestamp: Date.now()
              }
            };
            callback({ data: JSON.stringify(mockData) });
          } else {
            clearInterval(interval);
          }
        }, 1000 / flowSpeed.value);
      }
    };

    return mockWebSocket;
  };

  return {
    initialize3DEnvironment,
    create3DStudentPerformanceViz,
    createVRAnalyticsEnvironment,
    createRealTimeFlow3D
  };
};

const { 
  initialize3DEnvironment, 
  create3DStudentPerformanceViz, 
  createVRAnalyticsEnvironment,
  createRealTimeFlow3D 
} = use3DVisualization();

// 界面交互方法
const initializeVRMode = async () => {
  if (vrMode.value) {
    vrMode.value = false;
    ElMessage.info('已退出VR模式');
  } else {
    await createVRAnalyticsEnvironment();
  }
};

const exportVisualization = () => {
  ElMessage.success('正在导出3D可视化...');
  setTimeout(() => {
    ElMessage.success('可视化导出完成');
  }, 2000);
};

const resetCamera = () => {
  if (camera.value) {
    camera.value.position = [10, 10, 10];
    camera.value.target = [0, 0, 0];
  }
  ElMessage.info('视角已重置');
};

const changeVisualizationType = (type: string) => {
  console.log(`切换可视化类型: ${type}`);
  // 重新创建可视化
  create3DStudentPerformanceViz();
};

const updateRenderQuality = (quality: string) => {
  console.log(`更新渲染质量: ${quality}`);
  // 调整渲染参数
  const qualitySettings = {
    low: { samples: 2, shadows: false },
    medium: { samples: 4, shadows: true },
    high: { samples: 8, shadows: true },
    ultra: { samples: 16, shadows: true }
  };
  
  ElMessage.success(`渲染质量已设置为: ${quality}`);
};

const setCameraView = (view: string) => {
  const viewPositions = {
    front: [0, 0, 20],
    side: [20, 0, 0],
    top: [0, 20, 0],
    perspective: [10, 10, 10]
  };
  
  if (camera.value && viewPositions[view]) {
    camera.value.position = viewPositions[view];
    ElMessage.info(`切换到${view}视图`);
  }
};

const applyDataFilters = () => {
  console.log('应用数据筛选:', dataFilters.value);
  // 重新筛选和渲染数据
  create3DStudentPerformanceViz();
};

const performClusterAnalysis = () => {
  ElMessage.info('正在执行聚类分析...');
  setTimeout(() => {
    ElMessage.success('聚类分析完成，发现3个主要群组');
  }, 2000);
};

const detectOutliers = () => {
  ElMessage.info('正在检测异常值...');
  setTimeout(() => {
    ElMessage.warning('检测到5个异常数据点');
  }, 1500);
};

const showCorrelationLines = () => {
  ElMessage.info('显示相关性连线');
  // 在3D场景中添加连线
};

const generatePredictionSurface = () => {
  ElMessage.info('生成预测表面...');
  setTimeout(() => {
    ElMessage.success('预测表面生成完成');
  }, 3000);
};

const enterVREnvironment = () => {
  if (vrMode.value) {
    ElMessage.success('正在进入VR环境...');
    // 启动VR会话
  } else {
    ElMessage.warning('请先启动VR模式');
  }
};

const calibrateVRControllers = () => {
  ElMessage.info('正在校准VR控制器...');
  setTimeout(() => {
    ElMessage.success('控制器校准完成');
  }, 2000);
};

const toggleSpatialAudio = () => {
  spatialAudio.value = !spatialAudio.value;
  ElMessage.info(`空间音频已${spatialAudio.value ? '开启' : '关闭'}`);
};

const switchDataStream = (stream: string) => {
  console.log(`切换数据流: ${stream}`);
  createRealTimeFlow3D(stream);
};

const startDataFlow = () => {
  dataFlowActive.value = !dataFlowActive.value;
  
  if (dataFlowActive.value) {
    createRealTimeFlow3D(selectedDataStream.value);
    ElMessage.success('数据流已启动');
  } else {
    ElMessage.info('数据流已停止');
  }
};

const toggleChartAnimation = () => {
  chartAnimation.value = !chartAnimation.value;
  ElMessage.info(`图表动画已${chartAnimation.value ? '开启' : '关闭'}`);
};

const exportChartData = () => {
  ElMessage.success('正在导出图表数据...');
};

const updateTimeSeriesData = (range: [Date, Date]) => {
  console.log('更新时间序列数据:', range);
};

const updateNetworkLayout = (layout: string) => {
  console.log(`更新网络布局: ${layout}`);
};

const updateHeatmapIntensity = (intensity: number) => {
  console.log(`更新热力图强度: ${intensity}`);
};

// 辅助函数
const generateMockStudentData = (): DataPoint[] => {
  const students: DataPoint[] = [];
  const names = ['小明', '小红', '小刚', '小丽', '小华'];
  const classes = ['small_a', 'medium_a', 'large_a'];
  
  for (let i = 0; i < 50; i++) {
    students.push({
      id: `student_${i}`,
      name: names[i % names.length] + i,
      age: 3 + Math.floor(Math.random() * 4),
      class: classes[i % classes.length],
      overallScore: 60 + Math.random() * 40,
      academicScore: 50 + Math.random() * 50,
      socialScore: 40 + Math.random() * 60,
      behaviorScore: 55 + Math.random() * 45,
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ]
    });
  }
  
  return students;
};

const addInteractionEvents = () => {
  // 模拟添加3D场景交互事件
  console.log('添加3D场景交互事件');
};

const generateFlowNodes = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `node_${i}`,
    x: Math.random() * 100,
    y: Math.random() * 100,
    value: Math.random() * 50
  }));
};

const generateFlowEdges = () => {
  return Array.from({ length: 8 }, (_, i) => ({
    source: `node_${i}`,
    target: `node_${i + 1}`,
    value: Math.random() * 10
  }));
};

// 组件生命周期
onMounted(async () => {
  await nextTick();
  initialize3DEnvironment();
  await create3DStudentPerformanceViz();
});

onUnmounted(() => {
  // 清理3D资源
  if (renderer.value) {
    console.log('清理3D渲染器资源');
  }
});
</script>

<style scoped lang="scss">
.analytics-3d-container {
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

.visualization-controls {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--text-3xl);
  padding: var(--text-base);
  background: white;
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  overflow-x: auto;
}

.control-section {
  min-width: 180px;
  
  h4 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.dimension-controls,
.mapping-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.dimension-item,
.mapping-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  label {
    font-size: var(--text-xs);
    color: #86909c;
    min-width: 40px;
  }
}

.interaction-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.main-content {
  background: white;
  border-radius: var(--text-xs);
  box-shadow: 0 2px var(--spacing-sm) var(--shadow-light);
  overflow: hidden;
}

.visualization-workspace {
  display: flex;
  height: 600px;
}

.visualization-container {
  flex: 1;
  position: relative;
  background: #000;
  border-radius: var(--spacing-sm);
  overflow: hidden;
}

.threejs-container {
  width: 100%;
  height: 100%;
}

.scene-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.scene-stats {
  position: absolute;
  top: var(--text-lg);
  left: var(--text-lg);
  background: var(--black-alpha-70);
  color: white;
  padding: var(--text-xs);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
  
  .stat-label {
    margin-right: var(--text-sm);
  }
  
  .stat-value {
    font-weight: 600;
  }
}

.camera-controls {
  position: absolute;
  top: var(--text-lg);
  right: var(--text-lg);
  pointer-events: auto;
}

.visualization-sidebar {
  width: 300px;
  padding: var(--spacing-lg);
  background: var(--bg-gray-light);
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: var(--text-3xl);
  
  h4 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: var(--text-base);
}

.filter-item {
  label {
    display: block;
    font-size: var(--text-xs);
    color: #86909c;
    margin-bottom: var(--spacing-sm);
  }
}

.data-details {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  
  label {
    color: #86909c;
  }
  
  span {
    color: #1d2129;
    font-weight: 500;
  }
}

.no-selection {
  text-align: center;
  color: #86909c;
  font-size: var(--text-xs);
  padding: var(--spacing-lg);
}

.analysis-tools {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.vr-analysis-workspace {
  padding: var(--spacing-lg);
}

.vr-status-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--text-3xl);
  padding: var(--text-base);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
}

.vr-status {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-sm);
  color: #86909c;
  
  &.active {
    color: #00b42a;
  }
}

.vr-device-info {
  display: flex;
  gap: var(--text-base);
  font-size: var(--text-xs);
  color: #86909c;
}

.vr-controls {
  display: flex;
  gap: var(--spacing-sm);
}

.vr-environment-config {
  margin-bottom: var(--text-3xl);
  
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--text-base);
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  
  label {
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.vr-preview-container {
  display: flex;
  gap: var(--spacing-lg);
  height: 400px;
}

.vr-preview {
  flex: 1;
  background: #000;
  border-radius: var(--spacing-sm);
}

.vr-overlay-info {
  width: 300px;
  padding: var(--spacing-lg);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  
  h5 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
  
  p {
    font-size: var(--text-xs);
    color: #4e5969;
    margin-bottom: var(--text-sm);
  }
  
  ul {
    font-size: var(--text-xs);
    color: #4e5969;
    padding-left: var(--text-lg);
    
    li {
      margin-bottom: var(--spacing-xs);
    }
  }
}

.data-flow-workspace {
  padding: var(--spacing-lg);
}

.flow-controls {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  margin-bottom: var(--text-3xl);
  padding: var(--text-base);
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
}

.control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  label {
    font-size: var(--text-xs);
    color: #86909c;
    min-width: 80px;
  }
}

.flow-visualization-container {
  position: relative;
  height: 400px;
  margin-bottom: var(--text-3xl);
}

.flow-canvas {
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: var(--spacing-sm);
}

.flow-metrics {
  position: absolute;
  bottom: var(--text-lg);
  left: var(--text-lg);
  display: flex;
  gap: var(--text-base);
}

.metric-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--white-alpha-90);
  padding: var(--spacing-sm) var(--text-sm);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
}

.metric-icon {
  font-size: var(--text-base);
  color: var(--primary-color);
}

.metric-info {
  .metric-value {
    font-weight: 600;
    color: #1d2129;
  }
  
  .metric-label {
    color: #86909c;
  }
}

.flow-analysis-panel {
  h4 {
    font-size: var(--text-base);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-lg);
  }
}

.pattern-insights {
  display: flex;
  flex-direction: column;
  gap: var(--text-xs);
}

.insight-item {
  padding: var(--text-xs);
  background: var(--bg-gray-light);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary-color);
  
  .insight-type {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
  }
  
  .insight-description {
    font-size: var(--text-sm);
    color: #1d2129;
    margin-bottom: var(--spacing-xs);
  }
  
  .insight-confidence {
    font-size: var(--text-xs);
    color: #86909c;
  }
}

.interactive-charts-workspace {
  padding: var(--spacing-lg);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.chart-container {
  background: var(--bg-gray-light);
  border-radius: var(--spacing-sm);
  padding: var(--text-base);
  
  h4 {
    font-size: var(--text-sm);
    font-weight: 600;
    color: #1d2129;
    margin-bottom: var(--text-sm);
  }
}

.chart-canvas {
  height: 200px;
  background: white;
  border-radius: var(--spacing-xs);
  margin-bottom: var(--text-sm);
}

.chart-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

@media (max-width: var(--breakpoint-md)) {
  .visualization-controls {
    flex-direction: column;
    gap: var(--text-base);
  }
  
  .visualization-workspace {
    flex-direction: column;
    height: auto;
  }
  
  .visualization-sidebar {
    width: 100%;
  }
  
  .vr-status-panel {
    flex-direction: column;
    gap: var(--text-base);
  }
  
  .vr-preview-container {
    flex-direction: column;
    height: auto;
  }
  
  .vr-overlay-info {
    width: 100%;
  }
  
  .flow-controls {
    flex-direction: column;
    gap: var(--text-xs);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>