# 🛒 Northwind Supply · Full-Stack E-Commerce Platform 🚀

A modern, production-ready Full-Stack E-Commerce web application built with **React 19**, **Node.js/Express (TypeScript)**, **PostgreSQL (Neon)**, **Drizzle ORM**, **Tailwind CSS v4**, **Stream Chat & Video SDK**, and **ImageKit**.

![App Screenshot](./frontend/public/screenshot-for-readme.png)

---

## ✨ Key Features

- 🛍️ **Interactive Product Catalog:** Dynamic category filtering, search, and responsive layout.
- 🛒 **Persistent Shopping Cart:** Client-side persistent cart powered by Zustand (`localStorage`).
- 🔐 **Custom JWT Authentication & RBAC:**
  - Secure password hashing using Node.js built-in `scrypt` and timing-safe verification.
  - Role-based authorization (`customer`, `support`, `admin`).
  - Dropdown profile menu, persistent sessions, and auth modal with smooth tabs.
- 💳 **Simulated Multi-Method Checkout:**
  - Interactive payment gateway modal supporting **Credit/Debit Cards**, **UPI**, and **Cash on Delivery (COD)**.
  - Generates instant verified paid orders directly into PostgreSQL database.
- 📦 **Order Management:** View detailed order histories, line items, status tracking, and order receipts.
- 💬 **In-Order Real-Time Support Chat:** Powered by **Stream Chat SDK** — chat with staff directly inside your order.
- 📹 **Integrated Live Video Calling:** Powered by **Stream Video SDK** — staff can trigger instant video call invites within order chat threads.
- 🖼️ **Cloud Media Optimization:** Integrated with **ImageKit** for on-the-fly thumbnail generation, automatic format delivery, and image watermarking.
- 🛠️ **Admin Product Management:** Protected admin portal to create, update, deactivate, or delete products with direct ImageKit file uploads.
- ⚡ **Render Keep-Alive Engine:** Built-in background cron scheduler that automatically pings the server to prevent Render free-tier cold starts.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, DaisyUI, TanStack React Query, Zustand, React Router 7, Lucide Icons |
| **Backend** | Node.js, Express 5, TypeScript, Drizzle ORM, Zod, Node Crypto |
| **Database** | PostgreSQL (Serverless on [Neon](https://neon.tech)) |
| **Real-time Services** | [GetStream.io](https://getstream.io/) (Chat SDK & Video React SDK) |
| **Media & CDN** | [ImageKit.io](https://imagekit.io/) (Image CDN, transforms, watermarking) |

---

## 📁 Project Structure

```bash
ecommerce-project/
├── backend/
│   ├── scripts/
│   │   └── seed.ts             # Database seeding script (products & demo users)
│   ├── src/
│   │   ├── controllers/        # Route controllers (admin, checkout, orders, products, stream)
│   │   ├── db/                 # Drizzle schema & PostgreSQL connection
│   │   ├── lib/                # JWT, scrypt crypto, env validator, stream client, cron
│   │   ├── middleware/         # JWT authMiddleware & role authorization
│   │   ├── routes/             # Express API routes
│   │   └── index.ts            # Server entry point
│   ├── drizzle.config.ts       # Drizzle Kit configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components & modals (PaymentModal, Navbar, etc.)
│   │   ├── context/            # Custom AuthProvider & useAuth hook
│   │   ├── hooks/              # Query & mutation custom hooks
│   │   ├── lib/                # API client & ImageKit URL helpers
│   │   ├── pages/              # App pages (Home, Product, Cart, Orders, Admin, Auth)
│   │   ├── store/              # Zustand cart store
│   │   ├── App.jsx             # Route definitions & guards
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (e.g. free serverless DB on [Neon](https://neon.tech))
- Free accounts on [GetStream](https://getstream.io) & [ImageKit](https://imagekit.io)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ecommerce-project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (see [.env.example](backend/.env.example)):

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL="postgresql://<username>:<password>@<neon-host>/<database>?sslmode=require"

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Stream Chat & Video credentials
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# ImageKit credentials
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

Push schema and seed database:

```bash
# Push database tables to PostgreSQL
npm run db:push

# Seed catalog products and demo accounts
npm run db:seed
```

Start backend server:

```bash
npm run dev
```

Server will run on `http://localhost:3001`.

---

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (see [.env.example](frontend/.env.example)):

```env
VITE_API_URL=http://localhost:3001
```

Start Vite dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@ecommerce.com` | `password123` |
| **Support** | `support@ecommerce.com` | `password123` |
| **Customer** | `customer@ecommerce.com` | `password123` |

*(You can also register brand-new customer accounts anytime from the UI).*

---

## 🌐 Deployment

### Deploy Backend on [Render](https://render.com)

1. Create a **New Web Service** from your GitHub repository.
2. Configure settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Health Check Path:** `/health`
3. Add environment variables from `backend/.env.example` in the **Environment** tab.

### Deploy Frontend on [Vercel](https://vercel.com) / [Render Static Site](https://render.com)

1. Create a **New Project** pointing to this repository.
2. Configure settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variable:
   - `VITE_API_URL`: Your live backend Render URL (e.g. `https://ecommerce-backend.onrender.com`)

---

## 📄 License

This project is licensed under the ISC License.
