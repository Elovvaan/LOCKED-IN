import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface EventMediaAttributes {
  id: number;
  eventId: number;
  userId: number;
  videoUrl: string;
  type: 'official' | 'spectator';
  createdAt?: Date;
}

interface EventMediaCreationAttributes extends Optional<EventMediaAttributes, 'id'> {}

export class EventMedia extends Model<EventMediaAttributes, EventMediaCreationAttributes> implements EventMediaAttributes {
  public id!: number;
  public eventId!: number;
  public userId!: number;
  public videoUrl!: string;
  public type!: 'official' | 'spectator';
  public readonly createdAt!: Date;
}

EventMedia.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    eventId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    videoUrl: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('official', 'spectator'), allowNull: false },
  },
  { sequelize, modelName: 'EventMedia', tableName: 'event_media', updatedAt: false }
);

export default EventMedia;
