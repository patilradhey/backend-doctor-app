// const mongoose = require("mongoose");
// require("dotenv").config();

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
    

//     console.log("MongoDB Connected ✅");
//   } catch (err) {
//     console.log("DB ERROR:", err.message);
//   }
// };

// module.exports = { connectDB };

require("dotenv").config();

const mongoose = require("mongoose");

console.log("ENV URL:", process.env.MONGO_URL);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.log("DB ERROR:", err.message);
  }
};

module.exports = { connectDB };