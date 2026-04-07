import { Router, Response } from 'express';
import { Op } from 'sequelize';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { SkillPost, SkillResponse, SkillVote, User, Event } from '../models';

const router = Router();
router.use(authMiddleware);

// POST /skills - Publish a skill video to the feed
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { videoUrl, thumbnailUrl, title, caption, category } = req.body;
    if (!videoUrl || !title) {
      return res.status(400).json({ error: 'videoUrl and title are required' });
    }
    const post = await SkillPost.create({
      userId: req.user!.id,
      videoUrl,
      thumbnailUrl,
      title,
      caption,
      category,
    });
    return res.status(201).json(post);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /skills/feed - Vertical feed sorted by newest + engagement
router.get('/feed', async (req: AuthRequest, res: Response) => {
  try {
    const posts = await SkillPost.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const feed = await Promise.all(
      posts.map(async (post: any) => {
        const plain = post.get({ plain: true });
        plain.responseCount = await SkillResponse.count({ where: { skillPostId: plain.id } });
        plain.voteCount = await SkillVote.count({ where: { skillPostId: plain.id } });
        return plain;
      })
    );

    // Sort by newest + engagement (responseCount + voteCount)
    feed.sort((a: any, b: any) => {
      const engagementA = a.responseCount + a.voteCount;
      const engagementB = b.responseCount + b.voteCount;
      if (engagementB !== engagementA) return engagementB - engagementA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return res.json(feed);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /skills/:id - One SkillPost with responses, event links, thread stats
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await SkillPost.findByPk(postId, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
    });
    if (!post) return res.status(404).json({ error: 'SkillPost not found' });

    const responses = await SkillResponse.findAll({
      where: { skillPostId: postId },
      include: [{ model: User, as: 'responder', attributes: ['id', 'username'] }],
      order: [['createdAt', 'ASC']],
    });

    const responseCount = responses.length;
    const voteCount = await SkillVote.count({ where: { skillPostId: postId } });

    // Find events spawned from this skill post (title matches)
    const plain = post.get({ plain: true });
    const eventLinks = await Event.findAll({
      where: { title: plain.title },
      attributes: ['id', 'title', 'startTime', 'endTime', 'locationName', 'isPublic'],
    });

    return res.json({
      post: plain,
      responses: responses.map((r: any) => r.get({ plain: true })),
      eventLinks: eventLinks.map((e: any) => e.get({ plain: true })),
      stats: { responseCount, voteCount },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /skills/:id/respond - Upload a response video
// Basic per-user limit: max 3 responses per challenge
const MAX_RESPONSES_PER_USER = 3;

router.post('/:id/respond', async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { videoUrl, caption } = req.body;

    if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' });

    const post = await SkillPost.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'SkillPost not found' });

    const existingCount = await SkillResponse.count({ where: { skillPostId: postId, userId } });
    if (existingCount >= MAX_RESPONSES_PER_USER) {
      return res.status(429).json({ error: `You may only respond ${MAX_RESPONSES_PER_USER} times per challenge` });
    }

    const response = await SkillResponse.create({ skillPostId: postId, userId, videoUrl, caption });
    return res.status(201).json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /skills/:id/vote - Vote who won the thread
router.post('/:id/vote', async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const voterId = req.user!.id;
    const { targetUserId } = req.body;

    if (!targetUserId) return res.status(400).json({ error: 'targetUserId is required' });

    const post = await SkillPost.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'SkillPost not found' });

    // Block duplicate votes (unique constraint on skillPostId + voterId)
    const existingVote = await SkillVote.findOne({ where: { skillPostId: postId, voterId } });
    if (existingVote) return res.status(409).json({ error: 'Already voted on this challenge' });

    // Optionally block active competitors from voting
    const competitorResponse = await SkillResponse.findOne({ where: { skillPostId: postId, userId: voterId } });
    if (competitorResponse) {
      return res.status(403).json({ error: 'Active competitors in this thread cannot vote' });
    }

    // Verify targetUserId is a valid participant (post creator or responder)
    const plain = post.get({ plain: true });
    const isCreator = plain.userId === targetUserId;
    const isResponder = await SkillResponse.findOne({ where: { skillPostId: postId, userId: targetUserId } });
    if (!isCreator && !isResponder) {
      return res.status(400).json({ error: 'targetUserId must be the challenge creator or a responder' });
    }

    // Find the responseId for the target (if they are a responder)
    let responseId: number | undefined;
    if (isResponder) {
      responseId = (isResponder as any).id;
    }

    await SkillVote.create({ skillPostId: postId, responseId, voterId, targetUserId });
    return res.status(201).json({ message: 'Vote recorded' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /skills/:id/create-event - Spawn a Pull Up event from an existing SkillPost
router.post('/:id/create-event', async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const { startTime, endTime, maxPlayers, locationName, lat, lng, description, isPublic } = req.body;

    if (!startTime || !endTime || !maxPlayers) {
      return res.status(400).json({ error: 'startTime, endTime, maxPlayers are required' });
    }

    const post = await SkillPost.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'SkillPost not found' });

    const plain = post.get({ plain: true });

    const event = await Event.create({
      creatorId: req.user!.id,
      title: plain.title, // pre-filled from the user-defined challenge title
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

export default router;
