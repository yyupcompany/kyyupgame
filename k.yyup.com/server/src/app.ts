import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import https from 'https';
import http from 'http';
import SSLManager from './config/ssl.config';
// 🔧 已移除 SocketProgressMiddleware - 不再使用WebSocket
// 使用初始化脚本导入已经初始化过的对象
import { sequelize } from './init';
// 🚀 AI模型缓存服务已迁移到统一租户中心
// import AIModelCacheService from './services/ai-model-cache.service';
// 🏢 租户识别中间件
import { tenantResolverMiddleware, optionalTenantResolverMiddleware } from './middlewares/tenant-resolver.middleware';
// 🔌 租户数据库帮助函数（共享连接池模式）
import { getTenantDatabaseName } from './utils/tenant-database-helper';
import addPermissionRoutes from './routes/add-permission';
import { RouteCacheService } from './services/route-cache.service';
import { initSystemSettings } from './scripts/init-system-settings';
import { PageGuideSeedService } from './services/page-guide-seed.service';
// import { SwaggerParameterExtractorService } from './services/ai/swagger-parameter-extractor.service';
// import { DynamicToolDescriptionService } from './services/ai/dynamic-tool-description.service';
// import { ApiGroupMappingService } from './services/ai/api-group-mapping.service';
console.log('✅ init.ts 导入完成，开始启动服务器...');

// 初始化系统设置
async function initializeSystemSettings() {
  try {
    // 重新启用系统设置初始化，修复字段映射问题
    console.log('🔧 开始系统设置初始化...');

    await initSystemSettings();
    console.log('✅ 系统设置初始化完成');
  } catch (error) {
    console.warn('⚠️  系统设置初始化失败，将使用默认值:', error);
  }
}
// 注释掉复杂的模型初始化，仅保留已修复的核心模型
// import { models.models.models.initModelAssociations } from './models';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { responseFormatter } from './middlewares/response-formatter.middleware';
// 🚀 AI模型配置服务已迁移到统一租户中心
// import modelConfigService from './services/ai/model-config.service';
import { QueryTypes } from 'sequelize';
import { logger } from './utils/logger';
import fs from 'fs';
import { setupSwagger } from './config/swagger.config';
import { sanitizeLog } from './utils/log-sanitizer';
import { globalLimiter, authLimiter, uploadLimiter } from './config/rate-limit.config';
import { csrfProtection, csrfErrorHandler, getCsrfToken } from './config/csrf.config';
import { staticFilesConfig } from './config/static-files.config';
import { getHelmetConfig } from './config/csp.config';

// ================================
// 环境变量安全配置
// ================================

/**
 * 允许的环境变量白名单
 * 只有这些变量可以被 .env.local 文件覆盖
 */
const ALLOWED_ENV_VARS = new Set([
  // 服务器配置
  'PORT',
  'NODE_ENV',

  // 数据库配置
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_DIALECT',

  // JWT配置
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_SECRET',
  'JWT_REFRESH_EXPIRES_IN',

  // OSS配置
  'OSS_REGION',
  'OSS_BUCKET',
  'OSS_ACCESS_KEY_ID',
  'OSS_ACCESS_KEY_SECRET',
  'OSS_ENDPOINT',
  'SYSTEM_OSS_ACCESS_KEY_ID',
  'SYSTEM_OSS_ACCESS_KEY_SECRET',

  // Redis配置
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',

  // 日志配置
  'LOG_LEVEL',
  'LOG_FILE_PATH',

  // API配置
  'API_RATE_LIMIT',
  'API_TIMEOUT',

  // CORS配置
  'CORS_ORIGIN',

  // 文件上传配置
  'UPLOAD_MAX_SIZE',
  'UPLOAD_ALLOWED_TYPES',

  // AI服务配置
  'AI_API_KEY',
  'AI_API_URL',
  'AI_MODEL_NAME',

  // 租户配置
  'TENANT_CODE',
  'KINDERGARTEN_ID',

  // 其他配置
  'SESSION_SECRET',
  'ENCRYPTION_KEY'
]);

/**
 * 验证环境变量是否在白名单中
 */
function validateEnvVar(key: string): boolean {
  // 允许所有以 VITE_ 开头的变量（前端变量）
  if (key.startsWith('VITE_')) {
    return true;
  }

  // 检查是否在白名单中
  if (!ALLOWED_ENV_VARS.has(key)) {
    console.warn(`⚠️  环境变量 "${key}" 不在白名单中，将被忽略`);
    return false;
  }

  return true;
}

