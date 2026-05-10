"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const cache = new Map();
const EXCLUDE_KEYWORDS = [
    'interior', 'wheel', 'engine', 'badge', 'emblem', 'logo',
    'detail', 'trunk', 'dashboard', 'steering', 'seat', 'door',
    'light', 'headlight', 'taillight', 'grille', 'tire', 'rim',
    'police', 'taxi', 'crash', 'accident', 'wrecked',
];
function isBadTitle(title) {
    const lower = title.toLowerCase();
    return EXCLUDE_KEYWORDS.some(kw => lower.includes(kw));
}
async function fetchWikimediaImage(make, model, year) {
    // Year confuses Wikimedia (matches photo dates, not model years) — omit it.
    // Negations in srsearch are unreliable; title filtering below handles exclusions.
    const query = `${make} ${model} car`;
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
        `&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=20&format=json`;
    const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': '4wheelscompare/1.0 (jorgeferaa@gmail.com)' },
    });
    if (!searchRes.ok)
        return null;
    const searchData = await searchRes.json();
    const hits = (searchData.query?.search ?? []).filter(h => !isBadTitle(h.title));
    if (hits.length === 0)
        return null;
    // Resolve up to the first 5 clean hits in parallel, return first URL found
    const candidates = hits.slice(0, 5);
    const titleList = candidates.map(h => h.title).join('|');
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query` +
        `&titles=${encodeURIComponent(titleList)}&prop=imageinfo&iiprop=url&format=json`;
    const infoRes = await fetch(infoUrl, {
        headers: { 'User-Agent': '4wheelscompare/1.0 (jorgeferaa@gmail.com)' },
    });
    if (!infoRes.ok)
        return null;
    const infoData = await infoRes.json();
    const pages = infoData.query?.pages ?? {};
    // Return the first URL that comes from a non-bad title
    for (const title of candidates.map(h => h.title)) {
        const page = Object.values(pages).find(p => p.title === title);
        const url = page?.imageinfo?.[0]?.url;
        if (url)
            return url;
    }
    return null;
}
// GET /api/images?make=Toyota&model=Corolla&year=2023
router.get('/', async (req, res) => {
    try {
        const { make, model, year } = req.query;
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
