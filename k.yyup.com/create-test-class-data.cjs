const mysql = require('mysql2/promise');

async function createTestClassData() {
  try {
    console.log('🚀 开始创建测试班级数据...\n');

    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('✅ 数据库连接成功\n');

    // 获取或创建幼儿园ID
    let kindergartenId;
    const [kindergartens] = await connection.execute(
      'SELECT id FROM kindergartens LIMIT 1'
    );
    
    if (kindergartens.length === 0) {
      console.log('⚠️ 没有找到幼儿园数据，正在创建测试幼儿园...\n');
      
      // 创建测试幼儿园
      const [result] = await connection.execute(
        `INSERT INTO kindergartens 
          (name, code, type, level, address, longitude, latitude, phone, email, principal, 
           established_date, area, building_area, class_count, teacher_count, student_count, status, created_at, updated_at)
        VALUES 
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          '测试幼儿园',
          'TEST001',
          1, // type
          1, // level
          '测试地址市测试区测试街道123号',
          116.397128, // longitude (北京经度示例)
          39.916527,  // latitude (北京纬度示例)
          '13800138000',
          'test@kindergarten.com',
          '张园长',
          '2020-01-01', // established_date
          1000, // area
          800,  // building_area
          0,    // class_count
          0,    // teacher_count
          0,    // student_count
          1     // status
        ]
      );
      
      kindergartenId = result.insertId;
      console.log(`✅ 创建测试幼儿园成功，ID: ${kindergartenId}\n`);
    } else {
      kindergartenId = kindergartens[0].id;
      console.log(`✅ 找到幼儿园ID: ${kindergartenId}\n`);
    }

    // 首先检查是否已有数据
    const [existingClasses] = await connection.execute(
      'SELECT COUNT(*) as total FROM classes WHERE deleted_at IS NULL'
    );
    
    if (existingClasses[0].total > 0) {
      console.log(`⚠️ 已存在 ${existingClasses[0].total} 条班级数据，跳过创建\n`);
      await connection.end();
      return;
    }

    // 创建测试班级数据
    const testClasses = [
      {
        name: '小班A',
        code: 'XBA001',
        grade: '小班',
        capacity: 25,
        current_student_count: 0,
        status: 1,
        description: '小班A班，适合3-4岁儿童'
      },
      {
        name: '小班B',
        code: 'XBB001',
        grade: '小班',
        capacity: 25,
        current_student_count: 0,
        status: 1,
        description: '小班B班，适合3-4岁儿童'
      },
      {
        name: '中班A',
        code: 'ZBA001',
        grade: '中班',
        capacity: 30,
        current_student_count: 0,
        status: 1,
        description: '中班A班，适合4-5岁儿童'
      },
      {
        name: '中班B',
        code: 'ZBB001',
        grade: '中班',
        capacity: 30,
        current_student_count: 0,
        status: 1,
        description: '中班B班，适合4-5岁儿童'
      },
      {
        name: '大班A',
        code: 'DBA001',
        grade: '大班',
        capacity: 35,
        current_student_count: 0,
        status: 1,
        description: '大班A班，适合5-6岁儿童'
      },
      {
        name: '大班B',
        code: 'DBB001',
        grade: '大班',
        capacity: 35,
        current_student_count: 0,
        status: 1,
        description: '大班B班，适合5-6岁儿童'
      }
    ];

    console.log('📝 开始插入班级数据...\n');

    for (const classData of testClasses) {
      const [result] = await connection.execute(
        `INSERT INTO classes 
          (name, code, grade, capacity, current_student_count, status, description, kindergarten_id, created_at, updated_at)
        VALUES 
          (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          classData.name,
          classData.code,
          classData.grade,
          classData.capacity,
          classData.current_student_count,
          classData.status,
          classData.description,
          kindergartenId
        ]
      );
      
      console.log(`✅ 创建班级成功: ${classData.name} (${classData.code}) - ID: ${result.insertId}`);
    }

    console.log('\n📊 验证创建结果...\n');

    // 查询验证
    const [classes] = await connection.execute(`
      SELECT 
        id, 
        name, 
        code, 
        grade, 
        capacity,
        current_student_count,
        status,
        created_at
      FROM classes 
      WHERE deleted_at IS NULL
      ORDER BY grade, name
    `);

    console.log('📝 当前班级数据:');
    console.log('─'.repeat(120));
    console.log(
      'ID'.padEnd(8) + 
      '班级名称'.padEnd(15) + 
      '班级编号'.padEnd(15) + 
      '年级'.padEnd(10) + 
      '容量'.padEnd(8) + 
      '当前人数'.padEnd(10) + 
      '状态'.padEnd(8) + 
      '创建时间'
    );
    console.log('─'.repeat(120));

    classes.forEach(cls => {
      console.log(
        String(cls.id).padEnd(8) +
        (cls.name || '').padEnd(15) +
        (cls.code || '').padEnd(15) +
        (cls.grade || '').padEnd(10) +
        String(cls.capacity || 0).padEnd(8) +
        String(cls.current_student_count || 0).padEnd(10) +
        String(cls.status || 0).padEnd(8) +
        (cls.created_at ? new Date(cls.created_at).toLocaleString('zh-CN') : '')
      );
    });
    console.log('─'.repeat(120));

    console.log(`\n✅ 成功创建 ${classes.length} 条班级数据\n`);

    await connection.end();

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createTestClassData();
