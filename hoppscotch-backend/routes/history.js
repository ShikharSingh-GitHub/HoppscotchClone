const express = require("express");
const {
  getHistory,
  addHistory,
  deleteHistory,
  toggleStar,
  clearHistory,
} = require("../controllers/historyController");

const router = express.Router();

// Routes
router.get("/", getHistory);
router.post("/", addHistory);
router.delete("/clear", clearHistory);
router.delete("/:id", deleteHistory);
router.patch("/:id/star", toggleStar);

module.exports = router;
