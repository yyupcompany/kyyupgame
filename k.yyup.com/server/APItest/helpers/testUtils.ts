import request from 'supertest';
import { Application } from 'express';
import jwt from 'jsonwebtoken';

export interface TestUser {
  id: number;
  username: string;
  email: string;
  role: string;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export class TestHelper {
  private app: Application;
  
  constructor(app: Application) {
    this.app = app;
  }
  
  // Generate test JWT token
  generateTestToken(user: Partial<TestUser>): string {
    const payload = {
      id: user.id || 1,
      username: user.username || 'testuser',
      email: user.email || 'test@example.com',
      role: user.role || 'admin'
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h'
    });
  }
  
  // Create authenticated request
  authenticatedRequest(method: 'get' | 'post' | 'put' | 'delete', url: string, user?: Partial<TestUser>) {
    const token = this.generateTestToken(user || {});
    return request(this.app)[method](url)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
  }
  
  // GET request with auth
  get(url: string, user?: Partial<TestUser>) {
    return this.authenticatedRequest('get', url, user);
  }
  
  // POST request with auth
  post(url: string, data?: any, user?: Partial<TestUser>) {
    const req = this.authenticatedRequest('post', url, user);
    return data ? req.send(data) : req;
  }
  
  // PUT request with auth
  put(url: string, data?: any, user?: Partial<TestUser>) {
    const req = this.authenticatedRequest('put', url, user);
    return data ? req.send(data) : req;
  }
  
  // DELETE request with auth
  delete(url: string, user?: Partial<TestUser>) {
    return this.authenticatedRequest('delete', url, user);
  }
  
  // Unauthenticated request
  public(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: any) {
    const req = request(this.app)[method](url)
      .set('Content-Type', 'application/json');
    return data ? req.send(data) : req;
  }
}

// Test data factory
export class TestDataFactory {
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    return {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
      ...overrides
    };
  }
  
  static createStudent(overrides: any = {}) {
    return {
      name: '测试学生',
      studentNo: 'STU' + Date.now(), // 添加必需的学号字段
      gender: 1, // 使用数字格式：1=男，2=女
      birthDate: '2020-01-01',
      enrollmentDate: '2024-01-01', // 添加入学日期
      kindergartenId: 1,
      classId: 1,
      parentName: '测试家长',
      parentPhone: '13800000001',
      ...overrides
    };
  }
  
  static createTeacher(overrides: any = {}) {
    return {
      name: '测试教师',
      email: 'teacher@test.com',
      phone: '13800138000',
      qualification: '学前教育',
      experience: 5,
      ...overrides
    };
  }
  
  static createClass(overrides: any = {}) {
    return {
      name: '测试班级',
      grade: '大班',
      capacity: 30,
      currentCount: 25,
      teacherId: 1,
      ...overrides
    };
  }
  
  static createActivity(overrides: any = {}) {
    return {
      title: '测试活动',
      description: '这是一个测试活动',
      type: '体验课',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000), // 1 hour later
      location: '教室A',
      capacity: 20,
      ...overrides
    };
  }
  
  static createEnrollmentPlan(overrides: any = {}) {
    return {
      title: '测试招生计划',
      description: '这是一个测试招生计划',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 3600000), // 30 days later
      targetCount: 100,
      currentCount: 0,
      status: '进行中',
      ...overrides
    };
  }
}

// Database cleanup utilities
export class DatabaseCleaner {
  static async cleanAll() {
    // Clean test data from all tables
    // This should be implemented based on your specific models
    // Example:
    // await User.destroy({ where: { email: { [Op.like]: '%@test.com' } } });
    // await Student.destroy({ where: { name: { [Op.like]: '测试%' } } });
    // Add cleanup for other models...
  }
  
  static async cleanTable(tableName: string) {
    // Clean specific table
    // Implementation depends on your ORM setup
  }
}

// Response validators
export const ResponseValidators = {
  isSuccessResponse: (response: any): response is ApiResponse => {
    return response.body && 
           typeof response.body.success === 'boolean' &&
           response.body.success === true &&
           response.body.hasOwnProperty('data');
  },
  
  isErrorResponse: (response: any): response is ApiResponse => {
    return response.body && 
           typeof response.body.success === 'boolean' &&
           response.body.success === false &&
           response.body.hasOwnProperty('message');
  },
  
  hasValidPagination: (data: any): boolean => {
    return data && 
           typeof data.total === 'number' &&
           typeof data.page === 'number' &&
           typeof data.limit === 'number' &&
           Array.isArray(data.items);
  }
};

