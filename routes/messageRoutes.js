const express = require("express");
const router = express.Router();

const Message = require("../models/messageModel");
const User = require("../models/userModel");

/* GET PATIENTS  */

router.get("/patients/:doctorId", async (req, res) => {

  try {

    const doctorId = String(req.params.doctorId);

    const messages = await Message.find({
      receiver: doctorId,
    });

    // UNIQUE USER IDS
    const patientIds = [
      ...new Set(
        messages.map((m) => String(m.sender))
      ),
    ];

    const patients = await User.find({
      _id: { $in: patientIds },
    });

    res.json(patients);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

/* GET DOCTORS  (mirror of /patients/:doctorId, for the patient side) */

router.get("/doctors/:userId", async (req, res) => {

  try {

    const userId = String(req.params.userId);

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    });

    const otherIds = [
      ...new Set(
        messages.map((m) =>
          String(m.sender) === userId ? String(m.receiver) : String(m.sender)
        )
      ),
    ];

    const doctorUsers = await User.find({
      _id: { $in: otherIds },
      role: "doctor",
    });

    res.json(doctorUsers);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      msg: "Server error",
    });
  }
});

/* GET CHAT  */

router.get("/:senderId/:receiverId", async (req, res) => {

  try {

    const messages = await Message.find({
      $or: [
        {
          sender: req.params.senderId,
          receiver: req.params.receiverId,
        },
        {
          sender: req.params.receiverId,
          receiver: req.params.senderId,
        },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
    });
  }
});

/*SEND MESSAGE */

router.post("/", async (req, res) => {

  try {

    const msg = new Message(req.body);

    await msg.save();

    res.json(msg);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
    });
  }
});

module.exports = router;