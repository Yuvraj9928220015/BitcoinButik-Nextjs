'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCart } from '../../app/Context/CartContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { CiMenuBurger, CiSearch } from 'react-icons/ci';
import { TbUser } from 'react-icons/tb';
import { SlHandbag } from 'react-icons/sl';
import { IoClose } from 'react-icons/io5';
import { FaEye, FaEyeSlash, FaHeart, FaGem, FaBoxOpen, FaRegClock, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { GoDash, GoPlus } from 'react-icons/go';
import { BsArrowLeftShort, BsArrowRightShort } from 'react-icons/bs';
import './Navbar.css';
import AddedToCartNotification from '../../app/Context/AddedToCartNotification';

// ─────────────────────────────────────────────
// ✅ FIX 1: API_URL sahi set karo — empty string nahi
// ─────────────────────────────────────────────
const API_URL = "https://api.bitcoinbutik.com";
const MEDIA_URL = "https://api.bitcoinbutik.com";
// ─────────────────────────────────────────────
// Slug Helper
// ─────────────────────────────────────────────
const createSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ─────────────────────────────────────────────
// ✅ FIX 2: getProductUrl
//    EARRING check PEHLE aana chahiye RING se
//    kyunki 'earring'.includes('ring') === true ← yahi bug tha!
//    Isliye earrings ring URL pe ja rahi thi
// ─────────────────────────────────────────────
const getProductUrl = (productName, category) => {
  const slug = createSlug(productName);
  const cat = (category || '').toLowerCase();

  if (cat.includes('woman') || cat.includes('women')) {
    return `/collections/pendants/pendant-women/${slug}`;
  }
  if (cat.includes('man') || cat.includes('men')) {
    return `/collections/pendants/pendant-mens/${slug}`;
  }
  // ✅ CRITICAL FIX: earring CHECK PEHLE karo, ring ke pehle!
  // 'earring' contains 'ring' — agar ring pehle check hota to earring
  // bhi /rings/ URL pe jaati thi. Yahi bug tha.
  if (cat.includes('earring')) {
    return `/collections/earrings/${slug}`;
  }
  if (cat.includes('ring')) {
    return `/collections/rings/${slug}`;
  }
  if (cat.includes('bracelet')) {
    return `/collections/bracelets/${slug}`;
  }
  // Default fallback
  return `/collections/pendants/pendant-women/${slug}`;
};

const formatImageUrl = (imgPath) => {
  if (!imgPath) return '/default-image.jpg';
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
  const cleanPath = imgPath.replace(/^\//, '').replace(/\\/g, '/');
  return `${MEDIA_URL}/${cleanPath}`;
};

// ─────────────────────────────────────────────
// Shopping Cart Overlay
// ─────────────────────────────────────────────
const ShoppingCartPage = ({ isOpen, closeCart, items, subtotal, updateQuantity, removeFromCart }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleCompletePurchase = (e) => {
    e.preventDefault();
    closeCart();
    router.push('/checkout');
  };

  const cartOverlay = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
      onClick={closeCart}
    >
      <div
        className="shopping-page-overlay"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: 'linear-gradient(135deg, #f5e6c8 0%, #e8d5b0 50%, #d4b896 100%)',
          overflowY: 'auto',
        }}
      >
        <button
          className="shopping-page-close-btn"
          onClick={closeCart}
          aria-label="Close cart"
          style={{ position: 'fixed', top: 20, right: 24, zIndex: 100001, background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: '#333' }}
        >
          <IoClose />
        </button>

        <div className="shopping-page-container">
          <main className="shopping-page-main">
            <div className="shopping-page-header-main">
              <h1 className="shopping-page-title">Shopping bag</h1>
            </div>

            {items.length === 0 ? (
              <div className="cart-empty" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <p>Your shopping bag is empty.</p>
                <p>Start shopping to add items to your cart!</p>
              </div>
            ) : (
              items.map((item) => {
                const itemId = item.cartItemId || item.cartId;
                return (
                  <div className="cart-item-full" key={itemId}>
                    <div className="cart-item-full-image">
                      <img
                        src={item.image || '/default-image.jpg'}
                        alt={item.name}
                        onError={(e) => { e.target.src = '/default-image.jpg'; }}
                      />
                    </div>
                    <div className="cart-item-full-details">
                      <p className="item-name">{item.name}</p>
                      {item.size && <p className="item-size">Size: {item.size}</p>}
                      <div className="quantity-control-page">
                        <span>Quantity: {item.quantity}</span>
                        <div>
                          <button onClick={() => updateQuantity(itemId, -1)} disabled={item.quantity <= 1}>-</button>
                          <button onClick={() => updateQuantity(itemId, 1)}>+</button>
                        </div>
                      </div>
                      <p className="item-price">
                        ${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <button className="item-remove" onClick={() => removeFromCart(itemId)}>REMOVE</button>
                    </div>
                    <div className="cart-item-full-code">
                      <span>Product ID: {item.productId}</span>
                    </div>
                  </div>
                );
              })
            )}
          </main>

          <aside className="order-summary-sidebar">
            <div className="summary-box">
              <h2 className="summary-title">Order Summary</h2>
              <div className="summary-line">
                <span>Subtotal ({items.length} items)</span>
                <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <p className="summary-note-taxes">Excluding shipping and taxes</p>
              <button
                className="complete-purchase-btn"
                onClick={handleCompletePurchase}
                style={{ display: 'block', width: '100%', textAlign: 'center', cursor: 'pointer' }}
              >
                COMPLETE PURCHASE
              </button>
              <ul className="summary-info-list">
                <li>Complimentary standard shipping within 2 to 4 working days.</li>
                <li>Complimentary &ldquo;Click &amp; Collect&rdquo; option available from all our Boutiques in the US.</li>
                <li>You may return a piece within 30 days from the date of delivery.</li>
                <li>Perfumes and personalized orders cannot be returned.</li>
                <li>We do not ship to PO boxes, UPS locations, Freight Forwarders or hotels.</li>
                <li>Signature required on all purchases over $300.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );

  return createPortal(cartOverlay, document.body);
};

