# ShopNest — Full-Stack MERN E-Commerce Platform

A production-oriented e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js), featuring OTP email verification, Razorpay payments, and Cloudinary image hosting.

## Features

- **Auth**: JWT-based authentication with email OTP verification on signup (Nodemailer). Unverified accounts cannot log in until they confirm their email.
- **Storefront**: product catalog, search, product detail pages, cart (Redux Toolkit), stock-aware "Add to Cart" / out-of-stock badges.
- **Checkout**: Razorpay payment integration, with a built-in demo-payment fallback so the flow is fully testable without live payment keys.
- **Orders**: stock is validated and decremented at order time (no overselling), order confirmation emails, order history on the customer profile page.
- **Admin panel**: dashboard with live metrics, product CRUD (Cloudinary image upload), order status management, user directory — all route-protected so only admins can reach them.
- **Polish**: toast notifications (react-hot-toast) instead of native browser alerts, loading/empty states throughout, rate limiting and security headers (helmet) on the API.

## Tech Stack

| Layer      | Stack |
|------------|-------|
| Frontend   | React (Vite), React Router, Redux Toolkit, react-hot-toast |
| Backend    | Node.js, Express, MongoDB (Mongoose) |
| Auth       | JWT, bcrypt, Nodemailer (OTP email) |
| Payments   | Razorpay |
| Media      | Cloudinary |
| Security   | helmet, express-rate-limit |

## Project Structure

```
MERN E-commerce/
├── backend/
│   ├── config/        # DB + Cloudinary config
│   ├── controller/     # Route handlers
│   ├── middleware/     # Auth/admin guards
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── utils/          # sendEmail helper
│   ├── seed.js          # Seeds a demo admin + customer
│   └── index.js         # App entrypoint
└── frontend/
    └── src/
        ├── admin/        # Admin panel pages
        ├── components/   # Navbar, Footer, ProductCard, Spinner, route guards
        ├── context/      # AuthContext
        ├── pages/        # Public + customer pages (incl. VerifyOtp)
        ├── redux/        # Cart slice/store
        └── styles/       # Plain CSS, dark theme
```

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your real values
npm run dev             # or: node index.js
```

Required environment variables (see `backend/.env.example` for the full list with comments):

- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — any long random string
- `EMAIL_USER` / `EMAIL_PASS` — a Gmail address + [App Password](https://myaccount.google.com/apppasswords) for sending OTP emails
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — optional; checkout falls back to a demo payment if these are blank

### 2. Seed demo data (optional but recommended)

```bash
cd backend
node seed.js
```

This creates two pre-verified accounts so you can log in immediately without going through OTP:

| Role     | Email                  | Password    |
|----------|-------------------------|-------------|
| Admin    | admin@shopnest.com      | password123 |
| Customer | customer@shopnest.com   | password123 |

(Check `seed.js` if you've changed the seeded password — update this table to match.)

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # optional, only needed for Razorpay
npm run dev
```

The Vite dev server proxies `/api` to the backend — make sure the backend is running on the port configured in `vite.config.js`.

## Auth Flow

1. `POST /api/auth/register` creates an unverified user and emails a 6-digit OTP (expires in 10 minutes).
2. The frontend routes to `/verify-otp`, where the user enters the code (`POST /api/auth/verify-otp`). Success returns a JWT and logs them in immediately.
3. `POST /api/auth/login` rejects unverified accounts with `403 { requiresVerification: true }`, and the frontend redirects them back to the OTP screen.
4. `POST /api/auth/resend-otp` issues a fresh code if the first one expires or doesn't arrive.

## Notes for Deployment

- The backend serves the frontend's `dist/` build when `NODE_ENV=production` — build the frontend first (`npm run build`) before starting the backend in production, or deploy them separately and set `FRONTEND_URL` for CORS.
- Product image uploads are streamed directly to Cloudinary from memory (no disk writes), so this works on serverless/read-only filesystems out of the box.
