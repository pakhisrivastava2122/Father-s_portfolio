require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const contactRoutes = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---- API routes ----
app.use("/api", contactRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", time: new Date().toISOString() });
});

// ---- Serve the frontend (static site) ----
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

// Any unknown non-API route falls back to index.html (simple SPA-friendly fallback)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Durgesh Kumar Srivastava portfolio server running on port ${PORT}`);
});