// ─────────────────────────────────────────────
// ProductItem Component
// ─────────────────────────────────────────────
const ProductItem = ({ item, onProductClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageArray, setImageArray] = useState([]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let images = [];
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      images = item.images.map((img) => formatImageUrl(img));
    } else if (item.image) {
      images = [formatImageUrl(item.image)];
    }
    setImageArray(images);
    setImgError(false);
    setImgLoaded(false);
    setCurrentImageIndex(0);
  }, [item]);

  useEffect(() => {
    let interval;
    if (isHovered && imageArray.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageArray.length);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isHovered, imageArray.length]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageArray.length);
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onProductClick) onProductClick(item);
  };

  const currentSrc = imageArray[currentImageIndex] || '/default-image.jpg';

  return (
    <div
      className="featured-item product-carousel-item"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentImageIndex(0); }}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      <div style={{ width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {!imgLoaded && !imgError && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        )}
        {!imgError ? (
          <img
            src={currentSrc}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: imgLoaded ? 'block' : 'none', transition: 'opacity 0.3s ease' }}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f4ef', color: '#c9a84c', fontSize: '12px', gap: '8px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ fontSize: '10px', color: '#999' }}>Image</span>
          </div>
        )}
        {imageArray.length > 1 && isHovered && imgLoaded && !imgError && (
          <>
            <button className="image-nav-btn prev-btn" onClick={handlePrevImage}
              style={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <BsArrowLeftShort />
            </button>
            <button className="image-nav-btn next-btn" onClick={handleNextImage}
              style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              <BsArrowRightShort />
            </button>
            <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, zIndex: 2 }}>
              {imageArray.map((_, index) => (
                <button key={index} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                  style={{ width: 6, height: 6, borderRadius: '50%', border: 'none', cursor: 'pointer', background: index === currentImageIndex ? '#c9a84c' : '#ccc', padding: 0 }} />
              ))}
            </div>
            <div style={{ position: 'absolute', top: 4, right: 6, fontSize: 11, background: 'rgba(0,0,0,0.5)', color: '#fff', borderRadius: 4, padding: '1px 5px', zIndex: 2 }}>
              {currentImageIndex + 1} / {imageArray.length}
            </div>
          </>
        )}
      </div>
      <h4 style={{ marginTop: 8, marginBottom: 2, fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{item.name}</h4>
      {item.price && <p style={{ fontSize: 12, color: '#888', margin: 0 }}>${item.price} - ${item.goldPrice}</p>}
    </div>
  );
};

