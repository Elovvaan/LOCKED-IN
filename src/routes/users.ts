import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User, SkillPost, SkillResponse, SkillVote, Event } from '../models';

const router = Router();
router.use(authMiddleware);

// GET /users/:id/profile
router.get('/:id/profile', async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'eventsJoined', 'eventsWon', 'locationWins', 'createdAt', 'updatedAt'],
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const locationWins = JSON.parse(user.locationWins || '{}');
    let kingOfLocation: string | null = null;
    let maxWins = 0;
    for (const [location, count] of Object.entries(locationWins)) {
      if ((count as number) > maxWins) {
        maxWins = count as number;
        kingOfLocation = location;
      }
    }

    // Skill stats
    const postedSkills = await SkillPost.findAll({
      where: { userId },
      attributes: ['id', 'title', 'videoUrl', 'thumbnailUrl', 'caption', 'category', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    const responsesMade = await SkillResponse.count({ where: { userId } });

    // challengeWins: times the user received votes as targetUserId
    const challengeWins = await SkillVote.count({ where: { targetUserId: userId } });

    // challengeDefenses: times the user's original post received a response and the user got votes
    const userPostIds = postedSkills.map((p: any) => p.id);
    let challengeDefenses = 0;
    if (userPostIds.length > 0) {
      challengeDefenses = await SkillVote.count({
        where: { skillPostId: userPostIds, targetUserId: userId },
      });
    }

    // liveEventLinks: upcoming/live events linked to user's skill post titles
    const postTitles = postedSkills.map((p: any) => p.get({ plain: true }).title);
    let liveEventLinks: any[] = [];
    if (postTitles.length > 0) {
      const now = new Date();
      liveEventLinks = await Event.findAll({
        where: { title: postTitles, endTime: { $gte: now } as any },
        attributes: ['id', 'title', 'startTime', 'endTime', 'locationName'],
      }).then((events: any[]) => events.map((e: any) => e.get({ plain: true })));
    }

    // pinnedTopSkills: top 3 posts by vote count
    const pinnedTopSkills = await Promise.all(
      postedSkills.slice(0, 10).map(async (post: any) => {
        const plain = post.get({ plain: true });
        plain.voteCount = await SkillVote.count({ where: { skillPostId: plain.id } });
        plain.responseCount = await SkillResponse.count({ where: { skillPostId: plain.id } });
        return plain;
      })
    );
    pinnedTopSkills.sort((a: any, b: any) => b.voteCount - a.voteCount);
    const topPinned = pinnedTopSkills.slice(0, 3);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        eventsJoined: user.eventsJoined,
        eventsWon: user.eventsWon,
        locationWins,
      },
      kingOfLocation,
      postedSkills: postedSkills.map((p: any) => p.get({ plain: true })),
      responsesMade,
      challengeWins,
      challengeDefenses,
      liveEventLinks,
      pinnedTopSkills: topPinned,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
