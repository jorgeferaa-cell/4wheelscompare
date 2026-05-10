import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/makes?market=BR|US
router.get('/', async (req: Request, res: Response) => {
  try {
    const { market } = req.query;

    const makes = await prisma.make.findMany({
      where: market
        ? {
            models: {
              some: {
                versions: {
                  some: { market: { in: [market as string, 'BOTH'] } },
                },
              },
            },
          }
        : undefined,
      orderBy: { name: 'asc' },
    });

    res.json(makes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