// ─────────────────────────────────────────────
// Helper: Products fetch
// ─────────────────────────────────────────────
const fetchProductsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_URL}/api/products?category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return {
      collections: data.map((product) => {
        const rawImages = product.image && product.image.length > 0 ? product.image : [];
        const images = rawImages.map((imgPath) => formatImageUrl(imgPath));
        const firstImage = images[0] || '/default-image.jpg';
        return {
          name: product.title,
          image: firstImage,
          images,
          id: product._id,
          price: product.price,
          goldPrice: product.goldPrice,
          category: product.category,
          productData: product,
        };
      }),
    };
  } catch (error) {
    console.error(`Error fetching ${category} products:`, error);
    return { collections: [] };
  }
};

// ─────────────────────────────────────────────
// Main Navbar Component
// ─────────────────────────────────────────────
const Navbar = () => {
  const {
    cartCount, isCartOpen, openCart, closeCart,
    cartItems, subtotal, updateQuantity, removeFromCart,
    addedItemNotification, closeAddedToCartNotification,
  } = useCart();

  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState('Pendants');
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);
  const [isInsideBvlgariOpen, setIsInsideBvlgariOpen] = useState(false);
  const [isPendantsOpen, setIsPendantsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [signupTitle, setSignupTitle] = useState('');
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupCountry, setSignupCountry] = useState('United States');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupConfirmEmail, setSignupConfirmEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [newsletterAgreed, setNewsletterAgreed] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const [menPendantsData, setMenPendantsData] = useState({ collections: [] });
  const [womenPendantsData, setWomenPendantsData] = useState({ collections: [] });
  const [ringsData, setRingsData] = useState({ collections: [] });
  const [earringsData, setEarringsData] = useState({ collections: [] });
  const [braceletsData, setBraceletsData] = useState({ collections: [] });
  const [pendantsData, setPendantsData] = useState({ collections: [] });
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    const loadAllCategories = async () => {
      setIsLoadingProducts(true);
      try {
        const [menPendants, womenPendants, rings, earrings, bracelets, allPendants] = await Promise.all([
          fetchProductsByCategory('man pendant'),
          fetchProductsByCategory('woman pendant'),
          fetchProductsByCategory('ring'),
          fetchProductsByCategory('earring'),
          fetchProductsByCategory('bracelet'),
          fetchProductsByCategory('pendant'),
        ]);
        setMenPendantsData(menPendants);
        setWomenPendantsData(womenPendants);
        setRingsData(rings);
        setEarringsData(earrings);
        setBraceletsData(bracelets);
        setPendantsData(allPendants);
      } catch (error) {
        console.error('Error loading product categories:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    loadAllCategories();
  }, []);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
      } else {
        Cookies.remove('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      Cookies.remove('token');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else if (!isCartOpen) {
      document.body.style.overflow = '';
    }
    return () => { if (!isCartOpen) document.body.style.overflow = ''; };
  }, [isMenuOpen, isCartOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleSearch = () => setIsSearchOpen((prev) => !prev);
  const toggleLogin = () => { setIsLoginOpen((prev) => !prev); setIsSignupOpen(false); setLoginError(''); setShowLoginPassword(false); };
  const toggleSignup = () => { setIsSignupOpen((prev) => !prev); setIsLoginOpen(false); setSignupError(''); setShowSignupPassword(false); setShowSignupConfirmPassword(false); };
  const handleMenuLinkClick = (menuName) => { if (menuName) setActiveSubMenu(menuName); };

  const closeMenuAndNavigate = () => {
    setIsMenuOpen(false);
    setActiveSubMenu('Pendants');
    setIsCollectionsOpen(true);
    setIsPendantsOpen(false);
  };

  // ─────────────────────────────────────────────
  // ✅ FIX 3: window.location.href — page force reload
  //    router.push se page remount nahi hota isliye
  //    product data change nahi hoti thi
  // ─────────────────────────────────────────────
  const handleProductClick = (productItem) => {
    if (productItem && productItem.name) {
      setIsMenuOpen(false);
      setActiveSubMenu('Pendants');
      setIsPendantsOpen(false);

      const targetUrl = getProductUrl(productItem.name, productItem.category);

      console.log('Product clicked:', productItem.name);
      console.log('Category:', productItem.category);
      console.log('Navigating to:', targetUrl);

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 150);
    }
  };

  const handleCategoryNavigation = (category) => {
    setIsMenuOpen(false);
    setActiveSubMenu('Pendants');
    setTimeout(() => {
      switch (category.toLowerCase()) {
        case 'men': case 'man': window.location.href = '/collections/pendants/pendant-mens'; break;
        case 'women': case 'woman': window.location.href = '/collections/pendants/pendant-women'; break;
        case 'rings': window.location.href = '/collections/rings'; break;
        case 'earrings': window.location.href = '/collections/earrings'; break;
        case 'bracelets': window.location.href = '/collections/bracelets'; break;
        default: window.location.href = '/';
      }
    }, 100);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Cookies.set('token', data.token, { expires: 7 });
        setIsAuthenticated(true); setUser(data.user);
        setLoginEmail(''); setLoginPassword(''); setIsLoginOpen(false);
        alert(data.message);
        router.push('/');
      } else {
        setLoginError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setLoginError('Network error or server unavailable. Please try again.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    if (signupPassword !== signupConfirmPassword) { setSignupError('Passwords do not match.'); return; }
    if (signupEmail !== signupConfirmEmail) { setSignupError('Emails do not match.'); return; }
    if (!termsAgreed) { setSignupError('You must agree to the privacy information to create an account.'); return; }
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: signupTitle, firstName: signupFirstName, lastName: signupLastName, country: signupCountry, email: signupEmail, password: signupPassword, termsAgreed, newsletterAgreed }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Cookies.set('token', data.token, { expires: 7 });
        setIsAuthenticated(true); setUser(data.user); setIsSignupOpen(false);
        alert(data.message);
        router.push('/');
      } else {
        setSignupError(data.message || 'Signup failed. Please try again.');
      }
    } catch {
      setSignupError('Network error or server unavailable. Please try again.');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    setIsAuthenticated(false);
    setUser(null);
    alert('You have been logged out.');
    router.push('/');
  };

  const renderSubMenuContent = () => {
    let dataToShow = [];
    switch (activeSubMenu) {
      case 'Men Pendants': case 'Mans Pendants': dataToShow = menPendantsData.collections; break;
      case 'Women Pendants': case 'Womans Pendants': dataToShow = womenPendantsData.collections; break;
      case 'Rings': dataToShow = ringsData.collections; break;
      case 'Earrings': dataToShow = earringsData.collections; break;
      case 'Bracelets': dataToShow = braceletsData.collections; break;
      case 'Pendants': dataToShow = [...womenPendantsData.collections.slice(0, 2), ...menPendantsData.collections.slice(0, 2)]; break;
      default: dataToShow = pendantsData.collections; break;
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, padding: 16, overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
        {isLoadingProducts ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} style={{ borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ aspectRatio: '1/1', background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 4 }} />
              <div style={{ height: 14, background: '#f0f0f0', borderRadius: 4, marginTop: 8, width: '80%' }} />
              <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, marginTop: 6, width: '50%' }} />
            </div>
          ))
        ) : dataToShow.length > 0 ? (
          dataToShow.map((item, index) => (
            <ProductItem key={`${item.id}-${index}`} item={item} onProductClick={handleProductClick} />
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#999' }}>
            <p>No products found.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>

      <AddedToCartNotification item={addedItemNotification} onClose={closeAddedToCartNotification} />

      <div className="app">
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
          <div className="navbar-container">
            <button className="menu-btn" onClick={toggleMenu}><CiMenuBurger /> Menu</button>
            <div className="logo">
              <Link href="/"><span className="logo-text"><img src="/bitcoine.png" alt="BitcoinButik logo" /></span></Link>
            </div>
            <div className="navbar-icons">
              <a href="https://www.instagram.com/bitcoin_butik?igsh=NnFrZWpqeGZseXh6" target="_blank" rel="noopener noreferrer" className="icon-btn social-icon" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://x.com/bitcoin_butik?s=11&t=qPEvrBs4oZJqZ6h48OJZ7Q" target="_blank" rel="noopener noreferrer" className="icon-btn social-icon" aria-label="X Twitter"><FaXTwitter /></a>
              {windowWidth > 768 && (<button className="icon-btn" onClick={toggleSearch}><CiSearch /></button>)}
              {isAuthenticated ? (
                <button className="icon-btn" onClick={handleLogout}><div className="icon-btn-User"></div></button>
              ) : (
                <button className="icon-btn" onClick={toggleLogin}><TbUser /></button>
              )}
              <button className="icon-btn cart-btn" onClick={openCart}>
                <SlHandbag />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </button>
            </div>
          </div>
        </nav>

        {isSearchOpen && (
          <div className="search-fullscreen-overlay">
            <button className="search-close-btn" onClick={toggleSearch}><IoClose /> Close</button>
            <div className="search-fullscreen-container">
              <CiSearch className="search-input-icon" />
              <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-fullscreen-input" autoFocus />
            </div>
            <div className="search-suggestions">
              <p>POPULAR SEARCHES</p>
              <Link href="/collections/pendants/pendant-women" onClick={toggleSearch}>Women Pendants</Link>
              <Link href="/collections/pendants/pendant-mens" onClick={toggleSearch}>Men Pendants</Link>
              <Link href="/collections/earrings" onClick={toggleSearch}>Earrings</Link>
              <Link href="/collections/rings" onClick={toggleSearch}>Rings</Link>
              <Link href="/collections/bracelets" onClick={toggleSearch}>Bracelets</Link>
            </div>
          </div>
        )}

        {isMenuOpen && (
          <div onClick={closeMenuAndNavigate} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, backdropFilter: 'blur(2px)' }} />
        )}

        <div className={`sidebar-menu ${isMenuOpen ? 'open' : ''}`} style={{ zIndex: 1000 }}>
          <div className="sidebar-header">
            <button className="close-btn" onClick={toggleMenu}><IoClose /> Close</button>
          </div>
          <div className="menu-layout">
            <div className="menu-left-pane">
              <div className="menu-section">
                <h3 className="menu-section-header">
                  <span><Link href="/" onClick={closeMenuAndNavigate}>HOME</Link></span>
                </h3>
                <h3 className="menu-section-header" onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}>
                  <span>COLLECTIONS</span>
                  {isCollectionsOpen ? <GoDash /> : <GoPlus />}
                </h3>
                {isCollectionsOpen && (
                  <ul className="menu-main-list">
                    <li className={activeSubMenu.includes('Pendants') ? 'active' : ''}>
                      <div className="menu-item-with-dropdown" onClick={() => { setIsPendantsOpen(!isPendantsOpen); handleMenuLinkClick('Pendants'); }}>
                        <span>Pendants</span>
                        <span>{isPendantsOpen ? <GoDash /> : <GoPlus />}</span>
                      </div>
                      {isPendantsOpen && (
                        <ul className="submenu-list">
                          <li onClick={() => handleMenuLinkClick('Women Pendants')}>
                            <span onClick={() => handleCategoryNavigation('women')} style={{ cursor: 'pointer' }}>Women</span>
                          </li>
                          <li onClick={() => handleMenuLinkClick('Men Pendants')}>
                            <span onClick={() => handleCategoryNavigation('men')} style={{ cursor: 'pointer' }}>Men</span>
                          </li>
                        </ul>
                      )}
                    </li>
                    <li onClick={() => handleMenuLinkClick('Rings')} className={activeSubMenu === 'Rings' ? 'active' : ''}>
                      <span onClick={() => handleCategoryNavigation('rings')} style={{ cursor: 'pointer' }}>Rings</span>
                    </li>
                    <li onClick={() => handleMenuLinkClick('Earrings')} className={activeSubMenu === 'Earrings' ? 'active' : ''}>
                      <span onClick={() => handleCategoryNavigation('earrings')} style={{ cursor: 'pointer' }}>Earrings</span>
                    </li>
                    <li onClick={() => handleMenuLinkClick('Bracelets')} className={activeSubMenu === 'Bracelets' ? 'active' : ''}>
                      <span onClick={() => handleCategoryNavigation('bracelets')} style={{ cursor: 'pointer' }}>Bracelets</span>
                    </li>
                  </ul>
                )}
              </div>
              <div className="menu-section">
                <h3 className="menu-section-header" onClick={() => setIsInsideBvlgariOpen(!isInsideBvlgariOpen)}>
                  <span>INSIDE BITCOIN BUTIK</span>
                  {isInsideBvlgariOpen ? <GoDash /> : <GoPlus />}
                </h3>
                {isInsideBvlgariOpen && (
                  <ul className="menu-main-list">
                    <li><Link href="/about" onClick={closeMenuAndNavigate}>About Us</Link></li>
                    <li><Link href="/contact" onClick={closeMenuAndNavigate}>Contact Us</Link></li>
                  </ul>
                )}
              </div>
            </div>
            <div className="menu-right-pane">{renderSubMenuContent()}</div>
          </div>
        </div>

        {/* Login Modal */}
        <div className={`login-modal ${isLoginOpen ? 'open' : ''}`}>
          <div className="login-container">
            <div className="login-header">
              <button className="close-btn" onClick={toggleLogin}><IoClose /></button>
            </div>
            <div className="login-content">
              <h4>Quick Login (Optional)</h4>
              <p>Login is completely optional. Your cart will be saved automatically for this browser session.</p>
              <form className="login-form" onSubmit={handleLogin}>
                {loginError && <p className="error-message" style={{ color: 'red' }}>{loginError}</p>}
                <div className="form-group">
                  <label>Email*</label>
                  <input type="email" placeholder="Insert your email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Password*</label>
                  <div className="password-input">
                    <input type={showLoginPassword ? 'text' : 'password'} placeholder="Insert your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                    <button type="button" className="password-toggle" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                      {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="form-options">
                  <a href="#" className="forgot-password">Forgot password?</a>
                  <label className="remember-me"><input type="checkbox" />Remember me</label>
                </div>
                <button type="submit" className="login-submit">LOG IN</button>
              </form>
              <div className="membership-benefits">
                <h4>Continue as Guest</h4>
                <p>No account needed! Your cart is automatically saved for this browser session.</p>
                <div className="benefits-grid">
                  <div className="benefit"><FaHeart /><span>No Registration Required</span></div>
                  <div className="benefit"><FaGem /><span>Instant Shopping</span></div>
                  <div className="benefit"><FaBoxOpen /><span>Session Cart Storage</span></div>
                  <div className="benefit"><FaRegClock /><span>Quick Checkout</span></div>
                </div>
                <button className="create-account-btn" onClick={toggleSignup}>CREATE ACCOUNT</button>
              </div>
            </div>
          </div>
        </div>

        {/* Signup Modal */}
        <div className={`login-modal ${isSignupOpen ? 'open' : ''}`}>
          <div className="login-container">
            <div className="login-header">
              <h3 className="signup-title">Create new account</h3>
              <button className="close-btn" onClick={toggleSignup}><IoClose /></button>
            </div>
            <div className="login-content">
              <p className="signup-intro">Create your account to be part of the BitcoinButik world, discover our new collections and receive news from the Maison.</p>
              <form className="signup-form" onSubmit={handleSignup}>
                {signupError && <p className="error-message" style={{ color: 'red' }}>{signupError}</p>}
                <div className="form-group">
                  <label htmlFor="signupTitle">Title</label>
                  <select id="signupTitle" value={signupTitle} onChange={(e) => setSignupTitle(e.target.value)}>
                    <option value="">Insert your title</option>
                    <option value="Mr">Mr.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Mx">Mx.</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="signupFirstName">First Name*</label>
                  <input type="text" id="signupFirstName" placeholder="Insert your name" value={signupFirstName} onChange={(e) => setSignupFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="signupLastName">Last Name*</label>
                  <input type="text" id="signupLastName" placeholder="Insert your last name" value={signupLastName} onChange={(e) => setSignupLastName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="signupCountry">Country/Region*</label>
                  <select id="signupCountry" value={signupCountry} onChange={(e) => setSignupCountry(e.target.value)} required>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="signupEmail">Email*</label>
                  <input type="email" id="signupEmail" placeholder="Insert your email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="signupConfirmEmail">Confirm Email*</label>
                  <input type="email" id="signupConfirmEmail" placeholder="Confirm Email" value={signupConfirmEmail} onChange={(e) => setSignupConfirmEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="signupPassword">Password*</label>
                  <div className="password-input">
                    <input type={showSignupPassword ? 'text' : 'password'} id="signupPassword" placeholder="Insert your password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                    <button type="button" className="password-toggle" onClick={() => setShowSignupPassword(!showSignupPassword)}>
                      {showSignupPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="signupConfirmPassword">Confirm Password*</label>
                  <div className="password-input">
                    <input type={showSignupConfirmPassword ? 'text' : 'password'} id="signupConfirmPassword" placeholder="Confirm Password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
                    <button type="button" className="password-toggle" onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}>
                      {showSignupConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <p className="privacy-info">Having read and understood the Privacy Information Notice. I declare that I am over 16 years of age.</p>
                <div className="form-group checkbox-group">
                  <label className="custom-checkbox">
                    <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} required />
                    <span className="checkmark"></span>
                    I agree to share information regarding my interests, preferences and purchasing habits.
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label className="custom-checkbox">
                    <input type="checkbox" checked={newsletterAgreed} onChange={(e) => setNewsletterAgreed(e.target.checked)} />
                    <span className="checkmark"></span>
                    I agree to receive communications regarding new collections, products, services and events.
                  </label>
                </div>
                <button type="submit" className="login-submit">CREATE ACCOUNT</button>
                <p className="switch-form-text">
                  Already have an account?{' '}
                  <button type="button" className="switch-form-btn" onClick={toggleLogin}>Log In</button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* CART PORTAL */}
      <ShoppingCartPage
        isOpen={isCartOpen}
        closeCart={closeCart}
        items={cartItems}
        subtotal={subtotal}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
    </>
  );
};

export default Navbar;