const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: console.log,
  timezone: '+08:00'
});

async function createPosterCategories() {
  try {
    console.log('🚀 开始创建海报模板分类系统...');

    // 1. 创建海报分类表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS poster_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL COMMENT '分类名称',
        code VARCHAR(30) NOT NULL UNIQUE COMMENT '分类代码',
        description VARCHAR(200) NULL COMMENT '分类描述',
        icon VARCHAR(50) NULL COMMENT '分类图标',
        color VARCHAR(20) NULL COMMENT '分类颜色',
        sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
        status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
        parent_id INT NULL COMMENT '父分类ID',
        level TINYINT NOT NULL DEFAULT 1 COMMENT '分类层级',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_code (code),
        INDEX idx_parent_id (parent_id),
        INDEX idx_status (status),
        INDEX idx_sort (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='海报模板分类表'
    `);

    console.log('✅ 海报分类表创建成功');

    // 2. 插入基础分类数据
    const categories = [
      // 一级分类
      { name: '招生宣传', code: 'enrollment', description: '用于幼儿园招生宣传的海报模板', icon: 'UserPlus', color: '#409EFF', sort_order: 1, level: 1 },
      { name: '活动推广', code: 'activity', description: '用于各类活动推广的海报模板', icon: 'Calendar', color: '#67C23A', sort_order: 2, level: 1 },
      { name: '节日庆祝', code: 'festival', description: '用于节日庆祝的海报模板', icon: 'Gift', color: '#E6A23C', sort_order: 3, level: 1 },
      { name: '通知公告', code: 'notice', description: '用于通知公告的海报模板', icon: 'Bell', color: '#F56C6C', sort_order: 4, level: 1 },
      { name: '教育教学', code: 'education', description: '用于教育教学的海报模板', icon: 'Book', color: '#909399', sort_order: 5, level: 1 },
      { name: '安全健康', code: 'safety', description: '用于安全健康宣传的海报模板', icon: 'Shield', color: '#606266', sort_order: 6, level: 1 }
    ];

    // 清空现有数据
    await sequelize.query('DELETE FROM poster_categories');
    console.log('🧹 清空现有分类数据');

    // 插入一级分类
    for (const category of categories) {
      await sequelize.query(`
        INSERT INTO poster_categories (
          name, code, description, icon, color, sort_order, status, level
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          category.name, category.code, category.description,
          category.icon, category.color, category.sort_order, 1, category.level
        ]
      });
    }

    console.log('✅ 一级分类数据插入成功');

    // 3. 获取一级分类ID，插入二级分类
    const enrollmentResult = await sequelize.query(
      'SELECT id FROM poster_categories WHERE code = "enrollment"',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const activityResult = await sequelize.query(
      'SELECT id FROM poster_categories WHERE code = "activity"',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const festivalResult = await sequelize.query(
      'SELECT id FROM poster_categories WHERE code = "festival"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const enrollmentId = enrollmentResult[0]?.id;
    const activityId = activityResult[0]?.id;
    const festivalId = festivalResult[0]?.id;

    // 二级分类数据
    const subCategories = [
      // 招生宣传子分类
      { name: '春季招生', code: 'spring_enrollment', description: '春季招生宣传', parent_id: enrollmentId, level: 2, sort_order: 1 },
      { name: '秋季招生', code: 'autumn_enrollment', description: '秋季招生宣传', parent_id: enrollmentId, level: 2, sort_order: 2 },
      { name: '插班招生', code: 'transfer_enrollment', description: '插班招生宣传', parent_id: enrollmentId, level: 2, sort_order: 3 },
      { name: '特色班招生', code: 'special_enrollment', description: '特色班招生宣传', parent_id: enrollmentId, level: 2, sort_order: 4 },

      // 活动推广子分类
      { name: '亲子活动', code: 'parent_child', description: '亲子互动活动', parent_id: activityId, level: 2, sort_order: 1 },
      { name: '户外活动', code: 'outdoor', description: '户外活动推广', parent_id: activityId, level: 2, sort_order: 2 },
      { name: '文艺演出', code: 'performance', description: '文艺演出活动', parent_id: activityId, level: 2, sort_order: 3 },
      { name: '体育运动', code: 'sports', description: '体育运动活动', parent_id: activityId, level: 2, sort_order: 4 },

      // 节日庆祝子分类
      { name: '春节', code: 'spring_festival', description: '春节庆祝活动', parent_id: festivalId, level: 2, sort_order: 1 },
      { name: '儿童节', code: 'children_day', description: '六一儿童节庆祝', parent_id: festivalId, level: 2, sort_order: 2 },
      { name: '中秋节', code: 'mid_autumn', description: '中秋节庆祝活动', parent_id: festivalId, level: 2, sort_order: 3 },
      { name: '国庆节', code: 'national_day', description: '国庆节庆祝活动', parent_id: festivalId, level: 2, sort_order: 4 }
    ];

    // 插入二级分类
    for (const subCategory of subCategories) {
      if (subCategory.parent_id) {
        await sequelize.query(`
          INSERT INTO poster_categories (
            name, code, description, parent_id, level, sort_order, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, {
          replacements: [
            subCategory.name, subCategory.code, subCategory.description,
            subCategory.parent_id, subCategory.level, subCategory.sort_order, 1
          ]
        });
      }
    }

    console.log('✅ 二级分类数据插入成功');

    // 4. 更新现有模板的分类
    await sequelize.query(`
      UPDATE poster_templates 
      SET category = 'festival' 
      WHERE name LIKE '%六一%' OR name LIKE '%儿童节%'
    `);

    await sequelize.query(`
      UPDATE poster_templates 
      SET category = 'activity' 
      WHERE name LIKE '%亲子%' OR name LIKE '%活动%'
    `);

    await sequelize.query(`
      UPDATE poster_templates 
      SET category = 'education' 
      WHERE name LIKE '%科学%' OR name LIKE '%实验%' OR name LIKE '%教学%'
    `);

    console.log('✅ 现有模板分类更新成功');

    // 5. 查询并显示结果
    const result = await sequelize.query(`
      SELECT 
        c1.name as category_name,
        c1.code as category_code,
        c1.description,
        c1.icon,
        c1.color,
        c2.name as sub_category_name,
        c2.code as sub_category_code
      FROM poster_categories c1
      LEFT JOIN poster_categories c2 ON c1.id = c2.parent_id
      WHERE c1.level = 1
      ORDER BY c1.sort_order, c2.sort_order
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('\n📊 分类系统创建完成，当前分类结构：');
    let currentCategory = '';
    result.forEach(row => {
      if (row.category_name !== currentCategory) {
        currentCategory = row.category_name;
        console.log(`\n🏷️  ${row.category_name} (${row.category_code})`);
        console.log(`   📝 ${row.description}`);
        console.log(`   🎨 图标: ${row.icon}, 颜色: ${row.color}`);
      }
      if (row.sub_category_name) {
        console.log(`   └── ${row.sub_category_name} (${row.sub_category_code})`);
      }
    });

    console.log('\n🎉 海报模板分类系统创建完成！');

  } catch (error) {
    console.error('❌ 创建分类系统失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
if (require.main === module) {
  createPosterCategories();
}

module.exports = { createPosterCategories };
