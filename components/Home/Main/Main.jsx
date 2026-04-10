'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Main.css';

const API_URL = "https://api.bitcoinbutik.com";

export default function Main() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setLoading(true);

                const response = await fetch(`${API_URL}/api/products`);

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    throw new Error(
                        `API returned non-JSON response (status: ${response.status}). ` +
                        `Response preview: ${text.slice(0, 100)}`
                    );
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setProducts(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err.message);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    const titleToSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const formattedProducts = products.map(p => ({
        id: p._id,
        name: p.title,
        slug: p.slug || titleToSlug(p.title),
        price: p.price,
        goldPrice: p.goldPrice,
        images: p.image?.map(imgPath =>
            `${API_URL}/api/images/${imgPath.replace(/\\/g, '/').replace(/^uploads\//, '')}`
        ) || [],
        video: p.video
            ? `${API_URL}/api/images/${p.video.replace(/\\/g, '/').replace(/^uploads\//, '')}`
            : null,
        material: p.category,
        tagText: p.tagText || null,
        description: p.description
    }));

    const showcaseProducts = [
        {
            slug: "shield-of-satoshi-pendant",
            img: "/Main-Banner-1.webp",
            title: "Shield of Satoshi Pendant",
            price: "$110 - $155.00",
            category: "pendant-women"
        },
        {
            slug: "bitcoin-axe-pendant",
            img: "/DSC07107.JPG",
            title: "Bitcoin Axe Pendant",
            price: "$595.00 - $995.00",
            category: "pendant-mens"
        },
    ];

    const handleNavigate = (productSlug, category) => {
        const fullProduct = formattedProducts.find(p => p.slug === productSlug);
        const finalSlug = fullProduct ? fullProduct.slug : productSlug;
        router.push(`/collections/pendants/${category}/${finalSlug}`);
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '5rem',
                fontSize: '1.5rem',
                color: '#333'
            }}>
                Loading content...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '5rem',
                fontSize: '1rem',
                color: 'red',
                maxWidth: '700px',
                margin: '0 auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
            }}>
                <strong>API Error:</strong>
                <br /><br />
                {error}
            </div>
        );
    }

    return (
        <>
            <div data-aos="fade-up" className="jewelry-showcase">
                <div className="showcase-container">

                    <div
                        className="showcase-section serpenti-section"
                        onClick={() => handleNavigate(showcaseProducts[0].slug, showcaseProducts[0].category)}
                        style={{ cursor: "pointer" }}
                    >
                        <img
                            src={showcaseProducts[0].img}
                            alt={showcaseProducts[0].title}
                            className="showcase-image"
                        />
                        <div className="overlay-gradient"></div>
                        <div className="main-content-overlay">
                            <div className="main-content-wrapper">
                                <h2 className="showcase-title">{showcaseProducts[0].title}</h2>
                                <div className="hero-cta-btn-v4">{showcaseProducts[0].price}</div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="showcase-section divas-section"
                        onClick={() => handleNavigate(showcaseProducts[1].slug, showcaseProducts[1].category)}
                        style={{ cursor: "pointer" }}
                    >
                        <img
                            src={showcaseProducts[1].img}
                            alt={showcaseProducts[1].title}
                            className="showcase-image"
                        />
                        <div className="overlay-gradient"></div>
                        <div className="main-content-overlay">
                            <div className="main-content-wrapper">
                                <h2 className="showcase-title">{showcaseProducts[1].title}</h2>
                                <div className="hero-cta-btn-v4">{showcaseProducts[1].price}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div style={{ cursor: "pointer" }}>
                <main data-aos="fade-up" className="main-content">
                    <div className="hero-section">
                        <div className="hero-image">
                            <img src="/Main-Banner-3.webp" alt="Hero Banner" />
                            <div className="hero-overlay">
                                <div className="hero-text">
                                    <div className="hero-cta-btn-v4">
                                        <a href="/About">JOIN THE JOURNEY</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}