import { Router, Request, Response } from 'express';

const router = Router();

const FIPE_BASE = 'https://parallelum.com.br/fipe/api/v1';
const UA = { 'User-Agent': '4wheelscompare/1.0 (jorgeferaa@gmail.com)' };

interface FipeResult {
  fipeCode:    string;
  price:       string;
  priceNumber: number;
  reference:   string;
  fuel:        string;
  found:       true;
}

const cache = new Map<string, FipeResult | { found: false }>();

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function partialMatch(text: string, query: string): boolean {
  return normalize(text).includes(normalize(query));
}

function parsePrice(valor: string): number {
  // "R$ 89.990,00" → 89990
  return parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

async function fipeGet<T>(path: string): Promise<T> {
  const res = await fetch(`${FIPE_BASE}${path}`, { headers: UA });
  if (!res.ok) throw new Error(`FIPE ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// GET /api/fipe?make=Toyota&model=Corolla&year=2023
router.get('/', async (req: Request, res: Response) => {
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

  const key = `${make.toLowerCase()}-${model.toLowerCase()}-${yearNum}`;
  if (cache.has(key)) {
    res.json(cache.get(key));
    return;
  }

  try {
    // 1. Find brand
    const brands = await fipeGet<Array<{ codigo: string; nome: string }>>('/carros/marcas');
    const brand = brands.find(b => partialMatch(b.nome, make));
    if (!brand) {
      cache.set(key, { found: false });
      res.json({ found: false });
      return;
    }

    // 2. Find model
    const { modelos } = await fipeGet<{ modelos: Array<{ codigo: number; nome: string }> }>(
      `/carros/marcas/${brand.codigo}/modelos`
    );
    const fipeModel = modelos.find(m => partialMatch(m.nome, model));
    if (!fipeModel) {
      cache.set(key, { found: false });
      res.json({ found: false });
      return;
    }

    // 3. Find year entry
    const anos = await fipeGet<Array<{ codigo: string; nome: string }>>(
      `/carros/marcas/${brand.codigo}/modelos/${fipeModel.codigo}/anos`
    );
    const anoEntry = anos.find(a => a.nome.includes(String(yearNum)));
    if (!anoEntry) {
      cache.set(key, { found: false });
      res.json({ found: false });
      return;
    }

    // 4. Fetch price
    const data = await fipeGet<{
      Valor:         string;
      CodigoFipe:    string;
      MesReferencia: string;
      Combustivel:   string;
    }>(`/carros/marcas/${brand.codigo}/modelos/${fipeModel.codigo}/anos/${anoEntry.codigo}`);

    const result: FipeResult = {
      fipeCode:    data.CodigoFipe,
      price:       data.Valor,
      priceNumber: parsePrice(data.Valor),
      reference:   data.MesReferencia,
      fuel:        data.Combustivel,
      found:       true,
    };

    cache.set(key, result);
    res.json(result);
  } catch (err) {
    console.error('[fipe]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
