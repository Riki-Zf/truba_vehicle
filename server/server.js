// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config({ path: require("path").join(__dirname, ".env") });

// Import Routes
const checklistRoutes = require("./routes/checklistRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["*"];

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());

// ─── DATABASE CONNECTION (Singleton untuk Serverless) ─────────────────────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGO_URI tidak ditemukan di Environment Variables!");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    bufferCommands: false,
  });

  isConnected = true;
  console.log("MongoDB Atlas Berhasil Terhubung");
};

// Middleware: sambungkan DB sebelum setiap request
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Koneksi DB gagal:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database tidak tersedia, coba lagi nanti.",
      error: err.message,
    });
  }
  next();
});

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api/checklists", checklistRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Health-check root
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Active",
    message: "Vehicle Checklist API PT Truba Jaga Cita is running on Vercel",
    databaseStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// ─── LOCAL DEV ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server berjalan lokal di http://localhost:${PORT}`));
}

module.exports = app;
