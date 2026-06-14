// server/models/Checklist.js
const mongoose = require("mongoose");

const ChecklistSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    nomorPolisi: { type: String, required: true, trim: true },
    nomorCT: { type: String, required: true, trim: true },
    jenisKendaraan: { type: String, required: true },
    namaDriver: { type: String, required: true },
    badgeNumber: { type: String, required: true },
    rute: { type: String, required: true },
    beroperasi: { type: String, enum: ["Ya", "Tidak"], required: true },
    kondisiKendaraan: [
      {
        partName: { type: String, required: true },
        status: { type: String, enum: ["Baik", "Rusak", "Dalam Perbaikan"], required: true },
      },
    ],
    // TAMBAHKAN BARIS INI:
    catatanTambahan: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checklist", ChecklistSchema);
