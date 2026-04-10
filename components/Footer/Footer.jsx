'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './Footer.css';

export default function Footer() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Thank you for subscribing with: ${email}`);
        setEmail('');
    };

    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-content">

                    {/* Brand Info */}
                    <div className="footer-brand">
                        <Link href="/">
                            <img
                                src="/bitcoine.png"
                                alt="Bitcoin Jewellery Logo"
                                className="footer-logo"
                            />
                        </Link>
                        <div className="footer-name">Bitcoin Jewellery</div>
                        <p className="footer-brand-tagline">Premier Name in Bitcoin Jewellery</p>
                    </div>

                    {/* Useful Links */}
                    <div className="footer-links">
                        <h3 className="footer-section-title">Useful Links</h3>
                        <ul>
                            <li><Link href="/new-arrival">New Arrival</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/return">Return and Exchange Policy</Link></li>
                            <li><Link href="/faqs">FAQ's</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms and Conditions</Link></li>
                            <li><Link href="/contact">Contact Us</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Subscription */}
                    <div className="footer-newsletter">
                        <h3 className="footer-section-title">Subscribe Now</h3>
                        <p className="footer-newsletter-text">
                            Register here for our newsletter to receive updates on new releases and discover how our jewelry can help you signal your Bitcoin Statement.
                        </p>
                        <div className="newsletter-form">
                            <label htmlFor="email-input" className="email-label">Email</label>
                            <input
                                id="email-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter Email"
                                required
                                className="newsletter-input"
                            />
                            <button onClick={handleSubmit} className="newsletter-button">
                                Send
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    );
}