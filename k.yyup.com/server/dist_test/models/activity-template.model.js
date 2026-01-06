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
exports.initActivityTemplate = exports.ActivityTemplate = void 0;
var sequelize_1 = require("sequelize");
// 活动模板模型类
var ActivityTemplate = /** @class */ (function (_super) {
    __extends(ActivityTemplate, _super);
    function ActivityTemplate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ActivityTemplate;
}(sequelize_1.Model));
exports.ActivityTemplate = ActivityTemplate;
// 初始化函数，在数据库连接建立后调用
var initActivityTemplate = function (sequelize) {
    ActivityTemplate.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            comment: '模板名称'
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
            comment: '模板描述'
        },
        category: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false,
            comment: '模板分类'
        },
        coverImage: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
            comment: '封面图片路径',
            field: 'coverImage'
        },
        usageCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '使用次数',
            field: 'usageCount'
        },
        templateData: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
            comment: '模板配置数据',
            field: 'templateData'
        },
        status: {
            type: sequelize_1.DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'active',
            comment: '状态'
        },
        createdBy: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '创建者ID',
            field: 'createdBy'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'createdAt'
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            field: 'updatedAt'
        }
    }, {
        sequelize: sequelize,
        tableName: 'activity_templates',
        modelName: 'ActivityTemplate',
        timestamps: true,
        underscored: false,
        indexes: [
            {
                fields: ['category']
            },
            {
                fields: ['status']
            },
            {
                fields: ['createdBy']
            },
        ]
    });
};
exports.initActivityTemplate = initActivityTemplate;
exports["default"] = ActivityTemplate;
