
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    Qualification: String,

    specialization: String,

    experience: String,

    fees: Number,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rating: Number,

    reviews: Array,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);

