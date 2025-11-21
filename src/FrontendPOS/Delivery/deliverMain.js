import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./delivery.css";

const DeliveryMain = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [editForm, setEditForm] = useState({});

  // ✅ Modal stack system
  const [activeModal, setActiveModal] = useState(null);
  const [modalStack, setModalStack] = useState([]);
  const [reason, setReason] = useState("");

  // ✅ Filter state
  const [statusFilter, setStatusFilter] = useState("all");

  const openModal = (modal) => {
    setModalStack((prev) => [...prev, activeModal]);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(modalStack[modalStack.length - 1] || null);
    setModalStack((prev) => prev.slice(0, -1));
    setReason("");
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/delivery/get");

      const data = res.data.map((d) => ({
        ...d,
        items: Array.isArray(d.items) ? d.items : JSON.parse(d.items || "[]"),
        total: Number(d.total) || 0,
        shipping_fee: Number(d.shipping_fee) || 0,
        payment_status:
          d.payment_status && d.payment_status.toLowerCase() === "paid"
            ? "paid"
            : "unpaid",
      }));

      setDeliveries(data);
    } catch (error) {
      console.error("❌ Error fetching deliveries:", error);
      toast.error("Failed to fetch deliveries.");
    }
  };

  const handleGet = (delivery) => {
    setSelectedDelivery(delivery);
    setActiveModal("login");
  };

  const handleVerifyUser = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/delivery/verify-user",
        { username, password }
      );

      if (
        res.data.success &&
        res.data.employee?.position?.toLowerCase() === "delivery"
      ) {
        setVerifiedUser(res.data.employee);
        setUsername("");
        setPassword("");

        // ✅ Keep selectedDelivery intact when moving to "user" modal
        setActiveModal("user");

        toast.success("User verified successfully!");
      } else {
        toast.error("❌ Not authorized. Only delivery employees can proceed.");
      }
    } catch (error) {
      console.error("❌ Error verifying user:", error);
      toast.error("Failed to verify user.");
    }
  };

  const handleEditProfileClick = () => {
    setEditForm({ ...verifiedUser, showPasswordFields: false });
    openModal("edit");
  };

  const handleEditFormChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setEditForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ✅ Save Profile or Password
  const handleSaveProfile = async () => {
    try {
      // Change password
      if (
        editForm.showPasswordFields &&
        editForm.oldPassword &&
        editForm.newPassword
      ) {
        const res = await axios.put(
          "http://localhost:5000/api/delivery/update/change-password",
          {
            userId: verifiedUser?.id || verifiedUser?.register_id,
            oldPassword: editForm.oldPassword,
            newPassword: editForm.newPassword,
          }
        );

        if (res.data.success) {
          toast.success("✅ Password updated!");
          setEditForm((prev) => ({
            ...prev,
            showPasswordFields: false,
            oldPassword: "",
            newPassword: "",
          }));
          closeModal();
        } else {
          toast.error(res.data.error || "❌ Failed to update password");
        }
        return;
      }

      // Update profile
      const formData = new FormData();
      Object.keys(editForm).forEach((key) => {
        if (
          !["showPasswordFields", "oldPassword", "newPassword"].includes(key) &&
          editForm[key] !== null &&
          editForm[key] !== ""
        ) {
          formData.append(key, editForm[key]);
        }
      });

      formData.append("userId", verifiedUser?.id || verifiedUser?.register_id);

      const res = await axios.put(
        "http://localhost:5000/api/delivery/update/profile",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        toast.success("✅ Profile updated!");
        setVerifiedUser((prev) => ({
          ...prev,
          ...editForm,
          image:
            editForm.image instanceof File
              ? URL.createObjectURL(editForm.image)
              : prev.image,
        }));
        closeModal();
      } else {
        toast.error(res.data.error || "❌ Failed to update profile");
      }
    } catch (error) {
      console.error("❌ Error saving profile:", error);
      toast.error("Server error while saving changes.");
    }
  };

  // ✅ Mark delivery as Delivered
  // ✅ Mark delivery as Delivered
  const handleMarkDelivered = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/delivery/mark-delivered",
        {
          id: selectedDelivery.id,
          customer_name: selectedDelivery.customer_name,
          email: selectedDelivery.email || "",
          phone: selectedDelivery.phone || "",
          receiver: selectedDelivery.receiver || "",
          delivery_place: selectedDelivery.delivery_place || "",
          address: selectedDelivery.address || "",
          contact: selectedDelivery.contact || "",
          payment: selectedDelivery.payment,
          total: selectedDelivery.total,
          shipping_fee: selectedDelivery.shipping_fee,
          items: selectedDelivery.items,
        }
      );

      if (res.data.success) {
        toast.success(
          `✅ Order for ${selectedDelivery.customer_name} delivered!`
        );

        // ✅ Update both delivery_status and payment_status in state
        setDeliveries((prev) =>
          prev.map((d) =>
            d.id === selectedDelivery.id
              ? { ...d, delivery_status: "delivered", payment_status: "paid" }
              : d
          )
        );

        closeModal();
      } else {
        toast.error(res.data.message || "❌ Failed to update status");
      }
    } catch (error) {
      console.error("❌ Error updating delivery:", error);
      toast.error("Server error while updating delivery status.");
    }
  };

  // ✅ Mark delivery as Not Delivered
  const handleNotDelivered = async () => {
    if (!reason.trim()) {
      toast.error("⚠️ Please provide a reason.");
      return;
    }

    try {
      const res = await axios.put(
        "http://localhost:5000/api/delivery/update/delivery-status-reason",
        {
          id: selectedDelivery.id,
          status: "not delivered",
          reason,
          deliveryPersonId: verifiedUser?.id || verifiedUser?.register_id,
          deliveryPersonName: verifiedUser?.name || verifiedUser?.username,
        }
      );

      if (res.data.success) {
        toast.warning(
          `❌ Order for ${selectedDelivery.customer_name} not delivered.`
        );

        // ✅ Instead of removing, just update delivery_status
        setDeliveries((prev) =>
          prev.map((d) =>
            d.id === selectedDelivery.id
              ? { ...d, delivery_status: "not delivered" }
              : d
          )
        );

        closeModal();
      } else {
        toast.error(res.data.message || "❌ Failed to update status");
      }
    } catch (error) {
      console.error("❌ Error updating delivery:", error);
      toast.error("Server error while updating delivery status.");
    }
  };

  return (
    <div className="delivery-table-container mt-4">
      {/* 🔹 Filter Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Delivery List</h4>
        <div className="d-flex align-items-center">
          <label className="me-2 fw-bold">Filter Status:</label>
          <select
            className="form-select"
            style={{ width: "200px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="on the way">On the Way</option>
            <option value="delivered">Delivered</option>
            <option value="not delivered">Not Delivered</option>
          </select>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
      <div className="delivery-table-responsive">
        {/* Table */}
        <table className="delivery-table table-bordered table-striped">
          <thead className="delivery-table-head">
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Receiver</th>
              <th>Delivery Place</th>
              <th>Address</th>
              <th>Payment</th>
              <th>Payment Status</th>
              <th>Delivery Status</th>
              <th>Shipping Fee</th>
              <th>Items</th>
              <th>Total</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {deliveries
              .filter((d) =>
                statusFilter === "all"
                  ? true
                  : (d.delivery_status || "").toLowerCase().trim() ===
                    statusFilter
              )
              .map((d) => (
                <tr key={d.id} className="delivery-table-row">
                  {" "}
                  {/* Add hover class */}
                  <td>{d.id}</td>
                  <td>{d.customer_name}</td>
                  <td>{d.phone}</td>
                  <td>{d.receiver}</td>
                  <td>{d.delivery_place}</td>
                  <td>{d.address}</td>
                  <td>{d.payment}</td>
                  <td
                    className={
                      d.payment_status === "paid"
                        ? "text-success fw-bold"
                        : "text-danger fw-bold"
                    }
                  >
                    {d.payment_status || "N/A"}
                  </td>
                  <td>
                    <span
                      className={`delivery-status ${d.delivery_status
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`}
                    >
                      {d.delivery_status}
                    </span>
                  </td>
                  <td>₱{d.shipping_fee.toFixed(2)}</td>
                  <td>
                    <table className="table table-sm mb-0">
                      {" "}
                      {/* Keep Items table intact */}
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.product_name}</td>
                            <td>{item.quantity ?? item.qty ?? 0}</td>
                            <td>₱{Number(item.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                  <td>₱{d.total.toFixed(2)}</td>
                  <td>
                    {d.created_at
                      ? new Date(d.created_at).toLocaleString("en-PH", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                      : "N/A"}
                  </td>
                  <td>
                    {d.delivery_status === "on the way" ? (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => {
                          setSelectedDelivery(d);
                          setActiveModal("confirm");
                        }}
                      >
                        Moving
                      </button>
                    ) : d.delivery_status === "not delivered" ? (
                      <>
                        <button className="btn btn-sm btn-danger me-1" disabled>
                          Not Delivered
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleGet(d)}
                        >
                          Retry
                        </button>
                      </>
                    ) : d.delivery_status === "delivered" ? (
                      <button className="btn btn-sm btn-success" disabled>
                        Done
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary me-1"
                        onClick={() => handleGet(d)}
                      >
                        Get
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            {deliveries.length === 0 && (
              <tr>
                <td colSpan="14" className="text-center">
                  No deliveries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Confirm Delivery Modal */}
      {activeModal === "confirm" && selectedDelivery && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-3">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Confirm Delivery</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body text-center p-4">
                <h6 className="mb-3">
                  🚚 Are you done delivering the order of:
                </h6>
                <h5 className="fw-bold text-dark">
                  {selectedDelivery.customer_name}
                </h5>
              </div>
              <div className="modal-footer d-flex justify-content-between px-4">
                <button
                  className="btn btn-outline-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => setActiveModal("notDeliveredReason")}
                >
                  Not Delivered
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleMarkDelivered}
                >
                  Done ✅
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "confirm" && (
        <div className="modal-backdrop fade show"></div>
      )}

      {/* 🔹 Not Delivered Reason Modal */}
      {activeModal === "notDeliveredReason" && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-3">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Reason for Not Delivered</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <label className="form-label">What is the reason?</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Enter reason here..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-footer d-flex justify-content-between px-4">
                <button
                  className="btn btn-outline-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleNotDelivered}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModal === "notDeliveredReason" && (
        <div className="modal-backdrop fade show"></div>
      )}

      {/* 🔹 Login Modal */}
      {activeModal === "login" && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-3"
              style={{
                background: "antiqueWhite",
                textShadow: "1px 1px 1px white",
                color: "black",
                border: "1.5px solid black",
              }}
            >
              <div className="modal-header" style={{ background: "#1976d2" }}>
                <h5 className="modal-title">Verify Delivery User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid black",
                    textAlign: "center",
                    background: "lightblue",
                  }}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  className="form-control mb-2"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid black",
                    textAlign: "center",
                    background: "lightblue",
                  }}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleVerifyUser}>
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 User Modal */}
      {activeModal === "user" && verifiedUser && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-3 text-center"
              style={{
                background: "antiquewhite",
                border: "1.5px solid black",
              }}
            >
              <div
                className="modal-header"
                style={{
                  backgroundColor: "#1976d2",
                  color: "white",
                  textShadow: "1px 1px 2px rgba(5, 5, 5, 0.89)",
                }}
              >
                <h5 className="modal-title">Delivery Employee</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={
                    verifiedUser.image
                      ? verifiedUser.image.startsWith("blob:")
                        ? verifiedUser.image
                        : `http://localhost:5000/${verifiedUser.image}`
                      : "/default.png"
                  }
                  alt="Employee"
                  className="rounded-circle mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                  onError={(e) => (e.target.src = "/default.png")}
                />
                <h5>{verifiedUser.name}</h5>
                <p className="text-muted">{verifiedUser.position}</p>
              </div>
              <div className="modal-footer justify-content-center">
                <button
                  className="btn btn-success"
                  disabled={!selectedDelivery}
                  onClick={async () => {
                    if (!selectedDelivery) {
                      toast.error("No delivery selected!");
                      return;
                    }

                    try {
                      const riderName =
                        verifiedUser?.name ||
                        verifiedUser?.username ||
                        "Unknown Rider";

                      const res = await axios.put(
                        "http://localhost:5000/api/delivery/update/delivery-status",
                        {
                          id: selectedDelivery.id,
                          status: "on the way",
                          rider_name: riderName, // ✅ add rider
                        }
                      );

                      if (res.data.success) {
                        toast.success("🚚 Delivery is now On the Way!");
                        setDeliveries((prev) =>
                          prev.map((d) =>
                            d.id === selectedDelivery.id
                              ? {
                                  ...d,
                                  delivery_status: "on the way",
                                  rider_name: riderName,
                                }
                              : d
                          )
                        );
                        closeModal();
                      } else {
                        toast.error(
                          res.data.message || "❌ Failed to update status"
                        );
                      }
                    } catch (error) {
                      console.error("❌ Error updating delivery:", error);
                      toast.error(
                        "Server error while updating delivery status."
                      );
                    }
                  }}
                >
                  Accept Delivery
                </button>

                <button className="btn btn-danger" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => openModal("profile")}
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Profile Modal */}
      {activeModal === "profile" && verifiedUser && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-3"
              style={{
                background: "antiquewhite",
                borderRadius: "10px",
                border: "2px solid #1976d2",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                maxWidth: "500px",
                margin: "auto",
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              }}
            >
              <div
                className="modal-header"
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  borderTopLeftRadius: "10px",
                  borderTopRightRadius: "10px",
                  padding: "1rem 1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                  fontSize: "1.2rem",
                }}
              >
                <h5 className="modal-title" style={{ margin: 0 }}>
                  Employee Profile
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>

              <div
                className="modal-body text-center"
                style={{ padding: "1.5rem", color: "#333" }}
              >
                <img
                  src={
                    verifiedUser.image
                      ? verifiedUser.image.startsWith("blob:")
                        ? verifiedUser.image
                        : `http://localhost:5000/${verifiedUser.image}`
                      : "/default.png"
                  }
                  alt="Employee"
                  className="rounded-circle mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "3px solid #1976d2",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                  }}
                  onError={(e) => (e.target.src = "/default.png")}
                />
                <div
                  className="text-start"
                  style={{
                    lineHeight: "1.6",
                    fontWeight: "500",
                  }}
                >
                  <p>
                    <strong>Username:</strong>{" "}
                    <span
                      style={{ fontStyle: "oblique", fontFamily: "cursive" }}
                    >
                      {verifiedUser.username}
                    </span>
                  </p>
                  <p>
                    <strong>Name:</strong>{" "}
                    <span
                      style={{ fontStyle: "oblique", fontFamily: "cursive" }}
                    >
                      {verifiedUser.name}
                    </span>
                  </p>
                  <p>
                    <strong>Birthday:</strong>{" "}
                    <span
                      style={{ fontStyle: "oblique", fontFamily: "cursive" }}
                    >
                      {verifiedUser.birthday || "N/A"}
                    </span>
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    <span
                      style={{ fontStyle: "oblique", fontFamily: "cursive" }}
                    >
                      {verifiedUser.address || "N/A"}
                    </span>
                  </p>
                  <p>
                    <strong>Contact:</strong>{" "}
                    <span
                      style={{ fontStyle: "oblique", fontFamily: "cursive" }}
                    >
                      {verifiedUser.contact || "N/A"}
                    </span>
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <span
                      style={{ fontStyle: "oblique", fontFamily: "cursive" }}
                    >
                      {verifiedUser.email || "N/A"}
                    </span>
                  </p>
                  <p>
                    <strong>Position:</strong>{" "}
                    <span
                      style={{ fontStyle: "oblique", fontFamily: "cursive" }}
                    >
                      {verifiedUser.position || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              <div
                className="modal-footer justify-content-center"
                style={{
                  borderTop: "1px solid #ddd",
                  padding: "1rem 1.5rem",
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <button className="btn btn-danger" onClick={closeModal}>
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleEditProfileClick}
                  style={{
                    backgroundColor: "#1976d2",
                    border: "none",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "5px",
                    cursor: "pointer",
                    color: "#fff",
                    fontWeight: "500",
                  }}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Edit Profile Modal */}
      {activeModal === "edit" && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content p-3"
              style={{ background: "antiqueWhite" }}
            >
              <div
                className="modal-header"
                style={{
                  background: "#1976d2",
                  color: "black",
                  textShadow: "1px 1px 1px white",
                }}
              >
                <h5 className="modal-title">Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={
                    editForm.image instanceof File
                      ? URL.createObjectURL(editForm.image)
                      : editForm.image
                      ? `http://localhost:5000/${editForm.image}`
                      : "/default.png"
                  }
                  alt="Employee"
                  className="rounded-circle mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                  onError={(e) => (e.target.src = "/default.png")}
                />
                <input
                  type="file"
                  accept="image/*"
                  className="form-control mb-3"
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      image: e.target.files[0],
                    }))
                  }
                />
                {/* Editable fields */}
                {Object.keys(editForm)
                  .filter(
                    (key) =>
                      ![
                        "image",
                        "oldPassword",
                        "newPassword",
                        "showPasswordFields",
                        "id", // 🚫 not editable
                        "position", // 🚫 not editable
                        "role", // 🚫 not editable
                      ].includes(key)
                  )
                  .map((key) => (
                    <div className="mb-2 text-start" key={key}>
                      <label
                        className="form-label"
                        style={{ fontWeight: "bolder", fontStyle: "oblique" }}
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <input
                        type="text"
                        name={key}
                        value={editForm[key] || ""}
                        onChange={handleEditFormChange}
                        className="form-control"
                      />
                    </div>
                  ))}

                {/* Change Password Section */}
                {!editForm.showPasswordFields ? (
                  <button
                    className="btn btn-warning mt-3"
                    onClick={() =>
                      setEditForm((prev) => ({
                        ...prev,
                        showPasswordFields: true,
                      }))
                    }
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="mt-3">
                    <div className="mb-2 text-start">
                      <label className="form-label">Old Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={editForm.oldPassword || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            oldPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="mb-2 text-start">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={editForm.newPassword || ""}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <button
                      className="btn btn-secondary mt-2"
                      onClick={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          showPasswordFields: false,
                          oldPassword: "",
                          newPassword: "",
                        }))
                      }
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={handleSaveProfile}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMain;
