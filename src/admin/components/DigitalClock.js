import React, { useEffect, useState } from "react";
import "./DigitalClock.css";

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(time.getHours() % 12 || 12).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  const ampm = time.getHours() >= 12 ? "PM" : "AM";
  const day = time
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const date = time.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="digital-clock-container">
      <div className="clock-row">
        <div className="circle">
          <span className="time">{hours}</span>
          <span className="labels">HOURS</span>
        </div>
        <div className="circle">
          <span className="time">{minutes}</span>
          <span className="labels">MINUTES</span>
        </div>
        <div className="circle">
          <span className="time">{seconds}</span>
          <span className="labels">SECONDS</span>
        </div>
      </div>

      <div className="extra-info">
        <span className="ampm">{ampm}</span>
        <span className="day">{day}</span>
        <span className="date">{date}</span>
      </div>
    </div>
  );
};

export default DigitalClock;
