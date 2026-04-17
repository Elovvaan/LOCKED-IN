process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/models';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Health Check', () => {
  it('GET /health should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET / should return API manifest', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.api).toBe('LOCKED-IN');
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.endpoints)).toBe(true);
  });
});

describe('Logged-in diagnostic', () => {
  let token: string;

  it('registers a user and returns a JWT', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'diag_user',
      email: 'diag@lockedin.test',
      password: 'diagpass123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('logged-in user can fetch their own profile', async () => {
    const loginRes = await request(app).post('/auth/login').send({
      email: 'diag@lockedin.test',
      password: 'diagpass123',
    });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
    const userId = loginRes.body.user.id;

    const profileRes = await request(app)
      .get(`/users/${userId}/profile`)
      .set('Authorization', `Bearer ${token}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.user.username).toBe('diag_user');
    expect(typeof profileRes.body.challengeWins).toBe('number');
    expect(typeof profileRes.body.responsesMade).toBe('number');
  });

  it('rejects profile fetch with no token', async () => {
    const res = await request(app).get('/users/1/profile');
    expect(res.status).toBe(401);
  });
});

describe('Logged-in diagnostic', () => {
  let token: string;

  it('registers a user and returns a JWT', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'diag_user',
      email: 'diag@lockedin.test',
      password: 'diagpass123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('logged-in user can fetch their own profile', async () => {
    const loginRes = await request(app).post('/auth/login').send({
      email: 'diag@lockedin.test',
      password: 'diagpass123',
    });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
    const userId = loginRes.body.user.id;

    const profileRes = await request(app)
      .get(`/users/${userId}/profile`)
      .set('Authorization', `Bearer ${token}`);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.user.username).toBe('diag_user');
    expect(typeof profileRes.body.challengeWins).toBe('number');
    expect(typeof profileRes.body.responsesMade).toBe('number');
  });

  it('rejects profile fetch without a token', async () => {
    const res = await request(app).get('/users/1/profile');
    expect(res.status).toBe(401);
  });
});
