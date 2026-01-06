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
exports.PosterGeneration = void 0;
var sequelize_1 = require("sequelize");
var PosterGeneration = /** @class */ (function (_super) {
    __extends(PosterGeneration, _super);
    function PosterGeneration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PosterGeneration.prototype.getStatusText = function () {
        var statusMap = {
            0: '已删除',
            1: '正常'
        };
        return statusMap[this.status] || '未知状态';
    };
    PosterGeneration.prototype.getPosterInfo = function () {
        return {
            posterUrl: this.posterUrl,
            thumbnailUrl: this.thumbnailUrl
        };
    };
    PosterGeneration.initModel = function (sequelize) {
        PosterGeneration.init({
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: sequelize_1.DataTypes.STRING(100),
                allowNull: false,
                comment: '海报名称'
            },
            templateId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'template_id',
                comment: '使用的模板ID'
            },
            posterUrl: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: false,
                field: 'poster_url',
                comment: '生成的海报图片URL'
            },
            thumbnailUrl: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                field: 'thumbnail_url',
                comment: '缩略图URL'
            },
            status: {
                type: sequelize_1.DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
                comment: '状态：0-已删除，1-正常'
            },
            remark: {
                type: sequelize_1.DataTypes.STRING(500),
                allowNull: true,
                comment: '备注'
            },
            creatorId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'creator_id',
                comment: '创建人ID'
            },
            updaterId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                field: 'updater_id',
                comment: '更新人ID'
            },
            parameters: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
                comment: '海报参数（JSON格式）'
            },
            imageUrl: {
                type: sequelize_1.DataTypes.STRING(255),
                allowNull: true,
                field: 'image_url',
                comment: '海报图片URL'
            },
            shareCount: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'share_count',
                comment: '分享次数'
            },
            downloadCount: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'download_count',
                comment: '下载次数'
            },
            viewCount: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'view_count',
                comment: '查看次数'
            },
            kindergartenId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                field: 'kindergarten_id',
                comment: '幼儿园ID'
            }
        }, {
            sequelize: sequelize,
            tableName: 'poster_generations',
            timestamps: true,
            paranoid: true,
            underscored: true
        });
    };
    PosterGeneration.initAssociations = function () {
        this.belongsTo(this.sequelize.models.User, {
            foreignKey: 'creatorId',
            as: 'creator'
        });
        this.belongsTo(this.sequelize.models.Kindergarten, {
            foreignKey: 'kindergartenId',
            as: 'kindergarten'
        });
        this.belongsTo(this.sequelize.models.PosterTemplate, {
            foreignKey: 'templateId',
            as: 'template'
        });
        this.hasMany(this.sequelize.models.PosterElement, {
            foreignKey: 'generationId',
            as: 'elements'
        });
    };
    return PosterGeneration;
}(sequelize_1.Model));
exports.PosterGeneration = PosterGeneration;
exports["default"] = PosterGeneration;
