/**
 * 幼儿园租户系统统一认证集成测试
 * 测试与统一租户系统的认证集成
 */

import request from 'supertest';
import { expect } from 'chai';

describe('幼儿园租户系统统一认证', () => {
  const API_URL = process.env.TENANT_API_URL || 'http://localhost:3000';

  const testUser = {
    phone: '13800138000',
    password: 'Test@123456'
  };

  describe('登录流程', () => {
    it('应该成功登录', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send(testUser);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('success', true);
      expect(response.body.data).to.have.property('token');
    });

    it('应该返回租户列表或需要租户选择', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send(testUser);

      expect(response.status).to.equal(200);
      expect(response.body.data).to.satisfy((data: any) => {
        return data.tenants || data.requiresTenantSelection || data.requiresTenantBinding;
      });
    });
  });

  describe('错误处理', () => {
    it('缺少凭证时返回MISSING_CREDENTIALS', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({});

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'MISSING_CREDENTIALS');
    });

    it('手机号格式错误时返回INVALID_PHONE', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          phone: 'invalid-phone',
          password: testUser.password
        });

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error', 'INVALID_PHONE');
    });

    it('凭证无效时返回INVALID_CREDENTIALS', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          phone: testUser.phone,
          password: 'wrongpassword'
        });

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error', 'INVALID_CREDENTIALS');
    });
  });

  describe('Token验证', () => {
    let validToken: string;

    before(async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send(testUser);
      validToken = response.body.data.token;
    });

    it('应该使用有效token访问受保护资源', async () => {
      const response = await request(API_URL)
        .get('/api/auth/current-user')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('success', true);
    });

    it('缺少token时返回MISSING_TOKEN', async () => {
      const response = await request(API_URL)
        .get('/api/auth/current-user');

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error', 'MISSING_TOKEN');
    });

    it('无效token时返回INVALID_TOKEN', async () => {
      const response = await request(API_URL)
        .get('/api/auth/current-user')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('error', 'INVALID_TOKEN');
    });
  });
});

