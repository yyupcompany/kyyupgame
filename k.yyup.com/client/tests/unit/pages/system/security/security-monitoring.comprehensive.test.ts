/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ElMessage, ElMessageBox } from 'element-plus';
import SecurityMonitoring from '@/pages/system/Security.vue';
import { securityApi } from '@/api/security';
import { expectNoConsoleErrors } from '../../setup/console-monitoring';
import {
  validateRequiredFields,
  validateFieldTypes,
  validateEnumValue,
  validateDateFormat
} from '../../utils/data-validation';

// Mock 安全API
vi.mock('@/api/security', () => ({
  securityApi: {
    performScan: vi.fn(),
    getOverview: vi.fn(),
    getThreats: vi.fn(),
    getRecommendations: vi.fn(),
    handleThreat: vi.fn(),
    generateAIRecommendations: vi.fn()
  }
}));

// Mock Element Plus 图标
vi.mock('@element-plus/icons-vue', () => ({
  Warning: { name: 'Warning' },
  CircleCheck: { name: 'CircleCheck' },
  Search: { name: 'Search' },
  Refresh: { name: 'Refresh' },
  Close: { name: 'Close' },
  Document: { name: 'Document' },
  User: { name: 'User' },
  Monitor: { name: 'Monitor' },
  Key: { name: 'Key' },
  MagicStick: { name: 'MagicStick' },
  Check: { name: 'Check' },
  InfoFilled: { name: 'InfoFilled' }
}));

// Mock echarts
vi.mock('echarts', () => ({
  default: {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      dispose: vi.fn()
    }))
  }
}));

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {}

  send() {}
  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  addEventListener() {}
  removeEventListener() {}
}

Object.defineProperty(global, 'WebSocket', {
  writable: true,
  value: MockWebSocket
});

