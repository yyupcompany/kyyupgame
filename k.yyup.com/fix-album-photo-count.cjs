const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// 数据库连接配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales',
  charset: 'utf8mb4'
};

async function fixAlbumPhotoCount() {
  let connection;

  try {
    console.log('🔧 连接数据库...');
    connection = await mysql.createConnection(dbConfig);

    // 查询当前相册和实际照片数量
    console.log('📊 查询当前数据状态...');

    // 先检查表结构
    const [tableDesc] = await connection.execute('DESCRIBE photo_albums');
    console.log('photo_albums表结构:', tableDesc);

    const [albums] = await connection.execute('SELECT id, name, photo_count FROM photo_albums WHERE id = 1');

    // 检查photo_album_items表结构
    const [itemsTableDesc] = await connection.execute('DESCRIBE photo_album_items');
    console.log('photo_album_items表结构:', itemsTableDesc);

    const [actualPhotos] = await connection.execute('SELECT COUNT(*) as count FROM photo_album_items WHERE album_id = 1');

    console.log('相册信息:', albums[0]);
    console.log('photo_album_items关联数量:', actualPhotos[0].count);

    // 检查实际的Photo表状态
    const [allPhotos] = await connection.execute('SELECT COUNT(*) as count FROM photos');
    const [publishedPhotos] = await connection.execute('SELECT COUNT(*) as count FROM photos WHERE status = "published"');
    const [unpublishedPhotos] = await connection.execute('SELECT COUNT(*) as count FROM photos WHERE status != "published"');

    console.log('Photo表总数:', allPhotos[0].count);
    console.log('已发布照片数:', publishedPhotos[0].count);
    console.log('未发布照片数:', unpublishedPhotos[0].count);

    // 检查通过关联查询能找到多少照片
    const [actualPublishedPhotos] = await connection.execute(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM photos p
      INNER JOIN photo_album_items pai ON p.id = pai.photo_id
      WHERE pai.album_id = 1 AND p.status = 'published'
    `);
    console.log('关联查询已发布照片数:', actualPublishedPhotos[0].count);

    // 检查是否有未发布的照片
    const [actualUnpublishedPhotos] = await connection.execute(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM photos p
      INNER JOIN photo_album_items pai ON p.id = pai.photo_id
      WHERE pai.album_id = 1 AND p.status != 'published'
    `);
    console.log('关联查询未发布照片数:', actualUnpublishedPhotos[0].count);

    console.log('\n📊 数据分析结论:');
    console.log('相册photoCount:', albums[0].photo_count);
    console.log('实际关联总数:', actualPhotos[0].count);
    console.log('关联已发布数:', actualPublishedPhotos[0].count);
    console.log('关联未发布数:', actualUnpublishedPhotos[0].count);

    console.log('\n🔍 差异原因分析:');
    if (albums[0].photo_count === actualPhotos[0].count) {
      console.log('✅ 相册photoCount与实际关联数一致');
    } else {
      console.log('❌ 相册photoCount与实际关联数不一致');
    }

    if (actualPublishedPhotos[0].count === 7) {
      console.log('✅ 照片API返回7张是正确的，因为有', actualUnpublishedPhotos[0].count, '张照片未发布');
    } else {
      console.log('❌ 照片API数据不符合预期');
    }

  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行修复
fixAlbumPhotoCount();