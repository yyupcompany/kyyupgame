const { Sequelize, DataTypes } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log,
  timezone: '+08:00',
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true,
    underscored: true,
  },
});

async function fixTeacherCustomersTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查表是否存在
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'teacher_customers'");
    
    if (tables.length === 0) {
      console.log('❌ teacher_customers 表不存在，开始创建...');
      
      // 创建 teacher_customers 表
      await sequelize.query(`
        CREATE TABLE teacher_customers (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT '客户ID',
          teacher_id INT NOT NULL COMMENT '分配的教师ID',
          customer_name VARCHAR(100) NOT NULL COMMENT '客户姓名',
          phone VARCHAR(20) NOT NULL COMMENT '联系电话',
          gender ENUM('MALE', 'FEMALE') COMMENT '性别',
          child_name VARCHAR(100) COMMENT '孩子姓名',
          child_age INT COMMENT '孩子年龄',
          source ENUM('ONLINE', 'REFERRAL', 'VISIT', 'PHONE', 'OTHER') NOT NULL DEFAULT 'ONLINE' COMMENT '来源渠道',
          status ENUM('NEW', 'FOLLOWING', 'CONVERTED', 'LOST') NOT NULL DEFAULT 'NEW' COMMENT '客户状态',
          last_follow_date DATETIME COMMENT '最后跟进时间',
          assign_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
          assigned_by INT COMMENT '分配人ID',
          remarks TEXT COMMENT '备注信息',
          deleted_at DATETIME COMMENT '删除时间',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          INDEX idx_teacher_customers_teacher_id (teacher_id),
          INDEX idx_teacher_customers_status (status),
          INDEX idx_teacher_customers_source (source),
          INDEX idx_teacher_customers_phone (phone)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教师客户分配表'
      `);
      
      console.log('✅ teacher_customers 表创建成功');
    } else {
      console.log('✅ teacher_customers 表已存在');
    }

    // 检查 customer_follow_records 表
    const [followTables] = await sequelize.query("SHOW TABLES LIKE 'customer_follow_records'");
    
    if (followTables.length === 0) {
      console.log('❌ customer_follow_records 表不存在，开始创建...');
      
      // 创建 customer_follow_records 表
      await sequelize.query(`
        CREATE TABLE customer_follow_records (
          id INT AUTO_INCREMENT PRIMARY KEY COMMENT '跟进记录ID',
          customer_id INT NOT NULL COMMENT '客户ID',
          teacher_id INT NOT NULL COMMENT '教师ID',
          follow_type VARCHAR(50) NOT NULL COMMENT '跟进方式',
          content TEXT NOT NULL COMMENT '跟进内容',
          next_follow_date DATETIME COMMENT '下次跟进时间',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
          INDEX idx_customer_follow_records_customer_id (customer_id),
          INDEX idx_customer_follow_records_teacher_id (teacher_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户跟进记录表'
      `);
      
      console.log('✅ customer_follow_records 表创建成功');
    } else {
      console.log('✅ customer_follow_records 表已存在');
    }

    // 插入一些测试数据
    console.log('\n🔍 检查是否需要插入测试数据...');
    
    const [customerCount] = await sequelize.query("SELECT COUNT(*) as count FROM teacher_customers");
    
    if (customerCount[0].count === 0) {
      console.log('📝 插入测试数据...');
      
      // 获取一个教师ID
      const [teachers] = await sequelize.query(`
        SELECT u.id 
        FROM users u 
        JOIN user_roles ur ON u.id = ur.user_id 
        JOIN roles r ON ur.role_id = r.id 
        WHERE r.name = 'teacher' 
        LIMIT 1
      `);
      
      if (teachers.length > 0) {
        const teacherId = teachers[0].id;
        
        await sequelize.query(`
          INSERT INTO teacher_customers (
            teacher_id, customer_name, phone, gender, child_name, child_age, 
            source, status, assign_date, remarks
          ) VALUES 
          (${teacherId}, '张女士', '138****1234', 'FEMALE', '张小明', 4, 'ONLINE', 'NEW', NOW(), '对我们的课程很感兴趣'),
          (${teacherId}, '李先生', '139****5678', 'MALE', '李小红', 5, 'REFERRAL', 'FOLLOWING', NOW(), '希望了解更多关于英语课程的信息'),
          (${teacherId}, '王女士', '137****9012', 'FEMALE', '王小华', 3, 'PHONE', 'CONVERTED', NOW(), '已成功报名'),
          (${teacherId}, '陈先生', '136****3456', 'MALE', '陈小强', 4, 'VISIT', 'FOLLOWING', NOW(), '上门咨询过，比较满意'),
          (${teacherId}, '刘女士', '135****7890', 'FEMALE', '刘小美', 5, 'ONLINE', 'NEW', NOW(), '网络咨询，还在考虑中')
        `);
        
        console.log('✅ 测试数据插入成功');
      } else {
        console.log('⚠️ 没有找到教师用户，跳过测试数据插入');
      }
    } else {
      console.log('✅ 已有客户数据，跳过插入');
    }

    console.log('\n🎉 teacher_customers 表修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await sequelize.close();
  }
}

fixTeacherCustomersTable();
