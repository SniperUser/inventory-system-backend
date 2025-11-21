// CashierMain.js
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { printReceipt } from "../Utility/printReceiptcashier.js";

const CashierMain = ({
  products,
  cartProducts,
  searchTerm,
  setSearchTerm,
  addToCart,
  removeFromCart,
  updateQuantity,
  onTransactionComplete,
  customerInfo,
  setCustomerInfo,
  cashierInfo,
}) => {
  const [showKioskModal, setShowKioskModal] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [fetchedCustomer, setFetchedCustomer] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({
    title: "",
    message: "",
    type: "success", // "success" or "error"
    onConfirm: null,
    showCancel: false,
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [customerMoney, setCustomerMoney] = useState("");
  const [calculatedChange, setCalculatedChange] = useState(0);

  const filteredProducts = products.filter((p) =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showMessage = (title, message, type = "success") => {
    setMessageModalContent({
      title,
      message,
      type,
      onConfirm: null,
      showCancel: false,
    });
    setShowMessageModal(true);
  };

  const showConfirm = (title, message, onConfirm) => {
    setMessageModalContent({
      title,
      message,
      type: "confirm",
      onConfirm,
      showCancel: true,
    });
    setShowMessageModal(true);
  };

  const handleFindCustomer = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/cashiering/verify-customer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: customerId, customer_name: customerName }),
        }
      );

      if (!response.ok) throw new Error("Customer not found");

      const data = await response.json();

      setCustomerInfo({
        customer_name: data.customer_name,
        email: data.email,
        phone: data.phone,
        receiver: data.receiver,
        delivery_place: data.delivery_place,
        address: data.address,
        contact: data.contact,
      });

      setFetchedCustomer(data);
      setShowKioskModal(false);
      setShowCustomerDetails(true);
    } catch (err) {
      showMessage("Error", err.message, "error");
    }
  };

  const getCustomerItems = (items) => {
    try {
      const parsed = typeof items === "string" ? JSON.parse(items) : items;
      if (!Array.isArray(parsed)) return [];

      // normalize field name
      return parsed.map((item) => ({
        ...item,
        qty: item.qty ?? item.quantity ?? 0,
      }));
    } catch (e) {
      return [];
    }
  };

  const formatPayment = (payment) => {
    if (!payment) return "N/A";
    const normalized = payment.toLowerCase().replace(/\s+/g, "");
    if (normalized === "cod") return "COD";
    if (normalized === "paynow") return "Pay Now";
    if (normalized === "payinstore") return "Pay in Store";
    if (!isNaN(Number(payment))) return `₱${Number(payment).toFixed(2)}`;
    return payment;
  };

  const calculateTotalWithShipping = (order) => {
    return Number(order.total || 0) + Number(order.shipping_fee || 0);
  };

  const handleCalculate = () => {
    const totalCost = calculateTotalWithShipping(fetchedCustomer);
    const change = Number(customerMoney) - totalCost;
    setCalculatedChange(change);
    setShowPaymentModal(false);
    setShowSummaryModal(true);
  };

  const handleFinalizePayment = async () => {
    try {
      const normalizedCustomer = {
        ...fetchedCustomer,
        items: getCustomerItems(fetchedCustomer.items), // ensure it's always an array
      };

      const orderData = {
        ...normalizedCustomer,
        payment: customerMoney || "COD", // use entered money if available
        total: normalizedCustomer.total,
        shipping_fee: normalizedCustomer.shipping_fee || 0,
        delivery_status: "done", // ✅ mark as completed
        cashier_name: cashierInfo ? cashierInfo.name : "Admin",
        cashier_id: cashierInfo ? cashierInfo.employee_id : null,
      };

      const response = await fetch(
        "http://localhost:5000/api/cashiering/pickup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }
      );

      if (!response.ok) throw new Error("Failed to save sales_done");

      // 🖨️ Print receipt with paid amount
      printReceipt(orderData);

      showMessage(
        "Success",
        "Payment finalized, saved & receipt printed!",
        "success"
      );

      setShowSummaryModal(false);
      setShowCustomerDetails(false);

      // ✅ Refresh page after short delay so user sees success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      showMessage("Error", err.message, "error");
    }
  };

  const handleAcceptCOD = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/cashiering/accept-cod/${fetchedCustomer.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cashier_name: cashierInfo.name, // logged-in cashier
            cashier_id: cashierInfo.employee_id, // optional if needed
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to move order to delivery");

      showMessage(
        "Success",
        "Order accepted and moved to Delivery table!",
        "success"
      );

      setShowCustomerDetails(false);

      // ✅ Refresh page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      showMessage("Error", err.message, "error");
    }
  };

  const handleDeleteCOD = async () => {
    showConfirm(
      "Confirm Delete",
      "Are you sure you want to delete this order?",
      async () => {
        try {
          await fetch(
            `http://localhost:5000/api/cashiering/sales/${fetchedCustomer.id}`,
            { method: "DELETE" }
          );
          showMessage("Success", "Order deleted successfully!", "success");
          setShowCustomerDetails(false);
        } catch (err) {
          showMessage("Error", err.message, "error");
        }
      }
    );
  };

  return (
    <div className="row">
      {/* LEFT: Products Section */}
      <div className="col-md-7">
        <h4>📦 Products Available</h4>
        <div className="search-kiosk-container mb-3 justify-content-start">
          <div className="input-group search-input">
            <span className="input-group-text search-icon">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn btn-warning btn-sm kiosk-btn"
            onClick={() => setShowKioskModal(true)}
          >
            Kiosk Machine
          </button>
        </div>

        <div
          className="product-list-container table-responsive mb-4"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {/* Products Table */}
          <table className="table table-bordered products-tables fixed-header-table">
            <thead
              className="table-green"
              style={{ position: "sticky", top: 0, zIndex: 1 }}
            >
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Image</th>
                <th>Add</th>
              </tr>
            </thead>
            <tbody className="boggy">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.id}</td>
                    <td>{p.product_name}</td>
                    <td>₱{Number(p.price).toFixed(2)}</td>
                    <td>{p.quantity}</td>
                    <td>
                      {p.image ? (
                        <img
                          src={`http://localhost:5000/uploads/${p.image}`}
                          alt={p.product_name}
                          width="50"
                          height="50"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                    <td>
                      <button
                        className="btns btn-success btn-sm"
                        onClick={() => addToCart(p)}
                      >
                        ➕
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Cart Section */}
      <div className="col-md-5">
        <h4>🛒 Cart</h4>
        {customerInfo.customer_name && (
          <div className="alert alert-info mb-2">
            ✅ Customer: {customerInfo.customer_name} | Phone:{" "}
            {customerInfo.phone} | Email: {customerInfo.email}
          </div>
        )}
        <div
          className="table-responsive mb-4 cart-table-container"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {/* Cart Table */}
          <table className="table cart-table fixed-header-table">
            <thead
              className="table-darky"
              style={{ position: "sticky", top: 0, zIndex: 1 }}
            >
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartProducts.length > 0 ? (
                cartProducts.map((p, i) => (
                  <tr key={i}>
                    <td>{p.product_name}</td>
                    <td>
                      <div className="qty-control d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-secondary me-1"
                          onClick={() =>
                            updateQuantity(p.id, Number(p.quantity) - 1)
                          }
                          disabled={p.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={p.quantity}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 1) updateQuantity(p.id, val);
                          }}
                          className="form-control qty-input"
                        />
                        <button
                          className="btn btn-sm btn-secondary ms-1"
                          onClick={() =>
                            updateQuantity(p.id, Number(p.quantity) + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>₱{Number(p.price).toFixed(2)}</td>
                    <td>
                      ₱{(Number(p.price) * Number(p.quantity)).toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeFromCart(p.id)}
                      >
                        🗑 Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    Cart is empty
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
          className="btns btn-primary w-100"
          onClick={onTransactionComplete}
          disabled={cartProducts.length === 0 || !customerInfo.customer_name}
        >
          ✅ Finish Transaction
        </button>
      </div>

      {/* Kiosk Modal */}
      {showKioskModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header title-header">
                <h5 className="modal-title">Enter Customer Credential</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowKioskModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Enter Id"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowKioskModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleFindCustomer}
                >
                  Find
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerDetails && fetchedCustomer && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Customer & Order Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowCustomerDetails(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Customer Details Table */}
                <table className="table table-bordered customer-details-table">
                  <tbody>
                    <tr>
                      <th>ID</th>
                      <td>{fetchedCustomer.id}</td>
                    </tr>
                    <tr>
                      <th>Name</th>
                      <td>{fetchedCustomer.customer_name}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{fetchedCustomer.email}</td>
                    </tr>
                    <tr>
                      <th>Phone</th>
                      <td>{fetchedCustomer.phone}</td>
                    </tr>
                    <tr>
                      <th>Delivery Type</th>
                      <td>{fetchedCustomer.delivery_type}</td>
                    </tr>
                    <tr>
                      <th>Receiver</th>
                      <td>{fetchedCustomer.receiver}</td>
                    </tr>
                    <tr>
                      <th>Delivery Place</th>
                      <td>{fetchedCustomer.delivery_place}</td>
                    </tr>
                    <tr>
                      <th>Address</th>
                      <td>{fetchedCustomer.address}</td>
                    </tr>
                    <tr>
                      <th>Contact</th>
                      <td>{fetchedCustomer.contact}</td>
                    </tr>
                    <tr>
                      <th>Payment</th>
                      <td>
                        {formatPayment(fetchedCustomer.payment)}
                        {fetchedCustomer.payment &&
                          ["payinstore", "paynow"].includes(
                            fetchedCustomer.payment
                              .toLowerCase()
                              .replace(/\s+/g, "")
                          ) && (
                            <button
                              className="btn btn-success btn-sm ms-2"
                              onClick={() => setShowPaymentModal(true)}
                            >
                              Pay
                            </button>
                          )}
                        {fetchedCustomer.payment &&
                          fetchedCustomer.payment
                            .toLowerCase()
                            .replace(/\s+/g, "") === "cod" && (
                            <>
                              <button
                                className="btn btn-primary btn-sm ms-2"
                                onClick={handleAcceptCOD}
                              >
                                Accept Order
                              </button>
                              <button
                                className="btn btn-danger btn-sm ms-2"
                                onClick={handleDeleteCOD}
                              >
                                Delete
                              </button>
                            </>
                          )}
                      </td>
                    </tr>
                    <tr>
                      <th>Total</th>
                      <td>₱{Number(fetchedCustomer.total || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th>Shipping Fee</th>
                      <td>
                        ₱{Number(fetchedCustomer.shipping_fee || 0).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <th>Delivery Status</th>
                      <td>{fetchedCustomer.delivery_status}</td>
                    </tr>
                    <tr>
                      <th>Created At</th>
                      <td>{fetchedCustomer.created_at}</td>
                    </tr>
                    <tr>
                      <th>Items</th>
                      <td>
                        {getCustomerItems(fetchedCustomer.items).length > 0 ? (
                          <>
                            <ul>
                              {getCustomerItems(fetchedCustomer.items).map(
                                (item, idx) => (
                                  <li key={idx}>
                                    {item.product_name} - Qty: {item.qty} - ₱
                                    {Number(item.price).toFixed(2)} each → ₱
                                    {(item.qty * Number(item.price)).toFixed(2)}
                                  </li>
                                )
                              )}
                            </ul>
                            <hr />
                            <p>
                              <strong>
                                Items Total: ₱
                                {getCustomerItems(fetchedCustomer.items)
                                  .reduce(
                                    (sum, item) =>
                                      sum + item.qty * Number(item.price),
                                    0
                                  )
                                  .toFixed(2)}
                              </strong>
                            </p>
                            <p>
                              <strong>
                                Shipping Fee: ₱
                                {Number(
                                  fetchedCustomer.shipping_fee || 0
                                ).toFixed(2)}
                              </strong>
                            </p>
                            <p>
                              <strong>
                                Grand Total: ₱
                                {(
                                  getCustomerItems(
                                    fetchedCustomer.items
                                  ).reduce(
                                    (sum, item) =>
                                      sum + item.qty * Number(item.price),
                                    0
                                  ) + Number(fetchedCustomer.shipping_fee || 0)
                                ).toFixed(2)}
                              </strong>
                            </p>
                          </>
                        ) : (
                          "No items"
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCustomerDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Customer Money</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter amount given by customer"
                  value={customerMoney}
                  onChange={(e) => setCustomerMoney(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCalculate}>
                  Calculate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummaryModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Payment Summary</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowSummaryModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Total:</strong> ₱
                  {calculateTotalWithShipping(fetchedCustomer).toFixed(2)}
                </p>
                <p>
                  <strong>Customer Money:</strong> ₱
                  {Number(customerMoney).toFixed(2)}
                </p>
                <p>
                  <strong>Change:</strong> ₱{calculatedChange.toFixed(2)}
                </p>
                <h6>Items:</h6>
                <ul>
                  {getCustomerItems(fetchedCustomer.items).map((item, idx) => (
                    <li key={idx}>
                      {item.product_name} - Qty: {item.qty} - ₱
                      {Number(item.price).toFixed(2)} each → ₱
                      {(item.qty * Number(item.price)).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSummaryModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleFinalizePayment}
                >
                  Print & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generic Message/Confirm Modal */}
      {showMessageModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className={`modal-content border-${
                messageModalContent.type === "error" ? "danger" : "success"
              }`}
            >
              <div className="modal-header">
                <h5 className="modal-title">{messageModalContent.title}</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowMessageModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>{messageModalContent.message}</p>
              </div>
              <div className="modal-footer">
                {messageModalContent.showCancel && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowMessageModal(false)}
                  >
                    Cancel
                  </button>
                )}
                {messageModalContent.onConfirm && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      messageModalContent.onConfirm();
                      setShowMessageModal(false);
                    }}
                  >
                    Confirm
                  </button>
                )}
                {!messageModalContent.onConfirm &&
                  !messageModalContent.showCancel && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowMessageModal(false)}
                    >
                      OK
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierMain;
