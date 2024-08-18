import { Worker } from "bullmq";
import { redisOptions } from "../config/redis";
import logger from "../utils/logger";
import { sendMail } from "../services/email.service";

logger.info("Email worker script is starting...");
logger.info(`Redis configuration: ${JSON.stringify(redisOptions)}`);

const worker = new Worker(
  "email",
  async (job) => {
    logger.info(`Starting to process job ${job.id}`);
    logger.info(`Job data: ${JSON.stringify(job.data)}`);
    const { to, subject, body } = job.data;
    try {
      await sendMail(to, subject, body);
      logger.info(`Email sent successfully for job ${job.id}`);
    } catch (error) {
      logger.error(`Error sending email for job ${job.id}: ${error}`);
      throw error;
    }
  },
  {
    connection: redisOptions,
    concurrency: 5,
  }
);

worker.on("ready", () => {
  logger.info("Worker is ready and listening for jobs");
});

worker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, error) => {
  logger.error(`Job ${job?.id} failed with error: ${error.message}`);
});

worker.on("error", (error) => {
  logger.error(`Worker error: ${error.message}`);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing worker...");
  await worker.close();
});

logger.info("Email worker setup complete, waiting for jobs...");
