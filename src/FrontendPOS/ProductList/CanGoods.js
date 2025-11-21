// CanGoods.js
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCart } from "../pages/cart.js";

const CanGoods = () => {
  // State to store all can goods fetched from backend
  const [items, setItems] = useState([]);
  // Loading state while fetching
  const [loading, setLoading] = useState(true);
  // Cart functions from custom hook
  const { addToCart } = useCart();

  // State for currently selected product in modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Quantity selected for purchase
  const [purchaseQty, setPurchaseQty] = useState(1);
  // Main image URL for modal display
  const [mainImage, setMainImage] = useState("");

  // State to store unique brands
  const [brands, setBrands] = useState([]);
  // State for currently selected brand filter
  const [selectedBrand, setSelectedBrand] = useState("All");

  // Fetch can goods from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/cangoods/getCangoods")
      .then((res) => res.json())
      .then((data) => {
        setItems(data); // store fetched items
        setLoading(false); // stop loading

        // Extract unique brands from the fetched data
        const uniqueBrands = [
          "All", // default option to show all products
          ...Array.from(new Set(data.map((p) => p.brand).filter(Boolean))),
        ];
        setBrands(uniqueBrands); // store brands
      })
      .catch((err) => {
        console.error("Error fetching can goods:", err);
        setLoading(false);
      });
  }, []);

  // Filter items by selected brand
  const filteredItems =
    selectedBrand === "All"
      ? items
      : items.filter((item) => item.brand === selectedBrand);

  // Handle opening the product modal
  const handleViewProduct = (product) => {
    setSelectedProduct(product); // set the selected product
    setPurchaseQty(1); // reset purchase quantity
    setMainImage(`http://localhost:5000/uploads/${product.image}`); // set main image
  };

  // Increase purchase quantity
  const increaseQty = () => {
    setPurchaseQty((prev) =>
      selectedProduct && prev < selectedProduct.quantity ? prev + 1 : prev
    );
  };

  // Decrease purchase quantity
  const decreaseQty = () => {
    setPurchaseQty((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // Show loading message if fetching
  if (loading) return <p className="p-3">Loading Can Goods...</p>;

  return (
    <div className="container mt-3">
      {/* Section title */}
      <h3 className="sale-product">Can Goods</h3>

      {/* Brand filter navbar */}
      <div className="mb-3 overflow-auto d-flex flex-nowrap gap-2 pb-2 brand-navbar">
        {brands.map((brand) => (
          <button
            key={brand}
            className={`btn btn-sm ${
              selectedBrand === brand ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setSelectedBrand(brand)} // update selected brand
          >
            {brand}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="row">
        {filteredItems.length > 0 ? (
          filteredItems.map((product) => (
            <div key={product.id} className="col-md-3 col-sm-6 product-slide">
              <div className="product-item">
                {/* Image wrapper with overlay buttons */}
                <div className="pi-img-wrapper">
                  <img
                    src={`http://localhost:5000/uploads/${product.image}`}
                    alt={product.product_name}
                    className="product-img"
                  />
                  <div className="overlay-btns">
                    {/* Zoom button */}
                    <button
                      className="btn"
                      title="Zoom"
                      onClick={() =>
                        window.open(
                          `http://localhost:5000/uploads/${product.image}`,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                    >
                      Zoom
                    </button>
                    {/* View button opens modal */}
                    <button
                      className="btn"
                      onClick={() => handleViewProduct(product)}
                    >
                      View
                    </button>
                  </div>
                </div>

                {/* Product name, price and add to cart */}
                <div className="text-center mt-2">
                  <div className="product-title">{product.product_name}</div>
                  <div className="pi-price">
                    ₱{parseFloat(product.price).toFixed(2)}
                  </div>
                  <button
                    className="btn btn-danger w-100 mt-2"
                    onClick={() =>
                      addToCart(
                        {
                          ...product,
                          image: `http://localhost:5000/uploads/${product.image}`,
                        },
                        1
                      )
                    }
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No Can Goods found.</p>
        )}
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div
          className="modal fade show d-block cg-overlay"
          tabIndex={-1}
          role="dialog"
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
          >
            <div className="modal-content rounded-3 shadow">
              {/* Close button */}
              <button
                type="button"
                className="btn-close position-absolute top-0 end-0 m-3"
                aria-label="Close"
                onClick={() => setSelectedProduct(null)}
                style={{ zIndex: 10 }}
              ></button>

              <div className="modal-body p-4">
                <div className="row gx-4">
                  {/* Left side - product image */}
                  <div className="col-md-6">
                    <img
                      src={mainImage}
                      alt={selectedProduct.product_name}
                      className="img-fluid rounded mb-3"
                      style={{
                        objectFit: "contain",
                        maxHeight: "350px",
                        width: "100%",
                      }}
                    />
                  </div>

                  {/* Right side - details and purchase */}
                  <div className="col-md-6 d-flex flex-column justify-content-between">
                    <div>
                      <h3 className="mb-3">{selectedProduct.product_name}</h3>
                      <p className="mb-1">
                        <strong>Brand: </strong> {selectedProduct.brand}
                      </p>
                      {/* Added description */}
                      <p className="mb-3">
                        <strong>Description: </strong>
                        {selectedProduct.description}
                      </p>
                      <div className="mb-3">
                        <span className="fs-4 fw-bold text-danger">
                          ₱{Number(selectedProduct.price).toFixed(2)}
                        </span>
                        <p className="mt-2 mb-1">
                          <strong>Availability: </strong>
                          {selectedProduct.quantity > 0
                            ? `${selectedProduct.quantity} in stock`
                            : "Out of Stock"}
                        </p>
                      </div>
                    </div>

                    {/* Quantity selector and add to cart */}
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
                          addToCart(
                            {
                              ...selectedProduct,
                              image: `http://localhost:5000/uploads/${selectedProduct.image}`,
                            },
                            purchaseQty
                          );
                          setSelectedProduct(null);
                        }}
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sale badge */}
              {selectedProduct.isSale && (
                <div className="position-absolute top-0 start-0 bg-danger text-white px-3 py-1 rounded-bottom">
                  SALE
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Hover + Overlay Styles */}
      <style>
        {`
          .product-item:hover .product-img {
            transform: scale(1.05);
          }

          .product-img {
            transition: transform 0.3s ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default CanGoods;
