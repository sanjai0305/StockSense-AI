# SmartStock — Supermarket Inventory & Reorder Management System

A modern, full-stack **Supermarket Inventory Management & Smart Reordering System** engineered with React.js, Tailwind CSS, Node.js/Express, PostgreSQL, and Prisma ORM.

---

## 📸 Reference UI & Feature Highlights

- **Dashboard UI Fidelity:** Faithfully reproduces the screenshot layout including:
  - **Left Sidebar:** Full-height dark navy gradient sidebar with SmartStock logo, categorised navigation groups (Main, Inventory, Analytics, Management), and illustrated promotional shelf banner.
  - **Top Header:** Dynamic store identity (*Sanjai Supermarket, Salem, Tamil Nadu*), global search bar, date selector (*Oct 8, 2026*), notification badge with unread alert dropdown, and store owner profile menu.
  - **Welcome Banner:** Supermarket visual banner with greeting (*Welcome Back, Sanjai !*).
  - **4 KPI Cards:** *Total Products* (1,248 / +12%), *Total Stock In* (₹2,48,560 / +8%), *Total Stock Out* (₹1,87,230 / -15%), and *Low Stock Items* (18 / Needs Reorder).
  - **Analytics Section:** Responsive *Stock In vs Stock Out* monthly comparison bar chart (Recharts) and *Product Category Distribution* donut chart with center metrics & colored legends.
  - **Low Stock Alerts Panel:** Real-time low-stock product list (*Aashirvaad Atta, Thums Up, Maggi, Dove, Tide*) with live quantities and direct **Reorder** triggers.
  - **Quick Action Bar:** 5 rounded action buttons (*+ Add Product*, *Stock In*, *Stock Out*, *Generate Reorder List*, *Print Report*).
  - **Products Inventory Table:** Live searchable & filterable catalogue with category filter, stock status filter, unit prices, supplier names, and status badges (*In Stock* vs *Low Stock*).
  - **Reorder Suggestions Panel:** Dynamic calculation of suggested order quantities (*Target Level − Available Stock*) with batch multi-select and 1-click **Place Purchase Order** workflow.

---

## 🛠️ Technology Stack

- **Frontend:** React.js 18 + Vite
- **Styling:** Tailwind CSS + Vanilla CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **HTTP Client:** Axios (with JWT interceptors)
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (with Prisma ORM)
- **Authentication:** JWT with bcrypt password hashing
- **Validation:** Zod

---

## 🗄️ Database Architecture (Prisma & PostgreSQL)

- **`stores`**: Multi-tenant supermarket store details (name, city, address, phone, logo).
- **`users`**: Store owners, managers, and cashiers with secure password hashes & roles.
- **`categories`**: Supermarket product categories with custom colors.
- **`suppliers`**: Distributors, contact details, payment terms, and lead times.
- **`customers`**: Customer database with loyalty rewards tracking.
- **`products`**: Product catalogue with SKU, barcode, MRP, purchase cost, current stock, and reorder levels.
- **`purchase_orders`** & **`purchase_order_items`**: Purchase orders generated from reorder suggestions.
- **`stock_receipts`** & **`stock_receipt_items`**: Auditable goods receipt transactions from suppliers.
- **`stock_issues`** & **`stock_issue_items`**: Counter retail sales and write-offs.
- **`stock_movements`**: Immutable audit logs of every stock change (+In / -Out / Adjustments).
- **`notifications`**: Automatic alerts triggered when stock hits reorder thresholds.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+) running locally on port 5432

### 2. Environment Setup
- Server `.env`:
  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartstock_db?schema=public"
  PORT=5000
  JWT_SECRET="smartstock-supermarket-inventory-secret-key-2026-secure"
  JWT_EXPIRES_IN="7d"
  ```

### 3. Database Migration & Seeding
```bash
# In server directory
cd server
npm run prisma:push
npm run seed
```

### 4. Run Full-Stack Application
```bash
# In root directory
npm run dev
```
- **Backend API:** `http://localhost:5000`
- **Frontend App:** `http://localhost:5174` (or `http://localhost:5173`)

### 5. Demo Credentials
- **Store Owner:** `owner@smartstock.com` / `password123`
- **Cashier / Staff:** `cashier@smartstock.com` / `password123`
