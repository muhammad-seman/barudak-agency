'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LuHeart, LuCalendar, LuMic, LuCamera, LuSparkles, LuUsers, 
  LuCircleCheck, LuInstagram, LuFacebook, LuTwitter, LuChevronLeft, 
  LuChevronRight, LuMessageCircle, LuSearch, LuHouse, LuImage, LuInfo
} from 'react-icons/lu';
import { FaTiktok } from 'react-icons/fa';

const SLIDES = [
  {
    id: 1,
    image: '/hero_wedding_luxury.png',
    tag: 'Luxury Wedding Specialists',
    title: 'Wujudkan Pernikahan \n Impian Anda',
    desc: 'Kami menghadirkan keanggunan dan kemewahan dalam setiap detail hari bahagia Anda.',
  },
  {
    id: 2,
    image: '/hero_corporate_event.png',
    tag: 'Professional Event Solutions',
    title: 'Acara Perusahaan \n Berskala Elit',
    desc: 'Dari gala dinner hingga konferensi, kami mengelola setiap aspek dengan presisi tinggi.',
  },
  {
    id: 3,
    image: '/hero_intimate_party.png',
    tag: 'Exquisite Celebrations',
    title: 'Momen Intim yang \n Tak Terlupakan',
    desc: 'Rayakan momen berharga Anda dengan suasana yang hangat dan penuh estetika.',
  },
];

const SERVICES = [
  { id: 'wo', title: 'Wedding Organizer', desc: 'Koordinasi menyeluruh untuk memastikan hari besar Anda berjalan sempurna tanpa hambatan.', icon: LuHeart, bg: '/service_wo.png' },
  { id: 'eo', title: 'Event Organizer', desc: 'Pengelolaan acara kreatif dan profesional untuk berbagai kebutuhan seremoni dan perayaan.', icon: LuCalendar, bg: '/service_eo.png' },
  { id: 'mc', title: 'Master of Ceremony', desc: 'Pembawa acara berkelas yang akan menghidupkan suasana dengan elegan dan penuh energi.', icon: LuMic, bg: '/service_mc.png' },
  { id: 'wcc', title: 'Wedding Content Creator', desc: 'Menangkap momen estetik di balik layar untuk konten media sosial yang tak terlupakan.', icon: LuCamera, bg: '/service_wcc.png' },
  { id: 'wp', title: 'Wedding Planner', desc: 'Perencanaan strategis dan desain konsep pernikahan mulai dari langkah pertama.', icon: LuSparkles, bg: '/service_wp.png' },
  { id: 'ep', title: 'Event Planner', desc: 'Dedikasi penuh dalam merancang detail acara penting dengan standar kualitas tertinggi.', icon: LuUsers, bg: '/service_ep.png' },
];

const GALLERY = [
  { id: 1, img: '/gallery_wedding_1.png', title: 'Luxury Detail' },
  { id: 2, img: '/gallery_event_1.png', title: 'Corporate Gala' },
  { id: 3, img: '/gallery_decor_1.png', title: 'Floral Aisle' },
  { id: 4, img: '/gallery_cake_1.png', title: 'Wedding Cake' },
  { id: 5, img: '/gallery_mc_1.png', title: 'Professional MC' },
  { id: 6, img: '/gallery_table_1.png', title: 'Banquet Table' },
];

