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

// SkillPost associations
User.hasMany(SkillPost, { foreignKey: 'userId' });
SkillPost.belongsTo(User, { foreignKey: 'userId', as: 'creator' });

SkillPost.hasMany(SkillResponse, { foreignKey: 'skillPostId' });
SkillResponse.belongsTo(SkillPost, { foreignKey: 'skillPostId' });
SkillResponse.belongsTo(User, { foreignKey: 'userId', as: 'responder' });

SkillPost.hasMany(SkillVote, { foreignKey: 'skillPostId' });
SkillVote.belongsTo(SkillPost, { foreignKey: 'skillPostId' });

export { sequelize, User, Event, EventParticipant, EventMedia, EventResult, EventVote, SkillPost, SkillResponse, SkillVote };
