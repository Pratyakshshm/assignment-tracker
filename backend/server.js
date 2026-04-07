require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());


// ================= ROUTES =================
app.use("/api/assignments", require("./routes/assignments"));


// ================= DATABASE CONNECTION =================

// 🔴 REPLACE with your actual Atlas connection string
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB Error:", err));

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("API is running...");
});


// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});