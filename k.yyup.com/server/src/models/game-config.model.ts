import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export class GameConfig extends Model<
  InferAttributes<GameConfig>,
  InferCreationAttributes<GameConfig>
> {
  declare id: CreationOptional<number>;
  declare gameKey: string;
  declare gameName: string;
  declare gameType: 'attention' | 'memory' | 'logic';
  declare themeType: 'girl' | 'boy' | 'neutral';
  declare description: string | null;
  declare minAge: number;
  declare maxAge: number;
  declare difficultyLevels: any | null;
  declare resources: any | null;
  declare status: 'active' | 'inactive';
  declare sortOrder: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    GameConfig.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        gameKey: {
          type: DataTypes.STRING(50),
          unique: true,
          allowNull: false
        },
        gameName: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        gameType: {
          type: DataTypes.ENUM('attention', 'memory', 'logic'),
          allowNull: false
        },
        themeType: {
          type: DataTypes.ENUM('girl', 'boy', 'neutral'),
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        minAge: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        maxAge: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        difficultyLevels: {
          type: DataTypes.JSON,
          allowNull: true
        },
        resources: {
          type: DataTypes.JSON,
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive'),
          defaultValue: 'active'
        },
        sortOrder: {
          type: DataTypes.INTEGER,
          defaultValue: 0
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        tableName: 'game_configs',
        timestamps: true,
        underscored: true
      }
    );
  }
}





