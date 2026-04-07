process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/models';

let token: string;
let userId: number;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const res = await request(app).post('/auth/register').send({
    username: 'profileuser',
    email: 'profile@test.com',
    password: 'password123',
  });
  token = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('User Routes', () => {
  describe('GET /users/:id/profile', () => {
    it('should return user profile', async () => {
      const res = await request(app)
        .get(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(userId);
      expect(res.body.user.username).toBe('profileuser');
      expect(res.body.user.eventsJoined).toBe(0);
      expect(res.body.user.eventsWon).toBe(0);
      expect(res.body.user.locationWins).toEqual({});
      expect(res.body.kingOfLocation).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get('/users/99999/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('should require auth', async () => {
      const res = await request(app).get(`/users/${userId}/profile`);
      expect(res.status).toBe(401);
    });

    it('should show kingOfLocation when user has location wins', async () => {
      // Directly update the user's locationWins for testing
      const { User } = await import('../src/models');
      await User.update(
        { locationWins: JSON.stringify({ 'Central Park': 3, 'Times Square': 1 }), eventsWon: 4 },
        { where: { id: userId } }
      );

      const res = await request(app)
        .get(`/users/${userId}/profile`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.kingOfLocation).toBe('Central Park');
      expect(res.body.user.eventsWon).toBe(4);
    });
  });
});
