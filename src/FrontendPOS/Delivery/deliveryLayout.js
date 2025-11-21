// FrontendPOS/Delivery/DeliveryLayout.js
import React from "react";
import DeliveryNavbar from "./deliveryNavbar.js";
import DeliveryMain from "./deliverMain.js";

const DeliveryLayout = () => {
  return (
    <div>
      <DeliveryNavbar title="Staff Delivery Dashboard" />
      <DeliveryMain />
    </div>
  );
};

export default DeliveryLayout;
