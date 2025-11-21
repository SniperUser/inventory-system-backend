// drinkRoutes.js
import express from "express";
import { getDrinks } from "../../controller/GetDrinksController/GetDrinksController.js";

const router = express.Router();

// GET /api/drinks/getDrinks
router.get("/getDrinks", getDrinks);

export default router;
