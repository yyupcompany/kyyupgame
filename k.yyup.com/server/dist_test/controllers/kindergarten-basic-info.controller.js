"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.KindergartenBasicInfoController = void 0;
var index_1 = require("../models/index");
var multer_1 = __importDefault(require("multer"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
/**
 * 配置文件上传
 */
var storage = multer_1["default"].diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = path_1["default"].join(__dirname, '../../uploads/kindergarten');
        // 确保目录存在
        if (!fs_1["default"].existsSync(uploadDir)) {
            fs_1["default"].mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名
        var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        var ext = path_1["default"].extname(file.originalname);
        cb(null, "kindergarten-".concat(uniqueSuffix).concat(ext));
    }
});
var upload = (0, multer_1["default"])({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB限制
    },
    fileFilter: function (req, file, cb) {
        // 只允许图片文件
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('只允许上传图片文件'));
        }
    }
});
/**
 * 幼儿园基本资料控制器
 */
var KindergartenBasicInfoController = /** @class */ (function () {
    function KindergartenBasicInfoController() {
    }
    /**
     * 获取幼儿园基本资料
     */
    KindergartenBasicInfoController.getBasicInfo = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var kindergarten, coverImages, basicInfo, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, index_1.Kindergarten.findOne({
                                where: {
                                    status: 1
                                },
                                attributes: [
                                    'id', 'name', 'code', 'type', 'level', 'address',
                                    'longitude', 'latitude', 'phone', 'email', 'principal',
                                    'establishedDate', 'area', 'buildingArea', 'classCount',
                                    'teacherCount', 'studentCount', 'description', 'features',
                                    'philosophy', 'feeDescription', 'status', 'logoUrl',
                                    'coverImages', 'contactPerson', 'consultationPhone'
                                ],
                                raw: true
                            })];
                    case 1:
                        kindergarten = _a.sent();
                        if (!kindergarten) {
                            // 如果没有数据，返回空对象而不是404
                            return [2 /*return*/, res.json({
                                    success: true,
                                    data: {
                                        id: null,
                                        name: '',
                                        description: '',
                                        studentCount: 0,
                                        teacherCount: 0,
                                        classCount: 0,
                                        logoUrl: '',
                                        coverImages: [],
                                        contactPerson: '',
                                        consultationPhone: '',
                                        address: '',
                                        phone: '',
                                        email: '',
                                        principal: '',
                                        establishedDate: null,
                                        area: 0,
                                        buildingArea: 0,
                                        features: '',
                                        philosophy: '',
                                        feeDescription: ''
                                    },
                                    message: '暂无幼儿园信息'
                                })];
                        }
                        coverImages = [];
                        if (kindergarten.coverImages) {
                            try {
                                coverImages = JSON.parse(kindergarten.coverImages);
                            }
                            catch (e) {
                                coverImages = [];
                            }
                        }
                        basicInfo = {
                            id: kindergarten.id,
                            // 1. 园区介绍
                            name: kindergarten.name,
                            description: kindergarten.description || '',
                            // 2. 幼儿园规模（人数）
                            studentCount: kindergarten.studentCount || 0,
                            teacherCount: kindergarten.teacherCount || 0,
                            classCount: kindergarten.classCount || 0,
                            // 3. 园区配图
                            logoUrl: kindergarten.logoUrl || '',
                            coverImages: coverImages,
                            // 4. 联系人
                            contactPerson: kindergarten.contactPerson || kindergarten.principal || '',
                            // 5. 咨询电话
                            consultationPhone: kindergarten.consultationPhone || kindergarten.phone || '',
                            // 6. 园区地址
                            address: kindergarten.address || '',
                            // 其他基础信息
                            phone: kindergarten.phone || '',
                            email: kindergarten.email || '',
                            principal: kindergarten.principal || '',
                            establishedDate: kindergarten.establishedDate,
                            area: kindergarten.area || 0,
                            buildingArea: kindergarten.buildingArea || 0,
                            features: kindergarten.features || '',
                            philosophy: kindergarten.philosophy || '',
                            feeDescription: kindergarten.feeDescription || ''
                        };
                        res.json({
                            success: true,
                            data: basicInfo
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('获取幼儿园基本资料失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取基本资料失败',
                            error: error_1.message
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新幼儿园基本资料
     */
    KindergartenBasicInfoController.updateBasicInfo = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, 
            // 1. 园区介绍
            name_1, description, 
            // 2. 幼儿园规模（人数）
            studentCount, teacherCount, classCount, 
            // 3. 园区配图
            logoUrl, coverImages, 
            // 4. 联系人
            contactPerson, 
            // 5. 咨询电话
            consultationPhone, 
            // 6. 园区地址
            address, 
            // 其他字段
            phone, email, principal, establishedDate, area, buildingArea, features, philosophy, feeDescription, kindergarten, coverImagesJson, updateData, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = req.body, name_1 = _a.name, description = _a.description, studentCount = _a.studentCount, teacherCount = _a.teacherCount, classCount = _a.classCount, logoUrl = _a.logoUrl, coverImages = _a.coverImages, contactPerson = _a.contactPerson, consultationPhone = _a.consultationPhone, address = _a.address, phone = _a.phone, email = _a.email, principal = _a.principal, establishedDate = _a.establishedDate, area = _a.area, buildingArea = _a.buildingArea, features = _a.features, philosophy = _a.philosophy, feeDescription = _a.feeDescription;
                        return [4 /*yield*/, index_1.Kindergarten.findOne({
                                where: {
                                    status: 1
                                }
                            })];
                    case 1:
                        kindergarten = _b.sent();
                        if (!kindergarten) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '未找到幼儿园信息'
                                })];
                        }
                        coverImagesJson = null;
                        if (coverImages && Array.isArray(coverImages)) {
                            coverImagesJson = JSON.stringify(coverImages);
                        }
                        updateData = {};
                        if (name_1 !== undefined)
                            updateData.name = name_1;
                        if (description !== undefined)
                            updateData.description = description;
                        if (studentCount !== undefined)
                            updateData.studentCount = studentCount;
                        if (teacherCount !== undefined)
                            updateData.teacherCount = teacherCount;
                        if (classCount !== undefined)
                            updateData.classCount = classCount;
                        if (logoUrl !== undefined)
                            updateData.logoUrl = logoUrl;
                        if (coverImagesJson !== null)
                            updateData.coverImages = coverImagesJson;
                        if (contactPerson !== undefined)
                            updateData.contactPerson = contactPerson;
                        if (consultationPhone !== undefined)
                            updateData.consultationPhone = consultationPhone;
                        if (address !== undefined)
                            updateData.address = address;
                        if (phone !== undefined)
                            updateData.phone = phone;
                        if (email !== undefined)
                            updateData.email = email;
                        if (principal !== undefined)
                            updateData.principal = principal;
                        if (establishedDate !== undefined)
                            updateData.establishedDate = establishedDate;
                        if (area !== undefined)
                            updateData.area = area;
                        if (buildingArea !== undefined)
                            updateData.buildingArea = buildingArea;
                        if (features !== undefined)
                            updateData.features = features;
                        if (philosophy !== undefined)
                            updateData.philosophy = philosophy;
                        if (feeDescription !== undefined)
                            updateData.feeDescription = feeDescription;
                        // 添加更新时间
                        updateData.updatedAt = new Date();
                        return [4 /*yield*/, kindergarten.update(updateData)];
                    case 2:
                        _b.sent();
                        res.json({
                            success: true,
                            message: '基本资料更新成功',
                            data: __assign({ id: kindergarten.id }, updateData)
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        console.error('更新幼儿园基本资料失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '更新基本资料失败',
                            error: error_2.message
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    KindergartenBasicInfoController.uploadImage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var file, imageUrl;
            return __generator(this, function (_a) {
                try {
                    file = req.file;
                    if (!file) {
                        return [2 /*return*/, res.status(400).json({
                                success: false,
                                message: '未找到上传的文件'
                            })];
                    }
                    imageUrl = "/uploads/kindergarten/".concat(file.filename);
                    res.json({
                        success: true,
                        message: '图片上传成功',
                        data: {
                            url: imageUrl,
                            filename: file.filename,
                            originalName: file.originalname,
                            size: file.size
                        }
                    });
                }
                catch (error) {
                    console.error('图片上传失败:', error);
                    res.status(500).json({
                        success: false,
                        message: '图片上传失败',
                        error: error.message
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    KindergartenBasicInfoController.uploadImages = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var files, imageUrls;
            return __generator(this, function (_a) {
                try {
                    files = req.files;
                    if (!files || files.length === 0) {
                        return [2 /*return*/, res.status(400).json({
                                success: false,
                                message: '未找到上传的文件'
                            })];
                    }
                    imageUrls = files.map(function (file) { return ({
                        url: "/uploads/kindergarten/".concat(file.filename),
                        filename: file.filename,
                        originalName: file.originalname,
                        size: file.size
                    }); });
                    res.json({
                        success: true,
                        message: "\u6210\u529F\u4E0A\u4F20".concat(files.length, "\u5F20\u56FE\u7247"),
                        data: {
                            images: imageUrls
                        }
                    });
                }
                catch (error) {
                    console.error('批量图片上传失败:', error);
                    res.status(500).json({
                        success: false,
                        message: '批量图片上传失败',
                        error: error.message
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 上传单张图片（logo）
     */
    KindergartenBasicInfoController.uploadSingle = upload.single('image');
    /**
     * 上传多张图片（园区配图）
     */
    KindergartenBasicInfoController.uploadMultiple = upload.array('images', 10); // 最多10张图片
    return KindergartenBasicInfoController;
}());
exports.KindergartenBasicInfoController = KindergartenBasicInfoController;
