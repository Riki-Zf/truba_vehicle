// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

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

// FUNGSI KONEKSI DATABASE DENGAN PENANGANAN ERROR KETAT
const connectDBServerless = async () => {
  // Gunakan koneksi yang sudah ada jika tersedia (Ready State: 1 = Connected, 2 = Connecting)
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  // Validasi string koneksi sebelum mencoba menyambung
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    console.error("ERROR: Kunci MONGO_URI tidak ditemukan di Environment Variables Vercel!");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout dalam 5 detik jika Atlas tidak merespon
    });
    console.log("MongoDB Atlas Berhasil Terhubung");
  } catch (error) {
    console.error("Gagal koneksi MongoDB Atlas:", error.message);
  }
};

// Middleware Fail-Safe: Coba sambungkan DB, jika gagal/timeout tetap lanjutkan agar tidak crash 500
app.use(async (req, res, next) => {
  try {
    await connectDBServerless();
  } catch (err) {
    console.error("Database middleware error caught:", err.message);
  }
  next();
});

// API Routes Mapping
app.use("/api/checklists", checklistRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Test Route dasar (Bisa diakses tanpa database untuk pembuktian server hidup)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Active",
    message: "Vehicle Checklist API PT Truba Jaga Cita is running on Vercel Serverless",
    databaseStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected/Connecting",
  });
});

// HANYA JALANKAN APP.LISTEN JIKA BERJALAN DI LOKAL
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// Ekspor objek app untuk serverless function Vercel
module.exports = app;
