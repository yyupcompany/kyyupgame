"use strict";
/**
 * 统一数据库配置文件
 * 所有数据库连接都应该从这里获取配置
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.dbConfig = exports.getDatabaseConfig = void 0;
var dotenv = __importStar(require("dotenv"));
var path_1 = __importDefault(require("path"));
// 加载环境变量
dotenv.config({ path: path_1["default"].resolve(__dirname, '../../.env') });
// 获取统一的数据库配置
function getDatabaseConfig() {
    // 测试环境使用SQLite内存数据库
    if (process.env.NODE_ENV === 'test') {
        console.log('🧪 测试环境：使用SQLite内存数据库');
        return {
            dialect: 'sqlite',
            storage: ':memory:',
            logging: false,
            define: {
                timestamps: true,
                underscored: true,
                freezeTableName: true
            },
            pool: {
                max: 1,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        };
    }
    // 强制检查是否禁用SQLite
    if (process.env.DISABLE_SQLITE === 'true' || process.env.USE_REMOTE_DB === 'true') {
        console.log('🚫 SQLite已被禁用，强制使用远程MySQL数据库');
    }
    // 验证必需的MySQL连接参数
    var requiredParams = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    var missingParams = requiredParams.filter(function (param) { return !process.env[param]; });
    if (missingParams.length > 0) {
        throw new Error("\u7F3A\u5C11\u5FC5\u9700\u7684\u6570\u636E\u5E93\u8FDE\u63A5\u53C2\u6570: ".concat(missingParams.join(', ')));
    }
    // 打印调试信息
    console.log('=== 数据库配置调试信息 ===');
    console.log('✅ 强制使用远程MySQL数据库');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_TYPE:', process.env.DB_TYPE);
    console.log('USE_REMOTE_DB:', process.env.USE_REMOTE_DB);
    console.log('DISABLE_SQLITE:', process.env.DISABLE_SQLITE);
    console.log('========================');
    // 强制使用远程MySQL数据库配置
    var config = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: 'mysql',
        timezone: '+08:00',
        logging: process.env.NODE_ENV !== 'production',
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        dialectOptions: {
            charset: 'utf8mb4',
            collation: 'utf8mb4_unicode_ci'
        },
        pool: {
            max: 20,
            min: 5,
            acquire: 10000,
            idle: 3000,
            evict: 15000
        }
    };
    // 验证配置完整性
    if (config.dialect !== 'mysql') {
        throw new Error('数据库配置错误：必须使用MySQL数据库');
    }
    console.log('✅ MySQL数据库配置验证通过');
    return config;
}
exports.getDatabaseConfig = getDatabaseConfig;
// 导出默认配置
exports.dbConfig = getDatabaseConfig();
// 兼容性导出
exports["default"] = exports.dbConfig;
