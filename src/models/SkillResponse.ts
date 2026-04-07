import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface SkillResponseAttributes {
  id: number;
  skillPostId: number;
  userId: number;
  videoUrl: string;
  caption?: string;
  createdAt?: Date;
}

interface SkillResponseCreationAttributes extends Optional<SkillResponseAttributes, 'id' | 'caption'> {}

export class SkillResponse extends Model<SkillResponseAttributes, SkillResponseCreationAttributes> implements SkillResponseAttributes {
  public id!: number;
  public skillPostId!: number;
  public userId!: number;
  public videoUrl!: string;
  public caption!: string | undefined;
  public readonly createdAt!: Date;
}

SkillResponse.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    skillPostId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    videoUrl: { type: DataTypes.STRING, allowNull: false },
    caption: { type: DataTypes.TEXT },
  },
  { sequelize, modelName: 'SkillResponse', tableName: 'skill_responses', updatedAt: false }
);

export default SkillResponse;
