# Ledger — Mini Fintech Dashboard

A simple personal finance tracker built with the **MERN stack** (MongoDB, Express, React, Node.js).
Users can log income/expense transactions, filter them, view a summary of their finances,
see a category-wise spending chart, and get a rule-based insight about their spending habits.

> **Resilient mode:** if MongoDB is unavailable, the backend automatically falls back to an in-memory store so the API and dashboard remain usable for local development and testing.


---

## Features

- **Add a transaction** — amount, category, type (income/expense), date, and an optional note
- **List & filter transactions** — filter by type, category, and/or date range
- **Summary view** — total income, total expense, net balance, and top spending category
- **Spending chart** — a pie chart of expenses broken down by category (Recharts)
- **Rule-based insight** — a short, plain-English observation derived from your data (e.g. overspending alerts, month-over-month trends, category concentration)

---

## Tech stack

| Layer    | Tech                                                  |
| -------- | ----------------------------------------------------- |
| Frontend | React (Vite), Tailwind CSS, Recharts, Axios            |
| Backend  | Node.js, Express, Mongoose                             |
| Database | MongoDB (local or MongoDB Atlas)                       |

---

## Project structure

The project is split into two independent apps — `backend/` and `frontend/` —
so they can be developed, run, and deployed separately.

```
mini-fintech-dashboard/
├── backend/                  # Express API (MVC architecture)
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/
│   │   └── Transaction.js    # Mongoose schema (Model)
│   ├── controllers/
│   │   └── transactionController.js  # Business logic (Controller)
│   ├── routes/
│   │   └── transactionRoutes.js      # Route definitions (View/API layer)
│   ├── middleware/
│   │   ├── errorHandler.js   # Centralized error handling + 404
│   │   └── validateTransaction.js    # Request validation
│   ├── utils/
│   │   ├── AppError.js       # Custom error class
│   │   ├── asyncHandler.js   # Async/await error wrapper
│   │   ├── insightEngine.js  # Rule-based insight logic
│   │   └── seed.js           # Sample data seeder
│   ├── server.js             # App entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                  # React (Vite) SPA
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── constants/          # Category lists & chart colors
│   │   ├── services/api.js     # Axios API client
│   │   ├── utils/format.js     # Currency/date formatting
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── .env.example
│
└── README.md
```

> **Note on "MVC" in a REST API:** the backend follows Model–View–Controller in the
> Express sense — `models/` define the data shape, `controllers/` hold the business
> logic, and `routes/` (acting as the "view" layer for an API) define the endpoints
> and map them to controllers. The actual visual "view" is the React frontend, which
> consumes this API.

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A MongoDB database — either:
  - a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster (recommended), or
  - a local MongoDB instance (`mongodb://127.0.0.1:27017`)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd mini-fintech-dashboard
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set `MONGO_URI` to your MongoDB connection string:

```
PORT=8080
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/fintech-dashboard
CLIENT_URL=http://localhost:5173
```

Start the API:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```

Run the built-in API checks:

```bash
npm run test:api
```

The API will run at `http://localhost:8080`. Check it's alive at `GET /api/health`.

**Optional:** seed the database with sample transactions so the dashboard has data right away:

```bash
npm run seed             # add sample data
npm run seed -- --reset  # wipe existing transactions first, then seed
```

### 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` if your API isn't running on the default URL:

```
VITE_API_URL=http://localhost:8080/api
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API reference

Base URL: `/api/transactions`

| Method | Endpoint                  | Description                                              |
| ------ | ------------------------- | --------------------------------------------------------- |
| GET    | `/`                        | List transactions. Supports `?type=`, `?category=`, `?startDate=`, `?endDate=` query params |
| POST   | `/`                        | Create a transaction. Body: `{ amount, type, category, date, note? }` |
| GET    | `/:id`                     | Get a single transaction                                   |
| PUT    | `/:id`                     | Update a transaction                                       |
| DELETE | `/:id`                     | Delete a transaction                                       |
| GET    | `/summary`                 | Returns `{ totalIncome, totalExpense, netBalance, topSpendingCategory, categoryBreakdown }`. Supports the same filters as above |
| GET    | `/insight`                 | Returns `{ type, message }` — a single rule-based insight. Supports the same filters as above |

All responses follow the shape `{ success: boolean, data: ... }` (or `{ success: false, message: "..." }` on error).

### Example: create a transaction

```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 1200, "type": "expense", "category": "Food", "date": "2025-06-10", "note": "Groceries"}'
```

---

## The insight engine

`backend/utils/insightEngine.js` evaluates a small ordered list of rules against the
current transactions and returns the first one that matches:

1. **Over budget** — total expenses exceed total income
2. **Spending spike** — this month's spending is 20%+ higher than last month's
3. **Category concentration** — one category accounts for >30% of total spending
4. **Spending drop** — this month's spending is 20%+ lower than last month's
5. **Healthy balance** — income covers expenses with a positive savings rate
6. **Fallback** — a generic "keep tracking" message if nothing else applies

Each rule returns a `type` (`warning` | `positive` | `info` | `empty`) which the
frontend uses to color-code the insight card.

---

## Deployment

The frontend and backend deploy independently.

### Database — MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a database user and allow network access from anywhere (`0.0.0.0/0`) for simplicity.
3. Copy the connection string — you'll use it as `MONGO_URI`.

### Backend — Render / Railway

1. Push this repo to GitHub.
2. Create a new **Web Service** and point it at the `backend/` directory (set the **root directory** to `backend`).
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables: `MONGO_URI`, `PORT` (most platforms set this automatically), and `CLIENT_URL` (your deployed frontend URL, e.g. `https://your-app.vercel.app`).
6. Deploy. Note the resulting URL, e.g. `https://your-api.onrender.com`.

### Frontend — Vercel

1. Import the repo into [Vercel](https://vercel.com/).
2. Set the **root directory** to `frontend`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Add an environment variable: `VITE_API_URL=https://your-api.onrender.com/api`.
5. Deploy. Vercel will give you a public URL for the dashboard.

Once both are live, update the backend's `CLIENT_URL` env var to match your Vercel URL
and redeploy the backend so CORS allows requests from the frontend.

---

## Possible next steps

- Authentication so multiple users can each have their own ledger
- Pagination for large transaction lists
- Editing transactions inline from the table
- Export to CSV
- Multi-currency support
