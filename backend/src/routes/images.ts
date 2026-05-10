import { Router, Request, Response } from 'express';

const router = Router();

const cache = new Map<string, string | null>();

async function fetchWikimediaImage(make: string, model: string, year: number): Promise<string | null> {
  const query = `${make} ${model} ${year} car`;
  const searchUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
    `&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;

  const searchRes = await fetch(searchUrl, {
    headers: { 'User-Agent': '4wheelscompare/1.0 (jorgeferaa@gmail.com)' },
  });
  if (!searchRes.ok) return null;

  const searchData = await searchRes.json() as {
    query?: { search?: Array<{ title: string }> };
  };

  const hits = searchData.query?.search ?? [];
  if (hits.length === 0) return null;

  // Try each hit until we get a valid image URL
  for (const hit of hits) {
    const title = hit.title;
    const infoUrl =
      `https://commons.wikimedia.org/w/api.php?action=query` +
      `&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;

    const infoRes = await fetch(infoUrl, {
      headers: { 'User-Agent': '4wheelscompare/1.0 (jorgeferaa@gmail.com)' },
    });
    if (!infoRes.ok) continue;

    const infoData = await infoRes.json() as {
      query?: { pages?: Record<string, { imageinfo?: Array<{ url: string }> }> };
    };

    const pages = infoData.query?.pages ?? {};
    for (const page of Object.values(pages)) {
      const url = page.imageinfo?.[0]?.url;
      if (url) return url;
    }
  }

  return null;
}

// GET /api/images?make=Toyota&model=Corolla&year=2023
router.get('/', async (req: Request, res: Response) => {
  try {
    const { make, model, year } = req.query as { make?: string; model?: string; year?: string };

    if (!make || !model || !year) {
      res.status(400).json({ error: 'make, model and year are required' });
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
      res.status(400).json({ error: 'year must be a number' });
      return;
    }

    const key = `${make.toLowerCase()}|${model.toLowerCase()}|${yearNum}`;

    if (cache.has(key)) {
      const cached = cache.get(key);
      res.json({ imageUrl: cached ?? null });
      return;
    }

    const imageUrl = await fetchWikimediaImage(make, model, yearNum);
    cache.set(key, imageUrl);
    res.json({ imageUrl: imageUrl ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
