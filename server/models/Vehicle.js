// server/models/Vehicle.js
const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    nomorPolisi: {
      type: String,
      required: [true, "Nomor Polisi wajib diisi"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    nomorCT: {
      type: String,
      required: [true, "Nomor CT wajib diisi"],
      trim: true,
      uppercase: true,
    },
    jenisUnit: {
      type: String,
      required: [true, "Jenis unit wajib diisi"],
      trim: true,
      uppercase: true,
    },
    ruteTujuan: {
      type: String,
      required: [true, "Rute tujuan wajib diisi"],
      trim: true,
      uppercase: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);