import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const useAutoLogout = (timeoutInSeconds = 20) => {
  const navigate = useNavigate();
  const timer = useRef(null);

  // 🔁 Auto logout function
  const logout = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const employeeId = storedUser?.employee_id; // ✅ Use employee_id like in login

    if (employeeId) {
      try {
        // ✅ Mark user as offline in the backend
        await axios.post(
          `http://localhost:5000/api/login/setActive/${employeeId}`,
          { isActive: false }
        );
      } catch (error) {
        console.error(
          "❌ Failed to update active status on auto logout:",
          error
        );
      }
    }

    // ✅ Clear session/local storage
    localStorage.clear();
    sessionStorage.removeItem("appInitialized");

    // ✅ Navigate to login page
    navigate("/loginPage");
  };

  // 🕒 Reset inactivity timer
  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(logout, timeoutInSeconds * 1000); // Convert to ms
  };

  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "scroll", "click"];

    // 🎯 Listen for user activity
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // ✅ Start timer on mount
    resetTimer();

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timer.current) clearTimeout(timer.current);
    };
  }, [timeoutInSeconds]);

  return null; // ✅ hook doesn’t render anything
};

export default useAutoLogout;
