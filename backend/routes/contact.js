const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const { saveLead, getAllLeads } = require("../db");
const { requireAdmin } = require("../middleware/auth");
const { sendLeadNotification } = require("../mailer");

const MOBILE_REGEX = /^[+]?[0-9\s-]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact  -> submit a new consultation / enquiry
router.post("/contact", async (req, res) => {
  const { name, mobile, email, financialGoal, message } = req.body || {};

  const errors = [];
  if (!name || !name.trim()) errors.push("Name is required.");
  if (!mobile || !MOBILE_REGEX.test(mobile.trim())) {
    errors.push("A valid mobile number is required.");
  }
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push("A valid email address is required.");
  }
  if (!financialGoal || !financialGoal.trim()) {
    errors.push("Please select a financial goal.");
  }

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const lead = {
    id: crypto.randomUUID(),
    name: name.trim(),
    mobile: mobile.trim(),
    email: email.trim(),
    financialGoal: financialGoal.trim(),
    message: (message || "").trim(),
    submittedAt: new Date().toISOString(),
  };

  saveLead(lead);
  const emailResult = await sendLeadNotification(lead);

  return res.status(201).json({
    success: true,
    message: "Thank you! Your request has been received. We will contact you shortly.",
    emailNotified: emailResult.sent,
  });
});

// GET /api/leads -> view all submitted leads (protected, for admin use)
router.get("/leads", requireAdmin, (req, res) => {
  const leads = getAllLeads();
  return res.json({ success: true, count: leads.length, leads });
});

module.exports = router;
