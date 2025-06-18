import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaskStatus } from './enums/task-status.enum';
import { TaskFilterDto } from './dto/task-filter.dto';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
@RateLimit({ limit: 100, windowMs: 60000 })
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all tasks with optional filtering' })
  async findAll(@Query() filter: TaskFilterDto) {
    return this.tasksService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a task by ID' })
  async findOne(@Param('id') id: string) {
    const task = await this.tasksService.findOne(id);

    if (!task) {
      throw new HttpException(`Task with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    return task;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Batch process multiple tasks' })
  async batchProcess(@Body() operations: { tasks: string[]; action: string }) {
    const { tasks: taskIds, action } = operations;
    const results = [];

    for (const taskId of taskIds) {
      try {
        let result;

        switch (action) {
          case 'complete':
            result = await this.tasksService.update(taskId, { status: TaskStatus.COMPLETED });
            break;
          case 'delete':
            result = await this.tasksService.remove(taskId);
            break;
          default:
            throw new HttpException(`Unknown action: ${action}`, HttpStatus.BAD_REQUEST);
        }

        results.push({ taskId, success: true, result });
      } catch (error) {
        results.push({
          taskId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}