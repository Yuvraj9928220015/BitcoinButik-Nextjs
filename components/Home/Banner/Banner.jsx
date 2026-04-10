"use client";
import "./Banner.css";

export default function Banner() {
 
  return (
      <>
          {/* Main Content */}
            <a href="/collections/pendants/pendant-women">
                <main data-aos="fade-up" className="main-content">
                    <div className="hero-section">
                        <div className="hero-image">
                            <img src="./Banner-men.webp" alt="Bulgari Hero" />
                            <div className="hero-overlay">
                                <div className="hero-text">
                                    <h1 className='hero-text-title'>Bitcoin butik</h1>
                                    <div className="">
                                        <div className="hero-cta-btn-v4">SHOP NOW</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </a>
      </>
  );
}