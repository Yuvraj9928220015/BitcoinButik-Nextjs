'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import "./women.css";

const API_URL = "https://api.bitcoinbutik.com";    
const MEDIA_URL = "https://api.bitcoinbutik.com";  

const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

  const formatMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${MEDIA_URL}/${path.replace(/^\//, '').replace(/\\/g, '/')}`;
};

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const intervalRef = useRef(null);

    const images = product.images || [];
    const productSlug = createSlug(product.name);

    const hasSilverPrice = product.price !== null && product.price !== undefined && product.price > 0;
    const hasGoldPrice = product.goldPrice !== null && product.goldPrice !== undefined && product.goldPrice > 0;

    const startSlideshow = useCallback(() => {
        clearInterval(intervalRef.current);
        if (images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
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
        if (isHovered && !product.video) {
            startSlideshow();
        }
    };

    const handlePrevImage = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const newIndex = (currentImageIndex - 1 + images.length) % images.length;
        handleManualChange(newIndex);
    };

    const handleNextImage = (event) => {
        event.stopPropagation();
        event.preventDefault();
        const newIndex = (currentImageIndex + 1) % images.length;
        handleManualChange(newIndex);
    };

    const handleDotClick = (index, event) => {
        event.stopPropagation();
        event.preventDefault();
        handleManualChange(index);
    };

    // Save product data to localStorage before navigating
    const handleProductClick = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedProduct', JSON.stringify(product));
        }
    };

    const renderPriceDisplay = () => {
        if (hasSilverPrice && hasGoldPrice) {
            return (
                <div className="product-price-container">
                    <p className="product-price-range">
                        ${product.price?.toFixed(2)} - ${product.goldPrice?.toFixed(2)}
                    </p>
                </div>
            );
        }
        if (hasSilverPrice && !hasGoldPrice) {
            return (
                <div className="product-price-container">
                    <p className="product-price-range">Silver: ${product.price?.toFixed(2)}</p>
                </div>
            );
        }
        if (!hasSilverPrice && hasGoldPrice) {
            return (
                <div className="product-price-container">
                    <p className="product-price-range">Gold: ${product.goldPrice?.toFixed(2)}</p>
                </div>
            );
        }
        return (
            <div className="product-price-container">
                <p className="product-price-range">Price not available</p>
            </div>
        );
    };

    if (images.length === 0) {
        return (
            <div className="product-card-link">
                <div className="product-card">
                    <div className="product-info" style={{ color: '#000' }}>
                        <p>No Image Available</p>
                        <h3 className="product-name">{product.name}</h3>
                        {renderPriceDisplay()}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            href={`/collections/pendants/pendant-women/${productSlug}`}
            className="product-card-link"
            onClick={handleProductClick}
        >
            <div
                className="product-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {isHovered && product.video ? (
                    <video
                        src={product.video}
                        className="product-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        key={product.video}
                    />
                ) : (
                    <img
                        src={images[currentImageIndex]}
                        alt={product.name}
                        className="product-image"
                        key={images[currentImageIndex]}
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
                                ></span>
                            ))}
                        </div>
                        <div className={`slider-controls ${isHovered ? 'visible' : ''}`}>
                            <button className="slider-arrow arrow-prev" onClick={handlePrevImage}>
                                <i className="fa fa-chevron-left"></i>
                            </button>
                            <button className="slider-arrow arrow-next" onClick={handleNextImage}>
                                <i className="fa fa-chevron-right"></i>
                            </button>
                        </div>
                    </>
                )}

                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    {renderPriceDisplay()}
                </div>
            </div>
        </Link>
    );
};

