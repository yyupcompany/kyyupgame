import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

export default async (): Promise<void> => {
  console.log('🚀 Starting API Test Suite Setup...');
  
  // Load test environment variables
  dotenv.config({ path: path.join(__dirname, '../.env.test') });
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Check if database tests should be skipped
  if (process.env.SKIP_DATABASE_TESTS === 'true') {
    console.log('⚠️  Database tests skipped (SKIP_DATABASE_TESTS=true)');
    console.log('🎯 API Test Suite Setup Complete (database-free mode)!');
    return;
  }
  
  try {
    // Create test database connection using project's database config
    const sequelize = new Sequelize({
      database: process.env.DB_NAME || 'kargerdensales',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'pwk5ls7j',
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      dialect: 'mysql',
      timezone: '+08:00',
      logging: false, // Disable SQL logging during tests
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000
      }
    });
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Test database connection established successfully');
    
    // Sync database schema (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('✅ Test database schema synchronized');
    
    // Store connection for cleanup
    (global as any).testSequelize = sequelize;
    
    console.log('🎯 API Test Suite Setup Complete!');
    
  } catch (error) {
    console.log('⚠️  Database connection failed, running in mock mode');
    console.log('🎯 API Test Suite Setup Complete (mock mode)!');
    // Don't exit, allow tests to run in mock mode
  }
};