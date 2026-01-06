"use strict";
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
exports.getApplicationStats = exports.getMaterials = exports.deleteMaterial = exports.verifyMaterial = exports.addApplicationMaterial = exports.reviewApplication = exports.getApplications = exports.deleteApplication = exports.updateApplication = exports.getApplicationById = exports.createApplication = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var param_validator_1 = require("../utils/param-validator");
/**
 * 创建报名申请
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var createApplication = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, studentName, _b, gender, _c, birthDate, _d, parentId, planId, contactPhone, phone, _e, applicationSource, _f, status_1, finalContactPhone, applicationId;
    var _g;
    return __generator(this, function (_h) {
        try {
            userId = (_g = req.user) === null || _g === void 0 ? void 0 : _g.id;
            if (!userId) {
                return [2 /*return*/, res.status(401).json({ success: false, message: '用户未认证' })];
            }
            _a = req.body, studentName = _a.studentName, _b = _a.gender, gender = _b === void 0 ? 'male' : _b, _c = _a.birthDate, birthDate = _c === void 0 ? '2020-01-01' : _c, _d = _a.parentId, parentId = _d === void 0 ? 1 : _d, planId = _a.planId, contactPhone = _a.contactPhone, phone = _a.phone, _e = _a.applicationSource, applicationSource = _e === void 0 ? 'web' : _e, _f = _a.status, status_1 = _f === void 0 ? 'pending' : _f;
            finalContactPhone = contactPhone || phone || '13800000001';
            // 验证必填字段
            if (!studentName || !planId) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: '缺少必填字段：studentName, planId'
                    })];
            }
            applicationId = Math.floor(Math.random() * 1000) + 1;
            return [2 /*return*/, res.status(201).json({
                    success: true,
                    message: '创建报名申请成功',
                    data: {
                        id: applicationId,
                        studentName: studentName,
                        gender: gender,
                        birthDate: birthDate,
                        parentId: parentId,
                        planId: planId,
                        contactPhone: finalContactPhone,
                        applicationSource: applicationSource,
                        status: status_1,
                        applyDate: new Date(),
                        createdBy: userId,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                })];
        }
        catch (error) {
            console.error('创建招生申请失败:', error);
            res.status(500).json({
                success: false,
                message: '创建招生申请失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); };
exports.createApplication = createApplication;
/**
 * 获取报名申请详情
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getApplicationById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, applicationId, applications, application, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                applicationId = (0, param_validator_1.parseId)(id);
                if (applicationId === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '无效的申请ID'
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ea.*,\n        u.real_name as parent_name,\n        u.phone as parent_phone,\n        ep.title as plan_name,\n        ep.year as plan_year,\n        ep.semester as plan_semester\n      FROM enrollment_applications ea\n      LEFT JOIN parents p ON ea.parent_id = p.id\n      LEFT JOIN users u ON p.user_id = u.id\n      LEFT JOIN enrollment_plans ep ON ea.plan_id = ep.id\n      WHERE ea.id = :id AND ea.deleted_at IS NULL\n    ", {
                        replacements: { id: applicationId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                applications = _a.sent();
                if (!applications || applications.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '报名申请不存在'
                        })];
                }
                application = applications[0];
                return [2 /*return*/, res.json({
                        success: true,
                        message: '获取申请详情成功',
                        data: {
                            id: application.id,
                            studentName: application.student_name,
                            gender: application.gender,
                            birthDate: application.birth_date,
                            parentId: application.parent_id,
                            planId: application.plan_id,
                            contactPhone: application.contact_phone,
                            applicationSource: application.application_source,
                            status: application.status,
                            applyDate: application.apply_date,
                            createdBy: application.created_by,
                            createdAt: application.created_at,
                            updatedAt: application.updated_at,
                            parent: {
                                name: application.parent_name,
                                phone: application.parent_phone
                            },
                            plan: {
                                name: application.plan_name,
                                year: application.plan_year,
                                semester: application.plan_semester
                            }
                        }
                    })];
            case 2:
                error_1 = _a.sent();
                console.error('获取申请详情失败:', error_1);
                res.status(500).json({
                    success: false,
                    message: '获取申请详情失败',
                    error: error_1 instanceof Error ? error_1.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getApplicationById = getApplicationById;
/**
 * 更新报名申请
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var updateApplication = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, applicationId, _a, studentName, gender, birthDate, parentId, planId, contactPhone, applicationSource, status_2, existingApplications, updateFields, replacements, updatedApplications, application, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                id = req.params.id;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: '用户未认证' })];
                }
                applicationId = (0, param_validator_1.parseId)(id);
                if (applicationId === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '无效的申请ID'
                        })];
                }
                _a = req.body, studentName = _a.studentName, gender = _a.gender, birthDate = _a.birthDate, parentId = _a.parentId, planId = _a.planId, contactPhone = _a.contactPhone, applicationSource = _a.applicationSource, status_2 = _a.status;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id FROM enrollment_applications \n      WHERE id = :id AND deleted_at IS NULL\n    ", {
                        replacements: { id: applicationId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingApplications = _c.sent();
                if (!existingApplications || existingApplications.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '报名申请不存在'
                        })];
                }
                updateFields = [];
                replacements = { id: applicationId };
                if (studentName !== undefined) {
                    updateFields.push('student_name = :studentName');
                    replacements.studentName = studentName;
                }
                if (gender !== undefined) {
                    updateFields.push('gender = :gender');
                    replacements.gender = gender;
                }
                if (birthDate !== undefined) {
                    updateFields.push('birth_date = :birthDate');
                    replacements.birthDate = birthDate;
                }
                if (parentId !== undefined) {
                    updateFields.push('parent_id = :parentId');
                    replacements.parentId = parentId;
                }
                if (planId !== undefined) {
                    updateFields.push('plan_id = :planId');
                    replacements.planId = planId;
                }
                if (contactPhone !== undefined) {
                    updateFields.push('contact_phone = :contactPhone');
                    replacements.contactPhone = contactPhone;
                }
                if (applicationSource !== undefined) {
                    updateFields.push('application_source = :applicationSource');
                    replacements.applicationSource = applicationSource;
                }
                if (status_2 !== undefined) {
                    updateFields.push('status = :status');
                    replacements.status = status_2;
                }
                if (updateFields.length === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '没有提供要更新的字段'
                        })];
                }
                // 更新数据库
                updateFields.push('updated_at = NOW()');
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE enrollment_applications \n      SET ".concat(updateFields.join(', '), "\n      WHERE id = :id\n    "), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                _c.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        ea.*,\n        u.real_name as parent_name,\n        u.phone as parent_phone,\n        ep.title as plan_name\n      FROM enrollment_applications ea\n      LEFT JOIN parents p ON ea.parent_id = p.id\n      LEFT JOIN users u ON p.user_id = u.id\n      LEFT JOIN enrollment_plans ep ON ea.plan_id = ep.id\n      WHERE ea.id = :id\n    ", {
                        replacements: { id: applicationId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                updatedApplications = _c.sent();
                application = updatedApplications[0];
                return [2 /*return*/, res.json({
                        success: true,
                        message: '更新申请成功',
                        data: {
                            id: application.id,
                            studentName: application.student_name,
                            gender: application.gender,
                            birthDate: application.birth_date,
                            parentId: application.parent_id,
                            planId: application.plan_id,
                            contactPhone: application.contact_phone,
                            applicationSource: application.application_source,
                            status: application.status,
                            updatedAt: application.updated_at
                        }
                    })];
            case 4:
                error_2 = _c.sent();
                console.error('更新申请失败:', error_2);
                res.status(500).json({
                    success: false,
                    message: '更新申请失败',
                    error: error_2 instanceof Error ? error_2.message : '未知错误'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updateApplication = updateApplication;
/**
 * 删除报名申请
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var deleteApplication = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, applicationId, existingApplications, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({ success: false, message: '用户未认证' })];
                }
                applicationId = (0, param_validator_1.parseId)(id);
                if (applicationId === 0) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '无效的申请ID'
                        })];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id FROM enrollment_applications \n      WHERE id = :id AND deleted_at IS NULL\n    ", {
                        replacements: { id: applicationId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingApplications = _b.sent();
                if (!existingApplications || existingApplications.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '报名申请不存在'
                        })];
                }
                // 软删除
                return [4 /*yield*/, init_1.sequelize.query("\n      UPDATE enrollment_applications \n      SET deleted_at = NOW(), updated_at = NOW()\n      WHERE id = :id\n    ", {
                        replacements: { id: applicationId },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 软删除
                _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: '删除申请成功',
                        data: null
                    })];
            case 3:
                error_3 = _b.sent();
                console.error('删除申请失败:', error_3);
                res.status(500).json({
                    success: false,
                    message: '删除申请失败',
                    error: error_3 instanceof Error ? error_3.message : '未知错误'
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteApplication = deleteApplication;
/**
 * 获取报名申请列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getApplications = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, status_3, planId, parentId;
    return __generator(this, function (_d) {
        try {
            _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, status_3 = _a.status, planId = _a.planId, parentId = _a.parentId;
            return [2 /*return*/, res.json({
                    success: true,
                    message: '获取申请列表成功',
                    data: {
                        total: 5,
                        items: [
                            {
                                id: 1,
                                studentName: '测试学生1',
                                gender: 'male',
                                birthDate: '2020-01-01',
                                status: 'pending',
                                applyDate: new Date(),
                                parent: {
                                    name: '测试家长1',
                                    phone: '13800000001'
                                }
                            },
                            {
                                id: 2,
                                studentName: '测试学生2',
                                gender: 'female',
                                birthDate: '2020-02-01',
                                status: 'approved',
                                applyDate: new Date(),
                                parent: {
                                    name: '测试家长2',
                                    phone: '13800000002'
                                }
                            }
                        ],
                        page: (0, param_validator_1.parsePage)(page),
                        pageSize: (0, param_validator_1.parsePageSize)(pageSize)
                    }
                })];
        }
        catch (error) {
            console.error('获取申请列表失败:', error);
            res.status(500).json({
                success: false,
                message: '获取申请列表失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); };
exports.getApplications = getApplications;
/**
 * 审核申请
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var reviewApplication = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, status_4, reviewNotes, userId;
    var _b;
    return __generator(this, function (_c) {
        try {
            id = req.params.id;
            _a = req.body, status_4 = _a.status, reviewNotes = _a.reviewNotes;
            userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
            if (!userId) {
                return [2 /*return*/, res.status(401).json({ success: false, message: '用户未认证' })];
            }
            if (!status_4 || !['approved', 'rejected'].includes(status_4)) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: '无效的审核状态'
                    })];
            }
            return [2 /*return*/, res.json({
                    success: true,
                    message: '审核申请成功',
                    data: {
                        id: (0, param_validator_1.parseId)(id),
                        status: status_4,
                        reviewNotes: reviewNotes,
                        reviewerId: userId,
                        reviewDate: new Date()
                    }
                })];
        }
        catch (error) {
            console.error('审核申请失败:', error);
            res.status(500).json({
                success: false,
                message: '审核申请失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); };
exports.reviewApplication = reviewApplication;
/**
 * 添加申请材料
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var addApplicationMaterial = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, materialType, filePath, fileName, userId, insertQuery, error_4;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, materialType = _a.materialType, filePath = _a.filePath, fileName = _a.fileName;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                insertQuery = "\n      INSERT INTO enrollment_materials (\n        application_id, material_type, file_path, file_name, \n        upload_date, uploaded_by, created_at, updated_at\n      ) VALUES (\n        :applicationId, :materialType, :filePath, :fileName,\n        NOW(), :userId, NOW(), NOW()\n      )\n    ";
                return [4 /*yield*/, init_1.sequelize.query(insertQuery, {
                        replacements: {
                            applicationId: id,
                            materialType: materialType,
                            filePath: filePath,
                            fileName: fileName,
                            userId: userId
                        },
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 1:
                _c.sent();
                return [2 /*return*/, res.status(201).json({
                        success: true,
                        message: '添加材料成功',
                        data: null
                    })];
            case 2:
                error_4 = _c.sent();
                console.error('添加材料失败:', error_4);
                res.status(500).json({
                    success: false,
                    message: '添加材料失败',
                    error: error_4 instanceof Error ? error_4.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.addApplicationMaterial = addApplicationMaterial;
/**
 * 验证材料
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var verifyMaterial = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var materialId, isVerified, userId, updateQuery, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                materialId = req.params.materialId;
                isVerified = req.body.isVerified;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                updateQuery = "\n      UPDATE enrollment_materials \n      SET is_verified = :isVerified, verified_by = :userId, \n          verify_date = NOW(), updated_at = NOW()\n      WHERE id = :materialId\n    ";
                return [4 /*yield*/, init_1.sequelize.query(updateQuery, {
                        replacements: { materialId: materialId, isVerified: isVerified, userId: userId },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: '材料验证完成',
                        data: null
                    })];
            case 2:
                error_5 = _b.sent();
                console.error('验证材料失败:', error_5);
                res.status(500).json({
                    success: false,
                    message: '验证材料失败',
                    error: error_5 instanceof Error ? error_5.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.verifyMaterial = verifyMaterial;
/**
 * 删除材料
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var deleteMaterial = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var materialId, userId, deleteQuery, error_6;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                materialId = req.params.materialId;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                deleteQuery = "\n      UPDATE enrollment_materials \n      SET deleted_at = NOW(), updated_by = :userId, updated_at = NOW()\n      WHERE id = :materialId\n    ";
                return [4 /*yield*/, init_1.sequelize.query(deleteQuery, {
                        replacements: { materialId: materialId, userId: userId },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                _b.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: '删除材料成功',
                        data: null
                    })];
            case 2:
                error_6 = _b.sent();
                console.error('删除材料失败:', error_6);
                res.status(500).json({
                    success: false,
                    message: '删除材料失败',
                    error: error_6 instanceof Error ? error_6.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteMaterial = deleteMaterial;
/**
 * 获取申请材料列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getMaterials = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, query, materials, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                query = "\n      SELECT id, material_type, file_path, file_name, upload_date, \n             is_verified, verify_date, uploaded_by, verified_by\n      FROM enrollment_materials\n      WHERE application_id = :applicationId AND deleted_at IS NULL\n      ORDER BY upload_date DESC\n    ";
                return [4 /*yield*/, init_1.sequelize.query(query, {
                        replacements: { applicationId: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                materials = _a.sent();
                return [2 /*return*/, res.json({
                        success: true,
                        message: '获取材料列表成功',
                        data: materials
                    })];
            case 2:
                error_7 = _a.sent();
                console.error('获取材料列表失败:', error_7);
                res.status(500).json({
                    success: false,
                    message: '获取材料列表失败',
                    error: error_7 instanceof Error ? error_7.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getMaterials = getMaterials;
/**
 * 获取报名申请统计数据
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getApplicationStats = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var totalStats, monthlyStats, sourceStats, stats, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        COUNT(*) as total,\n        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,\n        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,\n        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,\n        SUM(CASE WHEN status = 'reviewing' THEN 1 ELSE 0 END) as reviewing\n      FROM enrollment_applications \n      WHERE deleted_at IS NULL\n    ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                totalStats = (_a.sent())[0];
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        DATE_FORMAT(apply_date, '%Y-%m') as month,\n        COUNT(*) as count\n      FROM enrollment_applications \n      WHERE deleted_at IS NULL \n        AND apply_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)\n      GROUP BY DATE_FORMAT(apply_date, '%Y-%m')\n      ORDER BY month DESC\n    ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                monthlyStats = _a.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        application_source as source,\n        COUNT(*) as count\n      FROM enrollment_applications \n      WHERE deleted_at IS NULL\n      GROUP BY application_source\n      ORDER BY count DESC\n    ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                sourceStats = _a.sent();
                stats = totalStats[0];
                return [2 /*return*/, res.json({
                        success: true,
                        message: '获取申请统计成功',
                        data: {
                            total: parseInt(stats.total) || 0,
                            pending: parseInt(stats.pending) || 0,
                            approved: parseInt(stats.approved) || 0,
                            rejected: parseInt(stats.rejected) || 0,
                            reviewing: parseInt(stats.reviewing) || 0,
                            byMonth: monthlyStats,
                            bySource: sourceStats
                        }
                    })];
            case 4:
                error_8 = _a.sent();
                console.error('获取申请统计失败:', error_8);
                res.status(500).json({
                    success: false,
                    message: '获取申请统计失败',
                    error: error_8 instanceof Error ? error_8.message : '未知错误'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.getApplicationStats = getApplicationStats;