export default function Pendants() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMoreLoaded, setIsMoreLoaded] = useState(false);

    useEffect(() => {
        const fetchPendantProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/products?category=pendant`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPendantProducts();
    }, []);

    const formattedProducts = products.map((p) => ({
        id: p._id,
        name: p.title,
        price: p.price,
        goldPrice: p.goldPrice,
        // ✅ FIX: formatMediaUrl se sahi URL banega — localhost nahi, api.bitcoinbutik.com
        images: (p.image || []).map(formatMediaUrl).filter(Boolean),
        video: formatMediaUrl(p.video),
        material: p.category,
        tagText: p.tagText || null,
        description: p.description,
        type: p.type,
        stock: p.stock,
    }));


    const heroProduct1 = formattedProducts.find(p =>
        createSlug(p.name) === 'radiant-reserve-pendant'
    );
    const heroProduct2 = formattedProducts.find(p =>
        createSlug(p.name) === 'immutable-pendant'
    );

    const grid1Products = formattedProducts.slice(0, 4);
    const niche1Products = formattedProducts.slice(4, 8);
    const nicheNewProducts = formattedProducts.slice(8, 12);
    const grid2Products = formattedProducts.slice(12, 16);
    const niche2Products = formattedProducts.slice(16, 20);
    const loadMoreProducts = formattedProducts.slice(20, 32);

    const handleLoadMore = () => {
        setIsMoreLoaded(true);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.5rem' }}>
                Loading Pendants...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.5rem', color: 'red' }}>
                Error: {error}
            </div>
        );
    }

    return (
        <>
            {/* ── Next.js Head (replaces react-helmet-async) ── */}
            <Head>
                <title>Luxury Pendants for Women | BitcoinButik</title>
                <meta
                    name="description"
                    content="Explore luxury Pendants for women and men at BitcoinButik. Shop designer, elegant and premium Pendants crafted for timeless style."
                />
                <link rel="canonical" href="https://bitcoinbutik.com/pendants" />
            </Head>

            <div data-aos="fade-up" className="bzero-page-container">
                <div className={`bzero-main-content ${isFilterOpen ? 'content-blurred' : ''}`}>
                    <header className="bzero-header">
                        <div className="bzero-header-left">
                            <span className="breadcrumb">Jewelry / Pendants</span>
                            <h1 className="bzero-title">
                                Pendants <sup>{formattedProducts.length}</sup>
                            </h1>
                        </div>
                    </header>

                    <main className="product-grid-wrapper">
                        <div className="product-grid">
                            <div className="product-grid-left">
                                {grid1Products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                            <div className="product-grid-right">
                                <div className="hero-image-container">
                                    {heroProduct1 ? (
                                        <Link
                                            href={`/collections/pendants/pendant-women/${createSlug(heroProduct1.name)}`}
                                            onClick={() => {
                                                if (typeof window !== 'undefined') {
                                                    localStorage.setItem('selectedProduct', JSON.stringify(heroProduct1));
                                                }
                                            }}
                                        >
                                            <img src="/Bzero18-2.webp" alt="Model wearing Pendants" style={{ cursor: 'pointer' }} />
                                        </Link>
                                    ) : (
                                        <img src="/Bzero18-2.webp" alt="Model wearing Pendants" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>

                    <section className="niche-section-wrapper">
                        <div data-aos="fade-up" className="niche-grid">
                            {niche1Products.map((product) => (
                                <ProductCard key={`${product.id}-a`} product={product} />
                            ))}
                        </div>
                    </section>

                    <section className="niche-section-wrapper">
                        <div data-aos="fade-up" className="niche-grid">
                            {nicheNewProducts.map((product) => (
                                <ProductCard key={`${product.id}-new`} product={product} />
                            ))}
                        </div>
                    </section>

                    <main className="product-grid-wrapper">
                        <div className="product-grid">
                            <div className="product-grid-right">
                                <div className="hero-image-container">
                                    {heroProduct2 ? (
                                        <Link
                                            href={`/collections/pendants/pendant-women/${createSlug(heroProduct2.name)}`}
                                            onClick={() => {
                                                if (typeof window !== 'undefined') {
                                                    localStorage.setItem('selectedProduct', JSON.stringify(heroProduct2));
                                                }
                                            }}
                                        >
                                            <img src="/Bzero11-2.webp" alt="Model wearing Pendants" style={{ cursor: 'pointer' }} />
                                        </Link>
                                    ) : (
                                        <img src="/Bzero11-2.webp" alt="Model wearing Pendants" />
                                    )}
                                </div>
                            </div>
                            <div className="product-grid-left">
                                {grid2Products.map((product) => (
                                    <ProductCard key={`${product.id}-c`} product={product} />
                                ))}
                            </div>
                        </div>
                    </main>

                    <section data-aos="fade-up" className="niche-section-wrapper">
                        <div className="niche-grid">
                            {niche2Products.map((product) => (
                                <ProductCard key={`${product.id}-d`} product={product} />
                            ))}
                        </div>
                    </section>

                    {formattedProducts.length > 20 && !isMoreLoaded && (
                        <div className="load-more-container">
                            <button onClick={handleLoadMore} className="load-more-button">
                                Load More
                            </button>
                        </div>
                    )}

                    {isMoreLoaded && (
                        <section data-aos="fade-up" className="niche-section-wrapper">
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