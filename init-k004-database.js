/**
 * 手动初始化k004租户数据库
 */

const mysql = require('mysql2/promise');

// 数据库配置
const DB_CONFIG = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j'
};

const TENANT_CODE = 'k004';

async function initK004Database() {
  let connection;

  try {
    console.log('🔍 开始初始化k004租户数据库...');

    // 1. 连接数据库服务器
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ 数据库连接成功');

    // 2. 检查数据库是否存在
    await connection.query('USE `tenant_k004`');
    console.log('✅ tenant_k004数据库已存在');

    // 3. 创建业务表
    console.log('📝 开始创建业务表...');

    // 创建users表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        global_user_id INT NOT NULL,
        username VARCHAR(50) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        real_name VARCHAR(100),
        email VARCHAR(100),
        avatar VARCHAR(255),
        auth_source ENUM('local', 'unified', 'oauth') DEFAULT 'unified',
        status ENUM('active', 'inactive', 'locked') DEFAULT 'active',
        role ENUM('admin', 'parent', 'teacher', 'staff') DEFAULT 'parent',
        tenant_code VARCHAR(20) DEFAULT 'k004',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_global_user_id (global_user_id),
        INDEX idx_phone (phone),
        INDEX idx_tenant_code (tenant_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ users表创建成功');

    // 创建teachers表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        global_user_id INT,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        avatar VARCHAR(255),
        employee_id VARCHAR(50),
        position VARCHAR(100),
        department VARCHAR(100),
        education_background VARCHAR(200),
        experience_years INT DEFAULT 0,
        status ENUM('active', 'inactive') DEFAULT 'active',
        tenant_code VARCHAR(20) DEFAULT 'k004',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_global_user_id (global_user_id),
        INDEX idx_phone (phone),
        INDEX idx_tenant_code (tenant_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ teachers表创建成功');

    // 创建students表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        student_id VARCHAR(50),
        gender ENUM('male', 'female') NOT NULL,
        birth_date DATE,
        avatar VARCHAR(255),
        parent_phone VARCHAR(20),
        parent_name VARCHAR(100),
        emergency_contact VARCHAR(20),
        class_id INT,
        admission_date DATE,
        status ENUM('active', 'graduated', 'transferred') DEFAULT 'active',
        tenant_code VARCHAR(20) DEFAULT 'k004',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_parent_phone (parent_phone),
        INDEX idx_class_id (class_id),
        INDEX idx_tenant_code (tenant_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ students表创建成功');

    // 创建classes表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        grade VARCHAR(50) NOT NULL,
        teacher_id INT,
        max_students INT DEFAULT 30,
        current_students INT DEFAULT 0,
        classroom VARCHAR(50),
        description TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        tenant_code VARCHAR(20) DEFAULT 'k004',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_teacher_id (teacher_id),
        INDEX idx_tenant_code (tenant_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ classes表创建成功');

    // 创建ai_conversations表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_type ENUM('global', 'tenant') DEFAULT 'tenant',
        tenant_code VARCHAR(20) DEFAULT 'k004',
        title VARCHAR(200),
        model_name VARCHAR(100),
        conversation_id VARCHAR(100),
        status ENUM('active', 'completed', 'failed') DEFAULT 'active',
        total_tokens INT DEFAULT 0,
        cost DECIMAL(10,4) DEFAULT 0.0000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_tenant_code (tenant_code),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ ai_conversations表创建成功');

    // 检查表是否创建成功
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(table => Object.values(table)[0]);

    console.log(`\n📊 数据库初始化完成！`);
    console.log(`   - 总表数: ${tableNames.length}`);
    console.log('   - 创建的表:');

    const expectedTables = ['users', 'teachers', 'students', 'classes', 'ai_conversations'];
    expectedTables.forEach(tableName => {
      if (tableNames.includes(tableName)) {
        console.log(`     ✅ ${tableName}`);
      } else {
        console.log(`     ❌ ${tableName} (未创建)`);
      }
    });

    console.log('\n🎉 k004租户数据库初始化成功！');

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行初始化
initK004Database();