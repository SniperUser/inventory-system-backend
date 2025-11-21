import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../pages/cart.js";

import "./pages.css";

const Checkout = () => {
  const { cart, removeFromCart, clearCart, totalItems, totalPrice } = useCart();

  const [activeStep, setActiveStep] = useState("payment-address");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    telephone: "",
    address1: "",
    city: "",
    country: "",
    deliveryType: "",
    pickupOption: "",
    receiverName: "",
    address: "",
    contactNumber: "",
    payment: "",
    deliveryPlace: "",
  });

  const shippingRates = {
    Kalabugao: 50,
    Hagpa: 70,
    Kabagtukan: 90,
    Pulahon: 100,
    "San Vicente": 60,
    Fatima: 70,
    Landing: 60,
    Lamingan: 70,
    Kiudto: 90,
    Kaanibungan: 100,
    Mahagwa: 110,
    Bulonay: 200,
    Nasandigan: 90,
    Minlanaw: 90,
    Kalampigan: 200,
    Mintapud: 200,
  };

  const toggleStep = (step) => {
    setActiveStep(step === activeStep ? "" : step);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      if (name === "pickupOption" && value === "now") {
        updated.payment = "payNow";
      }

      if (name === "deliveryPlace") {
        setShippingFee(shippingRates[value] || 0);
      }

      return updated;
    });
  };

  useEffect(() => {
    if (formData.deliveryType !== "pickup") {
      setFormData((prev) => ({
        ...prev,
        pickupOption: "",
        payment: "",
      }));
    }

    if (formData.deliveryType !== "delivery") {
      setShippingFee(0);
    }
  }, [formData.deliveryType]);

  // inside saveOrderToDB
  const saveOrderToDB = async () => {
    const orderData = {
      customer: formData,
      items: cart,
      total: totalPrice,
      shippingFee,
      createdAt: new Date(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/checkout/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save order");
      }

      // ✅ get correct orderId from backend
      const newOrderId = result.orderId;
      setOrderId(newOrderId);

      // ✅ pass real orderId to receipt
      printReceipt(newOrderId);

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Order save error:", error);
      alert("❌ Failed to save order. Please try again.");
    }
  };

  const printReceipt = (id) => {
    const receiptWindow = window.open("", "PRINT", "height=600,width=800");

    const orderItems =
      cart.length > 0
        ? cart
            .map(
              (item) => `
      <tr>
        <td>${item.product_name || ""}</td>
        <td>${item.qty || 0}</td>
        <td>₱${Number(item.price || 0).toFixed(2)}</td>
        <td>₱${(Number(item.qty || 0) * Number(item.price || 0)).toFixed(
          2
        )}</td>
      </tr>
    `
            )
            .join("")
        : `<tr><td colspan="4" style="text-align:center;">No items</td></tr>`;

    const grandTotal =
      totalPrice + (formData.deliveryType === "delivery" ? shippingFee : 0);

    receiptWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2, h3 { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          table, th, td { border: 1px solid #333; }
          th, td { padding: 8px; text-align: left; }
          .total { font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>🛍️ Sample Store Name</h2>
        <p>📍 Sample Location</p>
        <p>📅 ${new Date().toLocaleString()}</p>

        <h3>Customer Details</h3>
        <p><b>Order ID:</b> ${id || "Unknown"}</p>
        <p><b>Name:</b> ${formData.firstname || ""} ${
      formData.lastname || ""
    }</p>
        <p><b>Phone:</b> ${formData.telephone || ""}</p>
        ${
          formData.deliveryType === "delivery"
            ? `
              <p><b>Receiver:</b> ${formData.receiverName || ""}</p>
              <p><b>Delivery Place:</b> ${formData.deliveryPlace || ""}</p>
              <p><b>Address:</b> ${formData.address || ""}</p>
              <p><b>Contact:</b> ${formData.contactNumber || ""}</p>
            `
            : `<p><b>Pickup Option:</b> ${formData.pickupOption || "N/A"}</p>`
        }
        <p><b>Payment:</b> ${
          formData.payment === "payNow"
            ? "Pay Now in Store"
            : "Cash on Delivery"
        }</p>

        <h3>Order Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems}
            ${
              formData.deliveryType === "delivery"
                ? `
                <tr>
                  <td colspan="3">Shipping Fee</td>
                  <td>₱${Number(shippingFee || 0).toFixed(2)}</td>
                </tr>
              `
                : ""
            }
            <tr class="total">
              <td colspan="3">Grand Total</td>
              <td>₱${grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin-top:20px;">Thank you for shopping with us! 🎉</p>
      </body>
    </html>
  `);

    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
    receiptWindow.close();
  };

  return (
    <div
      className="panel-group checkout-page accordion scrollable"
      id="checkout-page"
    >
      <h1>Check Out Details</h1>
      {/* STEP 1: Account & Billing Details */}
      <div className="panel panel-default" id="payment-address">
        <div className="panel-heading">
          <h2 className="panel-title">
            <button
              type="button"
              className="accordion-toggle btn btn-link"
              onClick={() => toggleStep("payment-address")}
            >
              Step 1: Account & Billing Details
            </button>
          </h2>
        </div>
        {activeStep === "payment-address" && (
          <div className="panel-collapse in">
            <div className="panel-body">
              <input
                type="text"
                name="firstname"
                placeholder="First Name"
                className="form-control mb-2"
                value={formData.firstname}
                onChange={handleChange}
              />
              <input
                type="text"
                name="lastname"
                placeholder="Last Name"
                className="form-control mb-2"
                value={formData.lastname}
                onChange={handleChange}
              />
              <input
                type="text"
                name="telephone"
                placeholder="Contact Number"
                className="form-control mb-2"
                value={formData.telephone}
                onChange={handleChange}
              />
              <input
                type="text"
                name="address1"
                placeholder="Address"
                className="form-control mb-2"
                value={formData.address1}
                onChange={handleChange}
              />

              <button
                className="btn btn-primary pull-right"
                type="button"
                onClick={() => setActiveStep("shipping-address")}
                disabled={
                  !formData.firstname ||
                  !formData.lastname ||
                  !formData.telephone ||
                  !formData.address1
                }
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Delivery Details */}
      <div className="panel panel-default" id="shipping-address">
        <div className="panel-heading">
          <h2 className="panel-title">
            <button
              type="button"
              className="accordion-toggle btn btn-link"
              onClick={() => toggleStep("shipping-address")}
            >
              Step 2: Delivery Details
            </button>
          </h2>
        </div>

        {activeStep === "shipping-address" && (
          <div className="panel-collapse in">
            <div className="panel-body row">
              <div className="col-md-12">
                <p>Select Delivery Type:</p>

                {/* Pickup / Delivery Selector */}
                <label>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={formData.deliveryType === "pickup"}
                    onChange={handleChange}
                  />{" "}
                  Pickup
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="delivery"
                    checked={formData.deliveryType === "delivery"}
                    onChange={handleChange}
                  />{" "}
                  Delivery
                </label>

                {/* Pickup Options */}
                {formData.deliveryType === "pickup" && (
                  <div style={{ marginTop: "15px" }}>
                    <p>Pickup Options:</p>
                    <label>
                      <input
                        type="radio"
                        name="pickupOption"
                        value="now"
                        checked={formData.pickupOption === "now"}
                        onChange={handleChange}
                      />{" "}
                      Pickup Now
                    </label>
                    <br />
                    <label>
                      <input
                        type="radio"
                        name="pickupOption"
                        value="later"
                        checked={formData.pickupOption === "later"}
                        onChange={handleChange}
                      />{" "}
                      Pickup Later
                    </label>

                    {formData.pickupOption === "now" && (
                      <p className="text-success">
                        ✅ Please wait while we prepare your order.
                      </p>
                    )}
                    {formData.pickupOption === "later" && (
                      <p className="text-info">
                        ✅ Please show the receipt of your order to confirm
                        details.
                      </p>
                    )}
                  </div>
                )}

                {/* Delivery Details */}
                {formData.deliveryType === "delivery" && (
                  <div style={{ marginTop: "15px" }}>
                    <p>Delivery Information:</p>

                    {/* Receiver Name */}
                    <input
                      type="text"
                      name="receiverName"
                      placeholder="Receiver's Name"
                      className="form-control mb-2"
                      value={formData.receiverName}
                      onChange={handleChange}
                    />

                    {/* Delivery Place Dropdown */}
                    <label className="mb-1 fw-bold">
                      Select Delivery Place
                    </label>
                    <select
                      name="deliveryPlace"
                      className="form-control mb-2"
                      value={formData.deliveryPlace || ""}
                      onChange={handleChange}
                    >
                      <option value="">-- Select Place --</option>
                      <option value="Kalabugao">Kalabugao</option>
                      <option value="Hagpa">Hagpa</option>
                      <option value="Kabagtukan">Kabagtukan</option>
                      <option value="Pulahon">Pulahon</option>
                      <option value="San Vicente">San Vicente</option>
                      <option value="Fatima">Fatima</option>
                      <option value="Landing">Landing</option>
                      <option value="Lamingan">Lamingan</option>
                      <option value="Kiudto">Kiudto</option>
                      <option value="Kaanibungan">Kaanibungan</option>
                      <option value="Mahagwa">Mahagwa</option>
                      <option value="Bulonay">Bulonay</option>
                      <option value="Nasandigan">Nasandigan</option>
                      <option value="Minlanaw">Minlanaw</option>
                      <option value="Kalampigan">Kalampigan</option>
                      <option value="Mintapud">Kalampigan</option>
                    </select>

                    {/* Detailed Address */}
                    <input
                      type="text"
                      name="address"
                      placeholder="House No. / Street / Landmark"
                      className="form-control mb-2"
                      value={formData.address}
                      onChange={handleChange}
                    />

                    {/* Contact Number */}
                    <input
                      type="text"
                      name="contactNumber"
                      placeholder="Contact Number"
                      className="form-control mb-2"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* Continue Button */}
                <button
                  className="btn btn-primary pull-right"
                  type="button"
                  onClick={() => setActiveStep("shipping-method")}
                  disabled={
                    !formData.deliveryType ||
                    (formData.deliveryType === "pickup" &&
                      !formData.pickupOption) ||
                    (formData.deliveryType === "delivery" &&
                      (!formData.receiverName ||
                        !formData.deliveryPlace || // ✅ required dropdown
                        !formData.address ||
                        !formData.contactNumber))
                  }
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: Payment Method */}
      <div className="panel panel-default" id="shipping-method">
        <div className="panel-heading">
          <h2 className="panel-title">
            <button
              type="button"
              className="accordion-toggle btn btn-link"
              onClick={() => toggleStep("shipping-method")}
            >
              Step 3: Payment Method
            </button>
          </h2>
        </div>
        {activeStep === "shipping-method" && (
          <div className="panel-collapse in">
            <div className="panel-body">
              {formData.pickupOption === "now" ? (
                <p className="text-success">
                  ✅ Payment method is set to <b>Pay Now in Store</b>.
                </p>
              ) : (
                <>
                  <label>
                    <input
                      type="radio"
                      name="payment"
                      value="payNow"
                      checked={formData.payment === "payNow"}
                      onChange={handleChange}
                    />{" "}
                    Pay Now in Store
                  </label>
                  <br />
                  {formData.deliveryType === "delivery" && (
                    <label>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={formData.payment === "cod"}
                        onChange={handleChange}
                      />{" "}
                      Cash on Delivery
                    </label>
                  )}
                </>
              )}

              <button
                className="btn btn-primary pull-right"
                type="button"
                onClick={() => setActiveStep("confirm")}
                disabled={!formData.payment}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 4: Confirm Order */}
      <div className="panel panel-default" id="confirm">
        <div className="panel-heading">
          <h2 className="panel-title">
            <button
              type="button"
              className="accordion-toggle btn btn-link"
              onClick={() => toggleStep("confirm")}
            >
              Step 4: Confirm Order
            </button>
          </h2>
        </div>

        {activeStep === "confirm" && (
          <div className="panel-collapse in">
            <div className="panel-body">
              <h4>🛒 Please Review Your Order</h4>

              {/* Items Purchased */}
              {cart.length > 0 ? (
                <div className="order-summary">
                  <div className="summary-header">
                    <div>Image</div>
                    <div>Product</div>
                    <div>Qty</div>
                    <div>Unit Price</div>
                    <div>Total</div>
                  </div>

                  {cart.map((item) => (
                    <div className="summary-row" key={item.id}>
                      <div>
                        <img
                          src={item.image || "https://via.placeholder.com/50"}
                          alt={item.product_name}
                          className="summary-img"
                        />
                      </div>
                      <div>
                        <b>ID:</b> {item.id} <br />
                        {item.product_name}
                      </div>
                      <div>{item.qty}</div>
                      <div>₱{Number(item.price).toFixed(2)}</div>
                      <div>₱{(item.qty * Number(item.price)).toFixed(2)}</div>
                    </div>
                  ))}

                  {formData.deliveryType === "delivery" && (
                    <div className="summary-row">
                      <div style={{ gridColumn: "1 / 5", textAlign: "right" }}>
                        Shipping Fee
                      </div>
                      <div>₱{shippingFee.toFixed(2)}</div>
                    </div>
                  )}

                  <div className="summary-row total-row">
                    <div style={{ gridColumn: "1 / 5", textAlign: "right" }}>
                      Total
                    </div>
                    <div>₱{(totalPrice + shippingFee).toFixed(2)}</div>
                  </div>
                </div>
              ) : (
                <p>No items in cart.</p>
              )}

              {/* Customer Details */}
              <div className="customer-details-card mt-3">
                <h4>👤 Customer Details</h4>
                <div className="customer-info">
                  <p>
                    <span className="label">Name:</span> {formData.firstname}{" "}
                    {formData.lastname}
                  </p>
                  <p>
                    <span className="label">Phone:</span> {formData.telephone}
                  </p>
                  {formData.deliveryType === "pickup" ? (
                    <p>
                      <span className="label">Pickup Option:</span>{" "}
                      {formData.pickupOption}
                    </p>
                  ) : (
                    <>
                      <p>
                        <span className="label">Receiver:</span>{" "}
                        {formData.receiverName}
                      </p>
                      <p>
                        <span className="label">Delivery Place:</span>{" "}
                        {formData.deliveryPlace}
                      </p>
                      <p>
                        <span className="label">Address:</span>{" "}
                        {formData.address}
                      </p>
                      <p>
                        <span className="label">Contact:</span>{" "}
                        {formData.contactNumber}
                      </p>
                      <p>
                        <span className="label">Shipping Fee:</span> ₱
                        {shippingFee.toFixed(2)}
                      </p>
                    </>
                  )}
                  <p>
                    <span className="label">Payment:</span>{" "}
                    {formData.payment === "payNow"
                      ? "Pay Now in Store"
                      : "Cash on Delivery"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 text-right">
                <button
                  className="btn btn-default margin-right-20"
                  onClick={() => setActiveStep("payment-address")}
                >
                  ❌ Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => setShowConfirmModal(true)} // 👈 open modal on click
                >
                  ✅ Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Confirmation & Final Modal Combined */}
      {showConfirmModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">🛒 Please Review Your Order</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <h4>Items Purchased</h4>
                {cart.length > 0 ? (
                  <div className="order-summary">
                    <div className="summary-header">
                      <div>Image</div>
                      <div>Product</div>
                      <div>Qty</div>
                      <div>Unit Price</div>
                      <div>Total</div>
                    </div>

                    {cart.map((item) => (
                      <div className="summary-row" key={item.id}>
                        <div>
                          <img
                            src={item.image || "https://via.placeholder.com/50"}
                            alt={item.product_name}
                            className="summary-img"
                          />
                        </div>
                        <div>
                          <b>ID:</b> {item.id} <br />
                          {item.product_name}
                        </div>
                        <div>{item.qty}</div>
                        <div>₱{Number(item.price).toFixed(2)}</div>
                        <div>₱{(item.qty * Number(item.price)).toFixed(2)}</div>
                      </div>
                    ))}

                    {formData.deliveryType === "delivery" && (
                      <div className="summary-row">
                        <div
                          style={{ gridColumn: "1 / 5", textAlign: "right" }}
                        >
                          Shipping Fee
                        </div>
                        <div>₱{shippingFee.toFixed(2)}</div>
                      </div>
                    )}

                    <div className="summary-row total-row">
                      <div style={{ gridColumn: "1 / 5", textAlign: "right" }}>
                        Total
                      </div>
                      <div>₱{(totalPrice + shippingFee).toFixed(2)}</div>
                    </div>
                  </div>
                ) : (
                  <p>No items in cart.</p>
                )}

                <div className="customer-details-card mt-3">
                  <h4>👤 Customer Details</h4>
                  <div className="customer-info">
                    <p>
                      <span className="label">Name:</span> {formData.firstname}{" "}
                      {formData.lastname}
                    </p>
                    <p>
                      <span className="label">Phone:</span> {formData.telephone}
                    </p>
                    {formData.deliveryType === "pickup" ? (
                      <p>
                        <span className="label">Pickup Option:</span>{" "}
                        {formData.pickupOption}
                      </p>
                    ) : (
                      <>
                        <p>
                          <span className="label">Receiver:</span>{" "}
                          {formData.receiverName}
                        </p>
                        <p>
                          <span className="label">Delivery Place:</span>{" "}
                          {formData.deliveryPlace}
                        </p>
                        <p>
                          <span className="label">Address:</span>{" "}
                          {formData.address}
                        </p>
                        <p>
                          <span className="label">Contact:</span>{" "}
                          {formData.contactNumber}
                        </p>
                        <p>
                          <span className="label">Shipping Fee:</span> ₱
                          {shippingFee.toFixed(2)}
                        </p>
                      </>
                    )}
                    <p>
                      <span className="label">Payment:</span>{" "}
                      {formData.payment === "payNow"
                        ? "Pay Now in Store"
                        : "Cash on Delivery"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={() => setShowConfirmModal(false)}
                >
                  ❌ No, Go Back
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => {
                    saveOrderToDB();
                    setShowConfirmModal(false);
                  }}
                >
                  ✅ OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Success Modal */}
      {showSuccessModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">🎉 Order Successful</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSuccessModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <p>
                  ✅ Item successfully purchased.
                  <br />
                  Thank you, {formData.firstname}. We’ll process your order
                  shortly.
                  <br />
                  Please be patient while we process your order.
                </p>
              </div>

              {/* ✅ Footer with OK that prints and clears after */}
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => {
                    clearCart();
                    setFormData({
                      firstname: "",
                      lastname: "",
                      email: "",
                      telephone: "",
                      address1: "",
                      city: "",
                      country: "",
                      deliveryType: "",
                      pickupOption: "",
                      receiverName: "",
                      address: "",
                      contactNumber: "",
                      payment: "",
                      deliveryPlace: "",
                    });
                    setShippingFee(0);
                    setShowSuccessModal(false); // ✅ close modal
                    setOrderPlaced(false);
                    navigate("/pos"); // optional: return to POS
                  }}
                >
                  ✅ OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
