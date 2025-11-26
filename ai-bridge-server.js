/**
 * 独立AI Bridge服务器
 * 用于演示AI模型中心化功能
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟AI模型配置
const AI_MODELS = [
    {
        id: 1,
        name: 'gpt-3.5-turbo',
        displayName: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        modelType: 'text',
        status: 'active',
        capabilities: ['chat', 'completion'],
        pricing: { inputTokenPrice: 0.0005, outputTokenPrice: 0.0015 }
    },
    {
        id: 2,
        name: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'OpenAI',
        modelType: 'text',
        status: 'active',
        capabilities: ['chat', 'completion', 'analysis'],
        pricing: { inputTokenPrice: 0.003, outputTokenPrice: 0.006 }
    },
    {
        id: 3,
        name: 'doubao',
        displayName: '豆包AI',
        provider: 'ByteDance',
        modelType: 'text',
        status: 'active',
        capabilities: ['chat', 'completion'],
        pricing: { inputTokenPrice: 0.0003, outputTokenPrice: 0.0008 }
    }
];

// 模拟租户配置
const TENANT_CONFIGS = {
    1: { // 默认租户
        enabledModels: [1, 3], // 启用GPT-3.5和豆包
        rateLimit: 60, // 每分钟60次
        monthlyQuota: 100000, // 月度配额
        currentUsage: 15420 // 当前使用量
    }
};

// 模拟使用日志
let usageLogs = [];

// 中间件：租户验证
function verifyTenant(req, res, next) {
    const tenantId = req.headers['x-tenant-id'];
    const authToken = req.headers['authorization'];

    if (!tenantId) {
        return res.status(400).json({
            success: false,
            error: '缺少租户ID'
        });
    }

    if (!authToken || !authToken.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: '无效的认证令牌'
        });
    }

    // 模拟租户验证（实际应该验证JWT令牌）
    if (!TENANT_CONFIGS[tenantId]) {
        return res.status(403).json({
            success: false,
            error: '租户不存在或未授权'
        });
    }

    req.tenantId = tenantId;
    next();
}

// 中间件：频率限制
const rateLimitMap = new Map();
function rateLimit(req, res, next) {
    const tenantId = req.tenantId;
    const now = Date.now();
    const windowMs = 60000; // 1分钟窗口

    if (!rateLimitMap.has(tenantId)) {
        rateLimitMap.set(tenantId, { count: 1, resetTime: now + windowMs });
        return next();
    }

    const limit = rateLimitMap.get(tenantId);
    if (now > limit.resetTime) {
        limit.count = 1;
        limit.resetTime = now + windowMs;
        return next();
    }

    const config = TENANT_CONFIGS[tenantId];
    if (limit.count >= config.rateLimit) {
        return res.status(429).json({
            success: false,
            error: `调用频率超限，每分钟最多${config.rateLimit}次`
        });
    }

    limit.count++;
    next();
}

// API路由

/**
 * 健康检查
 */
app.get('/api/v1/ai/bridge/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'AI Bridge Service',
            version: '1.0.0',
            uptime: process.uptime()
        }
    });
});

/**
 * 获取可用模型列表
 */
app.get('/api/v1/ai/bridge/models', verifyTenant, (req, res) => {
    const tenantId = req.tenantId;
    const config = TENANT_CONFIGS[tenantId];

    const enabledModels = AI_MODELS.filter(model =>
        config.enabledModels.includes(model.id)
    );

    res.json({
        success: true,
        data: {
            models: enabledModels.map(model => ({
                id: model.id,
                name: model.name,
                displayName: model.displayName,
                provider: model.provider,
                modelType: model.modelType,
                capabilities: model.capabilities,
                pricing: model.pricing
            })),
            tenantInfo: {
                rateLimit: config.rateLimit,
                monthlyQuota: config.monthlyQuota,
                currentUsage: config.currentUsage
            }
        }
    });
});

/**
 * AI对话接口
 */
