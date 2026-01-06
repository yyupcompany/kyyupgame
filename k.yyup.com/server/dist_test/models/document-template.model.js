"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var sequelize_1 = require("sequelize");
// 文档模板模型
var DocumentTemplate = /** @class */ (function (_super) {
    __extends(DocumentTemplate, _super);
    function DocumentTemplate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 初始化模型
    DocumentTemplate.initModel = function (sequelize) {
        DocumentTemplate.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            code: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                unique: true,
                comment: '模板编号'
            },
            name: {
                type: sequelize_1.DataTypes.STRING(200),
                allowNull: false,
                comment: '模板名称'
            },
            category: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                comment: '分类'
            },
            subCategory: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: true,
                field: 'sub_category',
                comment: '子分类'
            },
            contentType: {
                type: sequelize_1.DataTypes.ENUM('markdown', 'html', 'json'),
                allowNull: false,
                defaultValue: 'markdown',
                field: 'content_type',
                comment: '内容类型'
            },
            templateContent: {
                type: sequelize_1.DataTypes.TEXT('long'),
                allowNull: false,
                field: 'template_content',
                comment: '模板内容'
            },
            variables: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                comment: '变量配置'
            },
            defaultValues: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                field: 'default_values',
                comment: '默认值'
            },
            frequency: {
                type: sequelize_1.DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'as_needed'),
                allowNull: true,
                comment: '使用频率'
            },
            priority: {
                type: sequelize_1.DataTypes.ENUM('required', 'recommended', 'optional'),
                allowNull: false,
                defaultValue: 'optional',
                comment: '优先级'
            },
            inspectionTypeIds: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                field: 'inspection_type_ids',
                comment: '关联检查类型IDs'
            },
            relatedTemplateIds: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: true,
                field: 'related_template_ids',
                comment: '相关模板IDs'
            },
            isDetailed: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_detailed',
                comment: '是否详细版'
            },
            lineCount: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'line_count',
                comment: '行数'
            },
            estimatedFillTime: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'estimated_fill_time',
                comment: '预计填写时间(分钟)'
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active',
                comment: '是否启用'
            },
            version: {
                type: sequelize_1.DataTypes.STRING(20),
                allowNull: false,
                defaultValue: '1.0',
                comment: '版本号'
            },
            useCount: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'use_count',
                comment: '使用次数'
            },
            lastUsedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
                field: 'last_used_at',
                comment: '最后使用时间'
            },
            createdBy: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'created_by',
                comment: '创建人ID'
            }
        }, {
            sequelize: sequelize,
            tableName: 'document_templates',
            timestamps: true,
            underscored: true,
            indexes: [
                { fields: ['code'], unique: true },
                { fields: ['category'] },
                { fields: ['priority'] },
                { fields: ['is_active'] },
                { fields: ['use_count'] },
            ]
        });
        return DocumentTemplate;
    };
    return DocumentTemplate;
}(sequelize_1.Model));
exports["default"] = DocumentTemplate;
