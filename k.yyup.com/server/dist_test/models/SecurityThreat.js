"use strict";
/**
 * 安全威胁模型
 * 用于存储系统检测到的安全威胁信息
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
exports.SecurityThreat = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var SecurityThreat = /** @class */ (function (_super) {
    __extends(SecurityThreat, _super);
    function SecurityThreat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SecurityThreat;
}(sequelize_1.Model));
exports.SecurityThreat = SecurityThreat;
SecurityThreat.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    threatType: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        comment: '威胁类型：如SQL注入、XSS、暴力破解等'
    },
    severity: {
        type: sequelize_1.DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'medium',
        comment: '威胁严重程度'
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'resolved', 'ignored', 'blocked'),
        allowNull: false,
        defaultValue: 'active',
        comment: '威胁状态'
    },
    sourceIp: {
        type: sequelize_1.DataTypes.STRING(45),
        allowNull: true,
        comment: '威胁来源IP地址'
    },
    targetResource: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        comment: '目标资源'
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        comment: '威胁描述'
    },
    detectionMethod: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        comment: '检测方法：如规则引擎、AI检测、手动报告等'
    },
    riskScore: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        },
        comment: '风险评分 (0-100)'
    },
    handledBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: '处理人员ID'
    },
    handledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        comment: '处理时间'
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '处理备注'
    },
    metadata: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: '额外元数据（JSON格式）'
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
    sequelize: init_1.sequelize,
    tableName: 'security_threats',
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['severity']
        },
        {
            fields: ['threatType']
        },
        {
            fields: ['sourceIp']
        },
        {
            fields: ['createdAt']
        }
    ],
    comment: '安全威胁表'
});
exports["default"] = SecurityThreat;
