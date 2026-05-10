import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/search?q=civic&market=BR
router.get('/', async (req: Request, res: Response) => {
  try {
    const q      = String(req.query.q ?? '').trim();
    const market = req.query.market as string | undefined;
    const year   = req.query.year ? parseInt(req.query.year as string) : undefined;

    if (q.length < 2) return res.json([]);

    const marketFilter = market ? { market: { in: [market, 'BOTH'] } } : {};
    const yearFilter   = year && !isNaN(year) ? { year } : {};

    const versions = await prisma.version.findMany({
      where: {
        AND: [
          marketFilter,
          yearFilter,
          {
            OR: [
              { model: { make: { name: { contains: q } } } },
              { model: { name: { contains: q } } },
              { name: { contains: q } },
            ],
          },
        ],
      },
      select: {
        id:       true,
        name:     true,
        year:     true,
        price_br: true,
        price_us: true,
        category: true,
        fuel_type: true,
        model: {
          select: {
            name: true,
            make: { select: { name: true } },
          },
        },
      },
      orderBy: [{ year: 'desc' }, { model: { name: 'asc' } }],
      take: 12,
    });

    res.json(
      versions.map(v => ({
        id:       v.id,
        make:     v.model.make.name,
        model:    v.model.name,
        version:  v.name,
        year:     v.year,
        price_br: v.price_br,
        price_us: v.price_us,
        category: v.category,
        fuel_type: v.fuel_type,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
