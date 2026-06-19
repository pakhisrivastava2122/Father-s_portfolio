const nodemailer = require("nodemailer");

// Only set up a mailer if the user has actually provided credentials in .env.
// Otherwise the site keeps working perfectly - leads just won't trigger an email.
function isEmailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);
}

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
}

async function sendLeadNotification(lead) {
  if (!isEmailConfigured()) return { sent: false, reason: "not_configured" };

  const to = process.env.NOTIFY_EMAIL || process.env.EMAIL_USER;

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Website Lead" <${process.env.EMAIL_USER}>`,
      to,
      subject: `New consultation request from ${lead.name}`,
      text: [
        `New enquiry from your website:`,
        ``,
        `Name: ${lead.name}`,
        `Mobile: ${lead.mobile}`,
        `Email: ${lead.email}`,
        `Financial Goal: ${lead.financialGoal}`,
        `Message: ${lead.message || "(none)"}`,
        ``,
        `Submitted: ${lead.submittedAt}`,
      ].join("\n"),
    });
    return { sent: true };
  } catch (err) {
    console.error("Email notification failed:", err.message);
    return { sent: false, reason: "send_failed" };
  }
}

module.exports = { sendLeadNotification, isEmailConfigured };
