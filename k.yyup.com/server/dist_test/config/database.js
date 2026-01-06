"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.sequelize = exports.logDbOperation = exports.closeDatabase = exports.getSequelize = exports.initDatabase = void 0;
var sequelize_1 = require("sequelize");
var dotenv = __importStar(require("dotenv"));
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// 声明一个全局变量来存储Sequelize实例
var sequelize;
exports.sequelize = sequelize;
/**
 * 创建并返回一个新的Sequelize实例.
 * 这个函数现在只负责创建和认证连接.
 * @returns {Promise<Sequelize>} 返回一个已认证的Sequelize实例.
 */
var initDatabase = function () { return __awaiter(void 0, void 0, void 0, function () {
    var getDatabaseConfig, dbConfig, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./database-unified')); })];
            case 1:
                getDatabaseConfig = (_a.sent()).getDatabaseConfig;
                dbConfig = getDatabaseConfig();
                exports.sequelize = sequelize = new sequelize_1.Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
                    host: dbConfig.host,
                    port: dbConfig.port,
                    dialect: dbConfig.dialect,
                    timezone: dbConfig.timezone,
                    logging: dbConfig.logging ? console.log : false,
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
                        max: dbConfig.pool.max,
                        min: dbConfig.pool.min,
                        acquire: dbConfig.pool.acquire,
                        idle: dbConfig.pool.idle
                    }
                });
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, sequelize.authenticate()];
            case 3:
                _a.sent();
                console.log('数据库连接验证成功.');
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('数据库连接失败:', error_1);
                throw new Error('数据库连接失败');
            case 5: return [2 /*return*/, sequelize];
        }
    });
}); };
exports.initDatabase = initDatabase;
/**
 * 获取Sequelize实例
 * 如果尚未初始化，则会抛出错误
 * @returns {Sequelize} 返回Sequelize实例
 */
var getSequelize = function () {
    console.log('🔍 [getSequelize] 被调用');
    console.log('🔍 [getSequelize] sequelize实例状态:', sequelize ? '已初始化' : '未初始化');
    console.log('🔍 [getSequelize] sequelize类型:', typeof sequelize);
    console.log('🔍 [getSequelize] sequelize值:', sequelize);
    if (!sequelize) {
        console.error('❌ [getSequelize] sequelize为空，抛出错误');
        throw new Error('数据库尚未初始化，请先调用 initDatabase。');
    }
    console.log('✅ [getSequelize] 返回sequelize实例');
    return sequelize;
};
exports.getSequelize = getSequelize;
/**
 * 关闭数据库连接
 * @returns {Promise<void>}
 */
var closeDatabase = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!sequelize) return [3 /*break*/, 2];
                return [4 /*yield*/, sequelize.close()];
            case 1:
                _a.sent();
                console.log('数据库连接已关闭.');
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
exports.closeDatabase = closeDatabase;
/**
 * 记录数据库操作日志
 * @param {string} operation - 操作名称
 * @param {boolean} result - 操作结果
 * @param {string} [message] - 附加信息
 */
function logDbOperation(operation, result, message) {
    var logDir = path.join(__dirname, '../../logs');
    // 确保日志目录存在
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    var logFile = path.join(logDir, 'database.log');
    var timestamp = new Date().toISOString();
    var logMessage = "[".concat(timestamp, "] ").concat(operation, ": ").concat(result ? 'SUCCESS' : 'FAILED', " ").concat(message || '', "\n");
    fs.appendFileSync(logFile, logMessage);
}
exports.logDbOperation = logDbOperation;
