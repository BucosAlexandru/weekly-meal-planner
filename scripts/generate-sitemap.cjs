const fs = require('fs');
const BASE = 'https://meal-planner.ro';
const langs = ['ro','en','es','fr','de','pt','ru','ar','zh','ja','hi']; // ajustează lista ta

const urls = [
  `${BASE}/`,
  ...langs.map(l => `${BASE}/${l}/`),
];

const today = new Date().toISOString().slice(0,10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>`;

fs.writeFileSync('public/sitemap.xml', xml);
console.log('✅ sitemap.xml scris în public/sitemap.xml');
