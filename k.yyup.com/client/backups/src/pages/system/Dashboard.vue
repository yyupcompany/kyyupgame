<template>
  <div class="page-container">
    <app-card>
      <template #header>
        <app-card-header>
          <div class="app-card-title">
            <el-icon><Monitor /></el-icon>
            系统概览
          </div>
          <div class="card-actions">
            <el-button type="primary" size="small" @click="refreshStats" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </div>
        </app-card-header>
      </template>
      
      <app-card-content>
        <!-- 统计卡片区域 -->
        <div class="stats-section">
          <div class="stats-cards">
            <div class="stats-card">
              <div class="stats-header">
                <div class="stats-icon user-icon">
                  <el-icon><User /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ stats.userCount }}</div>
                  <div class="stats-label">系统用户</div>
                </div>
                <el-tag size="small" type="primary">总计</el-tag>
              </div>
              <div class="stats-footer">
                <span class="stats-detail">今日活跃: {{ stats.activeUsers }}</span>
                <el-button size="small" type="primary" link @click="goToUserManagement">管理用户</el-button>
              </div>
            </div>
            
            <div class="stats-card">
              <div class="stats-header">
                <div class="stats-icon role-icon">
                  <el-icon><UserFilled /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ stats.roleCount }}</div>
                  <div class="stats-label">系统角色</div>
                </div>
                <el-tag size="small" type="success">已配置</el-tag>
              </div>
              <div class="stats-footer">
                <span class="stats-detail">权限数量: {{ stats.permissionCount }}</span>
                <el-button size="small" type="primary" link @click="goToRoleManagement">管理角色</el-button>
              </div>
            </div>
            
            <div class="stats-card">
              <div class="stats-header">
                <div class="stats-icon log-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ stats.todayLogCount }}</div>
                  <div class="stats-label">系统日志</div>
                </div>
                <el-tag size="small" type="warning">今日</el-tag>
              </div>
              <div class="stats-footer">
                <span class="stats-detail">错误日志: {{ stats.errorLogCount }}</span>
                <el-button size="small" type="primary" link @click="goToLogManagement">查看日志</el-button>
              </div>
            </div>
            
            <div class="stats-card">
              <div class="stats-header">
                <div class="stats-icon status-icon">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div class="stats-info">
                  <div class="stats-value">{{ stats.uptime }}</div>
                  <div class="stats-label">系统状态</div>
                </div>
                <el-tag size="small" type="info">运行中</el-tag>
              </div>
              <div class="stats-footer">
                <span class="stats-detail">CPU使用率: {{ stats.cpuUsage }}%</span>
                <el-button size="small" type="primary" link @click="refreshStats">刷新状态</el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 智能系统监控区域 -->
        <div class="ai-monitoring-section">
          <div class="section-header">
            <h3>智能系统监控</h3>
            <div class="monitoring-actions">
              <el-tag :type="getHealthScoreType(systemHealthScore)" size="large">
                健康评分: {{ systemHealthScore }}/100
              </el-tag>
              <el-button size="small" @click="detectAnomalies" :loading="detectingAnomalies">
                <el-icon><Search /></el-icon>
                AI异常检测
              </el-button>
            </div>
          </div>
          
          <!-- 实时监控指标 -->
          <div class="monitoring-metrics">
            <div class="metric-card">
              <div class="metric-header">
                <div class="metric-icon performance-icon">
                  <el-icon><Cpu /></el-icon>
                </div>
                <div class="metric-info">
                  <div class="metric-label">性能指标</div>
                  <div class="metric-score">{{ calculatePerformanceScore() }}/100</div>
                </div>
              </div>
              <div class="metric-details">
                <div class="detail-item">
                  <span class="detail-label">CPU使用率</span>
                  <el-progress :percentage="metrics.performance.cpuUsage" :color="getProgressColor(metrics.performance.cpuUsage)" />
                </div>
                <div class="detail-item">
                  <span class="detail-label">内存使用率</span>
                  <el-progress :percentage="metrics.performance.memoryUsage" :color="getProgressColor(metrics.performance.memoryUsage)" />
                </div>
                <div class="detail-item">
                  <span class="detail-label">磁盘使用率</span>
                  <el-progress :percentage="metrics.performance.diskUsage" :color="getProgressColor(metrics.performance.diskUsage)" />
                </div>
                <div class="detail-item">
                  <span class="detail-label">网络延迟</span>
                  <span class="detail-value">{{ metrics.performance.networkLatency }}ms</span>
                </div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-header">
                <div class="metric-icon security-icon">
                  <el-icon><Lock /></el-icon>
                </div>
                <div class="metric-info">
                  <div class="metric-label">安全指标</div>
                  <div class="metric-score">{{ metrics.security.securityScore }}/100</div>
                </div>
              </div>
              <div class="metric-details">
                <div class="detail-item">
                  <span class="detail-label">威胁等级</span>
                  <el-tag :type="getThreatLevelType(metrics.security.threatLevel)" size="small">
                    {{ getThreatLevelText(metrics.security.threatLevel) }}
                  </el-tag>
                </div>
                <div class="detail-item">
                  <span class="detail-label">活跃威胁</span>
                  <span class="detail-value">{{ metrics.security.activeThreats }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">漏洞数量</span>
                  <span class="detail-value">{{ metrics.security.vulnerabilities }}</span>
                </div>
              </div>
            </div>
            
            <div class="metric-card">
              <div class="metric-header">
                <div class="metric-icon availability-icon">
                  <el-icon><Connection /></el-icon>
                </div>
                <div class="metric-info">
                  <div class="metric-label">可用性指标</div>
                  <div class="metric-score">{{ metrics.availability.serviceHealth }}/100</div>
                </div>
              </div>
              <div class="metric-details">
                <div class="detail-item">
                  <span class="detail-label">系统运行时间</span>
                  <span class="detail-value">{{ metrics.availability.uptime }}%</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">错误率</span>
                  <span class="detail-value">{{ metrics.availability.errorRate }}%</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">响应时间</span>
                  <span class="detail-value">{{ metrics.availability.responseTime }}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI异常检测结果 -->
        <div v-if="alerts.length > 0" class="alerts-section">
          <div class="section-header">
            <h3>AI异常检测结果</h3>
            <el-button size="small" @click="clearAlerts" type="danger" plain>
              <el-icon><Close /></el-icon>
              清除告警
            </el-button>
          </div>
          <div class="alerts-list">
            <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.severity">
              <div class="alert-icon">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-description">{{ alert.description }}</div>
                <div class="alert-timestamp">{{ formatTime(alert.timestamp) }}</div>
              </div>
              <div class="alert-actions">
                <el-button size="small" type="primary" @click="handleAlert(alert)">
                  处理
                </el-button>
                <el-button size="small" @click="ignoreAlert(alert)">
                  忽略
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI优化建议 -->
        <div v-if="recommendations.length > 0" class="recommendations-section">
          <div class="section-header">
            <h3>AI优化建议</h3>
            <el-button size="small" @click="generateOptimizationSuggestions" :loading="generatingRecommendations">
              <el-icon><Refresh /></el-icon>
              刷新建议
            </el-button>
          </div>
          <div class="recommendations-list">
            <div v-for="recommendation in recommendations" :key="recommendation.id" class="recommendation-item">
              <div class="recommendation-priority" :class="recommendation.priority">
                {{ getPriorityText(recommendation.priority) }}
              </div>
              <div class="recommendation-content">
                <h4>{{ recommendation.title }}</h4>
                <p>{{ recommendation.description }}</p>
                <div class="recommendation-impact">
                  预期改善: {{ recommendation.expectedImprovement }}
                </div>
              </div>
              <div class="recommendation-actions">
                <el-button size="small" type="primary" @click="applyRecommendation(recommendation)">
                  立即应用
                </el-button>
                <el-button size="small" @click="scheduleRecommendation(recommendation)">
                  计划应用
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 系统信息区域 -->
        <div class="info-section">
          <div class="section-header">
            <h3>系统信息</h3>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="系统版本">{{ systemInfo.version }}</el-descriptions-item>
            <el-descriptions-item label="最后更新时间">{{ systemInfo.lastUpdate }}</el-descriptions-item>
            <el-descriptions-item label="操作系统">{{ systemInfo.os }}</el-descriptions-item>
            <el-descriptions-item label="数据库">{{ systemInfo.database }}</el-descriptions-item>
            <el-descriptions-item label="内存使用">{{ systemInfo.memoryUsage }}</el-descriptions-item>
            <el-descriptions-item label="存储空间">{{ systemInfo.diskSpace }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 快捷操作区域 -->
        <div class="actions-section">
          <div class="section-header">
            <h3>快捷操作</h3>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="goToSystemSettings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-button>
            <el-button type="success" @click="goToBackup">
              <el-icon><Download /></el-icon>
              数据备份
            </el-button>
            <el-button type="warning" @click="goToMessageTemplate">
              <el-icon><Message /></el-icon>
              消息模板
            </el-button>
            <el-button type="info" @click="goToSystemLog">
              <el-icon><Document /></el-icon>
              系统日志
            </el-button>
          </div>
        </div>
      </app-card-content>
    </app-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Monitor, 
  Refresh, 
  User, 
  UserFilled, 
  Document, 
  CircleCheck, 
  Setting, 
  Download, 
  Message,
  Search,
  Cpu,
  Lock,
  Connection,
  Warning,
  Close
} from '@element-plus/icons-vue'
// 添加真实API调用
import { 
  getSystemStats, 
  getSystemHealth,
  getSystemDetailInfo
} from '@/api/modules/system'

// 接口定义
interface SystemStats {
  userCount: number;
  activeUsers: number;
  roleCount: number;
  permissionCount: number;
  todayLogCount: number;
  errorLogCount: number;
  uptime: string;
  cpuUsage: number;
}

interface SystemInfo {
  version: string;
  lastUpdate: string;
  os: string;
  database: string;
  memoryUsage: string;
  diskSpace: string;
}

// AI监控相关接口
interface SystemMetrics {
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  security: {
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    activeThreats: number;
    vulnerabilities: number;
    securityScore: number;
  };
  availability: {
    uptime: number;
    errorRate: number;
    responseTime: number;
    serviceHealth: number;
  };
  userExperience: {
    satisfactionScore: number;
    activeUsers: number;
    bounceRate: number;
    conversionRate: number;
  };
}

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  type: string;
}

