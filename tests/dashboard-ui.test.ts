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

describe('Backend route manifest surface', () => {
  it('GET /api should return API manifest', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.api).toBe('LOCKED-IN');
  });

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
