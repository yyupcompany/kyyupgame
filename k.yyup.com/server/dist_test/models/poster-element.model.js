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
exports.PosterElement = void 0;
var sequelize_1 = require("sequelize");
var PosterElement = /** @class */ (function (_super) {
    __extends(PosterElement, _super);
    function PosterElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PosterElement.prototype.getPosition = function () {
        try {
            var pos = JSON.parse(this.position);
            return { x: pos.x || 0, y: pos.y || 0 };
        }
        catch (e) {
            return { x: 0, y: 0 };
        }
    };
    PosterElement.prototype.getStyle = function () {
        try {
            return JSON.parse(this.style);
        }
        catch (e) {
            return {};
        }
    };
    PosterElement.prototype.getContent = function () {
        try {
            return JSON.parse(this.content);
        }
        catch (e) {
            return {};
        }
    };
    PosterElement.initModel = function (sequelize) {
        PosterElement.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            type: {
                type: sequelize_1.DataTypes.STRING(50),
                allowNull: false,
                comment: '元素类型：text-文本，image-图片，shape-形状等'
            },
            content: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                comment: '元素内容（JSON格式）'
            },
            style: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
                comment: '元素样式（JSON格式）'
            },
            position: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                comment: '元素位置（JSON格式：{x,y}）'
            },
            width: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: '元素宽度（像素）'
            },
            height: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                comment: '元素高度（像素）'
            },
            zIndex: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'z_index',
                comment: '元素层级'
            },
            templateId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'template_id',
                comment: '所属模板ID'
            },
            generationId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'generation_id',
                comment: '所属生成记录ID'
            },
            remark: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
                comment: '备注'
            },
            creatorId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'creator_id',
                comment: '创建者ID'
            },
            updaterId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'updater_id',
                comment: '更新者ID'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'created_at'
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                field: 'updated_at'
            },
            deletedAt: {
                type: sequelize_1.DataTypes.DATE,
                field: 'deleted_at'
            }
        }, {
            sequelize: sequelize,
            tableName: 'poster_elements',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    PosterElement.initAssociations = function () {
        this.belongsTo(this.sequelize.models.PosterTemplate, {
            foreignKey: 'templateId',
            as: 'template'
        });
        this.belongsTo(this.sequelize.models.PosterGeneration, {
            foreignKey: 'generationId',
            as: 'generation'
        });
    };
    return PosterElement;
}(sequelize_1.Model));
exports.PosterElement = PosterElement;
exports["default"] = PosterElement;
