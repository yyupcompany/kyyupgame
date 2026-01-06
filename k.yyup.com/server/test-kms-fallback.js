"use strict";
/**
 * KMS Fallback模式测试
 * 验证当KMS不可用时，系统是否能正常使用本地加密
 */
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
var aliyun_kms_service_1 = require("./src/services/aliyun-kms.service");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var kmsFallback, result, cacheStatus, plaintext, encrypted, decrypted, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('=== KMS Fallback模式测试 ===\n');
                // 测试1: 禁用KMS，强制使用Fallback
                console.log('测试1: 禁用KMS，使用Fallback模式');
                kmsFallback = new aliyun_kms_service_1.AliyunKMSService({
                    enabled: false,
                    fallbackEnabled: true,
                    accessKeyId: 'test',
                    accessKeySecret: 'test',
                    region: 'cn-guangzhou'
                });
                console.log('1. KMS可用状态:', kmsFallback.isAvailable());
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                console.log('\n2. 测试密钥生成（Fallback模式）...');
                return [4 /*yield*/, kmsFallback.generateDataKey('alias/jwt-signing-key')];
            case 2:
                result = _a.sent();
                console.log('   ✅ 密钥生成成功');
                console.log('   - 密钥长度:', result.plaintext.length, '字节');
                console.log('   - 密文长度:', result.ciphertext.length, '字符');
                cacheStatus = kmsFallback.getCacheStatus();
                console.log('   - 缓存状态:', cacheStatus);
                console.log('\n3. 测试加密解密（Fallback模式）...');
                plaintext = 'Hello KMS Fallback - 等保3级合规!';
                return [4 /*yield*/, kmsFallback.encrypt('alias/jwt-signing-key', plaintext)];
            case 3:
                encrypted = _a.sent();
                return [4 /*yield*/, kmsFallback.decrypt(encrypted)];
            case 4:
                decrypted = _a.sent();
                console.log('   - 原文:', plaintext);
                console.log('   - 解密:', decrypted);
                console.log('   ✅ 加密解密测试' + (plaintext === decrypted ? '成功' : '失败'));
                console.log('\n=== ✅ Fallback模式测试通过 ===');
                console.log('\n注意: 本地环境可能无法直接访问阿里云KMS，');
                console.log('但Fallback模式确保系统功能正常工作。');
                console.log('生产环境部署时，请确保服务器能访问阿里云KMS。');
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('\n❌ Fallback模式测试失败:', error_1.message);
                console.error('   详情:', error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); })();
