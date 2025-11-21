import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // Load env variables

console.log("DB_USER:", process.env.DB_USER);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, // Railway requires this!
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to Railway MySQL database.");
});

export default connection;
