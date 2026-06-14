// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose"); // Langsung pakai mongoose bawaan

// Import Routes
const checklistRoutes = require("./routes/checklistRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// FUNGSIONAL KONEKSI DATABASE LANGSUNG (Sangat aman untuk Serverless Vercel)
const connectDBServerless = async () => {
  // Jika database sudah terhubung, gunakan koneksi yang ada (mencegah penumpukan pool koneksi)
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("MongoDB Atlas Berhasil Terhubung (Direct Serverless Mode)");
  } catch (error) {
    console.error("Gagal koneksi MongoDB Atlas:", error.message);
  }
};

// Middleware untuk memastikan database selalu siap setiap ada request API masuk
app.use(async (req, res, next) => {
  await connectDBServerless();
  next();
});

// API Routes Mapping
app.use("/api/checklists", checklistRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Vehicle Checklist API PT Truba Jaga Cita is running successfully on Vercel...");
});

// HANYA JALANKAN APP.LISTEN JIKA BERJALAN DI LOKAL (BUKAN DI PRODUCTION VERCEL)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// WAJIB UNTUK VERCEL: Ekspor objek app agar dibaca sebagai Serverless Function
module.exports = app;
