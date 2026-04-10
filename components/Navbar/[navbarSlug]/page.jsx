'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FaRegHeart } from "react-icons/fa";
import { BsShare, BsQuestionCircle, BsArrowLeftRight, BsX, BsTruck, BsArrowLeftShort, BsArrowRightShort } from "react-icons/bs";
import { useCart } from '../../../Context/CartContext';
import "./navbarDetail.css";

const API_URL = "https://api.bitcoinbutik.com";
const MEDIA_URL = "https://api.bitcoinbutik.com";
const STOCK_STORAGE_KEY = 'product_stock_values';

// ✅ FIX: Accept slug as a prop (passed from page.jsx) instead of useParams
// This avoids issues with params not being available during SSR

const slugToSearchTerm = (slug) => slug.replace(/-/g, ' ');

const formatImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http')) return imgPath;
    return `${MEDIA_URL}/${imgPath.replace(/^\//, '').replace(/\\/g, '/')}`;
};

const getDeliveryDateRange = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 7);
    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${months[date.getMonth()]}`;
    };
    return `${formatDate(today)} - ${formatDate(deliveryDate)}, ${deliveryDate.getFullYear()}`;
};

const SIZE_CATEGORIES = ['pendant', 'ring'];

const getSizesByCategory = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('earring') || c.includes('bracelet')) return [];
    if (c.includes('ring')) {
        return [
            { name: 'Size 5', available: true },
            { name: 'Size 6', available: true },
            { name: 'Size 7', available: true },
            { name: 'Size 8', available: true },
            { name: 'Size 9', available: true },
            { name: 'Size 10', available: true },
        ];
    }
    if ((c.includes('man') || c.includes('men')) && c.includes('pendant')) {
        return [
            { name: '22 inch', available: true },
            { name: '24 inch', available: true },
        ];
    }
    if ((c.includes('woman') || c.includes('women')) && c.includes('pendant')) {
        return [
            { name: '16 inch', available: true },
            { name: '18 inch', available: true },
            { name: '20 inch', available: true },
        ];
    }
    if (c.includes('pendant') || c.includes('necklace')) {
        return [
            { name: '16 inch', available: true },
            { name: '18 inch', available: true },
            { name: '20 inch', available: true },
        ];
    }
    return [];
};

const categoryNeedsSize = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('earring') || c.includes('bracelet')) return false;
    return SIZE_CATEGORIES.some(cat => c.includes(cat));
};

const getSizeLabelByCategory = (category) => {
    const c = (category || '').toLowerCase();
    if (c.includes('ring')) return 'Ring Size:';
    if (c.includes('pendant') || c.includes('necklace')) return 'Length:';
    return 'Size:';
};

const formatProductData = (productData) => {
    if (!productData) return null;
    const gramsValue = productData.grams !== undefined && productData.grams !== null
        ? Number(productData.grams) : 1;
    const productCategory = productData.category || productData.type || 'pendant';
    const dynamicSizes = getSizesByCategory(productCategory);
    return {
        id: productData.id || productData._id,
        name: productData.name || productData.title || 'Unknown Product',
        price: productData.price || 0,
        goldPrice: productData.goldPrice || 0,
        type: productData.type || productCategory,
        category: productCategory,
        description: productData.description || "No description available.",
        images: (productData.images || productData.image || [])
            .filter(img => img)
            .map(imgPath => formatImageUrl(imgPath)),
        video: productData.video ? formatImageUrl(productData.video) : null,
        stock: productData.stock || 0,
        grams: gramsValue,
        breadcrumbs: ['Home', 'Products', productCategory, productData.name || productData.title || 'Product'],
        priceInfo: "Taxes and duties included",
        variationInfo: "Also available in other materials",
        sizes: dynamicSizes
    };
};

const getStockFromLocalStorage = (productId) => {
    try {
        const savedStocks = localStorage.getItem(STOCK_STORAGE_KEY);
        if (savedStocks) {
            const stockValues = JSON.parse(savedStocks);
            return stockValues[productId] !== undefined ? stockValues[productId] : 0;
        }
    } catch (error) {
        console.error('Error loading stock from localStorage:', error);
    }
    return 0;
};

const StarIcon = () => <span className="star-icon">☆</span>;

// ── Share Modal ──
const ShareModal = ({ isOpen, onClose }) => {
    const [copySuccess, setCopySuccess] = useState('');
    useEffect(() => { if (isOpen) setCopySuccess(''); }, [isOpen]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch {
            setCopySuccess('Failed to copy!');
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

// ── Question Modal ──
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
                body: JSON.stringify({ ...formData, productName, productId: productId || '' })
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
            setSubmitMessage('Network error. Please try again.');
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
                        <label htmlFor="q-name">Name *</label>
                        <input type="text" id="q-name" name="name" value={formData.name}
                            onChange={handleInputChange} required placeholder="Your Name"
                            disabled={isSubmitting} minLength="2" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="q-email">Email *</label>
                        <input type="email" id="q-email" name="email" value={formData.email}
                            onChange={handleInputChange} required placeholder="your@email.com"
                            disabled={isSubmitting} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="q-question">Your Question *</label>
                        <textarea id="q-question" name="question" value={formData.question}
                            onChange={handleInputChange} rows="4" required
                            placeholder="Type your question here..."
                            disabled={isSubmitting} minLength="10"></textarea>
                    </div>
                    <button type="submit" className="pdp-btn pdp-submit-question" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Question'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ── Compare Sidebar ──
const CompareSidebar = ({ isOpen, onClose, productsToCompare, onRemoveProduct }) => (
    <>
        <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
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
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/default-image.jpg'; }} />
                                <div className="compare-product-info">
                                    <h4>{p.name}</h4>
                                    <span>${p.price?.toFixed(2)} - ${p.goldPrice?.toFixed(2)}</span>
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

// ── Product Image with shimmer ──
const ProductImage = ({ src, alt, className, style }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#f8f4ef', ...style }}>
            {!loaded && !error && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite'
                }} />
            )}
            {!error ? (
                <img src={src} alt={alt} className={className}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: loaded ? 'block' : 'none' }}
                    onLoad={() => setLoaded(true)}
                    onError={() => { setError(true); setLoaded(true); }} />
            ) : (
                <div style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', color: '#c9a84c', gap: 8
                }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span style={{ fontSize: 12, color: '#999' }}>Image not available</span>
                </div>
            )}
        </div>
    );
};

// ── MAIN COMPONENT ──
// ✅ FIX: Accept `slug` as a prop from page.jsx instead of using useParams directly
const NavbarDetail = ({ slug }) => {
    const router = useRouter();
    const { addToCart } = useCart();

    // ✅ FIX: Use the slug prop passed from page.jsx
    const productSlug = slug;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isAddedToCart, setIsAddedToCart] = useState(false);

    const [isCompareOpen, setIsCompareOpen] = useState(false);
    const [isQuestionOpen, setIsQuestionOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [compareList, setCompareList] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [stockValue, setStockValue] = useState(0);

    const getCurrentPrice = () => {
        if (!product) return 0;
        if (selectedType === 'Gold') return product.goldPrice;
        if (selectedType === 'Silver') return product.price;
        return product.price;
    };

    const loadStockValue = (prodId) => {
        const stock = getStockFromLocalStorage(prodId);
        setStockValue(stock);
    };

    const fetchLatestStock = async (prodId) => {
        try {
            const res = await fetch(`${API_URL}/api/products/${prodId}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            const stock = data.stock !== undefined ? data.stock : 0;
            const grams = data.grams !== undefined ? Number(data.grams) : 1;
            setStockValue(stock);
            if (product) setProduct(prev => ({ ...prev, stock, grams }));
            const savedStocks = JSON.parse(localStorage.getItem(STOCK_STORAGE_KEY) || '{}');
            savedStocks[prodId] = stock;
            localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(savedStocks));
            return stock;
        } catch (error) {
            console.error('Error fetching stock:', error);
            return stockValue;
        }
    };

    // ✅ FIX: Fetch product using the slug prop
    useEffect(() => {
        if (!productSlug) return;
        window.scrollTo(0, 0);

        const fetchProductByName = async () => {
            setLoading(true);
            setError(null);
            setProduct(null);

            try {
                // ✅ Convert slug back to search term: "airborne-bitcoin-pendant" → "airborne bitcoin pendant"
                const searchTerm = slugToSearchTerm(productSlug);
                console.log('Searching for product:', searchTerm); // Debug log

                const response = await fetch(`${API_URL}/api/products`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const allProducts = await response.json();

                console.log('Total products fetched:', allProducts.length); // Debug log

                // ✅ FIX: Try multiple matching strategies
                let foundProduct = allProducts.find(p =>
                    p.title?.toLowerCase() === searchTerm.toLowerCase()
                );

                // Fallback: partial match
                if (!foundProduct) {
                    foundProduct = allProducts.find(p =>
                        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        searchTerm.toLowerCase().includes(p.title?.toLowerCase())
                    );
                }

                // Fallback: slug-based match
                if (!foundProduct) {
                    foundProduct = allProducts.find(p => {
                        const titleSlug = p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                        return titleSlug === productSlug.toLowerCase();
                    });
                }

                console.log('Found product:', foundProduct?.title); // Debug log

                if (!foundProduct) throw new Error('Product not found');

                const formattedApiProduct = {
                    ...foundProduct,
                    name: foundProduct.title,
                    images: foundProduct.image,
                    video: foundProduct.video,
                    stock: foundProduct.stock,
                    grams: foundProduct.grams,
                    category: foundProduct.category
                };

                const formattedProduct = formatProductData(formattedApiProduct);
                setProduct(formattedProduct);
                loadStockValue(foundProduct._id);
                fetchLatestStock(foundProduct._id);

            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.message);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProductByName();
    }, [productSlug]); // ✅ FIX: Depend on productSlug prop

    // ── Stock polling every 3s ──
    useEffect(() => {
        if (!product?.id) return;
        const interval = setInterval(() => { fetchLatestStock(product.id); }, 3000);
        return () => clearInterval(interval);
    }, [product?.id]);

    // ── Visibility change ──
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && product?.id) fetchLatestStock(product.id);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [product?.id]);

    useEffect(() => { setIsAddedToCart(false); }, [selectedSize, selectedType]);

    const mediaItems = useMemo(() => {
        if (!product) return [];
        const items = [];
        if (product.images?.length > 0) {
            product.images.forEach(imgSrc => {
                if (imgSrc) items.push({ type: 'image', src: imgSrc, thumbnail: imgSrc });
            });
        }
        if (product.video) {
            items.push({ type: 'video', src: product.video, thumbnail: product.images?.[0] || '' });
        }
        return items;
    }, [product]);

    useEffect(() => { setCurrentMediaIndex(0); }, [productSlug]);

    const handleAddToCompare = () => {
        if (!product) return;
        if (!compareList.some(item => item.id === product.id)) {
            setCompareList(prev => [...prev, product]);
        }
        setIsCompareOpen(true);
    };

    const handleRemoveFromCompare = (id) => {
        setCompareList(prev => prev.filter(p => p.id !== id));
    };

    const isOptionsSelectedForAddToCart = () => {
        if (!product) return false;
        const needsSize = categoryNeedsSize(product.category);
        if (needsSize) return !!selectedSize && !!selectedType;
        return !!selectedType;
    };

    const getAddToCartButtonText = () => {
        if (!product) return 'Add to cart';
        if (stockValue <= 0) return 'Out of Stock';
        const needsSize = categoryNeedsSize(product.category);
        if (needsSize) {
            if (!selectedSize && !selectedType) return 'Select size and type';
            if (!selectedSize) return 'Select size';
            if (!selectedType) return 'Select type';
        } else {
            if (!selectedType) return 'Select type';
        }
        return 'Add to cart';
    };

    const handleAddToCart = async () => {
        if (!product || !isOptionsSelectedForAddToCart()) {
            alert('Please select the required options before adding to cart!');
            return;
        }
        const latestStock = await fetchLatestStock(product.id);
        if (latestStock <= 0) { alert('This product is out of stock!'); return; }
        if (quantity > latestStock) { alert(`Only ${latestStock} items available in stock!`); return; }

        const currentPrice = getCurrentPrice();
        const needsSize = categoryNeedsSize(product.category);
        const productToAdd = {
            ...product,
            price: currentPrice,
            selectedPrice: currentPrice,
            selectedType,
            selectedOptions: {
                ...(selectedType && { type: selectedType }),
                ...(needsSize && selectedSize && { size: selectedSize })
            }
        };

        addToCart(productToAdd, selectedSize || 'N/A', quantity);
        setIsAddedToCart(true);

        let message = `${product.name}`;
        const options = [];
        if (selectedType) options.push(`Type: ${selectedType}`);
        if (needsSize && selectedSize) options.push(`Size: ${selectedSize}`);
        if (options.length > 0) message += ` (${options.join(', ')})`;
        message += ` added to cart! Price: $${currentPrice.toFixed(2)}`;
        alert(message);
    };

    const handleBuyNow = () => {
        if (!isAddedToCart) { alert('Please add the product to cart first!'); return; }
        router.push('/checkout');
    };

    const handlePrevMedia = () => {
        setCurrentMediaIndex(prev => (prev === 0 ? mediaItems.length - 1 : prev - 1));
    };

    const handleNextMedia = () => {
        setCurrentMediaIndex(prev => (prev + 1) % mediaItems.length);
    };

    const increaseQuantity = () => {
        if (quantity < stockValue) setQuantity(prev => prev + 1);
        else alert(`Maximum available stock: ${stockValue}`);
    };
    const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="tab-pane">
                        <h3>Description & Details</h3>
                        <p className="product-description">{product.description}</p>
                        <ul>
                            <li className="detail-item"><strong>Type:</strong> {product.category || product.type}</li>
                            <li className="detail-item"><strong>Purity:</strong> Gold Vermeil or 92.5 Sterling silver</li>
                            <li className="detail-item"><strong>Gross Wt in Grms:</strong> <span>{Number(product.grams).toFixed(2)}g</span></li>
                        </ul>
                    </div>
                );
            case 'shipping':
                return (
                    <div className="tab-pane">
                        <p>Shipping cost is based on weight. Just add products to your cart and use the Shipping Calculator to see the shipping price.</p>
                        <p>We want you to be 100% satisfied with your purchase. Items can be returned or exchanged within 30 days of delivery.</p>
                    </div>
                );
            case 'reviews':
                return (
                    <div className="tab-pane">
                        <div className="section-header">
                            <h3>Rating & Review</h3>
                            <a href="#" className="action-link">Write a review</a>
                        </div>
                        <div className="rating-summary">
                            <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                            <span>Based on 0 Reviews</span>
                        </div>
                        <p className="empty-state-text">There are no reviews yet.</p>
                    </div>
                );
            case 'questions':
                return (
                    <div className="tab-pane">
                        <div className="section-header">
                            <h3>Question & Answer</h3>
                            <button onClick={() => setIsQuestionOpen(true)} className="action-link">Ask a Question</button>
                        </div>
                        <div className="question-summary"><span>0 Questions</span></div>
                        <p className="empty-state-text">There are no questions found.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) return (
        <div className="pdp-loading" style={{ textAlign: 'center', padding: '4rem', color: '#c9a84c' }}>
            Loading Product Details...
        </div>
    );
    if (error) return (
        <div className="pdp-error" style={{ textAlign: 'center', padding: '4rem', color: '#e53e3e' }}>
            Error: {error}
        </div>
    );
    if (!product) return (
        <div className="pdp-loading" style={{ textAlign: 'center', padding: '4rem' }}>
            Product not found.
        </div>
    );

    const currentMedia = mediaItems[currentMediaIndex];
    const detailImages = product.images.slice(0, 3);
    const sizeLabel = getSizeLabelByCategory(product.category);

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            <div className="product-pdp-page-wrapper">
                <div className="pdp-page-wrapper">
                    <div className="pdp-main-content">

                        {/* ── Media ── */}
                        <div className="pdp-main-media-container"
                            style={{ position: 'relative', overflow: 'hidden', borderRadius: 8, background: '#f8f4ef' }}>
                            {currentMedia && currentMedia.type === 'image' ? (
                                <ProductImage
                                    src={currentMedia.src}
                                    alt={`${product.name} view ${currentMediaIndex + 1}`}
                                    className="pdp-main-media"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : currentMedia && currentMedia.type === 'video' ? (
                                <video src={currentMedia.src} className="pdp-main-media"
                                    autoPlay loop muted playsInline key={currentMedia.src}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div className="pdp-no-image"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#999' }}>
                                    No Media Available
                                </div>
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

                        {/* ── Details ── */}
                        <div className="pdp-details-container">
                            <div className="pdp-header">
                                <h1 className="pdp-title">{product.name}</h1>
                            </div>

                            <div className="pdp-price-review-row">
                                <span className="pdp-price">
                                    {selectedType
                                        ? `$${getCurrentPrice()?.toFixed(2)}`
                                        : `$${product.price?.toFixed(2)} - $${product.goldPrice?.toFixed(2)}`}
                                </span>
                                <div className="pdp-reviews">
                                    <span className="pdp-stars">☆☆☆☆☆</span>
                                    <a href="#reviews" className="pdp-review-count">(0 reviews)</a>
                                </div>
                            </div>

                            <div className="pdp-options-grid">
                                {categoryNeedsSize(product.category) && (
                                    <div className="pdp-option-group">
                                        <label className="pdp-option-label" htmlFor="size-select">{sizeLabel}</label>
                                        <select id="size-select" className="pdp-select"
                                            value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                                            <option value="" disabled>Choose an option</option>
                                            {product.sizes?.map((size) => (
                                                <option key={size.name} value={size.name} disabled={!size.available}>
                                                    {size.name}{!size.available && ' (Out of stock)'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="pdp-option-group">
                                    <label className="pdp-option-label" htmlFor="type-select">Type:</label>
                                    <select id="type-select" className="pdp-select"
                                        value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                        <option value="" disabled>Choose an option</option>
                                        <option value="Gold">Gold Vermeil ${product.goldPrice?.toFixed(2)}</option>
                                        <option value="Silver">Silver ${product.price?.toFixed(2)}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="Product-Quantity">Quantity</div>
                            <div className="pdp-cart-row">
                                <div className="pdp-quantity-selector">
                                    <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={increaseQuantity} disabled={quantity >= stockValue}>+</button>
                                </div>
                                <button className="pdp-btn pdp-add-to-cart" onClick={handleAddToCart}
                                    disabled={!isOptionsSelectedForAddToCart() || stockValue <= 0}>
                                    {getAddToCartButtonText()}
                                </button>
                            </div>

                            <div className="pdp-actions">
                                <button className="pdp-btn pdp-buy-now" onClick={handleBuyNow} disabled={!isAddedToCart}>
                                    {isAddedToCart ? 'Buy Now' : 'Add to cart first'}
                                </button>
                            </div>

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
                                borderRadius: '8px', display: 'flex', alignItems: 'center',
                                gap: '8px', fontSize: '15px', fontWeight: '500',
                                color: stockValue > 0 ? '#1e40af' : '#991b1b'
                            }}>
                                <span style={{ fontWeight: '600' }}>Stock:</span>
                                <span style={{ fontSize: '16px', fontWeight: '700', color: stockValue > 0 ? '#059669' : '#dc2626' }}>
                                    {stockValue}
                                </span>
                                <span style={{ marginLeft: 'auto', fontSize: '13px', opacity: 0.8 }}>
                                    {stockValue > 0
                                        ? `${stockValue} ${stockValue === 1 ? 'item' : 'items'} available`
                                        : 'Currently unavailable'}
                                </span>
                            </div>

                            <div className="pdp-delivery-info">
                                <div className="pdp-delivery-item">
                                    <BsTruck className="pdp-delivery-icon" />
                                    <div>
                                        <strong>Shipping may be delayed due to unforeseen circumstances.</strong>
                                        <span>{getDeliveryDateRange()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="Payment-component">
                                <img src="/product-trust-badge.png" alt="Secure Checkout"
                                    onError={(e) => { e.target.style.display = 'none'; }} />
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
                        {['details', 'reviews', 'shipping', 'questions'].map(tab => (
                            <button key={tab}
                                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}>
                                {tab === 'details' ? 'Product details'
                                    : tab === 'reviews' ? 'Reviews'
                                        : tab === 'shipping' ? 'Shipping and Returns'
                                            : 'Questions'}
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
                        {detailImages.map((imageSrc, index) => (
                            <div key={index} className="col-12 col-md-6 col-lg-4 mb-4">
                                <div className="Product-Detail-Box">
                                    <ProductImage
                                        src={imageSrc}
                                        alt={`${product.name} view ${index + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Modals ── */}
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
};

export default NavbarDetail;