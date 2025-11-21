import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { ThemeContext } from "../context/themeContext.js";
import DigitalClock from "./DigitalClock.js";
import { EmailContext } from "../context/EmailContext.js";
import StatusModal from "./StatusModal.js";
import LowStockAlert from "../components/Dashboard/LowStockAlert.js";

function Header({ onToggleSidebar = () => {} }) {
  const [user, setUser] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [language, setLanguage] = useState("en");
  const [companyLogo, setCompanyLogo] = useState("/sample.jpg");
  const [clock, setClock] = useState(new Date());
  const { theme, setTheme } = useContext(ThemeContext);
  const { unreadCount } = useContext(EmailContext); // shared badge
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const logoUrl = user?.logo || `${process.env.PUBLIC_URL}/sample.jpg`;

  const [showToast, setShowToast] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      axios
        .get(`http://localhost:5000/api/login/profile/${parsedUser.id}`)
        .then((response) => {
          setFormData(response.data);
          if (response.data.image) {
            const imagePath = `http://localhost:5000/${response.data.image.replace(
              /^\/?/,
              ""
            )}`;
            setPreviewImage(imagePath);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch profile:", error);
        });
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setClock(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSave = async () => {
    console.log("Updating employee_id:", user.employee_id); // ✅ correct ID

    try {
      const formPayload = new FormData();
      formPayload.append("employee_id", user.employee_id);
      formPayload.append("name", formData.name || "");
      formPayload.append("username", formData.username || "");
      formPayload.append("address", formData.address || "");
      formPayload.append("contact", formData.contact || "");
      formPayload.append("email", formData.email || "");
      formPayload.append("birthday", formData.birthday || "");

      if (formData.image && formData.image instanceof File) {
        formPayload.append("image", formData.image);
      }

      // Update profile (employee + register)
      await axios.post(
        "http://localhost:5000/api/login/update/profile",
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Change password if both old and new passwords are provided
      if (oldPassword && newPassword) {
        const passwordRes = await axios.post(
          "http://localhost:5000/api/login/update/change-password",
          {
            userId: user.id,
            oldPassword,
            newPassword,
          }
        );

        if (!passwordRes.data.success) {
          setPasswordMessage(
            passwordRes.data.message || "Old password incorrect."
          );
          return;
        }
      }

      // Clear form, close modal & show toast
      setShowModal(false);
      setPasswordMessage("");
      setOldPassword("");
      setNewPassword("");
      setShowPasswordFields(false);
      console.log("✅ Profile updated.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("❌ Failed to save profile:", err);
      setPasswordMessage("Error saving profile.");
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      setPasswordMessage("Please enter both fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/login/update/change-password",
        {
          userId: user.id,
          oldPassword,
          newPassword,
        }
      );

      if (response.data.success) {
        setPasswordMessage("Password updated successfully.");
        setOldPassword("");
        setNewPassword("");
        setShowPasswordFields(false);
      } else {
        setPasswordMessage(
          response.data.message || "Old password is incorrect."
        );
      }
    } catch (error) {
      setPasswordMessage("Error updating password.");
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/loginPage");
  };

  const profilePic = previewImage || "/default-avatar.png";
  const displayName = user.name || user.username || "User";

  return (
    <>
      <nav
        className="sb-topnav navbar navbar-expand theme-navbar position-sticky top-0"
        style={{ zIndex: 1050, padding: 10, height: 120, marginTop: -50 }}
      >
        <Link
          className="navbar-brand ps-3 d-flex align-items-center gap-2"
          to="/"
          style={{ color: "var(--text-color)", textDecoration: "none" }}
        >
          <img
            src={logoUrl}
            alt="Store Logo"
            width="60"
            height="60"
            className="rounded-circle"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${process.env.PUBLIC_URL}/sample.jpg`;
            }}
          />

          <span>{displayName}</span>
        </Link>

        <button
          className="btn btn-link btn-sm me-4"
          onClick={onToggleSidebar}
          style={{ color: "var(--text-color)" }}
        >
          <i className="fas fa-bars"></i>
        </button>

        <DigitalClock />

        {/* POS Button */}
        <button
          className="themed-btn d-flex align-items-center gap-2 ms-5"
          onClick={() => navigate("/pos")}
          title="Point of Sale"
        >
          <i className="bi bi-pc-display-horizontal fs-5"></i>
          POS
        </button>

        {/* Email Icon with shared unread badge */}
        <div className="position-relative d-inline-block ms-2">
          <button
            className="themed-btn d-flex align-items-center gap-2"
            onClick={() => {
              setShowStatusModal(true);
              setTimeout(() => {
                navigate("/email");
              }, 500); // slight delay for UX
            }}
            title="Email"
          >
            <i className="bi bi-envelope fs-5"></i>
          </button>

          {unreadCount > 0 && (
            <span
              className="badge rounded-pill position-absolute"
              style={{
                top: 0,
                right: 0,
                transform: "translate(50%,-25%)",
                backgroundColor: "#dc3545",
                color: "#fff",
                fontSize: "0.6rem",
                minWidth: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                lineHeight: 1,
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>

        {/* Notifications Button with Low Stock Alert */}
        <div className="position-relative d-inline-block ms-2">
          <button
            className="themed-btn d-flex align-items-center gap-2"
            onClick={() => navigate("/notifications")}
            title="Notifications"
          >
            <i className="bi bi-bell fs-5"></i>
          </button>

          {/* Low Stock Badge integrated beside bell */}
          <div
            className="position-absolute"
            style={{
              top: "-8px",
              right: "-12px",
            }}
          >
            <LowStockAlert />
          </div>
        </div>

        <div className="d-flex align-items-center ms-auto me-3">
          <form className="d-none d-md-flex">
            <div className="input-group">
              <input
                className="form-control"
                type="text"
                placeholder="Search for..."
                style={{
                  backgroundColor: "var(--input-bg-color)",
                  color: "var(--text-color)",
                  borderColor: "var(--border-color)",
                }}
              />
              <button
                className="btn"
                type="button"
                style={{
                  backgroundColor: "var(--searchicon-color)",
                  color: "var(--button-text-color)",
                }}
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>

          <button
            className="btn btn-link ms-3"
            onClick={() => setShowModal(true)}
            style={{ color: "var(--text-color)" }}
          >
            <img
              src={profilePic}
              alt="User"
              width="32"
              height="32"
              className="rounded-circle"
            />
          </button>

          <button
            className="btn btn-link ms-3"
            onClick={() => setShowSettingsModal(true)}
            style={{ color: "var(--text-color)" }}
          >
            <i className="bi bi-gear-fill fs-5"></i>
          </button>
        </div>
      </nav>

      {showModal && (
        <>
          {/* Fullscreen Image Preview */}
          {showImagePreview && (
            <div
              className={`position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center ${
                theme === "dark"
                  ? "bg-dark bg-opacity-75"
                  : "bg-light bg-opacity-75"
              }`}
              onClick={() => setShowImagePreview(false)}
              style={{ zIndex: 2000 }}
            >
              <img
                src={previewImage || "/default-avatar.png"}
                alt="Preview"
                className="img-fluid rounded shadow"
                style={{
                  maxHeight: "90%",
                  maxWidth: "90%",
                  objectFit: "contain",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Edit Profile Modal */}
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div
                className={`modal-content ${
                  theme === "dark"
                    ? "bg-dark text-white border-secondary"
                    : "bg-light text-dark border-light"
                } border shadow-lg`}
              >
                <div
                  className={`modal-header border-bottom ${
                    theme === "dark" ? "border-secondary" : "border-light"
                  }`}
                >
                  <h5 className="modal-title w-100 text-center">
                    <i className="bi bi-person-circle me-2"></i>Edit Profile
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body px-4">
                  {/* Profile Image */}
                  {/* Profile Image */}
                  <div className="text-center mb-4">
                    <div
                      className="position-relative mx-auto"
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "3px solid #fff",
                        cursor: "pointer",
                      }}
                      title="Click to preview"
                      onClick={() => setShowImagePreview(true)}
                    >
                      <img
                        src={previewImage || "/default-avatar.png"}
                        alt="Profile"
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    {/* Change Photo Button - outside the image */}
                    <div className="mt-2">
                      <label
                        htmlFor="fileUpload"
                        className={`btn btn-sm btn-outline-${
                          theme === "dark" ? "light" : "dark"
                        }`}
                      >
                        <i className="bi bi-pencil-fill me-1"></i>Change Photo
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
                      {
                        label: "Employee ID",
                        name: "employee_id",
                        readOnly: true,
                      },
                      { label: "Username", name: "username" },
                      { label: "Name", name: "name" },
                      { label: "Address", name: "address" },
                      { label: "Contact", name: "contact" },
                      { label: "Email", name: "email", type: "email" },
                      { label: "Birthday", name: "birthday", type: "date" },
                    ].map(({ label, name, readOnly, type = "text" }) => (
                      <div key={name} className="col-md-6">
                        <label className="form-label">{label}</label>
                        <input
                          name={name}
                          type={type}
                          value={formData[name] || ""}
                          onChange={handleChange}
                          className={`form-control ${
                            theme === "dark"
                              ? "bg-dark text-white border-secondary"
                              : "bg-light text-dark border-light"
                          }`}
                          readOnly={readOnly}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Change Password */}
                  <div className="mt-4">
                    <button
                      type="button"
                      className={`btn btn-outline-${
                        theme === "dark" ? "light" : "dark"
                      } btn-sm`}
                      onClick={() => setShowPasswordFields((prev) => !prev)}
                    >
                      <i
                        className={`bi ${
                          showPasswordFields ? "bi-x-circle" : "bi-key-fill"
                        } me-1`}
                      ></i>
                      {showPasswordFields ? "Cancel" : "Change Password"}
                    </button>
                  </div>

                  {showPasswordFields && (
                    <div
                      className={`p-3 rounded mt-3 ${
                        theme === "dark" ? "bg-secondary" : "bg-light border"
                      }`}
                    >
                      <div className="mb-2">
                        <label className="form-label">Old Password</label>
                        <input
                          type="password"
                          className={`form-control ${
                            theme === "dark"
                              ? "bg-dark text-white border-secondary"
                              : "bg-light text-dark border-light"
                          }`}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">New Password</label>
                        <input
                          type="password"
                          className={`form-control ${
                            theme === "dark"
                              ? "bg-dark text-white border-secondary"
                              : "bg-light text-dark border-light"
                          }`}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      {passwordMessage && (
                        <div className="text-warning mt-1">
                          {passwordMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={`modal-footer border-top justify-content-between ${
                    theme === "dark" ? "border-secondary" : "border-light"
                  }`}
                >
                  <button
                    type="button"
                    className={`btn btn-sm btn-outline-${
                      theme === "dark" ? "light" : "dark"
                    }`}
                    onClick={() => setShowModal(false)}
                    title="Cancel"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      onClick={handleSave}
                      title="Save Changes"
                    >
                      <i className="bi bi-save"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <i className="bi bi-box-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showSettingsModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
        >
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div
              className={`modal-content ${
                theme === "dark"
                  ? "bg-dark text-white border-secondary"
                  : "bg-light text-dark border-light"
              } border shadow-lg`}
            >
              <div
                className={`modal-header border-bottom ${
                  theme === "dark" ? "border-secondary" : "border-light"
                }`}
              >
                <h5 className="modal-title w-100 text-center">
                  <i className="bi bi-gear-fill me-2"></i>Settings
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSettingsModal(false)}
                ></button>
              </div>

              <div className="modal-body px-4">
                <div className="mb-3">
                  <label className="form-label">Language</label>
                  <select
                    className={`form-select ${
                      theme === "dark"
                        ? "bg-dark text-white border-secondary"
                        : "bg-light text-dark border-light"
                    }`}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="jp">Japanese</option>
                    <option value="ph">Filipino</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Theme</label>
                  <select
                    className={`form-select ${
                      theme === "dark"
                        ? "bg-dark text-white border-secondary"
                        : "bg-light text-dark border-light"
                    }`}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>

              <div
                className={`modal-footer border-top justify-content-end ${
                  theme === "dark" ? "border-secondary" : "border-light"
                }`}
              >
                <button
                  type="button"
                  className={`btn btn-outline-${
                    theme === "dark" ? "light" : "dark"
                  } btn-sm`}
                  onClick={() => setShowSettingsModal(false)}
                >
                  <i className="bi bi-x-lg"></i> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StatusModal
        show={showStatusModal}
        status={isOnline}
        onClose={() => setShowStatusModal(false)}
      />

      {/* Toast Notification */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 3000 }}>
        <div
          className={`toast align-items-center text-bg-success border-0 ${
            showToast ? "show" : "hide"
          }`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className="d-flex">
            <div className="toast-body">✅ Profile updated successfully!</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
