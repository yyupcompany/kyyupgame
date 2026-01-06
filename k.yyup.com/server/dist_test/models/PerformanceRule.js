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
exports.initPerformanceRuleAssociations = exports.initPerformanceRule = exports.PerformanceRule = void 0;
var sequelize_1 = require("sequelize");
var user_model_1 = require("./user.model");
var kindergarten_model_1 = require("./kindergarten.model");
var PerformanceRule = /** @class */ (function (_super) {
    __extends(PerformanceRule, _super);
    function PerformanceRule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PerformanceRule;
}(sequelize_1.Model));
exports.PerformanceRule = PerformanceRule;
var initPerformanceRule = function (sequelize) {
    PerformanceRule.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        calculationMethod: {
            type: sequelize_1.DataTypes.STRING(50),
            allowNull: false
        },
        targetValue: {
            type: sequelize_1.DataTypes.FLOAT,
            allowNull: false
        },
        bonusAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        kindergartenId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'kindergartens',
                key: 'id'
            }
        },
        creatorId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        updaterId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
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
        tableName: 'performance_rules',
        timestamps: true,
        underscored: true
    });
    return PerformanceRule;
};
exports.initPerformanceRule = initPerformanceRule;
// 关联关系
function initPerformanceRuleAssociations() {
    PerformanceRule.belongsTo(kindergarten_model_1.Kindergarten, {
        foreignKey: 'kindergartenId',
        as: 'kindergarten'
    });
    PerformanceRule.belongsTo(user_model_1.User, {
        foreignKey: 'creatorId',
        as: 'creator'
    });
    PerformanceRule.belongsTo(user_model_1.User, {
        foreignKey: 'updaterId',
        as: 'updater'
    });
}
exports.initPerformanceRuleAssociations = initPerformanceRuleAssociations;
