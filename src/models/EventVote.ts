import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface EventVoteAttributes {
  id: number;
  eventId: number;
  voterId: number;
  winnerId: number;
  createdAt?: Date;
}

interface EventVoteCreationAttributes extends Optional<EventVoteAttributes, 'id'> {}

export class EventVote extends Model<EventVoteAttributes, EventVoteCreationAttributes> implements EventVoteAttributes {
  public id!: number;
  public eventId!: number;
  public voterId!: number;
  public winnerId!: number;
  public readonly createdAt!: Date;
}

EventVote.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    eventId: { type: DataTypes.INTEGER, allowNull: false },
    voterId: { type: DataTypes.INTEGER, allowNull: false },
    winnerId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'EventVote', tableName: 'event_votes', updatedAt: false }
);

export default EventVote;
