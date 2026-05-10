import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/models/:makeId
router.get('/:makeId', async (req: Request, res: Response) => {
  try {
    const makeId = parseInt(req.params.makeId);

    const models = await prisma.model.findMany({
      where: { makeId },
      orderBy: { name: 'asc' },
    });

    res.json(models);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
