import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { calculate4WScore } from '../lib/score4w';

const router = Router();

// GET /api/versions/:id/score
router.get('/:id/score', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid version ID' });
      return;
    }
    const result = await calculate4WScore(id);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('not found')) {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/versions/:modelId/:year
router.get('/:modelId/:year', async (req: Request, res: Response) => {
  try {
    const modelId = parseInt(req.params.modelId);
    const year = parseInt(req.params.year);

    const versions = await prisma.version.findMany({
      where: { modelId, year },
      select: { id: true, name: true, year: true },
      orderBy: { name: 'asc' },
    });

    res.json(versions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
