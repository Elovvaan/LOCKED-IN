import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface EventParticipantAttributes {
  id: number;
  eventId: number;
  userId: number;
  role: 'player' | 'spectator';
  status: 'joined' | 'confirmed' | 'checked_in';
  createdAt?: Date;
  updatedAt?: Date;
}

interface EventParticipantCreationAttributes extends Optional<EventParticipantAttributes, 'id' | 'status'> {}

export class EventParticipant extends Model<EventParticipantAttributes, EventParticipantCreationAttributes> implements EventParticipantAttributes {
  public id!: number;
  public eventId!: number;
  public userId!: number;
  public role!: 'player' | 'spectator';
  public status!: 'joined' | 'confirmed' | 'checked_in';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EventParticipant.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    eventId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.ENUM('player', 'spectator'), allowNull: false },
    status: { type: DataTypes.ENUM('joined', 'confirmed', 'checked_in'), defaultValue: 'joined' },
  },
  { sequelize, modelName: 'EventParticipant', tableName: 'event_participants' }
);

export default EventParticipant;
