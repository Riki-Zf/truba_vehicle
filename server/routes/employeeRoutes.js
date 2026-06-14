// server/routes/employeeRoutes.js
const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// 1. GET ALL EMPLOYEES (Ambil semua data karyawan)
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 }); // Urutkan berdasarkan abjad nama A-Z
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. CREATE EMPLOYEE (Tambah Karyawan Baru)
router.post("/", async (req, res) => {
  const { name, badgeNumber, unit, tujuan } = req.body;
  try {
    const existing = await Employee.findOne({ badgeNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: "Nomor Badge sudah terdaftar!" });
    }

    const newEmployee = new Employee({ name, badgeNumber, unit, tujuan });
    await newEmployee.save();
    res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. UPDATE EMPLOYEE (Ubah Data Karyawan)
router.put("/:id", async (req, res) => {
  const { name, badgeNumber, unit, tujuan } = req.body;
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, { name, badgeNumber, unit, tujuan }, { new: true, runValidators: true });
    if (!updatedEmployee) {
      return res.status(404).json({ success: false, message: "Karyawan tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: updatedEmployee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. DELETE EMPLOYEE (Hapus Karyawan)
router.delete("/:id", async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).json({ success: false, message: "Karyawan tidak ditemukan" });
    }
    res.status(200).json({ success: true, message: "Karyawan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
