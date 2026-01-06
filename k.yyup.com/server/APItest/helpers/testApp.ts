/**
 * Test App Setup
 * Creates a properly configured Express app instance for unit testing
 */

import express, { Application } from 'express';
import cors from 'cors';
import { sequelize } from '../../src/init';
import routes from '../../src/routes';
import { errorHandler } from '../../src/middlewares/error.middleware';
import { responseFormatter } from '../../src/middlewares/response-formatter.middleware';

/**
 * Create a test app instance
 */
export function createTestApp(): Application {
  const app = express();

  // Basic middleware setup for testing
  app.use(cors({
    origin: ['http://localhost:5173', 'https://k.yyup.cc', 'http://k.yyup.cc'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Response formatting middleware
  app.use(responseFormatter);

  // API routes
  app.use('/api', routes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
  });

  // Error handling middleware
  app.use(errorHandler);

  return app;
}

/**
 * Initialize database connection for testing
 */
export async function initTestDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Test database connection established successfully');
    
    // Skip database sync in tests to avoid conflicts
    // await sequelize.sync({ alter: true });
    console.log('✅ Test database connection ready (skipping sync)');
  } catch (error) {
    console.error('❌ Test database initialization failed:', error);
    throw error;
  }
}

/**
 * Close database connection for testing
 */
export async function closeTestDatabase(): Promise<void> {
  try {
    await sequelize.close();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Failed to close test database connection:', error);
    throw error;
  }
}

export default { createTestApp, initTestDatabase, closeTestDatabase };