import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'kargerdensales',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: false,
  timezone: '+08:00'
});

async function addGroupIdToTeachers() {
  try {
    console.log('🔌 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 检查 group_id 列是否已存在
    console.log('🔍 检查 teachers 表结构...');
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM teachers LIKE 'group_id'
    `);

    if (columns.length > 0) {
      console.log('✅ group_id 列已存在，无需添加\n');
      console.log('📋 列信息:');
      console.log(`   类型: ${columns[0].Type}`);
      console.log(`   允许NULL: ${columns[0].Null}`);
      console.log(`   默认值: ${columns[0].Default || '无'}`);
      console.log(`   注释: ${columns[0].Comment || '无'}\n`);
    } else {
      console.log('❌ group_id 列不存在，正在添加...\n');

      // 2. 添加 group_id 列
      await sequelize.query(`
        ALTER TABLE teachers 
        ADD COLUMN group_id INT NULL 
        COMMENT '所属集团ID' 
        AFTER kindergarten_id
      `);

      console.log('✅ group_id 列添加成功\n');

      // 3. 添加外键约束
      console.log('🔧 添加外键约束...');
      try {
        await sequelize.query(`
          ALTER TABLE teachers 
          ADD CONSTRAINT fk_teachers_group_id 
          FOREIGN KEY (group_id) 
          REFERENCES groups(id) 
          ON UPDATE CASCADE 
          ON DELETE SET NULL
        `);
        console.log('✅ 外键约束添加成功\n');
      } catch (error) {
        console.log('⚠️  外键约束添加失败（可能已存在）:', error.message, '\n');
      }

      // 4. 从 kindergartens 表更新 group_id
      console.log('🔄 从 kindergartens 表更新 group_id...');
      const result = await sequelize.query(`
        UPDATE teachers t
        SET t.group_id = (
          SELECT k.group_id FROM kindergartens k 
          WHERE k.id = t.kindergarten_id
        )
        WHERE t.group_id IS NULL AND t.kindergarten_id IS NOT NULL
      `);

      console.log(`✅ 更新完成，影响行数: ${result[1]}\n`);
    }

    // 5. 验证结果
    console.log('📊 验证结果:');
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_teachers,
        COUNT(group_id) as teachers_with_group,
        COUNT(*) - COUNT(group_id) as teachers_without_group
      FROM teachers
    `);

    const stat = stats[0];
    console.log(`   总教师数: ${stat.total_teachers}`);
    console.log(`   有 group_id 的教师: ${stat.teachers_with_group}`);
    console.log(`   没有 group_id 的教师: ${stat.teachers_without_group}\n`);

    // 6. 显示示例数据
    console.log('📋 示例数据:');
    const [examples] = await sequelize.query(`
      SELECT 
        t.id,
        t.teacher_no,
        t.kindergarten_id,
        t.group_id,
        k.name as kindergarten_name,
        g.name as group_name
      FROM teachers t
      LEFT JOIN kindergartens k ON t.kindergarten_id = k.id
      LEFT JOIN groups g ON t.group_id = g.id
      LIMIT 5
    `);

    console.table(examples);

    console.log('\n✅ 操作完成！');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

addGroupIdToTeachers();

