import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

interface CreatorRegistryAttributes {
  id: number;
  userId: number;
  walletAddress: string;
  chain: string;
  contractRef?: string;
}

interface CreatorRegistryCreationAttributes extends Optional<CreatorRegistryAttributes, 'id' | 'chain' | 'contractRef'> {}

export class CreatorRegistry extends Model<CreatorRegistryAttributes, CreatorRegistryCreationAttributes> implements CreatorRegistryAttributes {
  public id!: number;
  public userId!: number;
  public walletAddress!: string;
  public chain!: string;
  public contractRef!: string | undefined;
}

CreatorRegistry.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    walletAddress: { type: DataTypes.STRING, allowNull: false },
    chain: { type: DataTypes.STRING, allowNull: false, defaultValue: 'base' },
    contractRef: { type: DataTypes.STRING },
  },
  { sequelize, modelName: 'CreatorRegistry', tableName: 'creator_registries' }
);

interface AssetRegistryAttributes {
  id: number;
  creatorId: number;
  contentRef: string;
  contentType: string;
  title: string;
  ownershipProof?: string;
  provenanceHash?: string;
  contractRef?: string;
}

interface AssetRegistryCreationAttributes extends Optional<AssetRegistryAttributes, 'id' | 'ownershipProof' | 'provenanceHash' | 'contractRef'> {}

export class AssetRegistry extends Model<AssetRegistryAttributes, AssetRegistryCreationAttributes> implements AssetRegistryAttributes {
  public id!: number;
  public creatorId!: number;
  public contentRef!: string;
  public contentType!: string;
  public title!: string;
  public ownershipProof!: string | undefined;
  public provenanceHash!: string | undefined;
  public contractRef!: string | undefined;
}

AssetRegistry.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    creatorId: { type: DataTypes.INTEGER, allowNull: false },
    contentRef: { type: DataTypes.STRING, allowNull: false },
    contentType: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    ownershipProof: { type: DataTypes.STRING },
    provenanceHash: { type: DataTypes.STRING },
    contractRef: { type: DataTypes.STRING },
  },
  { sequelize, modelName: 'AssetRegistry', tableName: 'asset_registries' }
);

interface SplitRuleAttributes {
  id: number;
  assetId: number;
  recipientUserId: number;
  bps: number;
}

interface SplitRuleCreationAttributes extends Optional<SplitRuleAttributes, 'id'> {}

export class SplitRule extends Model<SplitRuleAttributes, SplitRuleCreationAttributes> implements SplitRuleAttributes {
  public id!: number;
  public assetId!: number;
  public recipientUserId!: number;
  public bps!: number;
}

SplitRule.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId: { type: DataTypes.INTEGER, allowNull: false },
    recipientUserId: { type: DataTypes.INTEGER, allowNull: false },
    bps: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'SplitRule', tableName: 'split_rules' }
);

interface LicenseManagerAttributes {
  id: number;
  assetId: number;
  licenseeUserId: number;
  licenseType: string;
  amountMinor: number;
  stablecoin: string;
  status: string;
}

interface LicenseManagerCreationAttributes extends Optional<LicenseManagerAttributes, 'id' | 'stablecoin' | 'status'> {}

export class LicenseManager extends Model<LicenseManagerAttributes, LicenseManagerCreationAttributes> implements LicenseManagerAttributes {
  public id!: number;
  public assetId!: number;
  public licenseeUserId!: number;
  public licenseType!: string;
  public amountMinor!: number;
  public stablecoin!: string;
  public status!: string;
}

LicenseManager.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId: { type: DataTypes.INTEGER, allowNull: false },
    licenseeUserId: { type: DataTypes.INTEGER, allowNull: false },
    licenseType: { type: DataTypes.STRING, allowNull: false },
    amountMinor: { type: DataTypes.INTEGER, allowNull: false },
    stablecoin: { type: DataTypes.STRING, allowNull: false, defaultValue: 'USDC' },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
  },
  { sequelize, modelName: 'LicenseManager', tableName: 'license_managers' }
);

interface RoyaltyManagerAttributes {
  id: number;
  assetId: number;
  resaleAmountMinor: number;
  royaltyBps: number;
  royaltyAmountMinor: number;
  stablecoin: string;
}

interface RoyaltyManagerCreationAttributes extends Optional<RoyaltyManagerAttributes, 'id' | 'stablecoin'> {}

export class RoyaltyManager extends Model<RoyaltyManagerAttributes, RoyaltyManagerCreationAttributes> implements RoyaltyManagerAttributes {
  public id!: number;
  public assetId!: number;
  public resaleAmountMinor!: number;
  public royaltyBps!: number;
  public royaltyAmountMinor!: number;
  public stablecoin!: string;
}

