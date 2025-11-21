import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { useCart } from "../pages/cart.js";
import ProductModal from "../components/ProductModal.js";
import { Link } from "react-router-dom";
import "./style.css";

const EcommerceLayout = ({ onViewProduct }) => {
  const { cart, removeFromCart, totalItems, totalPrice } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseQty, setPurchaseQty] = useState(1);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const userIconRef = useRef(null);
  const [user, setUser] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const storedUser = localStorage.getItem("user");
  const loggedInUserId = storedUser ? JSON.parse(storedUser).employee_id : null;

  const [imageFile, setImageFile] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  // ---------- FETCH USER ----------
  useEffect(() => {
    if (!loggedInUserId) return;

    const fetchUserData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/users/getaccount/${loggedInUserId}`
        );
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUserData();
  }, [loggedInUserId]);

  // ---------- FORM STATE ----------
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    address: "",
    contact: "",
    email: "",
    birthday: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        address: user.address || "",
        contact: user.contact || "",
        email: user.email || "",
        birthday: user.birthday ? user.birthday.split("T")[0] : "",
      });
      setPreviewImage(user.image || null);
    }
  }, [user]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // ---------- HANDLERS ----------
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setPurchaseQty(1);
    if (onViewProduct) onViewProduct(product);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const formPayload = new FormData();
      formPayload.append("employee_id", loggedInUserId);
      formPayload.append("username", formData.username);
      formPayload.append("name", formData.name);
      formPayload.append("address", formData.address);
      formPayload.append("contact", formData.contact);
      formPayload.append("email", formData.email);
      formPayload.append("birthday", formData.birthday);
      formPayload.append("oldPassword", oldPassword);
      formPayload.append("newPassword", newPassword);

      if (imageFile) {
        formPayload.append("image", imageFile);
      }

      const res = await fetch("http://localhost:5000/api/users/updateProfile", {
        method: "PUT",
        body: formPayload,
      });

      const data = await res.json();

      if (!res.ok) {
        setToastMessage(data.message || "Failed to update profile");
        setShowToast(true);
        return;
      }

      setToastMessage("Profile updated successfully!");
      setShowToast(true);
      setShowAccountModal(false);

      setUser({ ...user, ...formData, image: data.updatedImage || user.image });
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("Error updating profile:", err);
      setToastMessage("Failed to update profile");
      setShowToast(true);
    }
  };

  const handleLogout = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (user && token) {
        // update active status to false on backend
        await axios.post(
          `http://localhost:5000/api/login/setActive/${user.employee_id}`,
          { isActive: false },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // clear storages
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      sessionStorage.removeItem("appInitialized");

      // redirect to login
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const getUserImage = (img) =>
    img ? encodeURI(img) : process.env.PUBLIC_URL + "/default.png";

  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) {
      setPasswordError("Please enter your password");
      return;
    }
    try {
      const res = await fetch(
        "http://localhost:5000/api/users/verifyPassword",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: loggedInUserId,
            password: passwordInput,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordError("");
        setPasswordInput("");
        setShowPasswordModal(false);
        setShowUserModal(true); // ✅ Open user panel if password matches
      } else {
        setPasswordError(data.message || "Invalid password");
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      setPasswordError("Server error. Please try again.");
    }
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  // ---------- JSX ----------
  return (
    <div className="ecommerce">
      {/* TOP BAR */}
      <div className="pre-header">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-sm-6 additional-shop-info">
              <ul className="list-unstyled list-inline">
                <li>
                  <i className="fa fa-phone"></i>
                  <span>+63 912 345 6789</span>
                </li>
              </ul>
            </div>

            {/* USER MENU */}
            <div className="col-md-6 col-sm-6 additional-nav d-flex justify-content-end">
              <ul className="list-unstyled list-inline pull-right">
                <li style={{ position: "relative" }}>
                  <a
                    href="#"
                    ref={userIconRef}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPasswordModal(true); // ✅ Open password modal first
                    }}
                  >
                    <i className="fa fa-user"></i>
                  </a>

                  {showUserModal && (
                    <div className="custom-user-panel shadow-lg rounded">
                      <button
                        type="button"
                        className="custom-close-btn"
                        onClick={() => setShowUserModal(false)}
                      >
                        &times;
                      </button>

                      <div className="custom-avatar-section">
                        <img
                          src={getUserImage(user?.image)}
                          alt={user?.name || "Default User"}
                          className="custom-avatar-img"
                          onError={(e) =>
                            (e.target.src =
                              process.env.PUBLIC_URL + "/default.png")
                          }
                        />

                        <p className="custom-user-name">
                          {user?.name || "Guest User"}
                        </p>
                      </div>

                      <div className="custom-action-buttons">
                        <button
                          className="custom-action-btn"
                          onClick={() => {
                            setShowUserModal(false);
                            setShowAccountModal(true);
                          }}
                        >
                          Account
                        </button>
                        <button className="custom-action-btn">Message</button>
                        <button className="custom-action-btn">Settings</button>
                      </div>

                      <button
                        className="custom-logout-btn"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* HEADER */}
      {/* HEADER */}
      <div className="header">
        <div className="container">
          <a className="site-logo" href="#">
            <img
              src="/assets/corporate/img/logos/logo-shop-red.png"
              alt="Sari-Sari Store"
            />
          </a>

          {/* CART */}
          <div className="supershop-cart-block mt-5">
            <div
              className="supershop-cart-info"
              onClick={toggleCart}
              style={{ cursor: "pointer" }}
            >
              <a className="supershop-cart-info-count">{totalItems} items</a>
              <a className="supershop-cart-info-value">
                ₱{totalPrice.toFixed(2)}
              </a>
              <i className="fa fa-shopping-cart supershop-cart-icon"></i>
            </div>

            {/* ✅ Only show cart when open */}
            {isCartOpen && (
              <div className="supershop-cart-content-wrapper">
                <div className="top-cart-content">
                  {/* Close Button */}
                  <button
                    onClick={closeCart}
                    style={{
                      float: "right",
                      border: "none",
                      background: "transparent",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>

                  {cart.length > 0 ? (
                    <>
                      <ul
                        className="scroller cart-list"
                        style={{ height: "250px", overflowY: "auto" }}
                      >
                        {cart.map((item) => (
                          <li key={item.id} className="cart-item">
                            {/* Product Image */}
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedProduct(item);
                              }}
                            >
                              <img
                                src={item.image}
                                alt={item.product_name}
                                className="cart-item-img"
                              />
                            </a>

                            {/* Product Details */}
                            <div className="cart-item-details">
                              <div className="cart-item-name">
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedProduct(item);
                                  }}
                                >
                                  {item.product_name}
                                </a>
                              </div>
                              <div className="cart-item-meta">
                                <span className="cart-item-qty">
                                  x{item.qty}
                                </span>
                                <span className="cart-item-price">
                                  ₱{(item.price * item.qty).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="del-goods"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>

                      <div className="text-right mt-2">
                        <Link
                          to="/pos/detail/cart"
                          className="btn btn-default"
                          onClick={closeCart}
                        >
                          View Cart
                        </Link>
                        <a
                          href="#"
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.preventDefault();
                            closeCart();
                            navigate("/pos/detail/checkout");
                          }}
                        >
                          Checkout
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="p-3 text-center">Your cart is empty.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          purchaseQty={purchaseQty}
          setPurchaseQty={setPurchaseQty}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {/* ACCOUNT MODAL */}
      {showAccountModal && user && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowAccountModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title w-100 text-center">
                  <i className="fa fa-user-circle me-2"></i> Edit Profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAccountModal(false)}
                ></button>
              </div>

              <div className="modal-body px-4">
                {/* Profile Image */}
                <div className="text-center mb-4">
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      margin: "0 auto",
                      border: "3px solid #fff",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => setShowImagePreview(true)}
                  >
                    <img
                      src={previewImage || getUserImage(user.image)}
                      alt="Profile"
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </div>

                  {/* Upload Button Moved Outside */}
                  <div className="mt-3">
                    <label
                      htmlFor="fileUpload"
                      className="btn btn-sm btn-outline-primary"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="bi bi-pencil-fill me-1"></i> Change Photo
                    </label>
                    <input
                      id="fileUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="row g-3">
                  {[
                    { label: "Username", name: "username" },
                    { label: "Name", name: "name" },
                    { label: "Address", name: "address" },
                    { label: "Contact", name: "contact" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Birthday", name: "birthday", type: "date" },
                  ].map(({ label, name, type = "text" }) => (
                    <div key={name} className="col-md-6">
                      <label className="form-label">{label}</label>
                      <input
                        name={name}
                        type={type}
                        value={formData[name] || ""}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  ))}
                </div>

                {/* Change Password */}
                <div className="mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => setShowPasswordFields((prev) => !prev)}
                  >
                    {showPasswordFields ? "Cancel" : "Change Password"}
                  </button>
                </div>

                {showPasswordFields && (
                  <div className="p-3 rounded mt-3 bg-light border">
                    <div className="mb-2">
                      <label className="form-label">Old Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    {passwordMessage && (
                      <div className="text-warning mt-1">{passwordMessage}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer justify-content-between">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => setShowAccountModal(false)}
                >
                  Close
                </button>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* IMAGE PREVIEW */}
      {showImagePreview && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
          style={{ zIndex: 2000 }}
          onClick={() => setShowImagePreview(false)}
        >
          <img
            src={previewImage || getUserImage(user?.image)}
            alt="Preview"
            className="img-fluid rounded shadow"
            style={{ maxHeight: "90%", maxWidth: "90%", objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* Toast Notification */}
      <div
        className={`position-fixed top-0 end-0 p-3`}
        style={{ zIndex: 3000 }}
      >
        <div
          className={`toast align-items-center text-bg-success border-0 ${
            showToast ? "show" : ""
          }`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">{toastMessage}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
        </div>
      </div>
      {/* PASSWORD VERIFICATION MODAL */}
      {showPasswordModal && (
        <div
          className="buneyw-password-modal"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="buneyw-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="buneyw-content">
              <div className="buneyw-header">
                <h5 className="buneyw-title">🔒 Verify it's you!!</h5>
                <button
                  type="button"
                  className="buneyw-close-btn"
                  onClick={() => setShowPasswordModal(false)}
                >
                  ✖
                </button>
              </div>
              <div className="buneyw-body">
                <input
                  type="password"
                  className="buneyw-input"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
                {passwordError && (
                  <div className="buneyw-error">{passwordError}</div>
                )}
              </div>
              <div className="buneyw-footer">
                <button
                  type="button"
                  className="buneyw-btn buneyw-btn-cancel"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="buneyw-btn buneyw-btn-submit"
                  onClick={handlePasswordSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcommerceLayout;
