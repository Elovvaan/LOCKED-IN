import { Router, Response } from 'express';
import { Op } from 'sequelize';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Event, EventParticipant, EventMedia, EventResult, EventVote, User } from '../models';

const router = Router();
router.use(authMiddleware);

// POST /events - Create event
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, locationName, lat, lng, startTime, endTime, maxPlayers, isPublic } = req.body;
    if (!title || !startTime || !endTime || !maxPlayers) {
      return res.status(400).json({ error: 'title, startTime, endTime, maxPlayers are required' });
    }
    const event = await Event.create({
      creatorId: req.user!.id,
      title,
      description,
      locationName,
      lat,
      lng,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      maxPlayers,
      isPublic: isPublic !== undefined ? isPublic : true,
    });
    return res.status(201).json(event);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /events - Feed with upcoming, live, past
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const events = await Event.findAll({
      include: [{ model: EventParticipant, attributes: ['id', 'role', 'status'] }],
    });

    const withCount = events.map((e: any) => {
      const plain = e.get({ plain: true });
      plain.participantCount = plain.EventParticipants ? plain.EventParticipants.length : 0;
      delete plain.EventParticipants;
      return plain;
    });

    const upcoming = withCount.filter((e: any) => new Date(e.startTime) > now);
    const live = withCount.filter((e: any) => new Date(e.startTime) <= now && new Date(e.endTime) >= now);
    const past = withCount.filter((e: any) => new Date(e.endTime) < now);

    return res.json({ upcoming, live, past });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /events/:id/join
router.post('/:id/join', async (req: AuthRequest, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { role } = req.body;

    if (!role || !['player', 'spectator'].includes(role)) {
      return res.status(400).json({ error: 'role must be "player" or "spectator"' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const existing = await EventParticipant.findOne({ where: { eventId, userId } });
    if (existing) return res.status(409).json({ error: 'Already joined this event' });

    if (role === 'player') {
      const playerCount = await EventParticipant.count({ where: { eventId, role: 'player' } });
      if (playerCount >= event.maxPlayers) {
        return res.status(400).json({ error: 'Event is full' });
      }
    }

    const participant = await EventParticipant.create({ eventId, userId, role, status: 'joined' });

    // Increment eventsJoined on user
    await User.increment('eventsJoined', { by: 1, where: { id: userId } });

    return res.status(201).json(participant);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /events/:id/checkin
router.post('/:id/checkin', async (req: AuthRequest, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user!.id;

    const participant = await EventParticipant.findOne({ where: { eventId, userId } });
    if (!participant) return res.status(404).json({ error: 'Not a participant of this event' });

    await participant.update({ status: 'checked_in' });
    return res.json(participant);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /events/:id/media
router.post('/:id/media', async (req: AuthRequest, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { videoUrl, type } = req.body;

    if (!videoUrl || !type || !['official', 'spectator'].includes(type)) {
      return res.status(400).json({ error: 'videoUrl and type ("official" or "spectator") are required' });
    }

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const participant = await EventParticipant.findOne({ where: { eventId, userId } });
    if (!participant) return res.status(403).json({ error: 'Not a participant of this event' });

    if (type === 'official' && participant.status !== 'checked_in') {
      return res.status(403).json({ error: 'Must be checked in to upload official media' });
    }

    const media = await EventMedia.create({ eventId, userId, videoUrl, type });
    return res.status(201).json(media);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /events/:id/vote
router.post('/:id/vote', async (req: AuthRequest, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const voterId = req.user!.id;
    const { winnerId } = req.body;

    if (!winnerId) return res.status(400).json({ error: 'winnerId is required' });

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Voter must be a participant
    const voterParticipant = await EventParticipant.findOne({ where: { eventId, userId: voterId } });
    if (!voterParticipant) return res.status(403).json({ error: 'Not a participant of this event' });

    // Winner must be a player participant
    const winnerParticipant = await EventParticipant.findOne({ where: { eventId, userId: winnerId, role: 'player' } });
    if (!winnerParticipant) return res.status(400).json({ error: 'Winner must be a player in this event' });

    // Check voter hasn't already voted
    const existingVote = await EventVote.findOne({ where: { eventId, voterId } });
    if (existingVote) return res.status(409).json({ error: 'Already voted in this event' });

    // Create vote record
    await EventVote.create({ eventId, voterId, winnerId });

    // Upsert EventResult
    const existingResult = await EventResult.findOne({ where: { eventId, winnerId } });
    if (existingResult) {
      await existingResult.increment('votes', { by: 1 });
    } else {
      await EventResult.create({ eventId, winnerId, votes: 1 });
    }

    // Update winner's eventsWon and locationWins
    const winner = await User.findByPk(winnerId);
    if (winner) {
      const totalVotes = await EventVote.count({ where: { eventId, winnerId } });
      const totalParticipants = await EventParticipant.count({ where: { eventId } });
      if (totalVotes > totalParticipants / 2) {
        const locationWins = JSON.parse(winner.locationWins || '{}');
        const updates: any = { eventsWon: winner.eventsWon + 1 };
        if (event.locationName) {
          locationWins[event.locationName] = (locationWins[event.locationName] || 0) + 1;
          updates.locationWins = JSON.stringify(locationWins);
        }
        await winner.update(updates);
      }
    }

    return res.status(201).json({ message: 'Vote recorded' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
