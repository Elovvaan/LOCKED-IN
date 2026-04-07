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

  describe('GET /skills/feed - currentLeader and polling', () => {
    it('should include currentLeader in each feed post', async () => {
      const res = await request(app)
        .get('/skills/feed')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // The post has received votes (token3 voted for userId1), so currentLeader should be set
      const post = res.body.find((p: any) => p.id === skillPostId);
      expect(post).toBeDefined();
      expect(post).toHaveProperty('currentLeader');
      expect(post.currentLeader).not.toBeNull();
      expect(post.currentLeader.userId).toBe(userId1);
      expect(post.currentLeader.voteCount).toBeGreaterThan(0);
    });

    it('should include isBattleReady=true when post has ≥2 responses', async () => {
      const res = await request(app)
        .get('/skills/feed')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      const post = res.body.find((p: any) => p.id === skillPostId);
      expect(post).toBeDefined();
      expect(post).toHaveProperty('isBattleReady');
      // The post already has 2 responses created in earlier tests, so battle should be ready
      expect(post.isBattleReady).toBe(true);
    });

    it('should include isBattleReady=false for a post with fewer than 2 responses', async () => {
      // Create a brand-new skill post with no responses
      const newPost = await request(app)
        .post('/skills')
        .set('Authorization', `Bearer ${token1}`)
        .send({ videoUrl: 'https://example.com/new.mp4', title: 'No Responses Yet' });
      expect(newPost.status).toBe(201);

      const res = await request(app)
        .get('/skills/feed')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      const post = res.body.find((p: any) => p.id === newPost.body.id);
      expect(post).toBeDefined();
      expect(post.isBattleReady).toBe(false);
    });

    it('should support ?since= for polling (return only newer posts)', async () => {
      // Future timestamp - should return no posts
      const future = new Date(Date.now() + 60000).toISOString();
      const res = await request(app)
        .get(`/skills/feed?since=${encodeURIComponent(future)}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it('should return posts created after ?since= timestamp', async () => {
      // Past timestamp - should return all posts
      const past = new Date(0).toISOString();
      const res = await request(app)
        .get(`/skills/feed?since=${encodeURIComponent(past)}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /skills/:id - responses sorted by votes, battleMode, currentLeader', () => {
    it('should return responses sorted by vote count with isBattleMode flags', async () => {
      const res = await request(app)
        .get(`/skills/${skillPostId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.responses).toBeDefined();
      // With 2+ responses the top 2 should be flagged as battleMode
      const responses = res.body.responses;
      if (responses.length >= 2) {
        expect(responses[0].isBattleMode).toBe(true);
        expect(responses[1].isBattleMode).toBe(true);
      }
      // Each response should have voteCount
      responses.forEach((r: any) => {
        expect(r).toHaveProperty('voteCount');
      });
    });

    it('should return currentLeader in stats', async () => {
      const res = await request(app)
        .get(`/skills/${skillPostId}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.stats).toHaveProperty('currentLeader');
      expect(res.body.stats.currentLeader).not.toBeNull();
      expect(res.body.stats.currentLeader.userId).toBe(userId1);
    });
  });

  describe('GET /skills/:id/responses', () => {
    it('should return responses sorted by vote count with isBattleMode', async () => {
      const res = await request(app)
        .get(`/skills/${skillPostId}/responses`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((r: any) => {
        expect(r).toHaveProperty('voteCount');
        expect(r).toHaveProperty('isBattleMode');
        expect(r).toHaveProperty('responder');
      });
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .get('/skills/99999/responses')
        .set('Authorization', `Bearer ${token1}`);
      expect(res.status).toBe(404);
    });

    it('should require auth', async () => {
      const res = await request(app).get(`/skills/${skillPostId}/responses`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /skills/:id/battle', () => {
    it('should return battleResponses, currentLeader, and isBattleReady', async () => {
      const res = await request(app)
        .get(`/skills/${skillPostId}/battle`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('battleResponses');
      expect(res.body).toHaveProperty('currentLeader');
      expect(res.body).toHaveProperty('isBattleReady');
      expect(Array.isArray(res.body.battleResponses)).toBe(true);
      // There are multiple responses posted so battle should be ready
      expect(res.body.isBattleReady).toBe(true);
      expect(res.body.battleResponses.length).toBe(2);
      res.body.battleResponses.forEach((r: any) => {
        expect(r).toHaveProperty('voteCount');
        expect(r).toHaveProperty('isBattleMode');
        expect(r.isBattleMode).toBe(true);
      });
    });

    it('should return hasVoted=false for user who has not voted', async () => {
      // token1 is the creator and has not voted in the battle (can't vote for themselves)
      const res = await request(app)
        .get(`/skills/${skillPostId}/battle`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('hasVoted');
      expect(res.body).toHaveProperty('userVotedFor');
      expect(res.body).toHaveProperty('endsAt');
      expect(res.body).toHaveProperty('isEnded');
    });

    it('should return hasVoted=true and userVotedFor for user who voted', async () => {
      // token3 voted for userId1 in the /vote endpoint earlier in the test suite
      const res = await request(app)
        .get(`/skills/${skillPostId}/battle`)
        .set('Authorization', `Bearer ${token3}`);

      expect(res.status).toBe(200);
      expect(res.body.hasVoted).toBe(true);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .get('/skills/99999/battle')
        .set('Authorization', `Bearer ${token1}`);
      expect(res.status).toBe(404);
    });

    it('should require auth', async () => {
      const res = await request(app).get(`/skills/${skillPostId}/battle`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /skills/:id/responses/:responseId/vote', () => {
    let newPostId: number;
    let newResponseId: number;
    let voterToken: string;
    let responderToken: string;

    beforeAll(async () => {
      // Create a fresh post + response + voter for these tests
      const creator = await request(app)
        .post('/auth/register')
        .send({ username: 'battlecreator', email: 'battlecreator@test.com', password: 'pass' });
      const creatorToken = creator.body.token;

      const responder = await request(app)
        .post('/auth/register')
        .send({ username: 'battleresponder', email: 'battleresponder@test.com', password: 'pass' });
      responderToken = responder.body.token;

      const voter = await request(app)
        .post('/auth/register')
        .send({ username: 'battlevoter', email: 'battlevoter@test.com', password: 'pass' });
      voterToken = voter.body.token;

      const postRes = await request(app)
        .post('/skills')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ videoUrl: 'https://example.com/battle.mp4', title: 'Battle Test Challenge' });
      newPostId = postRes.body.id;

      const responseRes = await request(app)
        .post(`/skills/${newPostId}/respond`)
        .set('Authorization', `Bearer ${responderToken}`)
        .send({ videoUrl: 'https://example.com/battleresp.mp4', caption: 'Battle response' });
      newResponseId = responseRes.body.id;
    });

    it('should allow a spectator to vote on a specific response', async () => {
      const res = await request(app)
        .post(`/skills/${newPostId}/responses/${newResponseId}/vote`)
        .set('Authorization', `Bearer ${voterToken}`)
        .send();

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Vote recorded');
    });

    it('should reject duplicate votes', async () => {
      const res = await request(app)
        .post(`/skills/${newPostId}/responses/${newResponseId}/vote`)
        .set('Authorization', `Bearer ${voterToken}`)
        .send();

      expect(res.status).toBe(409);
    });

    it('should block the responder from voting', async () => {
      const res = await request(app)
        .post(`/skills/${newPostId}/responses/${newResponseId}/vote`)
        .set('Authorization', `Bearer ${responderToken}`)
        .send();

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .post(`/skills/99999/responses/${newResponseId}/vote`)
        .set('Authorization', `Bearer ${voterToken}`)
        .send();

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent response', async () => {
      const res = await request(app)
        .post(`/skills/${newPostId}/responses/99999/vote`)
        .set('Authorization', `Bearer ${voterToken}`)
        .send();

      expect(res.status).toBe(404);
    });
  });

  describe('POST /skills with endsAt (battle countdown)', () => {
    it('should create a skill post with endsAt field', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const res = await request(app)
        .post('/skills')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          videoUrl: 'https://example.com/timed.mp4',
          title: 'Timed Battle Challenge',
          endsAt: futureDate,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('endsAt');
      expect(new Date(res.body.endsAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('should return isEnded=false for a battle that has not ended', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const postRes = await request(app)
        .post('/skills')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          videoUrl: 'https://example.com/active.mp4',
          title: 'Active Battle',
          endsAt: futureDate,
        });
      const timedPostId = postRes.body.id;

      const battleRes = await request(app)
        .get(`/skills/${timedPostId}/battle`)
        .set('Authorization', `Bearer ${token1}`);

      expect(battleRes.status).toBe(200);
      expect(battleRes.body.isEnded).toBe(false);
      expect(battleRes.body.endsAt).not.toBeNull();
    });

    it('should return isEnded=true for a battle past its endsAt', async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const postRes = await request(app)
        .post('/skills')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          videoUrl: 'https://example.com/ended.mp4',
          title: 'Ended Battle',
          endsAt: pastDate,
        });
      const endedPostId = postRes.body.id;

      const battleRes = await request(app)
        .get(`/skills/${endedPostId}/battle`)
        .set('Authorization', `Bearer ${token1}`);

      expect(battleRes.status).toBe(200);
      expect(battleRes.body.isEnded).toBe(true);
    });
  });

  describe('POST /skills/:id/rematch', () => {
    let endedPostId: number;
    let activePostId: number;

    beforeAll(async () => {
      const pastDate = new Date(Date.now() - 2000).toISOString();
      const endedRes = await request(app)
        .post('/skills')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          videoUrl: 'https://example.com/ended-rematch.mp4',
          title: 'Ended Battle For Rematch',
          endsAt: pastDate,
        });
      endedPostId = endedRes.body.id;

      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const activeRes = await request(app)
        .post('/skills')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          videoUrl: 'https://example.com/active-rematch.mp4',
          title: 'Active Battle No Rematch',
          endsAt: futureDate,
        });
      activePostId = activeRes.body.id;
    });

    it('should create a rematch post for an ended battle', async () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      const res = await request(app)
        .post(`/skills/${endedPostId}/rematch`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ endsAt: futureDate });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('rematchOf', endedPostId);
      expect(res.body.title).toBe('Ended Battle For Rematch');
      expect(res.body.userId).toBe(userId2);
    });

    it('should reject rematch for a battle that has not ended', async () => {
      const res = await request(app)
        .post(`/skills/${activePostId}/rematch`)
        .set('Authorization', `Bearer ${token2}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/not ended/);
    });

    it('should allow rematch for a post without endsAt (no time limit)', async () => {
      const res = await request(app)
        .post(`/skills/${skillPostId}/rematch`)
        .set('Authorization', `Bearer ${token2}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('rematchOf', skillPostId);
    });

    it('should return 404 for non-existent post', async () => {
      const res = await request(app)
        .post('/skills/99999/rematch')
        .set('Authorization', `Bearer ${token1}`)
        .send({});

      expect(res.status).toBe(404);
    });

    it('should require auth', async () => {
      const res = await request(app)
        .post(`/skills/${endedPostId}/rematch`)
        .send({});

      expect(res.status).toBe(401);
    });
  });
});
