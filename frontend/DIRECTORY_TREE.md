# Frontend Project - Complete Directory Structure

## Full Directory Tree

```
p:\cloud 2.0\frontend\
├── public/
│   └── index.html                          # Main HTML entry point
│
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx             # Auth guard for routes
│   │   ├── Sidebar.jsx                    # Navigation menu
│   │   ├── Header.jsx                     # Top navigation bar
│   │   ├── LoadingSpinner.jsx             # Loading indicator
│   │   ├── ErrorAlert.jsx                 # Error message display
│   │   └── SuccessAlert.jsx               # Success message display
│   │
│   ├── pages/
│   │   ├── Login.jsx                      # User login page
│   │   ├── Register.jsx                   # User registration page
│   │   ├── Dashboard.jsx                  # Main dashboard
│   │   ├── Medicines.jsx                  # Medicines management
│   │   ├── Batches.jsx                    # Batch tracking
│   │   ├── Purchases.jsx                  # Purchase orders
│   │   ├── Sales.jsx                      # Sales transactions
│   │   ├── Reports.jsx                    # Analytics & reports
│   │   ├── AIAssistant.jsx                # AI query interface
│   │   ├── Profile.jsx                    # User profile
│   │   ├── NotFound.jsx                   # 404 error page
│   │   └── Unauthorized.jsx               # 403 access denied page
│   │
│   ├── services/
│   │   ├── api.js                         # Axios instance & interceptors
│   │   ├── authService.js                 # Auth endpoints
│   │   ├── medicineService.js             # Medicine endpoints
│   │   ├── batchService.js                # Batch endpoints
│   │   ├── purchaseService.js             # Purchase endpoints
│   │   ├── saleService.js                 # Sales endpoints
│   │   ├── reportService.js               # Reports endpoints
│   │   └── aiService.js                   # AI assistant endpoints
│   │
│   ├── context/
│   │   ├── AuthContext.jsx                # Auth context & useAuth hook
│   │   └── AuthProvider.jsx               # Auth state management provider
│   │
│   ├── hooks/
│   │   ├── useAuth.js                     # Authentication hook
│   │   └── useApi.js                      # Generic API call hook
│   │
│   ├── App.jsx                            # Main app with routing setup
│   ├── App.css                            # App component styles
│   ├── index.js                           # React entry point
│   └── index.css                          # Global styles
│
├── .env.example                           # Environment template
├── .env.local                             # Development environment config
├── .gitignore                             # Git ignore rules
├── package.json                           # Dependencies & scripts
│
├── README.md                              # Project documentation
├── QUICKSTART.md                          # Quick start guide
├── FRONTEND_STRUCTURE.md                  # Architecture guide
├── IMPLEMENTATION_SUMMARY.md              # Implementation details
└── DIRECTORY_TREE.md                      # This file
```

## File Count Summary

| Category | Count | Files |
|----------|-------|-------|
| Configuration | 4 | package.json, .env.example, .env.local, .gitignore |
| Public | 1 | index.html |
| Context | 2 | AuthContext.jsx, AuthProvider.jsx |
| Services | 8 | api.js, authService.js, medicineService.js, etc. |
| Hooks | 2 | useAuth.js, useApi.js |
| Components | 6 | ProtectedRoute.jsx, Sidebar.jsx, Header.jsx, etc. |
| Pages | 12 | Login.jsx, Dashboard.jsx, Medicines.jsx, etc. |
| Styling | 2 | index.css, App.css |
| Main Files | 2 | App.jsx, index.js |
| Documentation | 5 | README.md, QUICKSTART.md, FRONTEND_STRUCTURE.md, IMPLEMENTATION_SUMMARY.md, DIRECTORY_TREE.md |
| **Total** | **44** | |

---

## Module Breakdown

### Authentication Module
```
src/services/authService.js
src/context/AuthContext.jsx
src/context/AuthProvider.jsx
src/hooks/useAuth.js
src/pages/Login.jsx
src/pages/Register.jsx
```
**Purpose**: User authentication, JWT management, auth state

### Medicine Management Module
```
src/services/medicineService.js
src/pages/Medicines.jsx
```
**Purpose**: CRUD operations for medicines

