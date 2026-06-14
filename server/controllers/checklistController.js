// server/controllers/checklistController.js
const Checklist = require("../models/CheckList");

// @desc    Membuat checklist baru (Submit dari Form)
// @route   POST /api/checklists
const createChecklist = async (req, res) => {
  try {
    const newChecklist = new Checklist(req.body);
    const savedChecklist = await newChecklist.save();
    res.status(201).json({
      success: true,
      message: "Checklist kendaraan berhasil disimpan!",
      data: savedChecklist,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal menyimpan checklist",
      error: error.message,
    });
  }
};

// @desc    Mengambil semua data riwayat checklist
// @route   GET /api/checklists
const getAllChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find().sort({ createdAt: -1 }); // Urutkan dari yang terbaru
    res.status(200).json({
      success: true,
      count: checklists.length,
      data: checklists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data checklist",
      error: error.message,
    });
  }
};

module.exports = {
  createChecklist,
  getAllChecklists,
};
