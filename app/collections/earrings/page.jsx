'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import "./earrings.css"

// ─── URLs ───────────────────────────────────────────────────────
const API_URL = "https://api.bitcoinbutik.com";    
const MEDIA_URL = "https://api.bitcoinbutik.com";   

// ─── Utility ────────────────────────────────────────────────────
const createSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ─── Helper: Image URL banana ────────────────────────────────────
const formatMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${MEDIA_URL}/${path.replace(/^\//, '').replace(/\\/g, '/')}`;
};

// ─── ProductCard Component ────────────────────────────────────────
// NOTE: Rings page jaise SAME classes use ho rahi hain yahan
const ProductCard = ({ product, customHeight }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const intervalRef = useRef(null);

    const images = product.images || [];
    const productSlug = createSlug(product.name);

    const startSlideshow = useCallback(() => {
        clearInterval(intervalRef.current);
        if (images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % images.length);
            }, 1500);
        }
    }, [images]);

    useEffect(() => {
        if (isHovered && !product.video) {
            startSlideshow();
        } else {
            clearInterval(intervalRef.current);
            setCurrentImageIndex(0);
        }
        return () => clearInterval(intervalRef.current);
    }, [isHovered, startSlideshow, product.video]);

    const handleManualChange = (newIndex) => {
        setCurrentImageIndex(newIndex);
        if (isHovered && !product.video) startSlideshow();
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleManualChange((currentImageIndex - 1 + images.length) % images.length);
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleManualChange((currentImageIndex + 1) % images.length);
    };

    const handleDotClick = (index, e) => {
        e.stopPropagation();
        e.preventDefault();
        handleManualChange(index);
    };

    if (images.length === 0) {
        return (
            <div className="product-card" style={{ height: customHeight }}>
                <div className="product-info">
                    <p>No Image Available</p>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">${product.price?.toFixed(2)}</p>
                </div>
            </div>
        );
    }

    return (
        // ✅ rings.js jaise SAME: /collections/earrings/:slug
        <Link
            href={`/collections/earrings/${productSlug}`}
            className="product-card-link"
            style={customHeight ? { height: customHeight } : {}}
        >
            <div
                className="product-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={customHeight ? { height: '100%' } : {}}
            >
                {isHovered && product.video ? (
                    <video
                        src={product.video}
                        className="product-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                ) : (
                    <img
                        src={images[currentImageIndex]}
                        alt={product.name}
                        className="product-image"
                    />
                )}

                {product.tagText && <span className="product-tag">{product.tagText}</span>}

                {!(isHovered && product.video) && images.length > 1 && (
                    <>
                        <div className={`slider-dots ${isHovered ? 'visible' : ''}`}>
                            {images.map((_, index) => (
                                <span
                                    key={index}
                                    className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={(e) => handleDotClick(index, e)}
                                />
                            ))}
                        </div>
                        <div className={`slider-controls ${isHovered ? 'visible' : ''}`}>
                            <button className="slider-arrow arrow-prev" onClick={handlePrevImage}>‹</button>
                            <button className="slider-arrow arrow-next" onClick={handleNextImage}>›</button>
                        </div>
                    </>
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
    );
};

// ─── Main Page Component ──────────────────────────────────────────
export default function EarringsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMoreLoaded, setIsMoreLoaded] = useState(false);

    useEffect(() => {
        const fetchEarringsProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/products?category=Earrings`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setProducts(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError(err.message);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEarringsProducts();
    }, []);

    const formattedProducts = products.map((p) => ({
        id: p._id,
        name: p.title,
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
        (p) => createSlug(p.name) === 'bitcoin-standard-earings'
    );

    const grid1Products = formattedProducts.slice(0, 4);
    const niche1Products = formattedProducts.slice(4, 8);
    const nicheNewProducts = formattedProducts.slice(8, 12);
    const niche2Products = formattedProducts.slice(16, 20);
    const loadMoreProducts = formattedProducts.slice(20, 32);

    if (loading) {
        return (
            <div className="rings-loading-screen">
                <div className="rings-loading-spinner" />
                <p>Loading Earrings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rings-error-screen">
                <p>Error: {error}</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Luxury Earrings for Women | BitcoinButik</title>
                <meta
                    name="description"
                    content="Discover luxury earrings for women at BitcoinButik. Shop elegant and premium earrings designed for timeless beauty."
                />
                <link rel="canonical" href="https://bitcoinbutik.com/collections/earrings" />
            </Head>

            {/* ✅ rings.js jaise SAME wrapper class use ho rahi hai */}
            <div className="bzero-page-container">
                <div className="bzero-main-content">

                    <header className="bzero-header">
                        <div className="bzero-header-left">
                            <span className="breadcrumb">
                                <Link href="/">Home</Link> / <Link href="/collections">Jewelry</Link> / Earrings
                            </span>
                            <h1 className="bzero-title">
                                Earrings <sup>{formattedProducts.length}</sup>
                            </h1>
                        </div>
                    </header>

                    <main className="product-grid-wrapper">
                        <div className="product-grid">
                            <div className="product-grid-left">
                                {grid1Products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                            <div className="product-grid-right">
                                <div className="hero-image-container">
                                    {heroProduct1 ? (
                                        <Link href={`/collections/earrings/${createSlug(heroProduct1.name)}`}>
                                            <img
                                                src="/Earrings-Banner.webp"
                                                alt="Model wearing Earrings"
                                                style={{ cursor: 'pointer', width: '100%' }}
                                            />
                                        </Link>
                                    ) : (
                                        <img src="/Earrings-Banner.webp" alt="Model wearing Earrings" style={{ width: '100%' }} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>

                    <section className="niche-section-wrapper">
                        <div className="niche-grid">
                            {niche1Products.map((product) => (
                                <ProductCard key={`${product.id}-a`} product={product} />
                            ))}
                        </div>
                    </section>

                    <section className="niche-section-wrapper">
                        <div className="niche-grid">
                            {nicheNewProducts.map((product) => (
                                <ProductCard key={`${product.id}-new`} product={product} />
                            ))}
                        </div>
                    </section>

                    <section className="niche-section-wrapper">
                        <div className="niche-grid">
                            {niche2Products.map((product) => (
                                <ProductCard key={`${product.id}-d`} product={product} />
                            ))}
                        </div>
                    </section>

                    {formattedProducts.length > 20 && !isMoreLoaded && (
                        <div className="load-more-container">
                            <button onClick={() => setIsMoreLoaded(true)} className="load-more-button">
                                Load More
                            </button>
                        </div>
                    )}

                    {isMoreLoaded && (
                        <section className="niche-section-wrapper">
                            <div className="niche-grid">
                                {loadMoreProducts.slice(0, 4).map((product) => (
                                    <ProductCard key={`${product.id}-f`} product={product} />
                                ))}
                            </div>
                            <div className="niche-grid">
                                {loadMoreProducts.slice(4, 8).map((product) => (
                                    <ProductCard key={`${product.id}-g`} product={product} />
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </>
    );
}