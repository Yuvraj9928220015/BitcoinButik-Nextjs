'use client';

import { createContext, useState, useContext, useEffect, useRef } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const API_BASE_URL = "https://api.bitcoinbutik.com";
const API_URL = `${API_BASE_URL}/api`;

const generateBrowserId = () => {
    if (typeof window === 'undefined') return null;
    let browserId = localStorage.getItem('bitcoine_browser_id');
    if (!browserId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const userAgent = navigator.userAgent.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');
        browserId = `browser_${userAgent}_${timestamp}_${random}`;
        localStorage.setItem('bitcoine_browser_id', browserId);
        localStorage.setItem('bitcoine_browser_created', new Date().toISOString());
    }
    return browserId;
};

const saveCartToLocalStorage = (items, cartCount) => {
    if (typeof window === 'undefined') return;
    try {
        const cartData = {
            items,
            cartCount,
            lastUpdated: new Date().toISOString(),
            browserId: generateBrowserId()
        };
        localStorage.setItem('bitcoine_cart', JSON.stringify(cartData));
    } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
    }
};

const loadCartFromLocalStorage = () => {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem('bitcoine_cart');
        if (stored) {
            const cartData = JSON.parse(stored);
            const lastUpdated = new Date(cartData.lastUpdated);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            if (lastUpdated > thirtyDaysAgo) {
                return cartData;
            } else {
                localStorage.removeItem('bitcoine_cart');
            }
        }
    } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        localStorage.removeItem('bitcoine_cart');
    }
    return null;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [addedItemNotification, setAddedItemNotification] = useState(null);
    const [browserInfo, setBrowserInfo] = useState({ browserId: null, isNewBrowser: true });
    const [isLoading, setIsLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [apiStatus, setApiStatus] = useState('unknown');

    const browserIdRef = useRef(null);
    const initializationRef = useRef(false);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        browserIdRef.current = generateBrowserId();
    }, []);

    useEffect(() => {
        if (initializationRef.current) return;
        initializationRef.current = true;

        const initializeCart = async () => {
            abortControllerRef.current = new AbortController();

            try {
                setIsLoading(true);
                setApiStatus('unknown');

                const localCart = loadCartFromLocalStorage();
                if (localCart?.items) {
                    setCartItems(localCart.items);
                    setCartCount(localCart.cartCount || 0);
                }

                try {
                    const healthCheck = await fetchWithCredentials(`${API_URL}/health`, {
                        signal: abortControllerRef.current.signal,
                        timeout: 5000
                    });

                    if (healthCheck.ok) {
                        setApiStatus('available');
                    } else {
                        throw new Error('Health check failed');
                    }
                } catch (healthError) {
                    console.warn('CartContext: API health check failed:', healthError.message);
                    setApiStatus('unavailable');

                    if (localCart) {
                        setCartItems(localCart.items || []);
                        setCartCount(localCart.cartCount || 0);
                    } else {
                        setCartItems([]);
                        setCartCount(0);
                    }
                    setIsLoading(false);
                    return;
                }

                try {
                    const browserResponse = await fetchWithCredentials(`${API_URL}/browser-info`, {
                        signal: abortControllerRef.current.signal
                    });
                    if (browserResponse.ok) {
                        const browserData = await browserResponse.json();
                        setBrowserInfo(browserData);
                    }
                } catch (browserError) {
                    console.warn('CartContext: Failed to get browser info:', browserError.message);
                }

                try {
                    const cartResponse = await fetchWithCredentials(API_URL, {
                        signal: abortControllerRef.current.signal
                    });

                    if (cartResponse.ok) {
                        const cartData = await cartResponse.json();
                        const validCartData = Array.isArray(cartData.items) ? cartData.items : [];

                        if (validCartData.length > 0 || !localCart?.items?.length) {
                            setCartItems(validCartData);
                            setCartCount(cartData.cartCount || 0);
                            saveCartToLocalStorage(validCartData, cartData.cartCount || 0);
                        } else if (localCart?.items?.length > 0) {
                            await syncCartToBackend(localCart.items);
                            const reSyncCartResponse = await fetchWithCredentials(API_URL, {
                                signal: abortControllerRef.current.signal
                            });
                            if (reSyncCartResponse.ok) {
                                const reSyncCartData = await reSyncCartResponse.json();
                                setCartItems(reSyncCartData.items);
                                setCartCount(reSyncCartData.cartCount);
                                saveCartToLocalStorage(reSyncCartData.items, reSyncCartData.cartCount);
                            }
                        } else {
                            setCartItems([]);
                            setCartCount(0);
                            saveCartToLocalStorage([], 0);
                        }
                    } else {
                        throw new Error(`Cart API failed: ${cartResponse.status}`);
                    }
                } catch (cartError) {
                    console.warn('CartContext: Backend cart request failed:', cartError.message);
                    setApiStatus('unavailable');
                    if (localCart) {
                        setCartItems(localCart.items || []);
                        setCartCount(localCart.cartCount || 0);
                    } else {
                        setCartItems([]);
                        setCartCount(0);
                    }
                }

            } catch (error) {
                if (error.name === 'AbortError') return;
                console.error("CartContext: Failed to initialize cart:", error);
                setApiStatus('unavailable');
                const localCart = loadCartFromLocalStorage();
                if (localCart) {
                    setCartItems(localCart.items || []);
                    setCartCount(localCart.cartCount || 0);
                } else {
                    setCartItems([]);
                    setCartCount(0);
                }
            } finally {
                setIsLoading(false);
            }
        };

        initializeCart();

        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const fetchWithCredentials = async (url, options = {}) => {
        const { timeout = 10000, ...restOptions } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Browser-ID': browserIdRef.current || '',
                    ...restOptions.headers,
                },
                credentials: 'include',
                signal: controller.signal,
                ...restOptions
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') throw new Error('Request timeout');
            throw error;
        }
    };

    const syncCartToBackend = async (items) => {
        if (apiStatus === 'unavailable') return false;
        try {
            const response = await fetchWithCredentials(`${API_URL}/sync`, {
                method: 'POST',
                body: JSON.stringify({
                    localCartItems: items,
                    browserId: browserIdRef.current
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setCartItems(data.items);
                setCartCount(data.cartCount);
                saveCartToLocalStorage(data.items, data.cartCount);
                return true;
            } else {
                setApiStatus('unavailable');
            }
        } catch (error) {
            console.error('CartContext: Failed to sync cart:', error);
            setApiStatus('unavailable');
        }
        return false;
    };

    const addToCart = async (product, size, quantity = 1) => {
        const cartItemId = `${product.id}-${size || 'default'}-${Date.now()}`;
        const newItem = {
            id: product.id,
            cartId: cartItemId,
            cartItemId,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || product.image || '/placeholder.jpg',
            size: size || 'One Size',
            quantity,
            addedAt: new Date().toISOString()
        };

        try {
            const updatedItems = [...cartItems];
            const existingIndex = updatedItems.findIndex(item =>
                item.productId === product.id && item.size === (size || 'One Size')
            );

            if (existingIndex > -1) {
                updatedItems[existingIndex].quantity += quantity;
            } else {
                updatedItems.push(newItem);
            }

            const newCount = updatedItems.reduce((count, item) => count + item.quantity, 0);
            setCartItems(updatedItems);
            setCartCount(newCount);
            saveCartToLocalStorage(updatedItems, newCount);
            setAddedItemNotification(newItem);
            setTimeout(() => setAddedItemNotification(null), 3000);

            if (apiStatus === 'available') {
                const response = await fetchWithCredentials(`${API_URL}/add`, {
                    method: 'POST',
                    body: JSON.stringify({ ...newItem, browserId: browserIdRef.current }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setCartItems(data.items);
                    setCartCount(data.cartCount);
                    saveCartToLocalStorage(data.items, data.cartCount);
                } else {
                    setApiStatus('unavailable');
                }
            }

            return { success: true };
        } catch (error) {
            console.error("CartContext: Failed to add item:", error);
            setApiStatus('unavailable');
            const localCart = loadCartFromLocalStorage();
            if (localCart) {
                setCartItems(localCart.items);
                setCartCount(localCart.cartCount);
            }
            return { success: false, error };
        }
    };

    const updateQuantity = async (cartItemId, amount) => {
        try {
            const updatedItems = cartItems.map(item => {
                const itemId = item.cartItemId || item.cartId;
                if (itemId === cartItemId) {
                    const newQty = item.quantity + amount;
                    return newQty > 0 ? { ...item, quantity: newQty } : null;
                }
                return item;
            }).filter(Boolean);

            const newCount = updatedItems.reduce((count, item) => count + item.quantity, 0);
            setCartItems(updatedItems);
            setCartCount(newCount);
            saveCartToLocalStorage(updatedItems, newCount);

            if (apiStatus === 'available') {
                const response = await fetchWithCredentials(`${API_URL}/update/${cartItemId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ amount, browserId: browserIdRef.current }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setCartItems(data.items || []);
                    setCartCount(data.cartCount || 0);
                    saveCartToLocalStorage(data.items, data.cartCount);
                } else {
                    setApiStatus('unavailable');
                }
            }

            return { success: true };
        } catch (error) {
            console.error("CartContext: Failed to update quantity:", error);
            setApiStatus('unavailable');
            const localCart = loadCartFromLocalStorage();
            if (localCart) {
                setCartItems(localCart.items);
                setCartCount(localCart.cartCount);
            }
            return { success: false, error };
        }
    };

    const removeFromCart = async (cartItemId) => {
        try {
            const updatedItems = cartItems.filter(item => {
                const itemId = item.cartItemId || item.cartId;
                return itemId !== cartItemId;
            });
            const newCount = updatedItems.reduce((count, item) => count + item.quantity, 0);
            setCartItems(updatedItems);
            setCartCount(newCount);
            saveCartToLocalStorage(updatedItems, newCount);

            if (apiStatus === 'available') {
                const response = await fetchWithCredentials(`${API_URL}/remove/${cartItemId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) setApiStatus('unavailable');
            }

            return { success: true };
        } catch (error) {
            console.error("CartContext: Failed to remove item:", error);
            setApiStatus('unavailable');
            const localCart = loadCartFromLocalStorage();
            if (localCart) {
                setCartItems(localCart.items);
                setCartCount(localCart.cartCount);
            }
            return { success: false, error };
        }
    };

    const clearCart = async () => {
        try {
            setCartItems([]);
            setCartCount(0);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('bitcoine_cart');
            }
            if (apiStatus === 'available') {
                const response = await fetchWithCredentials(`${API_URL}/clear`, {
                    method: 'DELETE'
                });
                if (!response.ok) setApiStatus('unavailable');
            }
            return { success: true };
        } catch (error) {
            console.error("CartContext: Failed to clear cart:", error);
            setApiStatus('unavailable');
            return { success: false, error };
        }
    };

    const getCartCount = () => cartItems.reduce((count, item) => count + item.quantity, 0);

    const subtotal = cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0);

    // ✅ FIXED: 'value' object ko Provider mein pass kiya — pehle sirf { cartItems, addToCart } tha!
    const value = {
        cartItems,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        getCartCount,
        subtotal,
        addedItemNotification,
        closeAddedToCartNotification: () => setAddedItemNotification(null),
        browserInfo,
        browserId: browserIdRef.current,
        isLoading,
        apiStatus
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};