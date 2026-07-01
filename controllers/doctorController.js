
const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");

// APPLY DOCTOR
const applyDoctor = async (req, res) => {

  try {

    const exists = await Doctor.findOne({
      user_id: req.user.id,
    });

    if (exists) {
      return res.send({
        success: false,
        msg: "Already applied",
      });
    }

    const doctor = await Doctor.create({
      user_id: req.user.id,
      ...req.body,
      status: "pending",
    });

    res.send({
      success: true,
      msg: "Doctor request submitted",
      doctor,
    });

  } catch (err) {

    console.log(err);

    res.send({
      success: false,
      msg: err.message,
    });
  }
};

// GET PENDING DOCTORS
const getPendingDoctors = async (req, res) => {

  try {

    const doctors = await Doctor.find({
      status: "pending",
    }).populate("user_id");

    res.send({
      success: true,
      doctors,
    });

  } catch (err) {

    res.send({
      success: false,
      msg: err.message,
    });
  }
};

// APPROVE DOCTOR
const approveDoctor = async (req, res) => {

  try {

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.doctorID,
      {
        status: "approved",
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      doctor.user_id,
      {
        role: "doctor",
      }
    );

    res.send({
      success: true,
      msg: "Doctor approved",
    });

  } catch (err) {

    res.send({
      success: false,
      msg: err.message,
    });
  }
};

// REJECT DOCTOR
const rejectDoctor = async (req, res) => {

  try {

    await Doctor.findByIdAndUpdate(
      req.params.doctorID,
      {
        status: "rejected",
      }
    );

    res.send({
      success: true,
      msg: "Doctor rejected",
    });

  } catch (err) {

    res.send({
      success: false,
      msg: err.message,
    });
  }
};

// GET ALL APPROVED DOCTORS
const getAllDoctors = async (req, res) => {

  try {

    const doctors = await Doctor.find({
      status: "approved",
    }).populate("user_id", "name img_path email");

    res.send({
      success: true,
      doctors,
    });

  } catch (err) {

    console.log(err);

    res.send({
      success: false,
      msg: "Error fetching doctors",
    });
  }
};

// GET DOCTOR BY ID
const getDoctorById = async (req, res) => {

  try {

    const doctor = await Doctor.findById(
      req.params.id
    ).populate("user_id");

    if (!doctor) {
      return res.status(404).json({
        msg: "Doctor not found",
      });
    }

    res.json(doctor);

  } catch (err) {

    res.status(500).json(err);
  }
};

module.exports = {
  applyDoctor,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getAllDoctors,
  getDoctorById,
};
