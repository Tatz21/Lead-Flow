import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { LeadCleaner } from './LeadCleaner.ts';
import { EmailFinder } from './EmailFinder.ts';
import { MailGenerator } from './MailGenerator.ts';
import { MailSender } from './MailSender.ts';

const redisUrl = process.env.REDIS_URL;
const connection = redisUrl ? new IORedis(redisUrl) : undefined;

export const outreachQueue = connection ? new Queue('outreach', { connection }) : null;

if (connection) {
  const cleaner = new LeadCleaner();
  const finder = new EmailFinder();
  const generator = new MailGenerator();
  const sender = new MailSender();

  new Worker('outreach', async (job: Job) => {
    const { type, data } = job.data;
    console.log(`Processing job ${job.id} of type ${type}`);

    switch (type) {
      case 'CLEAN_LEADS':
        return await cleaner.clean(data.csvData);
      case 'FIND_EMAIL':
        return await finder.find(data.website);
      case 'GENERATE_MAIL':
        return await generator.generate(data.lead, data.campaign);
      case 'SEND_MAIL':
        // Rate limiting: 1 email per minute
        await new Promise(resolve => setTimeout(resolve, 60000));
        return await sender.send(data.email, data.subject, data.body);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }, { connection });
}
