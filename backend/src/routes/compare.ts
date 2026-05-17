import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { simulate, simulateTrip } from '../simulation/physics';
import { calculate4WScore } from '../lib/score4w';

const router = Router();

// GET /api/compare?ids=1,2,3,4
router.get('/', async (req: Request, res: Response) => {
  try {
    // ids may arrive as "1,2,3" (single param) or ["1","2","3"] (repeated params)
    const raw = req.query.ids;
    const idsParam: string = Array.isArray(raw)
      ? (raw as string[]).join(',')
      : typeof raw === 'string' ? raw : '';

    if (!idsParam) {
      return res.status(400).json({ error: 'ids parameter required' });
    }

    const ids = idsParam
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

    if (ids.length < 1 || ids.length > 4) {
      return res.status(400).json({ error: 'Provide 1–4 version ids' });
    }

    const versions = await prisma.version.findMany({
      where: { id: { in: ids } },
      include: { model: { include: { make: true } } },
    });

    // Preserve requested order
    const ordered = ids
      .map((id) => versions.find((v) => v.id === id))
      .filter(Boolean) as typeof versions;

    const scores = await Promise.all(ordered.map((v) => calculate4WScore(v.id)));

    const results = ordered.map((v, i) => {
      const spec = {
        horsepower: v.horsepower,
        torque_nm: v.torque_nm,
        weight_kg: v.weight_kg,
        top_speed_kmh: v.top_speed_kmh,
        eq_awd: v.eq_awd,
        eq_launch_control: v.eq_launch_control,
        fuel_consumption: v.fuel_consumption,
        tank_liters: v.tank_liters,
      };

      return {
        ...v,
        score4w: scores[i],
        simulation: {
          sprint_201m:  simulate(spec, 201),
          sprint_400m:  simulate(spec, 400),
          sprint_800m:  simulate(spec, 800),
          sprint_1000m: simulate(spec, 1000),
          trip_500km:   simulateTrip(spec, 500),
          trip_1000km:  simulateTrip(spec, 1000),
        },
      };
    });

    res.json(results);
  } catch (err) {
    console.error('[compare] Error:', err instanceof Error ? err.stack : err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
