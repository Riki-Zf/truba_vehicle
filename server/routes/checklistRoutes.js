// server/routes/checklistRoutes.js
const express = require('express');
const router = express.Router();
const { createChecklist, getAllChecklists } = require('../controllers/checklistController');

// Mengarahkan ke controller masing-masing
router.route('/')
  .post(createChecklist)
  .get(getAllChecklists);

module.exports = router;