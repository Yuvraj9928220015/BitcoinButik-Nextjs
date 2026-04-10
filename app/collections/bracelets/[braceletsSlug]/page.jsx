// app/collections/bracelets/[braceletsSlug]/page.jsx
// ✅ Server Component — NO 'use client'

import BraceletsDetailClient from './BraceletsDetailClient';

const API_URL = "https://api.bitcoinbutik.com";
const SITE_URL = "https://www.bitcoinbutik.com";

const createSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ✅ generateStaticParams — pre-renders known bracelet pages at build time
export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${API_URL}/api/products?category=Bracelets`,
      { cache: 'no-store' }
    );
    if (!response.ok) return [];
    const products = await response.json();

    return products
      .filter((p) => p.title || p.name)
      .map((product) => ({
        braceletsSlug: product.slug || createSlug(product.title || product.name || ''),
      }));
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

// ✅ FIX: Full SEO metadata including openGraph so Google can index properly
export async function generateMetadata({ params }) {
  const { braceletsSlug } = await params;

  try {
    const response = await fetch(
      `${API_URL}/api/products?category=Bracelets`,
      { cache: 'no-store' }
    );
    if (!response.ok) throw new Error('Failed to fetch');

    const products = await response.json();
    const product = products.find(
      (p) => (p.slug || createSlug(p.title || p.name || '')) === braceletsSlug
    );

    if (!product) {
      return {
        title: 'Bracelet Not Found | BitcoinButik',
        robots: { index: false },
      };
    }

    const title = `${product.title || product.name} | Luxury Bracelet – BitcoinButik`;
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

    const canonicalUrl = `${SITE_URL}/collections/bracelets/${braceletsSlug}`;

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
      title: 'Bracelet | BitcoinButik',
      robots: { index: true, follow: true },
    };
  }
}

// ✅ Page renders the client component with the slug
export default async function BraceletsDetailPage({ params }) {
  const { braceletsSlug } = await params;
  return <BraceletsDetailClient braceletsSlug={braceletsSlug} />;
}