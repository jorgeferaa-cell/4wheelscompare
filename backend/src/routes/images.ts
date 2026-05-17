import { Router, Request, Response } from 'express';

const router = Router();

interface Gallery {
  front:    string | null;
  side:     string | null;
  rear:     string | null;
  interior: string | null;
}

const cache = new Map<string, Gallery>();

// 1900-1989: always bad — no car in the DB predates 1990
const OLD_YEARS = Array.from({ length: 90 }, (_, i) => String(1900 + i));

const ALWAYS_EXCLUDE = [
  ...OLD_YEARS,
  'old', 'classic', 'vintage', 'retro', 'historic',
  'rally', 'race', 'drift', 'tuned', 'modified', 'custom',
  'engine', 'wheel', 'tire', 'rim',
  'badge', 'logo', 'emblem', 'icon', 'chart', 'diagram', 'map',
  'police', 'taxi', 'crash', 'accident', 'wrecked',
  'topolino', 'nuova', 'classico', 'storico', 'oldtimer', 'veteran', 'antique',
  'prototype', 'concept', 'autoshow', 'motorshow', 'salon', 'messe',
  '1940s', '1950s', '1960s', '1970s', '1980s', '1990s',
  'mk1', 'mk2', 'mk3', 'mk4', 'mk5', 'serie1', 'serie2',
  'museum', 'museu', 'collection', 'restoration',
];

const EXTERIOR_EXCLUDE = [
  ...ALWAYS_EXCLUDE,
  'interior', 'dashboard', 'seat', 'steering',
  'detail', 'trunk', 'door', 'light', 'headlight', 'taillight', 'grille',
];

const INTERIOR_EXCLUDE = [
  ...ALWAYS_EXCLUDE,
  'exterior', 'front', 'rear',
];

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|tiff?)$/i;

// Extracts 4-digit years in range 1900-2099 from a lowercased title string.
// Uses negative digit lookarounds instead of \b so years like "ene2015" are caught.
function extractYears(lower: string): number[] {
  const matches = [...lower.matchAll(/(?<!\d)(19\d{2}|20\d{2})(?!\d)/g)];
  return matches.map(m => parseInt(m[1]));
}

// Returns true if the title should be rejected
function isBadTitle(title: string, keywords: string[], requestedYear: number): boolean {
  const lower = title.toLowerCase();
  if (!IMAGE_EXTENSIONS.test(lower)) return true;
  // Dynamic check: 1990+ years that are more than 6 years behind requestedYear are rejected
  for (const y of extractYears(lower)) {
    if (y >= 1990 && requestedYear - y > 6) return true;
  }
  return keywords.some(kw => lower.includes(kw));
}

// Score a title by how close its embedded years are to requestedYear
function scoreTitle(title: string, requestedYear: number): number {
  const lower = title.toLowerCase();
  let score = 0;
  for (const y of extractYears(lower)) {
    if (y === requestedYear)                   score += 3;
    else if (Math.abs(y - requestedYear) === 1) score += 2;
    else if (y === requestedYear - 2)           score += 1;
    else if (y < requestedYear - 6)             score -= 2;
  }
  return score;
}

async function searchQuery(
  query: string,
  badKeywords: string[],
  requestedYear: number,
): Promise<string | null> {
  const searchUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
    `&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=30&format=json`;

  const searchRes = await fetch(searchUrl, {
    headers: { 'User-Agent': '4wheelscompare/1.0 (jorgeferaa@gmail.com)' },
  });
  if (!searchRes.ok) return null;

  const searchData = await searchRes.json() as {
    query?: { search?: Array<{ title: string }> };
  };

  const hits = (searchData.query?.search ?? [])
    .filter(h => !isBadTitle(h.title, badKeywords, requestedYear));
  if (hits.length === 0) return null;

  // Score, sort descending, keep best 5 for imageinfo lookup
  const candidates = hits
    .slice(0, 10)
    .map(h => ({ title: h.title, score: scoreTitle(h.title, requestedYear) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const titleList = candidates.map(c => c.title).join('|');
  const infoUrl =
    `https://commons.wikimedia.org/w/api.php?action=query` +
    `&titles=${encodeURIComponent(titleList)}&prop=imageinfo&iiprop=url&format=json`;

  const infoRes = await fetch(infoUrl, {
    headers: { 'User-Agent': '4wheelscompare/1.0 (jorgeferaa@gmail.com)' },
  });
  if (!infoRes.ok) return null;

  const infoData = await infoRes.json() as {
    query?: { pages?: Record<string, { title?: string; imageinfo?: Array<{ url: string }> }> };
  };

  const pages = infoData.query?.pages ?? {};
  // Return URL of the highest-scoring title that has a valid imageinfo
  for (const { title } of candidates) {
    const page = Object.values(pages).find(p => p.title === title);
    const url  = page?.imageinfo?.[0]?.url;
    if (url) return url;
  }
  return null;
}

async function fetchForAngle(
  queries: string[],
  badKeywords: string[],
  requestedYear: number,
): Promise<string | null> {
  for (const query of queries) {
    const url = await searchQuery(query, badKeywords, requestedYear);
    if (url) return url;
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

    const key = `${make.toLowerCase()}-${model.toLowerCase()}-${yearNum}-gallery`;

    if (cache.has(key)) {
      const gallery = cache.get(key)!;
      res.json({ ...gallery, imageUrl: gallery.front });
      return;
    }

    const angles = [
      {
        queries:  [`${yearNum} ${make} ${model} front`, `${make} ${model} ${yearNum}`],
        excludes: EXTERIOR_EXCLUDE,
      },
      {
        queries:  [`${yearNum} ${make} ${model} side`, `${make} ${model} ${yearNum} side`],
        excludes: EXTERIOR_EXCLUDE,
      },
      {
        queries:  [`${yearNum} ${make} ${model} rear`, `${make} ${model} ${yearNum} rear`],
        excludes: EXTERIOR_EXCLUDE,
      },
      {
        queries:  [`${yearNum} ${make} ${model} interior`, `${make} ${model} ${yearNum} interior`],
        excludes: INTERIOR_EXCLUDE,
      },
    ];

    const [front, side, rear, interior] = await Promise.all(
      angles.map(a => fetchForAngle(a.queries, a.excludes, yearNum))
    );

    const gallery: Gallery = { front, side, rear, interior };
    cache.set(key, gallery);
    res.json({ ...gallery, imageUrl: front });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
