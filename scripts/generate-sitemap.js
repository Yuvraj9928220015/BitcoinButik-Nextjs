const fs = require("fs");

async function generateSitemap() {
  const res = await fetch("https://api.bitcoinbutik.com/api/products");
  const products = await res.json();

  const urls = products
    .filter(p => p.slug)
    .map(p => {
      const category = (p.category || "").toLowerCase().replace(/\s+/g, "-");

      return `
  <url>
    <loc>https://www.bitcoinbutik.com/collections/${category}/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt || p.createdAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://www.bitcoinbutik.com/</loc>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://www.bitcoinbutik.com/collections/rings</loc>
  </url>

  <url>
    <loc>https://www.bitcoinbutik.com/collections/pendants</loc>
  </url>

  <url>
    <loc>https://www.bitcoinbutik.com/about</loc>
  </url>

  <url>
    <loc>https://www.bitcoinbutik.com/contact</loc>
  </url>

  ${urls.join("\n")}

</urlset>`;

  fs.writeFileSync("public/sitemap.xml", xml);
  console.log("✅ Sitemap generated successfully!");
}

generateSitemap();