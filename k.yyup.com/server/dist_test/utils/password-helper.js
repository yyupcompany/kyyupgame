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
exports.getHashType = exports.hashPassword = exports.verifyPassword = void 0;
var bcrypt = __importStar(require("bcrypt"));
var crypto = __importStar(require("crypto"));
/**
 * 增强版密码验证函数 - 支持MD5和bcrypt
 * @param password 明文密码
 * @param hash 数据库中存储的哈希密码
 * @returns 验证结果
 */
function verifyPassword(password, hash) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_1, md5Default, md5Utf8, md5Ascii, md5Binary, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('===== 密码验证开始 =====');
                    console.log('输入的明文密码:', password);
                    console.log('数据库中的哈希密码:', hash);
                    if (!(hash.startsWith('$2b$') || hash.startsWith('$2a$'))) return [3 /*break*/, 5];
                    console.log('检测到bcrypt哈希格式');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, bcrypt.compare(password, hash)];
                case 2:
                    result = _a.sent();
                    console.log('bcrypt验证结果:', result);
                    return [2 /*return*/, result];
                case 3:
                    error_1 = _a.sent();
                    console.error('bcrypt验证错误:', error_1);
                    return [2 /*return*/, false];
                case 4: return [3 /*break*/, 6];
                case 5:
                    if (hash.length === 32 || hash.length === 16) {
                        // 可能是MD5哈希
                        console.log('检测到MD5哈希格式');
                        md5Default = crypto.createHash('md5').update(password).digest('hex');
                        md5Utf8 = crypto.createHash('md5').update(password, 'utf8').digest('hex');
                        md5Ascii = crypto.createHash('md5').update(password, 'ascii').digest('hex');
                        md5Binary = crypto.createHash('md5').update(password, 'binary').digest('hex');
                        console.log('计算的MD5哈希(默认):', md5Default);
                        console.log('计算的MD5哈希(utf8):', md5Utf8);
                        console.log('计算的MD5哈希(ascii):', md5Ascii);
                        console.log('计算的MD5哈希(binary):', md5Binary);
                        console.log('比较结果(默认):', hash === md5Default);
                        console.log('比较结果(utf8):', hash === md5Utf8);
                        console.log('比较结果(ascii):', hash === md5Ascii);
                        console.log('比较结果(binary):', hash === md5Binary);
                        result = hash === md5Default || hash === md5Utf8 || hash === md5Ascii || hash === md5Binary;
                        console.log('最终MD5验证结果:', result);
                        return [2 /*return*/, result];
                    }
                    _a.label = 6;
                case 6:
                    // 不支持的哈希格式
                    console.log('不支持的哈希格式');
                    return [2 /*return*/, false];
            }
        });
    });
}
exports.verifyPassword = verifyPassword;
/**
 * 生成密码哈希
 * @param password 明文密码
 * @param type 哈希类型 'bcrypt' 或 'md5'，默认为 'bcrypt'
 * @returns 哈希密码
 */
function hashPassword(password, type) {
    if (type === void 0) { type = 'bcrypt'; }
    return __awaiter(this, void 0, void 0, function () {
        var saltRounds;
        return __generator(this, function (_a) {
            if (type === 'bcrypt') {
                saltRounds = 10;
                return [2 /*return*/, bcrypt.hash(password, saltRounds)];
            }
            else {
                return [2 /*return*/, crypto.createHash('md5').update(password).digest('hex')];
            }
            return [2 /*return*/];
        });
    });
}
exports.hashPassword = hashPassword;
/**
 * 检查哈希类型
 * @param hash 哈希密码
 * @returns 哈希类型: 'bcrypt', 'md5' 或 'unknown'
 */
function getHashType(hash) {
    if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
        return 'bcrypt';
    }
    else if (hash.length === 32) {
        return 'md5';
    }
    else {
        return 'unknown';
    }
}
exports.getHashType = getHashType;
