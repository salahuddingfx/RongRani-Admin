# RongRani Administration Dashboard

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1.4-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.6-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

RongRani Admin is a standalone, high-performance back-office panel built exclusively for administrative oversight of the RongRani e-commerce platform.

It is structured to provide store managers and administrators with total control over products, user registries, orders, coupon systems, active promotions, and delivery configurations.

---

## 🌟 Key Features

- **Store Overview & Analytics**: Interactive charts and data summaries tracking active sales, revenue generation, and order trends.
- **Product & Category Controls**: Add, edit, list, and delete custom handmade products, prices, variants, stock registries, and taxonomy categories.
- **Order Pipeline & Courier Sync**:
  - Full visibility of all order statuses (Pending, Processing, Shipped, Delivered).
  - Quick action integrations to send order details directly to **Steadfast Courier API** for automated shipping manifest creation.
- **AI Studio**: Administrative AI assistant powered by Gemini API to suggest copy, assist in product descriptions, or provide analytical insights.
- **Banner & Promotion Management**: Manage home screen banners, Flash Sales, and Hot Offer setups.
- **Coupon & Discount Setup**: Create custom promo codes, discount percentages, validity parameters, and usage limits.
- **Redirection & Security**: Guarded by `AdminRoute` checkups; non-admin login attempts are safely redirected back to the client application dashboard.

---

## 🛠️ Technology Stack

- **Core**: React 18, React DOM, Vite
- **Routing**: React Router DOM v6 (administrative-only routes)
- **Styling**: TailwindCSS, Glassmorphism layouts, Lucide React icons
- **Data Visualization**: Chart.js, Recharts, React Chartjs 2
- **State Management & Caching**: Context API, TanStack React Query (v5)
- **HTTP Client**: Axios (configured with backend proxy settings)
- **Authentication Check**: Role-based routing checks for `admin` / `super_admin` credentials.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (version `>= 18.0.0`) and **npm** installed.

### Installation

1. Navigate to the admin folder:
   ```bash
   cd admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env.local` file inside the `admin/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   VITE_CLIENT_URL=http://localhost:5173
   ```

### Running Locally

To run the development server:
```bash
npm run dev
```
The administration panel will be active on **`http://localhost:5174`** (configured to redirect `/` to `/admin/dashboard` upon login).

### Production Build

To build the optimized static assets:
```bash
npm run build
```
This generates build files inside the `dist/` directory, ready to deploy.

---

## 📂 Project Structure

```
admin/
├── public/                 # Static assets (logos, manifest files)
├── src/
│   ├── assets/             # SVGs and global styling configs
│   ├── components/         # Core administrative layout elements (AdminLayout, AdminRoute)
│   ├── contexts/           # Authentication context and settings providers
│   ├── i18n/               # Language locales (English/Bengali translations)
│   ├── pages/              # Administrative console pages (AdminDashboard, AdminProducts, AdminOrders)
│   ├── App.jsx             # Administrative Route configuration mapping
│   ├── index.css           # Global Styles & Tailwind Configuration
│   └── main.jsx            # Application Entry Point
├── package.json            # Configuration and script file
├── tailwind.config.js      # TailwindCSS styling settings
└── vite.config.js          # Vite bundler parameters (port set to 5174)
```

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.