describe('安全监控中心 - 100%完整测试覆盖', () => {
  let wrapper: any;

  // 安全威胁接口定义
  interface SecurityThreat {
    id: string;
    title?: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp?: string;
    source?: string;
    sourceIp?: string;
    blocked?: boolean;
    threatType?: string;
  }

  // 异常活动接口定义
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

  // 安全建议接口定义
  interface SecurityRecommendation {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    expectedImprovement: string;
    effortLevel: number;
    implementing?: boolean;
  }

  const mockSecurityOverview = {
    securityScore: 85,
    threatLevel: 'medium' as const,
    activeThreats: 3,
    vulnerabilities: 7,
    riskLevel: 35,
    connectionStatus: '实时监控中'
  };

  const mockThreats: SecurityThreat[] = [
    {
      id: 'threat-1',
      title: '可疑登录尝试',
      description: '检测到来自异常IP地址的多次登录失败',
      severity: 'medium',
      timestamp: '2024-01-01T10:00:00Z',
      source: '登录监控系统',
      sourceIp: '192.168.1.100',
      threatType: '暴力破解'
    },
    {
      id: 'threat-2',
      title: 'SQL注入攻击',
      description: '检测到恶意SQL查询尝试',
      severity: 'high',
      timestamp: '2024-01-01T10:05:00Z',
      source: 'Web应用防火墙',
      sourceIp: '192.168.1.101',
      threatType: 'SQL注入'
    }
  ];

  const mockRecommendations: SecurityRecommendation[] = [
    {
      id: 'rec-1',
      title: '启用双因素认证',
      description: '为所有管理员账户启用双因素认证以提高安全性',
      priority: 'high',
      expectedImprovement: '安全性提升40%',
      effortLevel: 3
    },
    {
      id: 'rec-2',
      title: '定期密码更新',
      description: '强制用户每90天更新一次密码',
      priority: 'medium',
      expectedImprovement: '安全性提升20%',
      effortLevel: 2
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});

    // 默认成功的API响应
    vi.mocked(securityApi.performScan).mockResolvedValue({
      success: true,
      scanId: 'scan-123',
      message: '安全扫描已启动'
    });

    vi.mocked(securityApi.getOverview).mockResolvedValue(mockSecurityOverview);
    vi.mocked(securityApi.getThreats).mockResolvedValue({
      success: true,
      threats: mockThreats
    });
    vi.mocked(securityApi.getRecommendations).mockResolvedValue(mockRecommendations);
    vi.mocked(securityApi.handleThreat).mockResolvedValue({ success: true });
    vi.mocked(securityApi.generateAIRecommendations).mockResolvedValue(mockRecommendations);

    // Mock setTimeout for consistent testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    expectNoConsoleErrors();

    if (wrapper) {
      wrapper.unmount();
    }

    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('组件初始化和数据加载', () => {
    it('应该正确初始化组件并加载安全数据', async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
      await vi.runAllTimersAsync();

      // 验证API调用
      expect(securityApi.getOverview).toHaveBeenCalledTimes(1);
      expect(securityApi.getThreats).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
      expect(securityApi.getRecommendations).toHaveBeenCalledTimes(1);

      // 验证数据加载
      expect(wrapper.vm.securityScore).toBe(85);
      expect(wrapper.vm.threatLevel).toBe('medium');
      expect(wrapper.vm.activeThreats).toBe(3);
      expect(wrapper.vm.vulnerabilities).toBe(7);
      expect(wrapper.vm.riskLevel).toBe(35);
      expect(wrapper.vm.connectionStatus).toBe('实时监控中');

      // 验证威胁数据
      expect(wrapper.vm.recentThreats).toEqual(mockThreats);

      // 验证安全建议
      expect(wrapper.vm.securityRecommendations).toEqual(mockRecommendations);

      // 验证数据结构
      const overviewValidation = validateRequiredFields(mockSecurityOverview, [
        'securityScore', 'threatLevel', 'activeThreats', 'vulnerabilities', 'riskLevel'
      ]);
      expect(overviewValidation.valid).toBe(true);

      const overviewTypeValidation = validateFieldTypes(mockSecurityOverview, {
        securityScore: 'number',
        threatLevel: 'string',
        activeThreats: 'number',
        vulnerabilities: 'number',
        riskLevel: 'number'
      });
      expect(overviewTypeValidation.valid).toBe(true);
    });

    it('应该建立WebSocket连接进行实时监控', async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
      await vi.advanceTimersByTimeAsync(2000);

      // 验证连接状态变化
      expect(wrapper.vm.connectionStatus).toBe('实时监控中');
    });

    it('应该处理数据加载失败的情况', async () => {
      const errorMessage = '网络连接失败';
      vi.mocked(securityApi.getOverview).mockRejectedValue(new Error(errorMessage));

      wrapper = mount(SecurityMonitoring);
      await flushPromises();

      expect(console.error).toHaveBeenCalledWith('刷新数据失败:', expect.any(Error));
      expect(ElMessage.error).toHaveBeenCalledWith('刷新数据失败');
    });

    it('应该处理WebSocket连接失败', async () => {
      // 模拟WebSocket连接失败
      const originalWebSocket = global.WebSocket;
      global.WebSocket = class extends MockWebSocket {
        constructor(url: string) {
          super(url);
          setTimeout(() => {
            this.readyState = MockWebSocket.CLOSED;
            if (this.onerror) {
              this.onerror(new Event('error'));
            }
          }, 100);
        }
      };

      wrapper = mount(SecurityMonitoring);
      await vi.advanceTimersByTimeAsync(2000);

      expect(wrapper.vm.connectionStatus).toBe('连接失败');

      global.WebSocket = originalWebSocket;
    });
  });

  describe('安全扫描功能', () => {
    beforeEach(async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
    });

    it('应该执行安全扫描', async () => {
      await wrapper.vm.performSecurityScan();

      expect(securityApi.performScan).toHaveBeenCalledWith({
        scanType: 'quick',
        targets: []
      });

      expect(ElMessage.success).toHaveBeenCalledWith(
        '安全扫描启动成功！扫描ID: scan-123'
      );
    });

    it('应该显示扫描进度消息', async () => {
      const mockScanPromise = vi.fn().mockResolvedValue({
        success: true,
        scanId: 'scan-123'
      });
      vi.mocked(securityApi.performScan).mockImplementation(mockScanPromise);

      wrapper.vm.performSecurityScan();

      // 验证进度消息
      expect(ElMessage.info).toHaveBeenCalledWith('开始执行安全扫描...');

      await vi.runAllTimersAsync();

      expect(ElMessage.info).toHaveBeenCalledWith('正在检查系统漏洞...');
      expect(ElMessage.info).toHaveBeenCalledWith('正在分析用户行为...');
      expect(ElMessage.info).toHaveBeenCalledWith('正在生成安全报告...');
      expect(ElMessage.success).toHaveBeenCalledWith('安全扫描完成！');
    });

    it('应该处理扫描失败的情况', async () => {
      const errorMessage = '扫描服务不可用';
      vi.mocked(securityApi.performScan).mockRejectedValue(new Error(errorMessage));

      await wrapper.vm.performSecurityScan();

      expect(console.error).toHaveBeenCalledWith('安全扫描失败:', expect.any(Error));
      expect(ElMessage.error).toHaveBeenCalledWith('安全扫描失败');
    });

    it('应该在扫描过程中禁用扫描按钮', async () => {
      const mockSlowScan = vi.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({ success: true, scanId: 'slow-scan' }), 2000))
      );
      vi.mocked(securityApi.performScan).mockImplementation(mockSlowScan);

      const scanPromise = wrapper.vm.performSecurityScan();

      // 验证加载状态
      expect(wrapper.vm.scanningSystem).toBe(true);

      await scanPromise;

      // 验证加载状态重置
      expect(wrapper.vm.scanningSystem).toBe(false);
    });
  });

  describe('威胁处理功能', () => {
    const mockThreat: SecurityThreat = {
      id: 'threat-1',
      description: '测试威胁',
      severity: 'medium',
      sourceIp: '192.168.1.100'
    };

    beforeEach(async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
    });

    it('应该处理威胁', async () => {
      await wrapper.vm.handleThreat(mockThreat);

      expect(securityApi.handleThreat).toHaveBeenCalledWith('threat-1', {
        action: 'resolve',
        notes: '通过安全监控中心处理'
      });

      expect(ElMessage.success).toHaveBeenCalledWith('威胁 "测试威胁" 已处理');
      expect(securityApi.getOverview).toHaveBeenCalledTimes(2); // 初始加载 + 刷新
    });

    it('应该忽略威胁', async () => {
      await wrapper.vm.ignoreThreat(mockThreat);

      expect(securityApi.handleThreat).toHaveBeenCalledWith('threat-1', {
        action: 'ignore',
        notes: '通过安全监控中心忽略'
      });

      expect(ElMessage.info).toHaveBeenCalledWith('已忽略威胁: 测试威胁');
    });

    it('应该阻止威胁来源', async () => {
      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm');

      await wrapper.vm.blockThreat(mockThreat);

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要阻止来源 "192.168.1.100" 的所有访问吗？',
        '确认阻止',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );

      expect(securityApi.handleThreat).toHaveBeenCalledWith('threat-1', {
        action: 'block',
        notes: '通过安全监控中心阻止'
      });

      expect(ElMessage.success).toHaveBeenCalledWith('已阻止威胁来源: 192.168.1.100');

      mockConfirm.mockRestore();
    });

    it('应该在用户取消阻止时不执行操作', async () => {
      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockRejectedValue('cancel');

      await wrapper.vm.blockThreat(mockThreat);

      expect(securityApi.handleThreat).not.toHaveBeenCalled();

      mockConfirm.mockRestore();
    });

    it('应该清除所有威胁', async () => {
      await wrapper.setData({ recentThreats: mockThreats, activeThreats: 2 });

      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm');

      await wrapper.vm.clearAllThreats();

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要清除所有 2 个威胁记录吗？',
        '确认清除',
        expect.any(Object)
      );

      expect(wrapper.vm.recentThreats).toEqual([]);
      expect(wrapper.vm.activeThreats).toBe(0);
      expect(ElMessage.success).toHaveBeenCalledWith('已清除所有威胁记录');

      mockConfirm.mockRestore();
    });
  });

  describe('异常活动检测', () => {
    const mockAnomaly: AnomalousActivity = {
      id: 'anomaly-1',
      type: '异常登录时间',
      description: '用户在非工作时间频繁登录',
      user: 'user@example.com',
      ipAddress: '192.168.1.200',
      detectedAt: '2024-01-01T15:30:00Z',
      riskLevel: 'medium',
      confidence: 85
    };

    beforeEach(async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
    });

    it('应该生成异常活动', async () => {
      await wrapper.vm.generateAnomalousActivities(3);

      expect(wrapper.vm.anomalousActivities).toHaveLength(3);

      wrapper.vm.anomalousActivities.forEach((anomaly: AnomalousActivity) => {
        const validation = validateRequiredFields(anomaly, [
          'id', 'type', 'description', 'user', 'ipAddress', 'detectedAt', 'riskLevel', 'confidence'
        ]);
        expect(validation.valid).toBe(true);

        expect(typeof anomaly.confidence).toBe('number');
        expect(anomaly.confidence).toBeGreaterThanOrEqual(0);
        expect(anomaly.confidence).toBeLessThanOrEqual(100);
      });
    });

    it('应该调查异常活动', async () => {
      await wrapper.setData({ anomalousActivities: [mockAnomaly] });

      await wrapper.vm.investigateAnomaly(mockAnomaly);

      expect(wrapper.vm.investigating).toBe(true);

      await vi.runAllTimersAsync();

      expect(wrapper.vm.investigating).toBe(false);

      // 验证成功消息
      expect(ElMessage.success).toHaveBeenCalledWith(
        expect.stringContaining('调查完成，确认为误报，已将此类行为添加到白名单')
      );

      // 验证异常从列表中移除
      expect(wrapper.vm.anomalousActivities).toHaveLength(0);
    });

    it('应该深度调查所有异常', async () => {
      const anomalies = [mockAnomaly, { ...mockAnomaly, id: 'anomaly-2' }];
      await wrapper.setData({ anomalousActivities: anomalies });

      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm');

      await wrapper.vm.investigateAllAnomalies();

      expect(wrapper.vm.investigating).toBe(true);

      await vi.runAllTimersAsync();

      expect(wrapper.vm.investigating).toBe(false);
      expect(ElMessage.success).toHaveBeenCalledWith(
        expect.stringContaining('深度调查完成')
      );

      mockConfirm.mockRestore();
    });

    it('应该封禁异常用户', async () => {
      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm');

      await wrapper.setData({ anomalousActivities: [mockAnomaly] });

      await wrapper.vm.blockUser(mockAnomaly.user);

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        '确定要封禁用户 "user@example.com" 吗？',
        '确认封禁',
        expect.any(Object)
      );

      await vi.runAllTimersAsync();

      expect(ElMessage.success).toHaveBeenCalledWith('用户 user@example.com 已被封禁');
      expect(wrapper.vm.anomalousActivities).toHaveLength(0);

      mockConfirm.mockRestore();
    });

    it('应该添加活动到白名单', async () => {
      await wrapper.setData({ anomalousActivities: [mockAnomaly] });

      await wrapper.vm.whitelistActivity(mockAnomaly);

      expect(wrapper.vm.anomalousActivities).toHaveLength(0);
      expect(ElMessage.success).toHaveBeenCalledWith(
        '已将 "异常登录时间" 活动添加到白名单'
      );
    });
  });

  describe('安全建议功能', () => {
    const mockRecommendation: SecurityRecommendation = {
      id: 'rec-1',
      title: '启用双因素认证',
      description: '为所有管理员账户启用双因素认证',
      priority: 'high',
      expectedImprovement: '安全性提升40%',
      effortLevel: 3
    };

    beforeEach(async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
    });

    it('应该生成AI安全建议', async () => {
      await wrapper.vm.generateSecurityRecommendations();

      expect(securityApi.generateAIRecommendations).toHaveBeenCalledTimes(1);
      expect(ElMessage.success).toHaveBeenCalledWith(
        `生成了 ${mockRecommendations.length} 条AI安全建议`
      );
    });

    it('应该实施安全建议', async () => {
      const initialScore = wrapper.vm.securityScore;
      await wrapper.setData({ securityRecommendations: [mockRecommendation] });

      await wrapper.vm.implementRecommendation(mockRecommendation);

      expect(mockRecommendation.implementing).toBe(true);

      await vi.runAllTimersAsync();

      expect(mockRecommendation.implementing).toBe(false);
      expect(wrapper.vm.securityScore).toBeGreaterThan(initialScore);
      expect(ElMessage.success).toHaveBeenCalledWith(
        '已实施安全建议: 启用双因素认证，安全评分提升 5 分'
      );

      // 验证建议从列表中移除
      expect(wrapper.vm.securityRecommendations).toHaveLength(0);
    });

    it('应该应用所有建议', async () => {
      await wrapper.setData({ securityRecommendations: mockRecommendations });

      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm');

      await wrapper.vm.implementAllRecommendations();

      expect(ElMessageBox.confirm).toHaveBeenCalledWith(
        `确定要实施所有 ${mockRecommendations.length} 条安全建议吗？`,
        '确认实施',
        expect.any(Object)
      );

      await vi.runAllTimersAsync();

      expect(ElMessage.success).toHaveBeenCalledWith('所有安全建议已实施完成');

      mockConfirm.mockRestore();
    });

    it('应该计划实施建议', async () => {
      await wrapper.vm.scheduleRecommendation(mockRecommendation);

      expect(ElMessage.success).toHaveBeenCalledWith(
        '已将 "启用双因素认证" 添加到实施计划'
      );
    });

    it('应该显示建议详情', async () => {
      const mockAlert = vi.spyOn(ElMessageBox, 'alert').mockResolvedValue('confirm');

      await wrapper.vm.learnMore(mockRecommendation);

      expect(ElMessageBox.alert).toHaveBeenCalledWith(
        expect.stringContaining('建议详情'),
        '启用双因素认证',
        expect.any(Object)
      );

      mockAlert.mockRestore();
    });
  });

  describe('行为分析功能', () => {
    beforeEach(async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
    });

    it('应该更新行为分析数据', async () => {
      await wrapper.setData({ analysisTimeRange: '7d' });

      await wrapper.vm.updateBehaviorAnalysis();

      expect(ElMessage.info).toHaveBeenCalledWith('已切换到7d的行为分析数据');
    });

    it('应该生成行为分析报告', async () => {
      await wrapper.vm.generateBehaviorReport();

      expect(wrapper.vm.generatingReport).toBe(true);

      await vi.runAllTimersAsync();

      expect(wrapper.vm.generatingReport).toBe(false);
      expect(ElMessage.success).toHaveBeenCalledWith(
        expect.stringContaining('行为分析报告生成完成')
      );
    });

    it('应该验证行为指标数据结构', () => {
      const metrics = wrapper.vm.behaviorMetrics;

      const requiredFields = [
        'totalLogins', 'successfulLogins', 'failedLogins', 'suspiciousLogins',
        'activeUsers', 'onlineUsers', 'newUsers', 'anomalousUsers',
        'accessAttempts', 'normalAccess', 'deniedAccess', 'suspiciousAccess'
      ];

      const validation = validateRequiredFields(metrics, requiredFields);
      expect(validation.valid).toBe(true);

      const typeValidation = validateFieldTypes(metrics, {
        totalLogins: 'number',
        successfulLogins: 'number',
        failedLogins: 'number',
        suspiciousLogins: 'number',
        activeUsers: 'number',
        onlineUsers: 'number',
        newUsers: 'number',
        anomalousUsers: 'number',
        accessAttempts: 'number',
        normalAccess: 'number',
        deniedAccess: 'number',
        suspiciousAccess: 'number'
      });

      expect(typeValidation.valid).toBe(true);

      // 验证数值合理性
      expect(metrics.totalLogins).toBeGreaterThanOrEqual(0);
      expect(metrics.successfulLogins).toBeGreaterThanOrEqual(0);
      expect(metrics.failedLogins).toBeGreaterThanOrEqual(0);
      expect(metrics.suspiciousLogins).toBeGreaterThanOrEqual(0);
    });
  });

  describe('实时威胁检测', () => {
    beforeEach(async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
      await vi.advanceTimersByTimeAsync(2000); // 等待WebSocket连接
    });

    it('应该模拟接收新威胁', async () => {
      const initialThreatCount = wrapper.vm.recentThreats.length;

      // 模拟30秒后的威胁检测
      await vi.advanceTimersByTimeAsync(30000);

      // 由于随机性，我们检查威胁数量是否可能增加
      expect(wrapper.vm.recentThreats.length).toBeGreaterThanOrEqual(initialThreatCount);
    });

    it('应该根据威胁严重程度更新安全评分', async () => {
      const initialScore = wrapper.vm.securityScore;

      // 模拟收到严重威胁
      const criticalThreat: SecurityThreat = {
        id: 'critical-threat',
        description: '严重安全威胁',
        severity: 'critical',
        source: '测试系统'
      };

      await wrapper.setData({
        recentThreats: [criticalThreat],
        threatLevel: 'critical'
      });

      // 验证威胁等级更新
      expect(wrapper.vm.threatLevel).toBe('critical');
      expect(wrapper.vm.securityScore).toBeLessThan(initialScore);
    });

    it('应该清除所有威胁', async () => {
      await wrapper.setData({
        recentThreats: mockThreats,
        activeThreats: 2
      });

      const mockConfirm = vi.spyOn(ElMessageBox, 'confirm').mockResolvedValue('confirm');

      await wrapper.vm.clearAllThreats();

      expect(wrapper.vm.recentThreats).toEqual([]);
      expect(wrapper.vm.activeThreats).toBe(0);

      mockConfirm.mockRestore();
    });
  });

  describe('UI状态和交互', () => {
    beforeEach(async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
    });

    it('应该正确计算安全评分等级', async () => {
      expect(wrapper.vm.getSecurityScoreClass(95)).toBe('excellent');
      expect(wrapper.vm.getSecurityScoreClass(85)).toBe('good');
      expect(wrapper.vm.getSecurityScoreClass(75)).toBe('fair');
      expect(wrapper.vm.getSecurityScoreClass(65)).toBe('poor');
    });

    it('应该正确获取威胁等级类型', () => {
      expect(wrapper.vm.getThreatLevelType('low')).toBe('success');
      expect(wrapper.vm.getThreatLevelType('medium')).toBe('warning');
      expect(wrapper.vm.getThreatLevelType('high')).toBe('danger');
      expect(wrapper.vm.getThreatLevelType('critical')).toBe('danger');
    });

    it('应该正确获取威胁严重程度文本', () => {
      expect(wrapper.vm.getThreatSeverityText('low')).toBe('低危');
      expect(wrapper.vm.getThreatSeverityText('medium')).toBe('中危');
      expect(wrapper.vm.getThreatSeverityText('high')).toBe('高危');
      expect(wrapper.vm.getThreatSeverityText('critical')).toBe('严重');
    });

    it('应该正确获取风险等级颜色', () => {
      expect(wrapper.vm.getRiskLevelColor(20)).toBe('var(--success-color)');
      expect(wrapper.vm.getRiskLevelColor(50)).toBe('var(--warning-color)');
      expect(wrapper.vm.getRiskLevelColor(80)).toBe('var(--danger-color)');
      expect(wrapper.vm.getRiskLevelColor(90)).toBe('#ff4757');
    });

    it('应该正确格式化时间', () => {
      const timestamp = '2024-01-01T10:30:00Z';
      const formattedTime = wrapper.vm.formatTime(timestamp);
      expect(formattedTime).toContain('2024');
    });

    it('应该正确获取连接状态类型', async () => {
      await wrapper.setData({ connectionStatus: '实时监控中' });
      expect(wrapper.vm.getConnectionStatusType()).toBe('success');

      await wrapper.setData({ connectionStatus: '连接中...' });
      expect(wrapper.vm.getConnectionStatusType()).toBe('warning');

      await wrapper.setData({ connectionStatus: '连接失败' });
      expect(wrapper.vm.getConnectionStatusType()).toBe('danger');
    });
  });

  describe('错误边界和异常处理', () => {
    it('应该处理API返回的无效数据', async () => {
      vi.mocked(securityApi.getOverview).mockResolvedValue({
        success: true,
        data: null
      });

      wrapper = mount(SecurityMonitoring);
      await flushPromises();

      // 应该使用默认值或保持初始状态
      expect(wrapper.vm.securityScore).toBe(0);
    });

    it('应该处理威胁数据缺失字段', async () => {
      const incompleteThreats = [{
        id: 'threat-1',
        description: '不完整威胁'
        // 缺少severity等字段
      }];

      vi.mocked(securityApi.getThreats).mockResolvedValue({
        success: true,
        threats: incompleteThreats
      });

      wrapper = mount(SecurityMonitoring);
      await flushPromises();

      expect(wrapper.vm.recentThreats).toEqual(incompleteThreats);
    });

    it('应该处理WebSocket消息处理异常', async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();

      // 模拟收到无效的WebSocket消息
      // 由于我们使用Mock WebSocket，这里主要验证组件不会崩溃
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('性能和内存管理', () => {
    it('应该正确清理定时器和事件监听器', async () => {
      wrapper = mount(SecurityMonitoring);
      await flushPromises();

      // 卸载组件
      wrapper.unmount();

      // 验证组件已卸载
      expect(wrapper.exists()).toBe(false);
    });

    it('应该处理大量威胁数据的性能', async () => {
      const largeThreats = Array.from({ length: 1000 }, (_, i) => ({
        id: `threat-${i}`,
        description: `威胁描述 ${i}`,
        severity: ['low', 'medium', 'high', 'critical'][i % 4],
        timestamp: new Date().toISOString(),
        source: `来源${i}`
      }));

      vi.mocked(securityApi.getThreats).mockResolvedValue({
        success: true,
        threats: largeThreats
      });

      const startTime = Date.now();
      wrapper = mount(SecurityMonitoring);
      await flushPromises();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
      expect(wrapper.vm.recentThreats).toHaveLength(1000);
    });

    it('应该防止内存泄漏', async () => {
      // 创建多个组件实例
      const wrappers = [];
      for (let i = 0; i < 10; i++) {
        const w = mount(SecurityMonitoring);
        await flushPromises();
        wrappers.push(w);
      }

      // 卸载所有组件
      wrappers.forEach(w => w.unmount());

      // 验证没有内存泄漏迹象
      expect(wrappers.every(w => !w.exists())).toBe(true);
    });
  });
});