"use strict";
exports.__esModule = true;
exports.DataValidationService = void 0;
var DataValidationService = /** @class */ (function () {
    function DataValidationService() {
        // 预定义的验证规则
        this.validationRules = {
            student: [
                { field: 'name', type: 'string', required: true, minLength: 1, maxLength: 50 },
                { field: 'studentId', type: 'string', required: false, maxLength: 20, pattern: /^[A-Za-z0-9]+$/ },
                { field: 'phone', type: 'phone', required: false },
                { field: 'email', type: 'email', required: false },
                { field: 'birthDate', type: 'date', required: false },
                { field: 'gender', type: 'enum', required: false, enumValues: ['male', 'female'] },
                { field: 'address', type: 'string', required: false, maxLength: 200 }
            ],
            parent: [
                { field: 'name', type: 'string', required: true, minLength: 1, maxLength: 50 },
                { field: 'phone', type: 'phone', required: true },
                { field: 'email', type: 'email', required: false },
                { field: 'relationship', type: 'enum', required: true, enumValues: ['father', 'mother', 'guardian'] },
                { field: 'occupation', type: 'string', required: false, maxLength: 100 },
                { field: 'address', type: 'string', required: false, maxLength: 200 }
            ],
            teacher: [
                { field: 'name', type: 'string', required: true, minLength: 1, maxLength: 50 },
                { field: 'employeeId', type: 'string', required: false, maxLength: 20, pattern: /^[A-Za-z0-9]+$/ },
                { field: 'phone', type: 'phone', required: true },
                { field: 'email', type: 'email', required: true },
                { field: 'subject', type: 'string', required: false, maxLength: 50 },
                { field: 'department', type: 'string', required: false, maxLength: 50 },
                { field: 'hireDate', type: 'date', required: false }
            ]
        };
    }
    /**
     * 验证单条记录
     */
    DataValidationService.prototype.validateRecord = function (record, importType) {
        var rules = this.validationRules[importType];
        if (!rules) {
            return {
                isValid: false,
                errors: [{ field: 'importType', value: importType, message: '不支持的导入类型', code: 'INVALID_IMPORT_TYPE' }],
                warnings: []
            };
        }
        var errors = [];
        var warnings = [];
        for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
            var rule = rules_1[_i];
            var value = record[rule.field];
            var fieldValidation = this.validateField(value, rule);
            if (!fieldValidation.isValid) {
                errors.push.apply(errors, fieldValidation.errors);
            }
            warnings.push.apply(warnings, fieldValidation.warnings);
        }
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    };
    /**
     * 批量验证记录
     */
    DataValidationService.prototype.validateBatch = function (records, importType) {
        var _this = this;
        var validRecords = [];
        var invalidRecords = [];
        records.forEach(function (record, index) {
            var validation = _this.validateRecord(record, importType);
            if (validation.isValid) {
                validRecords.push(record);
            }
            else {
                invalidRecords.push({
                    record: record,
                    errors: validation.errors,
                    index: index + 1
                });
            }
        });
        return {
            validRecords: validRecords,
            invalidRecords: invalidRecords,
            summary: {
                total: records.length,
                valid: validRecords.length,
                invalid: invalidRecords.length
            }
        };
    };
    /**
     * 验证单个字段
     */
    DataValidationService.prototype.validateField = function (value, rule) {
        var errors = [];
        var warnings = [];
        // 检查必填字段
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push({
                field: rule.field,
                value: value,
                message: "".concat(rule.field, "\u662F\u5FC5\u586B\u5B57\u6BB5"),
                code: 'REQUIRED_FIELD_MISSING'
            });
            return { isValid: false, errors: errors, warnings: warnings };
        }
        // 如果值为空且非必填，跳过其他验证
        if (value === undefined || value === null || value === '') {
            return { isValid: true, errors: errors, warnings: warnings };
        }
        // 类型验证
        switch (rule.type) {
            case 'string':
                if (typeof value !== 'string') {
                    errors.push({
                        field: rule.field,
                        value: value,
                        message: "".concat(rule.field, "\u5FC5\u987B\u662F\u5B57\u7B26\u4E32\u7C7B\u578B"),
                        code: 'INVALID_TYPE'
                    });
                }
                else {
                    // 长度验证
                    if (rule.minLength && value.length < rule.minLength) {
                        errors.push({
                            field: rule.field,
                            value: value,
                            message: "".concat(rule.field, "\u957F\u5EA6\u4E0D\u80FD\u5C11\u4E8E").concat(rule.minLength, "\u4E2A\u5B57\u7B26"),
                            code: 'MIN_LENGTH_VIOLATION'
                        });
                    }
                    if (rule.maxLength && value.length > rule.maxLength) {
                        errors.push({
                            field: rule.field,
                            value: value,
                            message: "".concat(rule.field, "\u957F\u5EA6\u4E0D\u80FD\u8D85\u8FC7").concat(rule.maxLength, "\u4E2A\u5B57\u7B26"),
                            code: 'MAX_LENGTH_VIOLATION'
                        });
                    }
                    // 正则验证
                    if (rule.pattern && !rule.pattern.test(value)) {
                        errors.push({
                            field: rule.field,
                            value: value,
                            message: "".concat(rule.field, "\u683C\u5F0F\u4E0D\u6B63\u786E"),
                            code: 'PATTERN_MISMATCH'
                        });
                    }
                }
                break;
            case 'number':
                var numValue = Number(value);
                if (isNaN(numValue)) {
                    errors.push({
                        field: rule.field,
                        value: value,
                        message: "".concat(rule.field, "\u5FC5\u987B\u662F\u6570\u5B57"),
                        code: 'INVALID_NUMBER'
                    });
                }
                else {
                    if (rule.min !== undefined && numValue < rule.min) {
                        errors.push({
                            field: rule.field,
                            value: value,
                            message: "".concat(rule.field, "\u4E0D\u80FD\u5C0F\u4E8E").concat(rule.min),
                            code: 'MIN_VALUE_VIOLATION'
                        });
                    }
                    if (rule.max !== undefined && numValue > rule.max) {
                        errors.push({
                            field: rule.field,
                            value: value,
                            message: "".concat(rule.field, "\u4E0D\u80FD\u5927\u4E8E").concat(rule.max),
                            code: 'MAX_VALUE_VIOLATION'
                        });
                    }
                }
                break;
            case 'email':
                if (!this.isValidEmail(value)) {
                    errors.push({
                        field: rule.field,
                        value: value,
                        message: "".concat(rule.field, "\u90AE\u7BB1\u683C\u5F0F\u4E0D\u6B63\u786E"),
                        code: 'INVALID_EMAIL'
                    });
                }
                break;
            case 'phone':
                if (!this.isValidPhone(value)) {
                    errors.push({
                        field: rule.field,
                        value: value,
                        message: "".concat(rule.field, "\u7535\u8BDD\u53F7\u7801\u683C\u5F0F\u4E0D\u6B63\u786E"),
                        code: 'INVALID_PHONE'
                    });
                }
                break;
            case 'date':
                if (!this.isValidDate(value)) {
                    errors.push({
                        field: rule.field,
                        value: value,
                        message: "".concat(rule.field, "\u65E5\u671F\u683C\u5F0F\u4E0D\u6B63\u786E"),
                        code: 'INVALID_DATE'
                    });
                }
                break;
            case 'enum':
                if (rule.enumValues && !rule.enumValues.includes(value)) {
                    errors.push({
                        field: rule.field,
                        value: value,
                        message: "".concat(rule.field, "\u5FC5\u987B\u662F\u4EE5\u4E0B\u503C\u4E4B\u4E00: ").concat(rule.enumValues.join(', ')),
                        code: 'INVALID_ENUM_VALUE'
                    });
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 0 && value !== 1) {
                    errors.push({
                        field: rule.field,
                        value: value,
                        message: "".concat(rule.field, "\u5FC5\u987B\u662F\u5E03\u5C14\u503C"),
                        code: 'INVALID_BOOLEAN'
                    });
                }
                break;
        }
        // 自定义验证器
        if (rule.customValidator) {
            var customResult = rule.customValidator(value);
            if (customResult !== true) {
                errors.push({
                    field: rule.field,
                    value: value,
                    message: typeof customResult === 'string' ? customResult : "".concat(rule.field, "\u81EA\u5B9A\u4E49\u9A8C\u8BC1\u5931\u8D25"),
                    code: 'CUSTOM_VALIDATION_FAILED'
                });
            }
        }
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    };
    /**
     * 验证邮箱格式
     */
    DataValidationService.prototype.isValidEmail = function (email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    /**
     * 验证电话号码格式
     */
    DataValidationService.prototype.isValidPhone = function (phone) {
        // 支持中国大陆手机号和固定电话
        var mobileRegex = /^1[3-9]\d{9}$/;
        var landlineRegex = /^0\d{2,3}-?\d{7,8}$/;
        var cleanPhone = phone.replace(/[-\s]/g, '');
        return mobileRegex.test(cleanPhone) || landlineRegex.test(phone);
    };
    /**
     * 验证日期格式
     */
    DataValidationService.prototype.isValidDate = function (date) {
        var parsedDate = new Date(date);
        return !isNaN(parsedDate.getTime());
    };
    /**
     * 获取验证规则
     */
    DataValidationService.prototype.getValidationRules = function (importType) {
        return this.validationRules[importType] || [];
    };
    /**
     * 添加自定义验证规则
     */
    DataValidationService.prototype.addCustomRule = function (importType, rule) {
        if (!this.validationRules[importType]) {
            this.validationRules[importType] = [];
        }
        this.validationRules[importType].push(rule);
    };
    return DataValidationService;
}());
exports.DataValidationService = DataValidationService;
