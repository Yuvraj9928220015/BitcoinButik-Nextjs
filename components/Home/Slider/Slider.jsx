'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '@splidejs/splide/dist/css/splide.min.css';
import Splide from '@splidejs/splide';
import './Slider.css';

const slides = [
    {
        src: '/Axe.png',
        alt: 'Bitcoin Axe Pendant',
        topText: 'New',
        bottomText: 'Bitcoin Axe Pendant',
        productSlug: 'bitcoin-axe-pendant',
        category: 'pendant-women',
    },
    {
        src: '/5.webp',
        alt: 'Bullish on Bitcoin Pendent',
        topText: 'New',
        bottomText: 'Bullish on Bitcoin Pendent',
        productSlug: 'bullish-on-bitcoin-pendent',
        category: 'pendant-women',
    },
    {
        src: '/Bzero-16.webp',
        alt: 'Radiant Reserve Pendant',
        topText: 'New',
        bottomText: 'Radiant Reserve Pendant',
        productSlug: 'radiant-reserve-pendant',
        category: 'pendant-women',
    },
    {
        src: '/0H8A6925-copygddg-1.webp',
        alt: 'Not Your Keys Not Your Coins',
        topText: 'New',
        bottomText: 'Not Your Keys, Not Your Coins',
        productSlug: 'not-your-keys-not-your-coins-pendant',
        category: 'pendant-women',
    },
    {
        src: '/Bzero-13.webp',
        alt: 'Node Pendant',
        topText: 'New',
        bottomText: 'Node Pendant',
        productSlug: 'node-pendant',
        category: 'pendant-women',
    },
    {
        src: '/1(3).png',
        alt: 'Genesis Block Pendant',
        topText: 'New',
        bottomText: 'Genesis Block Pendant',
        productSlug: 'genesis-block-pendant',
        category: 'pendant-women',
    },
    {
        src: '/Man-Video.png',
        alt: 'Airborne Bitcoin Pendant',
        topText: 'New',
        bottomText: 'Airborne Bitcoin Pendant',
        productSlug: 'airborne-bitcoin-pendant',
        category: 'pendant-women',
    },
];

export default function Slider() {
    const splideRef = useRef(null);
    const splideInstanceRef = useRef(null);
    const router = useRouter();
    const routerRef = useRef(router);

    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    useEffect(() => {
        if (!splideRef.current) return;

        const splide = new Splide(splideRef.current, {
            perPage: 5,
            focus: 'center',
            type: 'loop',
            arrows: true,
            pagination: false,
            gap: '1.2rem',
            autoplay: true,
            interval: 3000,
            pauseOnHover: true,
            speed: 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            breakpoints: {
                1900: { perPage: 3, gap: '0.5rem', focus: 'center' },
                992: { perPage: 1, gap: '0.8rem', focus: 'center' },
            },
        });

        splide.on('click', (slideObj) => {
            const dataIndex = slideObj.slide.getAttribute('data-slide-index');
            if (dataIndex === null) return;
            const realIndex = parseInt(dataIndex, 10);
            const clickedSlide = slides[realIndex];
            if (clickedSlide) {
                routerRef.current.push(
                    `/collections/pendants/${clickedSlide.category}/${clickedSlide.productSlug}`
                );
            }
        });

        splide.mount();
        splideInstanceRef.current = splide;

        return () => {
            splide.destroy();
            splideInstanceRef.current = null;
        };
    }, []);

    return (
        <div data-aos="fade-up" className="slider-container">
            <section
                ref={splideRef}
                className="splide modern-slider"
                aria-label="Image gallery carousel"
            >
                <div className="splide__track">
                    <ul className="splide__list">
                        {slides.map((slide, index) => (
                            <li
                                key={index}
                                className="splide__slide modern-slide"
                                data-slide-index={index}
                            >
                                <div className="slide-content">
                                    <div className="image-wrapper" style={{ cursor: 'pointer' }}>
                                        <img src={slide.src} alt={slide.alt} loading="lazy" />
                                        <div className="top-text">{slide.topText}</div>
                                        <div className="bottom-text">{slide.bottomText}</div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <div className="custom-separator">
                • • <span className="star">✶</span> • •
            </div>
        </div>
    );
}