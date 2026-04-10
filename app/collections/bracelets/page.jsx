// app/collections/bracelets/page.jsx
// ✅ SERVER COMPONENT — NO 'use client', NO split needed

import Link from 'next/link';
import "./bracelets.css";

const API_URL = "https://api.bitcoinbutik.com";
const MEDIA_URL = "https://api.bitcoinbutik.com";
const SITE_URL = "https://www.bitcoinbutik.com";

// ─── SEO Metadata + Canonical ───────────────────
export const metadata = {
    title: "Luxury Bracelets for Women | BitcoinButik",
    description:
        "Explore luxury bracelets for women and men at BitcoinButik. Shop designer, elegant and premium bracelets crafted for timeless style.",
    alternates: {
        canonical: `${SITE_URL}/collections/bracelets`,
    },
    openGraph: {
        title: "Luxury Bracelets for Women | BitcoinButik",
        description:
            "Explore luxury bracelets for women and men at BitcoinButik. Shop designer, elegant and premium bracelets crafted for timeless style.",
        url: `${SITE_URL}/collections/bracelets`,
        siteName: "BitcoinButik",
        images: [
            {
                url: `${SITE_URL}/DSC02926.webp`,
                width: 800,
                height: 800,
                alt: "Luxury Bracelets at BitcoinButik",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Luxury Bracelets for Women | BitcoinButik",
        description:
            "Explore luxury bracelets for women and men at BitcoinButik. Shop designer, elegant and premium bracelets crafted for timeless style.",
        images: [`${SITE_URL}/DSC02926.webp`],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
    },
};

// ─── Helper ─────────────────────────────────────
const formatMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${MEDIA_URL}/${path.replace(/^\//, '').replace(/\\/g, '/')}`;
};

// ─── Server Fetch ────────────────────────────────
async function getProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products?category=Bracelets`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

// ─── Main Page ───────────────────────────────────
export default async function BraceletsPage() {
    const products = await getProducts();

    const formattedProducts = products.map((p) => ({
        id: p._id,
        name: p.title,
        slug: p.slug,
        price: p.price,
        goldPrice: p.goldPrice,
        images: (p.image || []).map(formatMediaUrl).filter(Boolean),
        video: formatMediaUrl(p.video),
        material: p.category,
        tagText: p.tagText || null,
        description: p.description,
        type: p.type,
        stock: p.stock,
        grams: p.grams,
        hasSize: p.hasSize !== false,
        hasType: p.hasType !== false,
        sizes: p.sizes || [],
    }));

    // Hero product
    const heroProduct1 = formattedProducts.find(
        (p) => p.slug === 'bitcoin-eternal-spark-bracelet'
    );

    // Sections
    const grid1Products = formattedProducts.slice(0, 4);
    const niche1Products = formattedProducts.slice(4, 8);
    const nicheNewProducts = formattedProducts.slice(8, 12);
    const niche2Products = formattedProducts.slice(16, 20);

    return (
        <div className="bzero-page-container">
            <div className="bzero-main-content">

                {/* ─── Header ─── */}
                <header className="bzero-header">
                    <div className="bzero-header-left">
                        <span className="breadcrumb">
                            <Link href="/">Home</Link> / <Link href="/collections">Jewelry</Link> / Bracelets
                        </span>
                        <h1 className="bzero-title">
                            Bracelets <sup>{formattedProducts.length}</sup>
                        </h1>
                    </div>
                </header>

                {/* ─── Main Grid — 4 Products + Hero Image ─── */}
                <main className="product-grid-wrapper">
                    <div className="product-grid">

                        <div className="product-grid-left">
                            {grid1Products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/collections/bracelets/${product.slug}`}
                                    className="product-card-link"
                                >
                                    <div className="product-card">
                                        {product.images[0] && (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="product-image"
                                            />
                                        )}
                                        {product.tagText && (
                                            <span className="product-tag">{product.tagText}</span>
                                        )}
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

                        {/* Hero Image */}
                        <div className="product-grid-right">
                            <div className="hero-image-container">
                                {heroProduct1 ? (
                                    <Link href={`/collections/bracelets/${heroProduct1.slug}`}>
                                        <img
                                            src="/DSC02926.webp"
                                            alt="Model wearing Bracelets"
                                            style={{ cursor: 'pointer', width: '100%' }}
                                        />
                                    </Link>
                                ) : (
                                    <img
                                        src="/DSC02926.webp"
                                        alt="Model wearing Bracelets"
                                        style={{ width: '100%' }}
                                    />
                                )}
                            </div>
                        </div>

                    </div>
                </main>

                {/* ─── Niche Section 1 ─── */}
                <section className="niche-section-wrapper">
                    <div className="niche-grid">
                        {niche1Products.map((product) => (
                            <Link
                                key={`${product.id}-a`}
                                href={`/collections/bracelets/${product.slug}`}
                                className="product-card-link"
                            >
                                <div className="product-card">
                                    {product.images[0] && (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="product-image"
                                        />
                                    )}
                                    {product.tagText && (
                                        <span className="product-tag">{product.tagText}</span>
                                    )}
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
                </section>

                {/* ─── Niche Section — New Products ─── */}
                <section className="niche-section-wrapper">
                    <div className="niche-grid">
                        {nicheNewProducts.map((product) => (
                            <Link
                                key={`${product.id}-new`}
                                href={`/collections/bracelets/${product.slug}`}
                                className="product-card-link"
                            >
                                <div className="product-card">
                                    {product.images[0] && (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="product-image"
                                        />
                                    )}
                                    {product.tagText && (
                                        <span className="product-tag">{product.tagText}</span>
                                    )}
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
                </section>

                {/* ─── Niche Section 2 ─── */}
                <section className="niche-section-wrapper">
                    <div className="niche-grid">
                        {niche2Products.map((product) => (
                            <Link
                                key={`${product.id}-d`}
                                href={`/collections/bracelets/${product.slug}`}
                                className="product-card-link"
                            >
                                <div className="product-card">
                                    {product.images[0] && (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="product-image"
                                        />
                                    )}
                                    {product.tagText && (
                                        <span className="product-tag">{product.tagText}</span>
                                    )}
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
                </section>

            </div>
        </div>
    );
}