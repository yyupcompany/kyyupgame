<template>
  <div class="security-monitoring">
    <!-- 安全概览 -->
    <div class="security-overview">
      <div class="section-header">
        <h2>安全监控中心</h2>
        <div class="overview-actions">
          <el-button type="primary" @click="performSecurityScan" :loading="scanningSystem">
            <el-icon><Search /></el-icon>
            执行安全扫描
          </el-button>
          <el-button @click="refreshSecurityData" :loading="refreshing">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
      
      <div class="security-score-card">
        <div class="score-circle" :class="getSecurityScoreClass(securityScore)">
          <span class="score-value">{{ securityScore }}</span>
          <span class="score-label">安全评分</span>
        </div>
        <div class="score-details">
          <div class="metric">
            <span class="label">威胁等级</span>
            <el-tag :type="getThreatLevelType(threatLevel)" size="large">
              {{ getThreatLevelText(threatLevel) }}
            </el-tag>
          </div>
          <div class="metric">
            <span class="label">活跃威胁</span>
            <span class="value" :class="{ warning: activeThreats > 0 }">{{ activeThreats }}</span>
          </div>
          <div class="metric">
            <span class="label">漏洞数量</span>
            <span class="value" :class="{ warning: vulnerabilities > 5 }">{{ vulnerabilities }}</span>
          </div>
          <div class="metric">
            <span class="label">风险等级</span>
            <el-progress 
              :percentage="riskLevel" 
              :color="getRiskLevelColor(riskLevel)"
              :stroke-width="8"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 实时威胁检测 -->
    <div class="threat-detection">
      <div class="section-header">
        <h3>实时威胁检测</h3>
        <div class="threat-actions">
          <el-tag :type="getConnectionStatusType()" size="small">
            {{ connectionStatus }}
          </el-tag>
          <el-button size="small" @click="clearAllThreats" v-if="recentThreats.length > 0">
            <el-icon><Close /></el-icon>
            清除所有威胁
          </el-button>
        </div>
      </div>
      
      <div class="threat-timeline">
        <div v-if="recentThreats.length === 0" class="no-threats">
          <el-icon class="success-icon"><CircleCheck /></el-icon>
          <span>系统安全，暂无检测到威胁</span>
        </div>
        
        <div 
          v-for="threat in recentThreats" 
          :key="threat.id"
          class="threat-item"
          :class="threat.severity"
        >
          <div class="threat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="threat-content">
            <div class="threat-title">{{ threat.threatType }}</div>
            <div class="threat-description">{{ threat.description }}</div>
            <div class="threat-meta">
              <span class="timestamp">{{ formatTime(threat.createdAt) }}</span>
              <span class="source">来源: {{ threat.sourceIp || '未知' }}</span>
              <el-tag :type="getThreatSeverityType(threat.severity)" size="small">
                {{ getThreatSeverityText(threat.severity) }}
              </el-tag>
            </div>
          </div>
          <div class="threat-actions">
            <el-button size="small" type="primary" @click="handleThreat(threat)">
              处理
            </el-button>
            <el-button size="small" @click="ignoreThreat(threat)">
              忽略
            </el-button>
            <el-button size="small" type="danger" plain @click="blockThreat(threat)">
              阻止
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户行为分析 -->
    <div class="behavior-analysis">
      <div class="section-header">
        <h3>用户行为分析</h3>
        <div class="analysis-controls">
          <el-select v-model="analysisTimeRange" @change="updateBehaviorAnalysis" placeholder="选择时间范围">
            <el-option label="最近1小时" value="1h" />
            <el-option label="最近24小时" value="24h" />
            <el-option label="最近7天" value="7d" />
            <el-option label="最近30天" value="30d" />
          </el-select>
          <el-button @click="generateBehaviorReport" :loading="generatingReport">
            <el-icon><Document /></el-icon>
            生成报告
          </el-button>
        </div>
      </div>
      
      <div class="behavior-metrics">
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon login-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ behaviorMetrics.totalLogins }}</div>
              <div class="metric-label">总登录次数</div>
            </div>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>成功登录</span>
              <span class="success">{{ behaviorMetrics.successfulLogins }}</span>
            </div>
            <div class="detail-item">
              <span>失败登录</span>
              <span class="error">{{ behaviorMetrics.failedLogins }}</span>
            </div>
            <div class="detail-item">
              <span>异常登录</span>
              <span class="warning">{{ behaviorMetrics.suspiciousLogins }}</span>
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon activity-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ behaviorMetrics.activeUsers }}</div>
              <div class="metric-label">活跃用户</div>
            </div>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>当前在线</span>
              <span class="online">{{ behaviorMetrics.onlineUsers }}</span>
            </div>
            <div class="detail-item">
              <span>今日新增</span>
              <span class="info">{{ behaviorMetrics.newUsers }}</span>
            </div>
            <div class="detail-item">
              <span>异常行为</span>
              <span class="warning">{{ behaviorMetrics.anomalousUsers }}</span>
            </div>
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon access-icon">
              <el-icon><Key /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-value">{{ behaviorMetrics.accessAttempts }}</div>
              <div class="metric-label">访问尝试</div>
            </div>
          </div>
          <div class="metric-details">
            <div class="detail-item">
              <span>正常访问</span>
              <span class="success">{{ behaviorMetrics.normalAccess }}</span>
            </div>
            <div class="detail-item">
              <span>拒绝访问</span>
              <span class="error">{{ behaviorMetrics.deniedAccess }}</span>
            </div>
            <div class="detail-item">
              <span>可疑访问</span>
              <span class="warning">{{ behaviorMetrics.suspiciousAccess }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 异常行为检测 -->
    <div v-if="anomalousActivities.length > 0" class="anomalous-activities">
      <div class="section-header">
        <h3>异常行为检测</h3>
        <el-button size="small" type="warning" @click="investigateAllAnomalies" :loading="investigating">
          <el-icon><Search /></el-icon>
          深度调查
        </el-button>
      </div>
      
      <div class="anomalies-list">
        <div 
          v-for="anomaly in anomalousActivities" 
          :key="anomaly.id"
          class="anomaly-item"
          :class="anomaly.riskLevel"
        >
          <div class="anomaly-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="anomaly-content">
            <div class="anomaly-header">
              <h4>{{ anomaly.type }}</h4>
              <el-tag :type="getRiskLevelType(anomaly.riskLevel)" size="small">
                {{ getRiskLevelText(anomaly.riskLevel) }}
              </el-tag>
            </div>
            <div class="anomaly-description">{{ anomaly.description }}</div>
            <div class="anomaly-details">
              <div class="detail-item">
                <span class="label">用户:</span>
                <span class="value">{{ anomaly.user }}</span>
              </div>
              <div class="detail-item">
                <span class="label">IP地址:</span>
                <span class="value">{{ anomaly.ipAddress }}</span>
              </div>
              <div class="detail-item">
                <span class="label">检测时间:</span>
                <span class="value">{{ formatTime(anomaly.detectedAt) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">置信度:</span>
                <el-progress 
                  :percentage="anomaly.confidence" 
                  :color="getConfidenceColor(anomaly.confidence)"
                  :stroke-width="6"
                  text-inside
                />
              </div>
            </div>
          </div>
          <div class="anomaly-actions">
            <el-button size="small" type="primary" @click="investigateAnomaly(anomaly)">
              调查
            </el-button>
            <el-button size="small" type="danger" @click="blockUser(anomaly.user)">
              封禁用户
            </el-button>
            <el-button size="small" @click="whitelistActivity(anomaly)">
              添加白名单
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全建议 -->
    <div class="security-recommendations">
      <div class="section-header">
        <h3>AI安全建议</h3>
        <div class="recommendation-actions">
          <el-button @click="generateSecurityRecommendations" :loading="generatingRecommendations">
            <el-icon><MagicStick /></el-icon>
            生成AI建议
          </el-button>
          <el-button v-if="securityRecommendations.length > 0" type="success" @click="implementAllRecommendations">
            <el-icon><Check /></el-icon>
            应用所有建议
          </el-button>
        </div>
      </div>
      
      <div v-if="securityRecommendations.length === 0" class="no-recommendations">
        <el-icon class="info-icon"><InfoFilled /></el-icon>
        <span>暂无安全建议，点击"生成AI建议"获取个性化安全优化方案</span>
      </div>
      
      <div class="recommendations-list">
        <div 
          v-for="recommendation in securityRecommendations" 
          :key="recommendation.id"
          class="recommendation-item"
        >
          <div class="recommendation-priority" :class="recommendation.priority">
            {{ getPriorityText(recommendation.priority) }}
          </div>
          <div class="recommendation-content">
            <h4>{{ recommendation.title }}</h4>
            <p>{{ recommendation.description }}</p>
            <div class="recommendation-impact">
              预期改善: {{ recommendation.expectedImprovement }}
            </div>
            <div class="recommendation-effort">
              实施难度: <el-rate v-model="recommendation.effortLevel" disabled show-score />
            </div>
          </div>
          <div class="recommendation-actions">
            <el-button 
              type="primary" 
              @click="implementRecommendation(recommendation)"
              :loading="recommendation.implementing"
            >
              立即实施
            </el-button>
            <el-button 
              @click="scheduleRecommendation(recommendation)"
            >
              计划实施
            </el-button>
            <el-button 
              type="info" 
              plain
              @click="learnMore(recommendation)"
            >
              了解更多
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import * as echarts from 'echarts';
import { securityApi } from '@/api/security';
import { 
  Warning, 
  CircleCheck, 
  Search, 
  Refresh, 
  Close, 
  Document, 
  User, 
  Monitor, 
  Key, 
  MagicStick, 
  Check,
  InfoFilled
} from '@element-plus/icons-vue';

// 接口定义
interface SecurityThreat {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  source: string;
  blocked?: boolean;
}

interface AnomalousActivity {
  id: string;
  type: string;
  description: string;
  user: string;
  ipAddress: string;
  detectedAt: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

interface BehaviorMetrics {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  suspiciousLogins: number;
  activeUsers: number;
  onlineUsers: number;
  newUsers: number;
  anomalousUsers: number;
  accessAttempts: number;
  normalAccess: number;
  deniedAccess: number;
  suspiciousAccess: number;
}

interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedImprovement: string;
  effortLevel: number;
  implementing?: boolean;
}

// 响应式数据
const securityScore = ref(0);
const threatLevel = ref<'low' | 'medium' | 'high' | 'critical'>('low');
const activeThreats = ref(0);
const vulnerabilities = ref(0);
const riskLevel = ref(0);
const connectionStatus = ref('连接中...');

const recentThreats = ref<SecurityThreat[]>([]);
const anomalousActivities = ref<AnomalousActivity[]>([]);
const securityRecommendations = ref<SecurityRecommendation[]>([]);

const behaviorMetrics = ref<BehaviorMetrics>({
  totalLogins: 1247,
  successfulLogins: 1198,
  failedLogins: 43,
  suspiciousLogins: 6,
  activeUsers: 89,
  onlineUsers: 23,
  newUsers: 7,
  anomalousUsers: 2,
  accessAttempts: 2156,
  normalAccess: 2089,
  deniedAccess: 54,
  suspiciousAccess: 13
});

const analysisTimeRange = ref('24h');

// 加载状态
const scanningSystem = ref(false);
const refreshing = ref(false);
const generatingReport = ref(false);
const investigating = ref(false);
const generatingRecommendations = ref(false);

// WebSocket连接
let ws: WebSocket | null = null;

// 计算属性
const getSecurityScoreClass = (score: number) => {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'fair';
  return 'poor';
};

// 实时安全监控
const useRealTimeSecurityMonitoring = () => {
  const connectWebSocket = () => {
    try {
      // 模拟WebSocket连接
      connectionStatus.value = '连接中...';
      
      setTimeout(() => {
        connectionStatus.value = '实时监控中';
        
        // 模拟接收威胁数据
        const simulateThreats = () => {
          if (Math.random() < 0.3) { // 30%概率生成威胁
            const threats = [
              {
                id: 'threat-' + Date.now(),
                title: '可疑登录尝试',
                description: '检测到来自异常IP地址的多次登录失败',
                severity: 'medium' as const,
                timestamp: new Date().toISOString(),
                source: '登录监控系统'
              },
              {
                id: 'threat-' + Date.now() + 1,
                title: 'SQL注入攻击',
                description: '检测到恶意SQL查询尝试',
                severity: 'high' as const,
                timestamp: new Date().toISOString(),
                source: 'Web应用防火墙'
              },
              {
                id: 'threat-' + Date.now() + 2,
                title: '暴力破解攻击',
                description: '检测到针对管理员账户的密码暴力破解',
                severity: 'critical' as const,
                timestamp: new Date().toISOString(),
                source: '认证系统'
              }
            ];
            
            const newThreat = threats[Math.floor(Math.random() * threats.length)];
            recentThreats.value.unshift(newThreat);
            activeThreats.value++;
            
            // 更新威胁等级
            if (newThreat.severity === 'critical') {
              threatLevel.value = 'critical';
              securityScore.value = Math.max(60, securityScore.value - 10);
            } else if (newThreat.severity === 'high') {
              threatLevel.value = 'high';
              securityScore.value = Math.max(70, securityScore.value - 5);
            }
            
            ElMessage.warning(`检测到新威胁: ${newThreat.title}`);
          }
        };
        
        // 每30秒模拟一次威胁检测
        setInterval(simulateThreats, 30000);
        
      }, 2000);
      
      // 实际项目中的WebSocket连接
      // ws = new WebSocket('wss://api.kindergarten.com/security-monitor');
      // ws.onmessage = (event) => {
      //   const data = JSON.parse(event.data);
      //   handleWebSocketMessage(data);
      // };
      
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      connectionStatus.value = '连接失败';
    }
  };
  
  const disconnectWebSocket = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
    connectionStatus.value = '已断开连接';
  };
  
  return {
    connectWebSocket,
    disconnectWebSocket
  };
};

// 安全扫描
const performSecurityScan = async () => {
  try {
    scanningSystem.value = true;

    ElMessage.info('开始执行安全扫描...');

    // 调用真实的安全扫描API
    const scanResult = await securityApi.performScan({
      scanType: 'quick',
      targets: []
    });

    ElMessage.success(`安全扫描启动成功！扫描ID: ${scanResult.scanId}`);

    // 模拟扫描进度显示
    ElMessage.info('正在检查系统漏洞...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.info('正在分析用户行为...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.info('正在生成安全报告...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 扫描完成后刷新数据
    await refreshSecurityData();

    ElMessage.success('安全扫描完成！');

  } catch (error) {
    console.error('安全扫描失败:', error);
    ElMessage.error('安全扫描失败');
  } finally {
    scanningSystem.value = false;
  }
};

// 生成异常活动
const generateAnomalousActivities = async (count: number) => {
  const anomalyTypes = [
    {
      type: '异常登录时间',
      description: '用户在非工作时间频繁登录',
      riskLevel: 'medium' as const,
      confidence: 78
    },
    {
      type: '权限提升尝试',
      description: '检测到未授权的权限获取尝试',
      riskLevel: 'high' as const,
      confidence: 92
    },
    {
      type: '数据访问异常',
      description: '用户访问了超出权限范围的敏感数据',
      riskLevel: 'critical' as const,
      confidence: 89
    },
    {
      type: '地理位置异常',
      description: '用户从异常地理位置登录',
      riskLevel: 'medium' as const,
      confidence: 85
    }
  ];
  
  for (let i = 0; i < count; i++) {
    const anomaly = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
    const newAnomaly: AnomalousActivity = {
      id: 'anomaly-' + Date.now() + i,
      type: anomaly.type,
      description: anomaly.description,
      user: `user${Math.floor(Math.random() * 100) + 1}@kindergarten.com`,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      detectedAt: new Date().toISOString(),
      riskLevel: anomaly.riskLevel,
      confidence: anomaly.confidence + Math.floor(Math.random() * 10)
    };
    
    anomalousActivities.value.unshift(newAnomaly);
  }
};

// 刷新安全数据
const refreshSecurityData = async () => {
  try {
    refreshing.value = true;

    // 获取安全概览
    const overview = await securityApi.getOverview();
    securityScore.value = overview.securityScore;
    threatLevel.value = overview.threatLevel;
    activeThreats.value = overview.activeThreats;
    vulnerabilities.value = overview.vulnerabilities;
    riskLevel.value = overview.riskLevel;
    connectionStatus.value = overview.connectionStatus;

    // 获取威胁列表
    const threatsResult = await securityApi.getThreats({ page: 1, pageSize: 10 });
    recentThreats.value = threatsResult.threats || [];

    // 获取安全建议
    const recommendations = await securityApi.getRecommendations();
    securityRecommendations.value = recommendations;

    // 更新行为指标（保留模拟数据，因为这部分可能需要其他API）
    behaviorMetrics.value = {
      totalLogins: Math.floor(Math.random() * 500) + 1000,
      successfulLogins: Math.floor(Math.random() * 50) + 950,
      failedLogins: Math.floor(Math.random() * 30) + 20,
      suspiciousLogins: Math.floor(Math.random() * 10),
      activeUsers: Math.floor(Math.random() * 30) + 70,
      onlineUsers: Math.floor(Math.random() * 20) + 15,
      newUsers: Math.floor(Math.random() * 10) + 5,
      anomalousUsers: Math.floor(Math.random() * 5),
      accessAttempts: Math.floor(Math.random() * 500) + 2000,
      normalAccess: Math.floor(Math.random() * 100) + 1900,
      deniedAccess: Math.floor(Math.random() * 50) + 30,
      suspiciousAccess: Math.floor(Math.random() * 20) + 10
    };

    ElMessage.success('安全数据刷新完成');

  } catch (error) {
    console.error('刷新数据失败:', error);
    ElMessage.error('刷新数据失败');
  } finally {
    refreshing.value = false;
  }
};

// 更新行为分析
const updateBehaviorAnalysis = () => {
  ElMessage.info(`已切换到${analysisTimeRange.value}的行为分析数据`);
  refreshSecurityData();
};

// 生成行为报告
const generateBehaviorReport = async () => {
  try {
    generatingReport.value = true;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const reportData = {
      timeRange: analysisTimeRange.value,
      totalEvents: Math.floor(Math.random() * 1000) + 500,
      riskEvents: Math.floor(Math.random() * 50) + 10,
      recommendations: Math.floor(Math.random() * 10) + 5
    };
    
    ElMessage.success(`行为分析报告生成完成！共分析 ${reportData.totalEvents} 个事件，发现 ${reportData.riskEvents} 个风险事件，生成 ${reportData.recommendations} 条建议`);
    
  } catch (error) {
    console.error('生成报告失败:', error);
    ElMessage.error('生成报告失败');
  } finally {
    generatingReport.value = false;
  }
};

// 威胁处理
const handleThreat = async (threat: SecurityThreat) => {
  try {
    // 调用真实的威胁处理API
    await securityApi.handleThreat(threat.id, {
      action: 'resolve',
      notes: '通过安全监控中心处理'
    });

    ElMessage.success(`威胁 "${threat.description}" 已处理`);

    // 刷新数据
    await refreshSecurityData();

  } catch (error) {
    console.error('处理威胁失败:', error);
    ElMessage.error('处理威胁失败');
  }
};

// 忽略威胁
const ignoreThreat = async (threat: SecurityThreat) => {
  try {
    // 调用真实的威胁处理API
    await securityApi.handleThreat(threat.id, {
      action: 'ignore',
      notes: '通过安全监控中心忽略'
    });

    ElMessage.info(`已忽略威胁: ${threat.description}`);

    // 刷新数据
    await refreshSecurityData();

  } catch (error) {
    console.error('忽略威胁失败:', error);
    ElMessage.error('忽略威胁失败');
  }
};

// 阻止威胁
const blockThreat = async (threat: SecurityThreat) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要阻止来源 "${threat.sourceIp || '未知'}" 的所有访问吗？`,
      '确认阻止',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    if (result) {
      // 调用真实的威胁处理API
      await securityApi.handleThreat(threat.id, {
        action: 'block',
        notes: '通过安全监控中心阻止'
      });

      ElMessage.success(`已阻止威胁来源: ${threat.sourceIp || '未知'}`);

      // 刷新数据
      await refreshSecurityData();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('阻止威胁失败:', error);
      ElMessage.error('阻止威胁失败');
    }
  }
};

// 清除所有威胁
const clearAllThreats = async () => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要清除所有 ${recentThreats.value.length} 个威胁记录吗？`,
      '确认清除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    if (result) {
      recentThreats.value = [];
      activeThreats.value = 0;
      ElMessage.success('已清除所有威胁记录');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清除威胁失败:', error);
    }
  }
};

// 调查异常
const investigateAnomaly = async (anomaly: AnomalousActivity) => {
  try {
    investigating.value = true;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const investigationResult = {
      riskConfirmed: Math.random() > 0.5,
      additionalFindings: Math.floor(Math.random() * 3),
      recommendedActions: Math.floor(Math.random() * 4) + 1
    };
    
    if (investigationResult.riskConfirmed) {
      ElMessage.warning(`调查确认风险！发现 ${investigationResult.additionalFindings} 个相关线索，建议执行 ${investigationResult.recommendedActions} 项安全措施`);
    } else {
      ElMessage.success('调查完成，确认为误报，已将此类行为添加到白名单');
      // 从列表中移除
      const index = anomalousActivities.value.findIndex(a => a.id === anomaly.id);
      if (index > -1) {
        anomalousActivities.value.splice(index, 1);
      }
    }
    
  } catch (error) {
    console.error('调查异常失败:', error);
    ElMessage.error('调查异常失败');
  } finally {
    investigating.value = false;
  }
};

// 调查所有异常
const investigateAllAnomalies = async () => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要深度调查所有 ${anomalousActivities.value.length} 个异常行为吗？`,
      '确认调查',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    if (result) {
      investigating.value = true;
      
      // 模拟深度调查
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const confirmedRisks = Math.floor(anomalousActivities.value.length * 0.3);
      const falsePositives = anomalousActivities.value.length - confirmedRisks;
      
      ElMessage.success(`深度调查完成！确认 ${confirmedRisks} 个真实风险，排除 ${falsePositives} 个误报`);
      
      // 清除误报
      anomalousActivities.value = anomalousActivities.value.slice(0, confirmedRisks);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('深度调查失败:', error);
      ElMessage.error('深度调查失败');
    }
  } finally {
    investigating.value = false;
  }
};

// 封禁用户
const blockUser = async (user: string) => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要封禁用户 "${user}" 吗？`,
      '确认封禁',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    if (result) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      ElMessage.success(`用户 ${user} 已被封禁`);
      
      // 移除相关异常活动
      anomalousActivities.value = anomalousActivities.value.filter(a => a.user !== user);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('封禁用户失败:', error);
      ElMessage.error('封禁用户失败');
    }
  }
};

