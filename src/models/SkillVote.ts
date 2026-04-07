import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface SkillVoteAttributes {
  id: number;
  skillPostId: number;
  responseId?: number;
  voterId: number;
  targetUserId: number;
  createdAt?: Date;
}

interface SkillVoteCreationAttributes extends Optional<SkillVoteAttributes, 'id' | 'responseId'> {}

export class SkillVote extends Model<SkillVoteAttributes, SkillVoteCreationAttributes> implements SkillVoteAttributes {
  public id!: number;
  public skillPostId!: number;
  public responseId!: number | undefined;
  public voterId!: number;
  public targetUserId!: number;
  public readonly createdAt!: Date;
}

SkillVote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    skillPostId: { type: DataTypes.INTEGER, allowNull: false },
    responseId: { type: DataTypes.INTEGER },
    voterId: { type: DataTypes.INTEGER, allowNull: false },
    targetUserId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'SkillVote',
    tableName: 'skill_votes',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['skillPostId', 'voterId'],
      },
    ],
  }
);

export default SkillVote;
