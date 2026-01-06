import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  database: process.env.DB_DATABASE || 'kargerdensales',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
};

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务运行正常' });
});

// 认证路由
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'password123') {
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          username: 'admin',
          role: 'admin'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }
});

// AI模型列表API
app.get('/api/ai/models', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.query(`
      SELECT 
        id,
        name,
        display_name,
        provider,
        model_type,
        api_version,
        endpoint_url,
        api_key,
        model_parameters,
        is_default,
        description,
        capabilities,
        max_tokens,
        status,
        creator_id,
        created_at,
        updated_at
      FROM ai_model_config 
      WHERE status = 'active'
      ORDER BY created_at DESC
    `);

    await connection.end();

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: results
    });
  } catch (error) {
    console.error('AI模型列表查询失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'AI模型列表查询失败',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// AI模型详情API
app.get('/api/ai/models/:id', async (req, res) => {
  try {
    const modelId = parseInt(req.params.id, 10);
    const connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.query(`
      SELECT 
        id,
        name,
        display_name,
        provider,
        model_type,
        api_version,
        endpoint_url,
        api_key,
        model_parameters,
        is_default,
        description,
        capabilities,
        max_tokens,
        status,
        creator_id,
        created_at,
        updated_at
      FROM ai_model_config 
      WHERE id = ? AND status = 'active'
    `, [modelId]);

    await connection.end();

    if (Array.isArray(results) && results.length > 0) {
      res.json({
        success: true,
        code: 200,
        message: 'success',
        data: results[0]
      });
    } else {
      res.status(404).json({
        success: false,
        code: 404,
        message: '模型不存在'
      });
    }
  } catch (error) {
    console.error('AI模型详情查询失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'AI模型详情查询失败',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// AI会话列表API
app.get('/api/ai/conversations', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.query(`
      SELECT 
        id,
        external_user_id,
        title,
        summary,
        last_message_at,
        message_count,
        is_archived,
        created_at,
        updated_at
      FROM ai_conversations 
      WHERE external_user_id = 1
      ORDER BY created_at DESC
      LIMIT 10
    `);

    await connection.end();

    res.json({
      success: true,
      code: 200,
      message: 'success',
      data: results
    });
  } catch (error) {
    console.error('AI会话列表查询失败:', error);
    res.status(500).json({
      success: false,
      code: 500,
      message: 'AI会话列表查询失败',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// AI模型计费API
app.get('/api/ai/models/:id/billing', async (req, res) => {
  try {
    // 简单的认证检查
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const modelId = parseInt(req.params.id, 10);
    console.log(`🔍 查询模型 ${modelId} 的计费信息`);

    const connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.query(`
      SELECT
        id,
        model_id,
        billing_type,
        input_token_price,
        output_token_price,
        call_price,
        discount_tiers,
        billing_cycle,
        balance_alert_threshold,
        tenant_id,
        is_active,
        created_at,
        updated_at
      FROM ai_model_billing
      WHERE model_id = ?
      ORDER BY created_at DESC
    `, [modelId]);

    await connection.end();

    // 如果没有计费规则，返回默认的计费信息
    const resultArray = results as any[];
    if (!resultArray || resultArray.length === 0) {
      console.log(`📊 模型 ${modelId} 没有计费规则，返回默认数据`);
      res.json({
        callCount: 0,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalCost: 0,
        inputTokenPrice: 0,
        outputTokenPrice: 0,
        pricePerMillionTokens: 0, // 每百万token价格
        currency: 'USD',
        hasCustomPricing: false
      });
      return;
    }

    // 如果有计费规则，计算统计信息
    const latestRule = results[0];
    console.log(`📊 模型 ${modelId} 找到计费规则:`, latestRule);

    res.json({
      callCount: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
      inputTokenPrice: parseFloat(latestRule.input_token_price) || 0,
      outputTokenPrice: parseFloat(latestRule.output_token_price) || 0,
      pricePerMillionTokens: (parseFloat(latestRule.input_token_price) || 0) * 1000000, // 转换为每百万token价格
      currency: 'USD',
      hasCustomPricing: true,
      billingRule: latestRule
    });
  } catch (error) {
    console.error('❌ AI模型计费查询失败:', error);

    // 即使出错也返回默认数据，避免前端报错
    res.json({
      callCount: 0,
      totalTokens: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalCost: 0,
      inputTokenPrice: 0,
      outputTokenPrice: 0,
      pricePerMillionTokens: 0,
      currency: 'USD',
      hasCustomPricing: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 启动服务器
console.log('=== 启动最小化服务器 ===');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 服务器成功启动在端口: ${PORT}`);
  console.log(`🌐 健康检查: http://localhost:${PORT}/health`);
  console.log(`📡 API入口: http://localhost:${PORT}/api`);
  console.log(`🔐 登录API: http://localhost:${PORT}/api/auth/login`);
  console.log(`🤖 AI模型API: http://localhost:${PORT}/api/ai/models`);
}); 