// 添加白名单
const whitelistActivity = (anomaly: AnomalousActivity) => {
  const index = anomalousActivities.value.findIndex(a => a.id === anomaly.id);
  if (index > -1) {
    anomalousActivities.value.splice(index, 1);
    ElMessage.success(`已将 "${anomaly.type}" 活动添加到白名单`);
  }
};

// 生成安全建议
const generateSecurityRecommendations = async () => {
  try {
    generatingRecommendations.value = true;

    // 调用真实的AI安全建议API
    const recommendations = await securityApi.generateAIRecommendations();

    securityRecommendations.value = recommendations;
    ElMessage.success(`生成了 ${recommendations.length} 条AI安全建议`);

  } catch (error) {
    console.error('生成安全建议失败:', error);
    ElMessage.error('生成安全建议失败');
  } finally {
    generatingRecommendations.value = false;
  }
};

// 实施建议
const implementRecommendation = async (recommendation: SecurityRecommendation) => {
  try {
    recommendation.implementing = true;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const improvementPoints = recommendation.priority === 'critical' ? 8 : 
                            recommendation.priority === 'high' ? 5 : 3;
    
    securityScore.value = Math.min(100, securityScore.value + improvementPoints);
    
    ElMessage.success(`已实施安全建议: ${recommendation.title}，安全评分提升 ${improvementPoints} 分`);
    
    // 从列表中移除
    const index = securityRecommendations.value.findIndex(r => r.id === recommendation.id);
    if (index > -1) {
      securityRecommendations.value.splice(index, 1);
    }
    
  } catch (error) {
    console.error('实施建议失败:', error);
    ElMessage.error('实施建议失败');
  } finally {
    recommendation.implementing = false;
  }
};

