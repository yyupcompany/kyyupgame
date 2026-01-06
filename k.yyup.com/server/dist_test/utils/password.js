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
exports.generateRandomToken = exports.verifyPassword = exports.hashPassword = void 0;
/**
 * 密码工具函数
 * 用于对密码进行哈希处理和验证
 */
var crypto = __importStar(require("crypto"));
// @ts-ignore
var bcrypt = __importStar(require("bcrypt"));
// 盐轮数
var SALT_ROUNDS = 10;
/**
 * 对密码进行哈希处理
 * @param password 原始密码
 * @returns 哈希后的密码
 */
var hashPassword = function (password) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, bcrypt.hash(password, SALT_ROUNDS)];
    });
}); };
exports.hashPassword = hashPassword;
/**
 * 验证密码是否匹配
 * @param password 原始密码
 * @param hashedPassword 哈希后的密码
 * @returns 是否匹配
 */
var verifyPassword = function (password, hashedPassword) { return __awaiter(void 0, void 0, void 0, function () {
    var md5Hash, md5HashUtf8, md5HashAscii, md5HashBinary, isMatch, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('===== 密码验证开始 =====');
                console.log('输入的明文密码:', password);
                console.log('数据库中的哈希密码:', hashedPassword);
                // 处理空值情况
                if (!password || !hashedPassword) {
                    console.log('密码或哈希为空，返回false');
                    return [2 /*return*/, false];
                }
                // 检查是否是MD5哈希（32位十六进制字符）
                if (hashedPassword.length === 32 && /^[a-f0-9]{32}$/i.test(hashedPassword)) {
                    console.log('检测到MD5哈希格式');
                    md5Hash = crypto.createHash('md5').update(password).digest('hex');
                    console.log('计算的MD5哈希(默认):', md5Hash);
                    md5HashUtf8 = crypto.createHash('md5').update(password, 'utf8').digest('hex');
                    console.log('计算的MD5哈希(utf8):', md5HashUtf8);
                    md5HashAscii = crypto.createHash('md5').update(password, 'ascii').digest('hex');
                    console.log('计算的MD5哈希(ascii):', md5HashAscii);
                    md5HashBinary = crypto.createHash('md5').update(Buffer.from(password, 'binary')).digest('hex');
                    console.log('计算的MD5哈希(binary):', md5HashBinary);
                    // 测试不同编码的匹配结果
                    console.log('比较结果(默认):', md5Hash === hashedPassword);
                    console.log('比较结果(utf8):', md5HashUtf8 === hashedPassword);
                    console.log('比较结果(ascii):', md5HashAscii === hashedPassword);
                    console.log('比较结果(binary):', md5HashBinary === hashedPassword);
                    isMatch = md5Hash === hashedPassword ||
                        md5HashUtf8 === hashedPassword ||
                        md5HashAscii === hashedPassword ||
                        md5HashBinary === hashedPassword;
                    console.log('最终MD5验证结果:', isMatch);
                    return [2 /*return*/, isMatch];
                }
                console.log('尝试使用bcrypt验证');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, bcrypt.compare(password, hashedPassword)];
            case 2:
                result = _a.sent();
                console.log('bcrypt验证结果:', result);
                console.log('===== 密码验证结束 =====');
                return [2 /*return*/, result];
            case 3:
                error_1 = _a.sent();
                console.error('密码验证错误:', error_1);
                console.log('===== 密码验证失败 =====');
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.verifyPassword = verifyPassword;
/**
 * 生成随机令牌
 * @param length 令牌长度
 * @returns 随机令牌
 */
var generateRandomToken = function (length) {
    if (length === void 0) { length = 32; }
    // 处理负数长度
    if (length < 0) {
        throw new Error('Token length must be non-negative');
    }
    return crypto.randomBytes(length).toString('hex');
};
exports.generateRandomToken = generateRandomToken;
exports["default"] = {
    hashPassword: exports.hashPassword,
    verifyPassword: exports.verifyPassword,
    generateRandomToken: exports.generateRandomToken
};
