// server/routes/vehicleRoutes.js
const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");

// 1. GET ALL VEHICLES (Ambil semua data unit)
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ nomorPolisi: 1 });
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. CREATE VEHICLE (Tambah Unit Baru)
router.post("/", async (req, res) => {
  const { nomorPolisi, nomorCT, jenisUnit, ruteTujuan } = req.body;
  try {
    const existing = await Vehicle.findOne({ nomorPolisi });
    if (existing) {
      return res.status(400).json({ success: false, message: "Nomor Polisi sudah terdaftar!" });
    }

    const newVehicle = new Vehicle({ nomorPolisi, nomorCT, jenisUnit, ruteTujuan });
    await newVehicle.save();
    res.status(201).json({ success: true, data: newVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. UPDATE VEHICLE (Ubah Data Unit)
router.put("/:id", async (req, res) => {
  const { nomorPolisi, nomorCT, jenisUnit, ruteTujuan } = req.body;
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { nomorPolisi, nomorCT, jenisUnit, ruteTujuan },
      { new: true, runValidators: true }
    );
    if (!updatedVehicle) {
      return res.status(404).json({ success: false, message: "Unit tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: updatedVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. DELETE VEHICLE (Hapus Unit)
router.delete("/:id", async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deletedVehicle) {
      return res.status(404).json({ success: false, message: "Unit tidak ditemukan" });
    }
    res.status(200).json({ success: true, message: "Unit berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;