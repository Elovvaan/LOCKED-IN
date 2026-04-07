import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models';

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
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
