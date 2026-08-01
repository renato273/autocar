import request from 'supertest';
import app from '../index';
import { prisma } from '../prisma';

describe('Auth endpoints', () => {
  const testEmail = 'testuser@example.com';
  const testPassword = 'Password123';

  beforeAll(async () => {
    // Clean up any existing test user
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    // Remove test user and close Prisma connection
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword, role: 'USER' })
      .expect(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ email: testEmail, role: 'USER' });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);
    expect(res.body).toHaveProperty('token');
  });
});
