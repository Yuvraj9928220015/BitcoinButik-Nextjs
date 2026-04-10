// ✅ SERVER COMPONENT (REMOVE "use client")

import Link from 'next/link';
import "./rings.css";

const API_URL = "https://api.bitcoinbutik.com";
const MEDIA_URL = "https://api.bitcoinbutik.com";

export const metadata = {
  title: "Rings Collection",
  alternates: {
    canonical: "/collections/rings",
  },
};

// ─── Helper ─────────────────────────────────────
const formatMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${MEDIA_URL}/${path.replace(/^\//, '').replace(/\\/g, '/')}`;
};

// ─── SERVER FETCH ───────────────────────────────
async function getProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products?category=Rings`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    return await response.json();
  } catch {
    return [];
  }
}

// ─── MAIN PAGE ─────────────────────────────────
export default async function RingsPage() {
  const products = await getProducts();

  const formattedProducts = products.map((p) => ({
    id: p._id,
    name: p.title,
    slug: p.slug, // ✅ IMPORTANT FIX
    price: p.price,
    goldPrice: p.goldPrice,
    images: (p.image || []).map(formatMediaUrl).filter(Boolean),
    video: formatMediaUrl(p.video),
    material: p.category,
    tagText: p.tagText || null,
    description: p.description,
    type: p.type,
    stock: p.stock,
  }));

  const heroProduct1 = formattedProducts.find(
    (p) => p.slug === 'bitcoin-pure-silver-ring' // ✅ FIX
  );

  const grid1Products = formattedProducts.slice(0, 4);
  const niche1Products = formattedProducts.slice(4, 8);
  const nicheNewProducts = formattedProducts.slice(8, 12);
  const loadMoreProducts = formattedProducts.slice(20, 32);

  return (
    <div className="bzero-page-container">
      <div className="bzero-main-content">

        <header className="bzero-header">
          <div className="bzero-header-left">
            <span className="breadcrumb">
              <Link href="/">Home</Link> / <Link href="/collections">Jewelry</Link> / Rings
            </span>
            <h1 className="bzero-title">
              Rings <sup>{formattedProducts.length}</sup>
            </h1>
          </div>
        </header>

        {/* ─── GRID ─── */}
        <main className="product-grid-wrapper">
          <div className="product-grid">

            <div className="product-grid-left">
              {grid1Products.map((product) => (
                <Link
                  key={product.id}
                  href={`/collections/rings/${product.slug}`} // ✅ FIXED
                  className="product-card-link"
                >
                  <div className="product-card">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="product-image"
                    />

                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <div className="product-price-container">
                        {product.goldPrice ? (
                          <p className="product-price-range">
                            ${product.price?.toFixed(2)} – ${product.goldPrice?.toFixed(2)}
                          </p>
                        ) : (
                          <p className="product-price">${product.price?.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* HERO */}
            <div className="product-grid-right">
              <div className="hero-image-container">
                {heroProduct1 ? (
                  <Link href={`/collections/rings/${heroProduct1.slug}`}>
                    <img
                      src="/DSC02974.webp"
                      alt="Model wearing Rings"
                      style={{ cursor: 'pointer', width: '100%' }}
                    />
                  </Link>
                ) : (
                  <img src="/DSC02974.webp" alt="Model wearing Rings" style={{ width: '100%' }} />
                )}
              </div>
            </div>

          </div>
        </main>

        {/* ─── SECTION 1 ─── */}
        <section className="niche-section-wrapper">
          <div className="niche-grid">
            {niche1Products.map((product) => (
              <Link
                key={product.id}
                href={`/collections/rings/${product.slug}`}
                className="product-card-link"
              >
                <div className="product-card">
                  <img src={product.images[0]} alt={product.name} />
                  <h3>{product.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── SECTION 2 ─── */}
        <section className="niche-section-wrapper">
          <div className="niche-grid">
            {nicheNewProducts.map((product) => (
              <Link
                key={product.id}
                href={`/collections/rings/${product.slug}`}
                className="product-card-link"
              >
                <div className="product-card">
                  <img src={product.images[0]} alt={product.name} />
                  <h3>{product.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}