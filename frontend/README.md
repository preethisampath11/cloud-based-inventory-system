# React Pharmacy Inventory Frontend

Cloud-based pharmacy inventory management system frontend built with React, React Router, and Axios.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx      # Route guard for authentication
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── Header.jsx              # Top navigation bar
│   │   ├── LoadingSpinner.jsx      # Loading indicator
│   │   ├── ErrorAlert.jsx          # Error message display
│   │   └── SuccessAlert.jsx        # Success message display
│   ├── pages/
│   │   ├── Login.jsx               # Login form page
│   │   ├── Register.jsx            # Register form page
│   │   ├── Dashboard.jsx           # Main dashboard
│   │   ├── Medicines.jsx           # Medicines management
│   │   ├── Batches.jsx             # Batch tracking
│   │   ├── Purchases.jsx           # Purchase orders
│   │   ├── Sales.jsx               # Sales transactions
│   │   ├── Reports.jsx             # Analytics & reports
│   │   ├── AIAssistant.jsx         # AI query interface
│   │   ├── Profile.jsx             # User profile
│   │   ├── NotFound.jsx            # 404 page
│   │   └── Unauthorized.jsx        # 403 page
│   ├── services/
│   │   ├── api.js                  # Axios instance with interceptors
│   │   ├── authService.js          # Auth API calls
│   │   ├── medicineService.js      # Medicine API calls
│   │   ├── batchService.js         # Batch API calls
│   │   ├── purchaseService.js      # Purchase API calls
│   │   ├── saleService.js          # Sales API calls
│   │   ├── reportService.js        # Reports API calls
│   │   └── aiService.js            # AI assistant API calls
│   ├── context/
│   │   ├── AuthContext.jsx         # Auth context definition
│   │   └── AuthProvider.jsx        # Auth state provider
│   ├── hooks/
│   │   ├── useAuth.js              # Auth hook
│   │   └── useApi.js               # Generic API call hook
│   ├── App.jsx                     # Main app with routing
│   ├── App.css                     # App component styles
│   ├── index.js                    # React entry point
│   ├── index.css                   # Global styles
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies and scripts
└── README.md                       # This file
```

## Installation

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env.local
   ```

3. **Update .env.local with your backend URL**
   ```
   REACT_APP_API_URL=http://localhost:5000/api/v1
   REACT_APP_ENVIRONMENT=development
   ```

## Running the Application

### Development Mode
```bash
npm start
```
Runs on `http://localhost:3000`

### Build for Production
```bash
npm run build
```
Creates optimized production build

### Testing
```bash
npm test
```
Runs test suite

## Features

### Authentication
- **JWT-based authentication** with token stored in localStorage
- **AuthProvider** context manages user state and auth operations
- **ProtectedRoute** component restricts access to authenticated routes
- **Auto-logout** on 401 responses (expired/invalid token)

### API Integration
- **Axios instance** with:
  - Base URL configuration
  - JWT token auto-injection in headers
  - Request/response interceptors
  - Error handling with redirects
- **Service layer** for each module (auth, medicines, sales, etc.)
- **Consistent error handling** across all API calls

### Routing
- **Public routes**: /login, /register
- **Protected routes**: All other routes require authentication
- **Role-based access**: Reports page restricted to admin/pharmacist
- **404 & 403 pages** for error handling

### State Management
- **AuthContext** for global authentication state
- **useAuth hook** for easy context access
- **useApi hook** for API call state management (loading, error, data)
- LocalStorage persistence for tokens and user data

## Key Components

### AuthProvider
Manages authentication state and provides methods:
- `login(email, password)` - User login
- `register(email, password, name, role)` - User registration
- `logout()` - User logout
- `updateProfile(userData)` - Update user profile
- `isAuthenticated` - Boolean for auth status
- `loading` - Boolean for async operations
- `error` - Error message if any

### ProtectedRoute
Route wrapper that:
- Checks authentication status
- Checks role-based access (optional)
- Redirects to login if not authenticated
- Redirects to unauthorized page if insufficient role

### useAuth Hook
```javascript
const { user, token, isAuthenticated, login, logout } = useAuth();
```

### useApi Hook
```javascript
const { loading, error, data, execute } = useApi(medicineService.getMedicines);

useEffect(() => {
  execute();
}, [execute]);
```

## Service Layer

Each module has a dedicated service file:

### authService
- `login(email, password)`
- `register(email, password, name, role)`
- `getProfile()`
- `updateProfile(userData)`

### medicineService
- `getMedicines(filters)`
- `getMedicineById(id)`
- `createMedicine(data)`
- `updateMedicine(id, data)`
- `deleteMedicine(id)`
- `searchMedicines(searchTerm)`

### batchService
- `getBatches(filters)`
- `getBatchById(id)`
- `getBatchesByMedicine(medicineId)`
- `getLowStockBatches(threshold)`
- `getExpiringBatches(days)`
- `getAvailableStock(medicineId)`

### purchaseService
- `getPurchases(filters)`
- `getPurchaseById(id)`
- `createPurchase(data)`
- `getPurchasesBySupplier(supplierId)`
- `getPurchasesByDateRange(startDate, endDate)`

### saleService
- `getSales(filters)`
- `getSaleById(id)`
- `createSale(data)`
- `getSalesByDateRange(startDate, endDate)`
- `getAvailableStock(medicineId)`

### reportService
- `getSalesToday()`
- `getMonthlySales(month, year)`
- `getTopMedicines(period, limit)`
- `getLowStock()`
- `getExpiringMedicines(days)`
- `getProfitReport(period)`
- `getSalesTrend(period, groupBy)`
- `getInventoryHealth()`
- `getMedicinesByCategory()`
- `getSupplierPerformance()`

### aiService
- `query(question)` - Send natural language query
- `getIntents()` - Get supported intents

## Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api/v1

# Environment
REACT_APP_ENVIRONMENT=development
```

## API Response Format

All API responses follow a consistent format:

### Success Response (200)
```json
{
  "status": "success",
  "data": {
    "result": { /* Response data */ }
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Error message here"
}
```

## Interceptors

### Request Interceptor
- Automatically adds JWT token to headers
- Retrieves token from localStorage

### Response Interceptor
- Handles 401 responses (expired tokens)
- Clears localStorage and redirects to login
- Passes other errors to component error handling

## Error Handling Strategy

1. **API Errors**: Caught in service layer, passed to components
2. **Auth Errors**: Special handling with logout on 401
3. **Form Errors**: Displayed inline in form components
4. **Component Errors**: useApi hook provides error state

## Development Workflow

1. Create component/page
2. Use `useApi` hook for API calls
3. Handle loading, error, and data states
4. Services layer abstracts API communication
5. AuthContext provides auth state globally

## Next Steps

1. **Implement UI styling** - Add CSS/Tailwind for visual design
2. **Create page layouts** - Implement Sidebar and Header components
3. **Build forms** - Add form validation and submission logic
4. **Add charts** - Integrate charting library for reports
5. **Setup CI/CD** - Github Actions for automated testing/deployment
6. **Add unit tests** - Jest and React Testing Library tests

## Technologies Used

- **React 18.2** - UI library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **JWT-decode** - Token decoding (optional, for token inspection)
- **React Scripts** - Build tools

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port 3000 Already in Use
```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Token Not Persisting
Check localStorage in browser DevTools under Application tab

### CORS Errors
Ensure backend has proper CORS configuration with frontend URL

### 404 API Errors
Verify backend server is running on configured URL

## License

MIT
