import sequelize from '../database';
import User from './User';
import Event from './Event';
import EventParticipant from './EventParticipant';
import EventMedia from './EventMedia';
import EventResult from './EventResult';
import EventVote from './EventVote';
import SkillPost from './SkillPost';
import SkillResponse from './SkillResponse';
import SkillVote from './SkillVote';
import {
  CreatorRegistry,
  AssetRegistry,
  SplitRule,
  LicenseManager,
  RoyaltyManager,
  CreatorVault,
  EntitlementPass,
  ProvenanceService,
  SettlementService,
} from './CreatorRevenue';
import {
  SweepstakesCampaign,
  SweepstakesEntry,
  SweepstakesWinnerLog,
  SweepstakesFulfillment,
  SweepstakesAuditLog,
} from './Sweepstakes';

// Associations
User.hasMany(Event, { foreignKey: 'creatorId' });
Event.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

Event.hasMany(EventParticipant, { foreignKey: 'eventId' });
EventParticipant.belongsTo(Event, { foreignKey: 'eventId' });
EventParticipant.belongsTo(User, { foreignKey: 'userId' });

Event.hasMany(EventMedia, { foreignKey: 'eventId' });
EventMedia.belongsTo(Event, { foreignKey: 'eventId' });

Event.hasMany(EventResult, { foreignKey: 'eventId' });
Event.hasMany(EventVote, { foreignKey: 'eventId' });
EventResult.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });
EventMedia.belongsTo(User, { foreignKey: 'userId' });

// SkillPost associations
User.hasMany(SkillPost, { foreignKey: 'userId' });
SkillPost.belongsTo(User, { foreignKey: 'userId', as: 'creator' });

SkillPost.hasMany(SkillResponse, { foreignKey: 'skillPostId' });
SkillResponse.belongsTo(SkillPost, { foreignKey: 'skillPostId' });
SkillResponse.belongsTo(User, { foreignKey: 'userId', as: 'responder' });

SkillPost.hasMany(SkillVote, { foreignKey: 'skillPostId' });
SkillVote.belongsTo(SkillPost, { foreignKey: 'skillPostId' });

// Creator revenue layer associations
User.hasOne(CreatorRegistry, { foreignKey: 'userId' });
CreatorRegistry.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(CreatorVault, { foreignKey: 'creatorUserId' });
CreatorVault.belongsTo(User, { foreignKey: 'creatorUserId' });

CreatorRegistry.hasMany(AssetRegistry, { foreignKey: 'creatorId' });
AssetRegistry.belongsTo(CreatorRegistry, { foreignKey: 'creatorId', as: 'creator' });

AssetRegistry.hasMany(SplitRule, { foreignKey: 'assetId' });
SplitRule.belongsTo(AssetRegistry, { foreignKey: 'assetId' });
SplitRule.belongsTo(User, { foreignKey: 'recipientUserId', as: 'recipient' });

AssetRegistry.hasMany(LicenseManager, { foreignKey: 'assetId' });
LicenseManager.belongsTo(AssetRegistry, { foreignKey: 'assetId' });

AssetRegistry.hasMany(RoyaltyManager, { foreignKey: 'assetId' });
RoyaltyManager.belongsTo(AssetRegistry, { foreignKey: 'assetId' });

AssetRegistry.hasMany(EntitlementPass, { foreignKey: 'assetId' });
EntitlementPass.belongsTo(AssetRegistry, { foreignKey: 'assetId' });
EntitlementPass.belongsTo(User, { foreignKey: 'userId' });

AssetRegistry.hasMany(ProvenanceService, { foreignKey: 'assetId' });
ProvenanceService.belongsTo(AssetRegistry, { foreignKey: 'assetId' });
ProvenanceService.belongsTo(User, { foreignKey: 'actorUserId', as: 'actor' });

AssetRegistry.hasMany(SettlementService, { foreignKey: 'assetId' });
SettlementService.belongsTo(AssetRegistry, { foreignKey: 'assetId' });
SettlementService.belongsTo(User, { foreignKey: 'payerUserId', as: 'payer' });

// Sweepstakes campaign associations
User.hasMany(SweepstakesCampaign, { foreignKey: 'createdByUserId', as: 'createdSweepstakesCampaigns' });
SweepstakesCampaign.belongsTo(User, { foreignKey: 'createdByUserId', as: 'creator' });

SweepstakesCampaign.hasMany(SweepstakesEntry, { foreignKey: 'campaignId' });
SweepstakesEntry.belongsTo(SweepstakesCampaign, { foreignKey: 'campaignId' });
SweepstakesEntry.belongsTo(User, { foreignKey: 'userId' });

SweepstakesCampaign.hasMany(SweepstakesWinnerLog, { foreignKey: 'campaignId' });
SweepstakesWinnerLog.belongsTo(SweepstakesCampaign, { foreignKey: 'campaignId' });
SweepstakesWinnerLog.belongsTo(User, { foreignKey: 'winnerUserId', as: 'winner' });

SweepstakesCampaign.hasMany(SweepstakesFulfillment, { foreignKey: 'campaignId' });
SweepstakesFulfillment.belongsTo(SweepstakesCampaign, { foreignKey: 'campaignId' });
SweepstakesFulfillment.belongsTo(SweepstakesWinnerLog, { foreignKey: 'winnerLogId', as: 'winnerLog' });
SweepstakesFulfillment.belongsTo(User, { foreignKey: 'winnerUserId', as: 'winner' });

SweepstakesCampaign.hasMany(SweepstakesAuditLog, { foreignKey: 'campaignId' });
SweepstakesAuditLog.belongsTo(SweepstakesCampaign, { foreignKey: 'campaignId' });
SweepstakesAuditLog.belongsTo(User, { foreignKey: 'actorUserId', as: 'actor' });

export {
  sequelize,
  User,
  Event,
  EventParticipant,
  EventMedia,
  EventResult,
  EventVote,
  SkillPost,
  SkillResponse,
  SkillVote,
  CreatorRegistry,
  AssetRegistry,
  SplitRule,
  LicenseManager,
  RoyaltyManager,
  CreatorVault,
  EntitlementPass,
  ProvenanceService,
  SettlementService,
  SweepstakesCampaign,
  SweepstakesEntry,
  SweepstakesWinnerLog,
  SweepstakesFulfillment,
  SweepstakesAuditLog,
};
