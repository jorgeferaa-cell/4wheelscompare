import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/version/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const version = await prisma.version.findUnique({
      where: { id },
      include: { model: { include: { make: true } } },
    });

    if (!version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    res.json(version);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
