import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { printReceipt } from "../Utility/printReceipt.js";

const CashierFooter = ({
  deliveryType,
  setDeliveryType,
  customerInfo,
  setCustomerInfo,
  shippingRates,
  totalShippingFee,
  grandTotal,
  customerMoney,
  setCustomerMoney,
  handlePayment,
  receiptData,
  setReceiptData,
  clearAll,
  cartItems,
  cashierInfo,
}) => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const handleDeliveryTypeChange = (e) => {
    const value = e.target.value;
    setDeliveryType(value);
    if (value === "delivery") {
      setShowDeliveryModal(true);
    }
  };

  const handleDeliveryClose = () => setShowDeliveryModal(false);

  const handleConfirmPayment = () => {
    const money = parseFloat(customerMoney || "0");

    if (isNaN(money) || money <= 0) {
      setShowValidationModal(true);
      return;
    }

    if (deliveryType === "pickup" && money < grandTotal) {
      setShowValidationModal(true);
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePrintReceipt = () => {
    const orderData = {
      customer_name: customerInfo.customer_name || "Walk-in",
      email: customerInfo.email || "",
      phone: customerInfo.phone || "",
      delivery_type: deliveryType,
      cashier: cashierInfo?.name || "Unknown",
      cashier_id: cashierInfo?.employee_id || null,
      receiver: customerInfo.receiver || customerInfo.customer_name || "N/A",
      delivery_place: customerInfo.delivery_place || "",
      address: customerInfo.address || "",
      contact: customerInfo.phone || "",
      payment: customerMoney,
      items: cartItems || [],
      total: grandTotal,
      shipping_fee: deliveryType === "delivery" ? totalShippingFee : 0,
      delivery_status: deliveryType === "delivery" ? "pending" : "done",
    };

    // 🖨 Print receipt
    printReceipt(orderData);

    // ✅ Reset cashier state
    handlePayment();
    clearAll();
    setShowPaymentModal(false);

    setReceiptData(orderData);

    // ✅ Refresh page after short delay (so receipt prints first)
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const change =
    customerMoney && !isNaN(parseFloat(customerMoney))
      ? Math.max(parseFloat(customerMoney) - grandTotal, 0).toFixed(2)
      : "0.00";

  return (
    <div className="cashier-footer">
      {/* Totals */}
      <div>
        <b>Total: ₱{grandTotal.toFixed(2)}</b>
        {deliveryType === "delivery" && (
          <span className="ms-2">
            + Shipping ₱{totalShippingFee.toFixed(2)}
          </span>
        )}
      </div>

      {/* Delivery Type */}
      <select
        className="form-select form-select-sm delivery-select"
        value={deliveryType}
        onChange={handleDeliveryTypeChange}
      >
        <option value="pickup">Pickup</option>
        <option value="delivery">Delivery</option>
      </select>

      {/* Customer Money */}
      <div className="d-flex align-items-center">
        <input
          type="number"
          step="0.01"
          min="0"
          className="form-control form-control-sm customer-money-input"
          placeholder="Customer Money"
          value={customerMoney}
          onChange={(e) => setCustomerMoney(e.target.value)}
        />
        {customerMoney !== "" && (
          <span className="ms-2">Change: ₱{change}</span>
        )}
      </div>

      {/* Confirm Button */}
      <Button size="sm" variant="primary" onClick={handleConfirmPayment}>
        Confirm
      </Button>

      {/* 🚚 Delivery Details Modal */}
      <Modal show={showDeliveryModal} onHide={handleDeliveryClose}>
        <Modal.Header closeButton>
          <Modal.Title>Customer Delivery Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Customer Name"
            value={customerInfo.customer_name}
            onChange={(e) =>
              setCustomerInfo({
                ...customerInfo,
                customer_name: e.target.value,
              })
            }
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Email"
            value={customerInfo.email}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, email: e.target.value })
            }
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Phone"
            value={customerInfo.phone}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, phone: e.target.value })
            }
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Receiver Name"
            value={customerInfo.receiver}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, receiver: e.target.value })
            }
          />
          <select
            className="form-select mb-2"
            value={customerInfo.delivery_place}
            onChange={(e) => {
              const place = e.target.value;
              setCustomerInfo({ ...customerInfo, delivery_place: place });
            }}
          >
            <option value="">Select Delivery Place</option>
            {Object.keys(shippingRates).map((place) => (
              <option key={place} value={place}>
                {place} (₱{shippingRates[place]})
              </option>
            ))}
          </select>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Address"
            value={customerInfo.address}
            onChange={(e) =>
              setCustomerInfo({ ...customerInfo, address: e.target.value })
            }
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeliveryClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleDeliveryClose}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 💰 Payment Summary Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h5 className="mb-1">
              <b>Total:</b> ₱
              {receiptData
                ? receiptData.total.toFixed(2)
                : grandTotal.toFixed(2)}
            </h5>
            <h5 className="mb-1">
              <b>Customer Money:</b> ₱
              {receiptData
                ? Number(receiptData.payment).toFixed(2)
                : customerMoney !== ""
                ? Number(customerMoney).toFixed(2)
                : "0.00"}
            </h5>
            <h5 className="mb-1 text-success">
              <b>Change:</b> ₱
              {receiptData
                ? (Number(receiptData.payment) - receiptData.total).toFixed(2)
                : change}
            </h5>
          </div>

          {deliveryType === "delivery" && (
            <>
              <hr />
              <p>
                <b>Delivery To:</b> {customerInfo.customer_name || "-"} (
                {customerInfo.phone || "-"})
              </p>
              <p>
                <b>Address:</b> {customerInfo.address || "-"}
              </p>
              <p>
                <b>Delivery Place:</b> {customerInfo.delivery_place || "-"}
              </p>
              <p>
                <b>Shipping Fee:</b> ₱
                {totalShippingFee ? totalShippingFee.toFixed(2) : "0.00"}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handlePrintReceipt}>
            🖨 Print Receipt
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ⚠ Validation Modal */}
      <Modal
        show={showValidationModal}
        onHide={() => setShowValidationModal(false)}
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Payment Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please enter a valid amount for customer money to proceed.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowValidationModal(false)}>
            Okay
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CashierFooter;
