import { Router, Response } from 'express';
import { literal, fn, col, Op } from 'sequelize';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { SkillPost, SkillResponse, SkillVote, User, Event } from '../models';

// Helper: returns the current leader (most-voted participant) for a skill thread
async function getCurrentLeader(postId: number): Promise<{ userId: number; username: string; voteCount: number } | null> {
  const rows = (await SkillVote.findAll({
    where: { skillPostId: postId },
    attributes: ['targetUserId', [fn('COUNT', col('SkillVote.id')), 'voteCount']],
    group: ['targetUserId'],
    order: [[fn('COUNT', col('SkillVote.id')), 'DESC']],
    limit: 1,
    raw: true,
  })) as any[];
  if (!rows.length) return null;
  const leaderId: number = rows[0].targetUserId;
  const voteCount: number = Number(rows[0].voteCount);
  const user = await User.findByPk(leaderId, { attributes: ['id', 'username'] });
  if (!user) return null;
  return { userId: leaderId, username: (user as any).username, voteCount };
}

// Helper: fetch responses for a post sorted by per-response vote count with battle mode flags
async function getResponsesWithVotes(postId: number): Promise<any[]> {
  const responses = await SkillResponse.findAll({
    where: { skillPostId: postId },
    include: [{ model: User, as: 'responder', attributes: ['id', 'username'] }],
    attributes: {
      include: [
        [literal('(SELECT COUNT(*) FROM skill_votes WHERE skill_votes.responseId = SkillResponse.id)'), 'voteCount'],
      ],
    },
    order: [[literal('(SELECT COUNT(*) FROM skill_votes WHERE skill_votes.responseId = SkillResponse.id)'), 'DESC']],
  });
  return responses.map((r: any, idx: number) => ({
    ...r.get({ plain: true }),
    voteCount: Number(r.get({ plain: true }).voteCount),
    isBattleMode: responses.length >= 2 && idx < 2,
  }));
}

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

// GET /skills/feed - Vertical feed sorted by newest + engagement; supports ?since=<ISO> for polling
router.get('/feed', async (req: AuthRequest, res: Response) => {
  try {
    const whereClause: any = {};
    if (req.query.since) {
      const since = new Date(req.query.since as string);
      if (!isNaN(since.getTime())) {
        whereClause.createdAt = { [Op.gt]: since };
      }
    }

    const posts = await SkillPost.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username'] },
      ],
      attributes: {
        include: [
          [literal('(SELECT COUNT(*) FROM skill_responses WHERE skill_responses.skillPostId = SkillPost.id)'), 'responseCount'],
          [literal('(SELECT COUNT(*) FROM skill_votes WHERE skill_votes.skillPostId = SkillPost.id)'), 'voteCount'],
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    const feed = posts.map((post: any) => post.get({ plain: true }));

    // Sort by newest + engagement (responseCount + voteCount)
    feed.sort((a: any, b: any) => {
      const engagementA = Number(a.responseCount) + Number(a.voteCount);
      const engagementB = Number(b.responseCount) + Number(b.voteCount);
      if (engagementB !== engagementA) return engagementB - engagementA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Enrich each post with currentLeader for live vote badge
    const enriched = await Promise.all(
      feed.map(async (post: any) => {
        const currentLeader = await getCurrentLeader(post.id);
        return { ...post, currentLeader };
      })
    );

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /skills/:id - Fetch a SkillPost with responses sorted by votes, battle mode, and current leader
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await SkillPost.findByPk(postId, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'username'] }],
      attributes: {
        include: [
          [literal('(SELECT COUNT(*) FROM skill_responses WHERE skill_responses.skillPostId = SkillPost.id)'), 'responseCount'],
          [literal('(SELECT COUNT(*) FROM skill_votes WHERE skill_votes.skillPostId = SkillPost.id)'), 'voteCount'],
        ],
      },
    });
    if (!post) return res.status(404).json({ error: 'SkillPost not found' });

    const plain = post.get({ plain: true }) as any;

    // Responses sorted by per-response vote count (DESC) with battle mode flags
    const responsesPlain = await getResponsesWithVotes(postId);

    // Find events spawned from this skill post (title matches)
    const eventLinks = await Event.findAll({
      where: { title: plain.title },
      attributes: ['id', 'title', 'startTime', 'endTime', 'locationName', 'isPublic'],
    });

    // Current leader: participant with the most votes in this thread
    const currentLeader = await getCurrentLeader(postId);

    return res.json({
      post: { ...plain, currentLeader },
      responses: responsesPlain,
      eventLinks: eventLinks.map((e: any) => e.get({ plain: true })),
      stats: { responseCount: Number(plain.responseCount), voteCount: Number(plain.voteCount), currentLeader },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /skills/:id/responses - Responses sorted by vote count with battle mode flags
router.get('/:id/responses', async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await SkillPost.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'SkillPost not found' });

    const responsesPlain = await getResponsesWithVotes(postId);
    return res.json(responsesPlain);
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

// GET /skills/:id/battle - Battle Mode: top 2 responses side-by-side with leader info
router.get('/:id/battle', async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await SkillPost.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'SkillPost not found' });

    const allResponses = await getResponsesWithVotes(postId);
    const battleResponses = allResponses.slice(0, 2);
    const currentLeader = await getCurrentLeader(postId);

    return res.json({
      battleResponses,
      currentLeader,
      isBattleReady: battleResponses.length >= 2,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /skills/:id/responses/:responseId/vote - Vote directly on a response in battle mode
router.post('/:id/responses/:responseId/vote', async (req: AuthRequest, res: Response) => {
  try {
    const postId = parseInt(req.params.id);
    const responseId = parseInt(req.params.responseId);
    const voterId = req.user!.id;

    const post = await SkillPost.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'SkillPost not found' });

    const response = await SkillResponse.findOne({ where: { id: responseId, skillPostId: postId } });
    if (!response) return res.status(404).json({ error: 'Response not found' });

    const targetUserId = (response as any).userId;

    const existingVote = await SkillVote.findOne({ where: { skillPostId: postId, voterId } });
    if (existingVote) return res.status(409).json({ error: 'Already voted on this challenge' });

    const competitorResponse = await SkillResponse.findOne({ where: { skillPostId: postId, userId: voterId } });
    if (competitorResponse) {
      return res.status(403).json({ error: 'Active competitors in this thread cannot vote' });
    }

    await SkillVote.create({ skillPostId: postId, responseId, voterId, targetUserId });
    return res.status(201).json({ message: 'Vote recorded' });
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
