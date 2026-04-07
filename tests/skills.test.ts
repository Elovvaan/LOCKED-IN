process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/models';

let token1: string;
let token2: string;
let token3: string;
let userId1: number;
let userId2: number;
let userId3: number;
let skillPostId: number;
let responseId: number;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const r1 = await request(app).post('/auth/register').send({ username: 'skilluser1', email: 'skill1@test.com', password: 'pass1' });
  token1 = r1.body.token;
  userId1 = r1.body.user.id;

  const r2 = await request(app).post('/auth/register').send({ username: 'skilluser2', email: 'skill2@test.com', password: 'pass2' });
  token2 = r2.body.token;
  userId2 = r2.body.user.id;

  const r3 = await request(app).post('/auth/register').send({ username: 'skilluser3', email: 'skill3@test.com', password: 'pass3' });
  token3 = r3.body.token;
  userId3 = r3.body.user.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Skills Routes', () => {
  describe('POST /skills', () => {
    it('should create a skill post', async () => {
      const res = await request(app)
        .post('/skills')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          videoUrl: 'https://example.com/skill.mp4',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          title: '360 No-Look Pass Challenge',
          caption: 'Try to beat this',
          category: 'basketball',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('360 No-Look Pass Challenge');
      expect(res.body.userId).toBe(userId1);
      expect(res.body.videoUrl).toBe('https://example.com/skill.mp4');
      skillPostId = res.body.id;
    });

    it('should require videoUrl and title', async () => {
      const res = await request(app)
        .post('/skills')
        .set('Authorization', `Bearer ${token1}`)
        .send({ caption: 'Missing required fields' });
      expect(res.status).toBe(400);
    });

    it('should require auth', async () => {
      const res = await request(app).post('/skills').send({ videoUrl: 'https://x.com/v.mp4', title: 'Test' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /skills/feed', () => {
    it('should return feed with responseCount, voteCount, and creator', async () => {
      const res = await request(app)
        .get('/skills/feed')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('responseCount');
      expect(res.body[0]).toHaveProperty('voteCount');
      expect(res.body[0]).toHaveProperty('creator');
      expect(res.body[0].creator).toHaveProperty('username');
    });

    it('should require auth', async () => {
      const res = await request(app).get('/skills/feed');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /skills/:id', () => {
    it('should return one skill post with responses, eventLinks, stats', async () => {
      const res = await request(app)
        .get(`/skills/${skillPostId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('post');
      expect(res.body).toHaveProperty('responses');
      expect(res.body).toHaveProperty('eventLinks');
      expect(res.body).toHaveProperty('stats');
      expect(res.body.post.title).toBe('360 No-Look Pass Challenge');
      expect(res.body.stats).toHaveProperty('responseCount');
      expect(res.body.stats).toHaveProperty('voteCount');
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .get('/skills/99999')
        .set('Authorization', `Bearer ${token1}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /skills/:id/respond', () => {
    it('should allow a user to respond to a skill post', async () => {
      const res = await request(app)
        .post(`/skills/${skillPostId}/respond`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ videoUrl: 'https://example.com/response.mp4', caption: 'Beat that!' });

      expect(res.status).toBe(201);
      expect(res.body.skillPostId).toBe(skillPostId);
      expect(res.body.userId).toBe(userId2);
      responseId = res.body.id;
    });

    it('should require videoUrl', async () => {
      const res = await request(app)
        .post(`/skills/${skillPostId}/respond`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ caption: 'No video url' });
      expect(res.status).toBe(400);
    });

    it('should limit responses per user (max 3)', async () => {
      // Already has 1; add 2 more
      await request(app)
        .post(`/skills/${skillPostId}/respond`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ videoUrl: 'https://example.com/response2.mp4' });
      await request(app)
        .post(`/skills/${skillPostId}/respond`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ videoUrl: 'https://example.com/response3.mp4' });

      // 4th attempt should be rejected
      const res = await request(app)
        .post(`/skills/${skillPostId}/respond`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ videoUrl: 'https://example.com/response4.mp4' });
      expect(res.status).toBe(429);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .post('/skills/99999/respond')
        .set('Authorization', `Bearer ${token2}`)
        .send({ videoUrl: 'https://example.com/v.mp4' });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /skills/:id/vote', () => {
    it('should allow a spectator to vote for the original poster', async () => {
      const res = await request(app)
        .post(`/skills/${skillPostId}/vote`)
        .set('Authorization', `Bearer ${token3}`)
        .send({ targetUserId: userId1 });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Vote recorded');
    });

    it('should reject duplicate votes', async () => {
      const res = await request(app)
        .post(`/skills/${skillPostId}/vote`)
        .set('Authorization', `Bearer ${token3}`)
        .send({ targetUserId: userId1 });
      expect(res.status).toBe(409);
    });

    it('should block active competitors from voting', async () => {
      // token2 has responded, so they are a competitor and cannot vote
      const res = await request(app)
        .post(`/skills/${skillPostId}/vote`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ targetUserId: userId1 });
      expect(res.status).toBe(403);
    });

    it('should reject vote for non-participant', async () => {
      // token1 votes for a user who has not posted or responded
      const r4 = await request(app).post('/auth/register').send({ username: 'nonparticipant', email: 'nonp@test.com', password: 'pass' });
      const nonParticipantId = r4.body.user.id;

      const res = await request(app)
        .post(`/skills/${skillPostId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ targetUserId: nonParticipantId });
      expect(res.status).toBe(400);
    });

    it('should require targetUserId', async () => {
      const res = await request(app)
        .post(`/skills/${skillPostId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /skills/:id/create-event', () => {
    it('should create an event pre-filled with the challenge title', async () => {
      const now = new Date();
      const res = await request(app)
        .post(`/skills/${skillPostId}/create-event`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          startTime: new Date(now.getTime() + 3600000).toISOString(),
          endTime: new Date(now.getTime() + 7200000).toISOString(),
          maxPlayers: 4,
          locationName: 'Downtown Court',
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('360 No-Look Pass Challenge');
      expect(res.body.creatorId).toBe(userId1);
      expect(res.body.locationName).toBe('Downtown Court');
    });

    it('should return 404 for non-existent post', async () => {
      const now = new Date();
      const res = await request(app)
        .post('/skills/99999/create-event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          startTime: new Date(now.getTime() + 3600000).toISOString(),
          endTime: new Date(now.getTime() + 7200000).toISOString(),
          maxPlayers: 4,
        });
      expect(res.status).toBe(404);
    });

    it('should require startTime, endTime, maxPlayers', async () => {
      const res = await request(app)
        .post(`/skills/${skillPostId}/create-event`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ locationName: 'Park' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /users/:id/profile (with skill stats)', () => {
    it('should include skill stats in profile', async () => {
      const res = await request(app)
        .get(`/users/${userId1}/profile`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('postedSkills');
      expect(res.body).toHaveProperty('responsesMade');
      expect(res.body).toHaveProperty('challengeWins');
      expect(res.body).toHaveProperty('challengeDefenses');
      expect(res.body).toHaveProperty('liveEventLinks');
      expect(res.body).toHaveProperty('pinnedTopSkills');
      expect(Array.isArray(res.body.postedSkills)).toBe(true);
      expect(res.body.postedSkills.length).toBeGreaterThan(0);
      expect(res.body.postedSkills[0].title).toBe('360 No-Look Pass Challenge');
    });
  });
});
