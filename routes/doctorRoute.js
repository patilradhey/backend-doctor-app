const express = require("express");

const router = express.Router();

const doctorController = require("../controllers/doctorController");

const {
  auth,
  admin,
} = require("../middleware/auth");

// APPLY DOCTOR
router.post(
  "/applyDoctor",
  auth,
  doctorController.applyDoctor
);

// GET PENDING DOCTORS
router.get(
  "/pendingDoctors",
  auth,
  admin,
  doctorController.getPendingDoctors
);

// APPROVE DOCTOR
router.patch(
  "/approveDoctor/:doctorID",
  auth,
  admin,
  doctorController.approveDoctor
);

// REJECT DOCTOR
router.patch(
  "/rejectDoctor/:doctorID",
  auth,
  admin,
  doctorController.rejectDoctor
);

// GET APPROVED DOCTORS
router.get(
  "/allDoctors",
  auth,
  doctorController.getAllDoctors
);

// GET SINGLE DOCTOR
router.get(
  "/:id",
  auth,
  doctorController.getDoctorById
);

module.exports = router;