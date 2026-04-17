process.env.NODE_ENV = 'test';
process.env.FRONTEND_DIST_DIR = `${__dirname}/fixtures/frontend-dist`;

import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/models';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Frontend static serving', () => {
  it('GET /api should return API manifest even when frontend is enabled', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.api).toBe('LOCKED-IN');
  });

  it('GET / should render frontend index.html', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('LOCKED-IN Frontend Fixture');
  });

  it('GET /dashboard/sweepstakes should fall back to frontend index.html (SPA routing)', async () => {
    const res = await request(app).get('/dashboard/sweepstakes');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('LOCKED-IN Frontend Fixture');
  });

  it('GET /assets/app.js should serve static frontend assets', async () => {
    const res = await request(app).get('/assets/app.js');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/javascript');
    expect(res.text).toContain('frontend fixture asset');
  });
});
