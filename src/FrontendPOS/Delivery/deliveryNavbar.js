import React from "react";
import { FaUserCircle } from "react-icons/fa";
import DigitalClock from "../../admin/components/DigitalClock.js";
import "./delivery.css";

const DeliveryNavbar = ({ title }) => {
  return (
    <nav className="d-flex justify-content-between align-items-center p-3 bg-primary text-white">
      <h4 className="title-with-truck">
        Staff Delivery
        <span className="truck-animation">
          <span className="dust dust1"></span>
          <span className="dust dust2"></span>
          <span className="dust dust3"></span>
          <span className="dust dust4"></span>
          <span className="dust dust5"></span>
          🚚
        </span>
      </h4>

      <DigitalClock />
    </nav>
  );
};

export default DeliveryNavbar;