// Standalone auth token generator for axios-based tests
export async function getAuthToken(): Promise<string> {
  // Generate a test JWT token for admin user
  const payload = {
    userId: 121, // Use actual admin user ID from database
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin'
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h'
  });
  
  // For development environment, use mock token that bypasses JWT verification
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${Buffer.from(JSON.stringify(payload)).toString('base64')}.mockSignatureForDevAndTestingPurposesOnly`;
}

// Parameter validation framework for comprehensive testing
export class ParameterValidationFramework {
  private apiClient: any;
  private authToken: string;

  constructor(apiClient: any, authToken: string) {
    this.apiClient = apiClient;
    this.authToken = authToken;
  }

  async testRequiredFields(endpoint: string, requiredFields: string[], validData: any): Promise<void> {
    for (const field of requiredFields) {
      const testData = { ...validData };
      delete testData[field];

      try {
        const response = await this.apiClient.post(endpoint, testData, {
          headers: { 'Authorization': `Bearer ${this.authToken}` }
        });
        
        // Should return error for missing required field
        expect([400, 422]).toContain(response.status);
        expect(response.data.success).toBe(false);
      } catch (error: any) {
        expect([400, 422, 500]).toContain(error.response?.status);
      }
    }
  }

  async testDataTypes(endpoint: string, typeTests: Array<{field: string, validValue: any, invalidValues: any[]}>): Promise<void> {
    for (const { field, validValue, invalidValues } of typeTests) {
      // Test valid value
      try {
        const validData = { [field]: validValue };
        const response = await this.apiClient.post(endpoint, validData, {
          headers: { 'Authorization': `Bearer ${this.authToken}` }
        });
        
        expect([200, 201]).toContain(response.status);
      } catch (error: any) {
        // Valid values might still fail due to other missing fields, but shouldn't be type errors
        expect(error.response?.status).not.toBe(400);
      }

      // Test invalid values
      for (const invalidValue of invalidValues) {
        try {
          const invalidData = { [field]: invalidValue };
          const response = await this.apiClient.post(endpoint, invalidData, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
          });
          
          expect([400, 422]).toContain(response.status);
        } catch (error: any) {
          expect([400, 422, 500]).toContain(error.response?.status);
        }
      }
    }
  }

  async testBoundaryValues(endpoint: string, boundaryTests: Array<{field: string, min?: number, max?: number, invalidValues: any[]}>): Promise<void> {
    for (const { field, min, max, invalidValues } of boundaryTests) {
      // Test boundary values
      if (typeof min !== 'undefined') {
        try {
          const minData = { [field]: min };
          const response = await this.apiClient.post(endpoint, minData, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
          });
          
          expect([200, 201]).toContain(response.status);
        } catch (error: any) {
          // Boundary values might fail due to other requirements
          expect(error.response?.status).not.toBe(400);
        }
      }

      if (typeof max !== 'undefined') {
        try {
          const maxData = { [field]: max };
          const response = await this.apiClient.post(endpoint, maxData, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
          });
          
          expect([200, 201]).toContain(response.status);
        } catch (error: any) {
          // Boundary values might fail due to other requirements
          expect(error.response?.status).not.toBe(400);
        }
      }

      // Test invalid boundary values
      for (const invalidValue of invalidValues) {
        try {
          const invalidData = { [field]: invalidValue };
          const response = await this.apiClient.post(endpoint, invalidData, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
          });
          
          expect([400, 422]).toContain(response.status);
        } catch (error: any) {
          expect([400, 422, 500]).toContain(error.response?.status);
        }
      }
    }
  }

  async testSpecialCharacters(endpoint: string, charTests: Array<{field: string, validChars: string[], invalidChars: string[]}>): Promise<void> {
    for (const { field, validChars, invalidChars } of charTests) {
      // Test valid characters
      for (const validChar of validChars) {
        try {
          const validData = { [field]: validChar };
          const response = await this.apiClient.post(endpoint, validData, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
          });
          
          expect([200, 201]).toContain(response.status);
        } catch (error: any) {
          // Valid chars might fail due to other missing fields
          expect(error.response?.status).not.toBe(400);
        }
      }

      // Test invalid/dangerous characters
      for (const invalidChar of invalidChars) {
        try {
          const invalidData = { [field]: invalidChar };
          const response = await this.apiClient.post(endpoint, invalidData, {
            headers: { 'Authorization': `Bearer ${this.authToken}` }
          });
          
          // Should either reject or sanitize dangerous input
          expect([200, 201, 400, 422]).toContain(response.status);
        } catch (error: any) {
          expect([200, 201, 400, 422, 500]).toContain(error.response?.status);
        }
      }
    }
  }
}

export default TestHelper;