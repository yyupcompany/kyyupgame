const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('✅ Connected');

    // 创建4个表
    const tables = [
      `CREATE TABLE IF NOT EXISTS sop_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('course','sales','activity') NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20) DEFAULT '#409EFF',
        is_system BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_by INT,
        tenant_id INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS sop_template_nodes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_id INT NOT NULL,
        node_order INT NOT NULL,
        node_name VARCHAR(100) NOT NULL,
        node_description TEXT,
        content_type ENUM('text','video','image','audio','mixed') DEFAULT 'mixed',
        content_data JSON,
        feedback_config JSON,
        duration_days INT DEFAULT 7,
        is_required BOOLEAN DEFAULT TRUE,
        checklist JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS sop_instances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_id INT NOT NULL,
        teacher_id INT NOT NULL,
        customer_id INT,
        instance_name VARCHAR(100),
        current_node_order INT DEFAULT 1,
        status ENUM('in_progress','completed','abandoned') DEFAULT 'in_progress',
        start_date DATE,
        end_date DATE,
        custom_nodes JSON,
        notes TEXT,
        tenant_id INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS sop_node_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        instance_id INT NOT NULL,
        node_order INT NOT NULL,
        status ENUM('pending','in_progress','completed','skipped') DEFAULT 'pending',
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        feedback_data JSON,
        notes TEXT,
        attachments JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`
    ];

    for (const sql of tables) {
      await conn.execute(sql);
    }

    console.log('✅ Tables created');

    // 插入模板
    await conn.execute(`
      INSERT INTO sop_templates (name, type, description, icon, color, is_system, tenant_id)
      VALUES ('标准销售跟进流程', 'sales', '幼儿园招生标准SOP流程', 'TrendingUp', '#67C23A', TRUE, 1)
    `);

    const [result] = await conn.execute('SELECT LAST_INSERT_ID() as id');
    const templateId = result[0].id;

    console.log(`✅ Template created, ID: ${templateId}`);

    // 插入节点
    const nodes = [
      [1, '初次联系', '建立首次联系，了解基本需求'],
      [2, '预约参观', '邀请客户实地参观园区'],
      [3, '试听体验', '安排孩子体验课程'],
      [4, '方案讲解', '讲解报名方案和政策'],
      [5, '签约成交', '完成报名签约手续']
    ];

    for (const [order, name, desc] of nodes) {
      await conn.execute(
        `INSERT INTO sop_template_nodes (template_id, node_order, node_name, node_description, duration_days)
         VALUES (?, ?, ?, ?, ?)`,
        [templateId, order, name, desc, order === 1 || order === 5 ? 3 : order === 2 || order === 4 ? 5 : 7]
      );
    }

    console.log(`✅ ${nodes.length} nodes created`);

    await conn.end();
    console.log('🎉 Migration complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
