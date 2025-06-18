import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { CacheService } from '../../common/services/cache.service';

type MockRepo = {
  create: jest.Mock;
  save: jest.Mock;
  createQueryBuilder: jest.Mock;
  count: jest.Mock;
  findOne: jest.Mock;
  remove: jest.Mock;
  query: jest.Mock;
};

describe('TasksService', () => {
  let service: TasksService;
  let repo: MockRepo;
  let queue: { add: jest.Mock };

  beforeEach(async () => {
    repo = {
      create: jest.fn().mockImplementation(dto => dto),
      save: jest.fn().mockImplementation(task => ({ ...task, id: '1' })),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      }),
      count: jest.fn().mockResolvedValue(0),
      findOne: jest.fn().mockResolvedValue(null),
      remove: jest.fn(),
      query: jest.fn(),
    };
    queue = { add: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: repo },
        { provide: 'BullQueue_task-processing', useValue: queue },
        { provide: CacheService, useValue: { set: jest.fn(), get: jest.fn() } },
      ],
    }).compile();
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task and add to queue', async () => {
    const dto: CreateTaskDto = {
      title: 'Test',
      description: 'Desc',
      status: 'PENDING',
      priority: 'MEDIUM',
      userId: 'user-id',
    } as CreateTaskDto;
    const result = await service.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalled();
    expect(queue.add).toHaveBeenCalledWith('task-status-update', expect.any(Object));
    expect(result).toHaveProperty('id');
  });
});
