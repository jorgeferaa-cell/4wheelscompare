import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import makesRouter from './routes/makes';
import modelsRouter from './routes/models';
import yearsRouter from './routes/years';
import versionsRouter from './routes/versions';
import versionRouter from './routes/version';
import compareRouter from './routes/compare';
import searchRouter from './routes/search';
import imagesRouter from './routes/images';

dotenv.config();

const app = express();

app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://4wheelscompare.com',
    'https://www.4wheelscompare.com',
  ],
  optionsSuccessStatus: 200,
}));

app.use(express.json());

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const imagesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many image requests, please try again later.' },
});

app.use(generalLimiter);

const startTime = Date.now();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: Math.floor((Date.now() - startTime) / 1000) });
});

app.use('/api/makes', makesRouter);
app.use('/api/models', modelsRouter);
app.use('/api/years', yearsRouter);
app.use('/api/versions', versionsRouter);
app.use('/api/version', versionRouter);
app.use('/api/compare', compareRouter);
app.use('/api/search',  searchRouter);
app.use('/api/images',  imagesLimiter, imagesRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`4wheelscompare API → http://localhost:${PORT}`);
});

export default app;
