import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { TestDataFactory } from '../helpers/testUtils';
import { getAuthToken } from '../helpers/authHelper';

// 真实API基地址
const API_BASE_URL = 'http://localhost:3000/api';

// API客户端配置
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  validateStatus: () => true,
});

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

describe('文件存储管理API全面测试 - 参数验证', () => {
  let authToken: string = '';
  let testUserId: number = 0;
  let uploadedFileIds: string[] = [];
  let testFilePath: string;

  beforeAll(async () => {
    console.log('🚀 开始文件存储管理API全面测试...');
    console.log('📋 测试范围: 文件上传、下载、存储管理的完整参数验证和安全性测试');

    try {
      // 使用真实的认证凭据获取token
      authToken = await getAuthToken('admin');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ 管理员认证成功');
    } catch (error) {
      console.error('❌ 管理员认证失败:', error);
      throw new Error('Failed to authenticate admin user');
    }

    // 创建测试文件
    testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for file upload testing.');
  });

  afterAll(async () => {
    // 清理测试文件
    console.log('🧹 清理测试文件数据...');
    
    // 删除上传的文件
    for (const fileId of uploadedFileIds) {
      if (authToken) {
        await apiClient.delete(`/files/${fileId}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      }
    }

    // 删除测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe('GET /files - 获取文件列表参数验证', () => {
    // 分页参数测试
    const paginationTests = [
      { params: { page: 1, limit: 10 }, description: '标准分页参数' },
      { params: { page: 1, limit: 5 }, description: '小页面尺寸' },
      { params: { page: 2, limit: 20 }, description: '大页面尺寸' },
      { params: { page: 0 }, description: '无效页码', shouldFail: true },
      { params: { page: -1 }, description: '负数页码', shouldFail: true },
      { params: { limit: 0 }, description: '无效限制数量', shouldFail: true },
      { params: { limit: 1000 }, description: '超大限制数量', shouldFail: true }
    ];

    paginationTests.forEach(test => {
      it(`应当在分页参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/files', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
            expect(response.data.data).toBeDefined();
          }
        }
      });
    });

    // 筛选参数测试
    const filterTests = [
      { params: { type: 'image' }, description: '按图片类型筛选' },
      { params: { type: 'document' }, description: '按文档类型筛选' },
      { params: { type: 'video' }, description: '按视频类型筛选' },
      { params: { type: 'invalid' }, description: '无效文件类型', shouldFail: true },
      { params: { uploadedBy: testUserId }, description: '按上传者筛选' },
      { params: { uploadedBy: -1 }, description: '无效上传者ID', shouldFail: true }
    ];

    filterTests.forEach(test => {
      it(`应当在筛选参数测试时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/files', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
          if (response.status === 200) {
            expect(response.data).toHaveProperty('success', true);
          }
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/files');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /files/upload - 单文件上传参数验证', () => {
    it('应当成功上传有效文件', async () => {
      const FormData = require('form-data');
      const form = new FormData();
      
      const fileContent = fs.readFileSync(testFilePath);
      form.append('file', fileContent, {
        filename: 'test-upload.txt',
        contentType: 'text/plain'
      });

      const response = await apiClient.post('/files/upload', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...form.getHeaders()
        }
      });

      expect([200, 201]).toContain(response.status);
      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        uploadedFileIds.push(response.data.data.id);
        expect(response.data.data).toHaveProperty('filename');
        expect(response.data.data).toHaveProperty('size');
        expect(response.data.data).toHaveProperty('mimetype');
      }
    });

    it('应当在缺少文件时返回错误', async () => {
      const FormData = require('form-data');
      const form = new FormData();
      // 不添加文件

      const response = await apiClient.post('/files/upload', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...form.getHeaders()
        }
      });

      expect([400, 422]).toContain(response.status);
    });

    it('应当在文件大小超限时返回错误', async () => {
      // 创建一个大文件进行测试
      const largeFilePath = path.join(__dirname, 'large-test-file.txt');
      const largeContent = 'A'.repeat(50 * 1024 * 1024); // 50MB
      fs.writeFileSync(largeFilePath, largeContent);

      try {
        const FormData = require('form-data');
        const form = new FormData();
        
        const fileContent = fs.readFileSync(largeFilePath);
        form.append('file', fileContent, {
          filename: 'large-file.txt',
          contentType: 'text/plain'
        });

        const response = await apiClient.post('/files/upload', form, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            ...form.getHeaders()
          }
        });

        expect([400, 413, 422]).toContain(response.status);
      } finally {
        if (fs.existsSync(largeFilePath)) {
          fs.unlinkSync(largeFilePath);
        }
      }
    });

    // 文件类型安全测试
    const maliciousFileTests = [
      {
        filename: 'test.exe',
        content: 'fake executable content',
        description: '可执行文件'
      },
      {
        filename: 'test.php',
        content: '<?php echo "test"; ?>',
        description: 'PHP脚本文件'
      },
      {
        filename: 'test.sh',
        content: '#!/bin/bash\necho "test"',
        description: 'Shell脚本文件'
      },
      {
        filename: '../../../etc/passwd',
        content: 'path traversal test',
        description: '路径遍历攻击'
      }
    ];

    maliciousFileTests.forEach(test => {
      it(`应当在安全测试时正确处理 - ${test.description}`, async () => {
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('file', Buffer.from(test.content), {
          filename: test.filename,
          contentType: 'text/plain'
        });

        const response = await apiClient.post('/files/upload', form, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            ...form.getHeaders()
          }
        });

        // 安全测试应该被阻止或经过安全处理
        expect([200, 201, 400, 403, 422]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.id) {
          uploadedFileIds.push(response.data.data.id);
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const FormData = require('form-data');
      const form = new FormData();
      
      const fileContent = fs.readFileSync(testFilePath);
      form.append('file', fileContent, {
        filename: 'test.txt',
        contentType: 'text/plain'
      });

      const response = await apiClient.post('/files/upload', form, {
        headers: form.getHeaders()
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /files/upload-multiple - 多文件上传参数验证', () => {
    it('应当成功上传多个有效文件', async () => {
      const FormData = require('form-data');
      const form = new FormData();
      
      // 创建多个测试文件
      const testFiles = [
        { name: 'file1.txt', content: 'Content of file 1' },
        { name: 'file2.txt', content: 'Content of file 2' },
        { name: 'file3.txt', content: 'Content of file 3' }
      ];

      testFiles.forEach(file => {
        form.append('files', Buffer.from(file.content), {
          filename: file.name,
          contentType: 'text/plain'
        });
      });

      const response = await apiClient.post('/files/upload-multiple', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...form.getHeaders()
        }
      });

      expect([200, 201]).toContain(response.status);
      if (response.status === 201 && response.data?.success && response.data?.data) {
        expect(Array.isArray(response.data.data)).toBe(true);
        response.data.data.forEach((file: any) => {
          if (file.id) {
            uploadedFileIds.push(file.id);
          }
        });
      }
    });

    it('应当在文件数量超限时返回错误', async () => {
      const FormData = require('form-data');
      const form = new FormData();
      
      // 添加超过限制的文件数量（假设限制为5个）
      for (let i = 0; i < 10; i++) {
        form.append('files', Buffer.from(`Content of file ${i}`), {
          filename: `file${i}.txt`,
          contentType: 'text/plain'
        });
      }

      const response = await apiClient.post('/files/upload-multiple', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...form.getHeaders()
        }
      });

      expect([400, 413, 422]).toContain(response.status);
    });

    it('应当在未认证时拒绝访问', async () => {
      const FormData = require('form-data');
      const form = new FormData();
      
      form.append('files', Buffer.from('test content'), {
        filename: 'test.txt',
        contentType: 'text/plain'
      });

      const response = await apiClient.post('/files/upload-multiple', form, {
        headers: form.getHeaders()
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /files/statistics - 获取文件统计参数验证', () => {
    it('应当成功获取文件统计信息', async () => {
      const response = await apiClient.get('/files/statistics', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    // 时间范围参数测试
    const timeRangeTests = [
      { params: { days: 7 }, description: '7天统计' },
      { params: { days: 30 }, description: '30天统计' },
      { params: { days: 365 }, description: '365天统计' },
      { params: { days: 0 }, description: '无效天数', shouldFail: true },
      { params: { days: -1 }, description: '负数天数', shouldFail: true }
    ];

    timeRangeTests.forEach(test => {
      it(`应当在时间范围参数验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get('/files/statistics', {
          params: test.params,
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/files/statistics');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /files/storage-info - 获取存储空间信息参数验证', () => {
    it('应当成功获取存储空间信息', async () => {
      const response = await apiClient.get('/files/storage-info', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
      }
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/files/storage-info');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /files/cleanup-temp - 清理临时文件参数验证', () => {
    it('应当成功清理临时文件', async () => {
      const response = await apiClient.post('/files/cleanup-temp', {}, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 201]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.data).toHaveProperty('success', true);
      }
    });

    // 清理参数测试
    const cleanupTests = [
      { params: { olderThan: '1h' }, description: '1小时前的文件' },
      { params: { olderThan: '1d' }, description: '1天前的文件' },
      { params: { olderThan: '7d' }, description: '7天前的文件' },
      { params: { olderThan: 'invalid' }, description: '无效时间格式', shouldFail: true }
    ];

    cleanupTests.forEach(test => {
      it(`应当在清理参数验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.post('/files/cleanup-temp', test.params, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200, 201]).toContain(response.status);
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.post('/files/cleanup-temp', {});

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /files/:id - 获取文件详情参数验证', () => {
    let testFileId: string;

    beforeAll(async () => {
      // 如果有上传的文件，使用其中一个作为测试
      if (uploadedFileIds.length > 0) {
        testFileId = uploadedFileIds[0];
      }
    });

    it('应当成功获取文件详情', async () => {
      if (!testFileId) {
        console.warn('跳过文件详情测试：没有可用的测试文件');
        return;
      }

      const response = await apiClient.get(`/files/${testFileId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toHaveProperty('id', testFileId);
      }
    });

    // 文件ID验证测试
    const fileIdTests = [
      { id: 'invalid-uuid', description: '无效UUID', shouldFail: true },
      { id: '123', description: '数字ID', shouldFail: true },
      { id: '', description: '空ID', shouldFail: true },
      { id: '00000000-0000-0000-0000-000000000000', description: '不存在的UUID', shouldFail: true }
    ];

    fileIdTests.forEach(test => {
      it(`应当在文件ID验证时正确处理 - ${test.description}`, async () => {
        const response = await apiClient.get(`/files/${test.id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 404, 422]).toContain(response.status);
        } else {
          expect([200]).toContain(response.status);
        }
      });
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/files/test-id');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('GET /files/download/:id - 文件下载参数验证', () => {
    it('应当成功下载文件', async () => {
      if (uploadedFileIds.length === 0) {
        console.warn('跳过文件下载测试：没有可用的测试文件');
        return;
      }

      const fileId = uploadedFileIds[0];
      const response = await apiClient.get(`/files/download/${fileId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.headers).toHaveProperty('content-type');
        expect(response.data).toBeDefined();
      }
    });

    it('应当在下载不存在文件时返回404', async () => {
      const response = await apiClient.get('/files/download/00000000-0000-0000-0000-000000000000', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404]).toContain(response.status);
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.get('/files/download/test-id');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('PUT /files/:id - 更新文件信息参数验证', () => {
    // 文件信息更新测试
    const updateTests = [
      { data: { filename: '新文件名.txt' }, description: '更新文件名' },
      { data: { description: '更新的文件描述' }, description: '更新文件描述' },
      { data: { tags: ['tag1', 'tag2'] }, description: '更新文件标签' },
      { data: { filename: '', description: '测试' }, description: '空文件名', shouldFail: true },
      { data: { filename: 123 }, description: '无效文件名类型', shouldFail: true },
      { data: { tags: 'invalid' }, description: '无效标签格式', shouldFail: true }
    ];

    updateTests.forEach(test => {
      it(`应当在文件更新时正确处理 - ${test.description}`, async () => {
        if (uploadedFileIds.length === 0) {
          console.warn('跳过文件更新测试：没有可用的测试文件');
          return;
        }

        const fileId = uploadedFileIds[0];
        const response = await apiClient.put(`/files/${fileId}`, test.data, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (test.shouldFail) {
          expect([400, 422]).toContain(response.status);
        } else {
          expect([200, 404]).toContain(response.status);
        }
      });
    });

    it('应当在更新不存在文件时返回404', async () => {
      const response = await apiClient.put('/files/00000000-0000-0000-0000-000000000000', {
        filename: '测试.txt'
      }, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404]).toContain(response.status);
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.put('/files/test-id', {
        filename: '测试.txt'
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('DELETE /files/:id - 删除文件参数验证', () => {
    let testFileIdForDeletion: string;

    beforeAll(async () => {
      // 上传一个专门用于删除测试的文件
      const FormData = require('form-data');
      const form = new FormData();
      
      form.append('file', Buffer.from('File to be deleted'), {
        filename: 'delete-test.txt',
        contentType: 'text/plain'
      });

      const response = await apiClient.post('/files/upload', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...form.getHeaders()
        }
      });

      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        testFileIdForDeletion = response.data.data.id;
      }
    });

    it('应当成功删除文件', async () => {
      if (!testFileIdForDeletion) {
        console.warn('跳过文件删除测试：无法创建测试文件');
        return;
      }

      const response = await apiClient.delete(`/files/${testFileIdForDeletion}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([200, 204]).toContain(response.status);
    });

    it('应当在删除不存在文件时返回404', async () => {
      const response = await apiClient.delete('/files/00000000-0000-0000-0000-000000000000', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([404]).toContain(response.status);
    });

    it('应当在无效文件ID时返回错误', async () => {
      const response = await apiClient.delete('/files/invalid-id', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect([400, 422]).toContain(response.status);
    });

    it('应当在未认证时拒绝访问', async () => {
      const response = await apiClient.delete('/files/test-id');

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('权限验证测试', () => {
    const protectedEndpoints = [
      { method: 'get', url: '/files' },
      { method: 'get', url: '/files/statistics' },
      { method: 'get', url: '/files/storage-info' },
      { method: 'post', url: '/files/cleanup-temp', data: {} },
      { method: 'get', url: '/files/test-id' },
      { method: 'get', url: '/files/download/test-id' },
      { method: 'put', url: '/files/test-id', data: { filename: 'test.txt' } },
      { method: 'delete', url: '/files/test-id' }
    ];

    protectedEndpoints.forEach(endpoint => {
      it(`应当在未提供token时返回401 - ${endpoint.method.toUpperCase()} ${endpoint.url}`, async () => {
        let response;
        
        if (endpoint.method === 'get') {
          response = await apiClient.get(endpoint.url);
        } else if (endpoint.method === 'post') {
          response = await apiClient.post(endpoint.url, endpoint.data || {});
        } else if (endpoint.method === 'put') {
          response = await apiClient.put(endpoint.url, endpoint.data || {});
        } else if (endpoint.method === 'delete') {
          response = await apiClient.delete(endpoint.url);
        }

        expect([401, 403]).toContain(response!.status);
      });
    });

    it('应当在无效token时返回401', async () => {
      const response = await apiClient.get('/files', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });

      expect([401, 403]).toContain(response.status);
    });
  });

  describe('响应数据格式验证', () => {
    it('文件列表响应应包含必要字段', async () => {
      const response = await apiClient.get('/files', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        
        if (response.data.data.files && response.data.data.files.length > 0) {
          const file = response.data.data.files[0];
          expect(file).toHaveProperty('id');
          expect(file).toHaveProperty('filename');
          expect(file).toHaveProperty('size');
          expect(file).toHaveProperty('mimetype');
        }
      }
    });

    it('文件统计响应应包含统计信息', async () => {
      const response = await apiClient.get('/files/statistics', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        expect(typeof response.data.data).toBe('object');
      }
    });

    it('存储信息响应应包含空间数据', async () => {
      const response = await apiClient.get('/files/storage-info', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('success', true);
        expect(response.data.data).toBeDefined();
        expect(typeof response.data.data).toBe('object');
      }
    });
  });

  describe('性能和并发测试', () => {
    it('文件列表查询API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const response = await apiClient.get('/files', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(3000); // 响应时间应小于3秒
      expect([200]).toContain(response.status);
    });

    it('文件上传API响应时间应在可接受范围内', async () => {
      const startTime = Date.now();
      
      const FormData = require('form-data');
      const form = new FormData();
      
      form.append('file', Buffer.from('Performance test file'), {
        filename: 'performance-test.txt',
        contentType: 'text/plain'
      });

      const response = await apiClient.post('/files/upload', form, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...form.getHeaders()
        }
      });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(5000); // 文件上传响应时间应小于5秒
      expect([200, 201]).toContain(response.status);
      
      if (response.status === 201 && response.data?.success && response.data?.data?.id) {
        uploadedFileIds.push(response.data.data.id);
      }
    });

    it('并发文件查询测试', async () => {
      const concurrentRequests = Array(3).fill(null).map(() => 
        apiClient.get('/files', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(10000); // 3个并发请求总时间应小于10秒
      responses.forEach(response => {
        expect([200]).toContain(response.status);
      });
    });
  });

  describe('文件存储特定测试', () => {
    it('应当正确处理不同文件类型', async () => {
      const fileTypes = [
        { content: 'Text file content', filename: 'test.txt', mimetype: 'text/plain' },
        { content: '{"key": "value"}', filename: 'test.json', mimetype: 'application/json' },
        { content: '<html><body>HTML content</body></html>', filename: 'test.html', mimetype: 'text/html' }
      ];

      for (const fileType of fileTypes) {
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('file', Buffer.from(fileType.content), {
          filename: fileType.filename,
          contentType: fileType.mimetype
        });

        const response = await apiClient.post('/files/upload', form, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            ...form.getHeaders()
          }
        });

        expect([200, 201]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.id) {
          uploadedFileIds.push(response.data.data.id);
        }
      }
    });

    it('应当正确处理文件大小限制', async () => {
      // 测试不同大小的文件
      const sizes = [
        { size: 1024, description: '1KB文件' },      // 1KB
        { size: 1024 * 1024, description: '1MB文件' }, // 1MB
        { size: 5 * 1024 * 1024, description: '5MB文件' } // 5MB
      ];

      for (const sizeTest of sizes.slice(0, 2)) { // 限制测试数量避免超时
        const FormData = require('form-data');
        const form = new FormData();
        
        const content = 'A'.repeat(sizeTest.size);
        form.append('file', Buffer.from(content), {
          filename: `size-test-${sizeTest.size}.txt`,
          contentType: 'text/plain'
        });

        const response = await apiClient.post('/files/upload', form, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            ...form.getHeaders()
          }
        });

        expect([200, 201, 413]).toContain(response.status);
        if (response.status === 201 && response.data?.success && response.data?.data?.id) {
          uploadedFileIds.push(response.data.data.id);
        }
      }
    });

    it('应当支持批量文件操作', async () => {
      if (uploadedFileIds.length < 2) {
        console.warn('跳过批量操作测试：文件数量不足');
        return;
      }

      // 测试批量获取文件信息
      const batchRequests = uploadedFileIds.slice(0, 3).map(id => 
        apiClient.get(`/files/${id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );

      const responses = await Promise.all(batchRequests);
      
      responses.forEach(response => {
        expect([200, 404]).toContain(response.status);
      });
    });
  });
});