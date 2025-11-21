import React, { useState } from "react";
import { useCart } from "../pages/cart.js";

const ProductModal = ({ product, purchaseQty, setPurchaseQty, onClose }) => {
  const { addToCart } = useCart();
  const [mainImage, setMainImage] = useState(product?.image || "");

  if (!product) return null;

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;

  const decreaseQty = () => setPurchaseQty((qty) => Math.max(1, qty - 1));
  const increaseQty = () =>
    setPurchaseQty((qty) => Math.min(product.quantity || 999, qty + 1));

  return (
    <div
      id="product-pop-up"
      className={`modal fade show d-block`}
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
          {/* Close Button */}
          <button
            type="button"
            className="btn-close position-absolute top-0 end-0 m-3"
            aria-label="Close"
            onClick={onClose}
            style={{ zIndex: 10 }}
          ></button>

          <div className="modal-body p-4">
            <div className="row gx-4">
              {/* Left Side - Images */}
              <div className="col-md-6">
                <img
                  src={mainImage || product.image}
                  alt={product.product_name}
                  className="img-fluid rounded mb-3"
                  style={{
                    objectFit: "contain",
                    maxHeight: "350px",
                    width: "100%",
                  }}
                />
                {product.otherImages?.length > 0 && (
                  <div className="d-flex flex-wrap gap-2">
                    {product.otherImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`border rounded p-1 ${
                          mainImage === img
                            ? "border-danger"
                            : "border-secondary"
                        }`}
                        style={{
                          width: 60,
                          height: 60,
                          cursor: "pointer",
                          background: "none",
                        }}
                        onClick={() => setMainImage(img)}
                      >
                        <img
                          src={img}
                          alt={`${product.product_name} ${idx + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side - Details */}
              <div className="col-md-6 d-flex flex-column justify-content-between">
                <div>
                  <h3 className="mb-3">{product.product_name}</h3>

                  {/* Price & Availability */}
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
                      {product.quantity > 0
                        ? `${product.quantity} in stock`
                        : "Out of Stock"}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-secondary" style={{ minHeight: "80px" }}>
                    {product.description || "No description available."}
                  </p>
                </div>

                {/* Quantity selector and action buttons */}
                <div className="d-flex align-items-center gap-3 mt-4">
                  <div
                    className="input-group"
                    style={{
                      width: "120px",
                      borderRadius: "0.375rem",
                      overflow: "hidden",
                    }}
                  >
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
                      style={{ maxWidth: "50px" }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={increaseQty}
                      disabled={purchaseQty >= product.quantity}
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>

                  <button
                    className="btn btn-danger flex-grow-1"
                    type="button"
                    disabled={product?.quantity === 0}
                    onClick={() => {
                      addToCart(product, purchaseQty);
                      onClose();
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          </div>

          {product.isSale && (
            <div
              className="position-absolute top-0 start-0 bg-danger text-white px-3 py-1 rounded-bottom"
              style={{ fontWeight: "700", fontSize: "0.9rem" }}
            >
              SALE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
