import { DataTypes, QueryInterface } from 'sequelize';

/**
 * 为 assessment_questions 表添加 imageUrl 字段
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('assessment_questions', 'imageUrl', {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '题目配图URL'
  });
  
  await queryInterface.addColumn('assessment_questions', 'imagePrompt', {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'AI生成图片的提示词'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('assessment_questions', 'imageUrl');
  await queryInterface.removeColumn('assessment_questions', 'imagePrompt');
}