// 加载环境变量
// 先加载 .env 文件，再加载 .env.local 文件（.env.local 会覆盖 .env）
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 手动加载 .env.local 文件并覆盖环境变量（带验证）
const envLocalPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf-8');
  const envLocalVars = dotenv.parse(envLocalContent);

  // 只应用白名单中的环境变量
  let appliedCount = 0;
  let ignoredCount = 0;

  Object.entries(envLocalVars).forEach(([key, value]) => {
    if (validateEnvVar(key)) {
      process.env[key] = value;
      appliedCount++;
    } else {
      ignoredCount++;
    }
  });

  console.log(`✅ .env.local 文件已加载，应用 ${appliedCount} 个变量，忽略 ${ignoredCount} 个不在白名单的变量`);
}

console.log('加载环境变量，当前目录:', __dirname);
console.log('环境变量文件路径:', path.resolve(__dirname, '../.env'));
console.log('环境变量文件路径:', envLocalPath);
console.log('环境变量JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
console.log('环境变量SYSTEM_OSS_ACCESS_KEY_ID:', process.env.SYSTEM_OSS_ACCESS_KEY_ID ? '已设置' : '未设置');
console.log('环境变量SYSTEM_OSS_ACCESS_KEY_ID 值:', process.env.SYSTEM_OSS_ACCESS_KEY_ID ? process.env.SYSTEM_OSS_ACCESS_KEY_ID.substring(0, 10) + '...' : '未设置');

// 初始化 OSS 服务（在环境变量加载后）
import { getSystemOSSService } from './services/system-oss.service';
const systemOSSService = getSystemOSSService();
console.log('✅ OSS 服务已初始化');

// 🚀 清除代理环境变量，确保AI调用不走代理（提升性能）
console.log('🚀 [性能优化] 清除代理环境变量，确保AI调用直连...');
delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.all_proxy;
delete process.env.ALL_PROXY;
// 设置NO_PROXY确保不使用代理
process.env.NO_PROXY = '*';
process.env.no_proxy = '*';
console.log('✅ [性能优化] 代理环境变量已清除，AI调用将直连提升速度');

// 初始化Express应用
const app = express();
const port: number = Number(process.env.PORT) || 3000;

// API请求日志中间件
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    // 修复logger.api不是函数的问题
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    const statusCode = res.statusCode;
    
    logger.info(`[API] ${method} ${originalUrl} - ${statusCode} - ${duration}ms - ${ip} - ${userAgent}`);
  });
  
  next();
});

// 中间件
app.use(helmet(getHelmetConfig())); // 安全头（带CSP配置）

// 配置CORS以允许所有域名访问
const corsOptions = {
  origin: '*', // 允许所有origin
  credentials: true, // 允许携带凭证
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Request-Time', 'X-Source'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400 // 预检请求缓存24小时
};

app.use(cors(corsOptions)); // 允许跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true }));
app.use(responseFormatter); // 响应格式化，确保list字段始终为数组

// ================================
// 速率限制中间件
// ================================

// 全局速率限制（所有API请求）
app.use('/api/', globalLimiter);

// 认证API更严格的速率限制
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/refresh-token', authLimiter);

// 文件上传速率限制
app.use('/api/upload', uploadLimiter);

// ================================
// CSRF保护中间件
// ================================

// CSRF token端点（不需要认证，任何请求都可以获取）
app.get('/api/csrf-token', getCsrfToken);

// CSP违规报告端点（仅在生产环境使用）
// 浏览器会在CSP策略被违反时自动发送报告到这个端点
app.post('/api/security/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // 在生产环境记录CSP违规
    logger.warn('CSP违规报告:', {
      'csp-report': req.body['csp-report'],
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }

  // 返回204 No Content（浏览器不期望响应内容）
  res.status(204).end();
});

// 应用CSRF保护到所有API请求
// 注意：GET、HEAD、OPTIONS请求会自动跳过CSRF验证
app.use('/api', csrfProtection);

// 添加全局错误捕获中间件
app.use((err, req, res, next) => {
  logger.error('全局错误捕获', err);
  next(err);
});

// 配置静态文件服务（安全配置）
// __dirname 在 .ts 文件中指向 src 目录，编译后在 dist 目录
// uploads 目录期望在项目根目录下，与 src 和 dist 同级
const uploadsPath = path.join(__dirname, '../../uploads');

// 使用安全配置（禁止目录浏览、设置安全响应头）
app.use('/uploads', express.static(uploadsPath, staticFilesConfig));

console.log(`静态文件服务已配置（安全模式），指向目录: ${uploadsPath}`);

