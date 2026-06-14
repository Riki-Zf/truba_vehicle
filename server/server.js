// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db"); // Mengembalikan fungsi database asli kamu

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

// Middleware untuk memastikan database terhubung setiap ada request serverless masuk
app.use(async (req, res, next) => {
  try {
    await connectDB(); // Memanggil fungsi koneksi DB bawaan kamu secara aman
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
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
