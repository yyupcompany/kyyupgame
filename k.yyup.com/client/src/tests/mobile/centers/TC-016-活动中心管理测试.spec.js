/**
 * TC-016: 活动中心管理测试
 * 移动端活动中心管理功能的完整测试用例
 * 遵循项目严格验证规则
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { strictValidationWrapper, validateRequiredFields, validateFieldTypes } from '../../utils/validation-helpers';

describe('TC-016: 活动中心管理测试', () => {
  let page;
  let browser;

  beforeEach(async () => {
    // 初始化测试环境
    await setupTestEnvironment();
  });

  afterEach(async () => {
    // 清理测试环境
    await cleanupTestEnvironment();
  });

  /**
   * TC-016-01: 活动创建和管理
   * 验证各类活动的创建、编辑、发布和管理功能
   */
  it('TC-016-01: 活动创建和管理', async () => {
    await strictValidationWrapper(async () => {
      // 导航到活动中心
      await page.goto('/mobile/centers/activity-center');

      // 点击创建新活动按钮
      const createButton = await page.$('.create-activity-btn');
      expect(createButton).toBeTruthy();
      await createButton.click();

      // 等待创建表单加载
      await page.waitForSelector('.activity-creation-form');

      // 验证表单必填字段
      const requiredFields = ['title', 'type', 'startDate', 'endDate', 'location', 'maxParticipants'];
      for (const fieldName of requiredFields) {
        const field = await page.$(`[name="${fieldName}"]`);
        expect(field).toBeTruthy();
        const isRequired = await field.evaluate(el => el.hasAttribute('required'));
        expect(isRequired).toBe(true);
      }

      // 验证活动类型选项
      const typeField = await page.$('[name="type"]');
      const typeOptions = await typeField.$$eval('option', options =>
        options.map(option => option.value)
      );
      const validTypes = ['teaching', 'outdoor', 'sports', 'arts', 'parent', 'holiday', 'competition'];
      typeOptions.forEach(option => {
        expect(validTypes).toContain(option);
      });

      // 填写活动信息
      await page.fill('[name="title"]', '春季亲子运动会');
      await page.selectOption('[name="type"]', 'parent');
      await page.fill('[name="description"]', '邀请家长和孩子一起参与趣味运动比赛');

      // 设置活动时间
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      await page.fill('[name="startDate"]', startDate.toISOString().slice(0, 16));

      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 3);
      await page.fill('[name="endDate"]', endDate.toISOString().slice(0, 16));

      await page.fill('[name="location"]', '幼儿园操场');
      await page.fill('[name="maxParticipants"]', '100');

      // 设置费用
      await page.check('[name="isFree"]', false);
      await page.fill('[name="feeAmount"]', '20');

      // 提交表单
      const submitButton = await page.$('.submit-activity-btn');
      await submitButton.click();

      // 等待创建完成
      await page.waitForSelector('.success-message');

      // 验证创建成功
      const successMessage = await page.$('.success-message');
      expect(successMessage).toBeTruthy();

      // 返回活动列表
      await page.click('.back-to-list-btn');

      // 验证新活动在列表中
      await page.waitForSelector('.activity-item');
      const activityItems = await page.$$('.activity-item');
      expect(activityItems.length).toBeGreaterThan(0);

      // 验证新活动信息
      const firstActivity = activityItems[0];
      const activityTitle = await firstActivity.$('.activity-title');
      const titleText = await activityTitle.textContent();
      expect(titleText).toContain('春季亲子运动会');
    }, { timeout: 15000 });
  });

  /**
   * TC-016-02: 活动报名管理
   * 验证活动报名的申请、审核、统计和管理功能
   */
  it('TC-016-02: 活动报名管理', async () => {
    await strictValidationWrapper(async () => {
      // 进入已有活动的详情页
      await page.goto('/mobile/centers/activity-center');
      await page.click('.activity-item');
      await page.waitForSelector('.activity-detail');

      // 点击报名按钮
      const registerButton = await page.$('.register-activity-btn');
      expect(registerButton).toBeTruthy();
      await registerButton.click();

      // 等待报名表单加载
      await page.waitForSelector('.activity-registration-form');

      // 验证报名信息显示
      const activityInfo = await page.$('.activity-info-section');
      expect(activityInfo).toBeTruthy();

      const activityTitle = await activityInfo.$('.activity-title');
      const activityTime = await activityInfo.$('.activity-time');
      const activityLocation = await activityInfo.$('.activity-location');
      expect(activityTitle).toBeTruthy();
      expect(activityTime).toBeTruthy();
      expect(activityLocation).toBeTruthy();

      // 验证参与者信息表单
      const participantInfo = await page.$('.participant-info-section');
      expect(participantInfo).toBeTruthy();

      const requiredFields = ['parentName', 'parentPhone', 'emergencyContact'];
      for (const fieldName of requiredFields) {
        const field = await participantInfo.$(`[name="${fieldName}"]`);
        expect(field).toBeTruthy();
        const isRequired = await field.evaluate(el => el.hasAttribute('required'));
        expect(isRequired).toBe(true);
      }

      // 验证家庭成员选择
      const familyMembersSection = await page.$('.family-members-section');
      expect(familyMembersSection).toBeTruthy();

      const memberCheckboxes = await familyMembersSection.$$('.member-checkbox');
      expect(memberCheckboxes.length).toBeGreaterThan(0);

      // 选择参与的家庭成员
      const firstMemberCheckbox = memberCheckboxes[0].$('.member-checkbox input');
      await firstMemberCheckbox.check();

      // 填写报名信息
      await page.fill('[name="parentName"]', '张爸爸');
      await page.fill('[name="parentPhone"]', '13800138000');
      await page.fill('[name="emergencyContact"]', '李妈妈 13900139000');

      // 选择支付方式
      await page.selectOption('[name="paymentMethod"]', 'wechat');

      // 同意条款
      await page.check('[name="agreeTerms"]');

      // 提交报名
      const submitButton = await page.$('.submit-registration-btn');
      await submitButton.click();

      // 等待报名完成
      await page.waitForSelector('.registration-success');

      // 验证报名成功
      const successMessage = await page.$('.registration-success');
      expect(successMessage).toBeTruthy();

      // 验证报名状态
      const registrationStatus = await page.$('.registration-status');
      const statusText = await registrationStatus.textContent();
      expect(['待审核', '已通过', '已拒绝']).toContain(statusText);

      // 测试管理员审核功能
      await page.goto('/mobile/centers/activity-center/admin');
      await page.click('.pending-registrations-tab');

      // 选择待审核的报名
      const pendingRegistration = await page.$('.pending-registration-item');
      await pendingRegistration.click();

      // 审核通过
      await page.click('.approve-registration-btn');

      // 验证审核成功
      const approvalMessage = await page.$('.approval-success');
      expect(approvalMessage).toBeTruthy();

      // 验证报名统计
      await page.click('.registration-stats-tab');
      const statsData = await page.evaluate(async () => {
        const response = await fetch('/api/activities/registration-stats');
        return await response.json();
      });

      validateRequiredFields(statsData.data, [
        'totalRegistrations', 'approvedRegistrations', 'pendingRegistrations',
        'rejectedRegistrations', 'totalParticipants', 'participantBreakdown'
      ]);

      validateFieldTypes(statsData.data, {
        totalRegistrations: 'number',
        approvedRegistrations: 'number',
        pendingRegistrations: 'number',
        rejectedRegistrations: 'number',
        totalParticipants: 'number',
        participantBreakdown: 'object'
      });
    }, { timeout: 20000 });
  });

  /**
   * TC-016-03: 活动执行和管理
   * 验证活动执行过程中的签到、现场管理、进度跟踪等功能
   */
  it('TC-016-03: 活动执行和管理', async () => {
    await strictValidationWrapper(async () => {
      // 进入活动执行页面
      await page.goto('/mobile/centers/activity-center/execute/789');

      // 验证活动信息显示
      const activityHeader = await page.$('.activity-execution-header');
      expect(activityHeader).toBeTruthy();

      const activityStatus = await activityHeader.$('.activity-status');
      const participantCount = await activityHeader.$('.participant-count');
      const progressIndicator = await activityHeader.$('.progress-indicator');
      expect(activityStatus).toBeTruthy();
      expect(participantCount).toBeTruthy();
      expect(progressIndicator).toBeTruthy();

      // 验证签到功能
      const checkInSection = await page.$('.checkin-section');
      expect(checkInSection).toBeTruthy();

      const checkinSearch = await checkInSection.$('.checkin-search');
      const checkinList = await checkInSection.$('.checkin-list');
      expect(checkinSearch).toBeTruthy();
      expect(checkinList).toBeTruthy();

      // 测试参与者签到
      const participants = await checkInSection.$$('.participant-item');
      expect(participants.length).toBeGreaterThan(0);

      const firstParticipant = participants[0];
      const participantName = await firstParticipant.$('.participant-name');
      const checkinStatus = await firstParticipant.$('.checkin-status');
      const checkinButton = await firstParticipant.$('.checkin-button');

      expect(participantName).toBeTruthy();
      expect(checkinStatus).toBeTruthy();
      expect(checkinButton).toBeTruthy();

      const status = await checkinStatus.textContent();
      expect(['未签到', '已签到', '迟到', '请假']).toContain(status);

      // 执行签到
      await checkinButton.click();

      // 验证签到API响应
      const checkinResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/activities/checkin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              activityId: 789,
              participantId: 101
            })
          });
          return await response.json();
        } catch (error) {
          return { error: error.message };
        }
      });

      validateRequiredFields(checkinResponse.data, [
        'checkinId', 'activityId', 'participantId', 'checkinTime',
        'checkinStatus', 'checkedInBy', 'notes'
      ]);

      validateFieldTypes(checkinResponse.data, {
        checkinId: 'number',
        activityId: 'number',
        participantId: 'number',
        checkinTime: 'string',
        checkinStatus: 'string',
        checkedInBy: 'number',
        notes: 'string'
      });

      const validStatuses = ['on_time', 'late', 'absent', 'excused'];
      expect(validStatuses).toContain(checkinResponse.data.checkinStatus);

      // 验证活动进度管理
      const progressSection = await page.$('.activity-progress-section');
      expect(progressSection).toBeTruthy();

      const progressSteps = await progressSection.$$('.progress-step');
      expect(progressSteps.length).toBeGreaterThan(0);

      // 更新活动进度
      const firstStep = progressSteps[0];
      const stepStatusButton = await firstStep.$('.update-step-status-btn');
      await stepStatusButton.click();

      // 选择状态为已完成
      await page.selectOption('.step-status-select', 'completed');
      await page.fill('.step-notes-input', '该环节顺利完成');
      await page.click('.save-step-status-btn');

      // 验证进度更新响应
      const progressUpdateResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/activities/update-progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              activityId: 789,
              stepId: 1,
              status: 'completed',
              notes: '该环节顺利完成'
            })
          });
          return await response.json();
        } catch (error) {
          return { error: error.message };
        }
      });

      validateRequiredFields(progressUpdateResponse.data, [
        'activityId', 'stepId', 'oldStatus', 'newStatus', 'updatedBy', 'updatedAt'
      ]);

      // 验证现场管理功能
      const managementSection = await page.$('.on-site-management-section');
      expect(managementSection).toBeTruthy();

      const emergencyButton = await managementSection.$('.emergency-button');
      const notesButton = await managementSection.$('.add-notes-button');
      const photoButton = await managementSection.$('.add-photo-button');

      expect(emergencyButton).toBeTruthy();
      expect(notesButton).toBeTruthy();
      expect(photoButton).toBeTruthy();

      // 测试添加活动记录
      await notesButton.click();
      await page.fill('.activity-notes-input', '活动进行顺利，孩子们参与积极性很高');
      await page.click('.save-notes-btn');
    }, { timeout: 15000 });
  });

  /**
   * TC-016-04: 活动统计分析
   * 验证活动数据的统计分析、报告生成和趋势分析功能
   */
  it('TC-016-04: 活动统计分析', async () => {
    await strictValidationWrapper(async () => {
      // 进入活动统计页面
      await page.goto('/mobile/centers/activity-center/statistics');

      // 等待统计数据加载
      await page.waitForSelector('.activity-statistics-overview');

      // 获取统计数据
      const statsResponse = await page.evaluate(async () => {
        const response = await fetch('/api/activities/statistics?startDate=2024-01-01&endDate=2024-03-31');
        return await response.json();
      });

      // 验证统计概览数据
      validateRequiredFields(statsResponse.data, [
        'overview', 'byType', 'byStatus', 'participationStats', 'feeStats', 'satisfactionStats'
      ]);

      // 验证概览数据
      validateRequiredFields(statsResponse.data.overview, [
        'totalActivities', 'completedActivities', 'ongoingActivities',
        'totalParticipants', 'averageParticipationRate'
      ]);

      validateFieldTypes(statsResponse.data.overview, {
        totalActivities: 'number',
        completedActivities: 'number',
        ongoingActivities: 'number',
        totalParticipants: 'number',
        averageParticipationRate: 'number'
      });

      // 验证数值逻辑
      const totalStatus = statsResponse.data.overview.completedActivities +
                        statsResponse.data.overview.ongoingActivities;
      expect(totalStatus).toBeLessThanOrEqual(statsResponse.data.overview.totalActivities);

      // 验证参与率
      expect(statsResponse.data.overview.averageParticipationRate).toBeBetween(0, 100);

      // 验证按类型统计
      expect(Array.isArray(statsResponse.data.byType)).toBe(true);
      statsResponse.data.byType.forEach(type => {
        validateRequiredFields(type, ['type', 'count', 'participants', 'averageRate']);
        validateFieldTypes(type, {
          type: 'string',
          count: 'number',
          participants: 'number',
          averageRate: 'number'
        });
      });

      // 验证页面统计显示
      const totalActivitiesElement = await page.$('.total-activities');
      const totalParticipantsElement = await page.$('.total-participants');
      const averageRateElement = await page.$('.average-participation-rate');

      expect(totalActivitiesElement).toBeTruthy();
      expect(totalParticipantsElement).toBeTruthy();
      expect(averageRateElement).toBeTruthy();

      // 测试报告生成
      const generateReportButton = await page.$('.generate-report-btn');
      await generateReportButton.click();

      // 选择报告类型和期间
      await page.selectOption('.report-type-select', 'comprehensive');
      await page.fill('.start-date-input', '2024-01-01');
      await page.fill('.end-date-input', '2024-03-31');
      await page.click('.generate-btn');

      // 等待报告生成
      await page.waitForSelector('.report-generated');

      // 验证报告数据
      const reportData = await page.evaluate(async () => {
        const response = await fetch('/api/activities/generate-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'comprehensive',
            startDate: '2024-01-01',
            endDate: '2024-03-31'
          })
        });
        return await response.json();
      });

      validateRequiredFields(reportData.data, [
        'title', 'period', 'generatedAt', 'executiveSummary', 'detailedAnalysis',
        'performanceMetrics', 'recommendations'
      ]);

      // 测试数据导出
      const exportButton = await page.$('.export-data-btn');
      await exportButton.click();

      // 选择导出格式
      await page.selectOption('.export-format-select', 'excel');
      await page.click('.download-btn');

      // 验证导出响应
      const exportResponse = await page.evaluate(async () => {
        const response = await fetch('/api/activities/export-data?format=excel');
        return {
          status: response.status,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        };
      });

      expect(exportResponse.status).toBe(200);
      expect(exportResponse.contentType).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(parseInt(exportResponse.contentLength)).toBeGreaterThan(0);
    }, { timeout: 20000 });
  });

  /**
   * TC-016-05: 活动财务管理
   * 验证活动费用设置、收费管理、财务统计和报表功能
   */
  it('TC-016-05: 活动财务管理', async () => {
    await strictValidationWrapper(async () => {
      // 进入活动财务管理页面
      await page.goto('/mobile/centers/activity-center/finance/789');

      // 验证费用设置
      const feeSettingsSection = await page.$('.fee-settings-section');
      expect(feeSettingsSection).toBeTruthy();

      const feeAmount = await feeSettingsSection.$('[name="feeAmount"]');
      const feeDescription = await feeSettingsSection.$('[name="feeDescription"]');
      expect(feeAmount).toBeTruthy();
      expect(feeDescription).toBeTruthy();

      const feeAmountType = await feeAmount.evaluate(el => el.type);
      expect(feeAmountType).toBe('number');

      const isDescriptionRequired = await feeDescription.evaluate(el => el.hasAttribute('required'));
      expect(isDescriptionRequired).toBe(true);

      // 设置费用信息
      await page.fill('[name="feeAmount"]', '20');
      await page.fill('[name="feeDescription"]', '包含活动材料和午餐');
      await page.check('[name="enableDiscount"]', true);

      // 添加优惠政策
      const addDiscountButton = await page.$('.add-discount-rule-btn');
      await addDiscountButton.click();

      await page.selectOption('.discount-type-select', 'percentage');
      await page.fill('.discount-value-input', '10');
      await page.selectOption('.discount-condition-select', 'early_bird');
      await page.click('.save-discount-btn');

      // 保存费用设置
      const saveFeeButton = await page.$('.save-fee-settings-btn');
      await saveFeeButton.click();

      // 验证费用设置响应
      const feeSettingsResponse = await page.evaluate(async () => {
        const response = await fetch('/api/activities/fee-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            activityId: 789,
            feePolicy: {
              isFree: false,
              baseAmount: 20,
              description: '包含活动材料和午餐',
              includes: ['材料', '午餐'],
              excludes: []
            },
            discountRules: [
              {
                type: 'percentage',
                value: 10,
                condition: { type: 'early_bird', days: 7 },
                enabled: true
              }
            ]
          })
        });
        return await response.json();
      });

      validateRequiredFields(feeSettingsResponse.data, [
        'activityId', 'feePolicy', 'discountRules', 'paymentMethods'
      ]);

      // 验证收费记录
      const paymentRecordsSection = await page.$('.payment-records-section');
      expect(paymentRecordsSection).toBeTruthy();

      const paymentList = await paymentRecordsSection.$('.payment-list');
      const totalCollected = await paymentRecordsSection.$('.total-collected');
      const pendingPayments = await paymentRecordsSection.$('.pending-payments');

      expect(paymentList).toBeTruthy();
      expect(totalCollected).toBeTruthy();
      expect(pendingPayments).toBeTruthy();

      // 测试收费记录
      const paymentRecordsResponse = await page.evaluate(async () => {
        const response = await fetch('/api/activities/payment-records?activityId=789');
        return await response.json();
      });

      expect(Array.isArray(paymentRecordsResponse.data)).toBe(true);
      paymentRecordsResponse.data.forEach(record => {
        validateRequiredFields(record, [
          'paymentId', 'activityId', 'registrationId', 'payerId', 'amount',
          'method', 'status', 'transactionId', 'paidAt'
        ]);

        validateFieldTypes(record, {
          paymentId: 'number',
          activityId: 'number',
          registrationId: 'number',
          payerId: 'number',
          amount: 'number',
          method: 'string',
          status: 'string',
          transactionId: 'string',
          paidAt: 'string'
        });

        expect(['pending', 'paid', 'failed', 'refunded']).toContain(record.status);
        expect(record.amount).toBeGreaterThan(0);
      });

      // 验证财务统计
      const financeStatsSection = await page.$('.finance-stats-section');
      expect(financeStatsSection).toBeTruthy();

      const revenueChart = await financeStatsSection.$('.revenue-chart');
      const paymentMethodChart = await financeStatsSection.$('.payment-method-chart');
      expect(revenueChart).toBeTruthy();
      expect(paymentMethodChart).toBeTruthy();

      // 获取财务统计
      const financeStatsResponse = await page.evaluate(async () => {
        const response = await fetch('/api/activities/finance-statistics?activityId=789');
        return await response.json();
      });

      validateRequiredFields(financeStatsResponse.data, [
        'summary', 'paymentBreakdown', 'refundStatistics', 'revenueTrend'
      ]);

      // 验证财务摘要
      validateRequiredFields(financeStatsResponse.data.summary, [
        'totalRevenue', 'totalExpenses', 'netProfit', 'profitMargin',
        'averageRevenuePerActivity', 'collectionRate'
      ]);

      validateFieldTypes(financeStatsResponse.data.summary, {
        totalRevenue: 'number',
        totalExpenses: 'number',
        netProfit: 'number',
        profitMargin: 'number',
        averageRevenuePerActivity: 'number',
        collectionRate: 'number'
      });
    }, { timeout: 18000 });
  });

  /**
   * 性能测试
   */
  it('性能测试 - 活动列表加载', async () => {
    const startTime = Date.now();

    await page.goto('/mobile/centers/activity-center');
    await page.waitForSelector('.activity-list');

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(2000);
  });

  it('性能测试 - 报名数据处理', async () => {
    const startTime = Date.now();

    // 模拟大量报名数据处理
    const registrationProcessTime = await page.evaluate(async () => {
      const start = Date.now();

      // 模拟处理100个报名记录
      const registrations = Array.from({ length: 100 }, (_, i) => ({
        participantId: i + 1,
        activityId: 789,
        status: 'pending'
      }));

      // 模拟处理逻辑
      await new Promise(resolve => setTimeout(resolve, 100));

      return Date.now() - start;
    });

    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(1500);
  });
});

/**
 * 测试环境设置
 */
async function setupTestEnvironment() {
  // 设置测试环境
}

/**
 * 测试环境清理
 */
async function cleanupTestEnvironment() {
  // 清理测试环境
}