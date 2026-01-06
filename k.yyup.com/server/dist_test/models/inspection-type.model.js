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
exports.CityLevel = exports.InspectionCategory = void 0;
var sequelize_1 = require("sequelize");
// 检查类别枚举
var InspectionCategory;
(function (InspectionCategory) {
    InspectionCategory["ANNUAL"] = "annual";
    InspectionCategory["SPECIAL"] = "special";
    InspectionCategory["ROUTINE"] = "routine"; // 常态化督导
})(InspectionCategory = exports.InspectionCategory || (exports.InspectionCategory = {}));
// 城市级别枚举
var CityLevel;
(function (CityLevel) {
    CityLevel["TIER1"] = "tier1";
    CityLevel["TIER2"] = "tier2";
    CityLevel["TIER3"] = "tier3";
    CityLevel["COUNTY"] = "county";
    CityLevel["TOWNSHIP"] = "township"; // 乡镇
})(CityLevel = exports.CityLevel || (exports.CityLevel = {}));
// 检查类型模型
var InspectionType = /** @class */ (function (_super) {
    __extends(InspectionType, _super);
    function InspectionType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 初始化模型
    InspectionType.initModel = function (sequelize) {
        InspectionType.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                comment: '检查类型名称'
            },
            category: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(InspectionCategory)),
                allowNull: false,
                comment: '检查类别'
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                comment: '检查描述'
            },
            department: {
                type: sequelize_1.DataTypes.STRING(200),
                comment: '检查部门'
            },
            frequency: {
                type: sequelize_1.DataTypes.STRING(50),
                comment: '检查频次'
            },
            duration: {
                type: sequelize_1.DataTypes.INTEGER,
                comment: '检查时长(天)'
            },
            cityLevel: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(CityLevel)),
                field: 'city_level',
                comment: '适用城市级别'
            },
            requiredDocuments: {
                type: sequelize_1.DataTypes.JSON,
                field: 'required_documents',
                comment: '所需文档列表'
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                field: 'is_active',
                defaultValue: true,
                comment: '是否启用'
            }
        }, {
            sequelize: sequelize,
            tableName: 'inspection_types',
            underscored: true,
            timestamps: true,
            indexes: [
                { fields: ['category'] },
                { fields: ['city_level'] },
                { fields: ['is_active'] },
            ]
        });
    };
    return InspectionType;
}(sequelize_1.Model));
exports["default"] = InspectionType;
