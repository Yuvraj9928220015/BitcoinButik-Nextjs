'use client';

import { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { IoClose } from 'react-icons/io5';
import { useCart } from '../Context/CartContext';
import './AddedToCartNotification.css';

// ✅ Context banao
const AddedToCartNotificationContext = createContext();

// ✅ Custom hook
export const useAddedToCartNotification = () => {
    return useContext(AddedToCartNotificationContext);
};

// ✅ Provider export karo (layout.jsx yahi import karega)
export const AddedToCartNotificationProvider = ({ children }) => {
    const [notificationItem, setNotificationItem] = useState(null);

    const showNotification = (item) => {
        setNotificationItem(item);
        setTimeout(() => setNotificationItem(null), 4000); // auto close
    };

    const closeNotification = () => setNotificationItem(null);

    return (
        <AddedToCartNotificationContext.Provider value={{ showNotification }}>
            {children}
            {notificationItem && (
                <AddedToCartNotification
                    item={notificationItem}
                    onClose={closeNotification}
                />
            )}
        </AddedToCartNotificationContext.Provider>
    );
};

// ✅ Notification UI component (same as before)
const AddedToCartNotification = ({ item, onClose }) => {
    const { openCart } = useCart();

    const handleViewBag = () => {
        openCart();
        onClose();
    };

    if (!item) return null;

    return (
        <div className="added-to-cart-notification">
            <div className="notification-image-container">
                <img src={item.image} alt={item.name} />
            </div>
            <div className="notification-content">
                <button className="notification-close-btn" onClick={onClose} aria-label="Close">
                    <IoClose size={20} />
                </button>
                <p>You have added this creation to your shopping bag</p>
                <div className="notification-actions">
                    <span>View </span>
                    <button onClick={handleViewBag} className="notification-link-btn">
                        Shopping Bag
                    </button>
                    <span> or go to </span>
                    <Link href="/checkout" onClick={onClose} className="notification-link">
                        Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AddedToCartNotification;