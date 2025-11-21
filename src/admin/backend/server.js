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

// Import routes
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

import Products from "../../FrontendPOS/Routes/GetProducts/routes.js";

// Can Goods
import CanGoods from "../../FrontendPOS/Routes/GetCanGoodsRoutes/GetCanGoodsRoutes.js";
// Instant Noodles
import InstantNoodles from "../../FrontendPOS/Routes/GetInstantNoodleRoutes/GetInstantNoodleRoutes.js";
// Snacks
import Snacks from "../../FrontendPOS/Routes/GetSnacksRoutes/GetSnacksRoutes.js";
// Drinks
import Drinks from "../../FrontendPOS/Routes/GetDrinksRoutes/GetDrinksRoutes.js";
// Rice
import Rice from "../../FrontendPOS/Routes/GetRiceRoutes/GetRiceRoute.js";
// Condiments
import Condiments from "../../FrontendPOS/Routes/GetCondimentsRoutes/GetCondimentsRoutes.js";
// FrozenGoods
import FrozenGoods from "../../FrontendPOS/Routes/GetFrozenGoodsRoutes/GetFrozenGoodsRoutes.js";
// Personal care
import PersonalCare from "../../FrontendPOS/Routes/GetPersonalCareRoutes/GetPersonalCareRoutes.js";
// Laundry
import Laundry from "../../FrontendPOS/Routes/GetLaundryRoutes/GetLaundryRoutes.js";
// Household
import HouseHold from "../../FrontendPOS/Routes/GetHouseHoldRoutes/GetHouseHoldRoutes.js";
// AccountRoutes
import user from "../../FrontendPOS/Routes/AccountRoutes/AccountRoutes.js";
// Checkout routes
import checkout from "../../FrontendPOS/Routes/CheckoutRoutes/CheckoutRoutes.js";
// Cashiering area
import cashiering from "../../FrontendPOS/Cashiering/cashieringroutes.js";
// Delivery routes
import delivery from "../../FrontendPOS/Delivery/deliveryroutes.js";

// Inject SSL root CAs
sslRootCAs.inject();

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
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

// ✅ Export a function to start the server
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

// Optional: run server if directly executed (for development)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
