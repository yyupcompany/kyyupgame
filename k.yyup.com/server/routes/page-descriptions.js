const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

// 创建数据库连接
async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

/**
 * 获取页面说明信息
 * GET /api/page-descriptions/:pagePath
 */
router.get('/:pagePath(*)', async (req, res) => {
  let connection;
  try {
    const pagePath = '/' + req.params.pagePath;
    console.log('🔍 获取页面说明:', pagePath);

    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM page_descriptions WHERE page_path = ?',
      [pagePath]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '页面说明不存在',
        data: null
      });
    }

    const pageDescription = rows[0];
    
    // 解析JSON字段
    if (pageDescription.features) {
      pageDescription.features = JSON.parse(pageDescription.features);
    }
    if (pageDescription.help_content) {
      pageDescription.help_content = JSON.parse(pageDescription.help_content);
    }

    res.json({
      success: true,
      message: '获取页面说明成功',
      data: pageDescription
    });

  } catch (error) {
    console.error('获取页面说明失败:', error);
    res.status(500).json({
      success: false,
      message: '获取页面说明失败',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/**
 * 获取所有页面说明列表
 * GET /api/page-descriptions
 */
router.get('/', async (req, res) => {
  let connection;
  try {
    console.log('🔍 获取所有页面说明列表');

    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT page_path, page_title, page_description, created_at, updated_at FROM page_descriptions ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      message: '获取页面说明列表成功',
      data: rows
    });

  } catch (error) {
    console.error('获取页面说明列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取页面说明列表失败',
      error: error.message
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

/**
 * 搜索页面说明
 * GET /api/page-descriptions/search?keyword=关键词
 */
router.get('/search', async (req, res) => {
  let connection;
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: '请提供搜索关键词',
        data: null
      });
    }

    console.log('🔍 搜索页面说明:', keyword);

    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT page_path, page_title, page_description, created_at, updated_at
      FROM page_descriptions
      WHERE page_title LIKE ? OR page_description LIKE ? OR page_path LIKE ?
      ORDER BY created_at DESC
    `, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);

    res.json({
      success: true,
      message: '搜索页面说明成功',
      data: rows
    });

  } catch (error) {
    console.error('搜索页面说明失败:', error);
    res.status(500).json({
      success: false,
      message: '搜索页面说明失败',
      error: error.message
    });
  }
});

/**
 * 添加或更新页面说明
 * POST /api/page-descriptions
 */
router.post('/', async (req, res) => {
  try {
    const { page_path, page_title, page_description, features, help_content } = req.body;

    if (!page_path || !page_title) {
      return res.status(400).json({
        success: false,
        message: '页面路径和标题不能为空',
        data: null
      });
    }

    console.log('📝 添加/更新页面说明:', page_path);

    await db.execute(`
      INSERT INTO page_descriptions (page_path, page_title, page_description, features, help_content)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        page_title = VALUES(page_title),
        page_description = VALUES(page_description),
        features = VALUES(features),
        help_content = VALUES(help_content),
        updated_at = CURRENT_TIMESTAMP
    `, [
      page_path,
      page_title,
      page_description || '',
      features ? JSON.stringify(features) : null,
      help_content ? JSON.stringify(help_content) : null
    ]);

    res.json({
      success: true,
      message: '页面说明保存成功',
      data: { page_path, page_title }
    });

  } catch (error) {
    console.error('保存页面说明失败:', error);
    res.status(500).json({
      success: false,
      message: '保存页面说明失败',
      error: error.message
    });
  }
});

/**
 * 删除页面说明
 * DELETE /api/page-descriptions/:pagePath
 */
router.delete('/:pagePath(*)', async (req, res) => {
  try {
    const pagePath = '/' + req.params.pagePath;
    console.log('🗑️ 删除页面说明:', pagePath);

    const [result] = await db.execute(
      'DELETE FROM page_descriptions WHERE page_path = ?',
      [pagePath]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '页面说明不存在',
        data: null
      });
    }

    res.json({
      success: true,
      message: '页面说明删除成功',
      data: { page_path: pagePath }
    });

  } catch (error) {
    console.error('删除页面说明失败:', error);
    res.status(500).json({
      success: false,
      message: '删除页面说明失败',
      error: error.message
    });
  }
});

module.exports = router;
