import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskPriority } from '../enums/task-priority.enum';

export class UpdateTaskDto {
  @ApiProperty({ example: 'My Task', required: false })
  title?: string;

  @ApiProperty({ example: 'Description of the task', required: false })
  description?: string;

  @ApiProperty({ enum: TaskStatus, required: false })
  status?: TaskStatus;

  @ApiProperty({ enum: TaskPriority, required: false })
  priority?: TaskPriority;

  @ApiProperty({ example: '2025-06-30T23:59:59.000Z', required: false })
  dueDate?: Date;
}