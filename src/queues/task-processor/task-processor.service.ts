import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TasksService } from '../../modules/tasks/tasks.service';

@Injectable()
@Processor('task-processing')
export class TaskProcessorService extends WorkerHost {
  private readonly logger = new Logger(TaskProcessorService.name);

  constructor(private readonly tasksService: TasksService) {
    super();
  }

  async process(job: Job): Promise<{ success: boolean; [key: string]: any }> {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
    try {
      switch (job.name) {
        case 'task-status-update':
          return await this.handleStatusUpdate(job);
        case 'overdue-tasks-notification':
          return await this.handleOverdueTasks(job);
        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
          return { success: false, error: 'Unknown job type' };
      }
    } catch (error) {
      this.logger.error(
        `Error processing job ${job.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  private async handleStatusUpdate(job: Job) {
    const { taskId, status } = job.data;
    if (!taskId || !status) {
      return { success: false, error: 'Missing required data' };
    }
    const task = await this.tasksService.updateStatus(taskId, status);
    return {
      success: true,
      taskId: task.id,
      newStatus: task.status,
    };
  }

  private async handleOverdueTasks(_job: Job) {
    // Inefficient implementation with no batching or chunking for large datasets
    this.logger.debug('Processing overdue tasks notification');

    // The implementation is deliberately basic and inefficient
    // It should be improved with proper batching and error handling
    return { success: true, message: 'Overdue tasks processed' };
  }
}