RoyaltyManager.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId: { type: DataTypes.INTEGER, allowNull: false },
    resaleAmountMinor: { type: DataTypes.INTEGER, allowNull: false },
    royaltyBps: { type: DataTypes.INTEGER, allowNull: false },
    royaltyAmountMinor: { type: DataTypes.INTEGER, allowNull: false },
    stablecoin: { type: DataTypes.STRING, allowNull: false, defaultValue: 'USDC' },
  },
  { sequelize, modelName: 'RoyaltyManager', tableName: 'royalty_managers' }
);

interface CreatorVaultAttributes {
  id: number;
  creatorUserId: number;
  stablecoin: string;
  balanceMinor: number;
}

interface CreatorVaultCreationAttributes extends Optional<CreatorVaultAttributes, 'id' | 'stablecoin' | 'balanceMinor'> {}

export class CreatorVault extends Model<CreatorVaultAttributes, CreatorVaultCreationAttributes> implements CreatorVaultAttributes {
  public id!: number;
  public creatorUserId!: number;
  public stablecoin!: string;
  public balanceMinor!: number;
}

CreatorVault.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    creatorUserId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    stablecoin: { type: DataTypes.STRING, allowNull: false, defaultValue: 'USDC' },
    balanceMinor: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, modelName: 'CreatorVault', tableName: 'creator_vaults' }
);

interface EntitlementPassAttributes {
  id: number;
  userId: number;
  assetId: number;
  passType: string;
  status: string;
  expiresAt?: Date;
}

interface EntitlementPassCreationAttributes extends Optional<EntitlementPassAttributes, 'id' | 'status' | 'expiresAt'> {}

export class EntitlementPass extends Model<EntitlementPassAttributes, EntitlementPassCreationAttributes> implements EntitlementPassAttributes {
  public id!: number;
  public userId!: number;
  public assetId!: number;
  public passType!: string;
  public status!: string;
  public expiresAt!: Date | undefined;
}

EntitlementPass.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    assetId: { type: DataTypes.INTEGER, allowNull: false },
    passType: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active' },
    expiresAt: { type: DataTypes.DATE },
  },
  { sequelize, modelName: 'EntitlementPass', tableName: 'entitlement_passes' }
);

interface ProvenanceServiceAttributes {
  id: number;
  assetId: number;
  eventType: string;
  actorUserId: number;
  serviceName: string;
  contractName: string;
  txRef?: string;
}

interface ProvenanceServiceCreationAttributes extends Optional<ProvenanceServiceAttributes, 'id' | 'txRef'> {}

export class ProvenanceService extends Model<ProvenanceServiceAttributes, ProvenanceServiceCreationAttributes> implements ProvenanceServiceAttributes {
  public id!: number;
  public assetId!: number;
  public eventType!: string;
  public actorUserId!: number;
  public serviceName!: string;
  public contractName!: string;
  public txRef!: string | undefined;
}

ProvenanceService.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    assetId: { type: DataTypes.INTEGER, allowNull: false },
    eventType: { type: DataTypes.STRING, allowNull: false },
    actorUserId: { type: DataTypes.INTEGER, allowNull: false },
    serviceName: { type: DataTypes.STRING, allowNull: false },
    contractName: { type: DataTypes.STRING, allowNull: false },
    txRef: { type: DataTypes.STRING },
  },
  { sequelize, modelName: 'ProvenanceService', tableName: 'provenance_services' }
);

interface SettlementServiceAttributes {
  id: number;
  settlementType: string;
  payerUserId: number;
  assetId: number;
  amountMinor: number;
  stablecoin: string;
  status: string;
}

interface SettlementServiceCreationAttributes extends Optional<SettlementServiceAttributes, 'id' | 'stablecoin' | 'status'> {}

export class SettlementService extends Model<SettlementServiceAttributes, SettlementServiceCreationAttributes> implements SettlementServiceAttributes {
  public id!: number;
  public settlementType!: string;
  public payerUserId!: number;
  public assetId!: number;
  public amountMinor!: number;
  public stablecoin!: string;
  public status!: string;
}

SettlementService.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    settlementType: { type: DataTypes.STRING, allowNull: false },
    payerUserId: { type: DataTypes.INTEGER, allowNull: false },
    assetId: { type: DataTypes.INTEGER, allowNull: false },
    amountMinor: { type: DataTypes.INTEGER, allowNull: false },
    stablecoin: { type: DataTypes.STRING, allowNull: false, defaultValue: 'USDC' },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'settled' },
  },
  { sequelize, modelName: 'SettlementService', tableName: 'settlement_services' }
);
