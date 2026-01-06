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
exports.initOrganizationStatusAssociations = exports.initOrganizationStatus = exports.OrganizationStatus = void 0;
var sequelize_1 = require("sequelize");
var kindergarten_model_1 = require("./kindergarten.model");
/**
 * 机构现状模型
 * 存储幼儿园的实时运营数据和现状信息
 */
var OrganizationStatus = /** @class */ (function (_super) {
    __extends(OrganizationStatus, _super);
    function OrganizationStatus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OrganizationStatus;
}(sequelize_1.Model));
exports.OrganizationStatus = OrganizationStatus;
var initOrganizationStatus = function (sequelize) {
    OrganizationStatus.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            comment: '主键ID'
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            comment: '幼儿园ID',
            references: {
                model: 'kindergartens',
                key: 'id'
            }
        },
        // 基本情况
        totalClasses: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '总班级数'
        },
        totalStudents: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '在园学生总数'
        },
        totalTeachers: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '教师总数'
        },
        teacherStudentRatio: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '师生比'
        },
        // 生源情况
        currentEnrollment: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '当前在园人数'
        },
        enrollmentCapacity: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '招生容量'
        },
        enrollmentRate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '招生率(%)'
        },
        waitingListCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '等待名单人数'
        },
        // 师资情况
        fullTimeTeachers: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '全职教师数'
        },
        partTimeTeachers: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '兼职教师数'
        },
        seniorTeachers: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '高级教师数'
        },
        averageTeachingYears: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '平均教龄'
        },
        // 招生情况
        monthlyEnrollmentFrequency: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '月招生频次'
        },
        quarterlyEnrollmentFrequency: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '季度招生频次'
        },
        yearlyEnrollmentFrequency: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '年度招生频次'
        },
        enrollmentConversionRate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '招生转化率(%)'
        },
        averageEnrollmentCycle: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '平均招生周期(天)'
        },
        // 客户跟进情况
        totalLeads: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '总线索数'
        },
        activeLeads: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '活跃线索数'
        },
        convertedLeads: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '已转化线索数'
        },
        averageFollowupCount: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '平均跟进次数'
        },
        averageResponseTime: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '平均响应时间(小时)'
        },
        teacherFollowupLoad: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            comment: '教师跟进负载(人均线索数)'
        },
        // 财务情况
        monthlyRevenue: {
            type: sequelize_1.DataTypes.DECIMAL(12, 2),
            allowNull: true,
            comment: '月度营收'
        },
        averageTuitionFee: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: '平均学费'
        },
        outstandingPayments: {
            type: sequelize_1.DataTypes.DECIMAL(12, 2),
            allowNull: true,
            comment: '待收款金额'
        },
        // 活动情况
        monthlyActivityCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            comment: '月度活动次数'
        },
        activityParticipationRate: {
            type: sequelize_1.DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: '活动参与率(%)'
        },
        // 数据更新时间
        dataUpdatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: '数据更新时间'
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        tableName: 'organization_status',
        timestamps: true,
        indexes: [
            {
                name: 'kindergarten_id_idx',
                fields: ['kindergartenId']
            },
            {
                name: 'data_updated_at_idx',
                fields: ['dataUpdatedAt']
            },
        ],
        comment: '机构现状数据表'
    });
    return OrganizationStatus;
};
exports.initOrganizationStatus = initOrganizationStatus;
var initOrganizationStatusAssociations = function () {
    OrganizationStatus.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
};
exports.initOrganizationStatusAssociations = initOrganizationStatusAssociations;
