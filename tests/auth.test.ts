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

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user and return JWT', async () => {
      const res = await request(app).post('/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return 409 for duplicate email', async () => {
      const res = await request(app).post('/auth/register').send({
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already in use');
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/auth/register').send({ email: 'a@b.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login and return JWT', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpass',
      });
      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'nobody@example.com',
        password: 'password123',
      });
      expect(res.status).toBe(401);
    });
  });
});
