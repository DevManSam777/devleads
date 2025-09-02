const express = require('express');
const router = express.Router();
const leadController = require("../controllers/leadController");
const auth = require("../middleware/auth");
const verifyToken = require('../middleware/auth');

// All routes are protected with auth middleware
router.get("/", auth, leadController.getLeads);
router.get("/search", auth, leadController.searchLeads);
router.get("/:id", auth, leadController.getLeadById);
router.post("/", leadController.createLead);
router.put("/:id", auth, leadController.updateLead);
router.delete("/:id", auth, leadController.deleteLead);

module.exports = router;
