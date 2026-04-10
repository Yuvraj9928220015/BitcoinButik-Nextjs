// components/Collections.js (or app/collections/page.js)

import Link from 'next/link';
import Image from 'next/image';
import styles from './collections.module.css'; // CSS Modules (recommended in Next.js)

const collectionsData = [
    {
        id: 1,
        image: '/Bzero13-2.webp',
        title: 'Women Pendant',
        url: 'https://bitcoinbutik.com/collections/pendants/pendant-women',
    },
    {
        id: 2,
        image: '/Ring-2.webp',
        title: 'Ring',
        url: 'https://bitcoinbutik.com/collections/rings',
    },
    {
        id: 3,
        image: '/DSC02926.webp',
        title: 'Bracelets',
        url: 'https://bitcoinbutik.com/collections/bracelets',
    },
    {
        id: 4,
        image: '/DSC02.webp',
        title: 'Earrings',
        url: 'https://bitcoinbutik.com/collections/earrings',
    },
    {
        id: 5,
        image: '/1(4).png',
        title: 'Men Pendant',
        url: 'https://bitcoinbutik.com/collections/pendants/pendant-mens/',
    }
];

export default function Page() {
    return (
        <>
            <div className={styles.Collections}>
                <div className={styles['Collections-Title']}>Collections</div>
                <div className="container-fluid">
                    <div className="row">
                        {collectionsData.map((item) => (
                            <div className="col-3" key={item.id}>
                                <Link
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles['Collections-Link']}
                                >
                                    <div className={styles['Collections-Box']}>
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={600}
                                            height={600}
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <div className={styles['Collections-Box-content']}>
                                            <div className={styles['Collections-Box-title']}>{item.title}</div>
                                            <div className={styles['Collections-Box-price']}>{item.price}</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}