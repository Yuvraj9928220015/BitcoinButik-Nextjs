const categories = [
    {
        id: 1,
        name: 'Necklace',
        imageSrc: '/NewArrivals-1.webp',
        altText: 'Necklace Collection',
        link: '/shop/necklaces'
    },
    {
        id: 2,
        name: 'Pendants',
        imageSrc: '/NewArrivals-2.webp',
        altText: 'Pendants Collection',
        link: '/shop/pendants'
    },
    {
        id: 3,
        name: 'Rings',
        imageSrc: '/NewArrivals-3.webp',
        altText: 'Rings Collection',
        link: '/shop/rings'
    },
    {
        id: 4,
        name: 'Earrings',
        imageSrc: '/NewArrivals-4.webp',
        altText: 'Earrings Collection',
        link: '/shop/earrings'
    },
    {
        id: 5,
        name: 'Sets',
        imageSrc: '/NewArrivals-5.webp',
        altText: 'Sets Collection',
        link: '/shop/sets'
    }
];

const styles = {
    newArrival: {
        width: '100%',
        fontFamily: 'inherit',
    },
    banner: {
        width: '100%',
        height: '500px',
        overflow: 'hidden',
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    bannerContent: {
        textAlign: 'center',
        padding: '40px 20px 20px',
    },
    bannerHeading: {
        fontSize: '2.5rem',
        fontWeight: '600',
        letterSpacing: '0.05em',
        margin: 0,
        color: 'inherit',
    },
    categoryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        padding: '20px',
        margin: '0 auto',
    },
    categoryItemLink: {
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
    },
    categoryItem: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '5px',
        cursor: 'pointer',
        aspectRatio: '3 / 4',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryImg: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    categoryOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
        padding: '20px 12px 14px',
        display: 'flex',
        alignItems: 'flex-end',
    },
    categoryName: {
        margin: 0,
        color: '#ffffff',
        fontSize: '1.1rem',
        fontWeight: '500',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    },
};

export const metadata = {
    alternates: {
        canonical: "/new-arrival",
    },
};

export default function NewArrival() {
    return (
        <>
            <style>{`
                .category-item img { transition: transform 0.4s ease; }
                .category-item:hover img { transform: scale(1.06); }
            `}</style>

            <div style={styles.newArrival}>
                <div style={styles.banner}>
                    <img
                        src="/NewArrivals-2.webp"
                        alt="Bitcoin Jewelry Collection"
                        style={styles.bannerImage}
                    />
                </div>

                <div style={styles.bannerContent}>
                    <h1 style={styles.bannerHeading}>New Arrivals</h1>
                </div>

                <div style={styles.categoryGrid}>
                    {categories.map((category) => (
                        <a
                            href={category.link}
                            key={category.id}
                            style={styles.categoryItemLink}
                        >
                            <div className="category-item" style={styles.categoryItem}>
                                <div style={styles.categoryImage}>
                                    <img
                                        src={category.imageSrc}
                                        alt={category.altText}
                                        style={styles.categoryImg}
                                    />
                                </div>
                                <div style={styles.categoryOverlay}>
                                    <h3 style={styles.categoryName}>{category.name}</h3>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </>
    );
}