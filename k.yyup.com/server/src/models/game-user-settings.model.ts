import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional
} from 'sequelize';

export class GameUserSettings extends Model<
  InferAttributes<GameUserSettings>,
  InferCreationAttributes<GameUserSettings>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare childId: number | null;
  declare bgmVolume: CreationOptional<number>;
  declare sfxVolume: CreationOptional<number>;
  declare voiceVolume: CreationOptional<number>;
  declare difficultyPreference: CreationOptional<'auto' | 'easy' | 'medium' | 'hard'>;
  declare animationSpeed: CreationOptional<number>;
  declare showHints: CreationOptional<number>;
  declare vibrationEnabled: CreationOptional<number>;
  declare settings: any | null;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): void {
    GameUserSettings.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        childId: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        bgmVolume: {
          type: DataTypes.FLOAT,
          defaultValue: 0.5
        },
        sfxVolume: {
          type: DataTypes.FLOAT,
          defaultValue: 0.8
        },
        voiceVolume: {
          type: DataTypes.FLOAT,
          defaultValue: 1.0
        },
        difficultyPreference: {
          type: DataTypes.ENUM('auto', 'easy', 'medium', 'hard'),
          defaultValue: 'auto'
        },
        animationSpeed: {
          type: DataTypes.FLOAT,
          defaultValue: 1.0
        },
        showHints: {
          type: DataTypes.TINYINT,
          defaultValue: 1
        },
        vibrationEnabled: {
          type: DataTypes.TINYINT,
          defaultValue: 1
        },
        settings: {
          type: DataTypes.JSON,
          allowNull: true
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW
        }
      },
      {
        sequelize,
        tableName: 'game_user_settings',
        timestamps: false,
        underscored: true
      }
    );
  }
}





