import { Model, DataTypes, ModelStatic, ModelAttributes, InitOptions } from 'sequelize';
import { Sequelize } from 'sequelize';

/**
 * 修复版模型基类工具 - 提供创建模型的公共方法
 * 
 * 提供方法用于配置：
 * - id: 主键
 * - createdAt: 创建时间
 * - updatedAt: 更新时间
 * - deletedAt: 删除时间（软删除）
 * - isSystem: 是否系统数据
   */
export class BaseModelFix {
  /**
   * 获取模型的基础字段定义
   */
  public static getBaseFields(): ModelAttributes {
    return {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '主键ID'
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        comment: '创建时间'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        comment: '更新时间'
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at',
        allowNull: true,
        comment: '删除时间（软删除）'
      },
      isSystem: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        field: 'is_system',
        comment: '是否系统数据 - 0:否 1:是'
      }
    };
  }

  /**
   * 获取模型的基础配置选项
   */
  public static getBaseOptions(sequelize: Sequelize, tableName: string, comment: string): InitOptions {
    return {
      sequelize,
      tableName,
      comment,
      paranoid: true, // 启用软删除
      timestamps: true,
    };
  }

  /**
   * 合并基础字段和自定义字段
   */
  public static mergeFields(customFields: ModelAttributes): ModelAttributes {
    return {
      ...this.getBaseFields(),
      ...customFields
    };
  }
  
  /**
   * 初始化模型的辅助方法
   * @param modelClass 模型类
   * @param sequelize Sequelize实例
   * @param tableName 表名
   * @param comment 表注释
   * @param customFields 自定义字段
   */
  static initializeModel(
    modelClass: any,
    sequelize: Sequelize,
    tableName: string,
    comment: string,
    customFields: ModelAttributes = {}
  ): any {
    const attributes = this.mergeFields(customFields);
    const options = this.getBaseOptions(sequelize, tableName, comment);
    
    // 调用init方法初始化模型
    modelClass.init(attributes, options);
    
    // 返回初始化后的模型类
    return modelClass;
  }
} 