'use client';
// app/collections/pendants/pendant-women/[womenSlug]/WomenDetailClient.jsx
// ✅ 'use client' yahan hai — saara interactive logic yahan

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    BsShare, BsQuestionCircle, BsArrowLeftRight, BsX,
    BsTruck, BsArrowLeftShort, BsArrowRightShort
} from 'react-icons/bs';
import { useCart } from '../../../../Context/CartContext';
import './womenDetail.css';

const API_URL = "https://api.bitcoinbutik.com";    
const MEDIA_URL = "https://api.bitcoinbutik.com"; 
const STOCK_STORAGE_KEY = 'product_stock_values';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ✅ KEY FIX: apostrophe pehle remove karo — "Satoshi's" → "satoshis-universe-pendant"
const createSlug = (name) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[''`]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// ✅ Flexible slug match — dono slugs normalize karke compare karo
const slugsMatch = (slug1, slug2) => {
    const normalize = (s) =>
        (s || '')
            .toLowerCase()
            .replace(/[''`]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    return normalize(slug1) === normalize(slug2);
};

const getDeliveryDateRange = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 7);
    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${day} ${months[date.getMonth()]}`;
    };
    return `${formatDate(today)} – ${formatDate(deliveryDate)}, ${deliveryDate.getFullYear()}`;
};

const formatImageUrl = (imgPath) => {
    if (!imgPath) return '/default-image.jpg';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    const cleanPath = imgPath.replace(/^\//, '').replace(/\\/g, '/');
    return `${MEDIA_URL}/${cleanPath}`;
};

// ✅ FIX: Safe localStorage wrapper — won't crash during SSR
const safeLocalStorage = {
    get: (key) => {
        if (typeof window === 'undefined') return null;
        try { return localStorage.getItem(key); } catch { return null; }
    },
    set: (key, value) => {
        if (typeof window === 'undefined') return;
        try { localStorage.setItem(key, value); } catch {}
    },
};

const formatProductData = (productData) => {
    if (!productData) return null;
    const gramsValue = productData.grams !== undefined && productData.grams !== null
        ? Number(productData.grams) : 1;
    return {
        id: productData.id || productData._id,
        name: productData.name || productData.title || 'Unknown Product',
        price: productData.price || 0,
        goldPrice: productData.goldPrice || 0,
        type: productData.type || 'pendant',
        description: productData.description || 'No description available.',
        // ✅ FIX: Check both `images` and `image` (DB field is `image`)
        images: (productData.images || productData.image || [])
            .filter(Boolean)
            .map(imgPath => formatImageUrl(imgPath)),
        video: productData.video ? formatImageUrl(productData.video) : null,
        stock: productData.stock !== undefined ? productData.stock : 0,
        grams: gramsValue,
        sizes: [
            { name: '16 inch', available: true },
            { name: '18 inch', available: true },
            { name: '20 inch', available: true },
        ],
    };
};

const getStockFromLocalStorage = (productId) => {
    try {
        const savedStocks = safeLocalStorage.get(STOCK_STORAGE_KEY);
        if (savedStocks) {
            const stockValues = JSON.parse(savedStocks);
            return stockValues[productId] !== undefined ? stockValues[productId] : 0;
        }
    } catch {}
    return 0;
};

// ─── Share Modal ──────────────────────────────────────────────────────────────

const ShareModal = ({ isOpen, onClose }) => {
    const [copySuccess, setCopySuccess] = useState('');
    useEffect(() => { if (isOpen) setCopySuccess(''); }, [isOpen]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch {
            setCopySuccess('Failed!');
            setTimeout(() => setCopySuccess(''), 2000);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><BsX /></button>
                <h3 className="modal-title">Share this Product</h3>
                <p className="modal-subtitle">Copy the link to share it with the world.</p>
                <div className="share-input-group">
                    <input type="text" value={typeof window !== 'undefined' ? window.location.href : ''} readOnly />
                    <button onClick={copyToClipboard} className={copySuccess === 'Copied!' ? 'success' : ''}>
                        {copySuccess || 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Question Modal ───────────────────────────────────────────────────────────

const QuestionModal = ({ isOpen, onClose, productName, productId }) => {
    const [formData, setFormData] = useState({ name: '', email: '', question: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');
        try {
            const response = await fetch(`${API_URL}/api/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, productName, productId: productId || '' }),
            });
            const data = await response.json();
            if (data.success) {
                setSubmitMessage('Thank you! Your question has been submitted successfully.');
                setFormData({ name: '', email: '', question: '' });
                setTimeout(() => { onClose(); setSubmitMessage(''); }, 2000);
            } else {
                setSubmitMessage(data.message || 'Failed to submit. Please try again.');
            }
        } catch {
            setSubmitMessage('Network error. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', email: '', question: '' });
            setSubmitMessage('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}><BsX /></button>
                <h3 className="modal-title">Ask a Question</h3>
                <p className="modal-subtitle">About: <strong>{productName}</strong></p>
                {submitMessage && (
                    <div className={`submit-message ${submitMessage.includes('Thank you') ? 'success' : 'error'}`}>
                        {submitMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="question-form">
                    <div className="form-group">
                        <label htmlFor="name">Name *</label>
                        <input type="text" id="name" name="name" value={formData.name}
                            onChange={handleInputChange} required placeholder="Your Name"
                            disabled={isSubmitting} minLength="2" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input type="email" id="email" name="email" value={formData.email}
                            onChange={handleInputChange} required placeholder="your@email.com"
                            disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="question">Your Question *</label>
                        <textarea id="question" name="question" value={formData.question}
                            onChange={handleInputChange} rows="4" required
                            placeholder="Type your question here..." disabled={isSubmitting} minLength="10" />
                    </div>
                    <button type="submit" className="pdp-btn pdp-submit-question" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting…' : 'Submit Question'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Compare Sidebar ──────────────────────────────────────────────────────────

const CompareSidebar = ({ isOpen, onClose, productsToCompare, onRemoveProduct }) => (
    <>
        <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
        <aside className={`compare-sidebar ${isOpen ? 'open' : ''}`}>
            <header className="sidebar-header">
                <h3>Compare Products</h3>
                <button className="sidebar-close-btn" onClick={onClose}><BsX /></button>
            </header>
            <div className="sidebar-content">
                {productsToCompare.length === 0 ? (
                    <p>Add a product to start comparing.</p>
                ) : (
                    <div className="compare-product-list">
                        {productsToCompare.map(p => (
                            <div key={p.id} className="compare-product-item">
                                <img src={p.images[0]} alt={p.name}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }} />
                                <div className="compare-product-info">
                                    <h4>{p.name}</h4>
                                    <span>${p.price?.toFixed(2)} – ${p.goldPrice?.toFixed(2)}</span>
                                </div>
                                <button className="remove-compare-btn" onClick={() => onRemoveProduct(p.id)}><BsX /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <footer className="sidebar-footer">
                <button className="pdp-btn pdp-compare-action" disabled={productsToCompare.length < 2}>
                    Compare Now ({productsToCompare.length})
                </button>
                <button className="pdp-btn-secondary" onClick={onClose}>Continue Shopping</button>
            </footer>
        </aside>
    </>
);

// ─── Main Client Component ────────────────────────────────────────────────────

export default function WomenDetailClient({ womenSlug }) {
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct]                     = useState(null);
    const [loading, setLoading]                     = useState(true);
    const [error, setError]                         = useState(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [selectedSize, setSelectedSize]           = useState('');
    const [selectedType, setSelectedType]           = useState('');
    const [quantity, setQuantity]                   = useState(1);
    const [isAddedToCart, setIsAddedToCart]         = useState(false);
    const [isCompareOpen, setIsCompareOpen]         = useState(false);
    const [isQuestionOpen, setIsQuestionOpen]       = useState(false);
    const [isShareOpen, setIsShareOpen]             = useState(false);
    const [compareList, setCompareList]             = useState([]);
    const [activeTab, setActiveTab]                 = useState('details');
    const [stockValue, setStockValue]               = useState(0);

    // ✅ FIX: useCallback so it's stable across renders
    const getCurrentPrice = useCallback(() => {
        if (!product) return 0;
        if (selectedType === 'Gold')   return product.goldPrice;
        if (selectedType === 'Silver') return product.price;
        return product.price;
    }, [product, selectedType]);

    // ✅ FIX: useCallback + safeLocalStorage (SSR-safe)
    const fetchLatestStock = useCallback(async (prodId) => {
        try {
            const res = await fetch(`${API_URL}/api/products/${prodId}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            const stock = data.stock !== undefined ? data.stock : 0;
            const grams = data.grams !== undefined ? Number(data.grams) : 1;

            // ✅ FIX: Check both `image` (DB field) and `images`
            const fixedImages = (data.image || data.images || [])
                .filter(Boolean).map(formatImageUrl).filter(Boolean);
            const fixedVideo = data.video ? formatImageUrl(data.video) : null;

            setStockValue(stock);
            setProduct(prev => prev ? {
                ...prev, stock, grams,
                ...(fixedImages.length > 0 && { images: fixedImages }),
                ...(fixedVideo && { video: fixedVideo }),
            } : prev);

            try {
                const savedStocks = JSON.parse(safeLocalStorage.get(STOCK_STORAGE_KEY) || '{}');
                savedStocks[prodId] = stock;
                safeLocalStorage.set(STOCK_STORAGE_KEY, JSON.stringify(savedStocks));
            } catch {}

            return stock;
        } catch (error) {
            console.error('Error fetching stock:', error);
            return stockValue;
        }
    }, [stockValue]);

    // ─── Fetch Product ────────────────────────────────────────────────────────

    useEffect(() => {
        if (!womenSlug) return;

        window.scrollTo(0, 0);
        setProduct(null);
        setLoading(true);
        setError(null);
        setSelectedSize('');
        setSelectedType('');
        setQuantity(1);
        setIsAddedToCart(false);
        setCurrentMediaIndex(0);

        const fetchProductBySlug = async () => {
            try {
                // ✅ sessionStorage / localStorage se pehle check karo
                const sessionKey = `product_${womenSlug}`;
                let passedData = null;
                try {
                    const stored = sessionStorage.getItem(sessionKey);
                    if (stored) {
                        passedData = JSON.parse(stored);
                    } else {
                        const localStored = safeLocalStorage.get(sessionKey);
                        if (localStored) passedData = JSON.parse(localStored);
                    }
                } catch {}

                if (passedData) {
                    const formattedProduct = formatProductData(passedData);
                    setProduct(formattedProduct);
                    setLoading(false);
                    const stock = getStockFromLocalStorage(formattedProduct.id);
                    setStockValue(stock);
                    fetchLatestStock(formattedProduct.id);
                    return;
                }

                // ✅ First try to find by slug directly (faster)
                try {
                    const slugRes = await fetch(`${API_URL}/api/products/slug/${womenSlug}`);
                    if (slugRes.ok) {
                        const productData = await slugRes.json();
                        const formatted = formatProductData({
                            ...productData,
                            name: productData.title,
                        });
                        setProduct(formatted);
                        const stock = getStockFromLocalStorage(productData._id);
                        setStockValue(stock);
                        fetchLatestStock(productData._id);
                        return;
                    }
                } catch {}

                // ✅ Fallback: dono categories fetch karo
                const [res1, res2] = await Promise.all([
                    fetch(`${API_URL}/api/products?category=woman%20pendant`),
                    fetch(`${API_URL}/api/products?category=pendant`),
                ]);

                const products1 = res1.ok ? await res1.json() : [];
                const products2 = res2.ok ? await res2.json() : [];
                const allProducts = [...products1, ...products2];

                // ✅ slugsMatch se compare karo (apostrophe-safe)
                const foundProduct = allProducts.find(p =>
                    slugsMatch(p.slug || createSlug(p.title || p.name || ''), womenSlug)
                );

                if (!foundProduct) {
                    throw new Error(`Product not found for slug: "${womenSlug}"`);
                }

                const formattedProduct = formatProductData({
                    ...foundProduct,
                    name: foundProduct.title,
                });

                setProduct(formattedProduct);
                const stock = getStockFromLocalStorage(foundProduct._id);
                setStockValue(stock);
                fetchLatestStock(foundProduct._id);

            } catch (err) {
                console.error('Product fetch error:', err);
                setError(err.message);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProductBySlug();
    }, [womenSlug, fetchLatestStock]);

    // ✅ FIX: Poll every 30s instead of 3s — reduces server load
    useEffect(() => {
        if (!product?.id) return;
        const interval = setInterval(() => fetchLatestStock(product.id), 30000);
        return () => clearInterval(interval);
    }, [product?.id, fetchLatestStock]);

    // ✅ FIX: fetchLatestStock added to dependency array
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && product?.id) fetchLatestStock(product.id);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [product?.id, fetchLatestStock]);

    useEffect(() => { setIsAddedToCart(false); }, [selectedSize, selectedType]);

    // ─── Media Items ──────────────────────────────────────────────────────────

    const mediaItems = useMemo(() => {
        if (!product) return [];
        const items = [];
        (product.images || []).forEach(imgSrc => {
            if (imgSrc) items.push({ type: 'image', src: imgSrc, thumbnail: imgSrc });
        });
        if (product.video) {
            items.push({ type: 'video', src: product.video, thumbnail: product.images?.[0] || '' });
        }
        return items;
    }, [product]);

    useEffect(() => { setCurrentMediaIndex(0); }, [womenSlug]);

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleAddToCompare = () => {
        if (!product) return;
        if (!compareList.some(item => item.id === product.id)) {
            setCompareList(prev => [...prev, product]);
        }
        setIsCompareOpen(true);
    };

    const handleRemoveFromCompare = (id) =>
        setCompareList(prev => prev.filter(p => p.id !== id));

    const handleAddToCart = async () => {
        if (!product || !selectedSize || !selectedType) return;
        const latestStock = await fetchLatestStock(product.id);
        if (latestStock <= 0)       { alert('This product is out of stock!'); return; }
        if (quantity > latestStock) { alert(`Only ${latestStock} items available!`); return; }

        const currentPrice = getCurrentPrice();
        const result = await addToCart(
            {
                ...product,
                price: currentPrice,
                selectedPrice: currentPrice,
                selectedType,
                selectedOptions: { type: selectedType, size: selectedSize },
            },
            selectedSize,
            quantity
        );
        if (result?.success !== false) {
            setIsAddedToCart(true);
        }
    };

    const handleBuyNow = async () => {
        if (!product || !selectedSize || !selectedType) {
            alert('Please select size and type first!');
            return;
        }
        if (!isAddedToCart) await handleAddToCart();
        router.push('/checkout');
    };

    const handlePrevMedia = () =>
        setCurrentMediaIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1);
    const handleNextMedia = () =>
        setCurrentMediaIndex(prev => (prev + 1) % mediaItems.length);

    const increaseQuantity = () => {
        if (quantity < stockValue) setQuantity(prev => prev + 1);
        else alert(`Maximum available stock: ${stockValue}`);
    };
    const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

    // ─── Tab Content ──────────────────────────────────────────────────────────

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="tab-pane">
                        <h3>Description &amp; Details</h3>
                        <p className="product-description">{product.description}</p>
                        <ul>
                            <li className="detail-item">
                                <strong>Type:</strong> <span>Pendant with Chain — {product.type}</span>
                            </li>
                            <li className="detail-item">
                                <strong>Purity:</strong> <span>Gold Vermeil or 92.5 Sterling Silver</span>
                            </li>
                            <li className="detail-item">
                                <strong>Gross Wt in Grams:</strong>{' '}
                                <span>{Number(product.grams).toFixed(2)}g</span>
                            </li>
                        </ul>
                    </div>
                );
            case 'shipping':
                return (
                    <div className="tab-pane">
                        <p>Shipping cost is based on weight. Add products to your cart and use the Shipping Calculator to see the shipping price.</p>
                        <p>We want you to be 100% satisfied with your purchase. Items can be returned or exchanged within 30 days of delivery.</p>
                    </div>
                );
            case 'reviews':
                return (
                    <div className="tab-pane">
                        <div className="section-header">
                            <h3>Rating &amp; Reviews</h3>
                            <a href="#" className="action-link">Write a review</a>
                        </div>
                        <div className="rating-summary">
                            <span className="pdp-stars">☆☆☆☆☆</span>
                            <span>Based on 0 Reviews</span>
                        </div>
                        <p className="empty-state-text">There are no reviews yet.</p>
                    </div>
                );
            case 'questions':
                return (
                    <div className="tab-pane">
                        <div className="section-header">
                            <h3>Questions &amp; Answers</h3>
                            <button onClick={() => setIsQuestionOpen(true)} className="action-link">
                                Ask a Question
                            </button>
                        </div>
                        <div className="question-summary"><span>0 Questions</span></div>
                        <p className="empty-state-text">No questions found.</p>
                    </div>
                );
            default: return null;
        }
    };

    // ─── Render States ────────────────────────────────────────────────────────

    if (loading) return <div className="pdp-loading">Loading product…</div>;
    if (error) return (
        <div className="pdp-error">
            Error: {error}
            <br />
            <button onClick={() => window.history.back()}
                style={{ marginTop: 12, padding: '8px 16px', cursor: 'pointer' }}>
                ← Go Back
            </button>
        </div>
    );
    if (!product) return <div className="pdp-loading">Product not found.</div>;

    const currentMedia   = mediaItems[currentMediaIndex];
    const detailImages   = product.images.slice(0, 3);
    const hasSilverPrice = product.price > 0;
    const hasGoldPrice   = product.goldPrice > 0;

    return (
        <>
            <div className="product-pdp-page-wrapper">
                <div className="pdp-page-wrapper">
                    <div className="pdp-main-content">

                        {/* ── Media Viewer ── */}
                        <div className="pdp-main-media-container">
                            {currentMedia?.type === 'image' ? (
                                <img
                                    src={currentMedia.src}
                                    alt={`${product.name} view ${currentMediaIndex + 1}`}
                                    className="pdp-main-media"
                                    key={currentMedia.src}
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=No+Image'; }}
                                />
                            ) : currentMedia?.type === 'video' ? (
                                <video
                                    src={currentMedia.src}
                                    className="pdp-main-media"
                                    autoPlay loop muted playsInline
                                    key={currentMedia.src}
                                />
                            ) : (
                                <div className="pdp-no-image">No Media Available</div>
                            )}

                            {mediaItems.length > 1 && (
                                <>
                                    <button onClick={handlePrevMedia} className="pdp-nav-arrow-pendant pdp-prev">
                                        <BsArrowLeftShort />
                                    </button>
                                    <button onClick={handleNextMedia} className="pdp-nav-arrow-pendant pdp-next">
                                        <BsArrowRightShort />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* ── Product Details ── */}
                        <div className="pdp-details-container">
                            <div className="pdp-header">
                                <h1 className="pdp-title">{product.name}</h1>
                            </div>

                            {/* Price + Reviews */}
                            <div className="pdp-price-review-row">
                                <span className="pdp-price">
                                    {selectedType ? (
                                        `$${getCurrentPrice()?.toFixed(2)}`
                                    ) : hasSilverPrice && hasGoldPrice ? (
                                        `$${Math.min(product.price, product.goldPrice).toFixed(2)} - $${Math.max(product.price, product.goldPrice).toFixed(2)}`
                                    ) : hasSilverPrice ? (
                                        `$${product.price?.toFixed(2)}`
                                    ) : hasGoldPrice ? (
                                        `$${product.goldPrice?.toFixed(2)}`
                                    ) : 'Price Unavailable'}
                                </span>
                                <div className="pdp-reviews">
                                    <span className="pdp-stars">☆☆☆☆☆</span>
                                    <a href="#reviews" className="pdp-review-count">(0 reviews)</a>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="pdp-options-grid">
                                <div className="pdp-option-group">
                                    <label className="pdp-option-label" htmlFor="size-select">Chains Size:</label>
                                    <select id="size-select" className="pdp-select" value={selectedSize}
                                        onChange={(e) => setSelectedSize(e.target.value)}>
                                        <option value="" disabled>Choose an option</option>
                                        {product.sizes?.map((size) => (
                                            <option key={size.name} value={size.name} disabled={!size.available}>
                                                {size.name}{!size.available && ' (Out of stock)'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pdp-option-group">
                                    <label className="pdp-option-label" htmlFor="type-select">Type:</label>
                                    <select id="type-select" className="pdp-select" value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}>
                                        <option value="" disabled>Choose an option</option>
                                        {hasGoldPrice && (
                                            <option value="Gold">Gold Vermeil ${product.goldPrice?.toFixed(2)}</option>
                                        )}
                                        {hasSilverPrice && (
                                            <option value="Silver">Silver ${product.price?.toFixed(2)}</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Quantity + Cart */}
                            <div className="Product-Quantity">Quantity</div>
                            <div className="pdp-cart-row">
                                <div className="pdp-quantity-selector">
                                    <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={increaseQuantity} disabled={quantity >= stockValue}>+</button>
                                </div>
                                <button
                                    className={`pdp-btn pdp-add-to-cart ${isAddedToCart ? 'added' : ''}`}
                                    onClick={handleAddToCart}
                                    disabled={!selectedSize || !selectedType || stockValue <= 0}
                                >
                                    {stockValue <= 0
                                        ? 'Out of Stock'
                                        : isAddedToCart
                                            ? '✓ Added to Cart'
                                            : selectedSize && selectedType
                                                ? 'Add to cart'
                                                : 'Select size and type'}
                                </button>
                            </div>

                            {/* Buy Now */}
                            <div className="pdp-actions">
                                <button
                                    className="pdp-btn pdp-buy-now"
                                    onClick={handleBuyNow}
                                    disabled={!selectedSize || !selectedType || stockValue <= 0}
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Meta actions */}
                            <div className="pdp-meta-actions">
                                <button onClick={handleAddToCompare}><BsArrowLeftRight /><span>Compare</span></button>
                                <button onClick={() => setIsQuestionOpen(true)}><BsQuestionCircle /><span>Ask a Question</span></button>
                                <button onClick={() => setIsShareOpen(true)}><BsShare /><span>Share</span></button>
                            </div>

                            {/* Stock */}
                            <div className="Stock" style={{
                                padding: '12px 16px',
                                backgroundColor: stockValue > 0 ? '#f0f9ff' : '#fef2f2',
                                border: `1px solid ${stockValue > 0 ? '#bfdbfe' : '#fecaca'}`,
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '15px',
                                fontWeight: '500',
                                color: stockValue > 0 ? '#1e40af' : '#991b1b',
                            }}>
                                <span style={{ fontWeight: 600 }}>Stock:</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: stockValue > 0 ? '#059669' : '#dc2626' }}>
                                    {stockValue}
                                </span>
                                <span style={{ marginLeft: 'auto', fontSize: 13, opacity: 0.8 }}>
                                    {stockValue > 0
                                        ? `${stockValue} ${stockValue === 1 ? 'item' : 'items'} available`
                                        : 'Currently unavailable'}
                                </span>
                            </div>

                            {/* Delivery */}
                            <div className="pdp-delivery-info">
                                <div className="pdp-delivery-item">
                                    <BsTruck className="pdp-delivery-icon" />
                                    <div>
                                        <strong>Shipping may be delayed due to unforeseen circumstances.</strong>
                                        <span>{getDeliveryDateRange()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust badge */}
                            <div className="Payment-component">
                                <img src="/product-trust-badge.png" alt="Secure Checkout" />
                                <div>Guaranteed safe &amp; secure checkout</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="product-tabs-container">
                <div className="container">
                    <div className="tabs-nav">
                        {['details', 'reviews', 'shipping', 'questions'].map((tab) => (
                            <button
                                key={tab}
                                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'details' ? 'Product details'
                                    : tab === 'shipping' ? 'Shipping and Returns'
                                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="tabs-content">{renderTabContent()}</div>
                </div>
            </div>

            {/* ── Detail Images ── */}
            <div className="product-detail-images-container">
                <div className="container">
                    <div className="row">
                        {detailImages.map((src, index) => (
                            <div key={index} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="Product-Detail-Box">
                                    <img
                                        src={src}
                                        alt={`${product.name} view ${index + 1}`}
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/600?text=No+Image'; }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Modals & Sidebar ── */}
            <CompareSidebar
                isOpen={isCompareOpen}
                onClose={() => setIsCompareOpen(false)}
                productsToCompare={compareList}
                onRemoveProduct={handleRemoveFromCompare}
            />
            <QuestionModal
                isOpen={isQuestionOpen}
                onClose={() => setIsQuestionOpen(false)}
                productName={product.name}
                productId={product.id}
            />
            <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        </>
    );
}