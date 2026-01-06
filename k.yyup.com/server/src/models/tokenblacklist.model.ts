/**
 * TokenBlacklist 模型
 * 对应数据库表: token_blacklist
 * 自动生成 - 2025-07-20T21:41:47.165Z
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../init';

// 定义模型属性接口
export interface TokenBlacklistAttributes {
  id: number;
  token: string;
  expires_at: string;
  reason: string;
  created_at: string;
  updated_at: Date;
}

// 定义创建时的可选属性
export interface TokenBlacklistCreationAttributes extends Optional<TokenBlacklistAttributes, 'id' | 'created_at' | 'updated_at'> {}

// 定义模型类
export class TokenBlacklist extends Model<TokenBlacklistAttributes, TokenBlacklistCreationAttributes>
  implements TokenBlacklistAttributes {
  public id!: number;
  public token!: string;
  public expires_at!: string;
  public reason!: string;
  public created_at!: string;
  public updated_at!: Date;

  // 时间戳
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// 初始化模型
TokenBlacklist.init(
  {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
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
    tableName: 'token_blacklist',
    modelName: 'TokenBlacklist',
    timestamps: true,
    underscored: true,
    paranoid: true, // 软删除
  }
);

export default TokenBlacklist;