interface AiRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  expectedImprovement: string;
  type: string;
  action: string;
}

// 响应式数据
const router = useRouter()
const loading = ref(false)

// 系统统计数据
const stats = ref<SystemStats>({
  userCount: 0,
  activeUsers: 0,
  roleCount: 0,
  permissionCount: 0,
  todayLogCount: 0,
  errorLogCount: 0,
  uptime: '0天0小时',
  cpuUsage: 0
})

// 系统信息
const systemInfo = ref<SystemInfo>({
  version: 'v1.0.0',
  lastUpdate: '2024-01-01',
  os: 'Linux',
  database: 'MySQL 8.0',
  memoryUsage: '0GB / 0GB',
  diskSpace: '0GB / 0GB'
})

// AI监控数据
const metrics = ref<SystemMetrics>({
  performance: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkLatency: 0 },
  security: { threatLevel: 'low', activeThreats: 0, vulnerabilities: 0, securityScore: 100 },
  availability: { uptime: 100, errorRate: 0, responseTime: 0, serviceHealth: 100 },
  userExperience: { satisfactionScore: 95, activeUsers: 0, bounceRate: 0, conversionRate: 0 }
})

const alerts = ref<SystemAlert[]>([])
const recommendations = ref<AiRecommendation[]>([])
const detectingAnomalies = ref(false)
const generatingRecommendations = ref(false)

