/**
 * 查询数据库中已有的页面说明文档
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yyup2024',
  database: process.env.DB_NAME || 'kargerdensales',
  charset: 'utf8mb4'
};

async function queryExistingPageGuides() {
  let connection;
  
  try {
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 先检查表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'page_guides'"
    );

    if (tables.length === 0) {
      console.log('⚠️  page_guides 表不存在\n');
      return;
    }

    // 查看表结构
    const [columns] = await connection.execute(
      'SHOW COLUMNS FROM page_guides'
    );

    console.log('📋 page_guides 表结构:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });
    console.log('');

    // 查询所有页面说明文档
    const [pageGuides] = await connection.execute(
      'SELECT * FROM page_guides ORDER BY importance DESC, id ASC'
    );

    console.log('================================================================================');
    console.log('📊 数据库中已有的页面说明文档');
    console.log('================================================================================\n');

    if (pageGuides.length === 0) {
      console.log('⚠️  数据库中没有页面说明文档\n');
    } else {
      console.log(`📄 共找到 ${pageGuides.length} 个页面说明文档:\n`);
      
      for (const guide of pageGuides) {
        console.log(`${guide.is_active ? '✅' : '❌'} [${guide.category}] ${guide.page_name}`);
        console.log(`   路径: ${guide.page_path}`);
        console.log(`   重要性: ${guide.importance}/10`);
        console.log(`   描述: ${guide.page_description ? guide.page_description.substring(0, 100) : '无描述'}...`);

        // 查询该页面的功能板块
        const [sections] = await connection.execute(
          'SELECT * FROM page_guide_sections WHERE page_guide_id = ? ORDER BY sort_order ASC',
          [guide.id]
        );

        if (sections.length > 0) {
          console.log(`   功能板块 (${sections.length}个):`);
          sections.forEach((section, index) => {
            console.log(`      ${index + 1}. ${section.section_name} - ${section.section_path || '无路径'}`);
          });
        }

        console.log('');
      }
    }

    console.log('================================================================================\n');

    // 检查缺失的常用页面
    const commonPages = [
      '/notifications',
      '/dashboard',
      '/centers/customer-pool',
      '/centers/supervision',
      '/centers/enrollment',
      '/centers/activity',
      '/centers/ai'
    ];

    const existingPaths = pageGuides.map(g => g.page_path);
    const missingPages = commonPages.filter(path => !existingPaths.includes(path));

    if (missingPages.length > 0) {
      console.log('⚠️  缺失的常用页面说明文档:');
      missingPages.forEach(path => {
        console.log(`   ❌ ${path}`);
      });
      console.log('');
    } else {
      console.log('✅ 所有常用页面都有说明文档\n');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
queryExistingPageGuides();

