import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilePdf,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ThemeContext } from "../context/themeContext.js";

const DoneDelivery = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { theme, setTheme } = useContext(ThemeContext);

  useEffect(() => {
  const fetchDeliveries = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/deliveries/get-delivered"
      );

      // ✅ Only keep fully paid & delivered
      setDeliveries(
        response.data.filter(
          (d) =>
            d.delivery_status?.toLowerCase() === "delivered" &&
            d.payment_status?.toLowerCase() === "paid"
        )
      );
    } catch (error) {
      console.error("❌ Error fetching delivered deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchDeliveries();
}, []);


  // ✅ apply theme globally
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // ✅ Helper: safe string conversion
  const safeString = (value) =>
    value !== null && value !== undefined ? value.toString() : "";

  // ✅ Highlight matched text
  const highlightMatch = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = safeString(text).split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  // ✅ Filter deliveries
  const filteredDeliveries = deliveries.filter((delivery) => {
    const term = searchTerm.toLowerCase();

    let itemsText = "";
    try {
      const parsedItems = JSON.parse(delivery.items);
      itemsText = parsedItems
        .map(
          (item) =>
            `${item.product_name || ""} ${item.qty || item.quantity || ""} ${
              item.price || ""
            }`
        )
        .join(" ");
    } catch {
      itemsText = "";
    }

    return (
      safeString(delivery.id).toLowerCase().includes(term) ||
      safeString(delivery.customer_name).toLowerCase().includes(term) ||
      safeString(delivery.phone).toLowerCase().includes(term) ||
      safeString(delivery.receiver).toLowerCase().includes(term) ||
      safeString(delivery.delivery_place).toLowerCase().includes(term) ||
      safeString(delivery.address).toLowerCase().includes(term) ||
      safeString(delivery.delivery_type).toLowerCase().includes(term) ||
      safeString(delivery.payment).toLowerCase().includes(term) ||
      safeString(delivery.payment_status).toLowerCase().includes(term) ||
      safeString(delivery.total).toLowerCase().includes(term) ||
      safeString(delivery.shipping_fee).toLowerCase().includes(term) ||
      safeString(delivery.delivery_status).toLowerCase().includes(term) ||
      safeString(delivery.rider_name).toLowerCase().includes(term) ||
      itemsText.toLowerCase().includes(term)
    );
  });

  // ✅ Export Deliveries PDF
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    autoTable(doc, {
      head: [
        [
          "ID",
          "Customer",
          "Phone",
          "Receiver",
          "Delivery Place",
          "Address",
          "Type",
          "Payment",
          "Pay Status",
          "Total",
          "Ship Fee",
          "Status",
          "Created",
          "Rider",
        ],
      ],
      body: filteredDeliveries.map((d) => [
        d.id,
        d.customer_name,
        d.phone,
        d.receiver,
        d.delivery_place,
        d.address,
        d.delivery_type,
        d.payment,
        d.payment_status,
        "₱" + d.total,
        "₱" + d.shipping_fee,
        d.delivery_status,
        new Date(d.created_at).toLocaleString(),
        d.rider_name,
      ]),
    });
    doc.save("done_delivery_records.pdf");
  };

  if (loading)
    return <p className="text-center mt-5">Loading completed deliveries...</p>;

  return (
    <div
      className="container-fluid p-3 min-vh-100"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        fontSize: "12px", // 🔽 compact font size
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="m-0">✅ Completed Deliveries</h6>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <FontAwesomeIcon icon={faSun} />
            ) : (
              <FontAwesomeIcon icon={faMoon} />
            )}
          </button>
          <button
            className="btn btn-sm btn-outline-dark"
            onClick={handleExportPDF}
          >
            <FontAwesomeIcon icon={faFilePdf} className="me-1" />
            PDF
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="row g-2 mb-2">
        <div className="col-md-3">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-sm table-bordered align-middle text-center">
          <thead className="table-light" style={{ fontSize: "11px" }}>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Receiver</th>
              <th>Delivery Place</th>
              <th>Address</th>
              <th>Type</th>
              <th>Payment</th>
              <th>Pay Status</th>
              <th>Total</th>
              <th>Ship Fee</th>
              <th>Items</th>
              <th>Status</th>
              <th>Created</th>
              <th>Rider</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "11px" }}>
            {filteredDeliveries.length === 0 ? (
              <tr>
                <td colSpan="15" className="text-muted text-center">
                  No completed deliveries found.
                </td>
              </tr>
            ) : (
              filteredDeliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{highlightMatch(delivery.id)}</td>
                  <td>{highlightMatch(delivery.customer_name)}</td>
                  <td>{highlightMatch(delivery.phone)}</td>
                  <td>{highlightMatch(delivery.receiver)}</td>
                  <td>{highlightMatch(delivery.delivery_place)}</td>
                  <td>{highlightMatch(delivery.address)}</td>
                  <td>{highlightMatch(delivery.delivery_type)}</td>
                  <td>{highlightMatch(delivery.payment)}</td>
                  <td>{highlightMatch(delivery.payment_status)}</td>
                  <td>₱{highlightMatch(delivery.total)}</td>
                  <td>₱{highlightMatch(delivery.shipping_fee)}</td>
                  <td>
                    <table className="table table-borderless table-sm mb-0">
                      <thead>
                        <tr className="table-light">
                          <th style={{ fontSize: "10px" }}>Product</th>
                          <th style={{ fontSize: "10px" }}>Qty</th>
                          <th style={{ fontSize: "10px" }}>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let parsedItems = [];
                          try {
                            parsedItems = JSON.parse(delivery.items);
                          } catch (err) {
                            console.error("❌ Error parsing items JSON:", err);
                          }
                          return parsedItems.map((item, index) => (
                            <tr key={index}>
                              <td>{highlightMatch(item.product_name)}</td>
                              <td>
                                {highlightMatch(
                                  item.qty || item.quantity || "-"
                                )}
                              </td>
                              <td>₱{highlightMatch(item.price)}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </td>
                  <td>{highlightMatch(delivery.delivery_status)}</td>
                  <td>
                    {highlightMatch(
                      new Date(delivery.created_at).toLocaleString()
                    )}
                  </td>
                  <td>{highlightMatch(delivery.rider_name)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoneDelivery;
