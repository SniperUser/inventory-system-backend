// src/components/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const images = [
  "/assets/product/bearbrand.jpg",
  "/assets/product/noodles.jpg",
  "/assets/product/sardines.jpg",
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero Section with slideshow */}
      <section
        className="hero"
        style={{
          backgroundImage: `url(${images[currentIndex]})`,
        }}
      >
        <div className="hero-overlay">
          <h1>Order Your Favorites Now!</h1>
          <button onClick={() => navigate("/pos/detail")}>
            Start Ordering
          </button>
        </div>

        {/* Dots navigation */}
        <div className="hero-dots">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${idx === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
            ></span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