### Batch Management Module
```
src/services/batchService.js
src/pages/Batches.jsx
```
**Purpose**: Batch tracking, expiry monitoring, stock levels

### Purchase Orders Module
```
src/services/purchaseService.js
src/pages/Purchases.jsx
```
**Purpose**: Purchase order creation and tracking

### Sales Module
```
src/services/saleService.js
src/pages/Sales.jsx
```
**Purpose**: Sales transactions with FIFO batch deduction

### Reports & Analytics Module
```
src/services/reportService.js
src/pages/Reports.jsx
```
**Purpose**: Business intelligence, analytics, insights

### AI Assistant Module
```
src/services/aiService.js
src/pages/AIAssistant.jsx
```
**Purpose**: Natural language query interface

### Navigation & Layout
```
src/components/Sidebar.jsx
src/components/Header.jsx
```
**Purpose**: Navigation and page structure

### Routing & Protection
```
src/components/ProtectedRoute.jsx
src/App.jsx
```
**Purpose**: Client-side routing with auth guards

### Shared Components
```
src/components/LoadingSpinner.jsx
src/components/ErrorAlert.jsx
src/components/SuccessAlert.jsx
```
**Purpose**: Reusable UI elements

### HTTP & API
```
src/services/api.js
src/hooks/useApi.js
```
**Purpose**: API communication and state management

---

## Import Relationships

### Pages Import From
```
pages/
  ├─→ hooks/useAuth.js
  ├─→ hooks/useApi.js
  ├─→ services/*Service.js
  └─→ components/*
```

### Services Import From
```
services/
  ├─→ api.js (all service files)
  └─→ apiClient instance
```

### Components Import From
```
components/
  ├─→ hooks/useAuth.js (ProtectedRoute)
  ├─→ react-router-dom (ProtectedRoute, Header, Sidebar)
  └─→ No service imports
```

### App.jsx Imports From
```
App.jsx
  ├─→ context/AuthProvider.jsx
  ├─→ components/ProtectedRoute.jsx
  ├─→ pages/* (all 12 page files)
  └─→ react-router-dom
```

### AuthProvider Imports From
```
AuthProvider.jsx
  ├─→ context/AuthContext.jsx
  └─→ services/authService.js
```

---

## Route Hierarchy

### Authentication Routes (Public)
```
/login           → Login.jsx
/register        → Register.jsx
```

### Protected Routes (Authenticated)
```
/                → Dashboard.jsx
/dashboard       → Dashboard.jsx
/medicines/*     → Medicines.jsx
/batches/*       → Batches.jsx
/purchases/*     → Purchases.jsx
/sales/*         → Sales.jsx
/profile         → Profile.jsx
/ai              → AIAssistant.jsx
```

### Role-Based Routes
```
/reports/*       → Reports.jsx (admin, pharmacist only)
```

### Error Routes
```
/unauthorized    → Unauthorized.jsx
/404             → NotFound.jsx
/*               → NotFound.jsx (catch-all)
```

---

## Dependency Graph

```
index.js
  └─→ App.jsx
      ├─→ BrowserRouter (React Router)
      ├─→ AuthProvider
      │   └─→ AuthContext, authService
      └─→ Routes
          ├─→ ProtectedRoute
          │   └─→ Pages
          │       ├─→ useAuth hook
          │       ├─→ useApi hook
          │       └─→ Services
          │           └─→ api.js
          ├─→ Login.jsx
          ├─→ Register.jsx
          └─→ Error Pages
```

---

## Service Endpoints Reference

### authService
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get current profile
- `PUT /auth/profile` - Update profile

### medicineService
- `GET /medicines` - Get all medicines
- `GET /medicines/:id` - Get medicine by ID
- `POST /medicines` - Create medicine
- `PUT /medicines/:id` - Update medicine
- `DELETE /medicines/:id` - Delete medicine
- `GET /medicines/search` - Search medicines

### batchService
- `GET /batches` - Get all batches
- `GET /batches/:id` - Get batch by ID
- `GET /batches/medicine/:medicineId` - Get batches for medicine
- `POST /batches` - Create batch
- `GET /batches/low-stock` - Get low stock batches
- `GET /batches/expiring` - Get expiring batches

