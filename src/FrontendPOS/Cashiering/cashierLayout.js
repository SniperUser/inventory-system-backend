// CashierLayout.js
import React, { useState, useEffect } from "react";
import CashierHeader from "./cashierHeader.js";
import CashierMain from "./cashierMain.js";
import CashierFooter from "./cashierFooter.js";
import "./cashier.css";

const CashierLayout = () => {
  const [products, setProducts] = useState([]);
  const [cartProducts, setCartProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerMoney, setCustomerMoney] = useState("");
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [customerInfo, setCustomerInfo] = useState({
    customer_name: "",
    email: "",
    phone: "",
    receiver: "",
    delivery_place: "",
    address: "",
    contact: "",
  });
  const [receiptData, setReceiptData] = useState(null);
  const [cashierInfo, setCashierInfo] = useState(null);

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

  const fetchProducts = () => {
    fetch("http://localhost:5000/api/cashiering/")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    const existing = cartProducts.find((p) => p.id === product.id);
    if (existing) {
      setCartProducts(
        cartProducts.map((p) =>
          p.id === product.id ? { ...p, quantity: Number(p.quantity) + 1 } : p
        )
      );
    } else {
      setCartProducts([...cartProducts, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCartProducts(cartProducts.filter((p) => p.id !== productId));
  };

  const updateQuantity = (productId, qty) => {
    if (qty < 1) return;
    setCartProducts(
      cartProducts.map((p) =>
        p.id === productId ? { ...p, quantity: Number(qty) } : p
      )
    );
  };

  const cartTotal = cartProducts.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.quantity),
    0
  );

  const totalShippingFee =
    deliveryType === "delivery"
      ? shippingRates[customerInfo.delivery_place] || 0
      : 0;

  const grandTotal = cartTotal + totalShippingFee;

  const handlePayment = async () => {
    const paid = Number(customerMoney);

    // For pickup, require full payment
    if (deliveryType === "pickup" && paid < grandTotal) return;

    // ✅ Determine payment status (works for both pickup & delivery)
    const paymentStatus = paid >= grandTotal ? "paid" : "partial";

    const order = {
      customer_name: customerInfo.customer_name || "Walk-in",
      email: customerInfo.email || "",
      phone: customerInfo.phone || "",
      delivery_type: deliveryType,
      cashier_name: cashierInfo ? cashierInfo.name : "Unknown", // ✅ FIXED
      cashier_id: cashierInfo ? cashierInfo.employee_id : null,
      receiver: customerInfo.receiver || customerInfo.customer_name || "N/A",
      delivery_place: customerInfo.delivery_place || "",
      address: customerInfo.address || "",
      payment: paid,
      items: cartProducts || [],
      total: grandTotal,
      shipping_fee: deliveryType === "delivery" ? totalShippingFee : 0,
      delivery_status: deliveryType === "pickup" ? "done" : "pending",
      payment_status: paymentStatus,
    };

    try {
      // Save order
      const response = await fetch(
        "http://localhost:5000/api/cashiering/delivery",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        }
      );

      if (!response.ok) throw new Error("Failed to save order");

      setReceiptData(order);

      console.log("Payment status saved successfully");
      refreshAll();
    } catch (err) {
      console.error("Error saving payment/order:", err);
      alert("Failed to save payment or order. Please try again.");
    }
  };

  const refreshAll = () => {
    setCartProducts([]);
    setCustomerMoney("");
    setCustomerInfo({
      customer_name: "",
      email: "",
      phone: "",
      receiver: "",
      delivery_place: "",
      address: "",
      contact: "",
    });
    setDeliveryType("pickup");
    setSearchTerm("");
    fetchProducts();
  };

  return (
    <div className="cashier-layout">
      <CashierHeader setCashierInfo={setCashierInfo} />
      <div className="cashier-main">
        <CashierMain
          products={products}
          cartProducts={cartProducts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          onTransactionComplete={refreshAll}
          customerInfo={customerInfo}
          setCustomerInfo={setCustomerInfo}
          cashierInfo={cashierInfo}
        />
      </div>
      <CashierFooter
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        customerInfo={customerInfo}
        setCustomerInfo={setCustomerInfo}
        shippingRates={shippingRates}
        totalShippingFee={totalShippingFee}
        grandTotal={grandTotal}
        customerMoney={customerMoney}
        setCustomerMoney={setCustomerMoney}
        handlePayment={handlePayment}
        receiptData={receiptData}
        setReceiptData={setReceiptData}
        clearAll={refreshAll}
        cartItems={cartProducts}
        cashierInfo={cashierInfo}
      />
    </div>
  );
};

export default CashierLayout;
