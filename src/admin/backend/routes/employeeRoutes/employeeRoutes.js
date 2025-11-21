import express from "express";
import {
  addEmployee,
  getEmployees,
  getAllEmployee,
  getEmployeeImage,
    updateEmployeeById,
  archiveEmployee
} from "../../controller/employeeController/employeeController.js";

const router = express.Router();

router.get("/employees", getEmployees);
router.get("/employees/all", getAllEmployee);
router.get('/employees/:id/image', getEmployeeImage);
router.post("/add/employee", addEmployee);
router.put("/update/employee/:id", updateEmployeeById);
router.put("/delete/employee/:id", archiveEmployee);

export default router;