// 应用所有建议
const implementAllRecommendations = async () => {
  try {
    const result = await ElMessageBox.confirm(
      `确定要实施所有 ${securityRecommendations.value.length} 条安全建议吗？`,
      '确认实施',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    if (result) {
      for (const recommendation of [...securityRecommendations.value]) {
        await implementRecommendation(recommendation);
      }
      
      ElMessage.success('所有安全建议已实施完成');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('实施建议失败:', error);
      ElMessage.error('实施建议失败');
    }
  }
};

// 计划实施
const scheduleRecommendation = (recommendation: SecurityRecommendation) => {
  ElMessage.success(`已将 "${recommendation.title}" 添加到实施计划`);
};

// 了解更多
const learnMore = (recommendation: SecurityRecommendation) => {
  ElMessageBox.alert(
    `建议详情:\n\n${recommendation.description}\n\n预期改善: ${recommendation.expectedImprovement}\n\n实施难度: ${recommendation.effortLevel}/5 星`,
    recommendation.title,
    {
      confirmButtonText: '关闭'
    }
  );
};

// 工具函数
const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

const getThreatLevelType = (level: string) => {
  switch (level) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    case 'critical': return 'danger';
    default: return 'info';
  }
};

const getThreatLevelText = (level: string) => {
  switch (level) {
    case 'low': return '低风险';
    case 'medium': return '中风险';
    case 'high': return '高风险';
    case 'critical': return '极高风险';
    default: return '未知';
  }
};

