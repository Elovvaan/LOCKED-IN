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

describe('Backend root structure', () => {
describe('Backend route manifest surface', () => {
  it('GET /api should return API manifest', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.api).toBe('LOCKED-IN');
  });

  it('GET /backend should return API manifest', async () => {
    const res = await request(app).get('/backend');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.api).toBe('LOCKED-IN');
  });

  it('GET / should return backend route index', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.service).toBe('LOCKED-IN backend');
    expect(res.body.routes.health).toBe('/health');
    expect(res.body.routes.api).toBe('/api');
    expect(res.body.routes.backend).toBe('/backend');
  });

  it('GET /dashboard/sweepstakes should return 404', async () => {
    const res = await request(app).get('/dashboard/sweepstakes');
    expect(res.status).toBe(404);
  });

  it('GET /feed should return 404', async () => {
    const res = await request(app).get('/feed');
    expect(res.status).toBe(404);
  it('GET / should return API manifest', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.api).toBe('LOCKED-IN');
  });

  it('GET /backend should return API manifest', async () => {
    const res = await request(app).get('/backend');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.api).toBe('LOCKED-IN');
  });
});
