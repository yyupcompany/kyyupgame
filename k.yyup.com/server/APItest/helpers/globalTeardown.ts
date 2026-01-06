export default async (): Promise<void> => {
  console.log('🧹 Starting API Test Suite Teardown...');
  
  try {
    // Close test database connection
    const sequelize = (global as any).testSequelize;
    if (sequelize) {
      await sequelize.close();
      console.log('✅ Test database connection closed');
    }
    
    // Clean up any test files or resources
    // Add any additional cleanup logic here
    
    console.log('🎯 API Test Suite Teardown Complete!');
    
  } catch (error) {
    console.error('❌ Failed to teardown test environment:', error);
  }
};