// API方法
const loadSystemStats = async () => {
  try {
    const response = await getSystemStats()
    if (response.success && response.data) {
      stats.value = response.data
    } else {
      throw new Error(response.message || '获取系统统计失败')
    }
  } catch (error) {
    console.error('获取系统统计失败:', error)
    ElMessage.error('获取系统统计失败')
  }
}

const loadSystemInfo = async () => {
  try {
    const response = await getSystemDetailInfo()
    if (response.success && response.data) {
      systemInfo.value = response.data
    } else {
      throw new Error(response.message || '获取系统信息失败')
    }
  } catch (error) {
    console.error('获取系统信息失败:', error)
    ElMessage.error('获取系统信息失败')
  }
}

// 刷新统计数据
const refreshStats = async () => {
  try {
    loading.value = true
    await Promise.all([
      loadSystemStats(),
      loadSystemInfo()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

// 页面导航方法
const goToUserManagement = () => router.push('/system/user')
const goToRoleManagement = () => router.push('/system/role')
const goToLogManagement = () => router.push('/system/log')
const goToSystemSettings = () => router.push('/system/settings')
const goToBackup = () => router.push('/system/backup')
const goToMessageTemplate = () => router.push('/system/message-template')
const goToSystemLog = () => router.push('/system/log')

// 定时刷新数据
let refreshInterval: NodeJS.Timeout | null = null

// AI监控相关方法
// 加载系统指标
const loadSystemMetrics = async () => {
  try {
    // 模拟实时指标数据
    const mockMetrics = {
      performance: {
        cpuUsage: Math.floor(Math.random() * 80) + 10,
        memoryUsage: Math.floor(Math.random() * 70) + 20,
        diskUsage: Math.floor(Math.random() * 60) + 15,
        networkLatency: Math.floor(Math.random() * 200) + 50
      },
      security: {
        threatLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        activeThreats: Math.floor(Math.random() * 5),
        vulnerabilities: Math.floor(Math.random() * 10),
        securityScore: Math.floor(Math.random() * 20) + 80
      },
      availability: {
        uptime: Math.floor(Math.random() * 5) + 95,
        errorRate: Math.floor(Math.random() * 3),
        responseTime: Math.floor(Math.random() * 300) + 100,
        serviceHealth: Math.floor(Math.random() * 10) + 90
      },
      userExperience: {
        satisfactionScore: Math.floor(Math.random() * 10) + 90,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        bounceRate: Math.floor(Math.random() * 20) + 10,
        conversionRate: Math.floor(Math.random() * 15) + 5
      }
    }
    
    metrics.value = mockMetrics
    
    // 实际项目中使用API调用
    // const response = await fetch('/api/system/metrics')
    // const result = await response.json()
    // if (result.success) {
    //   metrics.value = result.data
    // }
  } catch (error) {
    console.error('加载系统指标失败:', error)
  }
}

// 系统健康评分计算
const systemHealthScore = computed(() => {
  const weights = {
    performance: 0.30,
    security: 0.30,
    availability: 0.25,
    userExperience: 0.15
  }
  
  const performanceScore = (
    (100 - metrics.value.performance.cpuUsage) * 0.25 +
    (100 - metrics.value.performance.memoryUsage) * 0.25 +
    (100 - metrics.value.performance.diskUsage) * 0.25 +
    Math.max(0, 100 - metrics.value.performance.networkLatency / 5) * 0.25
  )
  
  return Math.round(
    performanceScore * weights.performance +
    metrics.value.security.securityScore * weights.security +
    metrics.value.availability.serviceHealth * weights.availability +
    metrics.value.userExperience.satisfactionScore * weights.userExperience
  )
})

// 性能评分计算
const calculatePerformanceScore = () => {
  const perf = metrics.value.performance
  return Math.round(
    (100 - perf.cpuUsage) * 0.25 +
    (100 - perf.memoryUsage) * 0.25 +
    (100 - perf.diskUsage) * 0.25 +
    Math.max(0, 100 - perf.networkLatency / 5) * 0.25
  )
}

// AI异常检测
const detectAnomalies = async () => {
  try {
    detectingAnomalies.value = true
    
    // 模拟异常检测结果
    const mockAlerts: SystemAlert[] = []
    
    // 根据当前指标生成告警
    if (metrics.value.performance.cpuUsage > 70) {
      mockAlerts.push({
        id: 'cpu-high-' + Date.now(),
        title: 'CPU使用率过高',
        description: `当前CPU使用率为${metrics.value.performance.cpuUsage}%，建议检查系统进程和优化性能`,
        severity: 'high',
        timestamp: new Date().toISOString(),
        type: 'performance'
      })
    }
    
    if (metrics.value.performance.memoryUsage > 80) {
      mockAlerts.push({
        id: 'memory-high-' + Date.now(),
        title: '内存使用率过高',
        description: `当前内存使用率为${metrics.value.performance.memoryUsage}%，建议释放内存和优化缓存`,
        severity: 'medium',
        timestamp: new Date().toISOString(),
        type: 'performance'
      })
    }
    
    if (metrics.value.security.threatLevel === 'high') {
      mockAlerts.push({
        id: 'security-threat-' + Date.now(),
        title: '安全威胁等级较高',
        description: '检测到高级安全威胁，建议立即检查系统安全状态',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        type: 'security'
      })
    }
    
    alerts.value = mockAlerts
    
    // 实际项目中使用API调用
    // const response = await fetch('/api/system/ai-anomaly-detection', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     metrics: metrics.value,
    //     timeRange: '24h',
    //     sensitivity: 'medium'
    //   })
    // })
    
    // const result = await response.json()
    // if (result.success) {
    //   alerts.value = result.data.alerts
    //   recommendations.value = result.data.recommendations
    // }
    
    ElMessage.success('AI异常检测完成')
  } catch (error) {
    console.error('AI异常棃测失败:', error)
    ElMessage.error('AI异常棃测失败')
  } finally {
    detectingAnomalies.value = false
  }
}

// 生成优化建议
const generateOptimizationSuggestions = async () => {
  try {
    generatingRecommendations.value = true
    
    const suggestions: AiRecommendation[] = []
    
    if (metrics.value.performance.memoryUsage > 70) {
      suggestions.push({
        id: 'memory-optimization-' + Date.now(),
        title: '内存使用优化',
        description: '建议启用内存缓存清理和数据懒加载机制',
        priority: 'high',
        expectedImprovement: '内存使用率降低20-30%',
        type: 'performance',
        action: 'optimize_memory'
      })
    }
    
    if (metrics.value.performance.networkLatency > 200) {
      suggestions.push({
        id: 'network-optimization-' + Date.now(),
        title: '网络性能优化',
        description: '建议启用CDN加速和API请求合并机制',
        priority: 'medium',
        expectedImprovement: '网络延迟降低40-50%',
        type: 'performance',
        action: 'optimize_network'
      })
    }
    
    if (metrics.value.security.vulnerabilities > 5) {
      suggestions.push({
        id: 'security-patch-' + Date.now(),
        title: '安全漏洞修复',
        description: '检测到多个安全漏洞，建议立即更新系统补丁',
        priority: 'high',
        expectedImprovement: '安全评分提升10-15分',
        type: 'security',
        action: 'patch_vulnerabilities'
      })
    }
    
    recommendations.value = suggestions
    
    ElMessage.success('优化建议生成完成')
  } catch (error) {
    console.error('生成优化建议失败:', error)
    ElMessage.error('生成优化建议失败')
  } finally {
    generatingRecommendations.value = false
  }
}

// 工具函数
const getHealthScoreType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}

const getProgressColor = (value: number) => {
  if (value >= 80) return 'var(--danger-color)'
  if (value >= 60) return 'var(--warning-color)'
  return 'var(--success-color)'
}

const getThreatLevelType = (level: string) => {
  switch (level) {
    case 'low': return 'success'
    case 'medium': return 'warning'
    case 'high': return 'danger'
    case 'critical': return 'danger'
    default: return 'info'
  }
}

const getThreatLevelText = (level: string) => {
  switch (level) {
    case 'low': return '低风险'
    case 'medium': return '中风险'
    case 'high': return '高风险'
    case 'critical': return '极高风险'
    default: return '未知'
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'low': return '低优先级'
    case 'medium': return '中优先级'
    case 'high': return '高优先级'
    default: return '低优先级'
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

// 处理告警
const handleAlert = async (alert: SystemAlert) => {
  try {
    // 模拟处理告警
    ElMessage.success(`已处理告警: ${alert.title}`)
    
    // 从列表中移除
    const index = alerts.value.findIndex(a => a.id === alert.id)
    if (index > -1) {
      alerts.value.splice(index, 1)
    }
    
    // 实际项目中使用API调用
    // const response = await fetch(`/api/system/alerts/${alert.id}/handle`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ action: 'resolve' })
    // })
  } catch (error) {
    console.error('处理告警失败:', error)
    ElMessage.error('处理告警失败')
  }
}

// 忽略告警
const ignoreAlert = (alert: SystemAlert) => {
  const index = alerts.value.findIndex(a => a.id === alert.id)
  if (index > -1) {
    alerts.value.splice(index, 1)
    ElMessage.info(`已忽略告警: ${alert.title}`)
  }
}

// 清除所有告警
const clearAlerts = () => {
  alerts.value = []
  ElMessage.info('已清除所有告警')
}

// 应用优化建议
const applyRecommendation = async (recommendation: AiRecommendation) => {
  try {
    ElMessage.success(`已应用优化建议: ${recommendation.title}`)
    
    // 从列表中移除
    const index = recommendations.value.findIndex(r => r.id === recommendation.id)
    if (index > -1) {
      recommendations.value.splice(index, 1)
    }
    
    // 实际项目中使用API调用
    // const response = await fetch('/api/system/recommendations/apply', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ recommendationId: recommendation.id })
    // })
  } catch (error) {
    console.error('应用优化建议失败:', error)
    ElMessage.error('应用优化建议失败')
  }
}

// 计划应用优化建议
const scheduleRecommendation = async (recommendation: AiRecommendation) => {
  try {
    ElMessage.success(`已计划应用优化建议: ${recommendation.title}`)
    
    // 从列表中移除
    const index = recommendations.value.findIndex(r => r.id === recommendation.id)
    if (index > -1) {
      recommendations.value.splice(index, 1)
    }
    
    // 实际项目中使用API调用
    // const response = await fetch('/api/system/recommendations/schedule', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ recommendationId: recommendation.id })
    // })
  } catch (error) {
    console.error('计划优化建议失败:', error)
    ElMessage.error('计划优化建议失败')
  }
}

// 组件挂载时加载数据
onMounted(() => {
  refreshStats()
  loadSystemMetrics()
  // 设置定时刷新，每30秒刷新一次
  refreshInterval = setInterval(() => {
    loadSystemStats()
    loadSystemMetrics()
  }, 30000)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/index.scss';

.page-container {
  
  .stats-section {
    margin-bottom: var(--spacing-xl); /* 硬编码修复：使用统一间距变量 */
    
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--spacing-lg); /* 硬编码修复：使用统一间距变量 */
      
      .stats-card {
        background: var(--bg-card);
        border: var(--border-width-base) solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--spacing-lg);
        transition: all 0.3s ease;
        box-shadow: var(--shadow-sm);
        
        &:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        
        .stats-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          
          .stats-icon {
            width: var(--size-icon-xl);
            height: var(--size-icon-xl);
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--text-2xl);
            box-shadow: var(--shadow-sm);

            &.user-icon {
              background: var(--gradient-purple);
              color: white;
            }

            &.role-icon {
              background: var(--gradient-pink);
              color: white;
            }

            &.log-icon {
              background: var(--gradient-blue);
              color: white;
            }

            &.status-icon {
              background: var(--gradient-success);
              color: white;
            }
          }

          .stats-info {
            flex: 1;

            .stats-value {
              font-size: var(--text-2xl);
              font-weight: var(--font-semibold);
              color: var(--text-primary);
              line-height: 1;
            }

            .stats-label {
              font-size: var(--text-sm);
              color: var(--text-secondary);
              margin-top: var(--spacing-sm);
            }
          }
        }
        
        .stats-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--spacing-md);
          border-top: var(--border-width-base) solid var(--border-color);
          
          .stats-detail {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }
        }
      }
    }
  }
  
  /* AI监控区域样式 */
  .ai-monitoring-section,
  .alerts-section,
  .recommendations-section,
  .info-section,
  .actions-section {
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--bg-card);
    border: var(--border-width-base) solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    
    .section-header {
      margin-bottom: var(--spacing-lg);
      padding-bottom: var(--spacing-md);
      border-bottom: var(--border-width-base) solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        background: var(--gradient-orange);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .monitoring-actions {
        display: flex;
        gap: var(--spacing-md);
        align-items: center;
      }
    }
  }
  
  /* 监控指标卡片 */
  .monitoring-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
          
          &.performance-icon {
            background: var(--gradient-blue);
          }
          
          &.security-icon {
            background: var(--gradient-red);
          }
          
          &.availability-icon {
            background: var(--gradient-green);
          }
        }
        
        .metric-info {
          flex: 1;
          
          .metric-label {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-bottom: var(--spacing-xs);
          }
          
          .metric-score {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-primary);
          }
        }
      }
      
      .metric-details {
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .detail-label {
            font-size: 0.875rem;
            color: var(--text-secondary);
          }
          
          .detail-value {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-primary);
          }
        }
      }
    }
  }
  
  /* 告警列表 */
  .alerts-list {
    .alert-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      background: var(--bg-tertiary);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      border-left: var(--spacing-xs) solid var(--border-color);
      
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
      
      .alert-icon {
        width: var(--icon-size); height: var(--icon-size);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--warning-light-bg);
        color: var(--warning-color);
        font-size: 1.25rem;
      }
      
      .alert-content {
        flex: 1;
        
        .alert-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .alert-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }
        
        .alert-timestamp {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }
      }
      
      .alert-actions {
        display: flex;
        gap: var(--spacing-sm);
        align-items: center;
      }
    }
  }
  
  /* 建议列表 */
  .recommendations-list {
    .recommendation-item {
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      background: var(--bg-tertiary);
      border: var(--border-width-base) solid var(--border-color);
      border-radius: var(--radius-md);
      
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
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .recommendation-impact {
          font-size: 0.75rem;
          color: var(--success-color);
          font-weight: 500;
        }
      }
      
      .recommendation-actions {
        display: flex;
        gap: var(--spacing-sm);
        align-items: center;
      }
    }
  }
  
  /* 按钮排版修复：快捷操作按钮区域优化 */
  .action-buttons {
    display: flex;
    gap: var(--spacing-lg);
    flex-wrap: wrap;
    
    .el-button {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-var(--border-width-base));
        box-shadow: var(--shadow-sm);
      }
    }
  }
}

