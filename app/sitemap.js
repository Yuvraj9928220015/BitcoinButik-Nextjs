// app/sitemap.js — BitcoinButik COMPLETE FIX
// ✅ FIX 1: Saari categories handle — rings, earrings, bracelets, pendants (mens/womens)
// ✅ FIX 2: Duplicate slugs deduplicate karo — warna sirf 1 page banta hai
// ✅ FIX 3: Category names normalize karo (case-insensitive)

export const dynamic = "force-static";

const API_URL  = "https://api.bitcoinbutik.com";
const SITE_URL = "https://www.bitcoinbutik.com";

// ─── Category → Route mapping ─────────────────────────────────────────────────
// JSON mein jo bhi category spelling hai, sab yahan handle hogi
const getCategoryRoute = (category = "") => {
  const cat = category.toLowerCase().trim();

  // Rings
  if (cat === "ring" || cat === "rings") {
    return "/collections/rings";
  }

  // Earrings
  if (cat === "earring" || cat === "earrings") {
    return "/collections/earrings";
  }

  // Bracelets
  if (cat === "bracelet" || cat === "bracelets") {
    return "/collections/bracelets";
  }

  // Pendants — Men
  if (
    cat === "man pendant" ||
    cat === "man pendants" ||
    cat === "man" ||
    cat === "mens pendant" ||
    cat === "mens pendants"
  ) {
    return "/collections/pendants/pendant-mens";
  }

  // Pendants — Women
  if (
    cat === "woman pendant" ||
    cat === "woman pendants" ||
    cat === "women pendant" ||
    cat === "women pendants" ||
    cat === "women"
  ) {
    return "/collections/pendants/pendant-women";
  }

  // General Pendant (unisex)
  if (cat === "pendant" || cat === "pendants") {
    return "/collections/pendants";
  }

  // Unknown category — skip karo
  return null;
};

export default async function sitemap() {
  let productEntries = [];

  try {
    const res = await fetch(`${API_URL}/api/products`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    // ─── STEP 1: Duplicate slugs deduplicate karo ─────────────────────────────
    // Problem: Same slug ke multiple products hain (e.g. "genesis-block-pendant" x3)
    // Fix: Har unique slug ka sirf PEHLA product lo
    // Yeh zaroori hai kyunki generateStaticParams bhi sirf ek page banata hai per slug
    const seenSlugs = new Set();

    const uniqueProducts = products.filter((p) => {
      if (!p.slug) return false; // slug nahi hai to skip
      if (seenSlugs.has(p.slug)) return false; // duplicate to skip
      seenSlugs.add(p.slug);
      return true;
    });

    // ─── STEP 2: Har product ke liye correct URL banao ────────────────────────
    productEntries = uniqueProducts
      .map((p) => {
        const route = getCategoryRoute(p.category);

        if (!route) {
          // Unknown category — sitemap mein mat daalo
          console.warn(`[Sitemap] Unknown category: "${p.category}" for "${p.title}"`);
          return null;
        }

        return {
          url:             `${SITE_URL}${route}/${p.slug}`,
          lastModified:    new Date(p.updatedAt || p.createdAt || Date.now()),
          changeFrequency: "weekly",
          priority:        0.8,
        };
      })
      .filter(Boolean); // null entries remove karo

  } catch (e) {
    console.error("Sitemap product fetch error:", e);
  }

  // ─── Static Pages ──────────────────────────────────────────────────────────
  const staticPages = [
    { url: `${SITE_URL}`,                                         changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/collections`,                             changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/collections/rings`,                       changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/collections/earrings`,                    changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/collections/bracelets`,                   changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/collections/pendants`,                    changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/collections/pendants/pendant-mens`,       changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/collections/pendants/pendant-women`,      changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/about`,                                   changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/blog`,                                    changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/bitcoin-jewellery-gifts`,                 changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/custom-bitcoin-jewellery`,                changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/new-arrival`,                             changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/faqs`,                                    changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`,                                 changeFrequency: "monthly", priority: 0.5 },
  ].map((p) => ({ ...p, lastModified: new Date() }));

  return [...staticPages, ...productEntries];
}