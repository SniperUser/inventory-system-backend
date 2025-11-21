import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/home", { replace: true });
    }

    const isInitialized = sessionStorage.getItem("appInitialized");
    if (!isInitialized) {
      localStorage.clear(); // clear all on cold start
      sessionStorage.setItem("appInitialized", "true");
    }
  }, [navigate]);

  // 🔁 Re-fetch every 10 seconds to update online status automatically
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Only do this if user is logged in
      const token = localStorage.getItem("token");
      if (token) {
        // 👉 Replace with actual fetching logic (or use context/global method)
        console.log("Refreshing employee status..."); // placeholder
        // getAllEmployees(); // uncomment this if you have the function
      }
    }, 10000); // every 10 seconds

    return () => clearInterval(intervalId); // cleanup
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/login/login/user",
        {
          username,
          password,
        }
      );

      if (res.data?.message === "Login successful") {
        const { user, token } = res.data;

        // persist user and token
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("loginTime", new Date().toISOString());

        // token expiry (2 hours)
        const expiryTime = Date.now() + 2 * 60 * 60 * 1000;
        localStorage.setItem("tokenExpiry", expiryTime.toString());
        sessionStorage.setItem("appInitialized", "true");

        // ✅ mark active on backend (don’t remove this)
        try {
          await axios.post(
            `http://localhost:5000/api/login/setActive/${user.employee_id}`,
            { isActive: true },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch (activeErr) {
          console.error("Error setting user active:", activeErr);
        }

        // ✅ Role-baredirectsed
        const role = user.role;
        const position = user.position;

        if (role === "Admin") {
          navigate("/home", { replace: true, state: { currentUser: user } });
        } else if (role === "User") {
          if (position === "Cashier") {
            navigate("/cashier", {
              replace: true,
              state: { currentUser: user },
            }); // 👈 Cashier page
          } else {
            navigate("/pos", { replace: true, state: { currentUser: user } });
          }
        } else {
          navigate("/logged-in-users", {
            replace: true,
            state: { currentUser: user },
          });
        }
      } else {
        setError(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("User not registered");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-dark"
      style={{ minHeight: "100vh", fontFamily: "monospace" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-10 col-md-10">
            <div
              className="card o-hidden border-0 my-5"
              style={{
                boxShadow: "0 4px 12px rgba(255, 255, 255, 0.15)",
                backgroundColor: "rgba(19, 18, 18, 0.85)",
              }}
            >
              <div className="card-body p-0 rounded">
                <div className="row" style={{ minHeight: "500px" }}>
                  {/* LEFT SIDE */}
                  <div
                    className="col-lg-6 d-none d-lg-block border-end border-light"
                    style={{
                      backgroundImage: `url(${process.env.PUBLIC_URL}/sample.jpg)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  ></div>

                  {/* RIGHT SIDE */}
                  <div className="col-lg-6 d-flex align-items-center p-4 bg-opacity-25">
                    <div className="w-100">
                      <div className="text-center mb-4">
                        <h1 className="h2 text-white">𝓦𝓮𝓵𝓬𝓸𝓶𝓮 𝓑𝓪𝓬𝓴</h1>
                      </div>

                      <form className="user" onSubmit={handleLogin}>
                        <div className="form-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="𝑬𝒏𝒕𝒆𝒓 𝒖𝒔𝒆𝒓𝒏𝒂𝒎𝒆..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group mb-3">
                          <input
                            type="password"
                            className="form-control"
                            placeholder="𝑷𝒂𝒔𝒔𝒘𝒐𝒓𝒅"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>

                        {error && (
                          <div className="alert alert-danger py-1 text-center">
                            {error}
                          </div>
                        )}

                        {isLoading ? (
                          <div className="text-center">
                            <div
                              className="spinner-border text-light"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                            <div className="text-white mt-2">Logging in...</div>
                          </div>
                        ) : (
                          <button
                            type="submit"
                            className="btn btn-primary btn-sm btn-block d-grid gap-2 col-6 mx-auto"
                          >
                            Login
                          </button>
                        )}
                      </form>

                      <hr />
                    </div>
                  </div>
                  {/* END RIGHT SIDE */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
