'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';  // ✅ next/link use karo
import { CiPlay1, CiPause1 } from "react-icons/ci";
import './Header.css';

const layoutsData = [
  {
    type: 'single-column',
    videos: [
      {
        id: 5,
        src: {
          desktop: '/BITCOINE_VIDEO_1_1.mp4',  // ✅ /public folder mein rakho
          mobile: '/REEL.mp4'                  // ✅ /public folder mein rakho
        },
        title: 'Liberty Pendant',
        description: 'Discover the collection'
      },
    ],
  },
];

const Header = () => {
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRefs = useRef([]);

  // ✅ Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Mount pe ek baar check karo
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Auto layout change timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentLayoutIndex((prevIndex) => (prevIndex + 1) % layoutsData.length);
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentLayoutIndex, isPlaying]);

  // ✅ Video play/pause control
  useEffect(() => {
    videoRefs.current.forEach(video => {
      if (video) {
        if (isPlaying) {
          video.play().catch(error => console.log("Autoplay prevented:", error));
        } else {
          video.pause();
        }
      }
    });
  }, [isPlaying, currentLayoutIndex]);

  const handleTogglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  // ✅ Duplicate refs avoid karne ke liye
  const addToRefs = (el) => {
    if (el && !videoRefs.current.includes(el)) {
      videoRefs.current.push(el);
    }
  };

  const currentLayout = layoutsData[currentLayoutIndex];
  const videoSource = isMobile
    ? currentLayout.videos[0].src.mobile
    : currentLayout.videos[0].src.desktop;

  return (
    <div className="header-section-enhanced">
      <div className="header-content">
        <div className="layout-wrapper-enhanced active">
          <div className="single-column">
            <div className="video-box" style={{ '--animation-delay': '0s' }}>

              {/* ✅ Next.js mein video tag same rehta hai */}
              <video
                ref={addToRefs}
                className="video-element"
                src={videoSource}
                autoPlay
                muted
                loop
                playsInline
              />

              <div className="gradient-overlay" />

              <div className="content-overlay">
                <div className="overlay-content">
                  <div>
                    {/* ✅ <a> ki jagah <Link> use karo */}
                    <Link href="/Pendants">
                      <div className="hero-cta-btn-v4">
                        Discover The Collection
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ✅ Play/Pause Button */}
      <button
        className="Header-play-pause-btn"
        onClick={handleTogglePlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <CiPause1 /> : <CiPlay1 />}
      </button>
    </div>
  );
};

export default Header;