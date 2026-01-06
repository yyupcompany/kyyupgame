/**
 * LikeCollectRecord 模型
 * 对应数据库表: like_collect_records
 * 自动生成 - 2025-07-20T21:41:47.094Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface LikeCollectRecordAttributes {
  id: number;
  activity_id: number;
  participant_id: number;
  liker_id: number;
  created_at: string;
  updated_at: Date;
}

// 定义创建时的可选属性
export interface LikeCollectRecordCreationAttributes extends Optional<LikeCollectRecordAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class LikeCollectRecord extends Model<LikeCollectRecordAttributes, LikeCollectRecordCreationAttributes>
  implements LikeCollectRecordAttributes {
  public id!: number;
  public activity_id!: number;
  public participant_id!: number;
  public liker_id!: number;
  public created_at!: string;
  public updated_at!: Date;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
LikeCollectRecord.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  activity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  liker_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  },
  {
    sequelize,
    tableName: 'like_collect_records',
    modelName: 'LikeCollectRecord',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default LikeCollectRecord;
