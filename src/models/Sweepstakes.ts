import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

export const ALLOWED_SWEEPSTAKES_ENTRY_SOURCES = [
  'direct_free_entry',
  'achievement_reward',
  'win_streak_reward',
  'contest_reward',
  'engagement_milestone',
] as const;

export type SweepstakesEntrySource = (typeof ALLOWED_SWEEPSTAKES_ENTRY_SOURCES)[number];

interface SweepstakesCampaignAttributes {
  id: number;
  createdByUserId: number;
  title: string;
  officialRules: string;
  eligibility: string;
  startsAt: Date;
  endsAt: Date;
  prizeDetails: string;
  freeAlternateMethod: string;
  noPurchaseNecessary: boolean;
  paidActionsIncreaseOdds: boolean;
  status: string;
}

interface SweepstakesCampaignCreationAttributes extends Optional<SweepstakesCampaignAttributes, 'id' | 'status' | 'noPurchaseNecessary' | 'paidActionsIncreaseOdds'> {}

export class SweepstakesCampaign extends Model<SweepstakesCampaignAttributes, SweepstakesCampaignCreationAttributes> implements SweepstakesCampaignAttributes {
  public id!: number;
  public createdByUserId!: number;
  public title!: string;
  public officialRules!: string;
  public eligibility!: string;
  public startsAt!: Date;
  public endsAt!: Date;
  public prizeDetails!: string;
  public freeAlternateMethod!: string;
  public noPurchaseNecessary!: boolean;
  public paidActionsIncreaseOdds!: boolean;
  public status!: string;
}

SweepstakesCampaign.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    createdByUserId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    officialRules: { type: DataTypes.TEXT, allowNull: false },
    eligibility: { type: DataTypes.TEXT, allowNull: false },
    startsAt: { type: DataTypes.DATE, allowNull: false },
    endsAt: { type: DataTypes.DATE, allowNull: false },
    prizeDetails: { type: DataTypes.TEXT, allowNull: false },
    freeAlternateMethod: { type: DataTypes.TEXT, allowNull: false },
    noPurchaseNecessary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    paidActionsIncreaseOdds: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
  },
  { sequelize, modelName: 'SweepstakesCampaign', tableName: 'sweepstakes_campaigns' }
);

interface SweepstakesEntryAttributes {
  id: number;
  campaignId: number;
  userId: number;
  source: SweepstakesEntrySource;
  isFree: boolean;
}

interface SweepstakesEntryCreationAttributes extends Optional<SweepstakesEntryAttributes, 'id' | 'isFree'> {}

export class SweepstakesEntry extends Model<SweepstakesEntryAttributes, SweepstakesEntryCreationAttributes> implements SweepstakesEntryAttributes {
  public id!: number;
  public campaignId!: number;
  public userId!: number;
  public source!: SweepstakesEntrySource;
  public isFree!: boolean;
}

SweepstakesEntry.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    campaignId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    source: { type: DataTypes.STRING, allowNull: false },
    isFree: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: 'SweepstakesEntry',
    tableName: 'sweepstakes_entries',
    indexes: [{ unique: true, fields: ['campaignId', 'userId', 'source'] }],
  }
);

interface SweepstakesWinnerLogAttributes {
  id: number;
  campaignId: number;
  winnerUserId: number;
  entryId: number;
  drawMethod: string;
  drawnAt: Date;
}

interface SweepstakesWinnerLogCreationAttributes extends Optional<SweepstakesWinnerLogAttributes, 'id' | 'drawMethod' | 'drawnAt'> {}

export class SweepstakesWinnerLog extends Model<SweepstakesWinnerLogAttributes, SweepstakesWinnerLogCreationAttributes> implements SweepstakesWinnerLogAttributes {
  public id!: number;
  public campaignId!: number;
  public winnerUserId!: number;
  public entryId!: number;
  public drawMethod!: string;
  public drawnAt!: Date;
}

SweepstakesWinnerLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    campaignId: { type: DataTypes.INTEGER, allowNull: false },
    winnerUserId: { type: DataTypes.INTEGER, allowNull: false },
    entryId: { type: DataTypes.INTEGER, allowNull: false },
    drawMethod: { type: DataTypes.STRING, allowNull: false, defaultValue: 'uniform_random' },
    drawnAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'SweepstakesWinnerLog', tableName: 'sweepstakes_winner_logs' }
);

interface SweepstakesFulfillmentAttributes {
  id: number;
  campaignId: number;
  winnerLogId: number;
  winnerUserId: number;
  status: string;
  notes?: string;
  fulfilledAt?: Date;
}

interface SweepstakesFulfillmentCreationAttributes extends Optional<SweepstakesFulfillmentAttributes, 'id' | 'status' | 'notes' | 'fulfilledAt'> {}

export class SweepstakesFulfillment extends Model<SweepstakesFulfillmentAttributes, SweepstakesFulfillmentCreationAttributes> implements SweepstakesFulfillmentAttributes {
  public id!: number;
  public campaignId!: number;
  public winnerLogId!: number;
  public winnerUserId!: number;
  public status!: string;
  public notes!: string | undefined;
  public fulfilledAt!: Date | undefined;
}

SweepstakesFulfillment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    campaignId: { type: DataTypes.INTEGER, allowNull: false },
    winnerLogId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    winnerUserId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    notes: { type: DataTypes.TEXT },
    fulfilledAt: { type: DataTypes.DATE },
  },
  { sequelize, modelName: 'SweepstakesFulfillment', tableName: 'sweepstakes_fulfillments' }
);

interface SweepstakesAuditLogAttributes {
  id: number;
  campaignId: number;
  actorUserId: number;
  action: string;
  details?: string;
}

interface SweepstakesAuditLogCreationAttributes extends Optional<SweepstakesAuditLogAttributes, 'id' | 'details'> {}

export class SweepstakesAuditLog extends Model<SweepstakesAuditLogAttributes, SweepstakesAuditLogCreationAttributes> implements SweepstakesAuditLogAttributes {
  public id!: number;
  public campaignId!: number;
  public actorUserId!: number;
  public action!: string;
  public details!: string | undefined;
}

SweepstakesAuditLog.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    campaignId: { type: DataTypes.INTEGER, allowNull: false },
    actorUserId: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.TEXT },
  },
  { sequelize, modelName: 'SweepstakesAuditLog', tableName: 'sweepstakes_audit_logs' }
);
