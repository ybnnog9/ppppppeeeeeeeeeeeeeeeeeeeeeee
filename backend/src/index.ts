import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createServer } from 'http';
import { router } from './routes.js';
import { initQueueWorkers } from './queue/worker.js';
import { logger } from './utils/logger.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.use('/api', router);

const port = Number(process.env.PORT ?? 4000);
const server = createServer(app);

server.listen(port, () => {
  logger.info(`AutoAgenda API running on port ${port}`);
});

initQueueWorkers();
