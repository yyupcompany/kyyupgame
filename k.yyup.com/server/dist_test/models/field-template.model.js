"use strict";
/**
 * 字段模板数据模型
 *
 * 用于保存用户常用的字段组合，方便快速填写
 */
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
exports.initFieldTemplate = void 0;
var sequelize_1 = require("sequelize");
/**
 * 字段模板模型类
 */
var FieldTemplate = /** @class */ (function (_super) {
    __extends(FieldTemplate, _super);
    function FieldTemplate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FieldTemplate;
}(sequelize_1.Model));
/**
 * 初始化字段模板模型
 */
function initFieldTemplate(sequelize) {
    FieldTemplate.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '模板ID'
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '模板名称'
        },
        description: {
            type: sequelize_1.DataTypes.STRING(500),
            allowNull: true,
            comment: '模板描述'
        },
        entity_type: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '实体类型（students, teachers, classes等）'
        },
        field_values: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            comment: '字段值JSON对象'
        },
        user_id: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '创建用户ID'
        },
        is_public: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否公开（公开模板所有用户可见）'
        },
        usage_count: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '使用次数'
        },
        created_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'created_at',
            comment: '创建时间'
        },
        updated_at: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'updated_at',
            comment: '更新时间'
        }
    }, {
        sequelize: sequelize,
        tableName: 'field_templates',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                name: 'idx_user_id',
                fields: ['user_id']
            },
            {
                name: 'idx_entity_type',
                fields: ['entity_type']
            },
            {
                name: 'idx_is_public',
                fields: ['is_public']
            }
        ],
        comment: '字段模板表'
    });
}
exports.initFieldTemplate = initFieldTemplate;
exports["default"] = FieldTemplate;
