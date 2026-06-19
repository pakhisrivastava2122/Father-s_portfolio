# Durgesh Kumar Srivastava — Financial Advisor Portfolio

A full-stack portfolio website for a Senior Financial Advisor / AMFI Registered Mutual Fund Distributor, built with Node.js/Express (backend) and vanilla HTML/CSS/JS (frontend).

---

## Project Structure

```
durgesh-financial-advisor/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── package.json
│   ├── .env.example       # Copy to .env and fill in values
│   ├── db.js              # JSON file-based lead storage
│   ├── mailer.js          # Optional email notifications via Gmail
│   ├── routes/contact.js  # POST /api/contact + GET /api/leads
│   ├── middleware/auth.js # Admin token auth for /api/leads
│   └── data/leads.json    # Submitted contact leads (auto-created)
└── frontend/
    ├── index.html
    ├── css/style.css
    ├── js/main.js
    ├── js/calculators.js
    └── images/durgesh-profile.png
```

---

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port to run on (default: 5000) |
| `ADMIN_TOKEN` | Yes | A secret string to protect the leads endpoint |
| `EMAIL_USER` | No | Gmail address for sending lead notifications |
| `EMAIL_APP_PASSWORD` | No | Gmail App Password (not your regular password) |
| `NOTIFY_EMAIL` | No | Email address to receive lead notifications |

> **Gmail App Password**: Go to [myaccount.google.com](https://myaccount.google.com) → Security → 2-Step Verification → App Passwords. Generate a password for "Mail".

### 3. Start the server

```bash
cd backend
npm start
```

Open [http://localhost:5000](http://localhost:5000) in your browser. The server serves both the frontend and backend from a single port.

For development with auto-restart:
```bash
npm run dev
```

---

## API Endpoints

### POST `/api/contact`
Submits a contact form lead.

**Body (JSON):**
```json
{
  "name": "Rajesh Kumar",
  "mobile": "9876543210",
  "email": "rajesh@example.com",
  "financialGoal": "Mutual Funds",
  "message": "I want to start investing."
}
```

**Response:** `201 Created` on success, `400 Bad Request` on validation error.

---

### GET `/api/leads`
View all submitted leads (admin only).

**Header:**
```
x-admin-token: your_admin_token_here
```

```bash
curl http://localhost:5000/api/leads \
  -H "x-admin-token: your_admin_token_here"
```

---

### GET `/api/health`
Health check — returns `{ "status": "ok" }`.

---

## Deployment

### Option A — Render (Recommended, Free Tier Available)

1. Push the project to a GitHub repository.
2. Go to [render.com](https://render.com) → New Web Service.
3. Connect your GitHub repo.
4. Set **Root Directory** to `backend`.
5. Set **Build Command** to `npm install`.
6. Set **Start Command** to `npm start`.
7. Add environment variables in the Render dashboard (from your `.env`).
8. Deploy — Render will serve the full site on a `.onrender.com` URL.

### Option B — Railway

1. Push to GitHub.
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub.
3. Select repo, set root to `backend`.
4. Add environment variables.
5. Done — Railway auto-detects Node.js.

### Option C — Split Deployment (Advanced)

Deploy the **backend** on Render/Railway and the **frontend** as a static site on Netlify or Vercel. In this case, update the fetch URL in `frontend/js/main.js` from:
```js
fetch("/api/contact", ...)
```
to your full backend URL:
```js
fetch("https://your-backend.onrender.com/api/contact", ...)
```
Also update the CORS config in `backend/server.js` to allow your frontend's domain.

---

## Features

- Responsive, mobile-first design (Navy Blue + Gold premium theme)
- 5 Financial Calculators: SIP, Lumpsum, Retirement, EMI, Goal Planning
- Contact form with lead storage and optional email notifications
- Dark mode toggle (remembers preference)
- Scroll-reveal animations, animated stat counters
- JSON-LD schema markup for SEO
- WhatsApp floating button + sticky mobile call bar
- Blog section with expandable articles
- FAQ accordion
- Investment partners showcase (18 AMCs/insurers)
- Admin endpoint to view all leads

---

## License

Private — built for personal/business use by Durgesh Kumar Srivastava.
