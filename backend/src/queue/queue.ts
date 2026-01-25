import { Queue } from 'bullmq';

export const reminderQueue = new Queue('reminders', {
  connection: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379)
  }
});
