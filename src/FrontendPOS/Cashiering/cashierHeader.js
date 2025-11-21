import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CashierHeader = ({ setCashierInfo }) => {
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const [showChangePassword, setShowChangePassword] = useState(false);

  const userIconRef = useRef(null);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const loggedInUserId = storedUser ? JSON.parse(storedUser).employee_id : null;

  const [messageModal, setMessageModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "info", // success, error, warning
  });

  // ✅ Fetch user data
  const fetchUser = async () => {
    if (!loggedInUserId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/getaccount/${loggedInUserId}`
      );
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();

      if (data.birthday) {
        const dateObj = new Date(data.birthday);
        data.birthday = dateObj.toISOString().split("T")[0];
        data.birthdayFormatted = dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      setUser(data);
      setEditUser(data);
      setPreviewImage(null);

      if (setCashierInfo) {
        setCashierInfo(data);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [loggedInUserId]);

  // ✅ Build full image URL
  const getUserImage = (img) => {
    if (!img) return "/default.png";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    if (img.startsWith("uploads/")) return `http://localhost:5000/${img}`;
    return `http://localhost:5000/uploads/${img}`;
  };

  // ✅ Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setEditUser({ ...editUser, image: file });
    }
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (user && token) {
        await axios.post(
          `http://localhost:5000/api/login/setActive/${user.employee_id}`,
          { isActive: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ✅ Verify password before showing user modal
  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) {
      setPasswordError("Please enter your password");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/users/verifyPassword`,
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
        setShowUserModal(true);
      } else {
        setPasswordError(data.message || "Invalid password");
      }
    } catch (err) {
      console.error("Error verifying password:", err);
      setPasswordError("Server error. Please try again.");
    }
  };

  // ✅ Save profile changes
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("employee_id", editUser.employee_id || user.employee_id);
      formData.append("username", editUser.username || user.username || "");
      formData.append("name", editUser.name || "");
      formData.append("email", editUser.email || "");
      formData.append("contact", editUser.contact || "");
      formData.append("address", editUser.address || "");
      formData.append("birthday", editUser.birthday || "");

      if (editUser.image instanceof File) {
        formData.append("image", editUser.image);
      }

      await axios.post(
        `http://localhost:5000/api/login/update/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await fetchUser();
      setIsEditing(false);
      setMessageModal({
        show: true,
        title: "Success",
        message: "✅ Profile updated successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessageModal({
        show: true,
        title: "Error",
        message: "❌ Failed to update profile.",
        type: "error",
      });
    }
  };

  // ✅ Handle change password
  const handleChangePassword = async () => {
    if (!user || !user.employee_id) {
      setMessageModal({
        show: true,
        title: "Error",
        message: "⚠️ User not found.",
        type: "error",
      });
      return;
    }

    if (!editUser.oldPassword || !editUser.newPassword) {
      setMessageModal({
        show: true,
        title: "Warning",
        message: "⚠️ Please enter both old and new passwords.",
        type: "warning",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessageModal({
          show: true,
          title: "Error",
          message: "⚠️ You are not logged in. Please log in again.",
          type: "error",
        });
        return;
      }

      const passwordRes = await axios.post(
        "http://localhost:5000/api/login/update/cashier-change-password",
        {
          employee_id: user.employee_id,
          oldPassword: editUser.oldPassword,
          newPassword: editUser.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!passwordRes.data.success) {
        setMessageModal({
          show: true,
          title: "Error",
          message: passwordRes.data.message || "❌ Old password incorrect.",
          type: "error",
        });
        return;
      }

      setMessageModal({
        show: true,
        title: "Success",
        message: "✅ Password changed successfully!",
        type: "success",
      });

      setEditUser({ ...editUser, oldPassword: "", newPassword: "" });
      setShowChangePassword(false);
    } catch (err) {
      console.error("Error changing password:", err);
      setMessageModal({
        show: true,
        title: "Error",
        message: "❌ Server error. Please try again later.",
        type: "error",
      });
    }
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-3 header-green">
      <h2 className="mb-0 text-shadow">🧾 Cashiering</h2>

      <div style={{ position: "relative" }}>
        <FaUserCircle
          size={28}
          className="icon-shadow"
          onClick={() => setShowPasswordModal(true)}
          style={{ cursor: "pointer" }}
        />

        {/* 📢 Message Modal */}
        {messageModal.show && (
          <div
            className="modals-backdrop"
            onClick={() => setMessageModal({ ...messageModal, show: false })}
          >
            <div className="modals-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modals-content p-3">
                <h5
                  className={
                    messageModal.type === "success"
                      ? "text-success"
                      : messageModal.type === "error"
                      ? "text-danger"
                      : "text-warning"
                  }
                >
                  {messageModal.title}
                </h5>
                <p>{messageModal.message}</p>
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      setMessageModal({ ...messageModal, show: false })
                    }
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔒 Password Modal */}
        {showPasswordModal && (
          <div
            className="modals-backdrop"
            onClick={() => setShowPasswordModal(false)}
          >
            <div className="modals-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modals-content p-3">
                <div className="header-identity-h5">
                  <h5>🔒 Verify Your Identity</h5>
                </div>
                <input
                  type="password"
                  className="form-control my-2"
                  placeholder="Enter Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
                {passwordError && (
                  <div className="text-danger mb-2">{passwordError}</div>
                )}
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handlePasswordSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 👤 User Panel Modal */}
        {showUserModal && user && (
          <div
            className="modals-backdrop"
            onClick={() => setShowUserModal(false)}
          >
            <div className="modals-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modals-content p-3">
                <h2 className="hello-text-header">𝐇𝐞𝐥𝐥𝐨.. 👋</h2>

                <div className="text-center mb-3">
                  <img
                    src={getUserImage(user.image)}
                    alt={user.name || "User"}
                    className="rounded-circle"
                    width={80}
                    height={80}
                    style={{ objectFit: "cover" }}
                  />
                  <p className="mt-2 mb-0">{user.name}</p>
                  <small className="text-muted">{user.username}</small>
                </div>
                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => {
                      setShowUserModal(false);
                      setShowAccountModal(true);
                    }}
                  >
                    Account
                  </button>
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📝 Account Modal */}
        {showAccountModal && editUser && (
          <div
            className="modals-backdrop"
            onClick={() => setShowAccountModal(false)}
          >
            <div
              className="modals-dialog modals-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modals-content p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="profile-css-com">
                    <h4>{isEditing ? "Edit Profile" : "Profile"}</h4>
                  </div>
                </div>

                <div className="text-center mb-3">
                  <img
                    src={previewImage || getUserImage(editUser.image)}
                    alt={editUser.name}
                    className="rounded-circle"
                    width={100}
                    height={100}
                  />
                  {isEditing && (
                    <div className="mt-2">
                      <label className="btn btn-sm btn-outline-secondary">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="modals-container-edit-user">
                    {/* ✏️ Username */}
                    <div className="mb-3 modals-edit-user-field">
                      <label className="form-label modals-edit-user-label">
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control modals-edit-user-input"
                        value={editUser.username || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, username: e.target.value })
                        }
                        placeholder="Enter username"
                      />
                    </div>

                    <div className="mb-3 modals-edit-user-field">
                      <label className="form-label modals-edit-user-label">
                        Name
                      </label>
                      <input
                        type="text"
                        className="form-control modals-edit-user-input"
                        value={editUser.name || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, name: e.target.value })
                        }
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="mb-3 modals-edit-user-field">
                      <label className="form-label modals-edit-user-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control modals-edit-user-input"
                        value={editUser.email || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, email: e.target.value })
                        }
                        placeholder="Enter email"
                      />
                    </div>

                    <div className="mb-3 modals-edit-user-field">
                      <label className="form-label modals-edit-user-label">
                        Contact
                      </label>
                      <input
                        type="text"
                        className="form-control modals-edit-user-input"
                        value={editUser.contact || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, contact: e.target.value })
                        }
                        placeholder="Enter contact number"
                      />
                    </div>

                    <div className="mb-3 modals-edit-user-field">
                      <label className="form-label modals-edit-user-label">
                        Address
                      </label>
                      <input
                        type="text"
                        className="form-control modals-edit-user-input"
                        value={editUser.address || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, address: e.target.value })
                        }
                        placeholder="Enter address"
                      />
                    </div>

                    <div className="mb-3 modals-edit-user-field">
                      <label className="form-label modals-edit-user-label">
                        Birthday
                      </label>
                      <input
                        type="date"
                        className="form-control modals-edit-user-input"
                        value={editUser.birthday || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, birthday: e.target.value })
                        }
                      />
                    </div>

                    {/* 🔑 Password Fields */}
                    {showChangePassword && (
                      <div className="modals-edit-user-password-section">
                        <input
                          type="password"
                          className="form-control modals-edit-user-input my-2"
                          placeholder="Old Password"
                          value={editUser.oldPassword || ""}
                          onChange={(e) =>
                            setEditUser({
                              ...editUser,
                              oldPassword: e.target.value,
                            })
                          }
                        />
                        <input
                          type="password"
                          className="form-control modals-edit-user-input my-2"
                          placeholder="New Password"
                          value={editUser.newPassword || ""}
                          onChange={(e) =>
                            setEditUser({
                              ...editUser,
                              newPassword: e.target.value,
                            })
                          }
                        />

                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-secondary btn-sm modals-edit-user-btn"
                            onClick={() => {
                              setEditUser({
                                ...editUser,
                                oldPassword: "",
                                newPassword: "",
                              });
                              setShowChangePassword(false);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-warning btn-sm modals-edit-user-btn"
                            onClick={handleChangePassword}
                          >
                            Save New Password
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-end gap-2 mt-3 modals-edit-user-actions">
                      <button
                        className="btn btn-secondary btn-sm modal-edit-user-btn"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary btn-sm modals-edit-user-btn"
                        onClick={handleSaveChanges}
                      >
                        Save Profile
                      </button>
                      <button
                        className="btn btn-warning btn-sm modals-edit-user-btn"
                        onClick={() =>
                          setShowChangePassword(!showChangePassword)
                        }
                      >
                        {showChangePassword
                          ? "Cancel Change Password"
                          : "Change Password"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>
                      <strong>Username:</strong> {user.username}
                    </p>
                    <p>
                      <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Contact:</strong> {user.contact}
                    </p>
                    <p>
                      <strong>Address:</strong> {user.address}
                    </p>
                    <p>
                      <strong>Birthday:</strong> {user.birthday}
                    </p>
                    <p>
                      <strong>Position:</strong> {user.position}
                    </p>

                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowAccountModal(false)}
                      >
                        Close
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierHeader;