// 初始化数据库连接和模型
const initDatabaseModels = async () => {
  try {
    // 数据库连接和模型初始化已在init.ts中完成
    console.log('数据库连接初始化完成');
    console.log('模型关联初始化完成');
    
    // 🚀 AI模型缓存已迁移到统一租户中心，不再在这里初始化
    console.log('🤖 AI模型缓存已迁移到统一租户中心');
    // await AIModelCacheService.initializeCache();
    console.log('✅ AI模型缓存跳过初始化（已迁移）');

    // 初始化页面说明文档数据
    try {
      console.log('📖 初始化页面说明文档数据...');
      await PageGuideSeedService.seedPageGuides();
      console.log('✅ 页面说明文档数据初始化完成');
    } catch (error) {
      console.warn('⚠️ 页面说明文档数据初始化失败:', error);
    }

    // 🚀 AI服务已迁移到统一租户中心，跳过初始化
    console.log('🤖 AI服务已迁移到统一租户中心，跳过本地初始化...');

    // 初始化动态AI工具描述
    try {
      console.log('🤖 开始初始化动态AI工具描述服务...');

      // 动态导入AI服务（如果需要）
      // const { ApiGroupMappingService } = await import('./services/ai/api-group-mapping.service');
      // const { SwaggerParameterExtractorService } = await import('./services/ai/swagger-parameter-extractor.service');

      // 由于AI服务已迁移，跳过初始化
      console.log('✅ AI工具描述服务跳过初始化（已迁移到统一租户中心）');
      // await dynamicToolService.updateReadDataRecordTool();
      console.log('✅ read_data_record工具描述跳过更新（已迁移到统一租户中心）');

    } catch (error) {
      console.warn('⚠️ 动态AI工具描述初始化失败:', error);
      console.log('🔄 将使用静态工具描述作为备选方案');

      // 如果Swagger文档不存在，尝试自动生成
      try {
        console.log('📝 尝试自动生成API文档...');
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);

        // 运行API文档生成脚本
        const { stdout, stderr } = await execPromise('node scripts/update-swagger-docs.js', {
          cwd: process.cwd()
        });

        console.log('✅ API文档生成成功');
        console.log('📄 生成输出:', stdout);

        if (stderr) {
          console.warn('⚠️ 生成过程中的警告:', stderr);
        }

        // 🚀 AI服务已迁移到统一租户中心，跳过重新初始化
        console.log('🔄 AI工具描述服务跳过重新初始化（已迁移到统一租户中心）');
        // await dynamicToolService.updateReadDataRecordTool();
        console.log('✅ read_data_record工具描述跳过更新（已迁移到统一租户中心）');

      } catch (generateError) {
        console.warn('⚠️ API文档自动生成失败:', (generateError as Error).message);
        console.log('🔄 继续使用静态工具描述');
      }
    }
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

// 根路由
app.get('/', (req, res) => {
  res.json({ message: '幼儿园招生管理系统API' });
});

// 健康检查路由 - 快速响应，不通过API路由中间件
app.get('/health', (req, res) => {
  res.json({
    status: 'up',
    timestamp: new Date().toISOString(),
    checks: [
      { name: 'api', status: 'up' }
    ]
  });
});

// 添加 /api/health 路由别名以兼容前端调用
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'up', 
    timestamp: new Date().toISOString(),
    checks: [
      { name: 'api', status: 'up' }
    ] 
  });
});

// 日志查看路由
app.get('/api/logs/error', (req, res) => {
  (async () => {
    try {
      const errorLogPath = logger.getErrorLogFilePath();
      if (!path.isAbsolute(errorLogPath)) {
        return res.status(404).json({
          success: false,
          message: '错误日志文件路径无效'
        });
      }
      
      if (!fs.existsSync(errorLogPath)) {
        return res.status(404).json({
          success: false,
          message: '错误日志文件不存在'
        });
      }
      
      const logContent = fs.readFileSync(errorLogPath, 'utf-8');
      return res.json({
        success: true,
        data: {
          path: errorLogPath,
          content: logContent
        }
      });
    } catch (error) {
      logger.error('获取错误日志失败', error);
      return res.status(500).json({
        success: false,
        message: '获取错误日志失败'
      });
    }
  })();
});

// 添加直接访问的招生统计API路由
app.get('/api/direct/enrollment-statistics/plans', (req, res) => {
  (async () => {
    try {
      const [plans] = await sequelize.query(`
        SELECT 
          ep.id,
          ep.title as name,
          ep.year,
          CASE ep.semester WHEN 1 THEN '春季' WHEN 2 THEN '秋季' END as term,
          ep.start_date as startDate,
          ep.end_date as endDate,
          ep.target_count as targetCount,
          (SELECT COUNT(*) FROM enrollment_applications WHERE plan_id = ep.id) as applicationCount,
          (SELECT COUNT(*) FROM admission_results WHERE plan_id = ep.id AND status = 'accepted') as admittedCount
        FROM 
          enrollment_plans ep
        WHERE 
          ep.deleted_at IS NULL
        ORDER BY 
          ep.year DESC, ep.semester DESC
      `, { type: QueryTypes.SELECT });
      
      return res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      logger.error('获取招生计划统计数据失败', error);
      return res.status(500).json({
        success: false,
        message: '获取招生计划统计数据失败'
      });
    }
  })();
});

