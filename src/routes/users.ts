import { Router, Response } from 'express';
import { literal, Op } from 'sequelize';
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

    // Skill stats - include counts via subqueries to avoid N+1
    const postedSkills = await SkillPost.findAll({
      where: { userId },
      attributes: {
        include: [
          [literal('(SELECT COUNT(*) FROM skill_votes WHERE skill_votes.skillPostId = SkillPost.id)'), 'voteCount'],
          [literal('(SELECT COUNT(*) FROM skill_responses WHERE skill_responses.skillPostId = SkillPost.id)'), 'responseCount'],
        ],
      },
      order: [['createdAt', 'DESC']],
    });

    const responsesMade = await SkillResponse.count({ where: { userId } });

    // challengeWins: times the user received votes as targetUserId
    const challengeWins = await SkillVote.count({ where: { targetUserId: userId } });

    // challengeDefenses: times the user received votes on their own skill posts
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
        where: { title: postTitles, endTime: { [Op.gte]: now } },
        attributes: ['id', 'title', 'startTime', 'endTime', 'locationName'],
      }).then((events: any[]) => events.map((e: any) => e.get({ plain: true })));
    }

    // pinnedTopSkills: top 3 posts by vote count (already included via subquery)
    const skillsWithCounts = postedSkills.map((p: any) => p.get({ plain: true }));
    skillsWithCounts.sort((a: any, b: any) => Number(b.voteCount) - Number(a.voteCount));
    const pinnedTopSkills = skillsWithCounts.slice(0, 3);

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
      postedSkills: skillsWithCounts,
      responsesMade,
      challengeWins,
      challengeDefenses,
      liveEventLinks,
      pinnedTopSkills,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