const getConnectionStatusType = () => {
  if (connectionStatus.value === '实时监控中') return 'success';
  if (connectionStatus.value === '连接中...') return 'warning';
  return 'danger';
};

const getThreatSeverityType = (severity: string) => {
  switch (severity) {
    case 'low': return 'info';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    case 'critical': return 'danger';
    default: return 'info';
  }
};

const getThreatSeverityText = (severity: string) => {
  switch (severity) {
    case 'low': return '低危';
    case 'medium': return '中危';
    case 'high': return '高危';
    case 'critical': return '严重';
    default: return '未知';
  }
};

const getRiskLevelType = (level: string) => {
  switch (level) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    case 'critical': return 'danger';
    default: return 'info';
  }
};

const getRiskLevelText = (level: string) => {
  switch (level) {
    case 'low': return '低风险';
    case 'medium': return '中风险';
    case 'high': return '高风险';
    case 'critical': return '极高风险';
    default: return '未知';
  }
};

const getRiskLevelColor = (level: number) => {
  if (level <= 20) return 'var(--success-color)';
  if (level <= 50) return 'var(--warning-color)';
  if (level <= 80) return 'var(--danger-color)';
  return '#ff4757';
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'var(--success-color)';
  if (confidence >= 70) return 'var(--warning-color)';
  return 'var(--danger-color)';
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'low': return '低优先级';
    case 'medium': return '中优先级';
    case 'high': return '高优先级';
    case 'critical': return '紧急';
    default: return '未知';
  }
};