const VENDORS = [
  'Photographer', 'MUA (Makeup Artist)', 'Videographer', 'Decoration', 'Wedding Cake'
];

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="landing-wrap">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        
        :root {
          --lp-bg: #fdfdfd;
          --lp-text: #1a1a1a;
          --lp-secondary: #f0f2f5;
          --lp-gold: #c5a059;
          --lp-gold-light: #e3c48c;
          --lp-pink: #f8a8c1;
          --lp-pink-dark: #cc6688;
          --lp-border: #e8e8e8;
        }

        .landing-wrap {
          background: var(--lp-bg);
          color: var(--lp-text);
          font-family: 'Outfit', sans-serif;
          overflow-x: hidden;
        }

        /* Navbar */
        .lp-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 5%;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          transition: all 0.4s ease;
          background: ${isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.3)'};
          backdrop-filter: blur(10px);
          border-bottom: ${isScrolled ? '1px solid var(--lp-border)' : '1px solid rgba(255,255,255,0.1)'};
        }
        .lp-logo {
          font-size: 22px;
          font-weight: 800;
          color: ${isScrolled ? 'var(--lp-gold)' : 'white'};
          letter-spacing: -0.5px;
          flex: 0 0 200px;
        }
        .lp-menu {
          display: flex;
          gap: 35px;
          flex: 1;
          justify-content: center;
        }
        .lp-menu a {
          color: ${isScrolled ? 'var(--lp-text)' : 'rgba(255,255,255,0.9)'};
          text-decoration: none;
          font-family: 'Outfit', sans-serif;
          font-weight: 500;
          font-size: 15px;
          transition: color 0.3s;
        }
        .lp-menu a:hover { color: var(--lp-gold); }
        
        .lp-nav-right {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 0 0 auto;
          justify-content: flex-end;
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-box input {
          background: ${isScrolled ? '#f5f5f5' : 'rgba(255,255,255,0.15)'};
          border: none;
          padding: 0 15px 0 35px;
          border-radius: 100px;
          color: ${isScrolled ? 'black' : 'white'};
          font-size: 13px;
          width: 140px;
          height: 38px;
          transition: width 0.3s;
        }
        .search-box input:focus { width: 180px; outline: none; }
        .search-box svg {
          position: absolute;
          left: 12px;
          color: ${isScrolled ? '#999' : 'rgba(255,255,255,0.7)'};
        }
        .btn-nav {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          padding: 0 24px;
          background: var(--lp-gold);
          color: white !important;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          border-radius: 6px;
          white-space: nowrap;
          line-height: 1;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }

        /* Hero Slider */
        .hero-container {
          position: relative;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }
        .slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1s ease-in-out, transform 1s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 5%;
          background-size: cover;
          background-position: center;
          transform: scale(1.05);
        }
        .slide.active {
          opacity: 1;
          transform: scale(1);
        }
        .slide::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
        }
        .slide-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
        }
        .slide-tag {
          color: var(--lp-gold);
          text-transform: uppercase;
          letter-spacing: 4px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 20px;
          display: block;
        }
        .slide-content h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.5rem, 7vw, 5.5rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 24px;
          color: var(--lp-pink);
          white-space: pre-line;
        }
        .slide-content p {
          font-size: 20px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 40px;
          max-width: 650px;
          margin-inline: auto;
          line-height: 1.6;
        }

        /* Sections */
        section { padding: 100px 5%; }
        .section-title {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-tag {
          color: var(--lp-gold);
          text-transform: uppercase;
          letter-spacing: 3px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 10px;
          display: block;
        }
        .section-title h2 {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          color: var(--lp-pink-dark);
        }

        /* Services Grid */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .service-card {
          position: relative;
          height: 380px;
          border-radius: 12px;
          overflow: hidden;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end;
          padding: 30px;
          transition: transform 0.4s;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .service-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
        }
        .service-card:hover { transform: translateY(-10px); }
        .service-info { position: relative; z-index: 2; color: white; }
        .service-icon { font-size: 32px; color: var(--lp-pink); margin-bottom: 15px; }
        .service-info h3 { font-size: 22px; margin-bottom: 10px; font-family: 'Playfair Display', serif; }
        .service-info p { font-size: 14px; color: rgba(255,255,255,0.8); line-height: 1.5; }

        /* Gallery Section */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
        }
        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .gallery-item:hover img { transform: scale(1.1); }
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s;
          color: white;
          font-family: 'Playfair Display', serif;
          font-size: 20px;
        }
        .gallery-item:hover .gallery-overlay { opacity: 1; }

        /* About Section */
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .about-img {
          width: 100%;
          border-radius: 20px;
          box-shadow: 20px 20px 0 var(--lp-pink);
        }
        .about-text h3 {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          margin-bottom: 20px;
          color: var(--lp-pink-dark);
        }
        .about-text p {
          font-size: 16px;
          line-height: 1.8;
          color: #555;
          margin-bottom: 30px;
        }
        .address-box {
          margin-top: 30px;
          padding: 20px;
          background: var(--lp-secondary);
          border-left: 4px solid var(--lp-gold);
          font-size: 14px;
          color: #666;
        }

        /* Navigation Mobile Bottom */
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: white;
          padding: 12px 0;
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
          z-index: 2000;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
        }
        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          color: #999;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .mobile-nav-item.active { color: var(--lp-gold); }
        .mobile-nav-item svg { font-size: 20px; }

        /* Footer */
        .lp-footer {
          padding: 60px 5% 40px;
          background: white;
          border-top: 1px solid var(--lp-border);
          margin-bottom: 0; 
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          margin-bottom: 40px;
        }
        .footer-logo h3 {
          font-size: 22px;
          font-weight: 800;
          color: var(--lp-gold);
          margin-bottom: 10px;
        }
        .footer-logo p {
          color: #777;
          font-size: 13px;
          line-height: 1.6;
        }
        .footer-links h4 {
          font-family: 'Playfair Display', serif;
          margin-bottom: 20px;
          font-size: 18px;
        }
        .footer-links ul { 
          list-style: none; 
          padding: 0; 
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 30px;
        }
        .footer-links li { margin-bottom: 0; }
        .footer-links a {
          color: #555;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }
        .footer-links a:hover { color: var(--lp-gold); }

        .contact-groups {
          grid-column: span 2;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        .contact-group-col h4 {
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #aaa;
          margin-bottom: 15px;
        }
        .contact-social-links { display: flex; gap: 12px; }

        /* Floating WhatsApp Button */
        .fab-whatsapp {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: #25D366;
          color: white !important;
          padding: 0 24px;
          height: 48px;
          border-radius: 100px;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(37, 211, 102, 0.4);
          z-index: 2000;
          font-weight: 700;
          font-size: 14px;
          line-height: 1;
          transition: all 0.3s;
        }
        .fab-whatsapp:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(37, 211, 102, 0.5);
          color: white;
        }
        .fab-whatsapp svg { font-size: 20px; }

        .copyright {
          text-align: center;
          padding-top: 25px;
          border-top: 1px solid var(--lp-border);
          font-size: 11px;
          color: #ccc;
        }

        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .footer-grid { grid-template-columns: repeat(2, 1fr); }
          .contact-groups { grid-column: span 2; }
        }
        @media (max-width: 768px) {
          .lp-nav { display: none; }
          .fab-whatsapp {
            bottom: 20px;
            right: 20px;
            padding: 10px 18px;
            font-size: 13px;
          }
          .services-grid { grid-template-columns: 1fr; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .about-grid { grid-template-columns: 1fr; gap: 30px; }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .lp-footer {
            padding: 30px 5% 40px;
          }
          .footer-logo { margin-bottom: 5px; }
          .footer-logo h3 { font-size: 20px; margin-bottom: 5px; }
          .footer-logo p { font-size: 12px; margin-bottom: 0; }
          .footer-links { margin-bottom: 5px; }
          .footer-links h4 { font-size: 16px; margin-bottom: 10px; }
          .footer-links ul { gap: 8px 20px; }
          .footer-links a { font-size: 13px; }
          .contact-groups { 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px; 
            margin-top: 10px;
          }
          .contact-group-col { border-bottom: none; padding-bottom: 0; }
          .contact-group-col:last-child { border-bottom: none; }
          .contact-group-col h4 { margin-bottom: 8px; }
          .contact-item { font-size: 16px !important; }
          .social-circle { width: 32px; height: 32px; }
          .hero-container h1 { font-size: 2.5rem; }
          section { padding: 40px 5%; }
        }
      ` }} />

      <nav className="lp-nav">
        <div className="lp-logo">Barudak Agency</div>
        <div className="lp-menu">
          <a href="#home">Beranda</a>
          <a href="#services">Layanan</a>
          <a href="#gallery">Galeri</a>
          <a href="#about">Tentang Kami</a>
        </div>
        <div className="lp-nav-right">
          <div className="search-box">
            <LuSearch size={16} />
            <input type="text" placeholder="Cari layanan..." />
          </div>
          <a href="https://wa.me/6285822004589" className="btn-nav">Hubungi Kami</a>
        </div>
      </nav>

      {/* Floating WhatsApp Button */}
      <a href="https://wa.me/6285822004589" className="fab-whatsapp" target="_blank" rel="noopener noreferrer">
        <LuMessageCircle />
        <span>Konsultasi Gratis</span>
      </a>

      <section className="hero-container" id="home" style={{ padding: 0 }}>
        {SLIDES.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide ${index === activeSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="slide-content">
              <span className="slide-tag">{slide.tag}</span>
              <h1>{slide.title}</h1>
              <p>{slide.desc}</p>
              <a href="#services" className="btn-nav" style={{ padding: '16px 40px', fontSize: '15px' }}>Explore Now</a>
            </div>
          </div>
        ))}
      </section>

      <section id="services">
        <div className="section-title">
          <span className="section-tag">Premium Services</span>
          <h2>Apa yang Kami Berikan</h2>
        </div>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <div key={s.id} className="service-card" style={{ backgroundImage: `url(${s.bg})` }}>
              <div className="service-info">
                <div className="service-icon"><s.icon /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="gallery" style={{ background: '#fafafa' }}>
        <div className="section-title">
          <span className="section-tag">Our Portfolio</span>
          <h2>Galeri Keindahan</h2>
        </div>
        <div className="gallery-grid">
          {GALLERY.map((g) => (
            <div key={g.id} className="gallery-item">
              <img src={g.img} alt={g.title} />
              <div className="gallery-overlay">{g.title}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="about">
        <div className="about-grid">
          <img src="/wedding_planner_desk.png" alt="Tentang Barudak Agency" className="about-img" />
          <div className="about-text">
            <span className="section-tag">Filosofi Kami</span>
            <h3>Mewujudkan Seni dalam Perencanaan Acara</h3>
            <p>
              Barudak Agency mengkurasi setiap momen dengan presis tinggi. Kami percaya keindahan terletak pada detail terkecil yang harmonis.
            </p>
            <div className="address-box">
              <strong>Kantor Pusat:</strong><br/>
              Jl. Bajingah, Komplek Perumahan Berkat Pesona Sarang Halang BLOK A No 05,<br/>
              Pelaihari, Tanah Laut, Kalsel.
            </div>
            <a href="https://wa.me/6285822004589" className="btn-nav" style={{ marginTop: 30 }}>Konsultasi Gratis</a>
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="footer-grid">
          <div className="footer-logo">
            <h3>Barudak Agency</h3>
            <p>Solusi premium untuk Wedding & Event Organizer. Menata setiap detail dengan hati dan kemewahan.</p>
          </div>
          
          <div className="footer-links">
            <h4>Navigasi</h4>
            <ul>
              <li><a href="#home">Beranda</a></li>
              <li><a href="#services">Layanan</a></li>
              <li><a href="#gallery">Galeri</a></li>
              <li><a href="#about">Tentang Kami</a></li>
            </ul>
          </div>

          <div className="contact-groups">
            <div className="contact-group-col">
              <h4>Hubungi Kami</h4>
              <div className="contact-social-links">
                <a href="https://wa.me/6285822004589" className="social-circle" title="WhatsApp">
                  <LuMessageCircle size={20} />
                </a>
              </div>
            </div>
            
            <div className="contact-group-col">
              <h4>Wedding & Event</h4>
              <div className="contact-social-links">
                <a href="https://instagram.com/barudak.organizer" className="social-circle"><LuInstagram /></a>
                <a href="https://tiktok.com/@barudak.organizer" className="social-circle"><FaTiktok /></a>
              </div>
            </div>

            <div className="contact-group-col">
              <h4>Content Creator</h4>
              <div className="contact-social-links">
                <a href="https://instagram.com/ceremonia.wcc" className="social-circle"><LuInstagram /></a>
                <a href="https://tiktok.com/@ceremonia.wcc" className="social-circle"><FaTiktok /></a>
              </div>
            </div>

            <div className="contact-group-col">
              <h4>Invitation</h4>
              <div className="contact-social-links">
                <a href="https://instagram.com/katalog.invitation" className="social-circle"><LuInstagram /></a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="copyright">
          © 2026 Barudak Agency. Seluruh Hak Cipta Dilindungi. Pelaihari, Tanah Laut.
        </div>
      </footer>
    </div>
  );
}
