const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

// Make sure the data folder + file exist before we ever try to read/write.
function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEADS_FILE)) {
    fs.writeFileSync(LEADS_FILE, "[]", "utf-8");
  }
}

function getAllLeads() {
  ensureStore();
  const raw = fs.readFileSync(LEADS_FILE, "utf-8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveLead(lead) {
  ensureStore();
  const leads = getAllLeads();
  leads.unshift(lead); // newest first
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  return lead;
}

module.exports = { getAllLeads, saveLead };
