import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

type MockRepo = {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  find: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  count: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation(dto => dto),
      save: jest.fn().mockImplementation(user => ({ ...user, id: '1' })),
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      remove: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: repo }],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = { email: 'a', name: 'b', password: 'c' } as CreateUserDto;
    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: dto.email,
        name: dto.name,
        // password should be a string, but not the plain password
        password: expect.any(String),
      }),
    );
    // Ensure password is hashed
    const calledWith = repo.create.mock.calls[0][0];
    expect(calledWith.password).not.toBe(dto.password);
    expect(repo.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });
});
