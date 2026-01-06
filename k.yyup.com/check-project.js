import mysql from 'mysql2/promise';

async function checkProject() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('🔍 检查项目ID 12的状态...\n');

    const [rows] = await connection.execute(
      'SELECT id, title, status, progress, progressMessage, LENGTH(scriptData) as scriptDataLength, createdAt, updatedAt FROM video_projects WHERE id = ?',
      [12]
    );

    if (rows.length === 0) {
      console.log('❌ 项目12不存在');
    } else {
      const project = rows[0];
      console.log('✅ 项目12状态:');
      console.log('  ID:', project.id);
      console.log('  标题:', project.title);
      console.log('  状态:', project.status);
      console.log('  进度:', project.progress);
      console.log('  进度消息:', project.progressMessage);
      console.log('  脚本数据长度:', project.scriptDataLength, 'bytes');
      console.log('  创建时间:', project.createdAt);
      console.log('  更新时间:', project.updatedAt);
    }

  } finally {
    await connection.end();
  }
}

checkProject().catch(console.error);

