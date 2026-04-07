import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface EventResultAttributes {
  id: number;
  eventId: number;
  winnerId: number;
  votes: number;
  createdAt?: Date;
}

interface EventResultCreationAttributes extends Optional<EventResultAttributes, 'id' | 'votes'> {}

export class EventResult extends Model<EventResultAttributes, EventResultCreationAttributes> implements EventResultAttributes {
  public id!: number;
  public eventId!: number;
  public winnerId!: number;
  public votes!: number;
  public readonly createdAt!: Date;
}

EventResult.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    eventId: { type: DataTypes.INTEGER, allowNull: false },
    winnerId: { type: DataTypes.INTEGER, allowNull: false },
    votes: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  { sequelize, modelName: 'EventResult', tableName: 'event_results', updatedAt: false }
);

export default EventResult;
