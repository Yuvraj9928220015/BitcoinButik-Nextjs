'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './admin-login.css';

const ADMIN_EMAIL = 'bitcoinbutik123@gmail.com';
const ADMIN_PASSWORD = 'info@bitcoinbutik';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        await new Promise((res) => setTimeout(res, 500));

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            document.cookie = 'admin_auth=true; path=/; max-age=86400; SameSite=Strict';
            router.push('/Dashboard/Admin/ProductList');
        } else {
            setError('Invalid email or password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-circle-1" />
            <div className="login-bg-circle-2" />

            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Admin Portal</h1>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-form-group">
                        <label className="login-label">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                            className="login-input"
                        />
                    </div>

                    <div className="login-form-group">
                        <label className="login-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="login-input"
                        />
                    </div>

                    {error && (
                        <div className="login-error-box">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="login-footer">
                    Protected Area — Authorized Personnel Only
                </p>
            </div>
        </div>
    );
}