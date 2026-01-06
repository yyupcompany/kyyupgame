#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  user: 'root',
  password: 'pwk5ls7j',
  charset: 'utf8mb4'
};

async function checkReferralData() {
  const connection = await mysql.createConnection(dbConfig);
  
  console.log('=== referral_relationships 表结构 ===');
  const [columns] = await connection.execute(`
    SELECT column_name, data_type, is_nullable, column_default, column_comment
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'referral_relationships'
    ORDER BY ordinal_position
  `, [dbConfig.database]);
  
  console.log('字段数量:', columns.length);
  columns.forEach(col => {
    const name = col.column_name || col.COLUMN_NAME || '';
    const type = col.data_type || col.DATA_TYPE || '';
    const nullable = (col.is_nullable || col.IS_NULLABLE) === 'YES' ? 'NULL' : 'NOT NULL';
    const comment = col.column_comment || col.COLUMN_COMMENT || '';
    console.log(`${name} ${type} ${nullable} ${comment}`);
  });
  
  console.log('\n=== referral_relationships 数据统计 ===');
  const [count] = await connection.execute('SELECT COUNT(*) as total FROM referral_relationships');
  console.log('总记录数:', count[0].total);
  
  console.log('\n=== referrals 表结构 ===');
  const [columns2] = await connection.execute(`
    SELECT column_name, data_type, is_nullable, column_default, column_comment
    FROM information_schema.columns 
    WHERE table_schema = ? AND table_name = 'referrals'
    ORDER BY ordinal_position
  `, [dbConfig.database]);
  
  console.log('字段数量:', columns2.length);
  columns2.forEach(col => {
    const name = col.column_name || col.COLUMN_NAME || '';
    const type = col.data_type || col.DATA_TYPE || '';
    const nullable = (col.is_nullable || col.IS_NULLABLE) === 'YES' ? 'NULL' : 'NOT NULL';
    const comment = col.column_comment || col.COLUMN_COMMENT || '';
    console.log(`${name} ${type} ${nullable} ${comment}`);
  });
  
  console.log('\n=== referrals 数据统计 ===');
  const [count2] = await connection.execute('SELECT COUNT(*) as total FROM referrals');
  console.log('总记录数:', count2[0].total);

  if (count2[0].total > 0) {
    console.log('\n=== referrals 样本数据 ===');
    const [sample] = await connection.execute('SELECT * FROM referrals LIMIT 3');
    sample.forEach((row, index) => {
      console.log(`\n样本 ${index + 1}:`);
      console.log(JSON.stringify(row, null, 2));
    });

    console.log('\n=== referrals 状态字段值统计 ===');
    const [statusValues] = await connection.execute('SELECT DISTINCT status FROM referrals');
    console.log('status字段的值:', statusValues.map(r => r.status));

    console.log('\n=== 测试后端查询 ===');
    const [backendQuery] = await connection.execute(`
      SELECT
        r.*,
        u.real_name as referrer_name,
        u.phone as referrer_phone,
        a.title as activity_name
      FROM referrals r
      LEFT JOIN users u ON r.referrer_id = u.id
      LEFT JOIN activities a ON r.activity_id = a.id
      WHERE 1=1
      ORDER BY r.created_at DESC
      LIMIT 20 OFFSET 0
    `);
    console.log('后端查询结果数量:', backendQuery.length);
    if (backendQuery.length > 0) {
      console.log('第一条记录:');
      console.log(JSON.stringify(backendQuery[0], null, 2));
    }

    // 检查总数查询
    const [totalQuery] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM referrals r
      LEFT JOIN users u ON r.referrer_id = u.id
      WHERE 1=1
    `);
    console.log('总数查询结果:', totalQuery[0].total);
  }

  await connection.end();
}

checkReferralData().catch(console.error);
