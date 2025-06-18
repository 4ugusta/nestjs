import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(600000);

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same pipes used in the main application
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) - should be protected', () => {
    return request(app.getHttpServer()).get('/').expect(401);
  });

  it('/auth/register (POST) - should register a new user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      email: 'testuser@example.com',
      name: 'Test User',
      password: 'testpassword',
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('testuser@example.com');
  });

  it('/auth/login (POST) - should login and return tokens', async () => {
    // Register first (if not already registered)
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'testlogin@example.com',
      name: 'Test Login',
      password: 'testpassword',
    });
    // Now login
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'testlogin@example.com',
      password: 'testpassword',
    });
    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.refresh_token).toBeDefined();
    expect(res.body.user.email).toBe('testlogin@example.com');
  });

  it('/health (GET) - should return ok', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  // Add more tests as needed
});