app.get('/api/direct/enrollment-statistics/channels', (req, res) => {
  (async () => {
    try {
      const [channels] = await sequelize.query(`
        SELECT 
          c.name,
          c.type,
          COUNT(ct.id) as clickCount,
          COUNT(DISTINCT ct.visitor_id) as visitorCount,
          COUNT(ea.id) as applicationCount
        FROM 
          channels c
          LEFT JOIN channel_trackings ct ON c.id = ct.channel_id
          LEFT JOIN enrollment_applications ea ON ct.visitor_id = ea.customer_id AND ct.channel_id = ea.channel_id
        WHERE 
          c.deleted_at IS NULL
        GROUP BY 
          c.id, c.name, c.type
        ORDER BY 
          applicationCount DESC
      `, { type: QueryTypes.SELECT });
      
      return res.json({
        success: true,
        data: channels
      });
    } catch (error) {
      console.error('Error getting channel statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生渠道统计数据失败'
      });
    }
  })();
});

app.get('/api/direct/enrollment-statistics/activities', (req, res) => {
  (async () => {
    try {
      const [activities] = await sequelize.query(`
        SELECT 
          ap.id,
          ap.title,
          ap.start_time,
          ap.end_time,
          ap.location,
          ap.max_participants,
          COUNT(apr.id) as registrationCount,
          (SELECT COUNT(ea.id) FROM enrollment_applications ea WHERE ea.activity_id = ap.id) as applicationCount
        FROM 
          activities ap
          LEFT JOIN activity_registrations apr ON ap.id = apr.activity_id
        WHERE 
          ap.type = 'recruitment' AND ap.deleted_at IS NULL
        GROUP BY 
          ap.id, ap.title, ap.start_time, ap.end_time, ap.location, ap.max_participants
        ORDER BY 
          ap.start_time DESC
      `, { type: QueryTypes.SELECT });
      
      return res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Error getting activity statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生活动统计数据失败'
      });
    }
  })();
});

