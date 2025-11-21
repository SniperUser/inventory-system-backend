// src/FrontendPOS/components/Footer.js
import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa"; // ✅ Social icons

import "./style.css"; // ✅ External CSS for styling

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-4">
      <div className="container">
        <div className="row align-items-center">
          {/* COPYRIGHT */}
          <div className="col-md-4 col-sm-12 mb-3 mb-md-0">
            <p className="mb-0">We accept payments via:</p>
          </div>

          {/* PAYMENTS */}
          <div className="col-md-4 col-sm-12 mb-3 mb-md-0 d-flex justify-content-center">
            <ul className="list-inline mb-0">
              <li className="list-inline-item mx-2">
                <img
                  src="/assets/corporate/img/payments/western-union.jpg"
                  alt="Western Union"
                  title="Western Union"
                  className="payment-icon"
                />
              </li>
              <li className="list-inline-item mx-2">
                <img
                  src="/assets/corporate/img/payments/american-express.jpg"
                  alt="American Express"
                  title="American Express"
                  className="payment-icon"
                />
              </li>
              <li className="list-inline-item mx-2">
                <img
                  src="/assets/corporate/img/payments/MasterCard.jpg"
                  alt="MasterCard"
                  title="MasterCard"
                  className="payment-icon"
                />
              </li>
              <li className="list-inline-item mx-2">
                <img
                  src="/assets/corporate/img/payments/PayPal.jpg"
                  alt="PayPal"
                  title="PayPal"
                  className="payment-icon"
                />
              </li>
              <li className="list-inline-item mx-2">
                <img
                  src="/assets/corporate/img/payments/visa.jpg"
                  alt="Visa"
                  title="Visa"
                  className="payment-icon"
                />
              </li>
            </ul>
          </div>

          {/* SOCIAL MEDIA */}
          <div className="col-md-4 col-sm-12 d-flex justify-content-md-end justify-content-center">
            <ul className="list-inline mb-0 social-icons">
              <li className="list-inline-item mx-2">
                <a href="https://facebook.com" target="_blank" rel="noreferrer">
                  <FaFacebookF />
                </a>
              </li>
              <li className="list-inline-item mx-2">
                <a href="https://twitter.com" target="_blank" rel="noreferrer">
                  <FaTwitter />
                </a>
              </li>
              <li className="list-inline-item mx-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram />
                </a>
              </li>
              <li className="list-inline-item mx-2">
                <a href="https://youtube.com" target="_blank" rel="noreferrer">
                  <FaYoutube />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom note */}
        <div className="row mt-3">
          <div className="col text-center">
            <small>© 2025 Sari-Sari Store. All Rights Reserved.</small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
