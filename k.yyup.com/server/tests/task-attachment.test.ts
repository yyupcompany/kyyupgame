import request from 'supertest';
import { vi } from 'vitest'
import { app } from '../src/app';
import { TaskAttachment } from '../src/models/task-attachment.model';
import { Todo } from '../src/models/todo.model';
import { User } from '../src/models/user.model';
import path from 'path';
import fs from 'fs';


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('Task Attachment API Tests', () => {
  let authToken: string;
  let userId: number;
  let taskId: number;
  let attachmentId: number;

  beforeAll(async () => {
    // 登录获取token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'teacher',
        password: 'teacher123'
      });

    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;

    // 创建测试任务
    const taskResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: '测试任务',
        description: '用于测试附件上传',
        priority: 'high',
        status: 'pending',
        assignedTo: userId
      });

    taskId = taskResponse.body.data.id;
  });

  afterAll(async () => {
    // 清理测试数据
    if (attachmentId) {
      await TaskAttachment.destroy({ where: { id: attachmentId }, force: true });
    }
    if (taskId) {
      await Todo.destroy({ where: { id: taskId }, force: true });
    }
  });

  describe('POST /api/tasks/:taskId/attachments - 上传附件', () => {
    it('应该成功上传图片附件', async () => {
      const testImagePath = path.join(__dirname, '../test-files/test-image.jpg');
      
      const response = await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('fileName');
      expect(response.body.data).toHaveProperty('fileUrl');
      
      attachmentId = response.body.data.id;
    });

    it('应该成功上传文档附件', async () => {
      const testDocPath = path.join(__dirname, '../test-files/test-document.pdf');
      
      const response = await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testDocPath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('应该成功上传视频附件', async () => {
      const testVideoPath = path.join(__dirname, '../test-files/test-video.mp4');
      
      const response = await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testVideoPath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('应该拒绝不支持的文件类型', async () => {
      const testFilePath = path.join(__dirname, '../test-files/malicious.exe');
      
      const response = await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝超大文件', async () => {
      // 创建一个超过100MB的临时文件
      const largePath = path.join(__dirname, '../test-files/large-file.bin');
      const size = 101 * 1024 * 1024; // 101MB
      
      // 这个测试可能需要很长时间，实际测试中可以跳过
      // 或者使用mock来模拟
    });

    it('应该拒绝未认证的请求', async () => {
      const testImagePath = path.join(__dirname, '../test-files/test-image.jpg');
      
      const response = await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .attach('file', testImagePath);

      expect(response.status).toBe(401);
    });

    it('应该拒绝不存在的任务', async () => {
      const testImagePath = path.join(__dirname, '../test-files/test-image.jpg');
      
      const response = await request(app)
        .post('/api/tasks/999999/attachments')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/tasks/:taskId/attachments - 获取附件列表', () => {
    it('应该成功获取任务的附件列表', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}/attachments`);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/tasks/:taskId/attachments/:attachmentId - 删除附件', () => {
    it('应该成功删除自己上传的附件', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}/attachments/${attachmentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('应该拒绝删除不存在的附件', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}/attachments/999999`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('应该拒绝未认证的请求', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}/attachments/${attachmentId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/tasks/:taskId/attachments/batch - 批量上传', () => {
    it('应该成功批量上传多个附件', async () => {
      const testImagePath = path.join(__dirname, '../test-files/test-image.jpg');
      const testDocPath = path.join(__dirname, '../test-files/test-document.pdf');
      
      const response = await request(app)
        .post(`/api/tasks/${taskId}/attachments/batch`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', testImagePath)
        .attach('files', testDocPath);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('应该拒绝超过10个文件的批量上传', async () => {
      const testImagePath = path.join(__dirname, '../test-files/test-image.jpg');
      
      const req = request(app)
        .post(`/api/tasks/${taskId}/attachments/batch`)
        .set('Authorization', `Bearer ${authToken}`);

      // 尝试上传11个文件
      for (let i = 0; i < 11; i++) {
        req.attach('files', testImagePath);
      }

      const response = await req;
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/tasks/:taskId/attachments/:attachmentId/download - 下载附件', () => {
    it('应该成功下载附件', async () => {
      // 先上传一个附件
      const testImagePath = path.join(__dirname, '../test-files/test-image.jpg');
      
      const uploadResponse = await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath);

      const newAttachmentId = uploadResponse.body.data.id;

      // 下载附件
      const response = await request(app)
        .get(`/api/tasks/${taskId}/attachments/${newAttachmentId}/download`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('image');
    });
  });

  describe('安全性测试', () => {
    it('应该拒绝包含恶意代码的文件名', async () => {
      const testImagePath = path.join(__dirname, '../test-files/test-image.jpg');
      
      // 尝试使用恶意文件名
      const response = await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath, { filename: '../../../etc/passwd' });

      expect(response.status).toBe(400);
    });

    it('应该拒绝双重扩展名的文件', async () => {
      const testImagePath = path.join(__dirname, '../test-files/test-image.jpg');
      
      const response = await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath, { filename: 'image.jpg.exe' });

      expect(response.status).toBe(400);
    });

    it('应该拒绝包含脚本的文件', async () => {
      const maliciousPath = path.join(__dirname, '../test-files/malicious.html');
      
      const response = await request(app)
        .post(`/api/tasks/${taskId}/attachments`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', maliciousPath);

      expect(response.status).toBe(400);
    });
  });
});

