import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface SkillPostAttributes {
  id: number;
  userId: number;
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  caption?: string;
  category?: string;
  endsAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SkillPostCreationAttributes extends Optional<SkillPostAttributes, 'id' | 'thumbnailUrl' | 'caption' | 'category' | 'endsAt'> {}

export class SkillPost extends Model<SkillPostAttributes, SkillPostCreationAttributes> implements SkillPostAttributes {
  public id!: number;
  public userId!: number;
  public videoUrl!: string;
  public thumbnailUrl!: string | undefined;
  public title!: string;
  public caption!: string | undefined;
  public category!: string | undefined;
  public endsAt!: Date | undefined;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SkillPost.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    videoUrl: { type: DataTypes.STRING, allowNull: false },
    thumbnailUrl: { type: DataTypes.STRING },
    title: { type: DataTypes.STRING, allowNull: false },
    caption: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING },
    endsAt: { type: DataTypes.DATE },
  },
  { sequelize, modelName: 'SkillPost', tableName: 'skill_posts' }
);

export default SkillPost;
