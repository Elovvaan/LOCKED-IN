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

describe('Dashboard UI routes', () => {
  it('GET / should render LOCKED-IN dashboard HTML', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('LOCKED-IN');
    expect(res.text).toContain('Test Flow');
  });

  it('GET /dashboard/sweepstakes should render sweepstakes dashboard HTML', async () => {
    const res = await request(app).get('/dashboard/sweepstakes');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('Create Sweepstakes Campaign');
  });

  it('GET /dashboard/revenue should render revenue dashboard HTML', async () => {
    const res = await request(app).get('/dashboard/revenue');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('Creator Vault Balance');
  });
});
