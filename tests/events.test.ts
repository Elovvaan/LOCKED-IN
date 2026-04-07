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
let eventId: number;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Register users
  const r1 = await request(app).post('/auth/register').send({ username: 'alice', email: 'alice@test.com', password: 'pass1' });
  token1 = r1.body.token;
  userId1 = r1.body.user.id;

  const r2 = await request(app).post('/auth/register').send({ username: 'bob', email: 'bob@test.com', password: 'pass2' });
  token2 = r2.body.token;
  userId2 = r2.body.user.id;

  const r3 = await request(app).post('/auth/register').send({ username: 'carol', email: 'carol@test.com', password: 'pass3' });
  token3 = r3.body.token;
  userId3 = r3.body.user.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Event Routes', () => {
  describe('POST /events', () => {
    it('should create an event', async () => {
      const now = new Date();
      const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

      const res = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Test Event',
          description: 'A test event',
          locationName: 'Central Park',
          lat: 40.785091,
          lng: -73.968285,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          maxPlayers: 2,
          isPublic: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Event');
      expect(res.body.creatorId).toBe(userId1);
      eventId = res.body.id;
    });

    it('should require auth', async () => {
      const res = await request(app).post('/events').send({ title: 'no auth' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /events', () => {
    it('should return feed with upcoming, live, past sections', async () => {
      const res = await request(app)
        .get('/events')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('upcoming');
      expect(res.body).toHaveProperty('live');
      expect(res.body).toHaveProperty('past');
      expect(Array.isArray(res.body.upcoming)).toBe(true);
      // Our test event is in the future, so it's upcoming
      expect(res.body.upcoming.length).toBeGreaterThan(0);
      expect(res.body.upcoming[0]).toHaveProperty('participantCount');
    });
  });

  describe('POST /events/:id/join', () => {
    it('should allow player to join', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/join`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ role: 'player' });
      expect(res.status).toBe(201);
      expect(res.body.role).toBe('player');
      expect(res.body.status).toBe('joined');
    });

    it('should allow spectator to join', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/join`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ role: 'spectator' });
      expect(res.status).toBe(201);
      expect(res.body.role).toBe('spectator');
    });

    it('should reject duplicate join', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/join`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ role: 'player' });
      expect(res.status).toBe(409);
    });

    it('should enforce maxPlayers capacity', async () => {
      // Join as player with token2 first (currently spectator, add new user)
      // Create new event with maxPlayers=1
      const now = new Date();
      const evRes = await request(app)
        .post('/events')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Small Event',
          startTime: new Date(now.getTime() + 3600000).toISOString(),
          endTime: new Date(now.getTime() + 7200000).toISOString(),
          maxPlayers: 1,
        });
      const smallEventId = evRes.body.id;

      // token2 joins as player
      await request(app)
        .post(`/events/${smallEventId}/join`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ role: 'player' });

      // token3 tries to join as player - should be rejected
      const res = await request(app)
        .post(`/events/${smallEventId}/join`)
        .set('Authorization', `Bearer ${token3}`)
        .send({ role: 'player' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Event is full');
    });
  });

  describe('POST /events/:id/checkin', () => {
    it('should allow participant to check in', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/checkin`)
        .set('Authorization', `Bearer ${token1}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('checked_in');
    });

    it('should reject non-participant checkin', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/checkin`)
        .set('Authorization', `Bearer ${token3}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /events/:id/media', () => {
    it('should allow checked-in player to upload official media', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/media`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ videoUrl: 'https://example.com/video.mp4', type: 'official' });
      expect(res.status).toBe(201);
      expect(res.body.videoUrl).toBe('https://example.com/video.mp4');
    });

    it('should reject official media from non-checked-in participant', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/media`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ videoUrl: 'https://example.com/video2.mp4', type: 'official' });
      expect(res.status).toBe(403);
    });

    it('should allow spectator to upload spectator media', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/media`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ videoUrl: 'https://example.com/spectator.mp4', type: 'spectator' });
      expect(res.status).toBe(201);
    });

    it('should reject media from non-participant', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/media`)
        .set('Authorization', `Bearer ${token3}`)
        .send({ videoUrl: 'https://example.com/x.mp4', type: 'spectator' });
      expect(res.status).toBe(403);
    });
  });

  describe('POST /events/:id/vote', () => {
    it('should allow participant to vote for a player', async () => {
      // token2 (spectator) votes for token1 (player)
      const res = await request(app)
        .post(`/events/${eventId}/vote`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ winnerId: userId1 });
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Vote recorded');
    });

    it('should reject duplicate votes', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/vote`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ winnerId: userId1 });
      expect(res.status).toBe(409);
    });

    it('should reject vote for non-player', async () => {
      // token1 tries to vote for token2 who is a spectator
      const res = await request(app)
        .post(`/events/${eventId}/vote`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ winnerId: userId2 });
      expect(res.status).toBe(400);
    });

    it('should reject vote from non-participant', async () => {
      const res = await request(app)
        .post(`/events/${eventId}/vote`)
        .set('Authorization', `Bearer ${token3}`)
        .send({ winnerId: userId1 });
      expect(res.status).toBe(403);
    });
  });
});
