import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface EventAttributes {
  id: number;
  creatorId: number;
  title: string;
  description?: string;
  locationName?: string;
  lat?: number;
  lng?: number;
  startTime: Date;
  endTime: Date;
  maxPlayers: number;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'description' | 'locationName' | 'lat' | 'lng' | 'isPublic'> {}

export class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public creatorId!: number;
  public title!: string;
  public description!: string;
  public locationName!: string;
  public lat!: number;
  public lng!: number;
  public startTime!: Date;
  public endTime!: Date;
  public maxPlayers!: number;
  public isPublic!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    creatorId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    locationName: { type: DataTypes.STRING },
    lat: { type: DataTypes.FLOAT },
    lng: { type: DataTypes.FLOAT },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false },
    maxPlayers: { type: DataTypes.INTEGER, allowNull: false },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'Event', tableName: 'events' }
);

export default Event;
