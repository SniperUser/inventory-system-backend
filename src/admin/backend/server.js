// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import sslRootCAs from "ssl-root-cas";
import { fileURLToPath } from "url";
import listEndpoints from "express-list-endpoints";

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Inject SSL root CAs
sslRootCAs.inject();

// Create express app
const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------
// ✅ CORS CONFIGURATION
// ------------------------
app.use(
  cors({
    origin: "https://sparkly-croissant-12ebe1.netlify.app", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // if sending cookies or auth headers
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------------
// Middleware
// ------------------------
app.use(express.json());

// ------------------------
// API Routes
// ------------------------
import dashboard from "../components/Dashboard/Routes.js";
import stockRoutes from "./routes/stockRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import emailRoutes from "./routes/emailRoutes/emailRoutes.js";
import employeeRoutes from "./routes/employeeRoutes/employeeRoutes.js";
import stockRouter from "./routes/stockRoutes/stockRoutes.js";
import supplierRoutes from "./routes/supplierRoutes/supplierRoutes.js";
import salesRoutes from "./routes/salesRoute/salesRoute.js";
import orderDelivery from "./routes/deliveryRoutes/deliveryRoutes.js";
import returnRoutes from "./routes/returnRoute/returnRoute.js";
import archivedRoutes from "./routes/archived/archive.js";

// (Other POS routes omitted for brevity)
import Products from "../../FrontendPOS/Routes/GetProducts/routes.js";

// Example POS Routes
import CanGoods from "../../FrontendPOS/Routes/GetCanGoodsRoutes/GetCanGoodsRoutes.js";
import InstantNoodles from "../../FrontendPOS/Routes/GetInstantNoodleRoutes/GetInstantNoodleRoutes.js";
import Snacks from "../../FrontendPOS/Routes/GetSnacksRoutes/GetSnacksRoutes.js";
import Drinks from "../../FrontendPOS/Routes/GetDrinksRoutes/GetDrinksRoutes.js";
import Rice from "../../FrontendPOS/Routes/GetRiceRoutes/GetRiceRoute.js";
import Condiments from "../../FrontendPOS/Routes/GetCondimentsRoutes/GetCondimentsRoutes.js";
import FrozenGoods from "../../FrontendPOS/Routes/GetFrozenGoodsRoutes/GetFrozenGoodsRoutes.js";
import PersonalCare from "../../FrontendPOS/Routes/GetPersonalCareRoutes/GetPersonalCareRoutes.js";
import Laundry from "../../FrontendPOS/Routes/GetLaundryRoutes/GetLaundryRoutes.js";
import HouseHold from "../../FrontendPOS/Routes/GetHouseHoldRoutes/GetHouseHoldRoutes.js";
import user from "../../FrontendPOS/Routes/AccountRoutes/AccountRoutes.js";
import checkout from "../../FrontendPOS/Routes/CheckoutRoutes/CheckoutRoutes.js";
import cashiering from "../../FrontendPOS/Cashiering/cashieringroutes.js";
import delivery from "../../FrontendPOS/Delivery/deliveryroutes.js";

// API Route mounting
app.use("/api/dashboard", dashboard);
app.use("/api/login", authRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/stocked", stockRouter);
app.use("/api/supplier", supplierRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/deliveries", orderDelivery);
app.use("/api/archived", archivedRoutes);

// POS
app.use("/api/products", Products);
app.use("/api/cangoods", CanGoods);
app.use("/api/instantnoodles", InstantNoodles);
app.use("/api/snacks", Snacks);
app.use("/api/drinks", Drinks);
app.use("/api/rice", Rice);
app.use("/api/condiments", Condiments);
app.use("/api/frozen", FrozenGoods);
app.use("/api/personalcare", PersonalCare);
app.use("/api/laundry", Laundry);
app.use("/api/household", HouseHold);
app.use("/api/users", user);
app.use("/api/checkout", checkout);
app.use("/api/cashiering", cashiering);
app.use("/api/delivery", delivery);

// Static files for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve React build
app.use(express.static(path.join(__dirname, "..", "..", "..", "build")));

// React Router catch-all
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "..", "..", "..", "build", "index.html")
  );
});

// Start server
export function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      const endpoints = listEndpoints(app);
      console.table(
        endpoints.map((e) => ({ path: e.path, methods: e.methods }))
      );
      resolve(server);
    });
  });
}

// Optional: run server if directly executed (development)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
