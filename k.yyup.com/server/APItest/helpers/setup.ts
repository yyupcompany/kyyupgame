import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// Setup test environment
beforeAll(async () => {
  // Ensure test environment is set
  process.env.NODE_ENV = 'test';
  
  // Set test database connection
  if (!process.env.TEST_DB_HOST) {
    process.env.TEST_DB_HOST = 'localhost';
  }
  if (!process.env.TEST_DB_NAME) {
    process.env.TEST_DB_NAME = 'kindergarten_test';
  }
  if (!process.env.TEST_DB_USER) {
    process.env.TEST_DB_USER = 'root';
  }
  if (!process.env.TEST_DB_PASSWORD) {
    process.env.TEST_DB_PASSWORD = '';
  }
});

// Cleanup after each test
afterEach(async () => {
  // Clear any test data if needed
  jest.clearAllMocks();
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidApiResponse(): R;
      toBeValidDatabase(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toHaveValidApiResponse(received) {
    const pass = received && 
      typeof received.success === 'boolean' &&
      received.hasOwnProperty('data') &&
      received.hasOwnProperty('message');
    
    return {
      message: () => 
        `expected ${received} to be a valid API response with success, data, and message properties`,
      pass,
    };
  },
  
  toBeValidDatabase(received) {
    const pass = received instanceof Sequelize;
    
    return {
      message: () => 
        `expected ${received} to be a valid Sequelize database instance`,
      pass,
    };
  },
});

// Mock common dependencies
jest.mock('../../src/config/database', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
  }
}));

export {};