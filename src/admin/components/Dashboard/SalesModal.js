import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesModal = ({ show, onClose }) => {
  const [salesData, setSalesData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [productTotals, setProductTotals] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      axios
        .get("http://localhost:5000/api/dashboard/sales-report")
        .then((res) => setSalesData(res.data))
        .catch((err) => console.error("❌ Error fetching sales data:", err));
    }
  }, [show]);

  useEffect(() => {
    if (salesData.length === 0) return;

    const filteredData =
      selectedMonth === "All"
        ? salesData
        : salesData.filter((item) => {
            const date = new Date(item.date);
            const month = date.toLocaleString("default", { month: "short" });
            return month === selectedMonth;
          });

    const monthlyTotals = {};
    const products = {};
    let totalQty = 0;

    filteredData.forEach((item) => {
      const date = new Date(item.date);
      const month = date.toLocaleString("default", { month: "short" });

      if (!monthlyTotals[month]) monthlyTotals[month] = 0;
      monthlyTotals[month] += item.quantity;

      if (!products[item.product_name]) products[item.product_name] = 0;
      products[item.product_name] += item.quantity;

      totalQty += item.quantity;
    });

    setChartData({
      labels: Object.keys(monthlyTotals),
      datasets: [
        {
          label: "Monthly Sales",
          data: Object.values(monthlyTotals),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderRadius: 8,
        },
      ],
    });

    setProductTotals(products);
    setTotalQuantity(totalQty);
  }, [salesData, selectedMonth]);

  if (!show) return null;

  const months = Array.from(
    new Set(
      salesData.map((item) =>
        new Date(item.date).toLocaleString("default", { month: "short" })
      )
    )
  );

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow-lg rounded-4 border-0">
          {/* ✅ Fancy Header */}
          <div
            className="modal-header text-white"
            style={{
              background: "linear-gradient(90deg, #007bff, #00c6ff)",
            }}
          >
            <h5 className="modal-title d-flex align-items-center gap-2">
              <FaChartLine /> Sales Report
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body bg-light">
            {/* ✅ Month Filter */}
            <div className="mb-4">
              <label className="form-label fw-bold me-2">
                Filter by Month:
              </label>
              <select
                className="form-select w-auto d-inline-block shadow-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="All">All Months</option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {chartData ? (
              <>
                {/* ✅ Chart Card */}
                <div className="card shadow-sm mb-4 border-0">
                  <div className="card-body">
                    <h6 className="card-title fw-bold text-secondary mb-3">
                      Monthly Sales Overview
                    </h6>
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "top" },
                          title: { display: false },
                        },
                        scales: {
                          y: { min: 0, max: 1000 },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* ✅ Total Sold Highlight */}
                <div className="alert alert-primary shadow-sm rounded-3 fw-bold">
                  Total Products Sold{" "}
                  {selectedMonth !== "All" && `(${selectedMonth})`}:{" "}
                  <span className="text-dark">{totalQuantity}</span>
                </div>

                {/* ✅ Best Seller Products */}
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h6 className="card-title fw-bold text-secondary mb-3">
                      Best Seller Products{" "}
                      {selectedMonth !== "All" && `(${selectedMonth})`}
                    </h6>
                    {Object.entries(productTotals).length === 0 ? (
                      <p className="text-muted">
                        No sales data available for this month.
                      </p>
                    ) : (
                      Object.entries(productTotals).map(([product, qty]) => (
                        <div key={product} className="mb-3">
                          <div className="d-flex justify-content-between small fw-bold">
                            <span>{product}</span>
                            <span>{qty}</span>
                          </div>
                          <div className="progress" style={{ height: "18px" }}>
                            <div
                              className="progress-bar bg-info fw-bold"
                              role="progressbar"
                              style={{
                                width: `${Math.min((qty / 1000) * 100, 100)}%`,
                              }}
                              aria-valuenow={qty}
                              aria-valuemin="0"
                              aria-valuemax="1000"
                            >
                              {((qty / 1000) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted">Loading sales data...</p>
            )}
          </div>

          {/* ✅ Footer */}
          <div className="modal-footer border-0">
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                onClose();
                navigate("/sales/main"); // 👈 go to sales page
              }}
            >
              🚚 Go to sales Page
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesModal;
