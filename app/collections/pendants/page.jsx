import Link from 'next/link';
import Image from 'next/image';
import styles from './pendants.module.css';

const collectionsData = [
    {
        id: 1,
        image: '/Bzero13-2.webp',
        title: 'Women Pendant',
        url: 'https://bitcoinbutik.com/collections/pendants/pendant-women',
    },
    {
        id: 2,
        image: '/1(4).png',
        title: 'Men Pendant',
        url: 'https://bitcoinbutik.com/collections/pendants/pendant-mens/',
    }
];

export default function Page() {   // ✅ Capital 'P'
    return (
        <>
            <div className={styles.Collections}>
                <div className={styles['Collections-Title']}>Bitcoin Pendants</div>
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
                                            width={400}
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