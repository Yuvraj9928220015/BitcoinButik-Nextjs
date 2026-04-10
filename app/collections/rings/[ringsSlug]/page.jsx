// app/collections/rings/[ringsSlug]/page.jsx

import RingsDetailClient from './RingsDetailClient';

const API_URL  = "https://api.bitcoinbutik.com";
const SITE_URL = "https://www.bitcoinbutik.com";

export const dynamicParams = false;

const isRing = (category = "") => {
  const cat = category.toLowerCase().trim();
  return cat === "ring" || cat === "rings";
};

const formatImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}/${path.replace(/^\//, '').replace(/\\/g, '/')}`;
};

// ─── generateStaticParams ────────────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/products?category=Rings`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const products = await res.json();

    const seenSlugs = new Set();
    return products
      .filter((p) => p.slug && isRing(p.category))
      .filter((p) => {
        if (seenSlugs.has(p.slug)) return false;
        seenSlugs.add(p.slug);
        return true;
      })
      .map((p) => ({ ringsSlug: p.slug }));
  } catch {
    return [];
  }
}

// ─── generateMetadata ────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const { ringsSlug } = await params;
  try {
    const res = await fetch(`${API_URL}/api/products?category=Rings`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Fetch failed');

    const products = await res.json();
    const product  = products.find((p) => p.slug === ringsSlug && isRing(p.category));

    if (!product) {
      return { title: 'Ring Not Found | BitcoinButik', robots: { index: false } };
    }

    const title       = `${product.title} | Bitcoin Ring – BitcoinButik`;
    const description = product.description?.slice(0, 160) || `Buy ${product.title} at BitcoinButik.`;
    const firstImage  = formatImageUrl(Array.isArray(product.image) ? product.image[0] : product.image);

    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/collections/rings/${ringsSlug}` },
      openGraph: {
        title, description,
        url: `${SITE_URL}/collections/rings/${ringsSlug}`,
        siteName: 'BitcoinButik',
        images: firstImage ? [{ url: firstImage, width: 800, height: 800, alt: product.title }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title, description,
        images: firstImage ? [firstImage] : [],
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: 'Ring | BitcoinButik' };
  }
}

// ─── Page — SSR Static Content + JSON-LD ────────────────────────────────────
export default async function RingsDetailPage({ params }) {
  const { ringsSlug } = await params;

  let initialProduct = null;

  try {
    const res = await fetch(`${API_URL}/api/products?category=Rings`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const products = await res.json();
      initialProduct = products.find((p) => p.slug === ringsSlug && isRing(p.category)) || null;
    }
  } catch (e) {
    console.error('RingsDetailPage fetch error:', e);
  }

  if (!initialProduct) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Product not found.</div>;
  }

  // ✅ Images format karo server pe
  const images = (Array.isArray(initialProduct.image) ? initialProduct.image : [])
    .map(formatImageUrl)
    .filter(Boolean);

  const firstImage   = images[0] || null;
  const hasSilver    = initialProduct.price > 0;
  const hasGold      = initialProduct.goldPrice > 0;
  const minPrice     = Math.min(
    hasSilver ? initialProduct.price : Infinity,
    hasGold   ? initialProduct.goldPrice : Infinity
  );
  const maxPrice = Math.max(
    hasSilver ? initialProduct.price : 0,
    hasGold   ? initialProduct.goldPrice : 0
  );

  // ✅ JSON-LD — Google Rich Results ke liye
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: initialProduct.title,
    description: initialProduct.description,
    image: images,
    sku: initialProduct._id,
    brand: { "@type": "Brand", name: "BitcoinButik" },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: minPrice,
      highPrice: maxPrice,
      priceCurrency: "USD",
      offerCount: 2,
      availability: initialProduct.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/collections/rings/${ringsSlug}`,
    },
  };

  return (
    <>
      {/* ✅ JSON-LD — Google is HTML me directly dekhta hai */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ✅ YE SARA CONTENT SERVER PE RENDER HOGA — Google crawl karega */}
      <div style={{ display: 'none' }} aria-hidden="true">
        {/* Hidden SSR content — Google ke liye visible, user ko nahi dikhega */}
        <h1>{initialProduct.title}</h1>
        <p>{initialProduct.description}</p>
        {firstImage && (
          <img
            src={firstImage}
            alt={initialProduct.title}
            width={800}
            height={800}
          />
        )}
        <span>
          {hasSilver && hasGold
            ? `$${minPrice.toFixed(2)} – $${maxPrice.toFixed(2)}`
            : `$${maxPrice.toFixed(2)}`}
        </span>
        <span>
          {initialProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </span>
        <span>Category: Rings</span>
        <span>Material: Gold Vermeil / 92.5 Sterling Silver</span>
      </div>

      {/* ✅ Client Component — Sirf interactivity ke liye */}
      <RingsDetailClient
        ringsSlug={ringsSlug}
        initialProduct={initialProduct}
      />
    </>
  );
}