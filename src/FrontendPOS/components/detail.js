// src/FrontendPOS/components/Main.js
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCart } from "../pages/cart.js";

// Slick slider imports
import SlickSlider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import "./style.css";

const Main = ({ onViewProduct }) => {
  const Slider = SlickSlider.default || SlickSlider;
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [mainImage, setMainImage] = useState("");

  const { addToCart } = useCart();

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) acc[product.category] = [];
    acc[product.category].push(product);
    return acc;
  }, {});

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setPurchaseQty(1);
    setMainImage(product.image);
    if (onViewProduct) onViewProduct(product);
  };

  const increaseQty = () => {
    setPurchaseQty((prev) =>
      selectedProduct && prev < selectedProduct.quantity ? prev + 1 : prev
    );
  };

  const decreaseQty = () => {
    setPurchaseQty((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const renderProductItem = (product) => (
    <div key={product.id} className="product-item">
      <div className="pi-img-wrapper">
        <img
          src={product.image}
          alt={product.product_name}
          className="img-fluid"
        />

        {/* Centered Buttons */}
        <div className="overlay-btns">
          <button
            className="btn btn-light btn-sm"
            title="Zoom"
            onClick={() =>
              window.open(product.image, "_blank", "noopener,noreferrer")
            }
          >
            Zoom
          </button>
          <button
            className="btn btn-light btn-sm"
            onClick={() => handleViewProduct(product)}
          >
            View
          </button>
        </div>
      </div>

      <h3 className="product-title">{product.product_name}</h3>
      <div className="pi-price">₱{Number(product.price).toFixed(2)}</div>
      <button
        className="btn btn-danger w-100 mt-2"
        onClick={() => addToCart(product, 1)}
      >
        Add to cart
      </button>
    </div>
  );

  const price = selectedProduct ? Number(selectedProduct.price) || 0 : 0;
  const originalPrice =
    selectedProduct && selectedProduct.originalPrice
      ? Number(selectedProduct.originalPrice) || 0
      : 0;

  const sliderSettings = {
    dots: false,
    infinite: false, // don't loop
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    swipeToSlide: true, // allow smooth stopping anywhere
    touchThreshold: 20, // less snapping, more control
    draggable: true, // mouse drag support
    responsive: [
      { breakpoint: 1000, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="ecommerse">
      <div className="main">
        <div className="container">
          {/* New Arrivals */}
          <div className="row mb-4">
            <div className="col-md-12 sale-product">
              <h2>New Arrivals</h2>
              <Slider {...sliderSettings}>
                {products.map((p) => (
                  <div key={p.id} className="product-slide">
                    {renderProductItem(p)}
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          {/* All Products */}
          <h2>All Products</h2>
          {Object.keys(groupedProducts).map((categoryName) => (
            <div className="row mb-4" key={categoryName}>
              <div className="col-md-12 sale-product">
                <h4 className="category-title">{categoryName}</h4>
                <Slider {...sliderSettings}>
                  {groupedProducts[categoryName].map((product) => (
                    <div key={product.id} className="product-slide">
                      {renderProductItem(product)}
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fast View Modal */}
      {selectedProduct && (
        <div
          id="product-pop-up"
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
            style={{ maxWidth: "720px" }}
          >
            <div className="modal-content rounded-3 shadow">
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-3"
                aria-label="Close"
                onClick={() => setSelectedProduct(null)}
                style={{ zIndex: 10 }}
              ></button>

              <div className="modal-body p-4">
                <div className="row gx-4">
                  {/* Left Side */}
                  <div className="col-md-6">
                    <img
                      src={mainImage || selectedProduct.image}
                      alt={selectedProduct.product_name}
                      className="img-fluid rounded mb-3"
                      style={{
                        objectFit: "contain",
                        maxHeight: "350px",
                        width: "100%",
                      }}
                    />
                  </div>

                  {/* Right Side */}
                  <div className="col-md-6 d-flex flex-column justify-content-between">
                    <div>
                      <h3 className="mb-3">{selectedProduct.product_name}</h3>
                      <div className="mb-3">
                        <span className="fs-4 fw-bold text-danger">
                          ₱{price.toFixed(2)}
                        </span>
                        {originalPrice > price && (
                          <del className="text-muted ms-2">
                            ₱{originalPrice.toFixed(2)}
                          </del>
                        )}
                        <p className="mt-2 mb-1">
                          <strong>Availability: </strong>
                          {selectedProduct.quantity > 0
                            ? `${selectedProduct.quantity} in stock`
                            : "Out of Stock"}
                        </p>
                      </div>
                      <p className="text-secondary">
                        {selectedProduct.description ||
                          "No description available."}
                      </p>
                    </div>

                    <div className="d-flex align-items-center gap-3 mt-4">
                      <div className="input-group" style={{ width: "120px" }}>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={decreaseQty}
                          disabled={purchaseQty <= 1}
                        >
                          <i className="bi bi-dash-lg"></i>
                        </button>
                        <input
                          type="text"
                          className="form-control text-center"
                          value={purchaseQty}
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={increaseQty}
                          disabled={purchaseQty >= selectedProduct.quantity}
                        >
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      </div>

                      <button
                        className="btn btn-danger flex-grow-1"
                        type="button"
                        disabled={selectedProduct?.quantity === 0}
                        onClick={() => {
                          addToCart(selectedProduct, purchaseQty);
                          setSelectedProduct(null);
                        }}
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {selectedProduct.isSale && (
                <div className="position-absolute top-0 start-0 bg-danger text-white px-3 py-1 rounded-bottom">
                  SALE
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
