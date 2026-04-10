// app/collections/pendants/pendant-women/[womenSlug]/page.jsx
// ✅ Server Component — NO 'use client'

import WomenDetailClient from './WomenDetailClient';

const API_URL = "https://api.bitcoinbutik.com";
const SITE_URL = "https://www.bitcoinbutik.com";

// ✅ createSlug — apostrophe pehle remove karo
const createSlug = (name) => {
    if (!name) return '';
    return name
        .toLowerCase()
        .replace(/[''`]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// ✅ generateStaticParams — pre-renders known pendant pages at build time
export async function generateStaticParams() {
    try {
        const [res1, res2] = await Promise.all([
            fetch(`${API_URL}/api/products?category=woman%20pendant`, { cache: 'no-store' }),
            fetch(`${API_URL}/api/products?category=pendant`, { cache: 'no-store' }),
        ]);

        const products1 = res1.ok ? await res1.json() : [];
        const products2 = res2.ok ? await res2.json() : [];

        // Dono categories combine karo, duplicates hata do
        const allProducts = [...products1, ...products2];
        const seen = new Set();
        const unique = allProducts.filter(p => {
            const id = p._id || p.id;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        return unique
            .filter((p) => p.title || p.name)
            .map((product) => ({
                womenSlug: product.slug || createSlug(product.title || product.name || ''),
            }));
    } catch (error) {
        console.error('generateStaticParams error:', error);
        return [];
    }
}

// ✅ FIX: Full SEO metadata including openGraph so Google can index properly
export async function generateMetadata({ params }) {
    const { womenSlug } = await params;

    try {
        const [res1, res2] = await Promise.all([
            fetch(`${API_URL}/api/products?category=woman%20pendant`, { cache: 'no-store' }),
            fetch(`${API_URL}/api/products?category=pendant`, { cache: 'no-store' }),
        ]);

        const products1 = res1.ok ? await res1.json() : [];
        const products2 = res2.ok ? await res2.json() : [];
        const allProducts = [...products1, ...products2];

        const product = allProducts.find(
            (p) => (p.slug || createSlug(p.title || p.name || '')) === womenSlug
        );

        if (!product) {
            return {
                title: 'Pendant Not Found | BitcoinButik',
                robots: { index: false },
            };
        }

        const title = `${product.title || product.name} | Luxury Pendant – BitcoinButik`;
        const description =
            product.description ||
            `Shop ${product.title || product.name} at BitcoinButik. Luxury Bitcoin-themed jewellery crafted in silver and gold.`;

        // ✅ Use first image for OG (Google, Twitter cards need this)
        const firstImage =
            product.image?.[0]
                ? product.image[0].startsWith('http')
                    ? product.image[0]
                    : `${API_URL}/${product.image[0].replace(/^\//, '').replace(/\\/g, '/')}`
                : `${SITE_URL}/og-default.jpg`;

        const canonicalUrl = `${SITE_URL}/collections/pendants/pendant-women/${womenSlug}`;

        return {
            title,
            description,
            alternates: {
                canonical: canonicalUrl,
            },
            // ✅ FIX: openGraph is critical for Google to understand and show rich results
            openGraph: {
                title,
                description,
                url: canonicalUrl,
                siteName: 'BitcoinButik',
                images: [
                    {
                        url: firstImage,
                        width: 800,
                        height: 800,
                        alt: product.title || product.name,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [firstImage],
            },
            // ✅ Allow Google to index these pages
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                },
            },
        };
    } catch {
        return {
            title: 'Pendant | BitcoinButik',
            robots: { index: true, follow: true },
        };
    }
}

// ✅ Page renders the client component with the slug
export default async function WomenDetailPage({ params }) {
    const { womenSlug } = await params;
    return <WomenDetailClient womenSlug={womenSlug} />;
}