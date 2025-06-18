import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      setRefreshToken: jest.fn(),
      getUserIfRefreshTokenMatches: jest.fn(),
      // ...other methods if needed
    } as unknown as jest.Mocked<UsersService>;
    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    } as unknown as jest.Mocked<JwtService>;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if user not found on login', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await expect(service.login({ email: 'a', password: 'b' })).rejects.toThrow();
  });

  it('should return access and refresh tokens on login', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      email: 'a',
      password: await Promise.resolve('$2b$10$hash'),
      role: 'user',
    } as User);
    usersService.setRefreshToken.mockResolvedValue(undefined);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
    const result = await service.login({ email: 'a', password: 'b' });
    expect(result.access_token).toBe('jwt-token');
    expect(result.refresh_token).toBeDefined();
    expect(result.user.email).toBe('a');
  });
});