### purchaseService
- `GET /purchases` - Get all purchases
- `GET /purchases/:id` - Get purchase by ID
- `POST /purchases` - Create purchase
- `GET /purchases/supplier/:supplierId` - Get by supplier
- `GET /purchases/date-range` - Get by date range

### saleService
- `GET /sales` - Get all sales
- `GET /sales/:id` - Get sale by ID
- `POST /sales` - Create sale
- `GET /sales/date-range` - Get by date range
- `GET /sales/available-stock/:medicineId` - Get stock

### reportService
- `GET /reports/sales/today` - Daily sales
- `GET /reports/sales/monthly` - Monthly sales
- `GET /reports/medicines/top-selling` - Top medicines
- `GET /reports/medicines/low-stock` - Low stock
- `GET /reports/medicines/expiring` - Expiring medicines
- `GET /reports/profit` - Profit report
- `GET /reports/sales/trend` - Sales trend
- `GET /reports/inventory/health` - Inventory health
- `GET /reports/medicines/category` - By category
- `GET /reports/suppliers/performance` - Supplier performance

### aiService
- `POST /ai/query` - Send natural language query
- `GET /ai/intents` - Get supported intents

---

## Environment Variables

### Development (.env.local)
```
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_ENVIRONMENT=development
```

### Production (.env.production)
```
REACT_APP_API_URL=https://api.pharmacy.com/api/v1
REACT_APP_ENVIRONMENT=production
```

---

## npm Scripts

```json
{
  "start": "react-scripts start",        // Start dev server
  "build": "react-scripts build",        // Build for production
  "test": "react-scripts test",          // Run tests
  "eject": "react-scripts eject"         // Eject from CRA
}
```

---

## Key Features by File

| File | Key Features |
|------|--------------|
| AuthProvider.jsx | Login, Register, Logout, Profile Update, Token Management |
| api.js | JWT Injection, 401 Handling, Base URL Configuration |
| useApi.js | Loading State, Error Handling, Data Caching |
| ProtectedRoute.jsx | Auth Check, Role Check, Route Security |
| Login.jsx | Form Validation, Error Display, Redirect |
| Services | API Abstraction, Consistent Interface, Error Handling |

---

## Styling Strategy

**Current**: Structural CSS only (no colors/themes)
**Location**: Global in `index.css`, Component-specific in `App.css`

**Framework Options**:
- Bootstrap - CSS framework
- Tailwind CSS - Utility-first CSS
- Material-UI - React component library
- Ant Design - Enterprise UI library
- Pure CSS - Custom styling

---

## Getting Started

### 1. Navigate to frontend
```bash
cd p:\cloud 2.0\frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
(Already configured in .env.local)
```

### 4. Start development server
```bash
npm start
```

### 5. Open browser
```
http://localhost:3000
```

---

## File Sizes (Approximate)

- **Setup files**: ~10 KB (.env, package.json, etc.)
- **Context files**: ~5 KB (AuthContext, AuthProvider)
- **Services**: ~8 KB (8 service files)
- **Hooks**: ~3 KB (2 custom hooks)
- **Components**: ~4 KB (6 components)
- **Pages**: ~12 KB (12 pages with forms)
- **Config**: ~2 KB (App, index)
- **Styles**: ~2 KB (Global + App CSS)
- **Documentation**: ~30 KB (4 markdown files)

**Total Source**: ~80 KB (excluding node_modules)

---

## Next Implementation Steps

1. ✅ Project structure complete
2. ⏭️ Add UI styling framework
3. ⏭️ Implement page layouts
4. ⏭️ Build form components
5. ⏭️ Add data tables
6. ⏭️ Create charts for reports
7. ⏭️ Add form validation
8. ⏭️ Implement error handling UI
9. ⏭️ Add loading states
10. ⏭️ Write tests

---

**Frontend Structure Complete**

Status: ✅ Ready for UI Implementation  
Lines of Code: ~1,200 (without comments/blanks)  
Last Updated: February 25, 2026
