"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const cache = new Map();
const OLD_YEARS = [
    '1960', '1961', '1962', '1963', '1964', '1965', '1966', '1967', '1968', '1969',
    '1970', '1971', '1972', '1973', '1974', '1975', '1976', '1977', '1978', '1979',
    '1980', '1981', '1982', '1983', '1984', '1985', '1986', '1987', '1988', '1989',
    '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999',
];
const ALWAYS_EXCLUDE = [
    ...OLD_YEARS,
    'old', 'classic', 'vintage', 'retro', 'historic',
    'rally', 'race', 'drift', 'tuned', 'modified', 'custom',
    'engine', 'wheel', 'tire', 'rim',
    'badge', 'logo', 'emblem', 'icon', 'chart', 'diagram', 'map',
    'police', 'taxi', 'crash', 'accident', 'wrecked',
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
function isBadTitle(title, keywords) {
    const lower = title.toLowerCase();
    if (!IMAGE_EXTENSIONS.test(lower))
        return true;
    return keywords.some(kw => lower.includes(kw));
}
async function searchQuery(query, badKeywords) {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search` +
        `&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=30&format=json`;
    const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': '4wheelscompare/1.0 (jorgeferaa@gmail.com)' },
    });
    if (!searchRes.ok)
        return null;
    const searchData = await searchRes.json();
    const hits = (searchData.query?.search ?? []).filter(h => !isBadTitle(h.title, badKeywords));
    if (hits.length === 0)
        return null;
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
    for (const title of candidates.map(h => h.title)) {
        const page = Object.values(pages).find(p => p.title === title);
        const url = page?.imageinfo?.[0]?.url;
        if (url)
            return url;
    }
    return null;
}
async function fetchForAngle(queries, badKeywords) {
    for (const query of queries) {
        const url = await searchQuery(query, badKeywords);
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
        const key = `${make.toLowerCase()}-${model.toLowerCase()}-${yearNum}-gallery`;
        if (cache.has(key)) {
            const gallery = cache.get(key);
            res.json({ ...gallery, imageUrl: gallery.front });
            return;
        }
        const angles = [
            { queries: [`${make} ${model} ${yearNum} front exterior`, `${make} ${model} front`], excludes: EXTERIOR_EXCLUDE },
            { queries: [`${make} ${model} ${yearNum} side profile`, `${make} ${model} side`], excludes: EXTERIOR_EXCLUDE },
            { queries: [`${make} ${model} ${yearNum} rear back`, `${make} ${model} rear`], excludes: EXTERIOR_EXCLUDE },
            { queries: [`${make} ${model} ${yearNum} interior dashboard`, `${make} ${model} interior inside`], excludes: INTERIOR_EXCLUDE },
        ];
        const [front, side, rear, interior] = await Promise.all(angles.map(a => fetchForAngle(a.queries, a.excludes)));
        const gallery = { front, side, rear, interior };
        cache.set(key, gallery);
        res.json({ ...gallery, imageUrl: front });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
