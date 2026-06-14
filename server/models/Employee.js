// server/models/Employee.js
const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama karyawan wajib diisi"],
      trim: true,
      uppercase: true,
    },
    badgeNumber: {
      type: String,
      required: [true, "Badge number wajib diisi"],
      unique: true,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, "Jenis unit wajib diisi"],
      trim: true,
      uppercase: true, // Menyimpan dalam huruf besar (BUS, TRUCK, etc.)
    },
    tujuan: {
      type: String,
      required: [true, "Rute tujuan wajib diisi"],
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Employee", EmployeeSchema);
