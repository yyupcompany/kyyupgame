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
exports.InspectionPlanStatus = void 0;
var sequelize_1 = require("sequelize");
// 检查计划状态枚举
var InspectionPlanStatus;
(function (InspectionPlanStatus) {
    InspectionPlanStatus["PENDING"] = "pending";
    InspectionPlanStatus["PREPARING"] = "preparing";
    InspectionPlanStatus["IN_PROGRESS"] = "in_progress";
    InspectionPlanStatus["COMPLETED"] = "completed";
    InspectionPlanStatus["OVERDUE"] = "overdue"; // 已逾期
})(InspectionPlanStatus = exports.InspectionPlanStatus || (exports.InspectionPlanStatus = {}));
// 检查计划模型
var InspectionPlan = /** @class */ (function (_super) {
    __extends(InspectionPlan, _super);
    function InspectionPlan() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // 初始化模型
    InspectionPlan.initModel = function (sequelize) {
        InspectionPlan.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            kindergartenId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'kindergarten_id',
                comment: '幼儿园ID'
            },
            inspectionTypeId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'inspection_type_id',
                comment: '检查类型ID'
            },
            planYear: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'plan_year',
                comment: '计划年份'
            },
            planDate: {
                type: sequelize_1.DataTypes.DATEONLY,
                allowNull: false,
                field: 'plan_date',
                comment: '计划日期'
            },
            actualDate: {
                type: sequelize_1.DataTypes.DATEONLY,
                field: 'actual_date',
                comment: '实际日期'
            },
            status: {
                type: sequelize_1.DataTypes.ENUM.apply(sequelize_1.DataTypes, Object.values(InspectionPlanStatus)),
                defaultValue: InspectionPlanStatus.PENDING,
                comment: '状态'
            },
            responsibleUserId: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'responsible_user_id',
                comment: '负责人ID'
            },
            notes: {
                type: sequelize_1.DataTypes.TEXT,
                comment: '备注'
            },
            result: {
                type: sequelize_1.DataTypes.TEXT,
                comment: '检查结果'
            },
            score: {
                type: sequelize_1.DataTypes.DECIMAL(5, 2),
                comment: '检查得分'
            },
            grade: {
                type: sequelize_1.DataTypes.STRING(20),
                comment: '检查等级'
            },
            createdBy: {
                type: sequelize_1.DataTypes.INTEGER,
                field: 'created_by',
                comment: '创建人ID'
            }
        }, {
            sequelize: sequelize,
            tableName: 'inspection_plans',
            underscored: true,
            timestamps: true,
            indexes: [
                { fields: ['kindergarten_id'] },
                { fields: ['inspection_type_id'] },
                { fields: ['plan_year'] },
                { fields: ['status'] },
                { fields: ['plan_date'] },
            ]
        });
    };
    return InspectionPlan;
}(sequelize_1.Model));
exports["default"] = InspectionPlan;