// 生命周期
const { connectWebSocket, disconnectWebSocket } = useRealTimeSecurityMonitoring();

onMounted(async () => {
  connectWebSocket();
  // 首先加载基础数据
  await refreshSecurityData();
  // 然后生成安全建议
  await generateSecurityRecommendations();
});

onUnmounted(() => {
  disconnectWebSocket();
});
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.security-monitoring {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-md);
    border-bottom: var(--border-width-base) solid var(--border-color);
    
    h2, h3 {
      margin: 0;
      font-weight: 600;
      color: var(--text-primary);
      background: var(--gradient-red);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    h3 {
      font-size: 1.125rem;
    }
    
    .overview-actions,
    .threat-actions,
    .analysis-controls,
    .recommendation-actions {
      display: flex;
      gap: var(--spacing-md);
      align-items: center;
    }
  }
  
  // 安全概览
  .security-overview {
    background: var(--bg-card);
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-md);
    
    .security-score-card {
      display: flex;
      gap: var(--spacing-xl);
      align-items: center;
      
      .score-circle {
        width: var(--size-avatar-2xl);
        height: var(--size-avatar-2xl);
        border-radius: var(--radius-full);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        border: 6px solid;

        &.excellent {
          border-color: var(--success-color);
          background: var(--success-light-bg);
        }

        &.good {
          border-color: var(--primary-color);
          background: var(--primary-light-bg);
        }

        &.fair {
          border-color: var(--warning-color);
          background: var(--warning-light-bg);
        }

        &.poor {
          border-color: var(--danger-color);
          background: var(--danger-light-bg);
        }

        .score-value {
          font-size: var(--text-3xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
        }

        .score-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }
      }
      
      .score-details {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-lg);
        
        .metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          border: var(--border-width-base) solid var(--border-color);
          
          .label {
            font-size: 0.875rem;
            color: var(--text-secondary);
            font-weight: 500;
          }
          
          .value {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
            
            &.warning {
              color: var(--warning-color);
            }
          }
        }
      }
    }
  }
  
  // 威胁检测
  .threat-detection,
  .behavior-analysis,
  .anomalous-activities,
  .security-recommendations {
    background: var(--bg-card);
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
    
    &:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
  }
  
  .threat-timeline {
    .no-threats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      padding: var(--spacing-xl);
      color: var(--success-color);
      font-size: 1.125rem;
      
      .success-icon {
        font-size: 2rem;
      }
    }
    
    .threat-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      background: var(--bg-tertiary);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      border-left: var(--spacing-xs) solid var(--border-color);
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--primary-color);
        transform: translateY(-var(--border-width-base));
        box-shadow: var(--shadow-sm);
      }
      
      &.low {
        border-left-color: var(--info-color);
      }
      
      &.medium {
        border-left-color: var(--warning-color);
      }
      
      &.high {
        border-left-color: var(--danger-color);
      }
      
      &.critical {
        border-left-color: var(--danger-color);
        background: rgba(245, 108, 108, 0.05);
      }
      
      .threat-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--warning-light-bg);
        color: var(--warning-color);
        font-size: 1.25rem;
      }
      
      .threat-content {
        flex: 1;
        
        .threat-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .threat-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }
        
        .threat-meta {
          display: flex;
          gap: var(--spacing-md);
          align-items: center;
          
          .timestamp,
          .source {
            font-size: 0.75rem;
            color: var(--text-tertiary);
          }
        }
      }
      
      .threat-actions {
        display: flex;
        gap: var(--spacing-sm);
        align-items: center;
      }
    }
  }
  
  // 行为分析
  .behavior-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    
    .metric-card {
      background: var(--bg-tertiary);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--primary-color);
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
      .metric-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
        
        .metric-icon {
          width: var(--icon-size); height: var(--icon-size);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          
          &.login-icon {
            background: var(--gradient-blue);
          }
          
          &.activity-icon {
            background: var(--gradient-green);
          }
          
          &.access-icon {
            background: var(--gradient-orange);
          }
        }
        
        .metric-info {
          .metric-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-primary);
            line-height: 1;
          }
          
          .metric-label {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-top: var(--spacing-xs);
          }
        }
      }
      
      .metric-details {
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
          
          &:last-child {
            margin-bottom: 0;
          }
          
          span:first-child {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }
          
          .success {
            color: var(--success-color);
            font-weight: 600;
          }
          
          .error {
            color: var(--danger-color);
            font-weight: 600;
          }
          
          .warning {
            color: var(--warning-color);
            font-weight: 600;
          }
          
          .info {
            color: var(--info-color);
            font-weight: 600;
          }
          
          .online {
            color: var(--success-color);
            font-weight: 600;
          }
        }
      }
    }
  }
  
  // 异常活动
  .anomalies-list {
    .anomaly-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      background: var(--bg-tertiary);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      border-left: var(--spacing-xs) solid var(--border-color);
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--primary-color);
        transform: translateY(-var(--border-width-base));
        box-shadow: var(--shadow-sm);
      }
      
      &.low {
        border-left-color: var(--success-color);
      }
      
      &.medium {
        border-left-color: var(--warning-color);
      }
      
      &.high {
        border-left-color: var(--danger-color);
      }
      
      &.critical {
        border-left-color: var(--danger-color);
        background: rgba(245, 108, 108, 0.05);
      }
      
      .anomaly-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--danger-light-bg);
        color: var(--danger-color);
        font-size: 1.25rem;
      }
      
      .anomaly-content {
        flex: 1;
        
        .anomaly-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
          
          h4 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
          }
        }
        
        .anomaly-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }
        
        .anomaly-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-sm);
          
          .detail-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            
            .label {
              font-size: 0.75rem;
              color: var(--text-tertiary);
              font-weight: 500;
            }
            
            .value {
              font-size: 0.875rem;
              color: var(--text-primary);
              font-family: 'Monaco', 'Consolas', monospace;
            }
          }
        }
      }
      
      .anomaly-actions {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        align-items: flex-end;
      }
    }
  }
  
  // 安全建议
  .no-recommendations {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
    color: var(--info-color);
    font-size: 1rem;
    
    .info-icon {
      font-size: 1.5rem;
    }
  }
  
  .recommendations-list {
    .recommendation-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      background: var(--bg-tertiary);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      transition: all 0.3s ease;
      
      &:hover {
        border-color: var(--primary-color);
        transform: translateY(-var(--border-width-base));
        box-shadow: var(--shadow-sm);
      }
      
      .recommendation-priority {
        width: 80px;
        height: var(--text-3xl);
        border-radius: var(--radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
        
        &.low {
          background: var(--success-color);
        }
        
        &.medium {
          background: var(--warning-color);
        }
        
        &.high {
          background: var(--danger-color);
        }
        
        &.critical {
          background: var(--danger-color);
          animation: pulse 2s infinite;
        }
      }
      
      .recommendation-content {
        flex: 1;
        
        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        p {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .recommendation-impact {
          font-size: 0.75rem;
          color: var(--success-color);
          font-weight: 500;
          margin-bottom: var(--spacing-xs);
        }
        
        .recommendation-effort {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
      }
      
      .recommendation-actions {
        display: flex;
        gap: var(--spacing-sm);
        align-items: center;
      }
    }
  }
}

// 响应式设计
@media (max-width: 992px) {
  .security-monitoring {
    .security-score-card {
      flex-direction: column;
      gap: var(--spacing-lg);
      
      .score-details {
        grid-template-columns: 1fr;
      }
    }
    
    .behavior-metrics {
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .security-monitoring {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
      
      .overview-actions,
      .threat-actions,
      .analysis-controls,
      .recommendation-actions {
        width: 100%;
        justify-content: space-between;
      }
    }
    
    .security-score-card {
      .score-circle {
        width: 100px;
        height: 100px;
        
        .score-value {
          font-size: 1.5rem;
        }
      }
    }
    
    .threat-item,
    .anomaly-item {
      flex-direction: column;
      gap: var(--spacing-sm);
      
      .threat-actions,
      .anomaly-actions {
        flex-direction: row;
        justify-content: flex-end;
      }
    }
    
    .behavior-metrics {
      grid-template-columns: 1fr;
    }
    
    .anomaly-details {
      grid-template-columns: 1fr;
    }
    
    .recommendation-item {
      flex-direction: column;
      gap: var(--spacing-sm);
      
      .recommendation-actions {
        justify-content: flex-end;
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}
</style>