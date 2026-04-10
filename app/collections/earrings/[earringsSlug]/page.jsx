// app/collections/earrings/[earringsSlug]/page.jsx
// ✅ NO 'use client' — Server Component

import EarringsDetailClient from './EarringsDetailClient';

const API_URL = "https://api.bitcoinbutik.com";
const SITE_URL = "https://www.bitcoinbutik.com";


const createSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ✅ generateStaticParams — build time pe saare earring pages pre-render honge
export async function generateStaticParams() {
    try {
        const response = await fetch(
            `${API_URL}/api/products?category=Earrings`,
            { cache: 'no-store' }
        );
        if (!response.ok) return [];
        const products = await response.json();

        return products
            .filter((p) => p.title || p.name)
            .map((product) => ({
                earringsSlug: product.slug || createSlug(product.title || product.name || ''),
            }));
    } catch (error) {
        console.error('generateStaticParams error:', error);
        return [];
    }
}

// ✅ Full SEO metadata with openGraph
export async function generateMetadata({ params }) {
    const { earringsSlug } = await params;
    try {
        const response = await fetch(
            `${API_URL}/api/products?category=Earrings`,
            { cache: 'no-store' }
        );
        if (!response.ok) throw new Error('Failed to fetch');

        const products = await response.json();
        const product = products.find(
            (p) => (p.slug || createSlug(p.title || p.name || '')) === earringsSlug
        );

        if (!product) {
            return {
                title: 'Earring Not Found | BitcoinButik',
                robots: { index: false },
            };
        }

        const title = `${product.title || product.name} | Luxury Earring – BitcoinButik`;
        const description =
            product.description ||
            `Shop ${product.title || product.name} at BitcoinButik. Luxury Bitcoin-themed earrings in silver and gold.`;

        const firstImage =
            product.image?.[0]
                ? product.image[0].startsWith('http')
                    ? product.image[0]
                    : `${API_URL}/${product.image[0].replace(/^\//, '').replace(/\\/g, '/')}`
                : `${SITE_URL}/og-default.jpg`;

        const canonicalUrl = `${SITE_URL}/collections/earrings/${earringsSlug}`;

        return {
            title,
            description,
            alternates: { canonical: canonicalUrl },
            openGraph: {
                title,
                description,
                url: canonicalUrl,
                siteName: 'BitcoinButik',
                images: [{ url: firstImage, width: 800, height: 800, alt: product.title || product.name }],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [firstImage],
            },
            robots: {
                index: true,
                follow: true,
                googleBot: { index: true, follow: true },
            },
        };
    } catch {
        return {
            title: 'Earring | BitcoinButik',
            robots: { index: true, follow: true },
        };
    }
}

export default async function EarringsDetailPage({ params }) {
    const { earringsSlug } = await params;
    return <EarringsDetailClient earringsSlug={earringsSlug} />;
}