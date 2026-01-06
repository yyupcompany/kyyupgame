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
exports.CustomerFollowStage = void 0;
var sequelize_1 = require("sequelize");
var CustomerFollowStage = /** @class */ (function (_super) {
    __extends(CustomerFollowStage, _super);
    function CustomerFollowStage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomerFollowStage.initModel = function (sequelize) {
        CustomerFollowStage.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                comment: '阶段配置ID'
            },
            stageNumber: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'stage_number',
                comment: '阶段编号 (1-8)'
            },
            stageName: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                field: 'stage_name',
                comment: '阶段名称'
            },
            stageDescription: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                field: 'stage_description',
                comment: '阶段描述'
            },
            subStages: {
                type: sequelize_1.DataTypes.JSON,
                allowNull: false,
                field: 'sub_stages',
                comment: '子阶段配置 JSON格式'
            },
            defaultDuration: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 7,
                field: 'default_duration',
                comment: '预计完成天数'
            },
            isRequired: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_required',
                comment: '是否必需阶段'
            },
            sortOrder: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'sort_order',
                comment: '排序顺序'
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active',
                comment: '是否启用'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at',
                comment: '创建时间'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at',
                comment: '更新时间'
            }
        }, {
            sequelize: sequelize,
            tableName: 'customer_follow_stages',
            timestamps: true,
            underscored: true,
            comment: '客户跟进阶段配置表'
        });
    };
    return CustomerFollowStage;
}(sequelize_1.Model));
exports.CustomerFollowStage = CustomerFollowStage;
exports["default"] = CustomerFollowStage;
