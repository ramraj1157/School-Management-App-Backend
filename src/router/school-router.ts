import { Router, Request, Response } from "express";
import { body, query, param, validationResult } from "express-validator";
import { addSchool, getAllSchools, updateSchool, deleteSchool } from "../models/school";

const router = Router();

// Validation middleware for adding a school
const validateAddSchool = [
  body("name").isString().trim().notEmpty().withMessage("Name is required and must be a string"),
  body("address").isString().trim().notEmpty().withMessage("Address is required and must be a string"),
  body("latitude").isFloat({ min: -90, max: 90 }).withMessage("Latitude must be a valid number between -90 and 90"),
  body("longitude").isFloat({ min: -180, max: 180 }).withMessage("Longitude must be a valid number between -180 and 180"),
];

// Validation middleware for fetching schools
const validateListSchools = [
  query("latitude").isFloat({ min: -90, max: 90 }).withMessage("Latitude is required and must be a valid number"),
  query("longitude").isFloat({ min: -180, max: 180 }).withMessage("Longitude is required and must be a valid number"),
];

// Validation middleware for updating a school
const validateUpdateSchool = [
  param("id").isInt().withMessage("School ID must be an integer"),
  body("name").optional().isString().trim().notEmpty().withMessage("Name must be a string"),
  body("address").optional().isString().trim().notEmpty().withMessage("Address must be a string"),
  body("latitude").optional().isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),
  body("longitude").optional().isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),
];

// Validation middleware for deleting a school
const validateDeleteSchool = [
  param("id").isInt().withMessage("School ID must be an integer"),
];

// Add a new school
router.post("/addSchool", validateAddSchool, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
     return;
  }

  try {
    const { name, address, latitude, longitude } = req.body;
    await addSchool({ name, address, latitude, longitude });
    res.status(201).json({ message: "School added successfully!" });
  } catch (error) {
    console.error(" Error adding school:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get sorted list of schools
router.get("/listSchools", validateListSchools, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
     res.status(400).json({ errors: errors.array() });
     return
  }

  try {
    const { latitude, longitude } = req.query;
    const schools = await getAllSchools();
    const userLat = parseFloat(latitude as string);
    const userLng = parseFloat(longitude as string);

    const sortedSchools = schools.sort((a, b) => {
      const distA = Math.hypot(a.latitude - userLat, a.longitude - userLng);
      const distB = Math.hypot(b.latitude - userLat, b.longitude - userLng);
      return distA - distB;
    });

    res.json(sortedSchools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🛠 Fix: Ensure the ID in body and params match & prevent crashes
router.put("/updateSchool/:id", validateUpdateSchool, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
  
    try {
      const { id } = req.params;
      const updateData = req.body;
  
      if (updateData.id && Number(updateData.id) !== Number(id)) {
         res.status(400).json({ error: "ID in request body must match the ID in params" });
         return;
      }
  
      const result = await updateSchool(Number(id), updateData);
      if (result.affectedRows === 0) {
         res.status(404).json({ error: "School not found" });
         return;
      }
  
      res.json({ message: "School updated successfully!" });
    } catch (error) {
      console.error(" Error updating school:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // Fix: Prevent app crashes when deleting a non-existent ID
  router.delete("/deleteSchool/:id", validateDeleteSchool, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
  
    try {
      const { id } = req.params;
  
      const result = await deleteSchool(Number(id));
      if (result.affectedRows === 0) {
         res.status(404).json({ error: "School not found" });
         return;
      }
  
      res.json({ message: "School deleted successfully!" });
    } catch (error) {
      console.error(" Error deleting school:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

export default router;
