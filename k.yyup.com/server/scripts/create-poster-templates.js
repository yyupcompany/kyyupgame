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

async function createPosterTemplates() {
  try {
    console.log('🚀 开始创建海报模板数据...');

    // 海报模板数据
    const templates = [
      // 招生宣传类
      {
        name: '春季招生宣传海报',
        description: '温馨明亮的春季招生宣传海报，突出幼儿园的教育理念',
        category: 'enrollment',
        width: 750,
        height: 1334,
        background: '#FFE4E1',
        thumbnail: '/templates/thumbs/spring-enrollment.jpg',
        usage_count: 25,
        status: 1,
        remark: '春季招生专用模板，温馨明亮风格'
      },
      {
        name: '秋季入学招生海报',
        description: '金秋主题的招生海报，展现收获与成长的理念',
        category: 'enrollment',
        width: 750,
        height: 1334,
        background: '#FFF8DC',
        thumbnail: '/templates/thumbs/autumn-enrollment.jpg',
        usage_count: 18,
        status: 1,
        remark: '秋季招生专用模板，金秋收获主题'
      },
      {
        name: '插班生招募海报',
        description: '针对插班生的专门招募海报，强调融入与关爱',
        category: 'enrollment',
        width: 750,
        height: 1334,
        background: '#E6F3FF',
        thumbnail: '/templates/thumbs/transfer-enrollment.jpg',
        usage_count: 12,
        status: 1,
        remark: '插班生招募专用，关爱融入主题'
      },

      // 活动推广类
      {
        name: '亲子运动会海报',
        description: '充满活力的亲子运动会宣传海报',
        category: 'activity',
        width: 750,
        height: 1334,
        background: '#F0F8FF',
        thumbnail: '/templates/thumbs/sports-day.jpg',
        usage_count: 32,
        status: 1,
        remark: '亲子运动会专用，活力健康主题'
      },
      {
        name: '户外探索活动海报',
        description: '自然探索主题的户外活动宣传海报',
        category: 'activity',
        width: 750,
        height: 1334,
        background: '#F5FFFA',
        thumbnail: '/templates/thumbs/outdoor-exploration.jpg',
        usage_count: 28,
        status: 1,
        remark: '户外探索活动专用，自然冒险主题'
      },
      {
        name: '文艺汇演海报',
        description: '精美的文艺汇演宣传海报，展现孩子们的才艺',
        category: 'activity',
        width: 750,
        height: 1334,
        background: '#FFF0F5',
        thumbnail: '/templates/thumbs/art-performance.jpg',
        usage_count: 22,
        status: 1,
        remark: '文艺汇演专用，才艺表演主题'
      },

      // 节日庆祝类
      {
        name: '六一儿童节庆祝海报',
        description: '欢乐的六一儿童节庆祝海报，充满童趣',
        category: 'festival',
        width: 750,
        height: 1334,
        background: '#FFFACD',
        thumbnail: '/templates/thumbs/childrens-day.jpg',
        usage_count: 45,
        status: 1,
        remark: '六一儿童节专用，欢乐童趣主题'
      },
      {
        name: '中秋节庆祝海报',
        description: '温馨的中秋节庆祝海报，体现团圆主题',
        category: 'festival',
        width: 750,
        height: 1334,
        background: '#FFF8DC',
        thumbnail: '/templates/thumbs/mid-autumn.jpg',
        usage_count: 19,
        status: 1,
        remark: '中秋节专用，团圆温馨主题'
      },
      {
        name: '国庆节庆祝海报',
        description: '爱国主题的国庆节庆祝海报',
        category: 'festival',
        width: 750,
        height: 1334,
        background: '#FFE4E1',
        thumbnail: '/templates/thumbs/national-day.jpg',
        usage_count: 16,
        status: 1,
        remark: '国庆节专用，爱国庆祝主题'
      },

      // 通知公告类
      {
        name: '开学通知海报',
        description: '正式的开学通知海报模板',
        category: 'notice',
        width: 750,
        height: 1334,
        background: '#F0F8FF',
        thumbnail: '/templates/thumbs/school-notice.jpg',
        usage_count: 35,
        status: 1,
        remark: '开学通知专用，正式重要主题'
      },
      {
        name: '家长会通知海报',
        description: '家长会通知海报，强调重要性和参与度',
        category: 'notice',
        width: 750,
        height: 1334,
        background: '#FFF5EE',
        thumbnail: '/templates/thumbs/parent-meeting.jpg',
        usage_count: 28,
        status: 1,
        remark: '家长会通知专用，重要参与主题'
      },

      // 教育教学类
      {
        name: '科学实验课海报',
        description: '趣味科学实验课程宣传海报',
        category: 'education',
        width: 750,
        height: 1334,
        background: '#E0FFFF',
        thumbnail: '/templates/thumbs/science-class.jpg',
        usage_count: 21,
        status: 1,
        remark: '科学实验课专用，趣味学习主题'
      },
      {
        name: '艺术创作课海报',
        description: '创意艺术课程宣传海报，激发创造力',
        category: 'education',
        width: 750,
        height: 1334,
        background: '#FFF0F5',
        thumbnail: '/templates/thumbs/art-class.jpg',
        usage_count: 17,
        status: 1,
        remark: '艺术创作课专用，创意想象主题'
      }
    ];

    // 清空现有模板数据（可选）
    console.log('🧹 清理现有模板数据...');
    await sequelize.query('DELETE FROM poster_templates WHERE id > 100'); // 保留前100个，删除测试数据

    // 插入新的模板数据
    console.log('📝 插入新的模板数据...');
    for (const template of templates) {
      await sequelize.query(`
        INSERT INTO poster_templates (
          name, description, category, width, height, background, thumbnail,
          usage_count, status, remark, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          template.name, template.description, template.category,
          template.width, template.height, template.background, template.thumbnail,
          template.usage_count, template.status, template.remark
        ]
      });
    }

    console.log('✅ 海报模板数据创建完成！');

    // 查询并显示结果
    const result = await sequelize.query(`
      SELECT 
        id, name, category, usage_count, status, created_at
      FROM poster_templates 
      WHERE id > 100
      ORDER BY category, usage_count DESC
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('\n📊 新创建的模板列表：');
    let currentCategory = '';
    result.forEach(template => {
      if (template.category !== currentCategory) {
        currentCategory = template.category;
        console.log(`\n🏷️  分类: ${template.category}`);
      }
      console.log(`   📄 ${template.name} (使用${template.usage_count}次) - ID: ${template.id}`);
    });

    console.log(`\n🎉 总共创建了 ${templates.length} 个海报模板！`);

  } catch (error) {
    console.error('❌ 创建海报模板数据失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
if (require.main === module) {
  createPosterTemplates();
}

module.exports = { createPosterTemplates };
