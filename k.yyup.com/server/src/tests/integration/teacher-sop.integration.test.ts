import request from 'supertest';
import app from '../../app';
import { sequelize } from '../../config/database';
import SOPStage from '../../models/sop-stage.model';
import SOPTask from '../../models/sop-task.model';
import CustomerSOPProgress from '../../models/customer-sop-progress.model';

describe('Teacher SOP Integration Tests', () => {
  let authToken: string;
  let teacherId: number;
  let customerId: number;

  beforeAll(async () => {
    // 连接数据库
    await sequelize.sync({ force: true });

    // 创建测试用户并获取token
    // TODO: 实现用户创建和登录逻辑
    authToken = 'test-token';
    teacherId = 1;
    customerId = 1;

    // 初始化SOP数据
    await initializeSOPData();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  async function initializeSOPData() {
    // 创建SOP阶段
    await SOPStage.bulkCreate([
      {
        id: 1,
        name: '初次接触',
        description: '与客户建立第一次联系',
        orderNum: 1,
        estimatedDays: 1,
        isActive: true
      },
      {
        id: 2,
        name: '需求挖掘',
        description: '深入了解客户需求',
        orderNum: 2,
        estimatedDays: 2,
        isActive: true
      }
    ]);

    // 创建SOP任务
    await SOPTask.bulkCreate([
      {
        stageId: 1,
        title: '自我介绍',
        description: '专业、亲切地介绍自己',
        isRequired: true,
        estimatedTime: 5,
        orderNum: 1,
        isActive: true
      },
      {
        stageId: 1,
        title: '了解基本信息',
        description: '收集客户基本信息',
        isRequired: true,
        estimatedTime: 10,
        orderNum: 2,
        isActive: true
      },
      {
        stageId: 1,
        title: '建立信任',
        description: '建立初步信任关系',
        isRequired: true,
        estimatedTime: 10,
        orderNum: 3,
        isActive: true
      }
    ]);
  }

  describe('GET /api/teacher-sop/stages', () => {
    it('should return all SOP stages', async () => {
      const response = await request(app)
        .get('/api/teacher-sop/stages')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('初次接触');
      expect(response.body.data[1].name).toBe('需求挖掘');
    });
  });

  describe('GET /api/teacher-sop/stages/:id', () => {
    it('should return stage by id', async () => {
      const response = await request(app)
        .get('/api/teacher-sop/stages/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('初次接触');
    });

    it('should return 404 for non-existent stage', async () => {
      const response = await request(app)
        .get('/api/teacher-sop/stages/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('阶段不存在');
    });
  });

  describe('GET /api/teacher-sop/stages/:id/tasks', () => {
    it('should return tasks for a stage', async () => {
      const response = await request(app)
        .get('/api/teacher-sop/stages/1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].title).toBe('自我介绍');
    });
  });

  describe('Customer Progress Flow', () => {
    it('should create and manage customer progress', async () => {
      // 1. 获取初始进度（自动创建）
      const progressResponse = await request(app)
        .get(`/api/teacher-sop/customers/${customerId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(progressResponse.body.success).toBe(true);
      expect(progressResponse.body.data.currentStageId).toBe(1);
      expect(progressResponse.body.data.stageProgress).toBe(0);
      expect(progressResponse.body.data.completedTasks).toEqual([]);

      // 2. 完成第一个任务
      const task1Response = await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/tasks/1/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(task1Response.body.success).toBe(true);
      expect(task1Response.body.data.completedTasks).toContain(1);
      expect(task1Response.body.data.stageProgress).toBeGreaterThan(0);

      // 3. 完成第二个任务
      await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/tasks/2/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 4. 完成第三个任务
      await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/tasks/3/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 5. 推进到下一阶段
      const advanceResponse = await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/progress/advance`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(advanceResponse.body.success).toBe(true);
      expect(advanceResponse.body.data.currentStageId).toBe(2);
      expect(advanceResponse.body.data.stageProgress).toBe(0);
      expect(advanceResponse.body.data.completedTasks).toEqual([]);
    });
  });

  describe('Conversation Management', () => {
    it('should add and retrieve conversations', async () => {
      // 1. 添加对话记录
      const addResponse = await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/conversations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          speakerType: 'teacher',
          content: '您好，我是XX幼儿园的李老师',
          messageType: 'text'
        })
        .expect(200);

      expect(addResponse.body.success).toBe(true);
      expect(addResponse.body.data.content).toBe('您好，我是XX幼儿园的李老师');

      // 2. 获取对话记录
      const getResponse = await request(app)
        .get(`/api/teacher-sop/customers/${customerId}/conversations`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data).toHaveLength(1);
      expect(getResponse.body.data[0].content).toBe('您好，我是XX幼儿园的李老师');
    });

    it('should add conversations in batch', async () => {
      const conversations = [
        { speakerType: 'teacher', content: 'Hello' },
        { speakerType: 'customer', content: 'Hi' },
        { speakerType: 'teacher', content: 'How are you?' }
      ];

      const response = await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/conversations/batch`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ conversations })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });
  });

  describe('Screenshot Management', () => {
    it('should upload and analyze screenshot', async () => {
      // 1. 上传截图
      const uploadResponse = await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/screenshots/upload`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageUrl: 'http://example.com/screenshot.jpg'
        })
        .expect(200);

      expect(uploadResponse.body.success).toBe(true);
      expect(uploadResponse.body.data.imageUrl).toBe('http://example.com/screenshot.jpg');

      const screenshotId = uploadResponse.body.data.id;

      // 2. 分析截图
      const analyzeResponse = await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/screenshots/${screenshotId}/analyze`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(analyzeResponse.body.success).toBe(true);
      expect(analyzeResponse.body.data).toHaveProperty('recognizedText');
      expect(analyzeResponse.body.data).toHaveProperty('focusPoints');
      expect(analyzeResponse.body.data).toHaveProperty('sentiment');
    });
  });

  describe('AI Suggestions', () => {
    it('should get task AI suggestion', async () => {
      const response = await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/ai-suggestions/task`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ taskId: 1 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('strategy');
      expect(response.body.data).toHaveProperty('scripts');
      expect(response.body.data).toHaveProperty('nextActions');
      expect(response.body.data).toHaveProperty('successProbability');
      expect(response.body.data).toHaveProperty('factors');
    });

    it('should get global AI analysis', async () => {
      const response = await request(app)
        .post(`/api/teacher-sop/customers/${customerId}/ai-suggestions/global`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('successProbability');
      expect(response.body.data).toHaveProperty('currentProgress');
    });
  });

  describe('Error Handling', () => {
    it('should return 401 without auth token', async () => {
      await request(app)
        .get('/api/teacher-sop/stages')
        .expect(401);
    });

    it('should handle invalid customer id', async () => {
      const response = await request(app)
        .get('/api/teacher-sop/customers/invalid/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});

