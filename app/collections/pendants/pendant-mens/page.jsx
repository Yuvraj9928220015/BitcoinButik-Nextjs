// app/collections/pendants/pendant-mens/page.jsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import "./mans.css"

const API_URL = "https://api.bitcoinbutik.com";    
const MEDIA_URL = "https://api.bitcoinbutik.com";       

const createSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const intervalRef = useRef(null);

    const images = product.images || [];
    const productSlug = createSlug(product.name);

    const startSlideshow = useCallback(() => {
        clearInterval(intervalRef.current);
        if (images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
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
            <div className="product-card-link">
                <div className="product-card">
                    <div className="product-info" style={{ color: '#000' }}>
                        <p>No Image Available</p>
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-price-container">
                            {product.goldPrice ? (
                                <>
                                    <p className="product-price">
                                        ${product.price?.toFixed(2)} - ${product.goldPrice?.toFixed(2)}
                                    </p>
                                    <div className="price-types">
                                        <span className="price-type silver">Silver: ${product.price?.toFixed(2)}</span>
                                        <span className="price-type gold">Gold: ${product.goldPrice?.toFixed(2)}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="product-price">${product.price?.toFixed(2)}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            href={`/collections/pendants/pendant-mens/${productSlug}`}
            className="product-card-link"
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
                                />
                            ))}
                        </div>
                        <div className={`slider-controls ${isHovered ? 'visible' : ''}`}>
                            <button className="slider-arrow arrow-prev" onClick={handlePrevImage}>
                                <i className="fa fa-chevron-left" />
                            </button>
                            <button className="slider-arrow arrow-next" onClick={handleNextImage}>
                                <i className="fa fa-chevron-right" />
                            </button>
                        </div>
                    </>
                )}

                <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price-container">
                        {product.goldPrice ? (
                            <p className="product-price-range">
                                ${product.price?.toFixed(2)} - ${product.goldPrice?.toFixed(2)}
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


const formatMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${MEDIA_URL}/${path.replace(/^\//, '').replace(/\\/g, '/')}`;
};



export default function ManPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMoreLoaded, setIsMoreLoaded] = useState(false);

    useEffect(() => {
        const fetchManProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/products?category=Man`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
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

        fetchManProducts();
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

    const heroProduct1 = formattedProducts.find(
        (p) => createSlug(p.name) === 'not-your-keys-pendant'
    );

    const grid1Products = formattedProducts.slice(0, 4);
    const niche1Products = formattedProducts.slice(4, 8);
    const nicheNewProducts = formattedProducts.slice(8, 12);
    const niche2Products = formattedProducts.slice(16, 20);
    const loadMoreProducts = formattedProducts.slice(20, 32);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.5rem' }}>
                Loading Man Products...
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
            <Head>
                <title>Luxury Pendants for Man | BitcoinButik</title>
                <meta
                    name="description"
                    content="Explore luxury Pendants for Man at BitcoinButik. Shop designer, elegant and premium Pendants crafted for timeless style."
                />
                <link rel="canonical" href="https://bitcoinbutik.com/collections/pendants/pendant-mens" />
            </Head>

            <div className="bzero-page-container">
                <div className="bzero-main-content">
                    <header className="bzero-header">
                        <div className="bzero-header-left">
                            <span className="breadcrumb">Jewelry / Pendants / Man</span>
                            <h1 className="bzero-title">
                                Man <sup>{formattedProducts.length}</sup>
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
                                        <Link href={`/collections/pendants/pendant-mens/${createSlug(heroProduct1.name)}`}>
                                            <Image
                                                src="/1(4).png"
                                                alt="Model wearing Pendants"
                                                fill
                                                style={{ objectFit: 'cover', cursor: 'pointer' }}
                                                priority
                                            />
                                        </Link>
                                    ) : (
                                        <Image
                                            src="/1(4).png"
                                            alt="Model wearing Pendants"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            priority
                                        />
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