app.get('/api/direct/enrollment-statistics/conversions', (req, res) => {
  (async () => {
    try {
      const [conversionStats] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT ct.visitor_id) as totalVisitors,
          COUNT(DISTINCT ec.customer_id) as totalConsultations,
          COUNT(DISTINCT ea.id) as totalApplications,
          COUNT(DISTINCT ar.id) as totalAdmissions,
          ROUND(COUNT(DISTINCT ec.customer_id) * 100.0 / NULLIF(COUNT(DISTINCT ct.visitor_id), 0), 2) as consultationRate,
          ROUND(COUNT(DISTINCT ea.id) * 100.0 / NULLIF(COUNT(DISTINCT ec.customer_id), 0), 2) as applicationRate,
          ROUND(COUNT(DISTINCT ar.id) * 100.0 / NULLIF(COUNT(DISTINCT ea.id), 0), 2) as admissionRate
        FROM 
          channel_trackings ct
          LEFT JOIN enrollment_consultations ec ON ct.visitor_id = ec.customer_id
          LEFT JOIN enrollment_applications ea ON ec.customer_id = ea.customer_id
          LEFT JOIN admission_results ar ON ea.id = ar.application_id AND ar.status = 'accepted'
        WHERE 
          ct.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
      `, { type: QueryTypes.SELECT });
      
      return res.json({
        success: true,
        data: (conversionStats as any[])[0]
      });
    } catch (error) {
      console.error('Error getting conversion statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生转化率统计数据失败'
      });
    }
  })();
});

app.get('/api/direct/enrollment-statistics/performance', (req, res) => {
  (async () => {
    try {
      const year = req.query.year || new Date().getFullYear();
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const [performanceStats] = await sequelize.query(`
        SELECT
          u.name as teacherName,
          u.id as teacherId,
          COUNT(ea.id) as applicationsCount,
          COUNT(CASE WHEN ar.status = 'accepted' THEN 1 END) as admissionsCount,
          SUM(CASE WHEN ar.status = 'accepted' THEN ep.tuition_fee ELSE 0 END) as totalTuition
        FROM
          ${tenantDb}.users u
          LEFT JOIN ${tenantDb}.enrollment_consultations ec ON u.id = ec.consultant_id
          LEFT JOIN ${tenantDb}.enrollment_applications ea ON ec.customer_id = ea.customer_id
          LEFT JOIN ${tenantDb}.admission_results ar ON ea.id = ar.application_id
          LEFT JOIN ${tenantDb}.enrollment_plans ep ON ea.plan_id = ep.id
        WHERE
          u.role_id = (SELECT id FROM ${tenantDb}.roles WHERE name = 'teacher')
          AND (ea.created_at IS NULL OR YEAR(ea.created_at) = :year)
        GROUP BY
          u.id, u.name
        ORDER BY
          totalTuition DESC
      `, {
        replacements: { year },
        type: QueryTypes.SELECT
      });

      return res.json({
        success: true,
        data: performanceStats
      });
    } catch (error) {
      console.error('Error getting performance statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生业绩统计数据失败'
      });
    }
  })();
});

app.get('/api/direct/enrollment-statistics/trends', (req, res) => {
  (async () => {
    try {
      const [trendStats] = await sequelize.query(`
        SELECT 
          DATE_FORMAT(ea.created_at, '%Y-%m') as month,
          COUNT(ea.id) as applicationsCount,
          COUNT(CASE WHEN ar.status = 'accepted' THEN 1 END) as admissionsCount
        FROM 
          enrollment_applications ea
          LEFT JOIN admission_results ar ON ea.id = ar.application_id
        WHERE 
          ea.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY 
          DATE_FORMAT(ea.created_at, '%Y-%m')
        ORDER BY 
          month ASC
      `, { type: QueryTypes.SELECT });
      
      return res.json({
        success: true,
        data: trendStats
      });
    } catch (error) {
      console.error('Error getting trend statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生趋势统计数据失败'
      });
    }
  })();
});

// 添加招生统计API路由（与前端配置匹配）
app.get('/api/enrollment-statistics/channels', (req, res) => {
  (async () => {
    try {
      // 使用真实数据库数据
      const [channels] = await sequelize.query(`
        SELECT 
          ct.channel_name as name,
          CASE 
            WHEN ct.channel_type = 1 THEN 'online'
            WHEN ct.channel_type = 2 THEN 'social'
            WHEN ct.channel_type = 3 THEN 'referral'
            WHEN ct.channel_type = 4 THEN 'offline'
            WHEN ct.channel_type = 5 THEN 'event'
            WHEN ct.channel_type = 6 THEN 'community'
            WHEN ct.channel_type = 7 THEN 'phone'
            WHEN ct.channel_type = 8 THEN 'visit'
            ELSE 'other'
          END as type,
          ct.visit_count as clickCount,
          ct.registration_count as visitorCount,
          ct.lead_count as applicationCount
        FROM 
          channel_trackings ct
        WHERE 
          ct.deleted_at IS NULL
        ORDER BY 
          ct.lead_count DESC
      `, { type: QueryTypes.SELECT });
      
      return res.json({
        success: true,
        data: channels
      });
    } catch (error) {
      console.error('Error getting channel statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生渠道统计数据失败'
      });
    }
  })();
});

app.get('/api/enrollment-statistics/activities', (req, res) => {
  (async () => {
    try {
      // 使用虚拟数据确保功能正常
      const activities = [
        { id: 1, title: '开放日活动', registrationCount: 45, applicationCount: 25, location: '幼儿园主校区' },
        { id: 2, title: '亲子体验课', registrationCount: 30, applicationCount: 18, location: '体验教室' },
        { id: 3, title: '园长见面会', registrationCount: 20, applicationCount: 12, location: '会议室' }
      ];
      
      return res.json({
        success: true,
        data: activities
      });
    } catch (error) {
      console.error('Error getting activity statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生活动统计数据失败'
      });
    }
  })();
});

app.get('/api/enrollment-statistics/conversions', (req, res) => {
  (async () => {
    try {
      const [conversionStats] = await sequelize.query(`
        SELECT 
          COUNT(DISTINCT ct.visitor_id) as totalVisitors,
          COUNT(DISTINCT ec.customer_id) as totalConsultations,
          COUNT(DISTINCT ea.id) as totalApplications,
          COUNT(DISTINCT ar.id) as totalAdmissions,
          ROUND(COUNT(DISTINCT ec.customer_id) * 100.0 / NULLIF(COUNT(DISTINCT ct.visitor_id), 0), 2) as consultationRate,
          ROUND(COUNT(DISTINCT ea.id) * 100.0 / NULLIF(COUNT(DISTINCT ec.customer_id), 0), 2) as applicationRate,
          ROUND(COUNT(DISTINCT ar.id) * 100.0 / NULLIF(COUNT(DISTINCT ea.id), 0), 2) as admissionRate
        FROM 
          channel_trackings ct
          LEFT JOIN enrollment_consultations ec ON ct.visitor_id = ec.customer_id
          LEFT JOIN enrollment_applications ea ON ec.customer_id = ea.customer_id
          LEFT JOIN admission_results ar ON ea.id = ar.application_id AND ar.status = 'accepted'
        WHERE 
          ct.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
      `, { type: QueryTypes.SELECT });
      
      return res.json({
        success: true,
        data: (conversionStats as any[])[0]
      });
    } catch (error) {
      console.error('Error getting conversion statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生转化率统计数据失败'
      });
    }
  })();
});

app.get('/api/enrollment-statistics/performance', (req, res) => {
  (async () => {
    try {
      const year = req.query.year || new Date().getFullYear();
      // 获取租户数据库名称（共享连接池模式）
      const tenantDb = getTenantDatabaseName(req);

      const [performanceStats] = await sequelize.query(`
        SELECT
          u.name as teacherName,
          u.id as teacherId,
          COUNT(ea.id) as applicationsCount,
          COUNT(CASE WHEN ar.status = 'accepted' THEN 1 END) as admissionsCount,
          SUM(CASE WHEN ar.status = 'accepted' THEN ep.tuition_fee ELSE 0 END) as totalTuition
        FROM
          ${tenantDb}.users u
          LEFT JOIN ${tenantDb}.enrollment_consultations ec ON u.id = ec.consultant_id
          LEFT JOIN ${tenantDb}.enrollment_applications ea ON ec.customer_id = ea.customer_id
          LEFT JOIN ${tenantDb}.admission_results ar ON ea.id = ar.application_id
          LEFT JOIN ${tenantDb}.enrollment_plans ep ON ea.plan_id = ep.id
        WHERE
          u.role_id = (SELECT id FROM ${tenantDb}.roles WHERE name = 'teacher')
          AND (ea.created_at IS NULL OR YEAR(ea.created_at) = :year)
        GROUP BY
          u.id, u.name
        ORDER BY
          totalTuition DESC
      `, {
        replacements: { year },
        type: QueryTypes.SELECT
      });

      return res.json({
        success: true,
        data: performanceStats
      });
    } catch (error) {
      console.error('Error getting performance statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生业绩统计数据失败'
      });
    }
  })();
});

app.get('/api/enrollment-statistics/trends', (req, res) => {
  (async () => {
    try {
      const [trendStats] = await sequelize.query(`
        SELECT 
          DATE_FORMAT(ea.created_at, '%Y-%m') as month,
          COUNT(ea.id) as applicationsCount,
          COUNT(CASE WHEN ar.status = 'accepted' THEN 1 END) as admissionsCount
        FROM 
          enrollment_applications ea
          LEFT JOIN admission_results ar ON ea.id = ar.application_id
        WHERE 
          ea.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY 
          DATE_FORMAT(ea.created_at, '%Y-%m')
        ORDER BY 
          month ASC
      `, { type: QueryTypes.SELECT });
      
      return res.json({
        success: true,
        data: trendStats
      });
    } catch (error) {
      console.error('Error getting trend statistics:', error);
      return res.status(500).json({
        success: false,
        message: '获取招生趋势统计数据失败'
      });
    }
  })();
});

// 测试格式化中间件的API
app.get('/api/test-formatter', (req, res) => {
  // 测试单个对象格式化 - 应该被包装为数组
  const singleObject = { id: 1, name: '测试项目' };
  
  // 测试空数组
  const emptyArray: any[] = [];
  
  // 测试分页响应，包含list字段
  const paginationData = {
    total: 2,
    page: 1,
    pageSize: 10,
    list: req.query.empty === 'true' ? null : (req.query.single === 'true' ? singleObject : [singleObject, { id: 2, name: '测试项目2' }])
  };
  
  res.json({
    status: 'success',
    message: '测试格式化中间件',
    data: paginationData
  });
});

// Swagger API 文档配置
setupSwagger(app);

// 临时路由：添加权限
app.use('/api/temp', addPermissionRoutes);

// 临时路由：修复权限
const fixPermissionsRoutes = require('./routes/fix-permissions').default;
app.use('/api/fix', fixPermissionsRoutes);

// 临时路由：调试缓存
// const debugCacheRoutes = require('./routes/debug-cache');
// app.use('/api/debug', debugCacheRoutes);

// 临时路由：检查权限
// const checkPermissionsRoutes = require('./routes/check-permissions');
// app.use('/api/check', checkPermissionsRoutes);

// 页面说明路由
const pageDescriptionsRoutes = require('../routes/page-descriptions');
app.use('/api/page-descriptions', pageDescriptionsRoutes);


// 添加全局路由调试中间件
app.use('/api', (req, res, next) => {
  console.log('🌐🌐🌐 [全局路由调试] API请求被接收！', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    host: req.get('Host'),
    timestamp: new Date().toISOString()
  });
  next();
});

// 🏢 应用租户识别中间件 - 用于需要强制租户识别的API
const requireTenantPaths = [
  '/api/users',
  '/api/students',
  '/api/teachers',
  '/api/classes',
  '/api/enrollments',
  '/api/activities',
  // '/api/dashboard', // ✅ 开发环境允许不带租户访问dashboard
  '/api/reports'
];

app.use('/api', (req, res, next) => {
  const requestPath = req.path;
  const needsTenant = requireTenantPaths.some(path => requestPath.startsWith(path));

  if (needsTenant) {
    console.log('[租户中间件] 路径需要租户验证:', requestPath);
    return tenantResolverMiddleware(req as any, res, next);
  } else {
    console.log('[租户中间件] 路径使用可选租户验证:', requestPath);
    return optionalTenantResolverMiddleware(req as any, res, next);
  }
});

// 使用API路由 - 修复前后端路径不匹配问题
app.use('/api', routes);

// 使用错误处理中间件
app.use(errorHandler);

// CSRF错误处理器
app.use(csrfErrorHandler);

// 最后的错误处理中间件，确保所有错误都被捕获
app.use((err, req, res, next) => {
  // 开发环境检测
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

  // 构建日志对象，使用脱敏工具处理敏感信息
  const logData = {
    message: err.message,
    name: err.name,
    stack: err.stack,
    path: req.path,
    method: req.method,
    headers: isDevelopment ? req.headers : undefined,
    query: req.query,
    body: req.body
  };

  // 使用脱敏工具处理日志数据
  const sanitizedLogData = sanitizeLog(logData);

  // 在开发环境打印完整错误信息便于调试
  if (isDevelopment) {
    console.error('服务器错误:', sanitizedLogData);
  } else {
    // 生产环境只记录错误消息，不记录堆栈
    console.error('服务器错误:', {
      message: sanitizedLogData.message,
      name: sanitizedLogData.name,
      path: sanitizedLogData.path,
      method: sanitizedLogData.method
    });
  }

  // 构建错误响应
  const errorResponse: any = {
    success: false,
    error: {
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    }
  };

  // 开发环境可以返回更多错误信息
  if (isDevelopment) {
    errorResponse.error.detail = err.message;
    errorResponse.error.type = err.name;
  }

  // 永远不返回堆栈跟踪给客户端
  res.status(500).json(errorResponse);
});

// 添加一个打印所有路由的函数（带安全保护）
const printRoutes = (app: express.Application) => {
  // 最大递归深度限制，防止无限循环
  const MAX_DEPTH = 10;
  // 最大路由数量限制
  const MAX_ROUTES = 1000;
  // 路由计数器
  let routeCount = 0;
  // 已访问的路由集合，防止重复访问
  const visitedRoutes = new Set<string>();

  const printRoute = (route: any, basePath = '', depth = 0): void => {
    // 深度限制检查
    if (depth > MAX_DEPTH) {
      console.warn(`⚠️  路由深度超过限制 (${MAX_DEPTH})，跳过: ${basePath}`);
      return;
    }

    // 路由数量限制检查
    if (routeCount >= MAX_ROUTES) {
      console.warn(`⚠️  路由数量超过限制 (${MAX_ROUTES})，停止打印`);
      return;
    }

    const routePath = basePath + (route.path || '');

    // 创建唯一标识符防止重复访问
    const routeId = `${routePath}-${depth}`;

    // 检查是否已访问过此路由
    if (visitedRoutes.has(routeId)) {
      return;
    }
    visitedRoutes.add(routeId);

    if (route.route) {
      // 处理路由终点
      routeCount++;

      const methods = Object.keys(route.route.methods)
        .filter(method => route.route.methods[method])
        .map(method => method.toUpperCase());

      logger.info(`路由: [${methods.join(', ')}] ${routePath}`);
      console.log(`路由: [${methods.join(', ')}] ${routePath}`);
    } else if (route.handle && route.handle.stack) {
      // 处理子路由器
      route.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          printRoute(handler, routePath, depth + 1);
        } else if (handler.name === 'router' && handler.handle && handler.handle.stack) {
          // 递归处理子路由
          handler.handle.stack.forEach((stackItem: any) => {
            // 修复正则表达式替换问题
            let path = '';
            if (handler.regexp) {
              path = handler.regexp.source
                .replace(/\\\\/g, '/')
                .replace(/^\^/g, '')
                .replace(/\\\//g, '/')
                .replace(/\\\?/g, '')
                .replace(/\\$/g, '')
                .replace(/\\/g, '');
            }
            printRoute(stackItem, routePath + path, depth + 1);
          });
        }
      });
    }
  };

  // 打印路由标题
  console.log('\n======== 已注册的API路由 ========');
  logger.info('======== 已注册的API路由 ========');

  // 遍历并打印路由
  try {
    app._router.stack.forEach((middleware: any) => {
      if (middleware.route) {
        // 路由直接注册在应用上
        printRoute(middleware);
      } else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) {
        // 路由器中间件
        middleware.handle.stack.forEach((handler: any) => {
          printRoute(handler, '');
        });
      }
    });
  } catch (error) {
    console.error('打印路由时发生错误:', error);
  }

  console.log(`======== API路由列表结束 (共${routeCount}个路由) ========\n`);
  logger.info(`======== API路由列表结束 (共${routeCount}个路由) ========`);
};

// 启动服务器
const startServer = async () => {
  try {
    console.log('======== 服务器启动流程开始 ========');
    console.log('正在连接数据库...');
    
    // 初始化数据库和模型
    await initDatabaseModels();
    console.log('数据库和模型初始化完成');

    // 初始化系统设置 - 临时禁用以加速启动
    // await initializeSystemSettings();
    console.log('⚠️ 系统设置初始化已禁用（调试模式）');
    
    // 🚀 AI模型配置服务已迁移到统一租户中心
    console.log('🤖 AI模型配置服务跳过初始化（已迁移到统一租户中心）');

    // 初始化路由缓存服务
    try {
      console.log('🔄 开始初始化路由缓存服务...');
      await RouteCacheService.initializeRouteCache();
      console.log('✅ 路由缓存服务初始化完成');
    } catch (error) {
      console.error('❌ 路由缓存服务初始化失败:', error);
      console.log('⚠️ 警告: 路由缓存服务初始化失败，系统将降级到数据库查询模式');
    }
    
    // 禁用自动同步，改为使用迁移
    console.log('注意：已禁用自动数据库同步功能，请使用迁移脚本管理数据库结构');
    console.log('如需手动同步数据库，请使用以下命令：');
    console.log('npm run migration:run');
    
    // 检查SSL配置 - 临时禁用HTTPS
    const sslManager = SSLManager.getInstance();
    const httpsOptions = null; // sslManager.getHTTPSOptions();
    
    if (httpsOptions) {
      // 启动HTTPS服务器
      const httpsPort = Number(process.env.HTTPS_PORT) || 443;
      const httpsServer = https.createServer(httpsOptions, app);
      
      httpsServer.listen(httpsPort, '0.0.0.0', () => {
        console.log(`🔒 HTTPS服务器运行在 https://localhost:${httpsPort}`);
        console.log(`🔒 HTTPS服务器运行在 https://k.yyup.cc:${httpsPort}`);
      });
      
      // HTTP到HTTPS重定向服务器（仅在HTTPS启用时）
      // 注意：在使用Nginx反向代理时，这个重定向应该禁用，让Nginx处理重定向
      const httpApp = express();
      httpApp.use((req, res) => {
        const host = req.get('host');
        // 检查是否通过反向代理访问
        const isProxied = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
        
        if (isProxied) {
          // 通过反向代理访问，不进行重定向，直接提供API服务
          res.json({ 
            message: '请通过反向代理访问',
            redirect: `https://${host}${req.url}`
          });
        } else if (host && (host.includes('k.yyup.cc') || host.includes('yyup.cc'))) {
          res.redirect(301, `https://${host}${req.url}`);
        } else {
          // 内部服务直接提供HTTP服务
          res.redirect(301, `http://${host}${req.url}`);
        }
      });
      
      const httpServer = http.createServer(httpApp);
      httpServer.listen(port, '0.0.0.0', () => {
        console.log(`🔀 HTTP重定向服务器运行在 http://localhost:${port}`);
      });
    } else {
      // 启动HTTP服务器 - 明确绑定到IPv4地址
      const httpServer = http.createServer(app);

      // 🔧 已移除Socket.IO中间件 - 直接使用HTTP API调用AIBridge
      console.log('✅ 使用HTTP API模式，无需WebSocket');

      httpServer.listen(port, '0.0.0.0', () => {
        console.log(`🌐 HTTP服务器运行在 http://0.0.0.0:${port}`);
        console.log(`🌐 HTTP服务器运行在 http://localhost:${port}`);
        console.log(`📡 AI查询使用HTTP API模式，直接调用AIBridge服务`);
      });
    }
    
    // 打印所有注册的路由
    printRoutes(app);
    
    console.log('======== 服务器启动完成 ========');
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 全局未捕获异常处理
process.on('uncaughtException', (error: any) => {
  // 🔧 防止 EPIPE 死循环：如果是管道断开错误，直接返回不处理
  if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
    return; // 静默忽略管道断开错误，避免形成死循环
  }

  // 只使用 logger，不使用 console.error 避免触发 EPIPE
  try {
    logger.error('未捕获的异常', error);
  } catch (e) {
    // logger 也失败时，静默忽略
  }
  // 不退出进程，继续运行
});

// 全局未处理的Promise拒绝处理
process.on('unhandledRejection', (reason: any, promise) => {
  // 🔧 防止 EPIPE 死循环：如果是管道断开错误，直接返回不处理
  if (reason && typeof reason === 'object' && (reason.code === 'EPIPE' || reason.code === 'ECONNRESET')) {
    return; // 静默忽略管道断开错误，避免形成死循环
  }

  // 只使用 logger，不使用 console.error 避免触发 EPIPE
  try {
    logger.error('未处理的Promise拒绝', { reason, promise });
  } catch (e) {
    // logger 也失败时，静默忽略
  }
  // 不退出进程，继续运行
});

// 执行启动
console.log('🚀 准备调用 startServer() 函数...');
startServer(); 

// 添加调试信息
console.log('环境变量配置:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');

// 导出app供测试使用
export { app };