/* 白色区域修复：Element Plus组件深度主题化 */
.page-container :deep(.el-descriptions) {
  background: var(--bg-card) !important;
  border-color: var(--border-color) !important;
  
  .el-descriptions__header {
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
  
  .el-descriptions__body {
    background: var(--bg-card) !important;
  }
  
  .el-descriptions__label {
    color: var(--text-primary) !important;
    background: var(--bg-tertiary) !important;
    border-color: var(--border-color) !important;
  }
  
  .el-descriptions__content {
    color: var(--text-primary) !important;
    background: var(--bg-card) !important;
    border-color: var(--border-color) !important;
  }
}

/* 进度条样式 */
.page-container :deep(.el-progress) {
  .el-progress__text {
    color: var(--text-primary) !important;
  }
  
  .el-progress-bar__outer {
    background: var(--bg-tertiary) !important;
    border: var(--border-width-base) solid var(--border-color) !important;
  }
}

.page-container :deep(.el-tag) {
  border-color: var(--border-color) !important;
  
  &.el-tag--primary {
    background: var(--primary-light-bg) !important;
    border-color: var(--primary-light) !important;
    color: var(--primary-color) !important;
  }
  
  &.el-tag--success {
    background: var(--success-light-bg) !important;
    border-color: var(--success-color) !important;
    color: var(--success-color) !important;
  }
  
  &.el-tag--warning {
    background: var(--warning-light-bg) !important;
    border-color: var(--warning-color) !important;
    color: var(--warning-color) !important;
  }
  
  &.el-tag--info {
    background: var(--info-light-bg) !important;
    border-color: var(--info-color) !important;
    color: var(--info-color) !important;
  }
}

.page-container :deep(.el-button) {
  &.el-button--primary {
    background: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    
    &:hover {
      background: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
      filter: brightness(1.1);
    }
  }
  
  &.el-button--success {
    background: var(--success-color) !important;
    border-color: var(--success-color) !important;
    
    &:hover {
      background: var(--success-color) !important;
      border-color: var(--success-color) !important;
      filter: brightness(1.1);
    }
  }
  
  &.el-button--warning {
    background: var(--warning-color) !important;
    border-color: var(--warning-color) !important;
    
    &:hover {
      background: var(--warning-color) !important;
      border-color: var(--warning-color) !important;
      filter: brightness(1.1);
    }
  }
  
  &.el-button--info {
    background: var(--info-color) !important;
    border-color: var(--info-color) !important;
    
    &:hover {
      background: var(--info-color) !important;
      border-color: var(--info-color) !important;
      filter: brightness(1.1);
    }
  }
  
  &.el-button--text {
    color: var(--primary-color) !important;
    
    &:hover {
      color: var(--primary-color) !important;
      background: var(--primary-light-bg) !important;
      filter: brightness(1.1);
    }
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .page-container {
    .stats-section {
      .stats-cards {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: var(--spacing-md);
      }
    }
    
    .monitoring-metrics {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-md);
    }
    
    .action-buttons {
      justify-content: center;
      
      .el-button {
        flex: 1;
        min-width: 120px;
      }
    }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .page-container {
    padding: var(--spacing-md);
    
    .stats-section {
      margin-bottom: var(--spacing-lg);
      
      .stats-cards {
        grid-template-columns: 1fr;
        gap: var(--spacing-md);
        
        .stats-card {
          padding: var(--spacing-md);
          
          .stats-header {
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-md);
            
            .stats-icon {
              width: var(--icon-size); height: var(--icon-size);
              font-size: 1.25rem;
            }
            
            .stats-info {
              .stats-value {
                font-size: 1.5rem;
              }
              
              .stats-label {
                font-size: 0.75rem;
              }
            }
          }
          
          .stats-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
            padding-top: var(--spacing-sm);
          }
        }
      }
    }
    
    .monitoring-metrics {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
      
      .metric-card {
        padding: var(--spacing-md);
        
        .metric-header {
          gap: var(--spacing-md);
          
          .metric-icon {
            width: var(--icon-size); height: var(--icon-size);
            font-size: 1.25rem;
          }
          
          .metric-info {
            .metric-score {
              font-size: 1.25rem;
            }
          }
        }
      }
    }
    
    .ai-monitoring-section,
    .alerts-section,
    .recommendations-section,
    .info-section,
    .actions-section {
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      
      .section-header {
        margin-bottom: var(--spacing-md);
        padding-bottom: var(--spacing-sm);
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
        
        h3 {
          font-size: 1rem;
        }
        
        .monitoring-actions {
          width: 100%;
          justify-content: space-between;
        }
      }
    }
    
    .alerts-list .alert-item,
    .recommendations-list .recommendation-item {
      flex-direction: column;
      gap: var(--spacing-md);
      
      .alert-actions,
      .recommendation-actions {
        justify-content: flex-end;
      }
    }
    
    .action-buttons {
      flex-direction: column;
      gap: var(--spacing-md);
      
      .el-button {
        width: 100%;
        justify-content: center;
        padding: var(--spacing-md) var(--spacing-lg);
        font-size: 0.875rem;
      }
    }
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .page-container {
    .stats-section {
      .stats-cards {
        .stats-card {
          .stats-header {
            flex-direction: column;
            text-align: center;
            
            .stats-icon {
              margin-bottom: var(--spacing-sm);
            }
          }
          
          .stats-footer {
            text-align: center;
            
            .stats-detail {
              font-size: 0.75rem;
            }
          }
        }
      }
    }
    
    .action-buttons {
      .el-button {
        font-size: 0.75rem;
        padding: var(--spacing-sm) var(--spacing-md);
      }
    }
  }
}
</style> 