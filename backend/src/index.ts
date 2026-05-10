import express from 'express';
import cors from 'cors';
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

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/makes', makesRouter);
app.use('/api/models', modelsRouter);
app.use('/api/years', yearsRouter);
app.use('/api/versions', versionsRouter);
app.use('/api/version', versionRouter);
app.use('/api/compare', compareRouter);
app.use('/api/search',  searchRouter);
app.use('/api/images',  imagesRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`4wheelscompare API → http://localhost:${PORT}`);
});

export default app;
