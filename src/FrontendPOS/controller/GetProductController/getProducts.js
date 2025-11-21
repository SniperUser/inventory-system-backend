// controllers/productController.js
import fs from "fs";
import path from "path";
import db from "../../../admin/backend/config/db.js";

// Helper to get valid image URL or fallback
const getImageUrl = (req, imageName) => {
  const baseUrl = `${req.protocol}://${req.get("host")}/uploads`;

  if (!imageName) {
    return `${baseUrl}/no-image.png`;
  }

  const filePath = path.join(process.cwd(), "uploads", imageName);
  return fs.existsSync(filePath)
    ? `${baseUrl}/${imageName}`
    : `${baseUrl}/no-image.png`;
};

// 📦 Get all products (excluding archived)
export const getAllProducts = (req, res) => {
  const query = `
    SELECT id, product_name, description, price, quantity, category, supplier_id,
           received_by, received_date, product_condition, created_at, is_archived, image
    FROM product_stock
    WHERE is_archived = 0
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Database query error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const productsWithImages = results.map((product) => ({
      ...product,
      image: getImageUrl(req, product.image),
    }));

    res.json(productsWithImages);
  });
};

// 🔍 Get single product by ID
export const getProductById = (req, res) => {
  const { id } = req.params;

  db.query(
    `
    SELECT id, product_name, description, price, quantity, category, supplier_id,
           received_by, received_date, product_condition, created_at, is_archived, image
    FROM product_stock
    WHERE id = ?
    `,
    [id],
    (err, rows) => {
      if (err) {
        console.error("❌ Error fetching product:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const product = {
        ...rows[0],
        image: getImageUrl(req, rows[0].image),
      };

      res.json(product);
    }
  );
};
