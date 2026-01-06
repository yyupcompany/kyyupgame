/**
 * 创建 permission_api_mappings 表的脚本
 */

const mysql = require('mysql2/promise');

async function createTable() {
  let connection;
  
  try {
    // 加载环境变量
    require('dotenv').config();

    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'kindergarten_management_dev'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 创建表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permission_api_mappings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        permission_code VARCHAR(100) NOT NULL COMMENT '权限代码',
        permission_path VARCHAR(255) NOT NULL COMMENT '权限路径',
        api_endpoint VARCHAR(255) NOT NULL COMMENT 'API端点',
        api_method ENUM('GET', 'POST', 'PUT', 'DELETE') NOT NULL COMMENT 'HTTP方法',
        tool_name VARCHAR(100) NOT NULL COMMENT '工具名称',
        tool_description TEXT NOT NULL COMMENT '工具描述',
        tool_parameters JSON COMMENT '工具参数定义',
        related_tables JSON COMMENT '相关数据库表',
        query_type ENUM('list', 'detail', 'statistics', 'analysis') NOT NULL COMMENT '查询类型',
        is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_permission_code (permission_code),
        INDEX idx_tool_name (tool_name),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限-API-工具映射表'
    `);
    
    console.log('✅ 表创建成功');
    
    // 插入初始数据
    await connection.query(`
      INSERT IGNORE INTO permission_api_mappings 
      (permission_code, permission_path, api_endpoint, api_method, tool_name, tool_description, tool_parameters, related_tables, query_type, is_active)
      VALUES
      ('ACTIVITY_CENTER_VIEW', '/centers/activity', '/api/activities', 'GET', 'query_activities', '查询活动列表，支持筛选和分页', 
       '{"type":"object","properties":{"filters":{"type":"object","properties":{"status":{"type":"string","description":"活动状态"},"type":{"type":"string","description":"活动类型"}}}}}',
       '["activities", "activity_registrations"]', 'list', TRUE),
      
      ('ACTIVITY_CENTER_VIEW', '/centers/activity', '/api/activities/statistics', 'GET', 'get_activity_statistics', '获取活动统计数据',
       '{"type":"object","properties":{"timeRange":{"type":"string","description":"时间范围"}}}',
       '["activities", "activity_registrations", "activity_evaluations"]', 'statistics', TRUE),
      
      ('ENROLLMENT_CENTER_VIEW', '/centers/enrollment', '/api/enrollment-applications', 'GET', 'query_enrollment_applications', '查询招生申请列表',
       '{"type":"object","properties":{"filters":{"type":"object"}}}',
       '["enrollment_applications", "students"]', 'list', TRUE),
      
      ('ENROLLMENT_CENTER_VIEW', '/centers/enrollment', '/api/enrollment/statistics', 'GET', 'get_enrollment_statistics', '获取招生统计数据',
       '{"type":"object","properties":{"timeRange":{"type":"string"}}}',
       '["enrollment_applications", "enrollment_plans"]', 'statistics', TRUE),
      
      ('STUDENT_MANAGEMENT_VIEW', '/centers/student', '/api/students', 'GET', 'query_students', '查询学生列表',
       '{"type":"object","properties":{"filters":{"type":"object"}}}',
       '["students", "classes"]', 'list', TRUE),
      
      ('TEACHER_MANAGEMENT_VIEW', '/centers/teacher', '/api/teachers', 'GET', 'query_teachers', '查询教师列表',
       '{"type":"object","properties":{"filters":{"type":"object"}}}',
       '["teachers", "classes"]', 'list', TRUE),
      
      ('CLASS_MANAGEMENT_VIEW', '/centers/class', '/api/classes', 'GET', 'query_classes', '查询班级列表',
       '{"type":"object","properties":{"filters":{"type":"object"}}}',
       '["classes", "students", "teachers"]', 'list', TRUE)
    `);
    
    console.log('✅ 初始数据插入成功');
    
    // 查询验证
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM permission_api_mappings');
    console.log(`✅ 表中共有 ${rows[0].count} 条记录`);
    
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTable();

