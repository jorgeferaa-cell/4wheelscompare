import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/years/:modelId
router.get('/:modelId', async (req: Request, res: Response) => {
  try {
    const modelId = parseInt(req.params.modelId);

    const rows = await prisma.version.findMany({
      where: { modelId },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });

    res.json(rows.map((r) => r.year));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
