import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface UserAttributes {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  eventsJoined: number;
  eventsWon: number;
  locationWins: string; // JSON string of {locationName: count}
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'eventsJoined' | 'eventsWon' | 'locationWins'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public passwordHash!: string;
  public eventsJoined!: number;
  public eventsWon!: number;
  public locationWins!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    eventsJoined: { type: DataTypes.INTEGER, defaultValue: 0 },
    eventsWon: { type: DataTypes.INTEGER, defaultValue: 0 },
    locationWins: { type: DataTypes.TEXT, defaultValue: '{}' },
  },
  { sequelize, modelName: 'User', tableName: 'users' }
);

export default User;
