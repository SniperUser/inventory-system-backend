import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

// hook to track browser online/offline status
const useOnline = () => {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  return online;
};

const StatusModal = ({ show, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const online = useOnline();

  useEffect(() => {
    let timer;
    if (show) {
      setShouldRender(true);
      // ensure transition picks up
      requestAnimationFrame(() => setVisible(true));
      timer = setTimeout(() => {
        setVisible(false);
      }, 2800);
    }
    return () => clearTimeout(timer);
  }, [show]);

  const handleAnimationEnd = () => {
    if (!visible) {
      setShouldRender(false);
      onClose?.();
    }
  };

  if (!shouldRender) return null;

  const statusText = online ? "🟢 You are Online" : "🔴 You are Offline";

  return (
    <Modal
      show
      backdrop={false}
      keyboard={false}
      onAnimationEnd={handleAnimationEnd}
      dialogClassName="position-fixed top-0 end-0 mt-3 me-3"
      contentClassName={`small-status-modal ${visible ? "fade-in" : "fade-out"}`}
      style={{ pointerEvents: "none", zIndex: 1055 }}
    >
      <Modal.Body className="text-center p-2 fw-bold" style={{ margin: 0 }}>
        {statusText}
      </Modal.Body>
    </Modal>
  );
};

export default StatusModal;