app.post('/api/v1/ai/bridge/chat', verifyTenant, rateLimit, (req, res) => {
    const tenantId = req.tenantId;
    const { model, messages, temperature = 0.7, max_tokens = 1000 } = req.body;

    // 验证请求参数
    if (!model || !messages || !Array.isArray(messages)) {
        return res.status(400).json({
            success: false,
            error: '请求参数错误'
        });
    }

    // 验证模型权限
    const config = TENANT_CONFIGS[tenantId];
    const targetModel = AI_MODELS.find(m => m.name === model);

    if (!targetModel || !config.enabledModels.includes(targetModel.id)) {
        return res.status(403).json({
            success: false,
            error: '租户未授权使用此模型'
        });
    }

    // 模拟AI调用
    const inputTokens = JSON.stringify(messages).length;
    const outputTokens = Math.floor(Math.random() * 500) + 100;
    const responseTime = Math.floor(Math.random() * 2000) + 500;

    // 计算费用
    const cost = (inputTokens * targetModel.pricing.inputTokenPrice) +
                (outputTokens * targetModel.pricing.outputTokenPrice);

    // 更新使用量
    config.currentUsage += inputTokens + outputTokens;

    // 记录日志
    const logEntry = {
        tenantId,
        userId: req.headers['x-user-id'] || 'anonymous',
        model: model,
        requestType: 'chat',
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost,
        responseTime,
        status: 'SUCCESS',
        timestamp: new Date().toISOString()
    };
    usageLogs.push(logEntry);

    // 返回响应
    res.json({
        success: true,
        data: {
            id: `chat_${Date.now()}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [{
                index: 0,
                message: {
                    role: 'assistant',
                    content: `这是来自${targetModel.displayName}的模拟回复。您的问题是：${messages[messages.length - 1]?.content || '未知问题'}。这是一个演示AI模型中心化的示例响应。`
                },
                finish_reason: 'stop'
            }],
            usage: {
                prompt_tokens: inputTokens,
                completion_tokens: outputTokens,
                total_tokens: inputTokens + outputTokens
            }
        },
        usage: {
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
            cost,
            responseTime
        }
    });
});

/**
 * 文本嵌入接口
 */
app.post('/api/v1/ai/bridge/embedding', verifyTenant, rateLimit, (req, res) => {
    const tenantId = req.tenantId;
    const { model = 'text-embedding-ada-002', input } = req.body;

    if (!input) {
        return res.status(400).json({
            success: false,
            error: '输入内容不能为空'
        });
    }

    // 模拟嵌入向量生成
    const inputTokens = input.length;
    const responseTime = Math.floor(Math.random() * 1000) + 200;
    const cost = inputTokens * 0.0001;

    // 更新使用量
    TENANT_CONFIGS[tenantId].currentUsage += inputTokens;

    // 生成模拟向量（1536维）
    const embedding = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);

    res.json({
        success: true,
        data: {
            object: 'list',
            data: [{
                object: 'embedding',
                embedding: embedding,
                index: 0
            }],
            model: model,
            usage: {
                prompt_tokens: inputTokens,
                total_tokens: inputTokens
            }
        },
        usage: {
            inputTokens,
            outputTokens: 0,
            totalTokens: inputTokens,
            cost,
            responseTime
        }
    });
});

/**
 * 获取使用统计
 */
app.get('/api/v1/ai/bridge/usage-stats', verifyTenant, (req, res) => {
    const tenantId = req.tenantId;
    const { startDate, endDate } = req.query;

    // 过滤日志
    let filteredLogs = usageLogs.filter(log => log.tenantId === tenantId);

    if (startDate) {
        filteredLogs = filteredLogs.filter(log =>
            new Date(log.timestamp) >= new Date(startDate)
        );
    }

    if (endDate) {
        filteredLogs = filteredLogs.filter(log =>
            new Date(log.timestamp) <= new Date(endDate)
        );
    }

    // 统计计算
    const stats = {
        totalRequests: filteredLogs.length,
        totalTokens: filteredLogs.reduce((sum, log) => sum + log.totalTokens, 0),
        totalCost: filteredLogs.reduce((sum, log) => sum + log.cost, 0),
        avgResponseTime: filteredLogs.length > 0
            ? filteredLogs.reduce((sum, log) => sum + log.responseTime, 0) / filteredLogs.length
            : 0,
        successRate: filteredLogs.length > 0
            ? filteredLogs.filter(log => log.status === 'SUCCESS').length / filteredLogs.length
            : 0
    };

    // 按模型分组统计
    const modelStats = {};
    filteredLogs.forEach(log => {
        if (!modelStats[log.model]) {
            modelStats[log.model] = {
                requests: 0,
                tokens: 0,
                cost: 0
            };
        }
        modelStats[log.model].requests++;
        modelStats[log.model].tokens += log.totalTokens;
        modelStats[log.model].cost += log.cost;
    });

    res.json({
        success: true,
        data: {
            summary: stats,
            modelBreakdown: modelStats,
            tenantInfo: TENANT_CONFIGS[tenantId]
        }
    });
});

/**
 * 获取租户配置
 */
app.get('/api/v1/tenants/:tenantId/config', verifyTenant, (req, res) => {
    const tenantId = req.params.tenantId;

    if (tenantId !== req.tenantId) {
        return res.status(403).json({
            success: false,
            error: '无权访问其他租户配置'
        });
    }

    const config = TENANT_CONFIGS[tenantId];
    const enabledModels = AI_MODELS.filter(model =>
        config.enabledModels.includes(model.id)
    );

    res.json({
        success: true,
        data: {
            tenantId,
            enabledModels: enabledModels,
            rateLimit: config.rateLimit,
            monthlyQuota: config.monthlyQuota,
            currentUsage: config.currentUsage,
            usagePercentage: (config.currentUsage / config.monthlyQuota * 100).toFixed(2)
        }
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Bridge服务器错误:', err);
    res.status(500).json({
        success: false,
        error: '内部服务器错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '接口不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 AI Bridge服务器已启动`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`🔧 健康检查: http://localhost:${PORT}/api/v1/ai/bridge/health`);
    console.log(`📝 API文档:`);
    console.log(`   - GET  /api/v1/ai/bridge/health`);
    console.log(`   - GET  /api/v1/ai/bridge/models`);
    console.log(`   - POST /api/v1/ai/bridge/chat`);
    console.log(`   - POST /api/v1/ai/bridge/embedding`);
    console.log(`   - GET  /api/v1/ai/bridge/usage-stats`);
    console.log(`   - GET  /api/v1/tenants/:tenantId/config`);
    console.log(`\n👋 服务器准备就绪，可以接收AI Bridge请求！`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭AI Bridge服务器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 正在关闭AI Bridge服务器...');
    process.exit(0);
});

module.exports = app;