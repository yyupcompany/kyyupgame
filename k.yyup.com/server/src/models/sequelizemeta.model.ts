/**
 * SequelizeMeta 模型
 * 对应数据库表: sequelize_meta
 * 自动生成 - 2025-07-20T21:41:47.156Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface SequelizeMetaAttributes {
  name: string;
}

// 定义创建时的可选属性
export interface SequelizeMetaCreationAttributes extends SequelizeMetaAttributes {}

// 定义模型类
export class SequelizeMeta extends Model<SequelizeMetaAttributes, SequelizeMetaCreationAttributes>
  implements SequelizeMetaAttributes {
  public name!: string;
}

// 初始化模型
SequelizeMeta.init(
  {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  },
  {
    sequelize,
    tableName: 'sequelize_meta',
    modelName: 'SequelizeMeta',
    timestamps: false,
  }
);

export default SequelizeMeta;
